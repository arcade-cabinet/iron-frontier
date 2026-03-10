/**
 * Spatial Primitives - Base coordinate and building schemas
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

export const HexCoordSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});
export type HexCoord = z.infer<typeof HexCoordSchema>;

/** 3D world-space position in meters */
export const Vec3Schema = z.object({
  x: z.number(), // East-West (positive = east)
  y: z.number().default(0), // Elevation (positive = up)
  z: z.number(), // North-South (positive = south)
});
export type Vec3 = z.infer<typeof Vec3Schema>;

/** Compass facing in degrees: 0=north, 90=east, 180=south, 270=west */
export const FacingSchema = z.number().min(0).max(360);

export const WorldPosSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type WorldPos = z.infer<typeof WorldPosSchema>;

export const HexRotationSchema = z.number().int().min(0).max(5);

// ============================================================================
// BUILDING FOOTPRINT - Physical dimensions of a building
// ============================================================================

/** Physical building dimensions in meters for 3D placement validation */
export const BuildingFootprintSchema = z.object({
  /** Width in meters (along x axis) */
  width: z.number().positive(),
  /** Depth in meters (along z axis) */
  depth: z.number().positive(),
  /** Height in meters (for collision/visibility) */
  height: z.number().positive().default(4),
  /** Door offset from front-center in meters (x, z relative to building center) */
  doorOffset: Vec3Schema.optional(),
});
export type BuildingFootprint = z.infer<typeof BuildingFootprintSchema>;
