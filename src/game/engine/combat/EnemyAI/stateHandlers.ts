import {
  getWeaponConfig,
  getEnemyAccuracyAtDistance,
  getEnemyReactionTime,
  getEnemyFireRate,
} from '../DamageCalculator';
import type { AIAction, EnemyAIState } from './types';
import {
  ALERT_RADIUS,
  MELEE_RANGE,
  ALERT_DURATION,
  PURSUE_TIMEOUT,
} from './types';
import { distance, canDetectPlayer, normalize } from './detection';

export function updateIdle(
  ai: EnemyAIState,
  canSeePlayer: boolean,
  playerFired: boolean,
  dist: number,
  playerPos: { x: number; y: number; z: number },
): AIAction {
  if (canSeePlayer) {
    ai.state = 'alert';
    ai.stateTimer = 0;
    ai.lastKnownPlayerPos = { ...playerPos };
    ai.hasReacted = false;
    ai.reactionTimer = getEnemyReactionTime(ai.enemyId, ai.alertness);
  } else if (playerFired && dist <= ALERT_RADIUS) {
    ai.state = 'alert';
    ai.stateTimer = 0;
    ai.lastKnownPlayerPos = { ...playerPos };
    ai.hasReacted = false;
    ai.reactionTimer = getEnemyReactionTime(ai.enemyId, ai.alertness);
  }
  return { type: 'none' };
}

export function updatePatrol(
  ai: EnemyAIState,
  canSeePlayer: boolean,
  playerFired: boolean,
  dist: number,
  playerPos: { x: number; y: number; z: number },
): AIAction {
  if (canSeePlayer) {
    ai.state = 'alert';
    ai.stateTimer = 0;
    ai.lastKnownPlayerPos = { ...playerPos };
    ai.hasReacted = false;
    ai.reactionTimer = getEnemyReactionTime(ai.enemyId, ai.alertness);
    return { type: 'none' };
  }

  if (playerFired && dist <= ALERT_RADIUS) {
    ai.state = 'alert';
    ai.stateTimer = 0;
    ai.lastKnownPlayerPos = { ...playerPos };
    ai.hasReacted = false;
    ai.reactionTimer = getEnemyReactionTime(ai.enemyId, ai.alertness);
    return { type: 'none' };
  }

  if (ai.patrolWaypoints.length > 0) {
    const target = ai.patrolWaypoints[ai.patrolIndex];
    const distToWaypoint = distance(ai.position, target);

    if (distToWaypoint < 1.0) {
      ai.patrolIndex = (ai.patrolIndex + 1) % ai.patrolWaypoints.length;
    }

    return {
      type: 'move',
      targetPosition: { ...target },
    };
  }

  return { type: 'none' };
}

export function updateAlert(
  ai: EnemyAIState,
  dt: number,
  canSeePlayer: boolean,
  dist: number,
  config: { behaviorTags: string[]; weaponId?: string },
  isMelee: boolean,
  playerPos: { x: number; y: number; z: number },
): AIAction {
  ai.alertTimer += dt;

  if (!ai.hasReacted) {
    ai.reactionTimer -= dt;
    if (ai.reactionTimer <= 0) {
      ai.hasReacted = true;
    }
  }

  if (canSeePlayer) {
    ai.lastKnownPlayerPos = { ...playerPos };
  }

  const isAggressive = config.behaviorTags.includes('aggressive');
  const alertThreshold = isAggressive ? 0.5 : 1.5;

  if (ai.alertTimer >= alertThreshold && ai.hasReacted) {
    if (canSeePlayer) {
      const attackRange = isMelee ? MELEE_RANGE : (getWeaponConfig(config.weaponId ?? '')?.range ?? 25);
      if (dist <= attackRange) {
        ai.state = 'attack';
      } else {
        ai.state = 'pursue';
      }
      ai.stateTimer = 0;
      ai.alertTimer = 0;
    } else if (ai.alertTimer >= ALERT_DURATION) {
      ai.state = ai.patrolWaypoints.length > 0 ? 'patrol' : 'idle';
      ai.stateTimer = 0;
      ai.alertTimer = 0;
    }
  }

  return { type: 'none' };
}

