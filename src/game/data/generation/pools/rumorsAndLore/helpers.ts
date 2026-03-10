/**
 * Rumors and Lore - Combined registry and helpers
 */

import type { GenerationContext, LoreFragment, RumorTemplate } from '../../../schemas/generation.ts';
import type { SeededRandom } from '../../seededRandom.ts';
import { RUMOR_HOOK_TEMPLATES } from './rumors_hooks.ts';
import { RUMOR_WORLD_TEMPLATES } from './rumors_world.ts';
import { LORE_HISTORY_FRAGMENTS } from './lore_history.ts';
import { LORE_WORLD_FRAGMENTS } from './lore_world.ts';

export const RUMOR_TEMPLATES: RumorTemplate[] = [
  ...RUMOR_HOOK_TEMPLATES,
  ...RUMOR_WORLD_TEMPLATES,
];

export const LORE_FRAGMENTS: LoreFragment[] = [
  ...LORE_HISTORY_FRAGMENTS,
  ...LORE_WORLD_FRAGMENTS,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all rumors of a specific category
 */
export function getRumorsByCategory(category: RumorTemplate['category']): RumorTemplate[] {
  return RUMOR_TEMPLATES.filter((rumor) => rumor.category === category);
}

/**
 * Get rumors filtered by tags
 */
export function getRumorsByTags(tags: string[]): RumorTemplate[] {
  if (tags.length === 0) return RUMOR_TEMPLATES;
  return RUMOR_TEMPLATES.filter((rumor) => rumor.tags?.some((tag) => tags.includes(tag)));
}

/**
 * Get a random rumor appropriate for the context
 */
export function getRandomRumor(
  context: GenerationContext,
  rng: SeededRandom,
  options?: {
    category?: RumorTemplate['category'];
    tags?: string[];
    excludeIds?: string[];
  }
): RumorTemplate | null {
  let candidates = [...RUMOR_TEMPLATES];

  // Filter by category
  if (options?.category) {
    candidates = candidates.filter((r) => r.category === options.category);
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    candidates = candidates.filter((r) => r.tags?.some((tag) => options.tags!.includes(tag)));
  }

  // Exclude specific IDs
  if (options?.excludeIds && options.excludeIds.length > 0) {
    candidates = candidates.filter((r) => !options.excludeIds!.includes(r.id));
  }

  // Filter by context tags if provided
  if (context.contextTags.length > 0) {
    const contextFiltered = candidates.filter((r) =>
      r.tags?.some((tag) => context.contextTags.includes(tag))
    );
    // Only use context filtering if it leaves some candidates
    if (contextFiltered.length > 0) {
      candidates = contextFiltered;
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Weight by prevalence
  const weights = candidates.map((r) => r.prevalence ?? 0.5);
  return rng.weightedPick(candidates, weights);
}

/**
 * Get all lore fragments of a specific category
 */
export function getLoreByCategory(category: LoreFragment['category']): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.category === category);
}

/**
 * Get lore fragments related to a specific entity ID
 */
export function getLoreByRelatedId(id: string): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.relatedIds?.includes(id));
}

/**
 * Get lore filtered by tags
 */
export function getLoreByTags(tags: string[]): LoreFragment[] {
  if (tags.length === 0) return LORE_FRAGMENTS;
  return LORE_FRAGMENTS.filter((lore) => lore.tags?.some((tag) => tags.includes(tag)));
}

/**
 * Get lore filtered by discovery method
 */
export function getLoreByDiscoveryMethod(method: LoreFragment['discoveryMethod']): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.discoveryMethod === method);
}

/**
 * Get a random lore fragment appropriate for context
 */
export function getRandomLore(
  rng: SeededRandom,
  options?: {
    category?: LoreFragment['category'];
    discoveryMethod?: LoreFragment['discoveryMethod'];
    tags?: string[];
    relatedId?: string;
    excludeIds?: string[];
  }
): LoreFragment | null {
  let candidates = [...LORE_FRAGMENTS];

  // Filter by category
  if (options?.category) {
    candidates = candidates.filter((l) => l.category === options.category);
  }

  // Filter by discovery method
  if (options?.discoveryMethod) {
    candidates = candidates.filter((l) => l.discoveryMethod === options.discoveryMethod);
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    candidates = candidates.filter((l) => l.tags?.some((tag) => options.tags!.includes(tag)));
  }

  // Filter by related ID
  if (options?.relatedId) {
    candidates = candidates.filter((l) => l.relatedIds?.includes(options.relatedId!));
  }

  // Exclude specific IDs
  if (options?.excludeIds && options.excludeIds.length > 0) {
    candidates = candidates.filter((l) => !options.excludeIds!.includes(l.id));
  }

  if (candidates.length === 0) {
    return null;
  }

  return rng.pick(candidates);
}

/**
 * Get automatic lore (known from the start)
 */
export function getAutomaticLore(): LoreFragment[] {
  return LORE_FRAGMENTS.filter((lore) => lore.discoveryMethod === 'automatic');
}

/**
 * Get all rumor template IDs
 */
export function getAllRumorIds(): string[] {
  return RUMOR_TEMPLATES.map((r) => r.id);
}

/**
 * Get all lore fragment IDs
 */
export function getAllLoreIds(): string[] {
  return LORE_FRAGMENTS.map((l) => l.id);
}

/**
 * Get a specific rumor by ID
 */
export function getRumorById(id: string): RumorTemplate | undefined {
  return RUMOR_TEMPLATES.find((r) => r.id === id);
}

/**
 * Get a specific lore fragment by ID
 */
export function getLoreById(id: string): LoreFragment | undefined {
  return LORE_FRAGMENTS.find((l) => l.id === id);
}

// ============================================================================
// EXPORTS
// ============================================================================
