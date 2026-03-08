// Shotgun — First-person double-barrel shotgun built from THREE.js primitives.
// Animations: fire (heavy recoil + dual barrel flash), reload (pump slide).

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import { createMetalTexture, createWoodTexture } from '@/src/game/engine/materials';

// Rest position — wider and lower (heavy, chunky weapon)
const REST_POSITION = new THREE.Vector3(0.16, -0.18, -0.32);

// Animation timing
const RECOIL_DURATION = 0.25;
const RELOAD_DURATION = 1.0;
const MUZZLE_FLASH_DURATION = 0.05;

export class Shotgun extends WeaponViewModel {
  private pumpSlide!: THREE.Mesh;
  private muzzleFlashL!: THREE.Mesh;
  private muzzleFlashR!: THREE.Mesh;

  // Animation state
  private recoilTimer = 0;
  private reloadTimer = 0;
  private flashTimer = 0;

  // Rest transforms
  private pumpRestZ = 0;
  private restPositionLocal = new THREE.Vector3();

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Shotgun';

    // --- Materials ---
    const gunmetal = createMetalTexture('#3A3A3A', '#2A2A2A');
    const darkMetal = createMetalTexture('#2C2C2C', '#1A1A1A');
    const wood = createWoodTexture('#6B4226', '#4A2E17');

