// SheriffOffice — Jail cells with metal bar grids, wanted poster board,
// gun rack, sheriff star on door.

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
  createMetalTexture,
  createPBRStoneRough,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall, DEFAULT_PALETTE } from './BuildingBase';
import { createDoor, createSign, createWindow } from './BuildingBase.composite';
import type { BuildingArchetype, BuildingSlots } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 9;
const DEPTH = 7;
const WALL_HEIGHT = 4;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Sheriff star
// ---------------------------------------------------------------------------

function createSheriffStar(): Group {
  const group = new Group();
  const starMat = new MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.85 });

  // 5-point star built from 5 thin elongated boxes rotated
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const point = new Mesh(new BoxGeometry(0.04, 0.22, 0.02), starMat);
    point.position.set(Math.cos(angle) * 0.06, Math.sin(angle) * 0.06, 0);
    point.rotation.z = angle + Math.PI / 2;
    group.add(point);
  }

  // Center disc
  const disc = new Mesh(new CylinderGeometry(0.06, 0.06, 0.02, 12), starMat);
  disc.rotation.x = Math.PI / 2;
  group.add(disc);

  return group;
}

// ---------------------------------------------------------------------------
// Jail cell bars
// ---------------------------------------------------------------------------

function createJailCell(cellWidth: number, cellDepth: number, cellHeight: number): Group {
  const group = new Group();
  const barMat = createMetalTexture('#3A3A3A');

  // Front bars
  const barSpacing = 0.12;
  const barCount = Math.floor(cellWidth / barSpacing);
  for (let i = 0; i < barCount; i++) {
    const x = -cellWidth / 2 + i * barSpacing + barSpacing / 2;
    const bar = new Mesh(new CylinderGeometry(0.015, 0.015, cellHeight, 6), barMat);
    bar.position.set(x, cellHeight / 2, cellDepth / 2);
    group.add(bar);
  }

  // Top and bottom horizontal bars
  for (const y of [0.05, cellHeight - 0.05]) {
    const hBar = new Mesh(new BoxGeometry(cellWidth, 0.03, 0.03), barMat);
    hBar.position.set(0, y, cellDepth / 2);
    group.add(hBar);
  }

  // Side bars (one side only — other side is wall)
  for (let i = 0; i < 3; i++) {
    const z = -cellDepth / 2 + 0.3 + i * (cellDepth / 3);
    const sideBar = new Mesh(new CylinderGeometry(0.015, 0.015, cellHeight, 6), barMat);
    sideBar.position.set(cellWidth / 2, cellHeight / 2, z);
    group.add(sideBar);
  }

  // Cot (simple plank)
  const cotMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const cot = new Mesh(new BoxGeometry(0.6, 0.05, 1.5), cotMat);
  cot.position.set(-cellWidth / 4, 0.4, 0);
  group.add(cot);

  // Cot legs
  for (const [lx, lz] of [[-0.25, -0.6], [-0.25, 0.6], [0.05, -0.6], [0.05, 0.6]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.015, 0.015, 0.38, 6), cotMat);
    leg.position.set(-cellWidth / 4 + lx, 0.19, lz);
    group.add(leg);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const wallMat = createPBRStoneRough(2);

  // Walls
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  const frontLeftW = WIDTH / 2 - 0.7;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 0.7;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  const lintel = createWall(1.4, WALL_HEIGHT - 2.2, WALL_THICK, wallMat);
  lintel.position.set(0, 2.2 + (WALL_HEIGHT - 2.2) / 2, DEPTH / 2);
  group.add(lintel);

  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Door
  const door = createDoor(1.1, 2.1, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // Sheriff star on door
  const star = createSheriffStar();
  star.position.set(0, 1.5, DEPTH / 2 + 0.08);
  group.add(star);

  // Windows
  const leftWin = createWindow(1.0, 0.8, 2);
  leftWin.position.set(-2.5, 2.0, DEPTH / 2 + 0.05);
  group.add(leftWin);

  const rightWin = createWindow(1.0, 0.8, 2);
  rightWin.position.set(2.5, 2.0, DEPTH / 2 + 0.05);
  group.add(rightWin);

  // Sign
  const signText = slots.signText ?? 'SHERIFF';
  const sign = createSign(signText, 2.8, 0.6);
  sign.position.set(0, WALL_HEIGHT + 0.4, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'flat');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();
  const floorMat = createWoodTexture('#6B5B4A', '#4A3F30');

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Sheriff desk
  const deskMat = createWoodTexture('#6B4226', '#4A2E1A');
  const desk = new Mesh(new BoxGeometry(1.8, 0.8, 0.7), deskMat);
  desk.position.set(-1.5, 0.4, 1.0);
  desk.castShadow = true;
  group.add(desk);

  // Chair behind desk
  const chairMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const seat = new Mesh(new BoxGeometry(0.4, 0.04, 0.4), chairMat);
  seat.position.set(-1.5, 0.45, 0.3);
  group.add(seat);
  const backRest = new Mesh(new BoxGeometry(0.4, 0.5, 0.04), chairMat);
  backRest.position.set(-1.5, 0.7, 0.1);
  group.add(backRest);

  // Wanted poster board (on front wall, left of door)
  const boardMat = createWoodTexture('#4A3422', '#2E1E14');
  const board = new Mesh(new BoxGeometry(1.2, 1.0, 0.04), boardMat);
  board.position.set(-3.0, 2.0, DEPTH / 2 - 0.15);
  group.add(board);

  // Wanted posters (planes on the board)
  const posterColors = ['#F5E6C8', '#E8D8B8', '#F0E0C0'];
  for (let i = 0; i < 3; i++) {
    const canvas = new OffscreenCanvas(128, 160);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = posterColors[i % posterColors.length];
    ctx.fillRect(0, 0, 128, 160);
    ctx.fillStyle = '#2A1A0A';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('WANTED', 64, 25);
    ctx.fillStyle = '#888';
    ctx.fillRect(30, 40, 68, 80);
    ctx.fillStyle = '#2A1A0A';
    ctx.font = '12px serif';
    ctx.fillText('$500 REWARD', 64, 145);

    const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
    texture.colorSpace = SRGBColorSpace;
    const posterMat = new MeshStandardMaterial({ map: texture, roughness: 0.8 });
    const poster = new Mesh(new PlaneGeometry(0.3, 0.38), posterMat);
    poster.position.set(-3.3 + i * 0.4, 2.0, DEPTH / 2 - 0.12);
    group.add(poster);
  }

  // Gun rack on right wall
  const rackMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const rackBoard = new Mesh(new BoxGeometry(0.06, 0.8, 1.2), rackMat);
  rackBoard.position.set(WIDTH / 2 - 0.15, 2.0, 0);
  group.add(rackBoard);

  // Gun barrels on rack (horizontal cylinders)
  const gunMat = createMetalTexture('#3A3A3A');
  for (let i = 0; i < 3; i++) {
    const barrel = new Mesh(new CylinderGeometry(0.02, 0.02, 0.9, 6), gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(WIDTH / 2 - 0.2, 2.2 - i * 0.2, 0);
    group.add(barrel);
  }

  // Two jail cells in the back
  for (let i = 0; i < 2; i++) {
    const cell = createJailCell(2.0, 2.5, WALL_HEIGHT - 0.3);
    cell.position.set(-1.5 + i * 3.0, 0, -DEPTH / 2 + 1.5);
    group.add(cell);
  }

  return group;
}

// ---------------------------------------------------------------------------
// SheriffOffice archetype
// ---------------------------------------------------------------------------

export const SheriffOfficeArchetype: BuildingArchetype = {
  type: 'sheriff_office',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'sheriff_office';

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
