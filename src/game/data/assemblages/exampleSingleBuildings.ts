/**
 * Example Assemblages - Single Buildings
 *
 * Individual building prefabs for town generation.
 * All coordinates are relative to anchor at (0,0).
 */

import { type Assemblage, validateAssemblage } from '../schemas';

export const SingleCabin: Assemblage = validateAssemblage({
  id: 'single_cabin_01',
  name: 'Frontier Cabin',
  type: 'single_cabin',
  description: 'A simple wooden cabin with small yard',
  tags: ['residential', 'starter', 'rural'],
  tiles: [
    // Center - the cabin
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'cabin', buildingRotation: 0 },
    // Surrounding yard
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'bush' },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 1, r: -1 }, terrain: 'grass', feature: 'none' },
  ],
  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

export const SingleSaloon: Assemblage = validateAssemblage({
  id: 'single_saloon_01',
  name: 'Desert Saloon',
  type: 'single_saloon',
  description: 'A saloon with hitching posts and water trough',
  tags: ['commercial', 'social', 'town_center'],
  tiles: [
    // Center - the saloon
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'saloon', buildingRotation: 0 },
    // Front porch area (road side)
    {
      coord: { q: 1, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'none', 'none', 'none'],
    },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'none' },
    // Side yard
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'barrel' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'crate' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],
  requiresRoadAccess: true,
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

export const SingleSheriff: Assemblage = validateAssemblage({
  id: 'single_sheriff_01',
  name: 'Sheriff Office',
  type: 'single_sheriff',
  description: 'Law enforcement office with jail cells',
  tags: ['civic', 'law', 'important'],
  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'sheriff_office', buildingRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'rock_small' },
  ],
  requiresRoadAccess: true,
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

export const SingleChurch: Assemblage = validateAssemblage({
  id: 'single_church_01',
  name: 'Frontier Church',
  type: 'single_church',
  description: 'Small wooden church with graveyard',
  tags: ['civic', 'religious', 'social'],
  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'grass', building: 'church', buildingRotation: 0 },
    // Front path
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    // Graveyard side
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -2, r: 1 }, terrain: 'grass', feature: 'none' },
    // Garden side
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'tree' },
  ],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain', 'badlands'],
});

export const SingleGeneralStore: Assemblage = validateAssemblage({
  id: 'single_store_01',
  name: 'General Store',
  type: 'single_store',
  description: 'Trading post with storage yard',
  tags: ['commercial', 'trade', 'essential'],
  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', building: 'general_store', buildingRotation: 0 },
    // Loading area
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'crate' },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'barrel' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
    // Back storage
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'crate' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'barrel' },
  ],
  requiresRoadAccess: true,
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});
