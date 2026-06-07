/**
 * Fixed-timestep game loop with a render interpolation hook.
 *
 * Physics is advanced in deterministic `FIXED_TIMESTEP_MS` chunks via an
 * accumulator, fully decoupled from the display refresh rate. This is the
 * classic "Fix Your Timestep" loop (Glenn Fiedler): the simulation is stable
 * and identical on 60Hz, 90Hz and 120Hz screens, and a frame spike can never
 * trigger a runaway "spiral of death".
 *
 * The loop runs on the JS thread (requestAnimationFrame) because Matter.js is
 * plain JS and cannot run inside a worklet. Per-frame results are pushed into
 * Reanimated shared values by the render callback, which the UI thread then
 * consumes for drawing.
 */

import { FIXED_TIMESTEP_MS, MAX_FRAME_DELTA_MS, MAX_STEPS_PER_FRAME } from '@/constants';

/** Advance the simulation by exactly one fixed step. */
export type StepFn = (fixedDtMs: number) => void;
/**
 * Push the latest state out for rendering.
 * @param frameDtMs Wall-clock time since the previous rendered frame.
 * @param alpha     Interpolation factor in [0,1) of leftover accumulator time.
 */
export type RenderFn = (frameDtMs: number, alpha: number) => void;

export class GameLoop {
  private rafId: number | null = null;
  private running = false;
  private lastTime = 0;
  private accumulator = 0;

  constructor(
    private readonly step: StepFn,
    private readonly render: RenderFn,
  ) {}

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return; // guard against double-scheduling rAF
    this.running = true;
    this.lastTime = 0;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (now: number): void => {
    if (!this.running) return;

    // First frame establishes the baseline without simulating a huge delta.
    if (this.lastTime === 0) {
      this.lastTime = now;
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const frameTime = Math.min(now - this.lastTime, MAX_FRAME_DELTA_MS);
    this.lastTime = now;
    this.accumulator += frameTime;

    let steps = 0;
    while (this.accumulator >= FIXED_TIMESTEP_MS && steps < MAX_STEPS_PER_FRAME) {
      this.step(FIXED_TIMESTEP_MS);
      this.accumulator -= FIXED_TIMESTEP_MS;
      steps += 1;
    }
    // If we hit the step cap there is still a backlog; drop it rather than
    // letting it compound on the next frame.
    if (steps >= MAX_STEPS_PER_FRAME) {
      this.accumulator = 0;
    }

    this.render(frameTime, this.accumulator / FIXED_TIMESTEP_MS);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
