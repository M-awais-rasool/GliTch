/**
 * 12 · GLACIER — "Slip". Signature: ice floors. Almost no traction — you slide
 * toward spikes and off ledges. Tap, don't hold.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level12: LevelDef = {
  id: '12',
  index: 12,
  name: 'Slip',
  hint: 'No brakes.',
  theme: makeTheme('GLACIER', '#9FE8FF', '#040E16', '#0C2230', '#13283A', '#3E7E9E', GlitchColors.green),
  spawn: { x: 60, y: 320 },
  size: { width: 1680, height: 440 },
  goal: { x: 1500, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 200, height: 120 },
    { type: 'iceFloor', x: 200, y: 360, width: 400, height: 120 },
    { type: 'spike', x: 560, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'iceFloor', x: 720, y: 360, width: 400, height: 120 },
    { type: 'spike', x: 980, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'iceFloor', x: 1240, y: 360, width: 360, height: 120 },
  ],
};
