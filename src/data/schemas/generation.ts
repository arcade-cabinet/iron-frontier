/**
 * Iron Frontier - Procedural Generation Schema Definitions
 *
 * Daggerfall-style procedural content generation system.
 * Uses templates with variable slots and substitution patterns
 * to generate massive amounts of unique content from limited base data.
 *
 * Architecture:
 * - Templates: Archetypes with variable slots ({{variable}})
 * - Pools: Collections of values for substitution
 * - Generators: Functions that combine templates + pools + context
 * - Seeding: Deterministic generation from world seed
 */

import { z } from 'zod';

// ============================================================================
// GENERATION CONTEXT
// ============================================================================

/**
 * Context passed to generators for consistent world-aware generation
 */
export const GenerationContextSchema = z.object({
  /** World seed for deterministic generation */
  worldSeed: z.number().int(),
  /** Current region for regional flavor */
  regionId: z.string().optional(),
  /** Current location for local context */
  locationId: z.string().optional(),
  /** Player level for scaling */
  playerLevel: z.number().int().min(1).max(10).default(1),
  /** Current game time (0-24) */
  gameHour: z.number().min(0).max(24).default(12),
  /** Faction tensions in region */
  factionTensions: z.record(z.string(), z.number()).default({}),
  /** Active world events */
  activeEvents: z.array(z.string()).default([]),
  /** Tags for filtering appropriate content */
  contextTags: z.array(z.string()).default([]),
});
export type GenerationContext = z.infer<typeof GenerationContextSchema>;

// ============================================================================
// NAME GENERATION
// ============================================================================

/**
 * Cultural/ethnic origin for name generation
 */
export const NameOriginSchema = z.enum([
  'frontier_anglo',     // American frontier names
  'frontier_hispanic',  // Spanish/Mexican influence
  'frontier_native',    // Native American influence
  'frontier_chinese',   // Chinese immigrant names
  'frontier_european',  // European immigrant mix
  'outlaw',            // Nicknames and aliases
  'mechanical',        // Automaton/robot designations
]);
export type NameOrigin = z.infer<typeof NameOriginSchema>;

/**
 * Name component pool for a specific origin
 */
export const NamePoolSchema = z.object({
  origin: NameOriginSchema,
  /** Male first names */
  maleFirst: z.array(z.string()).min(1),
  /** Female first names */
  femaleFirst: z.array(z.string()).min(1),
  /** Gender-neutral first names */
  neutralFirst: z.array(z.string()).default([]),
  /** Last names / surnames */
  surnames: z.array(z.string()).min(1),
  /** Nicknames and aliases */
  nicknames: z.array(z.string()).default([]),
  /** Titles (Mr., Doc, Sheriff, etc) */
  titles: z.array(z.string()).default([]),
  /** Name patterns: "{{first}} {{last}}", "{{title}} {{nickname}}", etc */
  patterns: z.array(z.string()).default(['{{first}} {{last}}']),
});
export type NamePool = z.infer<typeof NamePoolSchema>;

/**
 * Place name component pool
 */
export const PlaceNamePoolSchema = z.object({
  /** Descriptive adjectives: Dusty, Red, Broken, etc */
  adjectives: z.array(z.string()).min(1),
  /** Geographic nouns: Creek, Mesa, Canyon, etc */
  nouns: z.array(z.string()).min(1),
  /** Suffix types: -ville, Springs, Junction, etc */
  suffixes: z.array(z.string()).default([]),
  /** Possessive names: Smith's, Old Tom's, etc */
  possessives: z.array(z.string()).default([]),
  /** Patterns: "{{adj}} {{noun}}", "{{noun}} {{suffix}}", etc */
  patterns: z.array(z.string()).default(['{{adj}} {{noun}}']),
  /** Tags for filtering by location type */
  tags: z.array(z.string()).default([]),
});
export type PlaceNamePool = z.infer<typeof PlaceNamePoolSchema>;

// ============================================================================
// NPC TEMPLATES
// ============================================================================

/**
 * Personality range for procedural variation
 */
