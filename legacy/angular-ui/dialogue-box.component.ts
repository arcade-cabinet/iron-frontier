import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import type { Subscription } from 'rxjs';

import type { NPCDefinition } from '@/data';
import type { DialogueState, GameSettings } from '@/store';
import { GameStoreService } from '../services/game-store.service';

const EXPRESSION_COLORS: Record<string, string> = {
  angry: 'border-red-500',
  happy: 'border-green-500',
  sad: 'border-blue-500',
  suspicious: 'border-yellow-500',
  worried: 'border-orange-500',
  threatening: 'border-red-600',
  curious: 'border-cyan-500',
  friendly: 'border-emerald-500',
  serious: 'border-slate-500',
  thoughtful: 'border-purple-500',
  shocked: 'border-pink-500',
  determined: 'border-amber-500',
  eager: 'border-lime-500',
  bitter: 'border-rose-500',
};

@Component({
  selector: 'app-dialogue-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialogue-box.component.html',
  styleUrls: ['./dialogue-box.component.scss'],
  animations: [
    trigger('dialogueBox', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
    trigger('choiceItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('160ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class DialogueBoxComponent implements OnInit, OnDestroy {
  dialogue: DialogueState | null = null;
  dialogueOpen = false;
  displayText = '';
  isTyping = false;
  showChoices = false;
  selectedChoiceIndex: number | null = null;
  activeNpc: NPCDefinition | undefined;
  settings: GameSettings | null = null;

  private subscription?: Subscription;
  private currentNodeId: string | null = null;
  private typeInterval?: ReturnType<typeof setInterval>;
  private showChoicesTimeout?: ReturnType<typeof setTimeout>;

  constructor(readonly gameStore: GameStoreService) {}

  ngOnInit(): void {
    this.subscription = this.gameStore.state$.subscribe((state) => {
      const dialogueOpen = state.phase === 'dialogue' && !!state.dialogueState;
      const dialogueState = state.dialogueState;

      this.dialogueOpen = dialogueOpen;
      this.dialogue = dialogueState;
      this.settings = state.settings;
      this.activeNpc = this.gameStore.actions().getActiveNPC();

      if (!dialogueOpen || !dialogueState) {
        this.resetDialogue();
        return;
      }

      if (this.currentNodeId !== dialogueState.currentNodeId) {
        this.currentNodeId = dialogueState.currentNodeId;
        this.startTyping(dialogueState.text, state.settings);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearTimers();
  }

  selectChoice(index: number): void {
    this.gameStore.actions().selectChoice(index);
  }

  close(): void {
    this.gameStore.actions().endDialogue();
  }

  handleChoiceSelect(index: number): void {
    this.triggerHaptics(30);
    this.selectedChoiceIndex = index;
    this.showChoices = false;

    window.setTimeout(() => {
      this.selectChoice(index);
    }, 150);
  }

  handleAdvance(): void {
    this.triggerHaptics(20);
    if (this.dialogue?.autoAdvanceNodeId) {
      this.gameStore.actions().advanceDialogue();
    } else {
      this.gameStore.actions().endDialogue();
    }
  }

  skipTyping(): void {
    this.triggerHaptics(20);
    if (this.isTyping && this.dialogue?.text) {
      this.displayText = this.dialogue.text;
      this.isTyping = false;
      this.showChoicesTimeout = window.setTimeout(() => {
        this.showChoices = true;
      }, 100);
    }
  }

  get expressionBorder(): string {
    if (!this.dialogue?.npcExpression) return 'border-amber-600';
    return EXPRESSION_COLORS[this.dialogue.npcExpression] || 'border-amber-600';
  }

  get expressionTextClass(): string {
    const border = this.expressionBorder;
    return border
      .replace('border-', 'text-')
      .replace('-500', '-400')
      .replace('-600', '-400');
  }

  get hasChoices(): boolean {
    return (this.dialogue?.choices?.length ?? 0) > 0;
  }

  get hasAutoAdvance(): boolean {
    return !!this.dialogue?.autoAdvanceNodeId;
  }

  get showContinuePrompt(): boolean {
    return !this.isTyping && this.showChoices && !this.hasChoices && this.hasAutoAdvance;
  }

  get showClosePrompt(): boolean {
    return !this.isTyping && this.showChoices && !this.hasChoices && !this.hasAutoAdvance;
  }

  get showChoiceButtons(): boolean {
    return !this.isTyping && this.showChoices && this.hasChoices;
  }

  private startTyping(text: string, settings: GameSettings): void {
    this.clearTimers();
    this.displayText = '';
    this.isTyping = true;
    this.showChoices = false;
    this.selectedChoiceIndex = null;

    let index = 0;
    const speed = settings?.reducedMotion ? 5 : 25;
    this.typeInterval = window.setInterval(() => {
      if (index < text.length) {
        this.displayText = text.slice(0, index + 1);
        index += 1;
      } else {
        this.isTyping = false;
        this.clearTimers();
        this.showChoicesTimeout = window.setTimeout(() => {
          this.showChoices = true;
        }, 200);
      }
    }, speed);
  }

  private resetDialogue(): void {
    this.clearTimers();
    this.displayText = '';
    this.isTyping = false;
    this.showChoices = false;
    this.selectedChoiceIndex = null;
    this.currentNodeId = null;
  }

  private clearTimers(): void {
    if (this.typeInterval) {
      window.clearInterval(this.typeInterval);
      this.typeInterval = undefined;
    }
    if (this.showChoicesTimeout) {
      window.clearTimeout(this.showChoicesTimeout);
      this.showChoicesTimeout = undefined;
    }
  }

  private triggerHaptics(duration: number): void {
    if (this.settings?.haptics && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }
}
