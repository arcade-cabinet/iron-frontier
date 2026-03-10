// MonsterGhostly — Rail Wraith enemy constructor
//
// Split from MonsterSupernaturals to stay under 300 lines per file.
// Ghostly chibi with transparent materials, spectral lantern, and chains.
// Deterministic via alea. No scopedRNG('render', 42, rngTick()).

import * as THREE from 'three';

import { makePRNG } from '../materials/canvasUtils';
import { constructChibi, type ChibiConfig, BODY_H, BODY_W } from './ChibiRenderer';
import { scopedRNG, rngTick } from '../../lib/prng';

// ---------------------------------------------------------------------------
// Rail Wraith — ghostly chibi, transparent, lantern, chains
// ---------------------------------------------------------------------------

export function buildRailWraith(seed: string): THREE.Group {
  const config: ChibiConfig = {
    skinTone: '#8899AA',
    hairColor: '#4A4A5A',
    hairStyle: 'long',
    hatType: 'none',
    hatColor: '#000000',
    clothingColor: '#445566',
    clothingType: 'duster',
    expression: 'sad',
  };

  const root = constructChibi(config);
  root.name = 'enemy_railWraith';

  // Make everything semi-transparent
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat.isMeshStandardMaterial) {
        child.material = mat.clone();
        (child.material as THREE.MeshStandardMaterial).transparent = true;
        (child.material as THREE.MeshStandardMaterial).opacity = 0.4;
      }
    }
  });

  // Glowing lantern in right hand
  const lanternGroup = new THREE.Group();
  lanternGroup.name = 'lantern';

  // Lantern cage
  const cageMat = new THREE.MeshStandardMaterial({
    color: '#444444',
    roughness: 0.4,
    metalness: 0.6,
    transparent: true,
    opacity: 0.5,
  });
  const cageGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6, 1, true);
  const cage = new THREE.Mesh(cageGeo, cageMat);
  lanternGroup.add(cage);

  // Lantern top and bottom caps
  const capGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 6);
  const capTop = new THREE.Mesh(capGeo, cageMat);
  capTop.position.y = 0.05;
  lanternGroup.add(capTop);
  const capBot = new THREE.Mesh(capGeo.clone(), cageMat);
  capBot.position.y = -0.05;
  lanternGroup.add(capBot);

  // Glowing flame inside
  const flameMat = new THREE.MeshStandardMaterial({
    color: '#44CCFF',
    emissive: '#22AADD',
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.8,
  });
  const flameGeo = new THREE.SphereGeometry(0.025, 6, 6);
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.name = 'flame';
  lanternGroup.add(flame);

  // Position at right arm tip
  const armY = 0.1 + 0.35 + BODY_H * 0.5 + BODY_H * 0.35;
  const armOffsetX = BODY_W * 0.5 + 0.08;
  lanternGroup.position.set(armOffsetX + 0.05, armY - 0.35, 0.05);
  root.add(lanternGroup);

  // Chain links around body — small torus instances
  const chainMat = new THREE.MeshStandardMaterial({
    color: '#666677',
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 0.5,
  });
  const chainGeo = new THREE.TorusGeometry(0.03, 0.008, 6, 8);
  const bodyY = 0.1 + 0.35 + BODY_H * 0.5;
  const rng = makePRNG(`wraith-chains-${seed}`);
  for (let i = 0; i < 8; i++) {
    const chain = new THREE.Mesh(chainGeo, chainMat);
    const angle = (i / 8) * Math.PI * 2 + rng() * 0.3;
    const radius = BODY_W * 0.38 + rng() * 0.05;
    const yOff = bodyY + (rng() - 0.5) * BODY_H * 0.6;
    chain.position.set(
      Math.cos(angle) * radius,
      yOff,
      Math.sin(angle) * radius,
    );
    chain.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    chain.name = `chain_${i}`;
    root.add(chain);
  }

  return root;
}
