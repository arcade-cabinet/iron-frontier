/**
 * Coppertown - IVRC Company Mining Town
 *
 * Built into the Iron Mountains, Coppertown is a testament to corporate exploitation.
 * Every building, every tool, every scrap of food belongs to the Iron Valley Railroad
 * Company. Workers are paid in company script, redeemable only at the company store.
 * Copper-green stains streak the stone buildings. The air tastes of sulfur and desperation.
 *
 * Theme: Corporate control, exploitation, simmering resistance
 * Region: Iron Mountains (Level 3)
 * Population: ~300 workers + families
 */

import { Location, validateLocation } from '../schemas/spatial';

export const Coppertown: Location = validateLocation({
  id: 'coppertown',
  name: 'Coppertown',
  type: 'town',
  size: 'large',
  description:
    'IVRC company town carved into the Iron Mountains. Every soul here owes their life to the Company - and the Company never forgets a debt.',
  lore: `Founded in 1879 when IVRC surveyors found the largest copper deposit in the Territories. Within two years, a town of three hundred souls had sprouted from the mountainside like a copper-green fungus. The workers call it "The Cage" - you can check in any time you like, but the company script won't spend anywhere else.`,

  seed: 88742,
  width: 45,
  height: 40,
  baseTerrain: 'stone',

  // ============================================================================
  // ASSEMBLAGES - Placed from library
  // ============================================================================
  assemblages: [
    // -------------------------------------------------------------------------
    // THE PIT - Open copper mine (represented by mine entrance assemblage)
    // -------------------------------------------------------------------------
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'the_big_dig',
      anchor: { q: 35, r: 8 },
      rotation: 0,
      tags: ['primary', 'dungeon_entrance', 'ivrc', 'dangerous'],
      importance: 5,
    },

    // -------------------------------------------------------------------------
    // COMPANY ADMINISTRATIVE AREA (Upper Tier)
    // -------------------------------------------------------------------------

    // Company Office - Mine administration
    {
      assemblageId: 'asm_bank_01', // Using bank as office (secure, important)
      instanceId: 'company_office',
      anchor: { q: 20, r: 6 },
      rotation: 2,
      slotTypeOverride: 'law_office', // Functions as authority hub
      tags: ['ivrc', 'administration', 'important'],
      importance: 5,
    },

    // Foreman's House - Nicer than workers'
    {
      assemblageId: 'asm_house_01',
      instanceId: 'foreman_house',
      anchor: { q: 14, r: 8 },
      rotation: 1,
      tags: ['ivrc', 'management', 'comfortable'],
      importance: 4,
    },

    // Guard Post - Company security checkpoint
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'guard_post',
      anchor: { q: 10, r: 14 },
      rotation: 0,
      slotTypeOverride: 'hideout', // Functions as security hub
      tags: ['ivrc', 'security', 'checkpoint'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // INDUSTRIAL AREA (Middle Tier)
    // -------------------------------------------------------------------------

    // Processing Mill - Ore smelting
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'processing_mill',
      anchor: { q: 30, r: 15 },
      rotation: 3,
      slotTypeOverride: 'smelter',
      tags: ['industrial', 'processing', 'dangerous', 'loud'],
      importance: 5,
    },

    // Tool Shed - Equipment storage
    {
      assemblageId: 'asm_stable_01', // Using stable for equipment storage
      instanceId: 'tool_shed',
      anchor: { q: 25, r: 18 },
      rotation: 2,
      slotTypeOverride: 'workshop',
      tags: ['industrial', 'equipment', 'tools'],
      importance: 3,
    },

    // Water Cistern area
    {
      assemblageId: 'asm_well_01',
      instanceId: 'water_cistern',
      anchor: { q: 18, r: 20 },
      rotation: 0,
      tags: ['infrastructure', 'water', 'essential'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // COMMERCE AREA (Lower-Middle Tier)
    // -------------------------------------------------------------------------

    // Company Store - The only store, accepts script currency
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'company_store',
      anchor: { q: 15, r: 22 },
      rotation: 1,
      tags: ['ivrc', 'commerce', 'monopoly', 'essential'],
      importance: 5,
    },

    // Mess Hall - Company cafeteria (using saloon structure)
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'mess_hall',
      anchor: { q: 20, r: 24 },
      rotation: 2,
      slotTypeOverride: 'tavern',
      tags: ['ivrc', 'social', 'food', 'workers'],
      importance: 4,
    },

    // Infirmary - Underfunded medical (using cabin)
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'infirmary',
      anchor: { q: 12, r: 24 },
      rotation: 0,
      slotTypeOverride: 'doctor',
      tags: ['medical', 'underfunded', 'essential'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // WORKER HOUSING (Lower Tier) - Rows of identical cabins
    // -------------------------------------------------------------------------

    // Row 1 - Western cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_01',
      anchor: { q: 8, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_02',
      anchor: { q: 11, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_03',
      anchor: { q: 14, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },

    // Row 2 - Central cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_04',
      anchor: { q: 8, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_05',
      anchor: { q: 11, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_06',
      anchor: { q: 14, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },

    // Row 3 - Eastern cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_07',
      anchor: { q: 17, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_08',
      anchor: { q: 20, r: 28 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_09',
      anchor: { q: 17, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'worker_cabin_10',
      anchor: { q: 20, r: 31 },
      rotation: 0,
      slotTypeOverride: 'residence_poor',
      tags: ['housing', 'workers', 'poor'],
      importance: 2,
    },

    // -------------------------------------------------------------------------
    // SUPPORT STRUCTURES
    // -------------------------------------------------------------------------

    // Mule stable for ore carts
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'mule_stable',
      anchor: { q: 28, r: 12 },
      rotation: 1,
      tags: ['logistics', 'animals', 'ore_transport'],
      importance: 3,
    },

    // Rock formation near mine (lookout/ambush point)
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'slag_heap',
      anchor: { q: 38, r: 14 },
      rotation: 4,
      tags: ['terrain', 'waste', 'cover'],
      importance: 1,
    },

    // Abandoned cabin at edge (secret meeting spot for resistance)
    {
      assemblageId: 'asm_ruins_cabin_01',
      instanceId: 'old_assay_office',
      anchor: { q: 5, r: 18 },
      rotation: 2,
      tags: ['abandoned', 'secret', 'resistance'],
      importance: 3,
    },
  ],

  // ============================================================================
  // CUSTOM SLOTS - Unique to Coppertown
  // ============================================================================
  slots: [
    // The Pit - Open copper mine (terrain feature, not building)
    {
      id: 'the_pit',
      type: 'mine',
      name: 'The Pit',
      anchor: { q: 38, r: 5 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'canyon', elevation: 0, feature: 'ore_vein' },
        { coord: { q: 1, r: 0 }, terrain: 'canyon', elevation: 0, feature: 'none' },
        { coord: { q: -1, r: 0 }, terrain: 'canyon', elevation: 0, feature: 'ore_vein' },
        { coord: { q: 0, r: 1 }, terrain: 'canyon', elevation: 0, feature: 'none' },
        { coord: { q: 1, r: 1 }, terrain: 'canyon', elevation: 0, feature: 'none' },
        { coord: { q: -1, r: 1 }, terrain: 'stone_rocks', elevation: 1, feature: 'boulder' },
        { coord: { q: 0, r: -1 }, terrain: 'stone_rocks', elevation: 1, feature: 'rock_large' },
        { coord: { q: 2, r: 0 }, terrain: 'stone_rocks', elevation: 1, feature: 'none' },
        { coord: { q: -2, r: 1 }, terrain: 'stone_mountain', elevation: 2, feature: 'none' },
      ],
      markers: [
        { type: 'vantage_point', name: 'pit_overlook', offset: { q: -1, r: 1 }, tags: ['danger', 'view'] },
        { type: 'spawn_point', name: 'miner_spawn', offset: { q: 0, r: 0 }, tags: ['npc', 'worker'] },
        { type: 'evidence_spot', name: 'unsafe_equipment', offset: { q: 1, r: 0 }, tags: ['clue', 'safety'] },
      ],
      zones: [
        {
          type: 'combat_zone',
          name: 'pit_floor',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: -1, r: 0 },
            { q: 0, r: 1 },
          ],
          tags: ['dangerous', 'fall_hazard'],
        },
      ],
      tags: ['terrain', 'dangerous', 'industrial'],
      importance: 5,
    },

    // Ore cart track system (linear infrastructure)
    {
      id: 'ore_tracks',
      type: 'landmark',
      name: 'Ore Cart Tracks',
      anchor: { q: 32, r: 10 },
      rotation: 0,
      tiles: [
        {
          coord: { q: 0, r: 0 },
          terrain: 'stone',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        {
          coord: { q: -1, r: 0 },
          terrain: 'stone',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        {
          coord: { q: -2, r: 0 },
          terrain: 'stone',
          feature: 'none',
          edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
        },
        {
          coord: { q: -3, r: 1 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
        {
          coord: { q: -3, r: 2 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
        {
          coord: { q: -3, r: 3 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
        {
          coord: { q: -3, r: 4 },
          terrain: 'stone',
          feature: 'none',
          edges: ['none', 'railroad', 'none', 'none', 'railroad', 'none'],
        },
      ],
      markers: [
        { type: 'spawn_point', name: 'ore_cart', offset: { q: -1, r: 0 }, tags: ['vehicle', 'industrial'] },
      ],
      zones: [],
      tags: ['infrastructure', 'industrial', 'transport'],
      importance: 3,
    },
  ],

  // ============================================================================
  // BASE TILES - Roads, terrain, decorations
  // ============================================================================
  baseTiles: [
    // -------------------------------------------------------------------------
    // Mountain backdrop (northern edge - impassable)
    // -------------------------------------------------------------------------
    { coord: { q: 5, r: 2 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 6, r: 2 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 7, r: 2 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 8, r: 2 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 9, r: 2 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 10, r: 2 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 11, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 12, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 13, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 14, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 15, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 16, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 17, r: 4 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 18, r: 4 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 19, r: 4 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 20, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 21, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 22, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 23, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 24, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 25, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 26, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 27, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 28, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 29, r: 3 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 30, r: 4 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 31, r: 4 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 32, r: 4 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
    { coord: { q: 33, r: 3 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 34, r: 3 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 35, r: 3 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 36, r: 3 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 37, r: 3 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 38, r: 2 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 39, r: 2 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },
    { coord: { q: 40, r: 2 }, terrain: 'stone_mountain', elevation: 4, feature: 'none' },

    // -------------------------------------------------------------------------
    // Rocky hillside terrain (upper area)
    // -------------------------------------------------------------------------
    { coord: { q: 5, r: 5 }, terrain: 'stone_hill', elevation: 2, feature: 'rock_large' },
    { coord: { q: 6, r: 5 }, terrain: 'stone_rocks', elevation: 2, feature: 'boulder' },
    { coord: { q: 7, r: 5 }, terrain: 'stone_hill', elevation: 2, feature: 'none' },
    { coord: { q: 5, r: 7 }, terrain: 'stone_rocks', elevation: 2, feature: 'rock_small' },
    { coord: { q: 25, r: 5 }, terrain: 'stone_hill', elevation: 2, feature: 'ore_vein' },
    { coord: { q: 26, r: 5 }, terrain: 'stone_rocks', elevation: 2, feature: 'none' },
    { coord: { q: 27, r: 6 }, terrain: 'stone_hill', elevation: 2, feature: 'rock_large' },
    { coord: { q: 40, r: 8 }, terrain: 'stone_rocks', elevation: 2, feature: 'boulder' },
    { coord: { q: 41, r: 9 }, terrain: 'stone_hill', elevation: 2, feature: 'rock_small' },
    { coord: { q: 42, r: 10 }, terrain: 'stone_rocks', elevation: 2, feature: 'none' },

    // -------------------------------------------------------------------------
    // Main road from south entry (Mountain Trail)
    // -------------------------------------------------------------------------
    {
      coord: { q: 15, r: 38 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 37 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 36 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 35 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 34 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 33 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Road through worker housing
    {
      coord: { q: 15, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'road', 'none', 'road', 'none', 'road'],
    },
    {
      coord: { q: 14, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 13, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 12, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 16, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 17, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 18, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 32 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Road north through commerce
    {
      coord: { q: 15, r: 30 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 29 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 27 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 26 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'road', 'none', 'road', 'none', 'road'],
    },

    // Commerce cross-street
    {
      coord: { q: 16, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 17, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 18, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 14, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 13, r: 25 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Road north to industrial
    {
      coord: { q: 15, r: 23 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 21 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'road', 'none', 'road', 'none', 'road'],
    },

    // Industrial cross-road
    {
      coord: { q: 16, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 17, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 18, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 20, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 21, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 22, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 23, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 24, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Road to upper administration
    {
      coord: { q: 15, r: 17 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 15 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'road', 'none', 'road', 'none', 'road'],
    },

    // Admin cross-road
    {
      coord: { q: 16, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 17, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 18, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 14, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 13, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 12, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 11, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'road', 'none', 'none', 'none'],
    },

    // Path up to foreman house
    {
      coord: { q: 15, r: 11 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 9 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'road', 'none', 'road', 'none', 'road'],
    },

    // Road east to mine area
    {
      coord: { q: 19, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 20, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 21, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 22, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 23, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 24, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 25, r: 13 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 26, r: 12 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'road', 'none', 'road', 'none'],
    },
    {
      coord: { q: 27, r: 11 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'road', 'none', 'road', 'none'],
    },
    {
      coord: { q: 28, r: 10 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'road', 'none', 'none', 'none'],
    },
    {
      coord: { q: 29, r: 10 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 30, r: 10 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 31, r: 10 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 32, r: 9 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'road', 'none', 'road', 'none'],
    },
    {
      coord: { q: 33, r: 8 },
      terrain: 'stone',
      feature: 'none',
      edges: ['road', 'none', 'road', 'none', 'none', 'none'],
    },

    // -------------------------------------------------------------------------
    // Rail spur entry (eastern approach)
    // -------------------------------------------------------------------------
    {
      coord: { q: 42, r: 20 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: 41, r: 20 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: 40, r: 20 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: 39, r: 20 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: 38, r: 20 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'],
    },
    {
      coord: { q: 37, r: 20 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['railroad', 'none', 'road', 'none', 'none', 'none'],
    },
    {
      coord: { q: 36, r: 19 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'railroad', 'none', 'railroad', 'none'],
    },
    {
      coord: { q: 35, r: 18 },
      terrain: 'dirt',
      feature: 'none',
      edges: ['none', 'none', 'railroad', 'none', 'railroad', 'none'],
    },
    {
      coord: { q: 34, r: 17 },
      terrain: 'stone',
      feature: 'none',
      edges: ['none', 'railroad', 'railroad', 'none', 'none', 'none'],
    },

    // -------------------------------------------------------------------------
    // Copper-stained rocks and slag piles (environmental storytelling)
    // -------------------------------------------------------------------------
    { coord: { q: 36, r: 12 }, terrain: 'stone_rocks', elevation: 1, feature: 'rock_large' },
    { coord: { q: 37, r: 11 }, terrain: 'stone_rocks', elevation: 1, feature: 'boulder' },
    { coord: { q: 35, r: 16 }, terrain: 'stone_rocks', elevation: 1, feature: 'rock_small' },
    { coord: { q: 33, r: 14 }, terrain: 'stone_rocks', elevation: 1, feature: 'none' },
    { coord: { q: 32, r: 16 }, terrain: 'stone_rocks', elevation: 1, feature: 'rock_large' },

    // -------------------------------------------------------------------------
    // Sparse vegetation (struggling in toxic environment)
    // -------------------------------------------------------------------------
    { coord: { q: 5, r: 25 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 6, r: 30 }, terrain: 'dirt', feature: 'bush' },
    { coord: { q: 7, r: 35 }, terrain: 'grass', feature: 'tree_dead' },
    { coord: { q: 22, r: 34 }, terrain: 'dirt', feature: 'bush' },
    { coord: { q: 24, r: 30 }, terrain: 'dirt', feature: 'tree_dead' },
    { coord: { q: 3, r: 22 }, terrain: 'grass', feature: 'bush' },

    // -------------------------------------------------------------------------
    // Open work areas
    // -------------------------------------------------------------------------
    { coord: { q: 25, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 26, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 27, r: 16 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 28, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 29, r: 16 }, terrain: 'stone', feature: 'ore_vein' },
  ],

  // ============================================================================
  // ENTRY POINTS
  // ============================================================================
  entryPoints: [
    // Main entry - Mountain Trail from south
    {
      id: 'mountain_trail',
      coord: { q: 15, r: 39 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['main', 'default', 'pedestrian'],
    },
    // Rail spur entry - Eastern approach for supplies
    {
      id: 'rail_spur',
      coord: { q: 43, r: 20 },
      direction: 'east',
      connectionType: 'railroad',
      tags: ['freight', 'ivrc', 'supplies'],
    },
  ],

  // ============================================================================
  // PLAYER SPAWN
  // ============================================================================
  playerSpawn: {
    coord: { q: 15, r: 36 },
    facing: 5, // Facing north toward town
  },

  // ============================================================================
  // ATMOSPHERE
  // ============================================================================
  atmosphere: {
    dangerLevel: 4, // High - cave-ins, toxic fumes, company enforcers
    wealthLevel: 2, // Poor - workers paid in script, everything owned by company
    populationDensity: 'crowded', // Lots of workers crammed into small area
    lawLevel: 'strict', // Company rules enforced harshly
  },

  // ============================================================================
  // TAGS
  // ============================================================================
  tags: [
    'company_town',
    'mining',
    'ivrc',
    'industrial',
    'oppressive',
    'iron_mountains',
    'level_3',
    'resistance',
    'exploitation',
  ],
});

export default Coppertown;
