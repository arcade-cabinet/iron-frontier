/**
 * Thornwood Station - Southernmost Railroad Stop
 *
 * A small waystation where the Iron Valley Railroad ends its southern push.
 * For now. The tracks stop here at a modest wooden platform, but IVRC has
 * plans. This is where the frontier truly begins - or ends, depending on
 * which way you're traveling.
 *
 * Theme: Gateway, transition, travelers
 * Level: 1 (Dry Creek Valley - Entry Point)
 */

import { Location, validateLocation } from '../schemas/spatial';

export const ThornwoodStation: Location = validateLocation({
  id: 'thornwood_station',
  name: 'Thornwood Station',
  type: 'outpost',
  size: 'tiny',
  description: 'The southernmost stop on the Iron Valley Railroad',
  lore: 'The last spike was driven here three months ago. They say the railroad will push further south come spring, but for now, Thornwood Station marks the end of the line. Step off that train and you\'re in frontier country.',

  seed: 82341,
  width: 25,
  height: 20,
  baseTerrain: 'dirt',

  // =========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // =========================================================================
  assemblages: [
    // Train Station - Main building with platform
    {
      assemblageId: 'asm_train_station_01',
      instanceId: 'station',
      anchor: { q: 12, r: 8 },
      rotation: 0,
      tags: ['railroad', 'ivrc', 'central'],
      importance: 5,
    },

    // Station Master's House - Small residence
    {
      assemblageId: 'asm_house_01',
      instanceId: 'station_master_house',
      anchor: { q: 8, r: 6 },
      rotation: 0,
      tags: ['residential', 'staff'],
      importance: 3,
    },

    // Waystation Inn - Traveler lodging
    {
      assemblageId: 'asm_waystation_01',
      instanceId: 'waystation_inn',
      anchor: { q: 16, r: 12 },
      rotation: 0,
      slotTypeOverride: 'hotel',
      tags: ['lodging', 'travelers', 'commerce'],
      importance: 4,
    },

    // Stable - Horse care for travelers
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'stable',
      anchor: { q: 6, r: 12 },
      rotation: 0,
      tags: ['mounts', 'travelers'],
      importance: 3,
    },

    // Telegraph Post - Communication
    {
      assemblageId: 'asm_telegraph_01',
      instanceId: 'telegraph',
      anchor: { q: 18, r: 6 },
      rotation: 0,
      tags: ['communication', 'ivrc'],
      importance: 4,
    },

    // Small Store - Travel supplies (using general store)
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'travel_store',
      anchor: { q: 20, r: 12 },
      rotation: 5,
      tags: ['commerce', 'supplies', 'travelers'],
      importance: 3,
    },
  ],

  // Inline slot for water tower (railroad infrastructure)
  slots: [
    {
      id: 'water_tower',
      type: 'landmark',
      name: 'Railroad Water Tower',
      anchor: { q: 10, r: 10 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'water_tower', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'spawn_point', name: 'maintenance_worker', offset: { q: 1, r: 0 }, tags: ['npc', 'worker', 'railroad'] },
      ],
      zones: [
        { type: 'public_area', name: 'tower_area', tiles: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }], tags: ['railroad'] },
      ],
      tags: ['railroad', 'infrastructure', 'ivrc'],
      importance: 4,
    },
  ],

  // =========================================================================
  // BASE TILES - Railroad tracks and roads
  // =========================================================================
  baseTiles: [
    // Railroad tracks running east-west through the station
    { coord: { q: 2, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 3, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 4, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 5, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 6, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 7, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 8, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 9, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 10, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 11, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    // Platform area handled by station assemblage
    { coord: { q: 15, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 16, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 17, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 18, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 19, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 20, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 21, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 22, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 23, r: 9 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },

    // Main road running parallel to tracks (south of station)
    { coord: { q: 4, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 8, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 12, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 14, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 21, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 22, r: 14 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Path from road to station platform
    { coord: { q: 12, r: 11 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 12, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 12, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // Sparse vegetation - transitional terrain
    { coord: { q: 3, r: 4 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 21, r: 4 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 4, r: 17 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 22, r: 17 }, terrain: 'grass', feature: 'tree_dead' },
    { coord: { q: 2, r: 12 }, terrain: 'grass', feature: 'rock_small' },
    { coord: { q: 23, r: 6 }, terrain: 'dirt', feature: 'cactus' },
    { coord: { q: 2, r: 6 }, terrain: 'dirt', feature: 'rock_large' },

    // Cargo and equipment near tracks
    { coord: { q: 9, r: 8 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 15, r: 8 }, terrain: 'dirt', feature: 'rock_small' },
  ],

  // =========================================================================
  // ENTRY POINTS
  // =========================================================================
  entryPoints: [
    {
      id: 'train_arrival',
      coord: { q: 13, r: 9 },
      direction: 'north',
      connectionType: 'railroad',
      tags: ['main', 'default', 'railroad'],
    },
    {
      id: 'west_road',
      coord: { q: 2, r: 14 },
      direction: 'west',
      connectionType: 'road',
      tags: ['prospect_direction'],
    },
    {
      id: 'south_trail',
      coord: { q: 12, r: 18 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['frontier', 'wilderness'],
    },
  ],

  // Player spawns at platform - just stepped off the train
  playerSpawn: {
    coord: { q: 13, r: 10 },
    facing: 2, // Facing south toward the town
  },

  atmosphere: {
    dangerLevel: 1, // Safe railroad stop
    wealthLevel: 4, // Railroad money flows through
    populationDensity: 'sparse', // ~20 permanent, plus transients
    lawLevel: 'frontier', // IVRC keeps order here
  },

  tags: ['dry_creek_valley', 'railroad', 'ivrc', 'gateway', 'travelers', 'level_1', 'entry_point'],
});

export default ThornwoodStation;
