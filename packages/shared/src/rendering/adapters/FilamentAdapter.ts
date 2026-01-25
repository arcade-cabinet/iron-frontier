/**
 * Filament/WebGPU Adapter Interface
 *
 * This file defines the interface for the Filament (React Native) implementation.
 * The actual implementation lives in apps/mobile where react-native-filament
 * or react-native-wgpu is available.
 *
 * Filament is Google's physically-based rendering engine, available for mobile
 * via react-native-filament. As an alternative, react-native-wgpu provides
 * direct WebGPU access.
 *
 * To implement:
 * 1. Create a class that extends SceneManagerBase
 * 2. Implement the abstract methods (createScene, loadModelInternal, etc.)
 * 3. Create Filament/WebGPU-specific IMeshHandle, ILightHandle, ICameraHandle implementations
 * 4. Wire up the native rendering to IScene interface
 *
 * Example implementation location: apps/mobile/src/engine/rendering/FilamentSceneManager.ts
 */

import type { ISceneManager, ISceneManagerFactory } from '../interfaces';

/**
 * Options for creating a Filament/WebGPU scene manager.
 */
export interface FilamentAdapterOptions {
  /** Quality preset for mobile performance */
  quality?: 'low' | 'medium' | 'high';
  /** Enable HDR rendering */
  hdr?: boolean;
  /** Enable anti-aliasing */
  msaa?: number;
  /** Enable shadows */
  shadows?: boolean;
  /** Shadow map quality (resolution) */
  shadowQuality?: number;
  /** Enable post-processing effects */
  postProcessing?: boolean;
  /** Backend preference */
  backend?: 'vulkan' | 'metal' | 'opengl' | 'webgpu';
}

/**
 * Default Filament adapter options (optimized for mobile)
 */
export const DEFAULT_FILAMENT_OPTIONS: FilamentAdapterOptions = {
  quality: 'medium',
  hdr: false,
  msaa: 2,
  shadows: true,
  shadowQuality: 1024,
  postProcessing: false,
  backend: 'metal', // Best for iOS
};

/**
 * Type guard for Filament adapter options
 */
export function isFilamentAdapterOptions(
  options: unknown
): options is FilamentAdapterOptions {
  if (!options || typeof options !== 'object') return false;
  const opt = options as FilamentAdapterOptions;
  return (
    (opt.quality === undefined || ['low', 'medium', 'high'].includes(opt.quality)) &&
    (opt.hdr === undefined || typeof opt.hdr === 'boolean') &&
    (opt.msaa === undefined || typeof opt.msaa === 'number')
  );
}

/**
 * Factory interface for Filament scene manager.
 * The actual factory is provided by apps/mobile.
 */
export interface IFilamentSceneManagerFactory extends ISceneManagerFactory {
  create(options?: FilamentAdapterOptions): ISceneManager;
}

/**
 * Placeholder type for Filament-specific extensions.
 * Implementations can extend this to expose Filament-specific functionality.
 */
export interface IFilamentSceneManager extends ISceneManager {
  /**
   * Get the underlying Filament Engine object.
   * Use sparingly - prefer the abstract interface.
   */
  getFilamentEngine(): unknown;

  /**
   * Get the underlying Filament Scene object.
   */
  getFilamentScene(): unknown;

  /**
   * Get the underlying Filament View object.
   */
  getFilamentView(): unknown;

  /**
   * Set dynamic resolution for performance scaling.
   * @param enabled Whether to enable dynamic resolution
   * @param minScale Minimum scale factor (0.5 = half resolution)
   * @param maxScale Maximum scale factor (1.0 = full resolution)
   */
  setDynamicResolution(
    enabled: boolean,
    minScale?: number,
    maxScale?: number
  ): void;

  /**
   * Set ambient occlusion settings.
   * @param enabled Whether to enable AO
   * @param radius AO radius
   * @param intensity AO intensity
   */
  setAmbientOcclusion(
    enabled: boolean,
    radius?: number,
    intensity?: number
  ): void;

  /**
   * Apply indirect lighting from an IBL (Image-Based Lighting) file.
   * @param iblPath Path to the .ktx IBL file
   * @param intensity Intensity multiplier
   */
  setIndirectLight(iblPath: string, intensity?: number): Promise<void>;

  /**
   * Get current frame time in milliseconds.
   * Useful for performance monitoring.
   */
  getFrameTime(): number;

  /**
   * Get GPU memory usage in bytes.
   */
  getGPUMemoryUsage(): number;
}

/**
 * Registration token for the Filament adapter.
 * Used to register/lookup the adapter in a dependency injection container.
 */
export const FILAMENT_ADAPTER_TOKEN = Symbol.for('rendering.adapter.filament');

/**
 * Check if we're in an environment where Filament/WebGPU is available.
 * This is typically React Native with the appropriate native modules.
 */
export function isFilamentAvailable(): boolean {
  // Check for React Native environment
  if (typeof navigator === 'undefined') return false;

  // Check for React Native product string
  const nav = navigator as Navigator & { product?: string; gpu?: unknown };
  if (nav.product === 'ReactNative') return true;

  // Check for WebGPU API (available via react-native-wgpu)
  return typeof nav.gpu !== 'undefined';
}

/**
 * Check if WebGPU is available (can be used as a Filament alternative).
 */
export function isWebGPUAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { gpu?: unknown };
  return typeof nav.gpu !== 'undefined';
}
