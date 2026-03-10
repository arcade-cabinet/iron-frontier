// GeneralStore — Display shelves visible through large front windows,
// barrel/crate displays outside, awning over entrance.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from 'three';

import {
  createPBRWoodPlanks,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall, DEFAULT_PALETTE } from './BuildingBase';
import { createDoor, createPorch, createSign, createWindow } from './BuildingBase.composite';
import type { BuildingArchetype, BuildingSlots } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 10;
const DEPTH = 8;
const WALL_HEIGHT = 4.5;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Exterior props
// ---------------------------------------------------------------------------

function createBarrel(): Group {
  const group = new Group();
  const mat = createWoodTexture('#6B4226', '#4A2E1A');

  const body = new Mesh(new CylinderGeometry(0.3, 0.28, 0.7, 10), mat);
  body.position.y = 0.35;
  body.castShadow = true;
  group.add(body);

  // Metal bands
  const bandMat = createWoodTexture('#3A3A3A', '#2A2A2A');
  for (const y of [0.1, 0.35, 0.6]) {
    const band = new Mesh(new CylinderGeometry(0.31, 0.31, 0.03, 10), bandMat);
    band.position.y = y;
    group.add(band);
  }

  return group;
}

function createCrate(): Group {
  const group = new Group();
  const mat = createWoodTexture('#8B7355', '#6B5740');

  const box = new Mesh(new BoxGeometry(0.5, 0.4, 0.5), mat);
  box.position.y = 0.2;
  box.castShadow = true;
  group.add(box);

  // Slat lines
  const slatMat = createWoodTexture('#7B6345', '#5B4730');
  for (let i = 0; i < 3; i++) {
    const slat = new Mesh(new BoxGeometry(0.52, 0.02, 0.04), slatMat);
    slat.position.set(0, 0.05 + i * 0.15, 0.26);
    group.add(slat);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Display shelf
// ---------------------------------------------------------------------------

function createDisplayShelf(shelfW: number, shelfH: number, shelves: number): Group {
  const group = new Group();
  const mat = createWoodTexture('#5C3D2E', '#3E2A1E');

  // Back board
  const back = new Mesh(new BoxGeometry(shelfW, shelfH, 0.04), mat);
  back.position.y = shelfH / 2;
  group.add(back);

  // Shelves
  const shelfSpacing = shelfH / (shelves + 1);
  for (let i = 1; i <= shelves; i++) {
    const shelf = new Mesh(new BoxGeometry(shelfW, 0.03, 0.25), mat);
    shelf.position.set(0, i * shelfSpacing, 0.12);
    group.add(shelf);

    // Items on shelves (small boxes representing goods)
    const itemMat = createWoodTexture('#A08060', '#806040');
    const itemCount = Math.floor(shelfW / 0.25);
    for (let j = 0; j < itemCount; j++) {
      const x = -shelfW / 2 + 0.15 + j * 0.25;
      const itemH = 0.1 + (j % 3) * 0.04;
      const item = new Mesh(new BoxGeometry(0.15, itemH, 0.12), itemMat);
      item.position.set(x, i * shelfSpacing + 0.015 + itemH / 2, 0.12);
      group.add(item);
    }
  }

  // Side panels
  for (const side of [-1, 1]) {
    const panel = new Mesh(new BoxGeometry(0.04, shelfH, 0.28), mat);
    panel.position.set(side * shelfW / 2, shelfH / 2, 0.12);
    group.add(panel);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const wallMat = createPBRWoodPlanks(2);

  // Walls
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  // Front wall with large window openings
  const frontLeftW = WIDTH / 2 - 1.6;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 1.6;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  const lintel = createWall(3.2, WALL_HEIGHT - 2.2, WALL_THICK, wallMat);
  lintel.position.set(0, 2.2 + (WALL_HEIGHT - 2.2) / 2, DEPTH / 2);
  group.add(lintel);

  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Door (double)
  const door = createDoor(1.4, 2.1, 'double');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // Large front windows
  const leftWin = createWindow(1.6, 1.2, 3);
  leftWin.position.set(-3.0, 1.8, DEPTH / 2 + 0.05);
  group.add(leftWin);

  const rightWin = createWindow(1.6, 1.2, 3);
  rightWin.position.set(3.0, 1.8, DEPTH / 2 + 0.05);
  group.add(rightWin);

  // Sign
  const signText = slots.signText ?? 'GENERAL STORE';
  const sign = createSign(signText, 3.8, 0.7);
  sign.position.set(0, WALL_HEIGHT + 0.4, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'shed');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Porch with awning
  const porch = createPorch(WIDTH + 0.6, 2.5);
  porch.position.set(0, 0, DEPTH / 2 + 1.25);
  group.add(porch);

  // Outside barrel/crate display
  const barrel1 = createBarrel();
  barrel1.position.set(-WIDTH / 2 - 0.5, 0, DEPTH / 2 + 2.5);
  group.add(barrel1);

  const barrel2 = createBarrel();
  barrel2.position.set(-WIDTH / 2 - 0.5, 0, DEPTH / 2 + 1.5);
  group.add(barrel2);

  const crate1 = createCrate();
  crate1.position.set(WIDTH / 2 + 0.5, 0, DEPTH / 2 + 2.0);
  group.add(crate1);

  const crate2 = createCrate();
  crate2.position.set(WIDTH / 2 + 0.5, 0.4, DEPTH / 2 + 2.0);
  group.add(crate2);

  const crate3 = createCrate();
  crate3.position.set(WIDTH / 2 + 0.5, 0, DEPTH / 2 + 1.2);
  group.add(crate3);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();
  const floorMat = createWoodTexture('#7B5B3A', '#5A3F28');

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Counter
  const counterMat = createWoodTexture('#6B4226', '#4A2E1A');
  const counter = new Mesh(new BoxGeometry(WIDTH * 0.6, 1.0, 0.5), counterMat);
  counter.position.set(0, 0.5, -DEPTH / 2 + 1.0);
  counter.castShadow = true;
  group.add(counter);

  // Display shelves along walls
  const leftShelf = createDisplayShelf(2.0, 2.8, 4);
  leftShelf.position.set(-WIDTH / 2 + 0.2, 0, 0);
  leftShelf.rotation.y = Math.PI / 2;
  group.add(leftShelf);

  const rightShelf = createDisplayShelf(2.0, 2.8, 4);
  rightShelf.position.set(WIDTH / 2 - 0.2, 0, 0);
  rightShelf.rotation.y = -Math.PI / 2;
  group.add(rightShelf);

  // Back wall shelves (behind counter)
  const backShelf = createDisplayShelf(WIDTH * 0.6, 2.5, 4);
  backShelf.position.set(0, 0, -DEPTH / 2 + 0.15);
  group.add(backShelf);

  // Center aisle shelf
  const centerShelf = createDisplayShelf(3.0, 1.5, 2);
  centerShelf.position.set(0, 0, 1.0);
  group.add(centerShelf);

  return group;
}

// ---------------------------------------------------------------------------
// GeneralStore archetype
// ---------------------------------------------------------------------------

export const GeneralStoreArchetype: BuildingArchetype = {
  type: 'general_store',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'general_store';

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
