/**
 * Theme helper for levels. Each level builds its own palette inline with
 * `makeTheme(...)`, so a level file is fully self-contained — no shared theme
 * registry to keep in sync when adding levels.
 */

import { GlitchColors, type WorldTheme } from '@/constants';

export function makeTheme(
  name: string,
  accent: string,
  background: string,
  backgroundGrid: string,
  platform: string,
  platformEdge: string,
  goal: string = GlitchColors.green,
  hazard = '#FF4B6E',
): WorldTheme {
  return { name, accent, background, backgroundGrid, platform, platformEdge, goal, hazard };
}
