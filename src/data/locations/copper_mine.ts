/**
 * Copper Mine - Industrial mining location
 *
 * A working mine with entrance, processing area, and workers' camp.
 */

import { Location, validateLocation } from '../schemas/spatial';

export const CopperMine: Location = validateLocation({
  id: 'copper_mine',
  name: 'Dusty Creek Mine',
  type: 'mine',
  size: 'medium',
  description: 'Active copper mining operation in the foothills',

  seed: 54321,
  width: 18,
  height: 18,
  baseTerrain: 'stone',

  assemblages: [
    // Main mine entrance
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'mine_entrance',
      anchor: { q: 9, r: 5 },
      rotation: 0,
      tags: ['primary', 'dungeon_entrance'],
      importance: 5,
    },

    // Foreman's cabin
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'foreman_cabin',
      anchor: { q: 5, r: 8 },
      rotation: 1,
      tags: ['management'],
      importance: 4,
    },

    // Workers' tent camp
    {
      assemblageId: 'asm_tent_camp_01',
      instanceId: 'workers_camp_1',
      anchor: { q: 3, r: 10 },
      rotation: 0,
      tags: ['workers'],
    },
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'camp_fire',
      anchor: { q: 5, r: 12 },
      rotation: 2,
      tags: ['workers', 'social'],
    },

    // Supply storage
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'mule_stable',
      anchor: { q: 12, r: 10 },
      rotation: 3,
      tags: ['logistics'],
    },
  ],

  slots: [],

  baseTiles: [
    // Path from entrance to mine
    { coord: { q: 9, r: 7 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 8 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 9 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'road', 'none'] },
    { coord: { q: 8, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 10 }, terrain: 'dirt', edges: ['road', 'none', 'road', 'none', 'none', 'none'] },

    // Entry path
    { coord: { q: 9, r: 15 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 14 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 11 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 9, r: 10 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // Rocky terrain around mine
    { coord: { q: 7, r: 4 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 11, r: 4 }, terrain: 'stone_rocks', feature: 'rock_large' },
    { coord: { q: 8, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 9, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 10, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 10, r: 4 }, terrain: 'stone_hill', feature: 'ore_vein' },

    // Some vegetation near camp
    { coord: { q: 2, r: 8 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 14, r: 12 }, terrain: 'grass', feature: 'bush' },
  ],

  entryPoints: [
    {
      id: 'main_road',
      coord: { q: 9, r: 16 },
      direction: 'south',
      connectionType: 'road',
      tags: ['main', 'default'],
    },
  ],

  playerSpawn: {
    coord: { q: 9, r: 14 },
    facing: 5, // Facing toward mine
  },

  atmosphere: {
    dangerLevel: 3, // Moderate - cave-ins, bandits
    wealthLevel: 4, // Good money in mining
    populationDensity: 'sparse',
    lawLevel: 'minimal',
  },

  tags: ['industrial', 'mining', 'resource'],
});

export default CopperMine;
