/**
 * Iron Frontier - Movement System
 *
 * Applies velocity to position each tick for all entities that have
 * both a position and velocity component.
 */

import type { World } from 'miniplex';
import type { Entity } from '../components';
import { movers } from '../world';

/**
 * Update position based on velocity for all moving entities.
 * Velocity is in units per second; deltaTime is in seconds.
 */
export function movementSystem(
  _world: World<Entity>,
  deltaTime: number,
): void {
  for (const entity of movers) {
    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;
    entity.position.z += entity.velocity.z * deltaTime;
  }
}
