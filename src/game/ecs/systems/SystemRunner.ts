/**
 * Iron Frontier - System Runner
 *
 * Ticks all ECS systems in the correct order each frame.
 * The runner is the single entry point called from the game loop.
 *
 * System order:
 *   1. AI        — decide intent, set velocities
 *   2. Movement  — apply velocities to positions
 *   3. Projectile — move bullets, detect hits
 *   4. Lifetime  — expire temporary entities
 */

import Alea from 'alea';

import type { Position } from '../components';
import { world } from '../world';
import { enemies } from '../world';
import { aiSystem } from './AISystem';
import type { AIContext } from './AISystem';
import { lifetimeSystem } from './LifetimeSystem';
import { movementSystem } from './MovementSystem';
import { projectileSystem } from './ProjectileSystem';
import type { ProjectileHitCallback } from './ProjectileSystem';

// ============================================================================
// RUNNER CONFIG
// ============================================================================

export interface SystemRunnerConfig {
  /** Seed for the AI PRNG. Defaults to 'iron-frontier'. */
  aiSeed?: string;
  /** Called when a projectile hits an entity. */
  onProjectileHit?: ProjectileHitCallback;
}

// ============================================================================
// RUNNER
// ============================================================================

export class SystemRunner {
  private readonly rng: ReturnType<typeof Alea>;
  private readonly onProjectileHit?: ProjectileHitCallback;

  constructor(config: SystemRunnerConfig = {}) {
    this.rng = Alea(config.aiSeed ?? 'iron-frontier');
    this.onProjectileHit = config.onProjectileHit;
  }

  /**
   * Run all systems for a single frame.
   *
   * @param deltaTime Seconds elapsed since last frame.
   * @param playerPosition Current player world position (for AI).
   */
  tick(deltaTime: number, playerPosition: Position): void {
    // Clamp deltaTime to avoid spiral-of-death when tab is backgrounded
    const dt = Math.min(deltaTime, 0.1);

    const aiCtx: AIContext = {
      playerPosition,
      rng: this.rng,
    };

    // 1. AI decides intent
    aiSystem(world, dt, aiCtx);

    // 2. Movement applies velocity
    movementSystem(world, dt);

    // 3. Projectiles move, collide, expire
    projectileSystem(world, dt, enemies, this.onProjectileHit);

    // 4. Lifetime cleanup
    lifetimeSystem(world, dt);
  }

  /**
   * Remove all entities from the world. Useful for scene transitions.
   */
  clear(): void {
    const allEntities = [...world.entities];
    for (const entity of allEntities) {
      world.remove(entity);
    }
  }
}
