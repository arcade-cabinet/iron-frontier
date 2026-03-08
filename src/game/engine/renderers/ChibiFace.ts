// ChibiFace — Canvas-painted chibi face textures
//
// Paints simple expressive faces onto a canvas: dot eyes, line mouths,
// blush circles, brows. Each expression variant is deterministic.

import {
  CanvasTexture,
  SRGBColorSpace,
} from 'three';

import { makeCanvas, shiftColor } from '../materials/canvasUtils';

export type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'suspicious';

/**
 * Paint a chibi face onto a canvas and return the resulting texture.
 * The texture is meant to be applied to the front hemisphere of a sphere.
 */
export function paintFace(
  expression: Expression,
  skinTone: string,
  width = 128,
  height = 128,
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(width, height);

  // Fill with skin tone base
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, width, height);

  // Subtle warmth overlay for depth
  ctx.globalAlpha = 0.08;
  const warm = shiftColor(skinTone, 15);
  ctx.fillStyle = warm;
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.55, width * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cx = width * 0.5;
  const cy = height * 0.5;
  const eyeSpacing = width * 0.14;
  const eyeY = cy - height * 0.04;

  switch (expression) {
    case 'happy':
      drawHappyFace(ctx, cx, eyeY, eyeSpacing, width);
      break;
    case 'angry':
      drawAngryFace(ctx, cx, eyeY, eyeSpacing, width);
      break;
    case 'sad':
      drawSadFace(ctx, cx, eyeY, eyeSpacing, width);
      break;
    case 'suspicious':
      drawSuspiciousFace(ctx, cx, eyeY, eyeSpacing, width);
      break;
    case 'neutral':
    default:
      drawNeutralFace(ctx, cx, eyeY, eyeSpacing, width);
      break;
  }

  const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// Expression painters
// ---------------------------------------------------------------------------

function drawNeutralFace(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number, eyeY: number, eyeSpacing: number, size: number,
): void {
  // Dot eyes
  ctx.fillStyle = '#1A1A1A';
  drawDotEye(ctx, cx - eyeSpacing, eyeY, size * 0.035);
  drawDotEye(ctx, cx + eyeSpacing, eyeY, size * 0.035);

  // Tiny eye highlights
  ctx.fillStyle = '#FFFFFF';
  drawDotEye(ctx, cx - eyeSpacing + size * 0.01, eyeY - size * 0.01, size * 0.012);
  drawDotEye(ctx, cx + eyeSpacing + size * 0.01, eyeY - size * 0.01, size * 0.012);

  // Simple straight mouth
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.018;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.06, eyeY + size * 0.16);
  ctx.lineTo(cx + size * 0.06, eyeY + size * 0.16);
  ctx.stroke();

  // Gentle blush
  drawBlush(ctx, cx, eyeY, eyeSpacing, size);
}

function drawHappyFace(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number, eyeY: number, eyeSpacing: number, size: number,
): void {
  // Closed happy eyes (curved lines)
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = size * 0.022;
  ctx.lineCap = 'round';

  // Left eye — upside-down arc
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing, eyeY, size * 0.035, Math.PI, 0);
  ctx.stroke();

  // Right eye
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing, eyeY, size * 0.035, Math.PI, 0);
  ctx.stroke();

  // Curved-up smile
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.arc(cx, eyeY + size * 0.11, size * 0.08, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Extra blush for happiness
  drawBlush(ctx, cx, eyeY, eyeSpacing, size, 0.15);
}

