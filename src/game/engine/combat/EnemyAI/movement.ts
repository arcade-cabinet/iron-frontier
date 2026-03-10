import {
  FleeBehavior,
  SeekBehavior,
  Vector3 as YukaVector3,
} from 'yuka';
import type { AIAction, EnemyAIState } from './types';
import { entityManager } from './factory';

export function updateAIEntityManager(dt: number): void {
  entityManager.update(dt);
}

export function applyAIMovement(
  ai: EnemyAIState,
  action: AIAction,
  dt: number,
): void {
  if (action.type === 'move' || action.type === 'flee') {
    if (action.targetPosition) {
      const target = new YukaVector3(
        action.targetPosition.x,
        action.targetPosition.y,
        action.targetPosition.z,
      );

      ai.vehicle.steering.clear();

      if (action.type === 'flee') {
        const flee = new FleeBehavior(target);
        ai.vehicle.steering.add(flee);
      } else {
        const seek = new SeekBehavior(target);
        ai.vehicle.steering.add(seek);
      }

      ai.position.x = ai.vehicle.position.x;
      ai.position.y = ai.vehicle.position.y;
      ai.position.z = ai.vehicle.position.z;
    }
  }
}
