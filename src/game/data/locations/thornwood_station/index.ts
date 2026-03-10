/**
 * Thornwood Station - Southernmost Railroad Stop
 *
 * A small waystation where the Iron Valley Railroad ends its southern push.
 * For now. The tracks stop here at a modest wooden platform, but IVRC has
 * plans. This is where the frontier truly begins - or ends, depending on
 * which way you're traveling.
 *
 * Theme: Gateway, transition, travelers
 * Level: 1 (Dry Creek Valley - Entry Point)
 */

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { thornwood_stationAssemblages } from './assemblages.ts';
import { thornwood_stationSlots } from './slots.ts';
import { thornwood_stationBaseTiles } from './baseTiles.ts';
import { thornwood_stationNpcMarkers } from './npcMarkers.ts';
import { thornwood_stationRoads } from './roads.ts';
import { thornwood_stationAtmosphere } from './atmosphere.ts';

export const ThornwoodStation: Location = validateLocation({
  id: 'thornwood_station',
  name: 'Thornwood Station',
  type: 'outpost',
  size: 'tiny',
  description: 'The southernmost stop on the Iron Valley Railroad',
  lore: "The last spike was driven here three months ago. They say the railroad will push further south come spring, but for now, Thornwood Station marks the end of the line. Step off that train and you're in frontier country.",

  seed: 82341,
  width: 25,
  height: 20,
  baseTerrain: 'dirt',

  // =========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // =========================================================================
  assemblages: [...thornwood_stationAssemblages],

  // Inline slot for water tower (railroad infrastructure)
  slots: [...thornwood_stationSlots],

  // =========================================================================
  // BASE TILES - Railroad tracks and roads
  // =========================================================================
  baseTiles: [...thornwood_stationBaseTiles],

  // =========================================================================
  // ENTRY POINTS
  // =========================================================================
  entryPoints: [
    {
      id: 'train_arrival',
      coord: { q: 13, r: 9 },
      direction: 'north',
      connectionType: 'railroad',
      tags: ['main', 'default', 'railroad'],
    },
    {
      id: 'west_road',
      coord: { q: 2, r: 14 },
      direction: 'west',
      connectionType: 'road',
      tags: ['prospect_direction'],
    },
    {
      id: 'south_trail',
      coord: { q: 12, r: 18 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['frontier', 'wilderness'],
    },
  ],

  // Player spawns at platform - just stepped off the train
  playerSpawn: {
    coord: { q: 13, r: 10 },
    facing: 2, // Facing south toward the town
  },

  npcMarkers: [...thornwood_stationNpcMarkers],

  roads: [...thornwood_stationRoads],

  atmosphere: thornwood_stationAtmosphere,

  tags: ['dry_creek_valley', 'railroad', 'ivrc', 'gateway', 'travelers', 'level_1', 'entry_point'],
});

export default ThornwoodStation;
