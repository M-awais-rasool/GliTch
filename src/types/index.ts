/**
 * Core shared types for GLITCH.
 *
 * These are intentionally framework-agnostic (no React / Skia / Matter imports)
 * so that both the isolated game engine and the React UI layer can depend on
 * them without creating circular coupling.
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Axis-aligned rectangle expressed by its top-left corner (world space). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** High-level lifecycle of a single level attempt. */
export type GameStatus = 'idle' | 'running' | 'dead' | 'complete';

export * from './entities';
