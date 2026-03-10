/**
 * DDL Loader - Data Definition Language loader with caching
 *
 * Loads and parses DDL JSON files from the assets directory.
 * Provides typed accessors for common DDL data patterns.
 *
 * Inspired by stellar-descent's ddl-loader pattern.
 *
 * @module game/ddl/loader
 */

import type {
  AudioDDL,
  CampaignDDL,
  EnvironmentMode,
  LevelDDL,
  LightingDDL,
  ObjectiveDDL,
  PostProcessingDDL,
  SpawnPointsDDL,
  WeatherDDL,
} from './types';
import { CampaignDDLSchema, LevelDDLSchema } from './schema';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Base path for DDL assets */
const DDL_BASE_PATH = '/assets/campaigns';

/** Default campaign ID */
const DEFAULT_CAMPAIGN = 'frontier_territory';

// ============================================================================
// CACHE
// ============================================================================

/** Cache of loaded level DDL files */
const levelCache = new Map<string, LevelDDL>();

/** Cache of loaded campaign DDL files */
const campaignCache = new Map<string, CampaignDDL>();

// ============================================================================
// ERROR TYPES
// ============================================================================

export class DDLLoadError extends Error {
  constructor(
    message: string,
    public readonly levelId: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'DDLLoadError';
  }
}

export class DDLValidationError extends Error {
  constructor(
    message: string,
    public readonly levelId: string,
    public readonly errors: unknown[]
  ) {
    super(message);
    this.name = 'DDLValidationError';
  }
}

// ============================================================================
// CORE LOADER FUNCTIONS
// ============================================================================

/**
 * Load a level DDL file by ID.
 * Results are cached for the session lifetime.
 *
 * @param levelId - Level identifier
 * @param campaignId - Campaign identifier (defaults to frontier_territory)
 * @returns Parsed LevelDDL
 * @throws DDLLoadError if file cannot be loaded
 * @throws DDLValidationError if file fails validation
 */
export async function loadLevelDDL(
  levelId: string,
  campaignId: string = DEFAULT_CAMPAIGN
): Promise<LevelDDL> {
  const cacheKey = `${campaignId}/${levelId}`;

  if (levelCache.has(cacheKey)) {
    return levelCache.get(cacheKey)!;
  }

  const url = `${DDL_BASE_PATH}/${campaignId}/levels/${levelId}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new DDLLoadError(
        `Failed to load DDL: ${response.status} ${response.statusText}`,
        levelId
      );
    }

    const raw = await response.json();
    const result = LevelDDLSchema.safeParse(raw);

    if (!result.success) {
      throw new DDLValidationError(
        `DDL validation failed for ${levelId}`,
        levelId,
        result.error.issues
      );
    }

    const ddl = result.data;
    levelCache.set(cacheKey, ddl);
    return ddl;
  } catch (error) {
    if (error instanceof DDLLoadError || error instanceof DDLValidationError) {
      throw error;
    }
    throw new DDLLoadError(`Failed to load DDL for ${levelId}`, levelId, error);
  }
}

/**
 * Load a level DDL synchronously from cache.
 * Returns undefined if not cached.
 */
export function getLevelDDL(
  levelId: string,
  campaignId: string = DEFAULT_CAMPAIGN
): LevelDDL | undefined {
  return levelCache.get(`${campaignId}/${levelId}`);
}

/**
 * Preload multiple level DDL files.
 * Useful for preloading an entire campaign.
 */
export async function preloadLevelDDLs(
  levelIds: string[],
  campaignId: string = DEFAULT_CAMPAIGN
): Promise<Map<string, LevelDDL>> {
  const results = new Map<string, LevelDDL>();

  await Promise.all(
    levelIds.map(async (levelId) => {
      try {
        const ddl = await loadLevelDDL(levelId, campaignId);
        results.set(levelId, ddl);
      } catch (error) {
        console.error(`Failed to preload DDL for ${levelId}:`, error);
        throw error;
      }
    })
  );

  return results;
}

/**
 * Load a campaign DDL file.
 */
export async function loadCampaignDDL(
  campaignId: string = DEFAULT_CAMPAIGN
): Promise<CampaignDDL> {
  if (campaignCache.has(campaignId)) {
    return campaignCache.get(campaignId)!;
  }

  const url = `${DDL_BASE_PATH}/${campaignId}/campaign.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new DDLLoadError(
        `Failed to load campaign DDL: ${response.status}`,
        campaignId
      );
    }

    const raw = await response.json();
    const result = CampaignDDLSchema.safeParse(raw);

    if (!result.success) {
      throw new DDLValidationError(
        `Campaign DDL validation failed`,
        campaignId,
        result.error.issues
      );
    }

    const ddl = result.data;
    campaignCache.set(campaignId, ddl);
    return ddl;
  } catch (error) {
    if (error instanceof DDLLoadError || error instanceof DDLValidationError) {
      throw error;
    }
    throw new DDLLoadError(`Failed to load campaign ${campaignId}`, campaignId, error);
  }
}

