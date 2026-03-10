/**
 * Quest Template Registry - Template storage and query functions
 */

import type { QuestArchetype, QuestTemplate } from '../../../schemas/generation';

// Template registry
let QUEST_TEMPLATES: QuestTemplate[] = [];

/**
 * Initialize quest templates
 */
export function initQuestTemplates(templates: QuestTemplate[]): void {
  QUEST_TEMPLATES = templates;
}

/**
 * Get quest template by ID
 */
export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get quest templates by archetype
 */
export function getQuestTemplatesByArchetype(archetype: QuestArchetype): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.archetype === archetype);
}

/**
 * Get quest templates valid for a level
 */
export function getQuestTemplatesForLevel(level: number): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => level >= t.levelRange[0] && level <= t.levelRange[1]);
}

/**
 * Get quest templates a specific giver role can offer
 */
export function getQuestTemplatesForGiver(role: string, faction: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => {
    const roleMatch = t.giverRoles.length === 0 || t.giverRoles.includes(role);
    const factionMatch = t.giverFactions.length === 0 || t.giverFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}
