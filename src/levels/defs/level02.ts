/**
 * 2 · VOID — "Liars". Signature: fake platforms (vanish on touch) + hidden
 * spikes. The obvious path is a lie; the safe route is the boring one.
 */

import { GlitchColors } from '@/constants';
import type { LevelDef } from '@/levels/types';
import { makeTheme } from '@/levels/themes';

export const level02: LevelDef = {
  id: '2',
  index: 2,
  name: 'Liars',
  hint: "Don't trust the floor.",
  theme: makeTheme('VOID', GlitchColors.purple, '#0A0514', '#231041', '#241634', '#6A3CB0'),
  spawn: { x: 60, y: 320 },
  size: { width: 1840, height: 440 },
  goal: { x: 1680, y: 300, width: 56, height: 60 },
  entities: [
    { type: 'platform', x: 0, y: 360, width: 420, height: 120 },
    // decoy stepping stone over the gap — vanishes the instant you land
    { type: 'fakePlatform', x: 470, y: 300, width: 90, height: 18 },
    { type: 'platform', x: 560, y: 360, width: 340, height: 120 },
    { type: 'hiddenSpike', x: 740, y: 332, width: 60, height: 28, dir: 'up', triggerPad: 90 },
    { type: 'platform', x: 1040, y: 360, width: 300, height: 120 },
    { type: 'fakePlatform', x: 1180, y: 300, width: 90, height: 18 },
    { type: 'platform', x: 1460, y: 360, width: 320, height: 120 },
    { type: 'hiddenSpike', x: 1560, y: 332, width: 60, height: 28, dir: 'up', triggerPad: 90 },
  ],
};
