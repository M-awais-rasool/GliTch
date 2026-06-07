/**
 * 1-3 "MACHINE" — a moving platform ferry over a pit, a bobbing saw you must
 * time, one last crumbling hop, and a ceiling block right before the goal.
 * Everything World 1 taught, combined.
 */

import type { LevelDef } from '@/levels/types';

export const level13: LevelDef = {
  id: '1-3',
  world: 1,
  index: 3,
  name: 'Machine',
  hint: 'Time it.',
  spawn: { x: 60, y: 320 },
  size: { width: 1760, height: 440 },
  goal: { x: 1620, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 300, height: 120 },
    // pit 300..720, crossed by a ferry
    { type: 'spike', x: 300, y: 408, width: 420, height: 16, dir: 'up' },
    {
      type: 'movingPlatform',
      x: 320,
      y: 345,
      width: 120,
      height: 20,
      path: { points: [{ x: 320, y: 345 }, { x: 560, y: 345 }], speed: 1.5, pauseMs: 300 },
    },
    { type: 'platform', x: 720, y: 360, width: 300, height: 120 },
    // bobbing saw guarding the walkway
    {
      type: 'saw',
      x: 880,
      y: 300,
      width: 46,
      height: 46,
      path: { points: [{ x: 880, y: 300 }, { x: 880, y: 172 }], speed: 1.9 },
    },
    // pit 1020..1160 (140), then a crumbling hop
    { type: 'crumblePlatform', x: 1180, y: 336, width: 100, height: 22, delayMs: 340 },
    { type: 'platform', x: 1340, y: 360, width: 380, height: 120 },
    // final ceiling trap before the goal
    { type: 'fallingBlock', x: 1500, y: 96, width: 64, height: 64, triggerX: 1444, restY: 296 },
  ],
};
