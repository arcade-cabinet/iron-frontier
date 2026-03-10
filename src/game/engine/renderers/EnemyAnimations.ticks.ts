// EnemyAnimations.ticks — Per-type idle animation implementations
//
// Split from EnemyAnimations.ts to stay under 300 lines per file.
// Contains the actual animation tick functions for each enemy type.

import * as THREE from 'three';

import type { EnemyAnimState } from './EnemyAnimations';

// ---------------------------------------------------------------------------
// Humanoid animations
// ---------------------------------------------------------------------------

/** Outlaw: gunslinger stance sway — slow lateral weight shift. */
export function animateOutlaw(root: THREE.Group, t: number, _delta: number): void {
  root.rotation.z = Math.sin(t * 0.8) * 0.03;
  root.position.y = Math.sin(t * 1.6) * 0.01;

  const armL = root.getObjectByName('arm_l');
  const armR = root.getObjectByName('arm_r');
  if (armL) armL.rotation.x = Math.sin(t * 1.2) * 0.05;
  if (armR) armR.rotation.x = Math.sin(t * 1.2 + Math.PI) * 0.05;
}

/** Bandit Boss: imposing stance — slow powerful sway. */
export function animateBanditBoss(root: THREE.Group, t: number, _delta: number): void {
  root.rotation.z = Math.sin(t * 0.5) * 0.02;
  root.position.y = Math.sin(t * 1.0) * 0.015;

  const head = root.getObjectByName('head');
  if (head) head.rotation.y = Math.sin(t * 0.4) * 0.2;
}

// ---------------------------------------------------------------------------
// Creature animations
// ---------------------------------------------------------------------------

/** Coyote: padding walk cycle — alternating leg movement. */
export function animateCoyote(root: THREE.Group, t: number, _delta: number): void {
  const body = root.getObjectByName('body');
  if (body) body.position.y = 0.4 + Math.sin(t * 3) * 0.015;

  const fl = root.getObjectByName('leg_fl');
  const fr = root.getObjectByName('leg_fr');
  const bl = root.getObjectByName('leg_bl');
  const br = root.getObjectByName('leg_br');
  if (fl) fl.rotation.x = Math.sin(t * 3) * 0.2;
  if (br) br.rotation.x = Math.sin(t * 3) * 0.2;
  if (fr) fr.rotation.x = Math.sin(t * 3 + Math.PI) * 0.2;
  if (bl) bl.rotation.x = Math.sin(t * 3 + Math.PI) * 0.2;

  const tail = root.getObjectByName('tail');
  if (tail) tail.rotation.y = Math.sin(t * 2) * 0.15;

  const head = root.getObjectByName('head');
  if (head) {
    (head as THREE.Mesh).position.y = 0.55 + Math.sin(t * 3 + 0.5) * 0.01;
  }
}

/** Rattlesnake: slither — sine wave body segments. */
export function animateRattlesnake(root: THREE.Group, t: number, _delta: number): void {
  for (let i = 0; i < 14; i++) {
    const seg = root.getObjectByName(`seg_${i}`);
    if (!seg) continue;
    const phaseOff = i * 0.5;
    seg.position.x += Math.sin(t * 2 + phaseOff) * 0.001;
    seg.rotation.z = Math.sin(t * 2 + phaseOff) * 0.15;
  }

  const tongueL = root.getObjectByName('tongue_l');
  const tongueR = root.getObjectByName('tongue_r');
  const tongueVisible = Math.sin(t * 6) > 0.6;
  if (tongueL) tongueL.visible = tongueVisible;
  if (tongueR) tongueR.visible = tongueVisible;

  for (let r = 0; r < 4; r++) {
    const rattle = root.getObjectByName(`rattle_${r}`);
    if (rattle) rattle.position.x += Math.sin(t * 15 + r) * 0.0005;
  }
}

/** Scorpion: skitter — rapid leg cycling and tail sway. */
export function animateScorpion(root: THREE.Group, t: number, _delta: number): void {
  for (let side = -1; side <= 1; side += 2) {
    const prefix = side > 0 ? 'r' : 'l';
    for (let i = 0; i < 4; i++) {
      const leg = root.getObjectByName(`leg_${prefix}${i}`);
      if (leg) {
        const phase = i * Math.PI * 0.5;
        leg.rotation.x = Math.sin(t * 5 + phase) * 0.15;
      }
    }
  }

  const pincerL = root.getObjectByName('pincer_l');
  const pincerR = root.getObjectByName('pincer_r');
  const pincerAngle = Math.sin(t * 1.5) * 0.1;
  if (pincerL) pincerL.rotation.z = 0.4 + pincerAngle;
  if (pincerR) pincerR.rotation.z = -0.4 - pincerAngle;

  const tail = root.getObjectByName('tail');
  if (tail) tail.rotation.y = Math.sin(t * 1.2) * 0.1;

  const stinger = root.getObjectByName('stinger');
  if (stinger) stinger.rotation.z = Math.sin(t * 3) * 0.08;
}

