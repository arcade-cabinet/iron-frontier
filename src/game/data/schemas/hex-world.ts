/**
 * Hex World Schema - Complete game world definition
 *
 * Top-level world schema that ties together regions, factions,
 * starting conditions, and global timeline events.
 */

import { z } from 'zod';

import type { Assemblage } from './assemblage.ts';
import { AssemblageSchema } from './assemblage.ts';
import { HexCoordSchema } from './hex-primitives.ts';
import type { Region } from './hex-region.ts';
import { RegionSchema } from './hex-region.ts';
import type { Town } from './hex-location.ts';
import { TownSchema } from './hex-location.ts';

// ============================================================================
// WORLD DEFINITION
// ============================================================================

/**
 * World - Complete game world definition
 */
export const WorldSchema = z.object({
  /** World name */
  name: z.string(),

  /** Version for save compatibility */
  version: z.string(),

  /** Master seed */
  seed: z.number().int(),

  /** World map dimensions */
  worldSize: z.object({
    width: z.number().int().min(100).max(10000),
    height: z.number().int().min(100).max(10000),
  }),

  /** All regions */
  regions: z.array(RegionSchema),

  /** Global faction definitions */
  factions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        /** Relations with other factions (-100 to 100) */
        relations: z.record(z.string(), z.number().int().min(-100).max(100)).default({}),
      })
    )
    .default([]),

  /** Starting location for new games */
  startingLocation: z.object({
    regionId: z.string(),
    locationId: z.string(),
    coord: HexCoordSchema,
  }),

  /** Global timeline events */
  timeline: z
    .array(
      z.object({
        id: z.string(),
        day: z.number().int().min(0),
        event: z.string(),
        effects: z.array(z.string()).default([]),
      })
    )
    .default([]),
});
export type World = z.infer<typeof WorldSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateAssemblage(data: unknown): Assemblage {
  return AssemblageSchema.parse(data);
}

export function validateTown(data: unknown): Town {
  return TownSchema.parse(data);
}

export function validateRegion(data: unknown): Region {
  return RegionSchema.parse(data);
}

export function validateWorld(data: unknown): World {
  return WorldSchema.parse(data);
}

// ============================================================================
// EXPORTS FOR SUBAGENT GENERATION
// ============================================================================

/**
 * Schema exports for documentation/subagent prompts
 */
export const HEX_SCHEMA_VERSION = '1.0.0';

export const SchemaExports = {
  Assemblage: AssemblageSchema,
  Town: TownSchema,
  Region: RegionSchema,
  World: WorldSchema,
} as const;
