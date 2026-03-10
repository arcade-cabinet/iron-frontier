/**
 * Iron Frontier - ECS Barrel Export
 *
 * Public API for the entity-component system.
 */

// Components
export type {
  AIBehavior,
  AIBehaviorType,
  Collider,
  DialogueTarget,
  Entity,
  Faction,
  Health,
  Lifetime,
  Loot,
  NPCSchedule,
  Particle,
  Pickup,
  Position,
  Projectile,
  QuestGiver,
  Renderable,
  Rotation,
  ShopKeeper,
  Velocity,
} from './components';

// World & queries
export {
  world,
  npcs,
  enemies,
  projectiles,
  pickups,
  withLifetime,
  movers,
  renderables,
  dialogueTargets,
  questGivers,
} from './world';
export type {
  NPCEntity,
  EnemyEntity,
  ProjectileEntity,
  PickupEntity,
  MoverEntity,
} from './world';

// Archetypes
export {
  createNPC,
  createEnemy,
  createProjectile,
  createPickup,
  createParticle,
} from './archetypes';
export type {
  CreateNPCConfig,
  CreateEnemyConfig,
} from './archetypes';

// Systems
export { movementSystem } from './systems/MovementSystem';
export { projectileSystem } from './systems/ProjectileSystem';
export type { ProjectileHitCallback } from './systems/ProjectileSystem';
export { lifetimeSystem } from './systems/LifetimeSystem';
export { aiSystem } from './systems/AISystem';
export type { AIContext } from './systems/AISystem';
export { SystemRunner } from './systems/SystemRunner';
export type { SystemRunnerConfig } from './systems/SystemRunner';
