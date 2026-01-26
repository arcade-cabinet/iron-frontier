/**
 * InputManager.ts - Central input coordination for Iron Frontier v2
 *
 * Platform-agnostic input manager that:
 * - Aggregates input from multiple providers (keyboard, gamepad, touch)
 * - Normalizes movement vectors
 * - Dispatches input events to listeners
 * - Handles input context (overworld vs menu vs combat)
 */

import type {
  InputAction,
  InputEvent,
  InputEventType,
  InputListener,
  InputProvider,
  InputState,
  MovementListener,
  MovementVector,
} from './types';

/**
 * Input context determines which inputs are processed
 */
export type InputContext =
  | 'overworld' // Free movement, interactions
  | 'town' // Free movement in town
  | 'menu' // Menu navigation
  | 'combat' // Combat action selection
  | 'dialogue' // Dialogue choices
  | 'cutscene' // Skip only
  | 'disabled'; // No input

/**
 * Context-specific action filters
 */
const CONTEXT_ALLOWED_ACTIONS: Record<InputContext, InputAction[]> = {
  overworld: [
    'interact',
    'cancel',
    'menu',
    'inventory',
    'map',
    'sprint',
    'camp',
    'quickSave',
    'quickLoad',
  ],
  town: ['interact', 'cancel', 'menu', 'inventory', 'map', 'sprint'],
  menu: ['confirm', 'cancel', 'menu'],
  combat: ['confirm', 'cancel', 'menu'],
  dialogue: ['confirm', 'cancel'],
  cutscene: ['cancel'],
  disabled: [],
};

/**
 * Contexts that allow movement
 */
const MOVEMENT_CONTEXTS: InputContext[] = ['overworld', 'town'];

export class InputManager {
  private providers: Set<InputProvider> = new Set();
  private actionListeners: Map<InputAction | '*', Set<InputListener>> = new Map();
  private movementListeners: Set<MovementListener> = new Set();
  private context: InputContext = 'overworld';
  private enabled = true;
  private lastMovement: MovementVector = { x: 0, z: 0 };

  // Movement smoothing
  private readonly MOVEMENT_DEADZONE = 0.1;
  private readonly MOVEMENT_SMOOTHING = 0.15;
  private targetMovement: MovementVector = { x: 0, z: 0 };

  constructor() {
    console.log('[InputManager] Initialized');
  }

  /**
   * Register an input provider
   */
  public registerProvider(provider: InputProvider): () => void {
    this.providers.add(provider);

    // Subscribe to provider's action events
    const unsubAction = provider.onAction((event) => {
      this.handleAction(event);
    });

    // Subscribe to provider's movement events
    const unsubMovement = provider.onMovement((movement) => {
      this.handleMovementInput(movement);
    });

    console.log('[InputManager] Provider registered');

    return () => {
      unsubAction();
      unsubMovement();
      this.providers.delete(provider);
    };
  }

  /**
   * Set input context
   */
  public setContext(context: InputContext): void {
    if (this.context !== context) {
      console.log(`[InputManager] Context: ${this.context} -> ${context}`);
      this.context = context;

      // Clear movement if new context doesn't allow it
      if (!MOVEMENT_CONTEXTS.includes(context)) {
        this.targetMovement = { x: 0, z: 0 };
        this.lastMovement = { x: 0, z: 0 };
        this.notifyMovementListeners({ x: 0, z: 0 });
      }
    }
  }

  /**
   * Get current input context
   */
  public getContext(): InputContext {
    return this.context;
  }

  /**
   * Enable/disable all input
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.providers.forEach((p) => p.setEnabled(enabled));

    if (!enabled) {
      this.targetMovement = { x: 0, z: 0 };
      this.lastMovement = { x: 0, z: 0 };
      this.notifyMovementListeners({ x: 0, z: 0 });
    }
  }

  /**
   * Subscribe to a specific action
   */
  public onAction(action: InputAction | '*', listener: InputListener): () => void {
    if (!this.actionListeners.has(action)) {
      this.actionListeners.set(action, new Set());
    }
    this.actionListeners.get(action)!.add(listener);

    return () => {
      this.actionListeners.get(action)?.delete(listener);
    };
  }

