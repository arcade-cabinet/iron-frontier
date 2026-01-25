/**
 * Assemblage Library - Reusable building blocks for town generation
 *
 * Each assemblage is a validated, self-contained spatial unit that can be
 * placed in any location. Subagents can generate locations by composing
 * assemblages from this library.
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

// ============================================================================
// TAVERNS & SOCIAL
// ============================================================================

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

// ============================================================================
// CIVIC
// ============================================================================

export const SheriffOffice: Assemblage = validateAssemblage({
  id: 'asm_sheriff_01',
  name: 'Sheriff Office',
  description: 'Law enforcement with jail cells',
  tags: ['civic', 'law', 'important', 'western'],
  primarySlot: 'law_office',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'office_building', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' }, // Jail cell area
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'front_door',
      offset: { q: 1, r: 0 },
      facing: 0,
      tags: ['main', 'public'],
    },
    { type: 'desk', name: 'sheriff_desk', offset: { q: 0, r: 0 }, tags: ['work', 'important'] },
    { type: 'cell', name: 'jail_cell_1', offset: { q: 0, r: 1 }, tags: ['prisoner', 'secure'] },
    {
      type: 'storage',
      name: 'evidence_locker',
      offset: { q: -1, r: 0 },
      tags: ['secure', 'evidence'],
    },
    {
      type: 'spawn_point',
      name: 'sheriff',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['npc', 'law', 'important'],
    },
    {
      type: 'spawn_point',
      name: 'deputy',
      offset: { q: 1, r: 0 },
      facing: 3,
      tags: ['npc', 'law'],
    },
    {
      type: 'conversation_spot',
      name: 'bounty_board',
      offset: { q: 1, r: 0 },
      tags: ['quest', 'bounties'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'office',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ],
      tags: [],
    },
    {
      type: 'restricted_area',
      name: 'jail',
      tiles: [{ q: 0, r: 1 }],
      priority: 1,
      tags: ['secure'],
    },
    {
      type: 'restricted_area',
      name: 'evidence',
      tiles: [{ q: -1, r: 0 }],
      priority: 1,
      tags: ['secure'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
  requiresRoadAccess: true,
});

export const Church: Assemblage = validateAssemblage({
  id: 'asm_church_01',
  name: 'Frontier Church',
  description: 'Place of worship and sanctuary',
  tags: ['civic', 'religious', 'sanctuary', 'western'],
  primarySlot: 'church',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'grass', structure: 'church_building', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' }, // Path
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'none' }, // Graveyard
  ],

  markers: [
    { type: 'entrance', name: 'front_door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    {
      type: 'altar',
      name: 'altar',
      offset: { q: 0, r: 0 },
      facing: 3,
      tags: ['religious', 'important'],
    },
    { type: 'spawn_point', name: 'preacher', offset: { q: 0, r: 0 }, tags: ['npc', 'religious'] },
    {
      type: 'conversation_spot',
      name: 'confessional',
      offset: { q: -1, r: 0 },
      tags: ['private', 'quest'],
    },
    {
      type: 'hiding_spot',
      name: 'bell_tower',
      offset: { q: 0, r: 0 },
      tags: ['elevated', 'vantage'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'nave',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ],
      tags: ['sanctuary'],
    },
    { type: 'event_stage', name: 'service_area', tiles: [{ q: 0, r: 0 }], tags: ['ceremony'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'badlands'],
});

export const TrainStation: Assemblage = validateAssemblage({
  id: 'asm_train_station_01',
  name: 'Train Depot',
  description: 'Railroad station with platform',
  tags: ['civic', 'transport', 'important', 'western'],
  primarySlot: 'train_station',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'station_building', structureRotation: 0 },
    {
      coord: { q: 1, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'none', 'none', 'railroad'],
    },
    {
      coord: { q: 2, r: 0 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', structure: 'water_tower', structureRotation: 0 },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' }, // Cargo area
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'platform',
      offset: { q: 1, r: 0 },
      facing: 0,
      tags: ['main', 'travel'],
    },
    { type: 'counter', name: 'ticket_window', offset: { q: 0, r: 0 }, tags: ['service', 'travel'] },
    { type: 'storage', name: 'cargo_area', offset: { q: 0, r: 1 }, tags: ['freight'] },
    { type: 'spawn_point', name: 'station_master', offset: { q: 0, r: 0 }, tags: ['npc', 'staff'] },
    {
      type: 'spawn_point',
      name: 'traveler_spawn',
      offset: { q: 1, r: 0 },
      tags: ['npc', 'transient'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'platform',
      tiles: [
        { q: 1, r: 0 },
        { q: 2, r: 0 },
      ],
      tags: ['travel'],
    },
    { type: 'loot_area', name: 'cargo', tiles: [{ q: 0, r: 1 }], tags: ['containers'] },
  ],

  validRotations: [0, 3], // Only 180-degree rotations for railroad alignment
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

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

export const MineEntrance: Assemblage = validateAssemblage({
  id: 'asm_mine_01',
  name: 'Mine Entrance',
  description: 'Mining operation entrance',
  tags: ['industrial', 'mining', 'resource', 'western'],
  primarySlot: 'mine',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'mine_building', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'stone_rocks', feature: 'ore_vein' },
    { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'rock_large' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'mine_shaft',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['main', 'dungeon_entrance'],
    },
    { type: 'storage', name: 'ore_pile', offset: { q: 1, r: 0 }, tags: ['resources'] },
    { type: 'workbench', name: 'equipment', offset: { q: -1, r: 0 }, tags: ['tools'] },
    { type: 'spawn_point', name: 'foreman', offset: { q: 1, r: 0 }, tags: ['npc', 'worker'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'work_area',
      tiles: [
        { q: 1, r: 0 },
        { q: 0, r: -1 },
      ],
      tags: [],
    },
    { type: 'loot_area', name: 'ore_storage', tiles: [{ q: 0, r: 1 }], tags: ['resources'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  requiredTerrain: ['stone', 'stone_hill', 'stone_rocks', 'badlands'],
});

// ============================================================================
// CAMPS & WILDERNESS
// ============================================================================

export const Campfire: Assemblage = validateAssemblage({
  id: 'asm_campfire_01',
  name: 'Campfire',
  description: 'Simple campfire with seating',
  tags: ['camp', 'wilderness', 'small', 'temporary'],
  primarySlot: 'camp',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', feature: 'campfire_pit' },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'spawn_point', name: 'camper_1', offset: { q: 1, r: 0 }, tags: ['npc', 'traveler'] },
    { type: 'spawn_point', name: 'camper_2', offset: { q: 0, r: 1 }, tags: ['npc', 'traveler'] },
    {
      type: 'conversation_spot',
      name: 'fireside',
      offset: { q: 0, r: 0 },
      tags: ['dialogue', 'rest'],
    },
    { type: 'rest_spot', name: 'bedroll_area', offset: { q: -1, r: 1 }, tags: ['rest'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'campsite',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 1 },
      ],
      tags: [],
    },
    { type: 'loot_area', name: 'supplies', tiles: [{ q: -1, r: 1 }], tags: ['low_value'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

export const TentCamp: Assemblage = validateAssemblage({
  id: 'asm_tent_camp_01',
  name: 'Tent Camp',
  description: 'Small tent encampment',
  tags: ['camp', 'wilderness', 'temporary'],
  primarySlot: 'camp',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'grass', structure: 'cabin', structureRotation: 0 }, // Using cabin as tent placeholder
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'campfire_pit' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'rock_small' },
  ],

  markers: [
    { type: 'entrance', name: 'tent_flap', offset: { q: 0, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'spawn_point', name: 'occupant', offset: { q: 0, r: 0 }, tags: ['npc', 'traveler'] },
    { type: 'storage', name: 'supplies', offset: { q: 0, r: 1 }, tags: ['personal'] },
    { type: 'conversation_spot', name: 'fireside', offset: { q: 1, r: 0 }, tags: ['dialogue'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'campsite',
      tiles: [
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 1 },
      ],
      tags: [],
    },
    { type: 'restricted_area', name: 'tent_interior', tiles: [{ q: 0, r: 0 }], tags: ['private'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

export const BanditCamp: Assemblage = validateAssemblage({
  id: 'asm_bandit_camp_01',
  name: 'Bandit Hideout',
  description: 'Outlaw encampment with lookout',
  tags: ['camp', 'hostile', 'dangerous'],
  primarySlot: 'hideout',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'campfire_pit' },
    { coord: { q: 2, r: 0 }, terrain: 'stone', feature: 'rock_large' }, // Lookout rock
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'boulder' },
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'tree' },
  ],

  markers: [
    {
      type: 'entrance',
      name: 'hideout_entrance',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['main'],
    },
    {
      type: 'spawn_point',
      name: 'bandit_leader',
      offset: { q: 0, r: 0 },
      tags: ['npc', 'hostile', 'leader'],
    },
    { type: 'spawn_point', name: 'bandit_1', offset: { q: 1, r: 0 }, tags: ['npc', 'hostile'] },
    {
      type: 'spawn_point',
      name: 'lookout',
      offset: { q: 2, r: 0 },
      tags: ['npc', 'hostile', 'sniper'],
    },
    { type: 'storage', name: 'loot_stash', offset: { q: -1, r: 0 }, tags: ['valuables', 'hidden'] },
    { type: 'hiding_spot', name: 'behind_rock', offset: { q: -1, r: 0 }, tags: ['cover'] },
  ],

  zones: [
    {
      type: 'restricted_area',
      name: 'camp',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
      ],
      priority: 1,
      tags: ['hostile'],
    },
    { type: 'loot_area', name: 'stash', tiles: [{ q: -1, r: 0 }], tags: ['high_value', 'hidden'] },
    {
      type: 'combat_zone',
      name: 'ambush_area',
      tiles: [
        { q: 0, r: 1 },
        { q: 2, r: 0 },
      ],
      tags: ['dangerous'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

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

// ============================================================================
// NATURAL FEATURES
// ============================================================================

export const Oasis: Assemblage = validateAssemblage({
  id: 'asm_oasis_01',
  name: 'Desert Oasis',
  description: 'Water source in the desert',
  tags: ['natural', 'water', 'rest', 'valuable'],
  primarySlot: 'water_source',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'water_shallow', feature: 'spring' },
    { coord: { q: 1, r: 0 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: -1, r: 0 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 0, r: -1 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 1, r: 1 }, terrain: 'sand', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'sand', feature: 'none' },
  ],

  markers: [
    { type: 'rest_spot', name: 'water_edge', offset: { q: 0, r: 1 }, tags: ['rest', 'water'] },
    { type: 'spawn_point', name: 'wildlife', offset: { q: 1, r: 0 }, tags: ['animal', 'random'] },
    {
      type: 'conversation_spot',
      name: 'shade',
      offset: { q: -1, r: 0 },
      tags: ['rest', 'dialogue'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'oasis',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: -1, r: 0 },
        { q: 0, r: 1 },
        { q: 0, r: -1 },
      ],
      tags: ['safe', 'water'],
    },
    {
      type: 'npc_area',
      name: 'wildlife_area',
      tiles: [
        { q: 1, r: 0 },
        { q: -1, r: 0 },
      ],
      tags: ['animals'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  requiredTerrain: ['sand', 'sand_hill', 'sand_dunes'],
});

export const RockFormation: Assemblage = validateAssemblage({
  id: 'asm_rocks_01',
  name: 'Rock Formation',
  description: 'Natural rock outcropping',
  tags: ['natural', 'landmark', 'cover'],
  primarySlot: 'landmark',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'rock_large' },
    { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'rock_small' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    {
      type: 'hiding_spot',
      name: 'behind_boulder',
      offset: { q: 0, r: 0 },
      tags: ['cover', 'ambush'],
    },
    { type: 'hiding_spot', name: 'rock_shadow', offset: { q: 1, r: 0 }, tags: ['cover'] },
    {
      type: 'vantage_point',
      name: 'rock_top',
      offset: { q: 0, r: 0 },
      tags: ['elevated', 'lookout'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'rocks',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 1 },
      ],
      tags: ['cover'],
    },
    {
      type: 'combat_zone',
      name: 'ambush_spot',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ],
      tags: ['tactical'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

export const CanyonPass: Assemblage = validateAssemblage({
  id: 'asm_canyon_01',
  name: 'Canyon Pass',
  description: 'Narrow passage through canyon walls',
  tags: ['natural', 'passage', 'dangerous', 'landmark'],
  primarySlot: 'landmark',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'canyon', feature: 'none' }, // Path
    { coord: { q: 1, r: 0 }, terrain: 'canyon', feature: 'none' }, // Path
    { coord: { q: 2, r: 0 }, terrain: 'canyon', feature: 'none' }, // Path
    { coord: { q: 0, r: -1 }, terrain: 'stone_mountain', feature: 'none' }, // Wall
    { coord: { q: 1, r: -1 }, terrain: 'stone_mountain', feature: 'none' }, // Wall
    { coord: { q: 0, r: 1 }, terrain: 'stone_mountain', feature: 'none' }, // Wall
    { coord: { q: 1, r: 1 }, terrain: 'stone_mountain', feature: 'none' }, // Wall
  ],

  markers: [
    {
      type: 'entrance',
      name: 'west_entrance',
      offset: { q: 0, r: 0 },
      facing: 3,
      tags: ['passage'],
    },
    {
      type: 'entrance',
      name: 'east_entrance',
      offset: { q: 2, r: 0 },
      facing: 0,
      tags: ['passage'],
    },
    {
      type: 'spawn_point',
      name: 'ambush_point',
      offset: { q: 1, r: 0 },
      tags: ['encounter', 'ambush'],
    },
    {
      type: 'vantage_point',
      name: 'cliff_ledge',
      offset: { q: 1, r: -1 },
      tags: ['sniper', 'elevated'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'pass',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 },
      ],
      tags: ['passage'],
    },
    {
      type: 'combat_zone',
      name: 'kill_zone',
      tiles: [{ q: 1, r: 0 }],
      tags: ['ambush', 'dangerous'],
    },
  ],

  validRotations: [0, 3], // Only horizontal orientations
  requiredTerrain: ['canyon', 'badlands', 'stone_mountain'],
});

// ============================================================================
// OUTPOSTS & WAYPOINTS
// ============================================================================

export const Waystation: Assemblage = validateAssemblage({
  id: 'asm_waystation_01',
  name: 'Trail Waystation',
  description: 'Rest stop along trails',
  tags: ['outpost', 'rest', 'commerce'],
  primarySlot: 'waystation',

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', structure: 'stable', structureRotation: 0 },
    { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'door', offset: { q: 0, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'spawn_point', name: 'keeper', offset: { q: 0, r: 0 }, tags: ['npc', 'merchant'] },
    {
      type: 'counter',
      name: 'service_counter',
      offset: { q: 0, r: 0 },
      tags: ['service', 'rest', 'supplies'],
    },
    { type: 'rest_spot', name: 'bed', offset: { q: 0, r: 0 }, tags: ['rest', 'paid'] },
    { type: 'storage', name: 'horse_post', offset: { q: -1, r: 0 }, tags: ['mounts'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'yard',
      tiles: [
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: 0, r: -1 },
      ],
      tags: [],
    },
    { type: 'npc_area', name: 'stable', tiles: [{ q: -1, r: 0 }], tags: ['animals'] },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
  requiresRoadAccess: true,
});

export const TelegraphPost: Assemblage = validateAssemblage({
  id: 'asm_telegraph_01',
  name: 'Telegraph Post',
  description: 'Communication relay station',
  tags: ['outpost', 'communication', 'small'],
  primarySlot: 'telegraph',

  tiles: [
    {
      coord: { q: 0, r: 0 },
      terrain: 'dirt',
      structure: 'telegraph_building',
      structureRotation: 0,
    },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'spawn_point', name: 'operator', offset: { q: 0, r: 0 }, tags: ['npc', 'staff'] },
    {
      type: 'counter',
      name: 'service_desk',
      offset: { q: 0, r: 0 },
      tags: ['service', 'communication'],
    },
    {
      type: 'evidence_spot',
      name: 'message_log',
      offset: { q: 0, r: 0 },
      tags: ['clue', 'information'],
    },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'office',
      tiles: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ],
      tags: [],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
});

// ============================================================================
// LIBRARY EXPORTS
// ============================================================================

export const ASSEMBLAGE_LIBRARY: Assemblage[] = [
  // Taverns
  Saloon,
  SmallTavern,
  // Commerce
  GeneralStore,
  Gunsmith,
  Bank,
  // Civic
  SheriffOffice,
  Church,
  TrainStation,
  // Residential
  Cabin,
  House,
  Mansion,
  // Infrastructure
  Well,
  Stable,
  // Industrial
  MineEntrance,
  // Camps
  Campfire,
  TentCamp,
  BanditCamp,
  // Farms
  SmallFarm,
  CattleRanch,
  // Ruins
  AbandonedCabin,
  GhostTown,
  // Natural Features
  Oasis,
  RockFormation,
  CanyonPass,
  // Outposts
  Waystation,
  TelegraphPost,
];

/** Map for quick lookup by ID */
export const ASSEMBLAGES_BY_ID = new Map<string, Assemblage>(
  ASSEMBLAGE_LIBRARY.map((a) => [a.id, a])
);

/** Get assemblages by slot type */
export function getAssemblagesBySlot(slotType: string): Assemblage[] {
  return ASSEMBLAGE_LIBRARY.filter((a) => a.primarySlot === slotType);
}

/** Get assemblages by tag */
export function getAssemblagesByTag(tag: string): Assemblage[] {
  return ASSEMBLAGE_LIBRARY.filter((a) => a.tags.includes(tag));
}