export const PersonalityRangeSchema = z.object({
  aggression: z.tuple([z.number(), z.number()]).default([0.2, 0.5]),
  friendliness: z.tuple([z.number(), z.number()]).default([0.3, 0.7]),
  curiosity: z.tuple([z.number(), z.number()]).default([0.3, 0.7]),
  greed: z.tuple([z.number(), z.number()]).default([0.2, 0.5]),
  honesty: z.tuple([z.number(), z.number()]).default([0.4, 0.8]),
  lawfulness: z.tuple([z.number(), z.number()]).default([0.3, 0.7]),
});
export type PersonalityRange = z.infer<typeof PersonalityRangeSchema>;

/**
 * NPC archetype template
 */
export const NPCTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Human-readable name */
  name: z.string(),
  /** Description of this archetype */
  description: z.string(),
  /** Role this template generates */
  role: z.string(), // References NPCRoleSchema
  /** Allowed factions */
  allowedFactions: z.array(z.string()).default(['neutral']),
  /** Personality ranges for this archetype */
  personality: PersonalityRangeSchema.default({}),
  /** Name origin preferences (weighted) */
  nameOrigins: z.array(z.object({
    origin: NameOriginSchema,
    weight: z.number().min(0).default(1),
  })).default([{ origin: 'frontier_anglo', weight: 1 }]),
  /** Gender distribution: [male%, female%, neutral%] */
  genderDistribution: z.tuple([z.number(), z.number(), z.number()]).default([0.5, 0.5, 0]),
  /** Backstory templates with {{variable}} slots */
  backstoryTemplates: z.array(z.string()).default([]),
  /** Description templates */
  descriptionTemplates: z.array(z.string()).default([]),
  /** Dialogue tree IDs to use */
  dialogueTreeIds: z.array(z.string()).default([]),
  /** Quest chance (0-1) */
  questGiverChance: z.number().min(0).max(1).default(0),
  /** Shop chance (0-1) */
  shopChance: z.number().min(0).max(1).default(0),
  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
  /** Location type requirements */
  validLocationTypes: z.array(z.string()).default([]),
  /** Minimum importance (0=background, 1=notable) */
  minImportance: z.number().min(0).max(1).default(0),
});
export type NPCTemplate = z.infer<typeof NPCTemplateSchema>;

// ============================================================================
// QUEST TEMPLATES
// ============================================================================

/**
 * Quest archetype - defines the structure without specific content
 */
export const QuestArchetypeSchema = z.enum([
  // Combat
  'bounty_hunt',        // Kill specific target
  'clear_area',         // Clear enemies from location
  'escort',             // Protect NPC during travel
  'ambush',             // Set trap for enemies

  // Retrieval
  'fetch_item',         // Get item and return
  'steal_item',         // Steal from target
  'recover_lost',       // Find lost item
  'gather_materials',   // Collect multiple items

  // Delivery
  'deliver_message',    // Bring message to NPC
  'deliver_package',    // Bring item to NPC
  'smuggle',            // Deliver without detection

  // Investigation
  'find_person',        // Locate missing NPC
  'investigate',        // Discover information
  'spy',                // Observe and report

  // Social
  'convince_npc',       // Persuade someone
  'intimidate',         // Threaten someone
  'mediate',            // Resolve conflict

  // Exploration
  'explore_location',   // Visit new place
  'map_area',           // Survey region
  'find_route',         // Discover path

  // Economic
  'debt_collection',    // Collect payment
  'investment',         // Fund operation
  'trade_route',        // Establish commerce
]);
export type QuestArchetype = z.infer<typeof QuestArchetypeSchema>;

/**
 * Objective template with variable slots
 */
export const ObjectiveTemplateSchema = z.object({
  /** Objective type */
  type: z.string(),
  /** Description with {{variables}} */
  descriptionTemplate: z.string(),
  /** Target type: 'npc', 'item', 'location', 'enemy' */
  targetType: z.enum(['npc', 'item', 'location', 'enemy', 'any']),
  /** Target tags for filtering valid targets */
  targetTags: z.array(z.string()).default([]),
  /** Count range [min, max] */
  countRange: z.tuple([z.number(), z.number()]).default([1, 1]),
  /** Is optional */
  optional: z.boolean().default(false),
  /** Hint template */
  hintTemplate: z.string().optional(),
});
export type ObjectiveTemplate = z.infer<typeof ObjectiveTemplateSchema>;

