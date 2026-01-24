/**
 * Data Library - All game data definitions and loaders
 *
 * This module exports all the spatial, assemblage, location, and world data
 * that defines Iron Frontier's game world.
 *
 * Architecture:
 * - Schemas: Zod-validated data definitions (DDL)
 * - Assemblages: Reusable building templates
 * - Locations: Hand-crafted places (towns, mines, hideouts)
 * - Worlds: Complete world definitions with regions and connections
 */

// ============================================================================
// SCHEMAS
// ============================================================================

export {
  // Spatial primitives
  HexCoordSchema,
  TerrainTypeSchema,
  FeatureTypeSchema,
  EdgeTypeSchema,
  StructureTypeSchema,

  // Spatial composites
  TileDefSchema,
  MarkerSchema,
  ZoneSchema,
  SlotInstanceSchema,
  AssemblageSchema,
  LocationSchema,

  // Validators
  validateTileDef,
  validateMarker,
  validateZone,
  validateSlotInstance,
  validateAssemblage,
  validateLocation,

  // Types
  type HexCoord,
  type TileDef,
  type Marker,
  type Zone,
  type SlotInstance,
  type Assemblage,
  type AssemblageRef,
  type Location,
} from './schemas/spatial';

export {
  // World primitives
  WorldCoordSchema,
  RegionBiomeSchema,
  DangerLevelSchema,
  LocationTypeSchema,
  TravelMethodSchema,

  // World composites
  RegionSchema,
  LocationRefSchema,
  ConnectionSchema,
  WorldSchema,

  // Validators
  validateWorld,

  // Utilities
  getLocationsInRegion,
  getConnectionsFrom,
  getRegionAt,
  getLocationAt,

  // Types
  type WorldCoord,
  type Region,
  type LocationRef,
  type Connection,
  type World,
} from './schemas/world';

// ============================================================================
// ASSEMBLAGES
// ============================================================================

export {
  // Individual assemblages
  Saloon,
  SmallTavern,
  GeneralStore,
  Gunsmith,
  Bank,
  SheriffOffice,
  Church,
  TrainStation,
  Cabin,
  House,
  Mansion,
  Well,
  Stable,
  MineEntrance,
  Campfire,
  TentCamp,
  BanditCamp,
  SmallFarm,
  CattleRanch,
  AbandonedCabin,
  GhostTown,
  Oasis,
  RockFormation,
  CanyonPass,
  Waystation,
  TelegraphPost,

  // Library and utilities
  ASSEMBLAGE_LIBRARY,
  ASSEMBLAGES_BY_ID,
  getAssemblagesBySlot,
  getAssemblagesByTag,
} from './assemblages/library';

// ============================================================================
// LOCATIONS
// ============================================================================

export {
  // Individual locations
  TestTown,
  CopperMine,
  DesertWaystation,
  SunsetRanch,
  RattlesnakeCanyon,

  // Registry
  LOCATIONS_BY_ID,
  getLocationById,
  getAllLocationIds,
} from './locations/index';

// ============================================================================
// WORLDS
// ============================================================================

export {
  // World definitions
  FrontierTerritory,

  // World loader
  loadWorld,
  getLocationData,
  validateWorldReferences,
  getTravelInfo,

  // Registry
  WORLDS_BY_ID,
  getWorldById,
  getAllWorldIds,

  // Types
  type LoadedWorld,
  type ResolvedLocation,
} from './worlds/index';
