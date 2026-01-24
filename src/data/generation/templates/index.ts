/**
 * Templates Index - Export all generation templates
 */

// NPC templates
export {
  NPC_TEMPLATES,
  getNPCTemplate,
  getNPCTemplatesByRole,
  getNPCTemplatesByLocationType,
  getNPCTemplatesByTag,
  getQuestGiverTemplates,
  getMerchantTemplates,
  getNPCTemplatesByImportance,
  getNPCTemplatesByFaction,
} from './npcTemplates';

// Quest templates
export {
  QUEST_TEMPLATES,
  getQuestTemplateById,
  getQuestTemplatesByArchetype,
  getQuestTemplatesForLevel,
  getQuestTemplatesForGiver,
  getQuestTemplatesByTag,
} from './questTemplates';

// Location templates
export {
  BUILDING_TEMPLATES,
  LOCATION_TEMPLATES,
  getBuildingTemplateById,
  getLocationTemplateById,
  getLocationTemplatesByType,
} from './locationTemplates';

// Encounter templates
export {
  ENCOUNTER_TEMPLATES,
  getEncounterTemplate,
  getEncountersForBiome,
  getEncountersForDifficulty,
  getEncountersMatching,
  getEncountersByTag,
  getEncountersByFaction,
  getRandomEncounterTemplate,
} from './encounterTemplates';

// Schedule templates
export {
  SCHEDULE_TEMPLATES,
  getScheduleTemplate,
  getScheduleForRole,
  getNPCActivityAt,
} from './scheduleTemplates';

// Faction templates
export {
  FACTION_TEMPLATES,
  getFactionTemplate,
  getReputationTier,
  getFactionRelation,
} from './factionTemplates';

// Shop templates
export {
  SHOP_TEMPLATES,
  PRICE_MODIFIERS,
  getShopTemplate,
  calculatePrice,
} from './shopTemplates';

// Dialogue tree templates
export {
  DIALOGUE_TREE_TEMPLATES,
  getDialogueTreeTemplate,
  getDialogueTreesForRole,
} from './dialogueTreeTemplates';
