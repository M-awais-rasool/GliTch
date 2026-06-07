/**
 * 10 · OVERLOAD — "Gauntlet". The finale: every mechanic at once — a backward
 * belt, a ferry over spikes, a saw, crumbling stones, a ceiling drop, a laser
 * gate and a bounce to the exit. The hardest level.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level10: LevelDef = {
  id: '10',
  index: 10,
  name: 'Gauntlet',
  hint: 'Everything, now.',
  theme: makeTheme('OVERLOAD', '#FF3B5E', '#100306', '#330810', '#2C0A12', '#B0263E', GlitchColors.yellow),
  spawn: { x: 60, y: 320 },
  size: { width: 2040, height: 460 },
  goal: { x: 1880, y: 200, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 260, height: 120 },
    { type: 'conveyor', x: 260, y: 360, width: 260, height: 120, dir: -1, speed: 1.6 },
    { type: 'spike', x: 520, y: 408, width: 460, height: 16, dir: 'up' },
    {
      type: 'movingPlatform',
      x: 540,
      y: 345,
      width: 110,
      height: 20,
      path: { points: [{ x: 540, y: 345 }, { x: 770, y: 345 }], speed: 2, pauseMs: 200 },
    },
    { type: 'platform', x: 980, y: 360, width: 200, height: 120 },
    {
      type: 'saw',
      x: 1070,
      y: 310,
      width: 46,
      height: 46,
      path: { points: [{ x: 1070, y: 310 }, { x: 1070, y: 180 }], speed: 2.4 },
    },
    { type: 'spike', x: 1180, y: 408, width: 360, height: 16, dir: 'up' },
    { type: 'crumblePlatform', x: 1210, y: 336, width: 90, height: 22, delayMs: 300 },
    { type: 'crumblePlatform', x: 1380, y: 336, width: 90, height: 22, delayMs: 300 },
    { type: 'platform', x: 1540, y: 360, width: 260, height: 120 },
    { type: 'fallingBlock', x: 1640, y: 96, width: 64, height: 64, triggerX: 1580, restY: 296 },
    { type: 'laser', x: 1760, y: 210, width: 16, height: 150, onMs: 700, offMs: 700, phase: 0 },
    { type: 'bouncePad', x: 1700, y: 352, width: 80, height: 12, power: 13 },
    { type: 'platform', x: 1840, y: 260, width: 160, height: 18 },
  ],
};
