/**
 * Assemblage Library - Industrial and Camps
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

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

