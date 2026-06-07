/**
 * Central level registry: worlds, flat ordering, lookup and progression order.
 * World 1 is authored this pass; Worlds 2–5 are added here next pass (same
 * shape), and Level Select / unlock logic pick them up automatically.
 */

import { WORLD_THEMES, type WorldTheme } from '@/constants';

import type { LevelDef, WorldDef } from './types';
import { level11, level12, level13 } from './world1';

const world1: WorldDef = {
  world: 1,
  name: WORLD_THEMES[1].name,
  theme: WORLD_THEMES[1],
  levels: [level11, level12, level13],
};

export const WORLDS: WorldDef[] = [world1];

/** All levels in play order. */
export const LEVELS: LevelDef[] = WORLDS.flatMap((w) => w.levels);

const LEVELS_BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function getLevel(id: string): LevelDef | undefined {
  return LEVELS_BY_ID.get(id);
}

export function getWorldTheme(world: number): WorldTheme {
  return WORLD_THEMES[world] ?? WORLD_THEMES[1];
}

export const FIRST_LEVEL_ID = LEVELS[0].id;

/** Next level in global order, or null if this was the last. */
export function nextLevelId(id: string): string | null {
  const i = LEVELS.findIndex((l) => l.id === id);
  if (i < 0 || i >= LEVELS.length - 1) return null;
  return LEVELS[i + 1].id;
}
