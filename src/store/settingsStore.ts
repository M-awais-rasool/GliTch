/**
 * Player settings. Separated from game state so it can later be persisted
 * (AsyncStorage / Supabase cloud save) independently of a play session.
 */

import { create } from 'zustand';

interface SettingsStore {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;

  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHaptics: () => void;
  set: (partial: Partial<Pick<SettingsStore, 'soundEnabled' | 'musicEnabled' | 'hapticsEnabled'>>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
  set: (partial) => set(partial),
}));
