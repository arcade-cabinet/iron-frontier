// ChibiParts — Hat and accessory builders for chibi characters
//
// Split from ChibiRenderer to stay under 300 lines per file.
// Contains: createHat, attachAccessory.

import * as THREE from 'three';

import { createFabricTexture } from '../materials/CanvasTextureFactory';
import { createLeatherTexture } from '../materials/CanvasTextureFactory.organic';
import type { ChibiConfig } from './ChibiRenderer';

// Re-import shared proportions
const HEAD_RADIUS = 0.35;
const BODY_W = 0.5;
const BODY_H = 0.6;
const BODY_D = 0.3;

// ---------------------------------------------------------------------------
// Hats
// ---------------------------------------------------------------------------

export function createHat(type: ChibiConfig['hatType'], color: string): THREE.Group {
  const group = new THREE.Group();
  const mat = createLeatherTexture(color);

  const hatY = HEAD_RADIUS * 0.85;

  switch (type) {
    case 'cowboy': {
      // Wide brim
      const brimGeo = new THREE.CylinderGeometry(HEAD_RADIUS * 1.3, HEAD_RADIUS * 1.35, 0.04, 16);
      const brim = new THREE.Mesh(brimGeo, mat);
      brim.position.y = hatY;
      group.add(brim);

      // Tall crown
      const crownGeo = new THREE.CylinderGeometry(
        HEAD_RADIUS * 0.65, HEAD_RADIUS * 0.7, HEAD_RADIUS * 0.55, 12,
      );
      const crown = new THREE.Mesh(crownGeo, mat);
      crown.position.y = hatY + HEAD_RADIUS * 0.3;
      group.add(crown);

      // Crown top dent (slightly indented disc)
      const dentGeo = new THREE.CylinderGeometry(HEAD_RADIUS * 0.4, HEAD_RADIUS * 0.5, 0.03, 10);
      const dentMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(0.7), roughness: 0.7,
      });
      const dent = new THREE.Mesh(dentGeo, dentMat);
      dent.position.y = hatY + HEAD_RADIUS * 0.55;
      group.add(dent);
      break;
    }

    case 'bowler': {
      // Round brim
      const brimGeo = new THREE.CylinderGeometry(HEAD_RADIUS * 1.05, HEAD_RADIUS * 1.1, 0.04, 16);
      const brim = new THREE.Mesh(brimGeo, mat);
      brim.position.y = hatY;
      group.add(brim);

      // Dome crown (half sphere)
      const domeGeo = new THREE.SphereGeometry(
        HEAD_RADIUS * 0.65, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5,
      );
      const dome = new THREE.Mesh(domeGeo, mat);
      dome.position.y = hatY + 0.02;
      group.add(dome);
      break;
    }

    case 'tophat': {
      // Narrow brim
      const brimGeo = new THREE.CylinderGeometry(HEAD_RADIUS * 1.0, HEAD_RADIUS * 1.05, 0.04, 16);
      const brim = new THREE.Mesh(brimGeo, mat);
      brim.position.y = hatY;
      group.add(brim);

      // Tall straight crown
      const crownGeo = new THREE.CylinderGeometry(
        HEAD_RADIUS * 0.6, HEAD_RADIUS * 0.6, HEAD_RADIUS * 0.8, 12,
      );
      const crown = new THREE.Mesh(crownGeo, mat);
      crown.position.y = hatY + HEAD_RADIUS * 0.42;
      group.add(crown);

      // Band around crown
      const bandGeo = new THREE.CylinderGeometry(
        HEAD_RADIUS * 0.62, HEAD_RADIUS * 0.62, 0.04, 12,
      );
      const bandMat = new THREE.MeshStandardMaterial({ color: '#8B0000', roughness: 0.7 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = hatY + HEAD_RADIUS * 0.12;
      group.add(band);
      break;
    }

    case 'bandana': {
      // Thin box across lower face
      const bandMat = createFabricTexture(color, 'plain');
      const bandGeo = new THREE.BoxGeometry(HEAD_RADIUS * 1.6, HEAD_RADIUS * 0.4, HEAD_RADIUS * 0.2);
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(0, -HEAD_RADIUS * 0.15, HEAD_RADIUS * 0.6);
      group.add(band);

      // Knot at back
      const knotGeo = new THREE.SphereGeometry(0.04, 6, 4);
      const knot = new THREE.Mesh(knotGeo, bandMat);
      knot.position.set(0, -HEAD_RADIUS * 0.1, -HEAD_RADIUS * 0.7);
      group.add(knot);
      break;
    }

    case 'bonnet': {
      // Half sphere covering back of head
      const bonnetMat = createFabricTexture(color, 'plain');
      const bonnetGeo = new THREE.SphereGeometry(
        HEAD_RADIUS * 1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6,
      );
      const bonnet = new THREE.Mesh(bonnetGeo, bonnetMat);
      bonnet.position.y = HEAD_RADIUS * 0.15;
      bonnet.rotation.x = 0.3; // tilt back slightly
      group.add(bonnet);

      // Ribbon ties under chin
      const ribbonGeo = new THREE.BoxGeometry(0.03, HEAD_RADIUS * 0.5, 0.015);
      const ribbonMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.85 });
      const ribbonL = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbonL.position.set(-HEAD_RADIUS * 0.5, -HEAD_RADIUS * 0.3, HEAD_RADIUS * 0.4);
      group.add(ribbonL);
      const ribbonR = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbonR.position.set(HEAD_RADIUS * 0.5, -HEAD_RADIUS * 0.3, HEAD_RADIUS * 0.4);
      group.add(ribbonR);
      break;
    }
  }

  return group;
}

