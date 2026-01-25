/**
 * DayNightSystem - Dynamic lighting that follows game time
 *
 * Features:
 * - Directional sun light that rotates with time
 * - Sky color transitions (dawn, day, dusk, night)
 * - Ambient light adjustments
 * - Fog color/density changes
 * - Exposes current time-of-day state for other systems
 */

import {
  Color3,
  Color4,
  DirectionalLight,
  HemisphericLight,
  type Scene,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';

// ============================================================================
// TYPES
// ============================================================================

export type TimeOfDay = 'night' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening';

export interface DayNightState {
  /** Current game hour (0-24) */
  hour: number;
  /** Time of day category */
  timeOfDay: TimeOfDay;
  /** Sun intensity (0-1) */
  sunIntensity: number;
  /** Is it currently daytime? */
  isDay: boolean;
  /** Normalized day progress (0 at dawn, 1 at dusk) */
  dayProgress: number;
}

export interface DayNightConfig {
  /** Hour when dawn begins */
  dawnStart: number;
  /** Hour when day begins */
  dayStart: number;
  /** Hour when dusk begins */
  duskStart: number;
  /** Hour when night begins */
  nightStart: number;
  /** Shadow map size */
  shadowMapSize: number;
  /** Enable shadows */
  enableShadows: boolean;
  /** Fog enabled */
  enableFog: boolean;
  /** Base fog density */
  baseFogDensity: number;
}

const DEFAULT_CONFIG: DayNightConfig = {
  dawnStart: 5,
  dayStart: 7,
  duskStart: 18,
  nightStart: 20,
  shadowMapSize: 2048,
  enableShadows: true,
  enableFog: true,
  baseFogDensity: 0.003,
};

// ============================================================================
// COLOR PRESETS - Western desert atmosphere
// ============================================================================

const TIME_COLORS = {
  night: {
    sky: new Color3(0.02, 0.02, 0.08),
    ambient: new Color3(0.05, 0.05, 0.15),
    sun: new Color3(0.2, 0.2, 0.4),
    fog: new Color3(0.02, 0.02, 0.06),
    intensity: 0.05,
  },
  dawn: {
    sky: new Color3(0.6, 0.35, 0.25),
    ambient: new Color3(0.5, 0.3, 0.25),
    sun: new Color3(1.0, 0.6, 0.4),
    fog: new Color3(0.7, 0.4, 0.3),
    intensity: 0.4,
  },
  morning: {
    sky: new Color3(0.5, 0.7, 0.95),
    ambient: new Color3(0.7, 0.7, 0.65),
    sun: new Color3(1.0, 0.95, 0.85),
    fog: new Color3(0.6, 0.75, 0.9),
    intensity: 0.8,
  },
  midday: {
    sky: new Color3(0.4, 0.65, 0.95),
    ambient: new Color3(0.8, 0.8, 0.75),
    sun: new Color3(1.0, 0.98, 0.9),
    fog: new Color3(0.7, 0.8, 0.9),
    intensity: 1.0,
  },
  afternoon: {
    sky: new Color3(0.45, 0.65, 0.9),
    ambient: new Color3(0.75, 0.72, 0.68),
    sun: new Color3(1.0, 0.92, 0.8),
    fog: new Color3(0.65, 0.75, 0.85),
    intensity: 0.9,
  },
  dusk: {
    sky: new Color3(0.8, 0.4, 0.25),
    ambient: new Color3(0.6, 0.4, 0.35),
    sun: new Color3(1.0, 0.5, 0.3),
    fog: new Color3(0.8, 0.5, 0.35),
    intensity: 0.5,
  },
  evening: {
    sky: new Color3(0.15, 0.1, 0.2),
    ambient: new Color3(0.2, 0.15, 0.25),
    sun: new Color3(0.4, 0.3, 0.5),
    fog: new Color3(0.1, 0.08, 0.15),
    intensity: 0.15,
  },
};

// ============================================================================
// DAY NIGHT SYSTEM
// ============================================================================

export class DayNightSystem {
  private scene: Scene;
  private config: DayNightConfig;

  // Lights
  private sunLight: DirectionalLight | null = null;
  private ambientLight: HemisphericLight | null = null;
  private shadowGenerator: ShadowGenerator | null = null;

  // State
  private currentHour: number = 12;
  private state: DayNightState;

  // Callback for state changes
  private onStateChange?: (state: DayNightState) => void;

  constructor(scene: Scene, config: Partial<DayNightConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.state = this.calculateState(this.currentHour);

    console.log('[DayNightSystem] Created');
  }

  /**
   * Initialize the lighting system
   */
  init(): void {
    console.log('[DayNightSystem] Initializing...');

    // Create ambient hemisphere light
    this.ambientLight = new HemisphericLight('ambient_light', new Vector3(0, 1, 0), this.scene);
    this.ambientLight.intensity = 0.5;
    this.ambientLight.groundColor = new Color3(0.3, 0.25, 0.2);

    // Create directional sun light
    this.sunLight = new DirectionalLight(
      'sun_light',
      new Vector3(-0.5, -1, -0.3).normalize(),
      this.scene
    );
    this.sunLight.intensity = 1.0;

    // Setup shadows
    if (this.config.enableShadows) {
      this.shadowGenerator = new ShadowGenerator(this.config.shadowMapSize, this.sunLight);
      this.shadowGenerator.useBlurExponentialShadowMap = true;
      this.shadowGenerator.blurKernel = 32;
      this.shadowGenerator.darkness = 0.3;
      this.shadowGenerator.depthScale = 100;
    }

    // Setup fog
    if (this.config.enableFog) {
      this.scene.fogMode = 2; // Exponential fog
      this.scene.fogDensity = this.config.baseFogDensity;
    }

    // Apply initial state
    this.applyTimeState(this.currentHour);

    console.log('[DayNightSystem] Initialization complete');
  }

  /**
   * Calculate time-of-day state from hour
   */
  private calculateState(hour: number): DayNightState {
    const { dawnStart, dayStart, duskStart, nightStart } = this.config;

    let timeOfDay: TimeOfDay;
    let isDay = false;
    let dayProgress = 0;

    if (hour < dawnStart) {
      timeOfDay = 'night';
    } else if (hour < dayStart) {
      timeOfDay = 'dawn';
      dayProgress = 0;
    } else if (hour < 12) {
      timeOfDay = 'morning';
      isDay = true;
      dayProgress = (hour - dayStart) / (12 - dayStart) * 0.5;
    } else if (hour < 14) {
      timeOfDay = 'midday';
      isDay = true;
      dayProgress = 0.5;
    } else if (hour < duskStart) {
      timeOfDay = 'afternoon';
      isDay = true;
      dayProgress = 0.5 + (hour - 14) / (duskStart - 14) * 0.5;
    } else if (hour < nightStart) {
      timeOfDay = 'dusk';
      dayProgress = 1;
    } else if (hour < 22) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    const colors = TIME_COLORS[timeOfDay];

    return {
      hour,
      timeOfDay,
      sunIntensity: colors.intensity,
      isDay,
      dayProgress,
    };
  }

  /**
   * Apply lighting state for given hour
   */
  private applyTimeState(hour: number): void {
    const state = this.calculateState(hour);
    const colors = TIME_COLORS[state.timeOfDay];

    // Calculate sun position based on time
    // Sun rises in the east (positive X), sets in the west (negative X)
    // At noon, sun is overhead (Y = -1)
    const sunAngle = ((hour - 6) / 12) * Math.PI; // 0 at 6am, PI at 6pm
    const sunHeight = Math.sin(sunAngle);
    const sunHorizontal = Math.cos(sunAngle);

    if (this.sunLight) {
      // Sun direction (pointing FROM the sun TO the scene)
      this.sunLight.direction = new Vector3(sunHorizontal * 0.7, -Math.abs(sunHeight) - 0.3, -0.5).normalize();

      // Sun color and intensity
      this.sunLight.diffuse = colors.sun;
      this.sunLight.specular = colors.sun.scale(0.5);
      this.sunLight.intensity = colors.intensity;
    }

    if (this.ambientLight) {
      this.ambientLight.diffuse = colors.ambient;
      this.ambientLight.groundColor = colors.ambient.scale(0.5);
      this.ambientLight.intensity = 0.4 + colors.intensity * 0.3;
    }

    // Sky color
    this.scene.clearColor = new Color4(colors.sky.r, colors.sky.g, colors.sky.b, 1);

    // Fog
    if (this.config.enableFog) {
      this.scene.fogColor = colors.fog;
      // Increase fog at dawn/dusk for atmospheric effect
      const fogMultiplier = state.timeOfDay === 'dawn' || state.timeOfDay === 'dusk' ? 1.5 : 1.0;
      this.scene.fogDensity = this.config.baseFogDensity * fogMultiplier;
    }

    // Shadow darkness based on sun intensity
    if (this.shadowGenerator) {
      this.shadowGenerator.darkness = 0.2 + (1 - colors.intensity) * 0.5;
    }

    // Update state
    this.state = state;

    // Notify listeners
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  /**
   * Interpolate between two color states
   */
  private lerpColor(a: Color3, b: Color3, t: number): Color3 {
    return new Color3(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t
    );
  }

  /**
   * Set the current game hour
   */
  setHour(hour: number): void {
    // Normalize hour to 0-24 range
    this.currentHour = ((hour % 24) + 24) % 24;
    this.applyTimeState(this.currentHour);
  }

  /**
   * Advance time by delta hours
   */
  advanceTime(deltaHours: number): void {
    this.setHour(this.currentHour + deltaHours);
  }

  /**
   * Update with game time state
   */
  updateFromGameTime(time: { hour: number; minute?: number }): void {
    const hour = time.hour + (time.minute ?? 0) / 60;
    this.setHour(hour);
  }

  /**
   * Get current state
   */
  getState(): DayNightState {
    return { ...this.state };
  }

  /**
   * Get current hour
   */
  getHour(): number {
    return this.currentHour;
  }

  /**
   * Check if currently daytime
   */
  isDay(): boolean {
    return this.state.isDay;
  }

  /**
   * Get time of day category
   */
  getTimeOfDay(): TimeOfDay {
    return this.state.timeOfDay;
  }

  /**
   * Set state change callback
   */
  onStateChanged(callback: (state: DayNightState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Get shadow generator for adding shadow casters
   */
  getShadowGenerator(): ShadowGenerator | null {
    return this.shadowGenerator;
  }

  /**
   * Get sun light for external use
   */
  getSunLight(): DirectionalLight | null {
    return this.sunLight;
  }

  /**
   * Add mesh as shadow caster
   */
  addShadowCaster(mesh: import('@babylonjs/core').AbstractMesh): void {
    if (this.shadowGenerator) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    console.log('[DayNightSystem] Disposing...');

    if (this.shadowGenerator) {
      this.shadowGenerator.dispose();
      this.shadowGenerator = null;
    }

    if (this.sunLight) {
      this.sunLight.dispose();
      this.sunLight = null;
    }

    if (this.ambientLight) {
      this.ambientLight.dispose();
      this.ambientLight = null;
    }

    console.log('[DayNightSystem] Disposed');
  }
}

export default DayNightSystem;
