import type { SlotInstance } from '../../schemas/spatial.ts';

export const dungeonSlots0: SlotInstance[] = [
{
    id: 'hidden_entrance',
    type: 'hideout',
    name: 'Hidden Entrance',
    anchor: { q: 30, r: 48 },
    rotation: 0,
    tiles: [
      { coord: { q: 0, r: 0 }, terrain: 'stone_mountain', feature: 'boulder', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'secret_door',
        offset: { q: 0, r: 0 },
        facing: 5,
        tags: ['hidden', 'main'],
      },
      {
        type: 'evidence_spot',
        name: 'old_insignia',
        offset: { q: 1, r: 0 },
        tags: ['clue', 'union'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'entrance_area',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
        ],
        tags: ['transition'],
      },
    ],
    tags: ['entrance', 'hidden', 'exterior'],
    importance: 5,
  },
{
    id: 'entry_tunnel',
    type: 'hidden_cache',
    name: 'Entry Tunnel',
    anchor: { q: 30, r: 43 },
    rotation: 0,
    tiles: [
      // Main tunnel corridor
      { coord: { q: 0, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
      { coord: { q: 0, r: 3 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 4 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Collapsed side sections
      { coord: { q: -1, r: 1 }, terrain: 'stone_rocks', feature: 'boulder', elevation: 0 },
      { coord: { q: 1, r: 2 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: -1, r: 3 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
      // Walls
      { coord: { q: -2, r: 2 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
      { coord: { q: 2, r: 2 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'tunnel_start',
        offset: { q: 0, r: 4 },
        facing: 5,
        tags: ['from_entrance'],
      },
      {
        type: 'exit',
        name: 'tunnel_end',
        offset: { q: 0, r: 0 },
        facing: 2,
        tags: ['to_assembly'],
      },
      { type: 'hiding_spot', name: 'rubble_cover', offset: { q: -1, r: 1 }, tags: ['cover'] },
      {
        type: 'evidence_spot',
        name: 'old_lantern',
        offset: { q: 1, r: 2 },
        tags: ['clue', 'atmosphere'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'tunnel_path',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: 0, r: 3 },
          { q: 0, r: 4 },
        ],
        tags: ['passage'],
      },
      {
        type: 'combat_zone',
        name: 'ambush_point',
        tiles: [
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: 1, r: 2 },
        ],
        tags: ['dangerous', 'automaton'],
      },
    ],
    tags: ['tunnel', 'dark', 'collapsed'],
    importance: 3,
  },
];
