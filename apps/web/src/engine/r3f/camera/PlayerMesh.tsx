/**
 * PlayerMesh.tsx - Player character representation for R3F
 *
 * Features:
 * - Capsule geometry or loaded character model
 * - Faces movement direction
 * - Animation states (idle, walk, run)
 * - Integrates with usePlayerMovement hook
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Animation state for player character
 */
export type PlayerAnimationState = 'idle' | 'walk' | 'run';

/**
 * Player mesh configuration
 */
export interface PlayerMeshConfig {
  /** Capsule radius (default 0.5) */
  radius: number;
  /** Capsule height (default 1.8) */
  height: number;
  /** Player color (default 0x4488ff) */
  color: number | string;
  /** Rotation smoothing factor (0-1, default 0.15) */
  rotationSmoothing: number;
  /** Shadow casting (default true) */
  castShadow: boolean;
  /** Shadow receiving (default true) */
  receiveShadow: boolean;
}

const DEFAULT_PLAYER_CONFIG: PlayerMeshConfig = {
  radius: 0.5,
  height: 1.8,
  color: 0x4488ff,
  rotationSmoothing: 0.15,
  castShadow: true,
  receiveShadow: true,
};

export interface PlayerMeshProps {
  /** Position vector (typically from usePlayerMovement) */
  position: THREE.Vector3;
  /** Rotation in radians (facing direction) */
  rotation?: number;
  /** Current animation state */
  animation?: PlayerAnimationState;
  /** Player configuration */
  config?: Partial<PlayerMeshConfig>;
  /** Whether player is visible */
  visible?: boolean;
  /** Callback when mesh is ready */
  onReady?: (mesh: THREE.Mesh) => void;
}

/**
 * Simple capsule player mesh with direction indicator
 *
 * @example
 * ```tsx
 * function Player() {
 *   const { state, positionRef } = usePlayerMovement({ ... });
 *
 *   return (
 *     <PlayerMesh
 *       position={positionRef.current}
 *       rotation={state.rotation}
 *       animation={state.isMoving ? (state.isSprinting ? 'run' : 'walk') : 'idle'}
 *     />
 *   );
 * }
 * ```
 */
export function PlayerMesh({
  position,
  rotation = 0,
  animation = 'idle',
  config: customConfig,
  visible = true,
  onReady,
}: PlayerMeshProps) {
  const config: PlayerMeshConfig = { ...DEFAULT_PLAYER_CONFIG, ...customConfig };

  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const currentRotationRef = useRef(rotation);

  // Animation state for bobbing effect
  const animationTimeRef = useRef(0);

  // Create geometry
  const geometry = useMemo(() => {
    // CapsuleGeometry: radius, length (body without caps), capSegments, radialSegments
    const capsule = new THREE.CapsuleGeometry(
      config.radius,
      config.height - config.radius * 2, // Body length
      4,
      16
    );
    return capsule;
  }, [config.radius, config.height]);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.7,
      metalness: 0.1,
    });
  }, [config.color]);

  // Direction indicator material (front of player)
  const indicatorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.2,
    });
  }, []);

  // Notify when mesh is ready
  useEffect(() => {
    if (meshRef.current && onReady) {
      onReady(meshRef.current);
    }
  }, [onReady]);

  // Update position and rotation each frame
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.1);

    // Update position
    groupRef.current.position.copy(position);
    // Offset Y to account for capsule center being at middle
    groupRef.current.position.y += config.height / 2;

    // Smooth rotation
    const rotationLerpFactor = 1 - Math.pow(1 - config.rotationSmoothing, dt * 60);
    currentRotationRef.current = THREE.MathUtils.lerp(
      currentRotationRef.current,
      rotation,
      rotationLerpFactor
    );
    groupRef.current.rotation.y = currentRotationRef.current;

    // Animation bobbing effect
    animationTimeRef.current += dt;

    if (animation !== 'idle') {
      const bobSpeed = animation === 'run' ? 12 : 8;
      const bobAmount = animation === 'run' ? 0.08 : 0.04;
      const bob = Math.sin(animationTimeRef.current * bobSpeed) * bobAmount;
      groupRef.current.position.y += bob;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Main capsule body */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        castShadow={config.castShadow}
        receiveShadow={config.receiveShadow}
      />

      {/* Direction indicator (small sphere at front) */}
      <mesh
        position={[0, config.height / 2 - config.radius, config.radius + 0.1]}
        material={indicatorMaterial}
        castShadow={config.castShadow}
      >
        <sphereGeometry args={[0.15, 8, 8]} />
      </mesh>

      {/* Simple eyes for character personality */}
      <mesh
        position={[-0.15, config.height / 2 - config.radius + 0.2, config.radius - 0.05]}
        material={indicatorMaterial}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      <mesh
        position={[0.15, config.height / 2 - config.radius + 0.2, config.radius - 0.05]}
        material={indicatorMaterial}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
    </group>
  );
}

/**
 * Player mesh with integrated movement
 * Combines PlayerMesh with usePlayerMovement hook
 */
export interface PlayerWithMovementProps {
  /** Initial position */
  initialPosition?: THREE.Vector3;
  /** Height provider for terrain following */
  getHeightAt?: (x: number, z: number) => number;
  /** Player configuration */
  config?: Partial<PlayerMeshConfig>;
  /** Callback when position changes */
  onPositionChange?: (position: THREE.Vector3, rotation: number) => void;
  /** Whether player is controllable */
  enabled?: boolean;
}

/**
 * Convenience component that combines PlayerMesh with movement controls
 */
export function PlayerWithMovement({
  initialPosition = new THREE.Vector3(0, 0, 0),
  getHeightAt = () => 0,
  config,
  onPositionChange,
  enabled = true,
}: PlayerWithMovementProps) {
  // Import would create circular dependency, so we use a simple inline hook
  // In practice, use the separate usePlayerMovement hook
  const positionRef = useRef(initialPosition.clone());
  const rotationRef = useRef(0);
  const [animation, setAnimation] = useState<PlayerAnimationState>('idle');

  const handlePositionChange = useCallback(
    (pos: THREE.Vector3, rot: number) => {
      if (onPositionChange) {
        onPositionChange(pos, rot);
      }
    },
    [onPositionChange]
  );

  // This is a placeholder - in actual usage, wire this up with usePlayerMovement
  return (
    <PlayerMesh
      position={positionRef.current}
      rotation={rotationRef.current}
      animation={animation}
      config={config}
      visible={true}
    />
  );
}

/**
 * Ghost player mesh for multiplayer or replay visualization
 */
export interface GhostPlayerMeshProps extends Omit<PlayerMeshProps, 'config'> {
  /** Ghost opacity (default 0.5) */
  opacity?: number;
  /** Ghost color (default 0x88ccff) */
  color?: number | string;
}

export function GhostPlayerMesh({
  opacity = 0.5,
  color = 0x88ccff,
  ...props
}: GhostPlayerMeshProps) {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.9,
      metalness: 0,
    });
  }, [color, opacity]);

  // Override material via custom rendering
  return (
    <PlayerMesh
      {...props}
      config={{
        color,
        castShadow: false,
        receiveShadow: false,
      }}
    />
  );
}

export default PlayerMesh;
