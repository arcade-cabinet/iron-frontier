/**
 * PlayerController.tsx - Third-person camera and player mesh for R3F
 *
 * Features:
 * - Smooth third-person follow camera
 * - Western-themed player character mesh
 * - Animation state handling (idle, walk, run)
 * - Camera orbit controls
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useAnimations, useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface ThirdPersonCameraProps {
  /** Target position to follow */
  target: THREE.Vector3;
  /** Camera distance from target */
  distance?: number;
  /** Height offset above target */
  heightOffset?: number;
  /** Camera smoothing speed */
  smoothSpeed?: number;
  /** Allow camera rotation */
  enableRotation?: boolean;
  /** Rotation speed */
  rotationSpeed?: number;
  /** Minimum/maximum pitch angles (radians) */
  minPitch?: number;
  maxPitch?: number;
}

export interface PlayerMeshProps {
  /** World position */
  position: THREE.Vector3;
  /** Rotation around Y axis (radians) */
  rotation: number;
  /** Is the player currently moving */
  isMoving: boolean;
  /** Is the player sprinting */
  isSprinting: boolean;
  /** Player appearance customization */
  appearance?: PlayerAppearance;
}

export interface PlayerAppearance {
  /** Main body color */
  bodyColor?: THREE.Color;
  /** Hat color */
  hatColor?: THREE.Color;
  /** Skin tone */
  skinColor?: THREE.Color;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CAMERA_DISTANCE = 15;
const DEFAULT_HEIGHT_OFFSET = 8;
const DEFAULT_SMOOTH_SPEED = 5;
const DEFAULT_ROTATION_SPEED = 0.5;
const MIN_PITCH = 0.1; // Prevent looking straight down
const MAX_PITCH = Math.PI / 2.5; // Prevent looking too high

const DEFAULT_APPEARANCE: PlayerAppearance = {
  bodyColor: new THREE.Color(0x4a3728), // Dark brown leather
  hatColor: new THREE.Color(0x2e1f14), // Darker brown
  skinColor: new THREE.Color(0xdeb887), // Burlywood
};

// ============================================================================
// THIRD PERSON CAMERA
// ============================================================================

export function ThirdPersonCamera({
  target,
  distance = DEFAULT_CAMERA_DISTANCE,
  heightOffset = DEFAULT_HEIGHT_OFFSET,
  smoothSpeed = DEFAULT_SMOOTH_SPEED,
  enableRotation = true,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  minPitch = MIN_PITCH,
  maxPitch = MAX_PITCH,
}: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Camera state
  const [cameraYaw, setCameraYaw] = useState(0);
  const [cameraPitch, setCameraPitch] = useState(Math.PI / 6);

  // Smooth camera position
  const smoothPosition = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    // Calculate desired camera position
    const yawSin = Math.sin(cameraYaw);
    const yawCos = Math.cos(cameraYaw);
    const pitchSin = Math.sin(cameraPitch);
    const pitchCos = Math.cos(cameraPitch);

    // Position relative to target
    const desiredPosition = new THREE.Vector3(
      target.x - yawSin * pitchCos * distance,
      target.y + heightOffset + pitchSin * distance,
      target.z - yawCos * pitchCos * distance
    );

    // Smooth interpolation
    smoothPosition.current.lerp(desiredPosition, smoothSpeed * delta);
    smoothTarget.current.lerp(
      new THREE.Vector3(target.x, target.y + heightOffset * 0.5, target.z),
      smoothSpeed * delta
    );

    // Update camera
    camera.position.copy(smoothPosition.current);
    camera.lookAt(smoothTarget.current);
  });

  // Handle orbit controls for rotation
  return enableRotation ? (
    <OrbitControls
      ref={controlsRef}
      target={[target.x, target.y + heightOffset * 0.5, target.z]}
      enableZoom={false}
      enablePan={false}
      rotateSpeed={rotationSpeed}
      minPolarAngle={MIN_PITCH}
      maxPolarAngle={MAX_PITCH}
      onChange={() => {
        if (controlsRef.current) {
          const spherical = new THREE.Spherical().setFromVector3(
            new THREE.Vector3().subVectors(camera.position, controlsRef.current.target)
          );
          setCameraPitch(spherical.phi);
          setCameraYaw(spherical.theta);
        }
      }}
    />
  ) : null;
}

// ============================================================================
// PLAYER MESH
// ============================================================================

