/**
 * On-screen controls for landscape: LEFT / RIGHT (bottom-left) + JUMP
 * (bottom-right). Each button is its own GestureDetector using the low-level
 * touch-callback pattern (a never-activating LongPress carrier) — the same
 * iOS-reliable approach we validated for the old jump. Separate detectors
 * recognise concurrently, giving true multi-touch (hold LEFT while tapping
 * JUMP). Presses write to the shared InputState (no React state on the hot
 * path); a tiny local `pressed` flag only drives the button's highlight.
 */

import { memo, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONTROL, Palette, Radius } from '@/constants';
import type { InputState } from '@/input/InputState';

interface ControlsProps {
  input: InputState;
  accent: string;
}

interface ControlButtonProps {
  size: number;
  accent: string;
  glyph: string;
  onDown: () => void;
  onUp: () => void;
  style?: StyleProp<ViewStyle>;
}

function ControlButton({ size, accent, glyph, onDown, onUp, style }: ControlButtonProps) {
  const [pressed, setPressed] = useState(false);

  const gesture = Gesture.LongPress()
    .minDuration(Number.MAX_SAFE_INTEGER)
    .maxDistance(Number.MAX_SAFE_INTEGER)
    .shouldCancelWhenOutside(false)
    .runOnJS(true)
    .onTouchesDown(() => {
      setPressed(true);
      onDown();
    })
    .onTouchesUp(() => {
      setPressed(false);
      onUp();
    })
    .onTouchesCancelled(() => {
      setPressed(false);
      onUp();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: accent,
            shadowColor: accent,
            opacity: pressed ? CONTROL.pressedOpacity : CONTROL.restOpacity,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
          style,
        ]}
      >
        <Text style={[styles.glyph, { color: accent, fontSize: size * 0.42 }]}>{glyph}</Text>
      </View>
    </GestureDetector>
  );
}

export const Controls = memo(function Controls({ input, accent }: ControlsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={[
          styles.cluster,
          { left: insets.left + CONTROL.margin, bottom: insets.bottom + CONTROL.margin },
        ]}
      >
        <ControlButton
          size={CONTROL.dirSize}
          accent={accent}
          glyph="‹"
          onDown={() => input.setLeft(true)}
          onUp={() => input.setLeft(false)}
        />
        <ControlButton
          size={CONTROL.dirSize}
          accent={accent}
          glyph="›"
          style={{ marginLeft: CONTROL.dirGap }}
          onDown={() => input.setRight(true)}
          onUp={() => input.setRight(false)}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.jump,
          { right: insets.right + CONTROL.margin, bottom: insets.bottom + CONTROL.margin },
        ]}
      >
        <ControlButton
          size={CONTROL.jumpSize}
          accent={accent}
          glyph="⤴"
          onDown={() => input.setJump(true)}
          onUp={() => input.setJump(false)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cluster: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  jump: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.backgroundElevated,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 6,
  },
  glyph: {
    fontWeight: '900',
    marginTop: -2,
  },
});
