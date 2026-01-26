/**
 * Iron Frontier - World Data Schema Layer
 *
 * This module exports all schemas and types for the authored game world.
 * It provides the data definition layer (DDL) for:
 * - Towns: Settlement definitions with NPCs, shops, and buildings
 * - Routes: Travel paths with encounters, events, and landmarks
 * - World: Complete world configuration with time, difficulty, and factions
 *
 * Usage:
 * ```typescript
 * import {
 *   TownSchema,
 *   RouteSchema,
 *   WorldDefinitionSchema,
 *   validateWorld,
 *   type Town,
 *   type Route,
 *   type WorldDefinition,
 * } from '@iron-frontier/shared/data/world';
 * ```
 *
 * @module data/world
 */

// ============================================================================
// TOWN EXPORTS
// ============================================================================

export {
  // Schema version
  TOWN_SCHEMA_VERSION,
  // Utility functions
  calculateTownDistance,
  getBuildingsByType,
  getShopsByType,
  isTownUnlocked,
  safeParseTown,
  // Validators
  validateTown,
  validateTownIntegrity,
  // Types
  type Town,
  type TownBuilding,
  // Building schemas
  TownBuildingSchema,
  type TownBuildingType,
  TownBuildingTypeSchema,
  type TownPosition,
  TownPositionSchema,
  // Schemas
  TownSchema,
  type TownShop,
  TownShopSchema,
  type TownSize,
  TownSizeSchema,
  type TownTheme,
  TownThemeSchema,
  type TownUnlockCondition,
  TownUnlockConditionSchema,
} from './townSchema';

// ============================================================================
// ROUTE EXPORTS
// ============================================================================

export {
  // Utility types
  type EncounterTrigger,
  // Schemas
  EncounterTriggerSchema,
  type EventTriggerType,
  EventTriggerTypeSchema,
  getLandmarksInRange,
  isRoutePassable,
  type LandmarkType,
  LandmarkTypeSchema,
  // Types
  type Route,
  type RouteCondition,
  RouteConditionSchema,
  type RouteEncounter,
  RouteEncounterSchema,
  type RouteEvent,
  RouteEventSchema,
  type RouteLandmark,
  RouteLandmarkSchema,
  RouteSchema,
  // Schema version
  ROUTE_SCHEMA_VERSION,
  type RouteTerrain,
  RouteTerrainSchema,
  safeParseRoute,
  // Utility functions
  selectRandomEncounter,
  // Validators
  validateRoute,
  validateRouteIntegrity,
  // Additional utilities
  calculateTravelTime,
} from './routeSchema';

// ============================================================================
// WORLD EXPORTS
// ============================================================================

export {
  calculateRouteTravelTime,
  // Difficulty configuration
  type DifficultyConfig,
  DifficultyConfigSchema,
  type DifficultyPreset,
  DifficultyPresetSchema,
  // Faction
  type Faction,
  FactionSchema,
  findRoute,
  getConnectedTowns,
  getDifficultyModifiers,
  getFactionById,
  getRouteById,
  getRoutesForTown,
  getTimeOfDay,
  // Utility functions
  getTownById,
  safeParseWorld,
  // Starting conditions
  type StartingConditions,
  StartingConditionsSchema,
  // Survival configuration
  type SurvivalConfig,
  SurvivalConfigSchema,
  // Time configuration
  type TimeConfig,
  TimeConfigSchema,
  // Validators
  validateWorld,
  validateWorldIntegrity,
  // World configuration
  type WorldConfig,
  WorldConfigSchema,
  // Types
  type WorldDefinition,
  // Schemas
  WorldDefinitionSchema,
  // Schema version
  WORLD_SCHEMA_VERSION,
} from './worldSchema';

// ============================================================================
// COMBINED SCHEMA VERSION
// ============================================================================

/**
 * Combined schema version for the world data layer.
 * Increment when any component schema has breaking changes.
 */
export const DATA_WORLD_SCHEMA_VERSION = '1.0.0';

