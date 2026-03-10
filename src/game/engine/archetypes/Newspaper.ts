// Newspaper — Printing press, paper stacks, writer desks,
// "THE FRONTIER GAZETTE" sign.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';

import { createWoodTexture } from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createDoor, createSign, createWindow } from './BuildingBase.composite';
import { createPaperStack, createPrintingPress, createWriterDesk } from './Newspaper.interior';
import type { BuildingArchetype, BuildingSlots } from './types';

const WIDTH = 9;
const DEPTH = 7;
const WALL_HEIGHT = 4;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallMat = createWoodTexture(palette[0] ?? '#8B7B5A', palette[1] ?? '#6B5E3A');

  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  for (const side of [-1, 1]) {
    const frontW = WIDTH / 2 - 0.65;
    const front = createWall(frontW, WALL_HEIGHT, WALL_THICK, wallMat);
    front.position.set(side * (WIDTH / 2 - frontW / 2), WALL_HEIGHT / 2, DEPTH / 2);
    group.add(front);

    const sideWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
    sideWall.position.set(side * WIDTH / 2, WALL_HEIGHT / 2, 0);
    group.add(sideWall);
  }

  const lintel = createWall(1.3, WALL_HEIGHT - 2.1, WALL_THICK, wallMat);
  lintel.position.set(0, 2.1 + (WALL_HEIGHT - 2.1) / 2, DEPTH / 2);
  group.add(lintel);

  const door = createDoor(1.1, 2.0, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  for (const x of [-2.5, 2.5]) {
    const win = createWindow(1.4, 1.0, 3);
    win.position.set(x, 1.8, DEPTH / 2 + 0.05);
    group.add(win);
  }

  const sign = createSign(slots.signText ?? 'THE FRONTIER GAZETTE', 4.0, 0.6);
  sign.position.set(0, WALL_HEIGHT + 0.3, DEPTH / 2 + 0.15);
  group.add(sign);

  const roof = createRoof(WIDTH, DEPTH, 'flat');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Bulletin board outside
  const boardMat = createWoodTexture('#4A3422', '#2E1E14');
  const board = new Mesh(new BoxGeometry(0.8, 1.2, 0.06), boardMat);
  board.position.set(WIDTH / 2 + 0.5, 1.2, DEPTH / 4);
  group.add(board);

  const paperMat = new MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.8 });
  for (let i = 0; i < 3; i++) {
    const paper = new Mesh(new BoxGeometry(0.2, 0.28, 0.003), paperMat);
    paper.position.set(WIDTH / 2 + 0.53, 0.9 + i * 0.35, DEPTH / 4 + (i - 1) * 0.1);
    group.add(paper);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, createWoodTexture('#7B5B3A', '#5A3F28'));
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Printing press
  const press = createPrintingPress();
  press.position.set(0, 0, -DEPTH / 2 + 1.0);
  group.add(press);

  // Writer desks
  for (const x of [-2.0, 2.0]) {
    const desk = createWriterDesk();
    desk.position.set(x, 0, 1.0);
    group.add(desk);
  }

  // Paper stacks
  const stackPositions: [number, number, number, number, number][] = [
    [-2.5, -DEPTH / 2 + 0.8, 0.3, 0.3, 0.4],
    [-2.5, -DEPTH / 2 + 1.5, 0.4, 0.5, 0.3],
    [2.5, -DEPTH / 2 + 0.8, 0.35, 0.2, 0.4],
  ];
  for (const [x, z, w, h, d] of stackPositions) {
    const stack = createPaperStack(w, h, d);
    stack.position.set(x, 0, z);
    group.add(stack);
  }

  // Shelf with finished newspapers
  const shelfMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const shelf = new Mesh(new BoxGeometry(2.0, 0.04, 0.3), shelfMat);
  shelf.position.set(WIDTH / 2 - 1.2, 1.5, -DEPTH / 2 + 0.2);
  group.add(shelf);

  const finishedStack = createPaperStack(0.3, 0.15, 0.25);
  finishedStack.position.set(WIDTH / 2 - 1.2, 1.52, -DEPTH / 2 + 0.2);
  group.add(finishedStack);

  // Chairs at desks
  const chairMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  for (const x of [-2.0, 2.0]) {
    const seat = new Mesh(new BoxGeometry(0.38, 0.04, 0.38), chairMat);
    seat.position.set(x, 0.45, 1.6);
    group.add(seat);

    const back = new Mesh(new BoxGeometry(0.36, 0.35, 0.03), chairMat);
    back.position.set(x, 0.65, 1.78);
    group.add(back);

    for (const [lx, lz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]] as const) {
      const leg = new Mesh(new CylinderGeometry(0.015, 0.018, 0.44, 6), chairMat);
      leg.position.set(x + lx, 0.22, 1.6 + lz);
      group.add(leg);
    }
  }

  return group;
}

// ---------------------------------------------------------------------------
// Newspaper archetype
// ---------------------------------------------------------------------------

export const NewspaperArchetype: BuildingArchetype = {
  type: 'newspaper',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'newspaper';

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
