/**
 * Example Assemblages - Functional Groups
 *
 * Multi-building compound prefabs (ranch, mine, train depot).
 * All coordinates are relative to anchor at (0,0).
 */

import { type Assemblage, validateAssemblage } from '../schemas';

export const Ranch: Assemblage = validateAssemblage({
  id: 'ranch_01',
  name: 'Small Ranch',
  type: 'ranch',
  description: 'Ranch house with barn, corral, and well',
  tags: ['residential', 'agricultural', 'rural', 'large'],
  tiles: [
    // Ranch house (anchor)
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'house', buildingRotation: 0 },
    // House yard
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'bush' },

    // Barn area
    { coord: { q: 2, r: 0 }, terrain: 'dirt', building: 'stable', buildingRotation: 0 },
    { coord: { q: 2, r: -1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 3, r: -1 }, terrain: 'grass', feature: 'none' },

    // Corral (fenced area)
    {
      coord: { q: 2, r: 1 },
      terrain: 'grass',
      feature: 'none',
      edges: ['fence', 'fence', 'none', 'none', 'none', 'fence'],
    },
    {
      coord: { q: 3, r: 0 },
      terrain: 'grass',
      feature: 'none',
      edges: ['fence', 'none', 'none', 'fence', 'fence', 'fence'],
    },
    {
      coord: { q: 3, r: 1 },
      terrain: 'grass',
      feature: 'none',
      edges: ['fence', 'fence', 'fence', 'none', 'none', 'fence'],
    },

    // Well
    { coord: { q: -1, r: 0 }, terrain: 'dirt', building: 'well', buildingRotation: 0 },

    // Approach road
    {
      coord: { q: 0, r: -1 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 1, r: -1 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
  ],
  validRotations: [0, 2, 4], // Only even rotations to align with hex grid better
  forbiddenTerrain: [
    'water',
    'water_shallow',
    'water_deep',
    'stone_mountain',
    'badlands',
    'canyon',
  ],
  minWaterDistance: 0,
});

export const MineEntrance: Assemblage = validateAssemblage({
  id: 'mine_entrance_01',
  name: 'Mine Entrance',
  type: 'mine_entrance',
  description: 'Mine shaft entrance with equipment and ore cart tracks',
  tags: ['industrial', 'mining', 'resource'],
  tiles: [
    // Mine building (anchor)
    { coord: { q: 0, r: 0 }, terrain: 'stone', building: 'mine', buildingRotation: 0 },
    // Equipment area
    { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'crate' },
    { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'ore_deposit' },
    // Cart track approach
    {
      coord: { q: 0, r: -1 },
      terrain: 'stone',
      feature: 'none',
      edges: ['none', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: -1, r: 0 },
      terrain: 'stone',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'none', 'none', 'none'],
    },
    // Rocky surroundings
    { coord: { q: -1, r: 1 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 0, r: 1 }, terrain: 'stone_rocks', feature: 'rock_large' },
    { coord: { q: -1, r: -1 }, terrain: 'stone_hill', feature: 'rock_small' },
  ],
  validRotations: [0, 1, 2, 3, 4, 5],
  requiredTerrain: ['stone', 'stone_hill', 'stone_rocks', 'badlands', 'canyon'],
});

export const TrainDepot: Assemblage = validateAssemblage({
  id: 'train_depot_01',
  name: 'Train Depot',
  type: 'train_depot',
  description: 'Railroad station with platform and water tower',
  tags: ['infrastructure', 'transport', 'important', 'large'],
  tiles: [
    // Station building (anchor)
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'train_station', buildingRotation: 0 },
    // Platform
    {
      coord: { q: 1, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'none', 'none', 'railroad'],
    },
    {
      coord: { q: 2, r: -1 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: 1, r: -1 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'none', 'none', 'railroad', 'railroad'],
    },
    // Water tower for steam engines
    { coord: { q: -1, r: 0 }, terrain: 'dirt', building: 'water_tower', buildingRotation: 0 },
    // Cargo area
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'crate' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'barrel' },
    // Approach
    {
      coord: { q: 0, r: -1 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'none', 'road', 'none', 'none'],
    },
  ],
  requiresRoadAccess: true,
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});
