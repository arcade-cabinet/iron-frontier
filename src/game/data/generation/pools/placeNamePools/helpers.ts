/**
 * Place Name Pools - Registry and generation functions
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';
import { substituteTemplate } from '../../../schemas/generation.ts';
import type { SeededRandom } from '../../seededRandom.ts';
import { TOWN_NAME_POOL, RANCH_NAME_POOL, OUTPOST_NAME_POOL } from './settlements.ts';
import { MINE_NAME_POOL, LANDMARK_NAME_POOL, STATION_NAME_POOL } from './features.ts';

export const PLACE_NAME_POOLS: Record<string, PlaceNamePool> = {
  town_names: TOWN_NAME_POOL,
  ranch_names: RANCH_NAME_POOL,
  mine_names: MINE_NAME_POOL,
  landmark_names: LANDMARK_NAME_POOL,
  outpost_names: OUTPOST_NAME_POOL,
  station_names: STATION_NAME_POOL,
};

/**
 * Get a place name pool by type
 * @param type The pool type identifier
 * @returns The place name pool or undefined if not found
 */
export function getPlaceNamePool(type: string): PlaceNamePool | undefined {
  return PLACE_NAME_POOLS[type];
}

// ============================================================================
// NAME GENERATION
// ============================================================================

/**
 * Letter pool for ranch brand-style names (e.g., "B-Bar Ranch")
 */
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion

/**
 * Generate a place name using a pool and seeded random
 * @param poolId The pool type identifier
 * @param rng Seeded random number generator
 * @returns Generated place name
 */
export function generatePlaceName(poolId: string, rng: SeededRandom): string {
  const pool = getPlaceNamePool(poolId);
  if (!pool) {
    throw new Error(`Unknown place name pool: ${poolId}`);
  }

  // Pick a random pattern
  const pattern = rng.pick(pool.patterns);

  // Build substitution variables
  const variables: Record<string, string> = {};

  // Handle special patterns first
  if (pattern.includes('{{letter}}')) {
    // Generate brand-style names like "B-Bar" or "Double-K"
    const letter1 = LETTERS[rng.int(0, LETTERS.length - 1)];
    const letter2 = LETTERS[rng.int(0, LETTERS.length - 1)];
    variables['letter'] = letter1;
    // Replace second {{letter}} separately if present
    const result = pattern.replace('{{letter}}', letter1).replace('{{letter}}', letter2);
    return applyRemainingSubstitutions(result, pool, rng, variables);
  }

  if (pattern.includes('{{number}}')) {
    // Generate numbered locations like "Shaft 7" or "Mile 42"
    variables['number'] = String(rng.int(1, 99));
  }

  // Standard substitutions
  if (pattern.includes('{{adj}}')) {
    variables['adj'] = rng.pick(pool.adjectives);
  }

  if (pattern.includes('{{noun}}')) {
    variables['noun'] = rng.pick(pool.nouns);
  }

  if (pattern.includes('{{suffix}}')) {
    variables['suffix'] = rng.pick(pool.suffixes);
  }

  if (pattern.includes('{{possessive}}')) {
    variables['possessive'] = rng.pick(pool.possessives);
  }

  return substituteTemplate(pattern, variables);
}

/**
 * Apply remaining substitutions after handling special cases
 */
function applyRemainingSubstitutions(
  result: string,
  pool: PlaceNamePool,
  rng: SeededRandom,
  existingVars: Record<string, string>
): string {
  const variables = { ...existingVars };

  if (result.includes('{{adj}}')) {
    variables['adj'] = rng.pick(pool.adjectives);
  }
  if (result.includes('{{noun}}')) {
    variables['noun'] = rng.pick(pool.nouns);
  }
  if (result.includes('{{suffix}}')) {
    variables['suffix'] = rng.pick(pool.suffixes);
  }
  if (result.includes('{{possessive}}')) {
    variables['possessive'] = rng.pick(pool.possessives);
  }
  if (result.includes('{{number}}')) {
    variables['number'] = String(rng.int(1, 99));
  }

  return substituteTemplate(result, variables);
}

