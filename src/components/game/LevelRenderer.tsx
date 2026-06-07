/**
 * Skia render surface for a level.
 *
 * Draws the themed background + parallax grid, then a single world Group whose
 * transform is the (negated) camera offset. Inside it: every entity node, the
 * goal, and the character — all in world space. Only the camera transform and
 * the per-entity/character shared values change each frame, so Skia repaints on
 * the UI thread with no React reconciliation.
 */

import { Canvas, Fill, Group, RoundedRect } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import type { WorldTheme } from '@/constants';
import type { CameraRenderHandle, EntityRenderHandle, PlayerRenderHandle } from '@/engine/types';
import type { LevelDef } from '@/levels/types';
import type { Size } from '@/types';

import { Character } from './Character';
import { EntityNode } from './EntityNode';

interface LevelRendererProps {
  size: Size;
  level: LevelDef;
  theme: WorldTheme;
  camera: CameraRenderHandle;
  player: PlayerRenderHandle;
  entities: EntityRenderHandle[];
}

const GRID = 80;

export const LevelRenderer = memo(function LevelRenderer({
  size,
  level,
  theme,
  camera,
  player,
  entities,
}: LevelRendererProps) {
  const worldTransform = useDerivedValue(() => [
    { translateX: -camera.x.value },
    { translateY: -camera.y.value },
  ]);

  const grid = useMemo(() => {
    const lines: { x: number; y: number; w: number; h: number }[] = [];
    for (let x = 0; x <= level.size.width; x += GRID) {
      lines.push({ x, y: 0, w: 1, h: level.size.height });
    }
    for (let y = 0; y <= level.size.height; y += GRID) {
      lines.push({ x: 0, y, w: level.size.width, h: 1 });
    }
    return lines;
  }, [level.size.width, level.size.height]);

  const goal = level.goal;

  return (
    <Canvas style={{ width: size.width, height: size.height }}>
      <Fill color={theme.background} />

      <Group transform={worldTransform}>
        {/* parallax grid */}
        {grid.map((l, i) => (
          <RoundedRect key={`g${i}`} x={l.x} y={l.y} width={l.w} height={l.h} r={0} color={theme.backgroundGrid} opacity={0.5} />
        ))}

        {/* goal portal */}
        <RoundedRect x={goal.x - 6} y={goal.y - 6} width={goal.width + 12} height={goal.height + 12} r={12} color={theme.goal} opacity={0.22} />
        <RoundedRect x={goal.x} y={goal.y} width={goal.width} height={goal.height} r={10} color={theme.goal} opacity={0.18} />
        <RoundedRect x={goal.x} y={goal.y} width={goal.width} height={goal.height} r={10} color={theme.goal} style="stroke" strokeWidth={3} />

        {/* entities */}
        {entities.map((e) => (
          <EntityNode key={e.id} handle={e} theme={theme} />
        ))}

        {/* player */}
        <Character player={player} accent={theme.accent} />
      </Group>
    </Canvas>
  );
});
