/**
 * Iron Frontier - Lifetime System
 *
 * Decrements the remaining lifetime on entities that have a Lifetime
 * component. When lifetime reaches zero, the entity is removed from
 * the world. Used for projectiles, particles, and temporary effects.
 */

import type { World } from 'miniplex';
import type { Entity } from '../components';
import { withLifetime } from '../world';

/**
 * Tick all entities with a lifetime component.
 * Removes entities whose lifetime has expired.
 */
export function lifetimeSystem(
  ecsWorld: World<Entity>,
  deltaTime: number,
): void {
  const toRemove: Entity[] = [];

  for (const entity of withLifetime) {
    entity.lifetime.remaining -= deltaTime;

    if (entity.lifetime.remaining <= 0) {
      toRemove.push(entity);
    }
  }

  for (const entity of toRemove) {
    ecsWorld.remove(entity);
  }
}
