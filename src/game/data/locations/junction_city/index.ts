/**
 * Junction City - IVRC Railroad Headquarters
 *
 * The beating iron heart of the territories. A town built by the railroad,
 * for the railroad. The class divide is literal: north of the tracks live
 * the suits, south of the tracks live the workers who build their empire.
 *
 * Layout (top-down, north is up):
 *   - Railroad tracks run east-west through the center, dividing the town
 *   - NORTH: Company district with HQ, bank, hotel, Pinkerton office, manager homes
 *   - CENTER: Grand Station dominates, with roundhouse and water tower to the east
 *   - SOUTH: Workers' district with saloon, barracks, warehouses
 *   - Main Street runs north-south crossing the tracks at the station
 *   - Coal yard west of the tracks, railyard extends east
 *
 * "The Iron Valley Railroad Company thanks you for your patronage."
 */

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { junction_cityAssemblages } from './assemblages.ts';
import { junction_citySlots } from './slots.ts';
import { junction_cityBaseTiles2 } from './baseTiles2.ts';
import { junction_cityBaseTiles1 } from './baseTiles1.ts';
import { junction_cityBaseTiles0 } from './baseTiles0.ts';
import { junction_cityNpcMarkers } from './npcMarkers.ts';
import { junction_cityRoads } from './roads.ts';
import { junction_cityAtmosphere } from './atmosphere.ts';

export const JunctionCity: Location = validateLocation({
  id: 'junction_city',
  name: 'Junction City',
  type: 'town',
  size: 'large',
  description:
    'Railroad company headquarters. Smokestacks and steam, brass and blood. ' +
    'Where the iron road begins and empires are built on the backs of working men.',
  lore:
    'Founded five years ago when Cornelius Thorne drove the golden spike himself. ' +
    'Every building, every deed, every soul here belongs to the Iron Valley Railroad Company. ' +
    "They don't call it a company town. They call it 'progress.'",

  seed: 18870701, // July 1, 1887 - founding date
  width: 50,
  height: 35,
  baseTerrain: 'dirt',

  assemblages: [...junction_cityAssemblages],

  // ========================================================================
  // INLINE SLOT DEFINITIONS
  // For structures not covered by assemblages
  // ========================================================================
  slots: [...junction_citySlots],

  // ========================================================================
  // BASE TILES - Roads, Railroad Tracks, Terrain
  // ========================================================================
  baseTiles: [...junction_cityBaseTiles0, ...junction_cityBaseTiles1, ...junction_cityBaseTiles2],

  // ========================================================================
  // ENTRY POINTS
  // ========================================================================
  entryPoints: [
    // West railroad approach - main freight line
    {
      id: 'west_tracks',
      coord: { q: 0, r: 17 },
      direction: 'west',
      connectionType: 'railroad',
      tags: ['railroad', 'freight'],
    },
    // East railroad approach - to the mountains
    {
      id: 'east_tracks',
      coord: { q: 49, r: 17 },
      direction: 'east',
      connectionType: 'railroad',
      tags: ['railroad', 'passenger'],
    },
    // South road - main public entrance
    {
      id: 'south_road',
      coord: { q: 25, r: 34 },
      direction: 'south',
      connectionType: 'road',
      tags: ['road', 'main', 'default'],
    },
  ],

  // Player spawns at south entrance by default
  playerSpawn: {
    coord: { q: 25, r: 32 },
    facing: 5, // Facing north toward the town
  },

  // ========================================================================
  // NPC MARKERS
  // ========================================================================
  npcMarkers: [...junction_cityNpcMarkers],

  // ========================================================================
  // ROADS
  // ========================================================================
  roads: [...junction_cityRoads],

  // ========================================================================
  // ATMOSPHERE
  // ========================================================================
  atmosphere: junction_cityAtmosphere,

  tags: [
    'railroad',
    'ivrc',
    'industrial',
    'corporate',
    'central_plains',
    'class_divide',
    'mid_game',
  ],
});

export default JunctionCity;