// ---------------------------------------------------------------------------
// Accessories
// ---------------------------------------------------------------------------

export function attachAccessory(
  root: THREE.Group,
  accessory: NonNullable<ChibiConfig['accessory']>,
  bodyY: number,
  armOffsetX: number,
): void {
  const darkMat = new THREE.MeshStandardMaterial({ color: '#2D1810', roughness: 0.6 });
  const metalMat = new THREE.MeshStandardMaterial({ color: '#C0C0C0', roughness: 0.3, metalness: 0.7 });

  switch (accessory) {
    case 'holster': {
      const holsterGeo = new THREE.BoxGeometry(0.08, 0.12, 0.06);
      const holster = new THREE.Mesh(holsterGeo, createLeatherTexture('#3D2314'));
      holster.position.set(armOffsetX - 0.05, bodyY - BODY_H * 0.35, 0.05);
      root.add(holster);
      break;
    }

    case 'bag': {
      const bagGeo = new THREE.BoxGeometry(0.15, 0.18, 0.08);
      const bag = new THREE.Mesh(bagGeo, createLeatherTexture('#6B4423'));
      bag.position.set(-armOffsetX - 0.05, bodyY - BODY_H * 0.1, -0.05);
      root.add(bag);

      // Strap
      const strapGeo = new THREE.BoxGeometry(0.03, BODY_H * 0.9, 0.02);
      const strap = new THREE.Mesh(strapGeo, darkMat);
      strap.position.set(-armOffsetX + 0.1, bodyY, 0);
      strap.rotation.z = 0.4;
      root.add(strap);
      break;
    }

    case 'badge': {
      // Small gold star on chest
      const badgeGeo = new THREE.CircleGeometry(0.04, 5); // pentagon ~ star
      const badgeMat = new THREE.MeshStandardMaterial({ color: '#FFD700', roughness: 0.2, metalness: 0.8 });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.set(-BODY_W * 0.15, bodyY + BODY_H * 0.15, BODY_D * 0.52);
      root.add(badge);
      break;
    }

    case 'stethoscope': {
      // Simple tube hanging from neck
      const tubeGeo = new THREE.TorusGeometry(0.12, 0.015, 6, 16, Math.PI);
      const tube = new THREE.Mesh(tubeGeo, darkMat);
      tube.position.set(0, bodyY + BODY_H * 0.35, BODY_D * 0.25);
      tube.rotation.x = Math.PI * 0.5;
      root.add(tube);

      // Chest piece
      const pieceGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8);
      const piece = new THREE.Mesh(pieceGeo, metalMat);
      piece.position.set(0, bodyY + BODY_H * 0.1, BODY_D * 0.52);
      root.add(piece);
      break;
    }

    case 'pickaxe': {
      // Handle (held in right hand area)
      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
      const handleMat = new THREE.MeshStandardMaterial({ color: '#6B4423', roughness: 0.8 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(armOffsetX + 0.1, bodyY - BODY_H * 0.1, 0.05);
      handle.rotation.z = -0.3;
      root.add(handle);

      // Pick head
      const headGeo = new THREE.BoxGeometry(0.18, 0.04, 0.04);
      const head = new THREE.Mesh(headGeo, metalMat);
      head.position.set(armOffsetX + 0.18, bodyY + BODY_H * 0.15, 0.05);
      root.add(head);
      break;
    }
  }
}
