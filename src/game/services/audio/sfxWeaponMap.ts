export const WEAPON_SOUND_MAP: Record<string, { fire: string; reload: string }> = {
  revolver: { fire: 'revolver_fire', reload: 'reload_revolver' },
  rifle: { fire: 'rifle_fire', reload: 'reload_rifle' },
  shotgun: { fire: 'shotgun_fire', reload: 'reload_shotgun' },
  dynamite: { fire: 'dynamite_throw', reload: 'reload_revolver' },
  pickaxe: { fire: 'pickaxe_swing', reload: 'reload_revolver' },
  default: { fire: 'revolver_fire', reload: 'reload_revolver' },
};

export function getWeaponSounds(weaponId: string): { fire: string; reload: string } {
  if (WEAPON_SOUND_MAP[weaponId]) {
    return WEAPON_SOUND_MAP[weaponId];
  }
  for (const [key, sounds] of Object.entries(WEAPON_SOUND_MAP)) {
    if (key !== 'default' && weaponId.toLowerCase().includes(key)) {
      return sounds;
    }
  }
  return WEAPON_SOUND_MAP.default;
}
