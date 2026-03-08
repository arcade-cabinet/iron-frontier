// MonsterFactory — Constructs enemy meshes from Three.js primitives
//
// Extends the chibi humanoid style to enemies with exaggerated, menacing
// features. Each enemy type is instantly recognizable and visually distinctive.
// No GLBs, no Math.random() — alea for any variation.

import * as THREE from 'three';

import { constructChibi, type ChibiConfig, HEAD_RADIUS, BODY_W, BODY_H, BODY_D } from './ChibiRenderer';
import { buildCoyote, buildRattlesnake } from './MonsterCreatures';
import { buildScorpion, buildMineCrawler } from './MonsterArachnids';
import { buildDustDevil, buildWendigo } from './MonsterSupernaturals';
import { buildRailWraith } from './MonsterGhostly';
import { buildClockworkAutomaton } from './MonsterMechanicals';
import { paintScarredFace } from './MonsterFaces';
import { makePRNG } from '../materials/canvasUtils';
import { createFabricTexture, createMetalTexture } from '../materials/CanvasTextureFactory';
import { createLeatherTexture } from '../materials/CanvasTextureFactory.organic';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EnemyType =
  | 'outlaw'
  | 'coyote'
  | 'rattlesnake'
  | 'scorpion'
  | 'banditBoss'
  | 'mineCrawler'
  | 'dustDevil'
  | 'clockworkAutomaton'
  | 'wendigo'
  | 'railWraith';

// ---------------------------------------------------------------------------
// Main factory
// ---------------------------------------------------------------------------

/**
 * Build an enemy mesh group for the given type.
 * The group origin sits at the enemy's feet (ground level).
 * Seed drives any visual variation (scars, color shifts, etc.).
 */
export function constructEnemy(type: EnemyType, seed: string): THREE.Group {
  switch (type) {
    case 'outlaw':
      return buildOutlaw(seed);
    case 'coyote':
      return buildCoyote(seed);
    case 'rattlesnake':
      return buildRattlesnake(seed);
    case 'scorpion':
      return buildScorpion(seed);
    case 'banditBoss':
      return buildBanditBoss(seed);
    case 'mineCrawler':
      return buildMineCrawler(seed);
    case 'dustDevil':
      return buildDustDevil(seed);
    case 'clockworkAutomaton':
      return buildClockworkAutomaton(seed);
    case 'wendigo':
      return buildWendigo(seed);
    case 'railWraith':
      return buildRailWraith(seed);
  }
}

// ---------------------------------------------------------------------------
// Outlaw — chibi with black duster, bandana mask, dual holsters, scars
// ---------------------------------------------------------------------------

function buildOutlaw(seed: string): THREE.Group {
  const config: ChibiConfig = {
    skinTone: '#C4956A',
    hairColor: '#1A1A1A',
    hairStyle: 'short',
    hatType: 'cowboy',
    hatColor: '#1A1210',
    clothingColor: '#1A1A1A',
    clothingType: 'duster',
    accessory: 'holster',
    expression: 'angry',
  };

  const root = constructChibi(config);
  root.name = 'enemy_outlaw';

  // Replace face with scarred + bandana version
  const head = root.getObjectByName('head') as THREE.Group | undefined;
  if (head) {
    // Remove existing face plane and replace with scarred one
    const existingFace = head.children.find(
      (c) => c instanceof THREE.Mesh && (c as THREE.Mesh).geometry instanceof THREE.PlaneGeometry,
    );
    if (existingFace) head.remove(existingFace);

    const scarTex = paintScarredFace('#C4956A', seed);
    const faceMat = new THREE.MeshStandardMaterial({
      map: scarTex,
      transparent: true,
      roughness: 0.6,
    });
    const faceGeo = new THREE.PlaneGeometry(HEAD_RADIUS * 1.0, HEAD_RADIUS * 1.0);
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, -HEAD_RADIUS * 0.05, HEAD_RADIUS * 0.92);
    head.add(faceMesh);

    // Bandana mask — flat box across lower face
    const bandanaMat = createFabricTexture('#2D0A0A', 'plain');
    const bandanaGeo = new THREE.BoxGeometry(HEAD_RADIUS * 1.6, HEAD_RADIUS * 0.4, HEAD_RADIUS * 0.2);
    const bandana = new THREE.Mesh(bandanaGeo, bandanaMat);
    bandana.position.set(0, -HEAD_RADIUS * 0.2, HEAD_RADIUS * 0.6);
    head.add(bandana);
  }

  // Second holster on the left side
  const bodyY = 0.1 + 0.35 + BODY_H * 0.5;
  const armOffsetX = BODY_W * 0.5 + 0.08;
  const holsterMat = createLeatherTexture('#3D2314');
  const holsterGeo = new THREE.BoxGeometry(0.08, 0.12, 0.06);
  const holsterL = new THREE.Mesh(holsterGeo, holsterMat);
  holsterL.position.set(-(armOffsetX - 0.05), bodyY - BODY_H * 0.35, 0.05);
  root.add(holsterL);

  return root;
}

