// Rifle — First-person bolt-action rifle built from THREE.js primitives.
// Animations: fire (heavy recoil + bolt-action flick), reload (bolt pull, eject, push).

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import { createMetalTexture, createWoodTexture } from '@/src/game/engine/materials';

// Rest position — further right and lower than revolver (heavier weapon)
const REST_POSITION = new THREE.Vector3(0.18, -0.16, -0.35);

// Animation timing
const RECOIL_DURATION = 0.2;
const RELOAD_DURATION = 1.8;
const MUZZLE_FLASH_DURATION = 0.04;

export class Rifle extends WeaponViewModel {
  private boltHandle!: THREE.Mesh;
  private muzzleFlash!: THREE.Mesh;

  // Animation state
  private recoilTimer = 0;
  private reloadTimer = 0;
  private flashTimer = 0;

  // Rest transforms
  private boltRestZ = 0;
  private boltRestRotation = 0;
  private restPositionLocal = new THREE.Vector3();

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Rifle';

    // --- Materials ---
    const gunmetal = createMetalTexture('#3A3A3A', '#2A2A2A');
    const darkMetal = createMetalTexture('#2C2C2C', '#1A1A1A');
    const wood = createWoodTexture('#5C3A1E', '#3D2512');

    // --- Long barrel ---
    const barrelGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8);
    const barrel = new THREE.Mesh(barrelGeo, gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.12);
    barrel.name = 'Barrel';
    root.add(barrel);

    // --- Barrel shroud / front sight ---
    const sightGeo = new THREE.BoxGeometry(0.004, 0.012, 0.004);
    const sight = new THREE.Mesh(sightGeo, darkMetal);
    sight.position.set(0, 0.035, -0.24);
    sight.name = 'FrontSight';
    root.add(sight);

    // --- Receiver (body) ---
    const receiverGeo = new THREE.BoxGeometry(0.035, 0.045, 0.1);
    const receiver = new THREE.Mesh(receiverGeo, gunmetal);
    receiver.position.set(0, 0.0, 0.0);
    receiver.name = 'Receiver';
    root.add(receiver);

    // --- Bolt mechanism ---
    const boltGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6);
    const bolt = new THREE.Mesh(boltGeo, darkMetal);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, 0.025, 0.01);
    bolt.name = 'Bolt';
    root.add(bolt);

    // --- Bolt handle (sticks out to the right) ---
    const handleGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.025, 6);
    this.boltHandle = new THREE.Mesh(handleGeo, darkMetal);
    this.boltHandle.rotation.z = Math.PI / 2;
    this.boltHandle.position.set(0.025, 0.025, 0.01);
    this.boltHandle.name = 'BoltHandle';
    root.add(this.boltHandle);

    // --- Stock (angled wooden stock) ---
    const stockGeo = new THREE.BoxGeometry(0.032, 0.04, 0.15);
    const stock = new THREE.Mesh(stockGeo, wood);
    stock.rotation.x = (8 * Math.PI) / 180;
    stock.position.set(0, -0.015, 0.12);
    stock.name = 'Stock';
    root.add(stock);

    // --- Stock butt plate ---
    const buttGeo = new THREE.BoxGeometry(0.034, 0.05, 0.01);
    const butt = new THREE.Mesh(buttGeo, darkMetal);
    butt.position.set(0, -0.02, 0.195);
    butt.name = 'ButtPlate';
    root.add(butt);

    // --- Foregrip (wooden handguard under barrel) ---
    const foregripGeo = new THREE.BoxGeometry(0.028, 0.02, 0.1);
    const foregrip = new THREE.Mesh(foregripGeo, wood);
    foregrip.position.set(0, -0.005, -0.1);
    foregrip.name = 'Foregrip';
    root.add(foregrip);

    // --- Scope (optional - small cylinder on top) ---
    const scopeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
    const scope = new THREE.Mesh(scopeGeo, darkMetal);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.04, -0.03);
    scope.name = 'Scope';
    root.add(scope);

    // Scope lens caps
    const lensGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.003, 8);
    const lensMat = createMetalTexture('#1A1A1A', '#111111');
    const frontLens = new THREE.Mesh(lensGeo, lensMat);
    frontLens.rotation.x = Math.PI / 2;
    frontLens.position.set(0, 0.04, -0.071);
    frontLens.name = 'ScopeFrontLens';
    root.add(frontLens);

    const rearLens = new THREE.Mesh(lensGeo, lensMat);
    rearLens.rotation.x = Math.PI / 2;
    rearLens.position.set(0, 0.04, 0.011);
    rearLens.name = 'ScopeRearLens';
    root.add(rearLens);

    // --- Trigger guard ---
    const guardGeo = new THREE.TorusGeometry(0.01, 0.002, 6, 10, Math.PI);
    const guard = new THREE.Mesh(guardGeo, gunmetal);
    guard.rotation.x = Math.PI;
    guard.rotation.z = Math.PI / 2;
    guard.position.set(0, -0.025, 0.02);
    guard.name = 'TriggerGuard';
    root.add(guard);

    // --- Trigger ---
    const triggerGeo = new THREE.BoxGeometry(0.003, 0.012, 0.003);
    const trigger = new THREE.Mesh(triggerGeo, gunmetal);
    trigger.position.set(0, -0.025, 0.02);
    trigger.name = 'Trigger';
    root.add(trigger);

    // --- Muzzle flash ---
    const flashGeo = new THREE.PlaneGeometry(0.07, 0.07);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.position.set(0, 0.02, -0.25);
    this.muzzleFlash.name = 'MuzzleFlash';
    root.add(this.muzzleFlash);

    // Store rest transforms
    this.boltRestZ = this.boltHandle.position.z;
    this.boltRestRotation = this.boltHandle.rotation.y;
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

  private updateFireAnimation(dt: number): void {
    if (this.recoilTimer <= 0) return;

    this.recoilTimer -= dt;
    const t = Math.max(0, this.recoilTimer / RECOIL_DURATION);
    // Heavier, more deliberate recoil than the revolver
    const recoilCurve = Math.sin(t * Math.PI) * t;

    const modelGroup = this.group.children[0] as THREE.Group;
    // Stronger kick back (0.035 vs revolver's 0.025)
    modelGroup.position.z = this.restPositionLocal.z + recoilCurve * 0.035;
    // Stronger upward rotation
    modelGroup.rotation.x = recoilCurve * 0.08;

    // Bolt handle flick — lifts up then pushes back
    const boltLift = Math.sin(t * Math.PI * 2) * 0.3;
    this.boltHandle.rotation.y = this.boltRestRotation + boltLift;
    this.boltHandle.position.z = this.boltRestZ + recoilCurve * 0.02;

    if (this.recoilTimer <= 0) {
      modelGroup.position.z = this.restPositionLocal.z;
      modelGroup.rotation.x = 0;
      this.boltHandle.rotation.y = this.boltRestRotation;
      this.boltHandle.position.z = this.boltRestZ;
      this.state = 'idle';
    }
  }

  private updateReloadAnimation(dt: number): void {
    if (this.reloadTimer <= 0) return;

    this.reloadTimer -= dt;
    const progress = 1 - Math.max(0, this.reloadTimer / RELOAD_DURATION);
    const modelGroup = this.group.children[0] as THREE.Group;

    // Phase 1 (0–0.3): Bolt handle lifts and pulls back
    // Phase 2 (0.3–0.5): Hold open — casing eject moment
    // Phase 3 (0.5–0.8): Push bolt forward
    // Phase 4 (0.8–1.0): Settle back to rest
    if (progress < 0.3) {
      const p = progress / 0.3;
      const eased = easeOutQuad(p);
      this.boltHandle.rotation.y = this.boltRestRotation + eased * 0.6;
      this.boltHandle.position.z = this.boltRestZ + eased * 0.04;
      modelGroup.rotation.z = eased * 0.04;
    } else if (progress < 0.5) {
      this.boltHandle.rotation.y = this.boltRestRotation + 0.6;
      this.boltHandle.position.z = this.boltRestZ + 0.04;
      // Slight upward jolt — ejecting casing
      const ejectP = (progress - 0.3) / 0.2;
      modelGroup.rotation.x = Math.sin(ejectP * Math.PI) * 0.03;
    } else if (progress < 0.8) {
      const p = (progress - 0.5) / 0.3;
      const eased = easeInQuad(p);
      this.boltHandle.rotation.y = this.boltRestRotation + 0.6 * (1 - eased);
      this.boltHandle.position.z = this.boltRestZ + 0.04 * (1 - eased);
      modelGroup.rotation.x = 0;
    } else {
      const p = (progress - 0.8) / 0.2;
      const eased = easeOutQuad(p);
      // Snap bolt handle down with a satisfying click
      this.boltHandle.rotation.y = this.boltRestRotation;
      this.boltHandle.position.z = this.boltRestZ;
      modelGroup.rotation.z = 0.04 * (1 - eased);
    }

    if (this.reloadTimer <= 0) {
      this.boltHandle.rotation.y = this.boltRestRotation;
      this.boltHandle.position.z = this.boltRestZ;
      modelGroup.rotation.x = 0;
      modelGroup.rotation.z = 0;
      this.state = 'idle';
    }
  }

  private updateMuzzleFlash(dt: number): void {
    if (this.flashTimer <= 0) return;

    this.flashTimer -= dt;
    const mat = this.muzzleFlash.material as THREE.MeshBasicMaterial;

    if (this.flashTimer > 0) {
      mat.opacity = 0.95;
      const flickerScale = 0.9 + (this.flashTimer / MUZZLE_FLASH_DURATION) * 0.3;
      this.muzzleFlash.scale.setScalar(flickerScale);
      this.muzzleFlash.rotation.z = (this.flashTimer * 137.5) % (Math.PI * 2);
    } else {
      mat.opacity = 0;
      this.muzzleFlash.scale.setScalar(1);
    }
  }
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t: number): number {
  return t * t;
}
