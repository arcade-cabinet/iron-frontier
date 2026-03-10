// BuildingBase — Shared construction helpers for procedural buildings (part 1).
// Core primitives: walls, floors, roofs.
// Every helper returns fully positioned geometry using CanvasTextureFactory materials.
// No scopedRNG('render', 42, rngTick()) — all randomness via alea.

import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';

import { createWoodTexture, createPBRWoodAged } from '../materials';
import { scopedRNG, rngTick } from '../../lib/prng';

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
  const mat = material ?? createPBRWoodAged(2);
  const group = new Group();

  if (style === 'flat') {
    const slab = new Mesh(new BoxGeometry(width + 0.4, 0.15, depth + 0.4), mat);
    slab.castShadow = true;
    group.add(slab);
  } else if (style === 'peaked') {
    // Two solid sloped panels meeting at a ridge — BoxGeometry for visible
    // thickness and correct normals (no DoubleSide needed)
    const ROOF_THICK = 0.12;
    const halfW = (width + 0.6) / 2;
    const slopeLen = Math.sqrt(halfW * halfW + 1.5 * 1.5);
    const angle = Math.atan2(1.5, halfW);

    const leftGeo = new BoxGeometry(slopeLen, ROOF_THICK, depth + 0.6);
    const left = new Mesh(leftGeo, mat);
    left.rotation.z = angle;
    left.position.set(-halfW / 2, 0.75, 0);
    left.castShadow = true;
    left.receiveShadow = true;

    const rightGeo = new BoxGeometry(slopeLen, ROOF_THICK, depth + 0.6);
    const right = new Mesh(rightGeo, mat);
    right.rotation.z = -angle;
    right.position.set(halfW / 2, 0.75, 0);
    right.castShadow = true;
    right.receiveShadow = true;

    group.add(left, right);

    // Ridge cap
    const ridge = new Mesh(new BoxGeometry(0.14, 0.1, depth + 0.8), mat);
    ridge.position.y = 1.5;
    group.add(ridge);
  } else {
    // Shed roof — single solid slope
    const ROOF_THICK = 0.12;
    const slopeLen = Math.sqrt(width * width + 1.2 * 1.2);
    const angle = Math.atan2(1.2, width);
    const slab = new Mesh(new BoxGeometry(slopeLen, ROOF_THICK, depth + 0.4), mat);
    slab.rotation.z = angle;
    slab.position.y = 0.6;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
  }

  return group;
}
