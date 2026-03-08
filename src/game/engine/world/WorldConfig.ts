// WorldConfig — World generation constants for the open world chunk system.
//
// Defines chunk dimensions, render distances, town world-map positions,
// and biome assignment per region.  All spatial constants live here so that
// ChunkManager, TownPlacer, and RouteRenderer share a single source of truth.

import type { BiomeId } from '@/engine/renderers/TerrainConfig';

// ---------------------------------------------------------------------------
// Chunk geometry
// ---------------------------------------------------------------------------

/** World-space side length of one chunk (metres). */
export const CHUNK_SIZE = 256;

/** Number of quad subdivisions per chunk axis (128 quads = 129 vertices). */
export const CHUNK_SEGMENTS = 128;

/** Default world seed string (deterministic terrain). */
export const DEFAULT_SEED = 'iron-frontier-world';

// ---------------------------------------------------------------------------
// Render distances
// ---------------------------------------------------------------------------

/** How many chunks to keep loaded around the player (each direction). */
export const DEFAULT_LOAD_RADIUS = 2;

/** How many chunks show full-detail (vegetation, props) around the player. */
export const DEFAULT_RENDER_RADIUS = 1;

/** Distance (world units) at which towns / routes become visible. */
export const DEFAULT_VIEW_DISTANCE = 600;

// ---------------------------------------------------------------------------
// World-coordinate scaling
// ---------------------------------------------------------------------------

/**
 * Each world-grid cell (wx, wy in the World schema) maps to this many
 * world-space metres.  Town positions are multiplied by this value.
 */
export const WORLD_CELL_SIZE = 256;

/** Radius around a town center (world units) that counts as "inside town". */
export const TOWN_BOUNDARY_RADIUS = 100;

// ---------------------------------------------------------------------------
// Town placement constants
// ---------------------------------------------------------------------------

/** Hex cell size in world units used to convert Location hex grids to 3-D. */
export const HEX_CELL_SIZE = 2.5;

/** One hex-facing step in radians (60 degrees). */
export const HEX_ROTATION_STEP = Math.PI / 3;

/** Radius around a building footprint that gets terrain flattened (metres). */
export const BUILDING_FLATTEN_RADIUS = 6;

/** Smooth blending distance around flatten zones (metres). */
export const FLATTEN_BLEND_DISTANCE = 4;

// ---------------------------------------------------------------------------
// Route rendering constants
// ---------------------------------------------------------------------------

export const ROAD_WIDTH = 4;
export const TRAIL_WIDTH = 2;
export const RAILROAD_WIDTH = 3;
export const ROAD_Y_OFFSET = 0.15;
export const ROAD_COLOR = '#8B7355';
export const TRAIL_COLOR = '#A09070';
export const RAILROAD_COLOR = '#6B5B4B';
export const RAIL_COLOR = '#4A4A4A';
export const FENCE_POST_SPACING = 12;
export const FENCE_POST_HEIGHT = 1.2;
export const FENCE_POST_RADIUS = 0.06;

// ---------------------------------------------------------------------------
// Region -> BiomeId mapping
// ---------------------------------------------------------------------------

/**
 * Maps the world schema's RegionBiome strings (desert, badlands, scrubland,
 * grassland, mountain, riverside, salt_flat) to the four rendering BiomeIds
 * understood by TerrainChunk / TerrainConfig.
 */
export const REGION_BIOME_MAP: Record<string, BiomeId> = {
  desert: 'desert',
  badlands: 'canyon',
  scrubland: 'desert',
  grassland: 'grassland',
  mountain: 'mountain',
  riverside: 'grassland',
  salt_flat: 'desert',
};

/**
 * Resolve a region biome string to a rendering BiomeId.
 * Falls back to 'desert' for unknown biome strings.
 */
export function resolveBiome(regionBiome: string): BiomeId {
  return REGION_BIOME_MAP[regionBiome] ?? 'desert';
}
