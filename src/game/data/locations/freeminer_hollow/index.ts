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

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { freeminer_hollowAssemblages } from './assemblages.ts';
import { freeminer_hollowSlots } from './slots.ts';
import { freeminer_hollowBaseTiles } from './baseTiles.ts';
import { freeminer_hollowNpcMarkers } from './npcMarkers.ts';
import { freeminer_hollowRoads } from './roads.ts';
import { freeminer_hollowAtmosphere } from './atmosphere.ts';

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

  assemblages: [...freeminer_hollowAssemblages],

  slots: [...freeminer_hollowSlots],

  baseTiles: [...freeminer_hollowBaseTiles],

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

  npcMarkers: [...freeminer_hollowNpcMarkers],

  roads: [...freeminer_hollowRoads],

  atmosphere: freeminer_hollowAtmosphere,

  tags: ['freeminers', 'community', 'mining', 'resistance', 'defensible', 'mountain'],
});

export default FreeminerHollow;