// ---------------------------------------------------------------------------
// Bandit Boss — 1.5x chibi, scarred, trophy belt, big hat, dual revolvers
// ---------------------------------------------------------------------------

function buildBanditBoss(seed: string): THREE.Group {
  const config: ChibiConfig = {
    skinTone: '#A0724E',
    hairColor: '#2D1810',
    hairStyle: 'bald',
    hatType: 'cowboy',
    hatColor: '#1A1210',
    clothingColor: '#3D2314',
    clothingType: 'duster',
    accessory: 'holster',
    expression: 'angry',
  };

  const root = constructChibi(config);
  root.name = 'enemy_banditBoss';
  root.scale.set(1.5, 1.5, 1.5);

  // Replace face with heavily scarred version
  const head = root.getObjectByName('head') as THREE.Group | undefined;
  if (head) {
    const existingFace = head.children.find(
      (c) => c instanceof THREE.Mesh && (c as THREE.Mesh).geometry instanceof THREE.PlaneGeometry,
    );
    if (existingFace) head.remove(existingFace);

    const scarTex = paintScarredFace('#A0724E', seed);
    const faceMat = new THREE.MeshStandardMaterial({
      map: scarTex,
      transparent: true,
      roughness: 0.6,
    });
    const faceGeo = new THREE.PlaneGeometry(HEAD_RADIUS * 1.0, HEAD_RADIUS * 1.0);
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, -HEAD_RADIUS * 0.05, HEAD_RADIUS * 0.92);
    head.add(faceMesh);
  }

  // Trophy belt — small items dangling around waist
  const beltY = 0.1 + 0.35 + BODY_H * 0.5 - BODY_H * 0.35;
  const rng = makePRNG(`boss-trophies-${seed}`);
  const trophyMat = createMetalTexture('#C0C0C0');
  const boneMat = new THREE.MeshStandardMaterial({ color: '#E8DCC8', roughness: 0.8 });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const radius = BODY_W * 0.35;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const mat = rng() > 0.5 ? trophyMat : boneMat;
    const geo = new THREE.BoxGeometry(0.03 + rng() * 0.02, 0.06 + rng() * 0.04, 0.02);
    const trophy = new THREE.Mesh(geo, mat);
    trophy.position.set(x, beltY - 0.03 - rng() * 0.04, z);
    trophy.rotation.set(rng() * 0.3, rng() * 0.5, rng() * 0.4);
    root.add(trophy);
  }

  // Dual revolvers — small dark cylinders at hips
  const revolverMat = createMetalTexture('#333333');
  const revolverGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6);
  const revolverL = new THREE.Mesh(revolverGeo, revolverMat);
  revolverL.position.set(-BODY_W * 0.4, beltY, BODY_D * 0.3);
  revolverL.rotation.x = Math.PI * 0.5;
  root.add(revolverL);
  const revolverR = new THREE.Mesh(revolverGeo.clone(), revolverMat);
  revolverR.position.set(BODY_W * 0.4, beltY, BODY_D * 0.3);
  revolverR.rotation.x = Math.PI * 0.5;
  root.add(revolverR);

  return root;
}
