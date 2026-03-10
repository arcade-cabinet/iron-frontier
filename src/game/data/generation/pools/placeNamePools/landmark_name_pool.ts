/**
 * Place Name Pool - LANDMARK NAME POOL
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';



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
