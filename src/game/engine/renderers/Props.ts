// Props — Procedural Western prop geometry constructors.
//
// Each function returns a THREE.Group of primitives. Materials come from
// CanvasTextureFactory. No Math.random() — alea PRNG for all variation.

import * as THREE from 'three';

import { createMetalTexture, createRustTexture, createWoodTexture } from '../materials';

function shadow(mesh: THREE.Mesh): void {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

// --- Hitching Post ---

export function createHitchingPost(seed = 'hitch'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'hitching-post';

  const woodMat = createWoodTexture('#8B6914', '#5C4033');

  // Two vertical posts
  for (const side of [-1, 1]) {
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(side * 0.6, 0.5, 0);
    shadow(post);
    group.add(post);

    // Base block
    const baseGeo = new THREE.BoxGeometry(0.15, 0.08, 0.15);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.set(side * 0.6, 0.04, 0);
    shadow(base);
    group.add(base);
  }

  // Horizontal rail
  const railGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.3, 6);
  const rail = new THREE.Mesh(railGeo, woodMat);
  rail.rotation.z = Math.PI / 2;
  rail.position.y = 0.85;
  shadow(rail);
  group.add(rail);

  return group;
}

// --- Water Trough ---

export function createWaterTrough(seed = 'trough'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'water-trough';

  const woodMat = createWoodTexture('#5C3317', '#3B2010');
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x3a6b8c,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.6,
  });

  const W = 1.2;
  const H = 0.35;
  const D = 0.5;
  const T = 0.06; // wall thickness

  // Bottom
  const bottomGeo = new THREE.BoxGeometry(W, T, D);
  const bottom = new THREE.Mesh(bottomGeo, woodMat);
  bottom.position.y = T / 2;
  shadow(bottom);
  group.add(bottom);

  // Four walls (open top)
  const walls: [number, number, number, number, number, number][] = [
    [W, H, T, 0, H / 2, D / 2 - T / 2],   // front
    [W, H, T, 0, H / 2, -D / 2 + T / 2],  // back
    [T, H, D, W / 2 - T / 2, H / 2, 0],   // right
    [T, H, D, -W / 2 + T / 2, H / 2, 0],  // left
  ];

  for (const [w, h, d, x, y, z] of walls) {
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(wallGeo, woodMat);
    wall.position.set(x, y, z);
    shadow(wall);
    group.add(wall);
  }

  // Water surface
  const waterGeo = new THREE.BoxGeometry(W - T * 2, 0.02, D - T * 2);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = H * 0.6;
  group.add(water);

  return group;
}

// --- Barrel ---

export function createBarrel(seed = 'barrel'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'barrel';

  const woodMat = createWoodTexture('#6B4226', '#4A2E18');
  const metalMat = createMetalTexture('#555555');

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.7, 12);
  const body = new THREE.Mesh(bodyGeo, woodMat);
  body.position.y = 0.35;
  shadow(body);
  group.add(body);

  // Metal bands (three thin torus rings)
  const bandOffsets = [0.12, 0.35, 0.58];
  for (const yOff of bandOffsets) {
    const bandGeo = new THREE.TorusGeometry(0.24, 0.012, 4, 16);
    const band = new THREE.Mesh(bandGeo, metalMat);
    band.position.y = yOff;
    band.rotation.x = Math.PI / 2;
    shadow(band);
    group.add(band);
  }

  return group;
}

// --- Crate ---

export function createCrate(seed = 'crate'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'crate';

  const mat = createWoodTexture('#7A5C3A', '#5A4028');

  const size = 0.5;
  const geo = new THREE.BoxGeometry(size, size, size);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = size / 2;
  shadow(mesh);
  group.add(mesh);

  // Edge trim (slightly darker planks as thin strips)
  const trimMat = createWoodTexture('#5A4028', '#3A2A18');
  const edges: [number, number, number, number, number, number][] = [
    [size + 0.02, 0.03, 0.03, 0, size - 0.02, 0],
    [size + 0.02, 0.03, 0.03, 0, 0.02, 0],
    [0.03, size + 0.02, 0.03, size / 2, size / 2, 0],
    [0.03, size + 0.02, 0.03, -size / 2, size / 2, 0],
  ];

  for (const [w, h, d, x, y, z] of edges) {
    const edgeGeo = new THREE.BoxGeometry(w, h, d);
    const edge = new THREE.Mesh(edgeGeo, trimMat);
    edge.position.set(x, y, z);
    shadow(edge);
    group.add(edge);
  }

  return group;
}

