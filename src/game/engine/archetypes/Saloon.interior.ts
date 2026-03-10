// Saloon interior — bar counter and bottle shelf.
// Furniture (piano, tables, staircase, balcony) lives in Saloon.furniture.ts.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
} from 'three';

import {
  createGlassTexture,
  createMetalTexture,
  createWoodTexture,
} from '../materials';

// Re-export furniture builders so Saloon.ts has a single import source
export {
  createBalcony,
  createPiano,
  createStaircase,
  createTableWithChairs,
} from './Saloon.furniture';

// ---------------------------------------------------------------------------
// Bar counter
// ---------------------------------------------------------------------------

export function createBarCounter(barWidth: number, buildingDepth: number): Group {
  const group = new Group();
  const mat = createWoodTexture('#6B4226', '#4A2E1A');

  // Main bar counter — positioned along back wall
  const counterH = 1.1;
  const counterD = 0.6;
  const counter = new Mesh(new BoxGeometry(barWidth, counterH, counterD), mat);
  counter.position.set(0, counterH / 2, -buildingDepth / 2 + counterD / 2 + 0.3);
  counter.castShadow = true;
  counter.receiveShadow = true;
  group.add(counter);

  // Bar top surface (slightly wider, polished)
  const topMat = createWoodTexture('#5A3A1E', '#3E2812');
  const top = new Mesh(new BoxGeometry(barWidth + 0.1, 0.06, counterD + 0.15), topMat);
  top.position.set(0, counterH + 0.03, -buildingDepth / 2 + counterD / 2 + 0.3);
  group.add(top);

  // Foot rail (brass)
  const brassMat = createMetalTexture('#B8860B');
  const footRail = new Mesh(
    new CylinderGeometry(0.025, 0.025, barWidth - 0.2, 8),
    brassMat,
  );
  footRail.rotation.z = Math.PI / 2;
  footRail.position.set(0, 0.2, -buildingDepth / 2 + counterD + 0.4);
  group.add(footRail);

  return group;
}

// ---------------------------------------------------------------------------
// Bottle shelf behind bar
// ---------------------------------------------------------------------------

export function createBottleShelf(barWidth: number, buildingDepth: number): Group {
  const group = new Group();
  const shelfMat = createWoodTexture('#3E2418', '#261810');
  const amberGlass = createGlassTexture('#E8D8A0');
  const greenGlass = createGlassTexture('#88B888');

  const backZ = -buildingDepth / 2 + 0.15;

  // Back board
  const backBoard = new Mesh(new BoxGeometry(barWidth * 0.7, 2.0, 0.06), shelfMat);
  backBoard.position.set(0, 2.0, backZ);
  group.add(backBoard);

  // Three shelf planks with bottles
  for (let row = 0; row < 3; row++) {
    const shelfY = 1.2 + row * 0.55;
    const shelf = new Mesh(new BoxGeometry(barWidth * 0.7, 0.04, 0.2), shelfMat);
    shelf.position.set(0, shelfY, backZ + 0.1);
    group.add(shelf);

    // Bottles on each shelf
    const bottleCount = Math.floor(barWidth * 0.7 / 0.15);
    for (let b = 0; b < bottleCount; b++) {
      const bx = -barWidth * 0.35 + 0.1 + b * 0.15;
      const bottleH = 0.22 + (b % 3) * 0.04;
      const bottleR = 0.025 + (b % 2) * 0.008;
      const glassMat = b % 3 === 0 ? greenGlass : amberGlass;

      const bottle = new Mesh(
        new CylinderGeometry(bottleR, bottleR * 1.1, bottleH, 6),
        glassMat,
      );
      bottle.position.set(bx, shelfY + 0.02 + bottleH / 2, backZ + 0.1);
      group.add(bottle);

      // Bottle neck
      const neck = new Mesh(
        new CylinderGeometry(bottleR * 0.4, bottleR * 0.7, 0.06, 6),
        glassMat,
      );
      neck.position.set(bx, shelfY + 0.02 + bottleH + 0.03, backZ + 0.1);
      group.add(neck);
    }
  }

  return group;
}
