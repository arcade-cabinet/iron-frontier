/**
 * Game.tsx - Main Game Component (React Three Fiber)
 *
 * This module exports the main Game component using React Three Fiber
 * for 3D rendering. The R3F implementation provides:
 * - Streaming procedural terrain with LOD
 * - Western-themed atmosphere and day/night cycle
 * - Third-person camera with WASD controls
 * - Turn-based combat scenes
 * - Full UI overlay system
 *
 * @see R3FGame.tsx for implementation details
 */

// Re-export R3FGame as the main Game component
export { R3FGame as Game, R3FGame as default } from './R3FGame';

// Re-export game phase utilities for convenience
export { useGamePhase, useIsPhase, useGameLoading } from './useGamePhase';
export { GameOverlay, LoadingOverlay, ErrorOverlay } from './GameOverlay';
export { SceneRouter, useSceneType, useIsScene, type SceneType } from './SceneRouter';
