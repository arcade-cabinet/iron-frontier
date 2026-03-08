/**
 * Iron Frontier - Projectile System
 *
 * Manages projectile lifecycle: ages projectiles, checks lifetime expiry,
 * performs simple spherecast hit detection against collidable entities,
 * and removes spent projectiles from the world.
 */

import type { World } from 'miniplex';
import type { Entity, Position } from '../components';
import { projectiles } from '../world';

// ============================================================================
// HIT CALLBACK TYPE
// ============================================================================

/**
 * Called when a projectile hits a target entity.
 * The system handles detection; the callback handles game logic
 * (damage, effects, sound, VFX).
 */
export type ProjectileHitCallback = (
  projectileEntity: Entity,
  targetEntity: Entity,
  hitPosition: Position,
) => void;

// ============================================================================
// SPATIAL HELPERS
// ============================================================================

function distanceSquared(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

// ============================================================================
// SYSTEM
// ============================================================================

/**
 * Tick all active projectiles.
 *
 * 1. Age the projectile by deltaTime
 * 2. Check if lifetime expired -> remove
 * 3. Check collisions against provided target entities
 * 4. Invoke hit callback on collision -> remove projectile
 */
export function projectileSystem(
  ecsWorld: World<Entity>,
  deltaTime: number,
  targets: Iterable<Entity>,
  onHit?: ProjectileHitCallback,
): void {
  // Collect projectiles to remove after iteration (no mutation during loop)
  const toRemove: Entity[] = [];

  for (const entity of projectiles) {
    // Age the projectile
    entity.projectile.age += deltaTime;

    // Check lifetime expiry
    if (entity.projectile.age >= entity.projectile.lifetime) {
      toRemove.push(entity);
      continue;
    }

    // Collision detection: simple sphere overlap against targets
    const projectileRadius = entity.collider?.radius ?? 0.05;

    for (const target of targets) {
      if (!target.position || !target.collider) continue;

      const targetRadius = target.collider.radius ?? 0.5;
      const combinedRadius = projectileRadius + targetRadius;
      const dSq = distanceSquared(entity.position, target.position);

      if (dSq <= combinedRadius * combinedRadius) {
        // Hit detected
        if (onHit) {
          onHit(entity, target, { ...entity.position });
        }
        toRemove.push(entity);
        break; // One hit per projectile
      }
    }
  }

  // Remove spent projectiles
  for (const entity of toRemove) {
    ecsWorld.remove(entity);
  }
}