/**
 * Clear all DDL caches.
 */
export function clearDDLCache(): void {
  levelCache.clear();
  campaignCache.clear();
}

// ============================================================================
// DATA ACCESSORS
// ============================================================================

/**
 * Get the player spawn position for a level as {x, y, z}.
 */
export function getPlayerSpawnPosition(ddl: LevelDDL): {
  x: number;
  y: number;
  z: number;
} {
  const [x, y, z] = ddl.spawnPoints.player;
  return { x, y, z };
}

/**
 * Get the player spawn rotation for a level (radians, defaults to 0).
 */
export function getPlayerSpawnRotation(ddl: LevelDDL): number {
  return ddl.spawnPoints.playerRotation ?? 0;
}

/**
 * Get the environment mode for a level.
 */
export function getEnvironmentMode(ddl: LevelDDL): EnvironmentMode {
  return ddl.environmentMode;
}

/**
 * Get the lighting mode for a level.
 */
export function getLightingMode(ddl: LevelDDL): EnvironmentMode {
  return ddl.lighting.mode;
}

/**
 * Get all objectives for a level.
 */
export function getObjectives(ddl: LevelDDL): ObjectiveDDL[] {
  return ddl.objectives;
}

/**
 * Get required (non-optional) objectives for a level.
 */
export function getRequiredObjectives(ddl: LevelDDL): ObjectiveDDL[] {
  return ddl.objectives.filter((obj) => !obj.optional);
}

/**
 * Get optional objectives for a level.
 */
export function getOptionalObjectives(ddl: LevelDDL): ObjectiveDDL[] {
  return ddl.objectives.filter((obj) => obj.optional === true);
}

/**
 * Get the audio configuration for a level.
 */
export function getAudioConfig(ddl: LevelDDL): AudioDDL | undefined {
  return ddl.audio;
}

/**
 * Get the weather configuration for a level.
 */
export function getWeatherConfig(ddl: LevelDDL): WeatherDDL | undefined {
  return ddl.weather;
}

/**
 * Get the next level ID in campaign order.
 */
export function getNextLevelId(ddl: LevelDDL): string | null {
  return ddl.nextLevelId ?? null;
}

/**
 * Get the previous level ID in campaign order.
 */
export function getPreviousLevelId(ddl: LevelDDL): string | null {
  return ddl.previousLevelId ?? null;
}

/**
 * Get NPC spawn configurations for a level.
 */
export function getNPCSpawns(
  ddl: LevelDDL
): Array<{ npcId: string; position: { x: number; y: number; z: number }; rotation: number }> {
  const npcs = ddl.spawnPoints.npcs ?? [];
  return npcs.map(({ npcId, position, rotation }) => ({
    npcId,
    position: { x: position[0], y: position[1], z: position[2] },
    rotation: rotation ?? 0,
  }));
}

/**
 * Get item spawn configurations for a level.
 */
