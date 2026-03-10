/**
 * Location Templates - Settlements
 */

import type { LocationTemplate } from '../../../schemas/generation.ts';

export const SETTLEMENT_LOCATION_TEMPLATES: LocationTemplate[] = [
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
  }
];
