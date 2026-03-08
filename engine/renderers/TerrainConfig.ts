// TerrainConfig — Typed constants for terrain chunk generation.
//
// Each biome definition bundles noise parameters with a material factory
// reference so the chunk generator can produce both geometry and surface
// appearance from a single config lookup.

// ---------------------------------------------------------------------------
// Chunk geometry
// ---------------------------------------------------------------------------

/** Number of quad subdivisions per chunk axis (64 quads = 65 vertices). */
export const CHUNK_SEGMENTS = 64;

/** World-space side length of one chunk in meters. */
export const CHUNK_SIZE = 100;

/** Default world seed. */
export const DEFAULT_SEED = 'iron-frontier-terrain';

// ---------------------------------------------------------------------------
// Noise parameters
// ---------------------------------------------------------------------------

export interface NoiseParams {
  /** Maximum vertex displacement in world units. */
  amplitude: number;
  /** Base frequency — controls feature size (lower = larger). */
  frequency: number;
  /** Number of fBm octaves layered on top of the base. */
  octaves: number;
  /** Per-octave frequency multiplier (lacunarity). */
  lacunarity: number;
  /** Per-octave amplitude decay. */
  persistence: number;
}

// ---------------------------------------------------------------------------
// Biome definitions
// ---------------------------------------------------------------------------

export type BiomeId = 'desert' | 'canyon' | 'mountain' | 'grassland';

export interface BiomeDefinition {
  id: BiomeId;
  /** Noise params that shape the heightmap. */
  noise: NoiseParams;
  /** Base color passed to the procedural texture factory. */
  textureBaseColor: string;
  /** Optional secondary color for variety. */
  textureAccentColor: string;
  /** Material roughness override (0-1). */
  roughness: number;
}

export const BIOME_DEFINITIONS: Record<BiomeId, BiomeDefinition> = {
  desert: {
    id: 'desert',
    noise: {
      amplitude: 6,
      frequency: 0.008,
      octaves: 4,
      lacunarity: 2.0,
      persistence: 0.45,
    },
    textureBaseColor: '#D2B48C',
    textureAccentColor: '#C4A574',
    roughness: 0.95,
  },

  canyon: {
    id: 'canyon',
    noise: {
      amplitude: 18,
      frequency: 0.012,
      octaves: 5,
      lacunarity: 2.2,
      persistence: 0.5,
    },
    textureBaseColor: '#8B4513',
    textureAccentColor: '#A0522D',
    roughness: 0.9,
  },

  mountain: {
    id: 'mountain',
    noise: {
      amplitude: 30,
      frequency: 0.006,
      octaves: 6,
      lacunarity: 2.1,
      persistence: 0.55,
    },
    textureBaseColor: '#6B5B4B',
    textureAccentColor: '#7B6B5B',
    roughness: 0.85,
  },

  grassland: {
    id: 'grassland',
    noise: {
      amplitude: 3,
      frequency: 0.01,
      octaves: 3,
      lacunarity: 2.0,
      persistence: 0.4,
    },
    textureBaseColor: '#8B9A6B',
    textureAccentColor: '#A5B57B',
    roughness: 0.92,
  },
} as const;

/** How many chunks surround the player in each direction (1 = 3x3 grid). */
export const VIEW_RADIUS = 1;

/** Total chunks rendered = (2 * VIEW_RADIUS + 1) ^ 2. */
export const GRID_SIDE = 2 * VIEW_RADIUS + 1;
