/**
 * Freeminer's Hollow - Independent Mining Community
 *
 * A tight-knit community of independent miners who've carved out a defensible
 * position in a box canyon. They resist IVRC's mining monopoly through solidarity
 * and mutual aid. Led by the wise Old Samuel Ironpick.
 *
 * Region: Iron Mountains (Level 3)
 * Themes: Independence, solidarity, resistance, community
 */

import { type Location, validateLocation } from '../schemas/spatial';

export const FreeminerHollow: Location = validateLocation({
  id: 'freeminer_hollow',
  name: "Freeminer's Hollow",
  type: 'camp',
  size: 'medium',
  description: 'An independent mining community nestled in a defensible box canyon',
  lore: `The hollow was discovered fifteen years back by a group of miners who'd had
enough of IVRC's crushing quotas and dangerous conditions. They carved out their own
stake in the mountains, where every man has a vote and every family has a share.
Old Samuel Ironpick has led them through lean winters and Pinkerton raids alike.
The IVRC wants this place gone—the example it sets is more dangerous to them than
any stolen ore.`,

  seed: 77342,
  width: 35,
  height: 30,
  baseTerrain: 'stone',

  assemblages: [
    // ========================================
    // MAIN SHAFT - Community-owned mine entrance
    // ========================================
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'main_shaft',
      anchor: { q: 20, r: 5 },
      rotation: 0,
      tags: ['primary', 'industrial', 'community_owned'],
      importance: 5,
    },

    // ========================================
    // MEETING HALL - Democratic decision center
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'meeting_hall',
      anchor: { q: 15, r: 12 },
      rotation: 0,
      slotTypeOverride: 'meeting_point',
      tags: ['civic', 'important', 'democracy'],
      importance: 5,
    },

    // ========================================
    // SAMUEL'S CABIN - Old Samuel Ironpick's home
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'samuel_cabin',
      anchor: { q: 10, r: 8 },
      rotation: 1,
      tags: ['residence', 'leader', 'quest_giver'],
      importance: 4,
    },

    // ========================================
    // COMMUNAL KITCHEN - Shared meals
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'communal_kitchen',
      anchor: { q: 18, r: 14 },
      rotation: 2,
      slotTypeOverride: 'tavern',
      tags: ['social', 'food', 'community'],
      importance: 3,
    },

    // ========================================
    // BUNKHOUSES - Worker housing (4 total)
    // ========================================
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_1',
      anchor: { q: 8, r: 14 },
      rotation: 0,
      tags: ['residence', 'workers'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_2',
      anchor: { q: 12, r: 16 },
      rotation: 5,
      tags: ['residence', 'workers'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_3',
      anchor: { q: 22, r: 16 },
      rotation: 1,
      tags: ['residence', 'workers'],
      importance: 2,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'bunkhouse_4',
      anchor: { q: 26, r: 14 },
      rotation: 2,
      tags: ['residence', 'workers', 'families'],
      importance: 2,
    },

    // ========================================
    // TOOL CACHE - Shared equipment storage
    // ========================================
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'tool_cache',
      anchor: { q: 25, r: 8 },
      rotation: 3,
      slotTypeOverride: 'workshop',
      tags: ['industrial', 'tools', 'shared'],
      importance: 3,
    },

    // ========================================
    // LOOKOUT POST - Watching for IVRC
    // ========================================
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'lookout_post',
      anchor: { q: 5, r: 5 },
      rotation: 0,
      slotTypeOverride: 'landmark',
      tags: ['defensive', 'lookout', 'guard'],
      importance: 4,
    },

    // ========================================
    // CAMPFIRE CIRCLE - Social gathering
    // ========================================
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'campfire_circle',
      anchor: { q: 16, r: 18 },
      rotation: 0,
      tags: ['social', 'gathering', 'stories'],
      importance: 3,
    },

    // ========================================
    // ORE PROCESSING - Small scale smelting
    // ========================================
    {
      assemblageId: 'asm_tent_camp_01',
      instanceId: 'ore_processing',
      anchor: { q: 24, r: 10 },
      rotation: 4,
      slotTypeOverride: 'smelter',
      tags: ['industrial', 'processing'],
      importance: 3,
    },

    // ========================================
    // SECONDARY LOOKOUT - Canyon rim watch
    // ========================================
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'rim_watch',
      anchor: { q: 28, r: 4 },
      rotation: 1,
      tags: ['defensive', 'lookout'],
      importance: 2,
    },
  ],

  slots: [
    // ========================================
    // HIDDEN STORES - Supplies stashed in rocks
    // Custom slot for the hidden cache areas
    // ========================================
    {
      id: 'hidden_stores_1',
      type: 'hidden_cache',
      name: 'Western Cache',
      anchor: { q: 3, r: 10 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'rock_large' },
        { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'rock_small' },
      ],
      markers: [
        {
          type: 'storage',
          name: 'emergency_supplies',
          offset: { q: 0, r: 0 },
          tags: ['hidden', 'emergency'],
        },
        { type: 'hiding_spot', name: 'cache_entrance', offset: { q: 1, r: 0 }, tags: ['secret'] },
      ],
      zones: [
        {
          type: 'loot_area',
          name: 'hidden_goods',
          tiles: [{ q: 0, r: 0 }],
          tags: ['hidden', 'valuable'],
        },
      ],
      tags: ['hidden', 'emergency', 'secret'],
      importance: 3,
    },
    {
      id: 'hidden_stores_2',
      type: 'hidden_cache',
      name: 'Northern Cache',
      anchor: { q: 15, r: 3 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large' },
      ],
      markers: [
        {
          type: 'storage',
          name: 'weapon_cache',
          offset: { q: 0, r: 0 },
          tags: ['hidden', 'weapons'],
        },
        {
          type: 'evidence_spot',
          name: 'ivrc_documents',
          offset: { q: -1, r: 0 },
          tags: ['clue', 'quest'],
        },
      ],
      zones: [
        {
          type: 'loot_area',
          name: 'arms_cache',
          tiles: [
            { q: 0, r: 0 },
            { q: -1, r: 0 },
          ],
          tags: ['weapons', 'hidden'],
        },
      ],
      tags: ['hidden', 'weapons', 'resistance'],
      importance: 4,
    },
  ],

  baseTiles: [
    // ========================================
    // BOX CANYON WALLS - Defensive perimeter
    // North wall (impassable mountains)
    // ========================================
    { coord: { q: 0, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 1, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 2, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 3, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 4, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 5, r: 0 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 6, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 7, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 8, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 9, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 10, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 11, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 12, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 13, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 14, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 15, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 16, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 17, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 18, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 19, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 20, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 21, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 22, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 23, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 24, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 25, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 26, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 27, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 28, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 29, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 30, r: 1 }, terrain: 'stone_mountain', feature: 'none' },

    // West wall
    { coord: { q: 0, r: 1 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 4 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 5 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 6 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 7 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 8 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 9 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 10 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 11 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 13 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 14 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 0, r: 15 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 1, r: 16 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 1, r: 17 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 2, r: 18 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 2, r: 19 }, terrain: 'stone_mountain', feature: 'none' },

    // East wall
    { coord: { q: 31, r: 2 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 3 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 4 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 5 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 6 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 7 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 8 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 9 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 10 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 11 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 12 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 13 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 31, r: 14 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 30, r: 15 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 30, r: 16 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 29, r: 17 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 29, r: 18 }, terrain: 'stone_mountain', feature: 'none' },
    { coord: { q: 28, r: 19 }, terrain: 'stone_mountain', feature: 'none' },

    // ========================================
    // CANYON FLOOR - Main paths
    // ========================================
    // Entry path from south
    {
      coord: { q: 16, r: 26 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 25 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 24 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 23 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 22 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 21 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 20 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 16, r: 19 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Central plaza area
    { coord: { q: 15, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 16, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 17, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 16, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 17, r: 16 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 15, r: 17 }, terrain: 'dirt', feature: 'none' },

    // Path to mine
    {
      coord: { q: 18, r: 10 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 18, r: 9 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 18, r: 8 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'road', 'none'],
    },
    {
      coord: { q: 19, r: 7 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 6 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // ========================================
    // ROCKY TERRAIN & VEGETATION
    // ========================================
    // Stone hillocks around the hollow
    { coord: { q: 5, r: 8 }, terrain: 'stone_hill', feature: 'rock_small' },
    { coord: { q: 6, r: 10 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 27, r: 6 }, terrain: 'stone_hill', feature: 'rock_large' },
    { coord: { q: 28, r: 12 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 4, r: 15 }, terrain: 'stone_hill', feature: 'ore_vein' },
    { coord: { q: 29, r: 10 }, terrain: 'stone_rocks', feature: 'ore_vein' },

    // Sparse grass patches in sheltered areas
    { coord: { q: 12, r: 10 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 14, r: 8 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 20, r: 18 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 24, r: 18 }, terrain: 'grass', feature: 'none' },
    { coord: { q: 8, r: 18 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 10, r: 20 }, terrain: 'grass', feature: 'bush' },

    // Water source - small spring
    { coord: { q: 6, r: 12 }, terrain: 'water_shallow', feature: 'spring' },
    { coord: { q: 7, r: 12 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 6, r: 13 }, terrain: 'grass', feature: 'none' },

    // Elevated areas near mine
    { coord: { q: 21, r: 3 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
    { coord: { q: 22, r: 3 }, terrain: 'stone_hill', elevation: 1, feature: 'none' },
    { coord: { q: 23, r: 3 }, terrain: 'stone_hill', elevation: 1, feature: 'ore_vein' },
  ],

  entryPoints: [
    {
      id: 'canyon_entrance',
      coord: { q: 16, r: 27 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['main', 'default', 'narrow'],
    },
  ],

  playerSpawn: {
    coord: { q: 16, r: 24 },
    facing: 5, // Facing north into the hollow
  },

  npcMarkers: [
    // Old Samuel Ironpick - at his cabin, the community leader
    {
      role: 'community_leader',
      position: { x: 40, y: 0, z: 32 },
      facing: 90,
      activity: 'standing',
      assignedTo: 'samuel_cabin',
      tags: ['quest_giver', 'leader', 'resistance'],
    },
    // Lookout guard on the western rocks
    {
      role: 'lookout',
      position: { x: 20, y: 4, z: 20 },
      facing: 180,
      activity: 'guarding',
      assignedTo: 'lookout_post',
      tags: ['defensive', 'guard'],
    },
    // Cook at the communal kitchen
    {
      role: 'cook',
      position: { x: 72, y: 0, z: 56 },
      facing: 270,
      activity: 'working',
      assignedTo: 'communal_kitchen',
      tags: ['food', 'community'],
    },
    // Miner patrolling between shaft and processing
    {
      role: 'miner',
      position: { x: 80, y: 0, z: 20 },
      facing: 0,
      activity: 'patrolling',
      assignedTo: 'main_shaft',
      waypoints: [
        { x: 80, y: 0, z: 20 },
        { x: 96, y: 0, z: 40 },
        { x: 80, y: 0, z: 40 },
      ],
      tags: ['worker', 'industrial'],
    },
    // Storyteller near the campfire circle
    {
      role: 'storyteller',
      position: { x: 64, y: 0, z: 72 },
      facing: 0,
      activity: 'sitting',
      assignedTo: 'campfire_circle',
      tags: ['social', 'lore'],
    },
  ],

  roads: [
    {
      id: 'canyon_entry',
      type: 'trail',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 64, y: 0, z: 108 },
        { x: 64, y: 0, z: 80 },
        { x: 64, y: 0, z: 60 },
      ],
      tags: ['primary', 'south_entry'],
    },
    {
      id: 'mine_path',
      type: 'trail',
      width: 2.5,
      surface: 'stone',
      points: [
        { x: 64, y: 0, z: 60 },
        { x: 72, y: 0, z: 40 },
        { x: 80, y: 0, z: 20 },
      ],
      tags: ['mine_access'],
    },
  ],

  atmosphere: {
    dangerLevel: 3,
    wealthLevel: 4,
    populationDensity: 'normal',
    lawLevel: 'frontier',

    sound: {
      base: 'mountain_wind',
      accents: ['pickaxe_clink', 'blacksmith_hammer', 'owl_hoot'],
    },

    lighting: {
      lanternPositions: [
        { x: 60, y: 3, z: 48 },  // Meeting hall entrance
        { x: 40, y: 3, z: 32 },  // Samuel's cabin
        { x: 80, y: 3, z: 20 },  // Mine entrance
      ],
      litWindows: ['meeting_hall', 'samuel_cabin', 'communal_kitchen'],
      campfires: [
        { x: 64, y: 0, z: 72 },  // Campfire circle
      ],
      peakActivity: 'evening',
    },

    weather: {
      dominant: 'overcast',
      variability: 'moderate',
      particleEffect: 'none',
    },
  },

  tags: ['freeminers', 'community', 'mining', 'resistance', 'defensible', 'mountain'],
});

export default FreeminerHollow;
