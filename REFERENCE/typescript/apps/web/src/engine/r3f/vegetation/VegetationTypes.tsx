// VegetationTypes - Individual plant geometry components for R3F
// Each component creates Three.js geometry for a specific plant type

import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ============================================================================
// GEOMETRY CREATION UTILITIES
// ============================================================================

/**
 * Create a cylinder geometry with specific parameters
 */
function createCylinder(
  height: number,
  radiusTop: number,
  radiusBottom: number,
  segments: number = 8
): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
}

/**
 * Create a sphere geometry
 */
function createSphere(radius: number, segments: number = 8): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, segments, segments);
}

/**
 * Transform a geometry and return it
 */
function transformGeometry(
  geometry: THREE.BufferGeometry,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
): THREE.BufferGeometry {
  const matrix = new THREE.Matrix4();
  matrix.compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...scale)
  );
  geometry.applyMatrix4(matrix);
  return geometry;
}

// ============================================================================
// CACTUS (SAGUARO STYLE)
// ============================================================================

/**
 * Create Saguaro cactus geometry
 * Tall columnar cactus with characteristic arms
 */
export function createCactusGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Main trunk
  const trunk = createCylinder(3, 0.3, 0.4, 12);
  transformGeometry(trunk, [0, 1.5, 0]);
  geometries.push(trunk);

  // Right arm - horizontal section
  const armH1 = createCylinder(0.8, 0.18, 0.2, 10);
  transformGeometry(armH1, [0.55, 1.5, 0], [0, 0, Math.PI / 2]);
  geometries.push(armH1);

  // Right arm - vertical section
  const armV1 = createCylinder(1.5, 0.15, 0.18, 10);
  transformGeometry(armV1, [0.9, 2.5, 0]);
  geometries.push(armV1);

  // Left arm - horizontal section
  const armH2 = createCylinder(0.6, 0.16, 0.18, 10);
  transformGeometry(armH2, [-0.45, 2.0, 0], [0, 0, -Math.PI / 2]);
  geometries.push(armH2);

  // Left arm - vertical section
  const armV2 = createCylinder(1.2, 0.13, 0.16, 10);
  transformGeometry(armV2, [-0.7, 3.0, 0]);
  geometries.push(armV2);

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

/**
 * Cactus geometry hook with memoization
 */
export function useCactusGeometry(): THREE.BufferGeometry {
  return useMemo(() => createCactusGeometry(), []);
}

// ============================================================================
// JOSHUA TREE
// ============================================================================

/**
 * Create Joshua Tree geometry
 * Iconic desert tree with distinctive branching pattern
 */
export function createJoshuaTreeGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Main trunk
  const trunk = createCylinder(2.5, 0.2, 0.35, 8);
  transformGeometry(trunk, [0, 1.25, 0]);
  geometries.push(trunk);

  // Create branching structure (3 main branches)
  const branchAngles = [0, Math.PI * 0.7, Math.PI * 1.4];

  for (let i = 0; i < branchAngles.length; i++) {
    const angle = branchAngles[i];
    const branchHeight = 2.2 + i * 0.2;

    // Branch arm
    const branch = createCylinder(1.5, 0.1, 0.18, 6);
    const branchMatrix = new THREE.Matrix4();
    branchMatrix.compose(
      new THREE.Vector3(Math.sin(angle) * 0.3, branchHeight, Math.cos(angle) * 0.3),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, Math.PI * 0.25)),
      new THREE.Vector3(1, 1, 1)
    );
    branch.applyMatrix4(branchMatrix);
    geometries.push(branch);

    // Spiky foliage cluster at branch tip
    const foliage = createSphere(0.5, 6);
    const foliagePos = new THREE.Vector3(
      Math.sin(angle) * 0.9,
      branchHeight + 1.0,
      Math.cos(angle) * 0.9
    );
    transformGeometry(foliage, [foliagePos.x, foliagePos.y, foliagePos.z], [0, 0, 0], [1, 0.7, 1]);
    geometries.push(foliage);
  }

  // Top foliage cluster
  const topFoliage = createSphere(0.6, 6);
  transformGeometry(topFoliage, [0, 3.2, 0], [0, 0, 0], [1, 0.8, 1]);
  geometries.push(topFoliage);

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useJoshuaTreeGeometry(): THREE.BufferGeometry {
  return useMemo(() => createJoshuaTreeGeometry(), []);
}

