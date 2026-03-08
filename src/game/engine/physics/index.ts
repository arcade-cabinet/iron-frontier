// src/game/engine/physics — Barrel export for the physics abstraction layer.
//
// This module provides a raycasting-based physics system that works without
// Rapier. The API is designed so that a Rapier backend can be swapped in
// later by reimplementing PhysicsWorld internals while keeping the same
// public surface area.
//
// For the legacy direct-Rapier integration, see RapierWorld.ts in this
// same directory.

// --- PhysicsWorld ---
export { PhysicsWorld } from './PhysicsWorld';
export type {
  RaycastHit,
  RaycastMiss,
  RaycastResult,
  MoveResult,
  TriggerEvent,
  TriggerOverlapInfo,
} from './PhysicsWorld';

// --- PlayerController ---
export { PlayerController } from './PlayerController';
export type { PlayerState, TriggerCallback } from './PlayerController';

// --- CollisionShapes ---
export {
  createBoxCollider,
  createCapsuleCollider,
  createNpcCapsule,
  createProjectileSphere,
  createHeightfieldCollider,
  createTerrainCollider,
  createTriggerVolume,
  extractBuildingColliders,
  buildHeightfieldMesh,
  resetColliderIds,
} from './CollisionShapes';
export type {
  BoxCollider,
  CapsuleCollider,
  SphereCollider,
  HeightfieldCollider,
  TrimeshCollider,
  TriggerCollider,
  Collider,
  SolidCollider,
  ColliderType,
} from './CollisionShapes';
