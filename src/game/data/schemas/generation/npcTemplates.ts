/**
 * NPC & Quest Generation Templates
 */

import { z } from 'zod';
import { NameOriginSchema } from './context.ts';

// ============================================================================
// NPC TEMPLATES
// ============================================================================

export const PersonalityRangeSchema = z.object({
  aggression: z.tuple([z.number(), z.number()]).default([0.2, 0.5]),
  friendliness: z.tuple([z.number(), z.number()]).default([0.3, 0.7]),
  curiosity: z.tuple([z.number(), z.number()]).default([0.3, 0.7]),
  greed: z.tuple([z.number(), z.number()]).default([0.2, 0.5]),
  honesty: z.tuple([z.number(), z.number()]).default([0.4, 0.8]),
  lawfulness: z.tuple([z.number(), z.number()]).default([0.3, 0.7]),
});
export type PersonalityRange = z.infer<typeof PersonalityRangeSchema>;

export const NPCTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  role: z.string(),
  allowedFactions: z.array(z.string()).default(['neutral']),
  personality: PersonalityRangeSchema.default(() => ({
    aggression: [0.2, 0.5] as [number, number],
    friendliness: [0.3, 0.7] as [number, number],
    curiosity: [0.3, 0.7] as [number, number],
    greed: [0.2, 0.5] as [number, number],
    honesty: [0.4, 0.8] as [number, number],
    lawfulness: [0.3, 0.7] as [number, number],
  })),
  nameOrigins: z
    .array(z.object({ origin: NameOriginSchema, weight: z.number().min(0).default(1) }))
    .default([{ origin: 'frontier_anglo', weight: 1 }]),
  genderDistribution: z.tuple([z.number(), z.number(), z.number()]).default([0.5, 0.5, 0]),
  backstoryTemplates: z.array(z.string()).default([]),
  descriptionTemplates: z.array(z.string()).default([]),
  dialogueTreeIds: z.array(z.string()).default([]),
  questGiverChance: z.number().min(0).max(1).default(0),
  shopChance: z.number().min(0).max(1).default(0),
  tags: z.array(z.string()).default([]),
  validLocationTypes: z.array(z.string()).default([]),
  minImportance: z.number().min(0).max(1).default(0),
});
export type NPCTemplate = z.infer<typeof NPCTemplateSchema>;

// ============================================================================
// QUEST TEMPLATES
// ============================================================================

export const QuestArchetypeSchema = z.enum([
  'bounty_hunt', 'clear_area', 'escort', 'ambush',
  'fetch_item', 'steal_item', 'recover_lost', 'gather_materials',
  'deliver_message', 'deliver_package', 'smuggle',
  'find_person', 'investigate', 'spy',
  'convince_npc', 'intimidate', 'mediate',
  'explore_location', 'map_area', 'find_route',
  'debt_collection', 'investment', 'trade_route',
]);
export type QuestArchetype = z.infer<typeof QuestArchetypeSchema>;

export const ObjectiveTemplateSchema = z.object({
  type: z.string(),
  descriptionTemplate: z.string(),
  targetType: z.enum(['npc', 'item', 'location', 'enemy', 'any']),
  targetTags: z.array(z.string()).default([]),
  countRange: z.tuple([z.number(), z.number()]).default([1, 1]),
  optional: z.boolean().default(false),
  hintTemplate: z.string().optional(),
});
export type ObjectiveTemplate = z.infer<typeof ObjectiveTemplateSchema>;

export const QuestTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  archetype: QuestArchetypeSchema,
  questType: z.string(),
  titleTemplates: z.array(z.string()).min(1),
  descriptionTemplates: z.array(z.string()).min(1),
  stages: z
    .array(z.object({
      titleTemplate: z.string(),
      descriptionTemplate: z.string(),
      objectives: z.array(ObjectiveTemplateSchema).min(1),
      onStartTextTemplate: z.string().optional(),
      onCompleteTextTemplate: z.string().optional(),
    }))
    .min(1),
  rewards: z.object({
    xpRange: z.tuple([z.number(), z.number()]).default([10, 50]),
    goldRange: z.tuple([z.number(), z.number()]).default([5, 25]),
    itemTags: z.array(z.string()).default([]),
    itemChance: z.number().min(0).max(1).default(0.3),
    reputationImpact: z.record(z.string(), z.tuple([z.number(), z.number()])).default({}),
  }),
  levelRange: z.tuple([z.number(), z.number()]).default([1, 10]),
  giverRoles: z.array(z.string()).default([]),
  giverFactions: z.array(z.string()).default([]),
  validLocationTypes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  repeatable: z.boolean().default(true),
  cooldownHours: z.number().int().min(0).default(24),
});
export type QuestTemplate = z.infer<typeof QuestTemplateSchema>;
