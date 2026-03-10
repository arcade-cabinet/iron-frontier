/**
 * DDL Loader — barrel export for all loader sub-modules.
 *
 * @module game/ddl/loader
 */

// Error types
export { DDLLoadError, DDLValidationError } from './errors.ts';

// Cache management
export { clearDDLCache } from './cache.ts';

// Core loaders
export {
  loadLevelDDL,
  getLevelDDL,
  preloadLevelDDLs,
  loadCampaignDDL,
} from './loaders.ts';

// Data accessors
export {
  getPlayerSpawnPosition,
  getPlayerSpawnRotation,
  getNPCSpawns,
  getItemSpawns,
  getSpawnPoints,
  getEnvironmentMode,
  getLightingMode,
  getAudioConfig,
  getWeatherConfig,
  getObjectives,
  getRequiredObjectives,
  getOptionalObjectives,
  getNextLevelId,
  getPreviousLevelId,
  getChapter,
  getActName,
  getLightingConfig,
  getPointLightNames,
  hasPlayerTorch,
  getPostProcessingConfig,
} from './accessors.ts';

// Validation
export { validateDDLChain } from './validation.ts';
