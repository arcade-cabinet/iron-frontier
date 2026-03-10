import type { World } from '../schemas/world.ts';

type LocationEntry = World['locations'][number];

export const frontierLocations1: LocationEntry[] = [

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
