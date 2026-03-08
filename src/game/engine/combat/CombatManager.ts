// CombatManager — Central FPS combat system for Iron Frontier.
//
// Processes fire/aim/reload from InputFrame each tick. Performs raycast hit
// detection, manages weapon cooldowns, ammo state, and the reload state machine.
// Drives enemy AI updates and aggregates combat events (hits, kills, effects).
//
// Designed as a pure system: no React, no rendering. The processCombatTick()
// function is called from a R3F useFrame hook and returns combat events for
// the UI layer to consume.

import * as THREE from 'three';
import type { InputFrame } from '@/src/game/input/InputFrame';
import {
  calculateDamage,
  calculateEnemyDamage,
  getWeaponConfig,
  getEnemyConfig,
  type DifficultyLevel,
  type WeaponConfig,
} from './DamageCalculator';
import {
  createDamageNumber,
  createDeathEffect,
  createHitMarker,
  createImpactSpark,
  createMuzzleFlash,
  type DamageNumberData,
  type DeathEffectData,
  type HitMarkerData,
  type ImpactSparkData,
  type MuzzleFlashData,
} from './HitEffects';
import {
  updateEnemyAI,
  applyAIMovement,
  updateAIEntityManager,
  type EnemyAIState,
} from './EnemyAI';
import { HEAD_RADIUS } from '@/src/game/engine/renderers/ChibiRenderer';

// ---------------------------------------------------------------------------
// Reload state machine
// ---------------------------------------------------------------------------

export type ReloadPhase = 'none' | 'starting' | 'reloading' | 'finishing';

// ---------------------------------------------------------------------------
// Weapon runtime state
// ---------------------------------------------------------------------------

export interface WeaponRuntimeState {
  /** Weapon config ID. */
  weaponId: string;
  /** Ammo currently in the magazine. */
  ammoInMagazine: number;
  /** Total reserve ammo the player carries for this weapon type. */
  ammoReserve: number;
  /** Fire cooldown remaining (seconds). */
  fireCooldown: number;
  /** Reload state machine phase. */
  reloadPhase: ReloadPhase;
  /** Reload timer remaining (seconds). */
  reloadTimer: number;
  /** Accumulated spread from firing (decays over time). */
  currentSpread: number;
}

// ---------------------------------------------------------------------------
// Enemy target (the CombatManager's view of an enemy entity)
// ---------------------------------------------------------------------------

export interface CombatEnemy {
  /** Unique entity ID. */
  entityId: string;
  /** Enemy definition ID (from enemies.json). */
  enemyId: string;
  /** Current level. */
  level: number;
  /** Reference to the Three.js mesh group for raycasting. */
  meshGroup: THREE.Group;
  /** AI state. */
  ai: EnemyAIState;
}

// ---------------------------------------------------------------------------
// Combat tick result (events this frame)
// ---------------------------------------------------------------------------

/** Data for an enemy killed this frame, used by the UI layer to grant rewards. */
export interface KilledEnemyData {
  /** The combat entity ID. */
  entityId: string;
  /** The enemy definition ID (from enemies.json). */
  enemyId: string;
  /** Enemy type string (e.g. 'bandit', 'animal'). */
  enemyType: string;
  /** XP reward from the enemy config. */
  xpReward: number;
  /** Gold reward from the enemy config. */
  goldReward: number;
  /** Loot table from the enemy config. */
  lootTable: {
    always: string[];
    common: string[];
    uncommon: string[];
    rare: string[];
  };
  /** World position where the enemy died. */
  deathPosition: { x: number; y: number; z: number };
}

