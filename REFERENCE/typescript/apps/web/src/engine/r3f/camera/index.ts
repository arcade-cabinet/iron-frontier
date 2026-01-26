/**
 * R3F Camera System - Camera and player controls for React Three Fiber
 *
 * Provides:
 * - ThirdPersonCamera - Follow camera for overworld exploration
 * - CombatCamera - Fixed isometric camera for turn-based combat
 * - PlayerMesh - Simple player character representation
 * - usePlayerMovement - Hook for WASD movement with terrain following
 * - useKeyboardInput - Low-level keyboard input tracking
 */

// Third-person camera for overworld
export {
  ThirdPersonCamera,
  ThirdPersonCameraWithShake,
  useCameraShake,
  type ThirdPersonCameraConfig,
  type ThirdPersonCameraProps,
  type ThirdPersonCameraWithShakeProps,
  type ZoomLevel,
  type HeightProvider,
} from './ThirdPersonCamera';

// Combat camera for turn-based battles
export {
  CombatCamera,
  CombatCameraWithControls,
  COMBAT_CAMERA_PRESETS,
  type CombatCameraConfig,
  type CombatCameraProps,
  type CombatCameraWithControlsProps,
  type CombatantPosition,
  type UseCombatCameraReturn,
} from './CombatCamera';

// Player mesh component
export {
  PlayerMesh,
  PlayerWithMovement,
  GhostPlayerMesh,
  type PlayerMeshConfig,
  type PlayerMeshProps,
  type PlayerWithMovementProps,
  type GhostPlayerMeshProps,
  type PlayerAnimationState,
} from './PlayerMesh';

// Player movement hook
export {
  usePlayerMovement,
  type PlayerMovementConfig,
  type PlayerMovementState,
  type UsePlayerMovementOptions,
  type UsePlayerMovementReturn,
  type HeightProvider as MovementHeightProvider,
} from './usePlayerMovement';

// Keyboard input hook
export {
  useKeyboardInput,
  type KeyBindings,
  type KeyboardInputState,
  type UseKeyboardInputOptions,
  type MovementVector,
  type InputContext,
} from './useKeyboardInput';
