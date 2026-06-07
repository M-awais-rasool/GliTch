/**
 * Platform-family entities (solid surfaces).
 *  - SolidPlatform  : static ground.
 *  - MovingPlatform : kinematic ferry; carries the player when ridden.
 *  - CrumblePlatform: collapses a beat after you stand on it.
 *  - FakePlatform   : looks solid, vanishes the instant you touch it.
 */

import Matter from 'matter-js';

import type { EntityDef } from '@/levels/types';
import { aabbOverlap } from '@/utils/math';

import { BaseEntity, type EntityContext } from './LevelEntity';
import { PathFollower } from './PathFollower';

type Def<T extends EntityDef['type']> = Extract<EntityDef, { type: T }>;

export class SolidPlatform extends BaseEntity {
  constructor(world: Matter.World, id: string, def: Def<'platform'>) {
    super(world, id, 'platform', def);
    this.addSolid(def);
  }

  update(): void {
    /* static */
  }
}

export class MovingPlatform extends BaseEntity {
  private readonly follower: PathFollower;

  constructor(world: Matter.World, id: string, def: Def<'movingPlatform'>) {
    super(world, id, 'movingPlatform', def);
    this.follower = new PathFollower(def.path);
    this.addSolid(def);
  }

  update(ctx: EntityContext): void {
    const prevX = this.follower.x;
    const prevY = this.follower.y;
    this.follower.step(ctx.dtMs);
    const nx = this.follower.x;
    const ny = this.follower.y;

    this.render.x.value = nx;
    this.render.y.value = ny;
    if (this.body) {
      Matter.Body.setPosition(this.body, {
        x: nx + this.rect.width / 2,
        y: ny + this.rect.height / 2,
      });
    }
    this.carry = { dx: nx - prevX, dy: ny - prevY };
  }

  reset(): void {
    super.reset();
    this.follower.reset();
    this.removeSolid();
    this.addSolid(this.rect);
  }
}

export class CrumblePlatform extends BaseEntity {
  private state: 'idle' | 'crumbling' | 'gone' = 'idle';
  private timer = 0;
  private readonly delay: number;

  constructor(world: Matter.World, id: string, def: Def<'crumblePlatform'>) {
    super(world, id, 'crumblePlatform', def);
    this.delay = def.delayMs ?? 360;
    this.addSolid(def);
  }

  update(ctx: EntityContext): void {
    if (this.state === 'gone') return;

    if (this.state === 'idle' && ctx.restingOn(this.currentRect())) {
      this.state = 'crumbling';
      this.timer = 0;
    }

    if (this.state === 'crumbling') {
      this.timer += ctx.dtMs;
      const p = Math.min(this.timer / this.delay, 1);
      this.render.extra.value = p; // renderer uses this for a pre-collapse shake
      if (p >= 1) {
        this.removeSolid();
        this.render.alpha.value = 0;
        this.state = 'gone';
      }
    }
  }

  reset(): void {
    super.reset();
    this.state = 'idle';
    this.timer = 0;
    if (!this.body) this.addSolid(this.rect);
  }
}

export class FakePlatform extends BaseEntity {
  private triggered = false;

  constructor(world: Matter.World, id: string, def: Def<'fakePlatform'>) {
    super(world, id, 'fakePlatform', def);
    this.addSolid(def);
  }

  update(ctx: EntityContext): void {
    if (this.triggered) {
      this.render.alpha.value = Math.max(0, this.render.alpha.value - ctx.dtMs / 120);
      return;
    }
    if (ctx.restingOn(this.currentRect()) || aabbOverlap(ctx.playerRect, this.currentRect())) {
      this.triggered = true;
      this.removeSolid(); // vanish instantly — the player drops
    }
  }

  reset(): void {
    super.reset();
    this.triggered = false;
    if (!this.body) this.addSolid(this.rect);
  }
}

/** Solid floor that drags the player sideways while they stand on it. */
export class Conveyor extends BaseEntity {
  private readonly speed: number;

  constructor(world: Matter.World, id: string, def: Def<'conveyor'>) {
    super(world, id, 'conveyor', def, def.dir > 0 ? 'right' : 'left');
    this.speed = def.speed ?? 1.4;
    this.addSolid(def);
    // A constant carry IS the conveyor — applyCarry() moves the rider each step.
    this.carry = { dx: def.dir * this.speed, dy: 0 };
  }

  update(): void {
    // Scroll the surface stripes (renderer reads `extra` as a 0..1 phase).
    this.render.extra.value = (this.render.extra.value + this.speed * 0.03) % 1;
  }

  reset(): void {
    super.reset();
    if (!this.body) this.addSolid(this.rect);
  }
}

/** Thin pad that launches the player upward on contact. */
export class BouncePad extends BaseEntity {
  private readonly power: number;
  private cooldown = 0;

  constructor(world: Matter.World, id: string, def: Def<'bouncePad'>) {
    super(world, id, 'bouncePad', def);
    this.power = def.power ?? 14;
    this.addSolid(def);
  }

  update(ctx: EntityContext): void {
    if (this.cooldown > 0) this.cooldown -= ctx.dtMs;
    if (this.cooldown <= 0 && ctx.playerVy >= -0.001 && ctx.restingOn(this.currentRect())) {
      ctx.bounce(-this.power);
      this.cooldown = 220;
      this.render.extra.value = 1; // compress flash
    } else {
      this.render.extra.value = Math.max(0, this.render.extra.value - ctx.dtMs / 160);
    }
  }

  reset(): void {
    super.reset();
    this.cooldown = 0;
    if (!this.body) this.addSolid(this.rect);
  }
}

/** Platform that blinks solid/empty on a timer (rhythm mechanic). */
export class PhasePlatform extends BaseEntity {
  private readonly onMs: number;
  private readonly offMs: number;
  private readonly phase0: number;
  private timer: number;
  private on = true;

  constructor(world: Matter.World, id: string, def: Def<'phasePlatform'>) {
    super(world, id, 'phasePlatform', def);
    this.onMs = def.onMs ?? 1400;
    this.offMs = def.offMs ?? 1000;
    this.phase0 = def.phase ?? 0;
    this.timer = this.phase0;
    this.addSolid(def);
  }

  update(ctx: EntityContext): void {
    this.timer += ctx.dtMs;
    const period = this.on ? this.onMs : this.offMs;
    if (this.timer >= period) {
      this.timer = 0;
      this.on = !this.on;
      this.applyState();
    }
  }

  private applyState(): void {
    if (this.on) {
      if (!this.body) this.addSolid(this.rect);
      this.render.alpha.value = 1;
    } else {
      this.removeSolid();
      this.render.alpha.value = 0.16; // ghost outline
    }
  }

  reset(): void {
    super.reset();
    this.timer = this.phase0;
    this.on = true;
    if (!this.body) this.addSolid(this.rect);
    this.render.alpha.value = 1;
  }
}
