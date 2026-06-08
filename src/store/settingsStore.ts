/**
 * Player settings. Separated from game state so it can later be persisted
 * (AsyncStorage / cloud save) independently of a play session. The haptics flag
 * is mirrored into the plain `haptics` service so engine code (no React) honours
 * it without importing the store.
 */

import { create } from 'zustand';

import { setHapticsEnabled } from '@/services/haptics';

interface SettingsStore {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;

  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHaptics: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  toggleHaptics: () =>
    set((s) => {
      const next = !s.hapticsEnabled;
      setHapticsEnabled(next);
      return { hapticsEnabled: next };
    }),
}));
