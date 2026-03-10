// Vegetation — Procedural vegetation geometry constructors for the Old West.
//
// Each function returns a THREE.Group of primitives. Materials come from
// CanvasTextureFactory. No scopedRNG('render', 42, rngTick()) — alea PRNG for all variation.

import Alea from 'alea';
import * as THREE from 'three';

import {
  createFabricTexture,
  createStoneTexture,
  createWoodTexture,
} from '../materials';
import { scopedRNG, rngTick } from '../../lib/prng';

// --- Types ---

export type CactusVariant = 'saguaro' | 'barrel' | 'prickly';
export type RockSize = 'small' | 'medium' | 'large';

type PRNG = () => number;

// --- Helpers ---

function prng(seed: string): PRNG {
  return Alea(seed) as unknown as PRNG;
}

function setMeshShadows(mesh: THREE.Mesh): void {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

// ---------------------------------------------------------------------------
// Cactus
// ---------------------------------------------------------------------------

export function createCactus(variant: CactusVariant, seed = 'cactus'): THREE.Group {
  const group = new THREE.Group();
  group.name = `cactus-${variant}`;

  switch (variant) {
    case 'saguaro':
      buildSaguaro(group, seed);
      break;
    case 'barrel':
      buildBarrelCactus(group, seed);
      break;
    case 'prickly':
      buildPricklyPear(group, seed);
      break;
  }

  return group;
}

function buildSaguaro(group: THREE.Group, seed: string): void {
  const rng = prng(`saguaro-${seed}`);
  const mat = createFabricTexture('#2D5A27', 'stripe'); // green with spine lines

  // Main trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.17, 2.5, 8);
  const trunk = new THREE.Mesh(trunkGeo, mat);
  trunk.position.y = 1.25;
  setMeshShadows(trunk);
  group.add(trunk);

  // 1-2 arms
  const armCount = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < armCount; i++) {
    const armHeight = 0.8 + rng() * 0.6;
    const armGeo = new THREE.CylinderGeometry(0.08, 0.1, armHeight, 6);
    const arm = new THREE.Mesh(armGeo, mat);

    const side = i === 0 ? 1 : -1;
    const attachY = 0.8 + rng() * 1.0;

    // Horizontal stub
    arm.position.set(side * 0.3, attachY, 0);
    arm.rotation.z = side * (-Math.PI / 4 + rng() * 0.3);
    setMeshShadows(arm);
    group.add(arm);

    // Vertical elbow tip
    const tipGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.5, 6);
    const tip = new THREE.Mesh(tipGeo, mat);
    tip.position.set(side * 0.55, attachY + armHeight * 0.35, 0);
    setMeshShadows(tip);
    group.add(tip);
  }
}

function buildBarrelCactus(group: THREE.Group, seed: string): void {
  const rng = prng(`barrel-${seed}`);
  const mat = createFabricTexture('#3B6B35', 'stripe'); // ribbed look via stripes

  const geo = new THREE.CylinderGeometry(0.3, 0.28, 0.5, 12);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.25;
  setMeshShadows(mesh);
  group.add(mesh);

  // Top cap — slightly lighter
  const capGeo = new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3);
  const capMat = createFabricTexture('#4A7A44', 'plain');
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.5;
  cap.rotation.x = rng() * 0.05; // tiny random tilt
  setMeshShadows(cap);
  group.add(cap);
}

function buildPricklyPear(group: THREE.Group, seed: string): void {
  const rng = prng(`prickly-${seed}`);
  const mat = createFabricTexture('#4A7A44', 'plain');

  // Cluster of flattened paddle shapes (squished cylinders)
  const paddleCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < paddleCount; i++) {
    const h = 0.04 + rng() * 0.03;
    const r = 0.12 + rng() * 0.1;
    const geo = new THREE.CylinderGeometry(r, r, h, 8);
    const paddle = new THREE.Mesh(geo, mat);

    const angle = (i / paddleCount) * Math.PI * 2 + rng() * 0.5;
    const dist = i === 0 ? 0 : 0.1 + rng() * 0.15;
    const baseY = i === 0 ? 0.15 : 0.15 + rng() * 0.25;

    paddle.position.set(Math.cos(angle) * dist, baseY, Math.sin(angle) * dist);
    paddle.rotation.x = Math.PI / 2 + (rng() - 0.5) * 0.4;
    paddle.rotation.z = (rng() - 0.5) * 0.3;
    setMeshShadows(paddle);
    group.add(paddle);
  }
}

