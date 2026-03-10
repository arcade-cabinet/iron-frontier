/**
 * Place Name Pool - RANCH NAME POOL
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';



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
