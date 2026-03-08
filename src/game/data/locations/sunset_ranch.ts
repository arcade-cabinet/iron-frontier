/**
 * Sunset Ranch - Large cattle operation
 *
 * A prosperous cattle ranch with main house, bunkhouse, and extensive pastures.
 */

import { type Location, validateLocation } from '../schemas/spatial';

export const SunsetRanch: Location = validateLocation({
  id: 'sunset_ranch',
  name: 'Sunset Ranch',
  type: 'ranch',
  size: 'large',
  description: 'One of the largest cattle operations in the territory',

  seed: 88888,
  width: 24,
  height: 20,
  baseTerrain: 'grass',

  assemblages: [
    // Main ranch house
    {
      assemblageId: 'asm_ranch_01',
      instanceId: 'main_ranch',
      anchor: { q: 10, r: 6 },
      rotation: 0,
      tags: ['primary', 'wealthy'],
      importance: 5,
    },

    // Additional worker cabin
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_2',
      anchor: { q: 5, r: 8 },
      rotation: 1,
      tags: ['workers'],
    },

    // Well for water
    {
      assemblageId: 'asm_well_01',
      instanceId: 'ranch_well',
      anchor: { q: 8, r: 10 },
      rotation: 0,
      tags: ['water', 'central'],
    },

    // Additional stable for horses
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'horse_stable',
      anchor: { q: 16, r: 8 },
      rotation: 2,
      tags: ['horses'],
    },
  ],

  slots: [],

  baseTiles: [
    // Main ranch road
    {
      coord: { q: 10, r: 16 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 15 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 14 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 13 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 12 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 11 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'road', 'none', 'none', 'none', 'road'],
    },

    // Branch to bunkhouse
    {
      coord: { q: 9, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 8, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 7, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 6, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Branch to horse stable
    {
      coord: { q: 11, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 12, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 13, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 14, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 15, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Pasture fencing (represented by grass tiles)
    // West pasture
    { coord: { q: 2, r: 4 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 3, r: 4 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 4, r: 4 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 2, r: 5 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 3, r: 5 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 4, r: 5 }, terrain: 'grass', feature: 'none' },

    // East pasture
    { coord: { q: 18, r: 4 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 19, r: 4 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 20, r: 4 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 18, r: 5 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 19, r: 5 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 20, r: 5 }, terrain: 'grass', feature: 'none' },

    // Decorative trees along boundary
    { coord: { q: 1, r: 3 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 21, r: 3 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 1, r: 14 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 21, r: 14 }, terrain: 'grass', feature: 'tree' },

    // Bushes
    { coord: { q: 3, r: 12 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 18, r: 12 }, terrain: 'grass', feature: 'bush' },
  ],

  entryPoints: [
    {
      id: 'main_gate',
      coord: { q: 10, r: 17 },
      direction: 'south',
      connectionType: 'road',
      tags: ['main', 'default'],
    },
  ],

  playerSpawn: {
    coord: { q: 10, r: 14 },
    facing: 5, // Facing toward ranch buildings
  },

  npcMarkers: [
    // Ranch owner on the main house porch
    {
      role: 'ranch_owner',
      position: { x: 40, y: 0, z: 24 },
      facing: 180,
      activity: 'standing',
      assignedTo: 'main_ranch',
      tags: ['wealthy', 'quest_giver'],
    },
    // Ranch hand patrolling between buildings
    {
      role: 'ranch_hand',
      position: { x: 24, y: 0, z: 40 },
      facing: 90,
      activity: 'patrolling',
      assignedTo: 'bunkhouse_2',
      waypoints: [
        { x: 20, y: 0, z: 32 },
        { x: 40, y: 0, z: 32 },
        { x: 64, y: 0, z: 32 },
        { x: 40, y: 0, z: 44 },
      ],
      tags: ['worker', 'cattle'],
    },
    // Stable hand at the horse stable
    {
      role: 'stable_hand',
      position: { x: 64, y: 0, z: 32 },
      facing: 270,
      activity: 'working',
      assignedTo: 'horse_stable',
      tags: ['mounts', 'service'],
    },
  ],

  roads: [
    {
      id: 'ranch_road',
      type: 'main_street',
      width: 5,
      surface: 'dirt',
      points: [
        { x: 40, y: 0, z: 68 },
        { x: 40, y: 0, z: 40 },
      ],
      tags: ['primary', 'south_entry'],
    },
    {
      id: 'bunkhouse_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 24, y: 0, z: 40 },
        { x: 40, y: 0, z: 40 },
        { x: 60, y: 0, z: 40 },
      ],
      tags: ['east_west', 'to_stable'],
    },
  ],

  atmosphere: {
    dangerLevel: 1,
    wealthLevel: 5,
    populationDensity: 'normal',
    lawLevel: 'orderly',

    sound: {
      base: 'prairie_breeze',
      accents: ['cattle_low', 'horse_whinny', 'rooster_crow', 'dog_bark'],
    },

    lighting: {
      lanternPositions: [
        { x: 40, y: 3, z: 24 },  // Main house porch
        { x: 20, y: 3, z: 32 },  // Bunkhouse entrance
        { x: 64, y: 3, z: 32 },  // Stable entrance
      ],
      litWindows: ['main_ranch', 'bunkhouse_2'],
      campfires: [],
      peakActivity: 'morning',
    },

    weather: {
      dominant: 'clear',
      variability: 'mild',
      particleEffect: 'none',
    },
  },

  tags: ['ranch', 'wealthy', 'cattle', 'employment'],
});

export default SunsetRanch;
