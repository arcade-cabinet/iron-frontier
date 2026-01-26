/**
 * Shared Scene Configuration
 *
 * DRY Architecture: Pure configuration data that works identically
 * on web (React Three Fiber) and mobile (React Native + Three.js).
 *
 * Usage:
 *   import { LIGHTING_PRESETS, getLightingForHour, BIOME_CONFIGS } from '@iron-frontier/shared/scenes';
 *
 *   // In your R3F component
 *   const lighting = getLightingForHour(gameHour);
 *   <ambientLight intensity={lighting.ambient.intensity} />
 */

// ============================================================================
// THREE.JS CONFIGURATION (Renderer-agnostic)
// ============================================================================

// Re-export all Three.js configurations for convenience
// These are pure data/types - no Three.js runtime dependency
export * from './three';
