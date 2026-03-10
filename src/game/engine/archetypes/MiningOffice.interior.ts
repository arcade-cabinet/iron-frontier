// MiningOffice interior — scale, ore samples, mine maps.
// Split from MiningOffice.ts to stay under 300 lines per file.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
} from 'three';

import {
  createMetalTexture,
  createStoneTexture,
} from '../materials';

// ---------------------------------------------------------------------------
// Scale
// ---------------------------------------------------------------------------

export function createScale(): Group {
  const group = new Group();
  const metalMat = createMetalTexture('#B8860B');
  const darkMetal = createMetalTexture('#4A4A4A');

  const base = new Mesh(new BoxGeometry(0.3, 0.04, 0.15), darkMetal);
  group.add(base);

  const post = new Mesh(new CylinderGeometry(0.015, 0.02, 0.3, 6), metalMat);
  post.position.y = 0.17;
  group.add(post);

  const beam = new Mesh(new BoxGeometry(0.35, 0.015, 0.02), metalMat);
  beam.position.y = 0.32;
  group.add(beam);

  for (const x of [-0.15, 0.15]) {
    const chain = new Mesh(new CylinderGeometry(0.003, 0.003, 0.1, 4), darkMetal);
    chain.position.set(x, 0.27, 0);
    group.add(chain);

    const pan = new Mesh(new CylinderGeometry(0.06, 0.06, 0.01, 10), metalMat);
    pan.position.set(x, 0.22, 0);
    group.add(pan);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Ore samples
// ---------------------------------------------------------------------------

export function createOreSamples(): Group {
  const group = new Group();
  const rockMat = createStoneTexture('#6B6060', '#4A4040');
  const oreMat = new MeshStandardMaterial({ color: 0xb8860b, roughness: 0.5, metalness: 0.4 });

  for (let i = 0; i < 5; i++) {
    const size = 0.04 + (i % 3) * 0.02;
    const rock = new Mesh(new SphereGeometry(size, 6, 5), i % 2 === 0 ? rockMat : oreMat);
    rock.position.set((i - 2) * 0.12, size, 0);
    rock.scale.set(1, 0.7, 0.9);
    group.add(rock);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Mine map (plane on wall)
// ---------------------------------------------------------------------------

export function createMineMap(): Group {
  const group = new Group();
  const paperMat = new MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.8 });
  const lineMat = new MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });

  const map = new Mesh(new PlaneGeometry(0.8, 0.6), paperMat);
  group.add(map);

  const lines: [number, number, number, number, number][] = [
    [0, 0.1, 0.5, 0.01, 0],
    [-0.1, 0, 0.01, 0.3, 0],
    [0.1, -0.05, 0.35, 0.01, 0.3],
    [-0.2, -0.1, 0.01, 0.2, 0],
    [0.15, 0.15, 0.2, 0.01, -0.2],
  ];
  for (const [x, y, w, h, rot] of lines) {
    const line = new Mesh(new PlaneGeometry(w, h), lineMat);
    line.position.set(x, y, 0.001);
    line.rotation.z = rot;
    group.add(line);
  }

  return group;
}