/**
 * Quest template for procedural generation
 */
export const QuestTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Human-readable name */
  name: z.string(),
  /** Quest archetype */
  archetype: QuestArchetypeSchema,
  /** Quest type (main, side, bounty, etc) */
  questType: z.string(),
  /** Title templates with {{variables}} */
  titleTemplates: z.array(z.string()).min(1),
  /** Description templates */
  descriptionTemplates: z.array(z.string()).min(1),
  /** Stage templates - each stage has objective templates */
  stages: z.array(z.object({
    titleTemplate: z.string(),
    descriptionTemplate: z.string(),
    objectives: z.array(ObjectiveTemplateSchema).min(1),
    onStartTextTemplate: z.string().optional(),
    onCompleteTextTemplate: z.string().optional(),
  })).min(1),
  /** Reward ranges */
  rewards: z.object({
    xpRange: z.tuple([z.number(), z.number()]).default([10, 50]),
    goldRange: z.tuple([z.number(), z.number()]).default([5, 25]),
    itemTags: z.array(z.string()).default([]),
    itemChance: z.number().min(0).max(1).default(0.3),
    reputationImpact: z.record(z.string(), z.tuple([z.number(), z.number()])).default({}),
  }),
  /** Level range for scaling */
  levelRange: z.tuple([z.number(), z.number()]).default([1, 10]),
  /** Valid giver roles */
  giverRoles: z.array(z.string()).default([]),
  /** Valid giver factions */
  giverFactions: z.array(z.string()).default([]),
  /** Location type requirements */
  validLocationTypes: z.array(z.string()).default([]),
  /** Tags */
  tags: z.array(z.string()).default([]),
  /** Can repeat */
  repeatable: z.boolean().default(true),
  /** Cooldown in game hours if repeatable */
  cooldownHours: z.number().int().min(0).default(24),
});
export type QuestTemplate = z.infer<typeof QuestTemplateSchema>;

// ============================================================================
// DIALOGUE TEMPLATES
// ============================================================================

/**
 * Dialogue snippet - reusable conversation fragment
 */
