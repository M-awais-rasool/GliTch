/**
 * Level data model.
 *
 * Levels are plain serialisable data (no engine/React imports) so they can be
 * authored by hand, generated, snapshotted or replayed. A `LevelDef` feeds both
 * the physics layer (which builds Matter bodies) and the renderer (which draws
 * Skia shapes) from the same source of truth.
 *
 * All coordinates are world-space, top-left origin, Y down. Rects use top-left
 * x/y + width/height.
 */

import type { WorldTheme } from '@/constants';
import type { Rect, Vector2 } from '@/types';

export type SpikeDir = 'up' | 'down' | 'left' | 'right';

/** Ping-pong path for moving entities (moving platform, saw). */
export interface MovePath {
  /** >= 2 waypoints (top-left positions). The entity ping-pongs along them. */
  points: Vector2[];
  /** Travel speed in px/step. */
  speed: number;
  /** Optional pause (ms) at each endpoint. */
  pauseMs?: number;
}

/**
 * Discriminated union of every authorable entity. Each variant is a `Rect`
 * (its initial bounds) plus a `type` tag and any extra params.
 */
export type EntityDef =
  | ({ type: 'platform' } & Rect)
  | ({ type: 'movingPlatform'; path: MovePath } & Rect)
  | ({ type: 'crumblePlatform'; delayMs?: number } & Rect)
  | ({ type: 'fakePlatform' } & Rect)
  | ({ type: 'spike'; dir?: SpikeDir } & Rect)
  | ({ type: 'hiddenSpike'; dir?: SpikeDir; triggerPad?: number } & Rect)
  | ({ type: 'fallingBlock'; triggerX?: number; fallAccel?: number; restY?: number } & Rect)
  | ({ type: 'saw'; path?: MovePath } & Rect)
  | ({ type: 'crusher'; range: number; speed: number; pauseMs?: number } & Rect);

export type EntityType = EntityDef['type'];

export interface LevelDef {
  /** "1-1" style id. */
  id: string;
  world: number;
  /** 1-based sub-level index within its world. */
  index: number;
  name: string;
  /** Player spawn (top-left). */
  spawn: Vector2;
  /** Finish zone. */
  goal: Rect;
  /** World bounds (camera clamps to this). */
  size: { width: number; height: number };
  /** Overrides DEFAULT_GRAVITY_Y when present. */
  gravity?: number;
  entities: EntityDef[];
  /** Short one-liner shown at level start. */
  hint?: string;
}

export interface WorldDef {
  world: number;
  name: string;
  theme: WorldTheme;
  levels: LevelDef[];
}
