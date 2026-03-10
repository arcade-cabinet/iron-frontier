/**
 * Spatial Tiles - Terrain, features, structures, edges, and tile definitions
 */

import { z } from 'zod';
import { HexCoordSchema, HexRotationSchema } from './primitives.ts';

// ============================================================================
// TERRAIN & VISUALS (what it LOOKS like, not what it DOES)
// ============================================================================

export const TerrainTypeSchema = z.enum([
  // Natural
  'grass',
  'grass_hill',
  'grass_forest',
  'sand',
  'sand_hill',
  'sand_dunes',
  'dirt',
  'dirt_hill',
  'stone',
  'stone_hill',
  'stone_mountain',
  'stone_rocks',
  'water',
  'water_shallow',
  'water_deep',
  'mesa',
  'canyon',
  'badlands',
]);

export const FeatureTypeSchema = z.enum([
  'none',
  // Vegetation
  'tree',
  'tree_dead',
  'bush',
  'cactus',
  'cactus_tall',
  'stump',
  'log',
  // Rocks
  'rock_small',
  'rock_large',
  'boulder',
  // Visual-only resources (actual resource spawning is runtime)
  'ore_vein',
  'oil_seep',
  'spring',
  // Western Town Props
  'barrel',
  'barrel_water',
  'barrel_hay',
  'fence',
  'bench',
  'cart',
  'wanted_poster',
  'signpost',
  // Ambient
  'ruins',
  'campfire_pit',
]);

export const StructureTypeSchema = z.enum([
  'none',
  // These are VISUAL MODELS only - functionality comes from slots
  // Residential shells
  'cabin',
  'house',
  'mansion',
  // Commercial shells
  'saloon_building',
  'store_building',
  'bank_building',
  'hotel_building',
  // Industrial shells
  'mine_building',
  'smelter_building',
  'workshop_building',
  'windmill',
  'water_tower',
  // Civic shells
  'office_building',
  'church_building',
  'station_building',
  'telegraph_building',
  // Infrastructure
  'well',
  'stable',
  'warehouse',
  'dock',
  // Defensive
  'watch_tower',
  'fort',
]);

export const EdgeTypeSchema = z.enum([
  'none',
  'river',
  'road',
  'railroad',
  'cliff',
  'bridge',
  'ford',
  'fence',
]);

// ============================================================================
// TILE DEFINITION (visual only)
// ============================================================================

export const TileDefSchema = z.object({
  coord: HexCoordSchema,
  terrain: TerrainTypeSchema,
  elevation: z.number().int().min(0).max(4).optional(),
  feature: FeatureTypeSchema.optional(),
  structure: StructureTypeSchema.optional(),
  structureRotation: HexRotationSchema.optional(),
  edges: z.array(EdgeTypeSchema).length(6).optional(),
  variant: z.number().int().min(0).max(3).optional(),
});
export type TileDef = z.infer<typeof TileDefSchema>;
