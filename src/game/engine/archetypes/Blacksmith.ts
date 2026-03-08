// Blacksmith — Open-front forge area, anvil, chimney stack,
// weapon/tool display rack, horseshoes hanging.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from 'three';

import {
  createMetalTexture,
  createRustTexture,
  createStoneTexture,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createSign, createWindow } from './BuildingBase.composite';
import { createAnvil, createChimney, createForge, createHorseshoe } from './Blacksmith.interior';
import type { BuildingArchetype, BuildingSlots } from './types';

const WIDTH = 10;
const DEPTH = 8;
const WALL_HEIGHT = 4.5;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallMat = createWoodTexture(palette[0] ?? '#6B5B4A', palette[1] ?? '#4B3E2A');

  // Back wall
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  // Side walls
  for (const side of [-1, 1]) {
    const sideWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
    sideWall.position.set(side * WIDTH / 2, WALL_HEIGHT / 2, 0);
    group.add(sideWall);
  }

  // Front wall — OPEN front (partial walls on sides)
  for (const side of [-1, 1]) {
    const frontW = WIDTH * 0.3;
    const front = createWall(frontW, WALL_HEIGHT, WALL_THICK, wallMat);
    front.position.set(side * (WIDTH / 2 - frontW / 2), WALL_HEIGHT / 2, DEPTH / 2);
    group.add(front);
  }

  // Header beam across open front
  const header = createWall(WIDTH * 0.4, 0.2, WALL_THICK, wallMat);
  header.position.set(0, WALL_HEIGHT - 0.1, DEPTH / 2);
  group.add(header);

  // Support posts for open front
  const postMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  for (const x of [-WIDTH * 0.2, WIDTH * 0.2]) {
    const post = new Mesh(new CylinderGeometry(0.08, 0.1, WALL_HEIGHT, 8), postMat);
    post.position.set(x, WALL_HEIGHT / 2, DEPTH / 2);
    post.castShadow = true;
    group.add(post);
  }

  // Side windows
  for (const side of [-1, 1]) {
    const win = createWindow(0.8, 0.7, 2);
    win.rotation.y = Math.PI / 2;
    win.position.set(side * (WIDTH / 2 + 0.05), 2.2, -DEPTH / 4);
    group.add(win);
  }

  // Sign
  const sign = createSign(slots.signText ?? 'BLACKSMITH', 3.0, 0.6);
  sign.position.set(0, WALL_HEIGHT + 0.4, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof (shed style)
  const roof = createRoof(WIDTH, DEPTH, 'shed');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Chimney on back wall
  const chimney = createChimney(WALL_HEIGHT + 2.5);
  chimney.position.set(-WIDTH / 4, 0, -DEPTH / 2 - 0.2);
  group.add(chimney);

  // Horseshoes hanging on front wall section
  for (let i = 0; i < 4; i++) {
    const shoe = createHorseshoe();
    shoe.position.set(-WIDTH / 2 + 0.8 + i * 0.2, 2.5, DEPTH / 2 + 0.05);
    group.add(shoe);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, createStoneTexture('#5A5040', '#3A3530'));
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Forge
  const forge = createForge();
  forge.position.set(-WIDTH / 4, 0, -DEPTH / 2 + 1.2);
  group.add(forge);

  // Anvil
  const anvil = createAnvil();
  anvil.position.set(0.5, 0, 1.0);
  group.add(anvil);

  // Tool rack on right wall
  const rackMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const rack = new Mesh(new BoxGeometry(0.06, 2.0, 2.0), rackMat);
  rack.position.set(WIDTH / 2 - 0.15, 1.5, 0);
  group.add(rack);

  // Tools on rack
  const metalMat = createMetalTexture('#4A4A4A');
  const handleMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  for (let i = 0; i < 4; i++) {
    const handle = new Mesh(new CylinderGeometry(0.015, 0.015, 0.5, 6), handleMat);
    handle.rotation.z = Math.PI / 4;
    handle.position.set(WIDTH / 2 - 0.2, 1.0 + i * 0.4, -0.5 + i * 0.35);
    group.add(handle);
    const head = new Mesh(new BoxGeometry(0.08, 0.04, 0.04), metalMat);
    head.position.set(WIDTH / 2 - 0.35, 1.18 + i * 0.4, -0.5 + i * 0.35);
    group.add(head);
  }

  // Water quench barrel
  const barrel = new Mesh(
    new CylinderGeometry(0.3, 0.28, 0.7, 10),
    createWoodTexture('#6B4226', '#4A2E1A'),
  );
  barrel.position.set(WIDTH / 4, 0.35, -DEPTH / 4);
  barrel.castShadow = true;
  group.add(barrel);

  return group;
}

// ---------------------------------------------------------------------------
// Blacksmith archetype
// ---------------------------------------------------------------------------

export const BlacksmithArchetype: BuildingArchetype = {
  type: 'blacksmith',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'blacksmith';

    const exterior = buildExterior(slots);
    exterior.name = 'exterior';
    building.add(exterior);

    const interior = buildInterior();
    interior.name = 'interior';
    building.add(interior);

    building.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.matrixAutoUpdate = false;
        obj.updateMatrix();
      }
    });
    building.updateMatrixWorld(true);

    return building;
  },
};
