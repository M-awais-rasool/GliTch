/**
 * 20 · SINGULARITY — the grand finale. Every new mechanic back to back: a
 * reverse conveyor into a dash over spikes, a pendulum, ice + headwind, a portal
 * over a pit (miss it and you fall), then a gravity-flip ceiling run to the exit.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level20: LevelDef = {
  id: '20',
  index: 20,
  name: 'Singularity',
  hint: 'All of it.',
  theme: makeTheme('SINGULARITY', '#FF3B5E', '#0A0306', '#2A0810', '#240A12', '#B0263E', GlitchColors.yellow),
  spawn: { x: 60, y: 320 },
  size: { width: 2360, height: 480 },
  goal: { x: 2160, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 260, height: 120 },
    { type: 'conveyor', x: 260, y: 360, width: 260, height: 120, dir: -1, speed: 1.6 },
    { type: 'dashPad', x: 440, y: 300, width: 60, height: 60, dir: 1, power: 14 },
    { type: 'spike', x: 520, y: 408, width: 200, height: 16, dir: 'up' },
    { type: 'platform', x: 720, y: 360, width: 180, height: 120 },
    { type: 'pendulum', x: 778, y: 98, width: 46, height: 46, length: 225, amplitude: 1.2, speed: 0.05 },
    { type: 'iceFloor', x: 900, y: 360, width: 300, height: 120 },
    { type: 'windZone', x: 900, y: 120, width: 300, height: 360, force: -1.6 },
    { type: 'spike', x: 1000, y: 332, width: 40, height: 28, dir: 'up' },
    { type: 'portal', x: 1120, y: 296, width: 44, height: 64, pairId: 'a' },
    // pit 1200..1500 — miss the portal and you fall in
    { type: 'spike', x: 1240, y: 408, width: 260, height: 16, dir: 'up' },
    { type: 'platform', x: 1500, y: 360, width: 220, height: 120 },
    { type: 'portal', x: 1520, y: 296, width: 44, height: 64, pairId: 'a' },
    { type: 'gravityZone', x: 1720, y: 0, width: 360, height: 480 },
    { type: 'spike', x: 1720, y: 452, width: 360, height: 16, dir: 'up' },
    { type: 'platform', x: 1720, y: 120, width: 360, height: 40 },
    { type: 'platform', x: 2080, y: 360, width: 220, height: 120 },
  ],
};
