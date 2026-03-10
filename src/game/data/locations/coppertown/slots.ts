import type { SlotInstance } from '../../schemas/spatial.ts';

export const coppertownSlots: SlotInstance[] = [
    // The Pit - Open copper mine (terrain feature, not building)
    {
      id: 'the_pit',
      type: 'mine',
      name: 'The Pit',
      anchor: { q: 38, r: 5 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'canyon', elevation: 0, feature: 'ore_vein' },
        { coord: { q: 1, r: 0 }, terrain: 'canyon', elevation: 0, feature: 'none' },
        { coord: { q: -1, r: 0 }, terrain: 'canyon', elevation: 0, feature: 'ore_vein' },
        { coord: { q: 0, r: 1 }, terrain: 'canyon', elevation: 0, feature: 'none' },
        { coord: { q: 1, r: 1 }, terrain: 'canyon', elevation: 0, feature: 'none' },
        { coord: { q: -1, r: 1 }, terrain: 'stone_rocks', elevation: 1, feature: 'boulder' },
        { coord: { q: 0, r: -1 }, terrain: 'stone_rocks', elevation: 1, feature: 'rock_large' },
        { coord: { q: 2, r: 0 }, terrain: 'stone_rocks', elevation: 1, feature: 'none' },
        { coord: { q: -2, r: 1 }, terrain: 'stone_mountain', elevation: 2, feature: 'none' },
      ],
      markers: [
        {
          type: 'vantage_point',
          name: 'pit_overlook',
          offset: { q: -1, r: 1 },
          tags: ['danger', 'view'],
        },
        {
          type: 'spawn_point',
          name: 'miner_spawn',
          offset: { q: 0, r: 0 },
          tags: ['npc', 'worker'],
        },
        {
          type: 'evidence_spot',
          name: 'unsafe_equipment',
          offset: { q: 1, r: 0 },
          tags: ['clue', 'safety'],
        },
      ],
      zones: [
        {
          type: 'combat_zone',
          name: 'pit_floor',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: -1, r: 0 },
            { q: 0, r: 1 },
          ],
          tags: ['dangerous', 'fall_hazard'],
        },
      ],
      tags: ['terrain', 'dangerous', 'industrial'],
      importance: 5,
    },

    // Ore cart track system (linear infrastructure)
    {
      id: 'ore_tracks',
      type: 'landmark',
      name: 'Ore Cart Tracks',
      anchor: { q: 32, r: 10 },
      rotation: 0,
      tiles: [
        {
          coord: { q: 0, r: 0 },
          terrain: 'stone',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        {
          coord: { q: -1, r: 0 },
          terrain: 'stone',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        {
          coord: { q: -2, r: 0 },
          terrain: 'stone',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        {
          coord: { q: -3, r: 1 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
        {
          coord: { q: -3, r: 2 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
        {
          coord: { q: -3, r: 3 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
        {
          coord: { q: -3, r: 4 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
      ],
      markers: [
        {
          type: 'spawn_point',
          name: 'ore_cart',
          offset: { q: -1, r: 0 },
          tags: ['vehicle', 'industrial'],
        },
      ],
      zones: [],
      tags: ['infrastructure', 'industrial', 'transport'],
      importance: 3,
    },
  ];
