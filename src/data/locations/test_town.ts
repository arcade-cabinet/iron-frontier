/**
 * Test Town - Using assemblage library and explicit player spawn
 *
 * Demonstrates the town planner workflow:
 * 1. Reference assemblages from the library
 * 2. Place them with position and rotation
 * 3. Add custom base tiles for roads
 * 4. Specify explicit player spawn point
 */

import { Location, validateLocation } from '../schemas/spatial';

export const TestTown: Location = validateLocation({
  id: 'test_town',
  name: 'Dusty Springs',
  type: 'town',
  size: 'small',
  description: 'A small frontier town for testing the spatial system',

  seed: 12345,
  width: 24,
  height: 24,
  baseTerrain: 'sand',

  // =========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // Town planners compose locations from reusable pieces
  // =========================================================================
  assemblages: [
    // Central saloon - the heart of any frontier town
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'saloon_main',
      anchor: { q: 12, r: 10 },
      rotation: 0,
      tags: ['central', 'social_hub'],
      importance: 5,
    },

    // Sheriff office - law and order
    {
      assemblageId: 'asm_sheriff_01',
      instanceId: 'sheriff_office',
      anchor: { q: 8, r: 10 },
      rotation: 0,
      tags: ['law'],
      importance: 5,
    },

    // General store - essential services
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'general_store',
      anchor: { q: 16, r: 10 },
      rotation: 0,
      tags: ['commerce'],
      importance: 4,
    },

    // Town well - gathering spot
    {
      assemblageId: 'asm_well_01',
      instanceId: 'town_well',
      anchor: { q: 12, r: 7 },
      rotation: 0,
      tags: ['center'],
    },

    // Church on the edge of town
    {
      assemblageId: 'asm_church_01',
      instanceId: 'church',
      anchor: { q: 6, r: 14 },
      rotation: 2,
      tags: ['religious'],
    },

    // Residential - scattered cabins
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_north',
      anchor: { q: 8, r: 5 },
      rotation: 1,
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_south',
      anchor: { q: 16, r: 16 },
      rotation: 4,
    },
    {
      assemblageId: 'asm_house_01',
      instanceId: 'house_east',
      anchor: { q: 18, r: 6 },
      rotation: 3,
    },

    // Stable at edge of town
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'livery',
      anchor: { q: 4, r: 10 },
      rotation: 0,
      tags: ['mounts', 'edge'],
    },
  ],

  // No inline slots - using all assemblages from library
  slots: [],

  // =========================================================================
  // BASE TILES - Roads and custom terrain
  // =========================================================================
  baseTiles: [
    // Main street - east-west through town center
    { coord: { q: 4, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 14, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 20, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Entry road from west
    { coord: { q: 2, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 3, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // Entry road from east
    { coord: { q: 21, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 22, r: 11 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // North-south road to well
    { coord: { q: 12, r: 8 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 12, r: 9 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // Desert decorations
    { coord: { q: 3, r: 4 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 20, r: 5 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 4, r: 18 }, terrain: 'sand', feature: 'rock_large' },
    { coord: { q: 19, r: 17 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 2, r: 2 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 21, r: 19 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 10, r: 3 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 15, r: 19 }, terrain: 'sand', feature: 'cactus' },
  ],

  // =========================================================================
  // ENTRY POINTS - Where players can enter/exit
  // =========================================================================
  entryPoints: [
    {
      id: 'west_road',
      coord: { q: 2, r: 11 },
      direction: 'west',
      connectionType: 'road',
      tags: ['main', 'default'],
    },
    {
      id: 'east_road',
      coord: { q: 22, r: 11 },
      direction: 'east',
      connectionType: 'road',
      tags: [],
    },
  ],

  // =========================================================================
  // PLAYER SPAWN - Explicit spawn point for town planners
  // Player appears here facing toward the town center
  // =========================================================================
  playerSpawn: {
    coord: { q: 3, r: 11 },  // Just inside the west entrance
    facing: 0,              // Facing east (toward town)
  },

  // Atmosphere settings
  atmosphere: {
    dangerLevel: 1,
    wealthLevel: 4,
    populationDensity: 'sparse',
    lawLevel: 'frontier',
  },

  tags: ['test', 'western', 'starter'],
});

export default TestTown;
