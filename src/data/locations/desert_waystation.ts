/**
 * Desert Waystation - Rest stop along trade routes
 *
 * A small waystation in the desert with oasis, rest facilities, and stables.
 */

import { Location, validateLocation } from '../schemas/spatial';

export const DesertWaystation: Location = validateLocation({
  id: 'desert_waystation',
  name: "Coyote Springs",
  type: 'waystation',
  size: 'small',
  description: 'A welcome rest stop in the unforgiving desert',

  seed: 77777,
  width: 16,
  height: 16,
  baseTerrain: 'sand',

  assemblages: [
    // Main waystation building
    {
      assemblageId: 'asm_waystation_01',
      instanceId: 'main_station',
      anchor: { q: 8, r: 6 },
      rotation: 0,
      tags: ['service', 'rest'],
      importance: 5,
    },

    // Oasis water source
    {
      assemblageId: 'asm_oasis_01',
      instanceId: 'spring',
      anchor: { q: 5, r: 9 },
      rotation: 0,
      tags: ['water', 'valuable'],
      importance: 5,
    },

    // Campfire area for travelers
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'traveler_camp',
      anchor: { q: 10, r: 10 },
      rotation: 1,
      tags: ['travelers', 'social'],
    },

    // Rock formation for shade/cover
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'shade_rocks',
      anchor: { q: 3, r: 5 },
      rotation: 4,
      tags: ['natural', 'cover'],
    },
  ],

  slots: [],

  baseTiles: [
    // Main trail through the waystation
    { coord: { q: 2, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 3, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 4, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 8, r: 8 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 12, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 8 }, terrain: 'sand', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Desert decorations - cacti and rocks
    { coord: { q: 2, r: 3 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 12, r: 4 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 13, r: 11 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 2, r: 12 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 14, r: 6 }, terrain: 'sand_dunes', feature: 'none' },
    { coord: { q: 1, r: 5 }, terrain: 'sand_dunes', feature: 'none' },

    // Dead tree - harsh environment
    { coord: { q: 11, r: 3 }, terrain: 'sand', feature: 'tree_dead' },
  ],

  entryPoints: [
    {
      id: 'west_trail',
      coord: { q: 1, r: 8 },
      direction: 'west',
      connectionType: 'trail',
      tags: ['main', 'default'],
    },
    {
      id: 'east_trail',
      coord: { q: 14, r: 8 },
      direction: 'east',
      connectionType: 'trail',
      tags: [],
    },
  ],

  playerSpawn: {
    coord: { q: 3, r: 8 },
    facing: 0, // Facing east toward the station
  },

  atmosphere: {
    dangerLevel: 2, // Relatively safe rest stop
    wealthLevel: 2, // Modest
    populationDensity: 'sparse',
    lawLevel: 'minimal',
  },

  tags: ['desert', 'rest_stop', 'water', 'trade_route'],
});

export default DesertWaystation;
