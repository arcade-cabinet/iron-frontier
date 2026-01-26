/**
 * VirtualJoystickProvider.ts - Touch-based virtual joystick input
 *
 * Provides touch-based movement and action input for mobile devices.
 * Renders a virtual joystick when touch begins in the movement zone.
 */

import type {
  InputAction,
  InputEvent,
  InputListener,
  InputProvider,
  InputState,
  MovementListener,
  MovementVector,
} from './types';

/**
 * Configuration for the virtual joystick
 */
export interface VirtualJoystickConfig {
  /** Size of the joystick base in pixels */
  baseSize: number;
  /** Size of the joystick stick in pixels */
  stickSize: number;
  /** Maximum distance the stick can move from center */
  maxDistance: number;
  /** Deadzone radius (normalized 0-1) */
  deadzone: number;
  /** Zone of screen for movement (left side by default) */
  movementZone: { x: number; y: number; width: number; height: number };
  /** Zone of screen for action button */
  actionZone: { x: number; y: number; width: number; height: number };
}

const DEFAULT_CONFIG: VirtualJoystickConfig = {
  baseSize: 120,
  stickSize: 50,
  maxDistance: 50,
  deadzone: 0.15,
  movementZone: { x: 0, y: 0.3, width: 0.5, height: 0.7 },
  actionZone: { x: 0.7, y: 0.6, width: 0.3, height: 0.4 },
};

/**
 * Touch point info
 */
interface TouchPoint {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  type: 'movement' | 'action';
}

export class VirtualJoystickProvider implements InputProvider {
  private config: VirtualJoystickConfig;
  private canvas: HTMLElement | null = null;
  private actionListeners: Set<InputListener> = new Set();
  private movementListeners: Set<MovementListener> = new Set();
  private enabled = true;
  private disposed = false;

  // Touch tracking
  private activeTouches: Map<number, TouchPoint> = new Map();
  private movementTouch: TouchPoint | null = null;
  private currentMovement: MovementVector = { x: 0, z: 0 };
  private isSprinting = false;

  // Visual elements
  private joystickBase: HTMLDivElement | null = null;
  private joystickStick: HTMLDivElement | null = null;
  private actionButton: HTMLDivElement | null = null;

  // Bound handlers
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor(config: Partial<VirtualJoystickConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);

