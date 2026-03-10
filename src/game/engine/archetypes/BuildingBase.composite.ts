// BuildingBase composite elements — doors, windows, signs, porches.
// Split from BuildingBase.ts to stay under 300 lines per file.

import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

import {
  createGlassTexture,
  createMetalTexture,
  createWoodTexture,
} from '../materials';

import { createFloor, DEFAULT_PALETTE } from './BuildingBase';

// ---------------------------------------------------------------------------
// Doors
// ---------------------------------------------------------------------------

export function createDoor(
  width: number,
  height: number,
  style: 'single' | 'swinging' | 'double',
): Group {
  const group = new Group();
  const frameMat = createWoodTexture(DEFAULT_PALETTE.trimBase, DEFAULT_PALETTE.trimGrain);
  const doorMat = createWoodTexture('#6B4E32', '#4A3422');

  const frameThick = 0.08;
  const top = new Mesh(new BoxGeometry(width + frameThick * 2, frameThick, 0.12), frameMat);
  top.position.y = height;
  group.add(top);

  const leftFrame = new Mesh(new BoxGeometry(frameThick, height, 0.12), frameMat);
  leftFrame.position.set(-width / 2 - frameThick / 2, height / 2, 0);
  group.add(leftFrame);

  const rightFrame = new Mesh(new BoxGeometry(frameThick, height, 0.12), frameMat);
  rightFrame.position.set(width / 2 + frameThick / 2, height / 2, 0);
  group.add(rightFrame);

  if (style === 'swinging') {
    const halfDoorH = 0.8;
    const halfDoorW = width / 2 - 0.02;
    const doorBottom = 0.6;

    const leftDoor = new Mesh(new BoxGeometry(halfDoorW, halfDoorH, 0.05), doorMat);
    leftDoor.position.set(-halfDoorW / 2, doorBottom + halfDoorH / 2, 0);
    leftDoor.name = 'swingDoor_left';
    group.add(leftDoor);

    const rightDoor = new Mesh(new BoxGeometry(halfDoorW, halfDoorH, 0.05), doorMat);
    rightDoor.position.set(halfDoorW / 2, doorBottom + halfDoorH / 2, 0);
    rightDoor.name = 'swingDoor_right';
    group.add(rightDoor);

    // Horizontal slat lines on each door
    const slatMat = createWoodTexture('#5A3D28', '#3A2818');
    for (let i = 0; i < 4; i++) {
      const y = doorBottom + 0.1 + i * (halfDoorH / 4);
      const lSlat = new Mesh(new BoxGeometry(halfDoorW - 0.04, 0.03, 0.06), slatMat);
      lSlat.position.set(-halfDoorW / 2, y, 0);
      group.add(lSlat);
      const rSlat = new Mesh(new BoxGeometry(halfDoorW - 0.04, 0.03, 0.06), slatMat);
      rSlat.position.set(halfDoorW / 2, y, 0);
      group.add(rSlat);
    }
  } else if (style === 'double') {
    const halfW = width / 2 - 0.02;
    const ld = new Mesh(new BoxGeometry(halfW, height - 0.02, 0.05), doorMat);
    ld.position.set(-halfW / 2, height / 2, 0);
    group.add(ld);
    const rd = new Mesh(new BoxGeometry(halfW, height - 0.02, 0.05), doorMat);
    rd.position.set(halfW / 2, height / 2, 0);
    group.add(rd);
  } else {
    const door = new Mesh(new BoxGeometry(width - 0.04, height - 0.02, 0.05), doorMat);
    door.position.y = height / 2;
    group.add(door);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Windows
// ---------------------------------------------------------------------------

export function createWindow(
  width: number,
  height: number,
  panes: number,
): Group {
  const group = new Group();
  const frameMat = createWoodTexture(DEFAULT_PALETTE.trimBase, DEFAULT_PALETTE.trimGrain);
  const glassMat = createGlassTexture('#C8D8E8');
  const frameThick = 0.06;

  // Outer frame
  for (const [yPos, w] of [[height / 2, width], [-height / 2, width]] as const) {
    const bar = new Mesh(new BoxGeometry(w, frameThick, 0.08), frameMat);
    bar.position.y = yPos;
    group.add(bar);
  }
  for (const xPos of [-width / 2, width / 2]) {
    const bar = new Mesh(new BoxGeometry(frameThick, height, 0.08), frameMat);
    bar.position.x = xPos;
    group.add(bar);
  }

  // Pane dividers and glass
  const paneW = (width - frameThick * (panes + 1)) / panes;
  const glassH = height - frameThick * 2;
  for (let i = 0; i < panes; i++) {
    const x = -width / 2 + frameThick + paneW / 2 + i * (paneW + frameThick);
    const glass = new Mesh(new PlaneGeometry(paneW, glassH), glassMat);
    glass.position.set(x, 0, 0);
    group.add(glass);

    if (i < panes - 1) {
      const divider = new Mesh(new BoxGeometry(frameThick, height, 0.08), frameMat);
      divider.position.set(x + paneW / 2 + frameThick / 2, 0, 0);
      group.add(divider);
    }
  }

  return group;
}

// ---------------------------------------------------------------------------
// Signs
// ---------------------------------------------------------------------------

export function createSign(text: string, width: number, height: number): Group {
  const group = new Group();
  const boardMat = createWoodTexture('#4A3422', '#2E1E14');
  const board = new Mesh(new BoxGeometry(width, height, 0.08), boardMat);
  group.add(board);

  // Canvas-rendered text overlay
  const canvas = new OffscreenCanvas(512, 128);
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = '#D4B070';
  ctx.font = 'bold 64px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 2;
  ctx.strokeText(text, 256, 64);

  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  const textMat = new MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.6,
    metalness: 0.1,
  });
  const textPlane = new Mesh(new PlaneGeometry(width - 0.1, height - 0.06), textMat);
  textPlane.position.z = 0.045;
  group.add(textPlane);

  // Hanging brackets
  const bracketMat = createMetalTexture('#4A4A4A');
  for (const xOff of [-width / 2 + 0.2, width / 2 - 0.2]) {
    const bracket = new Mesh(new CylinderGeometry(0.03, 0.03, 0.4, 6), bracketMat);
    bracket.position.set(xOff, height / 2 + 0.2, 0);
    group.add(bracket);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Porch
// ---------------------------------------------------------------------------

export function createPorch(width: number, depth: number): Group {
  const group = new Group();
  const woodMat = createWoodTexture(DEFAULT_PALETTE.wallBase, DEFAULT_PALETTE.wallGrain);
  const railMat = createWoodTexture(DEFAULT_PALETTE.trimBase, DEFAULT_PALETTE.trimGrain);

  // Floor
  const floor = createFloor(width, depth, woodMat);
  floor.position.y = 0.3;
  group.add(floor);

  // Support beams
  const beamCount = Math.max(2, Math.floor(width / 3));
  for (let i = 0; i < beamCount; i++) {
    const x = -width / 2 + 0.3 + (i / (beamCount - 1)) * (width - 0.6);
    const beam = new Mesh(new BoxGeometry(0.12, 0.3, depth), woodMat);
    beam.position.set(x, 0.15, 0);
    group.add(beam);
  }

  // Posts
  const postCount = Math.max(2, Math.floor(width / 3));
  const postHeight = 2.8;
  for (let i = 0; i < postCount; i++) {
    const x = -width / 2 + 0.3 + (i / (postCount - 1)) * (width - 0.6);
    const post = new Mesh(new CylinderGeometry(0.06, 0.07, postHeight, 8), railMat);
    post.position.set(x, 0.3 + postHeight / 2, depth / 2);
    post.castShadow = true;
    group.add(post);
  }

  // Top rail
  const topRail = new Mesh(new BoxGeometry(width - 0.4, 0.06, 0.06), railMat);
  topRail.position.set(0, 0.3 + postHeight, depth / 2);
  group.add(topRail);

  // Railing
  const railH = 1.0;
  const railBot = 0.3;
  const hRailTop = new Mesh(new BoxGeometry(width - 0.4, 0.05, 0.05), railMat);
  hRailTop.position.set(0, railBot + railH, depth / 2);
  group.add(hRailTop);
  const hRailBtm = new Mesh(new BoxGeometry(width - 0.4, 0.05, 0.05), railMat);
  hRailBtm.position.set(0, railBot + 0.15, depth / 2);
  group.add(hRailBtm);

  // Balusters
  const balCount = Math.max(4, Math.floor(width / 0.6));
  for (let i = 0; i < balCount; i++) {
    const x = -width / 2 + 0.4 + (i / (balCount - 1)) * (width - 0.8);
    const bal = new Mesh(new BoxGeometry(0.03, railH - 0.15, 0.03), railMat);
    bal.position.set(x, railBot + railH / 2 + 0.05, depth / 2);
    group.add(bal);
  }

  // Porch roof
  const roofMat = createWoodTexture('#5A3A2A', '#3E2418');
  const roofSlab = new Mesh(new BoxGeometry(width + 0.3, 0.08, depth + 0.6), roofMat);
  roofSlab.position.set(0, 0.3 + postHeight + 0.04, 0);
  roofSlab.castShadow = true;
  group.add(roofSlab);

  return group;
}
