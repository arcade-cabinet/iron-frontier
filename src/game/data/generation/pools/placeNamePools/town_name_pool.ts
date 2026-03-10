/**
 * Place Name Pool - TOWN NAME POOL
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';


// const _COMMON_NOUNS = [
//   // Water features
//   'Creek',
//   'River',
//   'Springs',
//   'Wells',
//   'Gulch',
//   'Wash',
//   'Falls',
//   // Elevated terrain
//   'Mesa',
//   'Butte',
//   'Ridge',
//   'Peak',
//   'Bluff',
//   'Hill',
//   'Knoll',
//   'Mountain',
//   'Summit',
//   'Overlook',
//   // Low terrain
//   'Canyon',
//   'Valley',
//   'Hollow',
//   'Basin',
//   'Flats',
//   'Bottom',
//   // Rocky features
//   'Rock',
//   'Boulder',
//   'Stone',
//   'Cliff',
//   'Ledge',
//   'Crag',
//   // Passages
//   'Pass',
//   'Gap',
//   'Notch',
//   'Crossing',
//   'Ford',
//   'Trail',
//   // Other features
//   'Bend',
//   'Point',
//   'Fork',
//   'Branch',
//   'Draw',
//   'Gulley',
// ] as const;

// ============================================================================
// TOWN NAME POOL
// ============================================================================

export const TOWN_NAME_POOL: PlaceNamePool = {
  adjectives: [
    // Colors and metals
    'Red',
    'Black',
    'White',
    'Golden',
    'Silver',
    'Copper',
    'Iron',
    'Gray',
    // Conditions
    'Dusty',
    'Dry',
    'Broken',
    'Dead',
    'Lost',
    'Forgotten',
    'Silent',
    'Lonely',
    'Crooked',
    'Burnt',
    'Weathered',
    'Old',
    'New',
    // Descriptors
    'High',
    'Low',
    'Far',
    'Long',
    'Deep',
    'Flat',
    'Rocky',
    'Sandy',
    // Temperature
    'Cold',
    'Windy',
    'Scorched',
    'Parched',
    // Animals
    'Coyote',
    'Rattler',
    'Crow',
    'Wolf',
    'Eagle',
    'Hawk',
    'Mustang',
    'Buffalo',
    // Frontier
    'Wild',
    'Lonesome',
    'Frontier',
    'Border',
    'Last',
    'First',
  ],
  nouns: [
    // Geographic
    'Creek',
    'River',
    'Springs',
    'Wells',
    'Gulch',
    'Mesa',
    'Butte',
    'Ridge',
    'Peak',
    'Bluff',
    'Hill',
    'Canyon',
    'Valley',
    'Hollow',
    'Flats',
    'Rock',
    'Boulder',
    'Cliff',
    'Pass',
    'Gap',
    'Crossing',
    'Fork',
    'Bend',
    'Point',
    'Draw',
    'Basin',
    'Wash',
    'Falls',
    // Town-specific
    'Town',
    'City',
    'Settlement',
    'Camp',
    'Post',
  ],
  suffixes: [
    // Standard town suffixes
    'ville',
    'ton',
    'burg',
    'berg',
    'field',
    'dale',
    'wood',
    'land',
    // Western-specific
    'Gulch',
    'Junction',
    'Crossing',
    'Springs',
    'Falls',
    'Wells',
    'Creek',
    'Flats',
    'City',
    'Town',
    'Camp',
    'Post',
    'Station',
    'Point',
    'Landing',
    'Corner',
    'Corners',
    'End',
    'Center',
    'Heights',
    'View',
  ],
  possessives: [
    // Common frontier surnames
    "Smith's",
    "Jones's",
    "Brown's",
    "Wilson's",
    "Taylor's",
    "Jackson's",
    "Morgan's",
    "Murphy's",
    "Carter's",
    "Miller's",
    "Walker's",
    "Thompson's",
    "Martinez's",
    "Garcia's",
    "Rodriguez's",
    // Nicknames
    "Old Tom's",
    "Big Jake's",
    "Little Pete's",
    "Mad Dog's",
    "Lucky's",
    "One-Eye's",
    "Doc's",
    "Judge's",
    "Preacher's",
    "Colonel's",
  ],
  patterns: [
    '{{adj}} {{noun}}', // Dusty Gulch
    '{{noun}} {{suffix}}', // Creek Junction
    '{{adj}} {{noun}} {{suffix}}', // Red Mesa Springs
    '{{possessive}} {{noun}}', // Smith's Crossing
    '{{possessive}} {{suffix}}', // Murphy's Landing
    'Fort {{adj}}', // Fort Dusty
    'Fort {{noun}}', // Fort Mesa
    '{{adj}}{{suffix}}', // Dustyville
    '{{noun}} City', // Mesa City
    '{{adj}} {{suffix}}', // Red Junction
  ],
  tags: ['town', 'settlement', 'civilization'],
};
