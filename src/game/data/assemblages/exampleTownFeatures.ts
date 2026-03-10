/**
 * Example Assemblages - Town Features
 *
 * Town infrastructure and decoration prefabs (squares, streets, lots, graveyards).
 * All coordinates are relative to anchor at (0,0).
 */

import { type Assemblage, validateAssemblage } from '../schemas';

export const TownSquare: Assemblage = validateAssemblage({
  id: 'town_square_01',
  name: 'Town Square',
  type: 'town_square',
  description: 'Central gathering place with well and benches',
  tags: ['civic', 'social', 'center', 'important'],
  tiles: [
    // Center well
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'well', buildingRotation: 0 },
    // Surrounding plaza
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'none' },
    // Outer ring with some trees
    { coord: { q: 2, r: -1 }, terrain: 'grass', feature: 'tree' },
    {
      coord: { q: 2, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'none', 'none', 'none'],
    },
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: -1, r: 2 }, terrain: 'grass', feature: 'tree' },
    {
      coord: { q: -2, r: 1 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'none', 'road', 'none', 'none'],
    },
    { coord: { q: -1, r: -1 }, terrain: 'grass', feature: 'bush' },
  ],
  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

export const MainStreetSegment: Assemblage = validateAssemblage({
  id: 'main_street_01',
  name: 'Main Street Segment',
  type: 'main_street_segment',
  description: 'A stretch of main street with road',
  tags: ['infrastructure', 'road', 'connector'],
  tiles: [
    // Road tiles in a line
    {
      coord: { q: 0, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 1, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 2, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: -1, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
  ],
  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

export const EmptyLot: Assemblage = validateAssemblage({
  id: 'empty_lot_01',
  name: 'Empty Lot',
  type: 'empty_lot',
  description: 'Vacant lot for filler',
  tags: ['filler', 'empty', 'small'],
  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 1, r: 0 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none' },
  ],
  validRotations: [0, 1, 2, 3, 4, 5],
});

export const Graveyard: Assemblage = validateAssemblage({
  id: 'graveyard_01',
  name: 'Boot Hill',
  type: 'graveyard',
  description: 'Small cemetery on a hill',
  tags: ['civic', 'dark', 'quiet'],
  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'grass', feature: 'none', elevation: 1 },
    { coord: { q: 1, r: 0 }, terrain: 'grass', feature: 'none', elevation: 1 },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none', elevation: 1 },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'tree_dead', elevation: 1 },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'none', elevation: 1 },
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'rock_small', elevation: 1 },
    // Approach
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'none', elevation: 0 },
  ],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'sand', 'badlands'],
});
