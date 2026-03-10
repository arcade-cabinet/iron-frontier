// MiningOffice — Rugged construction, mine maps on walls, scales,
// ore samples, equipment storage.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from 'three';

import {
  createMetalTexture,
  createRustTexture,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createDoor, createSign, createWindow } from './BuildingBase.composite';
import { createMineMap, createOreSamples, createScale } from './MiningOffice.interior';
import type { BuildingArchetype, BuildingSlots } from './types';

const WIDTH = 8;
const DEPTH = 7;
const WALL_HEIGHT = 4;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallMat = createWoodTexture(palette[0] ?? '#6B5B4A', palette[1] ?? '#4B3E2A');

  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  for (const side of [-1, 1]) {
    const frontW = WIDTH / 2 - 0.6;
    const front = createWall(frontW, WALL_HEIGHT, WALL_THICK, wallMat);
    front.position.set(side * (WIDTH / 2 - frontW / 2), WALL_HEIGHT / 2, DEPTH / 2);
    group.add(front);

    const sideWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
    sideWall.position.set(side * WIDTH / 2, WALL_HEIGHT / 2, 0);
    group.add(sideWall);
  }

  const lintel = createWall(1.2, WALL_HEIGHT - 2.0, WALL_THICK, wallMat);
  lintel.position.set(0, 2.0 + (WALL_HEIGHT - 2.0) / 2, DEPTH / 2);
  group.add(lintel);

  const door = createDoor(1.0, 1.9, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  for (const x of [-2.2, 2.2]) {
    const win = createWindow(0.8, 0.7, 2);
    win.position.set(x, 2.0, DEPTH / 2 + 0.05);
    group.add(win);
  }

  const sign = createSign(slots.signText ?? 'MINING OFFICE', 3.0, 0.6);
  sign.position.set(0, WALL_HEIGHT + 0.3, DEPTH / 2 + 0.15);
  group.add(sign);

  const roof = createRoof(WIDTH, DEPTH, 'shed');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Outside equipment — pickaxe and shovel
  const handleMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const headMat = createRustTexture('#6B5040');

  const pickHandle = new Mesh(new CylinderGeometry(0.02, 0.02, 1.2, 6), handleMat);
  pickHandle.rotation.z = 0.2;
  pickHandle.position.set(-WIDTH / 2 - 0.3, 0.6, DEPTH / 4);
  group.add(pickHandle);
  const pickHead = new Mesh(new BoxGeometry(0.3, 0.04, 0.04), headMat);
  pickHead.position.set(-WIDTH / 2 - 0.15, 1.15, DEPTH / 4);
  group.add(pickHead);

  const shovelHandle = new Mesh(new CylinderGeometry(0.015, 0.015, 1.2, 6), handleMat);
  shovelHandle.rotation.z = 0.15;
  shovelHandle.position.set(-WIDTH / 2 - 0.15, 0.6, DEPTH / 4 + 0.3);
  group.add(shovelHandle);
  const shovelHead = new Mesh(new BoxGeometry(0.12, 0.15, 0.02), headMat);
  shovelHead.position.set(-WIDTH / 2 - 0.06, 0.05, DEPTH / 4 + 0.3);
  group.add(shovelHead);

  return group;
}

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

function buildInterior(): Group {
  const group = new Group();

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, createWoodTexture('#6B5B4A', '#4A3F30'));
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Desk
  const deskMat = createWoodTexture('#6B4226', '#4A2E1A');
  const desk = new Mesh(new BoxGeometry(2.0, 0.8, 0.7), deskMat);
  desk.position.set(0, 0.4, -0.5);
  desk.castShadow = true;
  group.add(desk);

  // Mine maps on walls
  const map1 = createMineMap();
  map1.position.set(-1.5, 2.0, -DEPTH / 2 + 0.15);
  group.add(map1);

  const map2 = createMineMap();
  map2.position.set(1.5, 2.2, -DEPTH / 2 + 0.15);
  group.add(map2);

  const map3 = createMineMap();
  map3.rotation.y = Math.PI / 2;
  map3.position.set(WIDTH / 2 - 0.15, 2.0, 0);
  group.add(map3);

  // Scale and ores on desk
  const scale = createScale();
  scale.position.set(0.5, 0.82, -0.5);
  group.add(scale);

  const ores = createOreSamples();
  ores.position.set(-0.4, 0.82, -0.5);
  group.add(ores);

  // Equipment shelves on left wall
  const shelfMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const equipMat = createRustTexture('#5A4A3A');
  for (let i = 0; i < 3; i++) {
    const shelf = new Mesh(new BoxGeometry(0.04, 0.04, 2.0), shelfMat);
    shelf.position.set(-WIDTH / 2 + 0.15, 0.8 + i * 0.6, 0);
    group.add(shelf);

    for (let j = 0; j < 4; j++) {
      const item = new Mesh(new BoxGeometry(0.1, 0.12, 0.1), equipMat);
      item.position.set(-WIDTH / 2 + 0.15, 0.88 + i * 0.6, -0.6 + j * 0.4);
      group.add(item);
    }
  }

  // Safe
  const safeMat = createMetalTexture('#3A3A3A');
  const safe = new Mesh(new BoxGeometry(0.5, 0.6, 0.5), safeMat);
  safe.position.set(WIDTH / 2 - 0.5, 0.3, -DEPTH / 2 + 0.5);
  safe.castShadow = true;
  group.add(safe);

  const handle = new Mesh(new CylinderGeometry(0.04, 0.04, 0.02, 8), createMetalTexture('#B8860B'));
  handle.rotation.x = Math.PI / 2;
  handle.position.set(WIDTH / 2 - 0.35, 0.35, -DEPTH / 2 + 0.76);
  group.add(handle);

  return group;
}

// ---------------------------------------------------------------------------
// MiningOffice archetype
// ---------------------------------------------------------------------------

export const MiningOfficeArchetype: BuildingArchetype = {
  type: 'mining_office',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'mining_office';

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
