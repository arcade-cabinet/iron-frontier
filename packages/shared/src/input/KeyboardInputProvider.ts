/**
 * KeyboardInputProvider.ts - Keyboard input for web platform
 *
 * Handles WASD/Arrow key movement and keyboard actions.
 * Designed for web but can work in any environment with DOM events.
 */

import type {
  InputAction,
  InputEvent,
  InputListener,
  InputProvider,
  InputState,
  KeyMapping,
  MovementListener,
  MovementVector,
} from './types';
import { DEFAULT_KEY_MAPPING } from './types';

export class KeyboardInputProvider implements InputProvider {
  private keyMapping: KeyMapping;
  private pressedKeys: Set<string> = new Set();
  private actionListeners: Set<InputListener> = new Set();
  private movementListeners: Set<MovementListener> = new Set();
  private enabled = true;
  private disposed = false;

  // Bound handlers for cleanup
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;

  constructor(keyMapping: KeyMapping = DEFAULT_KEY_MAPPING) {
    this.keyMapping = keyMapping;

    // Bind handlers
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundBlur = this.handleBlur.bind(this);

    // Setup event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundKeyDown);
      window.addEventListener('keyup', this.boundKeyUp);
      window.addEventListener('blur', this.boundBlur);
    }

    console.log('[KeyboardInputProvider] Initialized');
  }

  /**
   * Get current input state
   */
  public getState(): InputState {
    const movement = this.calculateMovement();
    const heldActions = this.getHeldActions();

    return {
      movement,
      heldActions,
      isSprinting: heldActions.has('sprint'),
      pointerPosition: null,
      isPointerDown: false,
    };
  }

  /**
   * Subscribe to input events
   */
  public onAction(listener: InputListener): () => void {
    this.actionListeners.add(listener);
    return () => {
      this.actionListeners.delete(listener);
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
   * Enable/disable input processing
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.pressedKeys.clear();
      this.notifyMovement({ x: 0, z: 0 });
    }
  }

  /**
   * Check if input is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Update key mappings
   */
  public setKeyMapping(mapping: Partial<KeyMapping>): void {
    this.keyMapping = { ...this.keyMapping, ...mapping };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyDown);
      window.removeEventListener('keyup', this.boundKeyUp);
      window.removeEventListener('blur', this.boundBlur);
    }

    this.actionListeners.clear();
    this.movementListeners.clear();
    this.pressedKeys.clear();

    console.log('[KeyboardInputProvider] Disposed');
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled || this.disposed) return;

    // Prevent default for game keys (not in text inputs)
    if (this.isGameKey(e.key) && !this.isTextInput(e.target)) {
      e.preventDefault();
    }

    // Track key press
    const wasPressed = this.pressedKeys.has(e.key);
    this.pressedKeys.add(e.key);

    // Emit action event on first press
    if (!wasPressed) {
      const action = this.keyToAction(e.key);
      if (action) {
        this.emitAction(action, 'press');
      }

      // Update movement
      if (this.isMovementKey(e.key)) {
        this.notifyMovement(this.calculateMovement());
      }
    }
  }

  /**
   * Handle keyup event
   */
  private handleKeyUp(e: KeyboardEvent): void {
    if (!this.enabled || this.disposed) return;

    const wasPressed = this.pressedKeys.has(e.key);
    this.pressedKeys.delete(e.key);

    if (wasPressed) {
      const action = this.keyToAction(e.key);
      if (action) {
        this.emitAction(action, 'release');
      }

      // Update movement
      if (this.isMovementKey(e.key)) {
        this.notifyMovement(this.calculateMovement());
      }
    }
  }

  /**
   * Handle window blur - release all keys
   */
  private handleBlur(): void {
    this.pressedKeys.clear();
    this.notifyMovement({ x: 0, z: 0 });
  }

  /**
   * Calculate movement vector from pressed keys
   */
  private calculateMovement(): MovementVector {
    let x = 0;
    let z = 0;

    // Check movement keys
    for (const key of this.pressedKeys) {
      if (this.keyMapping.moveUp.includes(key)) z -= 1;
      if (this.keyMapping.moveDown.includes(key)) z += 1;
      if (this.keyMapping.moveLeft.includes(key)) x -= 1;
      if (this.keyMapping.moveRight.includes(key)) x += 1;
    }

    // Normalize diagonal movement
    if (x !== 0 && z !== 0) {
      const length = Math.sqrt(x * x + z * z);
      x /= length;
      z /= length;
    }

    return { x, z };
  }

  /**
   * Get set of currently held actions
   */
  private getHeldActions(): Set<InputAction> {
    const actions = new Set<InputAction>();

    for (const key of this.pressedKeys) {
      const action = this.keyToAction(key);
      if (action) {
        actions.add(action);
      }
    }

    return actions;
  }

  /**
   * Map key to action
   */
  private keyToAction(key: string): InputAction | null {
    if (this.keyMapping.interact.includes(key)) return 'interact';
    if (this.keyMapping.cancel.includes(key)) return 'cancel';
    if (this.keyMapping.menu.includes(key)) return 'menu';
    if (this.keyMapping.inventory.includes(key)) return 'inventory';
    if (this.keyMapping.map.includes(key)) return 'map';
    if (this.keyMapping.sprint.includes(key)) return 'sprint';
    if (this.keyMapping.confirm.includes(key)) return 'confirm';
    if (this.keyMapping.camp.includes(key)) return 'camp';
    if (this.keyMapping.quickSave.includes(key)) return 'quickSave';
    if (this.keyMapping.quickLoad.includes(key)) return 'quickLoad';
    return null;
  }

  /**
   * Check if key is used for movement
   */
  private isMovementKey(key: string): boolean {
    return (
      this.keyMapping.moveUp.includes(key) ||
      this.keyMapping.moveDown.includes(key) ||
      this.keyMapping.moveLeft.includes(key) ||
      this.keyMapping.moveRight.includes(key)
    );
  }

  /**
   * Check if key is a game key (should prevent default)
   */
  private isGameKey(key: string): boolean {
    return (
      this.isMovementKey(key) ||
      this.keyToAction(key) !== null
    );
  }

  /**
   * Check if event target is a text input
   */
  private isTextInput(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      target.isContentEditable
    );
  }

  /**
   * Emit action event to listeners
   */
  private emitAction(action: InputAction, type: 'press' | 'release'): void {
    const event: InputEvent = {
      action,
      type,
      timestamp: Date.now(),
    };

    this.actionListeners.forEach((listener) => {
      listener(event);
    });
  }

  /**
   * Notify movement listeners
   */
  private notifyMovement(movement: MovementVector): void {
    this.movementListeners.forEach((listener) => {
      listener(movement);
    });
  }
}
