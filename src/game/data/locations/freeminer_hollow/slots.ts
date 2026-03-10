import type { SlotInstance } from '../../schemas/spatial.ts';

export const freeminer_hollowSlots: SlotInstance[] = [
    // ========================================
    // HIDDEN STORES - Supplies stashed in rocks
    // Custom slot for the hidden cache areas
    // ========================================
    {
      id: 'hidden_stores_1',
      type: 'hidden_cache',
      name: 'Western Cache',
      anchor: { q: 3, r: 10 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'rock_large' },
        { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'rock_small' },
      ],
      markers: [
        {
          type: 'storage',
          name: 'emergency_supplies',
          offset: { q: 0, r: 0 },
          tags: ['hidden', 'emergency'],
        },
        { type: 'hiding_spot', name: 'cache_entrance', offset: { q: 1, r: 0 }, tags: ['secret'] },
      ],
      zones: [
        {
          type: 'loot_area',
          name: 'hidden_goods',
          tiles: [{ q: 0, r: 0 }],
          tags: ['hidden', 'valuable'],
        },
      ],
      tags: ['hidden', 'emergency', 'secret'],
      importance: 3,
    },
    {
      id: 'hidden_stores_2',
      type: 'hidden_cache',
      name: 'Northern Cache',
      anchor: { q: 15, r: 3 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large' },
      ],
      markers: [
        {
          type: 'storage',
          name: 'weapon_cache',
          offset: { q: 0, r: 0 },
          tags: ['hidden', 'weapons'],
        },
        {
          type: 'evidence_spot',
          name: 'ivrc_documents',
          offset: { q: -1, r: 0 },
          tags: ['clue', 'quest'],
        },
      ],
      zones: [
        {
          type: 'loot_area',
          name: 'arms_cache',
          tiles: [
            { q: 0, r: 0 },
            { q: -1, r: 0 },
          ],
          tags: ['weapons', 'hidden'],
        },
      ],
      tags: ['hidden', 'weapons', 'resistance'],
      importance: 4,
    },
  ];
