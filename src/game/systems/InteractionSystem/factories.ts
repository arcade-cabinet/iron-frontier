/**
 * InteractionSystem entity factory helpers
 *
 * Convenience functions for creating InteractableEntity instances
 * for various entity types (NPCs, buildings, items, locks).
 *
 * @module systems/InteractionSystem/factories
 */

import type { InteractableEntity, Vec3 } from './types';
import { DEFAULT_RANGES } from './processInteraction';

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
