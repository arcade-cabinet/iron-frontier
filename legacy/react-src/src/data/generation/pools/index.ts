/**
 * Pools Index - Export all generation pools
 */

// Dialogue snippets
export {
  DIALOGUE_SNIPPETS,
  getRandomSnippet,
  getSnippetsByCategory,
  getSnippetsByTag,
  getSnippetsForNPC,
} from './dialogueSnippets';
// Name pools
export { getNamePool, NAME_POOLS } from './namePools';
// Place name pools
export { generatePlaceName, getPlaceNamePool, PLACE_NAME_POOLS } from './placeNamePools';

// Rumors and lore
export {
  getLoreByCategory,
  getLoreByRelatedId,
  getRandomRumor,
  getRumorsByCategory,
  LORE_FRAGMENTS,
  RUMOR_TEMPLATES,
} from './rumorsAndLore';
