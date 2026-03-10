/**
 * Iron Frontier - Entity Archetypes (Factory Functions)
 *
 * Each function creates a specific kind of entity and adds it to the world.
 * Archetypes compose the right set of components for their role.
 */

import type { EnemyDefinition } from '../data/schemas/combat';
import type { NPCDefinition } from '../data/schemas/npc';
import type { WeaponStats } from '../data/schemas/item';
import type {
  AIBehaviorType,
  Entity,
  Position,
} from './components';
import { world } from './world';

// ============================================================================
// NPC ARCHETYPE
// ============================================================================

export interface CreateNPCConfig {
  dialogueTreeId?: string;
  questIds?: string[];
  shopId?: string;
  factionId?: string;
  factionReputation?: number;
  homePosition?: Position;
  currentActivity?: string;
  aiBehavior?: AIBehaviorType;
  waypoints?: Position[];
}

/**
 * Create an NPC entity from an NPCDefinition (or loose params).
 * NPCs have dialogue, schedule, optional faction, and idle AI by default.
 */
export function createNPC(
  definition: NPCDefinition,
  position: Position,
  config: CreateNPCConfig = {},
): Entity {
  const entity: Entity = {
    name: definition.name,
    tag: `npc:${definition.id}`,
    position: { ...position },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: { yaw: 0, pitch: 0 },
    health: { current: 100, max: 100 },
    aiBehavior: {
      type: config.aiBehavior ?? 'idle',
      waypoints: config.waypoints,
      currentWaypointIndex: 0,
      decisionCooldown: 0,
    },
    collider: { type: 'capsule', radius: 0.4 },
  };

  // Dialogue
  const dialogueTreeId = config.dialogueTreeId ?? definition.primaryDialogueId;
  if (dialogueTreeId) {
    entity.dialogueTarget = {
      npcId: definition.id,
      dialogueTreeId,
    };
  }

  // Quest giver
  const questIds = config.questIds ?? (definition.questGiver ? definition.questIds : undefined);
  if (questIds && questIds.length > 0) {
    entity.questGiver = { questIds: [...questIds] };
  }

  // Shop keeper
  const shopId = config.shopId ?? definition.shopId;
  if (shopId) {
    entity.shopKeeper = { shopId };
  }

  // Faction
  const factionId = config.factionId ?? definition.faction;
  if (factionId && factionId !== 'neutral') {
    entity.faction = {
      id: factionId,
      reputation: config.factionReputation ?? 0,
    };
  }

  // Schedule
  const homePos = config.homePosition ?? { ...position };
  entity.npcSchedule = {
    currentActivity: config.currentActivity ?? 'idle',
    homePosition: homePos,
  };

  return world.add(entity);
}

// ============================================================================
// ENEMY ARCHETYPE
// ============================================================================

export interface CreateEnemyConfig {
  aiBehavior?: AIBehaviorType;
  waypoints?: Position[];
  lootOverride?: Array<{ itemId: string; chance: number; quantity: number }>;
  healthScale?: number;
}

/**
 * Create an enemy entity from an EnemyDefinition.
 * Enemies always have health, AI, loot, and a collider.
 */
export function createEnemy(
  definition: EnemyDefinition,
  position: Position,
  config: CreateEnemyConfig = {},
): Entity {
  const healthScale = config.healthScale ?? 1;
  const scaledMaxHealth = Math.round(definition.maxHealth * healthScale);

  // Map enemy behavior string to AI behavior type
  const behaviorMap: Record<string, AIBehaviorType> = {
    aggressive: 'pursue',
    defensive: 'guard',
    ranged: 'guard',
    support: 'patrol',
  };

  const entity: Entity = {
    name: definition.name,
    tag: `enemy:${definition.id}`,
    position: { ...position },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: { yaw: 0, pitch: 0 },
    health: {
      current: scaledMaxHealth,
      max: scaledMaxHealth,
    },
    aiBehavior: {
      type: config.aiBehavior ?? behaviorMap[definition.behavior] ?? 'idle',
      waypoints: config.waypoints,
      currentWaypointIndex: 0,
      decisionCooldown: 0,
    },
    loot: {
      items: config.lootOverride ?? [
        { itemId: 'dollars', chance: 0.8, quantity: definition.goldReward },
      ],
    },
    collider: { type: 'capsule', radius: 0.5 },
  };

  // Faction based on enemy definition
  if (definition.faction) {
    entity.faction = {
      id: definition.faction,
      reputation: -50,
    };
  }

  return world.add(entity);
}

// ============================================================================
// PROJECTILE ARCHETYPE
// ============================================================================

/**
 * Create a projectile entity from weapon stats and firing parameters.
 * Projectiles travel in a straight line and have a limited lifetime.
 */
export function createProjectile(
  origin: Position,
  direction: Position,
  weaponStats: WeaponStats,
): Entity {
  const speed = weaponStats.weaponType === 'explosive' ? 15 : 80;
  const lifetime = weaponStats.range / speed;

  // Normalize the direction vector
  const len = Math.sqrt(
    direction.x * direction.x +
    direction.y * direction.y +
    direction.z * direction.z,
  );
  const safeLen = len > 0 ? len : 1;
  const normDir: Position = {
    x: direction.x / safeLen,
    y: direction.y / safeLen,
    z: direction.z / safeLen,
  };

  const entity: Entity = {
    tag: `projectile:${weaponStats.weaponType}`,
    position: { ...origin },
    velocity: {
      x: normDir.x * speed,
      y: normDir.y * speed,
      z: normDir.z * speed,
    },
    projectile: {
      weaponId: weaponStats.weaponType,
      damage: weaponStats.damage,
      speed,
      origin: { ...origin },
      direction: normDir,
      lifetime,
      age: 0,
    },
    collider: { type: 'sphere', radius: 0.05 },
    lifetime: { remaining: lifetime },
  };

  return world.add(entity);
}

// ============================================================================
// PICKUP ARCHETYPE
// ============================================================================

/**
 * Create a pickup entity that the player can collect.
 */
export function createPickup(
  itemId: string,
  quantity: number,
  position: Position,
): Entity {
  const entity: Entity = {
    tag: `pickup:${itemId}`,
    position: { ...position },
    pickup: { itemId, quantity },
    collider: { type: 'sphere', radius: 0.3 },
  };

  return world.add(entity);
}

// ============================================================================
// PARTICLE ARCHETYPE
// ============================================================================

/**
 * Create a visual-only particle entity with a limited lifetime.
 * Particles are purely cosmetic and get cleaned up by LifetimeSystem.
 */
export function createParticle(
  type: string,
  position: Position,
  lifetime: number,
): Entity {
  const entity: Entity = {
    tag: `particle:${type}`,
    position: { ...position },
    velocity: { x: 0, y: 0.5, z: 0 },
    lifetime: { remaining: lifetime },
    particle: {
      type,
      startSize: 0.2,
      endSize: 0.0,
      color: '#ffaa00',
    },
  };

  return world.add(entity);
}
