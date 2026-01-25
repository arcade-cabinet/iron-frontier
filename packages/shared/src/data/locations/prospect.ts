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

import { Location, validateLocation } from '../schemas/spatial';

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
        { type: 'storage', name: 'grain_storage', offset: { q: 0, r: 0 }, tags: ['grain', 'agricultural'] },
        { type: 'spawn_point', name: 'worker', offset: { q: 0, r: 1 }, tags: ['npc', 'farmer'] },
      ],
      zones: [
        { type: 'public_area', name: 'loading_area', tiles: [{ q: 1, r: 0 }, { q: 0, r: 1 }], tags: [] },
        { type: 'loot_area', name: 'storage', tiles: [{ q: 0, r: 0 }], tags: ['grain', 'supplies'] },
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
    { coord: { q: 8, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 12, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 16, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 20, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 21, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 23, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Entry roads
    { coord: { q: 4, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 25, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 26, r: 15 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Path to well (north-south)
    { coord: { q: 15, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 15, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 15, r: 14 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // Path to church
    { coord: { q: 10, r: 11 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

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

  atmosphere: {
    dangerLevel: 1, // Safe farming community
    wealthLevel: 3, // Modest but hopeful
    populationDensity: 'sparse', // ~80 souls
    lawLevel: 'frontier', // Self-governing community
  },

  tags: ['dry_creek_valley', 'farming', 'former_mining', 'community', 'level_1_2', 'resilience'],
});

export default Prospect;
