/**
 * Three.js Camera Presets
 *
 * Camera configurations for different game modes and scenes.
 * Pure data - no Three.js runtime code.
 *
 * Usage:
 *   import { CAMERA_PRESETS } from '@iron-frontier/shared/scenes/three';
 *
 *   const preset = CAMERA_PRESETS.overworld;
 *   <PerspectiveCamera
 *     fov={preset.perspective.fov}
 *     near={preset.perspective.near}
 *     far={preset.perspective.far}
 *   />
 */

import type { CameraPreset, Vec3, FollowCameraConfig, OrbitControlsConfig } from './sceneConfig';

// ============================================================================
// CAMERA PRESETS
// ============================================================================

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  /**
   * Overworld Camera - Third person follow
   * Use for: Main gameplay, exploration
   */
  overworld: {
    name: 'Overworld',
    description: 'Third-person follow camera for exploration',
    perspective: {
      fov: 60,
      near: 0.1,
      far: 2000,
    },
    orbit: {
      minDistance: 8,
      maxDistance: 25,
      minPolarAngle: 0.3, // ~17 degrees from top
      maxPolarAngle: 1.4, // ~80 degrees from top
      enableDamping: true,
      dampingFactor: 0.1,
      enablePan: false,
      enableZoom: true,
    },
    follow: {
      offset: { x: 0, y: 12, z: -18 },
      lookAhead: 2.0,
      smoothTime: 0.25,
      maxSpeed: 30,
    },
    defaultPosition: { x: 0, y: 15, z: -20 },
    defaultTarget: { x: 0, y: 0, z: 0 },
  },

  /**
   * Combat Camera - Closer tactical view
   * Use for: Turn-based combat, encounters
   */
  combat: {
    name: 'Combat',
    description: 'Tactical overhead view for combat',
    perspective: {
      fov: 50,
      near: 0.1,
      far: 500,
    },
    orbit: {
      minDistance: 10,
      maxDistance: 40,
      minPolarAngle: 0.5, // ~29 degrees
      maxPolarAngle: 1.2, // ~69 degrees
      enableDamping: true,
      dampingFactor: 0.15,
      enablePan: true,
      enableZoom: true,
    },
    follow: {
      offset: { x: 0, y: 20, z: -12 },
      lookAhead: 0,
      smoothTime: 0.4,
      maxSpeed: 20,
    },
    defaultPosition: { x: 0, y: 25, z: -15 },
    defaultTarget: { x: 0, y: 0, z: 0 },
  },

  /**
   * Interior Camera - Constrained indoor view
   * Use for: Buildings, caves, dungeons
   */
  interior: {
    name: 'Interior',
    description: 'Constrained camera for indoor scenes',
    perspective: {
      fov: 65,
      near: 0.05,
      far: 100,
    },
    orbit: {
      minDistance: 3,
      maxDistance: 12,
      minPolarAngle: 0.4,
      maxPolarAngle: 1.5,
      enableDamping: true,
      dampingFactor: 0.12,
      enablePan: false,
      enableZoom: true,
    },
    follow: {
      offset: { x: 0, y: 6, z: -8 },
      lookAhead: 1.0,
      smoothTime: 0.2,
      maxSpeed: 15,
    },
    defaultPosition: { x: 0, y: 8, z: -10 },
    defaultTarget: { x: 0, y: 1, z: 0 },
  },

  /**
   * Dialogue Camera - Close up for conversations
   * Use for: NPC dialogues, cutscenes
   */
  dialogue: {
    name: 'Dialogue',
    description: 'Close-up view for conversations',
    perspective: {
      fov: 45,
      near: 0.1,
      far: 50,
    },
    orbit: {
      minDistance: 2,
      maxDistance: 5,
      minPolarAngle: 0.8,
      maxPolarAngle: 1.3,
      enableDamping: true,
      dampingFactor: 0.2,
      enablePan: false,
      enableZoom: false,
    },
    defaultPosition: { x: 2, y: 1.8, z: 3 },
    defaultTarget: { x: 0, y: 1.5, z: 0 },
  },

  /**
   * Cinematic Camera - Wide angle for cutscenes
   * Use for: Establishing shots, dramatic moments
   */
  cinematic: {
    name: 'Cinematic',
    description: 'Wide-angle cinematic camera',
    perspective: {
      fov: 35,
      near: 0.1,
      far: 3000,
    },
    orbit: {
      minDistance: 5,
      maxDistance: 100,
      minPolarAngle: 0.1,
      maxPolarAngle: 1.5,
      enableDamping: true,
      dampingFactor: 0.05,
      enablePan: true,
      enableZoom: true,
    },
    defaultPosition: { x: 30, y: 20, z: 30 },
    defaultTarget: { x: 0, y: 5, z: 0 },
  },

  /**
   * First Person Camera - For immersive moments
   * Use for: Special sequences, POV shots
   */
  firstPerson: {
    name: 'First Person',
    description: 'First-person perspective',
    perspective: {
      fov: 75,
      near: 0.01,
      far: 1000,
    },
    orbit: {
      minDistance: 0,
      maxDistance: 0,
      minPolarAngle: 0.1,
      maxPolarAngle: Math.PI - 0.1,
      enableDamping: true,
      dampingFactor: 0.1,
      enablePan: false,
      enableZoom: false,
    },
    defaultPosition: { x: 0, y: 1.7, z: 0 },
    defaultTarget: { x: 0, y: 1.7, z: -1 },
  },

  /**
   * Top Down Camera - Tactical overview
   * Use for: Maps, strategy sections
   */
  topDown: {
    name: 'Top Down',
    description: 'Overhead tactical view',
    perspective: {
      fov: 40,
      near: 1,
      far: 500,
    },
    orbit: {
      minDistance: 30,
      maxDistance: 100,
      minPolarAngle: 0.05,
      maxPolarAngle: 0.3,
      enableDamping: true,
      dampingFactor: 0.1,
      enablePan: true,
      enableZoom: true,
    },
    defaultPosition: { x: 0, y: 80, z: 5 },
    defaultTarget: { x: 0, y: 0, z: 0 },
  },
};

