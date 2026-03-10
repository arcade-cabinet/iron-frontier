/**
 * Iron Frontier - AI System
 *
 * Reads AIBehavior components and updates velocity/rotation accordingly.
 * Supports patrol (follow waypoints), pursue (chase target), flee (run away),
 * idle (stand still), and guard (hold position, face threats).
 *
 * Uses alea PRNG for deterministic AI decisions; no scopedRNG('npc', 42, rngTick()).
 */

import Alea from 'alea';

import type { World } from 'miniplex';
import type { Entity, Position } from '../components';
import { npcs } from '../world';
import { scopedRNG, rngTick } from '../../lib/prng';

// ============================================================================
// CONSTANTS
// ============================================================================

const NPC_MOVE_SPEED = 2.0;
const NPC_RUN_SPEED = 5.0;
const WAYPOINT_ARRIVAL_THRESHOLD = 0.5;
const PURSUE_RANGE = 20.0;
const FLEE_RANGE = 15.0;
const DECISION_INTERVAL = 1.0; // seconds between AI re-evaluations
const IDLE_WANDER_CHANCE = 0.15;
const IDLE_WANDER_RADIUS = 3.0;

// ============================================================================
// HELPERS
// ============================================================================

function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function directionTo(from: Position, to: Position): Position {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 0.001) return { x: 0, y: 0, z: 0 };
  return { x: dx / len, y: dy / len, z: dz / len };
}

function yawFromDirection(dir: Position): number {
  return Math.atan2(dir.x, dir.z);
}

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * External game state the AI system needs to make decisions.
 * Passed in each tick so the system stays a pure function.
 */
export interface AIContext {
  /** Player world position for pursue/flee calculations. */
  playerPosition: Position;
  /** Seeded PRNG instance for deterministic decisions. */
  rng: ReturnType<typeof Alea>;
}

// ============================================================================
// BEHAVIOR HANDLERS
// ============================================================================

/** Entity type with the fields all AI handlers can safely read/write. */
type AIEntity = Entity & Required<Pick<Entity, 'position' | 'aiBehavior'>> & {
  velocity: NonNullable<Entity['velocity']>;
  rotation: NonNullable<Entity['rotation']>;
};

function handleIdle(
  entity: AIEntity,
  ctx: AIContext,
): void {
  // Mostly stand still, occasionally wander a short distance
  if (entity.aiBehavior.decisionCooldown !== undefined && entity.aiBehavior.decisionCooldown > 0) {
    return;
  }

  const roll = ctx.rng();
  if (roll < IDLE_WANDER_CHANCE) {
    // Pick a random nearby point to drift toward
    const angle = ctx.rng() * Math.PI * 2;
    const radius = ctx.rng() * IDLE_WANDER_RADIUS;
    const homePos = entity.npcSchedule?.homePosition ?? entity.position;
    const targetX = homePos.x + Math.cos(angle) * radius;
    const targetZ = homePos.z + Math.sin(angle) * radius;

    const dir = directionTo(entity.position, { x: targetX, y: entity.position.y, z: targetZ });
    entity.velocity.x = dir.x * NPC_MOVE_SPEED * 0.3;
    entity.velocity.z = dir.z * NPC_MOVE_SPEED * 0.3;
    entity.velocity.y = 0;

    if (dir.x !== 0 || dir.z !== 0) {
      entity.rotation.yaw = yawFromDirection(dir);
    }
  } else {
    entity.velocity.x = 0;
    entity.velocity.y = 0;
    entity.velocity.z = 0;
  }

  entity.aiBehavior.decisionCooldown = DECISION_INTERVAL;
}

