/**
 * Level entity contract + shared base.
 *
 * An entity owns its Matter solid body (if any) and its Reanimated render
 * handle (created imperatively via `makeMutable`, since the engine — not a hook
 * — owns it). The level runtime steps every entity, reads `solidBody()` (label
 * `platform`, used by grounded detection), `hazardRect()` (AABB death check) and
 * `carry` (to move the player when standing on a moving surface).
 */

import Matter from 'matter-js';
import { makeMutable } from 'react-native-reanimated';

import { PLATFORM_FRICTION } from '@/constants';
import type { EntityRenderHandle, EntityRenderKind } from '@/engine/types';
import type { SpikeDir } from '@/levels/types';
import type { Rect } from '@/types';
import type { RectLike } from '@/utils/math';

/** State handed to every entity each fixed step. */
export interface EntityContext {
  dtMs: number;
  /** Player AABB (top-left) this step. */
  playerRect: RectLike;
  playerVy: number;
  grounded: boolean;
  /** True if the player is resting on the top surface of `rect` this step. */
  restingOn: (rect: RectLike) => boolean;
  /** Kill the player (hazard contact handled centrally, but some entities also call this). */
  kill: () => void;
}

export interface LevelEntity {
  readonly id: string;
  readonly render: EntityRenderHandle;
  /** Current solid collider, or null (pure hazard / removed). */
  solidBody: () => Matter.Body | null;
  /** Current lethal AABB, or null if not deadly this step. */
  hazardRect: () => RectLike | null;
  /** Current top-left bounds (for restingOn checks). */
  currentRect: () => RectLike;
  /** Per-step delta of a moving solid surface, for carrying the player. */
  readonly carry: { dx: number; dy: number } | null;
  update: (ctx: EntityContext) => void;
  /** Restore initial state (on respawn). */
  reset: () => void;
}

export function makeRenderHandle(
  id: string,
  kind: EntityRenderKind,
  rect: Rect,
  dir?: SpikeDir,
): EntityRenderHandle {
  return {
    id,
    kind,
    width: rect.width,
    height: rect.height,
    dir,
    x: makeMutable(rect.x),
    y: makeMutable(rect.y),
    angle: makeMutable(0),
    alpha: makeMutable(1),
    extra: makeMutable(0),
  };
}

export abstract class BaseEntity implements LevelEntity {
  readonly id: string;
  readonly render: EntityRenderHandle;
  carry: { dx: number; dy: number } | null = null;

  protected body: Matter.Body | null = null;

  constructor(
    protected readonly world: Matter.World,
    id: string,
    kind: EntityRenderKind,
    protected readonly rect: Rect,
    dir?: SpikeDir,
  ) {
    this.id = id;
    this.render = makeRenderHandle(id, kind, rect, dir);
  }

  solidBody(): Matter.Body | null {
    return this.body;
  }

  hazardRect(): RectLike | null {
    return null;
  }

  currentRect(): RectLike {
    return {
      x: this.render.x.value,
      y: this.render.y.value,
      width: this.render.width,
      height: this.render.height,
    };
  }

  abstract update(ctx: EntityContext): void;

  reset(): void {
    this.render.x.value = this.rect.x;
    this.render.y.value = this.rect.y;
    this.render.angle.value = 0;
    this.render.alpha.value = 1;
    this.render.extra.value = 0;
    this.carry = null;
  }

  /** Build a static platform-labelled body for `rect` (top-left). */
  protected buildSolid(rect: RectLike): Matter.Body {
    return Matter.Bodies.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      { isStatic: true, label: 'platform', friction: PLATFORM_FRICTION },
    );
  }

  protected addSolid(rect: RectLike): void {
    this.body = this.buildSolid(rect);
    Matter.Composite.add(this.world, this.body);
  }

  protected removeSolid(): void {
    if (this.body) {
      Matter.Composite.remove(this.world, this.body);
      this.body = null;
    }
  }
}
