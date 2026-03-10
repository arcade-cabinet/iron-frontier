// Blacksmith interior — forge, anvil, chimney, horseshoes.
// Split from Blacksmith.ts to stay under 300 lines per file.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
} from 'three';

import {
  createMetalTexture,
  createRustTexture,
  createStoneTexture,
  createWoodTexture,
} from '../materials';

// ---------------------------------------------------------------------------
// Anvil
// ---------------------------------------------------------------------------

export function createAnvil(): Group {
  const group = new Group();
  const mat = createMetalTexture('#2A2A2A');

  const stump = new Mesh(
    new CylinderGeometry(0.3, 0.35, 0.6, 8),
    createWoodTexture('#4A3422', '#2E1E14'),
  );
  stump.position.y = 0.3;
  stump.castShadow = true;
  group.add(stump);

  const body = new Mesh(new BoxGeometry(0.5, 0.2, 0.25), mat);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  const horn = new Mesh(new CylinderGeometry(0.02, 0.08, 0.25, 8), mat);
  horn.rotation.z = Math.PI / 2;
  horn.position.set(0.35, 0.72, 0);
  group.add(horn);

  const heel = new Mesh(new BoxGeometry(0.12, 0.15, 0.2), mat);
  heel.position.set(-0.28, 0.65, 0);
  group.add(heel);

  return group;
}

// ---------------------------------------------------------------------------
// Forge
// ---------------------------------------------------------------------------

export function createForge(): Group {
  const group = new Group();
  const stoneMat = createStoneTexture('#6B6060', '#4A4040');
  const metalMat = createMetalTexture('#3A3A3A');
  const bellowsMat = createWoodTexture('#5A3D2E', '#3E2A1E');

  const base = new Mesh(new BoxGeometry(1.2, 0.8, 0.9), stoneMat);
  base.position.y = 0.4;
  base.castShadow = true;
  group.add(base);

  const pit = new Mesh(new BoxGeometry(0.6, 0.3, 0.5), new MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.9 }));
  pit.position.set(0, 0.85, 0);
  group.add(pit);

  const bellowsTop = new Mesh(new BoxGeometry(0.4, 0.04, 0.3), bellowsMat);
  bellowsTop.position.set(-0.8, 0.7, 0);
  group.add(bellowsTop);

  const bellowsBot = new Mesh(new BoxGeometry(0.4, 0.04, 0.3), bellowsMat);
  bellowsBot.position.set(-0.8, 0.6, 0);
  group.add(bellowsBot);

  const nozzle = new Mesh(new CylinderGeometry(0.03, 0.03, 0.2, 6), metalMat);
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.set(-0.5, 0.65, 0);
  group.add(nozzle);

  const fireLight = new PointLight(0xff4400, 0.8, 4);
  fireLight.position.set(0, 1.0, 0);
  group.add(fireLight);

  return group;
}

// ---------------------------------------------------------------------------
// Chimney
// ---------------------------------------------------------------------------

export function createChimney(height: number): Group {
  const group = new Group();
  const stoneMat = createStoneTexture('#5A5050', '#3A3535');

  const stack = new Mesh(new BoxGeometry(0.8, height, 0.8), stoneMat);
  stack.position.y = height / 2;
  stack.castShadow = true;
  group.add(stack);

  const cap = new Mesh(new BoxGeometry(0.9, 0.1, 0.9), stoneMat);
  cap.position.y = height;
  group.add(cap);

  return group;
}

// ---------------------------------------------------------------------------
// Horseshoe
// ---------------------------------------------------------------------------

export function createHorseshoe(): Group {
  const group = new Group();
  const mat = createRustTexture('#6B5040');

  const left = new Mesh(new BoxGeometry(0.02, 0.1, 0.02), mat);
  left.position.set(-0.035, 0, 0);
  group.add(left);

  const right = new Mesh(new BoxGeometry(0.02, 0.1, 0.02), mat);
  right.position.set(0.035, 0, 0);
  group.add(right);

  const bottom = new Mesh(new BoxGeometry(0.09, 0.02, 0.02), mat);
  bottom.position.set(0, -0.04, 0);
  group.add(bottom);

  return group;
}
