import * as THREE from 'three';
import type { InputFrame } from '@/src/game/input/InputFrame';
import { getWeaponConfig, type DifficultyLevel } from './DamageCalculator';
import { performRaycast, fireMuzzleFlash } from './raycastHit';
import { updateEnemies } from './enemyUpdater';
import {
  SPREAD_PER_SHOT,
  SPREAD_MOVEMENT,
  SPREAD_DECAY_RATE,
  MAX_SPREAD,
} from './weaponState';
import type {
  CombatEnemy,
  CombatTickResult,
  WeaponRuntimeState,
} from './combatTypes';

export type {
  ReloadPhase,
  WeaponRuntimeState,
  CombatEnemy,
  KilledEnemyData,
  CombatTickResult,
} from './combatTypes';
export { createWeaponState } from './weaponState';

export function processCombatTick(
  dt: number,
  inputFrame: Readonly<InputFrame>,
  camera: THREE.Camera,
  scene: THREE.Scene,
  enemies: CombatEnemy[],
  weaponState: WeaponRuntimeState,
  difficulty: DifficultyLevel = 'normal',
  playerArmor: number = 0,
): CombatTickResult {
  const result: CombatTickResult = {
    damageNumbers: [],
    hitMarker: null,
    muzzleFlash: null,
    deathEffects: [],
    impactSparks: [],
    playerDamageEvents: [],
    killedEnemies: [],
    killedEnemyData: [],
    playerFired: false,
    weaponState,
    crosshairSpread: weaponState.currentSpread,
  };

  const weaponConfig = getWeaponConfig(weaponState.weaponId);
  if (!weaponConfig) return result;

  // Update spread decay
  if (weaponState.currentSpread > 0) {
    weaponState.currentSpread = Math.max(
      0,
      weaponState.currentSpread - SPREAD_DECAY_RATE * dt,
    );
  }

  // Movement adds spread
  const moveSpeed = Math.sqrt(
    inputFrame.move.x * inputFrame.move.x +
    inputFrame.move.z * inputFrame.move.z,
  );
  if (moveSpeed > 0.1) {
    weaponState.currentSpread = Math.min(
      MAX_SPREAD,
      weaponState.currentSpread + SPREAD_MOVEMENT * dt,
    );
  }

  // ADS reduces spread
  if (inputFrame.aim) {
    weaponState.currentSpread *= 0.5;
  }

  // Update fire cooldown
  if (weaponState.fireCooldown > 0) {
    weaponState.fireCooldown -= dt;
  }

  // Reload state machine
  if (weaponState.reloadPhase !== 'none') {
    weaponState.reloadTimer -= dt;

    if (weaponState.reloadTimer <= 0) {
      switch (weaponState.reloadPhase) {
        case 'starting':
          weaponState.reloadPhase = 'reloading';
          weaponState.reloadTimer = weaponConfig.reloadTime * 0.6;
          break;
        case 'reloading': {
          const needed = weaponConfig.ammoCapacity - weaponState.ammoInMagazine;
          const available = Math.min(needed, weaponState.ammoReserve);
          weaponState.ammoInMagazine += available;
          weaponState.ammoReserve -= available;
          weaponState.reloadPhase = 'finishing';
          weaponState.reloadTimer = weaponConfig.reloadTime * 0.2;
          break;
        }
        case 'finishing':
          weaponState.reloadPhase = 'none';
          weaponState.reloadTimer = 0;
          break;
      }
    }

    result.crosshairSpread = weaponState.currentSpread;
    updateEnemies(dt, enemies, camera, difficulty, playerArmor, false, result);
    return result;
  }

  // Handle reload input
  if (
    inputFrame.reload &&
    weaponState.reloadPhase === 'none' &&
    weaponState.ammoInMagazine < weaponConfig.ammoCapacity &&
    weaponState.ammoReserve > 0 &&
    weaponConfig.ammoType !== 'none'
  ) {
    weaponState.reloadPhase = 'starting';
    weaponState.reloadTimer = weaponConfig.reloadTime * 0.2;
    result.crosshairSpread = weaponState.currentSpread;
    updateEnemies(dt, enemies, camera, difficulty, playerArmor, false, result);
    return result;
  }

  // Auto-reload when magazine empty and player tries to fire
  if (
    inputFrame.fire &&
    weaponState.ammoInMagazine <= 0 &&
    weaponState.ammoReserve > 0 &&
    weaponConfig.ammoType !== 'none' &&
    weaponState.reloadPhase === 'none'
  ) {
    weaponState.reloadPhase = 'starting';
    weaponState.reloadTimer = weaponConfig.reloadTime * 0.2;
    result.crosshairSpread = weaponState.currentSpread;
    updateEnemies(dt, enemies, camera, difficulty, playerArmor, false, result);
    return result;
  }

  // Handle fire input
  let playerFired = false;

  if (
    inputFrame.fire &&
    weaponState.fireCooldown <= 0 &&
    weaponState.reloadPhase === 'none'
  ) {
    const isMelee = weaponConfig.ammoType === 'none';

    if (isMelee || weaponState.ammoInMagazine > 0) {
      playerFired = true;
      result.playerFired = true;

      if (!isMelee) {
        weaponState.ammoInMagazine--;
      }

      weaponState.fireCooldown = 1.0 / Math.max(0.1, weaponConfig.fireRate);

      weaponState.currentSpread = Math.min(
        MAX_SPREAD,
        weaponState.currentSpread + weaponConfig.spread * SPREAD_PER_SHOT,
      );

      result.muzzleFlash = fireMuzzleFlash(camera);

      performRaycast(
        camera,
        scene,
        enemies,
        weaponState,
        weaponConfig,
        difficulty,
        result,
      );
    }
  }

  // Update enemy AI
  updateEnemies(dt, enemies, camera, difficulty, playerArmor, playerFired, result);

  result.crosshairSpread = weaponState.currentSpread;
  return result;
}
