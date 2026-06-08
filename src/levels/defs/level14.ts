/**
 * 14 · SWING — "Pendulums". Signature: blades swinging on arcs from fixed
 * pivots. Read the rhythm and pass under at the right moment.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level14: LevelDef = {
  id: '14',
  index: 14,
  name: 'Pendulums',
  hint: 'Wait for the swing.',
  theme: makeTheme('SWING', '#FFB23B', '#0F0A02', '#2C2006', '#281E0C', '#8A6A1E', GlitchColors.green),
  spawn: { x: 60, y: 320 },
  size: { width: 1640, height: 460 },
  goal: { x: 1460, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 520, height: 120 },
    { type: 'pendulum', x: 278, y: 98, width: 46, height: 46, length: 226, amplitude: 1.1, speed: 0.04 },
    { type: 'platform', x: 620, y: 360, width: 520, height: 120 },
    { type: 'pendulum', x: 776, y: 98, width: 50, height: 50, length: 236, amplitude: 1.2, speed: 0.046 },
    { type: 'pendulum', x: 978, y: 98, width: 44, height: 44, length: 216, amplitude: 1.0, speed: 0.053 },
    { type: 'platform', x: 1240, y: 360, width: 400, height: 120 },
  ],
};