// ============================================================================
// SAGEBRUSH
// ============================================================================

/**
 * Create Sagebrush geometry
 * Low, bushy desert shrub
 */
export function createSagebrushGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Multiple small clumps
  const clumpCount = 6;

  for (let i = 0; i < clumpCount; i++) {
    const angle = (i / clumpCount) * Math.PI * 2;
    const dist = 0.15 + (i % 2) * 0.1;
    const height = 0.2 + (i % 3) * 0.1;
    const size = 0.15 + (i % 2) * 0.08;

    const clump = createSphere(size, 4);
    transformGeometry(
      clump,
      [Math.sin(angle) * dist, height, Math.cos(angle) * dist],
      [0, 0, 0],
      [1, 0.8, 1]
    );
    geometries.push(clump);
  }

  // Center clump
  const center = createSphere(0.2, 4);
  transformGeometry(center, [0, 0.25, 0], [0, 0, 0], [1, 0.7, 1]);
  geometries.push(center);

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useSagebrushGeometry(): THREE.BufferGeometry {
  return useMemo(() => createSagebrushGeometry(), []);
}

// ============================================================================
// DEAD TREE
// ============================================================================

/**
 * Create Dead Tree geometry
 * Bleached, leafless desert tree skeleton
 */
export function createDeadTreeGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Gnarled trunk
  const trunk = createCylinder(2.5, 0.12, 0.35, 8);
  transformGeometry(trunk, [0, 1.25, 0], [0, 0, 0.08]);
  geometries.push(trunk);

  // Dead branches - sparse and twisted
  const branchConfigs = [
    { height: 1.8, length: 1.2, tilt: 0.5, rotation: 0 },
    { height: 2.2, length: 1.0, tilt: -0.4, rotation: Math.PI * 0.7 },
    { height: 2.5, length: 0.8, tilt: 0.6, rotation: Math.PI * 1.4 },
    { height: 1.4, length: 0.9, tilt: 0.3, rotation: Math.PI * 0.4 },
  ];

  for (const bc of branchConfigs) {
    const branch = createCylinder(bc.length, 0.03, 0.08, 5);
    const branchMatrix = new THREE.Matrix4();
    branchMatrix.compose(
      new THREE.Vector3(Math.sin(bc.rotation) * 0.15, bc.height, Math.cos(bc.rotation) * 0.15),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, bc.rotation, bc.tilt)),
      new THREE.Vector3(1, 1, 1)
    );
    branch.applyMatrix4(branchMatrix);
    geometries.push(branch);
  }

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useDeadTreeGeometry(): THREE.BufferGeometry {
  return useMemo(() => createDeadTreeGeometry(), []);
}

// ============================================================================
// TUMBLEWEED
// ============================================================================

/**
 * Create Tumbleweed geometry
 * Spherical dried plant with spiky appearance
 */
export function createTumbleweedGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(0.3, 1);

  // Add some spiky randomness by modifying vertices
  const positions = geometry.attributes.position;
  const posArray = positions.array as Float32Array;

  for (let i = 0; i < posArray.length; i += 3) {
    const variation = 0.85 + Math.random() * 0.3;
    posArray[i] *= variation;
    posArray[i + 1] *= variation;
    posArray[i + 2] *= variation;
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  // Position slightly above ground
  transformGeometry(geometry, [0, 0.3, 0]);

  return geometry;
}

export function useTumbleweedGeometry(): THREE.BufferGeometry {
  return useMemo(() => createTumbleweedGeometry(), []);
}

// ============================================================================
// ROCK FORMATIONS
// ============================================================================

/**
 * Create Rock geometry
 * Desert rock formation
 */
