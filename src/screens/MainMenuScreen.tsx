/**
 * Main menu — landscape, minimal dark neon. Brand on the left, actions on the
 * right so it reads well in the wide aspect ratio.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NeonButton } from '@/components/ui/NeonButton';
import { FontSize, GlitchColors, Palette, Spacing } from '@/constants';
import { FIRST_LEVEL_ID } from '@/levels/registry';
import type { RootStackParamList } from '@/navigation/types';
import { useSettingsStore } from '@/store/settingsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const haptics = useSettingsStore((s) => s.hapticsEnabled);
  const toggleHaptics = useSettingsStore((s) => s.toggleHaptics);

  return (
    <View
      style={[
        styles.root,
        { paddingLeft: insets.left + Spacing.xxl, paddingRight: insets.right + Spacing.xxl },
      ]}
    >
      <View style={styles.brand}>
        <Text style={styles.title}>GLITCH</Text>
        <Text style={styles.subtitle}>move · jump · don't trust the floor</Text>
      </View>

      <View style={styles.menu}>
        <NeonButton
          label="PLAY"
          variant="solid"
          color={GlitchColors.green}
          style={styles.button}
          onPress={() => navigation.navigate('LevelSelect')}
        />
        <NeonButton
          label="QUICK START"
          color={GlitchColors.blue}
          style={styles.button}
          onPress={() => navigation.navigate('Game', { levelId: FIRST_LEVEL_ID })}
        />
        <Pressable hitSlop={10} onPress={toggleHaptics} style={styles.toggle}>
          <Text style={styles.toggleText}>HAPTICS: {haptics ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flex: 1,
  },
  title: {
    color: Palette.player,
    fontSize: FontSize.hero,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: GlitchColors.blue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  subtitle: {
    marginTop: Spacing.sm,
    color: Palette.textSecondary,
    fontSize: FontSize.body,
    letterSpacing: 3,
  },
  menu: {
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  button: {
    minWidth: 240,
  },
  toggle: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  toggleText: {
    color: Palette.textMuted,
    fontSize: FontSize.caption,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

