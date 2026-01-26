/**
 * Templates Index - Export all generation templates
 */

// Dialogue tree templates
export {
  DIALOGUE_TREE_TEMPLATES,
  getDialogueTreesForRole,
  getDialogueTreeTemplate,
} from './dialogueTreeTemplates';
// Encounter templates
export {
  ENCOUNTER_TEMPLATES,
  getEncountersByFaction,
  getEncountersByTag,
  getEncountersForBiome,
  getEncountersForDifficulty,
  getEncountersMatching,
  getEncounterTemplate,
  getRandomEncounterTemplate,
} from './encounterTemplates';
// Enemy templates
export {
  type BehaviorTag,
  calculateScaledStats,
  DEFAULT_ENEMY_TEMPLATE,
  ENEMY_TEMPLATES,
  type EnemyNamePool,
  type EnemyStats,
  type EnemyTemplate,
  getEnemyTemplate,
  getEnemyTemplatesByBehavior,
  getEnemyTemplatesByCombatTag,
  getEnemyTemplatesByFaction,
  getEnemyTemplatesForLevel,
  getEnemyTemplatesMatching,
  type LevelScaling,
} from './enemyTemplates';
// Faction templates
export {
  FACTION_TEMPLATES,
  getFactionRelation,
  getFactionTemplate,
  getReputationTier,
} from './factionTemplates';
// Location templates
export {
  BUILDING_TEMPLATES,
  getBuildingTemplateById,
  getLocationTemplateById,
  getLocationTemplatesByType,
  LOCATION_TEMPLATES,
} from './locationTemplates';
// NPC templates
export {
  getMerchantTemplates,
  getNPCTemplate,
  getNPCTemplatesByFaction,
  getNPCTemplatesByImportance,
  getNPCTemplatesByLocationType,
  getNPCTemplatesByRole,
  getNPCTemplatesByTag,
  getQuestGiverTemplates,
  NPC_TEMPLATES,
} from './npcTemplates';
// Quest templates
export {
  getQuestTemplate,
  getQuestTemplatesByArchetype,
  getQuestTemplatesByTag,
  getQuestTemplatesForGiver,
  getQuestTemplatesForLevel,
  getRandomQuestTemplate,
  QUEST_TEMPLATES,
} from './questTemplates';
// Schedule templates
export {
  getNPCActivityAt,
  getScheduleForRole,
  getScheduleTemplate,
  SCHEDULE_TEMPLATES,
} from './scheduleTemplates';
// Shop templates
export {
  calculatePrice,
  getShopTemplate,
  PRICE_MODIFIERS,
  SHOP_TEMPLATES,
} from './shopTemplates';
