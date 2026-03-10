/**
 * NPC & Interaction Systems Barrel
 *
 * Re-exports NPC, interaction, and interior systems:
 * InteractionSystem, InteriorManager, NPCScheduleResolver,
 * NPCMovementSystem, DoorSystem
 *
 * @module systems/npc
 */

// Interaction System
export {
  processInteraction,
  createNPCInteractable,
  createBuildingInteractable,
  createItemInteractable,
  DEFAULT_RANGES,
  type InteractionType,
  type Vec3,
  type InteractableEntity,
  type InteractionTarget,
  type InteractionAction,
  type InteractionResult,
} from './InteractionSystem';

// Interior Manager
export {
  InteriorManager,
  getInteriorManager,
  resetInteriorManager,
  type InteriorState,
  type InteriorNPCSlot,
  type InteriorChangeCallback,
} from './InteriorManager';

// NPC Schedule Resolver
export {
  buildLocationMarkerIndex,
  resolveScheduleTarget,
  resolveFullDaySchedule,
  type ResolvedScheduleTarget,
  type NPCInstanceData,
  type LocationMarkerIndex,
} from './NPCScheduleResolver';

// NPC Movement System
export {
  NPCMovementSystem,
  DEFAULT_MOVEMENT_CONFIG,
  type NPCMovementState,
  type NPCMovementConfig,
  type NPCMovementContext,
} from './NPCMovementSystem';

// Door System (building entry/exit animation)
export {
  DoorSystem,
  getDoorSystem,
  resetDoorSystem,
  type DoorState,
  type DoorChangeCallback,
} from '../engine/interiors/DoorSystem';
