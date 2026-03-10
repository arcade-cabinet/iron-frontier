import Alea from 'alea';
import { getEnemyConfig } from '../DamageCalculator';
import type { AIAction, EnemyAIState } from './types';
import { DETECTION_RADIUS, FLEE_THRESHOLD } from './types';
import { distance, canDetectPlayer } from './detection';
import {
  updateIdle,
  updatePatrol,
  updateAlert,
  updatePursue,
  updateAttack,
  updateFlee,
} from './stateHandlers';

export function updateEnemyAI(
  ai: EnemyAIState,
  dt: number,
  playerPos: { x: number; y: number; z: number },
  playerFired: boolean,
): AIAction {
  if (ai.state === 'dead') {
    return { type: 'none' };
  }

  const config = getEnemyConfig(ai.enemyId);
  if (!config) return { type: 'none' };

  const rng = Alea(`${ai.seed}-${Math.floor(ai.stateTimer * 10)}`) as unknown as () => number;
  ai.stateTimer += dt;
  ai.attackCooldown = Math.max(0, ai.attackCooldown - dt);

  const dist = distance(ai.position, playerPos);
  const canSeePlayer = canDetectPlayer(ai.position, playerPos, DETECTION_RADIUS);
  const isRanged = config.behaviorTags.includes('ranged');
  const isMelee = config.behaviorTags.includes('melee') || config.behaviorTags.includes('charges');
  const healthPct = ai.health / ai.maxHealth;

  if (ai.state === 'attack' || ai.state === 'pursue') {
    ai.alertness = Math.min(1, ai.alertness + dt * 0.5);
  } else if (ai.state === 'alert') {
    ai.alertness = Math.min(0.5, ai.alertness + dt * 0.3);
  } else {
    ai.alertness = Math.max(0, ai.alertness - dt * 0.1);
  }

  if (ai.health <= 0) {
    ai.state = 'dead';
    return { type: 'none' };
  }

  if (
    healthPct <= FLEE_THRESHOLD &&
    ai.state !== 'flee' &&
    config.behaviorTags.includes('retreats')
  ) {
    ai.state = 'flee';
    ai.stateTimer = 0;
  }

  switch (ai.state) {
    case 'idle':
      return updateIdle(ai, canSeePlayer, playerFired, dist, playerPos);

    case 'patrol':
      return updatePatrol(ai, canSeePlayer, playerFired, dist, playerPos);

    case 'alert':
      return updateAlert(ai, dt, canSeePlayer, dist, config, isMelee, playerPos);

    case 'pursue':
      return updatePursue(ai, canSeePlayer, dist, config, isMelee, playerPos);

    case 'attack':
      return updateAttack(ai, rng, canSeePlayer, dist, config, isRanged, isMelee, playerPos);

    case 'flee':
      return updateFlee(ai, dist, playerPos);
  }
}
