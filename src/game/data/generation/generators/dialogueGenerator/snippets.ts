/**
 * Dialogue Snippet Selection and Template Accessors
 */

import type { DialogueSnippet, DialogueTreeTemplate } from '../../../schemas/generation';
import type { SeededRandom } from '../../seededRandom';
import type { GeneratedNPC } from '../npcGenerator';
import { getSnippetsRegistry, getTreeTemplatesRegistry } from './types.ts';

/**
 * Get snippets by category
 */
export function getSnippetsByCategory(category: DialogueSnippet['category']): DialogueSnippet[] {
  return getSnippetsRegistry().filter((s) => s.category === category);
}

/**
 * Get snippets valid for an NPC
 */
export function getSnippetsForNPC(
  role: string,
  faction: string,
  personality: Record<string, number>
): DialogueSnippet[] {
  return getSnippetsRegistry().filter((snippet) => {
    const validRoles = snippet.validRoles ?? [];
    if (validRoles.length > 0 && !validRoles.includes(role)) {
      return false;
    }

    const validFactions = snippet.validFactions ?? [];
    if (validFactions.length > 0 && !validFactions.includes(faction)) {
      return false;
    }

    for (const [trait, minValue] of Object.entries(snippet.personalityMin ?? {})) {
      if ((personality[trait] ?? 0.5) < minValue) {
        return false;
      }
    }

    for (const [trait, maxValue] of Object.entries(snippet.personalityMax ?? {})) {
      if ((personality[trait] ?? 0.5) > maxValue) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get dialogue tree templates for a role
 */
export function getDialogueTreesForRole(role: string): DialogueTreeTemplate[] {
  return getTreeTemplatesRegistry().filter(
    (t) => t.validRoles.length === 0 || t.validRoles.includes(role)
  );
}

/**
 * Get dialogue tree template by ID
 */
export function getDialogueTreeTemplate(id: string): DialogueTreeTemplate | undefined {
  return getTreeTemplatesRegistry().find((t) => t.id === id);
}

/**
 * Select a snippet matching criteria
 */
export function selectSnippet(
  rng: SeededRandom,
  category: DialogueSnippet['category'],
  npc: GeneratedNPC,
  additionalTags: string[] = []
): DialogueSnippet | null {
  let candidates = getSnippetsByCategory(category);

  // Filter by NPC compatibility
  candidates = candidates.filter((s) => {
    const validRoles = s.validRoles ?? [];
    const validFactions = s.validFactions ?? [];
    if (validRoles.length > 0 && !validRoles.includes(npc.role)) {
      return false;
    }
    if (validFactions.length > 0 && !validFactions.includes(npc.faction)) {
      return false;
    }

    for (const [trait, minVal] of Object.entries(s.personalityMin ?? {})) {
      const npcVal = npc.personality[trait as keyof typeof npc.personality] ?? 0.5;
      if (npcVal < minVal) return false;
    }
    for (const [trait, maxVal] of Object.entries(s.personalityMax ?? {})) {
      const npcVal = npc.personality[trait as keyof typeof npc.personality] ?? 0.5;
      if (npcVal > maxVal) return false;
    }

    return true;
  });

  // Prefer snippets matching additional tags
  if (additionalTags.length > 0) {
    const tagMatched = candidates.filter((s) =>
      additionalTags.some((tag) => (s.tags ?? []).includes(tag))
    );
    if (tagMatched.length > 0) {
      candidates = tagMatched;
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return rng.pick(candidates);
}
