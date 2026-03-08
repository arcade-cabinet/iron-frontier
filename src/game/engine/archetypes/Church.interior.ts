// Church interior — steeple, cross, arched windows, pews.
// Split from Church.ts to stay under 300 lines per file.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

import {
  createMetalTexture,
  createWoodTexture,
} from '../materials';

import { createWindow } from './BuildingBase.composite';

// ---------------------------------------------------------------------------
// Cross
// ---------------------------------------------------------------------------

export function createCross(height: number): Group {
  const group = new Group();
  const mat = createWoodTexture('#F5E6C8', '#D4C8A8');

  const vertical = new Mesh(new BoxGeometry(0.08, height, 0.06), mat);
  vertical.position.y = height / 2;
  group.add(vertical);

  const horizontal = new Mesh(new BoxGeometry(height * 0.6, 0.08, 0.06), mat);
  horizontal.position.y = height * 0.72;
  group.add(horizontal);

  return group;
}

// ---------------------------------------------------------------------------
// Steeple
// ---------------------------------------------------------------------------

export function createSteeple(steepleBase: number, steepleHeight: number): Group {
  const group = new Group();
  const wallMat = createWoodTexture('#E8DDD0', '#C8BDB0');

  const tower = new Mesh(new BoxGeometry(steepleBase, steepleHeight, steepleBase), wallMat);
  tower.position.y = steepleHeight / 2;
  tower.castShadow = true;
  group.add(tower);

  // Openings in tower
  const openingMat = new MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const opening = new Mesh(new BoxGeometry(0.6, 0.8, 0.05), openingMat);
    const angle = (i / 4) * Math.PI * 2;
    opening.position.set(
      Math.sin(angle) * (steepleBase / 2 + 0.01),
      steepleHeight - 0.8,
      Math.cos(angle) * (steepleBase / 2 + 0.01),
    );
    opening.rotation.y = angle;
    group.add(opening);
  }

  // Pointed spire
  const roofMat = createWoodTexture('#4A3A2A', '#2E2418');
  const spireH = 2.5;
  const spire = new Mesh(new CylinderGeometry(0.05, steepleBase * 0.7, spireH, 4), roofMat);
  spire.position.y = steepleHeight + spireH / 2;
  spire.rotation.y = Math.PI / 4;
  spire.castShadow = true;
  group.add(spire);

  // Bell
  const bellMat = new MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.8 });
  const bell = new Mesh(new SphereGeometry(0.2, 12, 8), bellMat);
  bell.position.y = steepleHeight - 0.5;
  group.add(bell);

  const mount = new Mesh(new CylinderGeometry(0.02, 0.02, 0.8, 6), createMetalTexture('#4A4A4A'));
  mount.rotation.z = Math.PI / 2;
  mount.position.y = steepleHeight - 0.25;
  group.add(mount);

  // Cross on top
  const cross = createCross(0.8);
  cross.position.y = steepleHeight + spireH;
  group.add(cross);

  return group;
}

// ---------------------------------------------------------------------------
// Arched window
// ---------------------------------------------------------------------------

export function createArchedWindow(width: number, height: number): Group {
  const group = new Group();
  const frameMat = createWoodTexture('#E8DDD0', '#C8BDB0');

  const win = createWindow(width, height * 0.7, 2);
  group.add(win);

  const archR = width / 2;
  const arch = new Mesh(new CylinderGeometry(archR, archR, 0.06, 12, 1, false, 0, Math.PI), frameMat);
  arch.rotation.z = Math.PI / 2;
  arch.rotation.y = Math.PI / 2;
  arch.position.y = height * 0.35;
  group.add(arch);

  return group;
}

// ---------------------------------------------------------------------------
// Pew row
// ---------------------------------------------------------------------------

export function createPewRow(width: number): Group {
  const group = new Group();
  const mat = createWoodTexture('#6B4E32', '#4A3422');

  const seat = new Mesh(new BoxGeometry(width, 0.04, 0.35), mat);
  seat.position.y = 0.42;
  group.add(seat);

  const back = new Mesh(new BoxGeometry(width, 0.5, 0.04), mat);
  back.position.set(0, 0.7, -0.15);
  group.add(back);

  for (const x of [-width / 2, width / 2]) {
    const panel = new Mesh(new BoxGeometry(0.04, 0.7, 0.4), mat);
    panel.position.set(x, 0.35, 0);
    group.add(panel);
  }

  const legCount = Math.max(2, Math.floor(width / 1.0));
  for (let i = 0; i < legCount; i++) {
    const x = -width / 2 + 0.2 + (i / (legCount - 1)) * (width - 0.4);
    const leg = new Mesh(new BoxGeometry(0.04, 0.4, 0.04), mat);
    leg.position.set(x, 0.2, 0.1);
    group.add(leg);
  }

  return group;
}
