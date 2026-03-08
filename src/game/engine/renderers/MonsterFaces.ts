// MonsterFaces — Canvas-painted enemy face textures
//
// Extends ChibiFace with menacing enemy-specific variants:
// scarred faces, bandana-masked faces, hollow eye sockets, glowing eyes.
// Deterministic via alea — no Math.random().

import { CanvasTexture, SRGBColorSpace } from 'three';

import { makeCanvas, makePRNG, shiftColor } from '../materials/canvasUtils';

// ---------------------------------------------------------------------------
// Scarred face — angry expression with visible scars
// ---------------------------------------------------------------------------

/**
 * Paint an angry face with jagged scars across cheeks and brow.
 * Used by outlaw and banditBoss types.
 */
export function paintScarredFace(
  skinTone: string,
  seed: string,
  width = 128,
  height = 128,
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(width, height);
  const rng = makePRNG(`scar-${seed}`);

  // Fill with skin tone base
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, width, height);

  // Warmth overlay
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = shiftColor(skinTone, 15);
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.55, width * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cx = width * 0.5;
  const eyeY = height * 0.46;
  const eyeSpacing = width * 0.14;

  // Angry squinting eyes
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing, eyeY, width * 0.032, width * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing, eyeY, width * 0.032, width * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy angled brows
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = width * 0.028;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - eyeSpacing - width * 0.05, eyeY - width * 0.08);
  ctx.lineTo(cx - eyeSpacing + width * 0.04, eyeY - width * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + eyeSpacing + width * 0.05, eyeY - width * 0.08);
  ctx.lineTo(cx + eyeSpacing - width * 0.04, eyeY - width * 0.04);
  ctx.stroke();

  // Gritting teeth
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = width * 0.02;
  const mouthY = eyeY + width * 0.18;
  ctx.beginPath();
  ctx.arc(cx, mouthY - width * 0.02, width * 0.07, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Scars — 2-3 jagged lines across the face
  const scarCount = 2 + Math.floor(rng() * 2);
  ctx.strokeStyle = shiftColor(skinTone, -35);
  ctx.lineWidth = width * 0.015;
  ctx.globalAlpha = 0.7;

  for (let i = 0; i < scarCount; i++) {
    const startX = width * (0.2 + rng() * 0.6);
    const startY = height * (0.2 + rng() * 0.4);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    // Jagged path with 3-4 segments
    const segments = 3 + Math.floor(rng() * 2);
    for (let s = 0; s < segments; s++) {
      ctx.lineTo(
        startX + (rng() - 0.3) * width * 0.25,
        startY + s * height * 0.08 + rng() * height * 0.04,
      );
    }
    ctx.stroke();
  }

  // Scar discoloration blotches
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = shiftColor(skinTone, -25);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      width * (0.3 + rng() * 0.4),
      height * (0.3 + rng() * 0.3),
      width * (0.02 + rng() * 0.03),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// Bandana face — covered lower face with only eyes visible
// ---------------------------------------------------------------------------

/**
 * Paint a face where the lower half is obscured by a bandana.
 * Only menacing eyes and brows are visible above.
 */
export function paintBandanaFace(
  skinTone: string,
  _seed: string,
  width = 128,
  height = 128,
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(width, height);

  // Fill with skin tone
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.5;
  const eyeY = height * 0.4;
  const eyeSpacing = width * 0.14;

  // Narrow, menacing eyes
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing, eyeY, width * 0.035, width * 0.015, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing, eyeY, width * 0.035, width * 0.015, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Lowered threatening brows
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = width * 0.025;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - eyeSpacing - width * 0.04, eyeY - width * 0.06);
  ctx.lineTo(cx - eyeSpacing + width * 0.04, eyeY - width * 0.035);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + eyeSpacing + width * 0.04, eyeY - width * 0.06);
  ctx.lineTo(cx + eyeSpacing - width * 0.04, eyeY - width * 0.035);
  ctx.stroke();

  // Lower half is covered — paint bandana color over bottom
  ctx.fillStyle = '#2D0A0A';
  ctx.globalAlpha = 0.9;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);
  ctx.globalAlpha = 1;

  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// Hollow-eyed face — for wendigo (dark sunken sockets)
// ---------------------------------------------------------------------------

/**
 * Paint a gaunt face with hollow black eye sockets and thin mouth.
 * Used by wendigo type.
 */
export function paintHollowFace(
  skinTone: string,
  width = 128,
  height = 128,
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(width, height);

  // Pale sickly base
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, width, height);

  // Sunken cheek shadows
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = shiftColor(skinTone, -40);
  ctx.beginPath();
  ctx.ellipse(width * 0.3, height * 0.55, width * 0.08, width * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(width * 0.7, height * 0.55, width * 0.08, width * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cx = width * 0.5;
  const eyeY = height * 0.44;
  const eyeSpacing = width * 0.14;

  // Deep hollow dark eye sockets
  ctx.fillStyle = '#0A0A0A';
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing, eyeY, width * 0.05, width * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing, eyeY, width * 0.05, width * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();

  // Faint glow inside the sockets
  ctx.fillStyle = '#334466';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing, eyeY, width * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing, eyeY, width * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Thin anguished mouth
  ctx.strokeStyle = '#1A1210';
  ctx.lineWidth = width * 0.012;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - width * 0.06, eyeY + width * 0.2);
  ctx.quadraticCurveTo(cx, eyeY + width * 0.23, cx + width * 0.06, eyeY + width * 0.2);
  ctx.stroke();

  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// Glowing eye slit — for clockwork automaton
// ---------------------------------------------------------------------------

/**
 * Paint a mechanical faceplate with a glowing red eye slit.
 * Used by clockworkAutomaton type.
 */
export function paintMechanicalFace(
  width = 128,
  height = 128,
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(width, height);

  // Brass metal base
  ctx.fillStyle = '#B8860B';
  ctx.fillRect(0, 0, width, height);

  // Rivet pattern
  ctx.fillStyle = '#8B6914';
  const rivetSize = width * 0.015;
  for (let rx = 0.15; rx <= 0.85; rx += 0.35) {
    for (let ry = 0.15; ry <= 0.85; ry += 0.35) {
      ctx.beginPath();
      ctx.arc(width * rx, height * ry, rivetSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central glowing red eye slit
  const cx = width * 0.5;
  const eyeY = height * 0.45;
  ctx.fillStyle = '#FF2200';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.ellipse(cx, eyeY, width * 0.2, width * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  ctx.fillStyle = '#FF6644';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(cx, eyeY, width * 0.12, width * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();

  // Panel line across faceplate
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#5C4300';
  ctx.lineWidth = width * 0.01;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, height * 0.6);
  ctx.lineTo(width * 0.9, height * 0.6);
  ctx.stroke();

  ctx.globalAlpha = 1;
  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
