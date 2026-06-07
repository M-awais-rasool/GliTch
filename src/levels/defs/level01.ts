/**
 * 1 · CIRCUIT — "First Steps". Signature: precise jumps + a spike that snaps up
 * from the floor. Teaches movement and that the ground can betray you.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level01: LevelDef = {
  id: '1',
  index: 1,
  name: 'First Steps',
  hint: 'Watch your step.',
  theme: makeTheme('CIRCUIT', GlitchColors.blue, '#04070F', '#0C1E38', '#15243C', '#2E6098'),
  spawn: { x: 60, y: 320 },
  size: { width: 1640, height: 440 },
  goal: { x: 1470, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 440, height: 120 },
    { type: 'spike', x: 300, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'platform', x: 560, y: 360, width: 360, height: 120 },
    { type: 'hiddenSpike', x: 720, y: 332, width: 60, height: 28, dir: 'up', triggerPad: 95 },
    { type: 'platform', x: 1050, y: 360, width: 520, height: 120 },
    { type: 'spike', x: 1300, y: 332, width: 44, height: 28, dir: 'up' },
  ],
};
