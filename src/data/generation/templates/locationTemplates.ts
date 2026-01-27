/**
 * Iron Frontier - Location Templates for Procedural Generation
 *
 * Defines building templates and location templates for generating
 * frontier settlements, camps, and other populated areas.
 *
 * Templates follow the Daggerfall-style procedural generation pattern:
 * - Building templates define NPC slots, shop types, and requirements
 * - Location templates define building compositions and NPC ranges
 * - Generators combine templates with context and seeds
 */

import type { BuildingTemplate, LocationTemplate } from '../../schemas/generation';

// ============================================================================
// BUILDING TEMPLATES
// ============================================================================

/**
 * All building templates available for location generation.
 * Each building defines NPC slots, shop types, and town size requirements.
 */
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

// ============================================================================
// LOCATION TEMPLATES
// ============================================================================

/**
 * All location templates for procedural generation.
 * Each template defines building composition, NPC ranges, and valid biomes.
 */
export const LOCATION_TEMPLATES: LocationTemplate[] = [
  // -------------------------------------------------------------------------
  // TOWNS & SETTLEMENTS
  // -------------------------------------------------------------------------
  {
    id: 'loc_frontier_town',
    name: 'Frontier Town',
    locationType: 'town',
    size: 'large',
    namePoolId: 'western_town_names',
    buildings: [
      // Required core buildings
      { templateId: 'bld_saloon', countRange: [1, 2], required: true },
      { templateId: 'bld_general_store', countRange: [1, 2], required: true },
      { templateId: 'bld_sheriff_office', countRange: [1, 1], required: true },
      { templateId: 'bld_church', countRange: [1, 1], required: true },
      { templateId: 'bld_hotel', countRange: [1, 2], required: true },
      { templateId: 'bld_stable', countRange: [1, 1], required: true },
      { templateId: 'bld_doctor', countRange: [1, 1], required: true },
      // Common optional buildings
      { templateId: 'bld_gunsmith', countRange: [1, 1], required: false },
      { templateId: 'bld_bank', countRange: [0, 1], required: false },
      { templateId: 'bld_blacksmith', countRange: [1, 1], required: false },
      { templateId: 'bld_undertaker', countRange: [0, 1], required: false },
      { templateId: 'bld_telegraph', countRange: [0, 1], required: false },
      { templateId: 'bld_train_depot', countRange: [0, 1], required: false },
      { templateId: 'bld_warehouse', countRange: [1, 3], required: false },
      { templateId: 'bld_water_tower', countRange: [1, 1], required: false },
      // Residential
      { templateId: 'bld_house_large', countRange: [2, 5], required: false },
      { templateId: 'bld_house_small', countRange: [8, 15], required: false },
      { templateId: 'bld_shack', countRange: [3, 6], required: false },
    ],
    backgroundNpcRange: [15, 30],
    notableNpcRange: [4, 8],
    validBiomes: ['plains', 'desert', 'mesa', 'grassland', 'valley'],
    descriptionTemplates: [
      'A bustling frontier town where the promise of the West meets the harsh reality of survival.',
      '{{name}} stands as a beacon of civilization in the untamed wilderness, its streets alive with merchants, drifters, and dreamers.',
      'The sound of hammers and the smell of sawdust mingle with dust in this growing frontier settlement.',
      'A proper town with all the amenities a traveler could need - and all the dangers that come with frontier life.',
    ],
    tags: ['civilization', 'commerce', 'law', 'main_hub'],
  },

  {
    id: 'loc_mining_town',
    name: 'Mining Town',
    locationType: 'town',
    size: 'medium',
    namePoolId: 'mining_town_names',
    buildings: [
      // Mining focus
      { templateId: 'bld_mine_entrance', countRange: [1, 3], required: true },
      { templateId: 'bld_assay_office', countRange: [1, 1], required: true },
      // Essential services
      { templateId: 'bld_saloon', countRange: [1, 2], required: true },
      { templateId: 'bld_general_store', countRange: [1, 1], required: true },
      { templateId: 'bld_doctor', countRange: [1, 1], required: true },
      { templateId: 'bld_blacksmith', countRange: [1, 1], required: true },
      // Optional
      { templateId: 'bld_sheriff_office', countRange: [0, 1], required: false },
      { templateId: 'bld_hotel', countRange: [0, 1], required: false },
      { templateId: 'bld_church', countRange: [0, 1], required: false },
      { templateId: 'bld_warehouse', countRange: [1, 2], required: false },
      { templateId: 'bld_undertaker', countRange: [1, 1], required: false },
      // Residential - miners quarters
      { templateId: 'bld_shack', countRange: [8, 15], required: false },
      { templateId: 'bld_house_small', countRange: [3, 6], required: false },
    ],
    backgroundNpcRange: [20, 40],
    notableNpcRange: [3, 6],
    validBiomes: ['mountain', 'mesa', 'canyon', 'hills', 'badlands'],
    descriptionTemplates: [
      'A rough mining settlement where fortunes are made and lost in the dark tunnels that honeycomb the earth.',
      '{{name}} clings to the mountainside, its inhabitants chasing veins of precious metal into the depths.',
      'Dust and the ringing of pickaxes define life in this mining town, where hope runs as deep as the ore.',
      'The mines draw men with dreams of wealth, but {{name}} takes its toll in blood and sweat.',
    ],
    tags: ['mining', 'industrial', 'rough', 'wealth', 'dangerous'],
  },

  {
    id: 'loc_cattle_town',
    name: 'Cattle Town',
    locationType: 'town',
    size: 'medium',
    namePoolId: 'western_town_names',
    buildings: [
      // Cattle focus
      { templateId: 'bld_stable', countRange: [2, 3], required: true },
      { templateId: 'bld_barn', countRange: [2, 4], required: true },
      // Essential services
      { templateId: 'bld_saloon', countRange: [1, 2], required: true },
      { templateId: 'bld_general_store', countRange: [1, 1], required: true },
      { templateId: 'bld_sheriff_office', countRange: [1, 1], required: true },
      { templateId: 'bld_hotel', countRange: [1, 1], required: true },
      { templateId: 'bld_blacksmith', countRange: [1, 1], required: true },
      // Optional
      { templateId: 'bld_doctor', countRange: [0, 1], required: false },
      { templateId: 'bld_church', countRange: [0, 1], required: false },
      { templateId: 'bld_bank', countRange: [0, 1], required: false },
      { templateId: 'bld_warehouse', countRange: [1, 2], required: false },
      // Residential
      { templateId: 'bld_house_small', countRange: [4, 8], required: false },
      { templateId: 'bld_house_large', countRange: [1, 3], required: false },
    ],
    backgroundNpcRange: [12, 25],
    notableNpcRange: [3, 5],
    validBiomes: ['plains', 'grassland', 'prairie', 'valley'],
    descriptionTemplates: [
      'A cattle town where the smell of livestock and leather hangs in the air like a permanent companion.',
      '{{name}} serves the great cattle drives, its economy tied to the rhythm of hooves and the crack of whips.',
      'Cowboys and ranchers call this town home between drives, spending hard-earned wages at the saloon.',
      'The stockyards define {{name}}, a hub for the cattle trade that fuels the frontier.',
    ],
    tags: ['cattle', 'ranching', 'cowboys', 'trade'],
  },

  {
    id: 'loc_railroad_town',
    name: 'Railroad Town',
    locationType: 'town',
    size: 'medium',
    namePoolId: 'western_town_names',
    buildings: [
      // Railroad focus
      { templateId: 'bld_train_depot', countRange: [1, 1], required: true },
      { templateId: 'bld_telegraph', countRange: [1, 1], required: true },
      { templateId: 'bld_warehouse', countRange: [2, 4], required: true },
      // Essential services
      { templateId: 'bld_saloon', countRange: [1, 2], required: true },
      { templateId: 'bld_hotel', countRange: [1, 2], required: true },
      { templateId: 'bld_general_store', countRange: [1, 1], required: true },
      { templateId: 'bld_sheriff_office', countRange: [1, 1], required: true },
      // Optional
      { templateId: 'bld_bank', countRange: [0, 1], required: false },
      { templateId: 'bld_doctor', countRange: [0, 1], required: false },
      { templateId: 'bld_church', countRange: [0, 1], required: false },
      { templateId: 'bld_stable', countRange: [1, 1], required: false },
      // Residential
      { templateId: 'bld_house_small', countRange: [5, 10], required: false },
      { templateId: 'bld_shack', countRange: [3, 6], required: false },
    ],
    backgroundNpcRange: [15, 30],
    notableNpcRange: [3, 6],
    validBiomes: ['plains', 'desert', 'grassland', 'prairie', 'valley'],
    descriptionTemplates: [
      'A railroad town humming with the constant movement of goods and people along the iron rails.',
      '{{name}} owes its existence to the railroad, a waystation for travelers and freight alike.',
      'The screech of brakes and the hiss of steam mark the heartbeat of this railroad junction.',
      'Where the iron horse stops, commerce follows - {{name}} is proof of that frontier truth.',
    ],
    tags: ['railroad', 'transport', 'commerce', 'ivrc', 'fast_travel'],
  },

  {
    id: 'loc_ghost_town',
    name: 'Ghost Town',
    locationType: 'ruins',
    size: 'small',
    namePoolId: 'western_town_names',
    buildings: [
      // Abandoned structures
      { templateId: 'bld_saloon', countRange: [0, 1], required: false },
      { templateId: 'bld_general_store', countRange: [0, 1], required: false },
      { templateId: 'bld_sheriff_office', countRange: [0, 1], required: false },
      { templateId: 'bld_church', countRange: [0, 1], required: false },
      { templateId: 'bld_hotel', countRange: [0, 1], required: false },
      { templateId: 'bld_mine_entrance', countRange: [0, 2], required: false },
      { templateId: 'bld_house_small', countRange: [3, 8], required: false },
      { templateId: 'bld_shack', countRange: [2, 5], required: false },
    ],
    backgroundNpcRange: [0, 3],
    notableNpcRange: [0, 2],
    validBiomes: ['desert', 'mesa', 'badlands', 'canyon', 'mountain'],
    descriptionTemplates: [
      'An abandoned town where the wind whistles through empty windows and tumbleweeds roll down main street.',
      '{{name}} stands as a monument to broken dreams, its buildings slowly returning to the dust.',
      'Once a thriving settlement, now only ghosts and scavengers call {{name}} home.',
      'The bones of a dead town, picked clean by time and neglect.',
    ],
    tags: ['abandoned', 'dangerous', 'mystery', 'loot', 'haunted'],
  },

  {
    id: 'loc_boom_town',
    name: 'Boom Town',
    locationType: 'town',
    size: 'large',
    namePoolId: 'mining_town_names',
    buildings: [
      // Mining wealth
      { templateId: 'bld_mine_entrance', countRange: [2, 4], required: true },
      { templateId: 'bld_assay_office', countRange: [1, 2], required: true },
      { templateId: 'bld_bank', countRange: [1, 1], required: true },
      // Commerce - lots of it
      { templateId: 'bld_saloon', countRange: [2, 3], required: true },
      { templateId: 'bld_general_store', countRange: [1, 2], required: true },
      { templateId: 'bld_gunsmith', countRange: [1, 1], required: true },
      { templateId: 'bld_hotel', countRange: [2, 3], required: true },
      // Services
      { templateId: 'bld_sheriff_office', countRange: [1, 1], required: true },
      { templateId: 'bld_doctor', countRange: [1, 2], required: true },
      { templateId: 'bld_blacksmith', countRange: [1, 2], required: true },
      { templateId: 'bld_stable', countRange: [1, 2], required: true },
      // Infrastructure
      { templateId: 'bld_telegraph', countRange: [1, 1], required: false },
      { templateId: 'bld_warehouse', countRange: [2, 4], required: false },
      // Residential - mixed
      { templateId: 'bld_house_large', countRange: [3, 6], required: false },
      { templateId: 'bld_house_small', countRange: [6, 12], required: false },
      { templateId: 'bld_shack', countRange: [8, 15], required: false },
    ],
    backgroundNpcRange: [30, 50],
    notableNpcRange: [5, 10],
    validBiomes: ['mountain', 'hills', 'canyon', 'mesa'],
    descriptionTemplates: [
      'A boom town bursting at the seams with fortune-seekers, the streets thick with mud and money.',
      '{{name}} grew overnight on the promise of gold, and every day brings more hopeful souls seeking their fortune.',
      'Money flows like water in this prosperous mining town, but so does blood.',
      'A chaotic, vibrant settlement where millionaires rub shoulders with beggars and the law struggles to keep pace.',
    ],
    tags: ['wealth', 'mining', 'chaotic', 'opportunity', 'dangerous'],
  },

  // -------------------------------------------------------------------------
  // SMALL SETTLEMENTS & OUTPOSTS
  // -------------------------------------------------------------------------
  {
    id: 'loc_outpost',
    name: 'Outpost',
    locationType: 'outpost',
    size: 'small',
    namePoolId: 'outpost_names',
    buildings: [
      { templateId: 'bld_general_store', countRange: [1, 1], required: true },
      { templateId: 'bld_stable', countRange: [0, 1], required: false },
      { templateId: 'bld_shack', countRange: [2, 4], required: false },
      { templateId: 'bld_water_tower', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [3, 8],
    notableNpcRange: [1, 2],
    validBiomes: ['desert', 'plains', 'mesa', 'grassland', 'badlands'],
    descriptionTemplates: [
      'A lonely outpost offering basic supplies to travelers brave enough to venture this far.',
      '{{name}} provides a rare respite in the wilderness, little more than a few buildings clustered against the emptiness.',
      'A trading outpost where weary travelers can resupply before continuing their journey.',
      'The frontier at its most sparse - a handful of hardy souls making a living at the edge of nowhere.',
    ],
    tags: ['remote', 'supplies', 'rest_stop'],
  },

  {
    id: 'loc_trading_post',
    name: 'Trading Post',
    locationType: 'trading_post',
    size: 'small',
    namePoolId: 'outpost_names',
    buildings: [
      { templateId: 'bld_general_store', countRange: [1, 1], required: true },
      { templateId: 'bld_stable', countRange: [1, 1], required: true },
      { templateId: 'bld_shack', countRange: [1, 3], required: false },
      { templateId: 'bld_barn', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [4, 10],
    notableNpcRange: [1, 3],
    validBiomes: ['plains', 'grassland', 'forest_edge', 'river_valley', 'prairie'],
    descriptionTemplates: [
      'A trading post where trappers, natives, and settlers meet to exchange goods and news.',
      '{{name}} sits at the crossroads of the frontier, a hub for trade between worlds.',
      'Furs, supplies, and stories change hands at this busy trading post.',
      'A weathered trading post that has seen countless bargains struck and friendships forged.',
    ],
    tags: ['trade', 'multicultural', 'neutral_ground'],
  },

  {
    id: 'loc_waystation',
    name: 'Waystation',
    locationType: 'waystation',
    size: 'tiny',
    namePoolId: 'outpost_names',
    buildings: [
      { templateId: 'bld_stable', countRange: [1, 1], required: true },
      { templateId: 'bld_shack', countRange: [1, 2], required: false },
    ],
    backgroundNpcRange: [1, 4],
    notableNpcRange: [1, 1],
    validBiomes: ['plains', 'desert', 'grassland', 'prairie', 'valley'],
    descriptionTemplates: [
      'A simple waystation offering fresh horses and a roof for the night.',
      "{{name}} marks a day's ride along the trail, a welcome sight for weary travelers.",
      'Little more than a stable and a shack, but civilization nonetheless.',
      'A lonely waystation where the stagecoach stops to change horses.',
    ],
    tags: ['rest_stop', 'horses', 'travel'],
  },

  {
    id: 'loc_homestead',
    name: 'Homestead',
    locationType: 'homestead',
    size: 'tiny',
    namePoolId: 'family_homestead_names',
    buildings: [
      { templateId: 'bld_house_small', countRange: [1, 1], required: true },
      { templateId: 'bld_barn', countRange: [0, 1], required: false },
      { templateId: 'bld_windmill', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [2, 5],
    notableNpcRange: [1, 2],
    validBiomes: ['plains', 'grassland', 'prairie', 'valley', 'forest_edge'],
    descriptionTemplates: [
      'A humble homestead carved out of the wilderness by a single determined family.',
      '{{name}} stands alone against the frontier, a testament to human stubbornness.',
      'A small farm where a family works the land and hopes for better days.',
      'The smoke from a lonely chimney marks this homestead against the vast horizon.',
    ],
    tags: ['family', 'farming', 'isolated', 'vulnerable'],
  },

  // -------------------------------------------------------------------------
  // RANCHES & FARMS
  // -------------------------------------------------------------------------
  {
    id: 'loc_ranch',
    name: 'Ranch',
    locationType: 'ranch',
    size: 'small',
    namePoolId: 'ranch_names',
    buildings: [
      { templateId: 'bld_house_large', countRange: [1, 1], required: true },
      { templateId: 'bld_barn', countRange: [1, 2], required: true },
      { templateId: 'bld_stable', countRange: [1, 1], required: true },
      { templateId: 'bld_shack', countRange: [2, 4], required: false },
      { templateId: 'bld_windmill', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [5, 12],
    notableNpcRange: [2, 3],
    validBiomes: ['plains', 'grassland', 'prairie', 'valley'],
    descriptionTemplates: [
      'A sprawling ranch where cattle graze under the watchful eyes of hard-working hands.',
      '{{name}} represents years of labor, a cattle empire built on sweat and determination.',
      'The main house overlooks acres of grazing land, the heart of a frontier ranching operation.',
      'Cowboys ride the fence lines of {{name}}, keeping the herd safe from rustlers and predators.',
    ],
    tags: ['cattle', 'ranching', 'wealth', 'cowboys'],
  },

  // -------------------------------------------------------------------------
  // INDUSTRIAL SITES
  // -------------------------------------------------------------------------
  {
    id: 'loc_mine_complex',
    name: 'Mine Complex',
    locationType: 'mine',
    size: 'medium',
    namePoolId: 'mine_names',
    buildings: [
      { templateId: 'bld_mine_entrance', countRange: [2, 4], required: true },
      { templateId: 'bld_warehouse', countRange: [1, 2], required: true },
      { templateId: 'bld_blacksmith', countRange: [1, 1], required: true },
      { templateId: 'bld_shack', countRange: [4, 8], required: false },
      { templateId: 'bld_general_store', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [15, 30],
    notableNpcRange: [2, 4],
    validBiomes: ['mountain', 'hills', 'canyon', 'mesa'],
    descriptionTemplates: [
      'A mining complex where men descend into darkness seeking the wealth hidden in the earth.',
      '{{name}} scars the mountainside with its tunnels, a monument to industry and ambition.',
      'The rhythmic pounding of machinery echoes across the hills from this busy mining operation.',
      'Ore carts rattle along tracks as miners emerge, covered in dust and exhaustion.',
    ],
    tags: ['mining', 'industrial', 'labor', 'dangerous', 'valuable'],
  },

  // -------------------------------------------------------------------------
  // OUTLAW & HOSTILE LOCATIONS
  // -------------------------------------------------------------------------
  {
    id: 'loc_bandit_camp',
    name: 'Bandit Camp',
    locationType: 'camp',
    size: 'small',
    namePoolId: 'outlaw_hideout_names',
    buildings: [
      { templateId: 'bld_shack', countRange: [2, 5], required: true },
      { templateId: 'bld_stable', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [5, 15],
    notableNpcRange: [1, 3],
    validBiomes: ['canyon', 'badlands', 'mesa', 'mountain', 'forest'],
    descriptionTemplates: [
      'A hidden outlaw camp where bandits plan their next raid on honest folk.',
      '{{name}} serves as a base for outlaws, tucked away from the prying eyes of the law.',
      'The camp of desperate men who chose the wrong side of the law.',
      'Wanted men and women gather here, sharing loot and laying low from bounty hunters.',
    ],
    tags: ['outlaw', 'hostile', 'hidden', 'dangerous', 'loot'],
  },

  // -------------------------------------------------------------------------
  // NATIVE & CULTURAL LOCATIONS
  // -------------------------------------------------------------------------
  {
    id: 'loc_native_village',
    name: 'Native Village',
    locationType: 'village',
    size: 'medium',
    namePoolId: 'native_place_names',
    buildings: [
      // Using shacks to represent lodges/tipis
      { templateId: 'bld_shack', countRange: [6, 12], required: true },
      { templateId: 'bld_stable', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [15, 35],
    notableNpcRange: [3, 5],
    validBiomes: ['plains', 'grassland', 'prairie', 'river_valley', 'forest_edge'],
    descriptionTemplates: [
      'A native village where the old ways persist against the encroaching frontier.',
      '{{name}} stands as it has for generations, a community bound by tradition and kinship.',
      'Smoke rises from cooking fires in this peaceful settlement of the First People.',
      'The village exists in uneasy tension with the expanding frontier, its future uncertain.',
    ],
    tags: ['native', 'traditional', 'peaceful', 'cultural'],
  },

  // -------------------------------------------------------------------------
  // MILITARY & FORTIFICATIONS
  // -------------------------------------------------------------------------
  {
    id: 'loc_fort',
    name: 'Fort',
    locationType: 'fort',
    size: 'medium',
    namePoolId: 'fort_names',
    buildings: [
      { templateId: 'bld_sheriff_office', countRange: [1, 1], required: true },
      { templateId: 'bld_stable', countRange: [1, 2], required: true },
      { templateId: 'bld_warehouse', countRange: [1, 2], required: true },
      { templateId: 'bld_doctor', countRange: [1, 1], required: true },
      { templateId: 'bld_blacksmith', countRange: [1, 1], required: true },
      { templateId: 'bld_shack', countRange: [4, 8], required: false },
      { templateId: 'bld_church', countRange: [0, 1], required: false },
    ],
    backgroundNpcRange: [20, 40],
    notableNpcRange: [3, 6],
    validBiomes: ['plains', 'desert', 'grassland', 'valley', 'prairie'],
    descriptionTemplates: [
      'A military fort standing watch over the frontier, its walls a barrier against chaos.',
      '{{name}} represents federal authority in the wilderness, home to cavalry and infantry alike.',
      'The American flag flies over this frontier outpost, a symbol of order in lawless lands.',
      'Soldiers patrol the walls of {{name}}, keeping the peace - or enforcing it.',
    ],
    tags: ['military', 'authority', 'fortified', 'law'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a building template by ID
 */
export function getBuildingTemplateById(id: string): BuildingTemplate | undefined {
  return BUILDING_TEMPLATES.find((b) => b.id === id);
}

/**
 * Get a building template by type
 */
export function getBuildingTemplateByType(type: string): BuildingTemplate | undefined {
  return BUILDING_TEMPLATES.find((b) => b.type === type);
}

/**
 * Get all building templates that fit a town size
 */
export function getBuildingTemplatesForTownSize(
  size: 'hamlet' | 'village' | 'town' | 'city'
): BuildingTemplate[] {
  const sizeOrder = ['hamlet', 'village', 'town', 'city'];
  const sizeIndex = sizeOrder.indexOf(size);
  return BUILDING_TEMPLATES.filter((b) => {
    const minIndex = sizeOrder.indexOf(b.minTownSize);
    return minIndex <= sizeIndex;
  });
}

/**
 * Get a location template by ID
 */
export function getLocationTemplateById(id: string): LocationTemplate | undefined {
  return LOCATION_TEMPLATES.find((l) => l.id === id);
}

/**
 * Get location templates by type
 */
export function getLocationTemplatesByType(type: string): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => l.locationType === type);
}

/**
 * Get location templates valid for a specific biome
 */
export function getLocationTemplatesForBiome(biome: string): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => {
    const validBiomes = l.validBiomes ?? [];
    return validBiomes.length === 0 || validBiomes.includes(biome);
  });
}

/**
 * Get location templates by size
 */
export function getLocationTemplatesBySize(
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge'
): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => l.size === size);
}

/**
 * Get location templates with a specific tag
 */
export function getLocationTemplatesWithTag(tag: string): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => (l.tags ?? []).includes(tag));
}

/**
 * Get building templates with a specific tag
 */
export function getBuildingTemplatesWithTag(tag: string): BuildingTemplate[] {
  return BUILDING_TEMPLATES.filter((b) => b.tags.includes(tag));
}

/**
 * Get all NPC roles required by a location template
 */
export function getRequiredNpcRolesForLocation(templateId: string): string[] {
  const location = getLocationTemplateById(templateId);
  if (!location) return [];

  const roles: string[] = [];
  for (const buildingRef of location.buildings ?? []) {
    const building = getBuildingTemplateById(buildingRef.templateId);
    if (building) {
      for (const slot of building.npcSlots) {
        if (slot.required && !roles.includes(slot.role)) {
          roles.push(slot.role);
        }
      }
    }
  }
  return roles;
}

/**
 * Get all possible NPC roles for a location template
 */
export function getAllNpcRolesForLocation(templateId: string): string[] {
  const location = getLocationTemplateById(templateId);
  if (!location) return [];

  const roles: string[] = [];
  for (const buildingRef of location.buildings ?? []) {
    const building = getBuildingTemplateById(buildingRef.templateId);
    if (building) {
      for (const slot of building.npcSlots) {
        if (!roles.includes(slot.role)) {
          roles.push(slot.role);
        }
      }
    }
  }
  return roles;
}

/**
 * Calculate the total NPC capacity for a location template
 */
export function getNpcCapacityForLocation(templateId: string): { min: number; max: number } {
  const location = getLocationTemplateById(templateId);
  if (!location) return { min: 0, max: 0 };

  const backgroundNpcRange = location.backgroundNpcRange ?? [0, 5];
  let minTotal = backgroundNpcRange[0];
  let maxTotal = backgroundNpcRange[1];

  // Add building NPC slots
  for (const buildingRef of location.buildings ?? []) {
    const building = getBuildingTemplateById(buildingRef.templateId);
    if (building) {
      const countRange = buildingRef.countRange ?? [1, 1];
      const buildingMin = countRange[0];
      const buildingMax = countRange[1];

      for (const slot of building.npcSlots) {
        if (slot.required) {
          minTotal += buildingMin * slot.count;
        }
        maxTotal += buildingMax * slot.count;
      }
    }
  }

  // Add notable NPCs
  const notableNpcRange = location.notableNpcRange ?? [1, 3];
  minTotal += notableNpcRange[0];
  maxTotal += notableNpcRange[1];

  return { min: minTotal, max: maxTotal };
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

export const BUILDING_TEMPLATE_COUNT = BUILDING_TEMPLATES.length;
export const LOCATION_TEMPLATE_COUNT = LOCATION_TEMPLATES.length;

/**
 * Quick stats about the template library
 */
export function getTemplateStats(): {
  buildings: number;
  locations: number;
  npcRoles: string[];
  biomes: string[];
  tags: string[];
} {
  const npcRoles = new Set<string>();
  const biomes = new Set<string>();
  const tags = new Set<string>();

  for (const building of BUILDING_TEMPLATES) {
    for (const slot of building.npcSlots) {
      npcRoles.add(slot.role);
    }
    for (const tag of building.tags) {
      tags.add(tag);
    }
  }

  for (const location of LOCATION_TEMPLATES) {
    for (const biome of location.validBiomes ?? []) {
      biomes.add(biome);
    }
    for (const tag of location.tags ?? []) {
      tags.add(tag);
    }
  }

  return {
    buildings: BUILDING_TEMPLATES.length,
    locations: LOCATION_TEMPLATES.length,
    npcRoles: Array.from(npcRoles).sort(),
    biomes: Array.from(biomes).sort(),
    tags: Array.from(tags).sort(),
  };
}
