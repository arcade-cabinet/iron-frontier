/**
 * World Schema Definitions - Coordinates, regions, locations, connections
 */

import { z } from 'zod';

// ============================================================================
// WORLD COORDINATES
// ============================================================================

export const WorldCoordSchema = z.object({
  wx: z.number().int(),
  wy: z.number().int(),
});
export type WorldCoord = z.infer<typeof WorldCoordSchema>;

// ============================================================================
// REGION TYPES
// ============================================================================

export const RegionBiomeSchema = z.enum([
  'desert', 'badlands', 'grassland', 'scrubland',
  'mountain', 'riverside', 'salt_flat',
]);
export type RegionBiome = z.infer<typeof RegionBiomeSchema>;

export const DangerLevelSchema = z.enum([
  'safe', 'low', 'moderate', 'high', 'extreme',
]);
export type DangerLevel = z.infer<typeof DangerLevelSchema>;

// ============================================================================
// LOCATION REFERENCE
// ============================================================================

export const LocationTypeSchema = z.enum([
  'city', 'town', 'village', 'hamlet', 'outpost',
  'mine', 'quarry', 'oil_field', 'lumber_camp', 'ranch', 'farm',
  'train_station', 'telegraph_office', 'trading_post', 'waystation',
  'ruins', 'cave', 'camp', 'hideout', 'landmark',
  'wilderness',
]);
export type LocationType = z.infer<typeof LocationTypeSchema>;

export const LocationRefSchema = z.object({
  id: z.string(),
  type: LocationTypeSchema,
  name: z.string(),
  coord: WorldCoordSchema,
  locationDataId: z.string().optional(),
  seed: z.number().int().optional(),
  size: z.enum(['tiny', 'small', 'medium', 'large', 'huge']).default('medium'),
  discovered: z.boolean().default(false),
  accessible: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});
export type LocationRef = z.infer<typeof LocationRefSchema>;

// ============================================================================
// CONNECTIONS
// ============================================================================

export const TravelMethodSchema = z.enum([
  'road', 'trail', 'wilderness', 'railroad', 'river',
]);
export type TravelMethod = z.infer<typeof TravelMethodSchema>;

export const ConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  fromEntryPoint: z.string().optional(),
  toEntryPoint: z.string().optional(),
  method: TravelMethodSchema,
  travelTime: z.number().positive(),
  danger: DangerLevelSchema.default('moderate'),
  bidirectional: z.boolean().default(true),
  passable: z.boolean().default(true),
  blockedReason: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type Connection = z.infer<typeof ConnectionSchema>;

// ============================================================================
// REGION
// ============================================================================

export const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  biome: RegionBiomeSchema,
  baseDanger: DangerLevelSchema,
  bounds: z.object({
    minX: z.number().int(),
    maxX: z.number().int(),
    minY: z.number().int(),
    maxY: z.number().int(),
  }),
  discovered: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});
export type Region = z.infer<typeof RegionSchema>;

// ============================================================================
// WORLD
// ============================================================================

export const WorldSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  seed: z.number().int(),
  dimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  regions: z.array(RegionSchema),
  locations: z.array(LocationRefSchema),
  connections: z.array(ConnectionSchema),
  startingLocationId: z.string(),
  createdAt: z.number().int().optional(),
  version: z.number().int().default(1),
});
export type World = z.infer<typeof WorldSchema>;