export interface CombatTickResult {
  /** Damage numbers to display. */
  damageNumbers: DamageNumberData[];
  /** Hit marker data (if player landed a hit this frame). */
  hitMarker: HitMarkerData | null;
  /** Muzzle flash data (if player fired). */
  muzzleFlash: MuzzleFlashData | null;
  /** Death effects for enemies killed this frame. */
  deathEffects: DeathEffectData[];
  /** Impact sparks for missed shots. */
  impactSparks: ImpactSparkData[];
  /** Enemy attacks that hit the player. */
  playerDamageEvents: Array<{
    damage: number;
    attackerEntityId: string;
    attackDirection: { x: number; y: number; z: number };
  }>;
  /** Enemies killed this frame (entity IDs). */
  killedEnemies: string[];
  /** Full kill data for reward processing. */
  killedEnemyData: KilledEnemyData[];
  /** Whether the player fired this frame. */
  playerFired: boolean;
  /** Current weapon state snapshot. */
  weaponState: Readonly<WeaponRuntimeState>;
  /** Current crosshair spread (for UI rendering). */
  crosshairSpread: number;
}

// ---------------------------------------------------------------------------
// Raycaster setup
// ---------------------------------------------------------------------------

const _raycaster = new THREE.Raycaster();
const _tempVec3 = new THREE.Vector3();

// Headshot zone: upper 30% of the head sphere on chibi characters.
// Chibi head center is at roughly (body height + head radius) above feet.
// Total chibi height ~ 1.3 units. Head center ~ 1.15 units up.
const CHIBI_HEAD_CENTER_Y = 1.15;
const HEADSHOT_ZONE_MIN_Y = CHIBI_HEAD_CENTER_Y + HEAD_RADIUS * 0.4; // Upper 30% of head sphere

// ---------------------------------------------------------------------------
// Spread constants
// ---------------------------------------------------------------------------

/** How fast spread accumulates per shot (multiplied by weapon.spread). */
const SPREAD_PER_SHOT = 3.0;
/** Spread added by movement (walking). */
const SPREAD_MOVEMENT = 0.5;
/** How fast spread decays per second. */
const SPREAD_DECAY_RATE = 4.0;
/** Maximum spread cap. */
const MAX_SPREAD = 0.15;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create initial weapon runtime state.
 */
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

// ---------------------------------------------------------------------------
// Main combat tick
// ---------------------------------------------------------------------------

