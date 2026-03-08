import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
})
export class ActionBarComponent {
  @Output() openMap = new EventEmitter<void>();

  constructor(readonly gameStore: GameStoreService) {}

  isActive(panel: string, activePanel: string | null): boolean {
    return panel === activePanel;
  }

  togglePanel(panel: any): void {
    this.gameStore.actions().togglePanel(panel);
  }
}
