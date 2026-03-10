import type { AABB, Circle } from './types';

export function aabbIntersects(a: AABB, b: AABB): boolean {
  return a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.z <= b.max.z && a.max.z >= b.min.z;
}

export function aabbContainsPoint(aabb: AABB, point: { x: number; z: number }): boolean {
  return (
    point.x >= aabb.min.x &&
    point.x <= aabb.max.x &&
    point.z >= aabb.min.z &&
    point.z <= aabb.max.z
  );
}

export function circleToAABB(circle: Circle): AABB {
  return {
    min: {
      x: circle.center.x - circle.radius,
      z: circle.center.z - circle.radius,
    },
    max: {
      x: circle.center.x + circle.radius,
      z: circle.center.z + circle.radius,
    },
  };
}

export function aabbCircleIntersects(aabb: AABB, circle: Circle): boolean {
  const closestX = Math.max(aabb.min.x, Math.min(circle.center.x, aabb.max.x));
  const closestZ = Math.max(aabb.min.z, Math.min(circle.center.z, aabb.max.z));

  const dx = closestX - circle.center.x;
  const dz = closestZ - circle.center.z;
  const distanceSquared = dx * dx + dz * dz;

  return distanceSquared <= circle.radius * circle.radius;
}

export function circleIntersects(a: Circle, b: Circle): boolean {
  const dx = a.center.x - b.center.x;
  const dz = a.center.z - b.center.z;
  const distanceSquared = dx * dx + dz * dz;
  const radiusSum = a.radius + b.radius;
  return distanceSquared <= radiusSum * radiusSum;
}

export function circleContainsPoint(circle: Circle, point: { x: number; z: number }): boolean {
  const dx = point.x - circle.center.x;
  const dz = point.z - circle.center.z;
  const distanceSquared = dx * dx + dz * dz;
  return distanceSquared <= circle.radius * circle.radius;
}

export function aabbCenter(aabb: AABB): { x: number; z: number } {
  return {
    x: (aabb.min.x + aabb.max.x) / 2,
    z: (aabb.min.z + aabb.max.z) / 2,
  };
}

export function aabbExpand(aabb: AABB, amount: number): AABB {
  return {
    min: { x: aabb.min.x - amount, z: aabb.min.z - amount },
    max: { x: aabb.max.x + amount, z: aabb.max.z + amount },
  };
}

export function aabbFromCenter(
  center: { x: number; z: number },
  halfWidth: number,
  halfDepth: number
): AABB {
  return {
    min: { x: center.x - halfWidth, z: center.z - halfDepth },
    max: { x: center.x + halfWidth, z: center.z + halfDepth },
  };
}

export function aabbFromRadius(center: { x: number; z: number }, radius: number): AABB {
  return aabbFromCenter(center, radius, radius);
}
