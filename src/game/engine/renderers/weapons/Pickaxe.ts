// Pickaxe — First-person mining tool built from THREE.js primitives.
// Animations: fire (overhead swing down), no reload (melee weapon).

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import { createMetalTexture, createWoodTexture } from '@/src/game/engine/materials';

// ---------------------------------------------------------------------------
// Rest position — centered, angled slightly for a tool-like hold
// ---------------------------------------------------------------------------

const REST_POSITION = new THREE.Vector3(0.14, -0.15, -0.28);

// ---------------------------------------------------------------------------
// Animation timing
// ---------------------------------------------------------------------------

const SWING_DURATION = 0.5;
const IMPACT_PAUSE = 0.08; // moment of inertia at the bottom of the swing

// ---------------------------------------------------------------------------
// Pickaxe implementation
// ---------------------------------------------------------------------------

export class Pickaxe extends WeaponViewModel {
  // Animation state
  private swingTimer = 0;

  // Rest transforms
  private restPositionLocal = new THREE.Vector3();

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Pickaxe';

    // --- Materials ---
    const ironMetal = createMetalTexture('#5A5A5A', '#3A3A3A');
    const wood = createWoodTexture('#7A5230', '#4E3420');

    // --- Handle (long wooden shaft) ---
    const handleGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.28, 6);
    const handle = new THREE.Mesh(handleGeo, wood);
    handle.position.set(0, 0, 0);
    handle.name = 'Handle';
    root.add(handle);

    // --- Handle wrap (leather grip at bottom) ---
    const wrapGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.05, 6);
    const wrapMat = createWoodTexture('#3D2512', '#2A1A0D');
    const wrap = new THREE.Mesh(wrapGeo, wrapMat);
    wrap.position.set(0, -0.12, 0);
    wrap.name = 'HandleWrap';
    root.add(wrap);

    // --- Pick head mount (small block where head meets handle) ---
    const mountGeo = new THREE.BoxGeometry(0.02, 0.025, 0.02);
    const mount = new THREE.Mesh(mountGeo, ironMetal);
    mount.position.set(0, 0.14, 0);
    mount.name = 'HeadMount';
    root.add(mount);

    // --- Pick head — main point (tapered box extending forward) ---
    const pointGeo = new THREE.BoxGeometry(0.012, 0.015, 0.1);
    const point = new THREE.Mesh(pointGeo, ironMetal);
    point.position.set(0, 0.14, -0.06);
    point.name = 'PickPoint';
    root.add(point);

    // --- Pick tip (narrower end) ---
    const tipGeo = new THREE.BoxGeometry(0.006, 0.008, 0.03);
    const tip = new THREE.Mesh(tipGeo, ironMetal);
    tip.position.set(0, 0.14, -0.12);
    tip.name = 'PickTip';
    root.add(tip);

    // --- Flat end (opposite side — chisel edge) ---
    const flatGeo = new THREE.BoxGeometry(0.025, 0.012, 0.04);
    const flat = new THREE.Mesh(flatGeo, ironMetal);
    flat.position.set(0, 0.14, 0.03);
    flat.name = 'FlatEnd';
    root.add(flat);

    // --- Rivets on the head mount ---
    const rivetGeo = new THREE.SphereGeometry(0.003, 4, 4);
    const rivetMat = createMetalTexture('#4A4A4A', '#2A2A2A');
    const rivetPositions = [
      [0.011, 0.14, 0.005],
      [-0.011, 0.14, 0.005],
      [0.011, 0.14, -0.005],
      [-0.011, 0.14, -0.005],
    ] as const;

    for (let i = 0; i < rivetPositions.length; i++) {
      const rivet = new THREE.Mesh(rivetGeo, rivetMat);
      const [rx, ry, rz] = rivetPositions[i];
      rivet.position.set(rx, ry, rz);
      rivet.name = `Rivet_${i}`;
      root.add(rivet);
    }

    // Orient the whole pickaxe so it's held diagonally (handle down, head up-forward)
    root.rotation.x = -0.3;
    root.rotation.z = 0.1;

    // Store rest transforms
    this.restPositionLocal.copy(root.position);

    return root;
  }

  getRestPosition(): THREE.Vector3 {
    return REST_POSITION;
  }

  playFire(): void {
    if (!this.canFire()) return;
    this.state = 'firing';
    this.swingTimer = SWING_DURATION;
  }

  playReload(): void {
    // Pickaxe has no reload — melee weapon
  }

  override canReload(): boolean {
    return false;
  }

  override update(
    deltaTime: number,
    inputFrame: Readonly<import('@/src/game/input/InputFrame').InputFrame>,
  ): void {
    this.updateSwingAnimation(deltaTime);

    super.update(deltaTime, inputFrame);
  }

  // -------------------------------------------------------------------------
  // Animation internals
  // -------------------------------------------------------------------------

  private updateSwingAnimation(dt: number): void {
    if (this.swingTimer <= 0) return;

    this.swingTimer -= dt;
    const progress = 1 - Math.max(0, this.swingTimer / SWING_DURATION);
    const modelGroup = this.group.children[0] as THREE.Group;

    // Phase 1 (0–0.25): Raise up and back
    // Phase 2 (0.25–0.5): Swing down fast
    // Phase 3 (0.5–0.65): Impact pause — head digs in
    // Phase 4 (0.65–1.0): Pull back to rest
    if (progress < 0.25) {
      const p = progress / 0.25;
      const eased = easeOutQuad(p);
      // Raise up
      modelGroup.rotation.x = -0.3 + eased * -0.6;
      modelGroup.position.y = eased * 0.06;
      modelGroup.position.z = this.restPositionLocal.z + eased * 0.03;
    } else if (progress < 0.5) {
      const p = (progress - 0.25) / 0.25;
      // Fast swing down — use cubic for acceleration
      const eased = easeInCubic(p);
      modelGroup.rotation.x = -0.9 + eased * 1.3;
      modelGroup.position.y = 0.06 - eased * 0.1;
      modelGroup.position.z = this.restPositionLocal.z + 0.03 - eased * 0.08;
    } else if (progress < 0.5 + IMPACT_PAUSE / SWING_DURATION + 0.15) {
      // Impact — hold position with a slight shudder
      const impactP = (progress - 0.5) / 0.15;
      const shake = Math.sin(impactP * Math.PI * 4) * 0.01 * (1 - impactP);
      modelGroup.rotation.x = 0.4;
      modelGroup.position.y = -0.04 + shake;
      modelGroup.position.z = this.restPositionLocal.z - 0.05;
    } else {
      const p = (progress - 0.65) / 0.35;
      const eased = easeOutQuad(p);
      // Return to rest
      modelGroup.rotation.x = 0.4 * (1 - eased) + -0.3 * eased;
      modelGroup.position.y = -0.04 * (1 - eased);
      modelGroup.position.z = this.restPositionLocal.z + -0.05 * (1 - eased);
    }

    if (this.swingTimer <= 0) {
      modelGroup.rotation.x = -0.3;
      modelGroup.position.y = 0;
      modelGroup.position.z = this.restPositionLocal.z;
      this.state = 'idle';
    }
  }
}

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInCubic(t: number): number {
  return t * t * t;
}