// ============================================================================
// CAMERA PATH TYPES (for cutscenes)
// ============================================================================

export interface CameraKeyframe {
  time: number; // seconds
  position: Vec3;
  target: Vec3;
  fov?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface CameraPath {
  name: string;
  duration: number; // total seconds
  loop: boolean;
  keyframes: CameraKeyframe[];
}

// ============================================================================
// CUTSCENE CAMERA PATHS
// ============================================================================

export const CAMERA_PATHS: Record<string, CameraPath> = {
  /**
   * Town Flyover - Establishing shot over a town
   */
  townFlyover: {
    name: 'Town Flyover',
    duration: 8,
    loop: false,
    keyframes: [
      {
        time: 0,
        position: { x: -50, y: 30, z: -50 },
        target: { x: 0, y: 5, z: 0 },
        fov: 35,
        easing: 'easeOut',
      },
      {
        time: 4,
        position: { x: 0, y: 40, z: 0 },
        target: { x: 0, y: 0, z: 0 },
        fov: 40,
        easing: 'linear',
      },
      {
        time: 8,
        position: { x: 50, y: 25, z: 50 },
        target: { x: 0, y: 5, z: 0 },
        fov: 45,
        easing: 'easeIn',
      },
    ],
  },

  /**
   * Character Intro - Reveal shot for character
   */
  characterIntro: {
    name: 'Character Intro',
    duration: 4,
    loop: false,
    keyframes: [
      {
        time: 0,
        position: { x: 0, y: 0.5, z: 3 },
        target: { x: 0, y: 0.8, z: 0 },
        fov: 50,
        easing: 'easeOut',
      },
      {
        time: 2,
        position: { x: 1, y: 1.5, z: 2.5 },
        target: { x: 0, y: 1.5, z: 0 },
        fov: 45,
        easing: 'linear',
      },
      {
        time: 4,
        position: { x: 2, y: 2, z: 4 },
        target: { x: 0, y: 1.2, z: 0 },
        fov: 50,
        easing: 'easeIn',
      },
    ],
  },

  /**
   * Dramatic Zoom - Quick zoom for emphasis
   */
  dramaticZoom: {
    name: 'Dramatic Zoom',
    duration: 1.5,
    loop: false,
    keyframes: [
      {
        time: 0,
        position: { x: 0, y: 8, z: 12 },
        target: { x: 0, y: 1, z: 0 },
        fov: 60,
        easing: 'easeIn',
      },
      {
        time: 1.5,
        position: { x: 0, y: 2, z: 3 },
        target: { x: 0, y: 1.5, z: 0 },
        fov: 35,
        easing: 'easeOut',
      },
    ],
  },

  /**
   * Orbit Character - 360 spin around character
   */
  orbitCharacter: {
    name: 'Orbit Character',
    duration: 6,
    loop: true,
    keyframes: [
      {
        time: 0,
        position: { x: 0, y: 2, z: 5 },
        target: { x: 0, y: 1, z: 0 },
        easing: 'linear',
      },
      {
        time: 1.5,
        position: { x: 5, y: 2, z: 0 },
        target: { x: 0, y: 1, z: 0 },
        easing: 'linear',
      },
      {
        time: 3,
        position: { x: 0, y: 2, z: -5 },
        target: { x: 0, y: 1, z: 0 },
        easing: 'linear',
      },
      {
        time: 4.5,
        position: { x: -5, y: 2, z: 0 },
        target: { x: 0, y: 1, z: 0 },
        easing: 'linear',
      },
      {
        time: 6,
        position: { x: 0, y: 2, z: 5 },
        target: { x: 0, y: 1, z: 0 },
        easing: 'linear',
      },
    ],
  },
};

// ============================================================================
// CAMERA HELPERS
// ============================================================================

/**
 * Interpolate between two camera keyframes
 */
export function interpolateKeyframes(
  a: CameraKeyframe,
  b: CameraKeyframe,
  t: number
): { position: Vec3; target: Vec3; fov: number } {
  // Apply easing
  const eased = applyEasing(t, b.easing || 'linear');

  const lerp = (x: number, y: number, t: number) => x + (y - x) * t;
  const lerpVec3 = (a: Vec3, b: Vec3, t: number): Vec3 => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  });

  return {
    position: lerpVec3(a.position, b.position, eased),
    target: lerpVec3(a.target, b.target, eased),
    fov: lerp(a.fov || 50, b.fov || 50, eased),
  };
}

