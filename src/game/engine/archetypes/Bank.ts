// Bank — Heavy vault door, teller window counter with cage bars,
// stone foundation, imposing facade.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';

import {
  createMetalTexture,
  createStoneTexture,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createDoor, createSign, createWindow } from './BuildingBase.composite';
import type { BuildingArchetype, BuildingSlots } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIDTH = 10;
const DEPTH = 8;
const WALL_HEIGHT = 5;
const WALL_THICK = 0.25;
const FOUNDATION_H = 0.6;

// ---------------------------------------------------------------------------
// Vault door
// ---------------------------------------------------------------------------

function createVaultDoor(): Group {
  const group = new Group();
  const metalMat = createMetalTexture('#5A5A5A');

  // Heavy circular door
  const door = new Mesh(new CylinderGeometry(0.8, 0.8, 0.15, 24), metalMat);
  door.rotation.x = Math.PI / 2;
  door.position.y = 0.9;
  door.castShadow = true;
  group.add(door);

  // Door frame (thick metal)
  const frameMat = createMetalTexture('#3A3A3A');
  const frame = new Mesh(new CylinderGeometry(0.9, 0.9, 0.08, 24), frameMat);
  frame.rotation.x = Math.PI / 2;
  frame.position.set(0, 0.9, -0.08);
  group.add(frame);

  // Locking wheel (handle)
  const wheelMat = new MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.9 });
  const wheel = new Mesh(new CylinderGeometry(0.2, 0.2, 0.04, 16), wheelMat);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(0, 0.9, 0.1);
  group.add(wheel);

  // Spokes on wheel
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const spoke = new Mesh(new BoxGeometry(0.02, 0.35, 0.02), wheelMat);
    spoke.rotation.z = angle;
    spoke.position.set(0, 0.9, 0.12);
    group.add(spoke);
  }

  // Bolt heads around frame
  const boltMat = createMetalTexture('#4A4A4A');
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bolt = new Mesh(new CylinderGeometry(0.025, 0.025, 0.04, 6), boltMat);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(
      Math.cos(angle) * 0.82,
      0.9 + Math.sin(angle) * 0.82,
      0.1,
    );
    group.add(bolt);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Teller cage
// ---------------------------------------------------------------------------

