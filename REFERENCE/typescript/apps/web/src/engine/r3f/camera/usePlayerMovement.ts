/**
 * usePlayerMovement.ts - Hook for WASD player movement in R3F
 *
 * Handles:
 * - Keyboard input translation to movement
 * - Sprint with Shift key
 * - Terrain height following
 * - Velocity-based movement with acceleration/deceleration
 * - Stamina management
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import * as THREE from 'three';

import { useKeyboardInput, type InputContext, type MovementVector } from './useKeyboardInput';

/**
 * Movement configuration
 */
export interface PlayerMovementConfig {
  /** Base movement speed (units per second) - default 5 */
  baseSpeed: number;
  /** Sprint speed (units per second) - default 8 */
  sprintSpeed: number;
  /** Acceleration rate - default 20 */
  acceleration: number;
  /** Deceleration rate when no input - default 15 */
  deceleration: number;
  /** Maximum stamina for sprinting - default 100 */
  maxStamina: number;
  /** Stamina drain rate while sprinting (per second) - default 20 */
  staminaDrain: number;
  /** Stamina recovery rate while not sprinting (per second) - default 15 */
  staminaRecovery: number;
  /** Minimum stamina to start sprinting - default 20 */
  minStaminaToSprint: number;
}

const DEFAULT_MOVEMENT_CONFIG: PlayerMovementConfig = {
  baseSpeed: 5.0,
  sprintSpeed: 8.0,
  acceleration: 20.0,
  deceleration: 15.0,
  maxStamina: 100,
  staminaDrain: 20,
  staminaRecovery: 15,
  minStaminaToSprint: 20,
};

/**
 * Player movement state
 */
export interface PlayerMovementState {
  /** Current world position */
  position: THREE.Vector3;
  /** Current velocity */
  velocity: THREE.Vector2;
  /** Facing direction in radians */
  rotation: number;
  /** Is currently moving */
  isMoving: boolean;
  /** Is currently sprinting */
  isSprinting: boolean;
  /** Current stamina (0-100) */
  stamina: number;
  /** Stamina as percentage (0-1) */
  staminaPercent: number;
}

/**
 * Height provider function - returns terrain height at world position
 */
export type HeightProvider = (x: number, z: number) => number;

export interface UsePlayerMovementOptions {
  /** Initial player position */
  initialPosition?: THREE.Vector3;
  /** Movement configuration */
  config?: Partial<PlayerMovementConfig>;
  /** Input context for keyboard handling */
  context?: InputContext;
  /** Whether movement is enabled */
  enabled?: boolean;
  /** Height provider function for terrain following */
  getHeightAt?: HeightProvider;
  /** Callback when position changes */
  onPositionChange?: (position: THREE.Vector3, rotation: number) => void;
  /** Callback when movement state changes */
  onMovementStateChange?: (isMoving: boolean, isSprinting: boolean) => void;
}

/**
 * Return value from usePlayerMovement hook
 */
export interface UsePlayerMovementReturn {
  /** Current movement state */
  state: PlayerMovementState;
  /** Reference to position vector (for direct manipulation) */
  positionRef: React.MutableRefObject<THREE.Vector3>;
  /** Reference to velocity vector */
  velocityRef: React.MutableRefObject<THREE.Vector2>;
  /** Teleport player to position */
  teleport: (position: THREE.Vector3) => void;
  /** Reset stamina to full */
  restoreStamina: (amount?: number) => void;
  /** Get current facing direction as cardinal */
  getFacingDirection: () => 'north' | 'south' | 'east' | 'west';
}

/**
 * Hook for WASD player movement with terrain following
 *
 * @example
 * ```tsx
 * function Player() {
 *   const { state, positionRef } = usePlayerMovement({
 *     getHeightAt: (x, z) => terrainGenerator.getHeightAt(x, z),
 *     onPositionChange: (pos) => gameStore.setPlayerPosition(pos),
 *   });
 *
 *   return (
 *     <mesh position={positionRef.current}>
 *       <capsuleGeometry args={[0.5, 1, 4, 8]} />
 *       <meshStandardMaterial color="blue" />
 *     </mesh>
 *   );
 * }
 * ```
 */
