import type { SlotInstance } from '../../schemas/spatial.ts';

export const dungeonSlots6: SlotInstance[] = [
{
    id: 'escape_route',
    type: 'hidden_cache',
    name: 'Escape Route',
    anchor: { q: 55, r: 5 },
    rotation: 0,
    tiles: [
      // Tunnel leading out
      { coord: { q: 0, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone_rocks', feature: 'boulder', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -2 }, terrain: 'stone', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_maintenance',
        offset: { q: 0, r: 2 },
        facing: 5,
        tags: ['interior'],
      },
      {
        type: 'exit',
        name: 'mountain_exit',
        offset: { q: 0, r: -2 },
        facing: 2,
        tags: ['exterior', 'escape', 'final'],
      },
      { type: 'hiding_spot', name: 'rubble_cover', offset: { q: 1, r: 0 }, tags: ['cover'] },
      {
        type: 'evidence_spot',
        name: 'abandoned_supplies',
        offset: { q: -1, r: 0 },
        tags: ['clue', 'evacuation'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'escape_tunnel',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: 0, r: -1 },
          { q: 0, r: -2 },
        ],
        tags: ['passage', 'escape'],
      },
    ],
    tags: ['escape', 'exit', 'finale'],
    importance: 5,
  },
];
