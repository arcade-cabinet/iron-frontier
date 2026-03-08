// InputManager — Singleton that merges all registered IInputProviders into one InputFrame per tick.
//
// Merge rules:
//   - Analog axes (move, look): values are accumulated across all providers.
//   - Boolean actions: logical OR, but a higher-priority provider's explicit `false` does NOT
//     override a lower-priority provider's `true` — we simply OR them together so any
//     provider can trigger an action.
//   - weaponSwitch: highest-priority non-zero value wins.

import type { IInputProvider } from './IInputProvider';
import { type InputFrame, createEmptyFrame } from './InputFrame';

type BooleanFrameKey =
  | 'fire'
  | 'aim'
  | 'reload'
  | 'interact'
  | 'jump'
  | 'sprint'
  | 'inventory'
  | 'map'
  | 'menu';

const BOOLEAN_KEYS: readonly BooleanFrameKey[] = [
  'fire',
  'aim',
  'reload',
  'interact',
  'jump',
  'sprint',
  'inventory',
  'map',
  'menu',
] as const;

export class InputManager {
  private static instance: InputManager | null = null;

  private providers: IInputProvider[] = [];
  private currentFrame: InputFrame = createEmptyFrame();
  private enabled = true;

  private constructor() {}

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /** Reset the singleton (useful for tests and hot-reload) */
  static resetInstance(): void {
    if (InputManager.instance) {
      InputManager.instance.dispose();
      InputManager.instance = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Provider management
  // ---------------------------------------------------------------------------

  registerProvider(provider: IInputProvider): void {
    // Prevent duplicate names
    if (this.providers.some((p) => p.name === provider.name)) {
      throw new Error(`InputManager: provider "${provider.name}" is already registered`);
    }
    this.providers.push(provider);
    // Keep sorted by priority ascending so the highest-priority provider is merged last
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  removeProvider(name: string): void {
    const index = this.providers.findIndex((p) => p.name === name);
    if (index === -1) return;

    const [removed] = this.providers.splice(index, 1);
    removed.dispose();
  }

  getProvider(name: string): IInputProvider | undefined {
    return this.providers.find((p) => p.name === name);
  }

  // ---------------------------------------------------------------------------
  // Per-tick update
  // ---------------------------------------------------------------------------

  /** Poll all providers and merge into a single InputFrame. Call once per game tick. */
  tick(): void {
    if (!this.enabled) return;

    const merged = createEmptyFrame();
    let weaponSwitchPriority = -1;

    for (const provider of this.providers) {
      const partial = provider.poll();

      // Analog: accumulate
      if (partial.move) {
        merged.move.x += partial.move.x;
        merged.move.z += partial.move.z;
      }
      if (partial.look) {
        merged.look.yaw += partial.look.yaw;
        merged.look.pitch += partial.look.pitch;
      }

      // Booleans: OR
      for (const key of BOOLEAN_KEYS) {
        if (partial[key] === true) {
          merged[key] = true;
        }
      }

      // Weapon switch: highest-priority non-zero wins
      if (partial.weaponSwitch !== undefined && partial.weaponSwitch !== 0) {
        if (provider.priority > weaponSwitchPriority) {
          merged.weaponSwitch = partial.weaponSwitch;
          weaponSwitchPriority = provider.priority;
        }
      }

      // VR aim override: last provider to set these wins
      // (XR provider is sorted by priority so it will override others)
      if (partial.aimOrigin) {
        merged.aimOrigin = partial.aimOrigin;
      }
      if (partial.aimDirection) {
        merged.aimDirection = partial.aimDirection;
      }
    }

    // Clamp analog move to -1..1
    merged.move.x = clamp(merged.move.x, -1, 1);
    merged.move.z = clamp(merged.move.z, -1, 1);

    this.currentFrame = merged;
  }

  // ---------------------------------------------------------------------------
  // Reading state
  // ---------------------------------------------------------------------------

  /** Returns the most recently computed frame. */
  getFrame(): Readonly<InputFrame> {
    return this.currentFrame;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  dispose(): void {
    for (const provider of this.providers) {
      provider.dispose();
    }
    this.providers = [];
    this.currentFrame = createEmptyFrame();
    this.enabled = false;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
