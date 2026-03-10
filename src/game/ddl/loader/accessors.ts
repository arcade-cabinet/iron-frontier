/**
 * DDL data accessors — typed helper functions to extract data from LevelDDL.
 *
 * @module game/ddl/loader/accessors
 */

import type {
  AudioDDL,
  EnvironmentMode,
  LevelDDL,
  LightingDDL,
  ObjectiveDDL,
  PostProcessingDDL,
  SpawnPointsDDL,
  WeatherDDL,
} from '../types.ts';

// ============================================================================
// SPAWN ACCESSORS
// ============================================================================

/**
 * Get the player spawn position for a level as {x, y, z}.
 */
export function getPlayerSpawnPosition(ddl: LevelDDL): {
  x: number;
  y: number;
  z: number;
} {
  const [x, y, z] = ddl.spawnPoints.player;
  return { x, y, z };
}

/**
 * Get the player spawn rotation for a level (radians, defaults to 0).
 */
export function getPlayerSpawnRotation(ddl: LevelDDL): number {
  return ddl.spawnPoints.playerRotation ?? 0;
}

/**
 * Get NPC spawn configurations for a level.
 */
export function getNPCSpawns(
  ddl: LevelDDL
): Array<{ npcId: string; position: { x: number; y: number; z: number }; rotation: number }> {
  const npcs = ddl.spawnPoints.npcs ?? [];
  return npcs.map(({ npcId, position, rotation }) => ({
    npcId,
    position: { x: position[0], y: position[1], z: position[2] },
    rotation: rotation ?? 0,
  }));
}

/**
 * Get item spawn configurations for a level.
 */
export function getItemSpawns(
  ddl: LevelDDL
): Array<{
  itemId: string;
  position: { x: number; y: number; z: number };
  quantity: number;
}> {
  const items = ddl.spawnPoints.items ?? [];
  return items.map(({ itemId, position, quantity }) => ({
    itemId,
    position: { x: position[0], y: position[1], z: position[2] },
    quantity: quantity ?? 1,
  }));
}

/**
 * Get the full spawn points configuration for a level.
 */
export function getSpawnPoints(ddl: LevelDDL): SpawnPointsDDL {
  return ddl.spawnPoints;
}

// ============================================================================
// ENVIRONMENT ACCESSORS
// ============================================================================

/**
 * Get the environment mode for a level.
 */
export function getEnvironmentMode(ddl: LevelDDL): EnvironmentMode {
  return ddl.environmentMode;
}

/**
 * Get the lighting mode for a level.
 */
export function getLightingMode(ddl: LevelDDL): EnvironmentMode {
  return ddl.lighting.mode;
}

/**
 * Get the audio configuration for a level.
 */
export function getAudioConfig(ddl: LevelDDL): AudioDDL | undefined {
  return ddl.audio;
}

/**
 * Get the weather configuration for a level.
 */
export function getWeatherConfig(ddl: LevelDDL): WeatherDDL | undefined {
  return ddl.weather;
}

// ============================================================================
// OBJECTIVE ACCESSORS
// ============================================================================

/**
 * Get all objectives for a level.
 */
export function getObjectives(ddl: LevelDDL): ObjectiveDDL[] {
  return ddl.objectives;
}

/**
 * Get required (non-optional) objectives for a level.
 */
export function getRequiredObjectives(ddl: LevelDDL): ObjectiveDDL[] {
  return ddl.objectives.filter((obj) => !obj.optional);
}

/**
 * Get optional objectives for a level.
 */
export function getOptionalObjectives(ddl: LevelDDL): ObjectiveDDL[] {
  return ddl.objectives.filter((obj) => obj.optional === true);
}

// ============================================================================
// NAVIGATION ACCESSORS
// ============================================================================

/**
 * Get the next level ID in campaign order.
 */
export function getNextLevelId(ddl: LevelDDL): string | null {
  return ddl.nextLevelId ?? null;
}

/**
 * Get the previous level ID in campaign order.
 */
export function getPreviousLevelId(ddl: LevelDDL): string | null {
  return ddl.previousLevelId ?? null;
}

/**
 * Get the chapter number for a level.
 */
export function getChapter(ddl: LevelDDL): number | undefined {
  return ddl.chapter;
}

/**
 * Get the act name for a level.
 */
export function getActName(ddl: LevelDDL): string | undefined {
  return ddl.actName;
}

// ============================================================================
// LIGHTING ACCESSORS
// ============================================================================

/**
 * Get the lighting configuration for a level.
 */
export function getLightingConfig(ddl: LevelDDL): LightingDDL {
  return ddl.lighting;
}

/**
 * Get point light names for a level.
 */
export function getPointLightNames(ddl: LevelDDL): string[] {
  return (ddl.lighting.overrides?.pointLights ?? []).map((light) => light.name);
}

/**
 * Check whether a level has a player torch (cave levels).
 */
export function hasPlayerTorch(ddl: LevelDDL): boolean {
  return ddl.lighting.overrides?.playerTorch?.enabled === true;
}

/**
 * Get the post-processing configuration for a level.
 */
export function getPostProcessingConfig(ddl: LevelDDL): PostProcessingDDL {
  return ddl.postProcessing;
}
