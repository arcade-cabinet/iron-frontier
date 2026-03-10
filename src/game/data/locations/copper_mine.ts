/**
 * Copper Mine - Industrial mining location
 *
 * A working copper mine set into a rocky hillside. The mine entrance
 * gapes open at the north end, framed by timber supports and ore-cart
 * tracks. The foreman's cabin sits west of the main path, overlooking
 * operations. Workers' tents cluster to the southwest around a communal
 * campfire. A mule stable to the east houses the pack animals that haul
 * ore down to the processing works. Rocky terrain and sparse vegetation
 * surround the site.
 */

import { type Location, validateLocation } from '../schemas/spatial';

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
    {
      coord: { q: 9, r: 7 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 8 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 9 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'road', 'none'],
    },
    {
      coord: { q: 8, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 7, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 6, r: 10 },
      terrain: 'dirt',
      edges: ['road', 'none', 'road', 'none', 'none', 'none'],
    },

    // Entry path
    {
      coord: { q: 9, r: 15 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 14 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 13 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 12 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 11 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 9, r: 10 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

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

  npcMarkers: [
    // Mine foreman outside his cabin, watching the operation
    {
      role: 'foreman',
      position: { x: 20, y: 0, z: 32 },
      facing: 90,
      activity: 'standing',
      assignedTo: 'foreman_cabin',
      tags: ['management', 'quest_giver'],
    },
    // Miner heading into the shaft
    {
      role: 'miner',
      position: { x: 36, y: 0, z: 20 },
      facing: 0,
      activity: 'working',
      assignedTo: 'mine_entrance',
      tags: ['worker', 'copper'],
    },
    // Mule handler at the stable
    {
      role: 'mule_handler',
      position: { x: 48, y: 0, z: 40 },
      facing: 270,
      activity: 'working',
      assignedTo: 'mule_stable',
      tags: ['logistics', 'animals'],
    },
    // Camp cook at the campfire
    {
      role: 'cook',
      position: { x: 20, y: 0, z: 48 },
      facing: 0,
      activity: 'working',
      assignedTo: 'camp_fire',
      tags: ['worker', 'social'],
    },
    // Guard patrolling the perimeter
    {
      role: 'guard',
      position: { x: 36, y: 0, z: 56 },
      facing: 180,
      activity: 'patrolling',
      waypoints: [
        { x: 36, y: 0, z: 56 },
        { x: 48, y: 0, z: 48 },
        { x: 48, y: 0, z: 28 },
        { x: 36, y: 0, z: 20 },
        { x: 20, y: 0, z: 28 },
        { x: 12, y: 0, z: 40 },
      ],
      tags: ['security', 'armed'],
    },
  ],

  roads: [
    // Main road from southern entry up to the mine entrance
    {
      id: 'mine_road',
      type: 'main_street',
      width: 5,
      surface: 'dirt',
      points: [
        { x: 36, y: 0, z: 64 },
        { x: 36, y: 0, z: 40 },
        { x: 36, y: 0, z: 20 },
      ],
      tags: ['primary', 'south_entry'],
    },
    // Branch west to foreman's cabin and worker camp
    {
      id: 'camp_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 36, y: 0, z: 40 },
        { x: 24, y: 0, z: 40 },
        { x: 20, y: 0, z: 48 },
      ],
      tags: ['west', 'to_camp'],
    },
    // Branch east to mule stable
    {
      id: 'stable_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 36, y: 0, z: 40 },
        { x: 48, y: 0, z: 40 },
      ],
      tags: ['east', 'to_stable'],
    },
  ],

  atmosphere: {
    dangerLevel: 3, // Moderate - cave-ins, bandits
    wealthLevel: 4, // Good money in mining
    populationDensity: 'sparse',
    lawLevel: 'lawless',

    sound: {
      base: 'mine_echoes',
      accents: ['pickaxe_clink', 'cart_creak', 'steam_hiss'],
    },

    lighting: {
      lanternPositions: [
        { x: 36, y: 3, z: 20 },  // Mine entrance
        { x: 20, y: 3, z: 32 },  // Foreman's cabin porch
        { x: 48, y: 3, z: 40 },  // Stable entrance
      ],
      litWindows: ['foreman_cabin'],
      campfires: [
        { x: 20, y: 0, z: 48 },  // Worker campfire
      ],
      peakActivity: 'morning',
    },

    weather: {
      dominant: 'dusty',
      variability: 'mild',
      particleEffect: 'dust_light',
    },
  },

  tags: ['industrial', 'mining', 'resource'],
});

export default CopperMine;
