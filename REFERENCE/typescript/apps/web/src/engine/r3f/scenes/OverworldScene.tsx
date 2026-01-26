/**
 * OverworldScene.tsx - Main R3F overworld scene
 *
 * Composes all major subsystems into a single cohesive game scene:
 * - StreamingTerrain for infinite procedural terrain
 * - WesternSky + AtmosphericEffects for day/night cycle
 * - VegetationInstances for biome-appropriate flora
 * - ThirdPersonCamera + PlayerMesh for character control
 * - Town markers, NPC sprites, encounter zones
 *
 * This is the primary game scene that connects to the game store.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Sky,
  Stars,
  Float,
  useKeyboardControls,
  KeyboardControls,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import { useGameStore } from '../../../game/store/webGameStore';
import { useGameInput } from '@iron-frontier/shared/hooks/useGameInput';
import { getZoneSystem, ZoneSystem, type Zone } from '@iron-frontier/shared/systems';
import { getEncounterSystem, type EncounterTrigger } from '@iron-frontier/shared/systems';

import { StreamingTerrainR3F } from './terrain/StreamingTerrainR3F';
import { WesternSky, AtmosphericEffects } from './atmosphere/WesternSky';
import { VegetationInstances } from './vegetation/VegetationInstances';
import { ThirdPersonCamera, PlayerMesh } from './camera/PlayerController';
import { TownMarkers } from './TownMarkers';
import { NPCSprites } from './NPCSprites';
import { EncounterZones } from './EncounterZones';
import { ZoneTransitions } from './ZoneTransitions';

// ============================================================================
// TYPES
// ============================================================================

export interface OverworldSceneProps {
  /** Random seed for procedural generation */
  seed?: number;
  /** Initial player position */
  initialPosition?: { x: number; z: number };
  /** Called when player position changes */
  onPositionChange?: (position: { x: number; y: number; z: number }) => void;
  /** Called when entering/exiting town zones */
  onTownChange?: (townId: string | null) => void;
  /** Called when encounter triggers */
  onEncounter?: (trigger: EncounterTrigger) => void;
  /** Debug mode for visualizing zones */
  debugMode?: boolean;
}

// ============================================================================
// KEYBOARD CONTROLS MAPPING
// ============================================================================

export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  sprint = 'sprint',
  interact = 'interact',
}

const keyboardMap = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.sprint, keys: ['ShiftLeft', 'ShiftRight'] },
  { name: Controls.interact, keys: ['Space', 'KeyE'] },
];

// ============================================================================
// SCENE CONTENT
// ============================================================================

interface SceneContentProps extends OverworldSceneProps {
  getHeightAt: (x: number, z: number) => number;
}