/** Mine Crawler: creepy leg cycle — asymmetric multi-leg movement. */
export function animateMineCrawler(root: THREE.Group, t: number, _delta: number): void {
  for (const prefix of ['l', 'r']) {
    for (let i = 0; i < 3; i++) {
      const upper = root.getObjectByName(`leg_upper_${prefix}${i}`);
      const lower = root.getObjectByName(`leg_lower_${prefix}${i}`);
      const phase = i * Math.PI * 0.7 + (prefix === 'r' ? Math.PI * 0.5 : 0);
      if (upper) upper.rotation.x = Math.sin(t * 4 + phase) * 0.12;
      if (lower) lower.rotation.x = Math.sin(t * 4 + phase + 0.5) * 0.08;
    }
  }

  const body = root.getObjectByName('body');
  if (body) body.position.y = 0.2 + Math.sin(t * 2.5) * 0.01;

  const eye = root.getObjectByName('eye');
  if (eye && eye instanceof THREE.Mesh) {
    const mat = eye.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.8 + Math.sin(t * 8) * 0.2;
  }

  const mandL = root.getObjectByName('mandible_l');
  const mandR = root.getObjectByName('mandible_r');
  if (mandL) mandL.rotation.x = 0.3 + Math.sin(t * 3) * 0.1;
  if (mandR) mandR.rotation.x = 0.3 + Math.sin(t * 3 + 0.3) * 0.1;
}

// ---------------------------------------------------------------------------
// Supernatural / mechanical animations
// ---------------------------------------------------------------------------

/** Dust Devil: constant spin with expanding/contracting. */
export function animateDustDevil(root: THREE.Group, t: number, _delta: number): void {
  const vortex = root.getObjectByName('vortex');
  if (vortex) vortex.rotation.y = t * 3;

  const core = root.getObjectByName('core');
  if (core) {
    const pulse = 1 + Math.sin(t * 4) * 0.2;
    core.scale.set(pulse, pulse, pulse);
  }

  const debris = root.getObjectByName('debris');
  if (debris) debris.rotation.y = t * 2;

  for (let i = 0; i < 8; i++) {
    const d = root.getObjectByName(`debris_${i}`);
    if (d) {
      d.rotation.x += 0.02;
      d.rotation.z += 0.015;
    }
  }

  root.position.x = Math.sin(t * 0.7) * 0.05;
  root.position.z = Math.cos(t * 0.5) * 0.03;
}

/** Clockwork: mechanical stride — gear rotation, piston movement. */
export function animateClockwork(root: THREE.Group, t: number, _delta: number): void {
  for (let i = 0; i < 3; i++) {
    const gear = root.getObjectByName(`gear_${i}`);
    if (gear) {
      const speed = i === 1 ? -2 : 2;
      gear.rotation.z = t * speed;
    }
  }

  root.position.y = Math.abs(Math.sin(t * 2)) * 0.015;

  for (let p = 0; p < 3; p++) {
    const puff = root.getObjectByName(`smoke_${p}`);
    if (puff) {
      const cycle = ((t * 0.5 + p * 0.4) % 1);
      puff.position.y += 0.001;
      if (puff instanceof THREE.Mesh) {
        const mat = puff.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.3 * (1 - cycle * 0.5);
      }
    }
  }

  const armL = root.getObjectByName('arm_l');
  const armR = root.getObjectByName('arm_r');
  if (armL) armL.position.y += Math.sin(t * 2) * 0.002;
  if (armR) armR.position.y += Math.sin(t * 2 + Math.PI) * 0.002;
}

/** Wendigo: hunched lurching walk — asymmetric, unsettling. */
export function animateWendigo(root: THREE.Group, t: number, _delta: number): void {
  root.rotation.x = 0.08 + Math.sin(t * 1.2) * 0.04;
  root.rotation.z = Math.sin(t * 0.9) * 0.04;
  root.position.y = Math.abs(Math.sin(t * 1.5)) * 0.02;

  const armL = root.getObjectByName('arm_l');
  const armR = root.getObjectByName('arm_r');
  if (armL) armL.rotation.x = Math.sin(t * 1.5) * 0.15;
  if (armR) armR.rotation.x = Math.sin(t * 1.5 + 1.0) * 0.12;

  for (let i = 0; i < 6; i++) {
    const frost = root.getObjectByName(`frost_${i}`);
    if (frost) {
      frost.position.y += Math.sin(t * 2 + i) * 0.001;
      frost.position.x += Math.cos(t * 1.5 + i * 0.8) * 0.0005;
    }
  }

  const head = root.getObjectByName('head');
  if (head) {
    head.rotation.y = Math.sin(t * 0.7) * 0.15;
    head.rotation.z = Math.sin(t * 1.3) * 0.04;
  }
}

/** Rail Wraith: floating drift — bobbing, flickering visibility, chain sway. */
export function animateRailWraith(
  root: THREE.Group,
  t: number,
  _delta: number,
  _state: EnemyAnimState,
): void {
  root.position.y = 0.1 + Math.sin(t * 1.2) * 0.06;
  root.position.x = Math.sin(t * 0.5) * 0.04;

  const flicker = Math.sin(t * 8) > 0.85;
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat.transparent) {
        mat.opacity = flicker ? 0.15 : 0.4;
      }
    }
  });

  const flame = root.getObjectByName('flame');
  if (flame && flame instanceof THREE.Mesh) {
    const mat = flame.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.8 + Math.sin(t * 5) * 0.4;
    const pulse = 1 + Math.sin(t * 4) * 0.15;
    flame.scale.set(pulse, pulse, pulse);
  }

  for (let i = 0; i < 8; i++) {
    const chain = root.getObjectByName(`chain_${i}`);
    if (chain) {
      chain.rotation.x += Math.sin(t * 2 + i * 0.7) * 0.003;
      chain.rotation.z += Math.cos(t * 1.5 + i * 0.5) * 0.002;
    }
  }
}
