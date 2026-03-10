/**
 * Rumor Templates - Quest hooks, locations, gossip, factions
 */

import type { RumorTemplate } from '../../../schemas/generation.ts';
import { RUMOR_QUEST_HOOK_TEMPLATES } from './rumors_quest_hooks.ts';
import { RUMOR_GOSSIP_TEMPLATES } from './rumors_gossip.ts';

export const RUMOR_HOOK_TEMPLATES: RumorTemplate[] = [
  ...RUMOR_QUEST_HOOK_TEMPLATES,
  ...RUMOR_GOSSIP_TEMPLATES,
];
