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

import { type Location, validateLocation } from '../schemas/spatial';

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

  assemblages: [
    // ========================================
    // HIDDEN CAMP - Small tent camp behind rock
    // ========================================
    {
      assemblageId: 'asm_tent_camp_01',
      instanceId: 'hidden_camp',
      anchor: { q: 6, r: 8 },
      rotation: 2,
      tags: ['outlaw', 'camp', 'hidden'],
      importance: 3,
    },

    // ========================================
    // LOOKOUT CAMPFIRE - At base of path
    // ========================================
    {
      assemblageId: 'asm_campfire_01',
      instanceId: 'base_camp',
      anchor: { q: 12, r: 12 },
      rotation: 0,
      tags: ['rest', 'lookout_support'],
      importance: 2,
    },

    // ========================================
    // ROCK COVER - Natural concealment
    // ========================================
    {
      assemblageId: 'asm_rocks_01',
      instanceId: 'cover_rocks',
      anchor: { q: 8, r: 14 },
      rotation: 3,
      tags: ['cover', 'approach'],
      importance: 2,
    },
  ],

  slots: [
    // ========================================
    // THE ROCK - Massive central formation
    // Custom slot for the iconic rock itself
    // ========================================
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

    // ========================================
    // LOOKOUT PLATFORM - Wooden structure on rock
    // ========================================
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

    // ========================================
    // SIGNAL FIRE PIT - For sending messages
    // ========================================
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

    // ========================================
    // ANCIENT CARVINGS - Mysterious symbols (lore hook)
    // ========================================
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

    // ========================================
    // TRAIL MARKERS - Showing paths to hideouts
    // ========================================
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

    // ========================================
    // SUPPLY CACHE - For travelers
    // ========================================
    {
      id: 'traveler_cache',
      type: 'hidden_cache',
      name: 'Rock Cache',
      anchor: { q: 5, r: 11 },
      rotation: 0,
      tiles: [
        { coord: { q: 0, r: 0 }, terrain: 'stone_rocks', feature: 'boulder' },
        { coord: { q: 1, r: 0 }, terrain: 'stone', feature: 'rock_small' },
      ],
      markers: [
        {
          type: 'storage',
          name: 'emergency_cache',
          offset: { q: 0, r: 0 },
          tags: ['hidden', 'supplies', 'water'],
        },
        { type: 'hiding_spot', name: 'cache_hollow', offset: { q: 1, r: 0 }, tags: ['cover'] },
      ],
      zones: [
        {
          type: 'loot_area',
          name: 'cache_contents',
          tiles: [{ q: 0, r: 0 }],
          tags: ['supplies', 'hidden'],
        },
      ],
      tags: ['hidden', 'supplies', 'outlaw_hospitality'],
      importance: 2,
    },
  ],

  baseTiles: [
    // ========================================
    // ELEVATED TERRAIN - Rock surroundings
    // ========================================
    // Northern elevated area around signal fire
    { coord: { q: 8, r: 4 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
    { coord: { q: 9, r: 4 }, terrain: 'stone', elevation: 1, feature: 'none' },
    { coord: { q: 12, r: 4 }, terrain: 'stone', elevation: 1, feature: 'none' },
    { coord: { q: 13, r: 4 }, terrain: 'stone_hill', elevation: 1, feature: 'rock_small' },
    { coord: { q: 7, r: 5 }, terrain: 'stone_rocks', elevation: 1, feature: 'boulder' },
    { coord: { q: 13, r: 5 }, terrain: 'stone_hill', elevation: 1, feature: 'none' },

    // Western approach
    { coord: { q: 4, r: 7 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 5, r: 6 }, terrain: 'stone_hill', feature: 'rock_large' },
    { coord: { q: 4, r: 9 }, terrain: 'stone', feature: 'rock_small' },
    { coord: { q: 3, r: 10 }, terrain: 'badlands', feature: 'rock_small' },

    // Eastern descent
    { coord: { q: 14, r: 8 }, terrain: 'stone_hill', feature: 'rock_small' },
    { coord: { q: 15, r: 7 }, terrain: 'stone', feature: 'none' },
    { coord: { q: 15, r: 9 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 16, r: 8 }, terrain: 'badlands', feature: 'rock_small' },

    // ========================================
    // BADLANDS FLOOR - Main approach area
    // ========================================
    { coord: { q: 10, r: 14 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 11, r: 14 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 10, r: 15 }, terrain: 'badlands', feature: 'rock_small' },
    { coord: { q: 12, r: 15 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 10, r: 16 }, terrain: 'badlands', feature: 'none' },
    { coord: { q: 11, r: 16 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 10, r: 17 }, terrain: 'badlands', feature: 'none' },

    // Southern approach trail
    {
      coord: { q: 10, r: 18 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },
    {
      coord: { q: 10, r: 19 },
      terrain: 'dirt',
      edges: ['none', 'road', 'none', 'none', 'none', 'road'],
    },

    // ========================================
    // SCATTERED TERRAIN FEATURES
    // ========================================
    // Dead vegetation (harsh environment)
    { coord: { q: 3, r: 14 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 17, r: 12 }, terrain: 'badlands', feature: 'tree_dead' },
    { coord: { q: 6, r: 16 }, terrain: 'badlands', feature: 'cactus' },
    { coord: { q: 15, r: 15 }, terrain: 'badlands', feature: 'cactus' },

    // Rocky outcrops
    { coord: { q: 2, r: 6 }, terrain: 'stone_rocks', feature: 'boulder' },
    { coord: { q: 17, r: 5 }, terrain: 'stone_rocks', feature: 'rock_large' },
    { coord: { q: 3, r: 16 }, terrain: 'stone', feature: 'rock_small' },
    { coord: { q: 16, r: 16 }, terrain: 'stone', feature: 'rock_small' },

    // Sandy patches
    { coord: { q: 13, r: 16 }, terrain: 'sand', feature: 'none' },
    { coord: { q: 7, r: 17 }, terrain: 'sand', feature: 'none' },
    { coord: { q: 4, r: 13 }, terrain: 'sand', feature: 'none' },

    // Mesa formations at edges (impassable)
    { coord: { q: 1, r: 3 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 2, r: 3 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 1, r: 4 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 18, r: 3 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 18, r: 4 }, terrain: 'mesa', feature: 'none' },
    { coord: { q: 17, r: 3 }, terrain: 'mesa', feature: 'none' },
  ],

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

  atmosphere: {
    dangerLevel: 4, // High - outlaw territory
    wealthLevel: 2, // Low - lookout post, not a base
    populationDensity: 'sparse',
    lawLevel: 'lawless',
  },

  tags: ['landmark', 'outlaw', 'lookout', 'ancient', 'navigation', 'dangerous', 'devil_backbone'],
});

export default SignalRock;
