// MonsterArachnids — Scorpion and MineCrawler enemy constructors
//
// Split from MonsterCreatures to stay under 300 lines per file.
// Builds multi-legged arachnid / arthropod enemies from Three.js primitives.
// All deterministic via alea. No scopedRNG('render', 42, rngTick()).

import * as THREE from 'three';
import { scopedRNG, rngTick } from '../../lib/prng';

// ---------------------------------------------------------------------------
// Scorpion — flattened body, 8 legs, pincers, arching tail with stinger
// ---------------------------------------------------------------------------

export function buildScorpion(seed: string): THREE.Group {
  const root = new THREE.Group();
  root.name = 'enemy_scorpion';

  const shellMat = new THREE.MeshStandardMaterial({ color: '#4A3728', roughness: 0.6, metalness: 0.1 });
  const legMat = new THREE.MeshStandardMaterial({ color: '#5C4A38', roughness: 0.7 });
  const stingerMat = new THREE.MeshStandardMaterial({
    color: '#8B0000',
    emissive: '#440000',
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });

  // Flattened sphere body
  const bodyGeo = new THREE.SphereGeometry(0.2, 10, 8);
  bodyGeo.scale(1.3, 0.5, 1);
  const body = new THREE.Mesh(bodyGeo, shellMat);
  body.position.set(0, 0.15, 0);
  body.name = 'body';
  root.add(body);

  // 8 thin cylinder legs (4 per side)
  const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.2, 4);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeo, legMat);
      const zOff = -0.12 + i * 0.08;
      leg.position.set(side * 0.22, 0.08, zOff);
      leg.rotation.z = side * 0.6;
      leg.name = `leg_${side > 0 ? 'r' : 'l'}${i}`;
      root.add(leg);
    }
  }

  // Two large pincer claws — curved cones
  const pincerGeo = new THREE.ConeGeometry(0.06, 0.18, 6);
  const pincerL = new THREE.Mesh(pincerGeo, shellMat);
  pincerL.position.set(-0.2, 0.18, 0.25);
  pincerL.rotation.z = 0.4;
  pincerL.rotation.x = -0.3;
  pincerL.name = 'pincer_l';
  root.add(pincerL);
  const pincerR = new THREE.Mesh(pincerGeo.clone(), shellMat);
  pincerR.position.set(0.2, 0.18, 0.25);
  pincerR.rotation.z = -0.4;
  pincerR.rotation.x = -0.3;
  pincerR.name = 'pincer_r';
  root.add(pincerR);

  // Inner pincer tips
  const tipGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
  const tipL = new THREE.Mesh(tipGeo, shellMat);
  tipL.position.set(-0.15, 0.2, 0.35);
  tipL.rotation.z = -0.3;
  tipL.rotation.x = -0.5;
  root.add(tipL);
  const tipR = new THREE.Mesh(tipGeo.clone(), shellMat);
  tipR.position.set(0.15, 0.2, 0.35);
  tipR.rotation.z = 0.3;
  tipR.rotation.x = -0.5;
  root.add(tipR);

  // Segmented tail arching over body
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  const tailSegGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.1, 6);
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(tailSegGeo, shellMat);
    const angle = (i / 4) * Math.PI * 0.7;
    const x = 0;
    const y = 0.15 + Math.sin(angle) * 0.15 * (i + 1) * 0.3;
    const z = -0.15 - Math.cos(angle) * 0.08 * i;
    seg.position.set(x, y, z);
    seg.rotation.x = angle * 0.6;
    seg.name = `tail_seg_${i}`;
    tailGroup.add(seg);
  }

  // Stinger at tail tip
  const stingerGeo = new THREE.ConeGeometry(0.025, 0.08, 4);
  const stinger = new THREE.Mesh(stingerGeo, stingerMat);
  stinger.position.set(0, 0.6, -0.4);
  stinger.rotation.x = -0.8;
  stinger.name = 'stinger';
  tailGroup.add(stinger);

  root.add(tailGroup);

  return root;
}

