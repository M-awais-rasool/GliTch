/**
 * Headless gameplay simulation for one level (no React, no loop, no render).
 *
 * Per fixed step it: updates entities, samples the environment around the player
 * (ice underfoot, wind/gravity zones), sets world gravity, carries the player on
 * moving surfaces, applies input + integrates Matter, resolves portals, then runs
 * the death (hazard AABB + fall-out), goal and respawn checks. Death triggers a
 * fast auto-respawn; the goal freezes the level as complete. Haptics fire on
 * death, completion, and gravity flips.
 */

import Matter from 'matter-js';

import { DEFAULT_GRAVITY_Y, FALL_OUT_MARGIN, RESPAWN_DELAY_MS, DEATH_ANIM_MS } from '@/constants';
import { createEntity } from '@/engine/entities/factory';
import type { EntityContext, LevelEntity } from '@/engine/entities/LevelEntity';
import type { PlayerEnv, PlayerInput } from '@/entities/player/Player';
import type { LevelDef } from '@/levels/types';
import { PhysicsWorld } from '@/physics/PhysicsWorld';
import { hapticError, hapticMedium, hapticSuccess } from '@/services/haptics';
import type { GameStatus } from '@/types';
import { aabbOverlap, clamp, type RectLike } from '@/utils/math';

const PORTAL_COOLDOWN_MS = 350;

export class LevelRuntime {
  readonly physics: PhysicsWorld;
  readonly entities: LevelEntity[];

  status: GameStatus = 'running';
  deaths = 0;
  elapsedMs = 0;

  private deathElapsed = 0;
  private readonly baseGravity: number;
  private lastGravitySign = 1;
  private portalCooldown = 0;
  private readonly portals: LevelEntity[];

  constructor(private readonly level: LevelDef, gravity: number) {
    this.baseGravity = gravity;
    this.physics = new PhysicsWorld(level.spawn, gravity);
    this.entities = level.entities.map((def, i) => createEntity(def, i, this.physics.world));
    this.portals = this.entities.filter((e) => e.portalPairId);
  }

  get grounded(): boolean {
    return this.physics.grounded;
  }

  get player() {
    return this.physics.player;
  }

  deathProgress(): number {
    return clamp(this.deathElapsed / DEATH_ANIM_MS, 0, 1);
  }

  fixedStep(dtMs: number, input: PlayerInput): void {
    if (this.status === 'complete') return;

    if (this.status === 'dead') {
      this.deathElapsed += dtMs;
      if (this.deathElapsed >= RESPAWN_DELAY_MS) this.respawn();
      return;
    }

    // --- running ---
    this.elapsedMs += dtMs;
    if (this.portalCooldown > 0) this.portalCooldown -= dtMs;

    const ctx = this.buildContext(dtMs);
    for (const e of this.entities) e.update(ctx);

    const env = this.sampleEnv();
    this.physics.setGravity(this.baseGravity * env.gravitySign);
    if (env.gravitySign !== this.lastGravitySign) {
      hapticMedium();
      this.lastGravitySign = env.gravitySign;
    }

    this.applyCarry();
    this.physics.stepPlayer(dtMs, input, env);
    this.physics.integrate(dtMs);

    this.resolvePortals();

    const pr = this.player.rect;
    if (pr.y > this.level.size.height + FALL_OUT_MARGIN || pr.y + pr.height < -FALL_OUT_MARGIN) {
      this.die();
      return;
    }
    for (const e of this.entities) {
      const hz = e.hazardRect();
      if (hz && aabbOverlap(pr, hz)) {
        this.die();
        return;
      }
    }
    if (aabbOverlap(pr, this.level.goal)) {
      this.status = 'complete';
      hapticSuccess();
    }
  }

  restart(): void {
    this.physics.reset(this.level.spawn);
    this.physics.setGravity(this.baseGravity);
    for (const e of this.entities) e.reset();
    this.deaths = 0;
    this.elapsedMs = 0;
    this.deathElapsed = 0;
    this.lastGravitySign = 1;
    this.portalCooldown = 0;
    this.status = 'running';
  }

  dispose(): void {
    this.physics.dispose();
  }

  // --- internals -----------------------------------------------------------

  private buildContext(dtMs: number): EntityContext {
    const pr = this.player.rect;
    const vy = this.player.velocity.y;
    const grounded = this.physics.grounded;
    return {
      dtMs,
      playerRect: pr,
      playerVy: vy,
      grounded,
      restingOn: (rect) => this.restingOn(pr, vy, grounded, rect),
      kill: () => this.die(),
      bounce: (vyOut) =>
        Matter.Body.setVelocity(this.player.body, { x: this.player.velocity.x, y: vyOut }),
      boostX: (vxOut) =>
        Matter.Body.setVelocity(this.player.body, { x: vxOut, y: this.player.velocity.y }),
    };
  }

  /** Samples ice / wind / gravity around the player for this step. */
  private sampleEnv(): PlayerEnv {
    const pr = this.player.rect;
    const vy = this.player.velocity.y;
    const grounded = this.physics.grounded;
    let onIce = false;
    let windX = 0;
    let gravitySign = 1;

    for (const e of this.entities) {
      if (e.surfaceType === 'ice' && this.restingOn(pr, vy, grounded, e.currentRect())) {
        onIce = true;
      }
      const zone = e.zone;
      if (zone && aabbOverlap(pr, e.currentRect())) {
        if (zone.kind === 'wind') windX += zone.force;
        else if (zone.kind === 'gravity') gravitySign = -1;
      }
    }
    return { onIce, windX, gravitySign };
  }

  private resolvePortals(): void {
    if (this.portalCooldown > 0 || this.portals.length < 2) return;
    const pr = this.player.rect;
    for (const portal of this.portals) {
      if (!aabbOverlap(pr, portal.currentRect())) continue;
      const dest = this.portals.find((o) => o !== portal && o.portalPairId === portal.portalPairId);
      if (!dest) continue;
      const r = dest.currentRect();
      Matter.Body.setPosition(this.player.body, { x: r.x + r.width / 2, y: r.y + r.height / 2 });
      this.portalCooldown = PORTAL_COOLDOWN_MS;
      hapticMedium();
      break;
    }
  }

  private restingOn(pr: RectLike, vy: number, grounded: boolean, rect: RectLike): boolean {
    return (
      grounded &&
      vy >= -0.001 &&
      pr.x + pr.width > rect.x + 2 &&
      pr.x < rect.x + rect.width - 2 &&
      Math.abs(pr.y + pr.height - rect.y) <= 8
    );
  }

  private applyCarry(): void {
    const pr = this.player.rect;
    const vy = this.player.velocity.y;
    const grounded = this.physics.grounded;
    for (const e of this.entities) {
      const carry = e.carry;
      if (carry && (carry.dx !== 0 || carry.dy !== 0) && this.restingOn(pr, vy, grounded, e.currentRect())) {
        Matter.Body.translate(this.player.body, { x: carry.dx, y: carry.dy });
      }
    }
  }

  private die(): void {
    if (this.status !== 'running') return;
    this.status = 'dead';
    this.deaths += 1;
    this.deathElapsed = 0;
    this.player.kill();
    hapticError();
  }

  private respawn(): void {
    this.physics.reset(this.level.spawn);
    this.physics.setGravity(this.baseGravity);
    for (const e of this.entities) e.reset();
    this.deathElapsed = 0;
    this.lastGravitySign = 1;
    this.portalCooldown = 0;
    this.status = 'running';
  }
}
