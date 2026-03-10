/**
 * DDL Level & Campaign Types
 */

import type { ObjectiveDDL, SpawnPointsDDL } from './core.ts';
import type {
  AudioDDL,
  LightingDDL,
  PostProcessingDDL,
  StructureDDL,
  TerrainDDL,
  WeatherDDL,
} from './environment.ts';
import type { EnvironmentMode } from './core.ts';

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
