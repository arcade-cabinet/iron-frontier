import { getWeaponConfig } from './DamageCalculator';
import type { WeaponRuntimeState } from './combatTypes';

export const SPREAD_PER_SHOT = 3.0;
export const SPREAD_MOVEMENT = 0.5;
export const SPREAD_DECAY_RATE = 4.0;
export const MAX_SPREAD = 0.15;

export function createWeaponState(weaponId: string, reserveAmmo: number = 60): WeaponRuntimeState {
  const config = getWeaponConfig(weaponId);
  return {
    weaponId,
    ammoInMagazine: config?.ammoCapacity ?? 6,
    ammoReserve: config?.ammoType === 'none' ? 0 : reserveAmmo,
    fireCooldown: 0,
    reloadPhase: 'none',
    reloadTimer: 0,
    currentSpread: 0,
  };
}
