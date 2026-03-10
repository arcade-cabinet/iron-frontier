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

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { prospectAssemblages } from './assemblages.ts';
import { prospectSlots } from './slots.ts';
import { prospectBaseTiles } from './baseTiles.ts';
import { prospectNpcMarkers } from './npcMarkers.ts';
import { prospectRoads } from './roads.ts';
import { prospectAtmosphere } from './atmosphere.ts';

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
  assemblages: [...prospectAssemblages],

  // Inline slot for grain silo (custom, not in library)
  slots: [...prospectSlots],

  // =========================================================================
  // BASE TILES - Roads, paths, and terrain
  // =========================================================================
  baseTiles: [...prospectBaseTiles],

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

  npcMarkers: [...prospectNpcMarkers],

  roads: [...prospectRoads],

  atmosphere: prospectAtmosphere,

  tags: ['dry_creek_valley', 'farming', 'former_mining', 'community', 'level_1_2', 'resilience'],
});

export default Prospect;
