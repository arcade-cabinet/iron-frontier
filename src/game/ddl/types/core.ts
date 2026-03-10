/**
 * DDL Core Types - Environment, biome, time, weather, and spawn points
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
