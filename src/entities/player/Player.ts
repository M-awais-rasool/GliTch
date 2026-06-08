/**
 * Player entity — manually controlled platformer movement.
 *
 * Reads a polled input snapshot + an environment snapshot each fixed step and
 * drives the Matter body. The environment lets traps bend the rules:
 *  - `onIce`     : sluggish accel + near-zero friction (you slide)
 *  - `windX`     : a constant horizontal push you fight against
 *  - `gravitySign`: +1 normal, -1 when in a gravity-flip zone. Jumping, the
 *    variable-jump checks and terminal fall all flip with it, so the same feel
 *    works upside-down.
 *
 * Body rotation is locked and friction is zero so the feel is fully authored.
 * Spawn is the player's TOP-LEFT (matching level data); body is centred.
 */

import Matter from 'matter-js';

import {
  AIR_ACCEL,
  AIR_FRICTION,
  COYOTE_TIME_MS,
  GROUND_ACCEL,
  GROUND_FRICTION,
  ICE_ACCEL,
  ICE_FRICTION,
  JUMP_BUFFER_MS,
  JUMP_CUT_FACTOR,
  JUMP_HOLD_FORCE,
  JUMP_HOLD_MAX_MS,
  JUMP_VELOCITY,
  MAX_FALL_SPEED,
  MOVE_MAX_SPEED,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from '@/constants';
import { hapticLight } from '@/services/haptics';
import type { Vector2 } from '@/types';

export interface PlayerInput {
  axis: number; // -1 left, 0 none, 1 right
  jumpHeld: boolean;
  jumpPressed: boolean;
}

export interface PlayerEnv {
  onIce: boolean;
  windX: number;
  /** +1 normal gravity, -1 flipped. */
  gravitySign: number;
}

export class Player {
  readonly body: Matter.Body;
  alive = true;
  facing = 1;

  private jumping = false;
  private holdElapsed = 0;
  private timeSinceGrounded = Number.POSITIVE_INFINITY;
  private jumpBuffer = Number.POSITIVE_INFINITY;
  private wasGrounded = false;

  constructor(spawnTopLeft: Vector2) {
    this.body = Matter.Bodies.rectangle(
      spawnTopLeft.x + PLAYER_WIDTH / 2,
      spawnTopLeft.y + PLAYER_HEIGHT / 2,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      { label: 'player', friction: 0, frictionAir: 0, restitution: 0, inertia: Number.POSITIVE_INFINITY },
    );
  }

  get position(): Matter.Vector {
    return this.body.position;
  }

  get velocity(): Matter.Vector {
    return this.body.velocity;
  }

  get rect(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.body.position.x - PLAYER_WIDTH / 2,
      y: this.body.position.y - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
  }

  update(dtMs: number, input: PlayerInput, grounded: boolean, env: PlayerEnv): void {
    if (!this.alive) return;
    const sign = env.gravitySign;

    if (grounded) {
      this.timeSinceGrounded = 0;
      if (this.velocity.y * sign >= 0) this.jumping = false; // resting on the ground
    } else {
      this.timeSinceGrounded += dtMs;
    }

    // landing feedback
    if (grounded && !this.wasGrounded && Math.abs(this.velocity.y) > 2.5) hapticLight();
    this.wasGrounded = grounded;

    // --- horizontal ---
    let vx = this.velocity.x;
    const accel = env.onIce ? ICE_ACCEL : grounded ? GROUND_ACCEL : AIR_ACCEL;
    const friction = env.onIce ? ICE_FRICTION : grounded ? GROUND_FRICTION : AIR_FRICTION;
    if (input.axis !== 0) {
      this.facing = input.axis > 0 ? 1 : -1;
      // If a dash/boost has us moving FASTER than walk speed in the held
      // direction, keep that momentum (bleed it with friction) instead of
      // braking back to walk speed — otherwise holding "forward" cancels a dash.
      if (vx * input.axis > MOVE_MAX_SPEED) {
        vx *= friction;
      } else {
        vx += (input.axis * MOVE_MAX_SPEED - vx) * accel;
      }
    } else {
      vx *= friction;
      if (Math.abs(vx) < 0.02) vx = 0;
    }
    vx += env.windX; // environmental push

    // --- vertical / jump (all relative to gravity direction) ---
    let vy = this.velocity.y;

    if (input.jumpPressed) this.jumpBuffer = 0;
    else this.jumpBuffer += dtMs;

    const canJump = grounded || this.timeSinceGrounded <= COYOTE_TIME_MS;
    if (this.jumpBuffer <= JUMP_BUFFER_MS && canJump && vy * sign >= -0.001) {
      vy = -JUMP_VELOCITY * sign; // jump away from the ground
      this.jumping = true;
      this.holdElapsed = 0;
      this.jumpBuffer = Number.POSITIVE_INFINITY;
      this.timeSinceGrounded = Number.POSITIVE_INFINITY;
      hapticLight();
    }

    // variable jump: release early while still ascending => short hop
    if (this.jumping && !input.jumpHeld && vy * sign < 0) {
      vy *= JUMP_CUT_FACTOR;
      this.jumping = false;
    }

    // hold => higher jump (force points away from gravity)
    if (input.jumpHeld && this.jumping && this.holdElapsed < JUMP_HOLD_MAX_MS && vy * sign < 0) {
      Matter.Body.applyForce(this.body, this.body.position, {
        x: 0,
        y: -JUMP_HOLD_FORCE * this.body.mass * sign,
      });
      this.holdElapsed += dtMs;
    }

    // terminal fall speed (along gravity)
    if (vy * sign > MAX_FALL_SPEED) vy = MAX_FALL_SPEED * sign;

    Matter.Body.setVelocity(this.body, { x: vx, y: vy });
  }

  kill(): void {
    this.alive = false;
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  reset(spawnTopLeft: Vector2): void {
    Matter.Body.setPosition(this.body, {
      x: spawnTopLeft.x + PLAYER_WIDTH / 2,
      y: spawnTopLeft.y + PLAYER_HEIGHT / 2,
    });
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    Matter.Body.setAngle(this.body, 0);
    this.alive = true;
    this.facing = 1;
    this.jumping = false;
    this.holdElapsed = 0;
    this.timeSinceGrounded = Number.POSITIVE_INFINITY;
    this.jumpBuffer = Number.POSITIVE_INFINITY;
    this.wasGrounded = false;
  }
}
