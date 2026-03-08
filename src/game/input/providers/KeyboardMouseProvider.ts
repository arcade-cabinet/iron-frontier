// KeyboardMouseProvider — Desktop keyboard + mouse input provider
//
// Key bindings (defaults):
//   WASD           — movement
//   Mouse move     — look (requires pointer lock)
//   Left click     — fire
//   Right click    — aim
//   R              — reload
//   E              — interact
//   Space          — jump
//   ShiftLeft      — sprint
//   Tab            — inventory
//   KeyM           — map
//   Escape         — menu (also releases pointer lock)
//   Digit1-Digit6  — weapon slots

import type { IInputProvider } from '../IInputProvider';
import type { InputFrame } from '../InputFrame';

export interface KeyboardMouseConfig {
  /** Mouse sensitivity multiplier (default 0.002) */
  sensitivity: number;
  /** Invert Y axis (default false) */
  invertY: boolean;
}

const DEFAULT_CONFIG: KeyboardMouseConfig = {
  sensitivity: 0.002,
  invertY: false,
};

export class KeyboardMouseProvider implements IInputProvider {
  readonly name = 'keyboard-mouse';
  readonly priority = 0;

  private config: KeyboardMouseConfig;
  private keysDown = new Set<string>();
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private mouseLeftDown = false;
  private mouseRightDown = false;
  private weaponSlot = 0;
  private isEnabled = false;
  private isPointerLocked = false;

  // Bound handler references for clean removal
  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private readonly onKeyUp: (e: KeyboardEvent) => void;
  private readonly onMouseMove: (e: MouseEvent) => void;
  private readonly onMouseDown: (e: MouseEvent) => void;
  private readonly onMouseUp: (e: MouseEvent) => void;
  private readonly onPointerLockChange: () => void;
  private readonly onContextMenu: (e: Event) => void;

  constructor(config: Partial<KeyboardMouseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
    this.onPointerLockChange = this.handlePointerLockChange.bind(this);
    this.onContextMenu = (e: Event) => e.preventDefault();
  }

  // ---------------------------------------------------------------------------
  // Availability check
  // ---------------------------------------------------------------------------

  /**
   * Check whether a fine pointer (mouse/trackpad) is available.
   * Uses matchMedia('(pointer: fine)') for detection — the old 'ontouchstart'
   * check returned false on touchscreen laptops.
   * Follows the same pattern as goats-in-hell's KeyboardMouseProvider.
   */
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(pointer: fine)')?.matches ?? true;
  }

  // ---------------------------------------------------------------------------
  // IInputProvider
  // ---------------------------------------------------------------------------

  poll(): Partial<InputFrame> {
    if (!this.isEnabled) return {};

    const move = { x: 0, z: 0 };

    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) move.z += 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) move.z -= 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) move.x -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) move.x += 1;

    // Normalize diagonal movement
    const mag = Math.sqrt(move.x * move.x + move.z * move.z);
    if (mag > 1) {
      move.x /= mag;
      move.z /= mag;
    }

    const pitchSign = this.config.invertY ? -1 : 1;
    const look = {
      yaw: this.mouseDeltaX * this.config.sensitivity,
      pitch: this.mouseDeltaY * this.config.sensitivity * pitchSign,
    };

    // Reset mouse deltas after reading
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    // Capture and reset weapon slot
    const weaponSwitch = this.weaponSlot;
    this.weaponSlot = 0;

    return {
      move,
      look,
      fire: this.mouseLeftDown,
      aim: this.mouseRightDown,
      reload: this.keysDown.has('KeyR'),
      interact: this.keysDown.has('KeyE'),
      jump: this.keysDown.has('Space'),
      sprint: this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight'),
      inventory: this.keysDown.has('Tab'),
      map: this.keysDown.has('KeyM'),
      menu: this.keysDown.has('Escape'),
      weaponSwitch,
    };
  }

  enable(): void {
    if (this.isEnabled) return;

    // Only attach mouse-related listeners if a fine pointer is available.
    // Keyboard listeners are always attached (external keyboards on tablets, etc).
    this.isEnabled = true;

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);

    if (this.isAvailable()) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('pointerlockchange', this.onPointerLockChange);
      document.addEventListener('contextmenu', this.onContextMenu);
    }
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.keysDown.clear();
    this.mouseLeftDown = false;
    this.mouseRightDown = false;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.weaponSlot = 0;

    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('contextmenu', this.onContextMenu);
  }

  dispose(): void {
    this.disable();
    this.releasePointerLock();
  }

  // ---------------------------------------------------------------------------
  // Pointer lock helpers
  // ---------------------------------------------------------------------------

  requestPointerLock(element?: HTMLElement): void {
    const target = element ?? document.body;
    target.requestPointerLock();
  }

  releasePointerLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  getIsPointerLocked(): boolean {
    return this.isPointerLocked;
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  setSensitivity(value: number): void {
    this.config.sensitivity = value;
  }

  setInvertY(value: boolean): void {
    this.config.invertY = value;
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default for game keys (not for browser shortcuts like Ctrl+R)
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if (isGameKey(e.code)) {
        e.preventDefault();
      }
    }

    this.keysDown.add(e.code);

    // Weapon slot keys (fire once on press, not hold)
    const slot = weaponSlotFromCode(e.code);
    if (slot > 0 && !e.repeat) {
      this.weaponSlot = slot;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.code);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isPointerLocked) return;
    this.mouseDeltaX += e.movementX;
    this.mouseDeltaY += e.movementY;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) this.mouseLeftDown = true;
    if (e.button === 2) this.mouseRightDown = true;
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) this.mouseLeftDown = false;
    if (e.button === 2) this.mouseRightDown = false;
  }

  private handlePointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement !== null;
    if (!this.isPointerLocked) {
      // Clear state when pointer lock is lost
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
      this.mouseLeftDown = false;
      this.mouseRightDown = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GAME_KEYS = new Set<string>([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space', 'ShiftLeft', 'ShiftRight',
  'KeyR', 'KeyE', 'KeyM', 'Tab',
  'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6',
]);

function isGameKey(code: string): boolean {
  return GAME_KEYS.has(code);
}

function weaponSlotFromCode(code: string): number {
  switch (code) {
    case 'Digit1': return 1;
    case 'Digit2': return 2;
    case 'Digit3': return 3;
    case 'Digit4': return 4;
    case 'Digit5': return 5;
    case 'Digit6': return 6;
    default: return 0;
  }
}