export function createRockGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.DodecahedronGeometry(0.5, 0);

  // Flatten and distort for natural look
  transformGeometry(geometry, [0, 0.35, 0], [0, 0, 0], [1.2, 0.7, 1]);

  // Add some random vertex displacement
  const positions = geometry.attributes.position;
  const posArray = positions.array as Float32Array;

  for (let i = 0; i < posArray.length; i += 3) {
    const variation = 0.9 + Math.random() * 0.2;
    posArray[i] *= variation;
    posArray[i + 1] *= 0.85 + Math.random() * 0.3;
    posArray[i + 2] *= variation;
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

export function useRockGeometry(): THREE.BufferGeometry {
  return useMemo(() => createRockGeometry(), []);
}

// ============================================================================
// BARREL CACTUS
// ============================================================================

/**
 * Create Barrel Cactus geometry
 * Short, round cactus with prominent ribs
 */
export function createBarrelCactusGeometry(): THREE.BufferGeometry {
  const geometry = createSphere(0.5, 12);

  // Squash into barrel shape
  transformGeometry(geometry, [0, 0.35, 0], [0, 0, 0], [1, 0.7, 1]);

  // Add ribs by modifying vertices
  const positions = geometry.attributes.position;
  const posArray = positions.array as Float32Array;
  const ribCount = 16;

  for (let i = 0; i < posArray.length; i += 3) {
    const x = posArray[i];
    const z = posArray[i + 2];
    const angle = Math.atan2(z, x);

    const ribOffset = Math.cos(angle * ribCount) * 0.04;
    const dist = Math.sqrt(x * x + z * z);

    if (dist > 0.01) {
      const newDist = dist + ribOffset;
      posArray[i] = (x / dist) * newDist;
      posArray[i + 2] = (z / dist) * newDist;
    }
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

export function useBarrelCactusGeometry(): THREE.BufferGeometry {
  return useMemo(() => createBarrelCactusGeometry(), []);
}

// ============================================================================
// PRICKLY PEAR
// ============================================================================

/**
 * Create Prickly Pear geometry
 * Pad-shaped cactus
 */
export function createPricklyPearGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Base pad
  const basePad = new THREE.BoxGeometry(0.5, 0.6, 0.12);
  transformGeometry(basePad, [0, 0.35, 0]);
  geometries.push(basePad);

  // Upper left pad
  const pad2 = new THREE.BoxGeometry(0.35, 0.45, 0.1);
  transformGeometry(pad2, [0.15, 0.7, 0], [0, 0, 0.2]);
  geometries.push(pad2);

  // Upper right pad
  const pad3 = new THREE.BoxGeometry(0.3, 0.4, 0.08);
  transformGeometry(pad3, [-0.12, 0.65, 0], [0, 0, -0.15]);
  geometries.push(pad3);

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function usePricklyPearGeometry(): THREE.BufferGeometry {
  return useMemo(() => createPricklyPearGeometry(), []);
}

// ============================================================================
// YUCCA
// ============================================================================

/**
 * Create Yucca geometry
 * Sword-leaved desert plant
 */
export function createYuccaGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Central stem
  const stem = createCylinder(0.5, 0.08, 0.12, 6);
  transformGeometry(stem, [0, 0.25, 0]);
  geometries.push(stem);

  // Sword-like leaves radiating outward
  const leafCount = 10;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const tilt = 0.4 + (i % 3) * 0.15;

    const leaf = new THREE.BoxGeometry(0.06, 0.8, 0.02);
    const leafMatrix = new THREE.Matrix4();
    leafMatrix.compose(
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, tilt)),
      new THREE.Vector3(1, 1, 1)
    );
    leaf.applyMatrix4(leafMatrix);
    geometries.push(leaf);
  }

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useYuccaGeometry(): THREE.BufferGeometry {
  return useMemo(() => createYuccaGeometry(), []);
}

// ============================================================================
// AGAVE
// ============================================================================

/**
 * Create Agave geometry
 * Rosette-shaped succulent
 */
export function createAgaveGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Thick leaves in rosette pattern
  const leafCount = 10;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const layer = Math.floor(i / 5);
    const tilt = 0.5 + layer * 0.2;
    const height = 0.6 - layer * 0.12;

    const leaf = createCylinder(height, 0.02, 0.08, 4);
    const leafMatrix = new THREE.Matrix4();
    leafMatrix.compose(
      new THREE.Vector3(0, 0.1 + layer * 0.1, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle + layer * 0.3, tilt)),
      new THREE.Vector3(1, 1, 1)
    );
    leaf.applyMatrix4(leafMatrix);
    geometries.push(leaf);
  }

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useAgaveGeometry(): THREE.BufferGeometry {
  return useMemo(() => createAgaveGeometry(), []);
}

// ============================================================================
// MESQUITE
// ============================================================================

/**
 * Create Mesquite geometry
 * Low, spreading desert tree
 */
