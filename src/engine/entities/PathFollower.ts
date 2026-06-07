/**
 * Ping-pong path follower shared by moving platforms and saws. Advances a point
 * along a polyline at a fixed per-step speed, pausing at endpoints, reversing at
 * the ends. Deterministic with the fixed timestep.
 */

import type { MovePath } from '@/levels/types';

export class PathFollower {
  x: number;
  y: number;

  private targetIdx: number;
  private dir = 1;
  private pauseLeft = 0;

  constructor(private readonly path: MovePath) {
    this.x = path.points[0].x;
    this.y = path.points[0].y;
    this.targetIdx = path.points.length > 1 ? 1 : 0;
  }

  step(dtMs: number): void {
    if (this.path.points.length < 2) return;
    if (this.pauseLeft > 0) {
      this.pauseLeft -= dtMs;
      return;
    }
    const target = this.path.points[this.targetIdx];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= this.path.speed || dist === 0) {
      this.x = target.x;
      this.y = target.y;
      this.pauseLeft = this.path.pauseMs ?? 0;
      this.advance();
    } else {
      this.x += (dx / dist) * this.path.speed;
      this.y += (dy / dist) * this.path.speed;
    }
  }

  private advance(): void {
    const n = this.path.points.length;
    if (this.targetIdx + this.dir >= n || this.targetIdx + this.dir < 0) {
      this.dir *= -1;
    }
    this.targetIdx = Math.min(Math.max(this.targetIdx + this.dir, 0), n - 1);
  }

  reset(): void {
    this.x = this.path.points[0].x;
    this.y = this.path.points[0].y;
    this.targetIdx = this.path.points.length > 1 ? 1 : 0;
    this.dir = 1;
    this.pauseLeft = 0;
  }
}
