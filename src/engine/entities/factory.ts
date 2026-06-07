/**
 * Builds a concrete LevelEntity from its data descriptor. Exhaustive over the
 * EntityDef union (TS will flag any new entity type that isn't handled).
 */

import type Matter from 'matter-js';

import type { EntityDef } from '@/levels/types';

import type { LevelEntity } from './LevelEntity';
import { CrumblePlatform, FakePlatform, MovingPlatform, SolidPlatform } from './platforms';
import { Crusher, FallingBlock, HiddenSpike, Saw, Spike } from './hazards';

export function createEntity(def: EntityDef, index: number, world: Matter.World): LevelEntity {
  const id = `${def.type}-${index}`;
  switch (def.type) {
    case 'platform':
      return new SolidPlatform(world, id, def);
    case 'movingPlatform':
      return new MovingPlatform(world, id, def);
    case 'crumblePlatform':
      return new CrumblePlatform(world, id, def);
    case 'fakePlatform':
      return new FakePlatform(world, id, def);
    case 'spike':
      return new Spike(world, id, def);
    case 'hiddenSpike':
      return new HiddenSpike(world, id, def);
    case 'fallingBlock':
      return new FallingBlock(world, id, def);
    case 'saw':
      return new Saw(world, id, def);
    case 'crusher':
      return new Crusher(world, id, def);
  }
}
