/**
 * Place Name Pool - MINE NAME POOL
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';


// ============================================================================
// MINE NAME POOL
// ============================================================================

export const MINE_NAME_POOL: PlaceNamePool = {
  adjectives: [
    // Fortune-related
    'Lucky',
    'Fortune',
    'Golden',
    'Silver',
    'Rich',
    'Bonanza',
    'Glory',
    'Grand',
    'Great',
    'Big',
    'Little',
    'Lost',
    'Hidden',
    'Secret',
    // Conditions
    'Deep',
    'Dark',
    'Black',
    'Old',
    'New',
    'Abandoned',
    'Working',
    'Dry',
    'Wet',
    'Flooded',
    'Collapsed',
    'Haunted',
    'Cursed',
    'Blessed',
    // Metals/Gems
    'Copper',
    'Iron',
    'Lead',
    'Tin',
    'Coal',
    'Crystal',
    'Diamond',
    'Ruby',
    'Emerald',
    'Sapphire',
  ],
  nouns: [
    // Mine types
    'Strike',
    'Claim',
    'Lode',
    'Vein',
    'Seam',
    'Deposit',
    'Mother Lode',
    'Diggins',
    'Pit',
    'Shaft',
    'Tunnel',
    'Hole',
    'Cut',
    // Ore/Materials
    'Gold',
    'Silver',
    'Copper',
    'Iron',
    'Lead',
    'Coal',
    'Ore',
    // Animals (superstition names)
    'Mule',
    'Burro',
    'Jackass',
    'Rattler',
    'Spider',
    // Geographic
    'Mountain',
    'Hill',
    'Ridge',
    'Canyon',
    'Gulch',
    'Creek',
    // Luck/Fortune
    'Fortune',
    'Chance',
    'Hope',
    'Dream',
    'Glory',
    'Destiny',
  ],
  suffixes: [
    'Mine',
    'Mines',
    'Pit',
    'Works',
    'Diggins',
    'Claim',
    'Strike',
    'Prospect',
    'Operation',
    'Excavation',
    'Shaft',
    'Tunnel',
    'Lode',
    'Vein',
    'Seam',
    'Hole',
    'Cut',
    'Quarry',
    'Site',
  ],
  possessives: [
    // Miner surnames
    "Sullivan's",
    "O'Brien's",
    "McCarthy's",
    "Kelly's",
    "Murphy's",
    "Schmidt's",
    "Weber's",
    "Mueller's",
    "Chang's",
    "Wong's",
    // Nicknames
    "Old Prospector's",
    "Lucky Pete's",
    "Mad Miner's",
    "Crazy Jack's",
    "One-Armed Charlie's",
    "Fool's",
    "Dead Man's",
    "Widow's",
  ],
  patterns: [
    '{{adj}} {{noun}} {{suffix}}', // Lucky Strike Mine
    'The {{adj}} {{noun}}', // The Golden Lode
    '{{possessive}} {{suffix}}', // Sullivan's Claim
    '{{adj}} {{suffix}}', // Lost Mine
    '{{noun}} {{suffix}}', // Glory Hole
    '{{possessive}} {{noun}}', // Murphy's Lode
    'The {{noun}} {{suffix}}', // The Mother Lode Mine
    '{{adj}} {{adj}} {{suffix}}', // Big Lucky Strike
    'Shaft {{number}}', // Shaft 7 (handled separately)
    '{{noun}} No. {{number}}', // Tunnel No. 3 (handled separately)
  ],
  tags: ['mine', 'mining', 'industry', 'underground'],
};
