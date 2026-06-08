/**
 * 11 · GALE — "Headwind". Signature: wind zones. The wind blows over solid
 * ground, not the pits: push RIGHT through the headwind stretch, then ride (and
 * control) the tailwind stretch. The gaps themselves are ordinary jumps.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level11: LevelDef = {
  id: '11',
  index: 11,
  name: 'Headwind',
  hint: 'Hold right and push through the wind.',
  theme: makeTheme('GALE', '#7FD8FF', '#06101A', '#11283A', '#16293B', '#3A6E92'),
  spawn: { x: 60, y: 320 },
  size: { width: 1880, height: 480 },
  goal: { x: 1660, y: 300, width: 56, height: 60 },
  entities: [
    // runway to build speed
    { type: 'platform', x: 0, y: 360, width: 400, height: 120 },
    // gap 400..520 — ordinary jump, no wind
    // headwind stretch on solid ground: walk right into it
    { type: 'platform', x: 520, y: 360, width: 380, height: 120 },
    { type: 'windZone', x: 520, y: 120, width: 380, height: 360, force: -1.3 },
    { type: 'spike', x: 840, y: 332, width: 40, height: 28, dir: 'up' },
    // gap 900..1020 — ordinary jump, no wind
    // tailwind stretch on solid ground: it speeds you up — don't overshoot
    { type: 'platform', x: 1020, y: 360, width: 380, height: 120 },
    { type: 'windZone', x: 1020, y: 120, width: 380, height: 360, force: 1.9 },
    { type: 'spike', x: 1340, y: 332, width: 40, height: 28, dir: 'up' },
    // gap 1400..1520 — ordinary jump (tailwind helps you off the edge)
    { type: 'platform', x: 1520, y: 360, width: 360, height: 120 },
  ],
};
