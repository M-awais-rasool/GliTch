/**
 * Tiny allocation-free math helpers used across the engine hot path.
 * Everything here is a pure function operating on numbers so the same code is
 * safe to call from the JS thread, from worklets, and from tests.
 */

/** Clamp `value` into the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  'worklet';
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Linear interpolation between `a` and `b` by factor `t` (0..1). */
export function lerp(a: number, b: number, t: number): number {
  'worklet';
  return a + (b - a) * t;
}

/**
 * Frame-rate independent smoothing factor.
 * Given a per-frame lerp factor tuned for 60fps, returns an equivalent factor
 * for the supplied frame delta so camera/easing feel identical on any device.
 */
export function smoothing(factorAt60: number, dtMs: number): number {
  'worklet';
  const frames = dtMs / (1000 / 60);
  return 1 - Math.pow(1 - factorAt60, frames);
}

/** Pseudo-random float in [min, max). */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Pseudo-random integer in [min, max] inclusive. */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

/** Minimal rectangle shape (top-left origin) for overlap tests. */
export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Axis-aligned bounding-box overlap test (top-left rects). */
export function aabbOverlap(a: RectLike, b: RectLike): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Whether point (px,py) is inside rect r (top-left origin). */
export function rectContainsPoint(r: RectLike, px: number, py: number): boolean {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}
