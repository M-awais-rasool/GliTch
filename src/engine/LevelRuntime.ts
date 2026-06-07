/**
 * Headless gameplay simulation for one level (no React, no loop, no render).
 *
 * Owns the physics world + the level's entities and advances them on the fixed
 * timestep. Per step it: updates entities, carries the player on moving
 * surfaces, applies player input + integrates Matter, then runs the death
 * (hazard AABB + fall-out), goal and respawn checks. Death triggers a fast
 * auto-respawn (Level-Devil style "instant retry"); reaching the goal freezes
 * the level as complete.
 */

import Matter from 'matter-js';

import { createEntity } from '@/engine/entities/factory';
import type { EntityContext, LevelEntity } from '@/engine/entities/LevelEntity';
import { DEATH_ANIM_MS, FALL_OUT_MARGIN, RESPAWN_DELAY_MS } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { PhysicsWorld } from '@/physics/PhysicsWorld';
import type { GameStatus } from '@/types';
import { aabbOverlap, clamp, type RectLike } from '@/utils/math';

import type { PlayerInput } from '@/entities/player/Player';

export class LevelRuntime {
  readonly physics: PhysicsWorld;
  readonly entities: LevelEntity[];

  status: GameStatus = 'running';
  deaths = 0;
  elapsedMs = 0;

  private deathElapsed = 0;

  constructor(private readonly level: LevelDef, gravity: number) {
    this.physics = new PhysicsWorld(level.spawn, gravity);
    this.entities = level.entities.map((def, i) => createEntity(def, i, this.physics.world));
  }

  get grounded(): boolean {
    return this.physics.grounded;
  }

  get player() {
    return this.physics.player;
  }

  /** Death animation progress 0..1. */
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

    const ctx = this.buildContext(dtMs);
    for (const e of this.entities) e.update(ctx);
    this.applyCarry();

    this.physics.stepPlayer(dtMs, input);
    this.physics.integrate(dtMs);

    const pr = this.player.rect;

    // fall out of the world
    if (pr.y > this.level.size.height + FALL_OUT_MARGIN) {
      this.die();
      return;
    }
    // hazards
    for (const e of this.entities) {
      const hz = e.hazardRect();
      if (hz && aabbOverlap(pr, hz)) {
        this.die();
        return;
      }
    }
    // goal
    if (aabbOverlap(pr, this.level.goal)) {
      this.status = 'complete';
    }
  }

  /** Full reset (used by an explicit retry): clears deaths + timer too. */
  restart(): void {
    this.physics.reset(this.level.spawn);
    for (const e of this.entities) e.reset();
    this.deaths = 0;
    this.elapsedMs = 0;
    this.deathElapsed = 0;
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
    };
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
  }

  private respawn(): void {
    this.physics.reset(this.level.spawn);
    for (const e of this.entities) e.reset();
    this.deathElapsed = 0;
    this.status = 'running';
  }
}
