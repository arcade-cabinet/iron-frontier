// Barber interior — barber chair, mirror, counter, waiting area.
// Split from Barber.ts to stay under 300 lines per file.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';

import {
  createGlassTexture,
  createMetalTexture,
  createWoodTexture,
} from '../materials';

// ---------------------------------------------------------------------------
// Barber chair
// ---------------------------------------------------------------------------

export function createBarberChair(): Group {
  const group = new Group();
  const metalMat = createMetalTexture('#5A5A5A');
  const leatherMat = new MeshStandardMaterial({ color: 0x8b2222, roughness: 0.5 });
  const woodMat = createWoodTexture('#4A3422', '#2E1E14');

  const pedestal = new Mesh(new CylinderGeometry(0.25, 0.3, 0.15, 12), metalMat);
  pedestal.position.y = 0.075;
  group.add(pedestal);

  const column = new Mesh(new CylinderGeometry(0.06, 0.08, 0.35, 8), metalMat);
  column.position.y = 0.325;
  group.add(column);

  const seat = new Mesh(new BoxGeometry(0.5, 0.08, 0.5), leatherMat);
  seat.position.y = 0.54;
  seat.castShadow = true;
  group.add(seat);

  const back = new Mesh(new BoxGeometry(0.48, 0.55, 0.06), leatherMat);
  back.position.set(0, 0.85, -0.22);
  group.add(back);

  const headrest = new Mesh(new BoxGeometry(0.3, 0.15, 0.06), leatherMat);
  headrest.position.set(0, 1.2, -0.22);
  group.add(headrest);

  for (const side of [-1, 1]) {
    const arm = new Mesh(new BoxGeometry(0.06, 0.06, 0.35), woodMat);
    arm.position.set(side * 0.28, 0.7, -0.05);
    group.add(arm);
    const support = new Mesh(new BoxGeometry(0.04, 0.18, 0.04), woodMat);
    support.position.set(side * 0.28, 0.62, -0.2);
    group.add(support);
  }

  const footrest = new Mesh(new BoxGeometry(0.3, 0.04, 0.15), metalMat);
  footrest.position.set(0, 0.25, 0.3);
  group.add(footrest);

  return group;
}

// ---------------------------------------------------------------------------
// Mirror
// ---------------------------------------------------------------------------

export function createMirror(width: number, height: number): Group {
  const group = new Group();
  const frameMat = createWoodTexture('#4A3422', '#2E1E14');
  const frameThick = 0.05;

  for (const [x, y, w, h] of [
    [0, height / 2, width + frameThick * 2, frameThick],
    [0, -height / 2, width + frameThick * 2, frameThick],
    [-width / 2, 0, frameThick, height],
    [width / 2, 0, frameThick, height],
  ] as const) {
    const bar = new Mesh(new BoxGeometry(w, h, 0.06), frameMat);
    bar.position.set(x, y, 0);
    group.add(bar);
  }

  const mirrorMat = new MeshStandardMaterial({
    color: 0xd0d8e0, roughness: 0.05, metalness: 0.9,
  });
  const surface = new Mesh(new PlaneGeometry(width, height), mirrorMat);
  surface.position.z = -0.01;
  group.add(surface);

  return group;
}

// ---------------------------------------------------------------------------
// Supplies counter
// ---------------------------------------------------------------------------

export function createSuppliesCounter(counterWidth: number, depth: number): Group {
  const group = new Group();
  const counterMat = createWoodTexture('#6B4226', '#4A2E1A');
  const counter = new Mesh(new BoxGeometry(counterWidth, 0.04, 0.3), counterMat);
  counter.position.set(0, 1.0, -depth / 2 + 0.2);
  group.add(counter);

  const glassMat = createGlassTexture('#88B8D8');
  for (let i = 0; i < 6; i++) {
    const bottle = new Mesh(new CylinderGeometry(0.02, 0.025, 0.12, 6), glassMat);
    bottle.position.set(-1.0 + i * 0.4, 1.08, -depth / 2 + 0.2);
    group.add(bottle);
  }

  return group;
}
