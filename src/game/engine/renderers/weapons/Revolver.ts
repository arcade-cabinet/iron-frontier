// Revolver — First-person revolver built from THREE.js primitives.
// Animations: fire (recoil + hammer snap + muzzle flash), reload (cylinder swing-out).

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import { createMetalTexture, createWoodTexture } from '@/src/game/engine/materials';

// ---------------------------------------------------------------------------
// Rest position (classic FPS: right of center, below midpoint)
// ---------------------------------------------------------------------------

const REST_POSITION = new THREE.Vector3(0.15, -0.12, -0.3);

// ---------------------------------------------------------------------------
// Animation timing
// ---------------------------------------------------------------------------

const RECOIL_DURATION = 0.15; // seconds for full recoil cycle
const RELOAD_DURATION = 1.2; // total reload time
const MUZZLE_FLASH_DURATION = 0.04; // ~1-2 frames at 60fps

// ---------------------------------------------------------------------------
// Revolver implementation
// ---------------------------------------------------------------------------

export class Revolver extends WeaponViewModel {
  // Sub-part references for animation
  private hammerMesh!: THREE.Mesh;
  private cylinderGroup!: THREE.Group;
  private muzzleFlash!: THREE.Mesh;

  // Animation state
  private recoilTimer = 0;
  private reloadTimer = 0;
  private flashTimer = 0;

  // Original transforms for animation reset
  private hammerRestRotation = 0;
  private cylinderRestRotation = 0;
  private restQuaternion = new THREE.Quaternion();
  private restPositionLocal = new THREE.Vector3();

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Revolver';

    // --- Materials ---
    const gunmetal = createMetalTexture('#3A3A3A', '#2A2A2A');
    const wood = createWoodTexture('#5C3A1E', '#3D2512');

    // --- Barrel ---
    const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
    const barrel = new THREE.Mesh(barrelGeo, gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.015, -0.06);
    barrel.name = 'Barrel';
    root.add(barrel);

    // --- Frame (body) ---
    const frameGeo = new THREE.BoxGeometry(0.03, 0.06, 0.08);
    const frame = new THREE.Mesh(frameGeo, gunmetal);
    frame.position.set(0, -0.005, 0);
    frame.name = 'Frame';
    root.add(frame);

    // --- Cylinder / chamber ---
    this.cylinderGroup = new THREE.Group();
    this.cylinderGroup.name = 'CylinderGroup';
    this.cylinderGroup.position.set(0, 0.005, -0.01);

