/**
 * NPC Definition & Personality Schemas
 */

import { z } from 'zod';
import { HexCoordSchema } from '../spatial.ts';

// ============================================================================
// NPC PERSONALITY & APPEARANCE
// ============================================================================

export const NPCPersonalitySchema = z.object({
  aggression: z.number().min(0).max(1).default(0.3),
  friendliness: z.number().min(0).max(1).default(0.5),
  curiosity: z.number().min(0).max(1).default(0.5),
  greed: z.number().min(0).max(1).default(0.3),
  honesty: z.number().min(0).max(1).default(0.7),
  lawfulness: z.number().min(0).max(1).default(0.5),
});
export type NPCPersonality = z.infer<typeof NPCPersonalitySchema>;

export const NPCRoleSchema = z.enum([
  'sheriff', 'deputy', 'mayor',
  'merchant', 'bartender', 'banker', 'blacksmith',
  'doctor', 'preacher', 'undertaker',
  'rancher', 'miner', 'farmer', 'prospector',
  'outlaw', 'gang_leader', 'bounty_hunter',
  'drifter', 'gambler', 'townsfolk',
]);
export type NPCRole = z.infer<typeof NPCRoleSchema>;

export const NPCFactionSchema = z.enum([
  'neutral', 'ivrc', 'copperhead', 'freeminer', 'remnant', 'townsfolk',
]);
export type NPCFaction = z.infer<typeof NPCFactionSchema>;

// ============================================================================
// NPC DEFINITION
// ============================================================================

export const NPCDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  role: NPCRoleSchema,
  faction: NPCFactionSchema.default('neutral'),
  locationId: z.string(),
  spawnCoord: HexCoordSchema.optional(),
  personality: NPCPersonalitySchema.default(() => ({
    aggression: 0.3,
    friendliness: 0.5,
    curiosity: 0.5,
    greed: 0.3,
    honesty: 0.7,
    lawfulness: 0.5,
  })),
  description: z.string().optional(),
  portraitId: z.string().optional(),
  dialogueTreeIds: z.array(z.string()).default([]),
  primaryDialogueId: z.string().optional(),
  essential: z.boolean().default(false),
  questGiver: z.boolean().default(false),
  questIds: z.array(z.string()).default([]),
  shopId: z.string().optional(),
  backstory: z.string().optional(),
  relationships: z
    .array(z.object({
      npcId: z.string(),
      type: z.enum(['ally', 'enemy', 'neutral', 'family', 'romantic', 'rival']),
      notes: z.string().optional(),
    }))
    .default([]),
  tags: z.array(z.string()).default([]),
});
export type NPCDefinition = z.infer<typeof NPCDefinitionSchema>;
