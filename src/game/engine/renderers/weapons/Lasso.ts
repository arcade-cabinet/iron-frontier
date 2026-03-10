// Lasso — First-person rope lasso built from THREE.js primitives.
// Animations: fire (throw loop forward, expand), used for catching/pulling.

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import { createLeatherTexture } from '@/src/game/engine/materials';

// ---------------------------------------------------------------------------
// Rest position — right side, held at hip level
// ---------------------------------------------------------------------------

const REST_POSITION = new THREE.Vector3(0.14, -0.12, -0.25);

// ---------------------------------------------------------------------------
// Animation timing
// ---------------------------------------------------------------------------

const THROW_DURATION = 0.7;
const RETRACT_DURATION = 0.5;

// ---------------------------------------------------------------------------
// Lasso implementation
// ---------------------------------------------------------------------------

export class Lasso extends WeaponViewModel {
  private coilGroup!: THREE.Group;
  private loopGroup!: THREE.Group;
  private loopTorus!: THREE.Mesh;

  // Animation state
  private throwTimer = 0;
  private retractTimer = 0;

  // Rest transforms
  private restPositionLocal = new THREE.Vector3();
  private loopRestPosition = new THREE.Vector3();
  private loopRestScale = 1;

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Lasso';

    // --- Materials ---
    const rope = createLeatherTexture('#8B7355');
    const darkRope = createLeatherTexture('#6B5335');

    // --- Coiled rope in hand (stacked torus rings) ---
    this.coilGroup = new THREE.Group();
    this.coilGroup.name = 'CoilGroup';

    const coilGeo = new THREE.TorusGeometry(0.025, 0.005, 6, 16);
    for (let i = 0; i < 5; i++) {
      const coil = new THREE.Mesh(coilGeo, i % 2 === 0 ? rope : darkRope);
      coil.position.y = i * 0.012 - 0.024;
      // Slight rotation variation for natural-looking coil
      coil.rotation.x = Math.PI / 2;
      coil.rotation.z = i * 0.15;
      coil.name = `Coil_${i}`;
      this.coilGroup.add(coil);
    }

    this.coilGroup.position.set(0, -0.03, 0);
    root.add(this.coilGroup);

