/**
 * A single interactive node on the level-map path.
 *
 * Animations (all Reanimated, on the UI thread):
 *  - staggered entrance (scale + fade in, delayed by index)
 *  - press feedback (scale down)
 *  - the CURRENT node emits a repeating pulse ring
 * Visual state: completed (filled + check), current (bright, pulsing), unlocked
 * (accent ring), locked (dimmed + lock).
 */

import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { FontSize, Palette } from '@/constants';
import { hapticSelect } from '@/services/haptics';

export interface MapNode {
  id: string;
  index: number; // 0-based for stagger
  label: string;
  x: number;
  y: number;
  accent: string;
  locked: boolean;
  completed: boolean;
  current: boolean;
}

const SIZE = 60;
const RING = 92;

interface Props {
  node: MapNode;
  onPress: (id: string) => void;
}

export const LevelMapNode = memo(function LevelMapNode({ node, onPress }: Props) {
  const appear = useSharedValue(0);
  const press = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    appear.value = withDelay(node.index * 55, withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.4)) }));
    if (node.current) {
      pulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) }), -1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: (0.5 + 0.5 * appear.value) * (1 - 0.1 * press.value) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.55,
    transform: [{ scale: 0.7 + pulse.value * 0.9 }],
  }));

  const fill = node.completed ? node.accent : Palette.backgroundElevated;
  const border = node.locked ? Palette.textMuted : node.accent;
  const labelColor = node.completed ? Palette.black : node.locked ? Palette.textMuted : Palette.textPrimary;

  return (
    <Animated.View
      style={[styles.wrap, { left: node.x - RING / 2, top: node.y - RING / 2 }, containerStyle]}
      pointerEvents="box-none"
    >
      {node.current ? (
        <Animated.View style={[styles.pulse, { borderColor: node.accent }, ringStyle]} pointerEvents="none" />
      ) : null}

      <Pressable
        disabled={node.locked}
        onPressIn={() => (press.value = withTiming(1, { duration: 80 }))}
        onPressOut={() => (press.value = withTiming(0, { duration: 120 }))}
        onPress={() => {
          hapticSelect();
          onPress(node.id);
        }}
        style={[
          styles.node,
          { backgroundColor: fill, borderColor: border, shadowColor: node.accent, opacity: node.locked ? 0.5 : 1 },
        ]}
      >
        <Text style={[styles.label, { color: labelColor }]}>
          {node.completed ? '✓' : node.locked ? '🔒' : node.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
  },
  node: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },
  label: {
    fontSize: FontSize.title,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
