import type { SlotInstance } from '../../schemas/spatial.ts';

export const dusty_springsSlots: SlotInstance[] = [
    // -------------------------------------------------------------------------
    // Doc Chen Wei's Office - Town doctor
    // On Main Street east of the mercantile, door faces south
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
    // The Dusty Rose Hotel - rest and travelers
    // On Main Street between sheriff and saloon
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
    // West end of Main Street, near the livery
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
    // Water Tower - Town landmark visible from the western approach
    // North of the well, the tallest structure in town
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
    // Boot Hill Cemetery - Behind the church, south side of town
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
  ];
