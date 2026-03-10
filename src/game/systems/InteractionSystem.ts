/**
 * InteractionSystem.ts - Pure logic for player-world interactions
 *
 * Determines what the player can interact with based on proximity and facing
 * direction. Returns an InteractionTarget describing the nearest interactable
 * entity, and an InteractionAction when the player presses the interact key.
 *
 * No React dependencies - this is a pure game logic module.
 *
 * @module systems/InteractionSystem
 */

import type { InputFrame } from '../input/InputFrame';

// ============================================================================
// TYPES
// ============================================================================

/** The kind of interaction available. */
export type InteractionType = 'talk' | 'shop' | 'enter' | 'pickup' | 'lockpick';

/** A 3D position vector. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Describes an entity in the world that can be interacted with. */
export interface InteractableEntity {
  id: string;
  name: string;
  position: Vec3;
  /** What kind of interaction this entity supports. */
  interactionType: InteractionType;
  /** Maximum distance at which this entity can be interacted with. */
  interactionRange: number;
  /** For NPCs: the NPC definition ID. */
  npcId?: string;
  /** For merchants: the shop ID to open. */
  shopId?: string;
  /** For buildings: the building/archetype ID. */
  buildingId?: string;
  /** For buildings: the archetype type key. */
  archetypeId?: string;
  /** For items: the item ID. */
  itemId?: string;
  /** For locked containers/doors: the lock difficulty level (1-5). */
  lockLevel?: number;
  /** Whether this entity is currently interactable. */
  enabled?: boolean;
}

/** The result of scanning for nearby interactables. */
export interface InteractionTarget {
  type: InteractionType;
  entityId: string;
  name: string;
  position: Vec3;
  distance: number;
  /** NPC ID when type is 'talk' or 'shop'. */
  npcId?: string;
  /** Shop ID when type is 'shop'. */
  shopId?: string;
  /** Building ID when type is 'enter'. */
  buildingId?: string;
  /** Archetype ID when type is 'enter'. */
  archetypeId?: string;
  /** Item ID when type is 'pickup'. */
  itemId?: string;
  /** Lock level when type is 'lockpick'. */
  lockLevel?: number;
}

/** An action the game loop should execute in response to interaction. */
export interface InteractionAction {
  type: InteractionType;
  entityId: string;
  /** NPC ID for 'talk' or 'shop' actions. */
  npcId?: string;
  /** Shop ID for 'shop' action. */
  shopId?: string;
  /** Building ID for 'enter' action. */
  buildingId?: string;
  /** Archetype ID for 'enter' action. */
  archetypeId?: string;
  /** Item ID for 'pickup' action. */
  itemId?: string;
  /** Lock level for 'lockpick' action. */
  lockLevel?: number;
}

