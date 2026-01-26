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
  type SlotInstance,
  type TileDef,
  validateLocation,
} from '../schemas/spatial';

// ============================================================================
// HELPER: Generate stone floor tiles for a rectangular area
// ============================================================================

function generateFloorTiles(
  startQ: number,
  startR: number,
  width: number,
  height: number,
  terrain: 'stone' | 'dirt' | 'stone_rocks' = 'stone',
  elevation: number = 0
): TileDef[] {
  const tiles: TileDef[] = [];
  for (let dq = 0; dq < width; dq++) {
    for (let dr = 0; dr < height; dr++) {
      tiles.push({
        coord: { q: startQ + dq, r: startR + dr },
        terrain,
        elevation,
        feature: 'none',
      });
    }
  }
  return tiles;
}

// ============================================================================
// CUSTOM SLOT INSTANCES
// For a dungeon this unique, we define inline slots rather than assemblages
// ============================================================================

const dungeonSlots: SlotInstance[] = [
  // -------------------------------------------------------------------------
  // AREA 1: HIDDEN ENTRANCE (q: 28-32, r: 46-50)
  // Concealed in cliff face, camouflaged doors
  // -------------------------------------------------------------------------
  {
    id: 'hidden_entrance',
    type: 'hideout',
    name: 'Hidden Entrance',
    anchor: { q: 30, r: 48 },
    rotation: 0,
    tiles: [
      { coord: { q: 0, r: 0 }, terrain: 'stone_mountain', feature: 'boulder', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'secret_door',
        offset: { q: 0, r: 0 },
        facing: 5,
        tags: ['hidden', 'main'],
      },
      {
        type: 'evidence_spot',
        name: 'old_insignia',
        offset: { q: 1, r: 0 },
        tags: ['clue', 'union'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'entrance_area',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
        ],
        tags: ['transition'],
      },
    ],
    tags: ['entrance', 'hidden', 'exterior'],
    importance: 5,
  },

  // -------------------------------------------------------------------------
  // AREA 2: ENTRY TUNNEL (q: 26-34, r: 40-46)
  // Dark, collapsed sections, eerie sounds
  // -------------------------------------------------------------------------
  {
    id: 'entry_tunnel',
    type: 'hidden_cache',
    name: 'Entry Tunnel',
    anchor: { q: 30, r: 43 },
    rotation: 0,
    tiles: [
      // Main tunnel corridor
      { coord: { q: 0, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
      { coord: { q: 0, r: 3 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 4 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Collapsed side sections
      { coord: { q: -1, r: 1 }, terrain: 'stone_rocks', feature: 'boulder', elevation: 0 },
      { coord: { q: 1, r: 2 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: -1, r: 3 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
      // Walls
      { coord: { q: -2, r: 2 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
      { coord: { q: 2, r: 2 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'tunnel_start',
        offset: { q: 0, r: 4 },
        facing: 5,
        tags: ['from_entrance'],
      },
      {
        type: 'exit',
        name: 'tunnel_end',
        offset: { q: 0, r: 0 },
        facing: 2,
        tags: ['to_assembly'],
      },
      { type: 'hiding_spot', name: 'rubble_cover', offset: { q: -1, r: 1 }, tags: ['cover'] },
      {
        type: 'evidence_spot',
        name: 'old_lantern',
        offset: { q: 1, r: 2 },
        tags: ['clue', 'atmosphere'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'tunnel_path',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: 0, r: 3 },
          { q: 0, r: 4 },
        ],
        tags: ['passage'],
      },
      {
        type: 'combat_zone',
        name: 'ambush_point',
        tiles: [
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: 1, r: 2 },
        ],
        tags: ['dangerous', 'automaton'],
      },
    ],
    tags: ['tunnel', 'dark', 'collapsed'],
    importance: 3,
  },

  // -------------------------------------------------------------------------
  // AREA 3: ASSEMBLY HALL (q: 22-38, r: 28-40)
  // The heart of the factory - where automatons were built
  // Massive room with rusted machinery, assembly lines, half-built machines
  // -------------------------------------------------------------------------
  {
    id: 'assembly_hall',
    type: 'workshop',
    name: 'Assembly Hall',
    anchor: { q: 30, r: 34 },
    rotation: 0,
    tiles: [
      // Main floor (large open area)
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'workshop_building', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Elevated walkways/platforms
      { coord: { q: 3, r: 0 }, terrain: 'stone', feature: 'none', elevation: 1 },
      { coord: { q: 3, r: 1 }, terrain: 'stone', feature: 'none', elevation: 1 },
      { coord: { q: -3, r: 0 }, terrain: 'stone', feature: 'none', elevation: 1 },
      { coord: { q: -3, r: 1 }, terrain: 'stone', feature: 'none', elevation: 1 },
    ],
    markers: [
      { type: 'entrance', name: 'from_tunnel', offset: { q: 0, r: 2 }, facing: 5, tags: ['main'] },
      {
        type: 'workbench',
        name: 'assembly_line_1',
        offset: { q: -2, r: 0 },
        tags: ['machinery', 'rusted'],
      },
      {
        type: 'workbench',
        name: 'assembly_line_2',
        offset: { q: 2, r: 0 },
        tags: ['machinery', 'rusted'],
      },
      {
        type: 'spawn_point',
        name: 'automaton_patrol_1',
        offset: { q: 0, r: 0 },
        tags: ['hostile', 'automaton', 'patrol'],
      },
      {
        type: 'spawn_point',
        name: 'automaton_patrol_2',
        offset: { q: -2, r: 1 },
        tags: ['hostile', 'automaton', 'patrol'],
      },
      {
        type: 'spawn_point',
        name: 'automaton_static',
        offset: { q: 2, r: 1 },
        tags: ['hostile', 'automaton', 'dormant'],
      },
      {
        type: 'vantage_point',
        name: 'east_catwalk',
        offset: { q: 3, r: 0 },
        tags: ['elevated', 'tactical'],
      },
      {
        type: 'vantage_point',
        name: 'west_catwalk',
        offset: { q: -3, r: 0 },
        tags: ['elevated', 'tactical'],
      },
      {
        type: 'evidence_spot',
        name: 'half_built_automaton',
        offset: { q: 0, r: -1 },
        tags: ['clue', 'lore', 'important'],
      },
      {
        type: 'evidence_spot',
        name: 'production_manifest',
        offset: { q: -1, r: -1 },
        tags: ['clue', 'document'],
      },
      {
        type: 'storage',
        name: 'parts_crate',
        offset: { q: 1, r: -1 },
        tags: ['loot', 'mechanical'],
      },
      {
        type: 'exit',
        name: 'to_power_station',
        offset: { q: -3, r: 1 },
        facing: 3,
        tags: ['west'],
      },
      { type: 'exit', name: 'to_barracks', offset: { q: 3, r: 1 }, facing: 0, tags: ['east'] },
      {
        type: 'exit',
        name: 'to_command',
        offset: { q: 0, r: -2 },
        facing: 2,
        tags: ['north', 'locked'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'main_floor',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
        ],
        tags: ['open'],
      },
      {
        type: 'combat_zone',
        name: 'assembly_combat',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
        ],
        priority: 1,
        tags: ['dangerous', 'automaton_patrol'],
      },
      {
        type: 'loot_area',
        name: 'workbenches',
        tiles: [
          { q: -2, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: -1 },
        ],
        tags: ['mechanical', 'valuable'],
      },
    ],
    tags: ['industrial', 'main_area', 'combat', 'machinery'],
    importance: 5,
  },

  // -------------------------------------------------------------------------
  // AREA 4: POWER STATION (q: 12-22, r: 28-38)
  // Steam generators, some still working - hazardous steam vents
  // -------------------------------------------------------------------------
  {
    id: 'power_station',
    type: 'workshop',
    name: 'Power Station',
    anchor: { q: 17, r: 33 },
    rotation: 0,
    tiles: [
      // Generator room
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'smelter_building', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Steam pipe corridor
      { coord: { q: -2, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: -2 }, terrain: 'stone', feature: 'none', elevation: 0 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_assembly',
        offset: { q: 2, r: 0 },
        facing: 0,
        tags: ['main'],
      },
      {
        type: 'workbench',
        name: 'generator_1',
        offset: { q: 0, r: 0 },
        tags: ['machinery', 'active', 'dangerous'],
      },
      {
        type: 'workbench',
        name: 'generator_2',
        offset: { q: -1, r: 0 },
        tags: ['machinery', 'broken'],
      },
      {
        type: 'workbench',
        name: 'generator_3',
        offset: { q: 1, r: 0 },
        tags: ['machinery', 'active', 'dangerous'],
      },
      {
        type: 'ambush_trigger',
        name: 'steam_vent_1',
        offset: { q: 0, r: 1 },
        tags: ['hazard', 'steam'],
      },
      {
        type: 'ambush_trigger',
        name: 'steam_vent_2',
        offset: { q: -1, r: 1 },
        tags: ['hazard', 'steam'],
      },
      {
        type: 'spawn_point',
        name: 'automaton_engineer',
        offset: { q: 1, r: -1 },
        tags: ['hostile', 'automaton', 'worker'],
      },
      {
        type: 'evidence_spot',
        name: 'power_controls',
        offset: { q: 0, r: -1 },
        tags: ['clue', 'important', 'interactive'],
      },
      { type: 'storage', name: 'coal_reserve', offset: { q: -2, r: 0 }, tags: ['resources'] },
      {
        type: 'exit',
        name: 'to_furnace',
        offset: { q: -2, r: -2 },
        facing: 2,
        tags: ['down', 'heat'],
      },
    ],
    zones: [
      {
        type: 'combat_zone',
        name: 'generator_floor',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
        ],
        tags: ['hazardous', 'steam_vents'],
      },
      {
        type: 'restricted_area',
        name: 'active_generators',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
        ],
        priority: 2,
        tags: ['dangerous', 'operational'],
      },
      {
        type: 'loot_area',
        name: 'supplies',
        tiles: [
          { q: -2, r: 0 },
          { q: 1, r: -1 },
        ],
        tags: ['resources'],
      },
    ],
    tags: ['industrial', 'power', 'hazardous', 'steam'],
    importance: 4,
  },

  // -------------------------------------------------------------------------
  // AREA 5: BARRACKS (q: 38-48, r: 28-38)
  // Where workers lived - now empty, personal effects scattered
  // -------------------------------------------------------------------------
  {
    id: 'barracks',
    type: 'residence',
    name: 'Workers Barracks',
    anchor: { q: 43, r: 33 },
    rotation: 0,
    tiles: [
      // Bunk rooms
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'cabin', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', structure: 'cabin', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_assembly',
        offset: { q: -1, r: 0 },
        facing: 3,
        tags: ['main'],
      },
      { type: 'bed', name: 'bunk_1', offset: { q: 0, r: 0 }, tags: ['personal', 'abandoned'] },
      { type: 'bed', name: 'bunk_2', offset: { q: 1, r: 0 }, tags: ['personal', 'abandoned'] },
      { type: 'storage', name: 'footlocker_1', offset: { q: 0, r: 0 }, tags: ['personal', 'loot'] },
      { type: 'storage', name: 'footlocker_2', offset: { q: 1, r: 0 }, tags: ['personal', 'loot'] },
      {
        type: 'evidence_spot',
        name: 'old_photograph',
        offset: { q: 0, r: 1 },
        tags: ['clue', 'story', 'emotional'],
      },
      {
        type: 'evidence_spot',
        name: 'journal_entry',
        offset: { q: 1, r: 1 },
        tags: ['clue', 'document', 'important'],
      },
      {
        type: 'evidence_spot',
        name: 'union_medal',
        offset: { q: 2, r: 0 },
        tags: ['clue', 'historical'],
      },
      { type: 'exit', name: 'to_mess_hall', offset: { q: 2, r: 1 }, facing: 0, tags: ['east'] },
      {
        type: 'exit',
        name: 'to_testing_ground',
        offset: { q: 1, r: -1 },
        facing: 2,
        tags: ['north'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'common_area',
        tiles: [
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 0 },
          { q: -1, r: 1 },
        ],
        tags: ['empty'],
      },
      {
        type: 'loot_area',
        name: 'bunks',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
        ],
        tags: ['personal', 'low_value'],
      },
    ],
    tags: ['residential', 'abandoned', 'story', 'safe'],
    importance: 2,
  },

  // -------------------------------------------------------------------------
  // AREA 6: COMMAND CENTER (q: 26-34, r: 18-28)
  // The Foreman's domain - the malfunctioning command automaton
  // -------------------------------------------------------------------------
  {
    id: 'command_center',
    type: 'law_office',
    name: 'Command Center',
    anchor: { q: 30, r: 23 },
    rotation: 0,
    tiles: [
      // Main command room
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'office_building', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_assembly',
        offset: { q: 0, r: 2 },
        facing: 5,
        tags: ['main', 'locked'],
      },
      {
        type: 'desk',
        name: 'command_console',
        offset: { q: 0, r: 0 },
        tags: ['important', 'interactive', 'final_choice'],
      },
      {
        type: 'spawn_point',
        name: 'the_foreman',
        offset: { q: 0, r: -1 },
        facing: 5,
        tags: ['boss', 'automaton', 'important'],
      },
      {
        type: 'spawn_point',
        name: 'guard_automaton_1',
        offset: { q: 2, r: 0 },
        tags: ['hostile', 'automaton', 'elite'],
      },
      {
        type: 'spawn_point',
        name: 'guard_automaton_2',
        offset: { q: -2, r: 0 },
        tags: ['hostile', 'automaton', 'elite'],
      },
      {
        type: 'evidence_spot',
        name: 'original_orders',
        offset: { q: -1, r: -1 },
        tags: ['clue', 'document', 'critical'],
      },
      {
        type: 'evidence_spot',
        name: 'telegraph_machine',
        offset: { q: 1, r: -1 },
        tags: ['clue', 'communication', 'important'],
      },
      {
        type: 'evidence_spot',
        name: 'ivrc_correspondence',
        offset: { q: 1, r: 0 },
        tags: ['clue', 'villain', 'revelation'],
      },
      {
        type: 'vault',
        name: 'command_safe',
        offset: { q: -1, r: 0 },
        tags: ['secure', 'valuable'],
      },
      { type: 'exit', name: 'to_armory', offset: { q: 2, r: 0 }, facing: 0, tags: ['east'] },
      {
        type: 'exit',
        name: 'to_storage_vaults',
        offset: { q: -2, r: 0 },
        facing: 3,
        tags: ['west'],
      },
    ],
    zones: [
      {
        type: 'combat_zone',
        name: 'boss_arena',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 0, r: -1 },
        ],
        priority: 2,
        tags: ['boss_fight', 'critical'],
      },
      {
        type: 'event_stage',
        name: 'final_choice',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: -1 },
        ],
        priority: 3,
        tags: ['story', 'ending'],
      },
      {
        type: 'loot_area',
        name: 'command_valuables',
        tiles: [
          { q: -1, r: 0 },
          { q: 1, r: -1 },
        ],
        tags: ['high_value'],
      },
    ],
    tags: ['boss', 'critical', 'story', 'finale'],
    importance: 5,
  },

  // -------------------------------------------------------------------------
  // AREA 7: ARMORY (q: 38-46, r: 18-26)
  // Civil War weapons cache - rifles, ammunition, explosives
  // -------------------------------------------------------------------------
  {
    id: 'armory',
    type: 'gunsmith',
    name: 'Armory',
    anchor: { q: 42, r: 22 },
    rotation: 0,
    tiles: [
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_command',
        offset: { q: -1, r: 0 },
        facing: 3,
        tags: ['main'],
      },
      {
        type: 'display',
        name: 'rifle_rack_1',
        offset: { q: 0, r: 0 },
        tags: ['weapons', 'civil_war'],
      },
      {
        type: 'display',
        name: 'rifle_rack_2',
        offset: { q: 1, r: 0 },
        tags: ['weapons', 'civil_war'],
      },
      {
        type: 'storage',
        name: 'ammo_crates',
        offset: { q: 0, r: -1 },
        tags: ['ammunition', 'valuable'],
      },
      {
        type: 'storage',
        name: 'explosive_crates',
        offset: { q: 1, r: 1 },
        tags: ['explosives', 'dangerous'],
      },
      {
        type: 'storage',
        name: 'prototype_weapons',
        offset: { q: -1, r: 1 },
        tags: ['weapons', 'unique', 'valuable'],
      },
      {
        type: 'spawn_point',
        name: 'armory_guard',
        offset: { q: 0, r: 1 },
        tags: ['hostile', 'automaton'],
      },
      {
        type: 'evidence_spot',
        name: 'weapons_manifest',
        offset: { q: 0, r: 2 },
        tags: ['clue', 'document'],
      },
    ],
    zones: [
      {
        type: 'loot_area',
        name: 'weapon_storage',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: -1, r: 1 },
        ],
        priority: 1,
        tags: ['high_value', 'weapons'],
      },
      {
        type: 'restricted_area',
        name: 'explosives',
        tiles: [{ q: 1, r: 1 }],
        priority: 2,
        tags: ['dangerous'],
      },
    ],
    tags: ['weapons', 'loot', 'valuable'],
    importance: 4,
  },

  // -------------------------------------------------------------------------
  // AREA 8: TESTING GROUND (q: 38-50, r: 8-18)
  // Open area for automaton testing - active patrol routes
  // -------------------------------------------------------------------------
  {
    id: 'testing_ground',
    type: 'ambush_point',
    name: 'Testing Ground',
    anchor: { q: 44, r: 13 },
    rotation: 0,
    tiles: [
      // Large open testing floor
      { coord: { q: 0, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 2, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -2, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Observation deck (elevated)
      { coord: { q: 3, r: 0 }, terrain: 'stone', feature: 'none', elevation: 1 },
      { coord: { q: 3, r: 1 }, terrain: 'stone', feature: 'none', elevation: 1 },
      { coord: { q: 3, r: -1 }, terrain: 'stone', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_barracks',
        offset: { q: -2, r: 2 },
        facing: 4,
        tags: ['main'],
      },
      {
        type: 'spawn_point',
        name: 'patrol_automaton_1',
        offset: { q: 0, r: 0 },
        tags: ['hostile', 'automaton', 'patrol'],
      },
      {
        type: 'spawn_point',
        name: 'patrol_automaton_2',
        offset: { q: 2, r: 1 },
        tags: ['hostile', 'automaton', 'patrol'],
      },
      {
        type: 'spawn_point',
        name: 'patrol_automaton_3',
        offset: { q: -2, r: -1 },
        tags: ['hostile', 'automaton', 'patrol'],
      },
      {
        type: 'spawn_point',
        name: 'heavy_automaton',
        offset: { q: 0, r: -1 },
        tags: ['hostile', 'automaton', 'elite', 'miniboss'],
      },
      {
        type: 'vantage_point',
        name: 'observation_deck',
        offset: { q: 3, r: 0 },
        tags: ['elevated', 'tactical'],
      },
      { type: 'hiding_spot', name: 'debris_cover_1', offset: { q: -2, r: 0 }, tags: ['cover'] },
      { type: 'hiding_spot', name: 'debris_cover_2', offset: { q: 2, r: 0 }, tags: ['cover'] },
      {
        type: 'evidence_spot',
        name: 'target_dummies',
        offset: { q: 1, r: -1 },
        tags: ['atmosphere'],
      },
      {
        type: 'evidence_spot',
        name: 'test_records',
        offset: { q: 3, r: 1 },
        tags: ['clue', 'document'],
      },
      { type: 'exit', name: 'to_maintenance', offset: { q: 3, r: -1 }, facing: 0, tags: ['east'] },
    ],
    zones: [
      {
        type: 'combat_zone',
        name: 'testing_floor',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: -1 },
        ],
        priority: 1,
        tags: ['patrol_zone', 'dangerous'],
      },
      {
        type: 'npc_area',
        name: 'patrol_route',
        tiles: [
          { q: 0, r: 0 },
          { q: 2, r: 0 },
          { q: 2, r: 1 },
          { q: 0, r: 1 },
          { q: -2, r: 0 },
          { q: -2, r: -1 },
          { q: 0, r: -1 },
        ],
        tags: ['automaton_patrol'],
      },
    ],
    tags: ['combat', 'patrol', 'dangerous', 'open'],
    importance: 4,
  },

  // -------------------------------------------------------------------------
  // AREA 9: MAINTENANCE BAY (q: 50-58, r: 8-18)
  // Repair facilities for automatons
  // -------------------------------------------------------------------------
  {
    id: 'maintenance_bay',
    type: 'workshop',
    name: 'Maintenance Bay',
    anchor: { q: 54, r: 13 },
    rotation: 0,
    tiles: [
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'workshop_building', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_testing',
        offset: { q: -1, r: 0 },
        facing: 3,
        tags: ['main'],
      },
      {
        type: 'workbench',
        name: 'repair_station_1',
        offset: { q: 0, r: 0 },
        tags: ['machinery', 'repair'],
      },
      {
        type: 'workbench',
        name: 'repair_station_2',
        offset: { q: 1, r: 0 },
        tags: ['machinery', 'repair'],
      },
      {
        type: 'spawn_point',
        name: 'damaged_automaton',
        offset: { q: 0, r: 1 },
        tags: ['hostile', 'automaton', 'damaged'],
      },
      {
        type: 'spawn_point',
        name: 'repair_automaton',
        offset: { q: 1, r: 1 },
        tags: ['neutral', 'automaton', 'worker'],
      },
      {
        type: 'storage',
        name: 'spare_parts',
        offset: { q: 0, r: -1 },
        tags: ['mechanical', 'valuable'],
      },
      { type: 'storage', name: 'tools', offset: { q: 1, r: -1 }, tags: ['tools'] },
      {
        type: 'evidence_spot',
        name: 'repair_logs',
        offset: { q: -1, r: 1 },
        tags: ['clue', 'technical'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'repair_floor',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
        ],
        tags: ['workshop'],
      },
      {
        type: 'loot_area',
        name: 'parts_storage',
        tiles: [
          { q: 0, r: -1 },
          { q: 1, r: -1 },
        ],
        tags: ['mechanical'],
      },
    ],
    tags: ['workshop', 'repair', 'mechanical'],
    importance: 3,
  },

  // -------------------------------------------------------------------------
  // AREA 10: THE FURNACE (q: 8-16, r: 18-26)
  // Deep heat source powering everything - dangerous, dramatic
  // -------------------------------------------------------------------------
  {
    id: 'the_furnace',
    type: 'workshop',
    name: 'The Furnace',
    anchor: { q: 12, r: 22 },
    rotation: 0,
    tiles: [
      // Central furnace chamber
      { coord: { q: 0, r: 0 }, terrain: 'stone', structure: 'smelter_building', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Lava/heat glow tiles (still stone but marked)
      { coord: { q: 0, r: 2 }, terrain: 'badlands', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 2 }, terrain: 'badlands', feature: 'none', elevation: 0 },
      { coord: { q: -1, r: 2 }, terrain: 'badlands', feature: 'none', elevation: 0 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_power_station',
        offset: { q: 0, r: -1 },
        facing: 5,
        tags: ['main'],
      },
      {
        type: 'workbench',
        name: 'main_furnace',
        offset: { q: 0, r: 0 },
        tags: ['machinery', 'heat', 'critical'],
      },
      {
        type: 'ambush_trigger',
        name: 'heat_vent_1',
        offset: { q: 1, r: 1 },
        tags: ['hazard', 'heat'],
      },
      {
        type: 'ambush_trigger',
        name: 'heat_vent_2',
        offset: { q: -1, r: 1 },
        tags: ['hazard', 'heat'],
      },
      {
        type: 'ambush_trigger',
        name: 'unstable_floor',
        offset: { q: 0, r: 2 },
        tags: ['hazard', 'collapse'],
      },
      {
        type: 'spawn_point',
        name: 'furnace_automaton',
        offset: { q: 1, r: 0 },
        tags: ['hostile', 'automaton', 'heat_resistant'],
      },
      {
        type: 'evidence_spot',
        name: 'fuel_source',
        offset: { q: -1, r: 0 },
        tags: ['clue', 'technical', 'important'],
      },
      { type: 'storage', name: 'coal_stockpile', offset: { q: 0, r: 1 }, tags: ['fuel'] },
    ],
    zones: [
      {
        type: 'combat_zone',
        name: 'furnace_chamber',
        tiles: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
        ],
        priority: 1,
        tags: ['hazardous', 'heat'],
      },
      {
        type: 'restricted_area',
        name: 'heat_zone',
        tiles: [
          { q: 0, r: 2 },
          { q: 1, r: 2 },
          { q: -1, r: 2 },
        ],
        priority: 2,
        tags: ['deadly', 'environmental'],
      },
    ],
    tags: ['industrial', 'power', 'hazardous', 'heat', 'dramatic'],
    importance: 4,
  },

  // -------------------------------------------------------------------------
  // AREA 11: STORAGE VAULTS (q: 14-24, r: 18-26)
  // Locked rooms with secrets, blueprints, historical items
  // -------------------------------------------------------------------------
  {
    id: 'storage_vaults',
    type: 'hidden_cache',
    name: 'Storage Vaults',
    anchor: { q: 19, r: 22 },
    rotation: 0,
    tiles: [
      // Vault corridor
      { coord: { q: 0, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      // Individual vaults
      { coord: { q: 1, r: 0 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
      { coord: { q: 1, r: 1 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
      { coord: { q: -1, r: 1 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
      { coord: { q: 1, r: -1 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
      { coord: { q: -1, r: -1 }, terrain: 'stone', structure: 'warehouse', elevation: 0 },
    ],
    markers: [
      { type: 'entrance', name: 'from_command', offset: { q: 0, r: 0 }, facing: 0, tags: ['main'] },
      {
        type: 'vault',
        name: 'vault_1_blueprints',
        offset: { q: 1, r: 0 },
        tags: ['locked', 'documents'],
      },
      {
        type: 'vault',
        name: 'vault_2_prototypes',
        offset: { q: -1, r: 0 },
        tags: ['locked', 'weapons'],
      },
      {
        type: 'vault',
        name: 'vault_3_records',
        offset: { q: 1, r: 1 },
        tags: ['locked', 'historical'],
      },
      {
        type: 'vault',
        name: 'vault_4_gold',
        offset: { q: -1, r: 1 },
        tags: ['locked', 'valuable'],
      },
      {
        type: 'vault',
        name: 'vault_5_classified',
        offset: { q: 1, r: -1 },
        tags: ['locked', 'secret', 'important'],
      },
      {
        type: 'vault',
        name: 'vault_6_personal',
        offset: { q: -1, r: -1 },
        tags: ['locked', 'story'],
      },
      {
        type: 'evidence_spot',
        name: 'vault_manifest',
        offset: { q: 0, r: 1 },
        tags: ['clue', 'document'],
      },
      {
        type: 'evidence_spot',
        name: 'player_heritage',
        offset: { q: -1, r: -1 },
        tags: ['clue', 'story', 'player_backstory'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'corridor',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: -1 },
        ],
        tags: ['passage'],
      },
      {
        type: 'loot_area',
        name: 'all_vaults',
        tiles: [
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 1, r: -1 },
          { q: -1, r: -1 },
        ],
        priority: 1,
        tags: ['high_value', 'locked'],
      },
    ],
    tags: ['storage', 'secrets', 'loot', 'story'],
    importance: 4,
  },

  // -------------------------------------------------------------------------
  // AREA 12: ESCAPE ROUTE (q: 52-58, r: 2-8)
  // Back exit after confrontation - leads to outside
  // -------------------------------------------------------------------------
  {
    id: 'escape_route',
    type: 'hidden_cache',
    name: 'Escape Route',
    anchor: { q: 55, r: 5 },
    rotation: 0,
    tiles: [
      // Tunnel leading out
      { coord: { q: 0, r: 0 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
      { coord: { q: 0, r: 2 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 1, r: 0 }, terrain: 'stone_rocks', feature: 'boulder', elevation: 0 },
      { coord: { q: -1, r: 0 }, terrain: 'stone_rocks', feature: 'rock_large', elevation: 0 },
      { coord: { q: 0, r: -1 }, terrain: 'stone', feature: 'none', elevation: 0 },
      { coord: { q: 0, r: -2 }, terrain: 'stone', feature: 'none', elevation: 1 },
    ],
    markers: [
      {
        type: 'entrance',
        name: 'from_maintenance',
        offset: { q: 0, r: 2 },
        facing: 5,
        tags: ['interior'],
      },
      {
        type: 'exit',
        name: 'mountain_exit',
        offset: { q: 0, r: -2 },
        facing: 2,
        tags: ['exterior', 'escape', 'final'],
      },
      { type: 'hiding_spot', name: 'rubble_cover', offset: { q: 1, r: 0 }, tags: ['cover'] },
      {
        type: 'evidence_spot',
        name: 'abandoned_supplies',
        offset: { q: -1, r: 0 },
        tags: ['clue', 'evacuation'],
      },
    ],
    zones: [
      {
        type: 'public_area',
        name: 'escape_tunnel',
        tiles: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: 0, r: -1 },
          { q: 0, r: -2 },
        ],
        tags: ['passage', 'escape'],
      },
    ],
    tags: ['escape', 'exit', 'finale'],
    importance: 5,
  },
];

// ============================================================================
// BASE TILES - Walls, corridors, atmosphere
// ============================================================================

const baseTiles: TileDef[] = [
  // =========================================================================
  // OUTER WALLS (stone_mountain terrain as impassable boundary)
  // =========================================================================
  // Top boundary (r = 0-2)
  ...generateFloorTiles(0, 0, 60, 3, 'stone_rocks', 2),

  // Bottom boundary (r = 48-50)
  ...generateFloorTiles(0, 48, 60, 2, 'stone_rocks', 2),

  // Left boundary (q = 0-5)
  ...generateFloorTiles(0, 3, 6, 45, 'stone_rocks', 2),

  // Right boundary (q = 55-60)
  ...generateFloorTiles(54, 3, 6, 45, 'stone_rocks', 2),

  // =========================================================================
  // MAIN CORRIDORS connecting areas
  // =========================================================================

  // Entry tunnel to Assembly Hall (r: 40-46, q: 28-32)
  { coord: { q: 29, r: 41 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 41 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 31, r: 41 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 29, r: 40 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 40 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 31, r: 40 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 39 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 38 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 37 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Assembly Hall to Power Station corridor (west)
  { coord: { q: 26, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 25, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 24, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 23, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 22, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 21, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 20, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Assembly Hall to Barracks corridor (east)
  { coord: { q: 34, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 35, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 36, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 37, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 38, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 39, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 40, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 41, r: 34 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Assembly Hall to Command Center (north)
  { coord: { q: 30, r: 31 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 30 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 29 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 28 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 27 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 30, r: 26 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Power Station to Furnace (down/west)
  { coord: { q: 14, r: 32 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 31 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 30 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 29 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 28 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 27 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 26 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 14, r: 25 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 13, r: 24 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Command Center to Armory (east)
  { coord: { q: 33, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 34, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 35, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 36, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 37, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 38, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 39, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 40, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Command Center to Storage Vaults (west)
  { coord: { q: 27, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 26, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 25, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 24, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 23, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 22, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 21, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 20, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Barracks to Testing Ground (north)
  { coord: { q: 44, r: 31 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 30 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 29 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 28 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 27 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 26 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 25 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 24 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 23 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 22 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 21 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 20 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 19 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 18 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 17 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 44, r: 16 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Testing Ground to Maintenance Bay (east)
  { coord: { q: 48, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 49, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 50, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 51, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 52, r: 13 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // Maintenance Bay to Escape Route (north)
  { coord: { q: 55, r: 11 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 55, r: 10 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 55, r: 9 }, terrain: 'stone', feature: 'none', elevation: 0 },
  { coord: { q: 55, r: 8 }, terrain: 'stone', feature: 'none', elevation: 0 },

  // =========================================================================
  // ATMOSPHERIC DETAILS
  // =========================================================================

  // Scattered debris in corridors
  { coord: { q: 25, r: 34 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
  { coord: { q: 36, r: 34 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
  { coord: { q: 30, r: 29 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },
  { coord: { q: 44, r: 25 }, terrain: 'stone', feature: 'rock_small', elevation: 0 },

  // Old machinery parts
  { coord: { q: 22, r: 33 }, terrain: 'stone', feature: 'ruins', elevation: 0 },
  { coord: { q: 38, r: 33 }, terrain: 'stone', feature: 'ruins', elevation: 0 },
  { coord: { q: 30, r: 28 }, terrain: 'stone', feature: 'ruins', elevation: 0 },

  // =========================================================================
  // INTERNAL WALLS (separating areas)
  // =========================================================================

  // Walls around Assembly Hall
  { coord: { q: 26, r: 36 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 34, r: 36 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 26, r: 32 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 34, r: 32 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },

  // Walls around Power Station
  { coord: { q: 14, r: 35 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 20, r: 35 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 14, r: 31 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 20, r: 31 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },

  // Walls around Command Center
  { coord: { q: 27, r: 25 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 33, r: 25 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 27, r: 21 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },
  { coord: { q: 33, r: 21 }, terrain: 'stone_mountain', feature: 'none', elevation: 1 },

  // =========================================================================
  // DECORATIVE FILL for empty spaces (stone floor)
  // =========================================================================

  // General floor tiles between areas
  ...generateFloorTiles(7, 28, 8, 10, 'stone'), // Area around Power Station/Furnace
  ...generateFloorTiles(35, 28, 10, 8, 'stone'), // Area around Barracks
  ...generateFloorTiles(35, 15, 12, 10, 'stone'), // Area around Testing Ground
  ...generateFloorTiles(22, 15, 12, 10, 'stone'), // Area around Command/Armory/Vaults
];

// ============================================================================
// MAIN LOCATION DEFINITION
// ============================================================================

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

  slots: dungeonSlots,
  assemblages: [], // We use inline slots for this unique dungeon

  baseTiles: baseTiles,

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

  atmosphere: {
    dangerLevel: 8, // Very dangerous - final dungeon
    wealthLevel: 7, // Valuable Civil War artifacts
    populationDensity: 'sparse', // Only automatons remain
    lawLevel: 'lawless', // No law here - machine law
  },

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

export default OldWorks;
