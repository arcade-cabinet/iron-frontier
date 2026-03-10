/**
 * Hex Primitives - Base coordinate and tile type schemas
 *
 * Defines the fundamental building blocks for hex-based world data:
 * coordinates, terrain types, features, buildings, edges, and tiles.
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

/** Hex coordinate in axial system */
export const HexCoordSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});
export type HexCoordData = z.infer<typeof HexCoordSchema>;

/** World map position (separate from hex coords) */
export const WorldPosSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type WorldPosData = z.infer<typeof WorldPosSchema>;

/** Rotation in 60-degree increments (0-5) */
export const HexRotationSchema = z.number().int().min(0).max(5);

// ============================================================================
// TILE TYPES (matching HexTypes.ts enums)
// ============================================================================

export const TerrainTypeSchema = z.enum([
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
export type TerrainType = z.infer<typeof TerrainTypeSchema>;

export const FeatureTypeSchema = z.enum([
  'none',
  'tree',
  'tree_dead',
  'bush',
  'cactus',
  'cactus_tall',
  'rock_small',
  'rock_large',
  'boulder',
  'ore_deposit',
  'oil_seep',
  'spring',
  'ruins',
  'camp',
]);
export type FeatureType = z.infer<typeof FeatureTypeSchema>;

export const BuildingTypeSchema = z.enum([
  'none',
  // Residential
  'cabin',
  'house',
  'mansion',
  // Commercial
  'saloon',
  'general_store',
  'bank',
  'hotel',
  // Industrial
  'mine',
  'smelter',
  'workshop',
  'windmill',
  'water_tower',
  // Civic
  'sheriff_office',
  'church',
  'train_station',
  'telegraph',
  // Infrastructure
  'well',
  'stable',
  'warehouse',
  'dock',
  // Defensive
  'watch_tower',
  'fort',
]);
export type BuildingType = z.infer<typeof BuildingTypeSchema>;

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
export type EdgeType = z.infer<typeof EdgeTypeSchema>;

// ============================================================================
// TILE DEFINITION
// ============================================================================

/** Single hex tile within an assemblage or town */
export const TileDefSchema = z.object({
  /** Relative position within the assemblage/town */
  coord: HexCoordSchema,

  /** Base terrain type */
  terrain: TerrainTypeSchema,

  /** Elevation level 0-4 */
  elevation: z.number().int().min(0).max(4).default(0),

  /** Feature on this tile (vegetation, rocks, etc) */
  feature: FeatureTypeSchema.default('none'),

  /** Building on this tile */
  building: BuildingTypeSchema.default('none'),

  /** Building rotation (0-5 = 0-300 degrees) */
  buildingRotation: HexRotationSchema.default(0),

  /** Edge connections [E, SE, SW, W, NW, NE] */
  edges: z.array(EdgeTypeSchema).length(6).optional(),

  /** Model variant for visual variety (0-3) */
  variant: z.number().int().min(0).max(3).default(0),
});
export type TileDef = z.infer<typeof TileDefSchema>;
