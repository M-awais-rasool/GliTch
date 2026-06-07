/**
 * 1-2 "DON'T STOP" — a spike pit crossed on crumbling stepping stones that
 * collapse a beat after you land, then a block that drops from the ceiling the
 * moment you pass beneath it. Hesitation kills.
 */

import type { LevelDef } from '@/levels/types';

export const level12: LevelDef = {
  id: '1-2',
  world: 1,
  index: 2,
  name: "Don't Stop",
  hint: 'Keep moving.',
  spawn: { x: 60, y: 320 },
  size: { width: 1760, height: 440 },
  goal: { x: 1600, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 360, height: 120 },
    // spike pit floor (360..1180)
    { type: 'spike', x: 360, y: 398, width: 820, height: 18, dir: 'up' },
    // crumbling stepping stones across the pit
    { type: 'crumblePlatform', x: 400, y: 336, width: 96, height: 22, delayMs: 360 },
    { type: 'crumblePlatform', x: 580, y: 336, width: 96, height: 22, delayMs: 360 },
    { type: 'crumblePlatform', x: 760, y: 336, width: 96, height: 22, delayMs: 360 },
    { type: 'crumblePlatform', x: 940, y: 336, width: 96, height: 22, delayMs: 360 },
    // safe floor
    { type: 'platform', x: 1180, y: 360, width: 540, height: 120 },
    // ceiling trap: drops as you cross beneath
    { type: 'fallingBlock', x: 1352, y: 96, width: 64, height: 64, triggerX: 1300, restY: 296 },
  ],
};
