import type { StoreApi } from 'zustand';
import type { GameState } from '../store/types';
import { IDLE_PROVISION_RATE } from './types';

export function tickSurvival(
  store: StoreApi<GameState>,
  elapsedGameMinutes: number,
): void {
  const state = store.getState();
  const elapsedHours = elapsedGameMinutes / 60;

  if (elapsedHours <= 0) return;

  const realMinutesElapsed = (elapsedGameMinutes * 4000) / 60_000;

  // --- Idle fatigue (0.5 per real minute, +1.5 at night) ---
  const isNight = state.isNight();
  const idleFatigueRate = 0.5;
  const nightPenaltyRate = isNight ? 1.5 : 0;
  const fatigueGain = (idleFatigueRate + nightPenaltyRate) * realMinutesElapsed;

  if (fatigueGain > 0) {
    const currentFatigue = state.fatigueState.current;
    const newFatigue = Math.min(100, currentFatigue + fatigueGain);
    if (newFatigue !== currentFatigue) {
      state.setFatigue(newFatigue);
    }

    if (currentFatigue < 90 && newFatigue >= 90) {
      state.addNotification('warning', "You're exhausted! Find shelter to rest.");
    } else if (currentFatigue < 75 && newFatigue >= 75) {
      state.addNotification('warning', "You're getting tired...");
    } else if (currentFatigue < 50 && newFatigue >= 50) {
      state.addNotification('warning', 'Weariness slows your movements. You should rest.');
    }
  }

  // --- Passive provision consumption (at reduced idle rate) ---
  const idleConsumptionHours = elapsedHours * IDLE_PROVISION_RATE;
  if (idleConsumptionHours > 0) {
    const foodBefore = state.provisionsState.food;
    const waterBefore = state.provisionsState.water;
    const maxFood = 100;
    const maxWater = 100;

    const consumption = state.consumeProvisions(idleConsumptionHours);

    const afterState = store.getState();
    const foodAfter = afterState.provisionsState.food;
    const waterAfter = afterState.provisionsState.water;

    // --- Food warnings (graduated at 50%, 25%, and 0%) ---
    if (consumption.ranOutOfFood) {
      state.addNotification('warning', "You're starving! Find food immediately.");
    } else if (foodBefore / maxFood > 0.50 && foodAfter / maxFood <= 0.50) {
      state.addNotification('warning', 'Food supplies are getting low.');
    } else if (foodBefore / maxFood > 0.25 && foodAfter / maxFood <= 0.25) {
      state.addNotification('warning', 'Food is critically low. Resupply soon!');
    } else if (foodBefore / maxFood > 0.10 && foodAfter / maxFood <= 0.10) {
      state.addNotification('warning', 'Almost out of food! Hunt or forage now.');
    }

    // --- Water warnings (graduated at 50%, 25%, and 0%) ---
    if (consumption.ranOutOfWater) {
      state.addNotification('warning', "You're dehydrated! Find water immediately.");
    } else if (waterBefore / maxWater > 0.50 && waterAfter / maxWater <= 0.50) {
      state.addNotification('warning', 'Water is getting low.');
    } else if (waterBefore / maxWater > 0.25 && waterAfter / maxWater <= 0.25) {
      state.addNotification('warning', 'Water is critically low. Find a source soon!');
    } else if (waterBefore / maxWater > 0.10 && waterAfter / maxWater <= 0.10) {
      state.addNotification('warning', 'Almost out of water! Find a source now.');
    }
  }

  // --- Starvation damage (3 HP per game hour without food) ---
  const freshState = store.getState();
  if (freshState.provisionsState.food <= 0) {
    const starvationDamage = Math.floor(3 * elapsedHours);
    if (starvationDamage > 0 && freshState.playerStats.health > 0) {
      state.takeDamage(starvationDamage);
    }
  }

  // --- Dehydration damage (5 HP per game hour without water) ---
  const freshState2 = store.getState();
  if (freshState2.provisionsState.water <= 0) {
    const dehydrationDamage = Math.floor(5 * elapsedHours);
    if (dehydrationDamage > 0 && freshState2.playerStats.health > 0) {
      state.takeDamage(dehydrationDamage);
    }
  }

  // --- Fatigue collapse check ---
  const finalState = store.getState();
  if (finalState.phase === 'game_over') return;
  if (finalState.fatigueState.current >= 100 && finalState.playerStats.health > 0) {
    state.addNotification('warning', 'You collapse from exhaustion and cannot continue!');
  }
}
