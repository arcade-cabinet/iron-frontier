/**
 * Assemblage Library - Civic and Public
 */

import { type Assemblage, validateAssemblage } from '../schemas/spatial';

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

