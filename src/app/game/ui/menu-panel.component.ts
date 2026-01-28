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

  get isOpen(): boolean {
    return this.gameStore.getState().activePanel === 'menu';
  }

  close(): void {
    this.gameStore.actions().togglePanel('menu');
  }

  updateSetting(key: string, value: any): void {
    this.gameStore.actions().updateSettings({ [key]: value });
  }

  saveGame(): void {
    this.gameStore.actions().saveGame();
  }

  resetGame(): void {
    this.gameStore.actions().resetGame();
  }

  setPhase(phase: any): void {
    this.gameStore.actions().setPhase(phase);
  }
}
