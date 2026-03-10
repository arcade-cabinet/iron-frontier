import { COMPASS_FOV } from "./constants.ts";

export function normalizeAngle(deg: number): number {
  let a = ((deg % 360) + 360) % 360;
  if (a >= 180) a -= 360;
  return a;
}

export function yawToBearing(yaw: number): number {
  const deg = (yaw * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

export function bearingToCompassX(targetBearing: number, playerBearing: number): number | null {
  const diff = normalizeAngle(targetBearing - playerBearing);
  const halfFov = COMPASS_FOV / 2;
  if (Math.abs(diff) > halfFov) return null;
  return diff / COMPASS_FOV;
}

export function bearingToTarget(px: number, pz: number, tx: number, tz: number): number {
  const dx = tx - px;
  const dz = tz - pz;
  const rad = Math.atan2(dx, dz);
  return ((rad * 180) / Math.PI + 360) % 360;
}
