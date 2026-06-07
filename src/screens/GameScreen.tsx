/**
 * Game screen wrapper. Defers mounting the engine-backed GameView until layout
 * has a real pixel size (camera + Skia canvas need concrete dimensions). The
 * size is captured once and frozen; GameView is keyed by levelId so advancing /
 * retrying a level remounts the engine cleanly.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { GameView } from '@/components/game/GameView';
import { Palette } from '@/constants';
import type { RootStackParamList } from '@/navigation/types';
import type { Size } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ route, navigation }: Props) {
  const levelId = route.params.levelId;
  const [size, setSize] = useState<Size | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => prev ?? { width, height });
  }, []);

  const exit = useCallback(() => navigation.navigate('LevelSelect'), [navigation]);
  const goNext = useCallback(
    (nextId: string) => navigation.replace('Game', { levelId: nextId }),
    [navigation],
  );

  return (
    <View style={styles.root} onLayout={onLayout}>
      {size ? (
        <GameView key={levelId} levelId={levelId} size={size} onExit={exit} onNext={goNext} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.black,
  },
});
