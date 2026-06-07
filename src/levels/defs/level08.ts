/**
 * 8 · PULSE — "Ceiling". Signature: the floor is safe — the danger falls from
 * above. Trigger-dropped blocks and timed crushers. Keep looking up.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level08: LevelDef = {
  id: '8',
  index: 8,
  name: 'Ceiling',
  hint: 'Look up.',
  theme: makeTheme('PULSE', '#FF4FD8', '#0C0410', '#2E0B33', '#260A2C', '#A0317F'),
  spawn: { x: 60, y: 320 },
  size: { width: 1800, height: 440 },
  goal: { x: 1620, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 1740, height: 120 },
    { type: 'fallingBlock', x: 360, y: 96, width: 64, height: 64, triggerX: 300, restY: 296 },
    { type: 'fallingBlock', x: 620, y: 96, width: 64, height: 64, triggerX: 560, restY: 296 },
    { type: 'crusher', x: 900, y: 90, width: 90, height: 70, range: 200, speed: 3, pauseMs: 350 },
    { type: 'fallingBlock', x: 1180, y: 96, width: 64, height: 64, triggerX: 1120, restY: 296 },
    { type: 'crusher', x: 1380, y: 90, width: 90, height: 70, range: 200, speed: 3.4, pauseMs: 260 },
  ],
};
