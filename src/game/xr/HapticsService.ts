/**
 * HapticsService — Dual-path haptic feedback for game events.
 *
 * Web path: navigator.vibrate(pattern)
 * XR path: gamepad.hapticActuators[0].pulse(intensity, duration)
 *
 * Provides a pattern table for game events with distinct web vibration
 * patterns and XR controller haptic pulse configurations.
 *
 * XR controllers are registered by the XRControllerProvider when they
 * connect, enabling haptic pulse output during VR sessions.
 */

// ---------------------------------------------------------------------------
// Haptic event enum
// ---------------------------------------------------------------------------

export enum HapticEvent {
  WeaponFire = 'weapon_fire',
  DamageTaken = 'damage_taken',
  EnemyKill = 'enemy_kill',
  ItemPickup = 'item_pickup',
  QuestComplete = 'quest_complete',
  LevelUp = 'level_up',
  Reload = 'reload',
  WeaponSwitch = 'weapon_switch',
  Explosion = 'explosion',
  Jump = 'jump',
  Land = 'land',
  LowHealth = 'low_health',
}

// ---------------------------------------------------------------------------
// Pattern definition
// ---------------------------------------------------------------------------

interface HapticPattern {
  /** Web vibration pattern: [vibrate, pause, vibrate, ...] in ms */
  web: number[];
  /** XR controller pulse config */
  xr: { intensity: number; duration: number };
}

// ---------------------------------------------------------------------------
// Pattern table
// ---------------------------------------------------------------------------

const HAPTIC_PATTERNS: Record<HapticEvent, HapticPattern> = {
  [HapticEvent.WeaponFire]: {
    web: [30],
    xr: { intensity: 0.4, duration: 30 },
  },
  [HapticEvent.DamageTaken]: {
    web: [50, 30, 80],
    xr: { intensity: 0.8, duration: 100 },
  },
  [HapticEvent.EnemyKill]: {
    web: [60],
    xr: { intensity: 0.6, duration: 60 },
  },
  [HapticEvent.ItemPickup]: {
    web: [15],
    xr: { intensity: 0.2, duration: 20 },
  },
  [HapticEvent.QuestComplete]: {
    web: [100, 50, 100, 50, 200],
    xr: { intensity: 1.0, duration: 500 },
  },
  [HapticEvent.LevelUp]: {
    web: [30, 20, 50, 20, 80],
    xr: { intensity: 0.7, duration: 200 },
  },
  [HapticEvent.Reload]: {
    web: [25, 15, 25],
    xr: { intensity: 0.3, duration: 65 },
  },
  [HapticEvent.WeaponSwitch]: {
    web: [15],
    xr: { intensity: 0.2, duration: 15 },
  },
  [HapticEvent.Explosion]: {
    web: [150],
    xr: { intensity: 1.0, duration: 150 },
  },
  [HapticEvent.Jump]: {
    web: [15],
    xr: { intensity: 0.15, duration: 15 },
  },
  [HapticEvent.Land]: {
    web: [40],
    xr: { intensity: 0.5, duration: 40 },
  },
  [HapticEvent.LowHealth]: {
    web: [40, 60, 40],
    xr: { intensity: 0.5, duration: 140 },
  },
};

// ---------------------------------------------------------------------------
// XR gamepad haptic actuator interface
// ---------------------------------------------------------------------------

interface XRGamepadHapticActuator {
  pulse(intensity: number, duration: number): Promise<void>;
}

interface XRController {
  gamepad?: {
    hapticActuators?: XRGamepadHapticActuator[];
  };
}

// ---------------------------------------------------------------------------
// HapticsService
// ---------------------------------------------------------------------------

export class HapticsService {
  private enabled = true;
  private globalIntensity = 1.0;
  private xrControllers: XRController[] = [];

  /**
   * Trigger a haptic event.
   *
   * @param event  The game event to provide feedback for.
   * @param intensity  Optional per-call intensity multiplier (0-1, default 1).
   *                   Combined with globalIntensity to determine final output.
   */
  trigger(event: HapticEvent, intensity: number = 1): void {
    if (!this.enabled) return;

    const pattern = HAPTIC_PATTERNS[event];
    if (!pattern) return;

    const effectiveIntensity = Math.max(
      0,
      Math.min(1, intensity * this.globalIntensity),
    );

    // --- Web vibration path ---
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const scaled = pattern.web.map((ms, i) => {
        // Even indices are vibration durations; odd indices are pauses.
        // Scale vibration durations by intensity, leave pauses unchanged.
        if (i % 2 === 0) {
          return Math.round(ms * effectiveIntensity);
        }
        return ms;
      });
      navigator.vibrate(scaled);
    }

    // --- XR controller haptic path ---
    for (const controller of this.xrControllers) {
      const actuators = controller.gamepad?.hapticActuators;
      if (actuators && actuators.length > 0) {
        const xrIntensityClamped = Math.min(
          1,
          pattern.xr.intensity * effectiveIntensity,
        );
        const xrDuration = Math.round(
          pattern.xr.duration * effectiveIntensity,
        );
        for (const actuator of actuators) {
          actuator.pulse(xrIntensityClamped, xrDuration).catch(() => {
            // Silently ignore — controller may have disconnected
          });
        }
      }
    }
  }

  /** Enable or disable haptic feedback globally. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /** Whether haptic feedback is currently enabled. */
  getEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set the global intensity scaling factor (0-1).
   * Applied as a multiplier to all haptic events.
   */
  setGlobalIntensity(intensity: number): void {
    this.globalIntensity = Math.max(0, Math.min(1, intensity));
  }

  /** Get the current global intensity scaling factor. */
  getGlobalIntensity(): number {
    return this.globalIntensity;
  }

  /**
   * Register an XR controller for haptic pulse output.
   * Called by the XRControllerProvider when controllers connect.
   */
  registerXRController(controller: XRController): void {
    if (!this.xrControllers.includes(controller)) {
      this.xrControllers.push(controller);
    }
  }

  /**
   * Unregister an XR controller (e.g. when it disconnects).
   */
  unregisterXRController(controller: XRController): void {
    const idx = this.xrControllers.indexOf(controller);
    if (idx !== -1) {
      this.xrControllers.splice(idx, 1);
    }
  }

  /**
   * Check whether haptic feedback is supported in the current environment.
   * Returns true if the Web Vibration API is available OR if XR controllers
   * with haptic actuators are registered.
   */
  isSupported(): boolean {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      return true;
    }
    return this.xrControllers.some(
      (c) => (c.gamepad?.hapticActuators?.length ?? 0) > 0,
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const haptics = new HapticsService();
