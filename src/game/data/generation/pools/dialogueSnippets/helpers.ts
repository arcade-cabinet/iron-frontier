/**
 * Dialogue Snippets - Combined exports and utility functions
 */

import { type DialogueSnippet, DialogueSnippetSchema } from '../../../schemas/generation.ts';
import { GREETING_SNIPPETS, FAREWELL_SNIPPETS } from './greetings.ts';
import { THANKS_SNIPPETS, REFUSAL_SNIPPETS, AGREEMENT_SNIPPETS } from './social.ts';
import { QUESTION_SNIPPETS, RUMOR_SNIPPETS, SMALL_TALK_SNIPPETS } from './conversation.ts';
import { THREAT_SNIPPETS, BRIBE_SNIPPETS, COMPLIMENT_SNIPPETS, INSULT_SNIPPETS } from './conflict.ts';
import { QUEST_OFFER_SNIPPETS, QUEST_UPDATE_SNIPPETS, QUEST_COMPLETE_SNIPPETS } from './quest.ts';
import { SHOP_WELCOME_SNIPPETS, SHOP_BROWSE_SNIPPETS, SHOP_BUY_SNIPPETS, SHOP_SELL_SNIPPETS, SHOP_FAREWELL_SNIPPETS } from './shop.ts';

const RAW_SNIPPETS: DialogueSnippet[] = [
  ...GREETING_SNIPPETS,
  ...FAREWELL_SNIPPETS,
  ...THANKS_SNIPPETS,
  ...REFUSAL_SNIPPETS,
  ...AGREEMENT_SNIPPETS,
  ...QUESTION_SNIPPETS,
  ...RUMOR_SNIPPETS,
  ...THREAT_SNIPPETS,
  ...BRIBE_SNIPPETS,
  ...COMPLIMENT_SNIPPETS,
  ...INSULT_SNIPPETS,
  ...SMALL_TALK_SNIPPETS,
  ...QUEST_OFFER_SNIPPETS,
  ...QUEST_UPDATE_SNIPPETS,
  ...QUEST_COMPLETE_SNIPPETS,
  ...SHOP_WELCOME_SNIPPETS,
  ...SHOP_BROWSE_SNIPPETS,
  ...SHOP_BUY_SNIPPETS,
  ...SHOP_SELL_SNIPPETS,
  ...SHOP_FAREWELL_SNIPPETS,
];

// Parse all snippets through Zod to apply defaults
export const DIALOGUE_SNIPPETS: DialogueSnippet[] = RAW_SNIPPETS.map((snippet, index) => {
  try {
    return DialogueSnippetSchema.parse(snippet);
  } catch (error) {
    console.error(`Invalid dialogue snippet at index ${index}:`, snippet.id, error);
    // Return the original snippet if parsing fails (shouldn't happen with valid data)
    return snippet as DialogueSnippet;
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get snippets by category
 */
export function getSnippetsByCategory(category: DialogueSnippet['category']): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((s) => s.category === category);
}

/**
 * Get snippets valid for an NPC based on role, faction, and personality
 */
export function getSnippetsForNPC(
  role: string,
  faction: string,
  personality: Record<string, number>,
  category?: DialogueSnippet['category']
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    // Filter by category if specified
    if (category && snippet.category !== category) {
      return false;
    }

    // Check role restrictions
    if (snippet.validRoles && snippet.validRoles.length > 0 && !snippet.validRoles.includes(role)) {
      return false;
    }

    // Check faction restrictions
    if (
      snippet.validFactions &&
      snippet.validFactions.length > 0 &&
      !snippet.validFactions.includes(faction)
    ) {
      return false;
    }

    // Check personality minimums
    if (snippet.personalityMin) {
      for (const [trait, minValue] of Object.entries(snippet.personalityMin)) {
        if ((personality[trait] ?? 0.5) < minValue) {
          return false;
        }
      }
    }

    // Check personality maximums
    if (snippet.personalityMax) {
      for (const [trait, maxValue] of Object.entries(snippet.personalityMax)) {
        if ((personality[trait] ?? 0.5) > maxValue) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Get snippets by tag
 */
export function getSnippetsByTag(tag: string): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((s) => (s.tags ?? []).includes(tag));
}

/**
 * Get snippets filtered by multiple tags
 */
export function getSnippetsByTags(tags: string[], matchAll = false): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    const snippetTags = snippet.tags ?? [];
    if (snippetTags.length === 0) {
      return false;
    }
    if (matchAll) {
      return tags.every((tag) => snippetTags.includes(tag));
    }
    return tags.some((tag) => snippetTags.includes(tag));
  });
}

/**
 * Get snippets valid for a specific time of day
 */
export function getSnippetsByTimeOfDay(
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  category?: DialogueSnippet['category']
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    if (category && snippet.category !== category) {
      return false;
    }
    // If no time restriction, it's valid for all times
    if (!snippet.validTimeOfDay || snippet.validTimeOfDay.length === 0) {
      return true;
    }
    return snippet.validTimeOfDay.includes(timeOfDay);
  });
}

/**
 * Get a random snippet from a category
 */
export function getRandomSnippet(
  category: DialogueSnippet['category'],
  rng: { pick: <T>(arr: T[]) => T }
): DialogueSnippet | null {
  const snippets = getSnippetsByCategory(category);
  if (snippets.length === 0) return null;
  return rng.pick(snippets);
}

/**
 * Get a random text template from a snippet
 */
export function getRandomText(snippet: DialogueSnippet, rng: { pick: <T>(arr: T[]) => T }): string {
  return rng.pick(snippet.textTemplates);
}