// ---------------------------------------------------------------------------
// Tumbleweed
// ---------------------------------------------------------------------------

export function createTumbleweed(seed = 'tumbleweed'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tumbleweed';

  const baseGeo = new THREE.IcosahedronGeometry(0.3, 1);
  const wireGeo = new THREE.WireframeGeometry(baseGeo);
  const mat = new THREE.LineBasicMaterial({
    color: 0xc2a366,
    transparent: true,
    opacity: 0.7,
  });

  const wireframe = new THREE.LineSegments(wireGeo, mat);
  wireframe.position.y = 0.3;
  group.add(wireframe);

  return group;
}

// ---------------------------------------------------------------------------
// Scrub Brush
// ---------------------------------------------------------------------------

export function createScrubBrush(seed = 'scrub'): THREE.Group {
  const rng = prng(`scrub-${seed}`);
  const group = new THREE.Group();
  group.name = 'scrub-brush';

  const mat = createFabricTexture('#6B7B5A', 'plain'); // grey-green

  const count = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const h = 0.15 + rng() * 0.2;
    const r = 0.05 + rng() * 0.06;
    const geo = new THREE.ConeGeometry(r, h, 5);
    const cone = new THREE.Mesh(geo, mat);

    const angle = rng() * Math.PI * 2;
    const dist = rng() * 0.15;
    cone.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
    cone.rotation.x = (rng() - 0.5) * 0.3;
    cone.rotation.z = (rng() - 0.5) * 0.3;
    setMeshShadows(cone);
    group.add(cone);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Dead Tree
// ---------------------------------------------------------------------------

export function createDeadTree(seed = 'deadtree'): THREE.Group {
  const rng = prng(`deadtree-${seed}`);
  const group = new THREE.Group();
  group.name = 'dead-tree';

  const mat = createWoodTexture('#4A3728', '#2E2218');

  // Tapered trunk
  const trunkGeo = new THREE.CylinderGeometry(0.03, 0.08, 2, 6);
  const trunk = new THREE.Mesh(trunkGeo, mat);
  trunk.position.y = 1.0;
  setMeshShadows(trunk);
  group.add(trunk);

  // 2-3 branches
  const branchCount = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < branchCount; i++) {
    const len = 0.4 + rng() * 0.5;
    const branchGeo = new THREE.CylinderGeometry(0.015, 0.03, len, 5);
    const branch = new THREE.Mesh(branchGeo, mat);

    const attachY = 1.0 + rng() * 0.8;
    const angle = (i / branchCount) * Math.PI * 2 + rng() * 0.8;
    const tilt = Math.PI / 4 + rng() * 0.4;

    branch.position.set(
      Math.cos(angle) * 0.1,
      attachY,
      Math.sin(angle) * 0.1,
    );
    branch.rotation.z = Math.cos(angle) * tilt;
    branch.rotation.x = Math.sin(angle) * tilt;
    setMeshShadows(branch);
    group.add(branch);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Rock
// ---------------------------------------------------------------------------

export function createRock(size: RockSize, seed = 'rock'): THREE.Group {
  const rng = prng(`rock-${size}-${seed}`);
  const group = new THREE.Group();
  group.name = `rock-${size}`;

  const sizeMap: Record<RockSize, number> = { small: 0.2, medium: 0.5, large: 1.0 };
  const radius = sizeMap[size];

  const geo = new THREE.DodecahedronGeometry(radius, 1);
  const posAttr = geo.attributes.position as THREE.BufferAttribute;

  // Displace vertices for irregular shape
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const displacement = 1 + (rng() - 0.5) * 0.35;
    posAttr.setXYZ(i, x * displacement, y * displacement * 0.7, z * displacement);
  }
  geo.computeVertexNormals();

  const mat = createStoneTexture('#7A7062');
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = radius * 0.3;
  setMeshShadows(mesh);
  group.add(mesh);

  return group;
}
