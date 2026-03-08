// Church — Steeple tower with cross on top, arched windows,
// interior pews, bell in tower.

import {
  BoxGeometry,
  Group,
  Mesh,
} from 'three';

import { createWoodTexture } from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createDoor } from './BuildingBase.composite';
import {
  createArchedWindow,
  createCross,
  createPewRow,
  createSteeple,
} from './Church.interior';
import type { BuildingArchetype, BuildingSlots } from './types';

const WIDTH = 8;
const DEPTH = 12;
const WALL_HEIGHT = 5;
const WALL_THICK = 0.2;
const STEEPLE_BASE = 2.0;

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const wallMat = createWoodTexture('#E8DDD0', '#C8BDB0');

  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  for (const side of [-1, 1]) {
    const frontW = WIDTH / 2 - 0.7;
    const front = createWall(frontW, WALL_HEIGHT, WALL_THICK, wallMat);
    front.position.set(side * (WIDTH / 2 - frontW / 2), WALL_HEIGHT / 2, DEPTH / 2);
    group.add(front);

    const sideWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
    sideWall.position.set(side * WIDTH / 2, WALL_HEIGHT / 2, 0);
    group.add(sideWall);
  }

  const lintel = createWall(1.4, WALL_HEIGHT - 2.6, WALL_THICK, wallMat);
  lintel.position.set(0, 2.6 + (WALL_HEIGHT - 2.6) / 2, DEPTH / 2);
  group.add(lintel);

  // Double doors
  const door = createDoor(1.2, 2.5, 'double');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // Arched windows along sides
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = -DEPTH / 3 + i * (DEPTH / 3);
      const win = createArchedWindow(0.6, 1.4);
      win.rotation.y = Math.PI / 2;
      win.position.set(side * (WIDTH / 2 + 0.05), 2.2, z);
      group.add(win);
    }
  }

  // Roof (peaked)
  const roof = createRoof(WIDTH, DEPTH, 'peaked');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Steeple at front
  const steeple = createSteeple(STEEPLE_BASE, 4.0);
  steeple.position.set(0, WALL_HEIGHT, DEPTH / 2 - STEEPLE_BASE / 2);
  group.add(steeple);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();
  const floorMat = createWoodTexture('#7B6B5A', '#5B4E3A');

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Pew rows (8 rows, center aisle)
  const pewWidth = (WIDTH - 1.5) / 2 - 0.3;
  for (let row = 0; row < 8; row++) {
    const z = -DEPTH / 2 + 1.5 + row * 1.2;
    for (const side of [-1, 1]) {
      const pew = createPewRow(pewWidth);
      pew.position.set(side * (pewWidth / 2 + 0.4), 0, z);
      group.add(pew);
    }
  }

  // Altar/pulpit
  const altarMat = createWoodTexture('#4A3422', '#2E1E14');
  const altar = new Mesh(new BoxGeometry(1.5, 1.0, 0.6), altarMat);
  altar.position.set(0, 0.5, -DEPTH / 2 + 0.8);
  altar.castShadow = true;
  group.add(altar);

  // Small cross on altar
  const cross = createCross(0.4);
  cross.position.set(0, 1.0, -DEPTH / 2 + 0.8);
  group.add(cross);

  return group;
}

// ---------------------------------------------------------------------------
// Church archetype
// ---------------------------------------------------------------------------

export const ChurchArchetype: BuildingArchetype = {
  type: 'church',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'church';

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
