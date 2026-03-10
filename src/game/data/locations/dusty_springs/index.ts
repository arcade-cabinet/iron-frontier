/**
 * Dusty Springs - Main Starting Town
 *
 * The beating heart of Iron Frontier. A frontier town of about 200 souls
 * where optimism meets the long shadow of corporate corruption.
 *
 * Layout (top-down, north is up):
 *   - Water tower and well at the town square, north of Main Street
 *   - Main Street runs east-west: livery, blacksmith, sheriff, hotel,
 *     saloon, mercantile, doc chen, then depot road branches north
 *   - Train depot and telegraph northeast, railroad runs east-west
 *   - Church and graveyard southwest of town
 *   - Holt mansion on a rise southeast
 *   - Cabins scattered at the edges
 *
 * Theme: Frontier optimism meets corporate corruption
 * Region: Central Plains (Level 1)
 *
 * Key Characters:
 * - Sheriff Marcus Cole - Honest lawman, overwhelmed
 * - Mayor Josephine Holt - In IVRC's pocket, but conflicted
 * - "Doc" Chen Wei - Town doctor, knows everyone's secrets
 * - Father Miguel - Priest, runs underground railroad for escaped workers
 */

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { dusty_springsAssemblages } from './assemblages.ts';
import { dusty_springsSlots } from './slots.ts';
import { dusty_springsBaseTiles } from './baseTiles.ts';
import { dusty_springsNpcMarkers } from './npcMarkers.ts';
import { dusty_springsRoads } from './roads.ts';
import { dusty_springsAtmosphere } from './atmosphere.ts';

export const DustySprings: Location = validateLocation({
  id: 'dusty_springs',
  name: 'Dusty Springs',
  type: 'town',
  size: 'medium',
  description:
    'A frontier town clinging to the edge of civilization. The railroad brought hope here, but the Iron Valley Railroad Company brought something else entirely.',
  lore: `Founded in 1879 when prospectors found a reliable spring in the otherwise parched plains.
The arrival of the railroad in '84 transformed it from a dusty waystation to a proper town.
Now it serves as IVRC's gateway to the western territories - for better or worse.`,

  seed: 18870401,
  width: 40,
  height: 40,
  baseTerrain: 'sand',

  // ===========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // Buildings placed along Main Street (r=19 centerline) with proper spacing.
  // North side buildings face south toward the street; south side face north.
  // ===========================================================================
  assemblages: [...dusty_springsAssemblages],

  // ===========================================================================
  // INLINE SLOT DEFINITIONS
  // ===========================================================================
  slots: [...dusty_springsSlots],

  // ===========================================================================
  // BASE TILES - Roads, terrain features, atmosphere details
  // Main Street runs east-west at r=19 (~7m wide packed dirt road)
  // ===========================================================================
  baseTiles: [...dusty_springsBaseTiles],

  // ===========================================================================
  // ENTRY POINTS
  // ===========================================================================
  entryPoints: [
    {
      id: 'west_road',
      coord: { q: 2, r: 19 },
      direction: 'west',
      connectionType: 'road',
      tags: ['main', 'default', 'player_start'],
    },
    {
      id: 'east_road',
      coord: { q: 38, r: 19 },
      direction: 'east',
      connectionType: 'road',
      tags: ['junction_city'],
    },
    {
      id: 'train_depot',
      coord: { q: 34, r: 12 },
      direction: 'east',
      connectionType: 'railroad',
      tags: ['railroad', 'fast_travel'],
    },
  ],

  // ===========================================================================
  // PLAYER SPAWN
  // Arriving from the west road, the drifter sees Main Street stretching
  // ahead with the water tower rising above the rooftops in the distance.
  // ===========================================================================
  playerSpawn: {
    coord: { q: 4, r: 19 },
    facing: 0, // Facing east toward Main Street and the water tower
  },

  // ===========================================================================
  // NPC MARKERS
  // ===========================================================================
  npcMarkers: [...dusty_springsNpcMarkers],

  // ===========================================================================
  // ROADS - Proper 3D road network with widths
  // ===========================================================================
  roads: [...dusty_springsRoads],

  // ===========================================================================
  // ATMOSPHERE
  // ===========================================================================
  atmosphere: dusty_springsAtmosphere,

  tags: ['starter', 'western', 'town', 'main', 'dusty_springs', 'central_plains'],
});

export default DustySprings;
