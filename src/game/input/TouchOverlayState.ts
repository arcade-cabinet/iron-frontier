// TouchOverlayState — Shared state between TouchOverlay (React component)
// and TouchProvider (input system).
//
// The TouchOverlay writes touch input values here. The TouchProvider reads
// them in poll() when overlayActive is true. This avoids circular imports
// between the component and the provider.

// ---------------------------------------------------------------------------
// Shared state type
// ---------------------------------------------------------------------------

export interface OverlayTouchState {
  moveX: number;
  moveZ: number;
  lookDeltaX: number;
  lookDeltaY: number;
  fire: boolean;
  reload: boolean;
  interact: boolean;
  jump: boolean;
  sprint: boolean;
  menu: boolean;
  weaponSwitch: number;
  /** When true, TouchProvider reads from this state instead of its own handlers */
  overlayActive: boolean;
}

// ---------------------------------------------------------------------------
// Singleton shared state
// ---------------------------------------------------------------------------

export const overlayTouchState: OverlayTouchState = {
  moveX: 0,
  moveZ: 0,
  lookDeltaX: 0,
  lookDeltaY: 0,
  fire: false,
  reload: false,
  interact: false,
  jump: false,
  sprint: false,
  menu: false,
  weaponSwitch: 0,
  overlayActive: false,
};

// ---------------------------------------------------------------------------
// Consumption helpers (called by TouchProvider.poll)
// ---------------------------------------------------------------------------

/**
 * Read and reset accumulated look deltas.
 * Same pattern as mouse delta consumption — read once, then zero out.
 */
export function consumeOverlayLookDeltas(): { x: number; y: number } {
  const x = overlayTouchState.lookDeltaX;
  const y = overlayTouchState.lookDeltaY;
  overlayTouchState.lookDeltaX = 0;
  overlayTouchState.lookDeltaY = 0;
  return { x, y };
}

/**
 * Read and reset the weapon switch flag.
 */
export function consumeOverlayWeaponSwitch(): number {
  const ws = overlayTouchState.weaponSwitch;
  overlayTouchState.weaponSwitch = 0;
  return ws;
}

/**
 * Clear all overlay state. Called when the overlay unmounts.
 */
export function clearOverlayState(): void {
  overlayTouchState.moveX = 0;
  overlayTouchState.moveZ = 0;
  overlayTouchState.lookDeltaX = 0;
  overlayTouchState.lookDeltaY = 0;
  overlayTouchState.fire = false;
  overlayTouchState.reload = false;
  overlayTouchState.interact = false;
  overlayTouchState.jump = false;
  overlayTouchState.sprint = false;
  overlayTouchState.menu = false;
  overlayTouchState.weaponSwitch = 0;
  overlayTouchState.overlayActive = false;
}
