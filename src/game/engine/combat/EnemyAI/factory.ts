import {
  EntityManager,
  Vehicle,
  WanderBehavior,
} from 'yuka';
import { getEnemyConfig } from '../DamageCalculator';
import type { EnemyAIState } from './types';

export const entityManager = new EntityManager();

export function createEnemyAI(
  enemyId: string,
  level: number,
  position: { x: number; y: number; z: number },
  health: number,
  maxHealth: number,
  seed: string,
  patrolWaypoints?: Array<{ x: number; y: number; z: number }>,
): EnemyAIState {
  const vehicle = new Vehicle();
  vehicle.position.set(position.x, position.y, position.z);

  const config = getEnemyConfig(enemyId);
  const isFast = config?.behaviorTags.includes('mobile') ?? false;
  vehicle.maxSpeed = isFast ? 4.0 : 2.5;
  vehicle.maxForce = vehicle.maxSpeed * 3;

  const wander = new WanderBehavior();
  wander.radius = 2;
  wander.distance = 5;
  wander.jitter = 1;
  vehicle.steering.add(wander);

  entityManager.add(vehicle);

  return {
    state: patrolWaypoints && patrolWaypoints.length > 0 ? 'patrol' : 'idle',
    enemyId,
    level,
    position: { ...position },
    health,
    maxHealth,
    stateTimer: 0,
    attackCooldown: 0,
    alertTimer: 0,
    lastKnownPlayerPos: null,
    patrolWaypoints: patrolWaypoints ?? [],
    patrolIndex: 0,
    seed,
    vehicle,
    reactionTimer: 0,
    hasReacted: false,
    alertness: 0,
  };
}

export function disposeEnemyAI(aiState: EnemyAIState): void {
  entityManager.remove(aiState.vehicle);
}
