/**
 * Tavern Assemblage - Decoupled spatial definition
 *
 * This defines WHERE things are, not WHAT happens there.
 *
 * The same tavern structure can be:
 * - A friendly saloon (game logic makes NPCs welcoming)
 * - A bandit hideout (game logic makes NPCs hostile)
 * - A haunted bar (game logic spawns ghosts)
 * - A quest hub (game logic places quest givers)
 *
 * The SPATIAL DATA doesn't change - only the BEHAVIOR does.
 */

import { Assemblage, validateAssemblage } from '../schemas/spatial';

export const DesertSaloon: Assemblage = validateAssemblage({
  id: 'desert_saloon_01',
  name: 'Desert Saloon',
  description: 'A two-story saloon with bar, stage, and back rooms',
  tags: ['western', 'social', 'two_story'],

  // This assemblage provides a tavern slot
  primarySlot: 'tavern',
  // Could also provide secondary slots like 'hotel' if it has rooms
  secondarySlots: [],

  tiles: [
    // Main building footprint
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'saloon_building', structureRotation: 0 },

    // Front porch / entrance area
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 1, r: -1 }, terrain: 'dirt', feature: 'none' },

    // Side areas
    { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  // MARKERS - Named points where things can happen
  markers: [
    // Entry/Exit
    {
      type: 'entrance',
      name: 'front_door',
      offset: { q: 1, r: 0 },
      facing: 0, // Faces east
      tags: ['main', 'public'],
    },
    {
      type: 'exit',
      name: 'back_door',
      offset: { q: -1, r: 0 },
      facing: 3, // Faces west
      tags: ['service', 'escape'],
    },

    // Service area
    {
      type: 'counter',
      name: 'bar_counter',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['service', 'drinks', 'primary'],
    },

    // Seating
    {
      type: 'table',
      name: 'corner_table_1',
      offset: { q: 0, r: -1 },
      tags: ['seating', 'private', 'shadowy'],
    },
    {
      type: 'table',
      name: 'center_table_1',
      offset: { q: 0, r: 1 },
      tags: ['seating', 'public'],
    },
    {
      type: 'chair',
      name: 'bar_stool_1',
      offset: { q: 0, r: 0 },
      tags: ['seating', 'bar'],
    },

    // Special points
    {
      type: 'stage',
      name: 'performance_stage',
      offset: { q: -1, r: 1 },
      facing: 0,
      tags: ['entertainment', 'public'],
    },
    {
      type: 'storage',
      name: 'cellar_entrance',
      offset: { q: -1, r: 0 },
      tags: ['storage', 'hidden', 'below'],
    },

    // NPC spawn points
    {
      type: 'spawn_point',
      name: 'bartender_spot',
      offset: { q: 0, r: 0 },
      facing: 0,
      tags: ['npc', 'staff', 'permanent'],
    },
    {
      type: 'spawn_point',
      name: 'bouncer_spot',
      offset: { q: 1, r: 0 },
      facing: 3,
      tags: ['npc', 'security'],
    },

    // Quest/Event spots
    {
      type: 'conversation_spot',
      name: 'private_booth',
      offset: { q: 0, r: -1 },
      tags: ['quest', 'private', 'important'],
    },
    {
      type: 'evidence_spot',
      name: 'behind_bar',
      offset: { q: 0, r: 0 },
      tags: ['hidden', 'clue'],
    },
    {
      type: 'hiding_spot',
      name: 'under_stage',
      offset: { q: -1, r: 1 },
      tags: ['hidden', 'escape'],
    },
  ],

  // ZONES - Areas for dynamic content
  zones: [
    {
      type: 'public_area',
      name: 'main_floor',
      tiles: [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
        { q: 0, r: -1 },
        { q: 1, r: 0 },
      ],
      tags: ['patron_area', 'social'],
    },
    {
      type: 'restricted_area',
      name: 'behind_counter',
      tiles: [{ q: -1, r: 0 }],
      priority: 1,
      tags: ['staff_only'],
    },
    {
      type: 'npc_area',
      name: 'wandering_zone',
      tiles: [
        { q: 0, r: 1 },
        { q: 1, r: 0 },
        { q: 1, r: -1 },
      ],
      tags: ['patrons'],
    },
    {
      type: 'event_stage',
      name: 'brawl_area',
      tiles: [
        { q: 0, r: 0 },
        { q: 0, r: 1 },
        { q: 1, r: 0 },
      ],
      tags: ['combat', 'event'],
    },
    {
      type: 'loot_area',
      name: 'storage_zone',
      tiles: [{ q: -1, r: 0 }],
      tags: ['containers', 'valuables'],
    },
  ],

  // Placement rules
  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep', 'stone_mountain'],
  requiresRoadAccess: true,
});

/**
 * A simpler tavern variant - same slot type, different structure
 */
export const FrontierShack: Assemblage = validateAssemblage({
  id: 'frontier_shack_tavern_01',
  name: 'Frontier Shack',
  description: 'A ramshackle drinking hole',
  tags: ['western', 'poor', 'small'],

  primarySlot: 'tavern',
  secondarySlots: [],

  tiles: [
    { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'cabin', structureRotation: 0 },
    { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
  ],

  markers: [
    { type: 'entrance', name: 'door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
    { type: 'counter', name: 'bar', offset: { q: 0, r: 0 }, tags: ['service'] },
    { type: 'spawn_point', name: 'barkeep', offset: { q: 0, r: 0 }, tags: ['npc', 'staff'] },
    { type: 'table', name: 'table_1', offset: { q: 0, r: 1 }, tags: ['seating'] },
  ],

  zones: [
    {
      type: 'public_area',
      name: 'interior',
      tiles: [{ q: 0, r: 0 }, { q: 0, r: 1 }],
      tags: ['patron_area'],
    },
  ],

  validRotations: [0, 1, 2, 3, 4, 5],
  forbiddenTerrain: ['water', 'water_shallow', 'water_deep'],
});

/**
 * EXAMPLE: How game logic uses this data
 *
 * // At runtime, when populating a tavern slot:
 *
 * function populateTavern(slot: SlotInstance, context: GameContext) {
 *   // Find the bartender spawn point
 *   const barkeepMarker = slot.markers.find(m =>
 *     m.type === 'spawn_point' && m.tags.includes('staff')
 *   );
 *
 *   if (barkeepMarker) {
 *     // Spawn an NPC based on GAME STATE, not hardcoded data
 *     const npc = context.npcFactory.create({
 *       role: 'bartender',
 *       faction: context.location.controllingFaction,
 *       disposition: context.playerReputation > 50 ? 'friendly' : 'neutral',
 *     });
 *     spawnAt(npc, barkeepMarker.offset);
 *   }
 *
 *   // If there's an active quest, place evidence
 *   if (context.activeQuests.includes('find_stolen_goods')) {
 *     const evidenceSpot = slot.markers.find(m => m.type === 'evidence_spot');
 *     if (evidenceSpot) {
 *       placeItem('quest_item_ledger', evidenceSpot.offset);
 *     }
 *   }
 *
 *   // Populate patron zone based on time of day
 *   const patronZone = slot.zones.find(z => z.tags.includes('patrons'));
 *   if (patronZone && context.timeOfDay === 'evening') {
 *     spawnRandomPatrons(patronZone, count: 3);
 *   }
 * }
 *
 * The key insight: SAME spatial data, INFINITE behavioral variations
 */

export const TAVERN_ASSEMBLAGES = [DesertSaloon, FrontierShack];
