/**
 * Place Name Pool - STATION NAME POOL
 */

import type { PlaceNamePool } from '../../../schemas/generation.ts';



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
