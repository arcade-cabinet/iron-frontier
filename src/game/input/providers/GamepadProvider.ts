// GamepadProvider — Gamepad input provider using the Gamepad API
//
// Standard mapping:
//   Left stick        — movement (x: strafe, y: forward/back)
//   Right stick       — look (yaw / pitch)
//   RT (button 7)     — fire
//   LT (button 6)     — aim
//   RB (button 5)     — reload
//   A  (button 0)     — jump
//   X  (button 2)     — interact
//   Y  (button 3)     — sprint (toggle)
//   Start (button 9)  — menu
//   Select (button 8) — map
//   Back (button 16)  — inventory (or Select fallback)
//   D-pad Up/Rt/Dn/Lt — weapon slots 1-4

import type { IInputProvider } from '../IInputProvider';
import type { InputFrame } from '../InputFrame';

export interface GamepadConfig {
  /** Analog stick deadzone (default 0.15) */
  deadzone: number;
  /** Right stick look sensitivity multiplier (default 0.04) */
  lookSensitivity: number;
  /** Invert Y axis for look (default false) */
  invertY: boolean;
  /** Gamepad index to use — null means first connected (default null) */
  gamepadIndex: number | null;
}

const DEFAULT_CONFIG: GamepadConfig = {
  deadzone: 0.15,
  lookSensitivity: 0.04,
  invertY: false,
  gamepadIndex: null,
};

// Standard gamepad button indices
const BTN_A = 0;
const BTN_X = 2;
const BTN_Y = 3;
const BTN_RB = 5;
const BTN_LT = 6;
const BTN_RT = 7;
const BTN_SELECT = 8;
const BTN_START = 9;
const BTN_DPAD_UP = 12;
const BTN_DPAD_DOWN = 13;
const BTN_DPAD_LEFT = 14;
const BTN_DPAD_RIGHT = 15;
const BTN_BACK = 16; // Not always present

// Standard gamepad axes indices
const AXIS_LEFT_X = 0;
const AXIS_LEFT_Y = 1;
const AXIS_RIGHT_X = 2;
const AXIS_RIGHT_Y = 3;

export class GamepadProvider implements IInputProvider {
  readonly name = 'gamepad';
  readonly priority = 8;

  private config: GamepadConfig;
  private isEnabled = false;
  private connectedIndex: number | null = null;
  private weaponSlot = 0;
  private prevDpad: [boolean, boolean, boolean, boolean] = [false, false, false, false];

  private readonly onGamepadConnected: (e: GamepadEvent) => void;
  private readonly onGamepadDisconnected: (e: GamepadEvent) => void;

  constructor(config: Partial<GamepadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.onGamepadConnected = this.handleConnect.bind(this);
    this.onGamepadDisconnected = this.handleDisconnect.bind(this);
  }

  // ---------------------------------------------------------------------------
  // IInputProvider
  // ---------------------------------------------------------------------------

