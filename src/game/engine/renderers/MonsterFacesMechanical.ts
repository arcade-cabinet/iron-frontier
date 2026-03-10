// MonsterFacesMechanical — Canvas-painted mechanical faceplate textures
//
// Glowing eye slit for clockwork automaton type.

import { CanvasTexture, SRGBColorSpace } from 'three';
import { makeCanvas } from '../materials/canvasUtils';

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