/**
 * Process one frame of FPS combat. Call from useFrame.
 *
 * @param dt - Delta time in seconds
 * @param inputFrame - Current input state
 * @param camera - Three.js camera (for raycast origin)
 * @param scene - Three.js scene (for raycasting against geometry)
 * @param enemies - Currently active combat enemies
 * @param weaponState - Mutable weapon runtime state
 * @param difficulty - Current difficulty level
 * @param playerArmor - Player's current armor value
 * @returns Events that occurred this frame
 */
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

  // -----------------------------------------------------------------------
  // Update spread decay
  // -----------------------------------------------------------------------
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

  // ADS (aim down sights) reduces spread
  if (inputFrame.aim) {
    weaponState.currentSpread *= 0.5;
  }

  // -----------------------------------------------------------------------
  // Update fire cooldown
  // -----------------------------------------------------------------------
  if (weaponState.fireCooldown > 0) {
    weaponState.fireCooldown -= dt;
  }

  // -----------------------------------------------------------------------
  // Reload state machine
  // -----------------------------------------------------------------------
  if (weaponState.reloadPhase !== 'none') {
    weaponState.reloadTimer -= dt;

    if (weaponState.reloadTimer <= 0) {
      switch (weaponState.reloadPhase) {
        case 'starting':
          weaponState.reloadPhase = 'reloading';
          weaponState.reloadTimer = weaponConfig.reloadTime * 0.6;
          break;
        case 'reloading': {
          // Actually reload ammo
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

    // Can't fire while reloading
    result.crosshairSpread = weaponState.currentSpread;
    updateEnemies(dt, enemies, camera, difficulty, playerArmor, false, result);
    return result;
  }

  // -----------------------------------------------------------------------
  // Handle reload input
  // -----------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  // Auto-reload when magazine empty and player tries to fire
  // -----------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  // Handle fire input
  // -----------------------------------------------------------------------
  let playerFired = false;

  if (
    inputFrame.fire &&
    weaponState.fireCooldown <= 0 &&
    weaponState.reloadPhase === 'none'
  ) {
    // Melee weapons don't need ammo
    const isMelee = weaponConfig.ammoType === 'none';

    if (isMelee || weaponState.ammoInMagazine > 0) {
      playerFired = true;
      result.playerFired = true;

      // Consume ammo
      if (!isMelee) {
        weaponState.ammoInMagazine--;
      }

      // Set fire cooldown (inverse of fire rate)
      weaponState.fireCooldown = 1.0 / Math.max(0.1, weaponConfig.fireRate);

      // Add spread from firing
      weaponState.currentSpread = Math.min(
        MAX_SPREAD,
        weaponState.currentSpread + weaponConfig.spread * SPREAD_PER_SHOT,
      );

      // Muzzle flash
      const muzzleWorldPos = new THREE.Vector3(0, 0, -0.5);
      muzzleWorldPos.applyMatrix4(camera.matrixWorld);
      result.muzzleFlash = createMuzzleFlash(
        { x: muzzleWorldPos.x, y: muzzleWorldPos.y, z: muzzleWorldPos.z },
      );

      // Perform raycast hit detection
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

  // -----------------------------------------------------------------------
  // Update enemy AI
  // -----------------------------------------------------------------------
  updateEnemies(dt, enemies, camera, difficulty, playerArmor, playerFired, result);

  result.crosshairSpread = weaponState.currentSpread;
  return result;
}

// ---------------------------------------------------------------------------
// Raycast hit detection
// ---------------------------------------------------------------------------

function performRaycast(
  camera: THREE.Camera,
  scene: THREE.Scene,
  enemies: CombatEnemy[],
  weaponState: WeaponRuntimeState,
  weaponConfig: WeaponConfig,
  difficulty: DifficultyLevel,
  result: CombatTickResult,
): void {
  // Apply spread to ray direction
  const spreadX = (Math.random() - 0.5) * weaponState.currentSpread;
  const spreadY = (Math.random() - 0.5) * weaponState.currentSpread;
  const aimPoint = new THREE.Vector2(spreadX, spreadY);

  _raycaster.setFromCamera(aimPoint, camera);

  // Set max distance based on weapon maxRange (or fallback to 1.5x effective range)
  const maxRange = weaponConfig.range > 0
    ? (weaponConfig.maxRange ?? weaponConfig.range * 1.5)
    : 3;
  _raycaster.far = maxRange;

  // Collect all enemy mesh groups for intersection testing
  const enemyMeshes: THREE.Object3D[] = [];
  const meshToEnemy = new Map<THREE.Object3D, CombatEnemy>();

  for (const enemy of enemies) {
    if (enemy.ai.state === 'dead') continue;
    enemyMeshes.push(enemy.meshGroup);
    // Map all descendant meshes to the enemy
    enemy.meshGroup.traverse((child) => {
      meshToEnemy.set(child, enemy);
    });
    meshToEnemy.set(enemy.meshGroup, enemy);
  }

  // Raycast against all objects in the scene (enemies + environment)
  const intersections = _raycaster.intersectObjects(enemyMeshes, true);

  if (intersections.length > 0) {
    const hit = intersections[0];
    const hitEnemy = meshToEnemy.get(hit.object);

    if (hitEnemy) {
      // Determine if headshot (upper 30% of head sphere)
      // The hit point is in world space. We need to check relative to enemy's feet.
      const enemyWorldY = hitEnemy.ai.position.y;
      const hitRelativeY = hit.point.y - enemyWorldY;

      // Account for enemy mesh scale (bandit boss is 1.5x)
      const meshScale = hitEnemy.meshGroup.scale.y;
      const scaledHeadshotMinY = HEADSHOT_ZONE_MIN_Y * meshScale;

      const isHeadshot = hitRelativeY >= scaledHeadshotMinY;

      // Calculate damage
      const dist = hit.distance;
      const enemyConfig = getEnemyConfig(hitEnemy.enemyId);
      const enemyArmor = enemyConfig?.armor ?? 0;

      const damageResult = calculateDamage(
        weaponState.weaponId,
        dist,
        isHeadshot,
        difficulty,
        enemyArmor,
      );

      // Apply damage to enemy
      hitEnemy.ai.health -= damageResult.damage;
      const killed = hitEnemy.ai.health <= 0;

      if (killed) {
        hitEnemy.ai.health = 0;
        hitEnemy.ai.state = 'dead';
        result.killedEnemies.push(hitEnemy.entityId);

        // Death effect
        result.deathEffects.push(
          createDeathEffect(
            hitEnemy.ai.position,
            enemyConfig?.type ?? 'bandit',
          ),
        );

        // Populate kill data for reward processing
        if (enemyConfig) {
          result.killedEnemyData.push({
            entityId: hitEnemy.entityId,
            enemyId: hitEnemy.enemyId,
            enemyType: enemyConfig.type,
            xpReward: enemyConfig.xpReward,
            goldReward: enemyConfig.goldReward,
            lootTable: enemyConfig.lootTable,
            deathPosition: { ...hitEnemy.ai.position },
          });
        }

        // "KILL" damage number (skip numeric damage to avoid duplicate display)
        result.damageNumbers.push(
          createDamageNumber(
            { x: hit.point.x, y: hit.point.y + 0.5, z: hit.point.z },
            0,
            true,
            'KILL',
          ),
        );
      } else {
        // Damage number (only when target survives; kills show "KILL" text instead)
        result.damageNumbers.push(
          createDamageNumber(
            { x: hit.point.x, y: hit.point.y, z: hit.point.z },
            damageResult.damage,
            damageResult.isCritical,
          ),
        );
      }

      // Hit marker
      result.hitMarker = createHitMarker(true, isHeadshot, killed);

      return;
    }
  }

  // If we didn't hit an enemy, check for environment hits
  const envIntersections = _raycaster.intersectObjects(scene.children, true);
  for (const hit of envIntersections) {
    // Skip enemy meshes (already handled)
    if (meshToEnemy.has(hit.object)) continue;

    // Impact spark on environment
    const normal = hit.face
      ? { x: hit.face.normal.x, y: hit.face.normal.y, z: hit.face.normal.z }
      : { x: 0, y: 1, z: 0 };

    result.impactSparks.push(
      createImpactSpark(
        { x: hit.point.x, y: hit.point.y, z: hit.point.z },
        normal,
      ),
    );
    break;
  }
}

// ---------------------------------------------------------------------------
// Enemy AI update
// ---------------------------------------------------------------------------

function updateEnemies(
  dt: number,
  enemies: CombatEnemy[],
  camera: THREE.Camera,
  difficulty: DifficultyLevel,
  playerArmor: number,
  playerFired: boolean,
  result: CombatTickResult,
): void {
  // Update YUKA entity manager
  updateAIEntityManager(dt);

  const playerPos = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  for (const enemy of enemies) {
    if (enemy.ai.state === 'dead') continue;

    // Update AI decision making
    const action = updateEnemyAI(enemy.ai, dt, playerPos, playerFired);

    // Apply movement
    applyAIMovement(enemy.ai, action, dt);

    // Sync mesh group position to AI position
    enemy.meshGroup.position.set(
      enemy.ai.position.x,
      enemy.ai.position.y,
      enemy.ai.position.z,
    );

    // Make enemy face the player when in combat states
    if (
      enemy.ai.state === 'attack' ||
      enemy.ai.state === 'pursue' ||
      enemy.ai.state === 'alert'
    ) {
      _tempVec3.set(playerPos.x, enemy.ai.position.y, playerPos.z);
      enemy.meshGroup.lookAt(_tempVec3);
    }

    // Handle enemy attacks
    if (
      (action.type === 'attack_melee' || action.type === 'attack_ranged') &&
      action.damage != null
    ) {
      const enemyDamage = calculateEnemyDamage(
        enemy.enemyId,
        enemy.level,
        playerArmor,
        difficulty,
        Math.sqrt(
          (playerPos.x - enemy.ai.position.x) ** 2 +
          (playerPos.z - enemy.ai.position.z) ** 2,
        ),
      );

      result.playerDamageEvents.push({
        damage: enemyDamage.damage,
        attackerEntityId: enemy.entityId,
        attackDirection: action.attackDirection ?? { x: 0, y: 0, z: 1 },
      });
    }
  }
}
