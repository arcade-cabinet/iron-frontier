/**
 * Generators Index - Export all generator functionality
 */

// Name generation
export {
  initNamePools,
  generateName,
  generateNameWeighted,
  generatePlaceName,
  generateUniqueName,
  generateOutlawAlias,
  generateAutomatonDesignation,
  type GeneratedName,
  type GeneratedPlaceName,
  type NameGender,
} from './nameGenerator';

// NPC generation
export {
  initNPCTemplates,
  getNPCTemplate,
  getNPCTemplatesByRole,
  getNPCTemplatesForLocation,
  generateNPC,
  generateNPCsForLocation,
  generateNPCsForBuilding,
  type GeneratedNPC,
} from './npcGenerator';

// Quest generation
export {
  initQuestTemplates,
  getQuestTemplate,
  getQuestTemplatesByArchetype,
  getQuestTemplatesForLevel,
  getQuestTemplatesForGiver,
  generateQuest,
  generateRandomQuest,
  type GeneratedQuest,
  type GeneratedQuestStage,
  type GeneratedObjective,
  type QuestGenerationContext,
} from './questGenerator';

// Encounter generation
export {
  initEncounterTemplates,
  getEncounterTemplate,
  getEncountersForBiome,
  getEncountersForDifficulty,
  getEncountersForLocation,
  getEncountersForTime,
  generateEncounter,
  generateRandomEncounter,
  shouldTriggerEncounter,
  type GeneratedEnemy,
  type GeneratedEncounter,
} from './encounterGenerator';

// Dialogue generation
export {
  initDialogueData,
  getSnippetsByCategory,
  getSnippetsForNPC,
  getDialogueTreesForRole,
  getDialogueTreeTemplate,
  buildDialogueTree,
  generateSimpleDialogueTree,
  type GeneratedDialogueChoice,
  type GeneratedDialogueNode,
  type GeneratedDialogueTree,
} from './dialogueGenerator';

// World generation
export {
  WorldGenerator,
  generateWorld,
  type GeneratedLocation,
  type GeneratedRegion,
  type GeneratedWorld,
  type WorldGenerationOptions,
} from './worldGenerator';

// Item generation
export {
  // Initialization
  initItemGeneration,
  // Core generators
  generateWeapon,
  generateArmor,
  generateConsumable,
  generateLoot,
  generateShopInventory,
  // Helper functions
  scaleStatByLevel,
  calculateItemValue,
  // Template/pool accessors
  getItemTemplate,
  getItemTemplatesByType,
  getLootTable,
  getLootTablesByTag,
  // Schemas
  ItemTemplateSchema,
  RarityWeightsSchema,
  StatRangeSchema,
  LootTableEntrySchema,
  ProceduralLootTableSchema,
  // Default pools
  DEFAULT_MATERIALS,
  DEFAULT_QUALITIES,
  DEFAULT_STYLES,
  WEAPON_PREFIXES,
  WEAPON_SUFFIXES,
  ARMOR_PREFIXES,
  ARMOR_SUFFIXES,
  CONSUMABLE_PREFIXES,
  CONSUMABLE_SUFFIXES,
  // Types
  type GeneratedItem,
  type ShopInventoryItem,
  type ItemTemplate,
  type RarityWeights,
  type StatRange,
  type LootTableEntry,
  type ProceduralLootTable,
  type MaterialPool,
  type QualityPool,
  type StylePool,
} from './itemGenerator';
