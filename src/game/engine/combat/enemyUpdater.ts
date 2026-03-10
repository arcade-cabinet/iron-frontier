import * as THREE from 'three';
import { calculateEnemyDamage, type DifficultyLevel } from './DamageCalculator';
import {
  updateEnemyAI,
  applyAIMovement,
  updateAIEntityManager,
} from './EnemyAI';
import type { CombatEnemy, CombatTickResult } from './combatTypes';

const _tempVec3 = new THREE.Vector3();

export function updateEnemies(
  dt: number,
  enemies: CombatEnemy[],
  camera: THREE.Camera,
  difficulty: DifficultyLevel,
  playerArmor: number,
  playerFired: boolean,
  result: CombatTickResult,
): void {
  updateAIEntityManager(dt);

  const playerPos = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  for (const enemy of enemies) {
    if (enemy.ai.state === 'dead') continue;

    const action = updateEnemyAI(enemy.ai, dt, playerPos, playerFired);
    applyAIMovement(enemy.ai, action, dt);

    enemy.meshGroup.position.set(
      enemy.ai.position.x,
      enemy.ai.position.y,
      enemy.ai.position.z,
    );

    if (
      enemy.ai.state === 'attack' ||
      enemy.ai.state === 'pursue' ||
      enemy.ai.state === 'alert'
    ) {
      _tempVec3.set(playerPos.x, enemy.ai.position.y, playerPos.z);
      enemy.meshGroup.lookAt(_tempVec3);
    }

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
