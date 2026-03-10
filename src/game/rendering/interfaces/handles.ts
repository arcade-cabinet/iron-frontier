/**
 * Rendering Handle Interfaces
 *
 * Interfaces for mesh, light, and camera handles.
 */

import type {
  AnimationConfig,
  CameraConfig,
  LightConfig,
  PartialTransform,
  Transform,
  Vector3Tuple,
} from '../types.ts';

// ============================================================================
// MESH HANDLE
// ============================================================================

/**
 * Handle to a mesh instance in the scene.
 * Provides methods to manipulate the mesh without engine-specific code.
 */
export interface IMeshHandle {
  /** Unique identifier for this mesh */
  readonly id: string;

  /** Get the current transform */
  getTransform(): Transform;

  /** Set the complete transform */
  setTransform(transform: Transform): void;

  /** Update specific transform properties */
  updateTransform(partial: PartialTransform): void;

  /** Set position */
  setPosition(position: Vector3Tuple): void;

  /** Set rotation (Euler angles in radians) */
  setRotation(rotation: Vector3Tuple): void;

  /** Set uniform scale */
  setScale(scale: number | Vector3Tuple): void;

  /** Get visibility state */
  isVisible(): boolean;

  /** Set visibility */
  setVisible(visible: boolean): void;

  /** Check if mesh is currently enabled */
  isEnabled(): boolean;

  /** Enable/disable the mesh (different from visibility - disabled meshes don't update) */
  setEnabled(enabled: boolean): void;

  /** Play an animation by name */
  playAnimation(config: AnimationConfig): void;

  /** Stop an animation by name */
  stopAnimation(name: string): void;

  /** Stop all animations */
  stopAllAnimations(): void;

  /** Get list of available animation names */
  getAnimationNames(): string[];

  /** Get custom user data */
  getUserData(): Record<string, unknown>;

  /** Set custom user data */
  setUserData(data: Record<string, unknown>): void;

  /** Dispose of this mesh and release resources */
  dispose(): void;
}

// ============================================================================
// LIGHT HANDLE
// ============================================================================

/**
 * Handle to a light instance in the scene.
 */
export interface ILightHandle {
  /** Unique identifier for this light */
  readonly id: string;

  /** Get the current configuration */
  getConfig(): LightConfig;

  /** Update light configuration */
  updateConfig(config: Partial<LightConfig>): void;

  /** Get intensity */
  getIntensity(): number;

  /** Set intensity */
  setIntensity(intensity: number): void;

  /** Check if enabled */
  isEnabled(): boolean;

  /** Enable/disable the light */
  setEnabled(enabled: boolean): void;

  /** Dispose of this light */
  dispose(): void;
}

// ============================================================================
// CAMERA HANDLE
// ============================================================================

/**
 * Handle to the scene camera.
 */
export interface ICameraHandle {
  /** Get current configuration */
  getConfig(): CameraConfig;

  /** Set complete configuration */
  setConfig(config: CameraConfig): void;

  /** Set camera position */
  setPosition(position: Vector3Tuple): void;

  /** Set camera target/look-at point */
  setTarget(target: Vector3Tuple): void;

  /** Set field of view (degrees) */
  setFOV(fov: number): void;

  /** Smoothly animate camera to new position/target */
  animateTo(config: Partial<CameraConfig>, duration: number): Promise<void>;

  /** Attach camera controls (orbit, pan, zoom) */
  attachControls(canvas: unknown): void;

  /** Detach camera controls */
  detachControls(): void;
}
