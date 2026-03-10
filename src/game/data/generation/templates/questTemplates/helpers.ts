/**
 * Quest Template Helper Functions
 */

import {
  type QuestArchetype,
  type QuestTemplate,
  QuestTemplateSchema,
} from '../../../schemas/generation.ts';
import { COMBAT_QUEST_TEMPLATES } from './combat.ts';
import { DELIVERY_QUEST_TEMPLATES } from './delivery.ts';
import { ECONOMIC_QUEST_TEMPLATES } from './economic.ts';
import { EXPLORATION_QUEST_TEMPLATES } from './exploration.ts';
import { RETRIEVAL_QUEST_TEMPLATES } from './retrieval.ts';
import { SOCIAL_QUEST_TEMPLATES } from './social.ts';

export const QUEST_TEMPLATES: QuestTemplate[] = [
  ...COMBAT_QUEST_TEMPLATES,
  ...RETRIEVAL_QUEST_TEMPLATES,
  ...DELIVERY_QUEST_TEMPLATES,
  ...SOCIAL_QUEST_TEMPLATES,
  ...EXPLORATION_QUEST_TEMPLATES,
  ...ECONOMIC_QUEST_TEMPLATES,
];

// Validate all templates at load time
QUEST_TEMPLATES.forEach((template, index) => {
  try {
    QuestTemplateSchema.parse(template);
  } catch (error) {
    console.error(`Invalid quest template at index ${index}:`, template.id, error);
  }
});

// Build lookup indexes
const TEMPLATES_BY_ID: Record<string, QuestTemplate> = {};
const TEMPLATES_BY_ARCHETYPE: Record<QuestArchetype, QuestTemplate[]> = {
  bounty_hunt: [],
  clear_area: [],
  escort: [],
  ambush: [],
  fetch_item: [],
  steal_item: [],
  recover_lost: [],
  gather_materials: [],
  deliver_message: [],
  deliver_package: [],
  smuggle: [],
  find_person: [],
  investigate: [],
  spy: [],
  convince_npc: [],
  intimidate: [],
  mediate: [],
  explore_location: [],
  map_area: [],
  find_route: [],
  debt_collection: [],
  investment: [],
  trade_route: [],
};

for (const template of QUEST_TEMPLATES) {
  TEMPLATES_BY_ID[template.id] = template;
  TEMPLATES_BY_ARCHETYPE[template.archetype].push(template);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get quest template by ID
 */
export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return TEMPLATES_BY_ID[id];
}

/**
 * Get quest templates by archetype
 */
export function getQuestTemplatesByArchetype(archetype: QuestArchetype): QuestTemplate[] {
  return TEMPLATES_BY_ARCHETYPE[archetype] ?? [];
}

/**
 * Get quest templates valid for a level
 */
export function getQuestTemplatesForLevel(level: number): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => level >= t.levelRange[0] && level <= t.levelRange[1]);
}

/**
 * Get quest templates for a specific giver
 */
export function getQuestTemplatesForGiver(role: string, faction: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => {
    const roleMatch = t.giverRoles.length === 0 || t.giverRoles.includes(role);
    const factionMatch = t.giverFactions.length === 0 || t.giverFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}

/**
 * Get quest templates by tag
 */
export function getQuestTemplatesByTag(tag: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Get a random template matching criteria
 */
export function getRandomQuestTemplate(
  criteria: {
    archetype?: QuestArchetype;
    level?: number;
    tags?: string[];
    giverRole?: string;
    giverFaction?: string;
  },
  random: () => number = Math.random
): QuestTemplate | undefined {
  let candidates = [...QUEST_TEMPLATES];

  if (criteria.archetype) {
    candidates = candidates.filter((t) => t.archetype === criteria.archetype);
  }

  if (criteria.level !== undefined) {
    candidates = candidates.filter(
      (t) => criteria.level! >= t.levelRange[0] && criteria.level! <= t.levelRange[1]
    );
  }

  if (criteria.tags && criteria.tags.length > 0) {
    candidates = candidates.filter((t) => criteria.tags!.some((tag) => t.tags.includes(tag)));
  }

  if (criteria.giverRole) {
    candidates = candidates.filter((t) => t.giverRoles.includes(criteria.giverRole!));
  }

  if (criteria.giverFaction) {
    candidates = candidates.filter((t) => t.giverFactions.includes(criteria.giverFaction!));
  }

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates[Math.floor(random() * candidates.length)];
}
