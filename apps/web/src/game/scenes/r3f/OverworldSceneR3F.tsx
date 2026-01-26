/**
 * OverworldSceneR3F - Main overworld scene using React Three Fiber
 *
 * Features:
 * - Hex-based terrain rendering
 * - Player character with click-to-move
 * - NPC markers with interaction
 * - Item markers for collectibles
 * - Day/night cycle lighting
 * - Camera controls (orbit/follow)
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Sky,
} from '@react-three/drei';
import * as THREE from 'three';

import { useGameStore } from '../../store/webGameStore';
import { useGamePhase } from '../../useGamePhase';
import { useNPCAI } from '../../hooks/useNPCAI';
import { AINPCMarker } from '../../components/AINPCMarker';
import { getNPCsByLocation } from '@iron-frontier/shared/data/npcs';
import {
  getWorldItemName,
  getWorldItemsForLocation,
} from '@iron-frontier/shared/data/items/worldItems';

// ============================================================================
// TYPES
// ============================================================================

interface HexCoord {
  q: number;
  r: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEX_SIZE = 1;
const MAP_SIZE = 16; // Number of hexes in each direction
const PLAYER_HEIGHT = 0.5;

// Hex layout helpers (flat-top hexagons)
const HEX_WIDTH = HEX_SIZE * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

// ============================================================================
// HEX UTILITIES
// ============================================================================

function hexToWorld(q: number, r: number): [number, number, number] {
  const x = HEX_SIZE * (3 / 2) * q;
  const z = HEX_SIZE * Math.sqrt(3) * (r + q / 2);
  return [x, 0, z];
}

function worldToHex(x: number, z: number): HexCoord {
  const q = (2 / 3) * x / HEX_SIZE;
  const r = (-1 / 3) * x / HEX_SIZE + (Math.sqrt(3) / 3) * z / HEX_SIZE;
  return { q: Math.round(q), r: Math.round(r) };
}

// ============================================================================
// HEX TILE COMPONENT
// ============================================================================

interface HexTileProps {
  q: number;
  r: number;
  color?: string;
  height?: number;
  onClick?: () => void;
}

function HexTile({ q, r, color = '#8b7355', height = 0.1, onClick }: HexTileProps) {
  const [x, , z] = hexToWorld(q, r);
  const [hovered, setHovered] = useState(false);

  // Create hex geometry (6-sided prism)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = HEX_SIZE * Math.cos(angle);
      const pz = HEX_SIZE * Math.sin(angle);
      if (i === 0) {
        shape.moveTo(px, pz);
      } else {
        shape.lineTo(px, pz);
      }
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [height]);

  return (
    <mesh
      position={[x, 0, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color={hovered ? '#a08060' : color}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

// ============================================================================
// HEX GRID COMPONENT
// ============================================================================

interface HexGridProps {
  size: number;
  onHexClick?: (q: number, r: number) => void;
}

function HexGrid({ size, onHexClick }: HexGridProps) {
  const hexes = useMemo(() => {
    const result: Array<{ q: number; r: number; color: string }> = [];
    const halfSize = Math.floor(size / 2);

    for (let q = -halfSize; q <= halfSize; q++) {
      for (let r = -halfSize; r <= halfSize; r++) {
        // Skip hexes too far from center (create roughly circular grid)
        if (Math.abs(q + r) > halfSize) continue;

        // Vary color slightly for visual interest
        const noise = Math.sin(q * 0.5) * Math.cos(r * 0.3) * 0.1;
        const baseColor = new THREE.Color('#8b7355');
        baseColor.offsetHSL(0, 0, noise);

        result.push({ q, r, color: '#' + baseColor.getHexString() });
      }
    }

    return result;
  }, [size]);

  return (
    <group name="hex-grid">
      {hexes.map(({ q, r, color }) => (
        <HexTile
          key={`hex-${q}-${r}`}
          q={q}
          r={r}
          color={color}
          onClick={() => onHexClick?.(q, r)}
        />
      ))}
    </group>
  );
}

// ============================================================================
// PLAYER COMPONENT
// ============================================================================

interface PlayerProps {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3 | null;
  onReachTarget: () => void;
}

function Player({ position, targetPosition, onReachTarget }: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [currentPos, setCurrentPos] = useState(position.clone());

  // Smooth movement toward target
  useFrame((_, delta) => {
    if (meshRef.current && targetPosition) {
      const current = new THREE.Vector3().copy(currentPos);
      const target = new THREE.Vector3().copy(targetPosition);
      target.y = PLAYER_HEIGHT;

      const distance = current.distanceTo(target);

      if (distance > 0.1) {
        // Move toward target
        const direction = target.clone().sub(current).normalize();
        const moveSpeed = 5 * delta;
        const moveDistance = Math.min(moveSpeed, distance);

        current.add(direction.multiplyScalar(moveDistance));
        setCurrentPos(current);

        // Update mesh position
        meshRef.current.position.copy(current);

        // Face movement direction
        const angle = Math.atan2(direction.x, direction.z);
        meshRef.current.rotation.y = angle;
      } else {
        // Reached target
        onReachTarget();
      }
    }
  });

  return (
    <group ref={meshRef} position={[currentPos.x, PLAYER_HEIGHT, currentPos.z]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* Hat */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.15, 8]} />
        <meshStandardMaterial color="#2d1810" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
        <meshStandardMaterial color="#2d1810" roughness={0.8} />
      </mesh>

      {/* Selection ring */}
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// ============================================================================
// NPC MARKER COMPONENT
// ============================================================================

