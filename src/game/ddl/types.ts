/**
 * DDL Types - Data Definition Language types for level configuration
 *
 * These types define the structure of level DDL JSON files that drive
 * procedural content generation and level configuration.
 *
 * @module game/ddl/types
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Environment mode determines the overall visual and gameplay style.
 */
export type EnvironmentMode = 'town' | 'wilderness' | 'cave' | 'interior' | 'camp';

/**
 * Biome type for terrain generation.
 */
export type BiomeType =
  | 'desert'
  | 'grassland'
  | 'badlands'
  | 'riverside'
  | 'forest'
  | 'mountain'
  | 'swamp';

/**
 * Time of day for lighting presets.
 */
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';

/**
 * Weather type for environment effects.
 */
export type WeatherType = 'clear' | 'cloudy' | 'dusty' | 'rainy' | 'stormy' | 'foggy';

// ============================================================================
// SPAWN POINTS
// ============================================================================

/**
 * 3D position as [x, y, z] tuple.
 */
export type Position3D = [number, number, number];

/**
 * Hex coordinate as {q, r}.
 */
export interface HexPosition {
  q: number;
  r: number;
}

/**
 * Spawn point configuration for entities.
 */
export interface SpawnPointsDDL {
  /** Player spawn position [x, y, z] */
  player: Position3D;
  /** Player spawn rotation in radians */
  playerRotation?: number;
  /** NPC spawn positions */
  npcs?: Array<{
    npcId: string;
    position: Position3D;
    rotation?: number;
  }>;
  /** Enemy spawn positions */
  enemies?: Position3D[];
  /** Ally spawn positions */
  allies?: Position3D[];
  /** Item spawn positions */
  items?: Array<{
    itemId: string;
    position: Position3D;
    quantity?: number;
  }>;
}

// ============================================================================
// OBJECTIVES
// ============================================================================

/**
 * Objective type for level completion.
 */
export type ObjectiveType =
  | 'reach'
  | 'collect'
  | 'kill'
  | 'interact'
  | 'survive'
  | 'escort'
  | 'defend'
  | 'stealth';

/**
 * Level objective definition.
 */
export interface ObjectiveDDL {
  /** Unique objective ID */
  id: string;
  /** Objective type */
  type: ObjectiveType;
  /** Display text */
  description: string;
  /** Target (location, enemy, item, etc.) */
  target?: string;
  /** Required count for completion */
  count?: number;
  /** Whether this objective is optional */
  optional?: boolean;
  /** Rewards for completing this objective */
  rewards?: {
    xp?: number;
    gold?: number;
    items?: Array<{ itemId: string; quantity: number }>;
  };
}

// ============================================================================
// LIGHTING
// ============================================================================

/**
 * Point light configuration.
 */
export interface PointLightDDL {
  name: string;
  position: Position3D;
  color: string;
  intensity: number;
  range: number;
  castsShadows?: boolean;
}

/**
 * Player torch configuration (for caves).
 */
export interface PlayerTorchDDL {
  enabled: boolean;
  color?: string;
  intensity?: number;
  range?: number;
}

/**
 * Lighting configuration for a level.
 */
export interface LightingDDL {
  /** Lighting mode */
  mode: EnvironmentMode;
  /** Time of day preset */
  timeOfDay?: TimeOfDay;
  /** Sun/ambient intensity override (0-1) */
  ambientIntensity?: number;
  /** Sun color override */
  sunColor?: string;
  /** Fog density override */
  fogDensity?: number;
  /** Fog color override */
  fogColor?: string;
  /** Additional overrides */
  overrides?: {
    pointLights?: PointLightDDL[];
    playerTorch?: PlayerTorchDDL;
  };
}

// ============================================================================
// POST-PROCESSING
// ============================================================================

/**
 * Post-processing configuration.
 */
export interface PostProcessingDDL {
  /** Mode determines preset */
  mode: EnvironmentMode;
  /** Bloom intensity */
  bloom?: number;
  /** Vignette intensity */
  vignette?: number;
  /** Color grading LUT */
  colorGradingLUT?: string;
  /** Depth of field settings */
  depthOfField?: {
    focalLength: number;
    aperture: number;
  };
}

// ============================================================================
// WEATHER
// ============================================================================

/**
 * Weather configuration.
 */
export interface WeatherDDL {
  /** Weather type */
  type: WeatherType;
  /** Intensity (0-1) */
  intensity: number;
  /** Wind direction in degrees */
  windDirection?: number;
  /** Wind speed */
  windSpeed?: number;
  /** Particle effects */
  particles?: {
    type: 'dust' | 'rain' | 'snow' | 'leaves';
    density: number;
  };
}

// ============================================================================
// AUDIO
// ============================================================================

/**
 * Audio configuration for a level.
 */
export interface AudioDDL {
  /** Background music track ID */
  musicTrack?: string;
  /** Ambient sound loops */
  ambientSounds?: Array<{
    soundId: string;
    volume: number;
    loop: boolean;
  }>;
  /** Reverb preset */
  reverbPreset?: 'outdoor' | 'indoor' | 'cave' | 'large_hall';
}

// ============================================================================
// TERRAIN
// ============================================================================

/**
 * Terrain generation configuration.
 */
export interface TerrainDDL {
  /** Primary biome */
  biome: BiomeType;
  /** Map dimensions in hex tiles */
  dimensions: {
    width: number;
    height: number;
  };
  /** Elevation range */
  elevation?: {
    min: number;
    max: number;
  };
  /** Feature density modifiers */
  features?: {
    trees?: number;
    rocks?: number;
    water?: number;
    structures?: number;
  };
  /** Seed offset for procedural generation */
  seedOffset?: number;
}

// ============================================================================
// STRUCTURES
// ============================================================================

/**
 * Structure placement.
 */
export interface StructureDDL {
  /** Structure type ID */
  type: string;
  /** Position */
  position: Position3D;
  /** Rotation in degrees */
  rotation?: number;
  /** Scale */
  scale?: number;
  /** Owner NPC ID */
  ownerId?: string;
  /** Interior location ID (if enterable) */
  interiorId?: string;
}

// ============================================================================
// LEVEL DDL
// ============================================================================

/**
 * Complete level DDL definition.
 */
export interface LevelDDL {
  /** Level unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description text */
  description?: string;
  /** Chapter number */
  chapter?: number;
  /** Act name */
  actName?: string;
  /** Environment mode */
  environmentMode: EnvironmentMode;
  /** Spawn points */
  spawnPoints: SpawnPointsDDL;
  /** Level objectives */
  objectives: ObjectiveDDL[];
  /** Lighting configuration */
  lighting: LightingDDL;
  /** Post-processing configuration */
  postProcessing: PostProcessingDDL;
  /** Weather configuration */
  weather?: WeatherDDL;
  /** Audio configuration */
  audio?: AudioDDL;
  /** Terrain configuration */
  terrain?: TerrainDDL;
  /** Pre-placed structures */
  structures?: StructureDDL[];
  /** Next level in campaign */
  nextLevelId?: string | null;
  /** Previous level in campaign */
  previousLevelId?: string | null;
  /** Level-specific metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// CAMPAIGN DDL
// ============================================================================

/**
 * Campaign definition linking levels.
 */
export interface CampaignDDL {
  /** Campaign unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Campaign description */
  description?: string;
  /** Starting level ID */
  startingLevelId: string;
  /** All level IDs in order */
  levelIds: string[];
  /** Campaign metadata */
  metadata?: Record<string, unknown>;
}
