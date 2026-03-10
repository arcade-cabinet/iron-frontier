/**
 * Assemblage Schemas - Reusable tile groupings (prefabs)
 *
 * Assemblages are composable groups of hex tiles that can be
 * placed within towns as pre-built structures and features.
 */

import { z } from 'zod';

import {
  HexCoordSchema,
  HexRotationSchema,
  TerrainTypeSchema,
  TileDefSchema,
} from './hex-primitives.ts';

// ============================================================================
// ASSEMBLAGE TYPES
// ============================================================================

export const AssemblageTypeSchema = z.enum([
  // Single buildings with surroundings
  'single_cabin',
  'single_house',
  'single_mansion',
  'single_saloon',
  'single_store',
  'single_bank',
  'single_church',
  'single_sheriff',

  // Functional groups
  'ranch',
  'farm',
  'mine_entrance',
  'lumber_camp',
  'train_depot',
  'water_station',

  // Town features
  'town_square',
  'main_street_segment',
  'residential_block',
  'commercial_block',
  'industrial_yard',

  // Decorative/filler
  'empty_lot',
  'garden',
  'graveyard',
  'corral',

  // Special
  'custom',
]);
export type AssemblageType = z.infer<typeof AssemblageTypeSchema>;

// ============================================================================
// ASSEMBLAGE DEFINITION
// ============================================================================

/**
 * Assemblage - A reusable grouping of tiles
 * Like a prefab that can be placed in towns
 */
export const AssemblageSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Human-readable name */
  name: z.string(),

  /** Assemblage category */
  type: AssemblageTypeSchema,

  /** Description for editors/generation */
  description: z.string().optional(),

  /** Tags for filtering/selection */
  tags: z.array(z.string()).default([]),

  /**
   * Tile definitions - coordinates are relative to (0,0) anchor
   * The anchor tile should always exist at {q:0, r:0}
   */
  tiles: z.array(TileDefSchema).min(1),

  /** Valid rotations this assemblage supports (default: all) */
  validRotations: z.array(HexRotationSchema).default([0, 1, 2, 3, 4, 5]),

  /** Required terrain types this can be placed on */
  requiredTerrain: z.array(TerrainTypeSchema).optional(),

  /** Terrain types this CANNOT be placed on */
  forbiddenTerrain: z.array(TerrainTypeSchema).optional(),

  /** Minimum distance from water (in tiles) */
  minWaterDistance: z.number().int().min(0).default(0),

  /** Must be adjacent to road/path */
  requiresRoadAccess: z.boolean().default(false),
});
export type Assemblage = z.infer<typeof AssemblageSchema>;

// ============================================================================
// PLACED ASSEMBLAGE
// ============================================================================

/** Placed assemblage within a town */
export const PlacedAssemblageSchema = z.object({
  /** Reference to assemblage definition */
  assemblageId: z.string(),

  /** Position of assemblage anchor in town coordinates */
  position: HexCoordSchema,

  /** Rotation (0-5) */
  rotation: HexRotationSchema.default(0),
});
export type PlacedAssemblage = z.infer<typeof PlacedAssemblageSchema>;
