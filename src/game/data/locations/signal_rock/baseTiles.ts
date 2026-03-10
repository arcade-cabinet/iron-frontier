import type { TileDef } from '../../schemas/spatial.ts';

export const signal_rockBaseTiles: TileDef[] = [
    // ========================================
    // ELEVATED TERRAIN - Rock surroundings
    // ========================================
    // Northern elevated area around signal fire
    { coord: { q: 8, r: 4 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
    { coord: { q: 9, r: 4 }, terrain: 'stone', elevation: 1, feature: 'none' },
    { coord: { q: 12, r: 4 }, terrain: 'stone', elevation: 1, feature: 'none' },
    { coord: { q: 13, r: 4 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
    { coord: { q: 7, r: 5 }, terrain: 'stone_rocks', elevation: 1, feature: 'boulder' },
    { coord: { q: 13, r: 5 }, terrain: 'stone_hill', elevation: 1, feature: 'none' },

    // Western approach
    { coord: { q: 4, r: 7 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 5, r: 6 }, terrain: 'stone_hill', feature: 'rock_large' },
    { coord: { q: 4, r: 9 }, terrain: 'stone', feature: 'rock_small' },
    { coord: { q: 3, r: 10 }, terrain: 'badlands', feature: 'rock_small' },

    // Eastern descent
    { coord: { q: 14, r: 8 }, terrain: 'stone_hill', feature: 'rock_small' },
    { coord: { q: 15, r: 7 }, terrain: 'stone', feature: 'none' },
    { coord: { q: 15, r: 9 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 16, r: 8 }, terrain: 'badlands', feature: 'rock_small' },

    // ========================================
    // BADLANDS FLOOR - Main approach area
    // ========================================
    { coord: { q: 10, r: 14 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 11, r: 14 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 10, r: 15 }, terrain: 'badlands', feature: 'rock_small' },
    { coord: { q: 12, r: 15 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 10, r: 16 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 11, r: 16 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 10, r: 17 }, terrain: 'badlands', feature: 'none' },

    // Southern approach trail
    {
      coord: { q: 10, r: 18 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 19 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // ========================================
    // SCATTERED TERRAIN FEATURES
    // ========================================
    // Dead vegetation (harsh environment)
    { coord: { q: 3, r: 14 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 17, r: 12 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 6, r: 16 }, terrain: 'badlands', feature: 'cactus' },
    { coord: { q: 15, r: 15 }, terrain: 'badlands', feature: 'cactus' },

    // Rocky outcrops
    { coord: { q: 2, r: 6 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 17, r: 5 }, terrain: 'stone_rocks', feature: 'rock_large' },
    { coord: { q: 3, r: 16 }, terrain: 'stone', feature: 'rock_small' },
    { coord: { q: 16, r: 16 }, terrain: 'stone', feature: 'rock_small' },

    // Sandy patches
    { coord: { q: 13, r: 16 }, terrain: 'sand', feature: 'none' },
    { coord: { q: 7, r: 17 }, terrain: 'sand', feature: 'none' },
    { coord: { q: 4, r: 13 }, terrain: 'sand', feature: 'none' },

    // Mesa formations at edges (impassable)
    { coord: { q: 1, r: 3 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 2, r: 3 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 1, r: 4 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 18, r: 3 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 18, r: 4 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 17, r: 3 }, terrain: 'mesa', feature: 'none' },
  ];
