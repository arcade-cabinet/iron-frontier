// VegetationInstances - Main vegetation component using Three.js InstancedMesh
// Efficiently renders thousands of vegetation instances using GPU instancing

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  type VegetationType,
  type VegetationInstance,
  VEGETATION_TYPES,
} from './types';
import { useVegetationGeometries } from './VegetationTypes';

// ============================================================================
// TYPES
// ============================================================================

export interface VegetationInstancesProps {
  /** Array of vegetation instances to render */
  instances: VegetationInstance[];
  /** Enable frustum culling for off-screen instances */
  enableFrustumCulling?: boolean;
  /** Enable shadows */
  enableShadows?: boolean;
  /** Enable wind animation for tumbleweeds */
  enableWind?: boolean;
  /** Wind speed for animated vegetation */
  windSpeed?: number;
  /** Maximum render distance */
  maxDistance?: number;
  /** Player position for LOD calculations */
  playerPosition?: [number, number, number];
}

// ============================================================================
// INSTANCED VEGETATION TYPE
// ============================================================================

interface InstancedVegetationTypeProps {
  type: VegetationType;
  instances: VegetationInstance[];
  geometry: THREE.BufferGeometry;
  enableShadows: boolean;
  enableWind: boolean;
  windSpeed: number;
  maxDistance: number;
  playerPosition: [number, number, number];
}

/**
 * Single vegetation type rendered as InstancedMesh
 */
