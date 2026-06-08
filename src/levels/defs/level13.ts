/**
 * 13 · RIFT — "Warp". Signature: portals. Walk into a portal to skip a deadly
 * pit and reach places you can't jump to. Two linked pairs.
 */

import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level13: LevelDef = {
  id: '13',
  index: 13,
  name: 'Warp',
  hint: 'Step through.',
  theme: makeTheme('RIFT', '#8A5BFF', '#0A0618', '#1E1240', '#1E1638', '#5A3CB0'),
  spawn: { x: 60, y: 320 },
  size: { width: 1680, height: 440 },
  goal: { x: 1500, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 360, height: 120 },
    { type: 'spike', x: 360, y: 408, width: 700, height: 16, dir: 'up' },
    { type: 'portal', x: 380, y: 296, width: 44, height: 64, pairId: 'a' },
    { type: 'portal', x: 940, y: 296, width: 44, height: 64, pairId: 'a' },
    { type: 'platform', x: 920, y: 360, width: 240, height: 120 },
    { type: 'portal', x: 1080, y: 296, width: 44, height: 64, pairId: 'b' },
    { type: 'platform', x: 1300, y: 360, width: 300, height: 120 },
    { type: 'portal', x: 1340, y: 296, width: 44, height: 64, pairId: 'b' },
  ],
};
