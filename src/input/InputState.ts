/**
 * Mutable input snapshot shared between the on-screen controls and the engine.
 *
 * Controls write to it from touch callbacks; the engine POLLS it every fixed
 * step. Keeping input out of React state means presses never trigger re-renders
 * and reach the simulation with zero latency. A single instance lives for the
 * duration of a level (created in the engine hook).
 */
export class InputState {
  left = false;
  right = false;
  jumpHeld = false;

  /** Edge flag: set on a fresh jump press, cleared when the engine consumes it. */
  private jumpQueued = false;

  setLeft(active: boolean): void {
    this.left = active;
  }

  setRight(active: boolean): void {
    this.right = active;
  }

  setJump(active: boolean): void {
    this.jumpHeld = active;
    if (active) this.jumpQueued = true;
  }

  /** Returns true once per fresh press; used to buffer jumps in the engine. */
  consumeJumpPress(): boolean {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  /** Horizontal intent in [-1, 1] (right positive). */
  get axis(): number {
    return (this.right ? 1 : 0) - (this.left ? 1 : 0);
  }

  reset(): void {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.jumpQueued = false;
  }
}
