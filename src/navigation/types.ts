/**
 * Strongly-typed navigation graph (no Expo Router). Importing
 * `RootStackParamList` everywhere gives compile-time route/param checking.
 */

export type RootStackParamList = {
  MainMenu: undefined;
  LevelSelect: undefined;
  Game: { levelId: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
