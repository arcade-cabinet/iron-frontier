export function distanceSq(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function distance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): number {
  return Math.sqrt(distanceSq(a, b));
}

export function normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len < 0.0001) return { x: 0, y: 0, z: 1 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function canDetectPlayer(
  enemyPos: { x: number; y: number; z: number },
  playerPos: { x: number; y: number; z: number },
  detectionRadius: number,
): boolean {
  return distanceSq(enemyPos, playerPos) <= detectionRadius * detectionRadius;
}
