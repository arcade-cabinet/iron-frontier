import type { SlotInstance } from '../../schemas/spatial.ts';

export const signal_rockSlots0: SlotInstance[] = [
    {
      id: 'the_rock',
      type: 'landmark',
      name: 'Signal Rock',
      anchor: { q: 10, r: 7 },
      rotation: 0,
      tiles: [
        // Core of the massive rock (elevated, impassable base)
        { coord: { q: 0, r: 0 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
        { coord: { q: 1, r: 0 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'stone_mountain', elevation: 3, feature: 'none' },
        { coord: { q: 1, r: 1 }, terrain: 'stone_mountain', elevation: 2, feature: 'none' },
        { coord: { q: -1, r: 1 }, terrain: 'stone_mountain', elevation: 2, feature: 'none' },
        { coord: { q: 2, r: 0 }, terrain: 'stone_rocks', elevation: 2, feature: 'boulder' },
        // Sloped approach on east side
        { coord: { q: 2, r: 1 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
        { coord: { q: 2, r: 2 }, terrain: 'stone', elevation: 1, feature: 'none' },
      ],
      markers: [
        {
          type: 'vantage_point',
          name: 'rock_summit',
          offset: { q: 0, r: 0 },
          tags: ['lookout', 'elevated', 'best_view'],
        },
        {
          type: 'evidence_spot',
          name: 'ancient_carvings',
          offset: { q: -1, r: 1 },
          tags: ['lore', 'mystery', 'ancient'],
        },
        {
          type: 'entrance',
          name: 'climb_path',
          offset: { q: 2, r: 2 },
          facing: 3,
          tags: ['difficult', 'approach'],
        },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'rock_base',
          tiles: [
            { q: 2, r: 1 },
            { q: 2, r: 2 },
          ],
          tags: ['approach'],
        },
      ],
      tags: ['iconic', 'ancient', 'navigation'],
      importance: 5,
    },
    {
      id: 'lookout_platform',
      type: 'landmark',
      name: 'Lookout Platform',
      anchor: { q: 11, r: 6 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_hill', elevation: 2, feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'stone', elevation: 1, feature: 'none' },
      ],
      markers: [
        {
          type: 'vantage_point',
          name: 'platform_view',
          offset: { q: 0, r: 0 },
          facing: 0,
          tags: ['lookout', 'wooden_structure'],
        },
        {
          type: 'spawn_point',
          name: 'lookout_post',
          offset: { q: 0, r: 0 },
          facing: 0,
          tags: ['npc', 'guard', 'outlaw'],
        },
        {
          type: 'storage',
          name: 'signal_supplies',
          offset: { q: 0, r: 1 },
          tags: ['torches', 'oil'],
        },
      ],
      zones: [
        {
          type: 'restricted_area',
          name: 'platform',
          tiles: [{ q: 0, r: 0 }],
          priority: 1,
          tags: ['guarded'],
        },
      ],
      tags: ['constructed', 'lookout', 'outlaw'],
      importance: 4,
    },
    {
      id: 'signal_fire_pit',
      type: 'landmark',
      name: 'Signal Fire',
      anchor: { q: 10, r: 5 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone', elevation: 2, feature: 'campfire_pit' },
        { coord: { q: 1, r: 0 }, terrain: 'stone_hill', elevation: 2, feature: 'rock_small' },
        { coord: { q: -1, r: 0 }, terrain: 'stone_hill', elevation: 2, feature: 'rock_small' },
      ],
      markers: [
        {
          type: 'spawn_point',
          name: 'fire_tender',
          offset: { q: 0, r: 0 },
          tags: ['npc', 'outlaw', 'signal'],
        },
        {
          type: 'evidence_spot',
          name: 'signal_codes',
          offset: { q: 1, r: 0 },
          tags: ['clue', 'communication'],
        },
        { type: 'storage', name: 'fuel_pile', offset: { q: -1, r: 0 }, tags: ['wood', 'supplies'] },
      ],
      zones: [
        {
          type: 'event_stage',
          name: 'signal_area',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: -1, r: 0 },
          ],
          tags: ['signal', 'communication'],
        },
      ],
      tags: ['communication', 'signal', 'outlaw_network'],
      importance: 4,
    },
    {
      id: 'ancient_carvings_site',
      type: 'landmark',
      name: 'Carved Stone',
      anchor: { q: 8, r: 9 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'rock_large' },
        { coord: { q: 0, r: 1 }, terrain: 'stone', feature: 'none' },
      ],
      markers: [
        {
          type: 'evidence_spot',
          name: 'sun_symbol',
          offset: { q: 0, r: 0 },
          tags: ['ancient', 'mystery', 'lore'],
        },
        {
          type: 'evidence_spot',
          name: 'spiral_carving',
          offset: { q: 1, r: 0 },
          tags: ['ancient', 'mystery', 'map_hint'],
        },
        {
          type: 'conversation_spot',
          name: 'meditation_spot',
          offset: { q: 0, r: 1 },
          tags: ['quiet', 'lore'],
        },
      ],
      zones: [
        {
          type: 'event_stage',
          name: 'carving_area',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
          ],
          tags: ['lore', 'discovery'],
        },
      ],
      tags: ['ancient', 'mysterious', 'lore_hook', 'quest_potential'],
      importance: 3,
    },
    {
      id: 'trail_markers',
      type: 'landmark',
      name: 'Trail Junction',
      anchor: { q: 14, r: 14 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'dirt', feature: 'rock_small' },
        { coord: { q: 1, r: 0 }, terrain: 'badlands', feature: 'none' },
        { coord: { q: 0, r: 1 }, terrain: 'badlands', feature: 'none' },
        { coord: { q: -1, r: 1 }, terrain: 'dirt', feature: 'none' },
      ],
      markers: [
        {
          type: 'evidence_spot',
          name: 'outlaw_mark_north',
          offset: { q: 0, r: 0 },
          tags: ['trail', 'rattlesnake_canyon'],
        },
        {
          type: 'evidence_spot',
          name: 'outlaw_mark_east',
          offset: { q: 1, r: 0 },
          tags: ['trail', 'dead_mans_gulch'],
        },
        {
          type: 'evidence_spot',
          name: 'outlaw_mark_west',
          offset: { q: -1, r: 1 },
          tags: ['trail', 'safe_passage'],
        },
      ],
      zones: [
        {
          type: 'public_area',
          name: 'junction',
          tiles: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: 0, r: 1 },
            { q: -1, r: 1 },
          ],
          tags: ['navigation'],
        },
      ],
      tags: ['navigation', 'outlaw_trails', 'information'],
      importance: 2,
    },
];
