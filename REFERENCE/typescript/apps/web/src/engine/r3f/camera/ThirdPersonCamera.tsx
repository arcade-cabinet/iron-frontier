/**
 * ThirdPersonCamera.tsx - Follow camera for R3F overworld
 *
 * Features:
 * - Smooth following of player mesh
 * - Configurable distance and height offset
 * - Rotation follows player facing direction
 * - Smooth interpolation (lerp) for camera movement
 * - Terrain collision (camera doesn't go below ground)
 * - Zoom level presets
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Camera configuration
 */
export interface ThirdPersonCameraConfig {
  /** Distance behind player (default 15) */
  distance: number;
  /** Height above player (default 8) */
  heightOffset: number;
  /** Look-at height offset (default 1.5 - approximately chest level) */
  lookAtHeightOffset: number;
  /** Smoothing factor for position (0-1, lower = smoother, default 0.05) */
  positionSmoothing: number;
  /** Smoothing factor for look-at (0-1, default 0.1) */
  lookAtSmoothing: number;
  /** Minimum height above terrain (default 2) */
  minHeightAboveTerrain: number;
  /** Field of view (default 60) */
  fov: number;
  /** Near clipping plane (default 0.1) */
  near: number;
  /** Far clipping plane (default 1000) */
  far: number;
}

/**
 * Zoom level presets
 */
export type ZoomLevel = 'close' | 'medium' | 'far';

const ZOOM_CONFIGS: Record<ZoomLevel, { distance: number; heightOffset: number }> = {
  close: { distance: 8, heightOffset: 5 },
  medium: { distance: 15, heightOffset: 8 },
  far: { distance: 25, heightOffset: 12 },
};

const DEFAULT_CONFIG: ThirdPersonCameraConfig = {
  distance: 15,
  heightOffset: 8,
  lookAtHeightOffset: 1.5,
  positionSmoothing: 0.05,
  lookAtSmoothing: 0.1,
  minHeightAboveTerrain: 2,
  fov: 60,
  near: 0.1,
  far: 1000,
};

/**
 * Height provider function
 */
export type HeightProvider = (x: number, z: number) => number;

export interface ThirdPersonCameraProps {
  /** Target position to follow */
  targetPosition: THREE.Vector3;
  /** Target rotation (facing direction in radians) */
  targetRotation?: number;
  /** Camera configuration */
  config?: Partial<ThirdPersonCameraConfig>;
  /** Height provider for terrain collision */
  getHeightAt?: HeightProvider;
  /** Whether camera is active */
  enabled?: boolean;
  /** Current zoom level */
  zoom?: ZoomLevel;
  /** Callback when camera updates */
  onUpdate?: (position: THREE.Vector3, lookAt: THREE.Vector3) => void;
}

/**
 * Third-person follow camera for R3F
 *
 * @example
 * ```tsx
 * function GameScene() {
 *   const playerPosition = useRef(new THREE.Vector3(0, 0, 0));
 *
 *   return (
 *     <>
 *       <ThirdPersonCamera
 *         targetPosition={playerPosition.current}
 *         getHeightAt={(x, z) => terrain.getHeightAt(x, z)}
 *       />
 *       <Player positionRef={playerPosition} />
 *     </>
 *   );
 * }
 * ```
 */
