/**
 * Retrieval Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { RETRIEVAL_FETCH_TEMPLATES } from './retrieval_fetch.ts';
import { RETRIEVAL_GATHER_TEMPLATES } from './retrieval_gather.ts';
import { RETRIEVAL_RECOVER_TEMPLATES } from './retrieval_recover.ts';
import { RETRIEVAL_STEAL_TEMPLATES } from './retrieval_steal.ts';

export const RETRIEVAL_QUEST_TEMPLATES: QuestTemplate[] = [
  ...RETRIEVAL_FETCH_TEMPLATES,
  ...RETRIEVAL_STEAL_TEMPLATES,
  ...RETRIEVAL_RECOVER_TEMPLATES,
  ...RETRIEVAL_GATHER_TEMPLATES,
];
