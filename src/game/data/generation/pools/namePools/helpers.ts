/**
 * Name Pools - Registry and helpers
 */

import {
  type NameOrigin,
  NameOriginSchema,
  type NamePool,
  NamePoolSchema,
  validateNamePool,
} from '../../../schemas/generation.ts';
import { FRONTIER_ANGLO_POOL, FRONTIER_HISPANIC_POOL } from './anglo_hispanic.ts';
import { FRONTIER_NATIVE_POOL, FRONTIER_CHINESE_POOL } from './native_chinese.ts';
import { FRONTIER_EUROPEAN_POOL, OUTLAW_POOL, MECHANICAL_POOL } from './european_outlaw_mechanical.ts';

export const NAME_POOLS: Record<NameOrigin, NamePool> = {
  frontier_anglo: FRONTIER_ANGLO_POOL,
  frontier_hispanic: FRONTIER_HISPANIC_POOL,
  frontier_native: FRONTIER_NATIVE_POOL,
  frontier_chinese: FRONTIER_CHINESE_POOL,
  frontier_european: FRONTIER_EUROPEAN_POOL,
  outlaw: OUTLAW_POOL,
  mechanical: MECHANICAL_POOL,
};

/**
 * Get a name pool for a specific origin, with validation
 * @param origin The name origin type
 * @returns The validated NamePool
 * @throws If the origin is invalid or pool fails validation
 */
export function getNamePool(origin: NameOrigin): NamePool {
  // Validate the origin
  const validOrigin = NameOriginSchema.parse(origin);

  // Get the pool
  const pool = NAME_POOLS[validOrigin];
  if (!pool) {
    throw new Error(`No name pool found for origin: ${origin}`);
  }

  // Validate and return
  return validateNamePool(pool);
}

/**
 * Get all available name origins
 */
export function getAvailableOrigins(): NameOrigin[] {
  return Object.keys(NAME_POOLS) as NameOrigin[];
}

/**
 * Check if a name pool exists for an origin
 */
export function hasNamePool(origin: string): origin is NameOrigin {
  return origin in NAME_POOLS;
}

// ============================================================================
// VALIDATION ON MODULE LOAD
// Ensure all pools are valid when the module is imported
// ============================================================================

// Validate all pools at module load time
for (const [origin, pool] of Object.entries(NAME_POOLS)) {
  try {
    NamePoolSchema.parse(pool);
  } catch (error) {
    console.error(`Invalid name pool for origin "${origin}":`, error);
    throw new Error(`Name pool validation failed for origin: ${origin}`);
  }
}
