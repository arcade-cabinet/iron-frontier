/**
 * Survival Systems for Iron Frontier
 *
 * This module exports all survival-related game systems including:
 * - GameClock: Time tracking and day/night cycles
 * - FatigueSystem: Player fatigue and its effects
 * - ProvisionsSystem: Food and water management
 * - CampingSystem: Wilderness rest and encounters
 *
 * Also includes the SurvivalStore Zustand slice for state management.
 *
 * @module systems
 */

// Time System
export {
  GameClock,
  createGameClock,
  realMsToGameMinutes,
  gameMinutesToRealMs,
  realMsToGameHours,
  DEFAULT_CLOCK_CONFIG,
  DEFAULT_CLOCK_STATE,
  type TimePhase,
  type TimeEventType,
  type TimeEventPayload,
  type TimeEventCallback,
  type GameClockConfig,
  type GameClockState,
} from './time';

// Fatigue System
export {
  FatigueSystem,
  createFatigueSystem,
  calculateTravelFatigue,
  calculateRestRecovery as calculateFatigueRestRecovery,
  getFatigueLevel,
  DEFAULT_FATIGUE_CONFIG,
  DEFAULT_FATIGUE_STATE,
  FATIGUE_EFFECTS,
  type FatigueLevel,
  type FatigueEffects,
  type FatigueConfig,
  type FatigueState,
} from './fatigue';

// Provisions System
export {
  ProvisionsSystem,
  createProvisionsSystem,
  calculateTravelConsumption,
  hasEnoughProvisions,
  getProvisionStatus,
  DEFAULT_PROVISIONS_CONFIG,
  DEFAULT_PROVISIONS_STATE,
  type TerrainType,
  type ProvisionStatus,
  type HuntingResult,
  type ForagingResult,
  type ProvisionsConfig,
  type ProvisionsState,
} from './provisions';

// Camping System
export {
  CampingSystem,
  createCampingSystem,
  calculateRestRecovery as calculateCampRestRecovery,
  getRestDurationLabel,
  getRecommendedRestDuration,
  DEFAULT_CAMPING_CONFIG,
  DEFAULT_CAMPING_STATE,
  type RestDuration,
  type CampActivity,
  type FireState,
  type CampEncounterType,
  type CampEncounter,
  type CampingResult,
  type CampingConfig,
  type CampingState,
} from './camping';

// Survival Store (Zustand slice)
export {
  createSurvivalSlice,
  DEFAULT_SURVIVAL_STATE,
  type SurvivalState,
  type SurvivalActions,
  type SurvivalSlice,
} from './survivalStore';

// ============================================================================
// COMBINED SURVIVAL STATE TYPE
// ============================================================================

import type { GameClockState } from './time';
import type { FatigueState } from './fatigue';
import type { ProvisionsState } from './provisions';
import type { CampingState } from './camping';

/**
 * Combined serializable state for all survival systems.
 * Use this type for save/load functionality.
 */
export interface CombinedSurvivalState {
  clock: GameClockState;
  fatigue: FatigueState;
  provisions: ProvisionsState;
  camping: CampingState;
}

/**
 * Creates default combined survival state.
 */
export function createDefaultSurvivalState(): CombinedSurvivalState {
  return {
    clock: { ...DEFAULT_CLOCK_STATE },
    fatigue: { ...DEFAULT_FATIGUE_STATE },
    provisions: { ...DEFAULT_PROVISIONS_STATE },
    camping: { ...DEFAULT_CAMPING_STATE },
  };
}

// Re-export defaults for convenience
import { DEFAULT_CLOCK_STATE } from './time';
import { DEFAULT_FATIGUE_STATE } from './fatigue';
import { DEFAULT_PROVISIONS_STATE } from './provisions';
import { DEFAULT_CAMPING_STATE } from './camping';

// Encounter System
export {
  EncounterSystem,
  getEncounterSystem,
  createRouteEncounterZones,
  type EncounterZone,
  type EncounterTrigger,
} from './EncounterSystem';

// Save System
export {
  SaveSystem,
  getSaveSystem,
  LocalStorageSaveAdapter,
  type SaveFile,
  type SaveSlotMeta,
  type SaveStorageAdapter,
} from './SaveSystem';

// Spatial Hash (efficient spatial partitioning)
export {
  SpatialHash,
  aabbIntersects,
  aabbContainsPoint,
  circleToAABB,
  aabbCircleIntersects,
  circleIntersects,
  circleContainsPoint,
  aabbCenter,
  aabbExpand,
  aabbFromCenter,
  aabbFromRadius,
  type AABB,
  type Circle,
} from './SpatialHash';

// Zone System
export {
  ZoneSystem,
  getZoneSystem,
  resetZoneSystem,
  TOWN_POSITIONS,
  type Zone,
  type ZoneType,
  type ZoneTransition,
  type ZoneChangeCallback,
  type TransitionCallback,
} from './ZoneSystem';

// Collision System
export {
  CollisionSystem,
  getCollisionSystem,
  resetCollisionSystem,
  createBuildingCollider,
  createNPCCollider,
  createTriggerCollider,
  createTerrainCollider,
  isCircle,
  isAABB,
  type CollisionLayer,
  type Collider,
  type ColliderShape,
  type CollisionResult,
  type MovementCollisionResult,
  type TriggerCallback,
} from './CollisionSystem';
