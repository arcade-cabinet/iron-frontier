/**
 * Spatial Region & World - World map schemas
 */

import { z } from 'zod';
import { WorldPosSchema } from './primitives.ts';

// ============================================================================
// WORLD LOCATION - Entry on the world map
// ============================================================================

export const WorldLocationSchema = z.object({
  /** Reference to location data */
  locationId: z.string(),
  /** Position on world map */
  worldPos: WorldPosSchema,
  /** Is it visible on map initially? */
  startDiscovered: z.boolean().default(false),
  /** Icon type */
  icon: z.enum([
    'town',
    'city',
    'village',
    'camp',
    'mine',
    'fort',
    'ruins',
    'cave',
    'special',
    'unknown',
  ]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type WorldLocation = z.infer<typeof WorldLocationSchema>;

// ============================================================================
// REGION - World map area
// ============================================================================

export const RegionBiomeSchema = z.enum([
  'desert',
  'grassland',
  'badlands',
  'mountains',
  'forest',
  'swamp',
  'tundra',
]);

export const WorldPathSchema = z.object({
  id: z.string(),
  type: z.enum(['road', 'railroad', 'trail', 'river']),
  points: z.array(WorldPosSchema).min(2),
  /** Travel speed modifier */
  speedModifier: z.number().min(0.1).max(5).default(1),
  tags: z.array(z.string()).default([]),
});
export type WorldPath = z.infer<typeof WorldPathSchema>;

export const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  biome: RegionBiomeSchema,
  description: z.string().optional(),
  /** Bounding box on world map */
  bounds: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }),
  /** Locations in this region */
  locations: z.array(WorldLocationSchema).default([]),
  /** Paths */
  paths: z.array(WorldPathSchema).default([]),
  /** Atmosphere (hints for runtime) */
  atmosphere: z
    .object({
      baseDangerLevel: z.number().int().min(0).max(10).default(1),
      encounterDensity: z.enum(['none', 'rare', 'occasional', 'frequent']).default('occasional'),
    })
    .default(() => ({
      baseDangerLevel: 1,
      encounterDensity: 'occasional' as const,
    })),
  tags: z.array(z.string()).default([]),
});
export type Region = z.infer<typeof RegionSchema>;

// ============================================================================
// WORLD - Top level container
// ============================================================================

export const WorldSchema = z.object({
  name: z.string(),
  version: z.string(),
  seed: z.number().int(),
  worldSize: z.object({
    width: z.number().int().min(100).max(10000),
    height: z.number().int().min(100).max(10000),
  }),
  regions: z.array(RegionSchema),
  /** Starting point for new games */
  startingPoint: z.object({
    regionId: z.string(),
    locationId: z.string(),
    entryPointId: z.string(),
  }),
  tags: z.array(z.string()).default([]),
});
export type World = z.infer<typeof WorldSchema>;
