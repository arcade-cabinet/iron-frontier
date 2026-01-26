/**
 * WesternAtmosphere - Complete atmosphere system for Western steampunk aesthetic
 *
 * This is the main entry point that combines all atmosphere components:
 * - WesternSky: Procedural sky dome with sun/moon
 * - DayNightCycle: Time-based lighting (sun, ambient, stars)
 * - AtmosphericEffects: Dust particles, fog, heat haze
 *
 * All components automatically sync to the game's time system.
 *
 * @example
 * ```tsx
 * import { Canvas } from '@react-three/fiber';
 * import { WesternAtmosphere } from './engine/r3f/atmosphere';
 *
 * function GameScene() {
 *   return (
 *     <Canvas>
 *       <WesternAtmosphere />
 *       {/* Your game content *\/}
 *     </Canvas>
 *   );
 * }
 * ```
 */

import { WesternSky, SunDisc, Moon } from './WesternSky';
import { DayNightCycle } from './DayNightCycle';
import { AtmosphericEffects } from './AtmosphericEffects';
import type { DustConfig, StarConfig, TimeConfig } from './types';

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export type AtmospherePreset = 'default' | 'dusty' | 'clear' | 'stormy' | 'night';

const PRESETS: Record<AtmospherePreset, Partial<WesternAtmosphereProps>> = {
  default: {
    dustIntensity: 0.5,
    fogIntensity: 1.0,
    haziness: 0.6,
  },
  dusty: {
    dustIntensity: 1.0,
    fogIntensity: 1.5,
    haziness: 0.9,
    enableHeatHaze: true,
  },
  clear: {
    dustIntensity: 0.2,
    fogIntensity: 0.5,
    haziness: 0.3,
    enableHeatHaze: false,
  },
  stormy: {
    dustIntensity: 0.8,
    fogIntensity: 2.0,
    haziness: 0.95,
    lightingIntensity: 0.6,
  },
  night: {
    dustIntensity: 0.3,
    fogIntensity: 0.8,
    haziness: 0.4,
    enableHeatHaze: false,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface WesternAtmosphereProps {
  // === Time Control ===
  /** Override time of day (0-24). If not provided, uses game time. */
  timeOfDay?: number;
  /** Time configuration for day/night boundaries */
  timeConfig?: Partial<TimeConfig>;

  // === Preset ===
  /** Use a preset configuration */
  preset?: AtmospherePreset;

  // === Sky Settings ===
  /** Enable sky dome */
  enableSky?: boolean;
  /** Sky dome radius */
  skyRadius?: number;
  /** Sun disc size */
  sunSize?: number;
  /** Haziness (horizon haze amount 0-1) */
  haziness?: number;
  /** Enable separate sun disc rendering */
  enableSunDisc?: boolean;
  /** Enable moon */
  enableMoon?: boolean;

  // === Lighting Settings ===
  /** Enable directional sun light */
  enableSunLight?: boolean;
  /** Enable ambient/hemisphere light */
  enableAmbientLight?: boolean;
  /** Enable star field at night */
  enableStars?: boolean;
  /** Sun casts shadows */
  sunCastsShadow?: boolean;
  /** Shadow map resolution */
  shadowMapSize?: number;
  /** Overall lighting intensity multiplier */
  lightingIntensity?: number;

  // === Atmospheric Effects ===
  /** Enable dust particles */
  enableDust?: boolean;
  /** Dust intensity multiplier (0-1) */
  dustIntensity?: number;
  /** Dust particle configuration */
  dustConfig?: Partial<DustConfig>;
  /** Enable fog */
  enableFog?: boolean;
  /** Fog intensity multiplier */
  fogIntensity?: number;
  /** Enable heat haze effect */
  enableHeatHaze?: boolean;
  /** Heat haze intensity */
  heatHazeIntensity?: number;

  // === Star Configuration ===
  /** Star field configuration */
  starConfig?: Partial<StarConfig>;

  // === Master Controls ===
  /** Enable/disable entire atmosphere system */
  enabled?: boolean;
  /** Render order offset (for layering) */
  renderOrderOffset?: number;
}

export function WesternAtmosphere({
  // Time
  timeOfDay,
  timeConfig,

  // Preset (applied first, then overridden by explicit props)
  preset = 'default',

  // Sky
  enableSky = true,
  skyRadius = 1000,
  sunSize = 0.02,
  haziness: propHaziness,
  enableSunDisc = false,
  enableMoon = true,

  // Lighting
  enableSunLight = true,
  enableAmbientLight = true,
  enableStars = true,
  sunCastsShadow = true,
  shadowMapSize = 2048,
  lightingIntensity: propLightingIntensity,

  // Effects
  enableDust = true,
  dustIntensity: propDustIntensity,
  dustConfig,
  enableFog = true,
  fogIntensity: propFogIntensity,
  enableHeatHaze: propEnableHeatHaze,
  heatHazeIntensity = 0.5,

  // Stars
  starConfig,

  // Master
  enabled = true,
  renderOrderOffset = 0,
}: WesternAtmosphereProps) {
  if (!enabled) return null;

  // Apply preset values, allow explicit props to override
  const presetConfig = PRESETS[preset];
  const haziness = propHaziness ?? presetConfig.haziness ?? 0.6;
  const dustIntensity = propDustIntensity ?? presetConfig.dustIntensity ?? 0.5;
  const fogIntensity = propFogIntensity ?? presetConfig.fogIntensity ?? 1.0;
  const lightingIntensity = propLightingIntensity ?? presetConfig.lightingIntensity ?? 1.0;
  const enableHeatHaze = propEnableHeatHaze ?? presetConfig.enableHeatHaze ?? false;

  // Merge dust config with intensity
  const finalDustConfig: Partial<DustConfig> = {
    ...dustConfig,
    opacity: (dustConfig?.opacity ?? 0.4) * dustIntensity,
  };

  return (
    <group name="western-atmosphere">
      {/* Sky dome with procedural gradient and sun */}
      {enableSky && (
        <WesternSky
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          radius={skyRadius}
          sunSize={sunSize}
          haziness={haziness}
          dustAmount={dustIntensity}
        />
      )}

      {/* Optional separate sun disc (for more prominent sun) */}
      {enableSunDisc && (
        <SunDisc
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          distance={skyRadius * 0.8}
        />
      )}

      {/* Moon for night scenes */}
      {enableMoon && (
        <Moon
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          distance={skyRadius * 0.7}
        />
      )}

      {/* Time-based lighting system */}
      <DayNightCycle
        timeOfDay={timeOfDay}
        timeConfig={timeConfig}
        enableSunLight={enableSunLight}
        enableHemisphereLight={enableAmbientLight}
        enableAmbientLight={false}
        enableStars={enableStars}
        sunCastsShadow={sunCastsShadow}
        shadowMapSize={shadowMapSize}
        intensityMultiplier={lightingIntensity}
        starConfig={starConfig}
      />

      {/* Atmospheric effects (dust, fog, heat haze) */}
      <AtmosphericEffects
        timeOfDay={timeOfDay}
        timeConfig={timeConfig}
        enableDust={enableDust}
        enableFog={enableFog}
        enableHeatHaze={enableHeatHaze}
        dustConfig={finalDustConfig}
        fogDensityMultiplier={fogIntensity}
        heatHazeIntensity={heatHazeIntensity}
      />
    </group>
  );
}

export default WesternAtmosphere;
