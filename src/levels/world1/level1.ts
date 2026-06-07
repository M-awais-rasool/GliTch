/**
 * 1-1 "FIRST LIES" — teaches the core lesson: nothing is safe.
 * Two jumpable pits, a spike that pops up out of the floor as you approach, and
 * a tempting raised step that vanishes the instant you touch it. The honest
 * route is along the ground; the decoy punishes greed.
 */

import type { LevelDef } from '@/levels/types';

export const level11: LevelDef = {
  id: '1-1',
  world: 1,
  index: 1,
  name: 'First Lies',
  hint: 'Trust nothing.',
  spawn: { x: 60, y: 320 },
  size: { width: 1760, height: 440 },
  goal: { x: 1600, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 480, height: 120 },
    // pit 480..600 (120)
    { type: 'platform', x: 600, y: 360, width: 400, height: 120 },
    // surprise: spike snaps up from the floor as you near it
    { type: 'hiddenSpike', x: 780, y: 332, width: 64, height: 28, dir: 'up', triggerPad: 95 },
    // pit 1000..1120 (120)
    { type: 'platform', x: 1120, y: 360, width: 600, height: 120 },
    // decoy: looks like a helpful step, disappears on contact
    { type: 'fakePlatform', x: 1320, y: 298, width: 96, height: 18 },
    // honest obstacle: jump it
    { type: 'spike', x: 1488, y: 332, width: 48, height: 28, dir: 'up' },
  ],
};
