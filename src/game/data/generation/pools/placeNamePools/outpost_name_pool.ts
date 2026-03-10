/**
 * Place Name Pool - OUTPOST NAME POOL
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';



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
