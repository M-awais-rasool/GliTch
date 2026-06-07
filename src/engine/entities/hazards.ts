/**
 * Hazard-family entities. Hazards are NOT solid Matter bodies — they report a
 * lethal AABB via `hazardRect()` which the runtime checks against the player
 * each step. This gives precise, per-mechanic control over *when* something is
 * deadly (e.g. a spike only while extended, a block only while falling).
 *  - Spike        : always-on static spikes.
 *  - HiddenSpike  : flush until the player nears, then snaps up and stays.
 *  - FallingBlock : drops when the player crosses a trigger line; lethal while
 *                   falling, then lands as a solid platform.
 *  - Saw          : spinning blade, optionally on a path.
 *  - Crusher      : kinematic solid that slams down (lethal leading edge).
 */

import Matter from 'matter-js';

import type { EntityDef } from '@/levels/types';
import type { RectLike } from '@/utils/math';

import { BaseEntity, type EntityContext } from './LevelEntity';
import { PathFollower } from './PathFollower';

type Def<T extends EntityDef['type']> = Extract<EntityDef, { type: T }>;

export class Spike extends BaseEntity {
  constructor(world: Matter.World, id: string, def: Def<'spike'>) {
    super(world, id, 'spike', def, def.dir ?? 'up');
    this.render.extra.value = 1; // fully shown
  }

  update(): void {
    /* static */
  }

  hazardRect(): RectLike {
    return this.currentRect();
  }

  reset(): void {
    super.reset();
    this.render.extra.value = 1;
  }
}

export class HiddenSpike extends BaseEntity {
  private ext = 0; // 0 hidden .. 1 fully out
  private readonly pad: number;

  constructor(world: Matter.World, id: string, def: Def<'hiddenSpike'>) {
    super(world, id, 'hiddenSpike', def, def.dir ?? 'up');
    this.pad = def.triggerPad ?? 90;
  }

  update(ctx: EntityContext): void {
    const r = this.rect;
    const near =
      ctx.playerRect.x + ctx.playerRect.width > r.x - this.pad &&
      ctx.playerRect.x < r.x + r.width + this.pad;
    // Latches: once triggered it keeps rising to full and stays out.
    if (near || this.ext > 0) {
      this.ext = Math.min(1, this.ext + ctx.dtMs / 110);
    }
    this.render.extra.value = this.ext;
  }

  hazardRect(): RectLike | null {
    return this.ext > 0.55 ? this.currentRect() : null;
  }

  reset(): void {
    super.reset();
    this.ext = 0;
  }
}

export class FallingBlock extends BaseEntity {
  private state: 'idle' | 'falling' | 'landed' = 'idle';
  private vy = 0;
  private readonly triggerX: number;
  private readonly accel: number;
  private readonly restY: number;

  constructor(world: Matter.World, id: string, def: Def<'fallingBlock'>) {
    super(world, id, 'fallingBlock', def);
    this.triggerX = def.triggerX ?? def.x;
    this.accel = def.fallAccel ?? 0.55;
    this.restY = def.restY ?? def.y + 260;
  }

  update(ctx: EntityContext): void {
    if (this.state === 'idle') {
      if (ctx.playerRect.x + ctx.playerRect.width >= this.triggerX) {
        this.state = 'falling';
      }
      return;
    }
    if (this.state === 'falling') {
      this.vy += this.accel;
      let ny = this.render.y.value + this.vy;
      if (ny >= this.restY) {
        ny = this.restY;
        this.state = 'landed';
        this.addSolid({ x: this.rect.x, y: this.restY, width: this.rect.width, height: this.rect.height });
      }
      this.render.y.value = ny;
    }
  }

  hazardRect(): RectLike | null {
    return this.state === 'falling' ? this.currentRect() : null;
  }

  reset(): void {
    super.reset();
    this.state = 'idle';
    this.vy = 0;
    this.removeSolid();
  }
}

