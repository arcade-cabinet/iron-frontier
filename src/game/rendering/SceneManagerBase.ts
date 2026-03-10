/**
 * SceneManagerBase - Abstract base implementation for scene managers
 *
 * Provides common functionality for entity-mesh mapping and lifecycle management.
 * Platform-specific adapters (Babylon, Filament) extend this class.
 */

import type { IScene, ISceneManager } from './interfaces';
import type { MeshConfig, SceneConfig, Transform } from './types';

// Re-export sync utilities for backwards compatibility
export {
  createTransformGetter,
  syncEntitiesToScene,
  type EntityWithRenderable,
  type EntityWithTransform,
} from './sceneSyncUtils';

/**
 * Abstract base class for scene managers.
 * Handles entity-mesh mapping and common lifecycle operations.
 */
export abstract class SceneManagerBase implements ISceneManager {
  /** The underlying scene instance */
  protected scene: IScene | null = null;

  /** Map of entity IDs to mesh IDs */
  protected entityToMesh: Map<string, string> = new Map();

  /** Map of mesh IDs to entity IDs */
  protected meshToEntity: Map<string, string> = new Map();

  /** Set of preloaded model paths */
  protected preloadedModels: Set<string> = new Set();

  /** Animation frame ID for render loop */
  protected animationFrameId: number | null = null;

  /** Whether the render loop is running */
  protected running: boolean = false;

  /** Whether initialization is complete */
  protected ready: boolean = false;

  // ============================================================================
  // Abstract methods - must be implemented by platform adapters
  // ============================================================================

  protected abstract createScene(surface: unknown, config?: SceneConfig): Promise<IScene>;
  protected abstract loadModelInternal(modelPath: string): Promise<void>;
  protected abstract unloadModelInternal(modelPath: string): void;
  protected abstract requestFrame(callback: () => void): number;
  protected abstract cancelFrame(id: number): void;

  // ============================================================================
  // ISceneManager Implementation
  // ============================================================================

  getScene(): IScene {
    if (!this.scene) {
      throw new Error('SceneManager not initialized. Call initialize() first.');
    }
    return this.scene;
  }

  async initialize(surface: unknown, config?: SceneConfig): Promise<void> {
    if (this.ready) {
      console.warn('[SceneManager] Already initialized');
      return;
    }

    this.scene = await this.createScene(surface, config);
    this.ready = true;

    console.log('[SceneManager] Initialized');
  }

  isReady(): boolean {
    return this.ready;
  }

  async preloadModels(
    modelPaths: string[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const total = modelPaths.length;
    let loaded = 0;

    for (const path of modelPaths) {
      if (!this.preloadedModels.has(path)) {
        await this.loadModelInternal(path);
        this.preloadedModels.add(path);
      }
      loaded++;
      onProgress?.(loaded / total);
    }

    console.log(`[SceneManager] Preloaded ${total} models`);
  }

  isModelLoaded(modelPath: string): boolean {
    return this.preloadedModels.has(modelPath);
  }

  unloadModel(modelPath: string): void {
    if (this.preloadedModels.has(modelPath)) {
      this.unloadModelInternal(modelPath);
      this.preloadedModels.delete(modelPath);
    }
  }

  registerEntityMesh(entityId: string, meshId: string): void {
    const existingMesh = this.entityToMesh.get(entityId);
    if (existingMesh) {
      this.meshToEntity.delete(existingMesh);
    }

    const existingEntity = this.meshToEntity.get(meshId);
    if (existingEntity) {
      this.entityToMesh.delete(existingEntity);
    }

    this.entityToMesh.set(entityId, meshId);
    this.meshToEntity.set(meshId, entityId);
  }

  unregisterEntityMesh(entityId: string): void {
    const meshId = this.entityToMesh.get(entityId);
    if (meshId) {
      this.entityToMesh.delete(entityId);
      this.meshToEntity.delete(meshId);
    }
  }

  getMeshForEntity(entityId: string): string | undefined {
    return this.entityToMesh.get(entityId);
  }

  getEntityForMesh(meshId: string): string | undefined {
    return this.meshToEntity.get(meshId);
  }

  syncEntities(getEntityTransform: (entityId: string) => Transform | undefined): void {
    if (!this.scene) return;

    for (const [entityId, meshId] of this.entityToMesh) {
      const transform = getEntityTransform(entityId);
      if (transform) {
        const mesh = this.scene.getMesh(meshId);
        if (mesh) {
          mesh.setTransform(transform);
        }
      }
    }
  }

  start(): void {
    if (this.running) return;
    if (!this.ready) {
      console.warn('[SceneManager] Cannot start - not initialized');
      return;
    }

    this.running = true;
    this.renderLoop();
    console.log('[SceneManager] Render loop started');
  }

  stop(): void {
    if (!this.running) return;

    this.running = false;
    if (this.animationFrameId !== null) {
      this.cancelFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('[SceneManager] Render loop stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  dispose(): void {
    this.stop();

    this.entityToMesh.clear();
    this.meshToEntity.clear();
    this.preloadedModels.clear();

    if (this.scene) {
      this.scene.dispose();
      this.scene = null;
    }

    this.ready = false;
    console.log('[SceneManager] Disposed');
  }

  // ============================================================================
  // Protected helpers
  // ============================================================================

  protected renderLoop = (): void => {
    if (!this.running || !this.scene) return;

    this.scene.render();
    this.animationFrameId = this.requestFrame(this.renderLoop);
  };
}
