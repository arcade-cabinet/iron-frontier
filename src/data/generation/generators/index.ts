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
