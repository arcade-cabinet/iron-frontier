/**
 * Name Generator - Procedural name generation for NPCs and places
 *
 * Uses name pools and patterns to generate contextually appropriate names.
 */

import {
  type NameOrigin,
  type NamePool,
  type PlaceNamePool,
  substituteTemplate,
} from '../../schemas/generation';
import type { SeededRandom } from '../seededRandom';

// These will be populated by the pool files
let NAME_POOLS: Record<NameOrigin, NamePool> | null = null;
let PLACE_NAME_POOLS: Record<string, PlaceNamePool> | null = null;

/**
 * Initialize name pools (called once at startup)
 */
export function initNamePools(
  namePools: Record<NameOrigin, NamePool>,
  placeNamePools: Record<string, PlaceNamePool>
): void {
  NAME_POOLS = namePools;
  PLACE_NAME_POOLS = placeNamePools;
}

/**
 * Gender for name generation
 */
export type NameGender = 'male' | 'female' | 'neutral';

/**
 * Generated name result
 */
export interface GeneratedName {
  fullName: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  title?: string;
  origin: NameOrigin;
  gender: NameGender;
}

/**
 * Generate a name from a specific origin pool
 */
export function generateName(
  rng: SeededRandom,
  origin: NameOrigin,
  gender?: NameGender,
  options: {
    includeNickname?: boolean;
    includeTitle?: boolean;
    pattern?: string;
  } = {}
): GeneratedName {
  if (!NAME_POOLS) {
    throw new Error('Name pools not initialized. Call initNamePools first.');
  }

  const pool = NAME_POOLS[origin];
  if (!pool) {
    throw new Error(`No name pool found for origin: ${origin}`);
  }

  // Determine gender if not specified
  const selectedGender = gender ?? (rng.bool(0.5) ? 'male' : 'female');

  // Select first name based on gender
  let firstName: string;
  if (selectedGender === 'male') {
    firstName = rng.pick(pool.maleFirst);
  } else if (selectedGender === 'female') {
    firstName = rng.pick(pool.femaleFirst);
  } else {
    // Neutral - pick from neutral pool or randomly from male/female
    if (pool.neutralFirst.length > 0) {
      firstName = rng.pick(pool.neutralFirst);
    } else {
      firstName = rng.bool(0.5) ? rng.pick(pool.maleFirst) : rng.pick(pool.femaleFirst);
    }
  }

  // Select last name
  const lastName = rng.pick(pool.surnames);

  // Optional nickname
  const nickname =
    options.includeNickname && pool.nicknames.length > 0 && rng.bool(0.3)
      ? rng.pick(pool.nicknames)
      : undefined;

  // Optional title
  const title =
    options.includeTitle && pool.titles.length > 0 && rng.bool(0.2)
      ? rng.pick(pool.titles)
      : undefined;

  // Select pattern or use default
  const pattern = options.pattern ?? rng.pick(pool.patterns);

  // Build variable map
  const variables: Record<string, string> = {
    first: firstName,
    last: lastName,
    nickname: nickname ?? firstName,
    title: title ?? '',
  };

  // Generate full name using pattern
  let fullName = substituteTemplate(pattern, variables);

  // Clean up extra spaces from empty variables
  fullName = fullName.replace(/\s+/g, ' ').trim();

  return {
    fullName,
    firstName,
    lastName,
    nickname,
    title,
    origin,
    gender: selectedGender,
  };
}

/**
 * Generate a name with weighted origin selection
 */
export function generateNameWeighted(
  rng: SeededRandom,
  originWeights: Array<{ origin: NameOrigin; weight: number }>,
  gender?: NameGender,
  options: {
    includeNickname?: boolean;
    includeTitle?: boolean;
  } = {}
): GeneratedName {
  const origins = originWeights.map((w) => w.origin);
  const weights = originWeights.map((w) => w.weight);
  const selectedOrigin = rng.weightedPick(origins, weights);

  return generateName(rng, selectedOrigin, gender, options);
}

/**
 * Generated place name result
 */
export interface GeneratedPlaceName {
  name: string;
  poolType: string;
}

/**
 * Generate a place name
 */
export function generatePlaceName(rng: SeededRandom, poolType: string): GeneratedPlaceName {
  if (!PLACE_NAME_POOLS) {
    throw new Error('Place name pools not initialized. Call initNamePools first.');
  }

  const pool = PLACE_NAME_POOLS[poolType];
  if (!pool) {
    // Fallback to generic generation
    return {
      name: `Unknown ${poolType}`,
      poolType,
    };
  }

  // Select pattern
  const pattern = rng.pick(pool.patterns);

  // Build variable map
  const variables: Record<string, string> = {
    adj: rng.pick(pool.adjectives),
    noun: rng.pick(pool.nouns),
    suffix: pool.suffixes.length > 0 ? rng.pick(pool.suffixes) : '',
    possessive: pool.possessives.length > 0 ? rng.pick(pool.possessives) : '',
  };

  // Generate name using pattern
  let name = substituteTemplate(pattern, variables);
  name = name.replace(/\s+/g, ' ').trim();

  return {
    name,
    poolType,
  };
}

/**
 * Generate a unique name not in the existing set
 */
export function generateUniqueName(
  rng: SeededRandom,
  origin: NameOrigin,
  existingNames: Set<string>,
  maxAttempts = 100
): GeneratedName | null {
  for (let i = 0; i < maxAttempts; i++) {
    const name = generateName(rng, origin);
    if (!existingNames.has(name.fullName.toLowerCase())) {
      return name;
    }
  }
  return null;
}

/**
 * Generate an outlaw alias
 */
export function generateOutlawAlias(rng: SeededRandom): string {
  if (!NAME_POOLS) {
    throw new Error('Name pools not initialized.');
  }

  const outlawPool = NAME_POOLS['outlaw'];
  if (!outlawPool || outlawPool.nicknames.length === 0) {
    return 'The Stranger';
  }

  const nickname = rng.pick(outlawPool.nicknames);
  const lastName = rng.pick(outlawPool.surnames);

  // Various alias patterns
  const patterns = [
    `${nickname} ${lastName}`,
    `"${nickname}"`,
    `${lastName} the ${nickname.replace(/^The\s+/i, '')}`,
    `${nickname}`,
  ];

  return rng.pick(patterns);
}

/**
 * Generate an automaton designation
 */
export function generateAutomatonDesignation(rng: SeededRandom): string {
  if (!NAME_POOLS) {
    throw new Error('Name pools not initialized.');
  }

  const mechPool = NAME_POOLS['mechanical'];
  if (!mechPool) {
    // Fallback pattern
    const prefix = rng.pick(['UNIT', 'MODEL', 'BRASS', 'IRON', 'STEAM']);
    const number = rng.int(1, 999);
    return `${prefix}-${number}`;
  }

  return generateName(rng, 'mechanical').fullName;
}
