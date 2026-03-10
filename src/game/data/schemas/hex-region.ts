/**
 * Hex Region Schemas - World map regions with locations and paths
 *
 * Defines the regional structure of the world map including
 * location markers, travel paths, encounter definitions, and
 * region boundaries.
 */

import { z } from 'zod';

import { WorldPosSchema } from './hex-primitives.ts';

// ============================================================================
// REGION BIOME
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
export type RegionBiome = z.infer<typeof RegionBiomeSchema>;

// ============================================================================
// WORLD LOCATION MARKER
// ============================================================================

/** Location marker on world map */
export const WorldLocationSchema = z.object({
  /** Reference to town/location data */
  locationId: z.string(),

  /** Position on world map */
  worldPos: WorldPosSchema,

  /** Is it discovered by player? (for new games) */
  startDiscovered: z.boolean().default(false),

  /** Icon to show on map */
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
});
export type WorldLocation = z.infer<typeof WorldLocationSchema>;

// ============================================================================
// WORLD PATH
// ============================================================================

/** Path on world map (road, railroad, river) */
export const WorldPathSchema = z.object({
  id: z.string(),
  type: z.enum(['road', 'railroad', 'trail', 'river']),
  /** Waypoints defining the path */
  points: z.array(WorldPosSchema).min(2),
  /** Travel speed modifier (1.0 = normal) */
  speedModifier: z.number().min(0.1).max(5).default(1),
});
export type WorldPath = z.infer<typeof WorldPathSchema>;

// ============================================================================
// ENCOUNTER DEFINITION
// ============================================================================

/** Random encounter definition */
export const EncounterDefSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Probability weight */
  weight: z.number().min(0).default(1),
  /** Required conditions */
  conditions: z
    .object({
      minDanger: z.number().int().min(0).max(10).optional(),
      maxDanger: z.number().int().min(0).max(10).optional(),
      biomes: z.array(RegionBiomeSchema).optional(),
      timeOfDay: z.array(z.enum(['day', 'night'])).optional(),
    })
    .optional(),
  /** Encounter map template */
  mapTemplate: z.string().optional(),
  /** Enemy spawn table */
  enemyTable: z.string().optional(),
});
export type EncounterDef = z.infer<typeof EncounterDefSchema>;

// ============================================================================
// REGION DEFINITION
// ============================================================================

/**
 * Region - A world map area
 */
export const RegionSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Primary biome */
  biome: RegionBiomeSchema,

  /** Description */
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

  /** Paths in this region */
  paths: z.array(WorldPathSchema).default([]),

  /** Base danger level */
  dangerLevel: z.number().int().min(0).max(10).default(1),

  /** Random encounter table */
  encounters: z.array(EncounterDefSchema).default([]),

  /** Controlling faction (if any) */
  controllingFaction: z.string().optional(),
});
export type Region = z.infer<typeof RegionSchema>;
