/**
 * useKeyboardInput.ts - Low-level keyboard input hook for R3F
 *
 * Tracks pressed keys and provides:
 * - Movement vector (normalized WASD)
 * - Sprint state (Shift key)
 * - Key state queries
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Normalized movement vector with values from -1 to 1
 */
export interface MovementVector {
  x: number; // -1 (left) to 1 (right)
  z: number; // -1 (forward/up) to 1 (backward/down)
}

/**
 * Input context determines which keys are active
 */
export type InputContext = 'overworld' | 'combat' | 'menu' | 'dialogue';

/**
 * Key bindings configuration
 */
export interface KeyBindings {
  moveForward: string[];
  moveBackward: string[];
  moveLeft: string[];
  moveRight: string[];
  sprint: string[];
  interact: string[];
  cancel: string[];
}

const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveForward: ['w', 'W', 'ArrowUp'],
  moveBackward: ['s', 'S', 'ArrowDown'],
  moveLeft: ['a', 'A', 'ArrowLeft'],
  moveRight: ['d', 'D', 'ArrowRight'],
  sprint: ['Shift'],
  interact: [' ', 'e', 'E'],
  cancel: ['Escape'],
};

/**
 * Keyboard input state
 */
export interface KeyboardInputState {
  /** Current movement vector (normalized) */
  movement: MovementVector;
  /** Is sprint key held */
  isSprinting: boolean;
  /** Set of currently pressed keys */
  pressedKeys: Set<string>;
  /** Check if a specific action key is pressed */
  isKeyPressed: (key: string) => boolean;
  /** Check if interact key is pressed */
  isInteractPressed: boolean;
  /** Check if cancel key is pressed */
  isCancelPressed: boolean;
}

export interface UseKeyboardInputOptions {
  /** Key bindings configuration */
  bindings?: Partial<KeyBindings>;
  /** Input context - controls which keys are active */
  context?: InputContext;
  /** Whether input is enabled */
  enabled?: boolean;
}

/**
 * Hook for tracking keyboard input with WASD movement
 *
 * @example
 * ```tsx
 * function PlayerControls() {
 *   const { movement, isSprinting } = useKeyboardInput({ context: 'overworld' });
 *
 *   useFrame((_, delta) => {
 *     // Use movement.x and movement.z to move player
 *   });
 * }
 * ```
 */
export function useKeyboardInput(options: UseKeyboardInputOptions = {}): KeyboardInputState {
  const {
    bindings: customBindings,
    context = 'overworld',
    enabled = true,
  } = options;

  const bindings = { ...DEFAULT_KEY_BINDINGS, ...customBindings };
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Calculate movement vector from pressed keys
  const getMovement = useCallback((): MovementVector => {
    const keys = pressedKeysRef.current;
    let x = 0;
    let z = 0;

    // Check movement keys
    if (bindings.moveLeft.some((k) => keys.has(k))) x -= 1;
    if (bindings.moveRight.some((k) => keys.has(k))) x += 1;
    if (bindings.moveForward.some((k) => keys.has(k))) z -= 1;
    if (bindings.moveBackward.some((k) => keys.has(k))) z += 1;

    // Normalize diagonal movement
    const length = Math.sqrt(x * x + z * z);
    if (length > 0) {
      x /= length;
      z /= length;
    }

    return { x, z };
  }, [bindings]);

  // Check if sprinting
  const getIsSprinting = useCallback((): boolean => {
    return bindings.sprint.some((k) => pressedKeysRef.current.has(k));
  }, [bindings]);

  // Check if interact pressed
  const getIsInteractPressed = useCallback((): boolean => {
    return bindings.interact.some((k) => pressedKeysRef.current.has(k));
  }, [bindings]);

  // Check if cancel pressed
  const getIsCancelPressed = useCallback((): boolean => {
    return bindings.cancel.some((k) => pressedKeysRef.current.has(k));
  }, [bindings]);

  // Key event handlers
  useEffect(() => {
    if (!enabled) {
      pressedKeysRef.current.clear();
      return;
    }

    // Only handle movement in overworld context
    const shouldHandleMovement = context === 'overworld';

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for game keys to avoid scrolling
      const isGameKey =
        bindings.moveForward.includes(event.key) ||
        bindings.moveBackward.includes(event.key) ||
        bindings.moveLeft.includes(event.key) ||
        bindings.moveRight.includes(event.key) ||
        bindings.interact.includes(event.key);

      if (isGameKey && shouldHandleMovement) {
        event.preventDefault();
      }

      // Track key state
      if (!pressedKeysRef.current.has(event.key)) {
        pressedKeysRef.current.add(event.key);
        forceUpdate((n) => n + 1);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (pressedKeysRef.current.has(event.key)) {
        pressedKeysRef.current.delete(event.key);
        forceUpdate((n) => n + 1);
      }
    };

    // Clear keys when window loses focus
    const handleBlur = () => {
      pressedKeysRef.current.clear();
      forceUpdate((n) => n + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, context, bindings]);

  // Return movement only if in overworld context
  const movement = context === 'overworld' ? getMovement() : { x: 0, z: 0 };

  return {
    movement,
    isSprinting: getIsSprinting(),
    pressedKeys: pressedKeysRef.current,
    isKeyPressed: (key: string) => pressedKeysRef.current.has(key),
    isInteractPressed: getIsInteractPressed(),
    isCancelPressed: getIsCancelPressed(),
  };
}

export default useKeyboardInput;
