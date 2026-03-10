/**
 * Hex Location Schemas - Town and location map definitions
 *
 * Defines hex-based location/town maps with their assemblages,
 * NPCs, containers, and entry points. These are the detailed
 * interior maps distinct from the world-level LocationRef.
 */

import { z } from 'zod';

import { PlacedAssemblageSchema } from './assemblage.ts';
import { ContainerSchema } from './container.ts';
import { HexCoordSchema, TerrainTypeSchema, TileDefSchema } from './hex-primitives.ts';
import { NPCSchema } from './hex-npc.ts';

// ============================================================================
// LOCATION TYPE & SIZE
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
  'special',
]);
export type LocationType = z.infer<typeof LocationTypeSchema>;

export const TownSizeSchema = z.enum([
  'tiny', // 1-3 buildings (camp, outpost)
  'small', // 4-8 buildings (village)
  'medium', // 9-20 buildings (town)
  'large', // 21-50 buildings (large town)
  'huge', // 50+ buildings (city)
]);
export type TownSize = z.infer<typeof TownSizeSchema>;

// ============================================================================
// TOWN / LOCATION
// ============================================================================

/**
 * Town / Location - A complete hex map location
 */
export const TownSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Location type */
  type: LocationTypeSchema,

  /** Size category */
  size: TownSizeSchema,

  /** Description */
  description: z.string().optional(),

  /** Lore/history text */
  lore: z.string().optional(),

  /** Generation seed (for reproducibility) */
  seed: z.number().int(),

  /** Map dimensions */
  width: z.number().int().min(8).max(128),
  height: z.number().int().min(8).max(128),

  /** Base biome for empty tiles */
  baseBiome: TerrainTypeSchema,

  /**
   * Assemblages placed in this town
   * These are layered ON TOP of base terrain
   */
  assemblages: z.array(PlacedAssemblageSchema).default([]),

  /**
   * Override tiles - specific tiles that override everything
   * Used for custom terrain shaping, roads, etc.
   */
  overrideTiles: z.array(TileDefSchema).default([]),

  /** NPCs in this location */
  npcs: z.array(NPCSchema).default([]),

  /** Containers */
  containers: z.array(ContainerSchema).default([]),

  /** Entry points from world map */
  entryPoints: z
    .array(
      z.object({
        id: z.string(),
        coord: HexCoordSchema,
        direction: z.enum(['north', 'south', 'east', 'west']),
        label: z.string().optional(),
      })
    )
    .min(1),

  /** Connections to other locations (for fast travel, etc) */
  connections: z
    .array(
      z.object({
        targetLocationId: z.string(),
        type: z.enum(['road', 'railroad', 'trail', 'river']),
      })
    )
    .default([]),

  /** Faction control */
  controllingFaction: z.string().optional(),

  /** Economy level (affects shops, prices) */
  economyLevel: z.number().int().min(1).max(10).default(5),

  /** Danger level (affects encounters nearby) */
  dangerLevel: z.number().int().min(0).max(10).default(0),

  /** Tags for generation/filtering */
  tags: z.array(z.string()).default([]),
});
export type Town = z.infer<typeof TownSchema>;
