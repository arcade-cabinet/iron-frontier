import type { Vec3 } from '../../data/schemas/spatial';

export function distanceSqXZ(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

export function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;

  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const clamped = Math.min(Math.max(t, 0), 1);
  return from + diff * clamped;
}
