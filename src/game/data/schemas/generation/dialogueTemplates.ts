/**
 * Dialogue & Location Generation Templates
 */

import { z } from 'zod';

// ============================================================================
// DIALOGUE TEMPLATES
// ============================================================================

export const DialogueSnippetSchema = z.object({
  id: z.string(),
  category: z.enum([
    'greeting', 'farewell', 'thanks', 'refusal', 'agreement',
    'question', 'rumor', 'threat', 'bribe', 'compliment', 'insult',
    'small_talk', 'quest_offer', 'quest_update', 'quest_complete',
    'shop_welcome', 'shop_browse', 'shop_buy', 'shop_sell', 'shop_farewell',
  ]),
  textTemplates: z.array(z.string()).min(1),
  personalityMin: z.record(z.string(), z.number()).optional(),
  personalityMax: z.record(z.string(), z.number()).optional(),
  validRoles: z.array(z.string()).optional(),
  validFactions: z.array(z.string()).optional(),
  validTimeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).optional(),
  tags: z.array(z.string()).optional(),
});
export type DialogueSnippet = z.infer<typeof DialogueSnippetSchema>;

export const DialogueTreeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  entryConditions: z
    .array(z.object({ type: z.string(), target: z.string().optional(), value: z.number().optional() }))
    .default([]),
  nodePatterns: z
    .array(z.object({
      role: z.enum(['greeting', 'main', 'branch', 'farewell', 'quest', 'shop', 'rumor']),
      snippetCategories: z.array(z.string()),
      choicePatterns: z
        .array(z.object({
          textTemplate: z.string(),
          nextRole: z.string().nullable(),
          tags: z.array(z.string()).default([]),
        }))
        .default([]),
    }))
    .min(1),
  validRoles: z.array(z.string()).default([]),
  validFactions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});
export type DialogueTreeTemplate = z.infer<typeof DialogueTreeTemplateSchema>;

// ============================================================================
// LOCATION TEMPLATES
// ============================================================================

export const BuildingTemplateSchema = z.object({
  id: z.string(),
  type: z.enum([
    'saloon', 'general_store', 'gunsmith', 'bank', 'sheriff_office',
    'church', 'hotel', 'stable', 'blacksmith', 'doctor', 'undertaker',
    'assay_office', 'telegraph', 'train_depot', 'warehouse',
    'house_small', 'house_large', 'shack', 'barn', 'mine_entrance',
    'water_tower', 'windmill',
  ]),
  npcSlots: z
    .array(z.object({
      role: z.string(),
      required: z.boolean().default(false),
      count: z.number().int().min(1).default(1),
    }))
    .default([]),
  shopType: z.string().optional(),
  minTownSize: z.enum(['hamlet', 'village', 'town', 'city']).default('hamlet'),
  maxInstances: z.number().int().min(1).default(1),
  tags: z.array(z.string()).default([]),
});
export type BuildingTemplate = z.infer<typeof BuildingTemplateSchema>;

export const LocationTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  locationType: z.string(),
  size: z.enum(['tiny', 'small', 'medium', 'large', 'huge']),
  namePoolId: z.string(),
  buildings: z
    .array(z.object({
      templateId: z.string(),
      countRange: z.tuple([z.number(), z.number()]).optional(),
      required: z.boolean().optional(),
    }))
    .optional(),
  backgroundNpcRange: z.tuple([z.number(), z.number()]).optional(),
  notableNpcRange: z.tuple([z.number(), z.number()]).optional(),
  validBiomes: z.array(z.string()).optional(),
  validRegions: z.array(z.string()).optional(),
  descriptionTemplates: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});
export type LocationTemplate = z.infer<typeof LocationTemplateSchema>;

// ============================================================================
// ENCOUNTER TEMPLATES
// ============================================================================

export const EncounterTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  descriptionTemplate: z.string(),
  enemies: z
    .array(z.object({
      enemyIdOrTag: z.string(),
      countRange: z.tuple([z.number(), z.number()]).default([1, 1]),
      levelScale: z.number().min(0.5).max(2).default(1),
    }))
    .min(1),
  difficultyRange: z.tuple([z.number(), z.number()]).default([1, 5]),
  validBiomes: z.array(z.string()).default([]),
  validLocationTypes: z.array(z.string()).default([]),
  validTimeOfDay: z.array(z.string()).default([]),
  factionTags: z.array(z.string()).default([]),
  lootTableId: z.string().optional(),
  xpRange: z.tuple([z.number(), z.number()]).default([10, 50]),
  goldRange: z.tuple([z.number(), z.number()]).default([0, 20]),
  tags: z.array(z.string()).default([]),
});
export type EncounterTemplate = z.infer<typeof EncounterTemplateSchema>;
