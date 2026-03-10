// configLookup — Typed config maps and lookup helpers for weapons, enemies, difficulty.

import weaponsData from '@/config/game/weapons.json';
import enemiesData from '@/config/game/enemies.json';
import difficultyData from '@/config/game/difficulty.json';

import type { WeaponConfig, EnemyConfig, DifficultyConfig, DifficultyLevel } from './damageTypes';

const weaponsByIdMap = new Map<string, WeaponConfig>();
for (const w of weaponsData as WeaponConfig[]) {
  weaponsByIdMap.set(w.id, w);
}

const enemiesByIdMap = new Map<string, EnemyConfig>();
for (const e of enemiesData as EnemyConfig[]) {
  enemiesByIdMap.set(e.id, e);
}

const difficultyMap = difficultyData as Record<DifficultyLevel, DifficultyConfig>;

export function getWeaponConfig(weaponId: string): WeaponConfig | undefined {
  return weaponsByIdMap.get(weaponId);
}

export function getEnemyConfig(enemyId: string): EnemyConfig | undefined {
  return enemiesByIdMap.get(enemyId);
}

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return difficultyMap[level];
}
