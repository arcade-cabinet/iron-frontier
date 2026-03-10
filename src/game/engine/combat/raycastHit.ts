import * as THREE from 'three';
import {
  calculateDamage,
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
} from './HitEffects';
import { HEAD_RADIUS } from '@/src/game/engine/renderers/ChibiRenderer';
import { scopedRNG, rngTick } from '../../lib/prng';
import type { CombatEnemy, CombatTickResult, WeaponRuntimeState } from './combatTypes';

const _raycaster = new THREE.Raycaster();

const CHIBI_HEAD_CENTER_Y = 1.15;
const HEADSHOT_ZONE_MIN_Y = CHIBI_HEAD_CENTER_Y + HEAD_RADIUS * 0.4;

export function fireMuzzleFlash(camera: THREE.Camera): ReturnType<typeof createMuzzleFlash> {
  const muzzleWorldPos = new THREE.Vector3(0, 0, -0.5);
  muzzleWorldPos.applyMatrix4(camera.matrixWorld);
  return createMuzzleFlash(
    { x: muzzleWorldPos.x, y: muzzleWorldPos.y, z: muzzleWorldPos.z },
  );
}

export function performRaycast(
  camera: THREE.Camera,
  scene: THREE.Scene,
  enemies: CombatEnemy[],
  weaponState: WeaponRuntimeState,
  weaponConfig: WeaponConfig,
  difficulty: DifficultyLevel,
  result: CombatTickResult,
): void {
  const spreadX = (scopedRNG('combat', 42, rngTick()) - 0.5) * weaponState.currentSpread;
  const spreadY = (scopedRNG('combat', 42, rngTick()) - 0.5) * weaponState.currentSpread;
  const aimPoint = new THREE.Vector2(spreadX, spreadY);

  _raycaster.setFromCamera(aimPoint, camera);

  const maxRange = weaponConfig.range > 0
    ? (weaponConfig.maxRange ?? weaponConfig.range * 1.5)
    : 3;
  _raycaster.far = maxRange;

  const enemyMeshes: THREE.Object3D[] = [];
  const meshToEnemy = new Map<THREE.Object3D, CombatEnemy>();

  for (const enemy of enemies) {
    if (enemy.ai.state === 'dead') continue;
    enemyMeshes.push(enemy.meshGroup);
    enemy.meshGroup.traverse((child) => {
      meshToEnemy.set(child, enemy);
    });
    meshToEnemy.set(enemy.meshGroup, enemy);
  }

  const intersections = _raycaster.intersectObjects(enemyMeshes, true);

  if (intersections.length > 0) {
    const hit = intersections[0];
    const hitEnemy = meshToEnemy.get(hit.object);

    if (hitEnemy) {
      const enemyWorldY = hitEnemy.ai.position.y;
      const hitRelativeY = hit.point.y - enemyWorldY;
      const meshScale = hitEnemy.meshGroup.scale.y;
      const scaledHeadshotMinY = HEADSHOT_ZONE_MIN_Y * meshScale;
      const isHeadshot = hitRelativeY >= scaledHeadshotMinY;

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

      hitEnemy.ai.health -= damageResult.damage;
      const killed = hitEnemy.ai.health <= 0;

      if (killed) {
        hitEnemy.ai.health = 0;
        hitEnemy.ai.state = 'dead';
        result.killedEnemies.push(hitEnemy.entityId);

        result.deathEffects.push(
          createDeathEffect(
            hitEnemy.ai.position,
            enemyConfig?.type ?? 'bandit',
          ),
        );

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

        result.damageNumbers.push(
          createDamageNumber(
            { x: hit.point.x, y: hit.point.y + 0.5, z: hit.point.z },
            0,
            true,
            'KILL',
          ),
        );
      } else {
        result.damageNumbers.push(
          createDamageNumber(
            { x: hit.point.x, y: hit.point.y, z: hit.point.z },
            damageResult.damage,
            damageResult.isCritical,
          ),
        );
      }

      result.hitMarker = createHitMarker(true, isHeadshot, killed);
      return;
    }
  }

  const envIntersections = _raycaster.intersectObjects(scene.children, true);
  for (const hit of envIntersections) {
    if (meshToEnemy.has(hit.object)) continue;

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
