/**
 * 7 · EMBER — "Sawmill". Signature: spinning saws on vertical, horizontal and
 * diagonal paths. Read each blade's rhythm and slip through.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level07: LevelDef = {
  id: '7',
  index: 7,
  name: 'Sawmill',
  hint: 'Mind the blades.',
  theme: makeTheme('EMBER', '#FF8A3B', '#100702', '#301807', '#2A1808', '#9A5A22', GlitchColors.yellow),
  spawn: { x: 60, y: 320 },
  size: { width: 1700, height: 440 },
  goal: { x: 1500, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 440, height: 120 },
    {
      type: 'saw',
      x: 300,
      y: 300,
      width: 46,
      height: 46,
      path: { points: [{ x: 300, y: 300 }, { x: 300, y: 180 }], speed: 2 },
    },
    { type: 'platform', x: 560, y: 360, width: 500, height: 120 },
    {
      type: 'saw',
      x: 700,
      y: 300,
      width: 50,
      height: 50,
      path: { points: [{ x: 700, y: 300 }, { x: 900, y: 300 }], speed: 2.2 },
    },
    {
      type: 'saw',
      x: 980,
      y: 310,
      width: 46,
      height: 46,
      path: { points: [{ x: 980, y: 310 }, { x: 980, y: 190 }], speed: 1.8 },
    },
    { type: 'platform', x: 1180, y: 360, width: 420, height: 120 },
    {
      type: 'saw',
      x: 1300,
      y: 320,
      width: 44,
      height: 44,
      path: { points: [{ x: 1300, y: 320 }, { x: 1460, y: 200 }], speed: 2 },
    },
  ],
};