  /**
   * Subscribe to movement updates
   */
  public onMovement(listener: MovementListener): () => void {
    this.movementListeners.add(listener);
    return () => {
      this.movementListeners.delete(listener);
    };
  }

  /**
   * Get current aggregated input state
   */
  public getState(): InputState {
    // Combine states from all providers
    const state: InputState = {
      movement: this.lastMovement,
      heldActions: new Set(),
      isSprinting: false,
      pointerPosition: null,
      isPointerDown: false,
    };

    this.providers.forEach((provider) => {
      const providerState = provider.getState();

      // Merge held actions
      providerState.heldActions.forEach((action) => {
        state.heldActions.add(action);
      });

      // Check sprint
      if (providerState.isSprinting) {
        state.isSprinting = true;
      }

      // Use pointer if available
      if (providerState.pointerPosition) {
        state.pointerPosition = providerState.pointerPosition;
        state.isPointerDown = providerState.isPointerDown;
      }
    });

    return state;
  }

  /**
   * Get current movement vector
   */
  public getMovement(): MovementVector {
    return { ...this.lastMovement };
  }

  /**
   * Check if an action is currently being performed
   */
  public isActionHeld(action: InputAction): boolean {
    const state = this.getState();
    return state.heldActions.has(action);
  }

  /**
   * Update loop - call each frame for smooth movement
   */
  public update(deltaTime: number): void {
    if (!this.enabled) return;

    // Smooth movement interpolation
    const smoothFactor = Math.min(1, this.MOVEMENT_SMOOTHING * deltaTime * 60);

    const newMovement: MovementVector = {
      x: this.lerp(this.lastMovement.x, this.targetMovement.x, smoothFactor),
      z: this.lerp(this.lastMovement.z, this.targetMovement.z, smoothFactor),
    };

    // Apply deadzone
    if (Math.abs(newMovement.x) < this.MOVEMENT_DEADZONE) newMovement.x = 0;
    if (Math.abs(newMovement.z) < this.MOVEMENT_DEADZONE) newMovement.z = 0;

    // Only notify if changed significantly
    if (
      Math.abs(newMovement.x - this.lastMovement.x) > 0.001 ||
      Math.abs(newMovement.z - this.lastMovement.z) > 0.001
    ) {
      this.lastMovement = newMovement;
      this.notifyMovementListeners(newMovement);
    }
  }

  /**
   * Handle action event from provider
   */
  private handleAction(event: InputEvent): void {
    if (!this.enabled) return;

    // Check if action is allowed in current context
    const allowedActions = CONTEXT_ALLOWED_ACTIONS[this.context];
    if (!allowedActions.includes(event.action)) {
      return;
    }

    // Notify specific listeners
    this.actionListeners.get(event.action)?.forEach((listener) => {
      listener(event);
    });

    // Notify wildcard listeners
    this.actionListeners.get('*')?.forEach((listener) => {
      listener(event);
    });
  }

  /**
   * Handle movement input from provider
   */
  private handleMovementInput(movement: MovementVector): void {
    if (!this.enabled) return;

    // Only process movement in allowed contexts
    if (!MOVEMENT_CONTEXTS.includes(this.context)) {
      return;
    }

    // Store as target for smoothing
    this.targetMovement = {
      x: this.clamp(movement.x, -1, 1),
      z: this.clamp(movement.z, -1, 1),
    };
  }

  /**
   * Notify movement listeners
   */
  private notifyMovementListeners(movement: MovementVector): void {
    this.movementListeners.forEach((listener) => {
      listener(movement);
    });
  }

  /**
   * Linear interpolation
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Clamp value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.providers.forEach((provider) => provider.dispose());
    this.providers.clear();
    this.actionListeners.clear();
    this.movementListeners.clear();
    console.log('[InputManager] Disposed');
  }
}

// Singleton instance
let inputManagerInstance: InputManager | null = null;

export function getInputManager(): InputManager {
  if (!inputManagerInstance) {
    inputManagerInstance = new InputManager();
  }
  return inputManagerInstance;
}
