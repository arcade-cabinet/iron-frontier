/**
 * Spatial Location - Location, entry points, and location schema
 */

import { z } from 'zod';
import { BuildingFootprintSchema, HexCoordSchema, HexRotationSchema } from './primitives.ts';
import { NpcMarkerSchema, RoadSegmentSchema, AmbientSoundSchema, LightingHintsSchema, WeatherProfileSchema } from './environment.ts';
import { TileDefSchema, TerrainTypeSchema } from './tiles.ts';
import { SlotInstanceSchema, AssemblageRefSchema } from './slots.ts';

// ============================================================================
// ENTRY POINT - Where players enter/exit
// ============================================================================

export const EntryPointSchema = z.object({
  id: z.string(),
  coord: HexCoordSchema,
  direction: z.enum(['north', 'south', 'east', 'west', 'up', 'down']),
  /** What this entry connects to (road, railroad, etc) */
  connectionType: z.enum(['road', 'trail', 'railroad', 'river', 'stairs', 'portal']).optional(),
  /** Tags for matching */
  tags: z.array(z.string()).default([]),
});
export type EntryPoint = z.infer<typeof EntryPointSchema>;

// ============================================================================
// LOCATION - A complete map (town, dungeon, encounter, etc)
// ============================================================================

export const LocationTypeSchema = z.enum([
  'town',
  'city',
  'village',
  'outpost',
  'mine',
  'camp',
  'ranch',
  'fort',
  'ruins',
  'cave',
  'encounter',
  'special',
]);

export const LocationSizeSchema = z.enum([
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
]);

export const LocationSchema = z.object({
  /** Unique identifier */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Location type */
  type: LocationTypeSchema,
  /** Size category */
  size: LocationSizeSchema,
  /** Flavor text */
  description: z.string().optional(),
  lore: z.string().optional(),
  /** Generation seed */
  seed: z.number().int(),
  /** Map dimensions */
  width: z.number().int().min(8).max(128),
  height: z.number().int().min(8).max(128),
  /** Base terrain for empty tiles */
  baseTerrain: TerrainTypeSchema,
  /** All slot instances in this location */
  slots: z.array(SlotInstanceSchema).default([]),
  /** Assemblage references */
  assemblages: z.array(AssemblageRefSchema).default([]),
  /** Override tiles */
  baseTiles: z.array(TileDefSchema).default([]),
  /** Entry/exit points */
  entryPoints: z.array(EntryPointSchema).min(1),
  /** Player spawn point */
  playerSpawn: z
    .object({
      coord: HexCoordSchema,
      facing: HexRotationSchema.optional(),
    })
    .optional(),
  /** Tags for filtering/matching */
  tags: z.array(z.string()).default([]),
  /** Atmosphere hints */
  atmosphere: z
    .object({
      dangerLevel: z.number().int().min(0).max(10).default(0),
      wealthLevel: z.number().int().min(1).max(10).default(5),
      populationDensity: z.enum(['abandoned', 'sparse', 'normal', 'crowded']).default('normal'),
      lawLevel: z.enum(['lawless', 'frontier', 'orderly', 'strict']).default('frontier'),
      sound: AmbientSoundSchema.optional(),
      lighting: LightingHintsSchema.optional(),
      weather: WeatherProfileSchema.optional(),
    })
    .default(() => ({
      dangerLevel: 0,
      wealthLevel: 5,
      populationDensity: 'normal' as const,
      lawLevel: 'frontier' as const,
    })),
  /** NPC placement markers in world-space */
  npcMarkers: z.array(NpcMarkerSchema).default([]),
  /** Road and path definitions */
  roads: z.array(RoadSegmentSchema).default([]),
  /** Building footprints for overlap validation */
  buildingFootprints: z.record(z.string(), BuildingFootprintSchema).default({}),
});
export type Location = z.infer<typeof LocationSchema>;
