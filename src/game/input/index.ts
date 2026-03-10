// input — Universal FPS Input System barrel export

export { type InputFrame, createEmptyFrame } from './InputFrame';
export { InputAction } from './InputActions';
export { type IInputProvider } from './IInputProvider';
export { InputManager } from './InputManager';
export {
  KeyboardMouseProvider,
  type KeyboardMouseConfig,
} from './providers/KeyboardMouseProvider';
export {
  TouchProvider,
  type TouchConfig,
} from './providers/TouchProvider';
export { XRControllerProvider } from './providers/XRControllerProvider';
export {
  initializeInput,
  teardownInput,
  detectPlatform,
  hasTouchCapability,
  isNativeMobile,
  type Platform,
} from './InputInitializer';
