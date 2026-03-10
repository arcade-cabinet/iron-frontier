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

// Re-export schemas for convenience
export type {
  BuildingTemplate,
  DialogueSnippet,
  DialogueTreeTemplate,
  EncounterTemplate,
  FactionReactionTemplate,
  GenerationContext,
  GenerationManifest,
  LocationTemplate,
  LoreFragment,
  NameOrigin,
  NamePool,
  NPCTemplate,
  ObjectiveTemplate,
  PersonalityRange,
  PlaceNamePool,
  PriceModifier,
  QuestArchetype,
  QuestTemplate,
  RumorTemplate,
  ScheduleTemplate,
  ShopInventoryTemplate,
} from '../schemas/generation';
export {
  BuildingTemplateSchema,
  DialogueSnippetSchema,
  DialogueTreeTemplateSchema,
  EncounterTemplateSchema,
  extractTemplateVariables,
  FactionReactionTemplateSchema,
  GENERATION_SCHEMA_VERSION,
  GenerationContextSchema,
  GenerationManifestSchema,
  LocationTemplateSchema,
  LoreFragmentSchema,
  NameOriginSchema,
  NamePoolSchema,
  NPCTemplateSchema,
  PlaceNamePoolSchema,
  QuestArchetypeSchema,
  QuestTemplateSchema,
  RumorTemplateSchema,
  ScheduleTemplateSchema,
  ShopInventoryTemplateSchema,
  substituteTemplate,
} from '../schemas/generation';
// All generators
export * from './generators';
// Game store integration
export * from './integration';
// Core utilities
export { combineSeeds, createSeededRandom, hashString, SeededRandom } from './seededRandom';
