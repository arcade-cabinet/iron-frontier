// Lantern — First-person carried lantern built from THREE.js primitives.
// Always active (provides light), no fire animation. Held on the LEFT side.
// Has exaggerated pendulum sway — slower, heavier bob than other weapons.

import * as THREE from 'three';
import { WeaponViewModel } from '../WeaponViewModel';
import {
  createGlassTexture,
  createMetalTexture,
} from '@/src/game/engine/materials';

// ---------------------------------------------------------------------------
// Rest position — LEFT side of view (lantern in off-hand)
// ---------------------------------------------------------------------------

const REST_POSITION = new THREE.Vector3(-0.15, -0.1, -0.25);

// ---------------------------------------------------------------------------
// Pendulum sway overrides (longer, slower than default weapon bob)
// ---------------------------------------------------------------------------

const PENDULUM_FREQUENCY = 5; // slower than weapon bob (10)
const PENDULUM_AMPLITUDE_X = 0.008; // wider horizontal swing
const PENDULUM_AMPLITUDE_Y = 0.004;
const PENDULUM_ROT_AMPLITUDE = 0.04; // rotation sway

// ---------------------------------------------------------------------------
// Lantern implementation
// ---------------------------------------------------------------------------

export class Lantern extends WeaponViewModel {
  private candleMesh!: THREE.Mesh;
  private pointLight!: THREE.PointLight;

  // Pendulum phase tracking
  private pendulumPhase = 0;

  constructModel(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Lantern';

    // --- Materials ---
    const brass = createMetalTexture('#8B7536', '#6B5526');
    const darkMetal = createMetalTexture('#3A3A3A', '#2A2A2A');
    const glass = createGlassTexture('#E8D8A0');

    // --- Base plate (bottom) ---
    const baseGeo = new THREE.CylinderGeometry(0.025, 0.028, 0.008, 8);
    const base = new THREE.Mesh(baseGeo, brass);
    base.position.set(0, -0.05, 0);
    base.name = 'Base';
    root.add(base);

    // --- Top cap ---
    const capGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.01, 8);
    const cap = new THREE.Mesh(capGeo, brass);
    cap.position.set(0, 0.05, 0);
    cap.name = 'TopCap';
    root.add(cap);

    // --- Chimney (small vent on top) ---
    const chimneyGeo = new THREE.CylinderGeometry(0.006, 0.01, 0.015, 6);
    const chimney = new THREE.Mesh(chimneyGeo, darkMetal);
    chimney.position.set(0, 0.063, 0);
    chimney.name = 'Chimney';
    root.add(chimney);

