/**
 * 4 · FOUNDRY — "Riders". Signature: moving-platform ferries over a long spike
 * pit. Board, ride, and time your dismounts.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level04: LevelDef = {
  id: '4',
  index: 4,
  name: 'Riders',
  hint: 'Catch the ride.',
  theme: makeTheme('FOUNDRY', GlitchColors.yellow, '#0F0B03', '#2E2208', '#2A2210', '#9A7A22'),
  spawn: { x: 60, y: 320 },
  size: { width: 1800, height: 440 },
  goal: { x: 1620, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 320, height: 120 },
    { type: 'spike', x: 320, y: 408, width: 940, height: 16, dir: 'up' },
    {
      type: 'movingPlatform',
      x: 340,
      y: 345,
      width: 120,
      height: 20,
      path: { points: [{ x: 340, y: 345 }, { x: 560, y: 345 }], speed: 1.6, pauseMs: 300 },
    },
    { type: 'platform', x: 760, y: 360, width: 200, height: 120 },
    {
      type: 'movingPlatform',
      x: 1000,
      y: 345,
      width: 120,
      height: 20,
      path: { points: [{ x: 1000, y: 345 }, { x: 1180, y: 345 }], speed: 1.9, pauseMs: 250 },
    },
    { type: 'platform', x: 1380, y: 360, width: 360, height: 120 },
    { type: 'spike', x: 1500, y: 332, width: 44, height: 28, dir: 'up' },
  ],
};
