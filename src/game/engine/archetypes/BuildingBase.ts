// BuildingBase — Shared construction helpers for procedural buildings (part 1).
// Core primitives: walls, floors, roofs.
// Every helper returns fully positioned geometry using CanvasTextureFactory materials.
// No Math.random() — all randomness via alea.

import {
  BoxGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';

import { createWoodTexture } from '../materials';

// ---------------------------------------------------------------------------
// Color palette defaults
// ---------------------------------------------------------------------------

/** Default Old West palette: wall, trim, accent. */
export const DEFAULT_PALETTE = {
  wallBase: '#8B6B4A',
  wallGrain: '#6B4E32',
  trimBase: '#5C3D2E',
  trimGrain: '#3E2A1E',
  floorBase: '#7B5B3A',
  floorGrain: '#5A3F28',
};

// ---------------------------------------------------------------------------
// Walls
// ---------------------------------------------------------------------------

export function createWall(
  width: number,
  height: number,
  depth: number,
  material?: MeshStandardMaterial,
): Mesh {
  const mat = material ?? createWoodTexture(DEFAULT_PALETTE.wallBase, DEFAULT_PALETTE.wallGrain);
  const geo = new BoxGeometry(width, height, depth);
  const mesh = new Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------------------------------------------------------------------------
// Floors
// ---------------------------------------------------------------------------

export function createFloor(
  width: number,
  depth: number,
  material?: MeshStandardMaterial,
): Mesh {
  const mat = material ?? createWoodTexture(DEFAULT_PALETTE.floorBase, DEFAULT_PALETTE.floorGrain);
  const geo = new PlaneGeometry(width, depth);
  const mesh = new Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------------------------------------------------------------------------
// Roofs
// ---------------------------------------------------------------------------

export function createRoof(
  width: number,
  depth: number,
  style: 'flat' | 'peaked' | 'shed',
  material?: MeshStandardMaterial,
): Group {
  const mat = material ?? createWoodTexture('#5A3A2A', '#3E2418');
  const group = new Group();

  if (style === 'flat') {
    const slab = new Mesh(new BoxGeometry(width + 0.4, 0.15, depth + 0.4), mat);
    slab.castShadow = true;
    group.add(slab);
  } else if (style === 'peaked') {
    // Two angled planes meeting at a ridge
    const halfW = (width + 0.6) / 2;
    const slopeLen = Math.sqrt(halfW * halfW + 1.5 * 1.5);
    const angle = Math.atan2(1.5, halfW);

    const leftGeo = new PlaneGeometry(slopeLen, depth + 0.6);
    const left = new Mesh(leftGeo, mat);
    left.rotation.z = angle;
    left.position.set(-halfW / 2, 0.75, 0);
    left.castShadow = true;
    left.material = mat.clone();
    (left.material as MeshStandardMaterial).side = DoubleSide;

    const rightGeo = new PlaneGeometry(slopeLen, depth + 0.6);
    const right = new Mesh(rightGeo, mat);
    right.rotation.z = -angle;
    right.position.set(halfW / 2, 0.75, 0);
    right.castShadow = true;
    right.material = mat.clone();
    (right.material as MeshStandardMaterial).side = DoubleSide;

    group.add(left, right);

    // Ridge cap
    const ridge = new Mesh(new BoxGeometry(0.12, 0.08, depth + 0.8), mat);
    ridge.position.y = 1.5;
    group.add(ridge);
  } else {
    // Shed roof — single slope
    const slopeLen = Math.sqrt(width * width + 1.2 * 1.2);
    const angle = Math.atan2(1.2, width);
    const slab = new Mesh(new PlaneGeometry(slopeLen, depth + 0.4), mat);
    slab.rotation.z = angle;
    slab.position.y = 0.6;
    slab.castShadow = true;
    slab.material = mat.clone();
    (slab.material as MeshStandardMaterial).side = DoubleSide;
    group.add(slab);
  }

  return group;
}