  poll(): Partial<InputFrame> {
    if (!this.isEnabled) return {};

    const gp = this.getGamepad();
    if (!gp) return {};

    // Movement from left stick
    const rawMoveX = gp.axes[AXIS_LEFT_X] ?? 0;
    const rawMoveY = gp.axes[AXIS_LEFT_Y] ?? 0;
    const move = {
      x: this.applyDeadzone(rawMoveX),
      z: -this.applyDeadzone(rawMoveY), // Invert: stick down (-1 in frame is back)
    };

    // Look from right stick
    const rawLookX = gp.axes[AXIS_RIGHT_X] ?? 0;
    const rawLookY = gp.axes[AXIS_RIGHT_Y] ?? 0;
    const pitchSign = this.config.invertY ? -1 : 1;
    const look = {
      yaw: this.applyDeadzone(rawLookX) * this.config.lookSensitivity,
      pitch: this.applyDeadzone(rawLookY) * this.config.lookSensitivity * pitchSign,
    };

    // Buttons
    const fire = this.isPressed(gp, BTN_RT);
    const aim = this.isPressed(gp, BTN_LT);
    const reload = this.isPressed(gp, BTN_RB);
    const jump = this.isPressed(gp, BTN_A);
    const interact = this.isPressed(gp, BTN_X);
    const sprint = this.isPressed(gp, BTN_Y);
    const menu = this.isPressed(gp, BTN_START);
    const map = this.isPressed(gp, BTN_SELECT);

    // Inventory: use BTN_BACK if available, otherwise not mapped
    const inventory = this.isPressed(gp, BTN_BACK);

    // D-pad weapon switch — edge-triggered (fire once on press)
    this.updateWeaponSlot(gp);
    const weaponSwitch = this.weaponSlot;
    this.weaponSlot = 0;

    return {
      move,
      look,
      fire,
      aim,
      reload,
      interact,
      jump,
      sprint,
      inventory,
      map,
      menu,
      weaponSwitch,
    };
  }

  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;

    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);

    // Check for already-connected gamepads
    this.scanForGamepad();
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.connectedIndex = null;
    this.weaponSlot = 0;
    this.prevDpad = [false, false, false, false];

    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  dispose(): void {
    this.disable();
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  setDeadzone(value: number): void {
    this.config.deadzone = Math.max(0, Math.min(1, value));
  }

  setLookSensitivity(value: number): void {
    this.config.lookSensitivity = value;
  }

  setInvertY(value: boolean): void {
    this.config.invertY = value;
  }

  /** Whether a gamepad is currently connected and being read */
  getIsConnected(): boolean {
    return this.getGamepad() !== null;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private getGamepad(): Gamepad | null {
    const gamepads = navigator.getGamepads();

    // Prefer configured index
    if (this.config.gamepadIndex !== null) {
      return gamepads[this.config.gamepadIndex] ?? null;
    }

    // Use tracked connected index
    if (this.connectedIndex !== null) {
      return gamepads[this.connectedIndex] ?? null;
    }

    return null;
  }

  private scanForGamepad(): void {
    if (this.config.gamepadIndex !== null) return;

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.connectedIndex = i;
        return;
      }
    }
  }

  private applyDeadzone(value: number): number {
    const dz = this.config.deadzone;
    if (Math.abs(value) < dz) return 0;
    // Remap from [deadzone, 1] to [0, 1] preserving sign
    const sign = value > 0 ? 1 : -1;
    return sign * ((Math.abs(value) - dz) / (1 - dz));
  }

  private isPressed(gp: Gamepad, index: number): boolean {
    const btn = gp.buttons[index];
    return btn ? btn.pressed : false;
  }

  private updateWeaponSlot(gp: Gamepad): void {
    const dpad: [boolean, boolean, boolean, boolean] = [
      this.isPressed(gp, BTN_DPAD_UP),
      this.isPressed(gp, BTN_DPAD_RIGHT),
      this.isPressed(gp, BTN_DPAD_DOWN),
      this.isPressed(gp, BTN_DPAD_LEFT),
    ];

    // Edge-detect: only fire on transition from not-pressed to pressed
    if (dpad[0] && !this.prevDpad[0]) this.weaponSlot = 1;
    else if (dpad[1] && !this.prevDpad[1]) this.weaponSlot = 2;
    else if (dpad[2] && !this.prevDpad[2]) this.weaponSlot = 3;
    else if (dpad[3] && !this.prevDpad[3]) this.weaponSlot = 4;

    this.prevDpad = dpad;
  }

  private handleConnect(e: GamepadEvent): void {
    if (this.config.gamepadIndex !== null) return;
    if (this.connectedIndex === null) {
      this.connectedIndex = e.gamepad.index;
    }
  }

  private handleDisconnect(e: GamepadEvent): void {
    if (this.connectedIndex === e.gamepad.index) {
      this.connectedIndex = null;
      // Try to find another connected gamepad
      this.scanForGamepad();
    }
  }
}