    const cylGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16);
    const cylinder = new THREE.Mesh(cylGeo, gunmetal);
    cylinder.rotation.z = Math.PI / 2;
    cylinder.name = 'Cylinder';
    this.cylinderGroup.add(cylinder);

    // Chamber holes (6 small indentations on the cylinder face)
    const holeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.005, 6);
    const holeMat = createMetalTexture('#1A1A1A', '#111111');
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.rotation.z = Math.PI / 2;
      hole.position.set(
        -0.016,
        Math.sin(angle) * 0.014,
        Math.cos(angle) * 0.014,
      );
      hole.name = `ChamberHole_${i}`;
      this.cylinderGroup.add(hole);
    }

    root.add(this.cylinderGroup);

    // --- Grip ---
    const gripGeo = new THREE.BoxGeometry(0.025, 0.06, 0.03);
    const grip = new THREE.Mesh(gripGeo, wood);
    // Angle back 15 degrees
    grip.rotation.x = (15 * Math.PI) / 180;
    grip.position.set(0, -0.06, 0.02);
    grip.name = 'Grip';
    root.add(grip);

    // --- Trigger guard ---
    const guardGeo = new THREE.TorusGeometry(0.012, 0.002, 6, 12, Math.PI);
    const guard = new THREE.Mesh(guardGeo, gunmetal);
    guard.rotation.x = Math.PI;
    guard.rotation.z = Math.PI / 2;
    guard.position.set(0, -0.035, -0.005);
    guard.name = 'TriggerGuard';
    root.add(guard);

    // --- Trigger ---
    const triggerGeo = new THREE.BoxGeometry(0.003, 0.015, 0.003);
    const trigger = new THREE.Mesh(triggerGeo, gunmetal);
    trigger.position.set(0, -0.035, -0.005);
    trigger.name = 'Trigger';
    root.add(trigger);

    // --- Hammer ---
    const hammerGeo = new THREE.BoxGeometry(0.01, 0.018, 0.008);
    this.hammerMesh = new THREE.Mesh(hammerGeo, gunmetal);
    this.hammerMesh.position.set(0, 0.03, 0.035);
    this.hammerMesh.name = 'Hammer';
    root.add(this.hammerMesh);

    // --- Muzzle flash (emissive plane, hidden by default) ---
    const flashGeo = new THREE.PlaneGeometry(0.06, 0.06);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.position.set(0, 0.015, -0.125);
    this.muzzleFlash.name = 'MuzzleFlash';
    root.add(this.muzzleFlash);

    // Store rest transforms
    // NOTE: Field initializers haven't run yet when the base constructor
    // calls constructModel(), so we must assign these objects here.
    this.hammerRestRotation = this.hammerMesh.rotation.x;
    this.cylinderRestRotation = this.cylinderGroup.rotation.x;
    this.restQuaternion = root.quaternion.clone();
    this.restPositionLocal = root.position.clone();

    return root;
  }

  getRestPosition(): THREE.Vector3 {
    return REST_POSITION;
  }

  playFire(): void {
    if (!this.canFire()) return;
    this.state = 'firing';
    this.recoilTimer = RECOIL_DURATION;
    this.flashTimer = MUZZLE_FLASH_DURATION;
  }

  playReload(): void {
    if (!this.canReload()) return;
    this.state = 'reloading';
    this.reloadTimer = RELOAD_DURATION;
  }

  override update(
    deltaTime: number,
    inputFrame: Readonly<import('@/src/game/input/InputFrame').InputFrame>,
  ): void {
    this.updateFireAnimation(deltaTime);
    this.updateReloadAnimation(deltaTime);
    this.updateMuzzleFlash(deltaTime);

    super.update(deltaTime, inputFrame);
  }

  // -------------------------------------------------------------------------
  // Animation internals
  // -------------------------------------------------------------------------

  private updateFireAnimation(dt: number): void {
    if (this.recoilTimer <= 0) return;

    this.recoilTimer -= dt;
    // Normalized progress: 1 at start, 0 at end
    const t = Math.max(0, this.recoilTimer / RECOIL_DURATION);
    // Punchy recoil curve: sharp kick then smooth spring return
    const recoilCurve = Math.sin(t * Math.PI) * t;

    // Kick back and rotate up
    const modelGroup = this.group.children[0] as THREE.Group;
    modelGroup.position.z = this.restPositionLocal.z + recoilCurve * 0.025;
    modelGroup.rotation.x = recoilCurve * 0.12;

    // Hammer snaps forward then returns
    this.hammerMesh.rotation.x = this.hammerRestRotation - recoilCurve * 0.5;

    // Rotate cylinder (1/6 turn per shot)
    const cylProgress = 1 - t;
    this.cylinderGroup.rotation.x = this.cylinderRestRotation +
      cylProgress * ((Math.PI * 2) / 6);

    if (this.recoilTimer <= 0) {
      // Reset
      modelGroup.position.z = this.restPositionLocal.z;
      modelGroup.rotation.x = 0;
      this.hammerMesh.rotation.x = this.hammerRestRotation;
      this.cylinderRestRotation = this.cylinderGroup.rotation.x;
      this.state = 'idle';
    }
  }

  private updateReloadAnimation(dt: number): void {
    if (this.reloadTimer <= 0) return;

    this.reloadTimer -= dt;
    const progress = 1 - Math.max(0, this.reloadTimer / RELOAD_DURATION);

    // Phase 1 (0-0.3): Cylinder swings out to the left
    // Phase 2 (0.3-0.7): Hold open (eject/load)
    // Phase 3 (0.7-1.0): Cylinder swings back in
    if (progress < 0.3) {
      const swingOut = progress / 0.3;
      const eased = easeOutBack(swingOut);
      this.cylinderGroup.rotation.y = eased * 0.8;
      this.cylinderGroup.position.x = eased * 0.02;
    } else if (progress < 0.7) {
      // Hold position, spin cylinder
      this.cylinderGroup.rotation.y = 0.8;
      this.cylinderGroup.position.x = 0.02;
      const spinProgress = (progress - 0.3) / 0.4;
      this.cylinderGroup.rotation.x = this.cylinderRestRotation +
        spinProgress * Math.PI * 2;
    } else {
      const swingIn = (progress - 0.7) / 0.3;
      const eased = easeInQuad(swingIn);
      this.cylinderGroup.rotation.y = 0.8 * (1 - eased);
      this.cylinderGroup.position.x = 0.02 * (1 - eased);
    }

    // Slight weapon tilt during reload
    const modelGroup = this.group.children[0] as THREE.Group;
    const tiltAmount = Math.sin(progress * Math.PI) * 0.1;
    modelGroup.rotation.z = tiltAmount;

    if (this.reloadTimer <= 0) {
      // Reset everything
      this.cylinderGroup.rotation.y = 0;
      this.cylinderGroup.position.x = 0;
      this.cylinderRestRotation = this.cylinderGroup.rotation.x;
      modelGroup.rotation.z = 0;
      this.state = 'idle';
    }
  }

  private updateMuzzleFlash(dt: number): void {
    if (this.flashTimer <= 0) return;

    this.flashTimer -= dt;
    const mat = this.muzzleFlash.material as THREE.MeshBasicMaterial;

    if (this.flashTimer > 0) {
      mat.opacity = 0.9;
      // Random-ish scale for visual punch (deterministic via timer)
      const flickerScale = 0.8 + (this.flashTimer / MUZZLE_FLASH_DURATION) * 0.4;
      this.muzzleFlash.scale.setScalar(flickerScale);
      // Rotate flash for variety
      this.muzzleFlash.rotation.z = (this.flashTimer * 137.5) % (Math.PI * 2);
    } else {
      mat.opacity = 0;
      this.muzzleFlash.scale.setScalar(1);
    }
  }
}

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInQuad(t: number): number {
  return t * t;
}
