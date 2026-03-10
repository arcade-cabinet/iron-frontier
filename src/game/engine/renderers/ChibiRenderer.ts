// ChibiRenderer — Constructs chibi humanoid characters from Three.js primitives
//
// Oversized head, stubby body, tiny limbs. All materials come from
// CanvasTextureFactory. No GLBs, no scopedRNG('render', 42, rngTick()) — alea for any variation.

import * as THREE from 'three';

import { createFabricTexture } from '../materials/CanvasTextureFactory';
import { createLeatherTexture, createSkinTexture } from '../materials/CanvasTextureFactory.organic';
import { paintFace, type Expression } from './ChibiFace';
import { attachAccessory, createHat } from './ChibiParts';
import { scopedRNG, rngTick } from '../../lib/prng';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ChibiConfig {
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'bald' | 'ponytail';
  hatType: 'cowboy' | 'bowler' | 'bandana' | 'bonnet' | 'tophat' | 'none';
  hatColor: string;
  clothingColor: string;
  clothingType: 'vest' | 'shirt' | 'apron' | 'duster' | 'dress' | 'uniform';
  accessory?: 'holster' | 'bag' | 'badge' | 'stethoscope' | 'pickaxe' | 'none';
  expression?: Expression;
}

// Proportions — chibi ratio: head ~ 40% of total height (~2.0 units)
export const HEAD_RADIUS = 0.35;
export const BODY_W = 0.5;
export const BODY_H = 0.6;
export const BODY_D = 0.3;
const ARM_RADIUS = 0.08;
const ARM_LENGTH = 0.4;
const LEG_RADIUS = 0.1;
const LEG_LENGTH = 0.35;
const BOOT_H = 0.1;

// ---------------------------------------------------------------------------
// Main constructor
// ---------------------------------------------------------------------------

/**
 * Build a complete chibi character as a THREE.Group.
 * The group origin sits at the character's feet (ground level).
 */
export function constructChibi(config: ChibiConfig): THREE.Group {
  const root = new THREE.Group();
  root.name = 'chibi';

  const skinMat = createSkinTexture(config.skinTone);
  const clothMat = createFabricTexture(config.clothingColor, fabricPattern(config.clothingType));
  const bootMat = createLeatherTexture('#1A1210');

  // -- Legs & boots --
  const legsY = BOOT_H + LEG_LENGTH * 0.5;
  const legSpacing = BODY_W * 0.25;

  const leftLeg = createLeg(skinMat, bootMat);
  leftLeg.position.set(-legSpacing, legsY, 0);
  leftLeg.name = 'leg_l';
  root.add(leftLeg);

  const rightLeg = createLeg(skinMat, bootMat);
  rightLeg.position.set(legSpacing, legsY, 0);
  rightLeg.name = 'leg_r';
  root.add(rightLeg);

  // -- Body --
  const bodyY = BOOT_H + LEG_LENGTH + BODY_H * 0.5;
  const body = createBody(clothMat, config.clothingType);
  body.position.set(0, bodyY, 0);
  body.name = 'body';
  root.add(body);

  // -- Arms --
  const armY = bodyY + BODY_H * 0.35;
  const armOffsetX = BODY_W * 0.5 + ARM_RADIUS;

  const leftArm = createArm(skinMat);
  leftArm.position.set(-armOffsetX, armY, 0);
  leftArm.rotation.z = 0.15; // slight outward angle
  leftArm.name = 'arm_l';
  root.add(leftArm);

  const rightArm = createArm(skinMat);
  rightArm.position.set(armOffsetX, armY, 0);
  rightArm.rotation.z = -0.15;
  rightArm.name = 'arm_r';
  root.add(rightArm);

  // -- Head (wrapped in its own group for animation) --
  const headY = bodyY + BODY_H * 0.5 + HEAD_RADIUS * 0.85;
  const headGroup = createHead(config, skinMat);
  headGroup.position.set(0, headY, 0);
  headGroup.name = 'head';
  root.add(headGroup);

  // -- Accessory --
  if (config.accessory && config.accessory !== 'none') {
    attachAccessory(root, config.accessory, bodyY, armOffsetX);
  }

  return root;
}

// ---------------------------------------------------------------------------
// Body parts
// ---------------------------------------------------------------------------

function createHead(config: ChibiConfig, skinMat: THREE.MeshStandardMaterial): THREE.Group {
  const group = new THREE.Group();

  // Head sphere
  const headGeo = new THREE.SphereGeometry(HEAD_RADIUS, 16, 14);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  group.add(headMesh);

  // Face texture on a small plane in front
  const faceTexture = paintFace(config.expression ?? 'neutral', config.skinTone);
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTexture,
    transparent: true,
    roughness: 0.6,
    metalness: 0,
  });
  const faceGeo = new THREE.PlaneGeometry(HEAD_RADIUS * 1.0, HEAD_RADIUS * 1.0);
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.set(0, -HEAD_RADIUS * 0.05, HEAD_RADIUS * 0.92);
  group.add(faceMesh);

  // Hair
  addHair(group, config.hairStyle, config.hairColor);

  // Hat
  if (config.hatType !== 'none') {
    const hat = createHat(config.hatType, config.hatColor);
    hat.name = 'hat';
    group.add(hat);
  }

  return group;
}

