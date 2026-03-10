import type { World } from '../schemas/world.ts';

type LocationEntry = World['locations'][number];

export const frontierLocations0: LocationEntry[] = [
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
];