function drawAngryFace(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number, eyeY: number, eyeSpacing: number, size: number,
): void {
  // Angry dot eyes (slightly smaller, more intense)
  ctx.fillStyle = '#1A1A1A';
  drawDotEye(ctx, cx - eyeSpacing, eyeY, size * 0.032);
  drawDotEye(ctx, cx + eyeSpacing, eyeY, size * 0.032);

  // Angled brows
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = 'round';

  // Left brow: slopes down-inward
  ctx.beginPath();
  ctx.moveTo(cx - eyeSpacing - size * 0.04, eyeY - size * 0.07);
  ctx.lineTo(cx - eyeSpacing + size * 0.04, eyeY - size * 0.04);
  ctx.stroke();

  // Right brow: slopes down-inward (mirrored)
  ctx.beginPath();
  ctx.moveTo(cx + eyeSpacing + size * 0.04, eyeY - size * 0.07);
  ctx.lineTo(cx + eyeSpacing - size * 0.04, eyeY - size * 0.04);
  ctx.stroke();

  // Gritting teeth mouth — small open rectangle
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.018;
  const mouthY = eyeY + size * 0.16;
  ctx.beginPath();
  ctx.arc(cx, mouthY - size * 0.02, size * 0.06, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Teeth line
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.04, mouthY + size * 0.01);
  ctx.lineTo(cx + size * 0.04, mouthY + size * 0.01);
  ctx.stroke();
}

function drawSadFace(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number, eyeY: number, eyeSpacing: number, size: number,
): void {
  // Dot eyes slightly upward-looking
  ctx.fillStyle = '#1A1A1A';
  drawDotEye(ctx, cx - eyeSpacing, eyeY - size * 0.01, size * 0.033);
  drawDotEye(ctx, cx + eyeSpacing, eyeY - size * 0.01, size * 0.033);

  // Eye highlights
  ctx.fillStyle = '#FFFFFF';
  drawDotEye(ctx, cx - eyeSpacing + size * 0.01, eyeY - size * 0.025, size * 0.012);
  drawDotEye(ctx, cx + eyeSpacing + size * 0.01, eyeY - size * 0.025, size * 0.012);

  // Sad brows (slight inner tilt up)
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.018;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - eyeSpacing - size * 0.04, eyeY - size * 0.05);
  ctx.lineTo(cx - eyeSpacing + size * 0.03, eyeY - size * 0.07);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeSpacing + size * 0.04, eyeY - size * 0.05);
  ctx.lineTo(cx + eyeSpacing - size * 0.03, eyeY - size * 0.07);
  ctx.stroke();

  // Curved-down mouth
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.018;
  ctx.beginPath();
  ctx.arc(cx, eyeY + size * 0.24, size * 0.07, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  // Teardrop on left cheek
  ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(
    cx - eyeSpacing - size * 0.02, eyeY + size * 0.06,
    size * 0.012, size * 0.018,
    0, 0, Math.PI * 2,
  );
  ctx.fill();
}

function drawSuspiciousFace(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number, eyeY: number, eyeSpacing: number, size: number,
): void {
  // Squinted eyes — horizontal ovals
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing, eyeY, size * 0.035, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing, eyeY, size * 0.035, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flat lowered brows
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.022;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - eyeSpacing - size * 0.04, eyeY - size * 0.04);
  ctx.lineTo(cx - eyeSpacing + size * 0.04, eyeY - size * 0.04);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + eyeSpacing - size * 0.04, eyeY - size * 0.04);
  ctx.lineTo(cx + eyeSpacing + size * 0.04, eyeY - size * 0.04);
  ctx.stroke();

  // Skewed little mouth (one side up)
  ctx.strokeStyle = '#2D1810';
  ctx.lineWidth = size * 0.016;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.05, eyeY + size * 0.16);
  ctx.quadraticCurveTo(cx, eyeY + size * 0.17, cx + size * 0.05, eyeY + size * 0.14);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function drawDotEye(
  ctx: OffscreenCanvasRenderingContext2D,
  x: number, y: number, radius: number,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlush(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number, eyeY: number, eyeSpacing: number, size: number,
  alpha = 0.1,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FF9999';
  ctx.beginPath();
  ctx.ellipse(
    cx - eyeSpacing - size * 0.02, eyeY + size * 0.08,
    size * 0.04, size * 0.025, 0, 0, Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    cx + eyeSpacing + size * 0.02, eyeY + size * 0.08,
    size * 0.04, size * 0.025, 0, 0, Math.PI * 2,
  );
  ctx.fill();
  ctx.globalAlpha = 1;
}
