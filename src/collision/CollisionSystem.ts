/**
 * Grounded detection.
 *
 * Rather than ray-casting every frame, we listen to Matter's collision events
 * and maintain a set of platform bodies the player is currently resting ON. A
 * contact only counts as "ground" when the player's centre is above the other
 * body's centre at the moment of contact — this rejects side/ceiling hits so a
 * player scraping a wall is not considered grounded.
 */

import Matter from 'matter-js';

import type { BodyLabel } from '@/types';

export class CollisionSystem {
  /** Ids of platform bodies the player is standing on. */
  private readonly groundContacts = new Set<number>();

  constructor(
    private readonly engine: Matter.Engine,
    private readonly playerId: number,
    /** Returns +1 (normal) or -1 (flipped) gravity so "ground" is the surface
     *  the player is pulled onto. */
    private readonly getGravitySign: () => number = () => 1,
  ) {
    Matter.Events.on(this.engine, 'collisionStart', this.handleStart);
    Matter.Events.on(this.engine, 'collisionEnd', this.handleEnd);
  }

  get isGrounded(): boolean {
    return this.groundContacts.size > 0;
  }

  /** Clears tracked contacts (used on reset). */
  clear(): void {
    this.groundContacts.clear();
  }

  dispose(): void {
    Matter.Events.off(this.engine, 'collisionStart', this.handleStart);
    Matter.Events.off(this.engine, 'collisionEnd', this.handleEnd);
    this.groundContacts.clear();
  }

  /** Returns the non-player body in a pair if the player is involved. */
  private otherBody(
    a: Matter.Body,
    b: Matter.Body,
  ): Matter.Body | null {
    if (a.id === this.playerId) return b;
    if (b.id === this.playerId) return a;
    return null;
  }

  private handleStart = (event: Matter.IEventCollision<Matter.Engine>): void => {
    for (const pair of event.pairs) {
      const other = this.otherBody(pair.bodyA, pair.bodyB);
      if (!other || (other.label as BodyLabel) !== 'platform') continue;

      const player = pair.bodyA.id === this.playerId ? pair.bodyA : pair.bodyB;
      // "Ground" is whichever side gravity pulls the player onto: normally the
      // platform below (player above it); flipped, the platform above.
      if ((player.position.y - other.position.y) * this.getGravitySign() < 0) {
        this.groundContacts.add(other.id);
      }
    }
  };

  private handleEnd = (event: Matter.IEventCollision<Matter.Engine>): void => {
    for (const pair of event.pairs) {
      const other = this.otherBody(pair.bodyA, pair.bodyB);
      if (!other) continue;
      this.groundContacts.delete(other.id);
    }
  };
}
