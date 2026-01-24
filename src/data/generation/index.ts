/**
 * Iron Frontier - Procedural Generation System
 *
 * Daggerfall-style content generation using templates, pools, and seeded randomness.
 *
 * Architecture:
 * - Templates: Define structure with variable slots ({{variable}})
 * - Pools: Collections of values for substitution
 * - Generators: Combine templates + pools + context
 * - Seeding: Deterministic generation from world seed
 */

// Core utilities
export { SeededRandom, createSeededRandom, hashString, combineSeeds } from './seededRandom';

// All generators
export * from './generators';

// Re-export schemas for convenience
export type {
  GenerationContext,
  NameOrigin,
  NamePool,
  PlaceNamePool,
  PersonalityRange,
  NPCTemplate,
  QuestArchetype,
  QuestTemplate,
  ObjectiveTemplate,
  DialogueSnippet,
  DialogueTreeTemplate,
  BuildingTemplate,
  LocationTemplate,
  EncounterTemplate,
  RumorTemplate,
  LoreFragment,
  PriceModifier,
  ShopInventoryTemplate,
  ScheduleTemplate,
  FactionReactionTemplate,
  GenerationManifest,
} from '../schemas/generation';

export {
  GenerationContextSchema,
  NameOriginSchema,
  NamePoolSchema,
  PlaceNamePoolSchema,
  NPCTemplateSchema,
  QuestArchetypeSchema,
  QuestTemplateSchema,
  DialogueSnippetSchema,
  DialogueTreeTemplateSchema,
  LocationTemplateSchema,
  BuildingTemplateSchema,
  EncounterTemplateSchema,
  RumorTemplateSchema,
  LoreFragmentSchema,
  ShopInventoryTemplateSchema,
  ScheduleTemplateSchema,
  FactionReactionTemplateSchema,
  GenerationManifestSchema,
  substituteTemplate,
  extractTemplateVariables,
  GENERATION_SCHEMA_VERSION,
} from '../schemas/generation';
