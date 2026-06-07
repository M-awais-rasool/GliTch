/**
 * 5 · NEON — "Belt". Signature: conveyor floors. One drags you backward (fight
 * it), one launches you forward (use it to clear a long gap).
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level05: LevelDef = {
  id: '5',
  index: 5,
  name: 'Belt',
  hint: 'The floor moves.',
  theme: makeTheme('NEON', GlitchColors.pink, '#0E0410', '#34103A', '#2A1030', '#B0367F'),
  spawn: { x: 60, y: 320 },
  size: { width: 1800, height: 440 },
  goal: { x: 1640, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 260, height: 120 },
    { type: 'conveyor', x: 260, y: 360, width: 300, height: 120, dir: -1, speed: 1.5 },
    { type: 'platform', x: 680, y: 360, width: 320, height: 120 },
    { type: 'spike', x: 850, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'conveyor', x: 1000, y: 360, width: 300, height: 120, dir: 1, speed: 2 },
    // long gap 1300..1440 — ride the forward belt into the jump
    { type: 'platform', x: 1440, y: 360, width: 360, height: 120 },
  ],
};
