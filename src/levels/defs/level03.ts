/**
 * 3 · TOXIC — "Don't Stop". Signature: crumbling stepping stones over a spike
 * pit. Stand still and you fall; momentum is survival.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level03: LevelDef = {
  id: '3',
  index: 3,
  name: "Don't Stop",
  hint: 'Keep moving.',
  theme: makeTheme('TOXIC', GlitchColors.green, '#03100B', '#0A2A1D', '#0F2A20', '#2C8A63', GlitchColors.yellow),
  spawn: { x: 60, y: 320 },
  size: { width: 1760, height: 440 },
  goal: { x: 1560, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 320, height: 120 },
    { type: 'spike', x: 320, y: 398, width: 900, height: 18, dir: 'up' },
    { type: 'crumblePlatform', x: 380, y: 336, width: 90, height: 22, delayMs: 340 },
    { type: 'crumblePlatform', x: 560, y: 336, width: 90, height: 22, delayMs: 340 },
    { type: 'crumblePlatform', x: 740, y: 336, width: 90, height: 22, delayMs: 340 },
    { type: 'crumblePlatform', x: 920, y: 336, width: 90, height: 22, delayMs: 340 },
    { type: 'crumblePlatform', x: 1100, y: 336, width: 90, height: 22, delayMs: 340 },
    { type: 'platform', x: 1260, y: 360, width: 420, height: 120 },
  ],
};
