// Saloon furniture — piano, tables with chairs.
// Split from Saloon.interior.ts to stay under 300 lines per file.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';

import {
  createLeatherTexture,
  createWoodTexture,
} from '../materials';

// ---------------------------------------------------------------------------
// Material palette
// ---------------------------------------------------------------------------

const furnitureWood = () => createWoodTexture('#7B5B3A', '#5A3F28');
const darkWood = () => createWoodTexture('#3E2418', '#261810');

// ---------------------------------------------------------------------------
// Piano
// ---------------------------------------------------------------------------

export function createPiano(): Group {
  const group = new Group();
  const bodyMat = darkWood();
  const whiteMat = new MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.4 });
  const blackMat = new MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });

  // Body
  const body = new Mesh(new BoxGeometry(1.4, 0.9, 0.55), bodyMat);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  // Top lid
  const lid = new Mesh(new BoxGeometry(1.42, 0.04, 0.57), bodyMat);
  lid.position.set(0, 1.16, 0);
  group.add(lid);

  // Back panel (tall)
  const back = new Mesh(new BoxGeometry(1.42, 0.8, 0.06), bodyMat);
  back.position.set(0, 1.55, -0.25);
  group.add(back);

  // Keyboard — white keys
  const keysWidth = 1.2;
  const keyStrip = new Mesh(new BoxGeometry(keysWidth, 0.02, 0.12), whiteMat);
  keyStrip.position.set(0, 1.17, 0.22);
  group.add(keyStrip);

  // Black keys
  const blackKeyCount = 8;
  for (let i = 0; i < blackKeyCount; i++) {
    const x = -keysWidth / 2 + 0.12 + i * (keysWidth / blackKeyCount);
    const key = new Mesh(new BoxGeometry(0.04, 0.025, 0.07), blackMat);
    key.position.set(x, 1.19, 0.19);
    group.add(key);
  }

  // Legs
  const legMat = darkWood();
  const legPositions: [number, number][] = [
    [-0.6, -0.22], [0.6, -0.22], [-0.6, 0.22], [0.6, 0.22],
  ];
  for (const [lx, lz] of legPositions) {
    const leg = new Mesh(new CylinderGeometry(0.04, 0.05, 0.25, 8), legMat);
    leg.position.set(lx, 0.125, lz);
    group.add(leg);
  }

  // Stool
  const stoolSeat = new Mesh(
    new CylinderGeometry(0.18, 0.18, 0.05, 12),
    createLeatherTexture('#6B2222'),
  );
  stoolSeat.position.set(0, 0.55, 0.6);
  group.add(stoolSeat);

  const stoolPedestal = new Mesh(new CylinderGeometry(0.04, 0.06, 0.5, 8), bodyMat);
  stoolPedestal.position.set(0, 0.3, 0.6);
  group.add(stoolPedestal);

  return group;
}

// ---------------------------------------------------------------------------
// Round table with chairs
// ---------------------------------------------------------------------------

