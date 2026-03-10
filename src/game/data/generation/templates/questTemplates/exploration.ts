/**
 * Exploration Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { EXPLORATION_EXPLORE_TEMPLATES } from './exploration_explore.ts';
import { EXPLORATION_MAP_TEMPLATES } from './exploration_map.ts';
import { EXPLORATION_FIND_TEMPLATES } from './exploration_find.ts';

export { EXPLORATION_EXPLORE_TEMPLATES } from './exploration_explore.ts';
export { EXPLORATION_MAP_TEMPLATES } from './exploration_map.ts';
export { EXPLORATION_FIND_TEMPLATES } from './exploration_find.ts';

export const EXPLORATION_QUEST_TEMPLATES: QuestTemplate[] = [
  ...EXPLORATION_EXPLORE_TEMPLATES,
  ...EXPLORATION_MAP_TEMPLATES,
  ...EXPLORATION_FIND_TEMPLATES,
];
