/**
 * Builds a concrete LevelEntity from its data descriptor. Exhaustive over the
 * EntityDef union (TS will flag any new entity type that isn't handled).
 */

import type Matter from 'matter-js';

import type { EntityDef } from '@/levels/types';

import type { LevelEntity } from './LevelEntity';
import {
  BouncePad,
  Conveyor,
  CrumblePlatform,
  FakePlatform,
  MovingPlatform,
  PhasePlatform,
  SolidPlatform,
} from './platforms';
import { Crusher, FallingBlock, HiddenSpike, Laser, Saw, Spike } from './hazards';
import { Chaser, DashPad, GravityZone, IceFloor, Pendulum, Portal, WindZone } from './mechanics2';

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
    case 'conveyor':
      return new Conveyor(world, id, def);
    case 'bouncePad':
      return new BouncePad(world, id, def);
    case 'phasePlatform':
      return new PhasePlatform(world, id, def);
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
    case 'laser':
      return new Laser(world, id, def);
    case 'iceFloor':
      return new IceFloor(world, id, def);
    case 'windZone':
      return new WindZone(world, id, def);
    case 'gravityZone':
      return new GravityZone(world, id, def);
    case 'portal':
      return new Portal(world, id, def);
    case 'dashPad':
      return new DashPad(world, id, def);
    case 'pendulum':
      return new Pendulum(world, id, def);
    case 'chaser':
      return new Chaser(world, id, def);
  }
}
