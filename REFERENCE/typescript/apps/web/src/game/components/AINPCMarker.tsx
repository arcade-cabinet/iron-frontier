/**
 * AINPCMarker - AI-driven NPC marker component
 *
 * Renders an NPC with position and rotation driven by the YukaJS AI system.
 * Includes visual feedback for different AI states (idle, alert, wandering).
 */

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AIState } from '@iron-frontier/shared/ai';

// ============================================================================
// TYPES
// ============================================================================

export interface AINPCMarkerProps {
  /** Unique NPC ID */
  id: string;
  /** Display name */
  name: string;
  /** Current position from AI system */
  position: { x: number; y: number; z: number };
  /** Facing direction from AI system */
  direction: { x: number; z: number };
  /** Current AI state */
  state: AIState;
  /** Whether this NPC is a quest giver */
  isQuestGiver?: boolean;
  /** Whether the NPC wants to interact */
  wantsToInteract?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// STATE COLORS
// ============================================================================

const STATE_COLORS: Record<AIState, string> = {
  idle: '#6b4423',
  wander: '#5c4033',
  patrol: '#4a5568',
  seek: '#7c3aed',
  flee: '#ef4444',
  follow: '#3b82f6',
  interact: '#10b981',
  alert: '#f59e0b',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function AINPCMarker({
  id,
  name,
  position,
  direction,
  state,
  isQuestGiver = false,
  wantsToInteract = false,
  onClick,
}: AINPCMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth position interpolation
  const currentPos = useRef(new THREE.Vector3(position.x, 0, position.z));
  const targetRotation = useRef(0);

  // Calculate target rotation from direction
  const targetRot = useMemo(() => {
    if (direction.x !== 0 || direction.z !== 0) {
      return Math.atan2(direction.x, direction.z);
    }
    return targetRotation.current;
  }, [direction.x, direction.z]);

  // Smooth movement and rotation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Lerp position
    const targetPos = new THREE.Vector3(position.x, 0, position.z);
    currentPos.current.lerp(targetPos, Math.min(delta * 5, 1));
    groupRef.current.position.copy(currentPos.current);

    // Lerp rotation
    targetRotation.current = THREE.MathUtils.lerp(
      targetRotation.current,
      targetRot,
      Math.min(delta * 5, 1)
    );
    groupRef.current.rotation.y = targetRotation.current;
  });

  // Get color based on state
  const bodyColor = hovered
    ? lightenColor(STATE_COLORS[state] || STATE_COLORS.idle)
    : STATE_COLORS[state] || STATE_COLORS.idle;

  return (
    <group
      ref={groupRef}
      position={[position.x, 0, position.z]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* Hat */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.12, 8]} />
        <meshStandardMaterial color="#3d2415" roughness={0.8} />
      </mesh>

      {/* Quest indicator */}
      {isQuestGiver && (
        <QuestIndicator position={[0, 1.8, 0]} />
      )}

      {/* Alert indicator (when NPC notices player) */}
      {state === 'alert' && (
        <AlertIndicator position={[0, 2.1, 0]} />
      )}

      {/* Interaction prompt */}
      {wantsToInteract && hovered && (
        <InteractionPrompt position={[0, 2.3, 0]} />
      )}

      {/* State indicator (debug) */}
      {/* <StateDebugIndicator state={state} position={[0, 2.5, 0]} /> */}
    </group>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface IndicatorProps {
  position: [number, number, number];
}

function QuestIndicator({ position }: IndicatorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function AlertIndicator({ position }: IndicatorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 10) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.15]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function InteractionPrompt({ position }: IndicatorProps) {
  return (
    <mesh position={position}>
      <planeGeometry args={[0.3, 0.3]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

function lightenColor(hex: string): string {
  const color = new THREE.Color(hex);
  color.offsetHSL(0, 0, 0.1);
  return '#' + color.getHexString();
}

export default AINPCMarker;
