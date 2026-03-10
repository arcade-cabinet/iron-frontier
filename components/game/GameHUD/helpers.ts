import { getQuestById } from "@/src/game/data/quests";
import { DEFAULT_FATIGUE_CONFIG } from "@/src/game/systems/fatigue";
import { DEFAULT_PROVISIONS_CONFIG } from "@/src/game/systems/provisions";

export function healthPercent(health: number, maxHealth: number): number {
  if (maxHealth <= 0) return 0;
  return (health / maxHealth) * 100;
}

export function xpPercent(xp: number, xpToNext: number): number {
  if (xpToNext <= 0) return 0;
  return (xp / xpToNext) * 100;
}

export function healthTextColor(pct: number): string {
  if (pct > 60) return "text-frontier-sage";
  if (pct > 30) return "text-frontier-whiskey";
  return "text-frontier-blood";
}

export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function timePhaseLabel(hour: number): string {
  if (hour >= 5 && hour < 7) return "Dawn";
  if (hour >= 7 && hour < 17) return "Day";
  if (hour >= 17 && hour < 20) return "Dusk";
  return "Night";
}

export function fatigueLabel(value: number): string {
  const { tired, weary, exhausted, collapsed } = DEFAULT_FATIGUE_CONFIG.thresholds;
  if (value >= collapsed) return "Collapsed";
  if (value >= exhausted) return "Exhausted";
  if (value >= weary) return "Weary";
  if (value >= tired) return "Tired";
  return "Rested";
}

export function fatigueBadgeVariant(label: string): "success" | "warning" | "danger" | "info" {
  switch (label) {
    case "Collapsed":
    case "Exhausted":
      return "danger";
    case "Weary":
    case "Tired":
      return "warning";
    default:
      return "success";
  }
}

export function activeQuestSummary(
  activeQuests: readonly {
    questId: string;
    currentStageIndex: number;
    objectiveProgress: Record<string, number>;
  }[],
): { title: string; objective: string } | null {
  if (!activeQuests.length) return null;
  const aq = activeQuests[0];
  const quest = getQuestById(aq.questId);
  if (!quest) return null;

  const stage = quest.stages[aq.currentStageIndex];
  const objective = stage?.objectives.find(
    (obj: { id: string; count: number; description: string }) => {
      const progress = aq.objectiveProgress?.[obj.id] ?? 0;
      return progress < obj.count;
    },
  );

  return {
    title: quest.title,
    objective: objective?.description ?? stage?.title ?? "Complete quest",
  };
}

export function foodPercent(food: number): number {
  return Math.min(100, Math.max(0, (food / DEFAULT_PROVISIONS_CONFIG.maxFood) * 100));
}

export function waterPercent(water: number): number {
  return Math.min(100, Math.max(0, (water / DEFAULT_PROVISIONS_CONFIG.maxWater) * 100));
}