    // --- Rope trailing up from coil to loop ---
    const trailGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4);
    const trail = new THREE.Mesh(trailGeo, rope);
    trail.position.set(0, 0.03, -0.02);
    trail.rotation.x = 0.3;
    trail.name = 'TrailingRope';
    root.add(trail);

    // --- Loop group (the part that gets thrown) ---
    this.loopGroup = new THREE.Group();
    this.loopGroup.name = 'LoopGroup';

    const loopGeo = new THREE.TorusGeometry(0.035, 0.005, 8, 20);
    this.loopTorus = new THREE.Mesh(loopGeo, rope);
    this.loopTorus.rotation.x = Math.PI / 2 - 0.3;
    this.loopTorus.name = 'Loop';
    this.loopGroup.add(this.loopTorus);

    // Honda knot (small knot where rope meets loop)
    const knotGeo = new THREE.SphereGeometry(0.008, 6, 6);
    const knot = new THREE.Mesh(knotGeo, darkRope);
    knot.position.set(0, -0.035, 0);
    knot.name = 'HondaKnot';
    this.loopGroup.add(knot);

    this.loopGroup.position.set(0, 0.06, -0.04);
    root.add(this.loopGroup);

    // --- Hand grip (implied via glove) ---
    const gripGeo = new THREE.BoxGeometry(0.028, 0.05, 0.035);
    const gripMat = createLeatherTexture('#5C3A1E');
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.06, 0.01);
    grip.name = 'GloveGrip';
    root.add(grip);

    // --- Fingers wrapped around coil ---
    const fingerGeo = new THREE.CylinderGeometry(0.005, 0.004, 0.025, 4);
    const fingerMat = createLeatherTexture('#5C3A1E');
    for (let i = 0; i < 3; i++) {
      const finger = new THREE.Mesh(fingerGeo, fingerMat);
      const angle = (-0.3 + i * 0.3);
      finger.position.set(
        Math.sin(angle) * 0.018,
        -0.04,
        Math.cos(angle) * 0.018 - 0.01,
      );
      finger.rotation.z = angle * 0.3;
      finger.name = `Finger_${i}`;
      root.add(finger);
    }

    // Tilt the whole thing for a natural grip angle
    root.rotation.x = -0.15;

    // Store rest transforms
    this.restPositionLocal = root.position.clone();
    this.loopRestPosition = this.loopGroup.position.clone();
    this.loopRestScale = 1;

    return root;
  }

  getRestPosition(): THREE.Vector3 {
    return REST_POSITION;
  }

  playFire(): void {
    if (!this.canFire()) return;
    this.state = 'firing';
    this.throwTimer = THROW_DURATION;
  }

  playReload(): void {
    if (!this.canReload()) return;
    // Reload = retract the lasso
    this.state = 'reloading';
    this.retractTimer = RETRACT_DURATION;
  }

  override update(
    deltaTime: number,
    inputFrame: Readonly<import('@/src/game/input/InputFrame').InputFrame>,
  ): void {
    this.updateThrowAnimation(deltaTime);
    this.updateRetractAnimation(deltaTime);
    this.updateIdleLoop(deltaTime);

    super.update(deltaTime, inputFrame);
  }

  // -------------------------------------------------------------------------
  // Animation internals
  // -------------------------------------------------------------------------

  private idleSwayPhase = 0;

  private updateIdleLoop(dt: number): void {
    if (this.state !== 'idle') return;

    this.idleSwayPhase += dt;

    // Gentle loop sway when idle — rope has weight
    const sway = Math.sin(this.idleSwayPhase * 1.8) * 0.008;
    this.loopGroup.rotation.z = sway;
    this.loopGroup.rotation.y = Math.sin(this.idleSwayPhase * 1.2) * 0.005;
  }

  private updateThrowAnimation(dt: number): void {
    if (this.throwTimer <= 0) return;

    this.throwTimer -= dt;
    const progress = 1 - Math.max(0, this.throwTimer / THROW_DURATION);
    const modelGroup = this.group.children[0] as THREE.Group;

    // Phase 1 (0–0.2): Wind up — arm goes back, loop circles overhead
    // Phase 2 (0.2–0.5): Throw — arm extends forward, loop flies out
    // Phase 3 (0.5–0.75): Loop expands at distance
    // Phase 4 (0.75–1.0): Hold extended
    if (progress < 0.2) {
      const p = progress / 0.2;
      const eased = easeOutQuad(p);
      // Wind up
      modelGroup.rotation.x = -0.15 + eased * -0.3;
      modelGroup.position.y = eased * 0.04;
      // Loop circles (overhead spin)
      this.loopGroup.rotation.y = eased * Math.PI;
      this.loopGroup.position.y = this.loopRestPosition.y + eased * 0.04;
    } else if (progress < 0.5) {
      const p = (progress - 0.2) / 0.3;
      const eased = easeInCubic(p);
      // Throw forward
      modelGroup.rotation.x = -0.45 + eased * 0.6;
      modelGroup.position.y = 0.04 - eased * 0.04;
      // Loop flies forward
      this.loopGroup.position.z = this.loopRestPosition.z - eased * 0.15;
      this.loopGroup.position.y = this.loopRestPosition.y + 0.04 * (1 - eased);
      this.loopGroup.rotation.x = Math.PI / 2 - 0.3 + eased * 0.5;
    } else if (progress < 0.75) {
      const p = (progress - 0.5) / 0.25;
      const eased = easeOutQuad(p);
      // Loop expands
      const expandScale = 1 + eased * 1.2;
      this.loopTorus.scale.setScalar(expandScale);
      this.loopGroup.position.z = this.loopRestPosition.z - 0.15 - eased * 0.05;
      modelGroup.rotation.x = 0.15;
    } else {
      // Hold extended
      this.loopTorus.scale.setScalar(2.2);
      this.loopGroup.position.z = this.loopRestPosition.z - 0.2;
      modelGroup.rotation.x = 0.15;
    }

    if (this.throwTimer <= 0) {
      this.state = 'idle';
      // Reset everything
      this.resetLoopTransform(modelGroup);
    }
  }

  private updateRetractAnimation(dt: number): void {
    if (this.retractTimer <= 0) return;

    this.retractTimer -= dt;
    const progress = 1 - Math.max(0, this.retractTimer / RETRACT_DURATION);
    const modelGroup = this.group.children[0] as THREE.Group;

    // Pull loop back and shrink
    const eased = easeOutQuad(progress);
    this.loopGroup.position.z = this.loopRestPosition.z + (-0.2 + 0.2 * eased) *
      (1 - eased) + this.loopRestPosition.z * eased - this.loopRestPosition.z;

    // Simplified: just lerp back to rest
    this.loopGroup.position.z = this.loopRestPosition.z - 0.2 * (1 - eased);
    this.loopTorus.scale.setScalar(2.2 - 1.2 * eased);
    modelGroup.rotation.x = 0.15 * (1 - eased) + -0.15 * eased;

    // Arm pulls back
    modelGroup.position.z = this.restPositionLocal.z + 0.02 * (1 - eased);

    if (this.retractTimer <= 0) {
      this.resetLoopTransform(modelGroup);
      this.state = 'idle';
    }
  }

  private resetLoopTransform(modelGroup: THREE.Group): void {
    this.loopGroup.position.copy(this.loopRestPosition);
    this.loopGroup.rotation.set(0, 0, 0);
    this.loopTorus.scale.setScalar(this.loopRestScale);
    this.loopTorus.rotation.x = Math.PI / 2 - 0.3;
    modelGroup.rotation.x = -0.15;
    modelGroup.position.y = 0;
    modelGroup.position.z = this.restPositionLocal.z;
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