export class Saw extends BaseEntity {
  private readonly follower: PathFollower | null;

  constructor(world: Matter.World, id: string, def: Def<'saw'>) {
    super(world, id, 'saw', def);
    this.follower = def.path ? new PathFollower(def.path) : null;
  }

  update(ctx: EntityContext): void {
    if (this.follower) {
      this.follower.step(ctx.dtMs);
      this.render.x.value = this.follower.x;
      this.render.y.value = this.follower.y;
    }
    this.render.angle.value += 0.25; // spin
  }

  hazardRect(): RectLike {
    const r = this.currentRect();
    const inset = 6; // a touch forgiving
    return { x: r.x + inset, y: r.y + inset, width: r.width - 2 * inset, height: r.height - 2 * inset };
  }

  reset(): void {
    super.reset();
    this.follower?.reset();
  }
}

/** Beam that switches on/off on a timer; lethal only while on. */
export class Laser extends BaseEntity {
  private readonly onMs: number;
  private readonly offMs: number;
  private readonly phase0: number;
  private timer: number;
  private on = true;

  constructor(world: Matter.World, id: string, def: Def<'laser'>) {
    super(world, id, 'laser', def);
    this.onMs = def.onMs ?? 900;
    this.offMs = def.offMs ?? 900;
    this.phase0 = def.phase ?? 0;
    this.timer = this.phase0;
    this.render.extra.value = 1;
  }

  update(ctx: EntityContext): void {
    this.timer += ctx.dtMs;
    const period = this.on ? this.onMs : this.offMs;
    if (this.timer >= period) {
      this.timer = 0;
      this.on = !this.on;
    }
    this.render.extra.value = this.on ? 1 : 0;
    this.render.alpha.value = this.on ? 1 : 0.12;
  }

  hazardRect(): RectLike | null {
    return this.on ? this.currentRect() : null;
  }

  reset(): void {
    super.reset();
    this.timer = this.phase0;
    this.on = true;
    this.render.extra.value = 1;
    this.render.alpha.value = 1;
  }
}

export class Crusher extends BaseEntity {
  private dir = 1; // 1 = descending, -1 = rising
  private pauseLeft = 0;
  private closed = false;
  private readonly range: number;
  private readonly speed: number;
  private readonly pause: number;

  constructor(world: Matter.World, id: string, def: Def<'crusher'>) {
    super(world, id, 'crusher', def);
    this.range = def.range;
    this.speed = def.speed;
    this.pause = def.pauseMs ?? 350;
    this.addSolid(def);
  }

  update(ctx: EntityContext): void {
    const topStart = this.rect.y;
    const topEnd = this.rect.y + this.range;
    let y = this.render.y.value;

    if (this.pauseLeft > 0) {
      this.pauseLeft -= ctx.dtMs;
    } else {
      y += this.speed * this.dir;
      if (y >= topEnd) {
        y = topEnd;
        this.dir = -1;
        this.pauseLeft = this.pause;
        this.closed = true;
      } else if (y <= topStart) {
        y = topStart;
        this.dir = 1;
        this.pauseLeft = this.pause;
        this.closed = false;
      }
    }

    this.render.y.value = y;
    this.render.extra.value = (y - topStart) / Math.max(1, this.range);
    if (this.body) {
      Matter.Body.setPosition(this.body, {
        x: this.rect.x + this.rect.width / 2,
        y: y + this.rect.height / 2,
      });
    }
  }

  hazardRect(): RectLike | null {
    if (this.dir > 0 || this.closed) {
      const r = this.currentRect();
      return { x: r.x + 4, y: r.y + r.height - 12, width: r.width - 8, height: 16 };
    }
    return null;
  }

  reset(): void {
    super.reset();
    this.dir = 1;
    this.pauseLeft = 0;
    this.closed = false;
    this.removeSolid();
    this.addSolid(this.rect);
  }
}
