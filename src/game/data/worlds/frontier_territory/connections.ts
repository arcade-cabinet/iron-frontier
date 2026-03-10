/**
 * Frontier Territory - Connection Definitions
 *
 * Routes between all 16 locations, organized by type:
 *   - Railroad routes (fast travel)
 *   - Main roads from Dusty Springs hub
 *   - Secondary roads
 *   - Trails to secondary locations
 *   - Wilderness routes to dangerous locations
 */

import type { World } from '../../schemas/world';

type Connection = World['connections'][number];

export const frontierConnections: Connection[] = [
  // ========== RAILROAD ROUTES ==========
  // Thornwood Station <-> Dusty Springs <-> Junction City <-> Coppertown

  {
    from: 'thornwood_station',
    to: 'dusty_springs',
    method: 'railroad',
    travelTime: 1,
    danger: 'safe',
    bidirectional: true,
    passable: true,
    tags: ['main_line', 'fast_travel'],
  },
  {
    from: 'dusty_springs',
    to: 'junction_city',
    method: 'road',
    travelTime: 15,
    danger: 'low',
    bidirectional: true,
    passable: true,
    tags: ['dusty_trail', 'route_1', 'main_route'],
  },
  {
    from: 'junction_city',
    to: 'coppertown',
    method: 'railroad',
    travelTime: 2,
    danger: 'low',
    bidirectional: true,
    passable: true,
    tags: ['mountain_line', 'fast_travel'],
  },

  // ========== MAIN ROADS FROM DUSTY SPRINGS ==========

  // Iron Gulch -> Coldwater (Mountain Road)
  {
    from: 'junction_city',
    to: 'sunset_ranch',
    method: 'road',
    travelTime: 25,
    danger: 'moderate',
    bidirectional: true,
    passable: true,
    tags: ['mountain_road', 'route_3', 'main_route'],
  },

  // Iron Gulch -> Mesa Point (Desert Pass)
  {
    from: 'junction_city',
    to: 'rattlesnake_canyon',
    method: 'trail',
    travelTime: 20,
    danger: 'high',
    bidirectional: true,
    passable: true,
    tags: ['desert_pass', 'route_2', 'main_route'],
  },

  // Mesa Point -> Coldwater (Badlands Trail)
  {
    from: 'rattlesnake_canyon',
    to: 'sunset_ranch',
    method: 'trail',
    travelTime: 20,
    danger: 'high',
    bidirectional: true,
    passable: true,
    tags: ['badlands_trail', 'route_4', 'main_route'],
  },

  // Final Trail (to Salvation)
  {
    from: 'rattlesnake_canyon',
    to: 'old_works',
    method: 'wilderness',
    travelTime: 30,
    danger: 'extreme',
    bidirectional: true,
    passable: true,
    tags: ['final_trail', 'route_5', 'main_route'],
  },
  {
    from: 'sunset_ranch',
    to: 'old_works',
    method: 'wilderness',
    travelTime: 30,
    danger: 'high',
    bidirectional: true,
    passable: true,
    tags: ['final_trail', 'route_5', 'main_route'],
  },

  // Dusty Springs -> Coyote Springs (main road west)
  {
    from: 'dusty_springs',
    to: 'coyote_springs',
    method: 'road',
    travelTime: 6,
    danger: 'moderate',
    bidirectional: true,
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
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
    passable: true,
    tags: ['desert_crossing', 'hidden_route'],
  },
];
