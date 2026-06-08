/**
 * 18 · STORM — "Chaos". Combo: ice underfoot AND wind shoving you around at the
 * same time. Headwind on the first slide, tailwind on the second.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level18: LevelDef = {
  id: '18',
  index: 18,
  name: 'Chaos',
  hint: 'Slide and brace.',
  theme: makeTheme('STORM', '#33E0C2', '#02100E', '#06281F', '#0A2A24', '#1E8A74'),
  spawn: { x: 60, y: 320 },
  size: { width: 1760, height: 460 },
  goal: { x: 1600, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 240, height: 120 },
    { type: 'iceFloor', x: 240, y: 360, width: 360, height: 120 },
    { type: 'windZone', x: 240, y: 120, width: 420, height: 360, force: -1.6 },
    { type: 'spike', x: 560, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'platform', x: 720, y: 360, width: 260, height: 120 },
    { type: 'iceFloor', x: 980, y: 360, width: 300, height: 120 },
    { type: 'windZone', x: 980, y: 120, width: 300, height: 360, force: 2.2 },
    { type: 'spike', x: 1240, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'platform', x: 1400, y: 360, width: 300, height: 120 },
  ],
};
