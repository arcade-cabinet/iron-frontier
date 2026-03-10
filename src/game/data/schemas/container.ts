/**
 * Container Schemas - Lootable container definitions
 *
 * Defines chests, crates, barrels, and other interactable
 * containers that hold items within hex-based locations.
 */

import { z } from 'zod';

import { HexCoordSchema } from './hex-primitives.ts';

// ============================================================================
// CONTAINER TYPES
// ============================================================================

export const ContainerTypeSchema = z.enum([
  'chest',
  'crate',
  'barrel',
  'locker',
  'safe',
  'desk',
  'cabinet',
  'grave',
  'trash',
]);
export type ContainerType = z.infer<typeof ContainerTypeSchema>;

// ============================================================================
// CONTAINER DEFINITION
// ============================================================================

export const ContainerSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Container type (affects model) */
  type: ContainerTypeSchema,

  /** Position */
  coord: HexCoordSchema,

  /** Is it locked? */
  locked: z.boolean().default(false),

  /** Lock difficulty (if locked) */
  lockDifficulty: z.number().int().min(0).max(100).optional(),

  /** Key item ID (if locked) */
  keyId: z.string().optional(),

  /** Loot table reference */
  lootTable: z.string().optional(),

  /** Fixed items (override loot table) */
  fixedItems: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional(),

  /** Respawns? */
  respawns: z.boolean().default(false),
});
export type Container = z.infer<typeof ContainerSchema>;
