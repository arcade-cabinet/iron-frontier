/**
 * Combat Helpers - Pure functions for combat state construction
 *
 * Extracts combatant building and reward granting logic from
 * the combat slice to keep the slice file under 300 lines.
 *
 * @module game/store/slices/combatHelpers
 */

import type { CombatEncounter } from '../../data/schemas/combat';
import type {
  Combatant,
  EquipmentState,
  InventoryItem,
  PlayerStats,
} from '../types';
import type { CombatDataAccess, CombatSliceDeps } from './combatSlice';

/**
 * Build the player combatant from current player state.
 */
export function buildPlayerCombatant(
  state: {
    playerName: string;
    playerStats: PlayerStats;
    equipment: EquipmentState;
    inventory: InventoryItem[];
  },
  dataAccess: CombatDataAccess
): Combatant {
  const equippedWeaponId = state.equipment.weapon
    ? state.inventory.find((item) => item.id === state.equipment.weapon)?.itemId ?? null
    : null;
  const weaponDef = equippedWeaponId ? dataAccess.getItem(equippedWeaponId) : null;
  const playerAccuracy = weaponDef?.weaponStats?.accuracy ?? 75;
  const playerBaseDamage = weaponDef?.weaponStats?.damage ?? 10;
  const playerArmor = Object.values(state.equipment)
    .map((equippedId) =>
      equippedId ? state.inventory.find((item) => item.id === equippedId) : null
    )
    .filter(Boolean)
    .reduce((total, item) => {
      const def = item ? dataAccess.getItem(item.itemId) : null;
      return total + (def?.armorStats?.defense ?? 0);
    }, 0);
  const playerAp = Math.max(4, Math.min(10, Math.round(state.playerStats.stamina / 25)));
  const playerAmmo = weaponDef?.weaponStats?.clipSize ?? 0;

  return {
    definitionId: `player_${Date.now()}`,
    name: state.playerName || 'Stranger',
    isPlayer: true,
    health: state.playerStats.health,
    maxHealth: state.playerStats.maxHealth,
    actionPoints: playerAp,
    maxActionPoints: playerAp,
    position: { q: 0, r: 0 },
    statusEffects: [],
    weaponId: equippedWeaponId ?? '',
    ammoInClip: playerAmmo,
    baseDamage: playerBaseDamage,
    armor: playerArmor,
    accuracy: playerAccuracy,
    evasion: 10,
    level: state.playerStats.level ?? 1,
    isActive: true,
    hasActed: false,
    isDead: state.playerStats.health <= 0,
  };
}

/**
 * Build enemy combatants from an encounter definition.
 */
export function buildEnemyCombatants(
  encounter: CombatEncounter,
  dataAccess: CombatDataAccess
): Combatant[] {
  const combatants: Combatant[] = [];

  encounter.enemies.forEach((enemyGroup: CombatEncounter['enemies'][number]) => {
    const enemyDef = dataAccess.getEnemyById(enemyGroup.enemyId);
    if (!enemyDef) return;
    const enemyWeapon = enemyDef.weaponId ? dataAccess.getItem(enemyDef.weaponId) : null;
    const enemyAmmo = enemyWeapon?.weaponStats?.clipSize ?? 0;
    const enemyAccuracy = Math.min(95, Math.max(5, 70 + (enemyDef.accuracyMod ?? 0)));

    for (let i = 0; i < enemyGroup.count; i += 1) {
      const instanceId = `${enemyGroup.enemyId}_${i + 1}_${Date.now()}`;
      combatants.push({
        definitionId: instanceId,
        name: enemyGroup.count > 1 ? `${enemyDef.name} ${i + 1}` : enemyDef.name,
        isPlayer: false,
        health: enemyDef.maxHealth,
        maxHealth: enemyDef.maxHealth,
        actionPoints: enemyDef.actionPoints,
        maxActionPoints: enemyDef.actionPoints,
        position: { q: i + 1, r: 1 },
        statusEffects: [],
        weaponId: enemyDef.weaponId ?? '',
        ammoInClip: enemyAmmo,
        baseDamage: enemyDef.baseDamage,
        armor: enemyDef.armor,
        accuracy: enemyAccuracy,
        evasion: enemyDef.evasion ?? 10,
        level: Math.max(1, encounter.minLevel ?? 1),
        isActive: false,
        hasActed: false,
        isDead: false,
      });
    }
  });

  return combatants;
}

/**
 * Grant encounter rewards (XP, gold, items) to the player.
 */
export function grantEncounterRewards(
  encounter: CombatEncounter | undefined,
  state: Pick<CombatSliceDeps, 'gainXP' | 'addGold' | 'addItemById'>
): void {
  if (!encounter?.rewards) return;
  const rewards = encounter.rewards;
  if (rewards.xp) state.gainXP(rewards.xp);
  if (rewards.gold) state.addGold(rewards.gold);
  rewards.items?.forEach((item: { itemId: string; quantity: number; chance: number }) => {
    const roll = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    if (roll <= (item.chance ?? 1)) {
      state.addItemById(item.itemId, item.quantity ?? 1);
    }
  });
}
