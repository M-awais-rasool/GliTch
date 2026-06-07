/**
 * Level registry — the one place that knows the journey order.
 *
 * To ADD A LEVEL: create `defs/levelNN.ts` (copy an existing one) and add it to
 * the `LEVELS` array below. Nothing else needs to change — the level-select map,
 * unlock logic, "next level" and the engine all read from here.
 */

import type { LevelDef } from './types';
import { level01 } from './defs/level01';
import { level02 } from './defs/level02';
import { level03 } from './defs/level03';
import { level04 } from './defs/level04';
import { level05 } from './defs/level05';
import { level06 } from './defs/level06';
import { level07 } from './defs/level07';
import { level08 } from './defs/level08';
import { level09 } from './defs/level09';
import { level10 } from './defs/level10';

/** Ordered journey. Append new levels here. */
export const LEVELS: LevelDef[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
];

export const TOTAL_LEVELS = LEVELS.length;

const LEVELS_BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function getLevel(id: string): LevelDef | undefined {
  return LEVELS_BY_ID.get(id);
}

export const FIRST_LEVEL_ID = LEVELS[0].id;

/** Next level in journey order, or null if this was the last. */
export function nextLevelId(id: string): string | null {
  const i = LEVELS.findIndex((l) => l.id === id);
  if (i < 0 || i >= LEVELS.length - 1) return null;
  return LEVELS[i + 1].id;
}
