/**
 * Prospect - Failed Mining Town Turned Farming Community
 *
 * A small town in Dry Creek Valley that once dreamed of silver riches.
 * When the mines went dry, the stubborn folk who stayed turned to farming.
 * The abandoned mine shaft stands as a reminder of what brought them here,
 * while grain silos and farmsteads speak to what keeps them going.
 *
 * Theme: Resilience, new beginnings, community
 * Level: 1-2 (Dry Creek Valley)
 */

import { type Location, validateLocation } from '../schemas/spatial';

export const Prospect: Location = validateLocation({
  id: 'prospect',
  name: 'Prospect',
  type: 'village',
  size: 'small',
  description: 'A failed mining town finding new life as a farming community',
  lore: 'They came for silver and found only dust. But the ones who stayed found something better - each other. Now the old assay office rings with town meetings instead of ore samples, and the fields grow tall with hope.',

  seed: 45892,
  width: 30,
  height: 30,
  baseTerrain: 'grass',

  // =========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // =========================================================================
  assemblages: [
    // Town Hall (Former Assay Office) - Using house as the civic building
    // Repurposed as community center
    {
      assemblageId: 'asm_house_01',
      instanceId: 'town_hall',
      anchor: { q: 14, r: 14 },
      rotation: 0,
      slotTypeOverride: 'meeting_point',
      tags: ['civic', 'community', 'former_assay'],
      importance: 5,
    },

    // General Store - Basic supplies for the farming community
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'general_store',
      anchor: { q: 18, r: 14 },
      rotation: 0,
      tags: ['commerce', 'essential'],
      importance: 4,
    },

    // Boarding House - Simple lodging (using small tavern)
    {
      assemblageId: 'asm_tavern_small_01',
      instanceId: 'boarding_house',
      anchor: { q: 10, r: 14 },
      rotation: 0,
      slotTypeOverride: 'hotel',
      tags: ['lodging', 'simple'],
      importance: 3,
    },

    // Blacksmith - Farm equipment focus (using workshop/gunsmith shell)
    {
      assemblageId: 'asm_gunsmith_01',
      instanceId: 'blacksmith',
      anchor: { q: 22, r: 14 },
      rotation: 0,
      slotTypeOverride: 'workshop',
      tags: ['industrial', 'farm_equipment'],
      importance: 3,
    },

    // Abandoned Mine Shaft - Reminder of the past
    {
      assemblageId: 'asm_mine_01',
      instanceId: 'abandoned_mine',
      anchor: { q: 6, r: 6 },
      rotation: 2,
      slotTypeOverride: 'ruins',
      tags: ['abandoned', 'history', 'dangerous'],
      importance: 2,
    },

    // Central Well - Town gathering spot
    {
      assemblageId: 'asm_well_01',
      instanceId: 'town_well',
      anchor: { q: 15, r: 11 },
      rotation: 0,
      tags: ['center', 'gathering', 'social'],
      importance: 4,
    },

    // Small Church - Community faith
    {
      assemblageId: 'asm_church_01',
      instanceId: 'church',
      anchor: { q: 10, r: 8 },
      rotation: 1,
      tags: ['religious', 'community', 'sanctuary'],
      importance: 3,
    },

    // Farmstead 1 - North of town
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_north',
      anchor: { q: 20, r: 6 },
      rotation: 0,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Farmstead 2 - East of town
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_east',
      anchor: { q: 24, r: 18 },
      rotation: 4,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Farmstead 3 - South of town
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_south',
      anchor: { q: 14, r: 22 },
      rotation: 2,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Farmstead 4 - West side
    {
      assemblageId: 'asm_farm_small_01',
      instanceId: 'farmstead_west',
      anchor: { q: 4, r: 18 },
      rotation: 5,
      tags: ['agriculture', 'residential'],
      importance: 2,
    },

    // Residential cabins - Townsfolk homes
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_1',
      anchor: { q: 8, r: 18 },
      rotation: 1,
      tags: ['residential'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_2',
      anchor: { q: 20, r: 10 },
      rotation: 3,
      tags: ['residential'],
    },
  ],

  // Inline slot for grain silo (custom, not in library)
  slots: [
    {
      id: 'grain_silo',
      type: 'farm',
      name: 'Grain Silo',
      anchor: { q: 16, r: 18 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'warehouse', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'silo_door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
        {
          type: 'storage',
          name: 'grain_storage',
          offset: { q: 0, r: 0 },
          tags: ['grain', 'agricultural'],
        },
        { type: 'spawn_point', name: 'worker', offset: { q: 0, r: 1 }, tags: ['npc', 'farmer'] },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'loading_area',
          tiles: [
            { q: 1, r: 0 },
            { q: 0, r: 1 },
          ],
          tags: [],
        },
        {
          type: 'loot_area',
          name: 'storage',
          tiles: [{ q: 0, r: 0 }],
          tags: ['grain', 'supplies'],
        },
      ],
      tags: ['agricultural', 'new_economy', 'hope'],
      importance: 4,
    },
  ],

  // =========================================================================
  // BASE TILES - Roads, paths, and terrain
  // =========================================================================
  baseTiles: [
    // Main street - runs through town center (east-west)
    {
      coord: { q: 8, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 9, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 11, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 12, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 13, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 15, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 16, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 17, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 19, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 20, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 21, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 23, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Entry roads
    {
      coord: { q: 4, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 5, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 6, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 7, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 25, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },
    {
      coord: { q: 26, r: 15 },
      terrain: 'dirt',
      edges: ['road', 'none', 'none', 'road', 'none', 'none'],
    },

    // Path to well (north-south)
    {
      coord: { q: 15, r: 12 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 13 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 15, r: 14 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Path to church
    {
      coord: { q: 10, r: 11 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 12 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 13 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // Trail to old mine
    { coord: { q: 7, r: 10 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 6, r: 9 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 6, r: 8 }, terrain: 'dirt', feature: 'none' },

    // Grassland with scattered vegetation - natural prairie feel
    { coord: { q: 3, r: 4 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 26, r: 8 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 12, r: 4 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 24, r: 4 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 4, r: 24 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 26, r: 22 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 8, r: 26 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 18, r: 26 }, terrain: 'grass', feature: 'tree' },

    // Old mining debris near abandoned mine
    { coord: { q: 4, r: 5 }, terrain: 'stone_rocks', feature: 'rock_small' },
    { coord: { q: 8, r: 4 }, terrain: 'stone', feature: 'boulder' },
    { coord: { q: 5, r: 8 }, terrain: 'dirt', feature: 'rock_large' },

    // Fence posts marking farmland (decorative)
    { coord: { q: 22, r: 4 }, terrain: 'grass', feature: 'rock_small' },
    { coord: { q: 26, r: 20 }, terrain: 'grass', feature: 'rock_small' },
  ],

  // =========================================================================
  // ENTRY POINTS
  // =========================================================================
  entryPoints: [
    {
      id: 'west_road',
      coord: { q: 3, r: 15 },
      direction: 'west',
      connectionType: 'road',
      tags: ['main', 'default'],
    },
    {
      id: 'east_road',
      coord: { q: 27, r: 15 },
      direction: 'east',
      connectionType: 'road',
      tags: ['thornwood_direction'],
    },
    {
      id: 'north_trail',
      coord: { q: 15, r: 2 },
      direction: 'north',
      connectionType: 'trail',
      tags: ['farm_access'],
    },
  ],

  // Player spawns on the west road, facing into town
  playerSpawn: {
    coord: { q: 5, r: 15 },
    facing: 0, // Facing east toward town center
  },

  npcMarkers: [
    // Mayor / community leader at the town hall (former assay office)
    {
      role: 'mayor',
      position: { x: 56, y: 0, z: 56 },
      facing: 180,
      activity: 'standing',
      assignedTo: 'town_hall',
      tags: ['civic', 'quest_giver', 'community_leader'],
    },
    // Shopkeeper inside the general store
    {
      role: 'shopkeeper',
      position: { x: 72, y: 0, z: 56 },
      facing: 180,
      activity: 'working',
      assignedTo: 'general_store',
      tags: ['commerce', 'trade'],
    },
    // Innkeeper at the boarding house
    {
      role: 'innkeeper',
      position: { x: 40, y: 0, z: 56 },
      facing: 90,
      activity: 'standing',
      assignedTo: 'boarding_house',
      tags: ['lodging', 'social', 'rumors'],
    },
    // Blacksmith working at the forge
    {
      role: 'blacksmith',
      position: { x: 88, y: 0, z: 56 },
      facing: 0,
      activity: 'working',
      assignedTo: 'blacksmith',
      tags: ['industrial', 'farm_equipment', 'service'],
    },
    // Pastor at the church
    {
      role: 'pastor',
      position: { x: 40, y: 0, z: 32 },
      facing: 180,
      activity: 'standing',
      assignedTo: 'church',
      tags: ['religious', 'healing', 'community'],
    },
    // Farmer on the north farmstead
    {
      role: 'farmer',
      position: { x: 80, y: 0, z: 24 },
      facing: 180,
      activity: 'working',
      assignedTo: 'farmstead_north',
      tags: ['agriculture', 'resident'],
    },
    // Farmer on the east farmstead, patrolling between fields
    {
      role: 'farmer',
      position: { x: 96, y: 0, z: 72 },
      facing: 270,
      activity: 'patrolling',
      assignedTo: 'farmstead_east',
      waypoints: [
        { x: 96, y: 0, z: 72 },
        { x: 96, y: 0, z: 80 },
        { x: 88, y: 0, z: 80 },
        { x: 88, y: 0, z: 72 },
      ],
      tags: ['agriculture', 'resident'],
    },
    // Farmer on the south farmstead near the grain silo
    {
      role: 'farmer',
      position: { x: 56, y: 0, z: 88 },
      facing: 0,
      activity: 'working',
      assignedTo: 'farmstead_south',
      tags: ['agriculture', 'grain', 'resident'],
    },
    // Old prospector lingering near the abandoned mine
    {
      role: 'prospector',
      position: { x: 24, y: 0, z: 24 },
      facing: 90,
      activity: 'sitting',
      assignedTo: 'abandoned_mine',
      tags: ['lore', 'history', 'storyteller'],
    },
    // Townsfolk at the well (social gathering)
    {
      role: 'townsfolk',
      position: { x: 60, y: 0, z: 44 },
      facing: 270,
      activity: 'standing',
      assignedTo: 'town_well',
      tags: ['social', 'gossip', 'community'],
    },
  ],

  roads: [
    // Main street running east-west through town center
    {
      id: 'main_street',
      type: 'main_street',
      width: 6,
      surface: 'dirt',
      points: [
        { x: 12, y: 0, z: 60 },
        { x: 40, y: 0, z: 60 },
        { x: 60, y: 0, z: 60 },
        { x: 88, y: 0, z: 60 },
        { x: 108, y: 0, z: 60 },
      ],
      tags: ['primary', 'east_west'],
    },
    // Path north from main street to the well and church
    {
      id: 'well_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 60 },
        { x: 60, y: 0, z: 44 },
      ],
      tags: ['north', 'to_well'],
    },
    // Path from well to church
    {
      id: 'church_path',
      type: 'side_street',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 44 },
        { x: 40, y: 0, z: 36 },
        { x: 40, y: 0, z: 32 },
      ],
      tags: ['to_church'],
    },
    // Trail to the abandoned mine (overgrown, narrow)
    {
      id: 'mine_trail',
      type: 'trail',
      width: 2,
      surface: 'packed_earth',
      points: [
        { x: 40, y: 0, z: 36 },
        { x: 28, y: 0, z: 32 },
        { x: 24, y: 0, z: 24 },
      ],
      tags: ['abandoned', 'overgrown', 'to_mine'],
    },
    // Farm road north to farmsteads
    {
      id: 'north_farm_road',
      type: 'trail',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 44 },
        { x: 60, y: 0, z: 20 },
        { x: 80, y: 0, z: 24 },
      ],
      tags: ['farm_access', 'north'],
    },
    // Farm road south to grain silo and south farmstead
    {
      id: 'south_farm_road',
      type: 'trail',
      width: 3,
      surface: 'dirt',
      points: [
        { x: 60, y: 0, z: 60 },
        { x: 56, y: 0, z: 72 },
        { x: 56, y: 0, z: 88 },
      ],
      tags: ['farm_access', 'south', 'to_silo'],
    },
  ],

  atmosphere: {
    dangerLevel: 1, // Safe farming community
    wealthLevel: 3, // Modest but hopeful
    populationDensity: 'sparse', // ~80 souls
    lawLevel: 'frontier', // Self-governing community

    sound: {
      base: 'prairie_breeze',
      accents: ['rooster_crow', 'cattle_low', 'church_bell', 'dog_bark', 'cart_creak'],
    },

    lighting: {
      lanternPositions: [
        { x: 56, y: 3, z: 56 },  // Town hall entrance
        { x: 72, y: 3, z: 56 },  // General store porch
        { x: 40, y: 3, z: 56 },  // Boarding house entrance
        { x: 60, y: 3, z: 44 },  // Near the well
        { x: 40, y: 3, z: 32 },  // Church entrance
      ],
      litWindows: ['town_hall', 'general_store', 'boarding_house', 'church'],
      campfires: [],
      peakActivity: 'morning',
    },

    weather: {
      dominant: 'clear',
      variability: 'mild',
      particleEffect: 'none',
    },
  },

  tags: ['dry_creek_valley', 'farming', 'former_mining', 'community', 'level_1_2', 'resilience'],
});

export default Prospect;
