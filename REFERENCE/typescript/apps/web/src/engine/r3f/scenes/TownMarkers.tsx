/**
 * TownMarkers.tsx - Visual markers for towns on the R3F overworld
 *
 * Features:
 * - 3D markers showing town locations based on world data
 * - Distance-based visibility and LOD
 * - Billboard sprites for distant towns
 * - Approach detection for town entry triggers
 * - Name labels visible at medium distance
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

import { TOWN_POSITIONS } from '@iron-frontier/shared/systems';
import { ALL_TOWNS, type Town } from '@iron-frontier/shared/data/world/towns';

// ============================================================================
// TYPES
// ============================================================================

export interface TownMarkersProps {
  /** Current player position for distance calculations */
  playerPosition: THREE.Vector3;
  /** Called when player approaches a town (within entry radius) */
  onTownApproach?: (townId: string) => void;
  /** Called when player leaves town approach range */
  onTownLeave?: (townId: string) => void;
  /** Whether markers are visible */
  visible?: boolean;
}

interface TownMarkerData {
  id: string;
  name: string;
  position: THREE.Vector3;
  radius: number;
  size: 'small' | 'medium' | 'large';
  color: THREE.Color;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Distance at which town markers become visible */
const VISIBILITY_DISTANCE = 500;

/** Distance at which name labels appear */
const LABEL_DISTANCE = 200;

/** Distance at which 3D model switches to billboard */
const LOD_DISTANCE = 150;

/** Distance multiplier for approach detection */
const APPROACH_MULTIPLIER = 1.5;

/** Town size to marker scale mapping */
const SIZE_SCALES: Record<string, number> = {
  small: 0.8,
  medium: 1.0,
  large: 1.3,
};

/** Town theme to color mapping */
const THEME_COLORS: Record<string, THREE.Color> = {
  frontier: new THREE.Color(0x8b7355), // Tan/brown
  mining: new THREE.Color(0x696969), // Gray
  ranching: new THREE.Color(0x228b22), // Green
  outlaw: new THREE.Color(0x8b0000), // Dark red
  religious: new THREE.Color(0xffd700), // Gold
  default: new THREE.Color(0xdaa520), // Goldenrod
};

// ============================================================================
// TOWN MARKER DATA BUILDER
// ============================================================================

function buildTownMarkerData(): TownMarkerData[] {
  const markers: TownMarkerData[] = [];

  // Map town IDs to world positions
  const positionMap = new Map(
    Object.entries(TOWN_POSITIONS).map(([id, pos]) => [
      id,
      { x: pos.x, z: pos.z, radius: pos.radius },
    ])
  );

  // Build marker data from ALL_TOWNS
  for (const town of ALL_TOWNS) {
    const posData = positionMap.get(town.id);
    if (!posData) {
      // Use task-provided positions for missing entries
      const fallbackPositions: Record<string, { x: number; z: number; radius: number }> = {
        frontiers_edge: { x: 0, z: 0, radius: 100 },
        iron_gulch: { x: 800, z: 400, radius: 150 },
        mesa_point: { x: 500, z: 800, radius: 120 },
        coldwater: { x: 1000, z: 600, radius: 130 },
        salvation: { x: 800, z: 1000, radius: 140 },
        dusty_springs: { x: 50, z: 25, radius: 80 },
      };
      const fallback = fallbackPositions[town.id];
      if (fallback) {
        markers.push({
          id: town.id,
          name: town.name,
          position: new THREE.Vector3(fallback.x, 0, fallback.z),
          radius: fallback.radius,
          size: town.size ?? 'medium',
          color: THEME_COLORS[town.theme ?? 'default'] ?? THEME_COLORS.default,
        });
      }
      continue;
    }

    markers.push({
      id: town.id,
      name: town.name,
      position: new THREE.Vector3(posData.x, 0, posData.z),
      radius: posData.radius,
      size: town.size ?? 'medium',
      color: THEME_COLORS[town.theme ?? 'default'] ?? THEME_COLORS.default,
    });
  }

  return markers;
}

// ============================================================================
// SINGLE TOWN MARKER COMPONENT
// ============================================================================

interface SingleTownMarkerProps {
  marker: TownMarkerData;
  playerPosition: THREE.Vector3;
  onApproach?: (townId: string) => void;
  onLeave?: (townId: string) => void;
}

function SingleTownMarker({ marker, playerPosition, onApproach, onLeave }: SingleTownMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isApproached, setIsApproached] = useState(false);
  const [distance, setDistance] = useState(Infinity);

