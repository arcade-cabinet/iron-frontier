/**
 * CombatArena.tsx - Combat environment for R3F
 *
 * Features:
 * - Ground plane with Western desert texture
 * - Ambient props (rocks, cacti, etc.)
 * - Dust particle effects
 * - Dramatic lighting setup
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances, useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { type CombatArenaProps, ARENA_CONFIG, type ArenaType } from './types';

// ============================================================================
// GROUND COMPONENT
// ============================================================================

interface GroundProps {
  width: number;
  depth: number;
  color: string;
}

function Ground({ width, depth, color }: GroundProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[width, depth, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.1}
        // Add slight displacement for terrain variation
        displacementScale={0.3}
      />
    </mesh>
  );
}

// ============================================================================
// ROCKS COMPONENT
// ============================================================================

interface RockProps {
  position: [number, number, number];
  scale: number;
  rotation: number;
}

function Rock({ position, scale, rotation }: RockProps) {
  const color = useMemo(() => {
    const base = 0.3 + Math.random() * 0.2;
    return new THREE.Color(base, base * 0.9, base * 0.8);
  }, []);

  return (
    <mesh
      position={position}
      scale={[scale, scale * 0.7, scale]}
      rotation={[0, rotation, Math.random() * 0.3]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.05} flatShading />
    </mesh>
  );
}

// ============================================================================
// CACTUS COMPONENT
// ============================================================================

interface CactusProps {
  position: [number, number, number];
  scale: number;
}

function Cactus({ position, scale }: CactusProps) {
  return (
    <group position={position} scale={scale}>
      {/* Main body */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 2, 8]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.4, 1.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.8, 6]} />
        <meshStandardMaterial color="#3a6b32" roughness={0.8} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.35, 0.8, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.6, 6]} />
        <meshStandardMaterial color="#3a6b32" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ============================================================================
// DUST PARTICLES COMPONENT
// ============================================================================

interface DustParticlesProps {
  count: number;
  area: { width: number; depth: number };
}

function DustParticles({ count, area }: DustParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate initial particle positions
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * area.width,
      y: Math.random() * 3,
      z: (Math.random() - 0.5) * area.depth,
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.03,
    }));
  }, [count, area.width, area.depth]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Gentle floating motion
      const y = particle.y + Math.sin(time * particle.speed + particle.phase) * 0.5;
      const x = particle.x + Math.sin(time * 0.2 + particle.phase) * 0.3;

      dummy.position.set(x, y, particle.z);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#c9b896" transparent opacity={0.3} />
    </instancedMesh>
  );
}

// ============================================================================
// AMBIENT PROPS GENERATOR
// ============================================================================

interface AmbientPropsProps {
  type: ArenaType;
  density: number;
  area: { width: number; depth: number };
}

function AmbientProps({ type, density, area }: AmbientPropsProps) {
  const props = useMemo(() => {
    const items: Array<{ type: 'rock' | 'cactus'; position: [number, number, number]; scale: number; rotation: number }> = [];
    const count = Math.floor(density * 20);

    for (let i = 0; i < count; i++) {
      // Keep props away from the center combat area
      let x = (Math.random() - 0.5) * area.width;
      let z = (Math.random() - 0.5) * area.depth;

      // Push props to edges if they're in the combat area
      if (Math.abs(x) < 3 && Math.abs(z) < 4) {
        x = x > 0 ? x + 5 : x - 5;
      }

      const propType = type === 'desert' || type === 'canyon'
        ? (Math.random() > 0.7 ? 'cactus' : 'rock')
        : 'rock';

      items.push({
        type: propType,
        position: [x, 0, z],
        scale: 0.3 + Math.random() * 0.7,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    return items;
  }, [type, density, area.width, area.depth]);

  return (
    <group>
      {props.map((prop, i) =>
        prop.type === 'cactus' ? (
          <Cactus key={`cactus-${i}`} position={prop.position} scale={prop.scale} />
        ) : (
          <Rock key={`rock-${i}`} position={prop.position} scale={prop.scale} rotation={prop.rotation} />
        )
      )}
    </group>
  );
}

// ============================================================================
// LIGHTING SETUP
// ============================================================================

interface CombatLightingProps {
  ambientColor: string;
  type: ArenaType;
}

function CombatLighting({ ambientColor, type }: CombatLightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  // Dramatic lighting varies by arena type
  const sunIntensity = type === 'boss' ? 0.8 : type === 'mine' ? 0.3 : 1.0;
  const ambientIntensity = type === 'mine' ? 0.2 : 0.5;
  const sunColor = type === 'boss' ? '#ff6b35' : '#ffd89b';

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Main directional light (sun) */}
      <directionalLight
        ref={sunRef}
        position={[10, 15, 5]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Fill light from the opposite side */}
      <directionalLight
        position={[-8, 8, -5]}
        intensity={0.3}
        color="#87ceeb"
      />

      {/* Rim light for drama */}
      <pointLight
        position={[0, 10, -10]}
        intensity={type === 'boss' ? 0.5 : 0.2}
        color={type === 'boss' ? '#ff4500' : '#ffffff'}
        distance={30}
      />
    </>
  );
}

// ============================================================================
// FOG EFFECT
// ============================================================================

interface CombatFogProps {
  color: string;
  density: number;
}

function CombatFog({ color, density }: CombatFogProps) {
  return <fog attach="fog" args={[color, 10, 50 / density]} />;
}

// ============================================================================
// MAIN COMBAT ARENA COMPONENT
// ============================================================================

export function CombatArena({ type = 'desert', width = 20, depth = 15 }: CombatArenaProps) {
  const config = ARENA_CONFIG[type];

  return (
    <group>
      {/* Fog effect */}
      <CombatFog color={config.fogColor} density={config.fogDensity} />

      {/* Lighting */}
      <CombatLighting ambientColor={config.ambientColor} type={type} />

      {/* Ground plane */}
      <Ground width={width} depth={depth} color={config.groundColor} />

      {/* Ambient props (rocks, cacti, etc.) */}
      <AmbientProps type={type} density={config.propDensity} area={{ width, depth }} />

      {/* Dust particles */}
      <DustParticles count={50} area={{ width: width * 0.8, depth: depth * 0.8 }} />
    </group>
  );
}

export default CombatArena;
