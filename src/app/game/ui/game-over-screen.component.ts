import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-game-over-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-over-screen.component.html',
  styleUrls: ['./game-over-screen.component.scss'],
})
export class GameOverScreenComponent {
  constructor(readonly gameStore: GameStoreService) {}

  get phase() {
    return this.gameStore.getState().phase;
  }

  get playerName(): string {
    return this.gameStore.getState().playerName;
  }

  get playerStats() {
    return this.gameStore.getState().playerStats;
  }

  loadLastSave(): void {
    this.gameStore.actions().heal(this.playerStats.maxHealth);
    this.gameStore.actions().setPhase('playing');
  }

  returnToTitle(): void {
    this.gameStore.actions().resetGame();
  }
}
