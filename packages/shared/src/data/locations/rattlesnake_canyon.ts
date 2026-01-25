/**
 * Rattlesnake Canyon - Bandit Hideout
 *
 * A dangerous outlaw camp hidden in a canyon. Combat-focused location.
 */

import { Location, validateLocation } from '../schemas/spatial';

export const RattlesnakeCanyon: Location = validateLocation({
  id: 'rattlesnake_canyon',
  name: 'Rattlesnake Canyon',
  type: 'camp',
  size: 'medium',
  description: 'A notorious outlaw hideout deep in the badlands',

  seed: 66666,
  width: 20,
  height: 16,
  baseTerrain: 'badlands',

  assemblages: [
    // Main bandit camp
    {
      assemblageId: 'asm_bandit_camp_01',
      instanceId: 'main_camp',
      anchor: { q: 10, r: 6 },
      rotation: 0,
      tags: ['hostile', 'primary'],
      importance: 5,
    },

    // Secondary lookout position
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'lookout_camp',
      anchor: { q: 5, r: 4 },
      rotation: 2,
      tags: ['hostile', 'lookout'],
    },

    // Canyon pass entrance
    {
      assemblageId: 'asm_canyon_01',
      instanceId: 'canyon_entrance',
      anchor: { q: 10, r: 12 },
      rotation: 0,
      tags: ['passage', 'ambush'],
    },

    // Rock cover positions
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'sniper_rocks',
      anchor: { q: 14, r: 5 },
      rotation: 1,
      tags: ['cover', 'tactical'],
    },

    // Loot stash in abandoned cabin
    {
      assemblageId: 'asm_ruins_cabin_01',
      instanceId: 'loot_cabin',
      anchor: { q: 7, r: 8 },
      rotation: 4,
      tags: ['loot', 'hidden'],
    },
  ],

  slots: [],

  baseTiles: [
    // Canyon floor path
    { coord: { q: 10, r: 14 }, terrain: 'canyon', feature: 'none' },
    { coord: { q: 10, r: 13 }, terrain: 'canyon', feature: 'none' },
    { coord: { q: 10, r: 11 }, terrain: 'canyon', feature: 'none' },
    { coord: { q: 10, r: 10 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 10, r: 9 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 10, r: 8 }, terrain: 'badlands', feature: 'none' },

    // Canyon walls (impassable mountains)
    { coord: { q: 8, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 9, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 11, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 12, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 8, r: 13 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 12, r: 13 }, terrain: 'stone_mountain', feature: 'none' },

    // Rocky terrain around camp
    { coord: { q: 6, r: 5 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 13, r: 7 }, terrain: 'stone_rocks', feature: 'rock_large' },
    { coord: { q: 8, r: 4 }, terrain: 'stone_hill', feature: 'rock_small' },
    { coord: { q: 15, r: 8 }, terrain: 'stone_rocks', feature: 'boulder' },

    // Badlands decoration
    { coord: { q: 3, r: 6 }, terrain: 'badlands', feature: 'rock_small' },
    { coord: { q: 16, r: 4 }, terrain: 'badlands', feature: 'rock_large' },
    { coord: { q: 4, r: 10 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 15, r: 10 }, terrain: 'badlands', feature: 'tree_dead' },

    // Some sandy patches
    { coord: { q: 12, r: 8 }, terrain: 'sand', feature: 'none' },
    { coord: { q: 8, r: 9 }, terrain: 'sand', feature: 'none' },
  ],

  entryPoints: [
    {
      id: 'canyon_mouth',
      coord: { q: 10, r: 15 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['main', 'default', 'dangerous'],
    },
  ],

  playerSpawn: {
    coord: { q: 10, r: 14 },
    facing: 5, // Facing into the canyon
  },

  atmosphere: {
    dangerLevel: 5, // Very dangerous
    wealthLevel: 3, // Stolen goods
    populationDensity: 'sparse',
    lawLevel: 'lawless',
  },

  tags: ['hostile', 'combat', 'bandit', 'loot', 'dangerous'],
});

export default RattlesnakeCanyon;
