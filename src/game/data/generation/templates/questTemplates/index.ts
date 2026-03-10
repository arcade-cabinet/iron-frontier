/**
 * Quest Templates - Procedural quest generation templates
 */

export { COMBAT_QUEST_TEMPLATES } from './combat.ts';
export { DELIVERY_QUEST_TEMPLATES } from './delivery.ts';
export { ECONOMIC_QUEST_TEMPLATES } from './economic.ts';
export { EXPLORATION_QUEST_TEMPLATES } from './exploration.ts';
export { RETRIEVAL_QUEST_TEMPLATES } from './retrieval.ts';
export { SOCIAL_QUEST_TEMPLATES } from './social.ts';

export {
  QUEST_TEMPLATES,
  getQuestTemplate,
  getQuestTemplatesByArchetype,
  getQuestTemplatesByTag,
  getQuestTemplatesForGiver,
  getQuestTemplatesForLevel,
  getRandomQuestTemplate,
} from './helpers.ts';
