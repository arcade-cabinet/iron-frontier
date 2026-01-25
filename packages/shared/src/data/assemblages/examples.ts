/**
 * Example Assemblages - Validated prefabs for town generation
 *
 * These serve as both examples and functional building blocks.
 * All coordinates are relative to anchor at (0,0).
 */

import { Assemblage, validateAssemblage } from '../schemas';

// ============================================================================
// SINGLE BUILDINGS
// ============================================================================

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
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'none', 'none', 'none'] },
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

// ============================================================================
// FUNCTIONAL GROUPS
// ============================================================================

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
    { coord: { q: 2, r: 1 }, terrain: 'grass', feature: 'none', edges: ['fence', 'fence', 'none', 'none', 'none', 'fence'] },
    { coord: { q: 3, r: 0 }, terrain: 'grass', feature: 'none', edges: ['fence', 'none', 'none', 'fence', 'fence', 'fence'] },
    { coord: { q: 3, r: 1 }, terrain: 'grass', feature: 'none', edges: ['fence', 'fence', 'fence', 'none', 'none', 'fence'] },

    // Well
    { coord: { q: -1, r: 0 }, terrain: 'dirt', building: 'well', buildingRotation: 0 },

    // Approach road
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none', edges: ['none', 'none', 'none', 'none', 'none', 'road'] },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
  ],
  validRotations: [0, 2, 4], // Only even rotations to align with hex grid better
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain', 'badlands', 'canyon'],
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
    { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', edges: ['none', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', edges: ['railroad', 'none', 'none', 'none', 'none', 'none'] },
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
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['railroad', 'none', 'none', 'none', 'none', 'railroad'] },
    { coord: { q: 2, r: -1 }, terrain: 'dirt', feature: 'none', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'none', edges: ['none', 'none', 'none', 'none', 'railroad', 'railroad'] },
    // Water tower for steam engines
    { coord: { q: -1, r: 0 }, terrain: 'dirt', building: 'water_tower', buildingRotation: 0 },
    // Cargo area
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'crate' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'barrel' },
    // Approach
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none', edges: ['none', 'none', 'none', 'road', 'none', 'none'] },
  ],
  requiresRoadAccess: true,
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

// ============================================================================
// TOWN FEATURES
// ============================================================================

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
    { coord: { q: 2, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'none', 'none', 'none'] },
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: -1, r: 2 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: -2, r: 1 }, terrain: 'dirt', feature: 'none', edges: ['none', 'none', 'none', 'road', 'none', 'none'] },
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
    { coord: { q: 0, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 2, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
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

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ALL_ASSEMBLAGES: Assemblage[] = [
  SingleCabin,
  SingleSaloon,
  SingleSheriff,
  SingleChurch,
  SingleGeneralStore,
  Ranch,
  MineEntrance,
  TrainDepot,
  TownSquare,
  MainStreetSegment,
  EmptyLot,
  Graveyard,
];

/** Lookup by ID */
export const ASSEMBLAGES_BY_ID = new Map<string, Assemblage>(
  ALL_ASSEMBLAGES.map(a => [a.id, a])
);

/** Lookup by type */
export function getAssemblagesByType(type: string): Assemblage[] {
  return ALL_ASSEMBLAGES.filter(a => a.type === type);
}

/** Lookup by tag */
export function getAssemblagesByTag(tag: string): Assemblage[] {
  return ALL_ASSEMBLAGES.filter(a => a.tags.includes(tag));
}
