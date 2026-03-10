export interface StealthState {
  /** Current detection level (0 = hidden, 100 = fully detected) */
  detectionLevel: number;
  /** Whether the player is currently hidden (detection < 30) */
  isHidden: boolean;
  /** Whether the player is crouching */
  isCrouching: boolean;
  /** Distance to nearest hostile entity (in world units, -1 if none) */
  nearestHostileDistance: number;
}
