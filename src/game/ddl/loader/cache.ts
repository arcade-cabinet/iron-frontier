/**
 * DDL cache management — shared caches and constants for the loader.
 *
 * @module game/ddl/loader/cache
 */

import type { CampaignDDL, LevelDDL } from '../types.ts';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Base path for DDL assets */
export const DDL_BASE_PATH = '/assets/campaigns';

/** Default campaign ID */
export const DEFAULT_CAMPAIGN = 'frontier_territory';

// ============================================================================
// CACHE
// ============================================================================

/** Cache of loaded level DDL files */
export const levelCache = new Map<string, LevelDDL>();

/** Cache of loaded campaign DDL files */
export const campaignCache = new Map<string, CampaignDDL>();

/**
 * Clear all DDL caches.
 */
export function clearDDLCache(): void {
  levelCache.clear();
  campaignCache.clear();
}
