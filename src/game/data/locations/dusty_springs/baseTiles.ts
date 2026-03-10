import type { TileDef } from '../../schemas/spatial.ts';

export const dusty_springsBaseTiles: TileDef[] = [
    // -------------------------------------------------------------------------
    // MAIN STREET - east-west thoroughfare
    // Packed dirt from countless boots and hooves
    // -------------------------------------------------------------------------
    { coord: { q: 4, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 8, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 12, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 14, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 16, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 20, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 21, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 22, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 23, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 24, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 25, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 26, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 27, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 28, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 29, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 30, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 31, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 32, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 33, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 34, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 35, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 36, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // West road entrance approach
    { coord: { q: 2, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 3, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // East road exit
    { coord: { q: 37, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 38, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // -------------------------------------------------------------------------
    // TOWN SQUARE ROAD - North-south to well and water tower
    // -------------------------------------------------------------------------
    { coord: { q: 20, r: 15 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 16 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 17 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 18 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 11 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // CHURCH ROAD - Side street south to St. Michael's
    // -------------------------------------------------------------------------
    { coord: { q: 10, r: 20 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 21 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 22 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 23 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 24 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 25 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // DEPOT ROAD - North to the train station
    // -------------------------------------------------------------------------
    { coord: { q: 30, r: 17 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 30, r: 18 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 16 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 15 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 14 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // MANSION ROAD - South to the Holt estate
    // -------------------------------------------------------------------------
    { coord: { q: 28, r: 20 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 28, r: 21 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 28, r: 22 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 28, r: 23 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // RAILROAD - East-west north of town
    // -------------------------------------------------------------------------
    { coord: { q: 26, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 27, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 28, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 29, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 30, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 35, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 36, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 37, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 38, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },

    // -------------------------------------------------------------------------
    // DESERT DECORATIONS - The land encroaches, a reminder of how fragile
    // civilization is on this frontier
    // -------------------------------------------------------------------------
    { coord: { q: 3, r: 6 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 5, r: 4 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 36, r: 6 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 34, r: 4 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 3, r: 32 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 6, r: 35 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 35, r: 34 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 37, r: 32 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 4, r: 10 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 36, r: 28 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 2, r: 26 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 38, r: 8 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 6, r: 6 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 34, r: 32 }, terrain: 'sand', feature: 'rock_large' },
    { coord: { q: 8, r: 34 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 32, r: 6 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 2, r: 14 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 38, r: 24 }, terrain: 'sand', feature: 'rock_large' },

    // Town square area - packed dirt around the well
    { coord: { q: 19, r: 14 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 21, r: 14 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 19, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 21, r: 15 }, terrain: 'dirt', feature: 'none' },

    // Grass patches near church and residential areas
    { coord: { q: 12, r: 26 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 14, r: 28 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 26, r: 26 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 24, r: 28 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 6, r: 28 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 12, r: 32 }, terrain: 'grass', feature: 'bush' },

    // Western town props - barrels, benches, carts
    { coord: { q: 13, r: 18 }, terrain: 'dirt', feature: 'barrel' },
    { coord: { q: 14, r: 17 }, terrain: 'dirt', feature: 'barrel_water' },
    { coord: { q: 19, r: 13 }, terrain: 'dirt', feature: 'barrel' },
    { coord: { q: 20, r: 13 }, terrain: 'dirt', feature: 'barrel_hay' },
    { coord: { q: 18, r: 14 }, terrain: 'dirt', feature: 'bench' },
    { coord: { q: 22, r: 14 }, terrain: 'dirt', feature: 'bench' },
    { coord: { q: 20, r: 16 }, terrain: 'dirt', feature: 'bench' },
    { coord: { q: 16, r: 20 }, terrain: 'dirt', feature: 'cart' },
    { coord: { q: 28, r: 20 }, terrain: 'dirt', feature: 'cart' },
    { coord: { q: 8, r: 17 }, terrain: 'dirt', feature: 'cart' },
    { coord: { q: 5, r: 19 }, terrain: 'dirt', feature: 'signpost' },
    { coord: { q: 20, r: 12 }, terrain: 'dirt', feature: 'signpost' },
    { coord: { q: 35, r: 19 }, terrain: 'dirt', feature: 'signpost' },
  ];
