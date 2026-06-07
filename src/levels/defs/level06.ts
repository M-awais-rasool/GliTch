/**
 * 6 · FROST — "Spring". Signature: bounce pads. Chain launches across a deep pit
 * to climb to the exit. No bounce, no progress.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level06: LevelDef = {
  id: '6',
  index: 6,
  name: 'Spring',
  hint: 'Bounce higher.',
  theme: makeTheme('FROST', '#37E0FF', '#030C12', '#0A2630', '#10303A', '#2C7E96'),
  spawn: { x: 60, y: 320 },
  size: { width: 1340, height: 440 },
  goal: { x: 1120, y: 195, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 360, height: 120 },
    { type: 'spike', x: 360, y: 408, width: 820, height: 16, dir: 'up' },
    { type: 'bouncePad', x: 410, y: 350, width: 90, height: 12, power: 13 },
    { type: 'platform', x: 580, y: 255, width: 190, height: 18 },
    { type: 'bouncePad', x: 790, y: 245, width: 90, height: 12, power: 13 },
    { type: 'platform', x: 1010, y: 255, width: 230, height: 18 },
  ],
};
