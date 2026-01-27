import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { getQuestById } from '@/data/quests';
import type { ActiveQuest, Objective, Quest } from '@/data/schemas/quest';
import { GameStoreService } from '../services/game-store.service';

@Component({
  selector: 'app-quest-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-log.component.html',
  styleUrls: ['./quest-log.component.scss'],
})
export class QuestLogComponent {
  activeTab: 'active' | 'completed' = 'active';

  constructor(readonly gameStore: GameStoreService) {}

  get isOpen(): boolean {
    return this.gameStore.getState().activePanel === 'quests';
  }

  close(): void {
    this.gameStore.actions().togglePanel('quests');
  }

  get activeQuests(): ActiveQuest[] {
    return this.gameStore.getState().activeQuests;
  }

  get completedQuests(): ActiveQuest[] {
    return this.gameStore.getState().completedQuests;
  }

  getQuest(questId: string): Quest | null {
    return getQuestById(questId) ?? null;
  }

  getObjectives(quest: Quest, active: ActiveQuest): Objective[] {
    const stage = quest.stages.find((s) => s.id === active.currentStageId);
    return stage?.objectives ?? [];
  }

  isObjectiveComplete(objective: Objective, active: ActiveQuest): boolean {
    return active.completedObjectiveIds.includes(objective.id);
  }
}
