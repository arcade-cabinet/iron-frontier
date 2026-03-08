// MonsterSupernaturals — Supernatural / spectral enemy constructors
//
// Builds dustDevil, wendigo, and railWraith from Three.js primitives.
// These enemies use transparency, emissives, and eerie visual effects.
// All deterministic via alea. No Math.random().

import * as THREE from 'three';

import { makePRNG } from '../materials/canvasUtils';
import { constructChibi, type ChibiConfig, HEAD_RADIUS, BODY_H, BODY_W, BODY_D } from './ChibiRenderer';
import { paintHollowFace } from './MonsterFaces';

// ---------------------------------------------------------------------------
// Dust Devil — swirling cone with inner emissive core and debris
// ---------------------------------------------------------------------------

export function buildDustDevil(seed: string): THREE.Group {
  const rng = makePRNG(`dustdevil-${seed}`);
  const root = new THREE.Group();
  root.name = 'enemy_dustDevil';

  // Outer swirling cone — transparent
  const coneMat = new THREE.MeshStandardMaterial({
    color: '#C4A76C',
    transparent: true,
    opacity: 0.25,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const coneGeo = new THREE.ConeGeometry(0.5, 1.8, 16, 1, true);
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(0, 0.9, 0);
  cone.name = 'vortex';
  root.add(cone);

  // Second inner cone layer for depth
  const innerConeMat = new THREE.MeshStandardMaterial({
    color: '#A08050',
    transparent: true,
    opacity: 0.15,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const innerConeGeo = new THREE.ConeGeometry(0.35, 1.5, 12, 1, true);
  const innerCone = new THREE.Mesh(innerConeGeo, innerConeMat);
  innerCone.position.set(0, 0.85, 0);
  innerCone.rotation.y = Math.PI * 0.3;
  root.add(innerCone);

  // Inner particle core — emissive sphere
  const coreMat = new THREE.MeshStandardMaterial({
    color: '#FFD700',
    emissive: '#FF8C00',
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const coreGeo = new THREE.SphereGeometry(0.1, 8, 6);
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 0.8, 0);
  core.name = 'core';
  root.add(core);

  // Debris orbiting — small box instances
  const debrisMat = new THREE.MeshStandardMaterial({ color: '#6B5B3A', roughness: 0.8 });
  const debrisGroup = new THREE.Group();
  debrisGroup.name = 'debris';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 0.2 + rng() * 0.15;
    const y = 0.3 + rng() * 1.2;
    const size = 0.02 + rng() * 0.04;
    const debrisGeo = new THREE.BoxGeometry(size, size, size);
    const debris = new THREE.Mesh(debrisGeo, debrisMat);
    debris.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    );
    debris.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    debris.name = `debris_${i}`;
    debrisGroup.add(debris);
  }
  root.add(debrisGroup);

  // Eye-like glow spots (two small emissives in upper cone)
  const eyeMat = new THREE.MeshStandardMaterial({
    color: '#FF4400',
    emissive: '#FF4400',
    emissiveIntensity: 1.0,
    roughness: 0.1,
  });
  const eyeGeo = new THREE.SphereGeometry(0.03, 6, 4);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.06, 1.2, 0.08);
  root.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.06, 1.2, 0.08);
  root.add(eyeR);

  return root;
}

// ---------------------------------------------------------------------------
// Wendigo — elongated chibi, antlers, hollow eyes, frost, tattered fabric
// ---------------------------------------------------------------------------

export function buildWendigo(seed: string): THREE.Group {
  const config: ChibiConfig = {
    skinTone: '#D8CFC0',
    hairColor: '#2A2A2A',
    hairStyle: 'bald',
    hatType: 'none',
    hatColor: '#000000',
    clothingColor: '#3A3030',
    clothingType: 'shirt',
    expression: 'angry',
  };

  const root = constructChibi(config);
  root.name = 'enemy_wendigo';

  // Elongated proportions — 2x height, thin
  root.scale.set(0.7, 2.0, 0.7);

  // Replace face with hollow-eyed version
  const head = root.getObjectByName('head') as THREE.Group | undefined;
  if (head) {
    const existingFace = head.children.find(
      (c) => c instanceof THREE.Mesh && (c as THREE.Mesh).geometry instanceof THREE.PlaneGeometry,
    );
    if (existingFace) head.remove(existingFace);

    const hollowTex = paintHollowFace('#D8CFC0');
    const faceMat = new THREE.MeshStandardMaterial({
      map: hollowTex,
      transparent: true,
      roughness: 0.6,
    });
    const faceGeo = new THREE.PlaneGeometry(HEAD_RADIUS * 1.0, HEAD_RADIUS * 1.0);
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, -HEAD_RADIUS * 0.05, HEAD_RADIUS * 0.92);
    head.add(faceMesh);

    // Antler branches — forking cylinders
    const antlerMat = new THREE.MeshStandardMaterial({ color: '#4A3A2A', roughness: 0.7 });
    buildAntler(head, antlerMat, -1); // left
    buildAntler(head, antlerMat, 1);  // right
  }

  // Tattered fabric strips hanging from body
  const bodyY = 0.1 + 0.35 + BODY_H * 0.5;
  const tatMat = new THREE.MeshStandardMaterial({
    color: '#3A3030',
    roughness: 0.9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const rng = makePRNG(`wendigo-tatter-${seed}`);
  for (let i = 0; i < 5; i++) {
    const stripW = 0.04 + rng() * 0.06;
    const stripH = 0.15 + rng() * 0.2;
    const stripGeo = new THREE.PlaneGeometry(stripW, stripH);
    const strip = new THREE.Mesh(stripGeo, tatMat);
    const angle = (i / 5) * Math.PI * 2;
    strip.position.set(
      Math.cos(angle) * BODY_W * 0.35,
      bodyY - BODY_H * 0.4 - rng() * 0.1,
      Math.sin(angle) * BODY_D * 0.4,
    );
    strip.rotation.y = angle;
    strip.rotation.x = rng() * 0.3;
    root.add(strip);
  }

  // Frost particle effect — small emissive spheres scattered
  const frostMat = new THREE.MeshStandardMaterial({
    color: '#B0D4E8',
    emissive: '#88BBDD',
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.5,
  });
  const frostGeo = new THREE.SphereGeometry(0.015, 4, 4);
  for (let i = 0; i < 6; i++) {
    const frost = new THREE.Mesh(frostGeo, frostMat);
    frost.position.set(
      (rng() - 0.5) * 0.5,
      0.3 + rng() * 1.2,
      (rng() - 0.5) * 0.3,
    );
    frost.name = `frost_${i}`;
    root.add(frost);
  }

  return root;
}

/** Build one antler (left or right) on the head group. */
function buildAntler(
  head: THREE.Group,
  mat: THREE.MeshStandardMaterial,
  side: -1 | 1,
): void {
  // Main trunk
  const trunkGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.2, 6);
  const trunk = new THREE.Mesh(trunkGeo, mat);
  trunk.position.set(side * HEAD_RADIUS * 0.6, HEAD_RADIUS * 0.7, -HEAD_RADIUS * 0.1);
  trunk.rotation.z = side * -0.3;
  head.add(trunk);

  // First branch
  const branchGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.12, 5);
  const branch1 = new THREE.Mesh(branchGeo, mat);
  branch1.position.set(side * HEAD_RADIUS * 0.75, HEAD_RADIUS * 0.9, -HEAD_RADIUS * 0.05);
  branch1.rotation.z = side * -0.8;
  head.add(branch1);

  // Second branch (higher)
  const branch2 = new THREE.Mesh(branchGeo.clone(), mat);
  branch2.position.set(side * HEAD_RADIUS * 0.55, HEAD_RADIUS * 1.0, -HEAD_RADIUS * 0.2);
  branch2.rotation.z = side * -0.5;
  branch2.rotation.x = -0.3;
  head.add(branch2);

  // Tip tine
  const tineGeo = new THREE.ConeGeometry(0.008, 0.06, 4);
  const tine = new THREE.Mesh(tineGeo, mat);
  tine.position.set(side * HEAD_RADIUS * 0.65, HEAD_RADIUS * 1.1, -HEAD_RADIUS * 0.15);
  tine.rotation.z = side * -0.2;
  head.add(tine);
}
