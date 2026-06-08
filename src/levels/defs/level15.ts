/**
 * 15 · OUTRUN — "The Wall". Signature: a wall of spikes advances from behind.
 * Never stop: clear the jumps cleanly or it catches you.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level15: LevelDef = {
  id: '15',
  index: 15,
  name: 'The Wall',
  hint: "Don't look back.",
  theme: makeTheme('OUTRUN', '#FF5A3C', '#100503', '#2E1208', '#281206', '#9A4A26', '#FFD23B', '#FF3B5E'),
  spawn: { x: 80, y: 320 },
  size: { width: 1820, height: 480 },
  goal: { x: 1700, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'chaser', x: -140, y: 0, width: 140, height: 480, speed: 2.6, startDelayMs: 700 },
    { type: 'platform', x: 0, y: 360, width: 900, height: 120 },
    { type: 'spike', x: 460, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'spike', x: 740, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'platform', x: 1000, y: 360, width: 760, height: 120 },
    { type: 'spike', x: 1180, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'spike', x: 1440, y: 332, width: 40, height: 28, dir: 'up' },
  ],
};
