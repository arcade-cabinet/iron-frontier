/**
 * Frontier Territory - Iron Frontier World Definition
 *
 * A steampunk western world set in an alternate 1887 America where steam
 * technology advanced faster than our timeline. The Iron Valley Railroad
 * Company controls everything, but their grip weakens in the badlands.
 *
 * Geographic Layout:
 *   NORTH = High Danger (Devil's Backbone badlands, Iron Mountains)
 *   SOUTH = Entry Point (Dry Creek Valley frontier)
 *   WEST = Harsh Crossing (Western Desert)
 *   EAST/CENTER = Civilized (Central Plains)
 */

import { validateWorld, type World } from '../../schemas/world';

import { frontierRegions } from './regions';
import { frontierLocations } from './locations';
import { frontierConnections } from './connections';

export const FrontierTerritory: World = validateWorld({
  id: 'frontier_territory',
  name: 'The Frontier Territory',
  description:
    'The bleeding edge of civilization where the great railroad companies push ever westward, and fortune-seekers follow in their wake. The year is 1887.',

  seed: 18870101,

  dimensions: {
    width: 20,
    height: 16,
  },

  regions: frontierRegions,
  locations: frontierLocations,
  connections: frontierConnections,

  startingLocationId: 'dusty_springs',

  createdAt: Date.now(),
  version: 2,
});

export default FrontierTerritory;
