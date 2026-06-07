/**
 * Level select — landscape. Worlds stacked vertically, each a row of level
 * tiles. Locked levels are dimmed; completed levels show a check + best death
 * count. World 1 is playable now; future worlds appear automatically from the
 * registry (and start locked).
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, Palette, Radius, Spacing } from '@/constants';
import { WORLDS } from '@/levels/registry';
import type { LevelDef, WorldDef } from '@/levels/types';
import type { RootStackParamList } from '@/navigation/types';
import { useGameStore } from '@/store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export function LevelSelectScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const unlocked = useGameStore((s) => s.unlocked);
  const completed = useGameStore((s) => s.completed);

  const open = (level: LevelDef) => {
    if (unlocked.includes(level.id)) navigation.navigate('Game', { levelId: level.id });
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm, paddingLeft: insets.left + Spacing.lg },
        ]}
      >
        <Pressable hitSlop={12} onPress={() => navigation.navigate('MainMenu')}>
          <Text style={styles.back}>‹ BACK</Text>
        </Pressable>
        <Text style={styles.title}>SELECT LEVEL</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingLeft: insets.left + Spacing.lg, paddingRight: insets.right + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        {WORLDS.map((world) => (
          <WorldRow
            key={world.world}
            world={world}
            unlocked={unlocked}
            completed={completed}
            onOpen={open}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function WorldRow({
  world,
  unlocked,
  completed,
  onOpen,
}: {
  world: WorldDef;
  unlocked: string[];
  completed: Record<string, { deaths: number; timeMs: number }>;
  onOpen: (level: LevelDef) => void;
}) {
  return (
    <View style={styles.world}>
      <Text style={[styles.worldName, { color: world.theme.accent }]}>
        WORLD {world.world} · {world.name}
      </Text>
      <View style={styles.tiles}>
        {world.levels.map((level) => {
          const isUnlocked = unlocked.includes(level.id);
          const done = completed[level.id];
          return (
            <Pressable
              key={level.id}
              disabled={!isUnlocked}
              onPress={() => onOpen(level)}
              style={[
                styles.tile,
                { borderColor: isUnlocked ? world.theme.accent : Palette.textMuted, shadowColor: world.theme.accent },
                !isUnlocked && styles.tileLocked,
              ]}
            >
              <Text style={[styles.tileId, { color: isUnlocked ? Palette.textPrimary : Palette.textMuted }]}>
                {level.id}
              </Text>
              <Text style={[styles.tileName, { color: isUnlocked ? world.theme.accent : Palette.textMuted }]} numberOfLines={1}>
                {isUnlocked ? level.name : 'LOCKED'}
              </Text>
              {done ? <Text style={styles.tileStat}>✓ {done.deaths}✕</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  back: { color: Palette.textSecondary, fontSize: FontSize.body, fontWeight: '800', letterSpacing: 2 },
  title: { color: Palette.textPrimary, fontSize: FontSize.title, fontWeight: '900', letterSpacing: 3 },
  content: { paddingTop: Spacing.sm, gap: Spacing.lg },
  world: { gap: Spacing.sm },
  worldName: { fontSize: FontSize.body, fontWeight: '900', letterSpacing: 3 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  tile: {
    width: 130,
    height: 92,
    borderRadius: Radius.md,
    borderWidth: 2,
    backgroundColor: Palette.backgroundElevated,
    padding: Spacing.md,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  tileLocked: { opacity: 0.45, shadowOpacity: 0 },
  tileId: { fontSize: FontSize.title, fontWeight: '900', letterSpacing: 1 },
  tileName: { fontSize: FontSize.caption, fontWeight: '700', letterSpacing: 1 },
  tileStat: { color: Palette.textSecondary, fontSize: FontSize.caption, fontWeight: '700' },
});
