import type { TileDef } from '../../schemas/spatial.ts';

export const junction_cityBaseTiles2: TileDef[] = [
    {
      coord: { q: 29, r: 26 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 32, r: 26 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 33, r: 26 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    { coord: { q: 22, r: 6 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 28, r: 6 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 30, r: 5 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 35, r: 7 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 6, r: 28 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 8, r: 30 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 16, r: 32 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 44, r: 20 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 46, r: 22 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 4, r: 19 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 24, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 25, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 26, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 24, r: 18 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 26, r: 18 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 27, r: 18 }, terrain: 'dirt', feature: 'none' },
];
