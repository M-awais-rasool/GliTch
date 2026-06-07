/**
 * Shown when the level status is `complete`. Keeps the loop tight: NEXT advances
 * (when a next level exists), RETRY restarts the same engine instance instantly,
 * LEVELS returns to the level select.
 */

import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NeonButton } from '@/components/ui/NeonButton';
import { FontSize, GlitchColors, Palette, Spacing } from '@/constants';
import { useGameStore } from '@/store/gameStore';

interface LevelCompleteOverlayProps {
  hasNext: boolean;
  onNext: () => void;
  onRetry: () => void;
  onMenu: () => void;
}

export const LevelCompleteOverlay = memo(function LevelCompleteOverlay({
  hasNext,
  onNext,
  onRetry,
  onMenu,
}: LevelCompleteOverlayProps) {
  const result = useGameStore((s) => s.lastResult);
  const seconds = result ? (result.timeMs / 1000).toFixed(1) : '0.0';
  const deaths = result?.deaths ?? 0;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>LEVEL CLEAR</Text>
      <Text style={styles.stat}>
        {seconds}s · {deaths} {deaths === 1 ? 'death' : 'deaths'}
      </Text>

      <View style={styles.actions}>
        {hasNext ? (
          <NeonButton label="NEXT" variant="solid" color={GlitchColors.green} onPress={onNext} />
        ) : null}
        <NeonButton label="RETRY" color={GlitchColors.blue} onPress={onRetry} />
        <NeonButton label="LEVELS" color={GlitchColors.purple} onPress={onMenu} />
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
    bottom: 0,
    backgroundColor: Palette.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  title: {
    color: GlitchColors.green,
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: GlitchColors.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  stat: {
    color: Palette.textSecondary,
    fontSize: FontSize.body,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
});
