/**
 * Rendering Adapters Index
 *
 * Exports interfaces and utilities for platform-specific rendering adapters.
 * The web uses React Three Fiber (Three.js), mobile uses Three.js via expo-gl.
 */

export {
  DEFAULT_FILAMENT_OPTIONS,
  FILAMENT_ADAPTER_TOKEN,
  type FilamentAdapterOptions,
  type IFilamentSceneManager,
  type IFilamentSceneManagerFactory,
  isFilamentAdapterOptions,
  isFilamentAvailable,
  isWebGPUAvailable,
} from './FilamentAdapter';