// --- Wagon Wheel ---

export function createWagonWheel(seed = 'wheel'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wagon-wheel';

  const woodMat = createWoodTexture('#6B4226', '#4A2E18');
  const metalMat = createMetalTexture('#555555');

  const rimRadius = 0.4;
  const rimTube = 0.03;

  // Outer rim (metal)
  const rimGeo = new THREE.TorusGeometry(rimRadius, rimTube, 8, 24);
  const rim = new THREE.Mesh(rimGeo, metalMat);
  shadow(rim);
  group.add(rim);

  // Center hub
  const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8);
  const hub = new THREE.Mesh(hubGeo, woodMat);
  hub.rotation.x = Math.PI / 2;
  shadow(hub);
  group.add(hub);

  // Spokes
  const spokeCount = 8;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spokeLen = rimRadius - 0.05;
    const spokeGeo = new THREE.CylinderGeometry(0.012, 0.012, spokeLen, 4);
    const spoke = new THREE.Mesh(spokeGeo, woodMat);

    spoke.position.set(
      Math.cos(angle) * spokeLen * 0.5,
      Math.sin(angle) * spokeLen * 0.5,
      0,
    );
    spoke.rotation.z = angle - Math.PI / 2;
    shadow(spoke);
    group.add(spoke);
  }

  return group;
}

// --- Mine Cart ---

export function createMineCart(seed = 'minecart'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mine-cart';

  const rustMat = createRustTexture('#7A4A2A');
  const metalMat = createMetalTexture('#444444');

  // Body (trapezoidal box approximation — wider at top)
  const bodyGeo = new THREE.BoxGeometry(0.6, 0.35, 0.4);
  const body = new THREE.Mesh(bodyGeo, rustMat);
  body.position.y = 0.35;
  shadow(body);
  group.add(body);

  // Axle
  const axleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
  const axle = new THREE.Mesh(axleGeo, metalMat);
  axle.rotation.z = Math.PI / 2;
  axle.position.y = 0.1;
  shadow(axle);
  group.add(axle);

  // Four small wheels
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 8);
      const wheel = new THREE.Mesh(wheelGeo, metalMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx * 0.25, 0.08, sz * 0.22);
      shadow(wheel);
      group.add(wheel);
    }
  }

  return group;
}

// --- Railroad Track ---

export function createRailroadTrack(length = 5, seed = 'track'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'railroad-track';

  const metalMat = createMetalTexture('#555555');
  const woodMat = createWoodTexture('#5C3317', '#3B2010');

  const gauge = 0.7; // distance between rails
  const railH = 0.06;
  const railW = 0.04;

  // Two parallel rails
  for (const side of [-1, 1]) {
    const railGeo = new THREE.BoxGeometry(railW, railH, length);
    const rail = new THREE.Mesh(railGeo, metalMat);
    rail.position.set(side * gauge * 0.5, railH / 2, 0);
    shadow(rail);
    group.add(rail);
  }

  // Sleepers (ties)
  const sleeperSpacing = 0.4;
  const sleeperCount = Math.floor(length / sleeperSpacing);
  const sleeperW = gauge + 0.3;
  const sleeperGeo = new THREE.BoxGeometry(sleeperW, 0.04, 0.12);

  const startZ = -length / 2;
  for (let i = 0; i < sleeperCount; i++) {
    const sleeper = new THREE.Mesh(sleeperGeo, woodMat);
    sleeper.position.set(0, 0.02, startZ + i * sleeperSpacing + sleeperSpacing / 2);
    shadow(sleeper);
    group.add(sleeper);
  }

  return group;
}
