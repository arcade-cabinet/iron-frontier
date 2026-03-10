import type * as THREE from 'three';
import type {
  DamageNumberData,
  DeathEffectData,
  HitMarkerData,
  ImpactSparkData,
  MuzzleFlashData,
} from './HitEffects';
import type { EnemyAIState } from './EnemyAI';

export type ReloadPhase = 'none' | 'starting' | 'reloading' | 'finishing';

export interface WeaponRuntimeState {
  weaponId: string;
  ammoInMagazine: number;
  ammoReserve: number;
  fireCooldown: number;
  reloadPhase: ReloadPhase;
  reloadTimer: number;
  currentSpread: number;
}

export interface CombatEnemy {
  entityId: string;
  enemyId: string;
  level: number;
  meshGroup: THREE.Group;
  ai: EnemyAIState;
}

export interface KilledEnemyData {
  entityId: string;
  enemyId: string;
  enemyType: string;
  xpReward: number;
  goldReward: number;
  lootTable: {
    always: string[];
    common: string[];
    uncommon: string[];
    rare: string[];
  };
  deathPosition: { x: number; y: number; z: number };
}

export interface CombatTickResult {
  damageNumbers: DamageNumberData[];
  hitMarker: HitMarkerData | null;
  muzzleFlash: MuzzleFlashData | null;
  deathEffects: DeathEffectData[];
  impactSparks: ImpactSparkData[];
  playerDamageEvents: Array<{
    damage: number;
    attackerEntityId: string;
    attackDirection: { x: number; y: number; z: number };
  }>;
  killedEnemies: string[];
  killedEnemyData: KilledEnemyData[];
  playerFired: boolean;
  weaponState: Readonly<WeaponRuntimeState>;
  crosshairSpread: number;
}
