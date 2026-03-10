// TelegraphOffice — Small building, telegraph key device on desk,
// wire poles outside, "TELEGRAPH" sign.

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

const WIDTH = 6;
const DEPTH = 5;
const WALL_HEIGHT = 3.5;
const WALL_THICK = 0.18;

// ---------------------------------------------------------------------------
// Telegraph key
// ---------------------------------------------------------------------------

function createTelegraphKey(): Group {
  const group = new Group();
  const woodMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const metalMat = createMetalTexture('#B8860B');
  const darkMetal = createMetalTexture('#3A3A3A');

  // Base board
  const base = new Mesh(new BoxGeometry(0.25, 0.02, 0.15), woodMat);
  group.add(base);

  // Key lever
  const lever = new Mesh(new BoxGeometry(0.15, 0.01, 0.03), metalMat);
  lever.position.set(0, 0.03, 0);
  group.add(lever);

  // Key knob
  const knob = new Mesh(new CylinderGeometry(0.015, 0.015, 0.02, 8), darkMetal);
  knob.position.set(0.05, 0.045, 0);
  group.add(knob);

  // Terminal posts
  for (const x of [-0.08, 0.08]) {
    const post = new Mesh(new CylinderGeometry(0.008, 0.008, 0.04, 6), metalMat);
    post.position.set(x, 0.03, -0.04);
    group.add(post);
  }

  // Sounder (small box)
  const sounder = new Mesh(new BoxGeometry(0.06, 0.05, 0.04), darkMetal);
  sounder.position.set(-0.08, 0.035, 0.03);
  group.add(sounder);

  return group;
}

// ---------------------------------------------------------------------------
// Telegraph pole
// ---------------------------------------------------------------------------

function createTelegraphPole(height: number): Group {
  const group = new Group();
  const woodMat = createWoodTexture('#5A4030', '#3E2A1E');
  const metalMat = createMetalTexture('#4A4A4A');

  // Main pole
  const pole = new Mesh(new CylinderGeometry(0.06, 0.08, height, 8), woodMat);
  pole.position.y = height / 2;
  pole.castShadow = true;
  group.add(pole);

  // Cross arm
  const arm = new Mesh(new BoxGeometry(1.2, 0.08, 0.08), woodMat);
  arm.position.y = height - 0.5;
  group.add(arm);

  // Insulators (small glass-like cylinders)
  const insulatorMat = new MeshStandardMaterial({ color: 0x4a8a5a, roughness: 0.3, metalness: 0.1 });
  for (const x of [-0.45, -0.15, 0.15, 0.45]) {
    const insulator = new Mesh(new CylinderGeometry(0.025, 0.02, 0.05, 8), insulatorMat);
    insulator.position.set(x, height - 0.42, 0);
    group.add(insulator);
  }

  // Wires (thin cylinders between poles, extending outward)
  for (const x of [-0.45, 0.45]) {
    const wire = new Mesh(new CylinderGeometry(0.003, 0.003, 4.0, 4), metalMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(x + 2.0, height - 0.4, 0);
    group.add(wire);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallBase = palette[0] ?? '#8B7B5A';
  const wallGrain = palette[1] ?? '#6B5E3A';
  const wallMat = createWoodTexture(wallBase, wallGrain);

  // Walls
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  const frontLeftW = WIDTH / 2 - 0.55;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 0.55;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  const lintel = createWall(1.1, WALL_HEIGHT - 2.0, WALL_THICK, wallMat);
  lintel.position.set(0, 2.0 + (WALL_HEIGHT - 2.0) / 2, DEPTH / 2);
  group.add(lintel);

  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Door
  const door = createDoor(0.9, 1.9, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  // Front window
  const frontWin = createWindow(1.0, 0.8, 2);
  frontWin.position.set(-1.8, 1.8, DEPTH / 2 + 0.05);
  group.add(frontWin);

  const frontWin2 = createWindow(1.0, 0.8, 2);
  frontWin2.position.set(1.8, 1.8, DEPTH / 2 + 0.05);
  group.add(frontWin2);

  // Sign
  const signText = slots.signText ?? 'TELEGRAPH';
  const sign = createSign(signText, 2.8, 0.5);
  sign.position.set(0, WALL_HEIGHT + 0.3, DEPTH / 2 + 0.15);
  group.add(sign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'flat');
  roof.position.set(0, WALL_HEIGHT, 0);
  group.add(roof);

  // Telegraph poles outside
  const pole1 = createTelegraphPole(6.0);
  pole1.position.set(-WIDTH / 2 - 2.0, 0, 0);
  group.add(pole1);

  const pole2 = createTelegraphPole(6.0);
  pole2.position.set(WIDTH / 2 + 2.0, 0, 0);
  group.add(pole2);

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

  // Operator desk
  const deskMat = createWoodTexture('#6B4226', '#4A2E1A');
  const desk = new Mesh(new BoxGeometry(1.6, 0.75, 0.6), deskMat);
  desk.position.set(0, 0.375, -DEPTH / 2 + 0.8);
  desk.castShadow = true;
  group.add(desk);

  // Telegraph key on desk
  const key = createTelegraphKey();
  key.position.set(0.2, 0.76, -DEPTH / 2 + 0.8);
  group.add(key);

  // Paper/message pad
  const paperMat = new MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.8 });
  const paper = new Mesh(new BoxGeometry(0.2, 0.01, 0.25), paperMat);
  paper.position.set(-0.3, 0.76, -DEPTH / 2 + 0.8);
  group.add(paper);

  // Operator chair
  const chairMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const seat = new Mesh(new BoxGeometry(0.4, 0.04, 0.4), chairMat);
  seat.position.set(0, 0.45, -DEPTH / 2 + 1.6);
  group.add(seat);
  for (const [lx, lz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.015, 0.015, 0.44, 6), chairMat);
    leg.position.set(lx, 0.22, -DEPTH / 2 + 1.6 + lz);
    group.add(leg);
  }

  // Filing cabinet
  const cabinetMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const cabinet = new Mesh(new BoxGeometry(0.5, 1.2, 0.4), cabinetMat);
  cabinet.position.set(WIDTH / 2 - 0.5, 0.6, -DEPTH / 2 + 0.4);
  group.add(cabinet);

  // Drawer handles
  const handleMat = createMetalTexture('#B8860B');
  for (let i = 0; i < 3; i++) {
    const handle = new Mesh(new BoxGeometry(0.1, 0.015, 0.02), handleMat);
    handle.position.set(WIDTH / 2 - 0.5, 0.3 + i * 0.35, -DEPTH / 2 + 0.62);
    group.add(handle);
  }

  // Waiting bench
  const benchMat = createWoodTexture('#7B5B3A', '#5A3F28');
  const bench = new Mesh(new BoxGeometry(1.5, 0.04, 0.35), benchMat);
  bench.position.set(-WIDTH / 2 + 1.0, 0.45, 1.0);
  group.add(bench);

  return group;
}

// ---------------------------------------------------------------------------
// TelegraphOffice archetype
// ---------------------------------------------------------------------------

export const TelegraphOfficeArchetype: BuildingArchetype = {
  type: 'telegraph_office',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'telegraph_office';

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
