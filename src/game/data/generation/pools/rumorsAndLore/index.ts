/**
 * Rumors and Lore - World-building content
 */

export { RUMOR_HOOK_TEMPLATES } from './rumors_hooks.ts';
export { RUMOR_WORLD_TEMPLATES } from './rumors_world.ts';
export { LORE_HISTORY_FRAGMENTS } from './lore_history.ts';
export { LORE_WORLD_FRAGMENTS } from './lore_world.ts';

export {
  getAllLoreIds,
  getAllRumorIds,
  getAutomaticLore,
  getLoreByCategory,
  getLoreById,
  getLoreByDiscoveryMethod,
  getLoreByRelatedId,
  getLoreByTags,
  getRandomLore,
  getRandomRumor,
  getRumorById,
  getRumorsByCategory,
  getRumorsByTags,
  LORE_FRAGMENTS,
  RUMOR_TEMPLATES,
} from './helpers.ts';
