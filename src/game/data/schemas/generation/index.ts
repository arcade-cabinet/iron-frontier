/**
 * Generation Schemas - Barrel export
 */

// Context & Names
export {
  GenerationContextSchema,
  NameOriginSchema,
  NamePoolSchema,
  PlaceNamePoolSchema,
} from './context.ts';
export type {
  GenerationContext,
  NameOrigin,
  NamePool,
  PlaceNamePool,
} from './context.ts';

// NPC & Quest Templates
export {
  NPCTemplateSchema,
  ObjectiveTemplateSchema,
  PersonalityRangeSchema,
  QuestArchetypeSchema,
  QuestTemplateSchema,
} from './npcTemplates.ts';
export type {
  NPCTemplate,
  ObjectiveTemplate,
  PersonalityRange,
  QuestArchetype,
  QuestTemplate,
} from './npcTemplates.ts';

// Dialogue, Location, & Encounter Templates
export {
  BuildingTemplateSchema,
  DialogueSnippetSchema,
  DialogueTreeTemplateSchema,
  EncounterTemplateSchema,
  LocationTemplateSchema,
} from './dialogueTemplates.ts';
export type {
  BuildingTemplate,
  DialogueSnippet,
  DialogueTreeTemplate,
  EncounterTemplate,
  LocationTemplate,
} from './dialogueTemplates.ts';

// Economy, Schedule, Faction, Rumor & Lore
export {
  FactionReactionTemplateSchema,
  LoreFragmentSchema,
  PriceModifierSchema,
  RumorTemplateSchema,
  ScheduleTemplateSchema,
  ShopInventoryTemplateSchema,
} from './economyTemplates.ts';
export type {
  FactionReactionTemplate,
  LoreFragment,
  PriceModifier,
  RumorTemplate,
  ScheduleTemplate,
  ShopInventoryTemplate,
} from './economyTemplates.ts';

// Manifest, Validation & Utilities
export { GenerationManifestSchema } from './manifest.ts';
export type { GenerationManifest } from './manifest.ts';
export {
  extractTemplateVariables,
  GENERATION_SCHEMA_VERSION,
  substituteTemplate,
  validateDialogueSnippet,
  validateEncounterTemplate,
  validateLocationTemplate,
  validateNamePool,
  validateNPCTemplate,
  validateQuestTemplate,
  validateRumorTemplate,
} from './manifest.ts';
