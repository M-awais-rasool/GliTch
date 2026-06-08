/**
 * Renders a single level entity from its EntityRenderHandle.
 *
 * Dispatches to a small per-kind component so each has unconditional hooks
 * (no rules-of-hooks gymnastics). Static geometry (spike teeth, saw blade) is
 * built once with useMemo; live transforms (position, rotation, spike
 * extension, fade) are Reanimated derived values, so entities animate on the UI
 * thread with zero React re-renders.
 */

import { Circle, Group, Line, Path, RoundedRect, vec } from '@shopify/react-native-skia';
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

/** Chevron path across `width`, pointing in `sign` (+1 right / -1 left), at `cy`. */
function chevronRow(width: number, cy: number, sign: number, gap = 26): string {
  const xs: string[] = [];
  for (let cx = 12; cx < width - 6; cx += gap) {
    xs.push(
      sign > 0
        ? `M ${cx} ${cy - 5} L ${cx + 7} ${cy} L ${cx} ${cy + 5}`
        : `M ${cx + 7} ${cy - 5} L ${cx} ${cy} L ${cx + 7} ${cy + 5}`,
    );
  }
  return xs.join(' ');
}

/** Upward chevron column for gravity zones. */
function chevronColumnUp(width: number, height: number, gap = 28): string {
  const xs: string[] = [];
  const cx = width / 2;
  for (let cy = height - 12; cy > 6; cy -= gap) {
    xs.push(`M ${cx - 6} ${cy} L ${cx} ${cy - 7} L ${cx + 6} ${cy}`);
  }
  return xs.join(' ');
}

const IceFloorNode = memo(function IceFloorNode({ handle, theme }: NodeProps) {
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color={theme.platform} />
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={4} r={2} color="#BFEFFF" />
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={5} color="#FFFFFF" opacity={0.07} />
    </Group>
  );
});

const ZoneNode = memo(function ZoneNode({ handle, theme }: NodeProps) {
  const arrows = useMemo(
    () =>
      handle.kind === 'gravityZone'
        ? chevronColumnUp(handle.width, handle.height)
        : chevronRow(handle.width, handle.height / 2, handle.dir === 'left' ? -1 : 1, 34),
    [handle.kind, handle.width, handle.height, handle.dir],
  );
  const transform = useDerivedValue(() => [{ translateX: handle.x.value }, { translateY: handle.y.value }]);
  return (
    <Group>
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={8} color={theme.accent} opacity={0.08} />
      <RoundedRect x={handle.x} y={handle.y} width={handle.width} height={handle.height} r={8} color={theme.accent} style="stroke" strokeWidth={1.5} opacity={0.35} />
      <Group transform={transform}>
        <Path path={arrows} color={theme.accent} style="stroke" strokeWidth={2} opacity={0.5} />
      </Group>
    </Group>
  );
});

const DashPadNode = memo(function DashPadNode({ handle, theme }: NodeProps) {
  const arrows = useMemo(
    () => chevronRow(handle.width, handle.height / 2, handle.dir === 'left' ? -1 : 1, 18),
    [handle.width, handle.height, handle.dir],
  );
  const transform = useDerivedValue(() => [{ translateX: handle.x.value }, { translateY: handle.y.value }]);
  const glow = useDerivedValue(() => 0.45 + 0.5 * handle.extra.value);
  return (
    <Group transform={transform}>
      <RoundedRect x={0} y={0} width={handle.width} height={handle.height} r={6} color={theme.accent} opacity={0.12} />
      <Path path={arrows} color={theme.accent} style="stroke" strokeWidth={3} opacity={glow} />
    </Group>
  );
});

const PortalNode = memo(function PortalNode({ handle, theme }: NodeProps) {
  const r = Math.min(handle.width, handle.height) / 2;
  const transform = useDerivedValue(() => [
    { translateX: handle.x.value + handle.width / 2 },
    { translateY: handle.y.value + handle.height / 2 },
    { rotate: handle.angle.value },
  ]);
  return (
    <Group>
      <Circle cx={handle.originX + handle.width / 2} cy={handle.originY + handle.height / 2} r={r + 4} color={theme.accent} opacity={0.18} />
      <Group transform={transform}>
        <Circle cx={0} cy={0} r={r} color={theme.accent} style="stroke" strokeWidth={4} />
        <Circle cx={0} cy={0} r={r * 0.6} color={theme.accent} style="stroke" strokeWidth={2} opacity={0.6} />
        <Circle cx={0} cy={-r} r={3} color={theme.accent} />
      </Group>
    </Group>
  );
});

const PendulumNode = memo(function PendulumNode({ handle, theme }: NodeProps) {
  const r = handle.width / 2;
  const blade = useMemo(() => bladePath(r), [r]);
  const pivot = vec(handle.originX + handle.width / 2, handle.originY + handle.height / 2);
  const bladeCenter = useDerivedValue(() => ({ x: handle.x.value + r, y: handle.y.value + r }));
  const transform = useDerivedValue(() => [
    { translateX: handle.x.value + r },
    { translateY: handle.y.value + r },
    { rotate: handle.angle.value },
  ]);
  return (
    <Group>
      <Line p1={pivot} p2={bladeCenter} color={theme.platformEdge} strokeWidth={3} />
      <Circle cx={pivot.x} cy={pivot.y} r={5} color={theme.platformEdge} />
      <Group transform={transform}>
        <Path path={blade} color={theme.hazard} />
        <Circle cx={0} cy={0} r={r * 0.5} color={theme.background} />
        <Circle cx={0} cy={0} r={r * 0.18} color={theme.hazard} />
      </Group>
    </Group>
  );
});

const ChaserNode = memo(function ChaserNode({ handle, theme }: NodeProps) {
  const teeth = useMemo(() => {
    const t = 22;
    const n = Math.max(1, Math.round(handle.height / t));
    const step = handle.height / n;
    let d = '';
    for (let i = 0; i < n; i += 1) {
      const y0 = i * step;
      d += `M ${handle.width} ${y0} L ${handle.width + 14} ${y0 + step / 2} L ${handle.width} ${y0 + step} Z `;
    }
    return d;
  }, [handle.width, handle.height]);
  const transform = useDerivedValue(() => [{ translateX: handle.x.value }, { translateY: handle.y.value }]);
  return (
    <Group transform={transform}>
      <RoundedRect x={-6} y={0} width={handle.width + 6} height={handle.height} r={3} color={theme.hazard} opacity={0.18} />
      <RoundedRect x={0} y={0} width={handle.width} height={handle.height} r={3} color={theme.hazard} opacity={0.9} />
      <Path path={teeth} color={theme.hazard} />
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
    case 'iceFloor':
      return <IceFloorNode handle={handle} theme={theme} />;
    case 'windZone':
    case 'gravityZone':
      return <ZoneNode handle={handle} theme={theme} />;
    case 'dashPad':
      return <DashPadNode handle={handle} theme={theme} />;
    case 'portal':
      return <PortalNode handle={handle} theme={theme} />;
    case 'pendulum':
      return <PendulumNode handle={handle} theme={theme} />;
    case 'chaser':
      return <ChaserNode handle={handle} theme={theme} />;
    default:
      return <BlockNode handle={handle} theme={theme} />;
  }
});
