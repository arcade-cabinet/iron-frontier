import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';
import type {
  Combatant,
  CombatInitContext,
  CombatState,
  CombatStats,
} from '../types';
import { applyStatusEffectModifiers } from '../damage';
import { generateCombatantId, MAX_LOG_ENTRIES } from './helpers';

export function createPlayerCombatant(
  playerName: string,
  playerStats: CombatStats,
  weaponId: string | null
): Combatant {
  return {
    id: 'player',
    definitionId: 'player',
    name: playerName,
    type: 'player',
    isPlayer: true,
    stats: { ...playerStats },
    statusEffects: [],
    position: { q: 0, r: 0 },
    weaponId,
    ammoInClip: 6, // Default ammo
    isAlive: true,
    hasActedThisTurn: false,
  };
}

export function createEnemyCombatant(enemy: EnemyDefinition, index: number): Combatant {
  const stats: CombatStats = {
    hp: enemy.maxHealth,
    maxHP: enemy.maxHealth,
    attack: enemy.baseDamage,
    defense: enemy.armor,
    speed: enemy.actionPoints, // Use AP as speed proxy
    accuracy: 70 + enemy.accuracyMod,
    evasion: enemy.evasion,
    critChance: 5,
    critMultiplier: 1.5,
  };

  return {
    id: generateCombatantId(enemy.id, index),
    definitionId: enemy.id,
    name: index > 0 ? `${enemy.name} ${String.fromCharCode(65 + index)}` : enemy.name,
    type: 'enemy',
    isPlayer: false,
    stats,
    statusEffects: [],
    position: { q: 1 + index, r: 0 },
    weaponId: enemy.weaponId || null,
    ammoInClip: 6,
    isAlive: true,
    hasActedThisTurn: false,
    behavior: enemy.behavior,
    modelId: enemy.modelId,
    xpReward: enemy.xpReward,
    goldReward: enemy.goldReward,
    lootTableId: enemy.lootTableId,
  };
}

export function initializeCombat(
  encounter: CombatEncounter,
  context: CombatInitContext,
  getEnemyById: (id: string) => EnemyDefinition | undefined
): CombatState {
  const combatants: Combatant[] = [];

  // Add player
  const player = createPlayerCombatant(
    context.playerName,
    context.playerStats,
    context.playerWeaponId
  );
  combatants.push(player);

  // Add allies if any
  if (context.allies) {
    combatants.push(...context.allies);
  }

  // Add enemies from encounter
  let enemyIndex = 0;
  for (const enemyEntry of encounter.enemies) {
    const enemyDef = getEnemyById(enemyEntry.enemyId);
    if (!enemyDef) continue;

    for (let i = 0; i < enemyEntry.count; i++) {
      combatants.push(createEnemyCombatant(enemyDef, enemyIndex));
      enemyIndex++;
    }
  }

  // Calculate turn order based on speed
  const turnOrder = calculateTurnOrder(combatants);

  return {
    id: `combat_${Date.now()}`,
    encounterId: encounter.id,
    phase: 'initializing',
    combatants,
    turnOrder,
    currentTurnIndex: 0,
    round: 1,
    log: [],
    maxLogEntries: MAX_LOG_ENTRIES,
    startedAt: Date.now(),
    canFlee: encounter.canFlee,
    isBoss: encounter.isBoss,
  };
}

export function calculateTurnOrder(combatants: Combatant[]): string[] {
  return combatants
    .filter((c) => c.isAlive)
    .sort((a, b) => {
      // Apply status effect modifiers to get effective speed
      const aStats = applyStatusEffectModifiers(a.stats, a.statusEffects);
      const bStats = applyStatusEffectModifiers(b.stats, b.statusEffects);
      // Higher speed goes first, break ties with random
      if (bStats.speed !== aStats.speed) {
        return bStats.speed - aStats.speed;
      }
      // Player wins ties
      if (a.isPlayer) return -1;
      if (b.isPlayer) return 1;
      return 0;
    })
    .map((c) => c.id);
}