export function ThirdPersonCamera({
  targetPosition,
  targetRotation = 0,
  config: customConfig,
  getHeightAt = () => 0,
  enabled = true,
  zoom = 'medium',
  onUpdate,
}: ThirdPersonCameraProps) {
  const { camera } = useThree();

  // Merge config with zoom preset
  const zoomConfig = ZOOM_CONFIGS[zoom];
  const config: ThirdPersonCameraConfig = {
    ...DEFAULT_CONFIG,
    ...customConfig,
    distance: customConfig?.distance ?? zoomConfig.distance,
    heightOffset: customConfig?.heightOffset ?? zoomConfig.heightOffset,
  };

  // Current camera position (for smooth interpolation)
  const currentPositionRef = useRef(new THREE.Vector3());
  const currentLookAtRef = useRef(new THREE.Vector3());
  const isInitializedRef = useRef(false);

  // Initialize camera position
  useEffect(() => {
    if (!isInitializedRef.current && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov;
      camera.near = config.near;
      camera.far = config.far;
      camera.updateProjectionMatrix();

      // Set initial position behind target
      const offsetX = Math.sin(targetRotation) * config.distance;
      const offsetZ = Math.cos(targetRotation) * config.distance;

      currentPositionRef.current.set(
        targetPosition.x - offsetX,
        targetPosition.y + config.heightOffset,
        targetPosition.z - offsetZ
      );

      currentLookAtRef.current.set(
        targetPosition.x,
        targetPosition.y + config.lookAtHeightOffset,
        targetPosition.z
      );

      camera.position.copy(currentPositionRef.current);
      camera.lookAt(currentLookAtRef.current);

      isInitializedRef.current = true;
    }
  }, [camera, targetPosition, targetRotation, config]);

  // Update zoom config when zoom changes
  useEffect(() => {
    // Config already includes zoom preset from merge above
  }, [zoom]);

  // Update camera each frame
  useFrame((_, delta) => {
    if (!enabled) return;

    // Clamp delta to prevent huge jumps
    const dt = Math.min(delta, 0.1);

    // Calculate desired camera position
    // Camera is positioned behind the player based on their facing direction
    const offsetX = Math.sin(targetRotation) * config.distance;
    const offsetZ = Math.cos(targetRotation) * config.distance;

    const desiredPosition = new THREE.Vector3(
      targetPosition.x - offsetX,
      targetPosition.y + config.heightOffset,
      targetPosition.z - offsetZ
    );

    // Check terrain height at camera position
    const terrainHeight = getHeightAt(desiredPosition.x, desiredPosition.z);
    const minHeight = terrainHeight + config.minHeightAboveTerrain;
    if (desiredPosition.y < minHeight) {
      desiredPosition.y = minHeight;
    }

    // Smooth interpolation for position
    const positionLerpFactor = 1 - Math.pow(1 - config.positionSmoothing, dt * 60);
    currentPositionRef.current.lerp(desiredPosition, positionLerpFactor);

    // Calculate look-at point (slightly above player position)
    const desiredLookAt = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + config.lookAtHeightOffset,
      targetPosition.z
    );

    // Smooth interpolation for look-at
    const lookAtLerpFactor = 1 - Math.pow(1 - config.lookAtSmoothing, dt * 60);
    currentLookAtRef.current.lerp(desiredLookAt, lookAtLerpFactor);

    // Apply to camera
    camera.position.copy(currentPositionRef.current);
    camera.lookAt(currentLookAtRef.current);

    // Callback
    if (onUpdate) {
      onUpdate(currentPositionRef.current, currentLookAtRef.current);
    }
  });

  return null;
}

/**
 * Camera shake state
 */
interface ShakeState {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
}

/**
 * Hook to trigger camera shake
 */
export function useCameraShake() {
  const shakeRef = useRef<ShakeState>({
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
  });

  const shake = useCallback((intensity: number, duration: number) => {
    shakeRef.current = {
      active: true,
      intensity,
      duration,
      elapsed: 0,
    };
  }, []);

  return { shake, shakeRef };
}

/**
 * Third-person camera with shake support
 */
export interface ThirdPersonCameraWithShakeProps extends ThirdPersonCameraProps {
  /** Shake state reference */
  shakeRef?: React.MutableRefObject<ShakeState>;
}

export function ThirdPersonCameraWithShake({
  shakeRef,
  ...props
}: ThirdPersonCameraWithShakeProps) {
  const { camera } = useThree();
  const basePositionRef = useRef(new THREE.Vector3());

  // Update shake effect
  useFrame((_, delta) => {
    if (!shakeRef?.current.active) return;

    const shake = shakeRef.current;
    shake.elapsed += delta;

    if (shake.elapsed >= shake.duration) {
      shake.active = false;
      return;
    }

    // Calculate shake intensity with falloff
    const progress = shake.elapsed / shake.duration;
    const falloff = 1 - progress;
    const currentIntensity = shake.intensity * falloff;

    // Apply random offset
    const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    const offsetZ = (Math.random() - 0.5) * 2 * currentIntensity;

    camera.position.x += offsetX;
    camera.position.y += offsetY;
    camera.position.z += offsetZ;
  });

  return <ThirdPersonCamera {...props} />;
}

export default ThirdPersonCamera;
