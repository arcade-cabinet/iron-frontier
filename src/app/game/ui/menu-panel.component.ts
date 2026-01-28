import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-menu-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-panel.component.html',
  styleUrls: ['./menu-panel.component.scss'],
})
export class MenuPanelComponent {
  activeTab: 'game' | 'settings' = 'game';

  constructor(readonly gameStore: GameStoreService) {}

  roundPercent(value: number): number {
    return Math.round(value * 100);
  }

  getHealthPercent(state: any): number {
    return state.playerStats.maxHealth > 0
      ? (state.playerStats.health / state.playerStats.maxHealth) * 100
      : 0;
  }

  getXpPercent(state: any): number {
    return state.playerStats.xpToNext > 0
      ? (state.playerStats.xp / state.playerStats.xpToNext) * 100
      : 0;
  }

  get isOpen(): boolean {
    return this.gameStore.getState().activePanel === 'menu';
  }

  close(): void {
    this.gameStore.actions().togglePanel('menu');
  }

  updateSetting(key: string, value: any): void {
    this.gameStore.actions().updateSettings({ [key]: value });
  }

  handleSave(): void {
    const state = this.gameStore.getState();
    this.gameStore.actions().saveGame();
    if (state.settings.haptics && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  }

  handleNewGame(): void {
    if (confirm('Start a new journey? Current progress will be saved but you will start fresh.')) {
      this.gameStore.actions().saveGame();
      this.gameStore.actions().resetGame();
    }
  }

  handleMainMenu(): void {
    if (confirm('Return to main menu? Your progress has been auto-saved.')) {
      this.gameStore.actions().saveGame();
      this.gameStore.actions().setPhase('title');
      this.gameStore.actions().togglePanel('menu');
    }
  }
}
