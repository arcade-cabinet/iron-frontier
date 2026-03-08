// Newspaper interior — printing press, paper stacks, writer desks.
// Split from Newspaper.ts to stay under 300 lines per file.

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

// ---------------------------------------------------------------------------
// Printing press
// ---------------------------------------------------------------------------

export function createPrintingPress(): Group {
  const group = new Group();
  const metalMat = createMetalTexture('#3A3A3A');
  const woodMat = createWoodTexture('#4A3422', '#2E1E14');

  // Main frame
  const frame = new Mesh(new BoxGeometry(1.4, 1.2, 0.8), metalMat);
  frame.position.y = 0.6;
  frame.castShadow = true;
  group.add(frame);

  // Press bed
  const bed = new Mesh(new BoxGeometry(1.2, 0.05, 0.7), metalMat);
  bed.position.y = 1.22;
  group.add(bed);

  // Impression cylinder
  const cylinder = new Mesh(new CylinderGeometry(0.15, 0.15, 1.0, 12), metalMat);
  cylinder.rotation.z = Math.PI / 2;
  cylinder.position.set(0, 1.45, 0);
  group.add(cylinder);

  // Ink rollers
  for (let i = 0; i < 2; i++) {
    const roller = new Mesh(new CylinderGeometry(0.06, 0.06, 0.9, 8), metalMat);
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, 1.3, -0.25 + i * 0.5);
    group.add(roller);
  }

  // Platen screw
  const screw = new Mesh(new CylinderGeometry(0.03, 0.03, 0.5, 6), metalMat);
  screw.position.set(0, 1.7, 0);
  group.add(screw);

  // Handle bar and grip
  const handle = new Mesh(new CylinderGeometry(0.025, 0.025, 0.8, 6), woodMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, 1.95, 0);
  group.add(handle);

  const grip = new Mesh(new CylinderGeometry(0.04, 0.04, 0.15, 8), woodMat);
  grip.position.set(0.4, 1.95, 0);
  group.add(grip);

  // Legs
  for (const [lx, lz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]] as const) {
    const leg = new Mesh(new BoxGeometry(0.08, 0.6, 0.08), metalMat);
    leg.position.set(lx, 0.3, lz);
    group.add(leg);
  }

  // Type tray
  const trayMat = createWoodTexture('#5A3D2E', '#3E2A1E');
  const tray = new Mesh(new BoxGeometry(0.8, 0.06, 0.4), trayMat);
  tray.position.set(0.8, 0.8, 0);
  group.add(tray);

  return group;
}

// ---------------------------------------------------------------------------
// Paper stack
// ---------------------------------------------------------------------------

export function createPaperStack(width: number, height: number, depth: number): Group {
  const group = new Group();
  const paperMat = new MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.8 });

  const stack = new Mesh(new BoxGeometry(width, height, depth), paperMat);
  stack.position.y = height / 2;
  stack.castShadow = true;
  group.add(stack);

  const edgeMat = new MeshStandardMaterial({ color: 0xe8d8b8, roughness: 0.9 });
  const layers = Math.floor(height / 0.03);
  for (let i = 0; i < layers; i++) {
    const line = new Mesh(new BoxGeometry(width + 0.002, 0.002, depth + 0.002), edgeMat);
    line.position.y = i * 0.03 + 0.015;
    group.add(line);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Writer desk
// ---------------------------------------------------------------------------

export function createWriterDesk(): Group {
  const group = new Group();
  const deskMat = createWoodTexture('#6B4226', '#4A2E1A');

  const top = new Mesh(new BoxGeometry(1.0, 0.05, 0.6), deskMat);
  top.position.y = 0.73;
  top.castShadow = true;
  group.add(top);

  for (const [lx, lz] of [[-0.42, -0.25], [0.42, -0.25], [-0.42, 0.25], [0.42, 0.25]] as const) {
    const leg = new Mesh(new BoxGeometry(0.05, 0.7, 0.05), deskMat);
    leg.position.set(lx, 0.35, lz);
    group.add(leg);
  }

  // Paper on desk
  const paperMat = new MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.8 });
  const paper = new Mesh(new BoxGeometry(0.22, 0.005, 0.3), paperMat);
  paper.position.set(-0.15, 0.76, 0);
  group.add(paper);

  // Ink well
  const inkMat = new MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.3, metalness: 0.2 });
  const inkWell = new Mesh(new CylinderGeometry(0.03, 0.025, 0.04, 8), inkMat);
  inkWell.position.set(0.25, 0.77, -0.1);
  group.add(inkWell);

  // Pen
  const penMat = createWoodTexture('#3E2418', '#261810');
  const pen = new Mesh(new CylinderGeometry(0.005, 0.005, 0.2, 4), penMat);
  pen.rotation.z = 0.1;
  pen.position.set(0.15, 0.76, 0.05);
  group.add(pen);

  return group;
}