    // --- Double barrels (side by side) ---
    const barrelGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8);

    const barrelLeft = new THREE.Mesh(barrelGeo, gunmetal);
    barrelLeft.rotation.x = Math.PI / 2;
    barrelLeft.position.set(-0.012, 0.015, -0.1);
    barrelLeft.name = 'BarrelLeft';
    root.add(barrelLeft);

    const barrelRight = new THREE.Mesh(barrelGeo, gunmetal);
    barrelRight.rotation.x = Math.PI / 2;
    barrelRight.position.set(0.012, 0.015, -0.1);
    barrelRight.name = 'BarrelRight';
    root.add(barrelRight);

    // --- Barrel bridge (connects the two barrels) ---
    const bridgeGeo = new THREE.BoxGeometry(0.04, 0.008, 0.18);
    const bridge = new THREE.Mesh(bridgeGeo, darkMetal);
    bridge.position.set(0, 0.005, -0.09);
    bridge.name = 'BarrelBridge';
    root.add(bridge);

    // --- Bore holes (dark circles at barrel ends) ---
    const boreGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.005, 8);
    const boreMat = createMetalTexture('#111111', '#0A0A0A');

    const boreL = new THREE.Mesh(boreGeo, boreMat);
    boreL.rotation.x = Math.PI / 2;
    boreL.position.set(-0.012, 0.015, -0.213);
    boreL.name = 'BoreLeft';
    root.add(boreL);

    const boreR = new THREE.Mesh(boreGeo, boreMat);
    boreR.rotation.x = Math.PI / 2;
    boreR.position.set(0.012, 0.015, -0.213);
    boreR.name = 'BoreRight';
    root.add(boreR);

    // --- Receiver (chunky body) ---
    const receiverGeo = new THREE.BoxGeometry(0.042, 0.05, 0.08);
    const receiver = new THREE.Mesh(receiverGeo, gunmetal);
    receiver.position.set(0, -0.005, 0.01);
    receiver.name = 'Receiver';
    root.add(receiver);

    // --- Pump mechanism (cylinder under barrels) ---
    const pumpGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8);
    this.pumpSlide = new THREE.Mesh(pumpGeo, wood);
    this.pumpSlide.rotation.x = Math.PI / 2;
    this.pumpSlide.position.set(0, -0.01, -0.06);
    this.pumpSlide.name = 'PumpSlide';
    root.add(this.pumpSlide);

    // --- Pump rail (thin tube the pump slides along) ---
    const railGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6);
    const rail = new THREE.Mesh(railGeo, darkMetal);
    rail.rotation.x = Math.PI / 2;
    rail.position.set(0, -0.01, -0.06);
    rail.name = 'PumpRail';
    root.add(rail);

    // --- Stock ---
    const stockGeo = new THREE.BoxGeometry(0.035, 0.045, 0.14);
    const stock = new THREE.Mesh(stockGeo, wood);
    stock.rotation.x = (6 * Math.PI) / 180;
    stock.position.set(0, -0.02, 0.12);
    stock.name = 'Stock';
    root.add(stock);

    // --- Stock butt plate ---
    const buttGeo = new THREE.BoxGeometry(0.038, 0.055, 0.008);
    const butt = new THREE.Mesh(buttGeo, darkMetal);
    butt.position.set(0, -0.025, 0.19);
    butt.name = 'ButtPlate';
    root.add(butt);

    // --- Trigger guard ---
    const guardGeo = new THREE.TorusGeometry(0.012, 0.002, 6, 10, Math.PI);
    const guard = new THREE.Mesh(guardGeo, gunmetal);
    guard.rotation.x = Math.PI;
    guard.rotation.z = Math.PI / 2;
    guard.position.set(0, -0.032, 0.02);
    guard.name = 'TriggerGuard';
    root.add(guard);

    // --- Trigger ---
    const triggerGeo = new THREE.BoxGeometry(0.003, 0.014, 0.003);
    const trigger = new THREE.Mesh(triggerGeo, gunmetal);
    trigger.position.set(0, -0.032, 0.02);
    trigger.name = 'Trigger';
    root.add(trigger);

    // --- Muzzle flashes (one per barrel) ---
    const flashGeo = new THREE.PlaneGeometry(0.06, 0.06);
    const flashMatL = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    this.muzzleFlashL = new THREE.Mesh(flashGeo, flashMatL);
    this.muzzleFlashL.position.set(-0.012, 0.015, -0.22);
    this.muzzleFlashL.name = 'MuzzleFlashL';
    root.add(this.muzzleFlashL);

    const flashMatR = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    this.muzzleFlashR = new THREE.Mesh(flashGeo, flashMatR);
    this.muzzleFlashR.position.set(0.012, 0.015, -0.22);
    this.muzzleFlashR.name = 'MuzzleFlashR';
    root.add(this.muzzleFlashR);

    // Store rest transforms
    this.pumpRestZ = this.pumpSlide.position.z;
    this.restPositionLocal.copy(root.position);

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
    // Heaviest recoil — big kick, slower recovery
    const recoilCurve = Math.sin(t * Math.PI) * Math.sqrt(t);

    const modelGroup = this.group.children[0] as THREE.Group;
    // Massive kick back (0.045 — biggest of all weapons)
    modelGroup.position.z = this.restPositionLocal.z + recoilCurve * 0.045;
    // Strong upward rotation
    modelGroup.rotation.x = recoilCurve * 0.15;
    // Slight lateral twist from the double-barrel blast
    modelGroup.rotation.z = recoilCurve * 0.03;

    if (this.recoilTimer <= 0) {
      modelGroup.position.z = this.restPositionLocal.z;
      modelGroup.rotation.x = 0;
      modelGroup.rotation.z = 0;
      this.state = 'idle';
    }
  }

  private updateReloadAnimation(dt: number): void {
    if (this.reloadTimer <= 0) return;

    this.reloadTimer -= dt;
    const progress = 1 - Math.max(0, this.reloadTimer / RELOAD_DURATION);
    const modelGroup = this.group.children[0] as THREE.Group;

    // Phase 1 (0–0.4): Pump slides back
    // Phase 2 (0.4–0.6): Hold back (eject shells)
    // Phase 3 (0.6–0.9): Pump snaps forward (satisfying)
    // Phase 4 (0.9–1.0): Settle
    if (progress < 0.4) {
      const p = progress / 0.4;
      const eased = easeOutQuad(p);
      this.pumpSlide.position.z = this.pumpRestZ + eased * 0.06;
      modelGroup.rotation.x = -eased * 0.02;
    } else if (progress < 0.6) {
      this.pumpSlide.position.z = this.pumpRestZ + 0.06;
      // Slight upward jerk — shells ejecting
      const ejectP = (progress - 0.4) / 0.2;
      modelGroup.rotation.x = -0.02 + Math.sin(ejectP * Math.PI) * 0.02;
    } else if (progress < 0.9) {
      const p = (progress - 0.6) / 0.3;
      // Snappy forward push — use easeInQuad for that "click" feel
      const eased = easeInCubic(p);
      this.pumpSlide.position.z = this.pumpRestZ + 0.06 * (1 - eased);
      modelGroup.rotation.x = -0.02 * (1 - eased);
    } else {
      const p = (progress - 0.9) / 0.1;
      // Micro-bounce at the end of the pump snap
      const bounce = Math.sin(p * Math.PI) * 0.005;
      this.pumpSlide.position.z = this.pumpRestZ - bounce;
      modelGroup.rotation.x = 0;
    }

    if (this.reloadTimer <= 0) {
      this.pumpSlide.position.z = this.pumpRestZ;
      modelGroup.rotation.x = 0;
      this.state = 'idle';
    }
  }

  private updateMuzzleFlash(dt: number): void {
    if (this.flashTimer <= 0) return;

    this.flashTimer -= dt;
    const matL = this.muzzleFlashL.material as THREE.MeshBasicMaterial;
    const matR = this.muzzleFlashR.material as THREE.MeshBasicMaterial;

    if (this.flashTimer > 0) {
      // Both barrels flash together
      const opacity = 0.85;
      matL.opacity = opacity;
      matR.opacity = opacity;
      const flickerScale = 0.8 + (this.flashTimer / MUZZLE_FLASH_DURATION) * 0.4;
      this.muzzleFlashL.scale.setScalar(flickerScale);
      this.muzzleFlashR.scale.setScalar(flickerScale * 0.9);
      this.muzzleFlashL.rotation.z = (this.flashTimer * 200) % (Math.PI * 2);
      this.muzzleFlashR.rotation.z = (this.flashTimer * 155) % (Math.PI * 2);
    } else {
      matL.opacity = 0;
      matR.opacity = 0;
      this.muzzleFlashL.scale.setScalar(1);
      this.muzzleFlashR.scale.setScalar(1);
    }
  }
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInCubic(t: number): number {
  return t * t * t;
}
