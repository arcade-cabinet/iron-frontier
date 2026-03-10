/**
 * Place Name Pools - Settlements
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


// ============================================================================
// RANCH NAME POOL
// ============================================================================

export const RANCH_NAME_POOL: PlaceNamePool = {
  adjectives: [
    // Ranch-appropriate descriptors
    'Double',
    'Triple',
    'Lucky',
    'Lazy',
    'Running',
    'Flying',
    'Rocking',
    'Rolling',
    'Rising',
    'Setting',
    'Blazing',
    'Shining',
    'Golden',
    'Silver',
    'Copper',
    'Iron',
    'Diamond',
    'Star',
    'Circle',
    'Square',
    'Broken',
    'Crooked',
    'Straight',
    'Long',
    'Wide',
    'Big',
    'Little',
    'Old',
    'New',
    'High',
    'Low',
    'Hidden',
    'Lonesome',
    'Peaceful',
    'Wild',
    'Winding',
  ],
  nouns: [
    // Symbols/Objects
    'Diamond',
    'Star',
    'Arrow',
    'Horseshoe',
    'Spur',
    'Saddle',
    'Boot',
    'Hat',
    'Brand',
    'Iron',
    'Anchor',
    'Cross',
    'Crown',
    'Heart',
    // Animals
    'Horse',
    'Mustang',
    'Bull',
    'Steer',
    'Cattle',
    'Longhorn',
    'Buffalo',
    'Coyote',
    'Wolf',
    'Eagle',
    'Hawk',
    'Dove',
    'Raven',
    // Nature
    'Oak',
    'Pine',
    'Cottonwood',
    'Willow',
    'Mesquite',
    'Cactus',
    'Sage',
    'Creek',
    'River',
    'Springs',
    'Mesa',
    'Canyon',
    'Ridge',
    'Valley',
    'Sunset',
    'Sunrise',
    'Thunder',
    'Lightning',
    'Wind',
    'Dust',
  ],
  suffixes: [
    'Ranch',
    'Farm',
    'Homestead',
    'Spread',
    'Estate',
    'Acres',
    'Range',
    'Land',
    'Holdings',
    'Place',
    'Station',
    'Camp',
    'Corral',
    'Hacienda',
    'Rancho',
    'Ranchero',
    // Letter/Number combos
    'Bar',
    'Circle',
    'Square',
    'Cross',
    'Slash',
  ],
  possessives: [
    // Rancher surnames
    "Johnson's",
    "Williams's",
    "Davis's",
    "Anderson's",
    "Thomas's",
    "White's",
    "Harris's",
    "Martin's",
    "Thompson's",
    "Young's",
    "King's",
    "Scott's",
    "Green's",
    "Baker's",
    "Hill's",
    // Nicknames
    "Big Jim's",
    "Old Man's",
    "Widow's",
    "Grandpa's",
    "Papa's",
    "Slim's",
    "Curly's",
    "Red's",
    "Dusty's",
    "Tex's",
  ],
  patterns: [
    '{{adj}} {{noun}} {{suffix}}', // Double Diamond Ranch
    'The {{adj}} {{noun}}', // The Lazy Horseshoe
    '{{possessive}} {{suffix}}', // Johnson's Spread
    '{{adj}} {{suffix}}', // Running Bar Ranch
    '{{noun}} {{suffix}}', // Horseshoe Ranch
    '{{adj}} {{adj}} {{suffix}}', // Double Lucky Ranch
    '{{letter}}-{{letter}} {{suffix}}', // Special pattern handled separately
    'The {{noun}}', // The Longhorn
    '{{possessive}} {{noun}}', // Wilson's Creek
    '{{adj}} {{noun}}', // Flying Eagle
  ],
  tags: ['ranch', 'farm', 'agriculture', 'rural'],
};


// ============================================================================
// OUTPOST NAME POOL
// ============================================================================

export const OUTPOST_NAME_POOL: PlaceNamePool = {
  adjectives: [
    // Remoteness
    'Lonely',
    'Lonesome',
    'Remote',
    'Distant',
    'Far',
    'Last',
    'End',
    'Border',
    'Frontier',
    'Edge',
    'Outpost',
    'Way',
    // Conditions
    'Dusty',
    'Dry',
    'Windy',
    'Scorched',
    'Sun-bleached',
    'Weather-beaten',
    'Ramshackle',
    'Rickety',
    'Tumbledown',
    'Abandoned',
    'Forgotten',
    // Descriptors
    'Old',
    'New',
    'Little',
    'Small',
    'Tiny',
    'Hidden',
    'Secret',
    // Territorial
    'Comanche',
    'Apache',
    'Navajo',
    'Sioux',
    'Cheyenne',
    // Military
    'Army',
    'Cavalry',
    'Scout',
    'Ranger',
    'Patrol',
  ],
  nouns: [
    // Settlement types
    'Post',
    'Station',
    'Camp',
    'Stop',
    'Rest',
    'Waystation',
    'Shelter',
    'Refuge',
    'Haven',
    'Hideout',
    'Den',
    // Geographic
    'Creek',
    'Springs',
    'Wells',
    'Gulch',
    'Canyon',
    'Mesa',
    'Butte',
    'Pass',
    'Gap',
    'Crossing',
    'Ford',
    'Trail',
    'Road',
    // Structures
    'Cabin',
    'Shack',
    'Hut',
    'Dugout',
    'Stockade',
    'Palisade',
    'Adobe',
    'Hovel',
    'Shanty',
  ],
  suffixes: [
    'Post',
    'Station',
    'Stop',
    'Rest',
    'Camp',
    'Outpost',
    'Trading Post',
    'Way Station',
    'Relay',
    'Depot',
    'Point',
    'Corner',
    'Crossing',
    'Junction',
  ],
  possessives: [
    // Traders/Trappers
    "Trapper's",
    "Trader's",
    "Scout's",
    "Hunter's",
    "Guide's",
    "Pathfinder's",
    "Woodsman's",
    "Ranger's",
    // Personal names
    "Jake's",
    "Pete's",
    "Bill's",
    "Sam's",
    "Joe's",
    "Hank's",
    "Buck's",
    "Slim's",
    "Rusty's",
    "Dusty's",
  ],
  patterns: [
    '{{adj}} {{noun}} {{suffix}}', // Lonely Creek Post
    '{{possessive}} {{suffix}}', // Trader's Station
    '{{adj}} {{suffix}}', // Last Stop
    '{{noun}} {{suffix}}', // Canyon Outpost
    '{{possessive}} {{noun}}', // Jake's Cabin
    'The {{adj}} {{noun}}', // The Lonesome Post
    '{{adj}} {{noun}}', // Border Camp
    'Fort {{adj}}', // Fort Remote
    'Camp {{noun}}', // Camp Mesa
  ],
  tags: ['outpost', 'remote', 'frontier', 'wilderness'],
};
