// EnemyAI — Enemy behavior state machine for FPS combat.
//
// Each enemy entity gets an EnemyAIState that tracks its current behavior,
// detection status, and combat decisions. The update function transitions
// states and returns action intents that the CombatManager executes.
//
// Uses alea for deterministic random decisions.
// Integrates with YUKA for steering behaviors (arrive, flee, wander).

import Alea from 'alea';
import {
  ArriveBehavior,
  EntityManager,
  EvadeBehavior,
  FleeBehavior,
  SeekBehavior,
  Vehicle,
  Vector3 as YukaVector3,
  WanderBehavior,
} from 'yuka';
import type { EnemyConfig } from './DamageCalculator';
import {
  getEnemyConfig,
  getWeaponConfig,
  getEnemyAccuracyAtDistance,
  getEnemyReactionTime,
  getEnemyFireRate,
} from './DamageCalculator';

// ---------------------------------------------------------------------------
// AI States
// ---------------------------------------------------------------------------

export type AIState =
  | 'idle'
  | 'patrol'
  | 'alert'
  | 'pursue'
  | 'attack'
  | 'flee'
  | 'dead';

// ---------------------------------------------------------------------------
// Action intents (what the AI wants to do this tick)
// ---------------------------------------------------------------------------

export type AIActionType = 'none' | 'move' | 'attack_melee' | 'attack_ranged' | 'flee';

export interface AIAction {
  type: AIActionType;
  /** Target position to move toward (for move/flee). */
  targetPosition?: { x: number; y: number; z: number };
  /** Direction to attack in (for ranged attacks). */
  attackDirection?: { x: number; y: number; z: number };
  /** Damage to deal if attack connects. */
  damage?: number;
}

// ---------------------------------------------------------------------------
// Per-enemy AI state
// ---------------------------------------------------------------------------

export interface EnemyAIState {
  /** Current state machine state. */
  state: AIState;
  /** Enemy definition ID (from enemies.json). */
  enemyId: string;
  /** Current level of this enemy instance. */
  level: number;
  /** Current position in world space. */
  position: { x: number; y: number; z: number };
  /** Current health. */
  health: number;
  /** Maximum health. */
  maxHealth: number;
  /** Time since last state transition. */
  stateTimer: number;
  /** Cooldown remaining before next attack. */
  attackCooldown: number;
  /** How long the enemy has been alerted (builds suspicion). */
  alertTimer: number;
  /** Last known player position (for pursuing after LOS lost). */
  lastKnownPlayerPos: { x: number; y: number; z: number } | null;
  /** Patrol waypoints. */
  patrolWaypoints: Array<{ x: number; y: number; z: number }>;
  /** Current patrol waypoint index. */
  patrolIndex: number;
  /** Deterministic RNG seed for this enemy. */
  seed: string;
  /** YUKA vehicle for steering behaviors. */
  vehicle: Vehicle;
  /** Reaction delay remaining before first shot (seconds). */
  reactionTimer: number;
  /** Whether the enemy has completed its initial reaction delay. */
  hasReacted: boolean;
  /** How alert the enemy is (0 = idle/surprised, 1 = fully alert). Persists across state transitions. */
  alertness: number;
}

// ---------------------------------------------------------------------------
// Detection config
// ---------------------------------------------------------------------------

/** Base detection radius (can see player within this distance). */
const DETECTION_RADIUS = 30;
/** Alert radius (react to gunfire within this distance). */
const ALERT_RADIUS = 50;
/** Melee attack range in meters. */
const MELEE_RANGE = 2.5;
/** Flee health threshold (percentage). */
const FLEE_THRESHOLD = 0.2;
/** How long to stay alert before returning to patrol (seconds). */
const ALERT_DURATION = 5.0;
/** How long to pursue after losing LOS (seconds). */
const PURSUE_TIMEOUT = 8.0;

// ---------------------------------------------------------------------------
// YUKA entity manager (shared across all AI instances)
// ---------------------------------------------------------------------------

const entityManager = new EntityManager();

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create initial AI state for a newly spawned enemy.
 */
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

  // Add wander behavior (used during patrol/idle)
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

/**
 * Clean up YUKA vehicle when enemy is removed from the world.
 */
export function disposeEnemyAI(aiState: EnemyAIState): void {
  entityManager.remove(aiState.vehicle);
}

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

function distanceSq(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function distance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): number {
  return Math.sqrt(distanceSq(a, b));
}

function normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len < 0.0001) return { x: 0, y: 0, z: 1 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Simple line-of-sight check. Returns true if the enemy can "see" the player.
 * Uses distance only (no actual raycasting against geometry -- that happens
 * in CombatManager which has access to the Three.js scene).
 */
function canDetectPlayer(
  enemyPos: { x: number; y: number; z: number },
  playerPos: { x: number; y: number; z: number },
  detectionRadius: number,
): boolean {
  return distanceSq(enemyPos, playerPos) <= detectionRadius * detectionRadius;
}

// ---------------------------------------------------------------------------
// Main update
// ---------------------------------------------------------------------------

/**
 * Update a single enemy's AI state. Returns the action the enemy wants to
 * perform this tick.
 *
 * @param ai - Mutable AI state (updated in place)
 * @param dt - Delta time in seconds
 * @param playerPos - Current player world position
 * @param playerFired - Whether the player fired this tick (triggers alert)
 * @returns Action intent for this tick
 */
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

  // Gradually build alertness when in combat states
  if (ai.state === 'attack' || ai.state === 'pursue') {
    ai.alertness = Math.min(1, ai.alertness + dt * 0.5);
  } else if (ai.state === 'alert') {
    ai.alertness = Math.min(0.5, ai.alertness + dt * 0.3);
  } else {
    // Decay alertness when idle/patrolling
    ai.alertness = Math.max(0, ai.alertness - dt * 0.1);
  }

  // Check for death
  if (ai.health <= 0) {
    ai.state = 'dead';
    return { type: 'none' };
  }

  // Check for flee condition
  if (
    healthPct <= FLEE_THRESHOLD &&
    ai.state !== 'flee' &&
    config.behaviorTags.includes('retreats')
  ) {
    ai.state = 'flee';
    ai.stateTimer = 0;
  }

  // State machine
  switch (ai.state) {
    // -----------------------------------------------------------------
    // IDLE: Standing still, waiting for stimulus
    // -----------------------------------------------------------------
    case 'idle': {
      if (canSeePlayer) {
        ai.state = 'alert';
        ai.stateTimer = 0;
        ai.lastKnownPlayerPos = { ...playerPos };
        // Reset reaction timer on new detection
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

    // -----------------------------------------------------------------
    // PATROL: Moving between waypoints
    // -----------------------------------------------------------------
    case 'patrol': {
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

      // Move toward current waypoint
      if (ai.patrolWaypoints.length > 0) {
        const target = ai.patrolWaypoints[ai.patrolIndex];
        const distToWaypoint = distance(ai.position, target);

        if (distToWaypoint < 1.0) {
          // Reached waypoint, move to next
          ai.patrolIndex = (ai.patrolIndex + 1) % ai.patrolWaypoints.length;
        }

        return {
          type: 'move',
          targetPosition: { ...target },
        };
      }

      return { type: 'none' };
    }

    // -----------------------------------------------------------------
    // ALERT: Detected player, deciding whether to engage
    // -----------------------------------------------------------------
    case 'alert': {
      ai.alertTimer += dt;

      // Tick down reaction timer
      if (!ai.hasReacted) {
        ai.reactionTimer -= dt;
        if (ai.reactionTimer <= 0) {
          ai.hasReacted = true;
        }
      }

      if (canSeePlayer) {
        ai.lastKnownPlayerPos = { ...playerPos };
      }

      // Aggressive enemies transition to pursue/attack quickly (after reaction)
      const isAggressive = config.behaviorTags.includes('aggressive');
      const alertThreshold = isAggressive ? 0.5 : 1.5;

      if (ai.alertTimer >= alertThreshold && ai.hasReacted) {
        if (canSeePlayer) {
          // Decide whether to pursue or attack based on distance
          const attackRange = isMelee ? MELEE_RANGE : (getWeaponConfig(config.weaponId ?? '')?.range ?? 25);
          if (dist <= attackRange) {
            ai.state = 'attack';
          } else {
            ai.state = 'pursue';
          }
          ai.stateTimer = 0;
          ai.alertTimer = 0;
        } else if (ai.alertTimer >= ALERT_DURATION) {
          // Lost sight, return to previous state
          ai.state = ai.patrolWaypoints.length > 0 ? 'patrol' : 'idle';
          ai.stateTimer = 0;
          ai.alertTimer = 0;
        }
      }

      return { type: 'none' };
    }

    // -----------------------------------------------------------------
    // PURSUE: Moving toward player
    // -----------------------------------------------------------------
    case 'pursue': {
      if (canSeePlayer) {
        ai.lastKnownPlayerPos = { ...playerPos };
        ai.stateTimer = 0; // Reset timeout when we can see player
      }

      // Timeout: lost player for too long
      if (ai.stateTimer > PURSUE_TIMEOUT) {
        ai.state = ai.patrolWaypoints.length > 0 ? 'patrol' : 'idle';
        ai.stateTimer = 0;
        return { type: 'none' };
      }

      // Check if in attack range
      const attackRange = isMelee ? MELEE_RANGE : (getWeaponConfig(config.weaponId ?? '')?.range ?? 25);

      if (canSeePlayer && dist <= attackRange) {
        ai.state = 'attack';
        ai.stateTimer = 0;
        return { type: 'none' };
      }

      // Move toward last known position
      const moveTarget = ai.lastKnownPlayerPos ?? playerPos;
      return {
        type: 'move',
        targetPosition: { ...moveTarget },
      };
    }

    // -----------------------------------------------------------------
    // ATTACK: Engaging the player
    // -----------------------------------------------------------------
    case 'attack': {
      if (!canSeePlayer) {
        ai.state = 'pursue';
        ai.stateTimer = 0;
        return { type: 'none' };
      }

      ai.lastKnownPlayerPos = { ...playerPos };

      const attackRange = isMelee ? MELEE_RANGE : (getWeaponConfig(config.weaponId ?? '')?.range ?? 25);

      // Out of range, switch to pursue
      if (dist > attackRange * 1.2) {
        ai.state = 'pursue';
        ai.stateTimer = 0;
        return { type: 'none' };
      }

      // Attack on cooldown
      if (ai.attackCooldown > 0) {
        // Strafe or reposition while waiting
        if (isRanged && rng() > 0.5) {
          // Strafe perpendicular to player
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

      // Compute attack cooldown from enemy-adjusted weapon fire rate
      let fireRate = 0.8; // attacks per second (default)
      if (config.weaponId) {
        fireRate = getEnemyFireRate(config.weaponId);
      }
      ai.attackCooldown = 1.0 / Math.max(0.1, fireRate);

      // FPS accuracy check: uses distance-based falloff
      const accuracyRoll = rng() * 100;
      const hitChance = getEnemyAccuracyAtDistance(
        ai.enemyId,
        ai.level,
        dist,
        'normal', // difficulty applied externally by CombatManager
        false,    // cover check would be done by CombatManager with scene info
      );

      if (accuracyRoll > hitChance) {
        // Missed — still consume the attack cooldown
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

    // -----------------------------------------------------------------
    // FLEE: Running away from player
    // -----------------------------------------------------------------
    case 'flee': {
      // Flee in the opposite direction from the player
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

      // If far enough away, transition to idle
      if (dist > ALERT_RADIUS * 1.5) {
        ai.state = 'idle';
        ai.stateTimer = 0;
      }

      return {
        type: 'flee',
        targetPosition: fleeTarget,
      };
    }

  }
}

// ---------------------------------------------------------------------------
// Batch update for all enemies
// ---------------------------------------------------------------------------

/**
 * Update YUKA entity manager. Call once per frame.
 */
export function updateAIEntityManager(dt: number): void {
  entityManager.update(dt);
}

/**
 * Apply AI movement intent to the enemy's position.
 * Call after updateEnemyAI to actually move the enemy based on the returned action.
 */
export function applyAIMovement(
  ai: EnemyAIState,
  action: AIAction,
  dt: number,
): void {
  if (action.type === 'move' || action.type === 'flee') {
    if (action.targetPosition) {
      // Use YUKA vehicle for smooth steering
      const target = new YukaVector3(
        action.targetPosition.x,
        action.targetPosition.y,
        action.targetPosition.z,
      );

      // Clear existing behaviors and add seek/flee
      ai.vehicle.steering.clear();

      if (action.type === 'flee') {
        const flee = new FleeBehavior(target);
        ai.vehicle.steering.add(flee);
      } else {
        const seek = new SeekBehavior(target);
        ai.vehicle.steering.add(seek);
      }

      // Sync vehicle position back to AI state
      ai.position.x = ai.vehicle.position.x;
      ai.position.y = ai.vehicle.position.y;
      ai.position.z = ai.vehicle.position.z;
    }
  }
}
