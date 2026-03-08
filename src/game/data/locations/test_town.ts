/**
 * Test Town - Compact frontier town for testing the spatial system
 *
 * A small desert settlement along a dirt road. Buildings line the main
 * street with the saloon at center, sheriff to the west, general store
 * to the east. A well sits in the town square just north of main street.
 * The church is tucked away on the south side, and a livery stable
 * anchors the western approach.
 *
 * Layout (looking north):
 *   [cabin_north]           [house_east]
 *         [well]
 *   [livery] [sheriff] [saloon] [general_store]
 *            [church]           [cabin_south]
 */

import { type Location, validateLocation } from '../schemas/spatial';

export const TestTown: Location = validateLocation({
  id: 'test_town',
  name: 'Dusty Springs',
  type: 'town',
  size: 'small',
  description: 'A small frontier town where the dirt road widens into a main street lined with sun-bleached buildings',

  seed: 12345,
  width: 24,
  height: 24,
  baseTerrain: 'sand',

  // =========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // Buildings placed in world-space along a main street running east-west.
  // Main street centerline at z=44m. Buildings face the street (doors
  // toward the road). Minimum 4m gaps between structures for alleys.
  // =========================================================================
  assemblages: [
    // Central saloon - the heart of any frontier town
    // 10m wide x 8m deep, front door faces south toward main street
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'saloon_main',
      anchor: { q: 12, r: 10 },
      rotation: 0,
      tags: ['central', 'social_hub'],
      importance: 5,
    },

    // Sheriff office - west of saloon across a 4m alley
    // 8m wide x 6m deep, front door faces south toward main street
    {
      assemblageId: 'asm_sheriff_01',
      instanceId: 'sheriff_office',
      anchor: { q: 8, r: 10 },
      rotation: 0,
      tags: ['law'],
      importance: 5,
    },

    // General store - east of saloon across a 4m alley
    // 8m wide x 7m deep, front door faces south toward main street
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'general_store',
      anchor: { q: 16, r: 10 },
      rotation: 0,
      tags: ['commerce'],
      importance: 4,
    },

    // Town well - in the open square north of main street
    // Visible from the saloon porch, a natural gathering spot
    {
      assemblageId: 'asm_well_01',
      instanceId: 'town_well',
      anchor: { q: 12, r: 7 },
      rotation: 0,
      tags: ['center'],
    },

    // Church on the south side of town, set back from the street
    // Faces north toward the main road
    {
      assemblageId: 'asm_church_01',
      instanceId: 'church',
      anchor: { q: 6, r: 14 },
      rotation: 2,
      tags: ['religious'],
    },

    // Residential - scattered cabins around the town edges
    // Cabin north: up the slope behind the well
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_north',
      anchor: { q: 8, r: 5 },
      rotation: 1,
    },
    // Cabin south: southeast of the general store
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_south',
      anchor: { q: 16, r: 16 },
      rotation: 4,
    },
    // House east: northeast corner, near the water tower
    {
      assemblageId: 'asm_house_01',
      instanceId: 'house_east',
      anchor: { q: 18, r: 6 },
      rotation: 3,
    },

    // Livery stable at the western edge of town
    // First building travelers see when arriving from the west road
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'livery',
      anchor: { q: 4, r: 10 },
      rotation: 0,
      tags: ['mounts', 'edge'],
    },
  ],

  slots: [],

  // =========================================================================
  // BASE TILES - Roads and terrain features
  // Main street runs east-west at r=11, roughly 7m wide packed dirt
  // =========================================================================
  baseTiles: [
    // Main street - east-west through town center
    { coord: { q: 4, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 14, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 20, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Entry road from west (approaching from the desert)
    { coord: { q: 2, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 3, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Entry road from east
    { coord: { q: 21, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 22, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Side path north to the well and town square
    { coord: { q: 12, r: 8 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 12, r: 9 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // Desert environment props
    { coord: { q: 3, r: 4 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 20, r: 5 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 4, r: 18 }, terrain: 'sand', feature: 'rock_large' },
    { coord: { q: 19, r: 17 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 2, r: 2 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 21, r: 19 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 10, r: 3 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 15, r: 19 }, terrain: 'sand', feature: 'cactus' },
  ],

  // =========================================================================
  // ENTRY POINTS - Where players arrive from the world map
  // Each entry has a facing direction so the player looks INTO the town
  // =========================================================================
  entryPoints: [
    {
      id: 'west_road',
      coord: { q: 2, r: 11 },
      direction: 'west',
      connectionType: 'road',
      tags: ['main', 'default'],
    },
    {
      id: 'east_road',
      coord: { q: 22, r: 11 },
      direction: 'east',
      connectionType: 'road',
      tags: [],
    },
  ],

  // =========================================================================
  // PLAYER SPAWN
  // Just inside the west entrance, facing east down main street.
  // The saloon sign is visible ahead, with the sheriff office on the left
  // and the livery stable just behind.
  // =========================================================================
  playerSpawn: {
    coord: { q: 3, r: 11 },
    facing: 0, // Facing east toward the saloon and town center
  },

  // =========================================================================
  // NPC MARKERS - Where NPCs stand, work, and patrol
  // =========================================================================
  npcMarkers: [
    // Bartender behind the saloon bar
    {
      role: 'bartender',
      position: { x: 48, y: 0, z: 38 },
      facing: 180, // Facing south toward customers
      activity: 'working',
      assignedTo: 'saloon_main',
      tags: ['service', 'social', 'rumors'],
    },
    // Sheriff standing on the office porch, watching the street
    {
      role: 'sheriff',
      position: { x: 32, y: 0, z: 42 },
      facing: 180, // Facing south toward main street
      activity: 'guarding',
      assignedTo: 'sheriff_office',
      tags: ['law', 'quest_giver'],
    },
    // Shopkeeper behind the general store counter
    {
      role: 'shopkeeper',
      position: { x: 64, y: 0, z: 38 },
      facing: 180, // Facing south toward customers
      activity: 'working',
      assignedTo: 'general_store',
      tags: ['commerce', 'trade'],
    },
    // Stable hand patrolling around the livery
    {
      role: 'stable_hand',
      position: { x: 16, y: 0, z: 40 },
      facing: 90, // Facing east
      activity: 'patrolling',
      assignedTo: 'livery',
      waypoints: [
        { x: 16, y: 0, z: 40 },
        { x: 20, y: 0, z: 44 },
        { x: 16, y: 0, z: 48 },
        { x: 12, y: 0, z: 44 },
      ],
      tags: ['mounts', 'service'],
    },
    // Priest near the church entrance
    {
      role: 'priest',
      position: { x: 24, y: 0, z: 56 },
      facing: 0, // Facing north toward the street
      activity: 'standing',
      assignedTo: 'church',
      tags: ['religious', 'healing'],
    },
  ],

  // =========================================================================
  // ROADS - Defined with proper widths for 3D navigation
  // =========================================================================
  roads: [
    {
      id: 'main_street',
      type: 'main_street',
      width: 7,
      surface: 'packed_earth',
      points: [
        { x: 0, y: 0, z: 44 },
        { x: 48, y: 0, z: 44 },
        { x: 96, y: 0, z: 44 },
      ],
      tags: ['primary', 'east_west'],
    },
    {
      id: 'well_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 48, y: 0, z: 44 },
        { x: 48, y: 0, z: 28 },
      ],
      tags: ['secondary', 'to_well'],
    },
  ],

  // =========================================================================
  // ATMOSPHERE - Sound, lighting, and weather for this environment
  // =========================================================================
  atmosphere: {
    dangerLevel: 1,
    wealthLevel: 4,
    populationDensity: 'sparse',
    lawLevel: 'frontier',

    sound: {
      base: 'desert_wind',
      accents: ['horse_whinny', 'piano_distant', 'dog_bark'],
    },

    lighting: {
      lanternPositions: [
        { x: 48, y: 3, z: 40 },   // Saloon porch lantern
        { x: 32, y: 3, z: 42 },   // Sheriff office porch lantern
        { x: 64, y: 3, z: 40 },   // General store porch lantern
        { x: 48, y: 2, z: 28 },   // Well area lantern post
      ],
      litWindows: ['saloon_main', 'sheriff_office'],
      campfires: [],
      peakActivity: 'afternoon',
    },

    weather: {
      dominant: 'clear',
      variability: 'mild',
      particleEffect: 'dust_light',
    },
  },

  tags: ['test', 'western', 'starter'],
});

export default TestTown;
