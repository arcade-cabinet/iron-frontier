// Barber — Barber pole (striped cylinder outside), chair with armrests,
// mirror (reflective plane), "BARBER" sign.

import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';

import {
  createGlassTexture,
  createMetalTexture,
  createWoodTexture,
} from '../materials';

import { createFloor, createRoof, createWall } from './BuildingBase';
import { createDoor, createSign, createWindow } from './BuildingBase.composite';
import { createBarberChair, createMirror, createSuppliesCounter } from './Barber.interior';
import type { BuildingArchetype, BuildingSlots } from './types';

const WIDTH = 7;
const DEPTH = 6;
const WALL_HEIGHT = 3.8;
const WALL_THICK = 0.18;

// ---------------------------------------------------------------------------
// Barber pole
// ---------------------------------------------------------------------------

function createBarberPole(): Group {
  const group = new Group();
  const poleH = 1.8;

  const canvas = new OffscreenCanvas(128, 256);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 128, 256);

  ctx.lineWidth = 16;
  for (let i = -10; i < 20; i++) {
    ctx.strokeStyle = '#CC2222';
    ctx.beginPath(); ctx.moveTo(i * 24, 0); ctx.lineTo(i * 24 + 128, 256); ctx.stroke();
    ctx.strokeStyle = '#2244AA';
    ctx.beginPath(); ctx.moveTo(i * 24 + 12, 0); ctx.lineTo(i * 24 + 140, 256); ctx.stroke();
  }

  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  const poleMat = new MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.1 });

  const pole = new Mesh(new CylinderGeometry(0.06, 0.06, poleH, 12), poleMat);
  pole.position.y = poleH / 2 + 0.3;
  group.add(pole);

  // Caps (brass)
  const capMat = new MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.8 });
  const topCap = new Mesh(new CylinderGeometry(0.08, 0.08, 0.06, 12), capMat);
  topCap.position.y = poleH + 0.33;
  group.add(topCap);
  const topBall = new Mesh(new CylinderGeometry(0.04, 0.08, 0.08, 8), capMat);
  topBall.position.y = poleH + 0.4;
  group.add(topBall);
  const botCap = new Mesh(new CylinderGeometry(0.08, 0.08, 0.06, 12), capMat);
  botCap.position.y = 0.33;
  group.add(botCap);

  // Mounting bracket
  const bracket = new Mesh(new BoxGeometry(0.2, 0.04, 0.04), createMetalTexture('#4A4A4A'));
  bracket.position.set(-0.1, poleH / 2 + 0.3, 0);
  group.add(bracket);

  return group;
}

// ---------------------------------------------------------------------------
// Exterior
// ---------------------------------------------------------------------------

function buildExterior(slots: BuildingSlots): Group {
  const group = new Group();
  const palette = slots.colorPalette ?? [];
  const wallMat = createWoodTexture(palette[0] ?? '#A08060', palette[1] ?? '#806040');

  // Walls
  const backWall = createWall(WIDTH, WALL_HEIGHT, WALL_THICK, wallMat);
  backWall.position.set(0, WALL_HEIGHT / 2, -DEPTH / 2);
  group.add(backWall);

  for (const side of [-1, 1]) {
    const frontW = WIDTH / 2 - 0.55;
    const front = createWall(frontW, WALL_HEIGHT, WALL_THICK, wallMat);
    front.position.set(side * (WIDTH / 2 - frontW / 2), WALL_HEIGHT / 2, DEPTH / 2);
    group.add(front);

    const sideWall = createWall(WALL_THICK, WALL_HEIGHT, DEPTH, wallMat);
    sideWall.position.set(side * WIDTH / 2, WALL_HEIGHT / 2, 0);
    group.add(sideWall);
  }

  const lintel = createWall(1.1, WALL_HEIGHT - 2.0, WALL_THICK, wallMat);
  lintel.position.set(0, 2.0 + (WALL_HEIGHT - 2.0) / 2, DEPTH / 2);
  group.add(lintel);

  const door = createDoor(0.9, 1.9, 'single');
  door.position.set(0, 0, DEPTH / 2 + 0.02);
  group.add(door);

  for (const x of [-2.0, 2.0]) {
    const win = createWindow(1.3, 1.0, 2);
    win.position.set(x, 1.8, DEPTH / 2 + 0.05);
    group.add(win);
  }

  const sign = createSign(slots.signText ?? 'BARBER', 2.2, 0.5);
  sign.position.set(0, WALL_HEIGHT + 0.3, DEPTH / 2 + 0.15);
  group.add(sign);

  // Barber pole
  const pole = createBarberPole();
  pole.position.set(WIDTH / 2 + 0.3, 0, DEPTH / 2 + 0.1);
  group.add(pole);

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
  const floorMat = createWoodTexture('#7B6B5A', '#5B4E3A');

  const floor = createFloor(WIDTH - WALL_THICK * 2, DEPTH - WALL_THICK * 2, floorMat);
  floor.position.set(0, 0.01, 0);
  group.add(floor);

  // Two barber chairs
  for (const x of [-1.2, 1.2]) {
    const chair = createBarberChair();
    chair.position.set(x, 0, -0.5);
    group.add(chair);

    const mirror = createMirror(0.6, 0.8);
    mirror.position.set(x, 1.6, -DEPTH / 2 + 0.15);
    group.add(mirror);
  }

  // Supplies counter
  const counter = createSuppliesCounter(WIDTH * 0.7, DEPTH);
  group.add(counter);

  // Waiting bench
  const benchMat = createWoodTexture('#7B5B3A', '#5A3F28');
  const bench = new Mesh(new BoxGeometry(2.0, 0.04, 0.4), benchMat);
  bench.position.set(0, 0.45, DEPTH / 2 - 0.5);
  group.add(bench);

  for (const [lx, lz] of [[-0.8, -0.15], [0.8, -0.15], [-0.8, 0.15], [0.8, 0.15]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.02, 0.025, 0.44, 6), benchMat);
    leg.position.set(lx, 0.22, DEPTH / 2 - 0.5 + lz);
    group.add(leg);
  }

  // Coat rack
  const rackMat = createWoodTexture('#5C3D2E', '#3E2A1E');
  const rackPole = new Mesh(new CylinderGeometry(0.03, 0.04, 1.8, 8), rackMat);
  rackPole.position.set(WIDTH / 2 - 0.4, 0.9, DEPTH / 2 - 0.4);
  group.add(rackPole);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const hook = new Mesh(new CylinderGeometry(0.01, 0.01, 0.12, 4), rackMat);
    hook.rotation.set(0, angle, Math.PI / 3);
    hook.position.set(
      WIDTH / 2 - 0.4 + Math.cos(angle) * 0.05, 1.7,
      DEPTH / 2 - 0.4 + Math.sin(angle) * 0.05,
    );
    group.add(hook);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Barber archetype
// ---------------------------------------------------------------------------

export const BarberArchetype: BuildingArchetype = {
  type: 'barber',

  construct(slots: BuildingSlots): Group {
    const building = new Group();
    building.name = 'barber';

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
