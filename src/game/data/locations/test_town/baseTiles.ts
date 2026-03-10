/**
 * Test Town - Base Tiles
 *
 * Roads and terrain features.
 * Main street runs east-west at r=11, roughly 7m wide packed dirt.
 */

export const testTownBaseTiles = [
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
];
