import type { SlotInstance } from '../../schemas/spatial.ts';

export const dungeonSlots5: SlotInstance[] = [
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
];
