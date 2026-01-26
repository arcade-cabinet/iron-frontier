/**
 * CombatSceneR3F - Turn-based combat scene using React Three Fiber
 *
 * Features:
 * - Grid-based combat arena
 * - Player and enemy positions
 * - Combat animations (attacks, hits, etc.)
 * - Visual feedback for combat actions
 *
 * Note: The actual combat UI (action buttons, health bars, etc.)
 * is handled by CombatPanel in the GameOverlay layer.
 * This scene provides the 3D backdrop/arena.
 */

import { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

import { useGameStore } from '../../store/webGameStore';
import type { Combatant } from '@iron-frontier/shared/store';

// ============================================================================
// CONSTANTS
// ============================================================================

const ARENA_SIZE = 10;
const TILE_SIZE = 1.5;
const COMBATANT_HEIGHT = 0.5;

// ============================================================================
// ARENA FLOOR COMPONENT
// ============================================================================

function ArenaFloor() {
  const tiles = useMemo(() => {
    const result: Array<{ x: number; z: number; color: string }> = [];
    const halfSize = Math.floor(ARENA_SIZE / 2);

    for (let x = -halfSize; x <= halfSize; x++) {
      for (let z = -halfSize; z <= halfSize; z++) {
        // Checkerboard pattern
        const isLight = (x + z) % 2 === 0;
        result.push({
          x: x * TILE_SIZE,
          z: z * TILE_SIZE,
          color: isLight ? '#5c4a36' : '#4a3c2d',
        });
      }
    }

    return result;
  }, []);

  return (
    <group name="arena-floor">
      {tiles.map(({ x, z, color }, i) => (
        <mesh
          key={`tile-${i}`}
          position={[x, 0, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[TILE_SIZE - 0.05, TILE_SIZE - 0.05]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}

      {/* Arena border */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ARENA_SIZE * 0.8, ARENA_SIZE, 32]} />
        <meshStandardMaterial
          color="#2d2418"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// COMBATANT MESH COMPONENT
// ============================================================================

interface CombatantMeshProps {
  combatant: Combatant;
  isSelected?: boolean;
  isTargeted?: boolean;
}

function CombatantMesh({ combatant, isSelected = false, isTargeted = false }: CombatantMeshProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Calculate position from hex coordinates
  const position = useMemo(() => {
    const x = combatant.position.q * TILE_SIZE;
    const z = combatant.position.r * TILE_SIZE;
    return new THREE.Vector3(x, COMBATANT_HEIGHT, z);
  }, [combatant.position]);

  // Animate selection/targeting
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle bobbing for selected combatant
      if (isSelected || isTargeted) {
        meshRef.current.position.y = COMBATANT_HEIGHT + Math.sin(clock.elapsedTime * 3) * 0.05;
      }
    }
  });

  // Determine colors based on player/enemy and state
  const bodyColor = combatant.isPlayer ? '#5c4033' : '#8b3a3a';
  const highlightColor = isTargeted ? '#ff0000' : isSelected ? '#fbbf24' : 'transparent';

  if (combatant.isDead) {
    return null; // Don't render dead combatants
  }

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.4]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* Hat (player) or bandana (enemy) */}
      {combatant.isPlayer ? (
        <>
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 0.12, 8]} />
            <meshStandardMaterial color="#2d1810" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.18, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.05, 8]} />
            <meshStandardMaterial color="#2d1810" roughness={0.8} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.1, 0.35]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      )}

      {/* Selection/targeting ring */}
      {(isSelected || isTargeted) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial
            color={highlightColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Health indicator (small bar above head) */}
      <group position={[0, 1.5, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* Health fill */}
        <mesh position={[(combatant.health / combatant.maxHealth - 1) * 0.3, 0, 0.001]}>
          <planeGeometry args={[0.58 * (combatant.health / combatant.maxHealth), 0.06]} />
          <meshBasicMaterial
            color={
              combatant.health / combatant.maxHealth > 0.5
                ? '#22c55e'
                : combatant.health / combatant.maxHealth > 0.25
                  ? '#eab308'
                  : '#ef4444'
            }
          />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// COMBAT LIGHTING
// ============================================================================

function CombatLighting() {
  return (
    <>
      {/* Dramatic combat lighting */}
      <ambientLight intensity={0.3} color="#fff8e7" />

      {/* Main light from above-front */}
      <directionalLight
        position={[5, 15, 10]}
        intensity={1}
        color="#ffe4c4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Rim light from behind */}
      <directionalLight
        position={[-5, 10, -10]}
        intensity={0.4}
        color="#ff8c42"
      />

      {/* Fill light */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.3}
        color="#fbbf24"
      />
    </>
  );
}

// ============================================================================
// COMBAT CAMERA
// ============================================================================

function CombatCamera() {
  const { combatState } = useGameStore();
  const controlsRef = useRef<any>(null);

  // Calculate center of combat
  const centerPosition = useMemo(() => {
    if (!combatState || combatState.combatants.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    let sumX = 0;
    let sumZ = 0;
    let count = 0;

    for (const combatant of combatState.combatants) {
      if (!combatant.isDead) {
        sumX += combatant.position.q * TILE_SIZE;
        sumZ += combatant.position.r * TILE_SIZE;
        count++;
      }
    }

    return new THREE.Vector3(
      count > 0 ? sumX / count : 0,
      0,
      count > 0 ? sumZ / count : 0
    );
  }, [combatState]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[centerPosition.x, 12, centerPosition.z + 15]}
        fov={50}
      />
      <OrbitControls
        ref={controlsRef}
        target={centerPosition}
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// ============================================================================
// MAIN COMBAT SCENE
// ============================================================================

export function CombatSceneR3F() {
  const { combatState } = useGameStore();

  // Get current selected target
  const selectedTargetId = combatState?.selectedTargetId;
  const currentTurnCombatant = combatState?.combatants[combatState.currentTurnIndex];

  if (!combatState) {
    return null;
  }

  return (
    <>
      {/* Lighting */}
      <CombatLighting />

      {/* Camera */}
      <CombatCamera />

      {/* Arena floor */}
      <ArenaFloor />

      {/* Combatants */}
      {combatState.combatants.map((combatant) => (
        <CombatantMesh
          key={combatant.definitionId + combatant.name}
          combatant={combatant}
          isSelected={currentTurnCombatant?.definitionId === combatant.definitionId}
          isTargeted={selectedTargetId === combatant.definitionId}
        />
      ))}

      {/* Background elements */}
      <group position={[0, 0, -ARENA_SIZE]}>
        {/* Distant mountains/buildings silhouette */}
        {[-8, -4, 0, 4, 8].map((x, i) => (
          <mesh key={`bg-${i}`} position={[x, 2 + Math.random() * 2, 0]} castShadow={false}>
            <boxGeometry args={[2, 4 + Math.random() * 3, 1]} />
            <meshStandardMaterial color="#2d2418" roughness={1} />
          </mesh>
        ))}
      </group>

      {/* Dust/atmosphere */}
      <fog attach="fog" args={['#8b7355', 15, 40]} />
    </>
  );
}

export default CombatSceneR3F;
