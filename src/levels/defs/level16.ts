/**
 * 16 · VELOCITY — "Dash". Signature: dash gates that fling you forward. Run over
 * a gate to get launched, then JUMP to clear the spike pit. Hold the direction
 * you're dashing to keep the momentum.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level16: LevelDef = {
  id: '16',
  index: 16,
  name: 'Dash',
  hint: 'Dash, then jump.',
  theme: makeTheme('VELOCITY', '#9BFF3B', '#08120A', '#15300F', '#15280F', '#4E8A22'),
  spawn: { x: 60, y: 320 },
  size: { width: 1740, height: 460 },
  goal: { x: 1520, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 300, height: 120 },
    { type: 'dashPad', x: 230, y: 300, width: 60, height: 60, dir: 1, power: 12 },
    { type: 'spike', x: 300, y: 408, width: 200, height: 16, dir: 'up' },
    { type: 'platform', x: 500, y: 360, width: 220, height: 120 },
    { type: 'dashPad', x: 650, y: 300, width: 60, height: 60, dir: 1, power: 13 },
    { type: 'spike', x: 720, y: 408, width: 210, height: 16, dir: 'up' },
    { type: 'platform', x: 930, y: 360, width: 220, height: 120 },
    { type: 'dashPad', x: 1080, y: 300, width: 60, height: 60, dir: 1, power: 14 },
    { type: 'spike', x: 1150, y: 408, width: 230, height: 16, dir: 'up' },
    { type: 'platform', x: 1380, y: 360, width: 300, height: 120 },
  ],
};
