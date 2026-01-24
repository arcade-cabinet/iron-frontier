/**
 * Frontier Territory - Sample World Definition
 *
 * A complete world with regions, locations, and connections.
 * Demonstrates how the world schema ties everything together.
 */

import { World, validateWorld } from '../schemas/world';

export const FrontierTerritory: World = validateWorld({
  id: 'frontier_territory',
  name: 'Frontier Territory',
  description: 'A vast expanse of untamed land where fortune and danger walk hand in hand.',

  seed: 12345,

  dimensions: {
    width: 20,
    height: 15,
  },

  regions: [
    // Central grasslands - most civilized
    {
      id: 'region_central_plains',
      name: 'Central Plains',
      description: 'Fertile grasslands dotted with ranches and the territory\'s main town.',
      biome: 'grassland',
      baseDanger: 'low',
      bounds: { minX: 5, maxX: 14, minY: 5, maxY: 10 },
      discovered: true,
      tags: ['civilized', 'ranching'],
    },

    // Western desert
    {
      id: 'region_western_desert',
      name: 'Western Desert',
      description: 'Scorching sands broken only by the occasional oasis.',
      biome: 'desert',
      baseDanger: 'moderate',
      bounds: { minX: 0, maxX: 4, minY: 3, maxY: 12 },
      discovered: true,
      tags: ['harsh', 'trade_route'],
    },

    // Northern badlands
    {
      id: 'region_badlands',
      name: 'Devil\'s Backbone',
      description: 'Treacherous canyons and mesas, home to outlaws and worse.',
      biome: 'badlands',
      baseDanger: 'high',
      bounds: { minX: 8, maxX: 18, minY: 0, maxY: 4 },
      discovered: false,
      tags: ['dangerous', 'outlaw'],
    },

    // Eastern mountains
    {
      id: 'region_eastern_mountains',
      name: 'Iron Mountains',
      description: 'Mineral-rich peaks that draw prospectors despite the dangers.',
      biome: 'mountain',
      baseDanger: 'moderate',
      bounds: { minX: 15, maxX: 19, minY: 5, maxY: 14 },
      discovered: false,
      tags: ['mining', 'resources'],
    },

    // Southern scrubland
    {
      id: 'region_southern_scrub',
      name: 'Dry Creek Valley',
      description: 'Parched scrubland with scattered homesteads.',
      biome: 'scrubland',
      baseDanger: 'low',
      bounds: { minX: 5, maxX: 14, minY: 11, maxY: 14 },
      discovered: true,
      tags: ['frontier', 'farming'],
    },
  ],

  locations: [
    // ====== MAIN TOWN ======
    {
      id: 'loc_dusty_springs',
      type: 'town',
      name: 'Dusty Springs',
      coord: { wx: 10, wy: 7 },
      locationDataId: 'test_town',
      size: 'medium',
      discovered: true,
      accessible: true,
      tags: ['starting', 'hub', 'services'],
    },

    // ====== RANCHES ======
    {
      id: 'loc_sunset_ranch',
      type: 'ranch',
      name: 'Sunset Ranch',
      coord: { wx: 8, wy: 6 },
      locationDataId: 'sunset_ranch',
      size: 'large',
      discovered: true,
      accessible: true,
      tags: ['cattle', 'wealthy', 'employment'],
    },
    {
      id: 'loc_broken_wheel_farm',
      type: 'farm',
      name: 'Broken Wheel Farm',
      coord: { wx: 12, wy: 8 },
      seed: 11111,
      size: 'small',
      discovered: true,
      accessible: true,
      tags: ['farming', 'poor'],
    },

    // ====== MINING ======
    {
      id: 'loc_dusty_creek_mine',
      type: 'mine',
      name: 'Dusty Creek Mine',
      coord: { wx: 17, wy: 8 },
      locationDataId: 'copper_mine',
      size: 'medium',
      discovered: false,
      accessible: true,
      tags: ['copper', 'employment', 'resource'],
    },
    {
      id: 'loc_silver_vein',
      type: 'mine',
      name: 'Silver Vein Mine',
      coord: { wx: 18, wy: 6 },
      seed: 22222,
      size: 'small',
      discovered: false,
      accessible: true,
      tags: ['silver', 'valuable'],
    },

    // ====== WAYSTATIONS ======
    {
      id: 'loc_coyote_springs',
      type: 'waystation',
      name: 'Coyote Springs',
      coord: { wx: 3, wy: 7 },
      locationDataId: 'desert_waystation',
      size: 'small',
      discovered: true,
      accessible: true,
      tags: ['rest', 'water', 'trade'],
    },
    {
      id: 'loc_halfway_house',
      type: 'waystation',
      name: 'Halfway House',
      coord: { wx: 14, wy: 7 },
      seed: 33333,
      size: 'tiny',
      discovered: true,
      accessible: true,
      tags: ['rest', 'trade_route'],
    },

    // ====== DANGEROUS LOCATIONS ======
    {
      id: 'loc_rattlesnake_canyon',
      type: 'hideout',
      name: 'Rattlesnake Canyon',
      coord: { wx: 12, wy: 2 },
      locationDataId: 'rattlesnake_canyon',
      size: 'medium',
      discovered: false,
      accessible: true,
      tags: ['bandit', 'dangerous', 'loot'],
    },
    {
      id: 'loc_dead_mans_gulch',
      type: 'hideout',
      name: 'Dead Man\'s Gulch',
      coord: { wx: 15, wy: 1 },
      seed: 44444,
      size: 'small',
      discovered: false,
      accessible: true,
      tags: ['outlaw', 'dangerous'],
    },

    // ====== RUINS & LANDMARKS ======
    {
      id: 'loc_ghost_town',
      type: 'ruins',
      name: 'Prosperity (Abandoned)',
      coord: { wx: 6, wy: 12 },
      seed: 55555,
      size: 'medium',
      discovered: false,
      accessible: true,
      tags: ['abandoned', 'mystery', 'loot'],
    },
    {
      id: 'loc_signal_rock',
      type: 'landmark',
      name: 'Signal Rock',
      coord: { wx: 9, wy: 3 },
      seed: 66666,
      size: 'tiny',
      discovered: false,
      accessible: true,
      tags: ['landmark', 'navigation'],
    },

    // ====== WILDERNESS ======
    {
      id: 'loc_wilderness_1',
      type: 'wilderness',
      name: 'Open Desert',
      coord: { wx: 2, wy: 5 },
      seed: 77777,
      size: 'medium',
      discovered: true,
      accessible: true,
      tags: ['travel', 'random_encounter'],
    },
    {
      id: 'loc_wilderness_2',
      type: 'wilderness',
      name: 'Rocky Foothills',
      coord: { wx: 16, wy: 10 },
      seed: 88888,
      size: 'medium',
      discovered: false,
      accessible: true,
      tags: ['travel', 'wildlife'],
    },

    // ====== TRAIN STATION ======
    {
      id: 'loc_junction_city',
      type: 'train_station',
      name: 'Junction City',
      coord: { wx: 7, wy: 9 },
      seed: 99999,
      size: 'small',
      discovered: true,
      accessible: true,
      tags: ['railroad', 'fast_travel', 'commerce'],
    },
  ],

  connections: [
    // ====== MAIN ROADS FROM DUSTY SPRINGS ======
    {
      from: 'loc_dusty_springs',
      to: 'loc_sunset_ranch',
      method: 'road',
      travelTime: 2,
      danger: 'safe',
      bidirectional: true,
      tags: ['main_road'],
    },
    {
      from: 'loc_dusty_springs',
      to: 'loc_broken_wheel_farm',
      method: 'road',
      travelTime: 3,
      danger: 'low',
      bidirectional: true,
      tags: ['farm_road'],
    },
    {
      from: 'loc_dusty_springs',
      to: 'loc_junction_city',
      method: 'road',
      travelTime: 2,
      danger: 'safe',
      bidirectional: true,
      tags: ['main_road', 'railroad'],
    },
    {
      from: 'loc_dusty_springs',
      to: 'loc_halfway_house',
      method: 'road',
      travelTime: 4,
      danger: 'low',
      bidirectional: true,
      tags: ['trade_road'],
    },

    // ====== DESERT ROUTES ======
    {
      from: 'loc_dusty_springs',
      to: 'loc_coyote_springs',
      method: 'trail',
      travelTime: 8,
      danger: 'moderate',
      bidirectional: true,
      tags: ['desert_crossing'],
    },
    {
      from: 'loc_coyote_springs',
      to: 'loc_wilderness_1',
      method: 'trail',
      travelTime: 4,
      danger: 'moderate',
      bidirectional: true,
      tags: ['desert'],
    },

    // ====== MINING ROUTES ======
    {
      from: 'loc_halfway_house',
      to: 'loc_dusty_creek_mine',
      method: 'trail',
      travelTime: 5,
      danger: 'moderate',
      bidirectional: true,
      tags: ['mining_road'],
    },
    {
      from: 'loc_dusty_creek_mine',
      to: 'loc_silver_vein',
      method: 'trail',
      travelTime: 3,
      danger: 'moderate',
      bidirectional: true,
      tags: ['mountain_trail'],
    },
    {
      from: 'loc_halfway_house',
      to: 'loc_wilderness_2',
      method: 'trail',
      travelTime: 4,
      danger: 'low',
      bidirectional: true,
      tags: ['foothills'],
    },

    // ====== DANGEROUS ROUTES (BADLANDS) ======
    {
      from: 'loc_signal_rock',
      to: 'loc_rattlesnake_canyon',
      method: 'wilderness',
      travelTime: 6,
      danger: 'high',
      bidirectional: true,
      tags: ['outlaw_territory'],
    },
    {
      from: 'loc_rattlesnake_canyon',
      to: 'loc_dead_mans_gulch',
      method: 'wilderness',
      travelTime: 4,
      danger: 'extreme',
      bidirectional: true,
      tags: ['outlaw_territory'],
    },
    {
      from: 'loc_dusty_springs',
      to: 'loc_signal_rock',
      method: 'trail',
      travelTime: 6,
      danger: 'moderate',
      bidirectional: true,
      tags: ['northern_trail'],
    },

    // ====== SOUTHERN ROUTES ======
    {
      from: 'loc_junction_city',
      to: 'loc_ghost_town',
      method: 'trail',
      travelTime: 5,
      danger: 'low',
      bidirectional: true,
      tags: ['old_road'],
    },

    // ====== RAILROAD ======
    {
      from: 'loc_junction_city',
      to: 'loc_coyote_springs',
      method: 'railroad',
      travelTime: 2,
      danger: 'safe',
      bidirectional: true,
      tags: ['rail_line', 'fast'],
    },
  ],

  startingLocationId: 'loc_dusty_springs',

  createdAt: Date.now(),
  version: 1,
});

export default FrontierTerritory;
