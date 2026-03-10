import type { SlotInstance } from '../../schemas/spatial.ts';

export const thornwood_stationSlots: SlotInstance[] = [
    {
      id: 'water_tower',
      type: 'landmark',
      name: 'Railroad Water Tower',
      anchor: { q: 10, r: 10 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'water_tower', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        {
          type: 'spawn_point',
          name: 'maintenance_worker',
          offset: { q: 1, r: 0 },
          tags: ['npc', 'worker', 'railroad'],
        },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'tower_area',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: 0, r: 1 },
          ],
          tags: ['railroad'],
        },
      ],
      tags: ['railroad', 'infrastructure', 'ivrc'],
      importance: 4,
    },
  ];
