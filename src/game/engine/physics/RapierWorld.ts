import type { Vector3 as BabylonVector3 } from '@babylonjs/core';
import RAPIER from '@dimforge/rapier3d-compat';
import type { HexGrid } from '../hex/HexGridRenderer';
import {
  DEFAULT_HEX_LAYOUT,
  HexBuildingType,
  HexFeatureType,
  HexTerrainType,
} from '../hex/HexTypes';
import { hexToWorld } from '../hex/HexGridRenderer';

export class RapierWorld {
  private world: RAPIER.World | null = null;
  private playerBody: RAPIER.RigidBody | null = null;
  private obstacleColliders: RAPIER.Collider[] = [];
  private initialized = false;

  async init(grid: HexGrid): Promise<void> {
    if (this.initialized) return;
    await RAPIER.init();
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.buildStaticObstacles(grid);
    this.initialized = true;
  }

  createPlayerBody(position: BabylonVector3): void {
    if (!this.world) return;
    if (this.playerBody) return;

    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      position.x,
      position.y,
      position.z,
    );
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.capsule(0.45, 0.25);
    colliderDesc.setFriction(1.0);
    colliderDesc.setRestitution(0.0);
    this.world.createCollider(colliderDesc, body);
    this.playerBody = body;
  }

  setPlayerPosition(position: BabylonVector3): void {
    if (!this.playerBody) return;
    this.playerBody.setNextKinematicTranslation({
      x: position.x,
      y: position.y,
      z: position.z,
    });
  }

  step(): void {
    this.world?.step();
  }

  dispose(): void {
    if (this.world) {
      this.obstacleColliders.forEach((collider) => this.world?.removeCollider(collider, true));
      if (this.playerBody) {
        this.world.removeRigidBody(this.playerBody);
      }
    }
    this.obstacleColliders = [];
    this.playerBody = null;
    this.world?.free();
    this.world = null;
    this.initialized = false;
  }

  private buildStaticObstacles(grid: HexGrid): void {
    if (!this.world) return;
    const radius = DEFAULT_HEX_LAYOUT.size * 0.9;
    const halfHeight = 0.6;

    for (const [key, tile] of grid.tiles) {
      const isBlocked =
        !tile.isPassable ||
        tile.terrain === HexTerrainType.WaterDeep ||
        tile.terrain === HexTerrainType.Lava ||
        tile.building !== HexBuildingType.None ||
        tile.feature === HexFeatureType.Ruins;

      if (!isBlocked) {
        continue;
      }

      const worldPos = hexToWorld(tile.coord, tile.elevation * 0.5, DEFAULT_HEX_LAYOUT);
      const colliderDesc = RAPIER.ColliderDesc.cylinder(halfHeight, radius).setTranslation(
        worldPos.x,
        worldPos.y + halfHeight,
        worldPos.z,
      );
      colliderDesc.setFriction(0.9);
      colliderDesc.setRestitution(0.0);
      const collider = this.world.createCollider(colliderDesc);
      this.obstacleColliders.push(collider);
    }
  }
}
