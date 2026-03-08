// InputFrame — Per-tick input state snapshot
// All game code reads from this interface; no provider details leak through.

export interface InputFrame {
  /** Strafe (x: -1 left, +1 right) and forward/back (z: -1 back, +1 forward) */
  move: { x: number; z: number };

  /** Look deltas in radians accumulated this tick */
  look: { yaw: number; pitch: number };

  fire: boolean;
  aim: boolean;
  reload: boolean;
  interact: boolean;
  jump: boolean;
  sprint: boolean;
  inventory: boolean;
  map: boolean;
  menu: boolean;

  /** 0 = no switch, 1-6 = weapon slot */
  weaponSwitch: number;

  // ---------------------------------------------------------------------------
  // VR-specific fields (set by XRControllerProvider when in VR)
  // ---------------------------------------------------------------------------

  /**
   * Right controller world position. When set, combat raycasting uses this
   * as the projectile origin instead of the camera center.
   */
  aimOrigin?: { x: number; y: number; z: number };

  /**
   * Right controller forward vector. When set, combat raycasting uses this
   * as the projectile direction instead of the camera forward.
   */
  aimDirection?: { x: number; y: number; z: number };
}

export function createEmptyFrame(): InputFrame {
  return {
    move: { x: 0, z: 0 },
    look: { yaw: 0, pitch: 0 },
    fire: false,
    aim: false,
    reload: false,
    interact: false,
    jump: false,
    sprint: false,
    inventory: false,
    map: false,
    menu: false,
    weaponSwitch: 0,
  };
}