    // --- Wire cage frame (four vertical posts) ---
    const postGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.09, 4);
    const postAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const cageRadius = 0.022;

    for (let i = 0; i < postAngles.length; i++) {
      const angle = postAngles[i];
      const post = new THREE.Mesh(postGeo, brass);
      post.position.set(
        Math.cos(angle) * cageRadius,
        0,
        Math.sin(angle) * cageRadius,
      );
      post.name = `CagePost_${i}`;
      root.add(post);
    }

    // --- Cage horizontal rings (top and bottom) ---
    const ringGeo = new THREE.TorusGeometry(cageRadius, 0.002, 4, 8);
    const topRing = new THREE.Mesh(ringGeo, brass);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.set(0, 0.04, 0);
    topRing.name = 'TopRing';
    root.add(topRing);

    const bottomRing = new THREE.Mesh(ringGeo, brass);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.set(0, -0.04, 0);
    bottomRing.name = 'BottomRing';
    root.add(bottomRing);

    // Middle ring for structure
    const midRing = new THREE.Mesh(ringGeo, brass);
    midRing.rotation.x = Math.PI / 2;
    midRing.position.set(0, 0, 0);
    midRing.name = 'MidRing';
    root.add(midRing);

    // --- Glass panels (4 panels between the cage posts) ---
    const panelGeo = new THREE.PlaneGeometry(0.03, 0.075);
    for (let i = 0; i < 4; i++) {
      const angle = postAngles[i] + Math.PI / 4;
      const panel = new THREE.Mesh(panelGeo, glass);
      panel.position.set(
        Math.cos(angle) * (cageRadius - 0.002),
        0,
        Math.sin(angle) * (cageRadius - 0.002),
      );
      panel.rotation.y = -angle + Math.PI / 2;
      panel.name = `GlassPanel_${i}`;
      root.add(panel);
    }

    // --- Candle inside (emissive yellow cylinder) ---
    const candleGeo = new THREE.CylinderGeometry(0.005, 0.006, 0.035, 6);
    const candleMat = new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffaa44,
      emissiveIntensity: 0.8,
      roughness: 0.9,
      metalness: 0.0,
      depthTest: false,
      depthWrite: false,
    });
    this.candleMesh = new THREE.Mesh(candleGeo, candleMat);
    this.candleMesh.position.set(0, -0.025, 0);
    this.candleMesh.name = 'Candle';
    root.add(this.candleMesh);

    // --- Flame (small emissive sphere above candle) ---
    const flameGeo = new THREE.SphereGeometry(0.005, 6, 6);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, -0.005, 0);
    flame.scale.set(1, 1.5, 1);
    flame.name = 'Flame';
    root.add(flame);

    // --- Bail handle (curved wire over the top) ---
    const bailGeo = new THREE.TorusGeometry(0.025, 0.0025, 6, 12, Math.PI);
    const bail = new THREE.Mesh(bailGeo, brass);
    bail.position.set(0, 0.065, 0);
    bail.name = 'BailHandle';
    root.add(bail);

    // --- Chain links (small tori forming a chain from bail to "hand") ---
    const linkGeo = new THREE.TorusGeometry(0.005, 0.0015, 4, 6);
    for (let i = 0; i < 4; i++) {
      const link = new THREE.Mesh(linkGeo, darkMetal);
      link.position.set(0, 0.085 + i * 0.012, 0);
      // Alternate orientation for chain look
      link.rotation.y = (i % 2) * (Math.PI / 2);
      link.name = `ChainLink_${i}`;
      root.add(link);
    }

    // --- Point light (the actual light source) ---
    this.pointLight = new THREE.PointLight(0xffaa44, 1.5, 8, 1.5);
    this.pointLight.position.set(0, 0, 0);
    this.pointLight.name = 'LanternLight';
    root.add(this.pointLight);

    return root;
  }

  getRestPosition(): THREE.Vector3 {
    return REST_POSITION;
  }

  playFire(): void {
    // Lantern doesn't fire — always active
  }

  playReload(): void {
    // No reload
  }

  override canFire(): boolean {
    return false;
  }

  override canReload(): boolean {
    return false;
  }

  override update(
    deltaTime: number,
    inputFrame: Readonly<import('@/src/game/input/InputFrame').InputFrame>,
  ): void {
    this.updateFlameFlicker(deltaTime);
    this.updatePendulumSway(deltaTime, inputFrame);

    super.update(deltaTime, inputFrame);
  }

  // -------------------------------------------------------------------------
  // Animation internals
  // -------------------------------------------------------------------------

  private updateFlameFlicker(dt: number): void {
    this.pendulumPhase += dt;

    // Candle flame flicker — deterministic from time
    const flicker = 0.7 + Math.sin(this.pendulumPhase * 13.7) * 0.1 +
      Math.sin(this.pendulumPhase * 7.3) * 0.1 +
      Math.sin(this.pendulumPhase * 23.1) * 0.05;

    const candleMat = this.candleMesh.material as THREE.MeshStandardMaterial;
    candleMat.emissiveIntensity = flicker;

    // Light intensity follows flame
    this.pointLight.intensity = 1.0 + flicker * 0.8;

    // Slight color temperature shift
    const warmth = 0.9 + Math.sin(this.pendulumPhase * 5.3) * 0.1;
    this.pointLight.color.setRGB(1.0, 0.65 * warmth, 0.25 * warmth);
  }

  private updatePendulumSway(
    dt: number,
    inputFrame: Readonly<import('@/src/game/input/InputFrame').InputFrame>,
  ): void {
    const moveSpeed = Math.sqrt(
      inputFrame.move.x * inputFrame.move.x +
      inputFrame.move.z * inputFrame.move.z,
    );
    const isMoving = moveSpeed > 0.1;

    if (isMoving) {
      this.pendulumPhase += dt * PENDULUM_FREQUENCY;
    }

    // Pendulum swing — wider, slower motion than regular weapon bob
    const swingX = Math.sin(this.pendulumPhase) * PENDULUM_AMPLITUDE_X * (isMoving ? moveSpeed : 0.3);
    const swingY = Math.sin(this.pendulumPhase * 2) * PENDULUM_AMPLITUDE_Y * (isMoving ? moveSpeed : 0.2);

    // Apply rotation sway to the model group for pendulum effect
    const modelGroup = this.group.children[0] as THREE.Group;
    if (modelGroup) {
      const rotSway = Math.sin(this.pendulumPhase * 0.8) * PENDULUM_ROT_AMPLITUDE *
        (isMoving ? moveSpeed : 0.2);
      modelGroup.rotation.z = rotSway;

      // Gentle position offset for the pendulum arc
      modelGroup.position.x = swingX;
      modelGroup.position.y = swingY;
    }
  }
}