/**
 * Generate multiple unique place names
 * @param poolId The pool type identifier
 * @param count Number of names to generate
 * @param rng Seeded random number generator
 * @returns Array of unique generated names
 */
export function generatePlaceNames(poolId: string, count: number, rng: SeededRandom): string[] {
  const names = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loops

  while (names.size < count && attempts < maxAttempts) {
    names.add(generatePlaceName(poolId, rng));
    attempts++;
  }

  return Array.from(names);
}

/**
 * Generate a place name with specific constraints
 * @param poolId The pool type identifier
 * @param rng Seeded random number generator
 * @param options Generation options
 * @returns Generated place name
 */
export function generateConstrainedPlaceName(
  poolId: string,
  rng: SeededRandom,
  options: {
    /** Prefer patterns containing these variables */
    preferVariables?: ('adj' | 'noun' | 'suffix' | 'possessive')[];
    /** Exclude patterns containing these variables */
    excludeVariables?: ('adj' | 'noun' | 'suffix' | 'possessive')[];
    /** Maximum name length in characters */
    maxLength?: number;
  } = {}
): string {
  const pool = getPlaceNamePool(poolId);
  if (!pool) {
    throw new Error(`Unknown place name pool: ${poolId}`);
  }

  // Filter patterns based on options
  let patterns = [...pool.patterns];

  if (options.preferVariables?.length) {
    const preferred = patterns.filter((p) =>
      options.preferVariables!.some((v) => p.includes(`{{${v}}}`))
    );
    if (preferred.length > 0) {
      patterns = preferred;
    }
  }

  if (options.excludeVariables?.length) {
    patterns = patterns.filter(
      (p) => !options.excludeVariables!.some((v) => p.includes(`{{${v}}}`))
    );
  }

  // Fall back to default if no patterns match
  if (patterns.length === 0) {
    patterns = pool.patterns;
  }

  // Create a temporary pool with filtered patterns
  const tempPool: PlaceNamePool = { ...pool, patterns };

  // Generate with length constraint
  if (options.maxLength) {
    let attempts = 0;
    while (attempts < 20) {
      const tempRng = rng.child(`attempt_${attempts}`);
      const pattern = tempRng.pick(tempPool.patterns);
      const variables: Record<string, string> = {};

      if (pattern.includes('{{adj}}')) {
        variables['adj'] = tempRng.pick(tempPool.adjectives);
      }
      if (pattern.includes('{{noun}}')) {
        variables['noun'] = tempRng.pick(tempPool.nouns);
      }
      if (pattern.includes('{{suffix}}')) {
        variables['suffix'] = tempRng.pick(tempPool.suffixes);
      }
      if (pattern.includes('{{possessive}}')) {
        variables['possessive'] = tempRng.pick(tempPool.possessives);
      }
      if (pattern.includes('{{number}}')) {
        variables['number'] = String(tempRng.int(1, 99));
      }

      const name = substituteTemplate(pattern, variables);
      if (name.length <= options.maxLength) {
        return name;
      }
      attempts++;
    }
  }

  // Generate normally
  const pattern = rng.pick(tempPool.patterns);
  const variables: Record<string, string> = {};

  if (pattern.includes('{{adj}}')) {
    variables['adj'] = rng.pick(tempPool.adjectives);
  }
  if (pattern.includes('{{noun}}')) {
    variables['noun'] = rng.pick(tempPool.nouns);
  }
  if (pattern.includes('{{suffix}}')) {
    variables['suffix'] = rng.pick(tempPool.suffixes);
  }
  if (pattern.includes('{{possessive}}')) {
    variables['possessive'] = rng.pick(tempPool.possessives);
  }
  if (pattern.includes('{{number}}')) {
    variables['number'] = String(rng.int(1, 99));
  }

  return substituteTemplate(pattern, variables);
}

/**
 * Get all available pool types
 */
export function getAvailablePoolTypes(): string[] {
  return Object.keys(PLACE_NAME_POOLS);
}
