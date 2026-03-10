/**
 * Combat Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { COMBAT_AMBUSH_TEMPLATES } from './combat_ambush.ts';
import { COMBAT_BOUNTY_TEMPLATES } from './combat_bounty.ts';
import { COMBAT_CLEAR_TEMPLATES } from './combat_clear.ts';
import { COMBAT_ESCORT_TEMPLATES } from './combat_escort.ts';

export const COMBAT_QUEST_TEMPLATES: QuestTemplate[] = [
  ...COMBAT_BOUNTY_TEMPLATES,
  ...COMBAT_CLEAR_TEMPLATES,
  ...COMBAT_ESCORT_TEMPLATES,
  ...COMBAT_AMBUSH_TEMPLATES,
];