export function getItemSpawns(
  ddl: LevelDDL
): Array<{
  itemId: string;
  position: { x: number; y: number; z: number };
  quantity: number;
}> {
  const items = ddl.spawnPoints.items ?? [];
  return items.map(({ itemId, position, quantity }) => ({
    itemId,
    position: { x: position[0], y: position[1], z: position[2] },
    quantity: quantity ?? 1,
  }));
}

/**
 * Get the lighting configuration for a level.
 */
export function getLightingConfig(ddl: LevelDDL): LightingDDL {
  return ddl.lighting;
}

/**
 * Get point light names for a level.
 */
export function getPointLightNames(ddl: LevelDDL): string[] {
  return (ddl.lighting.overrides?.pointLights ?? []).map((light) => light.name);
}

/**
 * Check whether a level has a player torch (cave levels).
 */
export function hasPlayerTorch(ddl: LevelDDL): boolean {
  return ddl.lighting.overrides?.playerTorch?.enabled === true;
}

/**
 * Get the post-processing configuration for a level.
 */
export function getPostProcessingConfig(ddl: LevelDDL): PostProcessingDDL {
  return ddl.postProcessing;
}

/**
 * Get the chapter number for a level.
 */
export function getChapter(ddl: LevelDDL): number | undefined {
  return ddl.chapter;
}

/**
 * Get the act name for a level.
 */
export function getActName(ddl: LevelDDL): string | undefined {
  return ddl.actName;
}

/**
 * Get the full spawn points configuration for a level.
 */
export function getSpawnPoints(ddl: LevelDDL): SpawnPointsDDL {
  return ddl.spawnPoints;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a DDL chain (nextLevelId/previousLevelId consistency).
 * Returns an array of error messages. Empty array means valid.
 */
export async function validateDDLChain(
  campaignId: string = DEFAULT_CAMPAIGN
): Promise<string[]> {
  const errors: string[] = [];

  try {
    const campaign = await loadCampaignDDL(campaignId);
    const allDDLs = await preloadLevelDDLs(campaign.levelIds, campaignId);

    for (const [levelId, ddl] of allDDLs) {
      // Verify nextLevelId points to a valid level
      if (ddl.nextLevelId !== null && ddl.nextLevelId !== undefined) {
        if (!allDDLs.has(ddl.nextLevelId)) {
          errors.push(`${levelId}: nextLevelId "${ddl.nextLevelId}" not found`);
        }
      }

      // Verify previousLevelId points to a valid level
      if (ddl.previousLevelId !== null && ddl.previousLevelId !== undefined) {
        if (!allDDLs.has(ddl.previousLevelId)) {
          errors.push(`${levelId}: previousLevelId "${ddl.previousLevelId}" not found`);
        }
      }

      // Verify environment mode is valid
      const validModes: EnvironmentMode[] = ['town', 'wilderness', 'cave', 'interior', 'camp'];
      if (!validModes.includes(ddl.environmentMode)) {
        errors.push(`${levelId}: invalid environmentMode "${ddl.environmentMode}"`);
      }

      // Verify lighting mode matches or is valid
      if (!validModes.includes(ddl.lighting.mode)) {
        errors.push(`${levelId}: invalid lighting mode "${ddl.lighting.mode}"`);
      }

      // Verify post-processing mode is valid
      if (!validModes.includes(ddl.postProcessing.mode)) {
        errors.push(`${levelId}: invalid postProcessing mode "${ddl.postProcessing.mode}"`);
      }

      // Verify player spawn is a 3-element array
      if (!Array.isArray(ddl.spawnPoints.player) || ddl.spawnPoints.player.length !== 3) {
        errors.push(`${levelId}: invalid player spawn point`);
      }

      // Verify objectives have unique IDs
      const objIds = ddl.objectives.map((o) => o.id);
      const uniqueIds = new Set(objIds);
      if (objIds.length !== uniqueIds.size) {
        errors.push(`${levelId}: duplicate objective IDs`);
      }
    }
  } catch (error) {
    errors.push(`Failed to validate DDL chain: ${error}`);
  }

  return errors;
}