export function usePlayerMovement(
  options: UsePlayerMovementOptions = {}
): UsePlayerMovementReturn {
  const {
    initialPosition = new THREE.Vector3(0, 0, 0),
    config: customConfig,
    context = 'overworld',
    enabled = true,
    getHeightAt = () => 0,
    onPositionChange,
    onMovementStateChange,
  } = options;

  const config = { ...DEFAULT_MOVEMENT_CONFIG, ...customConfig };

  // Position and velocity refs for direct manipulation
  const positionRef = useRef(initialPosition.clone());
  const velocityRef = useRef(new THREE.Vector2(0, 0));
  const rotationRef = useRef(0);
  const staminaRef = useRef(config.maxStamina);
  const isMovingRef = useRef(false);
  const isSprintingRef = useRef(false);

  // Get keyboard input
  const { movement, isSprinting: wantsSprint } = useKeyboardInput({
    context,
    enabled,
  });

  // Teleport function
  const teleport = useCallback((position: THREE.Vector3) => {
    positionRef.current.copy(position);
    velocityRef.current.set(0, 0);
    isMovingRef.current = false;
    isSprintingRef.current = false;
  }, []);

  // Restore stamina
  const restoreStamina = useCallback(
    (amount?: number) => {
      if (amount !== undefined) {
        staminaRef.current = Math.min(config.maxStamina, staminaRef.current + amount);
      } else {
        staminaRef.current = config.maxStamina;
      }
    },
    [config.maxStamina]
  );

  // Get facing direction as cardinal
  const getFacingDirection = useCallback((): 'north' | 'south' | 'east' | 'west' => {
    const rotation = rotationRef.current;
    // Normalize to 0-2PI
    const normalizedRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Cardinal directions based on rotation
    // 0 = south, PI/2 = west, PI = north, 3PI/2 = east
    if (normalizedRotation < Math.PI / 4 || normalizedRotation >= (7 * Math.PI) / 4) {
      return 'south';
    } else if (normalizedRotation < (3 * Math.PI) / 4) {
      return 'west';
    } else if (normalizedRotation < (5 * Math.PI) / 4) {
      return 'north';
    } else {
      return 'east';
    }
  }, []);

  // Linear interpolation helper
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * Math.min(1, t);

  // Approach target value by step amount
  const approach = (current: number, target: number, step: number): number => {
    if (current < target) {
      return Math.min(current + step, target);
    } else {
      return Math.max(current - step, target);
    }
  };

  // Update movement each frame
  useFrame((_, delta) => {
    if (!enabled) return;

    // Clamp delta to prevent huge jumps
    const dt = Math.min(delta, 0.1);

    const velocity = velocityRef.current;
    const position = positionRef.current;

    // --- Update stamina ---
    const hasInput = Math.abs(movement.x) > 0.01 || Math.abs(movement.z) > 0.01;
    const canSprint = staminaRef.current >= config.minStaminaToSprint;
    const shouldSprint = wantsSprint && canSprint && hasInput;

    if (shouldSprint) {
      isSprintingRef.current = true;
      staminaRef.current = Math.max(0, staminaRef.current - config.staminaDrain * dt);
    } else {
      isSprintingRef.current = false;
      staminaRef.current = Math.min(
        config.maxStamina,
        staminaRef.current + config.staminaRecovery * dt
      );
    }

    // --- Update velocity ---
    if (hasInput) {
      const targetSpeed = isSprintingRef.current ? config.sprintSpeed : config.baseSpeed;

      const targetVelocity = {
        x: movement.x * targetSpeed,
        z: movement.z * targetSpeed,
      };

      const accel = config.acceleration * dt;
      velocity.x = lerp(velocity.x, targetVelocity.x, accel);
      velocity.y = lerp(velocity.y, targetVelocity.z, accel);
    } else {
      // Decelerate to stop
      const decel = config.deceleration * dt;
      velocity.x = approach(velocity.x, 0, decel);
      velocity.y = approach(velocity.y, 0, decel);
    }

    // Calculate speed for moving state
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const wasMoving = isMovingRef.current;
    isMovingRef.current = speed > 0.1;

    // --- Update position ---
    if (isMovingRef.current) {
      const newX = position.x + velocity.x * dt;
      const newZ = position.z + velocity.y * dt;

      // Get terrain height at new position
      const newY = getHeightAt(newX, newZ);

      position.set(newX, newY, newZ);

      // Update rotation based on velocity
      if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
        rotationRef.current = Math.atan2(velocity.x, velocity.y);
      }

      // Notify position change
      if (onPositionChange) {
        onPositionChange(position, rotationRef.current);
      }
    }

    // Notify movement state change
    if (wasMoving !== isMovingRef.current && onMovementStateChange) {
      onMovementStateChange(isMovingRef.current, isSprintingRef.current);
    }
  });

  // Build current state
  const state: PlayerMovementState = {
    position: positionRef.current,
    velocity: velocityRef.current,
    rotation: rotationRef.current,
    isMoving: isMovingRef.current,
    isSprinting: isSprintingRef.current,
    stamina: staminaRef.current,
    staminaPercent: staminaRef.current / config.maxStamina,
  };

  return {
    state,
    positionRef,
    velocityRef,
    teleport,
    restoreStamina,
    getFacingDirection,
  };
}

export default usePlayerMovement;