function handlePatrol(
  entity: AIEntity,
): void {
  const waypoints = entity.aiBehavior.waypoints;
  if (!waypoints || waypoints.length === 0) {
    entity.velocity.x = 0;
    entity.velocity.y = 0;
    entity.velocity.z = 0;
    return;
  }

  const idx = entity.aiBehavior.currentWaypointIndex ?? 0;
  const target = waypoints[idx];
  const dist = distance(entity.position, target);

  if (dist < WAYPOINT_ARRIVAL_THRESHOLD) {
    // Advance to next waypoint (loop)
    entity.aiBehavior.currentWaypointIndex = (idx + 1) % waypoints.length;
  }

  const nextTarget = waypoints[entity.aiBehavior.currentWaypointIndex ?? 0];
  const dir = directionTo(entity.position, nextTarget);
  entity.velocity.x = dir.x * NPC_MOVE_SPEED;
  entity.velocity.y = 0;
  entity.velocity.z = dir.z * NPC_MOVE_SPEED;

  if (dir.x !== 0 || dir.z !== 0) {
    entity.rotation.yaw = yawFromDirection(dir);
  }
}

function handlePursue(
  entity: AIEntity,
  ctx: AIContext,
): void {
  const dist = distance(entity.position, ctx.playerPosition);

  if (dist > PURSUE_RANGE) {
    // Target too far, return to idle
    entity.velocity.x = 0;
    entity.velocity.y = 0;
    entity.velocity.z = 0;
    return;
  }

  const dir = directionTo(entity.position, ctx.playerPosition);
  const speed = dist > 5 ? NPC_RUN_SPEED : NPC_MOVE_SPEED;
  entity.velocity.x = dir.x * speed;
  entity.velocity.y = 0;
  entity.velocity.z = dir.z * speed;

  if (dir.x !== 0 || dir.z !== 0) {
    entity.rotation.yaw = yawFromDirection(dir);
  }
}

function handleFlee(
  entity: AIEntity,
  ctx: AIContext,
): void {
  const dist = distance(entity.position, ctx.playerPosition);

  if (dist > FLEE_RANGE) {
    // Far enough, stop running
    entity.velocity.x = 0;
    entity.velocity.y = 0;
    entity.velocity.z = 0;
    return;
  }

  // Run away from player
  const dir = directionTo(ctx.playerPosition, entity.position);
  entity.velocity.x = dir.x * NPC_RUN_SPEED;
  entity.velocity.y = 0;
  entity.velocity.z = dir.z * NPC_RUN_SPEED;

  if (dir.x !== 0 || dir.z !== 0) {
    entity.rotation.yaw = yawFromDirection(dir);
  }
}

function handleGuard(
  entity: AIEntity,
  ctx: AIContext,
): void {
  // Hold position but face toward the player if within detection range
  entity.velocity.x = 0;
  entity.velocity.y = 0;
  entity.velocity.z = 0;

  const dist = distance(entity.position, ctx.playerPosition);
  if (dist < PURSUE_RANGE) {
    const dir = directionTo(entity.position, ctx.playerPosition);
    if (dir.x !== 0 || dir.z !== 0) {
      entity.rotation.yaw = yawFromDirection(dir);
    }
  }
}

// ============================================================================
// SYSTEM ENTRY POINT
// ============================================================================

/**
 * Tick all NPC AI behaviors.
 * Reads AIBehavior.type and delegates to the appropriate handler.
 */
export function aiSystem(
  _world: World<Entity>,
  deltaTime: number,
  ctx: AIContext,
): void {
  for (const entity of npcs) {
    // Tick decision cooldown
    if (entity.aiBehavior.decisionCooldown !== undefined && entity.aiBehavior.decisionCooldown > 0) {
      entity.aiBehavior.decisionCooldown -= deltaTime;
    }

    // Ensure velocity and rotation exist so handlers can write to them
    if (!entity.velocity) {
      (entity as Entity).velocity = { x: 0, y: 0, z: 0 };
    }
    if (!entity.rotation) {
      (entity as Entity).rotation = { yaw: 0, pitch: 0 };
    }

    // Safe cast: we just ensured velocity and rotation are present
    const aiEntity = entity as unknown as AIEntity;

    switch (entity.aiBehavior.type) {
      case 'idle':
        handleIdle(aiEntity, ctx);
        break;
      case 'patrol':
        handlePatrol(aiEntity);
        break;
      case 'pursue':
        handlePursue(aiEntity, ctx);
        break;
      case 'flee':
        handleFlee(aiEntity, ctx);
        break;
      case 'guard':
        handleGuard(aiEntity, ctx);
        break;
    }
  }
}
