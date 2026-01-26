/**
 * CombatCamera.tsx - Combat scene camera controller
 *
 * Features:
 * - Overview of battle arena
 * - Can zoom to active combatant
 * - Shake effect on hits
 * - Smooth transitions between targets
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import {
  type CombatCameraProps,
  type CameraMode,
  type CameraShake,
  type Position3D,
} from './types';

// ============================================================================
// CAMERA CONSTANTS
// ============================================================================

const CAMERA_POSITIONS: Record<CameraMode, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  overview: {
    position: new THREE.Vector3(0, 12, 15),
    target: new THREE.Vector3(0, 1, 0),
  },
  focus_attacker: {
    position: new THREE.Vector3(-3, 6, 10),
    target: new THREE.Vector3(-3, 1, 0),
  },
  focus_target: {
    position: new THREE.Vector3(3, 6, 10),
    target: new THREE.Vector3(3, 1, 0),
  },
  victory: {
    position: new THREE.Vector3(-8, 4, 8),
    target: new THREE.Vector3(-3, 1, 0),
  },
  defeat: {
    position: new THREE.Vector3(8, 4, 8),
    target: new THREE.Vector3(3, 1, 0),
  },
};

const CAMERA_LERP_SPEED = 2.5;
const SHAKE_DECAY = 5.0;

// ============================================================================
// SHAKE OFFSET CALCULATOR
// ============================================================================

function calculateShakeOffset(shake: CameraShake | undefined, elapsed: number): THREE.Vector3 {
  if (!shake) return new THREE.Vector3(0, 0, 0);

  const timeSinceStart = elapsed - shake.startedAt;
  const duration = shake.duration / 1000;

  if (timeSinceStart > duration) return new THREE.Vector3(0, 0, 0);

  // Decay the intensity over time
  const progress = timeSinceStart / duration;
  const currentIntensity = shake.intensity * (1 - progress);

  // Generate pseudo-random shake using time
  const shakeX = Math.sin(timeSinceStart * 50) * currentIntensity;
  const shakeY = Math.cos(timeSinceStart * 47) * currentIntensity * 0.5;
  const shakeZ = Math.sin(timeSinceStart * 53) * currentIntensity * 0.3;

  return new THREE.Vector3(shakeX, shakeY, shakeZ);
}

// ============================================================================
// COMBAT CAMERA CONTROLLER HOOK
// ============================================================================

interface UseCombatCameraOptions {
  mode: CameraMode;
  focusPosition?: Position3D;
  shake?: CameraShake;
}

function useCombatCamera({ mode, focusPosition, shake }: UseCombatCameraOptions) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3(0, 12, 15));
  const currentLookAt = useRef(new THREE.Vector3(0, 1, 0));
  const shakeStartTime = useRef(0);

  // Track shake start time
  useEffect(() => {
    if (shake) {
      shakeStartTime.current = performance.now() / 1000;
    }
  }, [shake?.startedAt]);

  // Calculate target position based on mode
  useEffect(() => {
    const baseConfig = CAMERA_POSITIONS[mode];

    if (focusPosition && (mode === 'focus_attacker' || mode === 'focus_target')) {
      // Adjust camera to focus on specific position
      const focusVec = new THREE.Vector3(focusPosition.x, focusPosition.y, focusPosition.z);
      const offset = baseConfig.position.clone().sub(baseConfig.target);

      targetPosition.current.copy(focusVec).add(offset);
      targetLookAt.current.copy(focusVec).add(new THREE.Vector3(0, 1, 0));
    } else {
      targetPosition.current.copy(baseConfig.position);
      targetLookAt.current.copy(baseConfig.target);
    }
  }, [mode, focusPosition]);

  // Animate camera
  useFrame(({ clock }, delta) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    const elapsed = clock.getElapsedTime();

    // Smoothly interpolate position
    currentPosition.current.lerp(targetPosition.current, delta * CAMERA_LERP_SPEED);
    currentLookAt.current.lerp(targetLookAt.current, delta * CAMERA_LERP_SPEED);

    // Apply shake offset
    const shakeOffset = calculateShakeOffset(shake, elapsed);
    const finalPosition = currentPosition.current.clone().add(shakeOffset);

    camera.position.copy(finalPosition);
    camera.lookAt(currentLookAt.current);
  });

  return { cameraRef };
}

// ============================================================================
// MAIN COMBAT CAMERA COMPONENT
// ============================================================================

export function CombatCamera({ mode, focusPosition, shake }: CombatCameraProps) {
  const { cameraRef } = useCombatCamera({ mode, focusPosition, shake });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={50}
        near={0.1}
        far={100}
        position={[0, 12, 15]}
      />
      {/* Optionally enable orbit controls for debugging */}
      {/* <OrbitControls target={[0, 1, 0]} /> */}
    </>
  );
}

// ============================================================================
// COMBAT CAMERA WITH ORBIT CONTROLS (DEBUG MODE)
// ============================================================================

export function CombatCameraDebug() {
  return (
    <>
      <PerspectiveCamera makeDefault fov={50} near={0.1} far={100} position={[0, 12, 15]} />
      <OrbitControls target={[0, 1, 0]} />
    </>
  );
}

// ============================================================================
// CAMERA SHAKE HOOK (for external use)
// ============================================================================

export function useCameraShake() {
  const [shake, setShake] = useState<CameraShake | undefined>();

  const triggerShake = (intensity: number, duration: number) => {
    setShake({
      intensity,
      duration,
      startedAt: performance.now() / 1000,
    });

    // Clear shake after duration
    setTimeout(() => setShake(undefined), duration);
  };

  return { shake, triggerShake };
}

export default CombatCamera;
