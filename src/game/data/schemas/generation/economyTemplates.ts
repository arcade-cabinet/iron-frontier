/**
 * Economy, Schedule, Faction, Rumor & Lore Templates
 */

import { z } from 'zod';

// ============================================================================
// RUMOR & LORE TEMPLATES
// ============================================================================

export const RumorTemplateSchema = z.object({
  id: z.string(),
  category: z.enum([
    'quest_hook', 'location_hint', 'npc_gossip', 'faction_news',
    'world_event', 'treasure_hint', 'danger_warning', 'history', 'personal',
  ]),
  textTemplates: z.array(z.string()).min(1),
  linkedQuestTemplateId: z.string().optional(),
  linkedLocationId: z.string().optional(),
  conditions: z
    .array(z.object({ type: z.string(), target: z.string().optional(), value: z.number().optional() }))
    .optional(),
  prevalence: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
});
export type RumorTemplate = z.infer<typeof RumorTemplateSchema>;

export const LoreFragmentSchema = z.object({
  id: z.string(),
  category: z.enum([
    'history', 'legend', 'faction_lore', 'location_lore',
    'item_lore', 'person_lore', 'creature_lore', 'technology_lore',
  ]),
  title: z.string(),
  text: z.string(),
  relatedIds: z.array(z.string()).default([]),
  discoveryMethod: z
    .enum(['dialogue', 'book', 'exploration', 'quest', 'automatic'])
    .default('dialogue'),
  tags: z.array(z.string()).default([]),
});
export type LoreFragment = z.infer<typeof LoreFragmentSchema>;

// ============================================================================
// ECONOMY TEMPLATES
// ============================================================================

export const PriceModifierSchema = z.object({
  id: z.string(),
  itemTags: z.array(z.string()).default([]),
  locationTypes: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  multiplierRange: z.tuple([z.number(), z.number()]).default([0.8, 1.2]),
  conditions: z
    .array(z.object({ type: z.string(), target: z.string().optional(), value: z.number().optional() }))
    .default([]),
  tags: z.array(z.string()).default([]),
});
export type PriceModifier = z.infer<typeof PriceModifierSchema>;

export const ShopInventoryTemplateSchema = z.object({
  id: z.string(),
  shopType: z.enum([
    'general_store', 'gunsmith', 'apothecary', 'blacksmith',
    'saloon', 'trading_post', 'specialty',
  ]),
  itemPools: z
    .array(z.object({
      tags: z.array(z.string()),
      countRange: z.tuple([z.number(), z.number()]).default([1, 5]),
      rarityWeights: z
        .object({
          common: z.number().default(70),
          uncommon: z.number().default(25),
          rare: z.number().default(4),
          legendary: z.number().default(1),
        })
        .default(() => ({ common: 70, uncommon: 25, rare: 4, legendary: 1 })),
    }))
    .min(1),
  restockHours: z.number().int().min(1).default(24),
  buyMultiplier: z.number().min(0.1).max(2).default(1.2),
  sellMultiplier: z.number().min(0.1).max(1).default(0.5),
  tags: z.array(z.string()).default([]),
});
export type ShopInventoryTemplate = z.infer<typeof ShopInventoryTemplateSchema>;

// ============================================================================
// SCHEDULE TEMPLATES
// ============================================================================

export const ScheduleTemplateSchema = z.object({
  id: z.string(),
  validRoles: z.array(z.string()).default([]),
  entries: z
    .array(z.object({
      startHour: z.number().min(0).max(24),
      endHour: z.number().min(0).max(24),
      activity: z.enum([
        'sleep', 'work', 'eat', 'patrol', 'socialize',
        'pray', 'shop', 'travel', 'idle',
      ]),
      locationMarker: z.string(),
      dialogueOverride: z.string().optional(),
    }))
    .min(1),
  tags: z.array(z.string()).default([]),
});
export type ScheduleTemplate = z.infer<typeof ScheduleTemplateSchema>;

// ============================================================================
// FACTION TEMPLATES
// ============================================================================

export const FactionReactionTemplateSchema = z.object({
  id: z.string(),
  factionId: z.string(),
  reputationTiers: z
    .array(z.object({
      minRep: z.number().int(),
      maxRep: z.number().int(),
      tierName: z.string(),
      greetingSnippets: z.array(z.string()).default([]),
      priceModifier: z.number().default(1),
      questAvailability: z.number().min(0).max(1).default(1),
      hostile: z.boolean().default(false),
    }))
    .min(1),
  factionRelations: z.record(z.string(), z.number()).default({}),
  tags: z.array(z.string()).default([]),
});
export type FactionReactionTemplate = z.infer<typeof FactionReactionTemplateSchema>;
