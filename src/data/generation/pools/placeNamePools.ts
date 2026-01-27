/**
 * Iron Frontier - Place Name Pools
 *
 * Procedural place name generation pools for different location types.
 * Inspired by Western frontier naming conventions and Daggerfall-style
 * procedural generation.
 */

import type { PlaceNamePool } from '../../schemas/generation';
import { substituteTemplate } from '../../schemas/generation';
import type { SeededRandom } from '../seededRandom';

// ============================================================================
// SHARED WORD POOLS
// ============================================================================

/**
 * Common frontier adjectives usable across location types
 */
const _COMMON_ADJECTIVES = [
  // Colors
  'Red',
  'Black',
  'White',
  'Golden',
  'Silver',
  'Copper',
  'Iron',
  'Gray',
  'Brown',
  // Conditions
  'Dusty',
  'Dry',
  'Broken',
  'Dead',
  'Lost',
  'Forgotten',
  'Hidden',
  'Silent',
  'Lonely',
  'Crooked',
  'Twisted',
  'Hollow',
  'Burnt',
  'Rusted',
  'Weathered',
  // Descriptors
  'High',
  'Low',
  'Far',
  'Wide',
  'Long',
  'Deep',
  'Steep',
  'Flat',
  'Rocky',
  // Temperature/Weather
  'Cold',
  'Windy',
  'Scorched',
  'Parched',
  'Frozen',
  // Wildlife/Nature
  'Coyote',
  'Rattler',
  'Vulture',
  'Crow',
  'Wolf',
  'Bear',
  'Eagle',
  'Hawk',
  // Frontier Spirit
  'Wild',
  'Savage',
  'Lawless',
  'Outlaw',
  'Desperate',
  'Lonesome',
] as const;

/**
 * Common geographic nouns
 */
const _COMMON_NOUNS = [
  // Water features
  'Creek',
  'River',
  'Springs',
  'Wells',
  'Gulch',
  'Wash',
  'Falls',
  // Elevated terrain
  'Mesa',
  'Butte',
  'Ridge',
  'Peak',
  'Bluff',
  'Hill',
  'Knoll',
  'Mountain',
  'Summit',
  'Overlook',
  // Low terrain
  'Canyon',
  'Valley',
  'Hollow',
  'Basin',
  'Flats',
  'Bottom',
  // Rocky features
  'Rock',
  'Boulder',
  'Stone',
  'Cliff',
  'Ledge',
  'Crag',
  // Passages
  'Pass',
  'Gap',
  'Notch',
  'Crossing',
  'Ford',
  'Trail',
  // Other features
  'Bend',
  'Point',
  'Fork',
  'Branch',
  'Draw',
  'Gulley',
] as const;

// ============================================================================
// TOWN NAME POOL
// ============================================================================