function createBody(
  clothMat: THREE.MeshStandardMaterial,
  clothingType: ChibiConfig['clothingType'],
): THREE.Group {
  const group = new THREE.Group();

  // Core torso box with rounded edges via segments
  const torsoGeo = new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D, 2, 2, 2);
  roundBoxVertices(torsoGeo, 0.06);
  const torso = new THREE.Mesh(torsoGeo, clothMat);
  group.add(torso);

  // Clothing-specific embellishments
  if (clothingType === 'vest') {
    // Lapel lines — thin dark strips on front
    const lapelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const lapelGeo = new THREE.BoxGeometry(0.04, BODY_H * 0.8, 0.01);
    const lapelL = new THREE.Mesh(lapelGeo, lapelMat);
    lapelL.position.set(-BODY_W * 0.2, 0, BODY_D * 0.51);
    group.add(lapelL);
    const lapelR = new THREE.Mesh(lapelGeo, lapelMat);
    lapelR.position.set(BODY_W * 0.2, 0, BODY_D * 0.51);
    group.add(lapelR);
  } else if (clothingType === 'apron') {
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9 });
    const apronGeo = new THREE.BoxGeometry(BODY_W * 0.7, BODY_H * 0.75, 0.02);
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, -BODY_H * 0.05, BODY_D * 0.52);
    group.add(apron);
  } else if (clothingType === 'duster') {
    // Long coat tails extending below torso
    const dusterMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7 });
    const tailGeo = new THREE.BoxGeometry(BODY_W * 1.05, 0.25, BODY_D * 0.6);
    const tail = new THREE.Mesh(tailGeo, dusterMat);
    tail.position.set(0, -BODY_H * 0.55, -BODY_D * 0.1);
    group.add(tail);
  }

  return group;
}

function createLeg(
  skinMat: THREE.MeshStandardMaterial,
  bootMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const group = new THREE.Group();

  const legGeo = new THREE.CylinderGeometry(LEG_RADIUS, LEG_RADIUS, LEG_LENGTH, 8);
  const leg = new THREE.Mesh(legGeo, skinMat);
  group.add(leg);

  // Boot at bottom — small dark box
  const bootGeo = new THREE.BoxGeometry(LEG_RADIUS * 2.4, BOOT_H, LEG_RADIUS * 2.6);
  const boot = new THREE.Mesh(bootGeo, bootMat);
  boot.position.set(0, -LEG_LENGTH * 0.5 - BOOT_H * 0.3, LEG_RADIUS * 0.15);
  group.add(boot);

  return group;
}

function createArm(skinMat: THREE.MeshStandardMaterial): THREE.Group {
  const group = new THREE.Group();

  const armGeo = new THREE.CylinderGeometry(ARM_RADIUS, ARM_RADIUS * 0.9, ARM_LENGTH, 8);
  const arm = new THREE.Mesh(armGeo, skinMat);
  group.add(arm);

  // Tiny hand sphere at the bottom
  const handGeo = new THREE.SphereGeometry(ARM_RADIUS * 1.1, 8, 6);
  const hand = new THREE.Mesh(handGeo, skinMat);
  hand.position.set(0, -ARM_LENGTH * 0.5 - ARM_RADIUS * 0.5, 0);
  group.add(hand);

  return group;
}

// ---------------------------------------------------------------------------
// Hair
// ---------------------------------------------------------------------------

function addHair(
  headGroup: THREE.Group,
  style: ChibiConfig['hairStyle'],
  color: string,
): void {
  const hairMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });

  if (style === 'bald') return;

  // Cap on top (shared by all non-bald styles)
  const capGeo = new THREE.SphereGeometry(
    HEAD_RADIUS * 1.06, 12, 8,
    0, Math.PI * 2, 0, Math.PI * 0.55,
  );
  const cap = new THREE.Mesh(capGeo, hairMat);
  cap.position.y = HEAD_RADIUS * 0.05;
  headGroup.add(cap);

  if (style === 'long') {
    // Long hair strips hanging down the back
    const stripGeo = new THREE.BoxGeometry(HEAD_RADIUS * 1.6, HEAD_RADIUS * 1.2, 0.06);
    const strip = new THREE.Mesh(stripGeo, hairMat);
    strip.position.set(0, -HEAD_RADIUS * 0.3, -HEAD_RADIUS * 0.8);
    headGroup.add(strip);
  } else if (style === 'ponytail') {
    // Small gathered ball at the back
    const tailGeo = new THREE.SphereGeometry(HEAD_RADIUS * 0.25, 8, 6);
    const tail = new THREE.Mesh(tailGeo, hairMat);
    tail.position.set(0, HEAD_RADIUS * 0.1, -HEAD_RADIUS * 1.05);
    headGroup.add(tail);

    // Tie band
    const bandGeo = new THREE.TorusGeometry(HEAD_RADIUS * 0.18, 0.02, 6, 12);
    const bandMat = new THREE.MeshStandardMaterial({ color: '#2D1810', roughness: 0.8 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(0, HEAD_RADIUS * 0.1, -HEAD_RADIUS * 0.9);
    band.rotation.y = Math.PI * 0.5;
    headGroup.add(band);
  }
  // 'short' just uses the cap — no extra geometry
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Nudge box vertices outward to approximate rounded edges. */
function roundBoxVertices(geo: THREE.BoxGeometry, radius: number): void {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const len = v.length();
    if (len > 0) {
      v.normalize().multiplyScalar(len + radius * (1 - len / (len + radius)));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

/** Map clothing type to a fabric pattern. */
function fabricPattern(type: ChibiConfig['clothingType']): 'plain' | 'plaid' | 'stripe' {
  switch (type) {
    case 'shirt': return 'plaid';
    case 'dress': return 'stripe';
    default: return 'plain';
  }
}
