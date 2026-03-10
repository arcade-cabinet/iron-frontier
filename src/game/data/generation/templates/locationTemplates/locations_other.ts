/**
 * Location Templates - Other
 */

import type { LocationTemplate } from '../../../schemas/generation.ts';

export const OTHER_LOCATION_TEMPLATES: LocationTemplate[] = [
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
  }
];
