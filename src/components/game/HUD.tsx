/**
 * In-game HUD (landscape): level name + hint on the left, death counter and a
 * pause/exit control on the right. `box-none` lets play-area touches fall
 * through to the controls; the death count comes from the throttled store so
 * this never re-renders on the physics frame.
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, Palette, Radius, Spacing } from '@/constants';
import { useGameStore } from '@/store/gameStore';

interface HUDProps {
  onExit: () => void;
  levelName: string;
  levelId: string;
  hint?: string;
}

export const HUD = memo(function HUD({ onExit, levelName, levelId, hint }: HUDProps) {
  const insets = useSafeAreaInsets();
  const deaths = useGameStore((s) => s.deaths);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        {
          paddingTop: insets.top + Spacing.sm,
          paddingLeft: insets.left + Spacing.lg,
          paddingRight: insets.right + Spacing.lg,
        },
      ]}
    >
      <View pointerEvents="none" style={styles.left}>
        <Text style={styles.level}>
          {levelId}  {levelName}
        </Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.deaths}>✕ {deaths}</Text>
        <Pressable hitSlop={14} onPress={onExit} style={styles.pause}>
          <View style={styles.bar} />
          <View style={styles.bar} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {},
  level: {
    color: Palette.textPrimary,
    fontSize: FontSize.body,
    fontWeight: '800',
    letterSpacing: 2,
  },
  hint: {
    color: Palette.textSecondary,
    fontSize: FontSize.caption,
    letterSpacing: 1,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deaths: {
    color: Palette.danger,
    fontSize: FontSize.title,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pause: {
    flexDirection: 'row',
    gap: 5,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  bar: {
    width: 5,
    height: 20,
    borderRadius: 2,
    backgroundColor: Palette.textSecondary,
  },
});
