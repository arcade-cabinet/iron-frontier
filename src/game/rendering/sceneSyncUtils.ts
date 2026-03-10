/**
 * Scene sync utilities - Entity-scene synchronization helpers
 *
 * Provides functions for syncing ECS entity transforms to scene meshes.
 */

import type { IScene } from './interfaces';
import type { MeshConfig, Transform } from './types';

/**
 * Entity with transform component (minimal interface for ECS integration)
 */
export interface EntityWithTransform {
  id: string;
  transform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

/**
 * Entity with renderable component (mesh path)
 */
export interface EntityWithRenderable extends EntityWithTransform {
  renderable?: {
    modelPath: string;
    visible?: boolean;
  };
}

/**
 * Sync a collection of entities to a scene.
 * Creates meshes for new entities, updates existing ones, removes stale ones.
 *
 * @param entities Array of entities with transform and renderable components
 * @param scene The scene to sync to
 * @param existingMeshIds Set of mesh IDs currently in the scene
 * @returns Updated set of mesh IDs
 */
export async function syncEntitiesToScene(
  entities: EntityWithRenderable[],
  scene: IScene,
  existingMeshIds: Set<string> = new Set()
): Promise<Set<string>> {
  const currentMeshIds = new Set<string>();

  for (const entity of entities) {
    if (!entity.transform || !entity.renderable) continue;

    const meshId = entity.id;
    currentMeshIds.add(meshId);

    const config: MeshConfig = {
      modelPath: entity.renderable.modelPath,
      transform: {
        position: entity.transform.position,
        rotation: entity.transform.rotation,
        scale: entity.transform.scale,
      },
      visible: entity.renderable.visible ?? true,
    };

    if (scene.hasMesh(meshId)) {
      // Update existing mesh
      const mesh = scene.getMesh(meshId);
      if (mesh) {
        mesh.setTransform(config.transform);
        mesh.setVisible(config.visible ?? true);
      }
    } else {
      // Create new mesh
      await scene.addMesh(meshId, config);
    }
  }

  // Remove meshes for entities that no longer exist
  for (const meshId of existingMeshIds) {
    if (!currentMeshIds.has(meshId)) {
      scene.removeMesh(meshId);
    }
  }

  return currentMeshIds;
}

/**
 * Create a transform getter function from a map of entity transforms.
 * Useful for syncEntities() when transforms are stored separately.
 */
export function createTransformGetter(
  transforms: Map<string, Transform>
): (entityId: string) => Transform | undefined {
  return (entityId: string) => transforms.get(entityId);
}
