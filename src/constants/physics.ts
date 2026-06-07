/**
 * Physics + simulation constants (content-agnostic).
 *
 * The simulation runs on a FIXED timestep (deterministic, frame-rate
 * independent) decoupled from rendering. Per-level gravity lives in the level
 * definition; movement tuning lives in gameplay.ts.
 */

/** Logical simulation rate. 60Hz => 16.6667ms per step. */
export const SIMULATION_HZ = 60;
export const FIXED_TIMESTEP_MS = 1000 / SIMULATION_HZ;

/** Upper bound on the frame delta fed to the accumulator (anti spiral-of-death). */
export const MAX_FRAME_DELTA_MS = 100;

/** Hard cap on physics steps per displayed frame. */
export const MAX_STEPS_PER_FRAME = 5;

/** Static platform/kinematic body friction (player friction is handled manually). */
export const PLATFORM_FRICTION = 0;
