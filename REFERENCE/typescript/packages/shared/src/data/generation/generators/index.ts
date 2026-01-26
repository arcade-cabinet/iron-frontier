/**
 * Generators Index - Export all generator functionality
 */

// Dialogue generation
export {
  buildDialogueTree,
  type GeneratedDialogueChoice,
  type GeneratedDialogueNode,
  type GeneratedDialogueTree,
  generateSimpleDialogueTree,
  getDialogueTreesForRole,
  getDialogueTreeTemplate,
  getSnippetsByCategory,
  getSnippetsForNPC,
  initDialogueData,
} from './dialogueGenerator';
// Encounter generation
export {
  type GeneratedEncounter,
  type GeneratedEnemy,
  generateEncounter,
  generateRandomEncounter,
  getEncountersForBiome,
  getEncountersForDifficulty,
  getEncountersForLocation,
  getEncountersForTime,
  getEncounterTemplate,
  initEncounterTemplates,
  shouldTriggerEncounter,
} from './encounterGenerator';
// Item generation
export {
  ARMOR_PREFIXES,
  ARMOR_SUFFIXES,
  CONSUMABLE_PREFIXES,
  CONSUMABLE_SUFFIXES,
  calculateItemValue,
  // Default pools
  DEFAULT_MATERIALS,
  DEFAULT_QUALITIES,
  DEFAULT_STYLES,
  // Types
  type GeneratedItem,
  generateArmor,
  generateConsumable,
  generateLoot,
  generateShopInventory,
  // Core generators
  generateWeapon,
  // Template/pool accessors
  getItemTemplate,
  getItemTemplatesByType,
  getLootTable,
  getLootTablesByTag,
  type ItemTemplate,
  // Schemas
  ItemTemplateSchema,
  // Initialization
  initItemGeneration,
  type LootTableEntry,
  LootTableEntrySchema,
  type MaterialPool,
  type ProceduralLootTable,
  ProceduralLootTableSchema,
  type QualityPool,
  type RarityWeights,
  RarityWeightsSchema,
  type ShopInventoryItem,
  type StatRange,
  StatRangeSchema,
  type StylePool,
  // Helper functions
  scaleStatByLevel,
  WEAPON_PREFIXES,
  WEAPON_SUFFIXES,
} from './itemGenerator';
// Name generation
export {
  type GeneratedName,
  type GeneratedPlaceName,
  generateAutomatonDesignation,
  generateName,
  generateNameWeighted,
  generateOutlawAlias,
  generatePlaceName,
  generateUniqueName,
  initNamePools,
  type NameGender,
} from './nameGenerator';
// NPC generation
export {
  type GeneratedNPC,
  generateNPC,
  generateNPCsForBuilding,
  generateNPCsForLocation,
  getNPCTemplate,
  getNPCTemplatesByRole,
  getNPCTemplatesForLocation,
  initNPCTemplates,
} from './npcGenerator';
// Quest generation
export {
  type GeneratedObjective,
  type GeneratedQuest,
  type GeneratedQuestStage,
  generateQuest,
  generateRandomQuest,
  getQuestTemplate,
  getQuestTemplatesByArchetype,
  getQuestTemplatesForGiver,
  getQuestTemplatesForLevel,
  initQuestTemplates,
  type QuestGenerationContext,
} from './questGenerator';
// World generation
export {
  type GeneratedLocation,
  type GeneratedRegion,
  type GeneratedWorld,
  generateWorld,
  type WorldGenerationOptions,
  WorldGenerator,
} from './worldGenerator';
