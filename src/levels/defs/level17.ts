/**
 * 17 · UPSIDE DOWN — "Invert". Signature: a gravity-flip zone. Inside it you
 * fall UP and walk along the ceiling; the floor below is spikes. Leave the zone
 * and gravity snaps back — drop onto the exit.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level17: LevelDef = {
  id: '17',
  index: 17,
  name: 'Invert',
  hint: 'Down is up.',
  theme: makeTheme('INVERT', '#FF5BD0', '#0E0512', '#2E0E33', '#280F2E', '#A0367F', GlitchColors.green),
  spawn: { x: 60, y: 320 },
  size: { width: 1200, height: 480 },
  goal: { x: 1080, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 320, height: 120 },
    { type: 'gravityZone', x: 320, y: 0, width: 480, height: 480 },
    { type: 'spike', x: 320, y: 452, width: 480, height: 16, dir: 'up' },
    { type: 'platform', x: 320, y: 120, width: 480, height: 40 }, // the ceiling you walk on
    { type: 'platform', x: 800, y: 360, width: 360, height: 120 },
  ],
};
