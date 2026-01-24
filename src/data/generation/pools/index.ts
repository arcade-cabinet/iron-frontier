/**
 * Pools Index - Export all generation pools
 */

// Name pools
export { NAME_POOLS, getNamePool } from './namePools';

// Place name pools
export { PLACE_NAME_POOLS, getPlaceNamePool, generatePlaceName } from './placeNamePools';

// Dialogue snippets
export {
  DIALOGUE_SNIPPETS,
  getSnippetsByCategory,
  getSnippetsForNPC,
  getSnippetsByTag,
  getRandomSnippet,
} from './dialogueSnippets';

// Rumors and lore
export {
  RUMOR_TEMPLATES,
  LORE_FRAGMENTS,
  getRumorsByCategory,
  getRandomRumor,
  getLoreByCategory,
  getLoreByRelatedId,
} from './rumorsAndLore';
