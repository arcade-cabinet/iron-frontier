import type { TileDef } from '../../schemas/spatial.ts';

export const prospectBaseTiles: TileDef[] = [
    // Main street - runs through town center (east-west)
    {
      coord: { q: 8, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 9, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 11, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 12, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 13, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 15, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 16, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 17, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 20, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 21, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 23, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Entry roads
    {
      coord: { q: 4, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 5, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 6, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 7, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 25, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 26, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Path to well (north-south)
    {
      coord: { q: 15, r: 12 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 13 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 14 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Path to church
    {
      coord: { q: 10, r: 11 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 12 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 13 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Trail to old mine
    { coord: { q: 7, r: 10 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 6, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 6, r: 8 }, terrain: 'dirt', feature: 'none' },

    // Grassland with scattered vegetation - natural prairie feel
    { coord: { q: 3, r: 4 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 26, r: 8 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 12, r: 4 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 24, r: 4 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 4, r: 24 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 26, r: 22 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 8, r: 26 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 18, r: 26 }, terrain: 'grass', feature: 'tree' },

    // Old mining debris near abandoned mine
    { coord: { q: 4, r: 5 }, terrain: 'stone_rocks', feature: 'rock_small' },
    { coord: { q: 8, r: 4 }, terrain: 'stone', feature: 'boulder' },
    { coord: { q: 5, r: 8 }, terrain: 'dirt', feature: 'rock_large' },

    // Fence posts marking farmland (decorative)
    { coord: { q: 22, r: 4 }, terrain: 'grass', feature: 'rock_small' },
    { coord: { q: 26, r: 20 }, terrain: 'grass', feature: 'rock_small' },
  ];