function createTellerCage(width: number): Group {
  const group = new Group();
  const counterMat = createWoodTexture('#5A3A1E', '#3E2812');
  const barMat = createMetalTexture('#B8860B');

  // Counter
  const counter = new Mesh(new BoxGeometry(width, 1.1, 0.5), counterMat);
  counter.position.y = 0.55;
  counter.castShadow = true;
  group.add(counter);

  // Counter top
  const top = new Mesh(new BoxGeometry(width + 0.1, 0.05, 0.6), counterMat);
  top.position.y = 1.125;
  group.add(top);

  // Cage bars (brass)
  const barCount = Math.floor(width / 0.08);
  for (let i = 0; i < barCount; i++) {
    const x = -width / 2 + 0.04 + i * 0.08;
    const bar = new Mesh(new CylinderGeometry(0.008, 0.008, 1.4, 6), barMat);
    bar.position.set(x, 1.1 + 0.7, 0);
    group.add(bar);
  }

  // Top and bottom horizontal bars
  for (const y of [1.15, 1.1 + 1.4]) {
    const hBar = new Mesh(new BoxGeometry(width, 0.025, 0.025), barMat);
    hBar.position.y = y;
    group.add(hBar);
  }

  // Teller window opening (gap in bars)
  // Represented by a small open section in the center
  const openingFrame = new Mesh(new BoxGeometry(0.6, 0.4, 0.03), barMat);
  openingFrame.position.set(0, 1.5, 0);
  group.add(openingFrame);

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallBase = palette[0] ?? '#8B7B6A';
  const wallGrain = palette[1] ?? '#6B5E4A';
  const wallMat = createWoodTexture(wallBase, wallGrain);
  const stoneMat = createStoneTexture('#8B8070', '#6B6055');

  // Stone foundation
  const foundation = new Mesh(new BoxGeometry(WIDTH + 0.3, FOUNDATION_H, DEPTH + 0.3), stoneMat);
  foundation.position.y = FOUNDATION_H / 2;
  foundation.castShadow = true;
  group.add(foundation);

  // Back wall
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, FOUNDATION_H + WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  // Front wall
  const frontLeftW = WIDTH / 2 - 0.8;
  const frontLeft = createWall(frontLeftW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontLeft.position.set(-WIDTH / 2 + frontLeftW / 2, FOUNDATION_H + WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontLeft);

  const frontRightW = WIDTH / 2 - 0.8;
  const frontRight = createWall(frontRightW, WALL_HEIGHT, WALL_THICK, wallMat);
  frontRight.position.set(WIDTH / 2 - frontRightW / 2, FOUNDATION_H + WALL_HEIGHT / 2, DEPTH / 2);
  group.add(frontRight);

  const lintel = createWall(1.6, WALL_HEIGHT - 2.4, WALL_THICK, wallMat);
  lintel.position.set(0, FOUNDATION_H + 2.4 + (WALL_HEIGHT - 2.4) / 2, DEPTH / 2);
  group.add(lintel);

  // Side walls
  const leftWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  leftWall.position.set(-WIDTH / 2, FOUNDATION_H + WALL_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
  rightWall.position.set(WIDTH / 2, FOUNDATION_H + WALL_HEIGHT / 2, 0);
  group.add(rightWall);

  // Imposing false front (taller facade)
  const falseFrontH = 2.0;
  const falseFront = createWall(WIDTH + 0.3, falseFrontH, WALL_THICK * 0.8, wallMat);
  falseFront.position.set(0, FOUNDATION_H + WALL_HEIGHT + falseFrontH / 2, DEPTH / 2 + 0.05);
  group.add(falseFront);

  // Stone pilasters on front corners
  for (const x of [-WIDTH / 2 - 0.05, WIDTH / 2 + 0.05]) {
    const pilaster = new Mesh(
      new BoxGeometry(0.4, WALL_HEIGHT + falseFrontH, 0.3),
      stoneMat,
    );
    pilaster.position.set(x, FOUNDATION_H + (WALL_HEIGHT + falseFrontH) / 2, DEPTH / 2 + 0.15);
    pilaster.castShadow = true;
    group.add(pilaster);
  }

  // Door
  const door = createDoor(1.2, 2.3, 'double');
  door.position.set(0, FOUNDATION_H, DEPTH / 2 + 0.02);
  group.add(door);

  // Steps up to door
  for (let i = 0; i < 3; i++) {
    const stepW = 2.0 - i * 0.15;
    const step = new Mesh(new BoxGeometry(stepW, FOUNDATION_H / 3, 0.4), stoneMat);
    step.position.set(0, (i + 0.5) * (FOUNDATION_H / 3), DEPTH / 2 + 0.4 + i * 0.35);
    group.add(step);
  }

  // Windows
  for (const xOff of [-3.0, 3.0]) {
    const win = createWindow(1.0, 1.0, 2);
    win.position.set(xOff, FOUNDATION_H + 2.0, DEPTH / 2 + 0.05);
    group.add(win);
  }

  // Sign
  const signText = slots.signText ?? 'BANK';
  const sign = createSign(signText, 2.5, 0.7);
  sign.position.set(0, FOUNDATION_H + WALL_HEIGHT + falseFrontH + 0.1, DEPTH / 2 + 0.2);
  group.add(sign);

  // Roof
  const roof = createRoof(WIDTH, DEPTH, 'flat');
  roof.position.set(0, FOUNDATION_H + WALL_HEIGHT, 0);
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
  floor.position.set(0, FOUNDATION_H + 0.01, 0);
  group.add(floor);

  // Teller counter with cage
  const teller = createTellerCage(WIDTH * 0.6);
  teller.position.set(0, FOUNDATION_H, -DEPTH / 2 + 1.5);
  group.add(teller);

  // Vault door on back wall
  const vault = createVaultDoor();
  vault.position.set(WIDTH / 4, FOUNDATION_H, -DEPTH / 2 + 0.2);
  group.add(vault);

  // Waiting bench
  const benchMat = createWoodTexture('#7B5B3A', '#5A3F28');
  const bench = new Mesh(new BoxGeometry(2.0, 0.06, 0.4), benchMat);
  bench.position.set(-2.0, FOUNDATION_H + 0.45, 1.5);
  group.add(bench);

  // Bench legs
  for (const [lx, lz] of [[-0.8, -0.15], [0.8, -0.15], [-0.8, 0.15], [0.8, 0.15]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.025, 0.03, 0.44, 6), benchMat);
    leg.position.set(-2.0 + lx, FOUNDATION_H + 0.22, 1.5 + lz);
    group.add(leg);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Bank archetype
// ---------------------------------------------------------------------------

export const BankArchetype: BuildingArchetype = {
  type: 'bank',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'bank';

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
