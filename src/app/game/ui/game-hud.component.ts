import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';
import { getQuestById } from '@/data/quests';

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

  getActiveQuestTitle(state: any): string | null {
    if (!state.activeQuests.length) return null;
    const quest = getQuestById(state.activeQuests[0].questId);
    return quest?.title ?? null;
  }
}
