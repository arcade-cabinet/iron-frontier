/**
 * InteractionSystem types - Type definitions for player-world interactions
 *
 * @module systems/InteractionSystem/types
 */

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
