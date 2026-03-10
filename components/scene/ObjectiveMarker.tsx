/**
 * ObjectiveMarker - Floating 3D diamond waypoint for quest objectives.
 *
 * Renders a pulsing amber diamond above the target position of the active
 * quest's current objective. Shows distance text below. Only renders for
 * the nearest incomplete objective with a resolved world position.
 *
 * Placed inside the R3F Canvas as a child of GameScene.
 */

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useGameStore } from "@/hooks/useGameStore";
import { gameStore } from "@/src/game/store/webGameStore";
import { getActiveQuestMarkers, type QuestMarker } from "@/src/game/systems/QuestMarkerSystem";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MARKER_COLOR = "#D4A049";
const MARKER_EMISSIVE = "#D4A049";
const MARKER_HEIGHT_OFFSET = 4; // float above target position
const PULSE_SPEED = 2.0;
const PULSE_MIN_SCALE = 0.85;
const PULSE_MAX_SCALE = 1.15;
const BOB_SPEED = 1.5;
const BOB_AMPLITUDE = 0.15;
const ROTATE_SPEED = 1.2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDistance(meters: number): string {
  if (meters < 10) return `${Math.round(meters)}m`;
  if (meters < 100) return `${Math.round(meters)}m`;
  return `${Math.round(meters)}m`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ObjectiveMarker() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const animState = useRef({ phase: 0 });

  // Create diamond geometry (octahedron with 0 detail = diamond shape)
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: MARKER_COLOR,
        emissive: MARKER_EMISSIVE,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // Find the nearest active, incomplete quest marker with a world position
  const getTargetMarker = (): QuestMarker | null => {
    const state = gameStore.getState();
    const markers = getActiveQuestMarkers(state);
    for (const marker of markers) {
      if (!marker.isComplete && marker.worldPosition) {
        return marker;
      }
    }
    return null;
  };

  useFrame((_state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group) return;

    const marker = getTargetMarker();
    if (!marker || !marker.worldPosition) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const anim = animState.current;
    anim.phase += delta;

    // Position above the target
    group.position.x = marker.worldPosition.x;
    group.position.y =
      marker.worldPosition.y +
      MARKER_HEIGHT_OFFSET +
      Math.sin(anim.phase * BOB_SPEED) * BOB_AMPLITUDE;
    group.position.z = marker.worldPosition.z;

    // Rotate slowly
    if (mesh) {
      mesh.rotation.y += delta * ROTATE_SPEED;
    }

    // Pulsing scale
    const pulseFactor =
      PULSE_MIN_SCALE +
      (PULSE_MAX_SCALE - PULSE_MIN_SCALE) * (0.5 + 0.5 * Math.sin(anim.phase * PULSE_SPEED));
    if (mesh) {
      mesh.scale.setScalar(pulseFactor);
    }

    // Update distance text
    if (textRef.current && marker.distance !== null) {
      textRef.current.text = formatDistance(marker.distance);
    }

    // Billboard the text toward the camera
    if (textRef.current) {
      textRef.current.lookAt(_state.camera.position);
    }
  });

  return (
    <group ref={groupRef} name="objective-marker">
      {/* Diamond mesh */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Glow ring (simple torus for visual flair) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.03, 8, 24]} />
        <meshBasicMaterial color={MARKER_COLOR} transparent opacity={0.4} />
      </mesh>

      {/* Distance text below */}
      <Text
        ref={textRef}
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="#E8D5A8"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.015}
        outlineColor="#000000"
        font={undefined}
      >
        {""}
      </Text>
    </group>
  );
}