interface NPCMarkerProps {
  id: string;
  name: string;
  position: [number, number, number];
  isQuestGiver?: boolean;
  onClick?: () => void;
}

function NPCMarker({ id, name, position, isQuestGiver = false, onClick }: NPCMarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.35]} />
        <meshStandardMaterial color={hovered ? '#7c5c3c' : '#6b4423'} roughness={0.7} />
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
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// ITEM MARKER COMPONENT
// ============================================================================

interface ItemMarkerProps {
  id: string;
  name: string;
  position: [number, number, number];
  onClick?: () => void;
}

function ItemMarker({ id, name, position, onClick }: ItemMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Floating animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + 0.3 + Math.sin(clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
    >
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial
        color="#d97706"
        emissive="#92400e"
        emissiveIntensity={0.3}
        roughness={0.5}
        metalness={0.3}
      />
    </mesh>
  );
}

// ============================================================================
// LIGHTING COMPONENT
// ============================================================================

interface SceneLightingProps {
  timeOfDay: number; // 0-24 hours
}

function SceneLighting({ timeOfDay }: SceneLightingProps) {
  // Calculate sun position based on time
  const sunPosition = useMemo(() => {
    const hour = timeOfDay % 24;
    const angle = ((hour - 6) / 12) * Math.PI; // Sun rises at 6, sets at 18
    const elevation = Math.sin(angle);
    const x = Math.cos(angle) * 100;
    const y = Math.max(elevation * 100, 5);
    const z = 50;
    return [x, y, z] as [number, number, number];
  }, [timeOfDay]);

  // Calculate ambient light intensity based on time
  const ambientIntensity = useMemo(() => {
    const hour = timeOfDay % 24;
    if (hour >= 6 && hour <= 18) {
      // Daytime
      return 0.4 + Math.sin(((hour - 6) / 12) * Math.PI) * 0.3;
    }
    // Nighttime
    return 0.2;
  }, [timeOfDay]);

  // Calculate sun color based on time (warmer at sunrise/sunset)
  const sunColor = useMemo(() => {
    const hour = timeOfDay % 24;
    if (hour < 7 || hour > 17) {
      return '#ff8c42'; // Orange for sunrise/sunset
    }
    return '#ffffff'; // White for midday
  }, [timeOfDay]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={ambientIntensity} color="#fff8e7" />

      {/* Sun (directional light) */}
      <directionalLight
        position={sunPosition}
        intensity={1}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-sunPosition[0] * 0.5, sunPosition[1] * 0.3, -sunPosition[2]]}
        intensity={0.2}
        color="#87ceeb"
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.6}
        azimuth={0.25}
      />
    </>
  );
}

// ============================================================================
// CAMERA CONTROLLER
// ============================================================================

interface CameraControllerProps {
  target: THREE.Vector3;
  distance?: number;
}

function CameraController({ target, distance = 20 }: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Update camera target smoothly
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.lerp(target, 0.05);
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[target.x, target.y + 15, target.z + distance]}
        fov={45}
      />
      <OrbitControls
        ref={controlsRef}
        target={target}
        enablePan={false}
        enableZoom={true}
        minDistance={10}
        maxDistance={40}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