export function updatePursue(
  ai: EnemyAIState,
  canSeePlayer: boolean,
  dist: number,
  config: { behaviorTags: string[]; weaponId?: string },
  isMelee: boolean,
  playerPos: { x: number; y: number; z: number },
): AIAction {
  if (canSeePlayer) {
    ai.lastKnownPlayerPos = { ...playerPos };
    ai.stateTimer = 0;
  }

  if (ai.stateTimer > PURSUE_TIMEOUT) {
    ai.state = ai.patrolWaypoints.length > 0 ? 'patrol' : 'idle';
    ai.stateTimer = 0;
    return { type: 'none' };
  }

  const attackRange = isMelee ? MELEE_RANGE : (getWeaponConfig(config.weaponId ?? '')?.range ?? 25);

  if (canSeePlayer && dist <= attackRange) {
    ai.state = 'attack';
    ai.stateTimer = 0;
    return { type: 'none' };
  }

  const moveTarget = ai.lastKnownPlayerPos ?? playerPos;
  return {
    type: 'move',
    targetPosition: { ...moveTarget },
  };
}

export function updateAttack(
  ai: EnemyAIState,
  rng: () => number,
  canSeePlayer: boolean,
  dist: number,
  config: { behaviorTags: string[]; weaponId?: string; baseStats: { damage: number }; scaling: { damagePerLevel: number } },
  isRanged: boolean,
  isMelee: boolean,
  playerPos: { x: number; y: number; z: number },
): AIAction {
  if (!canSeePlayer) {
    ai.state = 'pursue';
    ai.stateTimer = 0;
    return { type: 'none' };
  }

  ai.lastKnownPlayerPos = { ...playerPos };

  const attackRange = isMelee ? MELEE_RANGE : (getWeaponConfig(config.weaponId ?? '')?.range ?? 25);

  if (dist > attackRange * 1.2) {
    ai.state = 'pursue';
    ai.stateTimer = 0;
    return { type: 'none' };
  }

  if (ai.attackCooldown > 0) {
    if (isRanged && rng() > 0.5) {
      const toPlayer = normalize({
        x: playerPos.x - ai.position.x,
        y: 0,
        z: playerPos.z - ai.position.z,
      });
      const strafeDir = rng() > 0.5 ? 1 : -1;
      return {
        type: 'move',
        targetPosition: {
          x: ai.position.x + (-toPlayer.z * strafeDir) * 3,
          y: ai.position.y,
          z: ai.position.z + (toPlayer.x * strafeDir) * 3,
        },
      };
    }
    return { type: 'none' };
  }

  let fireRate = 0.8;
  if (config.weaponId) {
    fireRate = getEnemyFireRate(config.weaponId);
  }
  ai.attackCooldown = 1.0 / Math.max(0.1, fireRate);

  const accuracyRoll = rng() * 100;
  const hitChance = getEnemyAccuracyAtDistance(
    ai.enemyId,
    ai.level,
    dist,
    'normal',
    false,
  );

  if (accuracyRoll > hitChance) {
    return { type: 'none' };
  }

  const direction = normalize({
    x: playerPos.x - ai.position.x,
    y: playerPos.y - ai.position.y,
    z: playerPos.z - ai.position.z,
  });

  if (isMelee && dist <= MELEE_RANGE) {
    return {
      type: 'attack_melee',
      attackDirection: direction,
      damage: config.baseStats.damage *
        Math.pow(config.scaling.damagePerLevel, ai.level - 1),
    };
  }

  if (isRanged) {
    return {
      type: 'attack_ranged',
      attackDirection: direction,
      damage: config.baseStats.damage *
        Math.pow(config.scaling.damagePerLevel, ai.level - 1),
    };
  }

  return { type: 'none' };
}

export function updateFlee(
  ai: EnemyAIState,
  dist: number,
  playerPos: { x: number; y: number; z: number },
): AIAction {
  const awayDir = normalize({
    x: ai.position.x - playerPos.x,
    y: 0,
    z: ai.position.z - playerPos.z,
  });

  const fleeTarget = {
    x: ai.position.x + awayDir.x * 15,
    y: ai.position.y,
    z: ai.position.z + awayDir.z * 15,
  };

  if (dist > ALERT_RADIUS * 1.5) {
    ai.state = 'idle';
    ai.stateTimer = 0;
  }

  return {
    type: 'flee',
    targetPosition: fleeTarget,
  };
}
