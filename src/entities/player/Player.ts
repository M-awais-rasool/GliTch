/**
 * Player entity — manually controlled platformer movement.
 *
 * Reads a polled input snapshot each fixed step and drives the Matter body:
 * accelerate toward a target horizontal speed (less control in air), friction
 * when idle, variable-height jump with coyote time + jump buffering, and a
 * clamped terminal fall speed. Body rotation is locked and friction is zero so
 * the feel is fully authored (no wall-stick / spin). Spawn is given as the
 * player's TOP-LEFT (matching level data); the body is centred internally.
 */

import Matter from 'matter-js';

import {
  AIR_ACCEL,
  AIR_FRICTION,
  COYOTE_TIME_MS,
  GROUND_ACCEL,
  GROUND_FRICTION,
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
import type { Vector2 } from '@/types';

export interface PlayerInput {
  /** -1 left, 0 none, 1 right. */
  axis: number;
  jumpHeld: boolean;
  /** True only on the step a fresh jump press is consumed. */
  jumpPressed: boolean;
}

export class Player {
  readonly body: Matter.Body;
  alive = true;
  facing = 1;

  private jumping = false;
  private holdElapsed = 0;
  private timeSinceGrounded = Number.POSITIVE_INFINITY;
  private jumpBuffer = Number.POSITIVE_INFINITY;

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

  /** Top-left AABB in world space. */
  get rect(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.body.position.x - PLAYER_WIDTH / 2,
      y: this.body.position.y - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
  }

  /** Called once per fixed step BEFORE Matter integrates. */
  update(dtMs: number, input: PlayerInput, grounded: boolean): void {
    if (!this.alive) return;

    if (grounded) {
      this.timeSinceGrounded = 0;
      if (this.velocity.y >= 0) this.jumping = false; // landed
    } else {
      this.timeSinceGrounded += dtMs;
    }

    // --- horizontal ---
    let vx = this.velocity.x;
    if (input.axis !== 0) {
      this.facing = input.axis > 0 ? 1 : -1;
      const target = input.axis * MOVE_MAX_SPEED;
      vx += (target - vx) * (grounded ? GROUND_ACCEL : AIR_ACCEL);
    } else {
      vx *= grounded ? GROUND_FRICTION : AIR_FRICTION;
      if (Math.abs(vx) < 0.02) vx = 0;
    }

    // --- vertical / jump ---
    let vy = this.velocity.y;

    if (input.jumpPressed) this.jumpBuffer = 0;
    else this.jumpBuffer += dtMs;

    const canJump = grounded || this.timeSinceGrounded <= COYOTE_TIME_MS;
    if (this.jumpBuffer <= JUMP_BUFFER_MS && canJump && vy >= -0.001) {
      vy = -JUMP_VELOCITY;
      this.jumping = true;
      this.holdElapsed = 0;
      this.jumpBuffer = Number.POSITIVE_INFINITY;
      this.timeSinceGrounded = Number.POSITIVE_INFINITY;
    }

    // variable jump: release early while ascending => short hop (cut once)
    if (this.jumping && !input.jumpHeld && vy < 0) {
      vy *= JUMP_CUT_FACTOR;
      this.jumping = false;
    }

    // hold => higher jump (mass-scaled force applied during integration)
    if (input.jumpHeld && this.jumping && this.holdElapsed < JUMP_HOLD_MAX_MS && vy < 0) {
      Matter.Body.applyForce(this.body, this.body.position, {
        x: 0,
        y: -JUMP_HOLD_FORCE * this.body.mass,
      });
      this.holdElapsed += dtMs;
    }

    if (vy > MAX_FALL_SPEED) vy = MAX_FALL_SPEED;

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
  }
}
