/**
 * Renders a single level entity from its EntityRenderHandle.
 *
 * Dispatches to a small per-kind component so each has unconditional hooks
 * (no rules-of-hooks gymnastics). Static geometry (spike teeth, saw blade) is
 * built once with useMemo; live transforms (position, rotation, spike
 * extension, fade) are Reanimated derived values, so entities animate on the UI
 * thread with zero React re-renders.
 */

import { Circle, Group, Path, RoundedRect } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import type { WorldTheme } from '@/constants';
import type { EntityRenderHandle } from '@/engine/types';

interface NodeProps {
  handle: EntityRenderHandle;
  theme: WorldTheme;
}

function bladePath(radius: number): string {
  const teeth = 8;
  const inner = radius * 0.68;
  const total = teeth * 2;
  let d = '';
  for (let k = 0; k < total; k += 1) {
    const ang = (k / total) * Math.PI * 2;
    const r = k % 2 === 0 ? radius : inner;
    d += `${k === 0 ? 'M' : 'L'} ${(Math.cos(ang) * r).toFixed(2)} ${(Math.sin(ang) * r).toFixed(2)} `;
  }
  return `${d}Z`;
}

function spikePath(width: number, height: number): string {
  const tooth = 12;
  const n = Math.max(1, Math.round(width / tooth));
  const step = width / n;
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const x0 = i * step;
    d += `M ${x0.toFixed(2)} 0 L ${(x0 + step / 2).toFixed(2)} ${height} L ${(x0 + step).toFixed(2)} 0 Z `;
  }
  return d;
}

const SpikesNode = memo(function SpikesNode({ handle, theme }: NodeProps) {
  const path = useMemo(() => spikePath(handle.width, handle.height), [handle.width, handle.height]);
  const transform = useDerivedValue(() => [
    { translateX: handle.x.value },
    { translateY: handle.y.value + handle.height }, // base at bottom
    { scaleY: -Math.max(0.001, handle.extra.value) }, // rises by extension
  ]);
  return (
    <Group transform={transform}>
      <Path path={path} color={theme.hazard} opacity={handle.alpha} />
    </Group>
  );
});

const SawNode = memo(function SawNode({ handle, theme }: NodeProps) {
  const r = handle.width / 2;
  const blade = useMemo(() => bladePath(r), [r]);
  const transform = useDerivedValue(() => [
    { translateX: handle.x.value + r },
    { translateY: handle.y.value + r },
    { rotate: handle.angle.value },
  ]);
  return (
    <Group transform={transform}>
      <Path path={blade} color={theme.hazard} />
      <Circle cx={0} cy={0} r={r * 0.5} color={theme.background} />
      <Circle cx={0} cy={0} r={r * 0.18} color={theme.hazard} />
    </Group>
  );
});

const BlockNode = memo(function BlockNode({ handle, theme }: NodeProps) {
  const heavy = handle.kind === 'fallingBlock' || handle.kind === 'crusher';
  const bodyColor = heavy ? theme.platformEdge : theme.platform;
  const edgeColor = heavy ? theme.hazard : theme.platformEdge;
  const warnOpacity = useDerivedValue(() =>
    handle.kind === 'crumblePlatform' ? handle.extra.value * 0.55 : 0,
  );
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color={bodyColor} opacity={handle.alpha} />
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={3} r={2} color={edgeColor} opacity={handle.alpha} />
      {handle.kind === 'crumblePlatform' ? (
        <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color={theme.hazard} opacity={warnOpacity} />
      ) : null}
    </Group>
  );
});

const ConveyorNode = memo(function ConveyorNode({ handle, theme }: NodeProps) {
  const sign = handle.dir === 'left' ? -1 : 1;
  const chevrons = useMemo(() => {
    const cy = handle.height / 2;
    const xs: string[] = [];
    const gap = 26;
    for (let cx = 14; cx < handle.width - 6; cx += gap) {
      xs.push(
        sign > 0
          ? `M ${cx} ${cy - 5} L ${cx + 7} ${cy} L ${cx} ${cy + 5}`
          : `M ${cx + 7} ${cy - 5} L ${cx} ${cy} L ${cx + 7} ${cy + 5}`,
      );
    }
    return xs.join(' ');
  }, [handle.width, handle.height, sign]);
  const chevronTransform = useDerivedValue(() => [
    { translateX: handle.x.value },
    { translateY: handle.y.value },
  ]);
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color={theme.platform} />
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={3} r={2} color={theme.accent} />
      <Group transform={chevronTransform}>
        <Path path={chevrons} color={theme.accent} style="stroke" strokeWidth={2.5} opacity={0.8} />
      </Group>
    </Group>
  );
});

const BouncePadNode = memo(function BouncePadNode({ handle, theme }: NodeProps) {
  const capY = useDerivedValue(() => handle.y.value + handle.extra.value * 4);
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color={theme.platformEdge} />
      <RoundedRect x={handle.x} y={capY} width={handle.width} height={7} r={5} color={theme.accent} />
    </Group>
  );
});

const PhaseNode = memo(function PhaseNode({ handle, theme }: NodeProps) {
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color={theme.platform} opacity={handle.alpha} />
      <RoundedRect
        x={handle.x}
        y={handle.y}
        width={handle.width}
        height={handle.height}
        r={5}
        color={theme.accent}
        style="stroke"
        strokeWidth={2}
        opacity={handle.alpha}
      />
    </Group>
  );
});

const LaserNode = memo(function LaserNode({ handle, theme }: NodeProps) {
  const horizontal = handle.width >= handle.height;
  const r = Math.min(handle.width, handle.height) / 2 + 3;
  const e1x = useDerivedValue(() => handle.x.value + (horizontal ? 0 : handle.width / 2));
  const e1y = useDerivedValue(() => handle.y.value + (horizontal ? handle.height / 2 : 0));
  const e2x = useDerivedValue(() => handle.x.value + (horizontal ? handle.width : handle.width / 2));
  const e2y = useDerivedValue(() => handle.y.value + (horizontal ? handle.height / 2 : handle.height));
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={3} color={theme.hazard} opacity={handle.alpha} />
      <Circle cx={e1x} cy={e1y} r={r} color={theme.accent} />
      <Circle cx={e2x} cy={e2y} r={r} color={theme.accent} />
    </Group>
  );
});

export const EntityNode = memo(function EntityNode({ handle, theme }: NodeProps) {
  switch (handle.kind) {
    case 'spike':
    case 'hiddenSpike':
      return <SpikesNode handle={handle} theme={theme} />;
    case 'saw':
      return <SawNode handle={handle} theme={theme} />;
    case 'conveyor':
      return <ConveyorNode handle={handle} theme={theme} />;
    case 'bouncePad':
      return <BouncePadNode handle={handle} theme={theme} />;
    case 'phasePlatform':
      return <PhaseNode handle={handle} theme={theme} />;
    case 'laser':
      return <LaserNode handle={handle} theme={theme} />;
    default:
      return <BlockNode handle={handle} theme={theme} />;
  }
});
