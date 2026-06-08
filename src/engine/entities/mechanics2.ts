/**
 * Second-wave mechanics (levels 11–20):
 *  - IceFloor    : solid floor that makes you slide (env.onIce).
 *  - WindZone    : passive field that pushes you sideways while inside.
 *  - GravityZone : passive field that flips gravity while inside.
 *  - Portal      : paired teleporter (logic resolved in LevelRuntime).
 *  - DashPad     : pass-through gate that flings you horizontally.
 *  - Pendulum    : a blade swinging from a fixed pivot (realistic arc).
 *  - Chaser      : an advancing wall of spikes — outrun it or die.
 *
 * Ice/wind/gravity are sampled by the runtime via `surfaceType`/`zone`; portals
 * via `portalPairId`. Pendulum & Chaser are ordinary AABB hazards.
 */

import type Matter from 'matter-js';

import type { EntityDef } from '@/levels/types';
import { hapticMedium } from '@/services/haptics';
import { aabbOverlap, type RectLike } from '@/utils/math';

import { BaseEntity, type EntityContext } from './LevelEntity';

type Def<T extends EntityDef['type']> = Extract<EntityDef, { type: T }>;

export class IceFloor extends BaseEntity {
  constructor(world: Matter.World, id: string, def: Def<'iceFloor'>) {
    super(world, id, 'iceFloor', def);
    this.surfaceType = 'ice';
    this.addSolid(def);
  }

  update(): void {
    /* static */
  }

  reset(): void {
    super.reset();
    if (!this.body) this.addSolid(this.rect);
  }
}

export class WindZone extends BaseEntity {
  constructor(world: Matter.World, id: string, def: Def<'windZone'>) {
    super(world, id, 'windZone', def, def.force > 0 ? 'right' : 'left');
    this.zone = { kind: 'wind', force: def.force };
  }

  update(): void {
    this.render.extra.value = (this.render.extra.value + 0.02) % 1; // arrow scroll
  }
}

export class GravityZone extends BaseEntity {
  constructor(world: Matter.World, id: string, def: Def<'gravityZone'>) {
    super(world, id, 'gravityZone', def);
    this.zone = { kind: 'gravity' };
  }

  update(): void {
    this.render.extra.value = (this.render.extra.value + 0.02) % 1;
  }
}

export class Portal extends BaseEntity {
  constructor(world: Matter.World, id: string, def: Def<'portal'>) {
    super(world, id, 'portal', def);
    this.portalPairId = def.pairId;
  }

  update(): void {
    this.render.angle.value += 0.06; // swirl
    this.render.extra.value = (this.render.extra.value + 0.02) % 1;
  }
}

export class DashPad extends BaseEntity {
  private readonly dir: number;
  private readonly power: number;
  private cooldown = 0;

  constructor(world: Matter.World, id: string, def: Def<'dashPad'>) {
    super(world, id, 'dashPad', def, def.dir > 0 ? 'right' : 'left');
    this.dir = def.dir;
    this.power = def.power ?? 9;
  }

  update(ctx: EntityContext): void {
    if (this.cooldown > 0) this.cooldown -= ctx.dtMs;
    if (this.cooldown <= 0 && aabbOverlap(ctx.playerRect, this.currentRect())) {
      ctx.boostX(this.dir * this.power);
      this.cooldown = 260;
      this.render.extra.value = 1;
      hapticMedium();
    } else {
      this.render.extra.value = Math.max(0, this.render.extra.value - ctx.dtMs / 150);
    }
  }

  reset(): void {
    super.reset();
    this.cooldown = 0;
  }
}

export class Pendulum extends BaseEntity {
  private phase = 0;
  private readonly amp: number;
  private readonly speed: number;
  private readonly length: number;
  private readonly pivotX: number;
  private readonly pivotY: number;
  private readonly size: number;

  constructor(world: Matter.World, id: string, def: Def<'pendulum'>) {
    super(world, id, 'pendulum', def);
    this.size = def.width;
    this.pivotX = def.x + def.width / 2;
    this.pivotY = def.y + def.height / 2;
    this.length = def.length;
    this.amp = def.amplitude ?? 1.0;
    this.speed = def.speed ?? 0.035;
  }

  update(ctx: EntityContext): void {
    this.phase += this.speed;
    const angle = this.amp * Math.sin(this.phase);
    const bladeX = this.pivotX + Math.sin(angle) * this.length;
    const bladeY = this.pivotY + Math.cos(angle) * this.length;
    this.render.x.value = bladeX - this.size / 2;
    this.render.y.value = bladeY - this.size / 2;
    this.render.angle.value += 0.25;
  }

  hazardRect(): RectLike {
    const r = this.currentRect();
    const inset = 5;
    return { x: r.x + inset, y: r.y + inset, width: r.width - 2 * inset, height: r.height - 2 * inset };
  }

  reset(): void {
    super.reset();
    this.phase = 0;
  }
}

export class Chaser extends BaseEntity {
  private readonly speed: number;
  private readonly delay: number;
  private elapsed = 0;

  constructor(world: Matter.World, id: string, def: Def<'chaser'>) {
    super(world, id, 'chaser', def);
    this.speed = def.speed;
    this.delay = def.startDelayMs ?? 0;
  }

  update(ctx: EntityContext): void {
    this.elapsed += ctx.dtMs;
    if (this.elapsed >= this.delay) {
      this.render.x.value += this.speed;
    }
    this.render.extra.value = (this.render.extra.value + 0.03) % 1;
  }

  hazardRect(): RectLike {
    return this.currentRect();
  }

  reset(): void {
    super.reset();
    this.elapsed = 0;
  }
}
