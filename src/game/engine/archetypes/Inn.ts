// Inn — 2-story building with multiple room doors on upper floor.
// Reception desk, beds visible through windows, "ROOMS" sign, warm interior lighting.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
} from 'three';

import {
  createFabricTexture,
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
const GROUND_HEIGHT = 3.5;
const UPPER_HEIGHT = 3.0;
const WALL_HEIGHT = GROUND_HEIGHT + UPPER_HEIGHT;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallBase = palette[0] ?? '#9B7B5A';
  const wallGrain = palette[1] ?? '#7B5E42';
  const wallMat = createWoodTexture(wallBase, wallGrain);

  // Back wall
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  // Front wall — door opening on ground floor
  const frontLeftW = WIDTH / 2 - 0.8;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 0.8;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  const lintel = createWall(1.6, WALL_HEIGHT - 2.2, WALL_THICK, wallMat);
  lintel.position.set(0, 2.2 + (WALL_HEIGHT - 2.2) / 2, DEPTH / 2);
  group.add(lintel);

  // Side walls
  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Front door
  const door = createDoor(1.2, 2.1, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // Ground floor windows
  for (const xOff of [-3.0, 3.0]) {
    const win = createWindow(1.0, 0.9, 2);
    win.position.set(xOff, 1.8, DEPTH / 2 + 0.05);
    group.add(win);
  }

  // Upper floor windows (rooms visible through these)
  for (const xOff of [-3.2, -1.2, 1.2, 3.2]) {
    const win = createWindow(0.7, 0.8, 2);
    win.position.set(xOff, GROUND_HEIGHT + 1.5, DEPTH / 2 + 0.05);
    group.add(win);
  }

  // Side windows
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const z = -DEPTH / 4 + i * (DEPTH / 2);
      const win = createWindow(0.8, 0.7, 2);
      win.rotation.y = Math.PI / 2;
      win.position.set(side * (WIDTH / 2 + 0.05), GROUND_HEIGHT + 1.5, z);
      group.add(win);
    }
  }

  // Sign
  const signText = slots.signText ?? 'ROOMS';
  const sign = createSign(signText, 2.5, 0.6);
  sign.position.set(0, WALL_HEIGHT + 0.4, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'peaked');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Porch
  const porch = createPorch(WIDTH + 0.4, 2.0);
  porch.position.set(0, 0, DEPTH / 2 + 1.0);
  group.add(porch);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(slots: BuildingSlots): Group {
  const group = new Group();
  const floorMat = createWoodTexture('#7B5B3A', '#5A3F28');

  // Ground floor
  const gFloor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  gFloor.position.set(0, 0.01, 0);
  group.add(gFloor);

  // Reception desk
  const deskMat = createWoodTexture('#6B4226', '#4A2E1A');
  const desk = new Mesh(new BoxGeometry(2.5, 1.0, 0.6), deskMat);
  desk.position.set(-1.5, 0.5, 1.5);
  desk.castShadow = true;
  group.add(desk);

  // Desk top
  const deskTop = new Mesh(new BoxGeometry(2.6, 0.05, 0.7), deskMat);
  deskTop.position.set(-1.5, 1.025, 1.5);
  group.add(deskTop);

  // Bell on desk
  const bellMat = new MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
  const bell = new Mesh(new CylinderGeometry(0.04, 0.06, 0.06, 8), bellMat);
  bell.position.set(-1.0, 1.08, 1.5);
  group.add(bell);

  // Key rack behind desk (on wall)
  const rackMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const rack = new Mesh(new BoxGeometry(1.2, 0.6, 0.05), rackMat);
  rack.position.set(-1.5, 1.8, -DEPTH / 2 + 0.15);
  group.add(rack);

  // Key hooks
  const hookMat = new MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.4, metalness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const hook = new Mesh(new CylinderGeometry(0.01, 0.01, 0.08, 6), hookMat);
    hook.position.set(-2.0 + i * 0.25, 1.8, -DEPTH / 2 + 0.2);
    hook.rotation.x = Math.PI / 4;
    group.add(hook);
  }

  // Second floor
  const upperFloor = new Mesh(
    new BoxGeometry(WIDTH - WALL_THICK * 2, 0.1, DEPTH - WALL_THICK * 2),
    floorMat,
  );
  upperFloor.position.set(0, GROUND_HEIGHT, 0);
  upperFloor.receiveShadow = true;
  group.add(upperFloor);

  // Hallway divider walls (upper floor) — 4 room partitions
  const partitionMat = createWoodTexture('#8B7355', '#6B5740');
  for (let i = 0; i < 3; i++) {
    const x = -WIDTH / 2 + 2.5 + i * 2.5;
    const partition = new Mesh(
      new BoxGeometry(0.1, UPPER_HEIGHT - 0.2, DEPTH / 2 - 0.2),
      partitionMat,
    );
    partition.position.set(x, GROUND_HEIGHT + UPPER_HEIGHT / 2, DEPTH / 4);
    group.add(partition);
  }

  // Room doors on upper floor (visible from hallway side facing front)
  for (let i = 0; i < 4; i++) {
    const x = -WIDTH / 2 + 1.25 + i * 2.5;
    const roomDoor = createDoor(0.7, 1.8, 'single');
    roomDoor.position.set(x, GROUND_HEIGHT + 0.1, 0.05);
    group.add(roomDoor);
  }

  // Beds in each room (visible through upper windows)
  const bedFrameMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const bedSheetMat = createFabricTexture('#E8E0D0');
  for (let i = 0; i < 4; i++) {
    const x = -WIDTH / 2 + 1.25 + i * 2.5;

    // Bed frame
    const frame = new Mesh(new BoxGeometry(0.9, 0.3, 1.8), bedFrameMat);
    frame.position.set(x, GROUND_HEIGHT + 0.25, DEPTH / 4 + 0.5);
    group.add(frame);

    // Mattress/sheets
    const mattress = new Mesh(new BoxGeometry(0.8, 0.1, 1.6), bedSheetMat);
    mattress.position.set(x, GROUND_HEIGHT + 0.45, DEPTH / 4 + 0.5);
    group.add(mattress);

    // Pillow
    const pillowMat = createFabricTexture('#F0EBE0');
    const pillow = new Mesh(new BoxGeometry(0.5, 0.08, 0.3), pillowMat);
    pillow.position.set(x, GROUND_HEIGHT + 0.52, DEPTH / 4 + 1.2);
    group.add(pillow);
  }

  // Staircase (ground to upper floor)
  const stairMat = createWoodTexture('#7B5B3A', '#5A3F28');
  const stepCount = 10;
  const stepH = GROUND_HEIGHT / stepCount;
  for (let i = 0; i < stepCount; i++) {
    const step = new Mesh(new BoxGeometry(1.0, stepH * 0.8, 0.3), stairMat);
    step.position.set(WIDTH / 2 - 1.0, stepH * (i + 0.5), -DEPTH / 2 + 0.5 + i * 0.3);
    step.castShadow = true;
    group.add(step);
  }

  // Warm interior lighting
  const warmLight = new PointLight(0xffcc88, 0.6, 8);
  warmLight.position.set(0, 2.5, 0);
  group.add(warmLight);

  const upperLight = new PointLight(0xffcc88, 0.4, 6);
  upperLight.position.set(0, GROUND_HEIGHT + 2.0, 0);
  group.add(upperLight);

  return group;
}

// ---------------------------------------------------------------------------
// Inn archetype
// ---------------------------------------------------------------------------

export const InnArchetype: BuildingArchetype = {
  type: 'inn',

  construct(slots: BuildingSlots): Group {
    const inn = new Group();
    inn.name = 'inn';

    const exterior = buildExterior(slots);
    exterior.name = 'exterior';
    inn.add(exterior);

    const interior = buildInterior(slots);
    interior.name = 'interior';
    inn.add(interior);

    inn.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.matrixAutoUpdate = false;
        obj.updateMatrix();
      }
    });
    inn.updateMatrixWorld(true);

    return inn;
  },
};
