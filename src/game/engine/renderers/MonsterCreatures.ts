// MonsterCreatures — Coyote and Rattlesnake enemy constructors
//
// Builds four-legged coyote and segmented rattlesnake from Three.js
// primitives. All deterministic via alea. No scopedRNG('render', 42, rngTick()).
// Scorpion and MineCrawler live in MonsterArachnids.ts.

import * as THREE from 'three';

import { makePRNG } from '../materials/canvasUtils';
import { createFabricTexture } from '../materials/CanvasTextureFactory';
import { createLeatherTexture } from '../materials/CanvasTextureFactory.organic';
import { scopedRNG, rngTick } from '../../lib/prng';

// ---------------------------------------------------------------------------
// Coyote — four-legged chibi animal
// ---------------------------------------------------------------------------

export function buildCoyote(seed: string): THREE.Group {
  const rng = makePRNG(`coyote-${seed}`);
  const root = new THREE.Group();
  root.name = 'enemy_coyote';

  const furMat = createLeatherTexture('#B8860B');
  const darkMat = new THREE.MeshStandardMaterial({ color: '#2D1810', roughness: 0.8 });

  // Elongated body box
  const bodyGeo = new THREE.BoxGeometry(0.35, 0.3, 0.7, 2, 2, 2);
  const body = new THREE.Mesh(bodyGeo, furMat);
  body.position.set(0, 0.4, 0);
  body.name = 'body';
  root.add(body);

  // 4 short cylinder legs
  const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.25, 6);
  const legPositions: [number, number][] = [[-0.12, 0.22], [0.12, 0.22], [-0.12, -0.22], [0.12, -0.22]];
  const legNames = ['leg_fl', 'leg_fr', 'leg_bl', 'leg_br'];
  legPositions.forEach(([x, z], i) => {
    const leg = new THREE.Mesh(legGeo, furMat);
    leg.position.set(x, 0.15, z);
    leg.name = legNames[i];
    root.add(leg);
  });

  // Head — boxy snout
  const headGeo = new THREE.BoxGeometry(0.22, 0.2, 0.22);
  const head = new THREE.Mesh(headGeo, furMat);
  head.position.set(0, 0.55, 0.4);
  head.name = 'head';
  root.add(head);

  // Pointed triangle ears
  const earGeo = new THREE.ConeGeometry(0.05, 0.12, 4);
  const earL = new THREE.Mesh(earGeo, furMat);
  earL.position.set(-0.08, 0.7, 0.38);
  root.add(earL);
  const earR = new THREE.Mesh(earGeo, furMat);
  earR.position.set(0.08, 0.7, 0.38);
  root.add(earR);

  // Glowing amber eye dots
  const eyeMat = new THREE.MeshStandardMaterial({
    color: '#FFB300',
    emissive: '#FFB300',
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.07, 0.58, 0.52);
  root.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.07, 0.58, 0.52);
  root.add(eyeR);

  // Sharp tooth jaw — small white triangles
  const toothMat = new THREE.MeshStandardMaterial({ color: '#F5F5DC', roughness: 0.5 });
  const toothGeo = new THREE.ConeGeometry(0.015, 0.04, 3);
  for (let i = 0; i < 4; i++) {
    const tooth = new THREE.Mesh(toothGeo, toothMat);
    const tx = -0.04 + i * 0.027;
    tooth.position.set(tx, 0.44, 0.5);
    tooth.rotation.x = Math.PI;
    root.add(tooth);
  }

  // Bushy tail — cone shape
  const tailGeo = new THREE.ConeGeometry(0.08, 0.35, 6);
  const tail = new THREE.Mesh(tailGeo, furMat);
  tail.position.set(0, 0.45, -0.45);
  tail.rotation.x = -0.6;
  tail.name = 'tail';
  root.add(tail);

  return root;
}

// ---------------------------------------------------------------------------
// Rattlesnake — segmented body, diamond pattern, forked tongue
// ---------------------------------------------------------------------------

export function buildRattlesnake(seed: string): THREE.Group {
  const rng = makePRNG(`snake-${seed}`);
  const root = new THREE.Group();
  root.name = 'enemy_rattlesnake';

  const segmentCount = 8 + Math.floor(rng() * 4);
  const snakeMat = createFabricTexture('#6B5B3A', 'plain');
  const diamondMat = new THREE.MeshStandardMaterial({ color: '#8B7355', roughness: 0.7 });

  // Segmented body — cylinders decreasing in size with sine-wave placement
  for (let i = 0; i < segmentCount; i++) {
    const t = i / (segmentCount - 1);
    const radius = 0.08 * (1 - t * 0.6); // taper toward tail
    const segGeo = new THREE.CylinderGeometry(radius, radius * 0.95, 0.12, 8);
    const seg = new THREE.Mesh(segGeo, i % 2 === 0 ? snakeMat : diamondMat);
    // Sine wave body curve
    const x = Math.sin(t * Math.PI * 1.5) * 0.15;
    const z = -t * 0.8;
    seg.position.set(x, radius + 0.02, z);
    seg.rotation.x = Math.PI * 0.5;
    seg.rotation.z = Math.sin(t * Math.PI * 1.5) * 0.3;
    seg.name = `seg_${i}`;
    root.add(seg);
  }

  // Triangular head
  const headGeo = new THREE.ConeGeometry(0.1, 0.18, 4);
  const headMat = new THREE.MeshStandardMaterial({ color: '#5C4A2A', roughness: 0.6 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 0.1, 0.12);
  head.rotation.x = Math.PI * 0.5;
  head.name = 'head';
  root.add(head);

  // Glowing eyes on head
  const eyeMat = new THREE.MeshStandardMaterial({
    color: '#FFD700',
    emissive: '#FFD700',
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const eyeGeo = new THREE.SphereGeometry(0.015, 6, 4);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.04, 0.13, 0.2);
  root.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.04, 0.13, 0.2);
  root.add(eyeR);

  // Forked tongue — thin red plane
  const tongueMat = new THREE.MeshStandardMaterial({
    color: '#CC2200',
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const tongueGeo = new THREE.PlaneGeometry(0.01, 0.08);
  const tongueL = new THREE.Mesh(tongueGeo, tongueMat);
  tongueL.position.set(-0.01, 0.1, 0.28);
  tongueL.rotation.y = 0.2;
  tongueL.name = 'tongue_l';
  root.add(tongueL);
  const tongueR = new THREE.Mesh(tongueGeo, tongueMat);
  tongueR.position.set(0.01, 0.1, 0.28);
  tongueR.rotation.y = -0.2;
  tongueR.name = 'tongue_r';
  root.add(tongueR);

  // Rattle tail — stack of tiny spheres
  const rattleMat = new THREE.MeshStandardMaterial({ color: '#C4A76C', roughness: 0.6 });
  const lastT = 1.0;
  const tailX = Math.sin(lastT * Math.PI * 1.5) * 0.15;
  const tailZ = -lastT * 0.8;
  for (let r = 0; r < 4; r++) {
    const rattleGeo = new THREE.SphereGeometry(0.02 - r * 0.003, 6, 4);
    const rattle = new THREE.Mesh(rattleGeo, rattleMat);
    rattle.position.set(tailX, 0.05, tailZ - r * 0.03);
    rattle.name = `rattle_${r}`;
    root.add(rattle);
  }

  return root;
}
