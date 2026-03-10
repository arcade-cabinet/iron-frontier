/**
 * Rendering Scene Manager Interfaces
 *
 * Scene manager and factory interfaces.
 */

import type { SceneConfig, Transform } from '../types.ts';
import type { IScene } from './scene.ts';

// ============================================================================
// SCENE MANAGER INTERFACE
// ============================================================================

/**
 * Scene manager interface.
 * Higher-level abstraction that manages the scene and provides utilities
 * for entity-to-mesh synchronization.
 */
export interface ISceneManager {
  /** Get the underlying scene */
  getScene(): IScene;

  // --- Initialization ---

  /**
   * Initialize the scene manager with a rendering surface.
   * @param surface Platform-specific surface (HTMLCanvasElement for web, View for mobile)
   * @param config Initial scene configuration
   * @returns Promise that resolves when initialization is complete
   */
  initialize(surface: unknown, config?: SceneConfig): Promise<void>;

  /**
   * Check if the manager is initialized and ready.
   */
  isReady(): boolean;

  // --- Model Management ---

  /**
   * Preload models for faster instantiation later.
   * @param modelPaths Array of model paths to preload
   * @param onProgress Progress callback (0-1)
   * @returns Promise that resolves when all models are loaded
   */
  preloadModels(modelPaths: string[], onProgress?: (progress: number) => void): Promise<void>;

  /**
   * Check if a model is already loaded/cached.
   * @param modelPath Path to the model
   */
  isModelLoaded(modelPath: string): boolean;

  /**
   * Unload a cached model to free memory.
   * @param modelPath Path to the model
   */
  unloadModel(modelPath: string): void;

  // --- Entity Synchronization ---

  /**
   * Register an entity-to-mesh mapping.
   * When the entity's transform changes, the mesh will be updated.
   * @param entityId ECS entity identifier
   * @param meshId Scene mesh identifier
   */
  registerEntityMesh(entityId: string, meshId: string): void;

  /**
   * Unregister an entity-to-mesh mapping.
   * @param entityId ECS entity identifier
   */
  unregisterEntityMesh(entityId: string): void;

  /**
   * Get the mesh ID for an entity.
   * @param entityId ECS entity identifier
   */
  getMeshForEntity(entityId: string): string | undefined;

  /**
   * Get the entity ID for a mesh.
   * @param meshId Scene mesh identifier
   */
  getEntityForMesh(meshId: string): string | undefined;

  /**
   * Update all registered entity meshes from current entity state.
   * @param getEntityTransform Function to get transform for an entity ID
   */
  syncEntities(getEntityTransform: (entityId: string) => Transform | undefined): void;

  // --- Lifecycle ---

  /**
   * Start the render loop.
   */
  start(): void;

  /**
   * Stop the render loop.
   */
  stop(): void;

  /**
   * Check if the render loop is running.
   */
  isRunning(): boolean;

  /**
   * Dispose of the scene manager and all resources.
   */
  dispose(): void;
}

// ============================================================================
// ADAPTER FACTORY INTERFACE
// ============================================================================

/**
 * Factory interface for creating platform-specific scene managers.
 * Each platform (web/mobile) provides its own implementation.
 */
export interface ISceneManagerFactory {
  /**
   * Create a new scene manager instance.
   * @param options Platform-specific options
   */
  create(options?: Record<string, unknown>): ISceneManager;
}
