/**
 * Contracts between the isolated game engine and the React/render layer.
 *
 * The engine never imports React. It writes per-frame state into Reanimated
 * shared values ("render handles"); Skia reads them on the UI thread, so the
 * 60fps render path involves zero React re-renders. Handles are created
 * imperatively (via `makeMutable`) so the engine — not a hook — owns them.
 */

import type { SharedValue } from 'react-native-reanimated';

import type { SpikeDir } from '@/levels/types';
import type { GameStatus } from '@/types';

/** Character animation states, encoded as numbers for worklet-friendliness. */
export const CHAR_STATE = {
  idle: 0,
  run: 1,
  jump: 2,
  fall: 3,
  land: 4,
  dead: 5,
} as const;
export type CharStateValue = (typeof CHAR_STATE)[keyof typeof CHAR_STATE];

export interface PlayerRenderHandle {
  /** Body centre in world space. */
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;
  /** -1 = facing left, 1 = facing right. */
  facing: SharedValue<number>;
  /** 0 / 1. */
  grounded: SharedValue<number>;
  /** One of CHAR_STATE. */
  state: SharedValue<number>;
  /** Death animation progress 0..1. */
  deathT: SharedValue<number>;
}

export interface CameraRenderHandle {
  /** Camera top-left in world space (includes shake). */
  x: SharedValue<number>;
  y: SharedValue<number>;
}

export type EntityRenderKind =
  | 'platform'
  | 'movingPlatform'
  | 'crumblePlatform'
  | 'fakePlatform'
  | 'spike'
  | 'hiddenSpike'
  | 'fallingBlock'
  | 'saw'
  | 'crusher';

/**
 * Per-entity render state. `x`/`y` are the CURRENT top-left in world space.
 * `extra` is kind-specific (e.g. spike extension 0..1). Static entities simply
 * never change their handles.
 */
export interface EntityRenderHandle {
  id: string;
  kind: EntityRenderKind;
  width: number;
  height: number;
  /** Static orientation hint (spikes). */
  dir?: SpikeDir;
  x: SharedValue<number>;
  y: SharedValue<number>;
  angle: SharedValue<number>;
  alpha: SharedValue<number>;
  extra: SharedValue<number>;
}

export interface LevelResult {
  timeMs: number;
  deaths: number;
}

export interface GameEngineCallbacks {
  onStatusChange: (status: GameStatus) => void;
  onDeaths: (deaths: number) => void;
  onComplete: (result: LevelResult) => void;
}
