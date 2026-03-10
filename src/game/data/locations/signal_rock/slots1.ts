import type { SlotInstance } from '../../schemas/spatial.ts';

export const signal_rockSlots1: SlotInstance[] = [
    {
      id: 'traveler_cache',
      type: 'hidden_cache',
      name: 'Rock Cache',
      anchor: { q: 5, r: 11 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'rock_small' },
      ],
      markers: [
        {
          type: 'storage',
          name: 'emergency_cache',
          offset: { q: 0, r: 0 },
          tags: ['hidden', 'supplies', 'water'],
        },
        { type: 'hiding_spot', name: 'cache_hollow', offset: { q: 1, r: 0 }, tags: ['cover'] },
      ],
      zones: [
        {
          type: 'loot_area',
          name: 'cache_contents',
          tiles: [{ q: 0, r: 0 }],
          tags: ['supplies', 'hidden'],
        },
      ],
      tags: ['hidden', 'supplies', 'outlaw_hospitality'],
      importance: 2,
    },
];