const TOWN_NAME_POOL: PlaceNamePool = {
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

const RANCH_NAME_POOL: PlaceNamePool = {
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
// MINE NAME POOL
// ============================================================================

const MINE_NAME_POOL: PlaceNamePool = {
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

const LANDMARK_NAME_POOL: PlaceNamePool = {
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
// OUTPOST NAME POOL
// ============================================================================

const OUTPOST_NAME_POOL: PlaceNamePool = {
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

// ============================================================================
// STATION NAME POOL
// ============================================================================

const STATION_NAME_POOL: PlaceNamePool = {
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

// ============================================================================
// POOL REGISTRY
// ============================================================================

/**
 * All place name pools indexed by type
 */
export const PLACE_NAME_POOLS: Record<string, PlaceNamePool> = {
  town_names: TOWN_NAME_POOL,
  ranch_names: RANCH_NAME_POOL,
  mine_names: MINE_NAME_POOL,
  landmark_names: LANDMARK_NAME_POOL,
  outpost_names: OUTPOST_NAME_POOL,
  station_names: STATION_NAME_POOL,
};

/**
 * Get a place name pool by type
 * @param type The pool type identifier
 * @returns The place name pool or undefined if not found
 */
export function getPlaceNamePool(type: string): PlaceNamePool | undefined {
  return PLACE_NAME_POOLS[type];
}

// ============================================================================
// NAME GENERATION
// ============================================================================

/**
 * Letter pool for ranch brand-style names (e.g., "B-Bar Ranch")
 */
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion

/**
 * Generate a place name using a pool and seeded random
 * @param poolId The pool type identifier
 * @param rng Seeded random number generator
 * @returns Generated place name
 */
export function generatePlaceName(poolId: string, rng: SeededRandom): string {
  const pool = getPlaceNamePool(poolId);
  if (!pool) {
    throw new Error(`Unknown place name pool: ${poolId}`);
  }

  // Pick a random pattern
  const pattern = rng.pick(pool.patterns);

  // Build substitution variables
  const variables: Record<string, string> = {};

  // Handle special patterns first
  if (pattern.includes('{{letter}}')) {
    // Generate brand-style names like "B-Bar" or "Double-K"
    const letter1 = LETTERS[rng.int(0, LETTERS.length - 1)];
    const letter2 = LETTERS[rng.int(0, LETTERS.length - 1)];
    variables['letter'] = letter1;
    // Replace second {{letter}} separately if present
    const result = pattern.replace('{{letter}}', letter1).replace('{{letter}}', letter2);
    return applyRemainingSubstitutions(result, pool, rng, variables);
  }

  if (pattern.includes('{{number}}')) {
    // Generate numbered locations like "Shaft 7" or "Mile 42"
    variables['number'] = String(rng.int(1, 99));
  }

  // Standard substitutions
  if (pattern.includes('{{adj}}')) {
    variables['adj'] = rng.pick(pool.adjectives);
  }

  if (pattern.includes('{{noun}}')) {
    variables['noun'] = rng.pick(pool.nouns);
  }

  if (pattern.includes('{{suffix}}')) {
    variables['suffix'] = rng.pick(pool.suffixes);
  }

  if (pattern.includes('{{possessive}}')) {
    variables['possessive'] = rng.pick(pool.possessives);
  }

  return substituteTemplate(pattern, variables);
}

/**
 * Apply remaining substitutions after handling special cases
 */
function applyRemainingSubstitutions(
  result: string,
  pool: PlaceNamePool,
  rng: SeededRandom,
  existingVars: Record<string, string>
): string {
  const variables = { ...existingVars };

  if (result.includes('{{adj}}')) {
    variables['adj'] = rng.pick(pool.adjectives);
  }
  if (result.includes('{{noun}}')) {
    variables['noun'] = rng.pick(pool.nouns);
  }
  if (result.includes('{{suffix}}')) {
    variables['suffix'] = rng.pick(pool.suffixes);
  }
  if (result.includes('{{possessive}}')) {
    variables['possessive'] = rng.pick(pool.possessives);
  }
  if (result.includes('{{number}}')) {
    variables['number'] = String(rng.int(1, 99));
  }

  return substituteTemplate(result, variables);
}

/**
 * Generate multiple unique place names
 * @param poolId The pool type identifier
 * @param count Number of names to generate
 * @param rng Seeded random number generator
 * @returns Array of unique generated names
 */
export function generatePlaceNames(poolId: string, count: number, rng: SeededRandom): string[] {
  const names = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loops

  while (names.size < count && attempts < maxAttempts) {
    names.add(generatePlaceName(poolId, rng));
    attempts++;
  }

  return Array.from(names);
}

/**
 * Generate a place name with specific constraints
 * @param poolId The pool type identifier
 * @param rng Seeded random number generator
 * @param options Generation options
 * @returns Generated place name
 */
export function generateConstrainedPlaceName(
  poolId: string,
  rng: SeededRandom,
  options: {
    /** Prefer patterns containing these variables */
    preferVariables?: ('adj' | 'noun' | 'suffix' | 'possessive')[];
    /** Exclude patterns containing these variables */
    excludeVariables?: ('adj' | 'noun' | 'suffix' | 'possessive')[];
    /** Maximum name length in characters */
    maxLength?: number;
  } = {}
): string {
  const pool = getPlaceNamePool(poolId);
  if (!pool) {
    throw new Error(`Unknown place name pool: ${poolId}`);
  }

  // Filter patterns based on options
  let patterns = [...pool.patterns];

  if (options.preferVariables?.length) {
    const preferred = patterns.filter((p) =>
      options.preferVariables!.some((v) => p.includes(`{{${v}}}`))
    );
    if (preferred.length > 0) {
      patterns = preferred;
    }
  }

  if (options.excludeVariables?.length) {
    patterns = patterns.filter(
      (p) => !options.excludeVariables!.some((v) => p.includes(`{{${v}}}`))
    );
  }

  // Fall back to default if no patterns match
  if (patterns.length === 0) {
    patterns = pool.patterns;
  }

  // Create a temporary pool with filtered patterns
  const tempPool: PlaceNamePool = { ...pool, patterns };

  // Generate with length constraint
  if (options.maxLength) {
    let attempts = 0;
    while (attempts < 20) {
      const tempRng = rng.child(`attempt_${attempts}`);
      const pattern = tempRng.pick(tempPool.patterns);
      const variables: Record<string, string> = {};

      if (pattern.includes('{{adj}}')) {
        variables['adj'] = tempRng.pick(tempPool.adjectives);
      }
      if (pattern.includes('{{noun}}')) {
        variables['noun'] = tempRng.pick(tempPool.nouns);
      }
      if (pattern.includes('{{suffix}}')) {
        variables['suffix'] = tempRng.pick(tempPool.suffixes);
      }
      if (pattern.includes('{{possessive}}')) {
        variables['possessive'] = tempRng.pick(tempPool.possessives);
      }
      if (pattern.includes('{{number}}')) {
        variables['number'] = String(tempRng.int(1, 99));
      }

      const name = substituteTemplate(pattern, variables);
      if (name.length <= options.maxLength) {
        return name;
      }
      attempts++;
    }
  }

  // Generate normally
  const pattern = rng.pick(tempPool.patterns);
  const variables: Record<string, string> = {};

  if (pattern.includes('{{adj}}')) {
    variables['adj'] = rng.pick(tempPool.adjectives);
  }
  if (pattern.includes('{{noun}}')) {
    variables['noun'] = rng.pick(tempPool.nouns);
  }
  if (pattern.includes('{{suffix}}')) {
    variables['suffix'] = rng.pick(tempPool.suffixes);
  }
  if (pattern.includes('{{possessive}}')) {
    variables['possessive'] = rng.pick(tempPool.possessives);
  }
  if (pattern.includes('{{number}}')) {
    variables['number'] = String(rng.int(1, 99));
  }

  return substituteTemplate(pattern, variables);
}

/**
 * Get all available pool types
 */
export function getAvailablePoolTypes(): string[] {
  return Object.keys(PLACE_NAME_POOLS);
}
