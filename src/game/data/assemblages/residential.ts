/**
 * Assemblage Library - Residential and Infrastructure
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

// ============================================================================
// RESIDENTIAL
// ============================================================================

export const Cabin: Assemblage = validateAssemblage({
  id: 'asm_cabin_01',
  name: 'Frontier Cabin',
  description: 'Simple wooden dwelling',
  tags: ['residential', 'poor', 'small', 'western'],
  primarySlot: 'residence',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'bed', name: 'bed', offset: { q: 0, r: 0 }, tags: ['rest'] },
    { type: 'storage', name: 'chest', offset: { q: 0, r: 0 }, tags: ['personal'] },
    { type: 'spawn_point', name: 'resident', offset: { q: 0, r: 0 }, tags: ['npc', 'civilian'] },
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
    { type: 'restricted_area', name: 'interior', tiles: [{ q: 0, r: 0 }], tags: ['private'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

export const House: Assemblage = validateAssemblage({
  id: 'asm_house_01',
  name: 'Town House',
  description: 'Modest family dwelling',
  tags: ['residential', 'middle_class', 'western'],
  primarySlot: 'residence',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'house', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'front_door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    {
      type: 'entrance',
      name: 'back_door',
      offset: { q: -1, r: 0 },
      facing: 3,
      tags: ['secondary'],
    },
    { type: 'bed', name: 'bedroom', offset: { q: 0, r: 0 }, tags: ['rest'] },
    { type: 'storage', name: 'wardrobe', offset: { q: 0, r: 0 }, tags: ['personal'] },
    { type: 'spawn_point', name: 'resident', offset: { q: 0, r: 0 }, tags: ['npc', 'civilian'] },
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
    { type: 'restricted_area', name: 'interior', tiles: [{ q: 0, r: 0 }], tags: ['private'] },
    { type: 'loot_area', name: 'home_goods', tiles: [{ q: 0, r: 0 }], tags: ['low_value'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

export const Mansion: Assemblage = validateAssemblage({
  id: 'asm_mansion_01',
  name: 'Ranch Mansion',
  description: 'Wealthy estate home',
  tags: ['residential', 'wealthy', 'large', 'western'],
  primarySlot: 'residence_wealthy',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'mansion', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 2, r: 0 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'tree' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'front_door',
      offset: { q: 1, r: 0 },
      facing: 0,
      tags: ['main', 'grand'],
    },
    {
      type: 'entrance',
      name: 'servants_entrance',
      offset: { q: -1, r: 0 },
      facing: 3,
      tags: ['service'],
    },
    { type: 'desk', name: 'study', offset: { q: 0, r: 0 }, tags: ['work', 'important'] },
    { type: 'bed', name: 'master_bedroom', offset: { q: 0, r: 0 }, tags: ['rest', 'luxury'] },
    { type: 'vault', name: 'safe', offset: { q: 0, r: 0 }, tags: ['secure', 'valuables'] },
    {
      type: 'spawn_point',
      name: 'owner',
      offset: { q: 0, r: 0 },
      tags: ['npc', 'wealthy', 'important'],
    },
    { type: 'spawn_point', name: 'servant', offset: { q: -1, r: 0 }, tags: ['npc', 'staff'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'grounds',
      tiles: [
        { q: 1, r: 0 },
        { q: 2, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 1 },
      ],
      tags: ['garden'],
    },
    {
      type: 'restricted_area',
      name: 'interior',
      tiles: [{ q: 0, r: 0 }],
      priority: 1,
      tags: ['private'],
    },
    { type: 'loot_area', name: 'valuables', tiles: [{ q: 0, r: 0 }], tags: ['high_value'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'badlands'],
});

// ============================================================================
// INFRASTRUCTURE
// ============================================================================

export const Well: Assemblage = validateAssemblage({
  id: 'asm_well_01',
  name: 'Town Well',
  description: 'Central water source and gathering spot',
  tags: ['infrastructure', 'gathering', 'small', 'western'],
  primarySlot: 'meeting_point',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'well', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'spawn_point',
      name: 'gathering_spot',
      offset: { q: 0, r: 1 },
      tags: ['npc', 'social'],
    },
    {
      type: 'conversation_spot',
      name: 'gossip_spot',
      offset: { q: 1, r: 0 },
      tags: ['dialogue', 'rumors'],
    },
  ],

  zones: [
    {
      type: 'npc_area',
      name: 'loitering',
      tiles: [
        { q: 1, r: 0 },
        { q: -1, r: 0 },
        { q: 0, r: 1 },
        { q: 0, r: -1 },
      ],
      tags: ['social'],
    },
    {
      type: 'public_area',
      name: 'plaza',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: -1, r: 0 },
        { q: 0, r: 1 },
        { q: 0, r: -1 },
      ],
      tags: [],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

export const Stable: Assemblage = validateAssemblage({
  id: 'asm_stable_01',
  name: 'Livery Stable',
  description: 'Horse boarding and sales',
  tags: ['infrastructure', 'mounts', 'western'],
  primarySlot: 'stable',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'stable', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none' }, // Paddock
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'main_door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'spawn_point', name: 'stablehand', offset: { q: 0, r: 0 }, tags: ['npc', 'merchant'] },
    { type: 'storage', name: 'tack_room', offset: { q: -1, r: 0 }, tags: ['equipment'] },
  ],

  zones: [
    { type: 'public_area', name: 'yard', tiles: [{ q: 1, r: 0 }], tags: [] },
    {
      type: 'npc_area',
      name: 'paddock',
      tiles: [
        { q: 0, r: 1 },
        { q: 1, r: 1 },
      ],
      tags: ['animals'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

// ============================================================================
// INDUSTRIAL
// ============================================================================