// ---------------------------------------------------------------------------
// MineCrawler — spider-like dome body, 6 legs, headlamp, mandibles
// ---------------------------------------------------------------------------

export function buildMineCrawler(seed: string): THREE.Group {
  const root = new THREE.Group();
  root.name = 'enemy_mineCrawler';

  const shellMat = new THREE.MeshStandardMaterial({ color: '#2A2A2A', roughness: 0.7, metalness: 0.2 });
  const legMat = new THREE.MeshStandardMaterial({ color: '#3A3A3A', roughness: 0.6, metalness: 0.3 });

  // Dome body — half sphere
  const domeGeo = new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const dome = new THREE.Mesh(domeGeo, shellMat);
  dome.position.set(0, 0.2, 0);
  dome.name = 'body';
  root.add(dome);

  // Flat underside
  const baseGeo = new THREE.CircleGeometry(0.25, 12);
  const baseMat = new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, 0.2, 0);
  base.rotation.x = -Math.PI * 0.5;
  root.add(base);

  // 6 jointed cylinder legs (3 per side)
  const upperLegGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.2, 6);
  const lowerLegGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.18, 6);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const angle = (-0.3 + i * 0.3) * Math.PI;
      // Upper segment
      const upper = new THREE.Mesh(upperLegGeo, legMat);
      const ux = side * (0.2 + Math.abs(Math.sin(angle)) * 0.08);
      const uz = Math.cos(angle) * 0.15;
      upper.position.set(ux, 0.22, uz);
      upper.rotation.z = side * 0.8;
      upper.name = `leg_upper_${side > 0 ? 'r' : 'l'}${i}`;
      root.add(upper);

      // Lower segment (angled down from upper)
      const lower = new THREE.Mesh(lowerLegGeo, legMat);
      lower.position.set(ux + side * 0.12, 0.08, uz);
      lower.rotation.z = side * 0.3;
      lower.name = `leg_lower_${side > 0 ? 'r' : 'l'}${i}`;
      root.add(lower);
    }
  }

  // Single headlamp eye — emissive sphere
  const eyeMat = new THREE.MeshStandardMaterial({
    color: '#FFEE88',
    emissive: '#FFEE88',
    emissiveIntensity: 1.0,
    roughness: 0.1,
  });
  const eyeGeo = new THREE.SphereGeometry(0.05, 8, 6);
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(0, 0.32, 0.2);
  eye.name = 'eye';
  root.add(eye);

  // Dripping mandibles — small cones
  const mandibleMat = new THREE.MeshStandardMaterial({ color: '#4A3A2A', roughness: 0.6 });
  const mandibleGeo = new THREE.ConeGeometry(0.025, 0.08, 4);
  const mandL = new THREE.Mesh(mandibleGeo, mandibleMat);
  mandL.position.set(-0.06, 0.15, 0.22);
  mandL.rotation.x = 0.3;
  mandL.name = 'mandible_l';
  root.add(mandL);
  const mandR = new THREE.Mesh(mandibleGeo.clone(), mandibleMat);
  mandR.position.set(0.06, 0.15, 0.22);
  mandR.rotation.x = 0.3;
  mandR.name = 'mandible_r';
  root.add(mandR);

  // Drip blobs on mandibles
  const dripMat = new THREE.MeshStandardMaterial({
    color: '#88CC44',
    emissive: '#446622',
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.7,
  });
  const dripGeo = new THREE.SphereGeometry(0.012, 4, 4);
  const dripL = new THREE.Mesh(dripGeo, dripMat);
  dripL.position.set(-0.06, 0.1, 0.24);
  root.add(dripL);
  const dripR = new THREE.Mesh(dripGeo, dripMat);
  dripR.position.set(0.06, 0.1, 0.24);
  root.add(dripR);

  return root;
}
