// MonsterMechanicals — Clockwork automaton enemy constructor
//
// Brass-colored chibi built from visible mechanical parts: exposed gears,
// pipe arms, smokestack hat, glowing red eye slit. Deterministic via alea.

import * as THREE from 'three';

import { makePRNG } from '../materials/canvasUtils';
import { createMetalTexture } from '../materials/CanvasTextureFactory';
import { createRustTexture } from '../materials/CanvasTextureFactory.organic';
import { paintMechanicalFace } from './MonsterFaces';
import { HEAD_RADIUS, BODY_W, BODY_H, BODY_D } from './ChibiRenderer';

// ---------------------------------------------------------------------------
// Clockwork Automaton — brass chibi with mechanical parts
// ---------------------------------------------------------------------------

export function buildClockworkAutomaton(seed: string): THREE.Group {
  const rng = makePRNG(`clockwork-${seed}`);
  const root = new THREE.Group();
  root.name = 'enemy_clockworkAutomaton';

  const brassMat = createMetalTexture('#B8860B', '#8B6914');
  const darkBrassMat = createMetalTexture('#8B6914', '#5C4300');
  const copperMat = createMetalTexture('#B87333');
  const ironMat = createMetalTexture('#555555');

  // -- Legs with piston details --
  const bootMat = createMetalTexture('#444444');
  const legY = 0.1 + 0.35 * 0.5;
  const legSpacing = BODY_W * 0.25;

  for (const side of [-1, 1]) {
    // Cylinder leg
    const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.35, 8);
    const leg = new THREE.Mesh(legGeo, brassMat);
    leg.position.set(side * legSpacing, legY, 0);
    leg.name = side < 0 ? 'leg_l' : 'leg_r';
    root.add(leg);

    // Piston rod on each leg
    const pistonGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4);
    const piston = new THREE.Mesh(pistonGeo, ironMat);
    piston.position.set(side * (legSpacing + 0.08), legY, 0.04);
    root.add(piston);

    // Boot — metal box
    const bootGeo = new THREE.BoxGeometry(0.24, 0.1, 0.26);
    const boot = new THREE.Mesh(bootGeo, bootMat);
    boot.position.set(side * legSpacing, 0.03, 0.02);
    root.add(boot);
  }

  // -- Box torso with exposed gear cylinders --
  const bodyY = 0.1 + 0.35 + BODY_H * 0.5;
  const torsoGeo = new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D, 2, 2, 2);
  const torso = new THREE.Mesh(torsoGeo, brassMat);
  torso.position.set(0, bodyY, 0);
  torso.name = 'body';
  root.add(torso);

  // Exposed gears on torso front — cylinders that spin during animation
  const gearMat = new THREE.MeshStandardMaterial({
    color: '#DAA520',
    roughness: 0.25,
    metalness: 0.8,
  });
  const gearPositions: [number, number][] = [
    [-BODY_W * 0.18, bodyY + BODY_H * 0.1],
    [BODY_W * 0.18, bodyY - BODY_H * 0.05],
    [0, bodyY + BODY_H * 0.2],
  ];
  gearPositions.forEach(([x, y], i) => {
    const gearR = 0.04 + rng() * 0.02;
    const gearGeo = new THREE.CylinderGeometry(gearR, gearR, 0.02, 12);
    const gear = new THREE.Mesh(gearGeo, gearMat);
    gear.position.set(x, y, BODY_D * 0.52);
    gear.rotation.x = Math.PI * 0.5;
    gear.name = `gear_${i}`;
    root.add(gear);

    // Gear teeth — small boxes around the cylinder
    const toothCount = 8;
    for (let t = 0; t < toothCount; t++) {
      const angle = (t / toothCount) * Math.PI * 2;
      const toothGeo = new THREE.BoxGeometry(0.008, 0.015, 0.02);
      const tooth = new THREE.Mesh(toothGeo, gearMat);
      tooth.position.set(
        x + Math.cos(angle) * (gearR + 0.005),
        y + Math.sin(angle) * (gearR + 0.005),
        BODY_D * 0.53,
      );
      tooth.rotation.z = angle;
      root.add(tooth);
    }
  });

  // Boiler plate on chest
  const plateMat = createRustTexture('#8B4513');
  const plateGeo = new THREE.BoxGeometry(BODY_W * 0.5, BODY_H * 0.3, 0.02);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, bodyY - BODY_H * 0.2, BODY_D * 0.52);
  root.add(plate);

  // Rivets around plate edges
  const rivetMat = new THREE.MeshStandardMaterial({ color: '#666666', metalness: 0.8, roughness: 0.3 });
  const rivetGeo = new THREE.SphereGeometry(0.01, 4, 4);
  for (let rx = -2; rx <= 2; rx++) {
    for (const ry of [-1, 1]) {
      const rivet = new THREE.Mesh(rivetGeo, rivetMat);
      rivet.position.set(
        rx * BODY_W * 0.1,
        bodyY - BODY_H * 0.2 + ry * BODY_H * 0.13,
        BODY_D * 0.54,
      );
      root.add(rivet);
    }
  }

  // -- Pipe arms with elbow joints --
  const armY = bodyY + BODY_H * 0.35;
  const armOffsetX = BODY_W * 0.5 + 0.08;

  for (const side of [-1, 1]) {
    // Upper arm pipe
    const upperGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.2, 8);
    const upper = new THREE.Mesh(upperGeo, copperMat);
    upper.position.set(side * armOffsetX, armY, 0);
    upper.rotation.z = side * 0.15;
    upper.name = side < 0 ? 'arm_l' : 'arm_r';
    root.add(upper);

    // Elbow joint — sphere
    const elbowGeo = new THREE.SphereGeometry(0.065, 8, 6);
    const elbow = new THREE.Mesh(elbowGeo, darkBrassMat);
    elbow.position.set(side * (armOffsetX + 0.02), armY - 0.12, 0);
    root.add(elbow);

    // Lower arm pipe
    const lowerGeo = new THREE.CylinderGeometry(0.055, 0.06, 0.18, 8);
    const lower = new THREE.Mesh(lowerGeo, copperMat);
    lower.position.set(side * (armOffsetX + 0.04), armY - 0.25, 0);
    root.add(lower);

    // Claw hand — 3 pronged
    const clawMat = ironMat;
    for (let f = -1; f <= 1; f++) {
      const clawGeo = new THREE.BoxGeometry(0.015, 0.08, 0.015);
      const claw = new THREE.Mesh(clawGeo, clawMat);
      claw.position.set(
        side * (armOffsetX + 0.04) + f * 0.025,
        armY - 0.38,
        0,
      );
      claw.rotation.z = f * 0.15;
      root.add(claw);
    }
  }

  // -- Head — angular box with mechanical faceplate --
  const headY = bodyY + BODY_H * 0.5 + HEAD_RADIUS * 0.85;
  const headGroup = new THREE.Group();
  headGroup.name = 'head';

  // Angular box head
  const headGeo = new THREE.BoxGeometry(HEAD_RADIUS * 1.8, HEAD_RADIUS * 1.6, HEAD_RADIUS * 1.6);
  const headMesh = new THREE.Mesh(headGeo, brassMat);
  headGroup.add(headMesh);

  // Mechanical face on front
  const faceTex = paintMechanicalFace();
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.4,
    metalness: 0.3,
  });
  const faceGeo = new THREE.PlaneGeometry(HEAD_RADIUS * 1.4, HEAD_RADIUS * 1.2);
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.set(0, 0, HEAD_RADIUS * 0.81);
  headGroup.add(faceMesh);

  headGroup.position.set(0, headY, 0);
  root.add(headGroup);

  // -- Smokestack hat — cylinder with small particle puffs --
  const stackGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 8);
  const stack = new THREE.Mesh(stackGeo, ironMat);
  stack.position.set(0, headY + HEAD_RADIUS * 0.9, -HEAD_RADIUS * 0.2);
  stack.name = 'smokestack';
  root.add(stack);

  // Stack rim
  const rimGeo = new THREE.TorusGeometry(0.09, 0.015, 6, 12);
  const rim = new THREE.Mesh(rimGeo, ironMat);
  rim.position.set(0, headY + HEAD_RADIUS * 0.9 + 0.12, -HEAD_RADIUS * 0.2);
  rim.rotation.x = Math.PI * 0.5;
  root.add(rim);

  // Smoke puffs — small transparent spheres above stack
  const smokeMat = new THREE.MeshStandardMaterial({
    color: '#888888',
    transparent: true,
    opacity: 0.3,
    roughness: 1.0,
  });
  for (let p = 0; p < 3; p++) {
    const puffGeo = new THREE.SphereGeometry(0.03 + p * 0.015, 6, 4);
    const puff = new THREE.Mesh(puffGeo, smokeMat);
    puff.position.set(
      (rng() - 0.5) * 0.04,
      headY + HEAD_RADIUS * 0.9 + 0.18 + p * 0.06,
      -HEAD_RADIUS * 0.2 + (rng() - 0.5) * 0.03,
    );
    puff.name = `smoke_${p}`;
    root.add(puff);
  }

  return root;
}
