import type { TileDef } from '../../schemas/spatial.ts';
import { generateFloorTiles } from './helpers.ts';

export const baseTiles: TileDef[] = [
  // =========================================================================
  // OUTER WALLS (stone_mountain terrain as impassable boundary)
  // =========================================================================
  // Top boundary (r = 0-2)
  ...generateFloorTiles(0, 0, 60, 3, 'stone_rocks', 2),

  // Bottom boundary (r = 48-50)
  ...generateFloorTiles(0, 48, 60, 2, 'stone_rocks', 2),

  // Left boundary (q = 0-5)
  ...generateFloorTiles(0, 3, 6, 45, 'stone_rocks', 2),

  // Right boundary (q = 55-60)
  ...generateFloorTiles(54, 3, 6, 45, 'stone_rocks', 2),

  // =========================================================================
  // MAIN CORRIDORS connecting areas
  // =========================================================================

  // Entry tunnel to Assembly Hall (r: 40-46, q: 28-32)
  { coord: { q: 29, r: 41 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 41 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 31, r: 41 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 29, r: 40 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 40 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 31, r: 40 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 39 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 38 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 37 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Assembly Hall to Power Station corridor (west)
  { coord: { q: 26, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 25, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 24, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 23, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 22, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 21, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 20, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Assembly Hall to Barracks corridor (east)
  { coord: { q: 34, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 35, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 36, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 37, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 38, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 39, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 40, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 41, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Assembly Hall to Command Center (north)
  { coord: { q: 30, r: 31 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 30 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 29 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 28 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 27 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 26 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Power Station to Furnace (down/west)
  { coord: { q: 14, r: 32 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 31 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 30 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 29 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 28 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 27 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 26 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 25 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 13, r: 24 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Command Center to Armory (east)
  { coord: { q: 33, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 34, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 35, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 36, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 37, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 38, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 39, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 40, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Command Center to Storage Vaults (west)
  { coord: { q: 27, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 26, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 25, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 24, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 23, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 22, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 21, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 20, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Barracks to Testing Ground (north)
  { coord: { q: 44, r: 31 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 30 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 29 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 28 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 27 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 26 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 25 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 24 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 22 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 21 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 20 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 19 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 18 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 17 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 16 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Testing Ground to Maintenance Bay (east)
  { coord: { q: 48, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 49, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 50, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 51, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 52, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Maintenance Bay to Escape Route (north)
  { coord: { q: 55, r: 11 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 55, r: 10 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 55, r: 9 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 55, r: 8 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // =========================================================================
  // ATMOSPHERIC DETAILS
  // =========================================================================

  // Scattered debris in corridors
  { coord: { q: 25, r: 34 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
  { coord: { q: 36, r: 34 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
  { coord: { q: 30, r: 29 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
  { coord: { q: 44, r: 25 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },

  // Old machinery parts
  { coord: { q: 22, r: 33 }, terrain: 'stone', feature: 'ruins', elevation: 0 },
  { coord: { q: 38, r: 33 }, terrain: 'stone', feature: 'ruins', elevation: 0 },
  { coord: { q: 30, r: 28 }, terrain: 'stone', feature: 'ruins', elevation: 0 },

  // =========================================================================
  // INTERNAL WALLS (separating areas)
  // =========================================================================

  // Walls around Assembly Hall
  { coord: { q: 26, r: 36 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 34, r: 36 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 26, r: 32 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 34, r: 32 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },

  // Walls around Power Station
  { coord: { q: 14, r: 35 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 20, r: 35 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 14, r: 31 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 20, r: 31 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },

  // Walls around Command Center
  { coord: { q: 27, r: 25 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 33, r: 25 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 27, r: 21 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 33, r: 21 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },

  // =========================================================================
  // DECORATIVE FILL for empty spaces (stone floor)
  // =========================================================================

  // General floor tiles between areas
  ...generateFloorTiles(7, 28, 8, 10, 'stone'), // Area around Power Station/Furnace
  ...generateFloorTiles(35, 28, 10, 8, 'stone'), // Area around Barracks
  ...generateFloorTiles(35, 15, 12, 10, 'stone'), // Area around Testing Ground
  ...generateFloorTiles(22, 15, 12, 10, 'stone'), // Area around Command/Armory/Vaults
];
