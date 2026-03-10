/**
 * Assemblage Library - Natural Features and Outposts
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

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
