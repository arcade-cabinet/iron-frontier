/**
 * Iron Frontier - ECS World Instance & Queries
 *
 * Creates the singleton Miniplex World and pre-builds the most commonly
 * used queries so they are shared across all systems. Queries are lazy-connected:
 * they only start tracking entities when first iterated.
 */

import { World } from 'miniplex';

import type { With } from 'miniplex';

import type {
  AIBehavior,
  Entity,
  Health,
  Lifetime,
  Loot,
  Pickup,
  Position,
  Projectile,
  Renderable,
  Velocity,
} from './components';

// ============================================================================
// WORLD SINGLETON
// ============================================================================

export const world = new World<Entity>();

// ============================================================================
// COMMON QUERIES
// ============================================================================

/** Entities with position, health, AI behavior, and a renderable mesh. */
export const npcs = world.with('position', 'health', 'aiBehavior', 'renderable');

/** Entities with position, health, AI behavior, and a loot table (enemies). */
export const enemies = world.with('position', 'health', 'aiBehavior', 'loot');

/** Active projectiles in flight. */
export const projectiles = world.with('position', 'velocity', 'projectile');

/** Pickups lying in the world. */
export const pickups = world.with('position', 'pickup');

/** Any entity with a time-based lifetime (particles, temp effects). */
export const withLifetime = world.with('lifetime');

/** All entities that have a position and velocity (for movement). */
export const movers = world.with('position', 'velocity');

/** All renderable entities (for draw loop). */
export const renderables = world.with('position', 'renderable');

/** Entities with dialogue capability. */
export const dialogueTargets = world.with('position', 'dialogueTarget');

/** Quest-giving entities. */
export const questGivers = world.with('position', 'questGiver');

// ============================================================================
// QUERY TYPE ALIASES (convenience for systems that need typed iteration)
// ============================================================================

export type NPCEntity = With<Entity, 'position' | 'health' | 'aiBehavior' | 'renderable'>;
export type EnemyEntity = With<Entity, 'position' | 'health' | 'aiBehavior' | 'loot'>;
export type ProjectileEntity = With<Entity, 'position' | 'velocity' | 'projectile'>;
export type PickupEntity = With<Entity, 'position' | 'pickup'>;
export type MoverEntity = With<Entity, 'position' | 'velocity'>;