    console.log('[VirtualJoystickProvider] Initialized');
  }

  /**
   * Attach to a canvas/container element
   */
  public attach(element: HTMLElement): void {
    if (this.canvas) {
      this.detach();
    }

    this.canvas = element;
    this.createVisualElements();

    element.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    element.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    element.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    element.addEventListener('touchcancel', this.boundTouchEnd, { passive: false });

    console.log('[VirtualJoystickProvider] Attached to element');
  }

  /**
   * Detach from current element
   */
  public detach(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.boundTouchStart);
      this.canvas.removeEventListener('touchmove', this.boundTouchMove);
      this.canvas.removeEventListener('touchend', this.boundTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.boundTouchEnd);
    }

    this.removeVisualElements();
    this.canvas = null;
    this.activeTouches.clear();
    this.movementTouch = null;
  }

  /**
   * Get current input state
   */
  public getState(): InputState {
    const heldActions = new Set<InputAction>();

    // Check if action button is being held
    for (const touch of this.activeTouches.values()) {
      if (touch.type === 'action') {
        heldActions.add('interact');
      }
    }

    if (this.isSprinting) {
      heldActions.add('sprint');
    }

    return {
      movement: this.currentMovement,
      heldActions,
      isSprinting: this.isSprinting,
      pointerPosition: this.movementTouch
        ? { x: this.movementTouch.currentX, y: this.movementTouch.currentY }
        : null,
      isPointerDown: this.activeTouches.size > 0,
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
   * Enable/disable input
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.activeTouches.clear();
      this.movementTouch = null;
      this.currentMovement = { x: 0, z: 0 };
      this.hideJoystick();
      this.notifyMovement({ x: 0, z: 0 });
    }
  }

  /**
   * Check if enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable sprint mode (e.g., when holding a sprint button area)
   */
  public setSprinting(sprinting: boolean): void {
    this.isSprinting = sprinting;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.detach();
    this.actionListeners.clear();
    this.movementListeners.clear();
    console.log('[VirtualJoystickProvider] Disposed');
  }

  /**
   * Create visual joystick elements
   */
  private createVisualElements(): void {
    // Joystick base (outer circle)
    this.joystickBase = document.createElement('div');
    this.joystickBase.style.cssText = `
      position: fixed;
      width: ${this.config.baseSize}px;
      height: ${this.config.baseSize}px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.4);
      pointer-events: none;
      display: none;
      z-index: 1000;
    `;

    // Joystick stick (inner circle)
    this.joystickStick = document.createElement('div');
    this.joystickStick.style.cssText = `
      position: absolute;
      width: ${this.config.stickSize}px;
      height: ${this.config.stickSize}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `;

    this.joystickBase.appendChild(this.joystickStick);
    document.body.appendChild(this.joystickBase);

    // Action button
    this.actionButton = document.createElement('div');
    this.actionButton.style.cssText = `
      position: fixed;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(139, 90, 43, 0.5);
      border: 3px solid rgba(210, 180, 140, 0.6);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: serif;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      z-index: 1000;
      right: 20px;
      bottom: 100px;
    `;
    this.actionButton.textContent = 'A';
    document.body.appendChild(this.actionButton);
  }

  /**
   * Remove visual elements
   */
  private removeVisualElements(): void {
    if (this.joystickBase) {
      this.joystickBase.remove();
      this.joystickBase = null;
      this.joystickStick = null;
    }
    if (this.actionButton) {
      this.actionButton.remove();
      this.actionButton = null;
    }
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.enabled || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const normalizedX = (touch.clientX - rect.left) / rect.width;
      const normalizedY = (touch.clientY - rect.top) / rect.height;

      // Check if touch is in movement zone
      const mz = this.config.movementZone;
      if (
        normalizedX >= mz.x &&
        normalizedX <= mz.x + mz.width &&
        normalizedY >= mz.y &&
        normalizedY <= mz.y + mz.height &&
        !this.movementTouch
      ) {
        const touchPoint: TouchPoint = {
          id: touch.identifier,
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: touch.clientX,
          currentY: touch.clientY,
          startTime: Date.now(),
          type: 'movement',
        };

        this.activeTouches.set(touch.identifier, touchPoint);
        this.movementTouch = touchPoint;
        this.showJoystick(touch.clientX, touch.clientY);
        e.preventDefault();
      }
      // Check if touch is in action zone
      else {
        const az = this.config.actionZone;
        if (
          normalizedX >= az.x &&
          normalizedX <= az.x + az.width &&
          normalizedY >= az.y &&
          normalizedY <= az.y + az.height
        ) {
          const touchPoint: TouchPoint = {
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            startTime: Date.now(),
            type: 'action',
          };

          this.activeTouches.set(touch.identifier, touchPoint);
          this.emitAction('interact', 'press');
          this.highlightActionButton(true);
          e.preventDefault();
        }
      }
    }
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!this.enabled) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchPoint = this.activeTouches.get(touch.identifier);

      if (touchPoint) {
        touchPoint.currentX = touch.clientX;
        touchPoint.currentY = touch.clientY;

        if (touchPoint.type === 'movement') {
          this.updateMovement(touchPoint);
          e.preventDefault();
        }
      }
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.enabled) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchPoint = this.activeTouches.get(touch.identifier);

      if (touchPoint) {
        this.activeTouches.delete(touch.identifier);

        if (touchPoint.type === 'movement') {
          this.movementTouch = null;
          this.currentMovement = { x: 0, z: 0 };
          this.hideJoystick();
          this.notifyMovement({ x: 0, z: 0 });
        } else if (touchPoint.type === 'action') {
          this.emitAction('interact', 'release');
          this.highlightActionButton(false);

          // Check for quick tap (could trigger a specific action)
          const duration = Date.now() - touchPoint.startTime;
          if (duration < 200) {
            // Quick tap - could be used for special actions
          }
        }

        e.preventDefault();
      }
    }
  }

  /**
   * Update movement from joystick position
   */
  private updateMovement(touch: TouchPoint): void {
    const dx = touch.currentX - touch.startX;
    const dy = touch.currentY - touch.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.config.deadzone * this.config.maxDistance) {
      this.currentMovement = { x: 0, z: 0 };
    } else {
      const clampedDistance = Math.min(distance, this.config.maxDistance);
      const normalizedDistance = clampedDistance / this.config.maxDistance;

      this.currentMovement = {
        x: (dx / distance) * normalizedDistance,
        z: (dy / distance) * normalizedDistance,
      };
    }

    this.updateJoystickVisual(dx, dy);
    this.notifyMovement(this.currentMovement);
  }

  /**
   * Show joystick at position
   */
  private showJoystick(x: number, y: number): void {
    if (this.joystickBase) {
      this.joystickBase.style.display = 'block';
      this.joystickBase.style.left = `${x - this.config.baseSize / 2}px`;
      this.joystickBase.style.top = `${y - this.config.baseSize / 2}px`;
    }
  }

  /**
   * Hide joystick
   */
  private hideJoystick(): void {
    if (this.joystickBase) {
      this.joystickBase.style.display = 'none';
    }
    if (this.joystickStick) {
      this.joystickStick.style.left = '50%';
      this.joystickStick.style.top = '50%';
    }
  }

  /**
   * Update joystick visual position
   */
  private updateJoystickVisual(dx: number, dy: number): void {
    if (!this.joystickStick) return;

    const clampedX = Math.max(-this.config.maxDistance, Math.min(this.config.maxDistance, dx));
    const clampedY = Math.max(-this.config.maxDistance, Math.min(this.config.maxDistance, dy));

    const offsetX = (clampedX / this.config.maxDistance) * (this.config.baseSize / 2 - this.config.stickSize / 2);
    const offsetY = (clampedY / this.config.maxDistance) * (this.config.baseSize / 2 - this.config.stickSize / 2);

    this.joystickStick.style.left = `calc(50% + ${offsetX}px)`;
    this.joystickStick.style.top = `calc(50% + ${offsetY}px)`;
  }

  /**
   * Highlight action button
   */
  private highlightActionButton(active: boolean): void {
    if (this.actionButton) {
      this.actionButton.style.background = active
        ? 'rgba(210, 180, 140, 0.7)'
        : 'rgba(139, 90, 43, 0.5)';
    }
  }

  /**
   * Emit action event
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
