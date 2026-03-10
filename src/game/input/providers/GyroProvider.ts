// GyroProvider — Gyroscope/accelerometer fine-aim input provider
//
// Uses the DeviceOrientation API to map device tilt to small look
// adjustments. This is additive — it only outputs look deltas, never
// movement or button presses. Priority 3 so it layers on top of other
// providers as a fine-aim assist.
//
// iOS requires an explicit permission request via a user gesture before
// DeviceOrientationEvent fires.

import type { IInputProvider } from '../IInputProvider';
import type { InputFrame } from '../InputFrame';

export interface GyroConfig {
  /** Sensitivity multiplier for tilt-to-look (default 0.0015) */
  sensitivity: number;
  /** Invert pitch axis (default false) */
  invertPitch: boolean;
  /** Invert yaw axis (default false) */
  invertYaw: boolean;
}

const DEFAULT_CONFIG: GyroConfig = {
  sensitivity: 0.0015,
  invertPitch: false,
  invertYaw: false,
};

export class GyroProvider implements IInputProvider {
  readonly name = 'gyro';
  readonly priority = 3;

  private config: GyroConfig;
  private isEnabled = false;
  private hasPermission = false;

  // Accumulated orientation deltas since last poll
  private deltaAlpha = 0; // yaw (Z-axis rotation)
  private deltaBeta = 0; // pitch (X-axis rotation)

  // Previous orientation for computing deltas
  private prevAlpha: number | null = null;
  private prevBeta: number | null = null;

  private readonly onDeviceOrientation: (e: DeviceOrientationEvent) => void;

  constructor(config: Partial<GyroConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onDeviceOrientation = this.handleOrientation.bind(this);
  }

  // ---------------------------------------------------------------------------
  // IInputProvider
  // ---------------------------------------------------------------------------

  poll(): Partial<InputFrame> {
    if (!this.isEnabled || !this.hasPermission) return {};

    const yawSign = this.config.invertYaw ? -1 : 1;
    const pitchSign = this.config.invertPitch ? -1 : 1;

    const look = {
      yaw: this.deltaAlpha * this.config.sensitivity * yawSign,
      pitch: this.deltaBeta * this.config.sensitivity * pitchSign,
    };

    // Reset accumulated deltas after reading
    this.deltaAlpha = 0;
    this.deltaBeta = 0;

    // Only return look — gyro never provides movement or buttons
    return { look };
  }

  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;

    // If we already have permission, start listening immediately
    if (this.hasPermission) {
      this.startListening();
    }
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.stopListening();
    this.resetState();
  }

  dispose(): void {
    this.disable();
  }

  // ---------------------------------------------------------------------------
  // Permission
  // ---------------------------------------------------------------------------

  /**
   * Request permission to use device orientation.
   * On iOS 13+, this must be called from a user gesture (click/tap handler).
   * Returns true if permission was granted.
   */
  async requestPermission(): Promise<boolean> {
    // Check if the API exists at all
    if (typeof DeviceOrientationEvent === 'undefined') {
      return false;
    }

    // iOS 13+ requires explicit permission request
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        this.hasPermission = result === 'granted';
      } catch {
        this.hasPermission = false;
      }
    } else {
      // Non-iOS browsers grant permission implicitly
      this.hasPermission = true;
    }

    // Start listening if we're enabled and just got permission
    if (this.hasPermission && this.isEnabled) {
      this.startListening();
    }

    return this.hasPermission;
  }

  /** Whether gyro permission has been granted */
  getHasPermission(): boolean {
    return this.hasPermission;
  }

  /** Whether the device supports the DeviceOrientation API */
  static isSupported(): boolean {
    return typeof DeviceOrientationEvent !== 'undefined';
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  setSensitivity(value: number): void {
    this.config.sensitivity = value;
  }

  setInvertPitch(value: boolean): void {
    this.config.invertPitch = value;
  }

  setInvertYaw(value: boolean): void {
    this.config.invertYaw = value;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private startListening(): void {
    window.addEventListener('deviceorientation', this.onDeviceOrientation);
  }

  private stopListening(): void {
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);
  }

  private resetState(): void {
    this.deltaAlpha = 0;
    this.deltaBeta = 0;
    this.prevAlpha = null;
    this.prevBeta = null;
  }

  private handleOrientation(e: DeviceOrientationEvent): void {
    if (!this.isEnabled) return;

    const alpha = e.alpha; // 0-360 (yaw / compass heading)
    const beta = e.beta; // -180 to 180 (front-back tilt)

    if (alpha === null || beta === null) return;

    if (this.prevAlpha !== null && this.prevBeta !== null) {
      // Compute angular deltas, wrapping alpha around 360
      let dAlpha = alpha - this.prevAlpha;
      if (dAlpha > 180) dAlpha -= 360;
      if (dAlpha < -180) dAlpha += 360;

      const dBeta = beta - this.prevBeta;

      this.deltaAlpha += dAlpha;
      this.deltaBeta += dBeta;
    }

    this.prevAlpha = alpha;
    this.prevBeta = beta;
  }
}
