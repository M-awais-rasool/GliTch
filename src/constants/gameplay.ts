/**
 * Gameplay tuning for the manually-controlled platformer. All speeds are in
 * world pixels per fixed 60Hz step so they read consistently against the sim.
 * These define "game feel" and are expected to be iterated on with the game
 * running.
 */

// --- Player body ----------------------------------------------------------

export const PLAYER_WIDTH = 30;
export const PLAYER_HEIGHT = 34;

// --- Horizontal movement --------------------------------------------------

/** Top horizontal speed (px/step). */
export const MOVE_MAX_SPEED = 3.5;
/** Approach factor toward target velocity while grounded (responsive). */
export const GROUND_ACCEL = 0.42;
/** Approach factor in the air (less control = more deliberate jumps). */
export const AIR_ACCEL = 0.22;
/** Velocity decay per step when no input is held (grounded). */
export const GROUND_FRICTION = 0.74;
/** Velocity decay per step when no input is held (airborne). */
export const AIR_FRICTION = 0.96;

/** On ice: sluggish acceleration + almost no friction (you slide). */
export const ICE_ACCEL = 0.1;
export const ICE_FRICTION = 0.992;

// --- Jump -----------------------------------------------------------------

export const JUMP_VELOCITY = 9.4;
/** Mass-scaled upward force applied each step while jump is held. */
export const JUMP_HOLD_FORCE = 0.0017;
/** How long (ms) holding keeps boosting the jump. */
export const JUMP_HOLD_MAX_MS = 230;
/** Releasing early while ascending cuts velocity by this factor. */
export const JUMP_CUT_FACTOR = 0.42;
/** Grace window (ms) to still jump just after leaving a ledge. */
export const COYOTE_TIME_MS = 95;
/** Window (ms) before landing during which a buffered jump still fires. */
export const JUMP_BUFFER_MS = 120;
/** Terminal downward speed (px/step) so falls stay controllable/survivable-feeling. */
export const MAX_FALL_SPEED = 17;

/** Default world gravity if a level doesn't override it. */
export const DEFAULT_GRAVITY_Y = 1.5;

// --- Camera ---------------------------------------------------------------

export const CAMERA_LERP = 0.16;
/** Player rest position as a fraction of the viewport. */
export const CAMERA_ANCHOR_X = 0.5;
export const CAMERA_ANCHOR_Y = 0.56;
/** Look-ahead (px) shifted in the facing direction. */
export const CAMERA_LOOK_AHEAD = 70;
export const CAMERA_SHAKE_DECAY = 5;
export const SHAKE_ON_DEATH = 16;

// --- Death / respawn ------------------------------------------------------

/** Delay (ms) the death animation plays before respawn. */
export const RESPAWN_DELAY_MS = 430;
/** Length (ms) of the death animation ramp (0 -> 1). */
export const DEATH_ANIM_MS = 320;
/** Falling this many px below the level bottom also kills (pits). */
export const FALL_OUT_MARGIN = 80;
