/**
 * Place Name Pools - Features
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


// ============================================================================
// LANDMARK NAME POOL
// ============================================================================

export const LANDMARK_NAME_POOL: PlaceNamePool = {
  adjectives: [
    // Ominous/Evocative
    "Devil's",
    "Dead Man's",
    "Hangman's",
    'Ghost',
    'Phantom',
    'Shadow',
    'Death',
    'Skull',
    'Bone',
    'Blood',
    "Hell's",
    "Satan's",
    "Demon's",
    // Mysterious
    'Lost',
    'Hidden',
    'Secret',
    'Forgotten',
    'Ancient',
    'Cursed',
    'Haunted',
    'Mysterious',
    'Strange',
    'Weird',
    'Eerie',
    'Silent',
    // Natural
    'Thunder',
    'Lightning',
    'Storm',
    'Wind',
    'Sun',
    'Moon',
    'Star',
    // Size/Shape
    'Giant',
    'Towering',
    'Massive',
    'Twin',
    'Triple',
    'Split',
    'Broken',
    // Colors
    'Red',
    'Black',
    'White',
    'Gray',
    'Painted',
    'Striped',
    // Wildlife
    'Eagle',
    'Hawk',
    'Vulture',
    'Coyote',
    'Wolf',
    'Bear',
    'Rattlesnake',
  ],
  nouns: [
    // Elevated
    'Peak',
    'Pinnacle',
    'Spire',
    'Tower',
    'Needle',
    'Monument',
    'Pillar',
    'Mesa',
    'Butte',
    'Bluff',
    'Mountain',
    'Ridge',
    'Crest',
    'Summit',
    // Low/Recessed
    'Canyon',
    'Gorge',
    'Chasm',
    'Abyss',
    'Pit',
    'Hollow',
    'Valley',
    'Basin',
    'Sink',
    'Crater',
    // Rocky
    'Rock',
    'Boulder',
    'Stone',
    'Cliff',
    'Face',
    'Wall',
    'Arch',
    'Bridge',
    'Cave',
    'Cavern',
    'Grotto',
    // Water
    'Falls',
    'Springs',
    'Pool',
    'Lake',
    'River',
    'Creek',
    'Wash',
    // Paths
    'Pass',
    'Gap',
    'Notch',
    'Trail',
    'Road',
    'Crossing',
    'Ford',
  ],
  suffixes: [
    'Point',
    'Head',
    'Top',
    'End',
    'Edge',
    'Face',
    'Overlook',
    'Vista',
    'View',
    'Lookout',
    'Formation',
    'Monument',
    'Landmark',
    'Trail',
    'Path',
    'Way',
    'Route',
  ],
  possessives: [
    // Legendary figures
    "Devil's",
    "Satan's",
    "Death's",
    "Hell's",
    "Old Scratch's",
    "Coyote's",
    "Raven's",
    "Eagle's",
    // Historical figures
    "Coronado's",
    "Carson's",
    "Bridger's",
    "Fremont's",
    "Apache's",
    "Comanche's",
    "Navajo's",
    // Frontier characters
    "Outlaw's",
    "Bandit's",
    "Prospector's",
    "Pioneer's",
    "Soldier's",
    "Cavalry's",
  ],
  patterns: [
    '{{adj}} {{noun}}', // Devil's Canyon
    '{{possessive}} {{noun}}', // Death's Door
    'The {{adj}} {{noun}}', // The Painted Desert
    '{{noun}} {{suffix}}', // Canyon Overlook
    '{{adj}} {{noun}} {{suffix}}', // Red Rock Point
    'The {{noun}}', // The Abyss
    '{{adj}} {{adj}} {{noun}}', // Twin Sister Peaks
    '{{possessive}} {{suffix}}', // Outlaw's Lookout
  ],
  tags: ['landmark', 'geographic', 'natural', 'exploration'],
};


// ============================================================================
// STATION NAME POOL
// ============================================================================

export const STATION_NAME_POOL: PlaceNamePool = {
  adjectives: [
    // Railroad-related
    'Iron',
    'Steel',
    'Steam',
    'Rail',
    'Track',
    'Line',
    // Telegraph-related
    'Wire',
    'Telegraph',
    'Signal',
    'Relay',
    // Geographic
    'High',
    'Low',
    'Flat',
    'Rocky',
    'Sandy',
    'Dusty',
    'North',
    'South',
    'East',
    'West',
    'Central',
    'Union',
    // Conditions
    'New',
    'Old',
    'Grand',
    'Great',
    'Little',
    // Colors
    'Red',
    'Black',
    'White',
    'Golden',
    'Silver',
    // Speed/Progress
    'Express',
    'Swift',
    'Quick',
    'Rapid',
    'Fast',
  ],
  nouns: [
    // Station-specific
    'Depot',
    'Station',
    'Terminal',
    'Yard',
    'Siding',
    'Switch',
    'Platform',
    'Stop',
    'Halt',
    'Junction',
    'Crossing',
    // Geographic features
    'Creek',
    'River',
    'Springs',
    'Wells',
    'Mesa',
    'Butte',
    'Ridge',
    'Peak',
    'Valley',
    'Canyon',
    'Pass',
    'Gap',
    'Flats',
    'Point',
    // Water towers etc
    'Tank',
    'Tower',
    'Water',
    'Coaling',
  ],
  suffixes: [
    'Station',
    'Depot',
    'Junction',
    'Crossing',
    'Terminal',
    'Siding',
    'Switch',
    'Yard',
    'Stop',
    'Halt',
    'Platform',
    'Point',
    'End',
    'Line',
    'Central',
    'Union',
    'Pacific',
    'Western',
    'Eastern',
  ],
  possessives: [
    // Railroad barons
    "Vanderbilt's",
    "Stanford's",
    "Huntington's",
    "Gould's",
    "Hill's",
    "Harriman's",
    "Drew's",
    "Fisk's",
    // Engineers/Workers
    "Engineer's",
    "Conductor's",
    "Brakeman's",
    "Fireman's",
    "Dispatcher's",
    "Telegrapher's",
    // Local names
    "Wilson's",
    "Murphy's",
    "Johnson's",
    "Thompson's",
    "Davis's",
  ],
  patterns: [
    '{{adj}} {{noun}} {{suffix}}', // Iron Horse Junction
    '{{noun}} {{suffix}}', // Creek Station
    '{{adj}} {{suffix}}', // Union Station
    '{{noun}} City {{suffix}}', // Mesa City Depot
    '{{possessive}} {{suffix}}', // Wilson's Junction
    '{{adj}} {{noun}}', // Iron Creek
    'Mile {{number}}', // Mile 42 (handled separately)
    '{{noun}} No. {{number}}', // Siding No. 7 (handled separately)
    'The {{adj}} {{noun}}', // The Grand Depot
    '{{adj}} Line {{suffix}}', // Pacific Line Terminal
  ],
  tags: ['station', 'railroad', 'telegraph', 'transport', 'infrastructure'],
};
