import type { CombatEnemy, DifficultyLevel, WeaponRuntimeState } from "@/src/game/engine/combat";

export interface CombatSystemProps {
  weaponId?: string;
  difficulty?: DifficultyLevel;
  reserveAmmo?: number;
  enemies?: CombatEnemy[];
  locationId?: string;
  onCrosshairSpreadChange?: (spread: number) => void;
  onHitMarker?: (isHeadshot: boolean, isKill: boolean) => void;
  onWeaponStateChange?: (state: Readonly<WeaponRuntimeState>) => void;
  onPlayerDamage?: (damage: number) => void;
  onPlayerDamageDirectional?: (
    damage: number,
    direction: { x: number; y: number; z: number },
  ) => void;
  onWeaponSwitch?: (weaponId: string) => void;
}
