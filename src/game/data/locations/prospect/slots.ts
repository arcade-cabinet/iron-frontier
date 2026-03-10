import type { SlotInstance } from '../../schemas/spatial.ts';

export const prospectSlots: SlotInstance[] = [
    {
      id: 'grain_silo',
      type: 'farm',
      name: 'Grain Silo',
      anchor: { q: 16, r: 18 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'warehouse', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'silo_door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
        {
          type: 'storage',
          name: 'grain_storage',
          offset: { q: 0, r: 0 },
          tags: ['grain', 'agricultural'],
        },
        { type: 'spawn_point', name: 'worker', offset: { q: 0, r: 1 }, tags: ['npc', 'farmer'] },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'loading_area',
          tiles: [
            { q: 1, r: 0 },
            { q: 0, r: 1 },
          ],
          tags: [],
        },
        {
          type: 'loot_area',
          name: 'storage',
          tiles: [{ q: 0, r: 0 }],
          tags: ['grain', 'supplies'],
        },
      ],
      tags: ['agricultural', 'new_economy', 'hope'],
      importance: 4,
    },
  ];
