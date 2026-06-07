/**
 * On-screen control geometry. Sizes are generous for thumb reach in landscape;
 * positions are offset from the safe-area insets at render time.
 */

export const CONTROL = {
  /** Diameter of the directional buttons. */
  dirSize: 78,
  /** Diameter of the jump button (slightly larger — most-used action). */
  jumpSize: 96,
  /** Outer margin from screen edges (added to safe-area insets). */
  margin: 26,
  /** Gap between the LEFT and RIGHT buttons. */
  dirGap: 16,
  /** Opacity of a button at rest / while pressed. */
  restOpacity: 0.32,
  pressedOpacity: 0.7,
} as const;
