/**
 * OverworldScene.tsx - Platform-agnostic overworld scene
 *
 * This scene works with both R3F (web) and expo-gl (native).
 * It provides the core overworld gameplay elements:
 * - Hex-based terrain
 * - Player character
 * - NPCs
 * - Items
 * - Lighting
 */

import {
    OrbitControls,
    PerspectiveCamera,
    Sky,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { useGameStore } from '@/src/store';

// ============================================================================
// CONSTANTS
// ============================================================================

const HEX_SIZE = 1;
const MAP_SIZE = 16;
const PLAYER_HEIGHT = 0.5;

// ============================================================================
// HEX UTILITIES
// ============================================================================

function hexToWorld(q: number, r: number): [number, number, number] {
  const x = HEX_SIZE * (3 / 2) * q;
  const z = HEX_SIZE * Math.sqrt(3) * (r + q / 2);
  return [x, 0, z];
}

function worldToHex(x: number, z: number): { q: number; r: number } {
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
        if (Math.abs(q + r) > halfSize) continue;

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

  useFrame((_, delta) => {
    if (meshRef.current && targetPosition) {
      const current = new THREE.Vector3().copy(currentPos);
      const target = new THREE.Vector3().copy(targetPosition);
      target.y = PLAYER_HEIGHT;

      const distance = current.distanceTo(target);

      if (distance > 0.1) {
        const direction = target.clone().sub(current).normalize();
        const moveSpeed = 5 * delta;
        const moveDistance = Math.min(moveSpeed, distance);

        current.add(direction.multiplyScalar(moveDistance));
        setCurrentPos(current);

        meshRef.current.position.copy(current);

        const angle = Math.atan2(direction.x, direction.z);
        meshRef.current.rotation.y = angle;
      } else {
        onReachTarget();
      }
    }
  });

  return (
    <group ref={meshRef} position={[currentPos.x, PLAYER_HEIGHT, currentPos.z]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.15, 8]} />
        <meshStandardMaterial color="#2d1810" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
        <meshStandardMaterial color="#2d1810" roughness={0.8} />
      </mesh>

      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// ============================================================================
// SCENE LIGHTING
// ============================================================================

interface SceneLightingProps {
  timeOfDay: number;
}

function SceneLighting({ timeOfDay }: SceneLightingProps) {
  const sunPosition = useMemo(() => {
    const hour = timeOfDay % 24;
    const angle = ((hour - 6) / 12) * Math.PI;
    const elevation = Math.sin(angle);
    const x = Math.cos(angle) * 100;
    const y = Math.max(elevation * 100, 5);
    const z = 50;
    return [x, y, z] as [number, number, number];
  }, [timeOfDay]);

  const ambientIntensity = useMemo(() => {
    const hour = timeOfDay % 24;
    if (hour >= 6 && hour <= 18) {
      return 0.4 + Math.sin(((hour - 6) / 12) * Math.PI) * 0.3;
    }
    return 0.2;
  }, [timeOfDay]);

  const sunColor = useMemo(() => {
    const hour = timeOfDay % 24;
    if (hour < 7 || hour > 17) {
      return '#ff8c42';
    }
    return '#ffffff';
  }, [timeOfDay]);

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#fff8e7" />

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

      <directionalLight
        position={[-sunPosition[0] * 0.5, sunPosition[1] * 0.3, -sunPosition[2]]}
        intensity={0.2}
        color="#87ceeb"
      />

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

export function OverworldScene() {
  const gameStore = useGameStore();
  const playerPosition = gameStore((state) => state.playerPosition);
  const setPlayerPosition = gameStore((state) => state.setPlayerPosition);
  const currentLocationId = gameStore((state) => state.currentLocationId);
  const time = gameStore((state) => state.time);
  const phase = gameStore((state) => state.phase);

  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const playerPos = useMemo(
    () => new THREE.Vector3(playerPosition.x, PLAYER_HEIGHT, playerPosition.z),
    [playerPosition]
  );

  const handleHexClick = useCallback((q: number, r: number) => {
    if (phase !== 'playing') return;

    const [x, , z] = hexToWorld(q, r);
    setTargetPosition(new THREE.Vector3(x, PLAYER_HEIGHT, z));
  }, [phase]);

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

  return (
    <>
      <SceneLighting timeOfDay={time.hour} />
      <CameraController target={playerPos} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#6b5c4a" roughness={0.9} />
      </mesh>

      <HexGrid size={MAP_SIZE} onHexClick={handleHexClick} />

      <Player
        position={playerPos}
        targetPosition={targetPosition}
        onReachTarget={handleReachTarget}
      />

      <fog attach="fog" args={['#c4b59d', 30, 80]} />
    </>
  );
}

export default OverworldScene;
