/**
 * Procedural Skia character — a small neon robot, drawn entirely from shapes so
 * it needs no art assets, scales perfectly and animates fully on the UI thread.
 *
 * Every visual property is a Reanimated derived value reading the engine's
 * PlayerRenderHandle, so the character animates without any React re-renders:
 *  - squash & stretch from the animation state (jump stretches, fall/land squash)
 *  - facing flips the whole rig; eyes bias toward the front and tilt with vy
 *  - antenna tip sways opposite to horizontal motion
 *  - feet bob in a run cycle driven by world x (so it syncs to actual speed)
 *  - death: the body inflates and fades while a danger ring bursts outward
 *
 * Rendered INSIDE the LevelRenderer's Canvas world-group (already camera-shifted),
 * positioned at the player body centre.
 */

import { Circle, Group, RoundedRect } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { Palette, PLAYER_HEIGHT, PLAYER_WIDTH } from '@/constants';
import { CHAR_STATE, type PlayerRenderHandle } from '@/engine/types';
import { clamp } from '@/utils/math';

interface CharacterProps {
  player: PlayerRenderHandle;
  accent: string;
}

const HALF_W = PLAYER_WIDTH / 2;
const HALF_H = PLAYER_HEIGHT / 2;

export const Character = memo(function Character({ player, accent }: CharacterProps) {
  const stJump = CHAR_STATE.jump;
  const stFall = CHAR_STATE.fall;
  const stDead = CHAR_STATE.dead;

  const aliveOpacity = useDerivedValue(() => 1 - player.deathT.value * 0.9);
  const glowOpacity = useDerivedValue(() => (1 - player.deathT.value * 0.9) * 0.28);

  const transform = useDerivedValue(() => {
    const s = player.state.value;
    const death = player.deathT.value;
    let sx = 1;
    let sy = 1;
    if (s === stJump) {
      sx = 0.86;
      sy = 1.16;
    } else if (s === stFall) {
      sx = 0.94;
      sy = 1.08;
    }
    const grow = 1 + death * 0.7; // inflate on death
    return [
      { translateX: player.x.value },
      { translateY: player.y.value },
      { scaleX: player.facing.value * sx * grow },
      { scaleY: sy * grow },
    ];
  });

  const eyeY = useDerivedValue(() => -HALF_H + 8 + clamp(player.vy.value * 0.2, -2, 3));
  const antennaTipX = useDerivedValue(() => clamp(-player.vx.value * 1.1, -5, 5));

  // Run cycle: feet bob with world x while grounded & moving; still when idle.
  const footPhase = useDerivedValue(() => {
    const moving = player.grounded.value > 0.5 && Math.abs(player.vx.value) > 0.4;
    return moving ? Math.sin(player.x.value * 0.06) : 0;
  });
  const footLeftY = useDerivedValue(() => HALF_H - 5 - Math.max(0, footPhase.value) * 2.5);
  const footRightY = useDerivedValue(() => HALF_H - 5 - Math.max(0, -footPhase.value) * 2.5);

  const burstR = useDerivedValue(() => player.deathT.value * PLAYER_WIDTH * 1.5);
  const burstOpacity = useDerivedValue(() => {
    const t = player.deathT.value;
    return t > 0 ? Math.max(0, 1 - t) * 0.9 : 0;
  });

  // Death tint flag (we keep body white but flash a red overlay as it dies).
  const deathOverlayOpacity = useDerivedValue(() =>
    player.state.value === stDead ? player.deathT.value * 0.55 : 0,
  );

  return (
    <Group transform={transform}>
      {/* outer neon glow */}
      <RoundedRect
        x={-HALF_W - 5}
        y={-HALF_H - 5}
        width={PLAYER_WIDTH + 10}
        height={PLAYER_HEIGHT + 10}
        r={12}
        color={accent}
        opacity={glowOpacity}
      />

      {/* feet */}
      <RoundedRect x={-HALF_W + 3} y={footLeftY} width={9} height={6} r={3} color={Palette.playerEye} opacity={aliveOpacity} />
      <RoundedRect x={HALF_W - 12} y={footRightY} width={9} height={6} r={3} color={Palette.playerEye} opacity={aliveOpacity} />

      {/* body */}
      <RoundedRect x={-HALF_W} y={-HALF_H} width={PLAYER_WIDTH} height={PLAYER_HEIGHT} r={9} color={Palette.player} opacity={aliveOpacity} />

      {/* dark visor band */}
      <RoundedRect x={-HALF_W + 3} y={-HALF_H + 5} width={PLAYER_WIDTH - 6} height={13} r={6} color={Palette.playerEye} opacity={aliveOpacity} />

      {/* eyes (front-biased; flip handled by group scaleX) */}
      <RoundedRect x={-5} y={eyeY} width={5} height={7} r={2.5} color={accent} opacity={aliveOpacity} />
      <RoundedRect x={4} y={eyeY} width={5} height={7} r={2.5} color={accent} opacity={aliveOpacity} />

      {/* antenna + glowing tip */}
      <RoundedRect x={-1.5} y={-HALF_H - 9} width={3} height={9} r={1.5} color={Palette.player} opacity={aliveOpacity} />
      <Circle cx={antennaTipX} cy={-HALF_H - 12} r={3.5} color={accent} opacity={aliveOpacity} />

      {/* death flash + burst ring */}
      <RoundedRect x={-HALF_W} y={-HALF_H} width={PLAYER_WIDTH} height={PLAYER_HEIGHT} r={9} color={Palette.danger} opacity={deathOverlayOpacity} />
      <Circle cx={0} cy={0} r={burstR} color={Palette.danger} style="stroke" strokeWidth={3} opacity={burstOpacity} />
    </Group>
  );
});
