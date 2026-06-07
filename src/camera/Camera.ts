/**
 * 2D follow camera: frame-rate-independent smoothing, facing look-ahead,
 * decaying shake, and clamping to the level bounds so you never see past the
 * edges. Stores its top-left in world space; `offsetX/offsetY` (incl. shake) are
 * what the renderer subtracts from every world coordinate.
 */

import {
  CAMERA_ANCHOR_X,
  CAMERA_ANCHOR_Y,
  CAMERA_LERP,
  CAMERA_LOOK_AHEAD,
  CAMERA_SHAKE_DECAY,
} from '@/constants';
import type { Size } from '@/types';
import { clamp, smoothing } from '@/utils/math';

export class Camera {
  x = 0;
  y = 0;

  private bounds: Size = { width: 0, height: 0 };
  private shakeMagnitude = 0;
  private shakeX = 0;
  private shakeY = 0;

  constructor(private viewport: Size) {}

  setViewport(size: Size): void {
    this.viewport = size;
  }

  setBounds(size: Size): void {
    this.bounds = size;
  }

  get offsetX(): number {
    return this.x + this.shakeX;
  }

  get offsetY(): number {
    return this.y + this.shakeY;
  }

  private maxX(): number {
    return Math.max(0, this.bounds.width - this.viewport.width);
  }

  private maxY(): number {
    return Math.max(0, this.bounds.height - this.viewport.height);
  }

  private desiredX(centerX: number, facing: number): number {
    return centerX - this.viewport.width * CAMERA_ANCHOR_X + facing * CAMERA_LOOK_AHEAD;
  }

  private desiredY(centerY: number): number {
    return centerY - this.viewport.height * CAMERA_ANCHOR_Y;
  }

  /** Smoothly approach the player centre and advance shake decay. */
  follow(centerX: number, centerY: number, facing: number, frameDtMs: number): void {
    const t = smoothing(CAMERA_LERP, frameDtMs);
    this.x = clamp(this.x + (this.desiredX(centerX, facing) - this.x) * t, 0, this.maxX());
    this.y = clamp(this.y + (this.desiredY(centerY) - this.y) * t, 0, this.maxY());

    if (this.shakeMagnitude > 0.1) {
      this.shakeX = (Math.random() * 2 - 1) * this.shakeMagnitude;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeMagnitude;
      this.shakeMagnitude *= Math.max(0, 1 - (CAMERA_SHAKE_DECAY * frameDtMs) / 1000);
    } else {
      this.shakeMagnitude = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  shake(magnitude: number): void {
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
  }

  snapTo(centerX: number, centerY: number, facing: number): void {
    this.x = clamp(this.desiredX(centerX, facing), 0, this.maxX());
    this.y = clamp(this.desiredY(centerY), 0, this.maxY());
  }

  reset(centerX: number, centerY: number, facing: number): void {
    this.shakeMagnitude = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.snapTo(centerX, centerY, facing);
  }
}
