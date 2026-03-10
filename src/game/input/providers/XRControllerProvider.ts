/**
 * XRControllerProvider — VR controller input mapped to InputFrame.
 *
 * Implements IInputProvider and polls XR controller state each frame
 * via the @react-three/xr store. This is a polling-based provider
 * (not a React component with hooks) so it integrates with the
 * existing InputManager architecture.
 *
 * Controller mapping (standard Quest/Pico/WMR layout):
 *   Left thumbstick      -> move.x / move.z (0.15 deadzone)
 *   Right thumbstick X   -> snap turn (45 deg, 200ms cooldown)
 *   Right trigger (>0.5) -> fire
 *   Right squeeze (>0.5) -> interact
 *   A button             -> jump
 *   B button             -> reload
 *
 * CRITICAL: Sets aimOrigin and aimDirection from the right controller
 * pose. This makes projectiles originate from the player's hand in VR
 * rather than from the camera/face.
 *
 * Registers XR controllers with HapticsService for haptic pulse output.
 *
 * Registered as priority 0 (highest) — XR input always takes precedence
 * when an XR session is active.
 */

import * as THREE from 'three';

import type { IInputProvider } from '../IInputProvider';
import type { InputFrame } from '../InputFrame';
import { haptics } from '@/src/game/xr/HapticsService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STICK_DEADZONE = 0.15;
const SNAP_TURN_DEGREES = 45;
const SNAP_TURN_RADIANS = (SNAP_TURN_DEGREES * Math.PI) / 180;
const SNAP_TURN_COOLDOWN_MS = 200;

// ---------------------------------------------------------------------------
// XR Store type (minimal interface to avoid hard dep on @react-three/xr types)
// ---------------------------------------------------------------------------

interface XRInputSourceState {
  type: string;
  inputSource: {
    handedness: string;
    gamepad?: Gamepad | null;
  };
  object?: THREE.Object3D | null;
}

interface XRStoreState {
  session: unknown | null;
  inputSourceStates: XRInputSourceState[];
}

interface XRStoreLike {
  getState(): XRStoreState;
}

// ---------------------------------------------------------------------------
// XRControllerProvider
// ---------------------------------------------------------------------------

export class XRControllerProvider implements IInputProvider {
  readonly name = 'xr-controller';
  readonly priority = 0; // Highest priority — overrides keyboard/gamepad when XR is active

  private store: XRStoreLike;
  private isActive = false;

  // Snap turn state
  private lastSnapTurnTime = 0;
  private snapTurnConsumed = false; // prevents repeat while stick is held

  // Rising-edge tracking for buttons
  private prevJump = false;
  private prevReload = false;

  // Track registered haptic controllers to avoid re-registering
  private registeredInputSources = new WeakSet<object>();

