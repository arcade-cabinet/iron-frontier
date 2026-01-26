/**
 * R3F Atmosphere System - Western Steampunk Theme
 *
 * A complete atmosphere rendering system for React Three Fiber,
 * designed for a Western steampunk game aesthetic.
 *
 * ## Quick Start
 *
 * ```tsx
 * import { Canvas } from '@react-three/fiber';
 * import { WesternAtmosphere } from './engine/r3f/atmosphere';
 *
 * function App() {
 *   return (
 *     <Canvas>
 *       <WesternAtmosphere />
 *       {/* Your scene content *\/}
 *     </Canvas>
 *   );
 * }
 * ```
 *
 * ## Individual Components
 *
 * For more control, use individual components:
 *
 * ```tsx
 * import {
 *   WesternSky,
 *   DayNightCycle,
 *   AtmosphericEffects,
 *   useTimeOfDay,
 * } from './engine/r3f/atmosphere';
 *
 * function CustomAtmosphere() {
 *   const { hour, colors, state } = useTimeOfDay();
 *
 *   return (
 *     <>
 *       <WesternSky haziness={0.8} />
 *       <DayNightCycle enableStars={true} />
 *       <AtmosphericEffects enableDust={true} enableFog={true} />
 *     </>
 *   );
 * }
 * ```
 *
 * ## Presets
 *
 * Use presets for quick configuration:
 *
 * ```tsx
 * // Dusty desert atmosphere
 * <WesternAtmosphere preset="dusty" />
 *
 * // Clear sky
 * <WesternAtmosphere preset="clear" />
 *
 * // Stormy weather
 * <WesternAtmosphere preset="stormy" />
 * ```
 *
 * ## Manual Time Control
 *
 * Override game time for testing or cutscenes:
 *
 * ```tsx
 * // Set to sunset (6 PM)
 * <WesternAtmosphere timeOfDay={18} />
 *
 * // Set to midnight
 * <WesternAtmosphere timeOfDay={0} />
 * ```
 *
 * @module atmosphere
 */

// Main combined component
export { WesternAtmosphere, type WesternAtmosphereProps, type AtmospherePreset } from './WesternAtmosphere';

// Sky components
export { WesternSky, SunDisc, Moon, type WesternSkyProps, type SunDiscProps, type MoonProps } from './WesternSky';

// Day/Night cycle lighting
export {
  DayNightCycle,
  SunLight,
  AmbientLight,
  HemisphereLight,
  StarField,
  type DayNightCycleProps,
  type SunLightProps,
  type AmbientLightProps,
  type HemisphereLightProps,
  type StarFieldProps,
} from './DayNightCycle';

// Atmospheric effects (dust, fog, heat haze)
export {
  AtmosphericEffects,
  DustParticles,
  AtmosphericFog,
  HeatHaze,
  type AtmosphericEffectsProps,
  type DustParticlesProps,
  type AtmosphericFogProps,
  type HeatHazeProps,
} from './AtmosphericEffects';

// Hooks
export { useTimeOfDay, useSunPosition, type UseTimeOfDayOptions, type UseTimeOfDayResult } from './useTimeOfDay';

// Types
export {
  type TimeOfDay,
  type TimeConfig,
  type TimeColors,
  type AtmosphereState,
  type DustConfig,
  type StarConfig,
  DEFAULT_TIME_CONFIG,
  DEFAULT_DUST_CONFIG,
  DEFAULT_STAR_CONFIG,
  TIME_COLOR_PRESETS,
} from './types';
