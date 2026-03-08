// Undertaker — Dark wood, coffin display, embalming table,
// somber "UNDERTAKER" sign.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';

import {
  createMetalTexture,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createDoor, createSign, createWindow } from './BuildingBase.composite';
import type { BuildingArchetype, BuildingSlots } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 8;
const DEPTH = 7;
const WALL_HEIGHT = 4;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Coffin (hexagonal cross-section, long box)
// ---------------------------------------------------------------------------

function createCoffin(open: boolean): Group {
  const group = new Group();
  const mat = createWoodTexture('#2E1E14', '#1A1008');

  // Body — tapered hexagonal shape approximated with boxes
  // Wide center section
  const center = new Mesh(new BoxGeometry(0.55, 0.25, 1.2), mat);
  center.position.y = 0.125;
  center.castShadow = true;
  group.add(center);

  // Tapered head section
  const head = new Mesh(new BoxGeometry(0.35, 0.25, 0.35), mat);
  head.position.set(0, 0.125, -0.75);
  group.add(head);

  // Taper transition head
  const headTaper = new Mesh(new BoxGeometry(0.45, 0.25, 0.15), mat);
  headTaper.position.set(0, 0.125, -0.55);
  group.add(headTaper);

  // Tapered foot section
  const foot = new Mesh(new BoxGeometry(0.3, 0.25, 0.3), mat);
  foot.position.set(0, 0.125, 0.75);
  group.add(foot);

  // Taper transition foot
  const footTaper = new Mesh(new BoxGeometry(0.42, 0.25, 0.15), mat);
  footTaper.position.set(0, 0.125, 0.55);
  group.add(footTaper);

  // Metal handles
  const handleMat = createMetalTexture('#4A4A4A');
  for (const side of [-1, 1]) {
    for (const z of [-0.3, 0.3]) {
      const handle = new Mesh(new CylinderGeometry(0.015, 0.015, 0.1, 6), handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(side * 0.3, 0.12, z);
      group.add(handle);
    }
  }

  if (open) {
    // Lid (slightly raised and rotated)
    const lid = new Mesh(new BoxGeometry(0.55, 0.04, 1.0), mat);
    lid.position.set(-0.3, 0.35, -0.1);
    lid.rotation.z = -0.5;
    group.add(lid);

    // Interior lining (lighter fabric)
    const liningMat = new MeshStandardMaterial({ color: 0xd4c8a8, roughness: 0.7 });
    const lining = new Mesh(new BoxGeometry(0.48, 0.02, 1.1), liningMat);
    lining.position.set(0, 0.25, 0);
    group.add(lining);
  } else {
    // Closed lid
    const lid = new Mesh(new BoxGeometry(0.57, 0.04, 1.9), mat);
    lid.position.y = 0.27;
    group.add(lid);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallBase = palette[0] ?? '#3E2A1E';
  const wallGrain = palette[1] ?? '#261810';
  const wallMat = createWoodTexture(wallBase, wallGrain);

  // Dark wood walls
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  const frontLeftW = WIDTH / 2 - 0.6;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 0.6;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  const lintel = createWall(1.2, WALL_HEIGHT - 2.1, WALL_THICK, wallMat);
  lintel.position.set(0, 2.1 + (WALL_HEIGHT - 2.1) / 2, DEPTH / 2);
  group.add(lintel);

  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Door
  const door = createDoor(1.0, 2.0, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // Windows (smaller, somber)
  for (const xOff of [-2.2, 2.2]) {
    const win = createWindow(0.7, 0.6, 2);
    win.position.set(xOff, 2.2, DEPTH / 2 + 0.05);
    group.add(win);
  }

  // Sign (somber style)
  const signText = slots.signText ?? 'UNDERTAKER';
  const sign = createSign(signText, 2.8, 0.5);
  sign.position.set(0, WALL_HEIGHT + 0.3, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'peaked');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Coffin on display outside (leaning against wall)
  const displayCoffin = createCoffin(false);
  displayCoffin.rotation.x = 0.3;
  displayCoffin.position.set(WIDTH / 2 + 0.4, 0.5, 0);
  group.add(displayCoffin);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();
  const floorMat = createWoodTexture('#3E2A1E', '#261810');

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Display coffins (front room)
  const coffin1 = createCoffin(true);
  coffin1.position.set(-1.5, 0.5, 1.5);
  // On a display stand
  const stand1Mat = createWoodTexture('#4A3422', '#2E1E14');
  const stand1 = new Mesh(new BoxGeometry(0.6, 0.5, 2.0), stand1Mat);
  stand1.position.set(-1.5, 0.25, 1.5);
  group.add(stand1);
  group.add(coffin1);

  const coffin2 = createCoffin(false);
  coffin2.position.set(1.5, 0.5, 1.5);
  const stand2 = new Mesh(new BoxGeometry(0.6, 0.5, 2.0), stand1Mat);
  stand2.position.set(1.5, 0.25, 1.5);
  group.add(stand2);
  group.add(coffin2);

  // Embalming table (back room)
  const tableMat = createMetalTexture('#5A5A5A');
  const table = new Mesh(new BoxGeometry(0.7, 0.05, 1.8), tableMat);
  table.position.set(0, 0.85, -DEPTH / 2 + 1.2);
  group.add(table);

  // Table legs
  for (const [lx, lz] of [[-0.3, -0.7], [0.3, -0.7], [-0.3, 0.7], [0.3, 0.7]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.025, 0.03, 0.83, 6), tableMat);
    leg.position.set(lx, 0.43, -DEPTH / 2 + 1.2 + lz);
    group.add(leg);
  }

  // Supply cabinet
  const cabinetMat = createWoodTexture('#3E2A1E', '#261810');
  const cabinet = new Mesh(new BoxGeometry(1.0, 2.0, 0.4), cabinetMat);
  cabinet.position.set(-WIDTH / 2 + 0.4, 1.0, -DEPTH / 2 + 0.4);
  group.add(cabinet);

  // Shelf in cabinet
  for (let i = 0; i < 3; i++) {
    const shelf = new Mesh(new BoxGeometry(0.9, 0.03, 0.35), cabinetMat);
    shelf.position.set(-WIDTH / 2 + 0.4, 0.4 + i * 0.6, -DEPTH / 2 + 0.4);
    group.add(shelf);
  }

  // Work desk
  const deskMat = createWoodTexture('#4A3422', '#2E1E14');
  const desk = new Mesh(new BoxGeometry(1.2, 0.75, 0.5), deskMat);
  desk.position.set(WIDTH / 2 - 0.8, 0.375, -DEPTH / 2 + 0.5);
  desk.castShadow = true;
  group.add(desk);

  return group;
}

// ---------------------------------------------------------------------------
// Undertaker archetype
// ---------------------------------------------------------------------------

export const UndertakerArchetype: BuildingArchetype = {
  type: 'undertaker',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'undertaker';

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
