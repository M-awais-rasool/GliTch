/**
 * React bridge to the GameEngine for one level.
 *
 * Creates the InputState and the engine (lazily, so its render handles exist on
 * the first paint), starts the loop on mount and disposes on unmount. The
 * GameView is keyed by levelId, so switching levels remounts this cleanly — the
 * engine is never reused across levels.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { GameEngine } from '@/engine/GameEngine';
import { InputState } from '@/input/InputState';
import { getLevel } from '@/levels/registry';
import { useGameStore } from '@/store/gameStore';
import type { Size } from '@/types';

export interface UseLevelEngineResult {
  engine: GameEngine;
  input: InputState;
  restart: () => void;
}

export function useLevelEngine(levelId: string, viewport: Size): UseLevelEngineResult {
  const level = useMemo(() => {
    const l = getLevel(levelId);
    if (!l) throw new Error(`Unknown level: ${levelId}`);
    return l;
  }, [levelId]);

  const inputRef = useRef<InputState | null>(null);
  if (inputRef.current === null) inputRef.current = new InputState();

  const setStatus = useGameStore((s) => s.setStatus);
  const setDeaths = useGameStore((s) => s.setDeaths);
  const startLevel = useGameStore((s) => s.startLevel);
  const completeLevel = useGameStore((s) => s.completeLevel);

  // Lazy-init so handles are available on first render. Disposed in the effect
  // cleanup, which also makes this StrictMode mount/unmount/mount safe.
  const engineRef = useRef<GameEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new GameEngine(viewport, level, inputRef.current, {
      onStatusChange: setStatus,
      onDeaths: setDeaths,
      onComplete: (result) => completeLevel(level.id, result),
    });
  }

  // Layout effect so the store status flips to 'running' before first paint —
  // prevents a one-frame flash of the previous level's complete overlay.
  useLayoutEffect(() => {
    const engine = engineRef.current!;
    startLevel(level.id);
    engine.start();
    return () => {
      engine.dispose();
      engineRef.current = null;
      inputRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setViewport(viewport);
  }, [viewport.width, viewport.height]);

  const restart = useCallback(() => engineRef.current?.restart(), []);

  return { engine: engineRef.current!, input: inputRef.current!, restart };
}
