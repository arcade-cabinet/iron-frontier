/**
 * DDL chain validation — verifies consistency of level DDL references.
 *
 * @module game/ddl/loader/validation
 */

import type { EnvironmentMode } from '../types.ts';
import { loadCampaignDDL, preloadLevelDDLs } from './loaders.ts';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CAMPAIGN = 'frontier_territory';

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
