/**
 * Coppertown - IVRC Company Mining Town
 *
 * Built into the Iron Mountains, Coppertown is a testament to corporate exploitation.
 * Every building, every tool, every scrap of food belongs to the Iron Valley Railroad
 * Company. Workers are paid in company script, redeemable only at the company store.
 * Copper-green stains streak the stone buildings. The air tastes of sulfur and desperation.
 *
 * Layout (top-down, north is up):
 *   - The Pit (open mine) dominates the northeast, cut into the mountainside
 *   - Company office and foreman's house on the upper tier to the northwest
 *   - Processing mill and tool shed in the middle tier, connected by ore cart tracks
 *   - Company store and mess hall on the lower-middle tier along a cross-street
 *   - Worker cabins packed in rows on the lower tier (south)
 *   - Mountain wall forms an impassable northern boundary
 *   - Single entry from the south via mountain trail; rail spur from the east
 *
 * Theme: Corporate control, exploitation, simmering resistance
 * Region: Iron Mountains (Level 3)
 * Population: ~300 workers + families
 */

import { type Location, validateLocation } from '../../schemas/spatial.ts';

import { coppertownAssemblages } from './assemblages.ts';
import { coppertownSlots } from './slots.ts';
import { coppertownBaseTiles1 } from './baseTiles1.ts';
import { coppertownBaseTiles0 } from './baseTiles0.ts';
import { coppertownNpcMarkers } from './npcMarkers.ts';
import { coppertownRoads } from './roads.ts';
import { coppertownAtmosphere } from './atmosphere.ts';

export const Coppertown: Location = validateLocation({
  id: 'coppertown',
  name: 'Coppertown',
  type: 'town',
  size: 'large',
  description:
    'IVRC company town carved into the Iron Mountains. Every soul here owes their life to the Company - and the Company never forgets a debt.',
  lore: `Founded in 1879 when IVRC surveyors found the largest copper deposit in the Territories. Within two years, a town of three hundred souls had sprouted from the mountainside like a copper-green fungus. The workers call it "The Cage" - you can check in any time you like, but the company script won't spend anywhere else.`,

  seed: 88742,
  width: 45,
  height: 40,
  baseTerrain: 'stone',

  // ============================================================================
  // ASSEMBLAGES - Placed from library
  // ============================================================================
  assemblages: [...coppertownAssemblages],

  // ============================================================================
  // CUSTOM SLOTS - Unique to Coppertown
  // ============================================================================
  slots: [...coppertownSlots],

  // ============================================================================
  // BASE TILES - Roads, terrain, decorations
  // ============================================================================
  baseTiles: [...coppertownBaseTiles0, ...coppertownBaseTiles1],

  // ============================================================================
  // ENTRY POINTS
  // ============================================================================
  entryPoints: [
    // Main entry - Mountain Trail from south
    {
      id: 'mountain_trail',
      coord: { q: 15, r: 39 },
      direction: 'south',
      connectionType: 'trail',
      tags: ['main', 'default', 'pedestrian'],
    },
    // Rail spur entry - Eastern approach for supplies
    {
      id: 'rail_spur',
      coord: { q: 43, r: 20 },
      direction: 'east',
      connectionType: 'railroad',
      tags: ['freight', 'ivrc', 'supplies'],
    },
  ],

  // ============================================================================
  // PLAYER SPAWN
  // ============================================================================
  playerSpawn: {
    coord: { q: 15, r: 36 },
    facing: 5, // Facing north toward town
  },

  // ============================================================================
  // NPC MARKERS - Company employees, workers, and resistance members
  // ============================================================================
  npcMarkers: [...coppertownNpcMarkers],

  // ============================================================================
  // ROADS - Tiered road system connecting the different levels
  // ============================================================================
  roads: [...coppertownRoads],

  // ============================================================================
  // ATMOSPHERE
  // ============================================================================
  atmosphere: coppertownAtmosphere,

  // ============================================================================
  // TAGS
  // ============================================================================
  tags: [
    'company_town',
    'mining',
    'ivrc',
    'industrial',
    'oppressive',
    'iron_mountains',
    'level_3',
    'resistance',
    'exploitation',
  ],
});

export default Coppertown;
