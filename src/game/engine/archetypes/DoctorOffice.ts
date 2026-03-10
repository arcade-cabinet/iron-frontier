// DoctorOffice — Red cross sign, exam table, medicine cabinet,
// clean white interior.

import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

import {
  createGlassTexture,
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
// Red cross sign
// ---------------------------------------------------------------------------

function createRedCrossSign(): Group {
  const group = new Group();

  const canvas = new OffscreenCanvas(256, 256);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#F5F0E6';
  ctx.fillRect(0, 0, 256, 256);

  // Red cross
  ctx.fillStyle = '#CC2222';
  ctx.fillRect(98, 40, 60, 176);
  ctx.fillRect(40, 98, 176, 60);

  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  const mat = new MeshStandardMaterial({ map: texture, roughness: 0.5 });

  const signBoard = new Mesh(new BoxGeometry(0.8, 0.8, 0.06), mat);
  group.add(signBoard);

  // White border frame
  const frameMat = new MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.4 });
  const frameThick = 0.04;
  for (const [x, y, w, h] of [
    [0, 0.42, 0.88, frameThick],
    [0, -0.42, 0.88, frameThick],
    [-0.42, 0, frameThick, 0.88],
    [0.42, 0, frameThick, 0.88],
  ] as const) {
    const bar = new Mesh(new BoxGeometry(w, h, 0.08), frameMat);
    bar.position.set(x, y, 0);
    group.add(bar);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exam table
// ---------------------------------------------------------------------------

function createExamTable(): Group {
  const group = new Group();
  const frameMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const surfaceMat = new MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.4 });

  // Frame
  const frame = new Mesh(new BoxGeometry(0.7, 0.6, 1.6), frameMat);
  frame.position.y = 0.3;
  frame.castShadow = true;
  group.add(frame);

  // Surface (white/clean)
  const surface = new Mesh(new BoxGeometry(0.72, 0.04, 1.62), surfaceMat);
  surface.position.y = 0.62;
  group.add(surface);

  // Pillow end (raised section)
  const pillow = new Mesh(new BoxGeometry(0.6, 0.06, 0.3), surfaceMat);
  pillow.position.set(0, 0.67, -0.6);
  group.add(pillow);

  return group;
}

// ---------------------------------------------------------------------------
// Medicine cabinet
// ---------------------------------------------------------------------------

function createMedicineCabinet(): Group {
  const group = new Group();
  const cabinetMat = new MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.4 });
  const glassMat = createGlassTexture('#D8E8F0');

  // Cabinet body
  const body = new Mesh(new BoxGeometry(1.0, 1.2, 0.3), cabinetMat);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Glass doors (two)
  for (const x of [-0.22, 0.22]) {
    const door = new Mesh(new PlaneGeometry(0.4, 1.0), glassMat);
    door.position.set(x, 0.6, 0.16);
    group.add(door);
  }

  // Shelves inside (visible through glass)
  for (let i = 0; i < 3; i++) {
    const shelf = new Mesh(new BoxGeometry(0.9, 0.02, 0.25), cabinetMat);
    shelf.position.set(0, 0.25 + i * 0.35, 0);
    group.add(shelf);
  }

  // Medicine bottles on shelves
  const bottleColors = ['#8B4513', '#2E8B57', '#4682B4', '#8B0000'];
  for (let row = 0; row < 3; row++) {
    for (let j = 0; j < 4; j++) {
      const color = bottleColors[j % bottleColors.length];
      const glassTint = createGlassTexture(color);
      const bottle = new Mesh(new CylinderGeometry(0.02, 0.025, 0.1, 6), glassTint);
      bottle.position.set(-0.3 + j * 0.2, 0.32 + row * 0.35, 0);
      group.add(bottle);
    }
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const wallMat = new MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.5 });

  // Walls (clean whitewashed look)
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

  // Windows
  for (const xOff of [-2.2, 2.2]) {
    const win = createWindow(0.9, 0.8, 2);
    win.position.set(xOff, 2.0, DEPTH / 2 + 0.05);
    group.add(win);
  }

  // Side windows
  for (const side of [-1, 1]) {
    const win = createWindow(0.8, 0.7, 2);
    win.rotation.y = Math.PI / 2;
    win.position.set(side * (WIDTH / 2 + 0.05), 2.0, 0);
    group.add(win);
  }

  // Text sign
  const signText = slots.signText ?? 'DOCTOR';
  const sign = createSign(signText, 2.2, 0.5);
  sign.position.set(0, WALL_HEIGHT + 0.3, DEPTH / 2 + 0.15);
  group.add(sign);

  // Red cross sign (beside door)
  const crossSign = createRedCrossSign();
  crossSign.position.set(2.0, 2.8, DEPTH / 2 + 0.1);
  group.add(crossSign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'peaked');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();

  // Clean white floor
  const floorMat = new MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.4 });
  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Exam table (center)
  const table = createExamTable();
  table.position.set(1.0, 0, -0.5);
  group.add(table);

  // Medicine cabinet on back wall
  const cabinet = createMedicineCabinet();
  cabinet.position.set(-2.0, 1.2, -DEPTH / 2 + 0.2);
  group.add(cabinet);

  // Doctor's desk
  const deskMat = createWoodTexture('#6B4226', '#4A2E1A');
  const desk = new Mesh(new BoxGeometry(1.2, 0.75, 0.6), deskMat);
  desk.position.set(-2.0, 0.375, 1.0);
  desk.castShadow = true;
  group.add(desk);

  // Chair
  const chairMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const seat = new Mesh(new BoxGeometry(0.4, 0.04, 0.4), chairMat);
  seat.position.set(-2.0, 0.45, 0.3);
  group.add(seat);

  // Wash basin stand
  const standMat = createWoodTexture('#7B5B3A', '#5A3F28');
  const stand = new Mesh(new BoxGeometry(0.5, 0.8, 0.4), standMat);
  stand.position.set(WIDTH / 2 - 0.5, 0.4, -1.5);
  group.add(stand);

  // Basin (white bowl shape — cylinder)
  const basinMat = new MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.3 });
  const basin = new Mesh(new CylinderGeometry(0.18, 0.12, 0.1, 12), basinMat);
  basin.position.set(WIDTH / 2 - 0.5, 0.85, -1.5);
  group.add(basin);

  return group;
}

// ---------------------------------------------------------------------------
// DoctorOffice archetype
// ---------------------------------------------------------------------------

export const DoctorOfficeArchetype: BuildingArchetype = {
  type: 'doctor_office',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'doctor_office';

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
