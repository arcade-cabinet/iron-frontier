import type { World } from '../schemas/world.ts';

type Region = World['regions'][number];

export const frontierRegions: Region[] = [
  {
    id: 'region_central_plains',
    name: 'Central Plains',
    description:
      "The railroad's domain. Fertile grassland dotted with ranches and the territory's only real towns. Order and corruption walk hand in hand under IVRC's watchful eye.",
    biome: 'grassland',
    baseDanger: 'low',
    bounds: { minX: 8, maxX: 16, minY: 6, maxY: 12 },
    discovered: true,
    tags: ['civilized', 'ranching', 'railroad', 'ivrc_territory'],
  },
  {
    id: 'region_western_desert',
    name: 'Western Desert',
    description:
      'Brutal scrubland between civilization and nowhere. The old stagecoach route before the railroad. Many have tried the crossing. Not all made it.',
    biome: 'desert',
    baseDanger: 'moderate',
    bounds: { minX: 0, maxX: 7, minY: 4, maxY: 12 },
    discovered: true,
    tags: ['harsh', 'old_route', 'survival'],
  },
  {
    id: 'region_dry_creek',
    name: 'Dry Creek Valley',
    description:
      'Southern scrubland with scattered homesteads. The newest settlements, still hopeful. Dreams and desperation in equal measure.',
    biome: 'scrubland',
    baseDanger: 'low',
    bounds: { minX: 4, maxX: 16, minY: 13, maxY: 15 },
    discovered: true,
    tags: ['frontier', 'farming', 'new_settlements'],
  },
  {
    id: 'region_devils_backbone',
    name: "Devil's Backbone",
    description:
      "Treacherous canyons and mesas where the law doesn't reach. Copperhead Gang territory. The red rock knows how to keep secrets.",
    biome: 'badlands',
    baseDanger: 'high',
    bounds: { minX: 4, maxX: 12, minY: 0, maxY: 5 },
    discovered: false,
    tags: ['dangerous', 'outlaw', 'copperhead_territory'],
  },
  {
    id: 'region_iron_mountains',
    name: 'Iron Mountains',
    description:
      "Mineral-rich peaks that everyone wants to control. IVRC's mining operations clash with the Freeminers Coalition. Copper dust in the air, blood in the soil.",
    biome: 'mountain',
    baseDanger: 'moderate',
    bounds: { minX: 13, maxX: 19, minY: 0, maxY: 5 },
    discovered: false,
    tags: ['mining', 'resources', 'contested', 'freeminer_territory'],
  },
];