export function PlayerMesh({
  position,
  rotation,
  isMoving,
  isSprinting,
  appearance = DEFAULT_APPEARANCE,
}: PlayerMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Animation state
  const [animationState, setAnimationState] = useState<'idle' | 'walk' | 'run'>('idle');
  const [bobOffset, setBobOffset] = useState(0);
  const [legAngle, setLegAngle] = useState(0);

  // Update animation state
  useEffect(() => {
    if (isSprinting && isMoving) {
      setAnimationState('run');
    } else if (isMoving) {
      setAnimationState('walk');
    } else {
      setAnimationState('idle');
    }
  }, [isMoving, isSprinting]);

  // Animate player
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Update position and rotation
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.rotation.y = rotation;
    }

    // Animation calculations
    if (animationState === 'idle') {
      // Subtle breathing animation
      setBobOffset(Math.sin(time * 2) * 0.02);
      setLegAngle(0);
    } else {
      // Walking/running bob
      const speed = animationState === 'run' ? 12 : 6;
      const amplitude = animationState === 'run' ? 0.1 : 0.05;
      setBobOffset(Math.abs(Math.sin(time * speed)) * amplitude);
      setLegAngle(Math.sin(time * speed) * (animationState === 'run' ? 0.8 : 0.4));
    }
  });

  return (
    <group ref={groupRef}>
      {/* Apply bob offset */}
      <group position={[0, bobOffset, 0]}>
        {/* Body - Torso */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
          <meshStandardMaterial
            color={appearance.bodyColor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Shirt/Vest detail */}
        <mesh position={[0, 1.3, 0.12]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial
            color={new THREE.Color(0x8b7355)}
            roughness={0.9}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.9, 0]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={appearance.skinColor}
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* Cowboy Hat - Brim */}
        <mesh position={[0, 2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.05, 16]} />
          <meshStandardMaterial
            color={appearance.hatColor}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Cowboy Hat - Crown */}
        <mesh position={[0, 2.35, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.25, 16]} />
          <meshStandardMaterial
            color={appearance.hatColor}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Hat Band */}
        <mesh position={[0, 2.28, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
          <meshStandardMaterial color={new THREE.Color(0xdaa520)} roughness={0.5} />
        </mesh>

        {/* Left Arm */}
        <group position={[-0.35, 1.3, 0]}>
          <mesh
            position={[0, -0.15, 0]}
            rotation={[0, 0, Math.sin(legAngle) * 0.3]}
            castShadow
          >
            <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
            <meshStandardMaterial
              color={appearance.bodyColor}
              roughness={0.8}
            />
          </mesh>
          {/* Hand */}
          <mesh position={[Math.sin(legAngle) * 0.1, -0.45, 0]} castShadow>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={appearance.skinColor} roughness={0.9} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.35, 1.3, 0]}>
          <mesh
            position={[0, -0.15, 0]}
            rotation={[0, 0, -Math.sin(legAngle) * 0.3]}
            castShadow
          >
            <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
            <meshStandardMaterial
              color={appearance.bodyColor}
              roughness={0.8}
            />
          </mesh>
          {/* Hand */}
          <mesh position={[-Math.sin(legAngle) * 0.1, -0.45, 0]} castShadow>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={appearance.skinColor} roughness={0.9} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group position={[-0.12, 0.55, 0]}>
          <mesh
            position={[0, 0, Math.sin(legAngle) * 0.15]}
            rotation={[legAngle * 0.5, 0, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
            <meshStandardMaterial
              color={new THREE.Color(0x2f2f2f)} // Dark pants
              roughness={0.9}
            />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.35, Math.sin(legAngle) * 0.2]} castShadow>
            <boxGeometry args={[0.12, 0.15, 0.2]} />
            <meshStandardMaterial color={appearance.hatColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group position={[0.12, 0.55, 0]}>
          <mesh
            position={[0, 0, -Math.sin(legAngle) * 0.15]}
            rotation={[-legAngle * 0.5, 0, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
            <meshStandardMaterial
              color={new THREE.Color(0x2f2f2f)}
              roughness={0.9}
            />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.35, -Math.sin(legAngle) * 0.2]} castShadow>
            <boxGeometry args={[0.12, 0.15, 0.2]} />
            <meshStandardMaterial color={appearance.hatColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Belt */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
          <meshStandardMaterial color={new THREE.Color(0x4a3728)} roughness={0.6} />
        </mesh>

        {/* Belt Buckle */}
        <mesh position={[0, 0.85, 0.2]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.02]} />
          <meshStandardMaterial
            color={new THREE.Color(0xc0c0c0)}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Holster */}
        <mesh position={[0.25, 0.7, 0.05]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.08, 0.2, 0.1]} />
          <meshStandardMaterial
            color={appearance.bodyColor}
            roughness={0.7}
          />
        </mesh>

        {/* Revolver in holster */}
        <mesh position={[0.28, 0.65, 0.05]} rotation={[0, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial
            color={new THREE.Color(0x3f3f3f)}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      </group>

      {/* Shadow caster on ground */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.4, 16]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

export default PlayerMesh;
