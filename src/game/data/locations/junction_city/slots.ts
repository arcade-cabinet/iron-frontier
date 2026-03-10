import type { SlotInstance } from '../../schemas/spatial.ts';

export const junction_citySlots: SlotInstance[] = [
    // Water Tower - Industrial scale
    {
      id: 'water_tower',
      type: 'landmark',
      name: 'Industrial Water Tower',
      anchor: { q: 44, r: 17 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'water_tower', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        {
          type: 'vantage_point',
          name: 'tower_top',
          offset: { q: 0, r: 0 },
          tags: ['elevated', 'sniper'],
        },
        { type: 'hiding_spot', name: 'tower_base', offset: { q: 0, r: 1 }, tags: ['cover'] },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'base',
          tiles: [
            { q: 1, r: 0 },
            { q: 0, r: 1 },
          ],
          tags: [],
        },
      ],
      tags: ['ivrc', 'industrial', 'landmark'],
      importance: 3,
    },

    // Coal Yard - Fuel storage
    {
      id: 'coal_yard',
      type: 'workshop',
      name: 'Coal Yard',
      anchor: { q: 6, r: 17 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 2, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'rock_large' }, // Coal pile
        { coord: { q: 1, r: 1 }, terrain: 'dirt', feature: 'rock_large' }, // Coal pile
        { coord: { q: 2, r: 1 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 2 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 1, r: 2 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'yard_gate', offset: { q: 2, r: 1 }, facing: 0, tags: ['main'] },
        {
          type: 'spawn_point',
          name: 'coal_worker',
          offset: { q: 1, r: 0 },
          tags: ['npc', 'worker'],
        },
        {
          type: 'storage',
          name: 'coal_pile',
          offset: { q: 0, r: 1 },
          tags: ['fuel', 'industrial'],
        },
        {
          type: 'evidence_spot',
          name: 'manifest',
          offset: { q: 2, r: 0 },
          tags: ['clue', 'documents'],
        },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'yard',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: 2, r: 0 },
          ],
          tags: [],
        },
        {
          type: 'loot_area',
          name: 'supplies',
          tiles: [
            { q: 0, r: 2 },
            { q: 1, r: 2 },
          ],
          tags: ['low_value'],
        },
      ],
      tags: ['ivrc', 'industrial', 'fuel'],
      importance: 3,
    },

    // Secondary Railyard area
    {
      id: 'railyard_east',
      type: 'workshop',
      name: 'Eastern Railyard',
      anchor: { q: 42, r: 17 },
      rotation: 0,
      tiles: [
        {
          coord: { q: 0, r: 0 },
          terrain: 'dirt',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 1, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        {
          type: 'spawn_point',
          name: 'yard_worker',
          offset: { q: 0, r: 1 },
          tags: ['npc', 'worker'],
        },
        { type: 'storage', name: 'tools', offset: { q: 1, r: 1 }, tags: ['equipment'] },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'yard',
          tiles: [
            { q: 0, r: 0 },
            { q: 0, r: 1 },
            { q: 1, r: 1 },
          ],
          tags: ['work'],
        },
      ],
      tags: ['ivrc', 'industrial'],
      importance: 2,
    },
  ];
