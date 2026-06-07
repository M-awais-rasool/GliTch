/**
 * GLITCH visual identity: Minimal Dark Neon.
 *
 * `Palette` = stable base UI colours. `GlitchColors` = the five accent hues.
 * `WORLD_THEMES` gives each of the 5 worlds a distinct palette so every world
 * looks completely different (level requirement). World 1 is built this pass;
 * 2–5 themes are defined now so Level Select and future content can use them.
 */

export const Palette = {
  black: '#000000',
  background: '#05060A',
  backgroundElevated: '#0C0E14',
  player: '#FFFFFF',
  playerEye: '#05060A',
  textPrimary: '#FFFFFF',
  textSecondary: '#8A93A6',
  textMuted: '#4A5160',
  danger: '#FF4B6E',
  overlay: 'rgba(4,5,9,0.82)',
} as const;

export const GlitchColors = {
  purple: '#A14BFF',
  blue: '#3BA0FF',
  yellow: '#FFD23B',
  green: '#3BFF9E',
  pink: '#FF4B9E',
} as const;

export type GlitchColorKey = keyof typeof GlitchColors;
export const GLITCH_COLOR_KEYS = Object.keys(GlitchColors) as GlitchColorKey[];

/** Per-world look. Drives backgrounds, platforms, hazards and accents. */
export interface WorldTheme {
  name: string;
  key: GlitchColorKey;
  background: string;
  backgroundGrid: string;
  platform: string;
  platformEdge: string;
  hazard: string;
  accent: string;
  goal: string;
}

export const WORLD_THEMES: Record<number, WorldTheme> = {
  1: {
    name: 'CIRCUIT',
    key: 'blue',
    background: '#04070F',
    backgroundGrid: '#0C1E38',
    platform: '#15243C',
    platformEdge: '#2E6098',
    hazard: '#FF4B6E',
    accent: GlitchColors.blue,
    goal: GlitchColors.green,
  },
  2: {
    name: 'VOID',
    key: 'purple',
    background: '#0A0514',
    backgroundGrid: '#231041',
    platform: '#241634',
    platformEdge: '#6A3CB0',
    hazard: '#FF5BC0',
    accent: GlitchColors.purple,
    goal: GlitchColors.green,
  },
  3: {
    name: 'BLACKOUT',
    key: 'green',
    background: '#03100B',
    backgroundGrid: '#0A2A1D',
    platform: '#0F2A20',
    platformEdge: '#2C8A63',
    hazard: '#FF4B6E',
    accent: GlitchColors.green,
    goal: GlitchColors.yellow,
  },
  4: {
    name: 'FOUNDRY',
    key: 'yellow',
    background: '#0F0B03',
    backgroundGrid: '#2E2208',
    platform: '#2A2210',
    platformEdge: '#9A7A22',
    hazard: '#FF6A3B',
    accent: GlitchColors.yellow,
    goal: GlitchColors.green,
  },
  5: {
    name: 'OVERLOAD',
    key: 'pink',
    background: '#0E0410',
    backgroundGrid: '#34103A',
    platform: '#2A1030',
    platformEdge: '#B0367F',
    hazard: '#FF335E',
    accent: GlitchColors.pink,
    goal: GlitchColors.green,
  },
};

/** 4px base spacing scale. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const FontSize = {
  caption: 13,
  body: 16,
  title: 22,
  display: 40,
  hero: 64,
} as const;
