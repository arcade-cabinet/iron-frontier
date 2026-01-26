/**
 * CombatCamera.tsx - Fixed camera for turn-based combat in R3F
 *
 * Features:
 * - Isometric-ish view of combat arena
 * - Focus on active combatant with smooth transitions
 * - Can pan between different targets
 * - Shake effects for impacts
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Combat camera configuration
 */
export interface CombatCameraConfig {
  /** Distance from arena center (default 20) */
  distance: number;
  /** Height above arena (default 15) */
  height: number;
  /** Angle of view in degrees (default 45) */
  angle: number;
  /** Smoothing for target transitions (0-1, default 0.08) */
  transitionSmoothing: number;
  /** Focus offset when targeting combatant (default 2 units toward camera) */
  focusOffset: number;
  /** Field of view (default 50) */
  fov: number;
}

const DEFAULT_COMBAT_CONFIG: CombatCameraConfig = {
  distance: 20,
  height: 15,
  angle: 45,
  transitionSmoothing: 0.08,
  focusOffset: 2,
  fov: 50,
};

/**
 * Combatant position for camera targeting
 */
export interface CombatantPosition {
  id: string;
  position: THREE.Vector3;
  isPlayer?: boolean;
}

export interface CombatCameraProps {
  /** Center of the combat arena */
  arenaCenter?: THREE.Vector3;
  /** List of combatant positions */
  combatants?: CombatantPosition[];
  /** ID of currently active/focused combatant */
  activeCombatantId?: string | null;
  /** Camera configuration */
  config?: Partial<CombatCameraConfig>;
  /** Whether camera is enabled */
  enabled?: boolean;
  /** Callback when camera completes transition */
  onTransitionComplete?: () => void;
}

/**
 * Fixed isometric-style camera for turn-based combat
 *
 * @example
 * ```tsx
 * function CombatScene() {
 *   const combatants = [
 *     { id: 'player', position: new THREE.Vector3(-5, 0, 0), isPlayer: true },
 *     { id: 'enemy1', position: new THREE.Vector3(5, 0, 0) },
 *   ];
 *
 *   return (
 *     <>
 *       <CombatCamera
 *         arenaCenter={new THREE.Vector3(0, 0, 0)}
 *         combatants={combatants}
 *         activeCombatantId="player"
 *       />
 *       {combatants.map(c => <Combatant key={c.id} {...c} />)}
 *     </>
 *   );
 * }
 * ```
 */
export function CombatCamera({
  arenaCenter = new THREE.Vector3(0, 0, 0),
  combatants = [],
  activeCombatantId = null,
  config: customConfig,
  enabled = true,
  onTransitionComplete,
}: CombatCameraProps) {
  const { camera } = useThree();
  const config: CombatCameraConfig = { ...DEFAULT_COMBAT_CONFIG, ...customConfig };

  // Current camera state
  const currentLookAtRef = useRef(arenaCenter.clone());
  const targetLookAtRef = useRef(arenaCenter.clone());
  const isTransitioningRef = useRef(false);
  const transitionCompleteThreshold = 0.01;

  // Calculate fixed camera position based on config
  const getCameraPosition = useCallback((): THREE.Vector3 => {
    const angleRad = (config.angle * Math.PI) / 180;
    const x = arenaCenter.x + Math.sin(angleRad) * config.distance;
    const z = arenaCenter.z + Math.cos(angleRad) * config.distance;
    return new THREE.Vector3(x, config.height, z);
  }, [arenaCenter, config]);

  // Initialize camera
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = config.fov;
      camera.updateProjectionMatrix();

      const position = getCameraPosition();
      camera.position.copy(position);
      camera.lookAt(arenaCenter);
      currentLookAtRef.current.copy(arenaCenter);
    }
  }, [camera, config, getCameraPosition, arenaCenter]);

  // Update target when active combatant changes
  useEffect(() => {
    if (activeCombatantId) {
      const combatant = combatants.find((c) => c.id === activeCombatantId);
      if (combatant) {
        // Focus on combatant with slight offset
        const target = combatant.position.clone();
        // Offset slightly toward arena center for better framing
        const toCenter = arenaCenter.clone().sub(target).normalize();
        target.add(toCenter.multiplyScalar(config.focusOffset));
        targetLookAtRef.current.copy(target);
        isTransitioningRef.current = true;
      }
    } else {
      // Focus on arena center when no active combatant
      targetLookAtRef.current.copy(arenaCenter);
      isTransitioningRef.current = true;
    }
  }, [activeCombatantId, combatants, arenaCenter, config.focusOffset]);

  // Update camera each frame
  useFrame((_, delta) => {
    if (!enabled) return;

    const dt = Math.min(delta, 0.1);

    // Fixed camera position
    const cameraPos = getCameraPosition();
    camera.position.copy(cameraPos);

    // Smooth transition to target look-at
    const lerpFactor = 1 - Math.pow(1 - config.transitionSmoothing, dt * 60);
    currentLookAtRef.current.lerp(targetLookAtRef.current, lerpFactor);

    camera.lookAt(currentLookAtRef.current);

    // Check if transition is complete
    if (isTransitioningRef.current) {
      const distance = currentLookAtRef.current.distanceTo(targetLookAtRef.current);
      if (distance < transitionCompleteThreshold) {
        isTransitioningRef.current = false;
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }
    }
  });

  return null;
}

