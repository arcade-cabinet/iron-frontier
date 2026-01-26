/**
 * R3F Scene Exports
 *
 * This module provides React Three Fiber components for all game scenes:
 * - Combat Scene: Turn-based combat arena
 * - Overworld Scene: Main exploration world
 */

// ============================================================================
// COMBAT SCENE EXPORTS
// ============================================================================

// Main scene
export { CombatScene, CombatSceneConnected } from './CombatScene';

// Sub-components
export { CombatArena } from './CombatArena';
export { CombatantMesh } from './CombatantMesh';
export { CombatCamera, CombatCameraDebug, useCameraShake } from './CombatCamera';
export {
  CombatEffects,
  useCombatEffects,
  VictoryEffect,
  DefeatEffect,
  MuzzleFlash,
  CombatLogOverlay,
} from './CombatEffects';

// Combat Types
export type {
  Position3D,
  CombatPositions,
  DamageNumber,
  HitEffect,
  StatusIndicator,
  CombatantAnimation,
  AnimationState,
  CameraShake,
  CameraMode,
  ArenaType,
  ArenaConfig,
  CombatantVisual,
  CombatSceneProps,
  CombatArenaProps,
  CombatantMeshProps,
  CombatCameraProps,
  CombatEffectsProps,
} from './types';

// Combat Constants
export {
  ARENA_CONFIG,
  COMBAT_POSITIONS,
  ANIMATION_DURATIONS,
} from './types';

// ============================================================================
// OVERWORLD SCENE EXPORTS
// ============================================================================

// Main overworld scene component
export { OverworldScene, Controls } from './OverworldScene';
export type { OverworldSceneProps } from './OverworldScene';

// Town markers
export { TownMarkers } from './TownMarkers';
export type { TownMarkersProps } from './TownMarkers';

// NPC sprites
export { NPCSprites } from './NPCSprites';
export type { NPCSpritesProps } from './NPCSprites';

// Encounter zones
export { EncounterZones } from './EncounterZones';
export type { EncounterZonesProps } from './EncounterZones';

// Zone transitions
export { ZoneTransitions, useZoneTransition } from './ZoneTransitions';
export type { ZoneTransitionsProps, TransitionType } from './ZoneTransitions';

// ============================================================================
// OVERWORLD SUBSYSTEM EXPORTS
// ============================================================================

// Terrain
export { StreamingTerrainR3F, useTerrainHeight } from './terrain';
export type { StreamingTerrainR3FProps } from './terrain';

// Atmosphere
export { WesternSky, AtmosphericEffects } from './atmosphere';
export type { WesternSkyProps, AtmosphericEffectsProps, TimeOfDay } from './atmosphere';

// Vegetation
export { VegetationInstances } from './vegetation';
export type { VegetationInstancesProps, VegetationType } from './vegetation';

// Camera and Player
export { ThirdPersonCamera, PlayerMesh } from './camera';
export type {
  ThirdPersonCameraProps,
  PlayerMeshProps,
  PlayerAppearance,
} from './camera';
