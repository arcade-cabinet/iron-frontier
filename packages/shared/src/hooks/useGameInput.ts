/**
 * useGameInput.ts - React hook for game input integration
 *
 * Provides easy integration of the input system with React components.
 * Handles setup/teardown and provides reactive access to input state.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getInputManager,
  KeyboardInputProvider,
  type InputAction,
  type InputContext,
  type InputEvent,
  type MovementVector,
} from '../input';

/**
 * Input hook options
 */
export interface UseGameInputOptions {
  /** Initial input context */
  initialContext?: InputContext;
  /** Enable keyboard input */
  enableKeyboard?: boolean;
  /** Enable virtual joystick (touch) */
  enableTouch?: boolean;
  /** Container element for touch input */
  touchContainer?: HTMLElement | null;
}

/**
 * Input hook return value
 */
export interface UseGameInputReturn {
  /** Current movement vector */
  movement: MovementVector;
  /** Is player sprinting */
  isSprinting: boolean;
  /** Set input context */
  setContext: (context: InputContext) => void;
  /** Current context */
  context: InputContext;
  /** Enable/disable all input */
  setEnabled: (enabled: boolean) => void;
  /** Is input enabled */
  enabled: boolean;
  /** Subscribe to an action */
  onAction: (action: InputAction | '*', handler: (event: InputEvent) => void) => () => void;
  /** Check if action is held */
  isActionHeld: (action: InputAction) => boolean;
}

/**
 * React hook for game input
 */
export function useGameInput(options: UseGameInputOptions = {}): UseGameInputReturn {
  const {
    initialContext = 'overworld',
    enableKeyboard = true,
    enableTouch = false,
    touchContainer = null,
  } = options;

  const [movement, setMovement] = useState<MovementVector>({ x: 0, z: 0 });
  const [isSprinting, setIsSprinting] = useState(false);
  const [context, setContextState] = useState<InputContext>(initialContext);
  const [enabled, setEnabledState] = useState(true);

  const inputManager = useRef(getInputManager());
  const keyboardProvider = useRef<KeyboardInputProvider | null>(null);
  const unsubscribes = useRef<Array<() => void>>([]);

  // Setup input providers
  useEffect(() => {
    const manager = inputManager.current;

    // Setup keyboard provider
    if (enableKeyboard && typeof window !== 'undefined') {
      keyboardProvider.current = new KeyboardInputProvider();
      const unsub = manager.registerProvider(keyboardProvider.current);
      unsubscribes.current.push(unsub);
    }

    // Subscribe to movement updates
    const unsubMovement = manager.onMovement((newMovement) => {
      setMovement(newMovement);
    });
    unsubscribes.current.push(unsubMovement);

    // Subscribe to sprint action
    const unsubSprint = manager.onAction('sprint', (event) => {
      setIsSprinting(event.type === 'press');
    });
    unsubscribes.current.push(unsubSprint);

    // Set initial context
    manager.setContext(initialContext);

    return () => {
      // Cleanup all subscriptions
      unsubscribes.current.forEach((unsub) => unsub());
      unsubscribes.current = [];

      // Dispose keyboard provider
      if (keyboardProvider.current) {
        keyboardProvider.current.dispose();
        keyboardProvider.current = null;
      }
    };
  }, [enableKeyboard, enableTouch, initialContext]);

  // Handle touch container changes
  useEffect(() => {
    if (!enableTouch || !touchContainer) return;

    // Dynamic import to avoid SSR issues
    import('../input/VirtualJoystickProvider').then(({ VirtualJoystickProvider }) => {
      const joystickProvider = new VirtualJoystickProvider();
      joystickProvider.attach(touchContainer);

      const unsub = inputManager.current.registerProvider(joystickProvider);

      return () => {
        unsub();
        joystickProvider.dispose();
      };
    });
  }, [enableTouch, touchContainer]);

  // Update loop for smooth movement
  useEffect(() => {
    if (!enabled) return;

    let animationFrame: number;
    let lastTime = performance.now();

    const update = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      inputManager.current.update(deltaTime);
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [enabled]);

  // Context setter
  const setContext = useCallback((newContext: InputContext) => {
    inputManager.current.setContext(newContext);
    setContextState(newContext);
  }, []);

  // Enabled setter
  const setEnabled = useCallback((newEnabled: boolean) => {
    inputManager.current.setEnabled(newEnabled);
    setEnabledState(newEnabled);
  }, []);

  // Action subscriber
  const onAction = useCallback(
    (action: InputAction | '*', handler: (event: InputEvent) => void) => {
      return inputManager.current.onAction(action, handler);
    },
    []
  );

  // Action held checker
  const isActionHeld = useCallback((action: InputAction) => {
    return inputManager.current.isActionHeld(action);
  }, []);

  return {
    movement,
    isSprinting,
    setContext,
    context,
    setEnabled,
    enabled,
    onAction,
    isActionHeld,
  };
}

/**
 * Hook for subscribing to specific actions
 */
export function useInputAction(
  action: InputAction | '*',
  handler: (event: InputEvent) => void,
  deps: React.DependencyList = []
): void {
  const inputManager = useRef(getInputManager());

  useEffect(() => {
    const unsub = inputManager.current.onAction(action, handler);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, ...deps]);
}

/**
 * Hook for movement input only
 */
export function useMovementInput(): {
  movement: MovementVector;
  isSprinting: boolean;
} {
  const [movement, setMovement] = useState<MovementVector>({ x: 0, z: 0 });
  const [isSprinting, setIsSprinting] = useState(false);
  const inputManager = useRef(getInputManager());

  useEffect(() => {
    const unsubMovement = inputManager.current.onMovement(setMovement);
    const unsubSprint = inputManager.current.onAction('sprint', (event) => {
      setIsSprinting(event.type === 'press');
    });

    return () => {
      unsubMovement();
      unsubSprint();
    };
  }, []);

  return { movement, isSprinting };
}
