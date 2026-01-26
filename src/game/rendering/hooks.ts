/**
 * Rendering Hooks and React Integration
 *
 * Provides React hooks for interacting with the rendering system.
 * These hooks are platform-agnostic and work with any ISceneManager implementation.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { IMeshHandle, IScene, ISceneManager } from './interfaces';
import type { MeshConfig, SceneConfig, Transform } from './types';

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * Context value for the scene manager
 */
export interface SceneManagerContextValue {
  /** The scene manager instance */
  manager: ISceneManager | null;
  /** Whether the manager is ready */
  ready: boolean;
  /** Any initialization error */
  error: Error | null;
}

/**
 * React context for the scene manager
 */
export const SceneManagerContext = createContext<SceneManagerContextValue>({
  manager: null,
  ready: false,
  error: null,
});

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get the scene manager from context.
 * Throws if not available.
 */
export function useSceneManager(): ISceneManager {
  const ctx = useContext(SceneManagerContext);
  if (!ctx.manager) {
    throw new Error(
      'useSceneManager must be used within a SceneManagerProvider. ' +
        'Make sure you have wrapped your app with the appropriate provider.'
    );
  }
  if (!ctx.ready) {
    throw new Error(
      'Scene manager is not ready yet. ' +
        'Wait for initialization to complete before using the scene manager.'
    );
  }
  return ctx.manager;
}

/**
 * Get the scene manager from context, but don't throw if unavailable.
 * Returns null if the manager is not ready.
 */
export function useSceneManagerSafe(): ISceneManager | null {
  const ctx = useContext(SceneManagerContext);
  if (!ctx.manager || !ctx.ready) {
    return null;
  }
  return ctx.manager;
}

/**
 * Get the underlying scene from the scene manager.
 */
export function useScene(): IScene {
  const manager = useSceneManager();
  return manager.getScene();
}

/**
 * Get the scene from context, but don't throw if unavailable.
 */
export function useSceneSafe(): IScene | null {
  const manager = useSceneManagerSafe();
  return manager?.getScene() ?? null;
}

/**
 * Check if the scene manager is ready.
 */
export function useSceneManagerReady(): boolean {
  const ctx = useContext(SceneManagerContext);
  return ctx.ready;
}

/**
 * Get any initialization error from the scene manager.
 */
export function useSceneManagerError(): Error | null {
  const ctx = useContext(SceneManagerContext);
  return ctx.error;
}

/**
 * Hook to create and manage a mesh in the scene.
 * Automatically removes the mesh when the component unmounts.
 *
 * @param id Unique mesh identifier
 * @param config Mesh configuration
 * @returns Mesh handle or null if not yet loaded
 */
export function useMesh(id: string, config: MeshConfig | null): IMeshHandle | null {
  const scene = useSceneSafe();
  const [mesh, setMesh] = useState<IMeshHandle | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!scene || !config) {
      setMesh(null);
      return;
    }

    let disposed = false;

    // Create the mesh
    scene
      .addMesh(id, config)
      .then((handle) => {
        if (!disposed && mountedRef.current) {
          setMesh(handle);
        } else {
          // Component unmounted before mesh loaded
          handle.dispose();
        }
      })
      .catch((err) => {
        console.error(`[useMesh] Failed to create mesh ${id}:`, err);
      });

    return () => {
      disposed = true;
      if (scene.hasMesh(id)) {
        scene.removeMesh(id);
      }
      setMesh(null);
    };
  }, [scene, id, config?.modelPath]); // Only recreate if scene, id, or model path changes

  // Update transform when config changes (but don't recreate mesh)
  useEffect(() => {
    if (mesh && config) {
      mesh.setTransform(config.transform);
      mesh.setVisible(config.visible ?? true);
    }
  }, [mesh, config?.transform, config?.visible]);

  return mesh;
}

/**
 * Hook to sync an entity's transform to a mesh.
 * Use this when you have a mesh already created and just want to keep it in sync.
 *
 * @param meshId Mesh identifier
 * @param transform Transform to sync
 */
export function useMeshTransformSync(meshId: string, transform: Transform | null): void {
  const scene = useSceneSafe();

  useEffect(() => {
    if (!scene || !transform) return;

    const mesh = scene.getMesh(meshId);
    if (mesh) {
      mesh.setTransform(transform);
    }
  }, [scene, meshId, transform]);
}

/**
 * Hook to register an entity-mesh mapping in the scene manager.
 * Automatically unregisters when the component unmounts.
 *
 * @param entityId ECS entity identifier
 * @param meshId Scene mesh identifier
 */
export function useEntityMeshMapping(entityId: string | null, meshId: string | null): void {
  const manager = useSceneManagerSafe();

  useEffect(() => {
    if (!manager || !entityId || !meshId) return;

    manager.registerEntityMesh(entityId, meshId);

    return () => {
      manager.unregisterEntityMesh(entityId);
    };
  }, [manager, entityId, meshId]);
}

/**
 * Hook to preload models.
 *
 * @param modelPaths Array of model paths to preload
 * @returns Loading state: { loading, progress, error }
 */
export function usePreloadModels(modelPaths: string[]): {
  loading: boolean;
  progress: number;
  error: Error | null;
} {
  const manager = useSceneManagerSafe();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!manager || modelPaths.length === 0) {
      setLoading(false);
      setProgress(1);
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    manager
      .preloadModels(modelPaths, setProgress)
      .then(() => {
        setLoading(false);
        setProgress(1);
      })
      .catch((err) => {
        setLoading(false);
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, [manager, JSON.stringify(modelPaths)]);

  return { loading, progress, error };
}

/**
 * Hook to get a callback for syncing entities to the scene.
 * Call the returned function whenever entity transforms change.
 */
export function useEntitySync(): (
  getEntityTransform: (entityId: string) => Transform | undefined
) => void {
  const manager = useSceneManagerSafe();

  return useCallback(
    (getEntityTransform: (entityId: string) => Transform | undefined) => {
      manager?.syncEntities(getEntityTransform);
    },
    [manager]
  );
}

/**
 * Hook to control the render loop.
 *
 * @param autoStart Whether to automatically start the render loop
 * @returns Control functions: { start, stop, isRunning }
 */
export function useRenderLoop(autoStart: boolean = true): {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
} {
  const manager = useSceneManagerSafe();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (manager) {
      setIsRunning(manager.isRunning());
    }
  }, [manager]);

  useEffect(() => {
    if (manager && autoStart) {
      manager.start();
      setIsRunning(true);
    }

    return () => {
      // Don't stop on unmount - let the provider handle that
    };
  }, [manager, autoStart]);

  const start = useCallback(() => {
    manager?.start();
    setIsRunning(true);
  }, [manager]);

  const stop = useCallback(() => {
    manager?.stop();
    setIsRunning(false);
  }, [manager]);

  return { start, stop, isRunning };
}

/**
 * Hook to handle pointer/touch events on meshes.
 *
 * @param onPick Callback when a mesh is picked
 * @param onMiss Callback when the ground/empty space is clicked
 */
export function useScenePicking(
  onPick?: (meshId: string, position: [number, number, number]) => void,
  onMiss?: (position: [number, number, number]) => void
): void {
  const scene = useSceneSafe();

  useEffect(() => {
    if (!scene) return;

    const unsubscribe = scene.on('pointerDown', (event) => {
      if (event.pickResult?.hit && event.pickResult.meshId && event.pickResult.position) {
        onPick?.(event.pickResult.meshId, event.pickResult.position);
      } else if (event.pickResult?.position) {
        onMiss?.(event.pickResult.position);
      }
    });

    return unsubscribe;
  }, [scene, onPick, onMiss]);
}
