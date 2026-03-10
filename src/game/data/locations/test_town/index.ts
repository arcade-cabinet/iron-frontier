/**
 * Test Town - Compact frontier town for testing the spatial system
 *
 * A small desert settlement along a dirt road. Buildings line the main
 * street with the saloon at center, sheriff to the west, general store
 * to the east. A well sits in the town square just north of main street.
 * The church is tucked away on the south side, and a livery stable
 * anchors the western approach.
 *
 * Layout (looking north):
 *   [cabin_north]           [house_east]
 *         [well]
 *   [livery] [sheriff] [saloon] [general_store]
 *            [church]           [cabin_south]
 */

import { type Location, validateLocation } from '../../schemas/spatial';

import { testTownAssemblages } from './assemblages';
import { testTownBaseTiles } from './baseTiles';
import { testTownNpcMarkers } from './npcMarkers';
import { testTownRoads } from './roads';
import { testTownAtmosphere } from './atmosphere';

export const TestTown: Location = validateLocation({
  id: 'test_town',
  name: 'Dusty Springs',
  type: 'town',
  size: 'small',
  description: 'A small frontier town where the dirt road widens into a main street lined with sun-bleached buildings',

  seed: 12345,
  width: 24,
  height: 24,
  baseTerrain: 'sand',

  assemblages: [...testTownAssemblages],

  slots: [],

  baseTiles: [...testTownBaseTiles],

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

  playerSpawn: {
    coord: { q: 3, r: 11 },
    facing: 0, // Facing east toward the saloon and town center
  },

  npcMarkers: [...testTownNpcMarkers],

  roads: [...testTownRoads],

  atmosphere: testTownAtmosphere,

  tags: ['test', 'western', 'starter'],
});

export default TestTown;
