/**
 * Owned wrapper around a Matter engine for a single level.
 *
 * Holds the engine, the player, and the grounded-detection CollisionSystem.
 * Level entities add their own solid bodies directly to `world`. The step is
 * split into `stepPlayer` (apply input/intent) and `integrate` (advance Matter)
 * so the LevelRuntime can interleave entity movement + player carrying between
 * them.
 */

import Matter from 'matter-js';

import { CollisionSystem } from '@/collision/CollisionSystem';
import { Player, type PlayerInput } from '@/entities/player/Player';
import type { Vector2 } from '@/types';

export class PhysicsWorld {
  readonly engine: Matter.Engine;
  readonly player: Player;

  private readonly collisions: CollisionSystem;

  constructor(spawn: Vector2, gravity: number) {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: gravity, scale: 0.001 },
      enableSleeping: false,
    });
    this.player = new Player(spawn);
    Matter.Composite.add(this.engine.world, this.player.body);
    this.collisions = new CollisionSystem(this.engine, this.player.body.id);
  }

  get world(): Matter.World {
    return this.engine.world;
  }

  get grounded(): boolean {
    return this.collisions.isGrounded;
  }

  setGravity(gravity: number): void {
    this.engine.gravity.y = gravity;
  }

  stepPlayer(dtMs: number, input: PlayerInput): void {
    this.player.update(dtMs, input, this.collisions.isGrounded);
  }

  integrate(dtMs: number): void {
    Matter.Engine.update(this.engine, dtMs);
  }

  reset(spawn: Vector2): void {
    this.collisions.clear();
    this.player.reset(spawn);
  }

  dispose(): void {
    this.collisions.dispose();
    Matter.Composite.clear(this.engine.world, false, true);
    Matter.Engine.clear(this.engine);
  }
}
