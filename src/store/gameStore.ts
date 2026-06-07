/**
 * Game + progression state (React-facing). NOT touched on the physics hot path:
 * the engine keeps live position in shared values and only calls in on status
 * transitions (running/dead/complete), a death-count bump, and completion.
 *
 * Progression is in-memory this pass; persisting `completed`/`unlocked` to
 * AsyncStorage is a small follow-up.
 */

import { create } from 'zustand';

import type { LevelResult } from '@/engine/types';
import { FIRST_LEVEL_ID, nextLevelId } from '@/levels/registry';
import type { GameStatus } from '@/types';

interface GameStore {
  status: GameStatus;
  deaths: number;
  currentLevelId: string | null;
  /** Best result per completed level (fewest deaths). */
  completed: Record<string, LevelResult>;
  /** Level ids the player may enter. */
  unlocked: string[];
  /** Result of the most recent completion (for the overlay). */
  lastResult: LevelResult | null;

  setStatus: (status: GameStatus) => void;
  setDeaths: (deaths: number) => void;
  startLevel: (id: string) => void;
  completeLevel: (id: string, result: LevelResult) => void;
  isUnlocked: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  status: 'idle',
  deaths: 0,
  currentLevelId: null,
  completed: {},
  unlocked: [FIRST_LEVEL_ID],
  lastResult: null,

  setStatus: (status) => set({ status }),
  setDeaths: (deaths) => set({ deaths }),

  startLevel: (id) => set({ status: 'running', deaths: 0, currentLevelId: id, lastResult: null }),

  completeLevel: (id, result) =>
    set((st) => {
      const completed = { ...st.completed };
      const prev = completed[id];
      completed[id] = prev && prev.deaths <= result.deaths ? prev : result;

      const next = nextLevelId(id);
      const unlocked = next && !st.unlocked.includes(next) ? [...st.unlocked, next] : st.unlocked;

      return { status: 'complete', completed, unlocked, lastResult: result };
    }),

  isUnlocked: (id) => get().unlocked.includes(id),
  isCompleted: (id) => Boolean(get().completed[id]),
}));
