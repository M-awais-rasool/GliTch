/**
 * 9 · ABYSS — "Rhythm". Signature: phase platforms that blink in and out, plus
 * timed laser gates. Cross only on the beat.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level09: LevelDef = {
  id: '9',
  index: 9,
  name: 'Rhythm',
  hint: 'On the beat.',
  theme: makeTheme('ABYSS', '#33FFC2', '#02100D', '#06281F', '#0A2A22', '#1E8A6E', GlitchColors.blue),
  spawn: { x: 60, y: 320 },
  size: { width: 1760, height: 440 },
  goal: { x: 1600, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 300, height: 120 },
    { type: 'spike', x: 300, y: 408, width: 1000, height: 16, dir: 'up' },
    { type: 'phasePlatform', x: 360, y: 330, width: 100, height: 22, onMs: 1200, offMs: 900, phase: 0 },
    { type: 'phasePlatform', x: 560, y: 330, width: 100, height: 22, onMs: 1200, offMs: 900, phase: 600 },
    { type: 'laser', x: 760, y: 210, width: 16, height: 150, onMs: 900, offMs: 900, phase: 0 },
    { type: 'phasePlatform', x: 820, y: 330, width: 100, height: 22, onMs: 1100, offMs: 900, phase: 300 },
    { type: 'phasePlatform', x: 1020, y: 330, width: 100, height: 22, onMs: 1100, offMs: 900, phase: 900 },
    { type: 'laser', x: 1180, y: 210, width: 16, height: 150, onMs: 800, offMs: 800, phase: 400 },
    { type: 'platform', x: 1300, y: 360, width: 420, height: 120 },
  ],
};