export function createMesquiteGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Short, twisted trunk
  const trunk = createCylinder(1.0, 0.12, 0.22, 6);
  transformGeometry(trunk, [0, 0.5, 0], [0, 0, 0.12]);
  geometries.push(trunk);

  // Wide, spreading canopy
  const canopy = createSphere(1.2, 6);
  transformGeometry(canopy, [0, 1.4, 0], [0, 0, 0], [1.4, 0.5, 1.4]);
  geometries.push(canopy);

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useMesquiteGeometry(): THREE.BufferGeometry {
  return useMemo(() => createMesquiteGeometry(), []);
}

// ============================================================================
// COTTONWOOD
// ============================================================================

/**
 * Create Cottonwood geometry
 * Tall tree common near water
 */
export function createCottonwoodGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Tall trunk
  const trunk = createCylinder(3.5, 0.25, 0.45, 8);
  transformGeometry(trunk, [0, 1.75, 0]);
  geometries.push(trunk);

  // Bushy canopy parts
  const canopyParts = [
    { x: 0, y: 4.2, z: 0, scale: 1.6 },
    { x: 0.6, y: 3.8, z: 0.3, scale: 1.1 },
    { x: -0.5, y: 4.0, z: -0.3, scale: 1.0 },
    { x: 0.2, y: 4.5, z: -0.4, scale: 0.9 },
  ];

  for (const cp of canopyParts) {
    const part = createSphere(cp.scale * 0.6, 6);
    transformGeometry(part, [cp.x, cp.y, cp.z]);
    geometries.push(part);
  }

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useCottonwoodGeometry(): THREE.BufferGeometry {
  return useMemo(() => createCottonwoodGeometry(), []);
}

// ============================================================================
// WILLOW
// ============================================================================

/**
 * Create Desert Willow geometry
 * Tree with drooping branches
 */
export function createWillowGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Main trunk
  const trunk = createCylinder(2.0, 0.15, 0.25, 8);
  transformGeometry(trunk, [0, 1.0, 0]);
  geometries.push(trunk);

  // Canopy - drooping oval
  const canopy = createSphere(1.0, 8);
  transformGeometry(canopy, [0, 2.5, 0], [0, 0, 0], [1, 0.6, 1]);
  geometries.push(canopy);

  // Drooping branches
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;

    const droop = createCylinder(1.0, 0.015, 0.05, 4);
    const droopMatrix = new THREE.Matrix4();
    droopMatrix.compose(
      new THREE.Vector3(Math.sin(angle) * 0.8, 2.0, Math.cos(angle) * 0.8),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, Math.PI * 0.12)),
      new THREE.Vector3(1, 1, 1)
    );
    droop.applyMatrix4(droopMatrix);
    geometries.push(droop);
  }

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  return merged;
}

export function useWillowGeometry(): THREE.BufferGeometry {
  return useMemo(() => createWillowGeometry(), []);
}

// ============================================================================
// GEOMETRY FACTORY
// ============================================================================

import type { VegetationType } from './types';

const geometryCreators: Record<VegetationType, () => THREE.BufferGeometry> = {
  cactus: createCactusGeometry,
  joshuaTree: createJoshuaTreeGeometry,
  sagebrush: createSagebrushGeometry,
  deadTree: createDeadTreeGeometry,
  tumbleweed: createTumbleweedGeometry,
  rock: createRockGeometry,
  barrelCactus: createBarrelCactusGeometry,
  pricklyPear: createPricklyPearGeometry,
  yucca: createYuccaGeometry,
  agave: createAgaveGeometry,
  mesquite: createMesquiteGeometry,
  cottonwood: createCottonwoodGeometry,
  willow: createWillowGeometry,
};

/**
 * Create geometry for a specific vegetation type
 */
export function createVegetationGeometry(type: VegetationType): THREE.BufferGeometry {
  const creator = geometryCreators[type];
  if (!creator) {
    console.warn(`Unknown vegetation type: ${type}, using rock as fallback`);
    return createRockGeometry();
  }
  return creator();
}

/**
 * Hook to get all vegetation geometries (memoized)
 */
export function useVegetationGeometries(): Map<VegetationType, THREE.BufferGeometry> {
  return useMemo(() => {
    const geometries = new Map<VegetationType, THREE.BufferGeometry>();
    for (const type of Object.keys(geometryCreators) as VegetationType[]) {
      geometries.set(type, geometryCreators[type]());
    }
    return geometries;
  }, []);
}
