/**
 * Babylon.js Adapter Interface
 *
 * This file defines the interface for the Babylon.js implementation.
 * The actual implementation lives in apps/web where Babylon.js is available.
 *
 * To implement:
 * 1. Create a class that extends SceneManagerBase
 * 2. Implement the abstract methods (createScene, loadModelInternal, etc.)
 * 3. Create Babylon-specific IMeshHandle, ILightHandle, ICameraHandle implementations
 * 4. Wire up Babylon.js scene to IScene interface
 *
 * Example implementation location: apps/web/src/engine/rendering/BabylonSceneManager.ts
 */

import type { ISceneManager, ISceneManagerFactory } from '../interfaces';

/**
 * Options for creating a Babylon.js scene manager.
 */
export interface BabylonAdapterOptions {
  /** Enable anti-aliasing */
  antialias?: boolean;
  /** Enable stencil buffer */
  stencil?: boolean;
  /** Preserve drawing buffer for screenshots */
  preserveDrawingBuffer?: boolean;
  /** Power preference for GPU */
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  /** Enable hardware scaling */
  hardwareScaling?: boolean;
  /** Custom engine options passed directly to Babylon */
  engineOptions?: Record<string, unknown>;
}

/**
 * Default Babylon adapter options
 */
export const DEFAULT_BABYLON_OPTIONS: BabylonAdapterOptions = {
  antialias: true,
  stencil: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance',
  hardwareScaling: true,
};

/**
 * Type guard for Babylon adapter options
 */
export function isBabylonAdapterOptions(
  options: unknown
): options is BabylonAdapterOptions {
  if (!options || typeof options !== 'object') return false;
  const opt = options as BabylonAdapterOptions;
  return (
    (opt.antialias === undefined || typeof opt.antialias === 'boolean') &&
    (opt.stencil === undefined || typeof opt.stencil === 'boolean') &&
    (opt.preserveDrawingBuffer === undefined || typeof opt.preserveDrawingBuffer === 'boolean')
  );
}

/**
 * Factory interface for Babylon.js scene manager.
 * The actual factory is provided by apps/web.
 */
export interface IBabylonSceneManagerFactory extends ISceneManagerFactory {
  create(options?: BabylonAdapterOptions): ISceneManager;
}

/**
 * Placeholder type for Babylon-specific extensions.
 * Implementations can extend this to expose Babylon-specific functionality.
 */
export interface IBabylonSceneManager extends ISceneManager {
  /**
   * Get the underlying Babylon.js Scene object.
   * Use sparingly - prefer the abstract interface.
   */
  getBabylonScene(): unknown;

  /**
   * Get the underlying Babylon.js Engine object.
   */
  getBabylonEngine(): unknown;

  /**
   * Enable Babylon Inspector for debugging.
   * @param show Whether to show the inspector
   */
  toggleInspector(show?: boolean): void;

  /**
   * Create a screenshot of the current frame.
   * @param width Screenshot width
   * @param height Screenshot height
   * @returns Base64-encoded image data
   */
  screenshot(width?: number, height?: number): Promise<string>;
}

/**
 * Registration token for the Babylon adapter.
 * Used to register/lookup the adapter in a dependency injection container.
 */
export const BABYLON_ADAPTER_TOKEN = Symbol.for('rendering.adapter.babylon');

/**
 * Check if we're in an environment where Babylon.js is available.
 * Babylon requires a DOM environment with WebGL support.
 */
export function isBabylonAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined'
  );
}
