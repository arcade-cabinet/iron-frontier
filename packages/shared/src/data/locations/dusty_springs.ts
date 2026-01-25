/**
 * Dusty Springs - Main Starting Town
 *
 * The beating heart of Iron Frontier. A frontier town of about 200 souls
 * where optimism meets the long shadow of corporate corruption.
 *
 * Theme: Frontier optimism meets corporate corruption
 * Region: Central Plains (Level 1)
 *
 * Key Characters:
 * - Sheriff Marcus Cole - Honest lawman, overwhelmed
 * - Mayor Josephine Holt - In IVRC's pocket, but conflicted
 * - "Doc" Chen Wei - Town doctor, knows everyone's secrets
 * - Father Miguel - Priest, runs underground railroad for escaped workers
 */

import { Location, validateLocation } from '../schemas/spatial';

export const DustySprings: Location = validateLocation({
  id: 'dusty_springs',
  name: 'Dusty Springs',
  type: 'town',
  size: 'medium',
  description:
    'A frontier town clinging to the edge of civilization. The railroad brought hope here, but the Iron Valley Railroad Company brought something else entirely.',
  lore: `Founded in 1879 when prospectors found a reliable spring in the otherwise parched plains.
The arrival of the railroad in '84 transformed it from a dusty waystation to a proper town.
Now it serves as IVRC's gateway to the western territories - for better or worse.`,

  seed: 18870401,
  width: 40,
  height: 40,
  baseTerrain: 'sand',

  // ===========================================================================
  // ASSEMBLAGES FROM LIBRARY
  // ===========================================================================
  assemblages: [
    // -------------------------------------------------------------------------
    // MAIN STREET - Commercial District
    // -------------------------------------------------------------------------

    // The Rusty Spur Saloon - Social hub, rumor mill
    // Two-story establishment where deals are made and secrets spill like whiskey
    {
      assemblageId: 'asm_saloon_01',
      instanceId: 'rusty_spur_saloon',
      anchor: { q: 20, r: 18 },
      rotation: 0,
      tags: ['main_street', 'social_hub', 'the_rusty_spur'],
      importance: 5,
    },

    // Holt's Mercantile - General Store (owned by mayor's family)
    // The Holt family has controlled commerce here for a decade
    {
      assemblageId: 'asm_general_store_01',
      instanceId: 'holts_mercantile',
      anchor: { q: 24, r: 18 },
      rotation: 0,
      tags: ['main_street', 'commerce', 'holt_family'],
      importance: 4,
    },

    // Sheriff's Office - Law presence, bounty board
    // Marcus Cole's domain - understaffed and underfunded
    {
      assemblageId: 'asm_sheriff_01',
      instanceId: 'sheriff_office',
      anchor: { q: 16, r: 18 },
      rotation: 0,
      tags: ['main_street', 'law', 'sheriff_cole'],
      importance: 5,
    },

    // Town Well - Central gathering spot
    // Where gossip flows as freely as water
    {
      assemblageId: 'asm_well_01',
      instanceId: 'town_well',
      anchor: { q: 20, r: 14 },
      rotation: 0,
      tags: ['town_center', 'gathering'],
      importance: 3,
    },

    // Gunsmith - Next to sheriff's office
    {
      assemblageId: 'asm_gunsmith_01',
      instanceId: 'gunsmith',
      anchor: { q: 14, r: 18 },
      rotation: 0,
      tags: ['main_street', 'weapons'],
      importance: 3,
    },

    // -------------------------------------------------------------------------
    // CIVIC / RELIGIOUS
    // -------------------------------------------------------------------------

    // St. Michael's Church - Father Miguel's sanctuary
    // More than a place of worship - a refuge for the desperate
    {
      assemblageId: 'asm_church_01',
      instanceId: 'st_michaels_church',
      anchor: { q: 10, r: 26 },
      rotation: 0,
      tags: ['religious', 'sanctuary', 'father_miguel'],
      importance: 4,
    },

    // Train Depot - Connection to Junction City and beyond
    // The iron umbilical cord that ties Dusty Springs to IVRC
    {
      assemblageId: 'asm_train_station_01',
      instanceId: 'train_depot',
      anchor: { q: 32, r: 12 },
      rotation: 0,
      tags: ['transport', 'ivrc', 'railroad'],
      importance: 5,
    },

    // Telegraph Office - Near the depot
    {
      assemblageId: 'asm_telegraph_01',
      instanceId: 'telegraph_office',
      anchor: { q: 30, r: 16 },
      rotation: 0,
      tags: ['communication', 'ivrc'],
      importance: 3,
    },

    // -------------------------------------------------------------------------
    // LIVERY & SERVICES
    // -------------------------------------------------------------------------

    // Murphy's Livery - Stable at west edge of town
    // Old Murphy knows every horse and most of the secrets in town
    {
      assemblageId: 'asm_stable_01',
      instanceId: 'murphys_livery',
      anchor: { q: 6, r: 20 },
      rotation: 0,
      tags: ['mounts', 'town_edge', 'murphy'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // RESIDENTIAL - Various homes throughout town
    // -------------------------------------------------------------------------

    // Mayor Josephine Holt's residence - The finest house in town
    {
      assemblageId: 'asm_mansion_01',
      instanceId: 'holt_mansion',
      anchor: { q: 28, r: 24 },
      rotation: 2,
      tags: ['residential', 'wealthy', 'holt_family', 'mayor'],
      importance: 5,
    },

    // Modest homes - Working families
    {
      assemblageId: 'asm_house_01',
      instanceId: 'house_miller',
      anchor: { q: 14, r: 26 },
      rotation: 1,
      tags: ['residential', 'civilian'],
    },
    {
      assemblageId: 'asm_house_01',
      instanceId: 'house_oconnor',
      anchor: { q: 18, r: 28 },
      rotation: 4,
      tags: ['residential', 'civilian'],
    },

    // Cabins - Simpler dwellings at town edges
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_north',
      anchor: { q: 12, r: 8 },
      rotation: 3,
      tags: ['residential', 'poor', 'edge'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_west',
      anchor: { q: 6, r: 14 },
      rotation: 0,
      tags: ['residential', 'poor', 'edge'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_south',
      anchor: { q: 22, r: 32 },
      rotation: 5,
      tags: ['residential', 'poor', 'edge'],
    },
    {
      assemblageId: 'asm_cabin_01',
      instanceId: 'cabin_southeast',
      anchor: { q: 30, r: 30 },
      rotation: 2,
      tags: ['residential', 'poor', 'edge'],
    },
  ],

  // ===========================================================================
  // INLINE SLOT DEFINITIONS
  // Buildings not in the library - defined here with full detail
  // ===========================================================================
  slots: [
    // -------------------------------------------------------------------------
    // Doc Chen Wei's Office - Town doctor
    // A Chinese immigrant who's seen too much and knows everyone's secrets
    // -------------------------------------------------------------------------
    {
      id: 'doc_chen_office',
      type: 'doctor',
      name: "Doc Chen Wei's Office",
      anchor: { q: 26, r: 18 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'office_building', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'front_door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
        { type: 'counter', name: 'examination_table', offset: { q: 0, r: 0 }, tags: ['medical', 'service'] },
        { type: 'storage', name: 'medicine_cabinet', offset: { q: -1, r: 0 }, tags: ['medical', 'supplies'] },
        { type: 'bed', name: 'patient_cot', offset: { q: 0, r: 1 }, tags: ['rest', 'recovery'] },
        { type: 'spawn_point', name: 'doc_chen', offset: { q: 0, r: 0 }, facing: 0, tags: ['npc', 'doctor', 'important'] },
        { type: 'conversation_spot', name: 'private_consultation', offset: { q: -1, r: 0 }, tags: ['quest', 'secrets'] },
      ],
      zones: [
        { type: 'public_area', name: 'waiting_area', tiles: [{ q: 1, r: 0 }], tags: [] },
        { type: 'restricted_area', name: 'treatment_room', tiles: [{ q: 0, r: 0 }, { q: 0, r: 1 }], tags: ['medical'] },
        { type: 'loot_area', name: 'supplies', tiles: [{ q: -1, r: 0 }], tags: ['medical', 'valuable'] },
      ],
      tags: ['main_street', 'medical', 'doc_chen'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // The Dusty Rose Hotel - Rest and travelers
    // Where drifters lay their heads and secrets pass through
    // -------------------------------------------------------------------------
    {
      id: 'dusty_rose_hotel',
      type: 'hotel',
      name: 'The Dusty Rose Hotel',
      anchor: { q: 18, r: 18 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'hotel_building', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: -1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'main_entrance', offset: { q: 1, r: 0 }, facing: 0, tags: ['main', 'public'] },
        { type: 'counter', name: 'front_desk', offset: { q: 0, r: 0 }, tags: ['service', 'registration'] },
        { type: 'bed', name: 'room_1', offset: { q: 0, r: -1 }, tags: ['rest', 'paid'] },
        { type: 'bed', name: 'room_2', offset: { q: -1, r: 0 }, tags: ['rest', 'paid'] },
        { type: 'spawn_point', name: 'innkeeper', offset: { q: 0, r: 0 }, facing: 0, tags: ['npc', 'staff'] },
        { type: 'spawn_point', name: 'traveler_spawn', offset: { q: 0, r: 1 }, tags: ['npc', 'transient'] },
        { type: 'storage', name: 'guest_storage', offset: { q: -1, r: 0 }, tags: ['personal', 'player'] },
      ],
      zones: [
        { type: 'public_area', name: 'lobby', tiles: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }], tags: [] },
        { type: 'restricted_area', name: 'guest_rooms', tiles: [{ q: 0, r: -1 }, { q: -1, r: 0 }], tags: ['private'] },
      ],
      tags: ['main_street', 'rest', 'travelers', 'dusty_rose'],
      importance: 4,
    },

    // -------------------------------------------------------------------------
    // Blacksmith - Equipment repair and upgrades
    // -------------------------------------------------------------------------
    {
      id: 'blacksmith',
      type: 'workshop',
      name: 'Blacksmith',
      anchor: { q: 10, r: 18 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'workshop_building', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'door', offset: { q: 1, r: 0 }, facing: 0, tags: ['main'] },
        { type: 'workbench', name: 'forge', offset: { q: 0, r: 0 }, tags: ['crafting', 'repair'] },
        { type: 'workbench', name: 'anvil', offset: { q: 0, r: 1 }, tags: ['crafting'] },
        { type: 'storage', name: 'materials', offset: { q: -1, r: 0 }, tags: ['supplies', 'metal'] },
        { type: 'spawn_point', name: 'blacksmith', offset: { q: 0, r: 0 }, facing: 0, tags: ['npc', 'craftsman'] },
      ],
      zones: [
        { type: 'public_area', name: 'shop_front', tiles: [{ q: 1, r: 0 }], tags: [] },
        { type: 'restricted_area', name: 'forge_area', tiles: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 0 }], tags: ['work'] },
      ],
      tags: ['main_street', 'crafting', 'repair'],
      importance: 3,
    },

    // -------------------------------------------------------------------------
    // Water Tower - Town landmark
    // Visible from miles away, marks Dusty Springs on the horizon
    // -------------------------------------------------------------------------
    {
      id: 'water_tower',
      type: 'landmark',
      name: 'Water Tower',
      anchor: { q: 20, r: 10 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', structure: 'water_tower', structureRotation: 0 },
        { coord: { q: 1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: -1, r: 0 }, terrain: 'dirt', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        { type: 'vantage_point', name: 'tower_top', offset: { q: 0, r: 0 }, tags: ['elevated', 'lookout'] },
        { type: 'hiding_spot', name: 'tower_shadow', offset: { q: -1, r: 0 }, tags: ['cover'] },
      ],
      zones: [
        { type: 'public_area', name: 'tower_base', tiles: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 1 }], tags: ['landmark'] },
      ],
      tags: ['landmark', 'water', 'visible'],
      importance: 2,
    },

    // -------------------------------------------------------------------------
    // Graveyard - Behind the church
    // Those who came seeking fortune but found only dust
    // -------------------------------------------------------------------------
    {
      id: 'graveyard',
      type: 'landmark',
      name: 'Boot Hill Cemetery',
      anchor: { q: 8, r: 30 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'grass', feature: 'none' },
        { coord: { q: 1, r: 0 }, terrain: 'grass', feature: 'none' },
        { coord: { q: 2, r: 0 }, terrain: 'grass', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'grass', feature: 'tree_dead' },
        { coord: { q: 1, r: 1 }, terrain: 'grass', feature: 'none' },
        { coord: { q: 2, r: 1 }, terrain: 'grass', feature: 'none' },
        { coord: { q: 0, r: 2 }, terrain: 'grass', feature: 'none' },
        { coord: { q: 1, r: 2 }, terrain: 'grass', feature: 'none' },
      ],
      markers: [
        { type: 'entrance', name: 'cemetery_gate', offset: { q: 0, r: 0 }, facing: 5, tags: ['main'] },
        { type: 'evidence_spot', name: 'fresh_grave', offset: { q: 2, r: 1 }, tags: ['clue', 'dark', 'quest'] },
        { type: 'evidence_spot', name: 'old_headstone', offset: { q: 1, r: 0 }, tags: ['lore', 'history'] },
        { type: 'hiding_spot', name: 'behind_monument', offset: { q: 0, r: 1 }, tags: ['cover'] },
        { type: 'conversation_spot', name: 'mourning_spot', offset: { q: 1, r: 1 }, tags: ['private', 'emotional'] },
      ],
      zones: [
        { type: 'public_area', name: 'cemetery', tiles: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 }, { q: 0, r: 2 }, { q: 1, r: 2 }], tags: ['somber'] },
        { type: 'loot_area', name: 'hidden_cache', tiles: [{ q: 2, r: 1 }], tags: ['hidden', 'dark'] },
      ],
      tags: ['cemetery', 'somber', 'secrets'],
      importance: 2,
    },
  ],

  // ===========================================================================
  // BASE TILES - Roads, terrain features, atmosphere
  // ===========================================================================
  baseTiles: [
    // -------------------------------------------------------------------------
    // MAIN STREET - East-West thoroughfare (r=19 is the road)
    // The spine of the town, packed dirt from countless boots and hooves
    // -------------------------------------------------------------------------

    // Main Street - from west entrance through town center to east
    { coord: { q: 4, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 5, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 6, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 7, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 8, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 9, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 10, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 11, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 12, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 13, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 14, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 15, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 16, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 17, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 18, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 19, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 20, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 21, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 22, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 23, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 24, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 25, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 26, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 27, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 28, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 29, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 30, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 31, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 32, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 33, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 34, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 35, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 36, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // West road entrance approach
    { coord: { q: 2, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 3, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // East road exit
    { coord: { q: 37, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },
    { coord: { q: 38, r: 19 }, terrain: 'dirt', edges: ['road', 'none', 'none', 'road', 'none', 'none'] },

    // -------------------------------------------------------------------------
    // NORTH-SOUTH ROAD - To the well and water tower
    // -------------------------------------------------------------------------
    { coord: { q: 20, r: 15 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 16 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 17 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 18 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // Road continues north to water tower
    { coord: { q: 20, r: 11 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 12 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 20, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // CHURCH ROAD - Side road to St. Michael's
    // -------------------------------------------------------------------------
    { coord: { q: 10, r: 20 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 21 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 22 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 23 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 24 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 10, r: 25 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // DEPOT ROAD - To train station
    // -------------------------------------------------------------------------
    { coord: { q: 30, r: 17 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 30, r: 18 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 16 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 15 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 14 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 31, r: 13 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // MANSION ROAD - To Holt Mansion
    // -------------------------------------------------------------------------
    { coord: { q: 28, r: 20 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 28, r: 21 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 28, r: 22 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },
    { coord: { q: 28, r: 23 }, terrain: 'dirt', edges: ['none', 'road', 'none', 'none', 'none', 'road'] },

    // -------------------------------------------------------------------------
    // RAILROAD - Running east-west north of town
    // The iron spine of IVRC's domain
    // -------------------------------------------------------------------------
    { coord: { q: 28, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 29, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 30, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 35, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 36, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 37, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 38, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 26, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },
    { coord: { q: 27, r: 12 }, terrain: 'dirt', edges: ['railroad', 'none', 'none', 'railroad', 'none', 'none'] },

    // -------------------------------------------------------------------------
    // DESERT DECORATIONS - Atmosphere
    // The land encroaches, reminding everyone how fragile civilization is here
    // -------------------------------------------------------------------------

    // Cacti scattered around edges
    { coord: { q: 3, r: 6 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 5, r: 4 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 36, r: 6 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 34, r: 4 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 3, r: 32 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 6, r: 35 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 35, r: 34 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 37, r: 32 }, terrain: 'sand', feature: 'cactus' },

    // Dead trees - reminders of failed dreams
    { coord: { q: 4, r: 10 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 36, r: 28 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 2, r: 26 }, terrain: 'sand', feature: 'tree_dead' },
    { coord: { q: 38, r: 8 }, terrain: 'sand', feature: 'tree_dead' },

    // Rocks and boulders
    { coord: { q: 6, r: 6 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 34, r: 32 }, terrain: 'sand', feature: 'rock_large' },
    { coord: { q: 8, r: 34 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 32, r: 6 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 2, r: 14 }, terrain: 'sand', feature: 'rock_small' },
    { coord: { q: 38, r: 24 }, terrain: 'sand', feature: 'rock_large' },

    // Town square area - packed dirt around the well
    { coord: { q: 19, r: 14 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 21, r: 14 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 19, r: 15 }, terrain: 'dirt', feature: 'none' },
    { coord: { q: 21, r: 15 }, terrain: 'dirt', feature: 'none' },

    // Grass patches near church and residential
    { coord: { q: 12, r: 26 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 14, r: 28 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 26, r: 26 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 24, r: 28 }, terrain: 'grass', feature: 'tree' },

    // Near the graveyard
    { coord: { q: 6, r: 28 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 12, r: 32 }, terrain: 'grass', feature: 'bush' },

    // Some mesquite bushes along roads
    { coord: { q: 8, r: 18 }, terrain: 'dirt', feature: 'bush' },
    { coord: { q: 32, r: 20 }, terrain: 'dirt', feature: 'bush' },

    // TOWN CENTER DECORATIONS - Make the main street feel lived-in
    // Near the saloon (14, 18)
    { coord: { q: 12, r: 17 }, terrain: 'dirt', feature: 'bush' },
    { coord: { q: 13, r: 16 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 15, r: 20 }, terrain: 'grass', feature: 'tree_dead' },

    // Near town square and well (19-21, 14-15)
    { coord: { q: 17, r: 13 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 23, r: 13 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 18, r: 16 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 22, r: 16 }, terrain: 'grass', feature: 'tree' },

    // Along main street (connecting west to east)
    { coord: { q: 10, r: 19 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 25, r: 19 }, terrain: 'dirt', feature: 'rock_small' },
    { coord: { q: 28, r: 18 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 30, r: 19 }, terrain: 'dirt', feature: 'rock_small' },

    // Near bank and hotel area
    { coord: { q: 24, r: 17 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 21, r: 20 }, terrain: 'grass', feature: 'tree' },

    // Near doc chen's office (26, 18)
    { coord: { q: 27, r: 17 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 25, r: 20 }, terrain: 'grass', feature: 'tree_dead' },

    // Near Holt mansion (28, 24) - more manicured
    { coord: { q: 30, r: 23 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 26, r: 25 }, terrain: 'grass', feature: 'tree' },
    { coord: { q: 30, r: 25 }, terrain: 'grass', feature: 'bush' },
    { coord: { q: 29, r: 22 }, terrain: 'grass', feature: 'tree' },

    // Desert encroachment on town edges
    { coord: { q: 6, r: 19 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 34, r: 19 }, terrain: 'sand', feature: 'cactus' },
    { coord: { q: 20, r: 8 }, terrain: 'sand', feature: 'cactus_tall' },
    { coord: { q: 20, r: 32 }, terrain: 'sand', feature: 'cactus' },

    // Boulders as natural town boundaries
    { coord: { q: 4, r: 16 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 4, r: 22 }, terrain: 'sand', feature: 'boulder' },
    { coord: { q: 36, r: 16 }, terrain: 'sand', feature: 'rock_large' },
    { coord: { q: 36, r: 22 }, terrain: 'sand', feature: 'boulder' },

    // -------------------------------------------------------------------------
    // WESTERN TOWN PROPS - Authentic frontier atmosphere
    // -------------------------------------------------------------------------

    // Barrels outside saloon and general store
    { coord: { q: 13, r: 18 }, terrain: 'dirt', feature: 'barrel' },
    { coord: { q: 14, r: 17 }, terrain: 'dirt', feature: 'barrel_water' },
    { coord: { q: 19, r: 13 }, terrain: 'dirt', feature: 'barrel' },
    { coord: { q: 20, r: 13 }, terrain: 'dirt', feature: 'barrel_hay' },

    // Benches around town square
    { coord: { q: 18, r: 14 }, terrain: 'dirt', feature: 'bench' },
    { coord: { q: 22, r: 14 }, terrain: 'dirt', feature: 'bench' },
    { coord: { q: 20, r: 16 }, terrain: 'dirt', feature: 'bench' },

    // Carts - parked around town
    { coord: { q: 16, r: 20 }, terrain: 'dirt', feature: 'cart' },
    { coord: { q: 28, r: 20 }, terrain: 'dirt', feature: 'cart' },
    { coord: { q: 8, r: 17 }, terrain: 'dirt', feature: 'cart' },

    // Signposts at key locations
    { coord: { q: 5, r: 19 }, terrain: 'dirt', feature: 'signpost' },
    { coord: { q: 20, r: 12 }, terrain: 'dirt', feature: 'signpost' },
    { coord: { q: 35, r: 19 }, terrain: 'dirt', feature: 'signpost' },

    // Stumps and logs - natural debris
    { coord: { q: 7, r: 20 }, terrain: 'dirt', feature: 'stump' },
    { coord: { q: 11, r: 16 }, terrain: 'dirt', feature: 'log' },
    { coord: { q: 31, r: 18 }, terrain: 'dirt', feature: 'stump' },

    // More barrels near stable and warehouse areas
    { coord: { q: 24, r: 20 }, terrain: 'dirt', feature: 'barrel_hay' },
    { coord: { q: 26, r: 20 }, terrain: 'dirt', feature: 'barrel_water' },
    { coord: { q: 12, r: 20 }, terrain: 'dirt', feature: 'barrel' },
  ],

  // ===========================================================================
  // ENTRY POINTS
  // ===========================================================================
  entryPoints: [
    {
      id: 'west_road',
      coord: { q: 2, r: 19 },
      direction: 'west',
      connectionType: 'road',
      tags: ['main', 'default', 'player_start'],
    },
    {
      id: 'east_road',
      coord: { q: 38, r: 19 },
      direction: 'east',
      connectionType: 'road',
      tags: ['junction_city'],
    },
    {
      id: 'train_depot',
      coord: { q: 34, r: 12 },
      direction: 'east',
      connectionType: 'railroad',
      tags: ['railroad', 'fast_travel'],
    },
  ],

  // ===========================================================================
  // PLAYER SPAWN
  // Arriving from the west road, the drifter's first view of Dusty Springs
  // ===========================================================================
  playerSpawn: {
    coord: { q: 4, r: 19 },
    facing: 0, // Facing east, toward the town
  },

  // ===========================================================================
  // ATMOSPHERE
  // ===========================================================================
  atmosphere: {
    dangerLevel: 1, // Safe in town, mostly
    wealthLevel: 4, // Modest prosperity
    populationDensity: 'sparse', // ~200 souls
    lawLevel: 'frontier', // Sheriff Cole does his best
  },

  tags: ['starter', 'western', 'town', 'main', 'dusty_springs', 'central_plains'],
});

export default DustySprings;
