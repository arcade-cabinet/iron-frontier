// Livery — Open barn structure, horse stall partitions, hay bales,
// tack on walls, large double doors.

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

import { createFloor, createRoof, createWall, DEFAULT_PALETTE } from './BuildingBase';
import { createDoor, createSign } from './BuildingBase.composite';
import type { BuildingArchetype, BuildingSlots } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 12;
const DEPTH = 10;
const WALL_HEIGHT = 5;
const WALL_THICK = 0.2;

// ---------------------------------------------------------------------------
// Hay bale
// ---------------------------------------------------------------------------

function createHayBale(): Group {
  const group = new Group();
  const hayMat = new MeshStandardMaterial({ color: 0xc8b060, roughness: 0.9 });

  const bale = new Mesh(new BoxGeometry(0.5, 0.4, 0.6), hayMat);
  bale.position.y = 0.2;
  bale.castShadow = true;
  group.add(bale);

  // Twine bands
  const twineMat = new MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
  for (const z of [-0.15, 0.15]) {
    const twine = new Mesh(new BoxGeometry(0.52, 0.02, 0.02), twineMat);
    twine.position.set(0, 0.2, z);
    group.add(twine);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Horse stall
// ---------------------------------------------------------------------------

function createStall(stallWidth: number, stallDepth: number): Group {
  const group = new Group();
  const mat = createWoodTexture('#6B4E32', '#4A3422');

  // Side partition (half-height wall)
  const partitionH = 1.5;
  const partition = new Mesh(new BoxGeometry(0.08, partitionH, stallDepth), mat);
  partition.position.set(stallWidth / 2, partitionH / 2, 0);
  partition.castShadow = true;
  group.add(partition);

  // Back wall of stall
  const back = new Mesh(new BoxGeometry(stallWidth, partitionH, 0.08), mat);
  back.position.set(0, partitionH / 2, -stallDepth / 2);
  group.add(back);

  // Gate (lower front)
  const gateH = 1.2;
  const gate = new Mesh(new BoxGeometry(stallWidth - 0.1, gateH, 0.06), mat);
  gate.position.set(0, gateH / 2, stallDepth / 2);
  group.add(gate);

  // Gate horizontal bars
  const barMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  for (const y of [0.3, 0.6, 0.9]) {
    const bar = new Mesh(new BoxGeometry(stallWidth - 0.12, 0.03, 0.08), barMat);
    bar.position.set(0, y, stallDepth / 2);
    group.add(bar);
  }

  // Feed bucket (metal cylinder)
  const bucketMat = createMetalTexture('#5A5A5A');
  const bucket = new Mesh(new CylinderGeometry(0.12, 0.1, 0.2, 8), bucketMat);
  bucket.position.set(-stallWidth / 4, 0.8, -stallDepth / 2 + 0.2);
  group.add(bucket);

  return group;
}

// ---------------------------------------------------------------------------
// Tack (saddle, bridle simplified)
// ---------------------------------------------------------------------------

function createTackRack(): Group {
  const group = new Group();
  const rackMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const leatherMat = new MeshStandardMaterial({ color: 0x5a3020, roughness: 0.6 });

  // Rack board
  const board = new Mesh(new BoxGeometry(2.0, 0.08, 0.15), rackMat);
  board.position.y = 1.5;
  group.add(board);

  // Pegs
  for (let i = 0; i < 4; i++) {
    const peg = new Mesh(new CylinderGeometry(0.02, 0.02, 0.2, 6), rackMat);
    peg.rotation.x = Math.PI / 2;
    peg.position.set(-0.75 + i * 0.5, 1.5, 0.15);
    group.add(peg);
  }

  // Hanging items (simplified leather shapes)
  for (let i = 0; i < 3; i++) {
    const item = new Mesh(new BoxGeometry(0.3, 0.4, 0.05), leatherMat);
    item.position.set(-0.5 + i * 0.5, 1.1, 0.15);
    group.add(item);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallBase = palette[0] ?? '#7B5B3A';
  const wallGrain = palette[1] ?? '#5A3F28';
  const wallMat = createWoodTexture(wallBase, wallGrain);

  // Back wall
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  // Side walls
  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Front wall — large double-door opening
  const frontLeftW = WIDTH / 2 - 2.0;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 2.0;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  // Header above door opening
  const header = createWall(4.0, WALL_HEIGHT - 3.0, WALL_THICK, wallMat);
  header.position.set(0, 3.0 + (WALL_HEIGHT - 3.0) / 2, DEPTH / 2);
  group.add(header);

  // Large double barn doors
  const door = createDoor(3.5, 2.8, 'double');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // X-brace detail on doors (decorative)
  const braceMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  for (const xSide of [-0.9, 0.9]) {
    // Diagonal braces
    const brace1 = new Mesh(new BoxGeometry(0.06, 2.8, 0.04), braceMat);
    brace1.rotation.z = 0.35;
    brace1.position.set(xSide, 1.4, DEPTH / 2 + 0.06);
    group.add(brace1);
    const brace2 = new Mesh(new BoxGeometry(0.06, 2.8, 0.04), braceMat);
    brace2.rotation.z = -0.35;
    brace2.position.set(xSide, 1.4, DEPTH / 2 + 0.06);
    group.add(brace2);
  }

  // Sign
  const signText = slots.signText ?? 'LIVERY STABLE';
  const sign = createSign(signText, 3.5, 0.6);
  sign.position.set(0, WALL_HEIGHT + 0.4, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof (peaked — barn style)
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

  // Dirt floor
  const floorMat = new MeshStandardMaterial({ color: 0x6b5b4a, roughness: 0.95 });
  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Horse stalls (3 per side)
  const stallW = 2.5;
  const stallD = 3.0;
  for (let i = 0; i < 3; i++) {
    const z = -DEPTH / 2 + 1.0 + i * 3.0;

    // Left stall
    const leftStall = createStall(stallW, stallD);
    leftStall.position.set(-WIDTH / 2 + stallW / 2 + 0.2, 0, z);
    group.add(leftStall);

    // Right stall
    const rightStall = createStall(stallW, stallD);
    rightStall.position.set(WIDTH / 2 - stallW / 2 - 0.2, 0, z);
    rightStall.scale.x = -1; // Mirror
    group.add(rightStall);
  }

  // Hay bales in back corner
  const hayPositions: [number, number][] = [
    [-WIDTH / 2 + 1.0, -DEPTH / 2 + 0.5],
    [-WIDTH / 2 + 1.6, -DEPTH / 2 + 0.5],
    [-WIDTH / 2 + 1.3, -DEPTH / 2 + 1.0],
  ];
  for (const [x, z] of hayPositions) {
    const bale = createHayBale();
    bale.position.set(x, 0, z);
    group.add(bale);
  }

  // Stacked hay bales
  const stackedBale = createHayBale();
  stackedBale.position.set(-WIDTH / 2 + 1.0, 0.4, -DEPTH / 2 + 0.5);
  group.add(stackedBale);

  // Tack rack on left wall
  const tack = createTackRack();
  tack.position.set(-WIDTH / 2 + 0.15, 0, 2.0);
  tack.rotation.y = Math.PI / 2;
  group.add(tack);

  return group;
}

// ---------------------------------------------------------------------------
// Livery archetype
// ---------------------------------------------------------------------------

export const LiveryArchetype: BuildingArchetype = {
  type: 'livery',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'livery';

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
