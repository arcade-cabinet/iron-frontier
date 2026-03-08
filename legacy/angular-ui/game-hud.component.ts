import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';
import { getQuestById } from '@/data/quests';
import { DEFAULT_FATIGUE_CONFIG } from '@/systems/fatigue';
import { DEFAULT_PROVISIONS_CONFIG } from '@/systems/provisions';

@Component({
  selector: 'app-game-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-hud.component.html',
  styleUrls: ['./game-hud.component.scss'],
})
export class GameHudComponent {
  constructor(readonly gameStore: GameStoreService) {}

  getHealthPercent(state: any): number {
    return (state.playerStats.health / state.playerStats.maxHealth) * 100;
  }

  getXpPercent(state: any): number {
    return (state.playerStats.xp / state.playerStats.xpToNext) * 100;
  }

  getHealthColor(healthPercent: number): string {
    if (healthPercent > 60) return 'text-green-400';
    if (healthPercent > 30) return 'text-yellow-400';
    return 'text-red-400';
  }

  getHealthBarClass(healthPercent: number): string {
    if (healthPercent > 60) return 'bg-green-500';
    if (healthPercent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getCurrentLocationName(state: any): string {
    const currentLocation = state.currentLocationId
      ? state.loadedWorld?.locations.get(state.currentLocationId)
      : null;
    return currentLocation?.ref?.name ?? 'Unknown Territory';
  }

  getActiveQuestSummary(state: any): { title: string; objective: string } | null {
    if (!state.activeQuests.length) return null;
    const activeQuest = state.activeQuests[0];
    const quest = getQuestById(activeQuest.questId);
    if (!quest) return null;
    const stage = quest.stages[activeQuest.currentStageIndex];
    const objective = stage?.objectives.find((obj: any) => {
      const progress = activeQuest.objectiveProgress?.[obj.id] ?? 0;
      return progress < obj.count;
    });
    return {
      title: quest.title,
      objective: objective?.description ?? stage?.title ?? 'Complete quest',
    };
  }

  getTimeLabel(state: any): string {
    const hour = state.clockState?.hour ?? state.time?.hour ?? 0;
    const minute = state.clockState?.minute ?? 0;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  getTimePhase(state: any): string {
    return state.clockState?.phase ?? '';
  }

  getFatiguePercent(state: any): number {
    const current = state.fatigueState?.current ?? 0;
    return Math.min(100, Math.max(0, current));
  }

  getFatigueLabel(state: any): string {
    const value = state.fatigueState?.current ?? 0;
    const { tired, weary, exhausted, collapsed } = DEFAULT_FATIGUE_CONFIG.thresholds;
    if (value >= collapsed) return 'Collapsed';
    if (value >= exhausted) return 'Exhausted';
    if (value >= weary) return 'Weary';
    if (value >= tired) return 'Tired';
    return 'Rested';
  }

  getFoodPercent(state: any): number {
    const food = state.provisionsState?.food ?? 0;
    return Math.min(100, Math.max(0, (food / DEFAULT_PROVISIONS_CONFIG.maxFood) * 100));
  }

  getWaterPercent(state: any): number {
    const water = state.provisionsState?.water ?? 0;
    return Math.min(100, Math.max(0, (water / DEFAULT_PROVISIONS_CONFIG.maxWater) * 100));
  }
}