// ============================================================================
// TYPE RE-EXPORTS FOR CONVENIENCE
// ============================================================================

/**
 * All town-related types bundled together.
 */
export type TownTypes = {
  Town: import('./townSchema').Town;
  TownShop: import('./townSchema').TownShop;
  TownBuilding: import('./townSchema').TownBuilding;
  TownPosition: import('./townSchema').TownPosition;
  TownSize: import('./townSchema').TownSize;
  TownTheme: import('./townSchema').TownTheme;
  TownBuildingType: import('./townSchema').TownBuildingType;
  TownUnlockCondition: import('./townSchema').TownUnlockCondition;
};

/**
 * All route-related types bundled together.
 */
export type RouteTypes = {
  Route: import('./routeSchema').Route;
  RouteEncounter: import('./routeSchema').RouteEncounter;
  RouteEvent: import('./routeSchema').RouteEvent;
  RouteLandmark: import('./routeSchema').RouteLandmark;
  RouteTerrain: import('./routeSchema').RouteTerrain;
  RouteCondition: import('./routeSchema').RouteCondition;
  EncounterTrigger: import('./routeSchema').EncounterTrigger;
  EventTriggerType: import('./routeSchema').EventTriggerType;
  LandmarkType: import('./routeSchema').LandmarkType;
};

/**
 * All world-related types bundled together.
 */
export type WorldTypes = {
  WorldDefinition: import('./worldSchema').WorldDefinition;
  WorldConfig: import('./worldSchema').WorldConfig;
  TimeConfig: import('./worldSchema').TimeConfig;
  DifficultyConfig: import('./worldSchema').DifficultyConfig;
  DifficultyPreset: import('./worldSchema').DifficultyPreset;
  SurvivalConfig: import('./worldSchema').SurvivalConfig;
  Faction: import('./worldSchema').Faction;
  StartingConditions: import('./worldSchema').StartingConditions;
};

// ============================================================================
// VALIDATION BUNDLE
// ============================================================================

/**
 * Validate all components of a world definition.
 * Returns an array of error messages, empty if valid.
 */
export function validateWorldComplete(data: unknown): string[] {
  const errors: string[] = [];

  // First, validate the basic schema
  try {
    const world = WorldDefinitionSchema.parse(data);

    // Then check world integrity
    errors.push(...validateWorldIntegrity(world));

    // Validate each town's integrity
    for (const town of world.towns) {
      const townErrors = validateTownIntegrity(town);
      if (townErrors.length > 0) {
        errors.push(...townErrors.map((e) => `Town "${town.id}": ${e}`));
      }
    }

    // Validate each route's integrity
    for (const route of world.routes) {
      const routeErrors = validateRouteIntegrity(route);
      if (routeErrors.length > 0) {
        errors.push(...routeErrors.map((e) => `Route "${route.id}": ${e}`));
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Schema validation failed: ${error.message}`);
    } else {
      errors.push('Schema validation failed with unknown error');
    }
  }

  return errors;
}

// Import necessary types for the validation function
import { validateTownIntegrity } from './townSchema';
import { validateRouteIntegrity } from './routeSchema';
import { WorldDefinitionSchema, validateWorldIntegrity } from './worldSchema';

// ============================================================================
// ROUTE DATA EXPORTS
// ============================================================================

export {
  // Individual route definitions
  DustyTrail,
  DesertPass,
  MountainRoad,
  BadlandsTrail,
  FinalTrail,
  // Route registry
  ALL_ROUTES,
  ROUTES_BY_ID,
  ALL_ROUTE_IDS,
  type RouteId,
  // Route lookup functions
  getRouteById as getRouteDataById,
  getRoutesFromTown,
  getRoutesToTown,
  getRoutesBetweenTowns,
  getRoutesByTerrain,
  getRoutesByDangerLevel,
  getRoutesByTag,
  getPassableRoutes,
  calculatePathTravelTime,
  getAllLandmarks,
  getAllEvents,
  getRouteStats,
} from './routes/index';
