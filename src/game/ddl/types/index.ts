/**
 * DDL Types - Barrel export
 */

export type {
  BiomeType,
  EnvironmentMode,
  HexPosition,
  ObjectiveDDL,
  ObjectiveType,
  Position3D,
  SpawnPointsDDL,
  TimeOfDay,
  WeatherType,
} from './core.ts';

export type {
  AudioDDL,
  LightingDDL,
  PlayerTorchDDL,
  PointLightDDL,
  PostProcessingDDL,
  StructureDDL,
  TerrainDDL,
  WeatherDDL,
} from './environment.ts';

export type { CampaignDDL, LevelDDL } from './level.ts';
