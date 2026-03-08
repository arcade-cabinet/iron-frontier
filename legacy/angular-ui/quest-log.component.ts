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
  readonly questTypeStyles: Record<string, { bg: string; text: string; label: string }> = {
    main: { bg: 'bg-yellow-600', text: 'text-yellow-100', label: 'Main' },
    side: { bg: 'bg-amber-600', text: 'text-amber-100', label: 'Side' },
    faction: { bg: 'bg-purple-600', text: 'text-purple-100', label: 'Faction' },
    bounty: { bg: 'bg-red-600', text: 'text-red-100', label: 'Bounty' },
    delivery: { bg: 'bg-blue-600', text: 'text-blue-100', label: 'Delivery' },
    exploration: { bg: 'bg-green-600', text: 'text-green-100', label: 'Explore' },
  };

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

  get completedQuests(): Quest[] {
    return this.gameStore.getState().completedQuests;
  }

  get completedQuestIds(): string[] {
    return this.gameStore.getState().completedQuestIds;
  }

  get activeQuestsWithDefs(): { activeQuest: ActiveQuest; quest: Quest }[] {
    const items = this.activeQuests
      .map((activeQuest) => {
        const quest = getQuestById(activeQuest.questId);
        return quest ? { activeQuest, quest } : null;
      })
      .filter((item): item is { activeQuest: ActiveQuest; quest: Quest } => !!item);

    items.sort((a, b) => {
      if (a.quest.type === 'main' && b.quest.type !== 'main') return -1;
      if (a.quest.type !== 'main' && b.quest.type === 'main') return 1;
      return a.activeQuest.startedAt - b.activeQuest.startedAt;
    });

    return items;
  }

  get completedQuestsDisplay(): Quest[] {
    if (this.completedQuests.length > 0) return this.completedQuests;
    return this.completedQuestIds
      .map((id) => getQuestById(id))
      .filter((quest): quest is Quest => !!quest);
  }

  getQuest(questId: string): Quest | null {
    return getQuestById(questId) ?? null;
  }

  getQuestTypeBadge(type: Quest['type']) {
    return this.questTypeStyles[type] ?? this.questTypeStyles['side'];
  }

  getCurrentStage(quest: Quest, active: ActiveQuest) {
    return quest.stages[active.currentStageIndex];
  }

  getStageProgress(active: ActiveQuest, quest: Quest): string {
    return `${active.currentStageIndex + 1}/${quest.stages.length}`;
  }

  getObjectives(quest: Quest, active: ActiveQuest): Objective[] {
    const stage = quest.stages[active.currentStageIndex];
    return stage?.objectives ?? [];
  }

  isObjectiveComplete(objective: Objective, active: ActiveQuest): boolean {
    const progress = active.objectiveProgress[objective.id] ?? objective.current ?? 0;
    return progress >= objective.count;
  }

  getObjectiveProgress(objective: Objective, active: ActiveQuest): number {
    return active.objectiveProgress[objective.id] ?? objective.current ?? 0;
  }

  shouldShowObjective(objective: Objective, active: ActiveQuest): boolean {
    if (!objective.hidden) return true;
    return this.isObjectiveComplete(objective, active);
  }
}
