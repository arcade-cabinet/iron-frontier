import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { GameStoreService } from '../services/game-store.service';
import type { CombatActionType, Combatant } from '@/store';

const ACTIONS: { type: CombatActionType; label: string }[] = [
  { type: 'attack', label: 'Attack' },
  { type: 'aimed_shot', label: 'Aimed Shot' },
  { type: 'defend', label: 'Defend' },
  { type: 'reload', label: 'Reload' },
  { type: 'use_item', label: 'Use Item' },
  { type: 'flee', label: 'Flee' },
];

@Component({
  selector: 'app-combat-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combat-panel.component.html',
  styleUrls: ['./combat-panel.component.scss'],
})
export class CombatPanelComponent {
  readonly actions = ACTIONS;

  constructor(readonly gameStore: GameStoreService) {}

  get combatState() {
    return this.gameStore.getState().combatState;
  }

  isActiveCombatant(combatant: Combatant, index: number): boolean {
    return this.combatState?.currentTurnIndex === index;
  }

  selectAction(action: CombatActionType): void {
    if (action === 'flee') {
      this.gameStore.actions().endCombat();
      return;
    }
    this.gameStore.actions().selectCombatAction(action);
  }

  selectTarget(combatant: Combatant): void {
    this.gameStore.actions().selectCombatTarget(combatant.definitionId);
  }

  execute(): void {
    this.gameStore.actions().executeCombatAction();
    this.gameStore.actions().endCombatTurn();
  }

  endCombat(): void {
    this.gameStore.actions().endCombat();
  }
}
