/**
 * Input Module - Platform-agnostic input handling
 *
 * Provides unified input API for keyboard, touch, and gamepad.
 */

// Core manager
export { InputManager, getInputManager, type InputContext } from './InputManager';

// Providers
export { KeyboardInputProvider } from './KeyboardInputProvider';
export { VirtualJoystickProvider, type VirtualJoystickConfig } from './VirtualJoystickProvider';

// Types
export type {
  InputAction,
  InputEvent,
  InputEventType,
  InputListener,
  InputProvider,
  InputState,
  KeyMapping,
  GamepadMapping,
  MovementListener,
  MovementVector,
} from './types';

export { DEFAULT_KEY_MAPPING, DEFAULT_GAMEPAD_MAPPING } from './types';
