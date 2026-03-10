// EnemyAnimations — Per-type idle and attack animation logic
//
// Each enemy type has distinct idle/attack behaviours applied via useFrame.
// All animations are deterministic — phase offsets seeded via alea.
// No scopedRNG('render', 42, rngTick()).
//
// Actual per-type tick functions live in EnemyAnimations.ticks.ts
// to keep each file under 300 lines.

import * as THREE from 'three';

import type { EnemyType } from './MonsterFactory';
import {
  animateOutlaw,
  animateBanditBoss,
  animateCoyote,
  animateRattlesnake,
  animateScorpion,
  animateMineCrawler,
  animateDustDevil,
  animateClockwork,
  animateWendigo,
  animateRailWraith,
} from './EnemyAnimations.ticks';
import { scopedRNG, rngTick } from '../../lib/prng';

// ---------------------------------------------------------------------------
// Animation state tracked per-enemy instance
// ---------------------------------------------------------------------------

export interface EnemyAnimState {
  phase: number;
  attackTimer: number;
  attacking: boolean;
  /** Type-specific extra state. */
  extra: Record<string, number>;
}

export function createAnimState(): EnemyAnimState {
  return { phase: 0, attackTimer: 0, attacking: false, extra: {} };
}

// ---------------------------------------------------------------------------
// Main tick dispatcher
// ---------------------------------------------------------------------------

/**
 * Advance the idle animation for the given enemy type.
 * Called every frame from useFrame. Mutates the group in place.
 */
export function tickIdleAnimation(
  type: EnemyType,
  root: THREE.Group,
  state: EnemyAnimState,
  delta: number,
  phaseOffset: number,
): void {
  state.phase += delta;
  const t = state.phase + phaseOffset;

  switch (type) {
    case 'outlaw':
      animateOutlaw(root, t, delta);
      break;
    case 'coyote':
      animateCoyote(root, t, delta);
      break;
    case 'rattlesnake':
      animateRattlesnake(root, t, delta);
      break;
    case 'scorpion':
      animateScorpion(root, t, delta);
      break;
    case 'banditBoss':
      animateBanditBoss(root, t, delta);
      break;
    case 'mineCrawler':
      animateMineCrawler(root, t, delta);
      break;
    case 'dustDevil':
      animateDustDevil(root, t, delta);
      break;
    case 'clockworkAutomaton':
      animateClockwork(root, t, delta);
      break;
    case 'wendigo':
      animateWendigo(root, t, delta);
      break;
    case 'railWraith':
      animateRailWraith(root, t, delta, state);
      break;
  }
}
