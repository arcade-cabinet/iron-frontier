// Saloon — The flagship building archetype.
// Constructs a full Old West saloon from Three.js primitives + canvas textures.
// ~12m wide, ~8m deep, ~6m tall with peaked roof, swinging doors, full interior.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from 'three';

import {
  createMetalTexture,
  createWoodTexture,
  createPBRWoodSiding,
} from '../materials';

import { createFloor, createRoof, createWall, DEFAULT_PALETTE } from './BuildingBase';
import { createDoor, createPorch, createSign, createWindow } from './BuildingBase.composite';
import {
  createBalcony,
  createBarCounter,
  createBottleShelf,
  createPiano,
  createStaircase,
  createTableWithChairs,
} from './Saloon.interior';
import type { BuildingArchetype, BuildingSlots } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 12;
const DEPTH = 8;
const WALL_HEIGHT = 5;
const WALL_THICK = 0.2;
const SECOND_FLOOR_HEIGHT = 3.2;

// ---------------------------------------------------------------------------
// Exterior construction
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const wallMat = createPBRWoodSiding(2);

  // ----- Four walls -----

  // Back wall (solid)
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  // Front wall (with door opening and windows)
  // Left section
  const frontLeftW = WIDTH / 2 - 1.0;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  // Right section
  const frontRightW = WIDTH / 2 - 1.0;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  // Above-door lintel
  const lintel = createWall(2.0, WALL_HEIGHT - 2.4, WALL_THICK, wallMat);
  lintel.position.set(0, 2.4 + (WALL_HEIGHT - 2.4) / 2, DEPTH / 2);
  group.add(lintel);

  // Left wall
  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  // Right wall
  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // ----- Second floor false front (above main roof line, peaked) -----
  const falseFrontH = 1.8;
  const falseFront = createWall(WIDTH + 0.2, falseFrontH, WALL_THICK * 0.8, wallMat);
  falseFront.position.set(0, WALL_HEIGHT + falseFrontH / 2, DEPTH / 2 + 0.05);
  group.add(falseFront);

  // ----- Door -----
  const door = createDoor(1.6, 2.2, 'swinging');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // ----- Windows -----
  // Front windows (flanking the door)
  const leftWindow = createWindow(1.2, 1.0, 2);
  leftWindow.position.set(-3.2, 2.2, DEPTH / 2 + 0.05);
  group.add(leftWindow);

  const rightWindow = createWindow(1.2, 1.0, 2);
  rightWindow.position.set(3.2, 2.2, DEPTH / 2 + 0.05);
  group.add(rightWindow);

  // Side windows (two per side)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const z = -DEPTH / 4 + i * (DEPTH / 2);
      const win = createWindow(0.9, 0.8, 2);
      win.rotation.y = Math.PI / 2;
      win.position.set(side * (WIDTH / 2 + 0.05), 2.2, z);
      group.add(win);
    }
  }

  // Second floor windows (on false front)
  for (const xOff of [-2.5, 0, 2.5]) {
    const upperWin = createWindow(0.8, 0.7, 2);
    upperWin.position.set(xOff, WALL_HEIGHT + 0.9, DEPTH / 2 + 0.08);
    group.add(upperWin);
  }

  // ----- Sign -----
  const signText = slots.signText ?? 'SALOON';
  const sign = createSign(signText, 3.5, 0.7);
  sign.position.set(0, WALL_HEIGHT + falseFrontH + 0.05, DEPTH / 2 + 0.15);
  group.add(sign);

  // ----- Roof -----
  const roof = createRoof(WIDTH, DEPTH, 'peaked');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  return group;
}

// ---------------------------------------------------------------------------
// Exterior accessories
// ---------------------------------------------------------------------------

