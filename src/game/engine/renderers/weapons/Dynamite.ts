// Dynamite — First-person throwable explosive built from THREE.js primitives.
// Animations: fire (arm wind-up, throw, return empty), no reload (single use).

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import {
  createFabricTexture,
  createLeatherTexture,
} from '@/src/game/engine/materials';

// ---------------------------------------------------------------------------
// Rest position — held in front, slightly right
// ---------------------------------------------------------------------------

const REST_POSITION = new THREE.Vector3(0.12, -0.1, -0.25);

// ---------------------------------------------------------------------------
// Animation timing
// ---------------------------------------------------------------------------

const THROW_DURATION = 0.6;
const FUSE_SPARK_RATE = 12; // sparks per second (used for flicker phase)

// ---------------------------------------------------------------------------
// Dynamite implementation
// ---------------------------------------------------------------------------

export class Dynamite extends WeaponViewModel {
  private stickGroup!: THREE.Group;
  private fuseSparkMesh!: THREE.Mesh;
  private fuseMesh!: THREE.Mesh;

  // Animation state
  private throwTimer = 0;
  private fusePhase = 0;
  private thrown = false;

  // Rest transforms
  private restPositionLocal = new THREE.Vector3();

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Dynamite';

    // --- Stick group (detaches during throw) ---
    this.stickGroup = new THREE.Group();
    this.stickGroup.name = 'StickGroup';

    // --- Dynamite stick (red cylinder) ---
    const stickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8);
    const stickMat = createFabricTexture('#B22222', 'plain');
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.name = 'Stick';
    this.stickGroup.add(stick);

    // --- Paper wrapper bands ---
    const bandGeo = new THREE.CylinderGeometry(0.0125, 0.0125, 0.006, 8);
    const bandMat = createFabricTexture('#8B1A1A', 'stripe');
    for (let i = 0; i < 3; i++) {
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = -0.035 + i * 0.035;
      band.name = `Band_${i}`;
      this.stickGroup.add(band);
    }

    // --- Label (thin cylinder wrap around center) ---
    const labelGeo = new THREE.CylinderGeometry(0.0128, 0.0128, 0.025, 8);
    const labelMat = createLeatherTexture('#D4A574');
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = 0;
    label.name = 'Label';
    this.stickGroup.add(label);

    // --- Fuse (thin cylinder poking out the top) ---
    const fuseGeo = new THREE.CylinderGeometry(0.003, 0.002, 0.04, 6);
    const fuseMat = createFabricTexture('#4A4A2A', 'plain');
    this.fuseMesh = new THREE.Mesh(fuseGeo, fuseMat);
    this.fuseMesh.position.y = 0.07;
    // Slight angle for visual interest
    this.fuseMesh.rotation.z = 0.15;
    this.fuseMesh.name = 'Fuse';
    this.stickGroup.add(this.fuseMesh);

    // --- Fuse spark (small emissive sphere at tip) ---
    const sparkGeo = new THREE.SphereGeometry(0.006, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
    });
    this.fuseSparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    this.fuseSparkMesh.position.y = 0.09;
    this.fuseSparkMesh.position.x = 0.006;
    this.fuseSparkMesh.name = 'FuseSpark';
    this.stickGroup.add(this.fuseSparkMesh);

    root.add(this.stickGroup);

    // --- Hand (simple box to show the grip) ---
    const handGeo = new THREE.BoxGeometry(0.03, 0.06, 0.04);
    const handMat = createLeatherTexture('#8B6914');
    const hand = new THREE.Mesh(handGeo, handMat);
    hand.position.set(0, -0.07, 0);
    hand.name = 'Hand';
    root.add(hand);

    // Store rest transforms
    this.restPositionLocal = root.position.clone();

    return root;
  }

  getRestPosition(): THREE.Vector3 {
    return REST_POSITION;
  }

  playFire(): void {
    if (!this.canFire()) return;
    if (this.thrown) return; // single use
    this.state = 'firing';
    this.throwTimer = THROW_DURATION;
  }

  playReload(): void {
    // Dynamite has no reload — single use weapon
  }

  override canReload(): boolean {
    return false;
  }

  override update(
    deltaTime: number,
    inputFrame: Readonly<import('@/src/game/input/InputFrame').InputFrame>,
  ): void {
    this.updateFuseSpark(deltaTime);
    this.updateThrowAnimation(deltaTime);

    super.update(deltaTime, inputFrame);
  }

  // -------------------------------------------------------------------------
  // Animation internals
  // -------------------------------------------------------------------------

  private updateFuseSpark(dt: number): void {
    if (this.thrown) return;

    this.fusePhase += dt * FUSE_SPARK_RATE;

    // Flickering glow on the spark
    const flicker = 0.6 + Math.sin(this.fusePhase * Math.PI * 2) * 0.2 +
      Math.sin(this.fusePhase * Math.PI * 5.7) * 0.15;

    const sparkMat = this.fuseSparkMesh.material as THREE.MeshBasicMaterial;
    sparkMat.opacity = flicker;

    // Pulse the spark size
    const pulseScale = 0.8 + Math.sin(this.fusePhase * Math.PI * 3) * 0.3;
    this.fuseSparkMesh.scale.setScalar(pulseScale);

    // Color shift between orange and yellow
    const colorPhase = (Math.sin(this.fusePhase * Math.PI * 4) + 1) * 0.5;
    sparkMat.color.setRGB(1.0, 0.5 + colorPhase * 0.3, colorPhase * 0.2);
  }

  private updateThrowAnimation(dt: number): void {
    if (this.throwTimer <= 0) return;

    this.throwTimer -= dt;
    const progress = 1 - Math.max(0, this.throwTimer / THROW_DURATION);
    const modelGroup = this.group.children[0] as THREE.Group;

    // Phase 1 (0–0.3): Wind back (arm goes behind)
    // Phase 2 (0.3–0.55): Throw forward (fast)
    // Phase 3 (0.55–0.7): Dynamite detaches and flies away
    // Phase 4 (0.7–1.0): Hand returns empty
    if (progress < 0.3) {
      const p = progress / 0.3;
      const eased = easeOutQuad(p);
      // Wind back
      modelGroup.rotation.x = -eased * 0.5;
      modelGroup.position.z = this.restPositionLocal.z + eased * 0.05;
      modelGroup.position.y = eased * 0.03;
    } else if (progress < 0.55) {
      const p = (progress - 0.3) / 0.25;
      const eased = easeInCubic(p);
      // Throw forward
      modelGroup.rotation.x = -0.5 + eased * 1.0;
      modelGroup.position.z = this.restPositionLocal.z + 0.05 - eased * 0.12;
      modelGroup.position.y = 0.03 - eased * 0.02;
    } else if (progress < 0.7) {
      // Dynamite detaches — hide it
      this.stickGroup.visible = false;
      this.thrown = true;
      const p = (progress - 0.55) / 0.15;
      // Follow through
      modelGroup.rotation.x = 0.5 - p * 0.3;
    } else {
      const p = (progress - 0.7) / 0.3;
      const eased = easeOutQuad(p);
      // Return to rest
      modelGroup.rotation.x = 0.2 * (1 - eased);
      modelGroup.position.z = this.restPositionLocal.z + (-0.07) * (1 - eased);
      modelGroup.position.y = 0.01 * (1 - eased);
    }

    if (this.throwTimer <= 0) {
      modelGroup.rotation.x = 0;
      modelGroup.position.z = this.restPositionLocal.z;
      modelGroup.position.y = 0;
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