  // Calculate marker position with height offset based on size
  const markerPosition = useMemo(() => {
    const heightOffset = 10 * SIZE_SCALES[marker.size];
    return new THREE.Vector3(marker.position.x, heightOffset, marker.position.z);
  }, [marker.position, marker.size]);

  // Scale based on town size
  const scale = SIZE_SCALES[marker.size];

  // Update distance and visibility
  useFrame(() => {
    const dx = playerPosition.x - marker.position.x;
    const dz = playerPosition.z - marker.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    setDistance(dist);

    // Check approach state
    const approachRadius = marker.radius * APPROACH_MULTIPLIER;
    const nowApproached = dist <= approachRadius;

    if (nowApproached !== isApproached) {
      setIsApproached(nowApproached);
      if (nowApproached) {
        onApproach?.(marker.id);
      } else {
        onLeave?.(marker.id);
      }
    }

    // Update group visibility
    if (groupRef.current) {
      groupRef.current.visible = dist < VISIBILITY_DISTANCE;
    }
  });

  // Visibility flags
  const showLabel = distance < LABEL_DISTANCE;
  const useBillboard = distance > LOD_DISTANCE;

  return (
    <group ref={groupRef} position={marker.position}>
      {/* 3D marker (close range) */}
      {!useBillboard && (
        <group position={[0, 10 * scale, 0]}>
          {/* Tower/beacon structure */}
          <Cylinder args={[1 * scale, 1.5 * scale, 8 * scale, 8]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color={marker.color}
              roughness={0.6}
              metalness={0.2}
            />
          </Cylinder>

          {/* Top sphere beacon */}
          <Sphere args={[2 * scale, 16, 16]} position={[0, 6 * scale, 0]}>
            <meshStandardMaterial
              color={marker.color}
              emissive={marker.color}
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.5}
            />
          </Sphere>

          {/* Flag/banner */}
          <mesh position={[1.5 * scale, 5 * scale, 0]} rotation={[0, 0, Math.PI / 6]}>
            <planeGeometry args={[3 * scale, 2 * scale]} />
            <meshStandardMaterial
              color={marker.color}
              side={THREE.DoubleSide}
              roughness={0.8}
            />
          </mesh>
        </group>
      )}

      {/* Billboard marker (far range) */}
      {useBillboard && (
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, 15 * scale, 0]}
        >
          <mesh>
            <circleGeometry args={[4 * scale, 32]} />
            <meshBasicMaterial
              color={marker.color}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Inner glow */}
          <mesh position={[0, 0, 0.1]}>
            <circleGeometry args={[2.5 * scale, 32]} />
            <meshBasicMaterial
              color={new THREE.Color(1, 1, 1)}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Billboard>
      )}

      {/* Town name label */}
      {showLabel && (
        <Billboard
          follow={true}
          position={[0, 25 * scale, 0]}
        >
          <Text
            fontSize={3}
            color="#f5e6d3"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.15}
            outlineColor="#2a1f1a"
            font="/fonts/western.woff"
          >
            {marker.name}
          </Text>
        </Billboard>
      )}

      {/* Approach indicator */}
      {isApproached && (
        <Html
          position={[0, 30 * scale, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(139, 90, 43, 0.9)',
              color: '#f5e6d3',
              padding: '8px 16px',
              borderRadius: '4px',
              fontFamily: 'serif',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid #8b5a2b',
              whiteSpace: 'nowrap',
            }}
          >
            Press SPACE to enter {marker.name}
          </div>
        </Html>
      )}

      {/* Ground marker circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[marker.radius * 0.8, marker.radius, 64]} />
        <meshBasicMaterial
          color={marker.color}
          transparent
          opacity={isApproached ? 0.4 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// MAIN TOWN MARKERS COMPONENT
// ============================================================================

export function TownMarkers({
  playerPosition,
  onTownApproach,
  onTownLeave,
  visible = true,
}: TownMarkersProps) {
  // Build marker data once
  const markers = useMemo(() => buildTownMarkerData(), []);

  if (!visible) return null;

  return (
    <group name="town-markers">
      {markers.map((marker) => (
        <SingleTownMarker
          key={marker.id}
          marker={marker}
          playerPosition={playerPosition}
          onApproach={onTownApproach}
          onLeave={onTownLeave}
        />
      ))}
    </group>
  );
}

export default TownMarkers;
