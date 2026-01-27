import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-dialogue-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialogue-box.component.html',
  styleUrls: ['./dialogue-box.component.scss'],
})
export class DialogueBoxComponent {
  constructor(readonly gameStore: GameStoreService) {}

  get dialogue() {
    return this.gameStore.getState().dialogueState;
  }

  selectChoice(index: number): void {
    this.gameStore.actions().selectChoice(index);
  }

  close(): void {
    this.gameStore.actions().endDialogue();
  }
}
