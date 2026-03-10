/**
 * Frontier Territory - Location Definitions
 *
 * 16 locations across 3 tiers:
 *   Tier 1 (7): Core locations forming the critical path
 *   Tier 2 (5): Secondary locations with side content
 *   Tier 3 (4): Flavor locations for exploration
 */

import type { World } from '../../schemas/world';

type LocationEntry = World['locations'][number];

export const frontierLocations: LocationEntry[] = [
  // ========== TIER 1 - CORE LOCATIONS (7) ==========

  // FRONTIER'S EDGE - Starting town, Central Plains, Lvl 1
  {
    id: 'dusty_springs',
    type: 'town',
    name: "Frontier's Edge",
    coord: { wx: 11, wy: 9 },
    locationDataId: 'dusty_springs',
    size: 'medium',
    discovered: true,
    accessible: true,
    tags: ['starting', 'tutorial', 'hub', 'services', 'frontiers_edge', 'level_1'],
  },

  // COLDWATER - Ranch town, Central Plains, Lvl 1-2
  {
    id: 'sunset_ranch',
    type: 'town',
    name: 'Coldwater',
    coord: { wx: 9, wy: 8 },
    locationDataId: 'sunset_ranch',
    size: 'large',
    discovered: true,
    accessible: true,
    tags: ['ranch', 'pastoral', 'coldwater', 'act_2', 'level_1', 'level_2'],
  },

  // IRON GULCH - Mining town, Central Plains, Lvl 2
  {
    id: 'junction_city',
    type: 'town',
    name: 'Iron Gulch',
    coord: { wx: 14, wy: 10 },
    locationDataId: 'junction_city',
    size: 'medium',
    discovered: true,
    accessible: true,
    tags: ['mining', 'industrial', 'hub', 'iron_gulch', 'act_1', 'level_2'],
  },

  // COYOTE SPRINGS - Waystation, Western Desert, Lvl 2
  {
    id: 'coyote_springs',
    type: 'waystation',
    name: 'Coyote Springs',
    coord: { wx: 4, wy: 8 },
    locationDataId: 'desert_waystation',
    size: 'small',
    discovered: true,
    accessible: true,
    tags: ['oasis', 'information', 'rest', 'water', 'level_2'],
  },

  // COPPERTOWN - Town, Iron Mountains, Lvl 3
  {
    id: 'coppertown',
    type: 'town',
    name: 'Coppertown',
    coord: { wx: 16, wy: 3 },
    locationDataId: 'coppertown',
    size: 'medium',
    discovered: false,
    accessible: true,
    tags: ['company_town', 'mining', 'ivrc_controlled', 'oppressive', 'level_3'],
  },

  // MESA POINT - Outlaw town, Devil's Backbone, Lvl 3-4
  {
    id: 'rattlesnake_canyon',
    type: 'town',
    name: 'Mesa Point',
    coord: { wx: 8, wy: 2 },
    locationDataId: 'rattlesnake_canyon',
    size: 'medium',
    discovered: false,
    accessible: true,
    tags: ['outlaw', 'mesa_point', 'act_2', 'dangerous', 'level_3', 'level_4'],
  },

  // SALVATION - Endgame town, Iron Mountains, Lvl 4-5
  {
    id: 'old_works',
    type: 'town',
    name: 'Salvation',
    coord: { wx: 18, wy: 1 },
    locationDataId: 'old_works',
    size: 'large',
    discovered: false,
    accessible: true,
    tags: [
      'endgame',
      'salvation',
      'act_3',
      'finale',
      'level_4',
      'level_5',
    ],
  },

  // ========== TIER 2 - SECONDARY LOCATIONS (5) ==========

  // THORNWOOD STATION - Waystation, Dry Creek, Lvl 1
  {
    id: 'thornwood_station',
    type: 'waystation',
    name: 'Thornwood Station',
    coord: { wx: 8, wy: 14 },
    locationDataId: 'thornwood_station',
    size: 'small',
    discovered: true,
    accessible: true,
    tags: ['railroad', 'southern_entry', 'rest', 'level_1'],
  },

  // PROSPECT - Additional town slot, Dry Creek, Lvl 1-2
  {
    id: 'prospect',
    type: 'town',
    name: 'Prospect',
    coord: { wx: 12, wy: 14 },
    locationDataId: 'prospect',
    size: 'small',
    discovered: true,
    accessible: true,
    tags: ['additional_town', 'farming', 'hopeful', 'level_1', 'level_2'],
  },

  // FREEMINER HOLLOW - Camp, Iron Mountains, Lvl 3
  {
    id: 'freeminer_hollow',
    type: 'camp',
    name: "Freeminer's Hollow",
    coord: { wx: 15, wy: 2 },
    locationDataId: 'freeminer_hollow',
    size: 'medium',
    discovered: false,
    accessible: true,
    tags: ['freeminer_base', 'resistance', 'old_samuel', 'level_3'],
  },

  // SIGNAL ROCK - Landmark, Devil's Backbone, Lvl 3
  {
    id: 'signal_rock',
    type: 'landmark',
    name: 'Signal Rock',
    coord: { wx: 6, wy: 3 },
    locationDataId: 'signal_rock',
    size: 'tiny',
    discovered: false,
    accessible: true,
    tags: ['landmark', 'navigation', 'gang_lookout', 'ancient', 'level_3'],
  },

  // DEAD MAN'S GULCH - Hideout, Devil's Backbone, Lvl 4
  {
    id: 'dead_mans_gulch',
    type: 'hideout',
    name: "Dead Man's Gulch",
    coord: { wx: 10, wy: 1 },
    locationDataId: 'dead_mans_gulch',
    size: 'small',
    discovered: false,
    accessible: true,
    tags: ['outlaw', 'ambush_site', 'mass_grave', 'dangerous', 'level_4'],
  },

  // ========== TIER 3 - FLAVOR LOCATIONS (4) ==========

  // BLEACHED BONES - Ruins, Western Desert, Lvl 2
  {
    id: 'bleached_bones',
    type: 'ruins',
    name: 'Bleached Bones',
    coord: { wx: 2, wy: 6 },
    seed: 28761,
    size: 'small',
    discovered: false,
    accessible: true,
    tags: ['ghost_town', 'stagecoach_station', 'abandoned', 'mystery', 'level_2'],
  },

  // THE FURNACE - Landmark, Western Desert, Lvl 2-3
  {
    id: 'the_furnace',
    type: 'landmark',
    name: 'The Furnace',
    coord: { wx: 3, wy: 5 },
    seed: 38572,
    size: 'small',
    discovered: false,
    accessible: true,
    tags: ['hot_springs', 'hermit', 'natural', 'refuge', 'level_2', 'level_3'],
  },

  // BROKEN WHEEL - Farm, Central Plains, Lvl 1
  {
    id: 'broken_wheel',
    type: 'farm',
    name: 'Broken Wheel Farm',
    coord: { wx: 13, wy: 8 },
    seed: 48293,
    size: 'small',
    discovered: true,
    accessible: true,
    tags: ['farming', 'poor', 'quest_location', 'level_1'],
  },

  // SILVER VEIN - Mine, Iron Mountains, Lvl 3
  {
    id: 'silver_vein',
    type: 'mine',
    name: 'Silver Vein Mine',
    coord: { wx: 17, wy: 4 },
    seed: 58194,
    size: 'medium',
    discovered: false,
    accessible: true,
    tags: ['silver', 'valuable', 'contested', 'resource', 'level_3'],
  },
];
