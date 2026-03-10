/**
 * Hex NPC Schemas - NPC definitions for hex-based locations
 *
 * These are hex-map-specific NPC definitions (with hex coordinates,
 * schedules, etc.), distinct from the dialogue-focused NPC schemas
 * in the npc/ subdirectory.
 */

import { z } from 'zod';

import { HexCoordSchema } from './hex-primitives.ts';

// ============================================================================
// NPC ROLE
// ============================================================================

export const HexNPCRoleSchema = z.enum([
  'shopkeeper',
  'bartender',
  'sheriff',
  'deputy',
  'blacksmith',
  'doctor',
  'preacher',
  'banker',
  'rancher',
  'miner',
  'farmer',
  'drifter',
  'outlaw',
  'bounty_hunter',
  'prospector',
  'train_conductor',
  'telegraph_operator',
  'townsperson',
  'child',
]);
export type HexNPCRole = z.infer<typeof HexNPCRoleSchema>;

// ============================================================================
// NPC DEFINITION
// ============================================================================

export const NPCSchema = z.object({
  /** Unique identifier within the location */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Role determines behavior/dialogue */
  role: HexNPCRoleSchema,

  /** Starting hex position */
  spawnCoord: HexCoordSchema,

  /** Schedule: where they go at different times */
  schedule: z
    .array(
      z.object({
        time: z.enum(['morning', 'afternoon', 'evening', 'night']),
        coord: HexCoordSchema,
        activity: z.string().optional(),
      })
    )
    .optional(),

  /** Dialogue tree reference */
  dialogueId: z.string().optional(),

  /** Shop inventory reference (if merchant) */
  shopId: z.string().optional(),

  /** Quest giver flags */
  quests: z.array(z.string()).default([]),

  /** Faction affiliation */
  faction: z.string().optional(),

  /** Is this NPC essential (can't die) */
  essential: z.boolean().default(false),
});
export type NPC = z.infer<typeof NPCSchema>;
