/**
 * input/types.ts - Input system types for Iron Frontier v2
 *
 * Platform-agnostic input types for WASD/joystick movement,
 * interactions, and menu controls.
 */

/**
 * Normalized movement vector (values from -1 to 1)
 */
export interface MovementVector {
  x: number; // -1 (left) to 1 (right)
  z: number; // -1 (forward) to 1 (backward)
}

/**
 * Input action types that can be triggered
 */
export type InputAction =
  | 'interact' // Space/A button - talk to NPC, pick up item
  | 'cancel' // Escape/B button - close menu, cancel action
  | 'menu' // Tab/Start - open pause menu
  | 'inventory' // I/Select - open inventory
  | 'map' // M - open map
  | 'sprint' // Shift - run faster (consumes stamina)
  | 'confirm' // Enter/A - confirm selection in menus
  | 'camp' // C - make camp (when in overworld)
  | 'quickSave' // F5 - quick save
  | 'quickLoad'; // F9 - quick load

/**
 * Input event types
 */
export type InputEventType = 'press' | 'release' | 'hold';

/**
 * Input event payload
 */
export interface InputEvent {
  action: InputAction;
  type: InputEventType;
  timestamp: number;
}

/**
 * Input state snapshot
 */
export interface InputState {
  /** Current movement vector */
  movement: MovementVector;
  /** Currently held actions */
  heldActions: Set<InputAction>;
  /** Is player sprinting */
  isSprinting: boolean;
  /** Touch/pointer position for interactions (screen coords) */
  pointerPosition: { x: number; y: number } | null;
  /** Is pointer down */
  isPointerDown: boolean;
}

/**
 * Input listener callback
 */
export type InputListener = (event: InputEvent) => void;

/**
 * Movement listener callback - called every frame with current movement
 */
export type MovementListener = (movement: MovementVector) => void;

/**
 * Input provider interface - implemented by platform-specific code
 */
export interface InputProvider {
  /** Get current input state */
  getState(): InputState;

  /** Subscribe to input events */
  onAction(listener: InputListener): () => void;

  /** Subscribe to movement updates */
  onMovement(listener: MovementListener): () => void;

  /** Enable/disable input processing */
  setEnabled(enabled: boolean): void;

  /** Check if input is enabled */
  isEnabled(): boolean;

  /** Cleanup resources */
  dispose(): void;
}

/**
 * Key mapping configuration
 */
export interface KeyMapping {
  moveUp: string[];
  moveDown: string[];
  moveLeft: string[];
  moveRight: string[];
  interact: string[];
  cancel: string[];
  menu: string[];
  inventory: string[];
  map: string[];
  sprint: string[];
  confirm: string[];
  camp: string[];
  quickSave: string[];
  quickLoad: string[];
}

/**
 * Default key mappings for keyboard
 */
export const DEFAULT_KEY_MAPPING: KeyMapping = {
  moveUp: ['w', 'W', 'ArrowUp'],
  moveDown: ['s', 'S', 'ArrowDown'],
  moveLeft: ['a', 'A', 'ArrowLeft'],
  moveRight: ['d', 'D', 'ArrowRight'],
  interact: [' ', 'e', 'E'],
  cancel: ['Escape', 'Backspace'],
  menu: ['Tab'],
  inventory: ['i', 'I'],
  map: ['m', 'M'],
  sprint: ['Shift'],
  confirm: ['Enter'],
  camp: ['c', 'C'],
  quickSave: ['F5'],
  quickLoad: ['F9'],
};

/**
 * Gamepad button mapping
 */
export interface GamepadMapping {
  interact: number; // A button (0)
  cancel: number; // B button (1)
  menu: number; // Start (9)
  inventory: number; // Select (8)
  sprint: number; // Left trigger or bumper (6)
  confirm: number; // A button (0)
}

/**
 * Default gamepad mappings (Xbox-style layout)
 */
export const DEFAULT_GAMEPAD_MAPPING: GamepadMapping = {
  interact: 0, // A
  cancel: 1, // B
  menu: 9, // Start
  inventory: 8, // Select
  sprint: 6, // Left bumper
  confirm: 0, // A
};
