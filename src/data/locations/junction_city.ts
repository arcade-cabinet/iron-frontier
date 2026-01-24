/**
 * Junction City - IVRC Railroad Headquarters
 *
 * The beating iron heart of the territories. A town built by the railroad,
 * for the railroad. The class divide is literal: north of the tracks live
 * the suits, south of the tracks live the workers who build their empire.
 *
 * "The Iron Valley Railroad Company thanks you for your patronage."
 */

import { Location, validateLocation } from '../schemas/spatial';

export const JunctionCity: Location = validateLocation({
  id: 'junction_city',
  name: 'Junction City',
  type: 'town',
  size: 'large',
  description:
    'Railroad company headquarters. Smokestacks and steam, brass and blood. ' +
    'Where the iron road begins and empires are built on the backs of working men.',
  lore:
    'Founded five years ago when Cornelius Thorne drove the golden spike himself. ' +
    'Every building, every deed, every soul here belongs to the Iron Valley Railroad Company. ' +
    "They don't call it a company town. They call it 'progress.'",

  seed: 18870701, // July 1, 1887 - founding date
  width: 50,
  height: 35,
  baseTerrain: 'dirt',

  assemblages: [
    // ========================================================================
    // RAILROAD INFRASTRUCTURE (Central E-W corridor)
    // ========================================================================

    // Grand Station - The crown jewel of IVRC, dominates the center
    {
      assemblageId: 'asm_train_station_01',
      instanceId: 'grand_station',
      anchor: { q: 25, r: 17 },
      rotation: 0,
      tags: ['ivrc', 'landmark', 'primary'],
      importance: 5,
    },

    // Telegraph Office - Communication hub, adjacent to station
    {
      assemblageId: 'asm_telegraph_01',
      instanceId: 'telegraph_office',
      anchor: { q: 20, r: 16 },
      rotation: 0,
      tags: ['ivrc', 'communication'],
      importance: 4,
    },

    // ========================================================================
    // NORTH SIDE - COMPANY DISTRICT (The Respectable Side)
    // ========================================================================

    // IVRC Headquarters - Imposing office building, restricted access
    {
      assemblageId: 'asm_mansion_01',
      instanceId: 'ivrc_headquarters',
      anchor: { q: 25, r: 8 },
      rotation: 0,
      slotTypeOverride: 'quest_location',
      tags: ['ivrc', 'corporate', 'restricted', 'important'],
      importance: 5,
    },

    // The Ironclad Hotel - Upscale lodging for company men
    {
      assemblageId: 'asm_house_01',
      instanceId: 'ironclad_hotel',
      anchor: { q: 32, r: 8 },
      rotation: 0,
      slotTypeOverride: 'hotel',
      tags: ['ivrc', 'wealthy', 'lodging'],
      importance: 4,
    },

    // Bank - IVRC-controlled financial institution
    {
      assemblageId: 'asm_bank_01',
      instanceId: 'company_bank',
      anchor: { q: 18, r: 8 },
      rotation: 0,
      tags: ['ivrc', 'finance', 'secure'],
      importance: 4,
    },

    // Company Store - IVRC-owned, inflated prices
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'company_store',
      anchor: { q: 38, r: 10 },
      rotation: 5,
      tags: ['ivrc', 'commerce', 'overpriced'],
      importance: 3,
    },

    // Pinkerton Office - IVRC security force
    {
      assemblageId: 'asm_sheriff_01',
      instanceId: 'pinkerton_office',
      anchor: { q: 12, r: 10 },
      rotation: 1,
      slotTypeOverride: 'law_office',
      tags: ['ivrc', 'security', 'enforcement', 'hostile'],
      importance: 4,
    },

    // Manager's Residence - Company housing for executives
    {
      assemblageId: 'asm_house_01',
      instanceId: 'manager_residence_1',
      anchor: { q: 40, r: 6 },
      rotation: 0,
      tags: ['ivrc', 'residential', 'wealthy'],
      importance: 2,
    },
    {
      assemblageId: 'asm_house_01',
      instanceId: 'manager_residence_2',
      anchor: { q: 45, r: 8 },
      rotation: 5,
      tags: ['ivrc', 'residential', 'wealthy'],
      importance: 2,
    },

    // ========================================================================
    // SOUTH SIDE - WORKERS' DISTRICT (The Other Side of the Tracks)
    // ========================================================================

    // The Brake House Saloon - Worker hangout, where rumors flow
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'brake_house_saloon',
      anchor: { q: 20, r: 26 },
      rotation: 0,
      tags: ['workers', 'social', 'rumors', 'copperhead_sympathy'],
      importance: 4,
    },

    // Workers' Barracks - Cramped company housing
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_1',
      anchor: { q: 10, r: 24 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_2',
      anchor: { q: 14, r: 26 },
      rotation: 1,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_3',
      anchor: { q: 10, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'barracks_4',
      anchor: { q: 14, r: 30 },
      rotation: 2,
      slotTypeOverride: 'residence_poor',
      tags: ['workers', 'residential', 'cramped'],
      importance: 2,
    },

    // Communal Well - Gathering spot for workers
    {
      assemblageId: 'asm_well_01',
      instanceId: 'workers_well',
      anchor: { q: 12, r: 26 },
      rotation: 0,
      tags: ['workers', 'social', 'gathering'],
      importance: 2,
    },

    // ========================================================================
    // RAILYARD (East of Grand Station)
    // ========================================================================

    // Roundhouse - Train maintenance
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'roundhouse',
      anchor: { q: 38, r: 17 },
      rotation: 0,
      slotTypeOverride: 'workshop',
      tags: ['ivrc', 'industrial', 'maintenance'],
      importance: 4,
    },

    // ========================================================================
    // WAREHOUSE DISTRICT (Southwest)
    // ========================================================================

    // Main warehouse
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'warehouse_1',
      anchor: { q: 30, r: 26 },
      rotation: 0,
      slotTypeOverride: 'hidden_cache',
      tags: ['ivrc', 'storage', 'cargo'],
      importance: 3,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'warehouse_2',
      anchor: { q: 34, r: 28 },
      rotation: 1,
      slotTypeOverride: 'hidden_cache',
      tags: ['ivrc', 'storage', 'cargo'],
      importance: 3,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'warehouse_3',
      anchor: { q: 38, r: 26 },
      rotation: 0,
      slotTypeOverride: 'hidden_cache',
      tags: ['ivrc', 'storage', 'cargo'],
      importance: 3,
    },

    // ========================================================================
    // INDUSTRIAL INFRASTRUCTURE
    // ========================================================================

    // Campfire area for yard workers
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'yard_workers_fire',
      anchor: { q: 42, r: 22 },
      rotation: 0,
      tags: ['workers', 'industrial'],
      importance: 1,
    },
  ],

  // ========================================================================
  // INLINE SLOT DEFINITIONS
  // For structures not covered by assemblages
  // ========================================================================
  slots: [
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
        { type: 'vantage_point', name: 'tower_top', offset: { q: 0, r: 0 }, tags: ['elevated', 'sniper'] },
        { type: 'hiding_spot', name: 'tower_base', offset: { q: 0, r: 1 }, tags: ['cover'] },
      ],
      zones: [
        { type: 'public_area', name: 'base', tiles: [{ q: 1, r: 0 }, { q: 0, r: 1 }], tags: [] },
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
        { type: 'spawn_point', name: 'coal_worker', offset: { q: 1, r: 0 }, tags: ['npc', 'worker'] },
        { type: 'storage', name: 'coal_pile', offset: { q: 0, r: 1 }, tags: ['fuel', 'industrial'] },
        { type: 'evidence_spot', name: 'manifest', offset: { q: 2, r: 0 }, tags: ['clue', 'documents'] },
      ],
      zones: [
        { type: 'public_area', name: 'yard', tiles: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }], tags: [] },
        { type: 'loot_area', name: 'supplies', tiles: [{ q: 0, r: 2 }, { q: 1, r: 2 }], tags: ['low_value'] },
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
        { coord: { q: 0, r: 0 }, terrain: 'dirt', feature: 'none', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 1, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'spawn_point', name: 'yard_worker', offset: { q: 0, r: 1 }, tags: ['npc', 'worker'] },
        { type: 'storage', name: 'tools', offset: { q: 1, r: 1 }, tags: ['equipment'] },
      ],
      zones: [
        { type: 'public_area', name: 'yard', tiles: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 }], tags: ['work'] },
      ],
      tags: ['ivrc', 'industrial'],
      importance: 2,
    },
  ],

  // ========================================================================
  // BASE TILES - Roads, Railroad Tracks, Terrain
  // ========================================================================
  baseTiles: [
    // ======================================================================
    // MAIN RAILROAD LINE (East-West through center, row 17)
    // ======================================================================
    // Western approach
    { coord: { q: 0, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 1, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 2, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 3, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 4, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 5, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    // Skip 6-8 for coal yard
    { coord: { q: 9, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 10, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 11, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 12, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 13, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 14, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 15, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 16, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 17, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 18, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 19, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 20, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 21, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 22, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 23, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 24, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    // Station area (25-27 handled by assemblage)
    { coord: { q: 28, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 29, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 30, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 31, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 32, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 33, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 34, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 35, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 36, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 37, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    // Roundhouse area (38-41)
    { coord: { q: 46, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 47, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 48, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 49, r: 17 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },

    // ======================================================================
    // SECONDARY SIDING (Railyard spur, slightly south)
    // ======================================================================
    { coord: { q: 36, r: 18 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 37, r: 18 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 38, r: 18 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 39, r: 18 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 40, r: 18 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 41, r: 18 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'none', 'none', 'none'] },

    // ======================================================================
    // MAIN STREET (North-South through town center)
    // ======================================================================
    // From south entry to tracks
    { coord: { q: 25, r: 34 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 33 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 32 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 31 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 30 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 29 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 28 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 27 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 26 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 25 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 24 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 23 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 22 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 21 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 20 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 19 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 18 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    // Crosses tracks at 17 (handled above)
    // Continues north to company district
    { coord: { q: 25, r: 16 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 15 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 14 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 11 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 25, r: 10 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // ======================================================================
    // COMPANY DISTRICT ROAD (East-West, row 10)
    // ======================================================================
    { coord: { q: 10, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Pinkerton office at 12
    { coord: { q: 14, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 16, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Bank at 18
    { coord: { q: 20, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 21, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 22, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 23, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 24, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Intersects main street at 25
    { coord: { q: 26, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 27, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 28, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 29, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 30, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 31, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Hotel at 32
    { coord: { q: 34, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 35, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 36, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 37, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Company store at 38
    { coord: { q: 40, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 41, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 42, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // ======================================================================
    // WORKERS' DISTRICT ROAD (East-West, row 26)
    // ======================================================================
    { coord: { q: 8, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Barracks/well area 10-14
    { coord: { q: 16, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Saloon at 20
    { coord: { q: 24, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Intersects main street at 25
    { coord: { q: 26, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 27, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 28, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 29, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    // Warehouse at 30
    { coord: { q: 32, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 33, r: 26 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // ======================================================================
    // DECORATIVE TERRAIN & ATMOSPHERE
    // ======================================================================

    // Grass patches in company district (manicured)
    { coord: { q: 22, r: 6 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 28, r: 6 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 30, r: 5 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 35, r: 7 }, terrain: 'grass', feature: 'tree' },

    // Bare dirt and rocks in workers' district
    { coord: { q: 6, r: 28 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 8, r: 30 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 16, r: 32 }, terrain: 'dirt', feature: 'none' },

    // Dead vegetation near railyard (industrial pollution)
    { coord: { q: 44, r: 20 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 46, r: 22 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 4, r: 19 }, terrain: 'dirt', feature: 'tree_dead' },

    // Open plaza in front of HQ
    { coord: { q: 24, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 25, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 26, r: 9 }, terrain: 'dirt', feature: 'none' },

    // Station plaza
    { coord: { q: 24, r: 18 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 26, r: 18 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 27, r: 18 }, terrain: 'dirt', feature: 'none' },
  ],

  // ========================================================================
  // ENTRY POINTS
  // ========================================================================
  entryPoints: [
    // West railroad approach - main freight line
    {
      id: 'west_tracks',
      coord: { q: 0, r: 17 },
      direction: 'west',
      connectionType: 'railroad',
      tags: ['railroad', 'freight'],
    },
    // East railroad approach - to the mountains
    {
      id: 'east_tracks',
      coord: { q: 49, r: 17 },
      direction: 'east',
      connectionType: 'railroad',
      tags: ['railroad', 'passenger'],
    },
    // South road - main public entrance
    {
      id: 'south_road',
      coord: { q: 25, r: 34 },
      direction: 'south',
      connectionType: 'road',
      tags: ['road', 'main', 'default'],
    },
  ],

  // Player spawns at south entrance by default
  playerSpawn: {
    coord: { q: 25, r: 32 },
    facing: 5, // Facing north toward the town
  },

  // ========================================================================
  // ATMOSPHERE
  // ========================================================================
  atmosphere: {
    dangerLevel: 2, // Pinkertons keep order - violently if needed
    wealthLevel: 7, // Company money flows, but not to workers
    populationDensity: 'crowded',
    lawLevel: 'strict', // IVRC law, not real law
  },

  tags: [
    'railroad',
    'ivrc',
    'industrial',
    'corporate',
    'central_plains',
    'class_divide',
    'mid_game',
  ],
});

export default JunctionCity;