/** Full result returned by processInteraction. */
export interface InteractionResult {
  /** The nearest valid target, or null if nothing is in range. */
  target: InteractionTarget | null;
  /** An action to execute, or null if the player did not press interact or no target. */
  action: InteractionAction | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default interaction ranges by type. */
export const DEFAULT_RANGES: Record<InteractionType, number> = {
  talk: 3.0,
  shop: 3.0,
  enter: 2.5,
  pickup: 2.0,
  lockpick: 2.0,
};

/** Minimum dot product between player forward and entity direction for facing check. */
const FACING_DOT_THRESHOLD = 0.5;

// ============================================================================
// HELPERS
// ============================================================================

/** Compute the XZ distance between two positions (ignoring Y). */
function distanceXZ(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Compute the dot product of the player forward vector and the direction
 * from the player to the entity, projected onto the XZ plane.
 * Returns a value in [-1, 1] where 1 means directly facing the entity.
 */
function facingDot(playerPos: Vec3, playerForward: Vec3, entityPos: Vec3): number {
  const dx = entityPos.x - playerPos.x;
  const dz = entityPos.z - playerPos.z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.001) return 1; // Entity is on top of player, always "facing"

  const nx = dx / len;
  const nz = dz / len;

  // Normalize forward vector onto XZ plane
  const fLen = Math.sqrt(playerForward.x * playerForward.x + playerForward.z * playerForward.z);
  if (fLen < 0.001) return 0;

  const fx = playerForward.x / fLen;
  const fz = playerForward.z / fLen;

  return fx * nx + fz * nz;
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Scan for the nearest interactable entity and optionally trigger an action.
 *
 * Call this once per game tick. It is stateless and produces no side effects.
 *
 * @param playerPos     - The player's world position.
 * @param playerForward - The player's facing direction (unit vector preferred).
 * @param entities      - All interactable entities in the current scene.
 * @param inputFrame    - The current tick's input state snapshot.
 * @returns An InteractionResult with the nearest target and an action if interact was pressed.
 */
export function processInteraction(
  playerPos: Vec3,
  playerForward: Vec3,
  entities: readonly InteractableEntity[],
  inputFrame: Readonly<InputFrame>,
): InteractionResult {
  let bestTarget: InteractionTarget | null = null;
  let bestDistance = Infinity;

  for (const entity of entities) {
    // Skip disabled entities
    if (entity.enabled === false) continue;

    const dist = distanceXZ(playerPos, entity.position);
    const range = entity.interactionRange;

    // Out of range
    if (dist > range) continue;

    // Check facing direction
    const dot = facingDot(playerPos, playerForward, entity.position);
    if (dot < FACING_DOT_THRESHOLD) continue;

    // Prefer the closest valid target
    if (dist < bestDistance) {
      bestDistance = dist;
      bestTarget = {
        type: entity.interactionType,
        entityId: entity.id,
        name: entity.name,
        position: entity.position,
        distance: dist,
        npcId: entity.npcId,
        shopId: entity.shopId,
        buildingId: entity.buildingId,
        archetypeId: entity.archetypeId,
        itemId: entity.itemId,
        lockLevel: entity.lockLevel,
      };
    }
  }

  // Determine action
  let action: InteractionAction | null = null;
  if (inputFrame.interact && bestTarget) {
    action = {
      type: bestTarget.type,
      entityId: bestTarget.entityId,
      npcId: bestTarget.npcId,
      shopId: bestTarget.shopId,
      buildingId: bestTarget.buildingId,
      archetypeId: bestTarget.archetypeId,
      itemId: bestTarget.itemId,
      lockLevel: bestTarget.lockLevel,
    };
  }

  return { target: bestTarget, action };
}

// ============================================================================
// ENTITY FACTORY HELPERS
// ============================================================================

/**
 * Create an InteractableEntity for an NPC.
 * Automatically determines whether this is a 'talk' or 'shop' NPC based on shopId.
 */
export function createNPCInteractable(
  id: string,
  name: string,
  position: Vec3,
  options?: {
    npcId?: string;
    shopId?: string;
    range?: number;
    enabled?: boolean;
  },
): InteractableEntity {
  const hasShop = !!options?.shopId;
  return {
    id,
    name,
    position,
    interactionType: hasShop ? 'shop' : 'talk',
    interactionRange: options?.range ?? DEFAULT_RANGES.talk,
    npcId: options?.npcId ?? id,
    shopId: options?.shopId,
    enabled: options?.enabled ?? true,
  };
}

/**
 * Create an InteractableEntity for a building door / entrance.
 */
export function createBuildingInteractable(
  id: string,
  name: string,
  position: Vec3,
  buildingId: string,
  archetypeId: string,
  options?: {
    range?: number;
    enabled?: boolean;
  },
): InteractableEntity {
  return {
    id,
    name,
    position,
    interactionType: 'enter',
    interactionRange: options?.range ?? DEFAULT_RANGES.enter,
    buildingId,
    archetypeId,
    enabled: options?.enabled ?? true,
  };
}

/**
 * Create an InteractableEntity for a locked container or door.
 */
export function createLockpickInteractable(
  id: string,
  name: string,
  position: Vec3,
  lockLevel: number,
  options?: {
    range?: number;
    enabled?: boolean;
  },
): InteractableEntity {
  return {
    id,
    name,
    position,
    interactionType: 'lockpick',
    interactionRange: options?.range ?? DEFAULT_RANGES.lockpick,
    lockLevel,
    enabled: options?.enabled ?? true,
  };
}

/**
 * Create an InteractableEntity for a world item pickup.
 */
export function createItemInteractable(
  id: string,
  name: string,
  position: Vec3,
  itemId: string,
  options?: {
    range?: number;
    enabled?: boolean;
  },
): InteractableEntity {
  return {
    id,
    name,
    position,
    interactionType: 'pickup',
    interactionRange: options?.range ?? DEFAULT_RANGES.pickup,
    itemId,
    enabled: options?.enabled ?? true,
  };
}
