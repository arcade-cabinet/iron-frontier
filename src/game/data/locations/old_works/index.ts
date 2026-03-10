/**
 * The Old Works - Abandoned Civil War Automaton Factory
 *
 * The climactic dungeon of Iron Frontier. Hidden deep in the Iron Mountains,
 * this factory produced steam-powered automatons for the Union during the
 * Civil War. When the war ended, the factory was sealed and forgotten.
 * The machines still patrol on ancient orders.
 *
 * IVRC seeks to reactivate the automaton army for their own purposes.
 * The Foreman - a malfunctioning command automaton - still runs the facility.
 *
 * Layout: Underground industrial complex with multiple levels and areas.
 * Theme: Eerie industrial horror, lost technology, dangerous revelation.
 */

import {
  type Location,
  validateLocation,
} from '../../schemas/spatial.ts';
import { dungeonSlots0 } from './slots0.ts';
import { dungeonSlots1 } from './slots1.ts';
import { dungeonSlots2 } from './slots2.ts';
import { dungeonSlots3 } from './slots3.ts';
import { dungeonSlots4 } from './slots4.ts';
import { dungeonSlots5 } from './slots5.ts';
import { dungeonSlots6 } from './slots6.ts';
import { baseTiles } from './baseTiles.ts';
import { oldWorksNpcMarkers } from './npcMarkers.ts';
import { oldWorksRoads } from './roads.ts';
import { oldWorksAtmosphere } from './atmosphere.ts';

export const OldWorks: Location = validateLocation({
  id: 'old_works',
  name: 'The Old Works',
  type: 'special',
  size: 'huge',

  description:
    'An abandoned Civil War automaton factory, hidden deep in the Iron Mountains. ' +
    'Steam-powered machines still patrol these halls, following orders from 1864.',

  lore:
    'During the darkest days of the Civil War, the Union constructed this secret facility ' +
    'to produce steam-powered soldiers - automatons that could fight without rest, fear, or mercy. ' +
    'When the war ended, the project was abandoned and sealed. But the machines were never shut down. ' +
    'The Foreman still runs his factory, waiting for orders that will never come.',

  seed: 18640415, // April 15, 1864 - Lincoln assassination reference

  width: 60,
  height: 50,
  baseTerrain: 'stone',

  slots: [
    ...dungeonSlots0,
    ...dungeonSlots1,
    ...dungeonSlots2,
    ...dungeonSlots3,
    ...dungeonSlots4,
    ...dungeonSlots5,
    ...dungeonSlots6,
  ],
  assemblages: [], // We use inline slots for this unique dungeon

  baseTiles,

  entryPoints: [
    {
      id: 'hidden_entrance',
      coord: { q: 30, r: 48 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['main', 'default', 'hidden'],
    },
    {
      id: 'escape_exit',
      coord: { q: 55, r: 3 },
      direction: 'north',
      connectionType: 'trail',
      tags: ['escape', 'hidden', 'one_way'],
    },
  ],

  playerSpawn: {
    coord: { q: 30, r: 47 },
    facing: 2, // Facing into the factory
  },

  npcMarkers: [...oldWorksNpcMarkers],

  roads: [...oldWorksRoads],

  atmosphere: oldWorksAtmosphere,

  tags: [
    'dungeon',
    'final',
    'industrial',
    'automaton',
    'civil_war',
    'dangerous',
    'story_critical',
    'boss',
    'ivrc',
  ],
});