// ============================================================================
// MAIN SCENE COMPONENT
// ============================================================================

export function OverworldSceneR3F() {
  const {
    playerPosition,
    setPlayerPosition,
    currentLocationId,
    collectedItemIds,
    collectWorldItem,
    talkToNPC,
    time,
  } = useGameStore();

  const { phase } = useGamePhase();

  // Player state
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const playerPos = useMemo(
    () => new THREE.Vector3(playerPosition.x, PLAYER_HEIGHT, playerPosition.z),
    [playerPosition]
  );

  // AI-driven NPCs
  const { npcStates, isInitialized: aiReady } = useNPCAI({
    locationId: currentLocationId,
    playerPosition,
    enabled: phase === 'playing',
  });

  // Get static NPCs for current location (fallback)
  const npcs = useMemo(() => {
    if (!currentLocationId) return [];
    return getNPCsByLocation(currentLocationId);
  }, [currentLocationId]);

  // Get items for current location
  const items = useMemo(() => {
    if (!currentLocationId) return [];
    return getWorldItemsForLocation(currentLocationId).filter(
      (item) => !collectedItemIds.includes(item.id)
    );
  }, [currentLocationId, collectedItemIds]);

  // Handle hex click - move player
  const handleHexClick = useCallback((q: number, r: number) => {
    if (phase !== 'playing') return;

    const [x, , z] = hexToWorld(q, r);
    setTargetPosition(new THREE.Vector3(x, PLAYER_HEIGHT, z));
  }, [phase]);

  // Handle player reaching target
  const handleReachTarget = useCallback(() => {
    if (targetPosition) {
      setPlayerPosition({
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
      });
      setTargetPosition(null);
    }
  }, [targetPosition, setPlayerPosition]);

  // Handle NPC click
  const handleNPCClick = useCallback((npcId: string) => {
    if (phase !== 'playing') return;
    talkToNPC(npcId);
  }, [phase, talkToNPC]);

  // Handle item click
  const handleItemClick = useCallback((itemId: string) => {
    if (phase !== 'playing') return;
    collectWorldItem(itemId);
  }, [phase, collectWorldItem]);

  return (
    <>
      {/* Lighting */}
      <SceneLighting timeOfDay={time.hour} />

      {/* Camera */}
      <CameraController target={playerPos} />

      {/* Ground plane (fallback) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#6b5c4a" roughness={0.9} />
      </mesh>

      {/* Hex Grid */}
      <HexGrid size={MAP_SIZE} onHexClick={handleHexClick} />

      {/* Player */}
      <Player
        position={playerPos}
        targetPosition={targetPosition}
        onReachTarget={handleReachTarget}
      />

      {/* AI-driven NPCs */}
      {aiReady && npcStates.map((npc) => (
        <AINPCMarker
          key={npc.id}
          id={npc.id}
          name={npc.name}
          position={npc.position}
          direction={npc.direction}
          state={npc.state}
          isQuestGiver={npc.isQuestGiver}
          wantsToInteract={npc.wantsToInteract}
          onClick={() => handleNPCClick(npc.id)}
        />
      ))}

      {/* Static NPCs (fallback when AI not ready) */}
      {!aiReady && npcs.map((npc) => {
        if (!npc.spawnCoord) return null;
        const [x, , z] = hexToWorld(npc.spawnCoord.q, npc.spawnCoord.r);
        return (
          <NPCMarker
            key={npc.id}
            id={npc.id}
            name={npc.name}
            position={[x, 0, z]}
            isQuestGiver={npc.questGiver}
            onClick={() => handleNPCClick(npc.id)}
          />
        );
      })}

      {/* Items */}
      {items.map((item) => {
        const [x, , z] = hexToWorld(item.coord.q, item.coord.r);
        const itemName = getWorldItemName(item.itemId);
        return (
          <ItemMarker
            key={item.id}
            id={item.id}
            name={itemName}
            position={[x, 0.5, z]}
            onClick={() => handleItemClick(item.id)}
          />
        );
      })}

      {/* Environment fog */}
      <fog attach="fog" args={['#c4b59d', 30, 80]} />
    </>
  );
}

export default OverworldSceneR3F;
