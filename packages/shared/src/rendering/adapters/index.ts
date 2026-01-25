/**
 * Rendering Adapters Index
 *
 * Exports interfaces and utilities for platform-specific rendering adapters.
 * Actual implementations are provided by apps/web (Babylon) and apps/mobile (Filament).
 */

export {
  type BabylonAdapterOptions,
  type IBabylonSceneManagerFactory,
  type IBabylonSceneManager,
  DEFAULT_BABYLON_OPTIONS,
  isBabylonAdapterOptions,
  isBabylonAvailable,
  BABYLON_ADAPTER_TOKEN,
} from './BabylonAdapter';

export {
  type FilamentAdapterOptions,
  type IFilamentSceneManagerFactory,
  type IFilamentSceneManager,
  DEFAULT_FILAMENT_OPTIONS,
  isFilamentAdapterOptions,
  isFilamentAvailable,
  isWebGPUAvailable,
  FILAMENT_ADAPTER_TOKEN,
} from './FilamentAdapter';