/**
 * Get camera state at a specific time in a path
 */
export function getCameraAtTime(
  path: CameraPath,
  time: number
): { position: Vec3; target: Vec3; fov: number } {
  // Handle looping
  let t = time;
  if (path.loop) {
    t = t % path.duration;
  } else {
    t = Math.min(t, path.duration);
  }

  // Find surrounding keyframes
  let prevIdx = 0;
  for (let i = 0; i < path.keyframes.length - 1; i++) {
    if (t >= path.keyframes[i].time && t < path.keyframes[i + 1].time) {
      prevIdx = i;
      break;
    }
  }

  const prev = path.keyframes[prevIdx];
  const next = path.keyframes[Math.min(prevIdx + 1, path.keyframes.length - 1)];

  // Calculate interpolation factor
  const duration = next.time - prev.time;
  const elapsed = t - prev.time;
  const factor = duration > 0 ? elapsed / duration : 0;

  return interpolateKeyframes(prev, next, factor);
}

/**
 * Apply easing function
 */
function applyEasing(t: number, easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'): number {
  switch (easing) {
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return 1 - (1 - t) * (1 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    default:
      return t;
  }
}

/**
 * Calculate smooth follow camera position
 */
export function calculateFollowPosition(
  current: Vec3,
  targetEntity: Vec3,
  config: FollowCameraConfig,
  deltaTime: number
): Vec3 {
  const goal: Vec3 = {
    x: targetEntity.x + config.offset.x,
    y: targetEntity.y + config.offset.y,
    z: targetEntity.z + config.offset.z,
  };

  // Smooth damp
  const smoothing = 1 - Math.exp((-deltaTime * 2) / config.smoothTime);
  const maxDelta = config.maxSpeed * deltaTime;

  const dx = Math.max(-maxDelta, Math.min(maxDelta, (goal.x - current.x) * smoothing));
  const dy = Math.max(-maxDelta, Math.min(maxDelta, (goal.y - current.y) * smoothing));
  const dz = Math.max(-maxDelta, Math.min(maxDelta, (goal.z - current.z) * smoothing));

  return {
    x: current.x + dx,
    y: current.y + dy,
    z: current.z + dz,
  };
}

/**
 * Clamp polar angle for orbit controls
 */
export function clampPolarAngle(angle: number, config: OrbitControlsConfig): number {
  return Math.max(config.minPolarAngle, Math.min(config.maxPolarAngle, angle));
}

/**
 * Clamp distance for orbit controls
 */
export function clampDistance(distance: number, config: OrbitControlsConfig): number {
  return Math.max(config.minDistance, Math.min(config.maxDistance, distance));
}
