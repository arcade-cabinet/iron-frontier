/**
 * Quest Templates - Procedural quest generation templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { COMBAT_QUEST_TEMPLATES } from './combat.ts';
import { DELIVERY_QUEST_TEMPLATES } from './delivery.ts';
import { ECONOMIC_QUEST_TEMPLATES } from './economic.ts';
import { EXPLORATION_QUEST_TEMPLATES } from './exploration.ts';
import { RETRIEVAL_QUEST_TEMPLATES } from './retrieval.ts';
import { SOCIAL_QUEST_TEMPLATES } from './social.ts';

export { COMBAT_QUEST_TEMPLATES } from './combat.ts';
export { DELIVERY_QUEST_TEMPLATES } from './delivery.ts';
export { ECONOMIC_QUEST_TEMPLATES } from './economic.ts';
export { EXPLORATION_QUEST_TEMPLATES } from './exploration.ts';
export { RETRIEVAL_QUEST_TEMPLATES } from './retrieval.ts';
export { SOCIAL_QUEST_TEMPLATES } from './social.ts';

export const QUEST_TEMPLATES: QuestTemplate[] = [
  ...COMBAT_QUEST_TEMPLATES,
  ...RETRIEVAL_QUEST_TEMPLATES,
  ...DELIVERY_QUEST_TEMPLATES,
  ...SOCIAL_QUEST_TEMPLATES,
  ...EXPLORATION_QUEST_TEMPLATES,
  ...ECONOMIC_QUEST_TEMPLATES,
];

export {
  getQuestTemplate,
  getQuestTemplatesByArchetype,
  getQuestTemplatesByTag,
  getQuestTemplatesForGiver,
  getQuestTemplatesForLevel,
  getRandomQuestTemplate,
} from './helpers.ts';
