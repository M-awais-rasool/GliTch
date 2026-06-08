/**
 * 19 · RELAY — "Pressure". Combo: a chaser wall hunts you while you time a
 * pendulum, dive through a portal over a spike pit, and clear a second blade.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level19: LevelDef = {
  id: '19',
  index: 19,
  name: 'Pressure',
  hint: 'No time to think.',
  theme: makeTheme('RELAY', '#5B8CFF', '#04060F', '#0C1A38', '#141F3C', '#33599A'),
  spawn: { x: 80, y: 320 },
  size: { width: 1560, height: 460 },
  goal: { x: 1420, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'chaser', x: -140, y: 0, width: 140, height: 460, speed: 2.4, startDelayMs: 900 },
    { type: 'platform', x: 0, y: 360, width: 520, height: 120 },
    { type: 'pendulum', x: 277, y: 98, width: 46, height: 46, length: 225, amplitude: 1.1, speed: 0.05 },
    { type: 'portal', x: 480, y: 296, width: 44, height: 64, pairId: 'a' },
    { type: 'spike', x: 524, y: 408, width: 360, height: 16, dir: 'up' },
    { type: 'platform', x: 884, y: 360, width: 300, height: 120 },
    { type: 'portal', x: 904, y: 296, width: 44, height: 64, pairId: 'a' },
    { type: 'pendulum', x: 1040, y: 98, width: 46, height: 46, length: 225, amplitude: 1.2, speed: 0.046 },
    { type: 'platform', x: 1184, y: 360, width: 320, height: 120 },
  ],
};