function InstancedVegetationType({
  type,
  instances,
  geometry,
  enableShadows,
  enableWind,
  windSpeed,
  maxDistance,
  playerPosition,
}: InstancedVegetationTypeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const typeConfig = VEGETATION_TYPES[type];
  const { camera } = useThree();

  // Temporary objects for matrix updates (reuse to avoid GC)
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);

  // Create material with color tint
  const material = useMemo(() => {
    const color = new THREE.Color(
      typeConfig.colorTint[0],
      typeConfig.colorTint[1],
      typeConfig.colorTint[2]
    );

    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
  }, [typeConfig.colorTint]);

  // Update instance matrices when instances change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || instances.length === 0) return;

    // Create color attribute for per-instance color variation
    const colors = new Float32Array(instances.length * 3);

    instances.forEach((instance, index) => {
      // Position
      tempPosition.set(
        instance.position[0],
        instance.position[1],
        instance.position[2]
      );

      // Rotation
      tempEuler.set(
        instance.rotation[0],
        instance.rotation[1],
        instance.rotation[2]
      );
      tempQuaternion.setFromEuler(tempEuler);

      // Scale
      tempScale.setScalar(instance.scale);

      // Compose matrix
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);

      // Color variation
      const baseColor = typeConfig.colorTint;
      colors[index * 3] = Math.max(0, Math.min(1, baseColor[0] + instance.colorVariation[0]));
      colors[index * 3 + 1] = Math.max(0, Math.min(1, baseColor[1] + instance.colorVariation[1]));
      colors[index * 3 + 2] = Math.max(0, Math.min(1, baseColor[2] + instance.colorVariation[2]));
    });

    mesh.instanceMatrix.needsUpdate = true;

    // Apply instance colors
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    mesh.instanceColor.needsUpdate = true;
  }, [instances, tempMatrix, tempPosition, tempQuaternion, tempScale, tempEuler, typeConfig]);

  // Frustum culling and wind animation
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Wind animation for tumbleweeds
    if (enableWind && type === 'tumbleweed') {
      const time = state.clock.elapsedTime;

      instances.forEach((instance, index) => {
        // Get current matrix
        mesh.getMatrixAt(index, tempMatrix);
        tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);

        // Add rolling rotation
        const windOffset = Math.sin(time * windSpeed + instance.position[0] * 0.1) * 0.02;
        tempEuler.set(
          instance.rotation[0] + time * windSpeed * 0.5,
          instance.rotation[1],
          instance.rotation[2] + windOffset
        );
        tempQuaternion.setFromEuler(tempEuler);

        // Slight bobbing
        tempPosition.y = instance.position[1] + Math.sin(time * windSpeed * 2 + index) * 0.05;

        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        mesh.setMatrixAt(index, tempMatrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
    }

    // Distance-based visibility (simple LOD)
    if (maxDistance < Infinity) {
      const playerPos = new THREE.Vector3(...playerPosition);
      let visibleCount = 0;

      instances.forEach((instance, index) => {
        tempPosition.set(...instance.position);
        const distance = tempPosition.distanceTo(playerPos);

        // Hide instances beyond max distance
        if (distance > maxDistance) {
          // Set scale to 0 to hide
          mesh.getMatrixAt(index, tempMatrix);
          tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);
          tempScale.setScalar(0);
          tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
          mesh.setMatrixAt(index, tempMatrix);
        } else {
          visibleCount++;
        }
      });

      if (visibleCount !== instances.length) {
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  if (instances.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      castShadow={enableShadows && typeConfig.castsShadows}
      receiveShadow={enableShadows}
      frustumCulled={true}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VegetationInstances - Renders all vegetation using instancing
 *
 * Groups instances by type and renders each type as a separate InstancedMesh
 * for optimal batching and draw call reduction.
 */
export function VegetationInstances({
  instances,
  enableFrustumCulling = true,
  enableShadows = true,
  enableWind = true,
  windSpeed = 1.0,
  maxDistance = 200,
  playerPosition = [0, 0, 0],
}: VegetationInstancesProps) {
  // Get all vegetation geometries
  const geometries = useVegetationGeometries();

  // Group instances by type
  const instancesByType = useMemo(() => {
    const grouped = new Map<VegetationType, VegetationInstance[]>();

    for (const instance of instances) {
      const existing = grouped.get(instance.type) || [];
      existing.push(instance);
      grouped.set(instance.type, existing);
    }

    return grouped;
  }, [instances]);

  // Render each vegetation type
  return (
    <group name="vegetation-instances">
      {Array.from(instancesByType.entries()).map(([type, typeInstances]) => {
        const geometry = geometries.get(type);
        if (!geometry || typeInstances.length === 0) return null;

        return (
          <InstancedVegetationType
            key={type}
            type={type}
            instances={typeInstances}
            geometry={geometry}
            enableShadows={enableShadows}
            enableWind={enableWind}
            windSpeed={windSpeed}
            maxDistance={maxDistance}
            playerPosition={playerPosition}
          />
        );
      })}
    </group>
  );
}

// ============================================================================
// OPTIMIZED SINGLE-TYPE INSTANCES
// ============================================================================

export interface SingleTypeInstancesProps {
  type: VegetationType;
  instances: VegetationInstance[];
  enableShadows?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * Optimized component for rendering a single vegetation type
 * Use when you need more control over individual types
 */
export function SingleTypeInstances({
  type,
  instances,
  enableShadows = true,
  castShadow,
  receiveShadow,
}: SingleTypeInstancesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometries = useVegetationGeometries();
  const geometry = geometries.get(type);
  const typeConfig = VEGETATION_TYPES[type];

  // Determine shadow settings
  const shouldCastShadow = castShadow ?? (enableShadows && typeConfig.castsShadows);
  const shouldReceiveShadow = receiveShadow ?? enableShadows;

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(...typeConfig.colorTint),
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
  }, [typeConfig.colorTint]);

  // Update matrices
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !instances.length) return;

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    const tempEuler = new THREE.Euler();
    const colors = new Float32Array(instances.length * 3);

    instances.forEach((instance, index) => {
      tempPosition.set(...instance.position);
      tempEuler.set(...instance.rotation);
      tempQuaternion.setFromEuler(tempEuler);
      tempScale.setScalar(instance.scale);

      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);

      const baseColor = typeConfig.colorTint;
      colors[index * 3] = Math.max(0, Math.min(1, baseColor[0] + instance.colorVariation[0]));
      colors[index * 3 + 1] = Math.max(0, Math.min(1, baseColor[1] + instance.colorVariation[1]));
      colors[index * 3 + 2] = Math.max(0, Math.min(1, baseColor[2] + instance.colorVariation[2]));
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    mesh.instanceColor.needsUpdate = true;
  }, [instances, typeConfig]);

  if (!geometry || instances.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      castShadow={shouldCastShadow}
      receiveShadow={shouldReceiveShadow}
      frustumCulled={true}
    />
  );
}

// ============================================================================
// STATIC VEGETATION (PRE-BAKED)
// ============================================================================

export interface StaticVegetationProps {
  instances: VegetationInstance[];
  enableShadows?: boolean;
}

/**
 * Static vegetation that doesn't update after initial render
 * More efficient for pre-computed vegetation that doesn't change
 */
export const StaticVegetation = React.memo(function StaticVegetation({
  instances,
  enableShadows = true,
}: StaticVegetationProps) {
  return (
    <VegetationInstances
      instances={instances}
      enableShadows={enableShadows}
      enableWind={false}
      maxDistance={Infinity}
    />
  );
});
