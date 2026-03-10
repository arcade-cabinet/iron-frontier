/**
 * DDL core loader functions — load, get, and preload level/campaign DDLs.
 *
 * @module game/ddl/loader/loaders
 */

import type { CampaignDDL, LevelDDL } from '../types.ts';
import { CampaignDDLSchema, LevelDDLSchema } from '../schema.ts';
import { DDLLoadError, DDLValidationError } from './errors.ts';
import {
  DDL_BASE_PATH,
  DEFAULT_CAMPAIGN,
  levelCache,
  campaignCache,
} from './cache.ts';

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