function SceneContent({
  seed = 12345,
  initialPosition = { x: 0, z: 0 },
  onPositionChange,
  onTownChange,
  onEncounter,
  debugMode = false,
  getHeightAt,
}: SceneContentProps) {
  const { scene, camera } = useThree();

  // Player state
  const [playerPosition, setPlayerPosition] = useState<THREE.Vector3>(
    () => new THREE.Vector3(initialPosition.x, getHeightAt(initialPosition.x, initialPosition.z), initialPosition.z)
  );
  const [playerRotation, setPlayerRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Zone state
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [currentTown, setCurrentTown] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Game store connection
  const gamePhase = useGameStore((s) => s.phase);
  const time = useGameStore((s) => s.time);
  const gameHour = time?.hour ?? 12;

  // Initialize zone system
  useEffect(() => {
    const zoneSystem = getZoneSystem();
    const townZones = ZoneSystem.createTownZones();
    zoneSystem.registerZones(townZones);

    // Subscribe to zone changes
    const unsubZone = zoneSystem.onZoneChange((newZone, prevZone) => {
      setCurrentZone(newZone);

      // Handle town transitions
      if (newZone?.type === 'town' && newZone.townId) {
        if (currentTown !== newZone.townId) {
          setCurrentTown(newZone.townId);
          onTownChange?.(newZone.townId);
        }
      } else if (prevZone?.type === 'town' && currentTown) {
        setCurrentTown(null);
        onTownChange?.(null);
      }
    });

    return () => {
      unsubZone();
    };
  }, [currentTown, onTownChange]);

  // Initialize encounter system
  useEffect(() => {
    const encounterSystem = getEncounterSystem();

    const unsubEncounter = encounterSystem.onEncounter((trigger) => {
      onEncounter?.(trigger);
    });

    return () => {
      unsubEncounter();
    };
  }, [onEncounter]);

  // Keyboard controls
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);
  const sprint = useKeyboardControls((state) => state.sprint);

  // Movement update loop
  useFrame((state, delta) => {
    if (gamePhase !== 'playing' || isTransitioning) return;

    // Calculate movement vector
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);
    const hasInput = moveX !== 0 || moveZ !== 0;

    // Movement speed
    const baseSpeed = 8;
    const sprintMultiplier = sprint ? 1.8 : 1;
    const speed = baseSpeed * sprintMultiplier * delta;

    if (hasInput) {
      // Calculate direction relative to camera
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

      // Calculate movement direction
      const moveDirection = new THREE.Vector3();
      moveDirection.addScaledVector(cameraRight, moveX);
      moveDirection.addScaledVector(cameraDirection, -moveZ);
      moveDirection.normalize();

      // Calculate new position
      const newX = playerPosition.x + moveDirection.x * speed;
      const newZ = playerPosition.z + moveDirection.z * speed;
      const newY = getHeightAt(newX, newZ);

      const newPosition = new THREE.Vector3(newX, newY, newZ);
      setPlayerPosition(newPosition);

      // Update rotation to face movement direction
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      setPlayerRotation(targetRotation);

      // Update state
      setIsMoving(true);
      setIsSprinting(sprint);

      // Notify callbacks
      onPositionChange?.({ x: newX, y: newY, z: newZ });

      // Update zone system
      const zoneSystem = getZoneSystem();
      zoneSystem.updatePlayerPosition({ x: newX, z: newZ });

      // Update encounter system
      const encounterSystem = getEncounterSystem();
      encounterSystem.updatePosition(newX, newZ);
    } else {
      setIsMoving(false);
      setIsSprinting(false);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />

      {/* Atmosphere */}
      <WesternSky gameHour={gameHour} />
      <AtmosphericEffects gameHour={gameHour} />

      {/* Stars at night */}
      {(gameHour < 5 || gameHour > 20) && (
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}

      {/* Terrain */}
      <StreamingTerrainR3F
        seed={seed}
        playerPosition={playerPosition}
        viewDistance={3}
      />

      {/* Vegetation */}
      <VegetationInstances
        seed={seed}
        playerPosition={playerPosition}
        getHeightAt={getHeightAt}
      />

      {/* Player */}
      <PlayerMesh
        position={playerPosition}
        rotation={playerRotation}
        isMoving={isMoving}
        isSprinting={isSprinting}
      />

      {/* Camera */}
      <ThirdPersonCamera
        target={playerPosition}
        distance={15}
        heightOffset={8}
        rotationSpeed={0.5}
      />

      {/* Town markers */}
      <TownMarkers
        playerPosition={playerPosition}
        onTownApproach={(townId) => {
          console.log(`[OverworldScene] Approaching town: ${townId}`);
        }}
      />

      {/* NPC sprites on overworld */}
      <NPCSprites
        playerPosition={playerPosition}
        currentTownId={currentTown}
      />

      {/* Encounter zones */}
      <EncounterZones
        playerPosition={playerPosition}
        debugMode={debugMode}
      />

      {/* Zone transitions */}
      <ZoneTransitions
        isTransitioning={isTransitioning}
        onTransitionStart={() => setIsTransitioning(true)}
        onTransitionEnd={() => setIsTransitioning(false)}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
          height={300}
          intensity={0.3}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.4} />
      </EffectComposer>
    </>
  );
}

// ============================================================================
// HEIGHT PROVIDER
// ============================================================================

interface HeightProviderProps {
  children: (getHeightAt: (x: number, z: number) => number) => React.ReactNode;
  seed: number;
}

function HeightProvider({ children, seed }: HeightProviderProps) {
  // Height function using procedural noise
  const getHeightAt = useCallback(
    (x: number, z: number): number => {
      // Simple noise-based height for now
      // In production, this would connect to the terrain system
      const scale = 0.02;
      const amplitude = 15;

      // Multi-octave noise approximation
      const noise1 = Math.sin(x * scale + seed) * Math.cos(z * scale + seed);
      const noise2 = Math.sin(x * scale * 2 + seed) * Math.cos(z * scale * 2 + seed) * 0.5;
      const noise3 = Math.sin(x * scale * 4 + seed) * Math.cos(z * scale * 4 + seed) * 0.25;

      return (noise1 + noise2 + noise3) * amplitude;
    },
    [seed]
  );

  return <>{children(getHeightAt)}</>;
}

// ============================================================================
// MAIN OVERWORLD SCENE COMPONENT
// ============================================================================

export function OverworldScene({
  seed = 12345,
  initialPosition = { x: 0, z: 0 },
  onPositionChange,
  onTownChange,
  onEncounter,
  debugMode = false,
}: OverworldSceneProps) {
  const gamePhase = useGameStore((s) => s.phase);

  // Only render in playing phase
  if (gamePhase !== 'playing' && gamePhase !== 'dialogue') {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ fov: 60, near: 0.1, far: 1000 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
          }}
        >
          <HeightProvider seed={seed}>
            {(getHeightAt) => (
              <SceneContent
                seed={seed}
                initialPosition={initialPosition}
                onPositionChange={onPositionChange}
                onTownChange={onTownChange}
                onEncounter={onEncounter}
                debugMode={debugMode}
                getHeightAt={getHeightAt}
              />
            )}
          </HeightProvider>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

export default OverworldScene;
