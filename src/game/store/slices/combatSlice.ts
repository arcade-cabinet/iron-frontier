/**
 * Combat Slice - Turn-based combat state and actions
 * @module game/store/slices/combatSlice
 */
import type { StateCreator } from 'zustand';
import type { CombatEncounter } from '../../data/schemas/combat';
import type { CombatActionType, CombatPhase, CombatResult, CombatState, Combatant, EquipmentState, GamePhase, InventoryItem, Notification, PlayerStats } from '../types';
import { buildEnemyCombatants, buildPlayerCombatant, grantEncounterRewards } from './combatHelpers';
import { scopedRNG, rngTick } from '../../lib/prng';

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

export interface CombatSliceState { combatState: CombatState | null; }

export interface CombatActions {
  startCombat: (encounterId: string) => void;
  selectCombatAction: (action: CombatActionType) => void;
  selectCombatTarget: (targetId: string) => void;
  executeCombatAction: () => void;
  endCombatTurn: () => void;
  attemptFlee: () => void;
  endCombat: () => void;
  getAliveEnemies: () => Combatant[];
  getPlayerCombatant: () => Combatant | null;
  resetCombat: () => void;
}

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
  travelState: any;
  completeTravel: () => void;
  cancelTravel: () => void;
}

export type CombatSlice = CombatSliceState & CombatActions;

export const DEFAULT_COMBAT_SLICE_STATE: CombatSliceState = { combatState: null };

export const createCombatSlice = (
  dataAccess: CombatDataAccess
): StateCreator<CombatSlice & CombatSliceDeps, [], [], CombatSlice> => {
  return (set, get) => ({
    ...DEFAULT_COMBAT_SLICE_STATE,

    startCombat: (encounterId: string) => {
      const state = get();
      const encounter = dataAccess.getEncounterById(encounterId);
      if (!encounter) {
        state.addNotification('warning', 'Encounter not found.');
        return;
      }

      const player = buildPlayerCombatant(state, dataAccess);
      const enemies = buildEnemyCombatants(encounter, dataAccess);
      const combatants = [player, ...enemies];

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
      const targetIndex = combatState.combatants.findIndex(
        (c) => c.definitionId === targetId
      );
      const target = combatState.combatants[targetIndex];
      const actionType = combatState.selectedAction;
      const apCost = dataAccess.AP_COSTS[actionType];

      if (actor.actionPoints < apCost) {
        state.addNotification('warning', 'Not enough Action Points!');
        return;
      }

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

      if (actionType === 'attack' || actionType === 'aimed_shot') {
        if (!target) return;
        const hitChance = dataAccess.calculateHitChance(actor, target, { type: actionType });
        const hit = dataAccess.rollHit(hitChance);

        if (hit) {
          isCritical = dataAccess.rollCritical(actor);
          damage = dataAccess.calculateDamage(actor, target, { type: actionType }, isCritical);
          const newHealth = Math.max(0, target.health - damage);
          newCombatants[targetIndex] = { ...target, health: newHealth, isDead: newHealth === 0 };
          resultMessage = `${actor.name} hit ${target.name} for ${damage} damage!${isCritical ? ' (Critical!)' : ''}`;
          if (newHealth === 0) {
            resultMessage += ` ${target.name} was defeated!`;
            if (target.isPlayer) setTimeout(() => state.setPhase('game_over'), 1500);
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
        action: { type: actionType, actorId: actor.definitionId, targetId, apCost, timestamp: Date.now() },
        success,
        damage: damage > 0 ? damage : undefined,
        isCritical,
        message: resultMessage,
      };

      const playerAlive = newCombatants.some((c) => c.isPlayer && !c.isDead);
      const enemiesAlive = newCombatants.some((c) => !c.isPlayer && !c.isDead);
      const nextPhase: CombatPhase = !playerAlive ? 'defeat' : !enemiesAlive ? 'victory' : combatState.phase;

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
        grantEncounterRewards(dataAccess.getEncounterById(combatState.encounterId), state);
        return;
      }
      if (nextPhase === 'defeat') {
        setTimeout(() => state.setPhase('game_over'), 1500);
        return;
      }

      // AI turn continuation
      if (!actor.isPlayer && !newCombatants[actorIndex].isDead) {
        setTimeout(() => {
          const cs = get().combatState;
          if (!cs || cs.currentTurnIndex !== actorIndex || cs.phase !== 'enemy_turn') return;
          const currentActor = cs.combatants[actorIndex];
          const apNeeded = dataAccess.AP_COSTS['attack'] ?? 2;
          const playerTarget = cs.combatants.find((c) => c.isPlayer && !c.isDead);
          if (currentActor.actionPoints >= apNeeded && playerTarget) {
            set((s) => ({
              combatState: { ...s.combatState!, selectedAction: 'attack', selectedTargetId: playerTarget.definitionId },
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

      if (!playerAlive) { set({ combatState: { ...combatState, phase: 'defeat' } }); return; }
      if (!enemiesAlive) {
        set({ combatState: { ...combatState, phase: 'victory' } });
        grantEncounterRewards(dataAccess.getEncounterById(combatState.encounterId), state);
        return;
      }

      let nextIndex = (combatState.currentTurnIndex + 1) % combatState.combatants.length;
      let round = combatState.round;
      if (nextIndex === 0) round++;

      let loopCount = 0;
      while (combatState.combatants[nextIndex].isDead && loopCount < combatState.combatants.length) {
        nextIndex = (nextIndex + 1) % combatState.combatants.length;
        if (nextIndex === 0) round++;
        loopCount++;
      }

      const newCombatants = [...combatState.combatants];
      const nextCombatant = newCombatants[nextIndex];
      newCombatants[nextIndex] = { ...nextCombatant, actionPoints: nextCombatant.maxActionPoints, hasActed: false };
      const nextPhase: CombatPhase = nextCombatant.isPlayer ? 'player_turn' : 'enemy_turn';

      set({ combatState: { ...combatState, currentTurnIndex: nextIndex, round, phase: nextPhase, combatants: newCombatants } });

      if (!nextCombatant.isPlayer) {
        setTimeout(() => {
          const playerDef = newCombatants.find((c) => c.isPlayer);
          if (playerDef && !playerDef.isDead) {
            set((s) => ({ combatState: { ...s.combatState!, selectedAction: 'attack', selectedTargetId: playerDef.definitionId } }));
            get().executeCombatAction();
          } else {
            get().endCombatTurn();
          }
        }, 1000);
      }
    },

    attemptFlee: () => {
      const state = get();
      const encounter = state.combatState ? dataAccess.getEncounterById(state.combatState.encounterId) : null;
      if (encounter && !encounter.canFlee) {
        state.addNotification('warning', "You can't escape this fight!");
        return;
      }
      if (scopedRNG('combat', 42, rngTick()) > 0.5) {
        set((s) => ({ combatState: { ...s.combatState!, phase: 'fled' } }));
      } else {
        state.addNotification('warning', 'Failed to escape!');
        get().endCombatTurn();
      }
    },

    endCombat: () => {
      const state = get();
      const { combatState, travelState } = state;
      if (combatState && travelState?.encounterId && travelState.encounterId === combatState.encounterId) {
        if (combatState.phase === 'victory') { set({ combatState: null }); state.completeTravel(); return; }
        if (combatState.phase === 'fled') { set({ combatState: null }); state.cancelTravel(); return; }
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
