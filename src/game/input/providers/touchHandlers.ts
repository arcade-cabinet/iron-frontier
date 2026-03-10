// touchHandlers — Touch event handling and gesture recognition for TouchProvider.

export interface TrackedTouch {
  zone: 'joystick' | 'look' | 'action';
  anchorX: number;
  anchorY: number;
  currentX: number;
  currentY: number;
  prevX: number;
  prevY: number;
}

export type ActionButton = 'fire' | 'reload' | 'interact' | 'jump';

export function makeTracked(zone: TrackedTouch['zone'], x: number, y: number): TrackedTouch {
  return { zone, anchorX: x, anchorY: y, currentX: x, currentY: y, prevX: x, prevY: y };
}

export function screenW(): number {
  return typeof globalThis.innerWidth === 'number' ? globalThis.innerWidth : 800;
}

export function screenH(): number {
  return typeof globalThis.innerHeight === 'number' ? globalThis.innerHeight : 600;
}

/**
 * Hit-test action zones in the bottom-right quadrant:
 *   +----------+----------+
 *   | interact |  reload  |   upper half
 *   +----------+----------+
 *   |   jump   |   fire   |   lower half
 *   +----------+----------+
 */
export function hitTestAction(
  x: number,
  y: number,
  sw: number,
  sh: number,
): ActionButton | null {
  const halfW = sw * 0.5;
  const halfH = sh * 0.5;
  if (x < halfW || y < halfH) return null;

  const midX = (sw + halfW) * 0.5; // 75% of screen width
  const midY = (sh + halfH) * 0.5; // 75% of screen height

  if (y < midY) return x < midX ? 'interact' : 'reload';
  return x < midX ? 'jump' : 'fire';
}

/** Check if any tracked touch is in the given zone. */
export function hasZoneTouch(
  touches: Map<number, TrackedTouch>,
  zone: TrackedTouch['zone'],
): boolean {
  for (const tracked of touches.values()) {
    if (tracked.zone === zone) return true;
  }
  return false;
}
