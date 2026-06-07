/**
 * Level data model — plain, serialisable, no engine/React imports.
 *
 * A `LevelDef` is the single source of truth for a level: it feeds the physics
 * layer (Matter bodies), the renderer (Skia), and the level-select map. Each
 * level carries its OWN `theme`, so every level looks completely different.
 *
 * Adding a level = create one data file and add it to the array in
 * `registry.ts`. No engine/core changes required.
 *
 * Coordinates are world-space, top-left origin, Y down.
 */

import type { WorldTheme } from '@/constants';
import type { Rect, Vector2 } from '@/types';

export type SpikeDir = 'up' | 'down' | 'left' | 'right';

/** Ping-pong path for moving entities. */
export interface MovePath {
  points: Vector2[];
  /** px/step. */
  speed: number;
  pauseMs?: number;
}

/** Discriminated union of every authorable entity (its initial `Rect` + params). */
export type EntityDef =
  // platforms / surfaces
  | ({ type: 'platform' } & Rect)
  | ({ type: 'movingPlatform'; path: MovePath } & Rect)
  | ({ type: 'crumblePlatform'; delayMs?: number } & Rect)
  | ({ type: 'fakePlatform' } & Rect)
  | ({ type: 'conveyor'; dir: -1 | 1; speed?: number } & Rect)
  | ({ type: 'bouncePad'; power?: number } & Rect)
  | ({ type: 'phasePlatform'; onMs?: number; offMs?: number; phase?: number } & Rect)
  // hazards
  | ({ type: 'spike'; dir?: SpikeDir } & Rect)
  | ({ type: 'hiddenSpike'; dir?: SpikeDir; triggerPad?: number } & Rect)
  | ({ type: 'fallingBlock'; triggerX?: number; fallAccel?: number; restY?: number } & Rect)
  | ({ type: 'saw'; path?: MovePath } & Rect)
  | ({ type: 'crusher'; range: number; speed: number; pauseMs?: number } & Rect)
  | ({ type: 'laser'; onMs?: number; offMs?: number; phase?: number } & Rect);

export type EntityType = EntityDef['type'];

export interface LevelDef {
  /** Short id, e.g. "1".."10". */
  id: string;
  /** 1-based position in the journey (used by the map). */
  index: number;
  name: string;
  /** This level's unique palette. */
  theme: WorldTheme;
  /** Player spawn (top-left). */
  spawn: Vector2;
  goal: Rect;
  /** World bounds (camera clamps to this). */
  size: { width: number; height: number };
  /** Overrides DEFAULT_GRAVITY_Y when present. */
  gravity?: number;
  entities: EntityDef[];
  /** One-line tutorial/teaser shown in the HUD. */
  hint?: string;
}
