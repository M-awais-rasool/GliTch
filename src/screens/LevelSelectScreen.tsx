/**
 * Level Select — a premium, animated journey map (replaces the flat grid).
 *
 * A serpentine path winds through the 10 levels. The path is drawn in Skia
 * (glowing solid for cleared segments, dim dashed for the road ahead) with
 * per-node colour halos and a parallax grid; the interactive, animated nodes sit
 * on top as Reanimated views. The map scrolls horizontally and opens centred on
 * the player's current level.
 *
 * Fully data-driven: it renders whatever is in `LEVELS`, so new levels appear
 * here automatically with no changes to this screen.
 */

import { Canvas, Circle, DashPathEffect, Fill, Path, RoundedRect } from '@shopify/react-native-skia';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LevelMapNode, type MapNode } from '@/components/levelmap/LevelMapNode';
import { FontSize, Palette, Spacing } from '@/constants';
import { LEVELS, TOTAL_LEVELS } from '@/levels/registry';
import type { RootStackParamList } from '@/navigation/types';
import { useGameStore } from '@/store/gameStore';
import { clamp } from '@/utils/math';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

const START_X = 150;
const SPACING_X = 200;

function segmentPath(a: MapNode, b: MapNode): string {
  const dx = (b.x - a.x) * 0.5;
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

export function LevelSelectScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const unlocked = useGameStore((s) => s.unlocked);
  const completed = useGameStore((s) => s.completed);
  const scrollRef = useRef<ScrollView>(null);

  const mapWidth = START_X * 2 + (TOTAL_LEVELS - 1) * SPACING_X;

  const nodes = useMemo<MapNode[]>(() => {
    const midY = winH * 0.52;
    const amp = Math.min(winH * 0.2, 110);
    // current = first unlocked-but-not-completed, else last level
    let currentIdx = LEVELS.findIndex((l) => unlocked.includes(l.id) && !completed[l.id]);
    if (currentIdx < 0) currentIdx = LEVELS.length - 1;

    return LEVELS.map((l, i) => ({
      id: l.id,
      index: i,
      label: l.id,
      x: START_X + i * SPACING_X,
      y: midY + amp * Math.sin(i * 0.8),
      accent: l.theme.accent,
      locked: !unlocked.includes(l.id),
      completed: Boolean(completed[l.id]),
      current: i === currentIdx,
    }));
  }, [unlocked, completed, winH]);

  const segments = useMemo(
    () =>
      nodes.slice(0, -1).map((a, i) => ({
        path: segmentPath(a, nodes[i + 1]),
        lit: Boolean(completed[a.id]),
        color: a.accent,
      })),
    [nodes, completed],
  );

  const grid = useMemo(() => {
    const lines: number[] = [];
    for (let x = 0; x <= mapWidth; x += 90) lines.push(x);
    return lines;
  }, [mapWidth]);

  const current = nodes.find((n) => n.current) ?? nodes[0];
  const initialX = clamp(current.x - winW / 2, 0, Math.max(0, mapWidth - winW));
  const doneCount = LEVELS.filter((l) => completed[l.id]).length;

  const open = (id: string) => navigation.navigate('Game', { levelId: id });

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: initialX, y: 0 }}
        contentContainerStyle={{ width: mapWidth, height: winH }}
      >
        <View style={{ width: mapWidth, height: winH }}>
          <Canvas style={{ width: mapWidth, height: winH }}>
            <Fill color={Palette.background} />
            {grid.map((x) => (
              <RoundedRect key={`v${x}`} x={x} y={0} width={1} height={winH} r={0} color={Palette.backgroundElevated} opacity={0.5} />
            ))}

            {/* glow halos behind nodes */}
            {nodes.map((n) => (
              <Circle key={`h${n.id}`} cx={n.x} cy={n.y} r={46} color={n.locked ? Palette.textMuted : n.accent} opacity={n.locked ? 0.06 : 0.16} />
            ))}

            {/* path segments: lit = solid glow, ahead = dim dashed */}
            {segments.map((s, i) => (
              <Path
                key={`s${i}`}
                path={s.path}
                style="stroke"
                strokeWidth={s.lit ? 6 : 4}
                strokeJoin="round"
                strokeCap="round"
                color={s.lit ? s.color : Palette.textMuted}
                opacity={s.lit ? 0.95 : 0.5}
              >
                {s.lit ? null : <DashPathEffect intervals={[10, 12]} />}
              </Path>
            ))}
          </Canvas>

          {nodes.map((n) => (
            <LevelMapNode key={n.id} node={n} onPress={open} />
          ))}
        </View>
      </ScrollView>

      {/* fixed header */}
      <View
        pointerEvents="box-none"
        style={[styles.header, { paddingTop: insets.top + Spacing.sm, paddingHorizontal: insets.left + Spacing.lg }]}
      >
        <Pressable hitSlop={14} onPress={() => navigation.navigate('MainMenu')}>
          <Text style={styles.back}>‹ MENU</Text>
        </Pressable>
        <Text style={styles.title}>JOURNEY</Text>
        <Text style={styles.progress}>
          {doneCount}/{TOTAL_LEVELS}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { color: Palette.textSecondary, fontSize: FontSize.body, fontWeight: '800', letterSpacing: 2 },
  title: { color: Palette.textPrimary, fontSize: FontSize.title, fontWeight: '900', letterSpacing: 4 },
  progress: { color: Palette.textSecondary, fontSize: FontSize.body, fontWeight: '900', letterSpacing: 2 },
});