export function createTableWithChairs(): Group {
  const group = new Group();
  const tableMat = furnitureWood();

  // Table top
  const tableTop = new Mesh(new CylinderGeometry(0.5, 0.5, 0.04, 16), tableMat);
  tableTop.position.y = 0.76;
  tableTop.castShadow = true;
  group.add(tableTop);

  // Table leg (central pedestal)
  const leg = new Mesh(new CylinderGeometry(0.06, 0.08, 0.74, 8), tableMat);
  leg.position.y = 0.38;
  group.add(leg);

  // Table base
  const base = new Mesh(new CylinderGeometry(0.25, 0.28, 0.04, 8), tableMat);
  base.position.y = 0.02;
  group.add(base);

  // Four chairs
  const chairMat = furnitureWood();
  const seatMat = createLeatherTexture('#5A3020');
  for (let c = 0; c < 4; c++) {
    const angle = (c / 4) * Math.PI * 2;
    const cx = Math.cos(angle) * 0.85;
    const cz = Math.sin(angle) * 0.85;

    const chair = new Group();

    // Seat
    const seat = new Mesh(new BoxGeometry(0.36, 0.04, 0.36), seatMat);
    seat.position.y = 0.46;
    chair.add(seat);

    // Four chair legs
    const off = 0.14;
    for (const [dx, dz] of [[-off, -off], [off, -off], [-off, off], [off, off]]) {
      const cLeg = new Mesh(new CylinderGeometry(0.015, 0.018, 0.44, 6), chairMat);
      cLeg.position.set(dx, 0.22, dz);
      chair.add(cLeg);
    }

    // Back rest
    const backrest = new Mesh(new BoxGeometry(0.34, 0.36, 0.03), chairMat);
    backrest.position.set(0, 0.66, -0.16);
    chair.add(backrest);

    // Two back spindles
    for (const sx of [-0.08, 0.08]) {
      const spindle = new Mesh(new CylinderGeometry(0.012, 0.012, 0.34, 6), chairMat);
      spindle.position.set(sx, 0.66, -0.15);
      chair.add(spindle);
    }

    chair.position.set(cx, 0, cz);
    chair.lookAt(0, 0, 0);
    chair.rotation.x = 0;
    chair.rotation.z = 0;
    group.add(chair);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Staircase + balcony
// ---------------------------------------------------------------------------

export function createStaircase(
  startX: number,
  floorHeight: number,
  stairWidth: number,
): Group {
  const group = new Group();
  const woodMat = furnitureWood();
  const railMat = createWoodTexture('#5C3D2E', '#3E2A1E');

  const stepCount = 10;
  const stepH = floorHeight / stepCount;
  const stepD = 0.3;

  for (let i = 0; i < stepCount; i++) {
    const step = new Mesh(new BoxGeometry(stairWidth, stepH * 0.8, stepD), woodMat);
    step.position.set(startX, stepH * (i + 0.5), -i * stepD);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
  }

  // Railing along outside
  const railLen = Math.sqrt(
    floorHeight * floorHeight + (stepCount * stepD) * (stepCount * stepD),
  );
  const railAngle = Math.atan2(floorHeight, stepCount * stepD);
  const rail = new Mesh(new BoxGeometry(0.05, 0.05, railLen), railMat);
  rail.position.set(
    startX + stairWidth / 2 + 0.04,
    floorHeight / 2 + 0.4,
    -(stepCount * stepD) / 2,
  );
  rail.rotation.x = -railAngle;
  group.add(rail);

  return group;
}

export function createBalcony(
  width: number,
  depth: number,
  floorHeight: number,
): Group {
  const group = new Group();
  const woodMat = furnitureWood();
  const railMat = createWoodTexture('#5C3D2E', '#3E2A1E');

  // Floor
  const floor = new Mesh(new BoxGeometry(width, 0.06, depth), woodMat);
  floor.position.y = floorHeight;
  floor.receiveShadow = true;
  group.add(floor);

  // Support joists
  const joistCount = Math.max(2, Math.floor(width / 1.5));
  for (let i = 0; i < joistCount; i++) {
    const x = -width / 2 + 0.3 + (i / (joistCount - 1)) * (width - 0.6);
    const joist = new Mesh(new BoxGeometry(0.08, 0.15, depth), woodMat);
    joist.position.set(x, floorHeight - 0.1, 0);
    group.add(joist);
  }

  // Railing
  const railing = new Group();
  const railH = 1.0;

  const topRail = new Mesh(new BoxGeometry(width, 0.05, 0.05), railMat);
  topRail.position.set(0, railH, depth / 2);
  railing.add(topRail);

  const bottomRail = new Mesh(new BoxGeometry(width, 0.05, 0.05), railMat);
  bottomRail.position.set(0, 0.15, depth / 2);
  railing.add(bottomRail);

  const balCount = Math.max(4, Math.floor(width / 0.5));
  for (let i = 0; i < balCount; i++) {
    const x = -width / 2 + 0.2 + (i / (balCount - 1)) * (width - 0.4);
    const bal = new Mesh(new BoxGeometry(0.03, railH - 0.15, 0.03), railMat);
    bal.position.set(x, railH / 2 + 0.05, depth / 2);
    railing.add(bal);
  }

  railing.position.y = floorHeight;
  group.add(railing);

  return group;
}
