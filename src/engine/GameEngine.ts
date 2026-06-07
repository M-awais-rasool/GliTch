/**
 * Top-level engine for a single level: owns the LevelRuntime, the camera and
 * the fixed-step loop, and bridges to React only through Reanimated render
 * handles (created here via makeMutable) + a few status callbacks.
 *
 * Frame anatomy:
 *   step(dt)    -> runtime.fixedStep + interpolation bookkeeping + status events
 *   render(a)   -> interpolate player, follow camera, push handles to UI thread
 */

import { makeMutable } from 'react-native-reanimated';

import { Camera } from '@/camera/Camera';
import { DEFAULT_GRAVITY_Y, SHAKE_ON_DEATH } from '@/constants';
import type { InputState } from '@/input/InputState';
import type { LevelDef } from '@/levels/types';
import type { GameStatus, Size } from '@/types';
import { lerp } from '@/utils/math';

import { GameLoop } from './GameLoop';
import { LevelRuntime } from './LevelRuntime';
import {
  CHAR_STATE,
  type CameraRenderHandle,
  type EntityRenderHandle,
  type GameEngineCallbacks,
  type PlayerRenderHandle,
} from './types';

export class GameEngine {
  private readonly runtime: LevelRuntime;
  private readonly camera: Camera;
  private readonly loop: GameLoop;

  readonly player: PlayerRenderHandle = {
    x: makeMutable(0),
    y: makeMutable(0),
    vx: makeMutable(0),
    vy: makeMutable(0),
    facing: makeMutable(1),
    grounded: makeMutable(0),
    state: makeMutable<number>(CHAR_STATE.idle),
    deathT: makeMutable(0),
  };
  readonly cameraHandle: CameraRenderHandle = {
    x: makeMutable(0),
    y: makeMutable(0),
  };
  readonly entities: EntityRenderHandle[];

  // interpolation baseline (player centre)
  private prevX = 0;
  private prevY = 0;
  private currX = 0;
  private currY = 0;

  constructor(
    private viewport: Size,
    readonly level: LevelDef,
    private readonly input: InputState,
    private readonly callbacks: GameEngineCallbacks,
  ) {
    this.runtime = new LevelRuntime(level, level.gravity ?? DEFAULT_GRAVITY_Y);
    this.entities = this.runtime.entities.map((e) => e.render);

    this.camera = new Camera(viewport);
    this.camera.setBounds(level.size);

    this.currX = this.runtime.player.position.x;
    this.currY = this.runtime.player.position.y;
    this.prevX = this.currX;
    this.prevY = this.currY;
    this.camera.reset(this.currX, this.currY, 1);

    this.loop = new GameLoop(this.step, this.render);
    this.syncHandles();
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  setViewport(size: Size): void {
    this.viewport = size;
    this.camera.setViewport(size);
  }

  /** Explicit retry (clears deaths/timer) — used by the complete overlay. */
  restart(): void {
    this.runtime.restart();
    this.currX = this.runtime.player.position.x;
    this.currY = this.runtime.player.position.y;
    this.prevX = this.currX;
    this.prevY = this.currY;
    this.camera.reset(this.currX, this.currY, 1);
    this.syncHandles();
    this.callbacks.onDeaths(0);
    this.callbacks.onStatusChange('running');
  }

  dispose(): void {
    this.loop.stop();
    this.runtime.dispose();
  }

  // --- frame ---------------------------------------------------------------

  private readonly step = (dtMs: number): void => {
    const before: GameStatus = this.runtime.status;

    this.prevX = this.currX;
    this.prevY = this.currY;

    this.runtime.fixedStep(dtMs, {
      axis: this.input.axis,
      jumpHeld: this.input.jumpHeld,
      jumpPressed: this.input.consumeJumpPress(),
    });

    this.currX = this.runtime.player.position.x;
    this.currY = this.runtime.player.position.y;

    this.handleTransition(before, this.runtime.status);
  };

  private readonly render = (frameDtMs: number, alpha: number): void => {
    const x = lerp(this.prevX, this.currX, alpha);
    const y = lerp(this.prevY, this.currY, alpha);
    const p = this.runtime.player;

    this.camera.follow(x, y, p.facing, frameDtMs);

    this.player.x.value = x;
    this.player.y.value = y;
    this.player.vx.value = p.velocity.x;
    this.player.vy.value = p.velocity.y;
    this.player.facing.value = p.facing;
    this.player.grounded.value = this.runtime.grounded ? 1 : 0;
    this.player.state.value = this.computeState();
    this.player.deathT.value = this.runtime.deathProgress();

    this.cameraHandle.x.value = this.camera.offsetX;
    this.cameraHandle.y.value = this.camera.offsetY;
  };

  private handleTransition(before: GameStatus, after: GameStatus): void {
    if (before === after) return;

    if (before === 'running' && after === 'dead') {
      this.camera.shake(SHAKE_ON_DEATH);
      this.callbacks.onDeaths(this.runtime.deaths);
      this.callbacks.onStatusChange('dead');
    } else if (before === 'running' && after === 'complete') {
      // onComplete records the result AND flips store status to 'complete'.
      this.callbacks.onComplete({ timeMs: this.runtime.elapsedMs, deaths: this.runtime.deaths });
    } else if (before === 'dead' && after === 'running') {
      // respawn teleport — snap interpolation so there's no streak
      this.currX = this.runtime.player.position.x;
      this.currY = this.runtime.player.position.y;
      this.prevX = this.currX;
      this.prevY = this.currY;
      this.camera.reset(this.currX, this.currY, this.runtime.player.facing);
      this.callbacks.onStatusChange('running');
    }
  }

  private computeState(): number {
    if (this.runtime.status === 'dead') return CHAR_STATE.dead;
    const p = this.runtime.player;
    if (!this.runtime.grounded) return p.velocity.y < -0.4 ? CHAR_STATE.jump : CHAR_STATE.fall;
    return Math.abs(p.velocity.x) > 0.4 ? CHAR_STATE.run : CHAR_STATE.idle;
  }

  private syncHandles(): void {
    this.player.x.value = this.currX;
    this.player.y.value = this.currY;
    this.player.vx.value = 0;
    this.player.vy.value = 0;
    this.player.facing.value = this.runtime.player.facing;
    this.player.grounded.value = 0;
    this.player.state.value = CHAR_STATE.idle;
    this.player.deathT.value = 0;
    this.cameraHandle.x.value = this.camera.offsetX;
    this.cameraHandle.y.value = this.camera.offsetY;
  }
}
