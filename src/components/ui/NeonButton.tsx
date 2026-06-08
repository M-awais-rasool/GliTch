/**
 * Reusable neon button — the single button primitive for the whole UI.
 *
 * Glow is achieved with native shadow (iOS) + elevation (Android) tinted to the
 * accent colour. `solid` fills with the colour (dark label); `outline` is a
 * glowing bordered pill (coloured label). Memoised because menus re-render
 * rarely and props are stable.
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { FontSize, GlitchColors, Palette, Radius, Spacing } from '@/constants';
import { hapticSelect } from '@/services/haptics';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  variant?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export const NeonButton = memo(function NeonButton({
  label,
  onPress,
  color = GlitchColors.blue,
  variant = 'outline',
  style,
}: NeonButtonProps) {
  const isSolid = variant === 'solid';
  return (
    <Pressable
      onPress={() => {
        hapticSelect();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        isSolid ? { backgroundColor: color } : { borderColor: color, borderWidth: 2 },
        { shadowColor: color },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { color: isSolid ? Palette.black : color }]}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    minWidth: 220,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    // Neon glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 8,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
