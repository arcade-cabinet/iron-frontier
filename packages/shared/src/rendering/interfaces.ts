/**
 * Rendering Abstraction Interfaces
 *
 * Core interfaces for the rendering abstraction layer.
 * These interfaces define the contract that both Babylon.js and Filament
 * implementations must fulfill.
 */

import type {
  Transform,
  PartialTransform,
  MeshConfig,
  CameraConfig,
  LightConfig,
  SceneConfig,
  EnvironmentConfig,
  RenderQuality,
  PickResult,
  Ray,
  SceneEvent,
  SceneEventHandler,
  SceneEventType,
  AnimationConfig,
  Vector3Tuple,
} from './types';

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
  animateTo(
    config: Partial<CameraConfig>,
    duration: number
  ): Promise<void>;

  /** Attach camera controls (orbit, pan, zoom) */
  attachControls(canvas: unknown): void;

  /** Detach camera controls */
  detachControls(): void;
}

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
  preloadModels(
    modelPaths: string[],
    onProgress?: (progress: number) => void
  ): Promise<void>;

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