export const DialogueSnippetSchema = z.object({
  /** Snippet identifier */
  id: z.string(),
  /** Category for organization */
  category: z.enum([
    'greeting',
    'farewell',
    'thanks',
    'refusal',
    'agreement',
    'question',
    'rumor',
    'threat',
    'bribe',
    'compliment',
    'insult',
    'small_talk',
    'quest_offer',
    'quest_update',
    'quest_complete',
    'shop_welcome',
    'shop_browse',
    'shop_buy',
    'shop_sell',
    'shop_farewell',
  ]),
  /** Text with {{variables}} */
  textTemplates: z.array(z.string()).min(1),
  /** Personality requirements (min values) */
  personalityMin: z.record(z.string(), z.number()).default({}),
  /** Personality requirements (max values) */
  personalityMax: z.record(z.string(), z.number()).default({}),
  /** Role restrictions */
  validRoles: z.array(z.string()).default([]),
  /** Faction restrictions */
  validFactions: z.array(z.string()).default([]),
  /** Time of day restrictions */
  validTimeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).default([]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type DialogueSnippet = z.infer<typeof DialogueSnippetSchema>;

/**
 * Dialogue tree template for procedural generation
 */
export const DialogueTreeTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Template name */
  name: z.string(),
  /** Description */
  description: z.string(),
  /** Entry conditions */
  entryConditions: z.array(z.object({
    type: z.string(),
    target: z.string().optional(),
    value: z.number().optional(),
  })).default([]),
  /** Node templates - simplified tree structure */
  nodePatterns: z.array(z.object({
    /** Node role in conversation */
    role: z.enum(['greeting', 'main', 'branch', 'farewell', 'quest', 'shop', 'rumor']),
    /** Snippet categories to pull from */
    snippetCategories: z.array(z.string()),
    /** Choice patterns */
    choicePatterns: z.array(z.object({
      textTemplate: z.string(),
      nextRole: z.string().nullable(),
      tags: z.array(z.string()).default([]),
    })).default([]),
  })).min(1),
  /** Valid for roles */
  validRoles: z.array(z.string()).default([]),
  /** Valid for factions */
  validFactions: z.array(z.string()).default([]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type DialogueTreeTemplate = z.infer<typeof DialogueTreeTemplateSchema>;

// ============================================================================
// LOCATION TEMPLATES
// ============================================================================

/**
 * Building template for location generation
 */
export const BuildingTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Building type */
  type: z.enum([
    'saloon',
    'general_store',
    'gunsmith',
    'bank',
    'sheriff_office',
    'church',
    'hotel',
    'stable',
    'blacksmith',
    'doctor',
    'undertaker',
    'assay_office',
    'telegraph',
    'train_depot',
    'warehouse',
    'house_small',
    'house_large',
    'shack',
    'barn',
    'mine_entrance',
    'water_tower',
    'windmill',
  ]),
  /** NPC slots this building provides */
  npcSlots: z.array(z.object({
    role: z.string(),
    required: z.boolean().default(false),
    count: z.number().int().min(1).default(1),
  })).default([]),
  /** Shop type if applicable */
  shopType: z.string().optional(),
  /** Required for town of this size+ */
  minTownSize: z.enum(['hamlet', 'village', 'town', 'city']).default('hamlet'),
  /** Maximum instances per location */
  maxInstances: z.number().int().min(1).default(1),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type BuildingTemplate = z.infer<typeof BuildingTemplateSchema>;

/**
 * Location archetype template
 */
export const LocationTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Template name */
  name: z.string(),
  /** Location type */
  locationType: z.string(),
  /** Size category */
  size: z.enum(['tiny', 'small', 'medium', 'large', 'huge']),
  /** Name pool to use */
  namePoolId: z.string(),
  /** Building composition */
  buildings: z.array(z.object({
    templateId: z.string(),
    countRange: z.tuple([z.number(), z.number()]).default([1, 1]),
    required: z.boolean().default(false),
  })).default([]),
  /** Background NPC count range */
  backgroundNpcRange: z.tuple([z.number(), z.number()]).default([0, 5]),
  /** Notable NPC count range */
  notableNpcRange: z.tuple([z.number(), z.number()]).default([1, 3]),
  /** Biome requirements */
  validBiomes: z.array(z.string()).default([]),
  /** Region requirements */
  validRegions: z.array(z.string()).default([]),
  /** Description templates */
  descriptionTemplates: z.array(z.string()).default([]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type LocationTemplate = z.infer<typeof LocationTemplateSchema>;

// ============================================================================
// ENCOUNTER TEMPLATES
// ============================================================================

/**
 * Encounter template for procedural combat
 */
export const EncounterTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Template name */
  name: z.string(),
  /** Description template */
  descriptionTemplate: z.string(),
  /** Enemy composition */
  enemies: z.array(z.object({
    /** Enemy definition ID or tag */
    enemyIdOrTag: z.string(),
    /** Count range */
    countRange: z.tuple([z.number(), z.number()]).default([1, 1]),
    /** Level scaling factor */
    levelScale: z.number().min(0.5).max(2).default(1),
  })).min(1),
  /** Difficulty range (1-10) */
  difficultyRange: z.tuple([z.number(), z.number()]).default([1, 5]),
  /** Valid biomes */
  validBiomes: z.array(z.string()).default([]),
  /** Valid location types */
  validLocationTypes: z.array(z.string()).default([]),
  /** Time of day restrictions */
  validTimeOfDay: z.array(z.string()).default([]),
  /** Faction associations */
  factionTags: z.array(z.string()).default([]),
  /** Loot table ID */
  lootTableId: z.string().optional(),
  /** XP reward range */
  xpRange: z.tuple([z.number(), z.number()]).default([10, 50]),
  /** Gold reward range */
  goldRange: z.tuple([z.number(), z.number()]).default([0, 20]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type EncounterTemplate = z.infer<typeof EncounterTemplateSchema>;

// ============================================================================
// RUMOR & LORE TEMPLATES
// ============================================================================

/**
 * Rumor template for dynamic world information
 */
export const RumorTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Rumor category */
  category: z.enum([
    'quest_hook',       // Leads to quest
    'location_hint',    // Reveals location
    'npc_gossip',       // About another NPC
    'faction_news',     // Faction activity
    'world_event',      // Major happenings
    'treasure_hint',    // Hidden loot
    'danger_warning',   // Area warnings
    'history',          // World lore
    'personal',         // NPC personal story
  ]),
  /** Text templates with {{variables}} */
  textTemplates: z.array(z.string()).min(1),
  /** Can reveal quest */
  linkedQuestTemplateId: z.string().optional(),
  /** Can reveal location */
  linkedLocationId: z.string().optional(),
  /** Validity conditions */
  conditions: z.array(z.object({
    type: z.string(),
    target: z.string().optional(),
    value: z.number().optional(),
  })).default([]),
  /** How likely this rumor is to be told (0-1) */
  prevalence: z.number().min(0).max(1).default(0.5),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type RumorTemplate = z.infer<typeof RumorTemplateSchema>;

/**
 * Lore fragment for world-building
 */
export const LoreFragmentSchema = z.object({
  /** Fragment identifier */
  id: z.string(),
  /** Category */
  category: z.enum([
    'history',          // Past events
    'legend',           // Myths and tales
    'faction_lore',     // Organization backstory
    'location_lore',    // Place history
    'item_lore',        // Artifact stories
    'person_lore',      // Famous figures
    'creature_lore',    // Bestiary entries
    'technology_lore',  // Steam-tech explanations
  ]),
  /** Title */
  title: z.string(),
  /** Full text (can be multi-paragraph) */
  text: z.string(),
  /** Related entity IDs */
  relatedIds: z.array(z.string()).default([]),
  /** Discovery method */
  discoveryMethod: z.enum([
    'dialogue',         // NPC tells you
    'book',             // Found in readable
    'exploration',      // Visit location
    'quest',            // Quest reward
    'automatic',        // Known from start
  ]).default('dialogue'),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type LoreFragment = z.infer<typeof LoreFragmentSchema>;

// ============================================================================
// ECONOMY TEMPLATES
// ============================================================================

/**
 * Price modifier template for dynamic economy
 */
export const PriceModifierSchema = z.object({
  /** Modifier identifier */
  id: z.string(),
  /** Item tags this affects */
  itemTags: z.array(z.string()).default([]),
  /** Location types where this applies */
  locationTypes: z.array(z.string()).default([]),
  /** Regions where this applies */
  regions: z.array(z.string()).default([]),
  /** Price multiplier range */
  multiplierRange: z.tuple([z.number(), z.number()]).default([0.8, 1.2]),
  /** Conditions for this modifier */
  conditions: z.array(z.object({
    type: z.string(),
    target: z.string().optional(),
    value: z.number().optional(),
  })).default([]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type PriceModifier = z.infer<typeof PriceModifierSchema>;

/**
 * Shop inventory template
 */
export const ShopInventoryTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Shop type */
  shopType: z.enum([
    'general_store',
    'gunsmith',
    'apothecary',
    'blacksmith',
    'saloon',
    'trading_post',
    'specialty',
  ]),
  /** Base item pool by tags */
  itemPools: z.array(z.object({
    tags: z.array(z.string()),
    countRange: z.tuple([z.number(), z.number()]).default([1, 5]),
    rarityWeights: z.object({
      common: z.number().default(70),
      uncommon: z.number().default(25),
      rare: z.number().default(4),
      legendary: z.number().default(1),
    }).default({}),
  })).min(1),
  /** Restock interval in game hours */
  restockHours: z.number().int().min(1).default(24),
  /** Buy price multiplier */
  buyMultiplier: z.number().min(0.1).max(2).default(1.2),
  /** Sell price multiplier */
  sellMultiplier: z.number().min(0.1).max(1).default(0.5),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type ShopInventoryTemplate = z.infer<typeof ShopInventoryTemplateSchema>;

// ============================================================================
// SCHEDULE TEMPLATES
// ============================================================================

/**
 * NPC schedule template for daily routines
 */
export const ScheduleTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Valid roles */
  validRoles: z.array(z.string()).default([]),
  /** Daily schedule entries */
  entries: z.array(z.object({
    /** Start hour (0-24) */
    startHour: z.number().min(0).max(24),
    /** End hour (0-24) */
    endHour: z.number().min(0).max(24),
    /** Activity type */
    activity: z.enum([
      'sleep',
      'work',
      'eat',
      'patrol',
      'socialize',
      'pray',
      'shop',
      'travel',
      'idle',
    ]),
    /** Location marker ID ({{building_type}} for dynamic) */
    locationMarker: z.string(),
    /** Override dialogue tree during this activity */
    dialogueOverride: z.string().optional(),
  })).min(1),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type ScheduleTemplate = z.infer<typeof ScheduleTemplateSchema>;

// ============================================================================
// FACTION TEMPLATES
// ============================================================================

/**
 * Faction reaction template
 */
export const FactionReactionTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Faction this template is for */
  factionId: z.string(),
  /** Reputation thresholds and their effects */
  reputationTiers: z.array(z.object({
    /** Minimum reputation for this tier */
    minRep: z.number().int(),
    /** Maximum reputation for this tier */
    maxRep: z.number().int(),
    /** Tier name */
    tierName: z.string(),
    /** Greeting snippets to use */
    greetingSnippets: z.array(z.string()).default([]),
    /** Price modifier */
    priceModifier: z.number().default(1),
    /** Quest availability modifier */
    questAvailability: z.number().min(0).max(1).default(1),
    /** Hostile if true */
    hostile: z.boolean().default(false),
  })).min(1),
  /** Relations with other factions (-1 to 1) */
  factionRelations: z.record(z.string(), z.number()).default({}),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type FactionReactionTemplate = z.infer<typeof FactionReactionTemplateSchema>;

// ============================================================================
// GENERATION OUTPUT MANIFEST
// ============================================================================

/**
 * Manifest tracking all generated content
 */
export const GenerationManifestSchema = z.object({
  /** Generation timestamp */
  generatedAt: z.number().int(),
  /** World seed used */
  worldSeed: z.number().int(),
  /** Schema version */
  schemaVersion: z.string(),
  /** Counts of generated content */
  counts: z.object({
    npcs: z.number().int().default(0),
    quests: z.number().int().default(0),
    dialogueTrees: z.number().int().default(0),
    locations: z.number().int().default(0),
    encounters: z.number().int().default(0),
    rumors: z.number().int().default(0),
    loreFragments: z.number().int().default(0),
  }),
  /** Template IDs used */
  templatesUsed: z.array(z.string()).default([]),
  /** Any generation warnings */
  warnings: z.array(z.string()).default([]),
});
export type GenerationManifest = z.infer<typeof GenerationManifestSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateNPCTemplate(data: unknown): NPCTemplate {
  return NPCTemplateSchema.parse(data);
}

export function validateQuestTemplate(data: unknown): QuestTemplate {
  return QuestTemplateSchema.parse(data);
}

export function validateDialogueSnippet(data: unknown): DialogueSnippet {
  return DialogueSnippetSchema.parse(data);
}

export function validateLocationTemplate(data: unknown): LocationTemplate {
  return LocationTemplateSchema.parse(data);
}

export function validateEncounterTemplate(data: unknown): EncounterTemplate {
  return EncounterTemplateSchema.parse(data);
}

export function validateRumorTemplate(data: unknown): RumorTemplate {
  return RumorTemplateSchema.parse(data);
}

export function validateNamePool(data: unknown): NamePool {
  return NamePoolSchema.parse(data);
}

// ============================================================================
// UTILITY: TEMPLATE VARIABLE SUBSTITUTION
// ============================================================================

/**
 * Substitute {{variables}} in a template string
 */
export function substituteTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Extract variable names from a template string
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set([...matches].map(m => m[1]))];
}

export const GENERATION_SCHEMA_VERSION = '1.0.0';
