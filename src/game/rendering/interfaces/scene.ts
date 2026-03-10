/**
 * Rendering Scene Interface
 *
 * Main scene interface for managing 3D content.
 */

import type {
  CameraConfig,
  EnvironmentConfig,
  LightConfig,
  MeshConfig,
  PartialTransform,
  PickResult,
  Ray,
  RenderQuality,
  SceneEvent,
  SceneEventHandler,
  SceneEventType,
} from '../types.ts';
import type { ICameraHandle, ILightHandle, IMeshHandle } from './handles.ts';

// ============================================================================
// SCENE INTERFACE
// ============================================================================

/**
 * Main scene interface.
 * Provides all operations for managing 3D content in a platform-agnostic way.
 */
export interface IScene {
  /** Scene identifier */
  readonly id: string;

  // --- Mesh Management ---

  /**
   * Add a mesh to the scene.
   * @param id Unique identifier for the mesh
   * @param config Mesh configuration including model path and transform
   * @returns Promise resolving to the mesh handle
   */
  addMesh(id: string, config: MeshConfig): Promise<IMeshHandle>;

  /**
   * Get an existing mesh by ID.
   * @param id Mesh identifier
   * @returns Mesh handle or undefined if not found
   */
  getMesh(id: string): IMeshHandle | undefined;

  /**
   * Check if a mesh exists.
   * @param id Mesh identifier
   */
  hasMesh(id: string): boolean;

  /**
   * Remove a mesh from the scene.
   * @param id Mesh identifier
   */
  removeMesh(id: string): void;

  /**
   * Update a mesh's transform.
   * Convenience method that gets the mesh and updates it.
   * @param id Mesh identifier
   * @param transform New transform (complete or partial)
   */
  updateMesh(id: string, transform: PartialTransform): void;

  /**
   * Get all mesh IDs in the scene.
   */
  getMeshIds(): string[];

  // --- Light Management ---

  /**
   * Add a light to the scene.
   * @param id Unique identifier for the light
   * @param config Light configuration
   * @returns Light handle
   */
  addLight(id: string, config: LightConfig): ILightHandle;

  /**
   * Get an existing light by ID.
   * @param id Light identifier
   */
  getLight(id: string): ILightHandle | undefined;

  /**
   * Remove a light from the scene.
   * @param id Light identifier
   */
  removeLight(id: string): void;

  /**
   * Get all light IDs in the scene.
   */
  getLightIds(): string[];

  // --- Camera ---

  /**
   * Get the main camera.
   */
  getCamera(): ICameraHandle;

  /**
   * Set camera configuration.
   * @param config Camera configuration
   */
  setCamera(config: CameraConfig): void;

  // --- Environment ---

  /**
   * Set environment/skybox configuration.
   * @param config Environment configuration
   */
  setEnvironment(config: EnvironmentConfig): void;

  // --- Quality ---

  /**
   * Set render quality settings.
   * @param quality Quality configuration
   */
  setQuality(quality: RenderQuality): void;

  // --- Picking/Raycasting ---

  /**
   * Pick mesh at screen coordinates.
   * @param x Screen X coordinate
   * @param y Screen Y coordinate
   * @returns Pick result
   */
  pick(x: number, y: number): PickResult;

  /**
   * Cast a ray into the scene.
   * @param ray Ray definition
   * @returns Pick result
   */
  raycast(ray: Ray): PickResult;

  // --- Events ---

  /**
   * Subscribe to scene events.
   * @param type Event type
   * @param handler Event handler
   * @returns Unsubscribe function
   */
  on(type: SceneEventType, handler: SceneEventHandler): () => void;

  /**
   * Emit a scene event (used internally by implementations).
   * @param event Event to emit
   */
  emit(event: SceneEvent): void;

  // --- Lifecycle ---

  /**
   * Render one frame.
   * Called automatically in render loop, but can be called manually.
   */
  render(): void;

  /**
   * Resize the rendering surface.
   * @param width New width in pixels
   * @param height New height in pixels
   */
  resize(width: number, height: number): void;

  /**
   * Dispose of the scene and release all resources.
   */
  dispose(): void;
}
