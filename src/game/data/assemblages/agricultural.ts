/**
 * Assemblage Library - Agricultural and Ruins
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

// ============================================================================
// FARMS & RANCHES
// ============================================================================

export const SmallFarm: Assemblage = validateAssemblage({
  id: 'asm_farm_small_01',
  name: 'Homestead Farm',
  description: 'Small family farm',
  tags: ['farm', 'rural', 'production'],
  primarySlot: 'farm',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 }, // Farmhouse
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 2, r: 0 }, terrain: 'grass', feature: 'none' }, // Field
    { coord: { q: 2, r: 1 }, terrain: 'grass', feature: 'none' }, // Field
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'none' }, // Field
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', structure: 'stable', structureRotation: 0 }, // Barn
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'tree' },
  ],

  markers: [
    { type: 'entrance', name: 'farmhouse_door', offset: { q: 0, r: 0 }, facing: 0, tags: ['main'] },
    {
      type: 'entrance',
      name: 'barn_door',
      offset: { q: -1, r: 0 },
      facing: 0,
      tags: ['secondary'],
    },
    { type: 'spawn_point', name: 'farmer', offset: { q: 1, r: 0 }, tags: ['npc', 'farmer'] },
    { type: 'spawn_point', name: 'farmhand', offset: { q: 2, r: 0 }, tags: ['npc', 'worker'] },
    {
      type: 'storage',
      name: 'barn_storage',
      offset: { q: -1, r: 0 },
      tags: ['supplies', 'animals'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'yard',
      tiles: [
        { q: 1, r: 0 },
        { q: 0, r: 1 },
      ],
      tags: [],
    },
    {
      type: 'npc_area',
      name: 'fields',
      tiles: [
        { q: 2, r: 0 },
        { q: 2, r: 1 },
        { q: 1, r: 1 },
      ],
      tags: ['work'],
    },
    { type: 'restricted_area', name: 'farmhouse', tiles: [{ q: 0, r: 0 }], tags: ['private'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain', 'badlands'],
});

export const CattleRanch: Assemblage = validateAssemblage({
  id: 'asm_ranch_01',
  name: 'Cattle Ranch',
  description: 'Large cattle operation',
  tags: ['ranch', 'rural', 'large', 'production'],
  primarySlot: 'ranch',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'house', structureRotation: 0 }, // Ranch house
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 2, r: 0 }, terrain: 'dirt', structure: 'stable', structureRotation: 0 }, // Main barn
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'none' }, // Pasture
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none' }, // Pasture
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'none' }, // Pasture
    { coord: { q: 2, r: 1 }, terrain: 'grass', feature: 'none' }, // Pasture
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 }, // Bunkhouse
  ],

  markers: [
    { type: 'entrance', name: 'ranch_gate', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'entrance', name: 'house_door', offset: { q: 0, r: 0 }, facing: 0, tags: ['private'] },
    {
      type: 'spawn_point',
      name: 'rancher',
      offset: { q: 0, r: 0 },
      tags: ['npc', 'owner', 'important'],
    },
    { type: 'spawn_point', name: 'cowboy_1', offset: { q: 1, r: -1 }, tags: ['npc', 'worker'] },
    { type: 'spawn_point', name: 'cowboy_2', offset: { q: 2, r: 0 }, tags: ['npc', 'worker'] },
    { type: 'storage', name: 'tack_room', offset: { q: 2, r: 0 }, tags: ['equipment'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'yard',
      tiles: [
        { q: 1, r: 0 },
        { q: 0, r: -1 },
      ],
      tags: [],
    },
    {
      type: 'npc_area',
      name: 'pasture',
      tiles: [
        { q: -1, r: 1 },
        { q: 0, r: 1 },
        { q: 1, r: 1 },
        { q: 2, r: 1 },
      ],
      tags: ['animals'],
    },
    {
      type: 'restricted_area',
      name: 'ranch_house',
      tiles: [{ q: 0, r: 0 }],
      priority: 1,
      tags: ['private'],
    },
    { type: 'loot_area', name: 'valuables', tiles: [{ q: 0, r: 0 }], tags: ['medium_value'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

// ============================================================================
// RUINS & ABANDONED
// ============================================================================

export const AbandonedCabin: Assemblage = validateAssemblage({
  id: 'asm_ruins_cabin_01',
  name: 'Abandoned Cabin',
  description: 'Derelict cabin, possibly shelter',
  tags: ['ruins', 'abandoned', 'shelter'],
  primarySlot: 'ruins',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 }, // Ruined cabin
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'tree_dead' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'bush' },
  ],

  markers: [
    { type: 'entrance', name: 'doorway', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'storage', name: 'hidden_cache', offset: { q: 0, r: 0 }, tags: ['hidden', 'loot'] },
    { type: 'hiding_spot', name: 'corner', offset: { q: 0, r: 0 }, tags: ['cover'] },
    { type: 'rest_spot', name: 'floor', offset: { q: 0, r: 0 }, tags: ['rest', 'unsafe'] },
    { type: 'evidence_spot', name: 'old_diary', offset: { q: 0, r: 0 }, tags: ['clue', 'story'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'exterior',
      tiles: [
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 0 },
      ],
      tags: [],
    },
    { type: 'loot_area', name: 'interior', tiles: [{ q: 0, r: 0 }], tags: ['low_value', 'hidden'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

export const GhostTown: Assemblage = validateAssemblage({
  id: 'asm_ghost_town_01',
  name: 'Ghost Town Ruins',
  description: 'Remnants of abandoned settlement',
  tags: ['ruins', 'abandoned', 'large', 'mysterious'],
  primarySlot: 'ruins',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 }, // Ruined building
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'ruins' },
    { coord: { q: 2, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 2 },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'rock_large' },
    { coord: { q: 1, r: 1 }, terrain: 'dirt', feature: 'none' }, // Main street
    { coord: { q: 2, r: 1 }, terrain: 'dirt', feature: 'ruins' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'tree_dead' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'main_street', offset: { q: 1, r: 1 }, facing: 0, tags: ['main'] },
    {
      type: 'spawn_point',
      name: 'ghost_spawn',
      offset: { q: 0, r: 0 },
      tags: ['npc', 'encounter', 'random'],
    },
    {
      type: 'storage',
      name: 'buried_treasure',
      offset: { q: 2, r: 1 },
      tags: ['hidden', 'valuables'],
    },
    { type: 'evidence_spot', name: 'old_sign', offset: { q: 1, r: 0 }, tags: ['clue', 'lore'] },
    { type: 'evidence_spot', name: 'grave', offset: { q: -1, r: 0 }, tags: ['clue', 'dark'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'ruins',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 1 },
        { q: 2, r: 1 },
      ],
      tags: ['dangerous'],
    },
    {
      type: 'loot_area',
      name: 'hidden_goods',
      tiles: [
        { q: 0, r: 0 },
        { q: 2, r: 0 },
        { q: 2, r: 1 },
      ],
      tags: ['medium_value'],
    },
    {
      type: 'event_stage',
      name: 'encounter_zone',
      tiles: [{ q: 1, r: 1 }],
      tags: ['random_encounter'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

