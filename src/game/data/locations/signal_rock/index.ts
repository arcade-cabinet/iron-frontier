/**
 * Signal Rock - Ancient Landmark & Outlaw Lookout
 *
 * A massive natural rock formation that has served as a navigation point for
 * centuries. Ancient carvings hint at an older presence, while outlaws now use
 * it as a lookout post for watching the trails below.
 *
 * Region: Devil's Backbone (Level 3)
 * Themes: Navigation, surveillance, ancient presence, mystery
 */

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { signal_rockAssemblages } from './assemblages.ts';
import { signal_rockSlots1 } from './slots1.ts';
import { signal_rockSlots0 } from './slots0.ts';
import { signal_rockBaseTiles } from './baseTiles.ts';
import { signal_rockNpcMarkers } from './npcMarkers.ts';
import { signal_rockRoads } from './roads.ts';
import { signal_rockAtmosphere } from './atmosphere.ts';

export const SignalRock: Location = validateLocation({
  id: 'signal_rock',
  name: 'Signal Rock',
  type: 'special',
  size: 'small',
  description: 'A towering rock formation with ancient carvings and a signal fire platform',
  lore: `Travelers have used Signal Rock as a waypoint since before anyone can remember.
The native peoples carved strange symbols into its base—symbols no one living can read.
The Copperheads claimed it years back for their lookout. From the top, you can see
three canyons and the dust cloud of any approaching riders for miles. The signal fires
lit here can warn hideouts throughout the Devil's Backbone. Some say on moonless nights,
the old carvings glow faint blue, but that's probably just miner's whiskey talking.`,

  seed: 88901,
  width: 20,
  height: 20,
  baseTerrain: 'badlands',

  assemblages: [...signal_rockAssemblages],

  slots: [...signal_rockSlots0, ...signal_rockSlots1],

  baseTiles: [...signal_rockBaseTiles],

  entryPoints: [
    {
      id: 'south_trail',
      coord: { q: 10, r: 19 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['main', 'default'],
    },
    {
      id: 'east_trail',
      coord: { q: 18, r: 10 },
      direction: 'east',
      connectionType: 'trail',
      tags: ['secondary', 'to_gulch'],
    },
    {
      id: 'north_trail',
      coord: { q: 10, r: 2 },
      direction: 'north',
      connectionType: 'trail',
      tags: ['hidden', 'to_canyon'],
    },
  ],

  playerSpawn: {
    coord: { q: 10, r: 17 },
    facing: 5, // Facing north toward the rock
  },

  npcMarkers: [...signal_rockNpcMarkers],

  roads: [...signal_rockRoads],

  atmosphere: signal_rockAtmosphere,

  tags: ['landmark', 'outlaw', 'lookout', 'ancient', 'navigation', 'dangerous', 'devil_backbone'],
});

export default SignalRock;