/**
 * Hook for combat camera controls
 */
export interface UseCombatCameraReturn {
  /** Focus on a specific combatant */
  focusOn: (combatantId: string) => void;
  /** Focus on arena center */
  focusCenter: () => void;
  /** Shake camera (for impact effects) */
  shake: (intensity: number, duration: number) => void;
  /** Pan to show all combatants */
  showAll: () => void;
}

/**
 * Combat camera shake state
 */
interface CombatShakeState {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
}

export interface CombatCameraWithControlsProps extends CombatCameraProps {
  /** Callback to receive control functions */
  onControlsReady?: (controls: UseCombatCameraReturn) => void;
}

/**
 * Combat camera with external control interface
 */
export function CombatCameraWithControls({
  onControlsReady,
  ...props
}: CombatCameraWithControlsProps) {
  const { camera } = useThree();
  const shakeRef = useRef<CombatShakeState>({
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
  });
  const focusIdRef = useRef<string | null>(props.activeCombatantId ?? null);

  // Control functions
  const focusOn = useCallback((combatantId: string) => {
    focusIdRef.current = combatantId;
  }, []);

  const focusCenter = useCallback(() => {
    focusIdRef.current = null;
  }, []);

  const shake = useCallback((intensity: number, duration: number) => {
    shakeRef.current = {
      active: true,
      intensity,
      duration,
      elapsed: 0,
    };
  }, []);

  const showAll = useCallback(() => {
    focusIdRef.current = null;
  }, []);

  // Provide controls to parent
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        focusOn,
        focusCenter,
        shake,
        showAll,
      });
    }
  }, [onControlsReady, focusOn, focusCenter, shake, showAll]);

  // Apply shake effect
  useFrame((_, delta) => {
    if (!shakeRef.current.active) return;

    const s = shakeRef.current;
    s.elapsed += delta;

    if (s.elapsed >= s.duration) {
      s.active = false;
      return;
    }

    const progress = s.elapsed / s.duration;
    const falloff = 1 - progress;
    const currentIntensity = s.intensity * falloff;

    const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

    camera.position.x += offsetX;
    camera.position.y += offsetY;
  });

  return <CombatCamera {...props} activeCombatantId={focusIdRef.current} />;
}

/**
 * Preset camera positions for different combat phases
 */
export const COMBAT_CAMERA_PRESETS = {
  /** Standard overview of battle */
  overview: {
    distance: 20,
    height: 15,
    angle: 45,
  },
  /** Close-up for player turn */
  playerTurn: {
    distance: 12,
    height: 8,
    angle: 30,
  },
  /** Close-up for enemy turn */
  enemyTurn: {
    distance: 15,
    height: 10,
    angle: 60,
  },
  /** Dramatic angle for special moves */
  dramatic: {
    distance: 8,
    height: 5,
    angle: 20,
  },
} as const;

export default CombatCamera;