  constructor(store: XRStoreLike) {
    this.store = store;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Apply deadzone and rescale so output ramps from 0 at deadzone edge to 1 at full tilt. */
  private applyDeadzone(raw: number): number {
    const sign = Math.sign(raw);
    const abs = Math.abs(raw);
    if (abs < STICK_DEADZONE) return 0;
    return sign * ((abs - STICK_DEADZONE) / (1 - STICK_DEADZONE));
  }

  /**
   * Find a controller by handedness from the XR store's inputSourceStates.
   */
  private getController(handedness: 'left' | 'right'): {
    gamepad: Gamepad | null;
    object: THREE.Object3D | null;
    inputSource: XRInputSourceState['inputSource'] | null;
  } {
    const state = this.store.getState();
    const inputStates = state.inputSourceStates;

    for (const inputState of inputStates) {
      if (inputState.type !== 'controller') continue;
      if (inputState.inputSource.handedness !== handedness) continue;

      const gamepad = inputState.inputSource.gamepad ?? null;

      // Register the controller with haptics service if not already done
      if (!this.registeredInputSources.has(inputState.inputSource)) {
        this.registeredInputSources.add(inputState.inputSource);
        if (gamepad) {
          haptics.registerXRController({
            gamepad: gamepad as unknown as {
              hapticActuators?: Array<{
                pulse(intensity: number, duration: number): Promise<void>;
              }>;
            },
          });
        }
      }

      return {
        gamepad,
        object: inputState.object ?? null,
        inputSource: inputState.inputSource,
      };
    }

    return { gamepad: null, object: null, inputSource: null };
  }

  // -------------------------------------------------------------------------
  // IInputProvider implementation
  // -------------------------------------------------------------------------

  poll(): Partial<InputFrame> {
    const state = this.store.getState();

    // No-op when no XR session is active
    if (!state.session) {
      this.isActive = false;
      return {};
    }
    this.isActive = true;

    const left = this.getController('left');
    const right = this.getController('right');

    const result: Partial<InputFrame> = {};

    // --- Left controller: movement ---
    if (left.gamepad) {
      const axes = left.gamepad.axes;
      // Standard mapping: axes[2] = thumbstick X, axes[3] = thumbstick Y
      // Some controllers use axes[0]/axes[1] if there are only 2 axes
      const thumbX = axes.length >= 4 ? axes[2] : (axes[0] ?? 0);
      const thumbY = axes.length >= 4 ? axes[3] : (axes[1] ?? 0);

      const moveX = this.applyDeadzone(thumbX);
      // Negate Y: thumbstick up (negative Y) = move forward (positive moveZ)
      const moveZ = -this.applyDeadzone(thumbY);

      result.move = { x: moveX, z: moveZ };
    }

    // --- Right controller: snap turn + fire + interact ---
    if (right.gamepad) {
      const axes = right.gamepad.axes;
      const thumbX = axes.length >= 4 ? axes[2] : (axes[0] ?? 0);

      // Snap turn with cooldown
      const now = performance.now();
      const deadzonedX = this.applyDeadzone(thumbX);

      if (Math.abs(deadzonedX) > 0.5 && !this.snapTurnConsumed) {
        if (now - this.lastSnapTurnTime > SNAP_TURN_COOLDOWN_MS) {
          // Apply snap turn as a look delta
          result.look = {
            yaw: Math.sign(deadzonedX) * SNAP_TURN_RADIANS,
            pitch: 0,
          };
          this.lastSnapTurnTime = now;
          this.snapTurnConsumed = true;
        }
      }

      // Reset snap turn consumed when stick returns to center
      if (Math.abs(deadzonedX) < 0.3) {
        this.snapTurnConsumed = false;
      }

      // Right trigger -> fire (button index 0 = trigger)
      const rightTriggerValue = right.gamepad.buttons[0]?.value ?? 0;
      result.fire = rightTriggerValue > 0.5;

      // Right squeeze -> interact (button index 1 = squeeze/grip)
      const rightSqueezeValue = right.gamepad.buttons[1]?.value ?? 0;
      result.interact = rightSqueezeValue > 0.5;

      // A button -> jump (button index 4 on standard XR gamepad)
      const jumpPressed = right.gamepad.buttons[4]?.pressed ?? false;
      if (jumpPressed && !this.prevJump) {
        result.jump = true;
      }
      this.prevJump = jumpPressed;

      // B button -> reload (button index 5 on standard XR gamepad)
      const reloadPressed = right.gamepad.buttons[5]?.pressed ?? false;
      if (reloadPressed && !this.prevReload) {
        result.reload = true;
      }
      this.prevReload = reloadPressed;
    }

    // --- CRITICAL: Aim origin and direction from right controller ---
    // This makes VR shooting work by projecting from the hand controller
    // rather than from the camera/face.
    if (right.object) {
      // Get world position of the right controller
      const worldPos = right.object.getWorldPosition(_tempVec3A);
      result.aimOrigin = { x: worldPos.x, y: worldPos.y, z: worldPos.z };

      // Get forward direction of the right controller (local -Z in Three.js)
      _tempVec3B.set(0, 0, -1);
      _tempVec3B.applyQuaternion(
        right.object.getWorldQuaternion(_tempQuat),
      );
      result.aimDirection = {
        x: _tempVec3B.x,
        y: _tempVec3B.y,
        z: _tempVec3B.z,
      };
    }

    return result;
  }

  enable(): void {
    // Polling-based — no event listeners to register
    this.isActive = true;
  }

  disable(): void {
    this.isActive = false;
  }

  dispose(): void {
    this.isActive = false;
    // Clear tracking — haptics service manages its own controller list
    this.registeredInputSources = new WeakSet<object>();
  }
}

// ---------------------------------------------------------------------------
// Temp objects to avoid per-frame allocations
// ---------------------------------------------------------------------------

const _tempVec3A = new THREE.Vector3();
const _tempVec3B = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
