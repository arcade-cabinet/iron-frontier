import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import type { Subscription } from 'rxjs';

import { AP_COSTS } from '@/data/schemas/combat';
import type { CombatActionType, Combatant } from '@/store';
import { audioService } from '../services/AudioService';
import { GameStoreService } from '../services/game-store.service';

type CombatActionButtonType = CombatActionType | 'end_turn';

type CombatActionButton = {
  type: CombatActionButtonType;
  label: string;
  apCost: number;
  icon: 'crosshair' | 'shield' | 'flask' | 'run' | 'clock';
  variant?: 'default' | 'danger' | 'secondary';
};

const ACTION_BUTTONS: CombatActionButton[] = [
  { type: 'attack', label: 'Attack', apCost: AP_COSTS.attack, icon: 'crosshair' },
  { type: 'aimed_shot', label: 'Aimed', apCost: AP_COSTS.aimed_shot, icon: 'crosshair' },
  { type: 'defend', label: 'Defend', apCost: AP_COSTS.defend, icon: 'shield' },
  { type: 'use_item', label: 'Item', apCost: AP_COSTS.use_item, icon: 'flask' },
  { type: 'flee', label: 'Flee', apCost: AP_COSTS.flee, icon: 'run', variant: 'danger' },
  { type: 'end_turn', label: 'End', apCost: 0, icon: 'clock', variant: 'secondary' },
];

@Component({
  selector: 'app-combat-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combat-panel.component.html',
  styleUrls: ['./combat-panel.component.scss'],
})
export class CombatPanelComponent implements OnInit, OnDestroy {
  readonly actionButtons = ACTION_BUTTONS;

  private subscription?: Subscription;
  private prevLogLength = 0;

  constructor(readonly gameStore: GameStoreService) {}

  ngOnInit(): void {
    this.subscription = this.gameStore.state$.subscribe((state) => {
      const combatState = state.combatState;
      if (!combatState) {
        this.prevLogLength = 0;
        return;
      }

      if (combatState.log.length > this.prevLogLength) {
        const lastEntry = combatState.log[combatState.log.length - 1];
        const action = lastEntry?.action?.type;

        if (action === 'attack' || action === 'aimed_shot') {
          audioService.playCombatSound('attack');
          window.setTimeout(() => {
            audioService.playCombatSound(lastEntry?.success ? 'hit' : 'miss');
          }, 200);
        } else if (action === 'reload') {
          audioService.playCombatSound('reload');
        }
      }

      this.prevLogLength = combatState.log.length;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get combatState() {
    return this.gameStore.getState().combatState;
  }

  get player(): Combatant | undefined {
    return this.combatState?.combatants.find((combatant) => combatant.isPlayer);
  }

  get enemies(): Combatant[] {
    return (
      this.combatState?.combatants.filter((combatant) => !combatant.isPlayer && !combatant.isDead) ??
      []
    );
  }

  get currentCombatant(): Combatant | undefined {
    if (!this.combatState) return undefined;
    return this.combatState.combatants[this.combatState.currentTurnIndex];
  }

  get isPlayerTurn(): boolean {
    return this.combatState?.phase === 'player_turn';
  }

  get playerActionPoints(): number {
    return this.player?.actionPoints ?? 0;
  }

  get recentLogs() {
    return this.combatState?.log.slice(-4) ?? [];
  }

  get outcomeType(): 'victory' | 'defeat' | 'fled' | null {
    if (!this.combatState) return null;
    if (this.combatState.phase === 'victory') return 'victory';
    if (this.combatState.phase === 'defeat') return 'defeat';
    if (this.combatState.phase === 'fled') return 'fled';
    return null;
  }

  handleAction(action: CombatActionButtonType): void {
    if (action === 'end_turn') {
      this.gameStore.actions().endCombatTurn();
      return;
    }

    if (action === 'flee') {
      this.gameStore.actions().attemptFlee();
      return;
    }

    this.gameStore.actions().selectCombatAction(action as CombatActionType);
  }

  handleTargetSelect(targetId: string): void {
    this.gameStore.actions().selectCombatTarget(targetId);

    if (this.combatState?.selectedAction) {
      this.gameStore.actions().executeCombatAction();
    }
  }

  endCombat(): void {
    this.gameStore.actions().endCombat();
  }

  healthPercent(combatant: Combatant): number {
    if (!combatant.maxHealth) return 0;
    return Math.max(0, Math.min(100, (combatant.health / combatant.maxHealth) * 100));
  }

  healthBarColor(percentage: number): string {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  healthTextColor(percentage: number): string {
    if (percentage > 60) return 'text-green-400';
    if (percentage > 30) return 'text-yellow-400';
    return 'text-red-400';
  }

  apSlots(max: number): number[] {
    return Array.from({ length: max }, (_, i) => i);
  }

  actionButtonClasses(button: CombatActionButton): string {
    const canAfford = this.playerActionPoints >= button.apCost;
    const isDisabled = !canAfford;

    const variantStyles: Record<string, string> = {
      default: isDisabled
        ? 'bg-stone-800 text-stone-500'
        : 'bg-amber-800 hover:bg-amber-700 text-amber-100',
      danger: isDisabled
        ? 'bg-stone-800 text-stone-500'
        : 'bg-red-900/60 hover:bg-red-800/60 text-red-200 border-red-700/50',
      secondary: isDisabled
        ? 'bg-stone-800 text-stone-500'
        : 'bg-stone-700 hover:bg-stone-600 text-stone-200',
    };

    const variant = button.variant ?? 'default';

    return [
      'flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-stone-700/50 transition-all',
      'min-w-[52px] sm:min-w-[70px] min-h-[52px] sm:min-h-0',
      isDisabled ? 'cursor-not-allowed opacity-60' : '',
      variantStyles[variant],
    ].join(' ');
  }

  trackByIndex(index: number): number {
    return index;
  }
}
