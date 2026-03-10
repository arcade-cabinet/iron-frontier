import type { TileDef } from '../../schemas/spatial.ts';

export const freeminer_hollowBaseTiles: TileDef[] = [
    // ========================================
    // BOX CANYON WALLS - Defensive perimeter
    // North wall (impassable mountains)
    // ========================================
    { coord: { q: 0, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 1, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 2, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 3, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 4, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 5, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 6, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 7, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 8, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 9, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 10, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 11, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 12, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 13, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 14, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 15, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 16, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 17, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 18, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 19, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 20, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 21, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 22, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 23, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 24, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 25, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 26, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 27, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 28, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 29, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 30, r: 1 }, terrain: 'stone_mountain', feature: 'none' },

    // West wall
    { coord: { q: 0, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 4 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 5 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 6 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 7 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 8 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 9 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 10 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 11 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 13 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 14 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 15 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 1, r: 16 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 1, r: 17 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 2, r: 18 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 2, r: 19 }, terrain: 'stone_mountain', feature: 'none' },

    // East wall
    { coord: { q: 31, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 4 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 5 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 6 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 7 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 8 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 9 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 10 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 11 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 13 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 14 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 30, r: 15 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 30, r: 16 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 29, r: 17 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 29, r: 18 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 28, r: 19 }, terrain: 'stone_mountain', feature: 'none' },

    // ========================================
    // CANYON FLOOR - Main paths
    // ========================================
    // Entry path from south
    {
      coord: { q: 16, r: 26 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 25 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 24 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 23 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 22 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 21 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 20 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 19 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Central plaza area
    { coord: { q: 15, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 16, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 17, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 16, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 17, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 15, r: 17 }, terrain: 'dirt', feature: 'none' },

    // Path to mine
    {
      coord: { q: 18, r: 10 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 18, r: 9 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 18, r: 8 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'road', 'none'],
    },
    {
      coord: { q: 19, r: 7 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 6 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // ========================================
    // ROCKY TERRAIN & VEGETATION
    // ========================================
    // Stone hillocks around the hollow
    { coord: { q: 5, r: 8 }, terrain: 'stone_hill', feature: 'rock_small' },
    { coord: { q: 6, r: 10 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 27, r: 6 }, terrain: 'stone_hill', feature: 'rock_large' },
    { coord: { q: 28, r: 12 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 4, r: 15 }, terrain: 'stone_hill', feature: 'ore_vein' },
    { coord: { q: 29, r: 10 }, terrain: 'stone_rocks', feature: 'ore_vein' },

    // Sparse grass patches in sheltered areas
    { coord: { q: 12, r: 10 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 14, r: 8 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 20, r: 18 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 24, r: 18 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 8, r: 18 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 10, r: 20 }, terrain: 'grass', feature: 'bush' },

    // Water source - small spring
    { coord: { q: 6, r: 12 }, terrain: 'water_shallow', feature: 'spring' },
    { coord: { q: 7, r: 12 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 6, r: 13 }, terrain: 'grass', feature: 'none' },

    // Elevated areas near mine
    { coord: { q: 21, r: 3 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
    { coord: { q: 22, r: 3 }, terrain: 'stone_hill', elevation: 1, feature: 'none' },
    { coord: { q: 23, r: 3 }, terrain: 'stone_hill', elevation: 1, feature: 'ore_vein' },
  ];
