/**
 * DDL Module - Data Definition Language for level configuration
 *
 * This module provides a data-driven approach to level configuration,
 * allowing levels to be defined in JSON files and loaded at runtime.
 *
 * @module game/ddl
 */

// Types
export type {
  AudioDDL,
  BiomeType,
  CampaignDDL,
  EnvironmentMode,
  HexPosition,
  LevelDDL,
  LightingDDL,
  ObjectiveDDL,
  ObjectiveType,
  PlayerTorchDDL,
  PointLightDDL,
  Position3D,
  PostProcessingDDL,
  SpawnPointsDDL,
  StructureDDL,
  TerrainDDL,
  TimeOfDay,
  WeatherDDL,
  WeatherType,
} from './types';

// Schemas (for validation)
export {
  AudioDDLSchema,
  BiomeTypeSchema,
  CampaignDDLSchema,
  EnvironmentModeSchema,
  HexPositionSchema,
  LevelDDLSchema,
  LightingDDLSchema,
  ObjectiveDDLSchema,
  ObjectiveTypeSchema,
  PlayerTorchDDLSchema,
  PointLightDDLSchema,
  Position3DSchema,
  PostProcessingDDLSchema,
  SpawnPointsDDLSchema,
  StructureDDLSchema,
  TerrainDDLSchema,
  TimeOfDaySchema,
  WeatherDDLSchema,
  WeatherTypeSchema,
} from './schema';

// Loader
export {
  // Core loading
  clearDDLCache,
  DDLLoadError,
  DDLValidationError,
  getLevelDDL,
  loadCampaignDDL,
  loadLevelDDL,
  preloadLevelDDLs,
  // Data accessors
  getActName,
  getAudioConfig,
  getChapter,
  getEnvironmentMode,
  getItemSpawns,
  getLightingConfig,
  getLightingMode,
  getNextLevelId,
  getNPCSpawns,
  getObjectives,
  getOptionalObjectives,
  getPlayerSpawnPosition,
  getPlayerSpawnRotation,
  getPointLightNames,
  getPostProcessingConfig,
  getPreviousLevelId,
  getRequiredObjectives,
  getSpawnPoints,
  getWeatherConfig,
  hasPlayerTorch,
  // Validation
  validateDDLChain,
} from './loader';
