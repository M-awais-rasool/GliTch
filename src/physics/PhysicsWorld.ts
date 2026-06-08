/**
 * Owned wrapper around a Matter engine for a single level.
 *
 * Holds the engine, the player, and grounded detection. Level entities add
 * their own solid bodies to `world`. The step is split into `stepPlayer` (apply
 * input/intent) and `integrate` (advance Matter) so the LevelRuntime can
 * interleave entity movement + player carrying between them.
 *
 * Supports gravity flipping: `setGravity` sets magnitude+direction and the
 * grounded check is told the current sign so "ground" stays correct upside-down.
 */

import Matter from 'matter-js';

import { CollisionSystem } from '@/collision/CollisionSystem';
import { Player, type PlayerEnv, type PlayerInput } from '@/entities/player/Player';
import type { Vector2 } from '@/types';

export class PhysicsWorld {
  readonly engine: Matter.Engine;
  readonly player: Player;

  private readonly collisions: CollisionSystem;
  private gravitySign = 1;

  constructor(spawn: Vector2, gravity: number) {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: gravity, scale: 0.001 },
      enableSleeping: false,
    });
    this.player = new Player(spawn);
    Matter.Composite.add(this.engine.world, this.player.body);
    this.collisions = new CollisionSystem(this.engine, this.player.body.id, () => this.gravitySign);
  }

  get world(): Matter.World {
    return this.engine.world;
  }

  get grounded(): boolean {
    return this.collisions.isGrounded;
  }

  /** Set gravity magnitude+direction (negative y = pull upward). */
  setGravity(gravityY: number): void {
    this.engine.gravity.y = gravityY;
    this.gravitySign = gravityY < 0 ? -1 : 1;
  }

  stepPlayer(dtMs: number, input: PlayerInput, env: PlayerEnv): void {
    this.player.update(dtMs, input, this.collisions.isGrounded, env);
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
