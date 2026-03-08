/**
 * Combat Slice - Combat state and actions
 *
 * Manages turn-based combat encounters including combatants,
 * actions, targeting, and combat flow.
 *
 * @module game/store/slices/combatSlice
 */

import type { StateCreator } from 'zustand';
import type { CombatEncounter } from '../../data/schemas/combat';
import type {
  CombatActionType,
  CombatPhase,
  CombatResult,
  CombatState,
  Combatant,
  EquipmentState,
  GamePhase,
  InventoryItem,
  Notification,
  PlayerStats,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data access interface for combat operations.
 */
export interface CombatDataAccess {
  getEnemyById: (enemyId: string) => any;
  getEncounterById: (encounterId: string) => CombatEncounter | undefined;
  getItem: (itemId: string) => any;
  calculateHitChance: (attacker: any, target: any, action: any) => number;
  calculateDamage: (attacker: any, target: any, action: any, isCrit: boolean) => number;
  rollHit: (chance: number) => boolean;
  rollCritical: (attacker: any) => boolean;
  AP_COSTS: Record<CombatActionType, number>;
}

/**
 * Combat-specific state.
 */
export interface CombatSliceState {
  /** Current combat state, null if not in combat */
  combatState: CombatState | null;
}

/**
 * Combat actions.
 */
export interface CombatActions {
  /** Start a combat encounter */
  startCombat: (encounterId: string) => void;
  /** Select an action for the current turn */
  selectCombatAction: (action: CombatActionType) => void;
  /** Select a target for the current action */
  selectCombatTarget: (targetId: string) => void;
  /** Execute the selected combat action */
  executeCombatAction: () => void;
  /** End the current combatant's turn */
  endCombatTurn: () => void;
  /** Attempt to flee from combat */
  attemptFlee: () => void;
  /** End combat and return to normal play */
  endCombat: () => void;
  /** Get alive enemies */
  getAliveEnemies: () => Combatant[];
  /** Get the player combatant */
  getPlayerCombatant: () => Combatant | null;
  /** Reset combat state */
  resetCombat: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface CombatSliceDeps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  playerName: string;
  playerStats: PlayerStats;
  equipment: EquipmentState;
  inventory: InventoryItem[];
  gainXP: (amount: number) => void;
  addGold: (amount: number) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  applyCombatFatigue: (intensity?: number) => void;
  // Travel dependencies for mid-travel combat
  travelState: any;
  completeTravel: () => void;
  cancelTravel: () => void;
}

/**
 * Complete combat slice type.
 */
export type CombatSlice = CombatSliceState & CombatActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default combat state.
 */
export const DEFAULT_COMBAT_SLICE_STATE: CombatSliceState = {
  combatState: null,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the combat Zustand slice.
 *
 * @param dataAccess - Data access interface for combat data
 */
export const createCombatSlice = (
  dataAccess: CombatDataAccess
): StateCreator<CombatSlice & CombatSliceDeps, [], [], CombatSlice> => {
  // Helper to grant encounter rewards
  const grantEncounterRewards = (
    encounter: CombatEncounter | undefined,
    state: CombatSlice & CombatSliceDeps
  ) => {
    if (!encounter?.rewards) return;
    const rewards = encounter.rewards;
    if (rewards.xp) state.gainXP(rewards.xp);
    if (rewards.gold) state.addGold(rewards.gold);
    rewards.items?.forEach((item: { itemId: string; quantity: number; chance: number }) => {
      const roll = Math.random();
      if (roll <= (item.chance ?? 1)) {
        state.addItemById(item.itemId, item.quantity ?? 1);
      }
    });
  };

  return (set, get) => ({
    // State
    ...DEFAULT_COMBAT_SLICE_STATE,

    // Actions
    startCombat: (encounterId: string) => {
      const state = get();
      const encounter = dataAccess.getEncounterById(encounterId);
      if (!encounter) {
        state.addNotification('warning', 'Encounter not found.');
        return;
      }

      // Build player combatant
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

      const combatants: Combatant[] = [
        {
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
        },
      ];

      // Build enemy combatants
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

      set({
        combatState: {
          encounterId,
          phase: 'player_turn',
          combatants,
          turnOrder: combatants.map((c) => c.definitionId),
          currentTurnIndex: 0,
          round: 1,
          log: [],
          startedAt: Date.now(),
        },
      });
      state.setPhase('combat');
    },

    selectCombatAction: (action: CombatActionType) => {
      const cs = get().combatState;
      if (cs) set({ combatState: { ...cs, selectedAction: action } });
    },

    selectCombatTarget: (targetId: string) => {
      const cs = get().combatState;
      if (cs) set({ combatState: { ...cs, selectedTargetId: targetId } });
    },

    executeCombatAction: () => {
      const state = get();
      const { combatState } = state;
      if (!combatState || !combatState.selectedAction) return;

      const actorIndex = combatState.currentTurnIndex;
      const actor = combatState.combatants[actorIndex];
      const targetId = combatState.selectedTargetId;
      const targetIndex = combatState.combatants.findIndex((c) => c.definitionId === targetId);
      const target = combatState.combatants[targetIndex];
      const actionType = combatState.selectedAction;
      const apCost = dataAccess.AP_COSTS[actionType];

      // Check AP
      if (actor.actionPoints < apCost) {
        state.addNotification('warning', 'Not enough Action Points!');
        return;
      }

      // Deduct AP
      const newCombatants = [...combatState.combatants];
      newCombatants[actorIndex] = {
        ...actor,
        actionPoints: actor.actionPoints - apCost,
        hasActed: true,
      };

      let resultMessage = '';
      let success = true;
      let damage = 0;
      let isCritical = false;

      // Process Action
      if (actionType === 'attack' || actionType === 'aimed_shot') {
        if (!target) return;

        const hitChance = dataAccess.calculateHitChance(actor, target, { type: actionType });
        const hit = dataAccess.rollHit(hitChance);

        if (hit) {
          isCritical = dataAccess.rollCritical(actor);
          damage = dataAccess.calculateDamage(actor, target, { type: actionType }, isCritical);

          const newHealth = Math.max(0, target.health - damage);
          newCombatants[targetIndex] = {
            ...target,
            health: newHealth,
            isDead: newHealth === 0,
          };

          resultMessage = `${actor.name} hit ${target.name} for ${damage} damage!${
            isCritical ? ' (Critical!)' : ''
          }`;

          if (newHealth === 0) {
            resultMessage += ` ${target.name} was defeated!`;
            if (target.isPlayer) {
              setTimeout(() => state.setPhase('game_over'), 1500);
            }
          }
        } else {
          success = false;
          resultMessage = `${actor.name} missed ${target.name}!`;
        }
      } else if (actionType === 'defend') {
        resultMessage = `${actor.name} takes a defensive stance.`;
      } else if (actionType === 'use_item') {
        resultMessage = `${actor.name} used an item.`;
      }

      const result: CombatResult = {
        action: {
          type: actionType,
          actorId: actor.definitionId,
          targetId,
          apCost,
          timestamp: Date.now(),
        },
        success,
        damage: damage > 0 ? damage : undefined,
        isCritical,
        message: resultMessage,
      };

      const playerAlive = newCombatants.some((c) => c.isPlayer && !c.isDead);
      const enemiesAlive = newCombatants.some((c) => !c.isPlayer && !c.isDead);

      const nextPhase: CombatPhase = !playerAlive
        ? 'defeat'
        : !enemiesAlive
          ? 'victory'
          : combatState.phase;

      set({
        combatState: {
          ...combatState,
          combatants: newCombatants,
          log: [...combatState.log, result],
          selectedAction: undefined,
          selectedTargetId: undefined,
          phase: nextPhase,
        },
      });

      if (nextPhase === 'victory') {
        const encounter = dataAccess.getEncounterById(combatState.encounterId);
        grantEncounterRewards(encounter, state);
        return;
      }

      if (nextPhase === 'defeat') {
        setTimeout(() => state.setPhase('game_over'), 1500);
        return;
      }

      // AI turn continuation
      if (!actor.isPlayer && !newCombatants[actorIndex].isDead) {
        setTimeout(() => {
          const currentState = get().combatState;
          if (!currentState) return;
          if (currentState.currentTurnIndex !== actorIndex) return;
          if (currentState.phase !== 'enemy_turn') return;

          const currentActor = currentState.combatants[actorIndex];
          const apNeeded = dataAccess.AP_COSTS['attack'] ?? 2;
          const playerTarget = currentState.combatants.find((c) => c.isPlayer && !c.isDead);

          if (currentActor.actionPoints >= apNeeded && playerTarget) {
            set((s) => ({
              combatState: {
                ...s.combatState!,
                selectedAction: 'attack',
                selectedTargetId: playerTarget.definitionId,
              },
            }));
            get().executeCombatAction();
          } else {
            get().endCombatTurn();
          }
        }, 800);
      }
    },

    endCombatTurn: () => {
      const state = get();
      const { combatState } = state;
      if (!combatState) return;

      const playerAlive = combatState.combatants.some((c) => c.isPlayer && !c.isDead);
      const enemiesAlive = combatState.combatants.some((c) => !c.isPlayer && !c.isDead);

      if (!playerAlive) {
        set({ combatState: { ...combatState, phase: 'defeat' } });
        return;
      }
      if (!enemiesAlive) {
        set({ combatState: { ...combatState, phase: 'victory' } });
        const encounter = dataAccess.getEncounterById(combatState.encounterId);
        grantEncounterRewards(encounter, state);
        return;
      }

      // Cycle Turn
      let nextIndex = (combatState.currentTurnIndex + 1) % combatState.combatants.length;
      let round = combatState.round;

      if (nextIndex === 0) round++;

      // Skip dead combatants
      let loopCount = 0;
      while (
        combatState.combatants[nextIndex].isDead &&
        loopCount < combatState.combatants.length
      ) {
        nextIndex = (nextIndex + 1) % combatState.combatants.length;
        if (nextIndex === 0) round++;
        loopCount++;
      }

      const newCombatants = [...combatState.combatants];
      const nextCombatant = newCombatants[nextIndex];
      newCombatants[nextIndex] = {
        ...nextCombatant,
        actionPoints: nextCombatant.maxActionPoints,
        hasActed: false,
      };

      const nextPhase: CombatPhase = nextCombatant.isPlayer ? 'player_turn' : 'enemy_turn';

      set({
        combatState: {
          ...combatState,
          currentTurnIndex: nextIndex,
          round,
          phase: nextPhase,
          combatants: newCombatants,
        },
      });

      // Trigger AI
      if (!nextCombatant.isPlayer) {
        setTimeout(() => {
          const playerDef = newCombatants.find((c) => c.isPlayer);
          if (playerDef && !playerDef.isDead) {
            set((s) => ({
              combatState: {
                ...s.combatState!,
                selectedAction: 'attack',
                selectedTargetId: playerDef.definitionId,
              },
            }));
            get().executeCombatAction();
          } else {
            get().endCombatTurn();
          }
        }, 1000);
      }
    },

    attemptFlee: () => {
      const state = get();
      const encounter = state.combatState
        ? dataAccess.getEncounterById(state.combatState.encounterId)
        : null;
      if (encounter && !encounter.canFlee) {
        state.addNotification('warning', "You can't escape this fight!");
        return;
      }

      if (Math.random() > 0.5) {
        set((s) => ({ combatState: { ...s.combatState!, phase: 'fled' } }));
      } else {
        state.addNotification('warning', 'Failed to escape!');
        get().endCombatTurn();
      }
    },

    endCombat: () => {
      const state = get();
      const { combatState, travelState } = state;

      if (
        combatState &&
        travelState?.encounterId &&
        travelState.encounterId === combatState.encounterId
      ) {
        if (combatState.phase === 'victory') {
          set({ combatState: null });
          state.completeTravel();
          return;
        }
        if (combatState.phase === 'fled') {
          set({ combatState: null });
          state.cancelTravel();
          return;
        }
      }

      set({ combatState: null });
      state.setPhase('playing');
      state.applyCombatFatigue(1);
    },

    getAliveEnemies: () => {
      const cs = get().combatState;
      if (!cs) return [];
      return cs.combatants.filter((c) => !c.isPlayer && !c.isDead);
    },

    getPlayerCombatant: () => {
      const cs = get().combatState;
      if (!cs) return null;
      return cs.combatants.find((c) => c.isPlayer) ?? null;
    },

    resetCombat: () => set({ combatState: null }),
  });
};
