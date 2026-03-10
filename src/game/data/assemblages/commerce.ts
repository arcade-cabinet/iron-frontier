/**
 * Assemblage Library - Commerce
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

// ============================================================================
// COMMERCE
// ============================================================================

export const GeneralStore: Assemblage = validateAssemblage({
  id: 'asm_general_store_01',
  name: 'General Store',
  description: 'Trading post with goods and storage',
  tags: ['commerce', 'essential', 'western'],
  primarySlot: 'general_store',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'store_building', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' }, // Entrance
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' }, // Storage
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'front_door',
      offset: { q: 1, r: 0 },
      facing: 0,
      tags: ['main', 'public'],
    },
    { type: 'counter', name: 'shop_counter', offset: { q: 0, r: 0 }, tags: ['service', 'trade'] },
    { type: 'display', name: 'goods_display', offset: { q: 0, r: 1 }, tags: ['merchandise'] },
    {
      type: 'storage',
      name: 'back_storage',
      offset: { q: -1, r: 0 },
      tags: ['inventory', 'private'],
    },
    {
      type: 'spawn_point',
      name: 'shopkeeper',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['npc', 'merchant'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'shop_floor',
      tiles: [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 0 },
      ],
      tags: [],
    },
    {
      type: 'loot_area',
      name: 'storage',
      tiles: [{ q: -1, r: 0 }],
      tags: ['containers', 'valuables'],
    },
    {
      type: 'restricted_area',
      name: 'back_room',
      tiles: [{ q: -1, r: 0 }],
      priority: 1,
      tags: ['private'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
  requiresRoadAccess: true,
});

export const Gunsmith: Assemblage = validateAssemblage({
  id: 'asm_gunsmith_01',
  name: 'Gunsmith Shop',
  description: 'Weapons dealer and repair',
  tags: ['commerce', 'weapons', 'western'],
  primarySlot: 'gunsmith',

  tiles: [
    {
      coord: { q: 0, r: 0 },
      terrain: 'dirt',
      structure: 'workshop_building',
      structureRotation: 0,
    },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'counter', name: 'gun_counter', offset: { q: 0, r: 0 }, tags: ['service', 'weapons'] },
    {
      type: 'display',
      name: 'weapon_rack',
      offset: { q: 0, r: 1 },
      tags: ['merchandise', 'weapons'],
    },
    { type: 'workbench', name: 'repair_bench', offset: { q: 0, r: 0 }, tags: ['crafting'] },
    { type: 'spawn_point', name: 'gunsmith', offset: { q: 0, r: 0 }, tags: ['npc', 'merchant'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'shop',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ],
      tags: [],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
  requiresRoadAccess: true,
});

export const Bank: Assemblage = validateAssemblage({
  id: 'asm_bank_01',
  name: 'Frontier Bank',
  description: 'Secure bank with vault',
  tags: ['commerce', 'finance', 'secure', 'western'],
  primarySlot: 'bank',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'bank_building', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' }, // Vault area
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'front_door',
      offset: { q: 1, r: 0 },
      facing: 0,
      tags: ['main', 'guarded'],
    },
    {
      type: 'counter',
      name: 'teller_window',
      offset: { q: 0, r: 0 },
      tags: ['service', 'finance'],
    },
    { type: 'vault', name: 'bank_vault', offset: { q: -1, r: 0 }, tags: ['secure', 'valuables'] },
    { type: 'desk', name: 'manager_desk', offset: { q: 0, r: -1 }, tags: ['private', 'important'] },
    { type: 'spawn_point', name: 'teller', offset: { q: 0, r: 0 }, tags: ['npc', 'staff'] },
    {
      type: 'spawn_point',
      name: 'guard',
      offset: { q: 1, r: 0 },
      facing: 3,
      tags: ['npc', 'security'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'lobby',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
      ],
      tags: [],
    },
    {
      type: 'restricted_area',
      name: 'vault_room',
      tiles: [{ q: -1, r: 0 }],
      priority: 2,
      tags: ['secure'],
    },
    { type: 'loot_area', name: 'vault_interior', tiles: [{ q: -1, r: 0 }], tags: ['high_value'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
  requiresRoadAccess: true,
});

