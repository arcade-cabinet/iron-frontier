/**
 * Frontier Territory - Iron Frontier World Definition
 *
 * A steampunk western world set in an alternate 1887 America where steam
 * technology advanced faster than our timeline. The Iron Valley Railroad
 * Company controls everything, but their grip weakens in the badlands.
 *
 * Geographic Layout:
 *   NORTH = High Danger (Devil's Backbone badlands, Iron Mountains)
 *   SOUTH = Entry Point (Dry Creek Valley frontier)
 *   WEST = Harsh Crossing (Western Desert)
 *   EAST/CENTER = Civilized (Central Plains)
 */

import { World, validateWorld } from '../schemas/world';

export const FrontierTerritory: World = validateWorld({
  id: 'frontier_territory',
  name: 'The Frontier Territory',
  description:
    'The bleeding edge of civilization where the great railroad companies push ever westward, and fortune-seekers follow in their wake. The year is 1887.',

  seed: 18870101,

  dimensions: {
    width: 20,
    height: 16,
  },

  // ============================================================================
  // REGIONS (5)
  // ============================================================================
  regions: [
    // 1. CENTRAL PLAINS - Civilized grassland (center-east)
    {
      id: 'region_central_plains',
      name: 'Central Plains',
      description:
        "The railroad's domain. Fertile grassland dotted with ranches and the territory's only real towns. Order and corruption walk hand in hand under IVRC's watchful eye.",
      biome: 'grassland',
      baseDanger: 'low',
      bounds: { minX: 8, maxX: 16, minY: 6, maxY: 12 },
      discovered: true,
      tags: ['civilized', 'ranching', 'railroad', 'ivrc_territory'],
    },

    // 2. WESTERN DESERT - Harsh crossing (west)
    {
      id: 'region_western_desert',
      name: 'Western Desert',
      description:
        'Brutal scrubland between civilization and nowhere. The old stagecoach route before the railroad. Many have tried the crossing. Not all made it.',
      biome: 'desert',
      baseDanger: 'moderate',
      bounds: { minX: 0, maxX: 7, minY: 4, maxY: 12 },
      discovered: true,
      tags: ['harsh', 'old_route', 'survival'],
    },

    // 3. DRY CREEK VALLEY - Frontier edge (south)
    {
      id: 'region_dry_creek',
      name: 'Dry Creek Valley',
      description:
        'Southern scrubland with scattered homesteads. The newest settlements, still hopeful. Dreams and desperation in equal measure.',
      biome: 'scrubland',
      baseDanger: 'low',
      bounds: { minX: 4, maxX: 16, minY: 13, maxY: 15 },
      discovered: true,
      tags: ['frontier', 'farming', 'new_settlements'],
    },

    // 4. DEVIL'S BACKBONE - Outlaw badlands (north-center)
    {
      id: 'region_devils_backbone',
      name: "Devil's Backbone",
      description:
        "Treacherous canyons and mesas where the law doesn't reach. Copperhead Gang territory. The red rock knows how to keep secrets.",
      biome: 'badlands',
      baseDanger: 'high',
      bounds: { minX: 4, maxX: 12, minY: 0, maxY: 5 },
      discovered: false,
      tags: ['dangerous', 'outlaw', 'copperhead_territory'],
    },

    // 5. IRON MOUNTAINS - Mining territory (northeast)
    {
      id: 'region_iron_mountains',
      name: 'Iron Mountains',
      description:
        "Mineral-rich peaks that everyone wants to control. IVRC's mining operations clash with the Freeminers Coalition. Copper dust in the air, blood in the soil.",
      biome: 'mountain',
      baseDanger: 'moderate',
      bounds: { minX: 13, maxX: 19, minY: 0, maxY: 5 },
      discovered: false,
      tags: ['mining', 'resources', 'contested', 'freeminer_territory'],
    },
  ],

  // ============================================================================
  // LOCATIONS (16)
  // ============================================================================
  locations: [
    // ========== TIER 1 - CORE LOCATIONS (7) ==========

    // DUSTY SPRINGS - Starting town, Central Plains, Lvl 1
    {
      id: 'dusty_springs',
      type: 'town',
      name: 'Dusty Springs',
      coord: { wx: 11, wy: 9 },
      locationDataId: 'dusty_springs',
      size: 'medium',
      discovered: true,
      accessible: true,
      tags: ['starting', 'hub', 'services', 'railroad', 'level_1'],
    },

    // SUNSET RANCH - Ranch, Central Plains, Lvl 1-2
    {
      id: 'sunset_ranch',
      type: 'ranch',
      name: 'Sunset Ranch',
      coord: { wx: 9, wy: 8 },
      locationDataId: 'sunset_ranch',
      size: 'large',
      discovered: true,
      accessible: true,
      tags: ['cattle', 'wealthy', 'blackwood', 'level_1', 'level_2'],
    },

    // JUNCTION CITY - Town, Central Plains, Lvl 2
    {
      id: 'junction_city',
      type: 'town',
      name: 'Junction City',
      coord: { wx: 14, wy: 10 },
      locationDataId: 'junction_city',
      size: 'medium',
      discovered: true,
      accessible: true,
      tags: ['railroad_hub', 'ivrc_hq', 'commerce', 'level_2'],
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

    // RATTLESNAKE CANYON - Hideout, Devil's Backbone, Lvl 3-4
    {
      id: 'rattlesnake_canyon',
      type: 'hideout',
      name: 'Rattlesnake Canyon',
      coord: { wx: 8, wy: 2 },
      locationDataId: 'rattlesnake_canyon',
      size: 'medium',
      discovered: false,
      accessible: true,
      tags: ['copperhead_base', 'dangerous', 'diamondback', 'level_3', 'level_4'],
    },

    // OLD WORKS - Dungeon, Iron Mountains, Lvl 4-5
    {
      id: 'old_works',
      type: 'ruins',
      name: 'The Old Works',
      coord: { wx: 18, wy: 1 },
      locationDataId: 'old_works',
      size: 'large',
      discovered: false,
      accessible: true,
      tags: ['automaton_factory', 'civil_war', 'final_dungeon', 'the_remnant', 'level_4', 'level_5'],
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

    // PROSPECT - Town, Dry Creek, Lvl 1-2
    {
      id: 'prospect',
      type: 'town',
      name: 'Prospect',
      coord: { wx: 12, wy: 14 },
      locationDataId: 'prospect',
      size: 'small',
      discovered: true,
      accessible: true,
      tags: ['farming', 'failed_mining', 'hopeful', 'level_1', 'level_2'],
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
  ],

  // ============================================================================
  // CONNECTIONS
  // ============================================================================
  connections: [
    // ========== RAILROAD ROUTES ==========
    // Thornwood Station <-> Dusty Springs <-> Junction City <-> Coppertown

    {
      from: 'thornwood_station',
      to: 'dusty_springs',
      method: 'railroad',
      travelTime: 1,
      danger: 'safe',
      bidirectional: true,
      tags: ['main_line', 'fast_travel'],
    },
    {
      from: 'dusty_springs',
      to: 'junction_city',
      method: 'railroad',
      travelTime: 1,
      danger: 'safe',
      bidirectional: true,
      tags: ['main_line', 'fast_travel'],
    },
    {
      from: 'junction_city',
      to: 'coppertown',
      method: 'railroad',
      travelTime: 2,
      danger: 'low',
      bidirectional: true,
      tags: ['mountain_line', 'fast_travel'],
    },

    // ========== MAIN ROADS FROM DUSTY SPRINGS ==========

    // Dusty Springs -> Sunset Ranch (main road)
    {
      from: 'dusty_springs',
      to: 'sunset_ranch',
      method: 'road',
      travelTime: 2,
      danger: 'safe',
      bidirectional: true,
      tags: ['main_road', 'patrolled'],
    },

    // Dusty Springs -> Coyote Springs (main road west)
    {
      from: 'dusty_springs',
      to: 'coyote_springs',
      method: 'road',
      travelTime: 6,
      danger: 'moderate',
      bidirectional: true,
      tags: ['desert_road', 'old_route'],
    },

    // Dusty Springs -> Broken Wheel Farm
    {
      from: 'dusty_springs',
      to: 'broken_wheel',
      method: 'road',
      travelTime: 2,
      danger: 'safe',
      bidirectional: true,
      tags: ['farm_road'],
    },

    // Dusty Springs -> Prospect
    {
      from: 'dusty_springs',
      to: 'prospect',
      method: 'road',
      travelTime: 3,
      danger: 'low',
      bidirectional: true,
      tags: ['southern_road'],
    },

    // ========== SECONDARY ROADS ==========

    // Junction City -> Broken Wheel Farm
    {
      from: 'junction_city',
      to: 'broken_wheel',
      method: 'road',
      travelTime: 2,
      danger: 'safe',
      bidirectional: true,
      tags: ['farm_road'],
    },

    // Thornwood Station -> Prospect
    {
      from: 'thornwood_station',
      to: 'prospect',
      method: 'road',
      travelTime: 3,
      danger: 'low',
      bidirectional: true,
      tags: ['frontier_road'],
    },

    // ========== TRAILS TO SECONDARY LOCATIONS ==========

    // Coyote Springs -> Bleached Bones
    {
      from: 'coyote_springs',
      to: 'bleached_bones',
      method: 'trail',
      travelTime: 4,
      danger: 'moderate',
      bidirectional: true,
      tags: ['desert_trail', 'old_route'],
    },

    // Bleached Bones -> The Furnace
    {
      from: 'bleached_bones',
      to: 'the_furnace',
      method: 'trail',
      travelTime: 3,
      danger: 'moderate',
      bidirectional: true,
      tags: ['desert_trail'],
    },

    // Dusty Springs -> Signal Rock (northern trail)
    {
      from: 'dusty_springs',
      to: 'signal_rock',
      method: 'trail',
      travelTime: 5,
      danger: 'moderate',
      bidirectional: true,
      tags: ['northern_trail', 'badlands_approach'],
    },

    // Coppertown -> Freeminer Hollow
    {
      from: 'coppertown',
      to: 'freeminer_hollow',
      method: 'trail',
      travelTime: 3,
      danger: 'moderate',
      bidirectional: true,
      tags: ['mountain_trail', 'contested'],
    },

    // Coppertown -> Silver Vein Mine
    {
      from: 'coppertown',
      to: 'silver_vein',
      method: 'trail',
      travelTime: 2,
      danger: 'moderate',
      bidirectional: true,
      tags: ['mining_trail'],
    },

    // Freeminer Hollow -> Silver Vein Mine
    {
      from: 'freeminer_hollow',
      to: 'silver_vein',
      method: 'trail',
      travelTime: 2,
      danger: 'moderate',
      bidirectional: true,
      tags: ['mountain_trail'],
    },

    // ========== WILDERNESS ROUTES TO DANGEROUS LOCATIONS ==========

    // Signal Rock -> Rattlesnake Canyon
    {
      from: 'signal_rock',
      to: 'rattlesnake_canyon',
      method: 'wilderness',
      travelTime: 4,
      danger: 'high',
      bidirectional: true,
      tags: ['outlaw_territory', 'hidden_path'],
    },

    // Rattlesnake Canyon -> Dead Man's Gulch
    {
      from: 'rattlesnake_canyon',
      to: 'dead_mans_gulch',
      method: 'wilderness',
      travelTime: 3,
      danger: 'extreme',
      bidirectional: true,
      tags: ['outlaw_territory', 'ambush_risk'],
    },

    // Freeminer Hollow -> Old Works
    {
      from: 'freeminer_hollow',
      to: 'old_works',
      method: 'wilderness',
      travelTime: 5,
      danger: 'high',
      bidirectional: true,
      tags: ['mountain_wilderness', 'hidden_entrance'],
    },

    // Dead Man's Gulch -> Freeminer Hollow (cross-region wilderness)
    {
      from: 'dead_mans_gulch',
      to: 'freeminer_hollow',
      method: 'wilderness',
      travelTime: 6,
      danger: 'high',
      bidirectional: true,
      tags: ['mountain_pass', 'dangerous_crossing'],
    },

    // The Furnace -> Signal Rock (desert to badlands connection)
    {
      from: 'the_furnace',
      to: 'signal_rock',
      method: 'wilderness',
      travelTime: 5,
      danger: 'high',
      bidirectional: true,
      tags: ['desert_crossing', 'hidden_route'],
    },
  ],

  // ============================================================================
  // STARTING LOCATION
  // ============================================================================
  startingLocationId: 'dusty_springs',

  createdAt: Date.now(),
  version: 2,
});

export default FrontierTerritory;
