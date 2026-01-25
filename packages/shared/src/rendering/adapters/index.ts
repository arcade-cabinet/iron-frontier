/**
 * Rendering Adapters Index
 *
 * Exports interfaces and utilities for platform-specific rendering adapters.
 * Actual implementations are provided by apps/web (Babylon) and apps/mobile (Filament).
 */

export {
  BABYLON_ADAPTER_TOKEN,
  type BabylonAdapterOptions,
  DEFAULT_BABYLON_OPTIONS,
  type IBabylonSceneManager,
  type IBabylonSceneManagerFactory,
  isBabylonAdapterOptions,
  isBabylonAvailable,
} from './BabylonAdapter';

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
