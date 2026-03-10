/**
 * Social Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { SOCIAL_CONVINCE_TEMPLATES } from './social_convince.ts';
import { SOCIAL_FIND_TEMPLATES } from './social_find.ts';
import { SOCIAL_INTIMIDATE_TEMPLATES } from './social_intimidate.ts';
import { SOCIAL_INVESTIGATE_TEMPLATES } from './social_investigate.ts';
import { SOCIAL_MEDIATE_TEMPLATES } from './social_mediate.ts';
import { SOCIAL_SPY_TEMPLATES } from './social_spy.ts';

export const SOCIAL_QUEST_TEMPLATES: QuestTemplate[] = [
  ...SOCIAL_FIND_TEMPLATES,
  ...SOCIAL_INVESTIGATE_TEMPLATES,
  ...SOCIAL_SPY_TEMPLATES,
  ...SOCIAL_CONVINCE_TEMPLATES,
  ...SOCIAL_INTIMIDATE_TEMPLATES,
  ...SOCIAL_MEDIATE_TEMPLATES,
];
