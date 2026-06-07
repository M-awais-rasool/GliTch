/**
 * Playable view: engine + renderer + controls + HUD + overlays for one level.
 * Mounted with a `key={levelId}` by GameScreen, so each level gets a fresh
 * engine and everything tears down cleanly on exit / level change.
 */

import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { nextLevelId } from '@/levels/registry';
import { useGameStore } from '@/store/gameStore';
import { useLevelEngine } from '@/hooks/useLevelEngine';
import type { Size } from '@/types';

import { Controls } from './Controls';
import { HUD } from './HUD';
import { LevelCompleteOverlay } from './LevelCompleteOverlay';
import { LevelRenderer } from './LevelRenderer';

interface GameViewProps {
  levelId: string;
  size: Size;
  onExit: () => void;
  onNext: (nextId: string) => void;
}

export const GameView = memo(function GameView({ levelId, size, onExit, onNext }: GameViewProps) {
  const { engine, input, restart } = useLevelEngine(levelId, size);
  const status = useGameStore((s) => s.status);
  const currentLevelId = useGameStore((s) => s.currentLevelId);

  const level = engine.level;
  const theme = level.theme;
  const next = nextLevelId(level.id);

  // Gate on the level id too, so a stale 'complete' status from the previous
  // level can't flash this level's overlay before startLevel runs.
  const showComplete = status === 'complete' && currentLevelId === level.id;

  return (
    <View style={StyleSheet.absoluteFill}>
      <LevelRenderer
        size={size}
        level={level}
        theme={theme}
        camera={engine.cameraHandle}
        player={engine.player}
        entities={engine.entities}
      />

      <Controls input={input} accent={theme.accent} />

      <HUD onExit={onExit} levelId={level.id} levelName={level.name} hint={level.hint} />

      {showComplete ? (
        <LevelCompleteOverlay
          hasNext={next !== null}
          onNext={() => next && onNext(next)}
          onRetry={restart}
          onMenu={onExit}
        />
      ) : null}
    </View>
  );
});
