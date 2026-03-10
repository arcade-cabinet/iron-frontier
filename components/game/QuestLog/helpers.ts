/**
 * QuestLog shared types, constants, and helper functions.
 */

import { getQuestById } from "@/src/game/data/quests";
import type { ActiveQuest, Objective, Quest, QuestType } from "@/src/game/data/schemas/quest";

// =============================================================================
// TYPES
// =============================================================================

export interface QuestLogProps {
  /** Whether the quest log modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
}

export interface QuestWithActive {
  activeQuest: ActiveQuest;
  quest: Quest;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const QUEST_TYPE_STYLES: Record<
  QuestType,
  { variant: "default" | "success" | "warning" | "danger" | "info"; label: string }
> = {
  main: { variant: "warning", label: "Main" },
  side: { variant: "default", label: "Side" },
  faction: { variant: "info", label: "Faction" },
  bounty: { variant: "danger", label: "Bounty" },
  delivery: { variant: "info", label: "Delivery" },
  exploration: { variant: "success", label: "Explore" },
};

// =============================================================================
// HELPERS
// =============================================================================

export function getTypeBadge(type: QuestType) {
  return QUEST_TYPE_STYLES[type] ?? QUEST_TYPE_STYLES.side;
}

export function isObjectiveComplete(
  objective: Objective,
  progress: Record<string, number>,
): boolean {
  const current = progress[objective.id] ?? objective.current ?? 0;
  return current >= objective.count;
}

export function getObjectiveProgress(
  objective: Objective,
  progress: Record<string, number>,
): number {
  return progress[objective.id] ?? objective.current ?? 0;
}

export function shouldShowObjective(
  objective: Objective,
  progress: Record<string, number>,
): boolean {
  if (!objective.hidden) return true;
  return isObjectiveComplete(objective, progress);
}

export function buildActiveQuestsWithDefs(activeQuests: ActiveQuest[]): QuestWithActive[] {
  const items = activeQuests
    .map((activeQuest) => {
      const quest = getQuestById(activeQuest.questId);
      return quest ? { activeQuest, quest } : null;
    })
    .filter((item): item is QuestWithActive => item !== null);

  // Main quests first, then by start time
  items.sort((a, b) => {
    if (a.quest.type === "main" && b.quest.type !== "main") return -1;
    if (a.quest.type !== "main" && b.quest.type === "main") return 1;
    return a.activeQuest.startedAt - b.activeQuest.startedAt;
  });

  return items;
}

export function buildCompletedQuestsDisplay(
  completedQuests: Quest[],
  completedQuestIds: string[],
): Quest[] {
  if (completedQuests.length > 0) return completedQuests;
  return completedQuestIds.map((id) => getQuestById(id)).filter((q): q is Quest => q !== undefined);
}
