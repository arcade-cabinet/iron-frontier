import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-title-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './title-screen.component.html',
  styleUrls: ['./title-screen.component.scss'],
})
export class TitleScreenComponent implements OnInit, OnDestroy {
  showSplash = true;
  showNameInput = false;
  inputName = '';
  showAbout = false;

  private splashTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly gameStore: GameStoreService) {}

  ngOnInit(): void {
    this.splashTimer = setTimeout(() => {
      this.showSplash = false;
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.splashTimer) {
      clearTimeout(this.splashTimer);
    }
  }

  get hasSaveData(): boolean {
    return this.gameStore.getState().initialized;
  }

  get savedPlayerName(): string {
    return this.gameStore.getState().playerName;
  }

  handleNewGame(): void {
    if (this.showNameInput) return;
    if (!this.showNameInput) {
      this.showNameInput = true;
    }
  }

  handleStart(): void {
    if (this.inputName.trim()) {
      this.gameStore.actions().initGame(this.inputName.trim());
    }
  }

  handleBack(): void {
    this.showNameInput = false;
  }

  handleContinue(): void {
    this.gameStore.actions().setPhase('playing');
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.inputName.trim()) {
      this.gameStore.actions().initGame(this.inputName.trim());
    }
  }

  toggleAbout(next: boolean): void {
    this.showAbout = next;
  }
}
