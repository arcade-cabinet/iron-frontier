/**
 * Building Templates - NPC slots, shop types, town requirements
 */

import type { BuildingTemplate, LocationTemplate } from '../../../schemas/generation.ts';

export const BUILDING_TEMPLATES: BuildingTemplate[] = [
  // -------------------------------------------------------------------------
  // COMMERCE & SERVICES
  // -------------------------------------------------------------------------
  {
    id: 'bld_saloon',
    type: 'saloon',
    npcSlots: [
      { role: 'saloon_keeper', required: true, count: 1 },
      { role: 'bartender', required: false, count: 1 },
      { role: 'piano_player', required: false, count: 1 },
      { role: 'saloon_girl', required: false, count: 2 },
      { role: 'gambler', required: false, count: 2 },
    ],
    shopType: 'saloon',
    minTownSize: 'village',
    maxInstances: 2,
    tags: ['social', 'commerce', 'drink', 'gambling', 'rumor_hub'],
  },
  {
    id: 'bld_general_store',
    type: 'general_store',
    npcSlots: [
      { role: 'shopkeeper', required: true, count: 1 },
      { role: 'shop_assistant', required: false, count: 1 },
    ],
    shopType: 'general_store',
    minTownSize: 'village',
    maxInstances: 2,
    tags: ['commerce', 'supplies', 'essential'],
  },
  {
    id: 'bld_gunsmith',
    type: 'gunsmith',
    npcSlots: [
      { role: 'gunsmith', required: true, count: 1 },
      { role: 'apprentice', required: false, count: 1 },
    ],
    shopType: 'gunsmith',
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['commerce', 'weapons', 'crafting'],
  },
  {
    id: 'bld_bank',
    type: 'bank',
    npcSlots: [
      { role: 'banker', required: true, count: 1 },
      { role: 'bank_clerk', required: false, count: 2 },
      { role: 'bank_guard', required: true, count: 1 },
    ],
    minTownSize: 'town',
    maxInstances: 1,
    tags: ['commerce', 'finance', 'valuable', 'guarded'],
  },
  {
    id: 'bld_hotel',
    type: 'hotel',
    npcSlots: [
      { role: 'innkeeper', required: true, count: 1 },
      { role: 'maid', required: false, count: 1 },
      { role: 'bellhop', required: false, count: 1 },
    ],
    shopType: 'trading_post',
    minTownSize: 'village',
    maxInstances: 2,
    tags: ['lodging', 'rest', 'travelers'],
  },
  {
    id: 'bld_stable',
    type: 'stable',
    npcSlots: [
      { role: 'stable_master', required: true, count: 1 },
      { role: 'stable_hand', required: false, count: 2 },
    ],
    shopType: 'specialty',
    minTownSize: 'village',
    maxInstances: 2,
    tags: ['mounts', 'transport', 'animals'],
  },
  {
    id: 'bld_blacksmith',
    type: 'blacksmith',
    npcSlots: [
      { role: 'blacksmith', required: true, count: 1 },
      { role: 'apprentice', required: false, count: 1 },
    ],
    shopType: 'blacksmith',
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['crafting', 'repair', 'metal'],
  },
  {
    id: 'bld_doctor',
    type: 'doctor',
    npcSlots: [
      { role: 'doctor', required: true, count: 1 },
      { role: 'nurse', required: false, count: 1 },
    ],
    shopType: 'apothecary',
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['medical', 'healing', 'essential'],
  },
  {
    id: 'bld_undertaker',
    type: 'undertaker',
    npcSlots: [
      { role: 'undertaker', required: true, count: 1 },
      { role: 'gravedigger', required: false, count: 1 },
    ],
    minTownSize: 'town',
    maxInstances: 1,
    tags: ['death', 'somber', 'essential'],
  },
  {
    id: 'bld_assay_office',
    type: 'assay_office',
    npcSlots: [
      { role: 'assayer', required: true, count: 1 },
      { role: 'clerk', required: false, count: 1 },
    ],
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['mining', 'commerce', 'valuable'],
  },

  // -------------------------------------------------------------------------
  // CIVIC & GOVERNMENT
  // -------------------------------------------------------------------------
  {
    id: 'bld_sheriff_office',
    type: 'sheriff_office',
    npcSlots: [
      { role: 'sheriff', required: true, count: 1 },
      { role: 'deputy', required: false, count: 2 },
      { role: 'prisoner', required: false, count: 1 },
    ],
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['law', 'authority', 'essential', 'bounty_board'],
  },
  {
    id: 'bld_church',
    type: 'church',
    npcSlots: [
      { role: 'preacher', required: true, count: 1 },
      { role: 'nun', required: false, count: 2 },
      { role: 'sexton', required: false, count: 1 },
    ],
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['spiritual', 'sanctuary', 'gathering'],
  },
  {
    id: 'bld_telegraph',
    type: 'telegraph',
    npcSlots: [{ role: 'telegraph_operator', required: true, count: 1 }],
    minTownSize: 'town',
    maxInstances: 1,
    tags: ['communication', 'technology', 'ivrc'],
  },
  {
    id: 'bld_train_depot',
    type: 'train_depot',
    npcSlots: [
      { role: 'station_master', required: true, count: 1 },
      { role: 'ticket_clerk', required: false, count: 1 },
      { role: 'porter', required: false, count: 2 },
      { role: 'conductor', required: false, count: 1 },
    ],
    minTownSize: 'town',
    maxInstances: 1,
    tags: ['transport', 'railroad', 'ivrc', 'fast_travel'],
  },

  // -------------------------------------------------------------------------
  // INDUSTRIAL & STORAGE
  // -------------------------------------------------------------------------
  {
    id: 'bld_warehouse',
    type: 'warehouse',
    npcSlots: [
      { role: 'warehouse_foreman', required: true, count: 1 },
      { role: 'warehouse_worker', required: false, count: 3 },
      { role: 'guard', required: false, count: 1 },
    ],
    minTownSize: 'town',
    maxInstances: 3,
    tags: ['storage', 'commerce', 'industrial'],
  },
  {
    id: 'bld_mine_entrance',
    type: 'mine_entrance',
    npcSlots: [
      { role: 'mine_foreman', required: true, count: 1 },
      { role: 'miner', required: false, count: 5 },
      { role: 'mine_guard', required: false, count: 2 },
    ],
    minTownSize: 'hamlet',
    maxInstances: 3,
    tags: ['mining', 'industrial', 'dangerous', 'valuable'],
  },
  {
    id: 'bld_water_tower',
    type: 'water_tower',
    npcSlots: [],
    minTownSize: 'village',
    maxInstances: 1,
    tags: ['landmark', 'utility', 'essential'],
  },
  {
    id: 'bld_windmill',
    type: 'windmill',
    npcSlots: [{ role: 'miller', required: false, count: 1 }],
    minTownSize: 'hamlet',
    maxInstances: 1,
    tags: ['agriculture', 'utility', 'landmark'],
  },

  // -------------------------------------------------------------------------
  // RESIDENTIAL
  // -------------------------------------------------------------------------
  {
    id: 'bld_house_small',
    type: 'house_small',
    npcSlots: [{ role: 'resident', required: false, count: 2 }],
    minTownSize: 'hamlet',
    maxInstances: 20,
    tags: ['residential', 'modest'],
  },
  {
    id: 'bld_house_large',
    type: 'house_large',
    npcSlots: [
      { role: 'wealthy_resident', required: false, count: 2 },
      { role: 'servant', required: false, count: 1 },
    ],
    minTownSize: 'village',
    maxInstances: 5,
    tags: ['residential', 'wealthy'],
  },
  {
    id: 'bld_shack',
    type: 'shack',
    npcSlots: [{ role: 'poor_resident', required: false, count: 2 }],
    minTownSize: 'hamlet',
    maxInstances: 10,
    tags: ['residential', 'poor', 'edge'],
  },
  {
    id: 'bld_barn',
    type: 'barn',
    npcSlots: [{ role: 'farmhand', required: false, count: 2 }],
    minTownSize: 'hamlet',
    maxInstances: 5,
    tags: ['agriculture', 'storage', 'animals'],
  },
];