function buildAccessories(): Group {
  const group = new Group();

  // ----- Porch -----
  const porch = createPorch(WIDTH + 0.6, 2.5);
  porch.position.set(0, 0, DEPTH / 2 + 1.25);
  group.add(porch);

  // ----- Hitching post -----
  const hitchMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const metalMat = createMetalTexture('#4A4A4A');

  // Two vertical posts
  const leftPost = new Mesh(new CylinderGeometry(0.05, 0.06, 1.0, 8), hitchMat);
  leftPost.position.set(-2.0, 0.5, DEPTH / 2 + 3.5);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new Mesh(new CylinderGeometry(0.05, 0.06, 1.0, 8), hitchMat);
  rightPost.position.set(2.0, 0.5, DEPTH / 2 + 3.5);
  rightPost.castShadow = true;
  group.add(rightPost);

  // Horizontal bar
  const bar = new Mesh(new CylinderGeometry(0.03, 0.03, 4.0, 8), hitchMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.9, DEPTH / 2 + 3.5);
  group.add(bar);

  // Metal rings on posts
  for (const x of [-2.0, 2.0]) {
    const ring = new Mesh(new CylinderGeometry(0.06, 0.06, 0.02, 12), metalMat);
    ring.position.set(x, 0.85, DEPTH / 2 + 3.55);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  // ----- Lanterns on porch posts -----
  const lanternMat = createMetalTexture('#2A2A2A');
  for (const x of [-WIDTH / 2 + 0.3, WIDTH / 2 - 0.3]) {
    const bracket = new Mesh(new BoxGeometry(0.3, 0.04, 0.04), lanternMat);
    bracket.position.set(x, 3.0, DEPTH / 2 + 2.5);
    group.add(bracket);

    const lanternBody = new Mesh(new BoxGeometry(0.15, 0.2, 0.15), lanternMat);
    lanternBody.position.set(x + 0.15, 2.85, DEPTH / 2 + 2.5);
    group.add(lanternBody);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Interior construction
// ---------------------------------------------------------------------------

function buildInterior(slots: BuildingSlots): Group {
  const group = new Group();

  // ----- Floor -----
  const floorMat = createWoodTexture('#7B5B3A', '#5A3F28');
  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // ----- Bar counter (back wall) -----
  const barW = WIDTH * 0.6;
  const bar = createBarCounter(barW, DEPTH);
  group.add(bar);

  // ----- Bottle shelf -----
  const shelf = createBottleShelf(barW, DEPTH);
  group.add(shelf);

  // ----- Piano (front-left corner) -----
  const piano = createPiano();
  piano.position.set(-WIDTH / 2 + 1.5, 0, DEPTH / 2 - 1.5);
  piano.rotation.y = Math.PI * 0.75;
  group.add(piano);

  // ----- Tables -----
  const tablePositions: [number, number][] = [
    [-2.0, -0.5],
    [2.0, -0.5],
    [-2.0, 1.8],
    [2.0, 1.8],
    [0, 0.8],
  ];
  for (const [tx, tz] of tablePositions) {
    const table = createTableWithChairs();
    table.position.set(tx, 0, tz);
    group.add(table);
  }

  // ----- Staircase (back-right corner going up) -----
  const stairX = WIDTH / 2 - 1.2;
  const stairs = createStaircase(stairX, SECOND_FLOOR_HEIGHT, 0.9);
  stairs.position.set(0, 0, -DEPTH / 2 + 0.5);
  group.add(stairs);

  // ----- Second floor balcony -----
  const balconyWidth = WIDTH - 2.0;
  const balconyDepth = 2.0;
  const balcony = createBalcony(balconyWidth, balconyDepth, SECOND_FLOOR_HEIGHT);
  balcony.position.set(0, 0, -DEPTH / 2 + balconyDepth / 2 + 0.3);
  group.add(balcony);

  return group;
}

// ---------------------------------------------------------------------------
// Saloon archetype
// ---------------------------------------------------------------------------

export const SaloonArchetype: BuildingArchetype = {
  type: 'saloon',

  construct(slots: BuildingSlots): Group {
    const saloon = new Group();
    saloon.name = 'saloon';

    // Build sections
    const exterior = buildExterior(slots);
    exterior.name = 'exterior';
    saloon.add(exterior);

    const accessories = buildAccessories();
    accessories.name = 'accessories';
    saloon.add(accessories);

    const interior = buildInterior(slots);
    interior.name = 'interior';
    saloon.add(interior);

    // Freeze matrices for static geometry performance
    saloon.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.matrixAutoUpdate = false;
        obj.updateMatrix();
      }
    });
    // Update the world matrices once so transforms propagate
    saloon.updateMatrixWorld(true);

    return saloon;
  },
};
