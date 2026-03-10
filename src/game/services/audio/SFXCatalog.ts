import { WEAPON_SFX } from './sfxWeapons';
import { COMBAT_SFX } from './sfxCombat';
import { ENVIRONMENT_SFX } from './sfxEnvironment';
import { UI_SFX } from './sfxUI';
import { AMBIENT_SFX } from './sfxAmbient';
import type { SFXEntry } from './sfxTypes';

export const SFX_CATALOG: Record<string, SFXEntry> = {
  ...WEAPON_SFX,
  ...COMBAT_SFX,
  ...ENVIRONMENT_SFX,
  ...UI_SFX,
  ...AMBIENT_SFX,
};

export { type SFXEntry, randomDetune } from './sfxTypes';
export { WEAPON_SOUND_MAP, getWeaponSounds } from './sfxWeaponMap';
