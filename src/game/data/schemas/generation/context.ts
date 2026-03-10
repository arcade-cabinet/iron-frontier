/**
 * Generation Context & Name Generation schemas
 */

import { z } from 'zod';

// ============================================================================
// GENERATION CONTEXT
// ============================================================================

export const GenerationContextSchema = z.object({
  worldSeed: z.number().int(),
  regionId: z.string().optional(),
  locationId: z.string().optional(),
  playerLevel: z.number().int().min(1).max(10).default(1),
  gameHour: z.number().min(0).max(24).default(12),
  factionTensions: z.record(z.string(), z.number()).default({}),
  activeEvents: z.array(z.string()).default([]),
  contextTags: z.array(z.string()).default([]),
});
export type GenerationContext = z.infer<typeof GenerationContextSchema>;

// ============================================================================
// NAME GENERATION
// ============================================================================

export const NameOriginSchema = z.enum([
  'frontier_anglo',
  'frontier_hispanic',
  'frontier_native',
  'frontier_chinese',
  'frontier_european',
  'outlaw',
  'mechanical',
]);
export type NameOrigin = z.infer<typeof NameOriginSchema>;

export const NamePoolSchema = z.object({
  origin: NameOriginSchema,
  maleFirst: z.array(z.string()).min(1),
  femaleFirst: z.array(z.string()).min(1),
  neutralFirst: z.array(z.string()).default([]),
  surnames: z.array(z.string()).min(1),
  nicknames: z.array(z.string()).default([]),
  titles: z.array(z.string()).default([]),
  patterns: z.array(z.string()).default(['{{first}} {{last}}']),
});
export type NamePool = z.infer<typeof NamePoolSchema>;

export const PlaceNamePoolSchema = z.object({
  adjectives: z.array(z.string()).min(1),
  nouns: z.array(z.string()).min(1),
  suffixes: z.array(z.string()).default([]),
  possessives: z.array(z.string()).default([]),
  patterns: z.array(z.string()).default(['{{adj}} {{noun}}']),
  tags: z.array(z.string()).default([]),
});
export type PlaceNamePool = z.infer<typeof PlaceNamePoolSchema>;
