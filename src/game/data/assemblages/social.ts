/**
 * Assemblage Library - Taverns and Social
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

export const Saloon: Assemblage = validateAssemblage({
  id: 'asm_saloon_01',
  name: 'Desert Saloon',
  description: 'Two-story saloon with bar, stage, and back rooms',
  tags: ['social', 'commerce', 'two_story', 'western'],
  primarySlot: 'tavern',
  secondarySlots: [],

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'saloon_building', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' }, // Front porch
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' }, // Back area
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'front_door',
      offset: { q: 1, r: 0 },
      facing: 0,
      tags: ['main', 'public'],
    },
    {
      type: 'exit',
      name: 'back_door',
      offset: { q: -1, r: 0 },
      facing: 3,
      tags: ['service', 'escape'],
    },
    {
      type: 'counter',
      name: 'bar_counter',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['service', 'drinks'],
    },
    { type: 'table', name: 'corner_table', offset: { q: 0, r: -1 }, tags: ['seating', 'private'] },
    { type: 'table', name: 'center_table', offset: { q: 0, r: 1 }, tags: ['seating', 'public'] },
    {
      type: 'stage',
      name: 'performance_stage',
      offset: { q: -1, r: 1 },
      facing: 0,
      tags: ['entertainment'],
    },
    {
      type: 'spawn_point',
      name: 'bartender',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['npc', 'staff'],
    },
    { type: 'spawn_point', name: 'patron_1', offset: { q: 0, r: 1 }, tags: ['npc', 'patron'] },
    {
      type: 'conversation_spot',
      name: 'private_booth',
      offset: { q: 0, r: -1 },
      tags: ['quest', 'private'],
    },
    {
      type: 'evidence_spot',
      name: 'behind_bar',
      offset: { q: -1, r: 0 },
      tags: ['hidden', 'clue'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'main_floor',
      tiles: [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 0 },
      ],
      tags: ['social'],
    },
    {
      type: 'restricted_area',
      name: 'staff_area',
      tiles: [{ q: -1, r: 0 }],
      priority: 1,
      tags: ['staff_only'],
    },
    {
      type: 'npc_area',
      name: 'patron_zone',
      tiles: [
        { q: 0, r: 1 },
        { q: 0, r: -1 },
      ],
      tags: ['patrons'],
    },
    {
      type: 'event_stage',
      name: 'brawl_zone',
      tiles: [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
      ],
      tags: ['combat'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
  requiresRoadAccess: true,
});

export const SmallTavern: Assemblage = validateAssemblage({
  id: 'asm_tavern_small_01',
  name: 'Frontier Shack',
  description: 'Simple one-room drinking establishment',
  tags: ['social', 'poor', 'small', 'western'],
  primarySlot: 'tavern',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'counter', name: 'bar', offset: { q: 0, r: 0 }, tags: ['service'] },
    { type: 'spawn_point', name: 'barkeep', offset: { q: 0, r: 0 }, tags: ['npc', 'staff'] },
    { type: 'table', name: 'table', offset: { q: 0, r: 1 }, tags: ['seating'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'interior',
      tiles: [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
      ],
      tags: [],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

