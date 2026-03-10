/**
 * Quest detail helper components: ObjectiveRow, StageProgress,
 * QuestChainIndicator, RewardsRow.
 */

import { View } from "react-native";

import { Progress, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Objective, Quest } from "@/src/game/data/schemas/quest";
import { getObjectiveProgress, isObjectiveComplete } from "./helpers.ts";

// =============================================================================
// ObjectiveRow
// =============================================================================

export function ObjectiveRow({
  objective,
  progress,
}: {
  objective: Objective;
  progress: Record<string, number>;
}) {
  const completed = isObjectiveComplete(objective, progress);
  const current = getObjectiveProgress(objective, progress);
  const showCount = objective.count > 1;

  return (
    <View className="flex-row items-start gap-2 py-1">
      <Text
        className={cn("text-sm mt-0.5", completed ? "text-frontier-sage" : "text-frontier-whiskey")}
      >
        {completed ? "\u2713" : "\u25CB"}
      </Text>

      <View className="flex-1 min-w-0">
        <Text
          className={cn(
            "text-sm font-body",
            completed ? "text-frontier-sage line-through opacity-60" : "text-card-foreground",
          )}
        >
          {objective.description}
          {showCount ? ` (${current}/${objective.count})` : ""}
        </Text>

        {objective.optional ? (
          <Text className="text-xs text-muted-foreground font-body">(Optional)</Text>
        ) : null}

        {objective.mapMarker ? (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Text className="text-xs text-muted-foreground">{"\u{1F4CD}"}</Text>
            <Text className="text-xs text-muted-foreground font-body">
              {objective.mapMarker.markerLabel ?? objective.mapMarker.locationId}
            </Text>
          </View>
        ) : null}
      </View>

      {showCount && !completed ? (
        <View className="w-16 justify-center">
          <Progress value={(current / objective.count) * 100} className="h-2" />
        </View>
      ) : null}
    </View>
  );
}

// =============================================================================
// StageProgress
// =============================================================================

export function StageProgress({
  stages,
  currentIndex,
}: {
  stages: Quest["stages"];
  currentIndex: number;
}) {
  if (stages.length <= 1) return null;

  return (
    <View className="flex-row gap-1 mt-3">
      {stages.map((stage, idx) => (
        <View
          key={stage.id}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            idx < currentIndex
              ? "bg-frontier-sage"
              : idx === currentIndex
                ? "bg-frontier-whiskey"
                : "bg-muted",
          )}
        />
      ))}
    </View>
  );
}

// =============================================================================
// QuestChainIndicator
// =============================================================================

export function QuestChainIndicator({ quest }: { quest: Quest }) {
  const hasChain =
    (quest.rewards.unlocksQuests && quest.rewards.unlocksQuests.length > 0) ||
    quest.prerequisites.completedQuests.length > 0;

  if (!hasChain) return null;

  const chainLength =
    1 + (quest.rewards.unlocksQuests?.length ?? 0) + quest.prerequisites.completedQuests.length;
  const position = quest.prerequisites.completedQuests.length + 1;

  return (
    <View className="flex-row items-center gap-1.5 mt-2">
      <Text className="text-xs text-muted-foreground font-body">
        Quest Chain ({position}/{chainLength})
      </Text>
      <View className="flex-row gap-0.5">
        {Array.from({ length: chainLength }).map((_, i) => (
          <View
            key={`chain-${quest.id}-${i}`}
            className={cn(
              "w-2 h-2 rounded-full",
              i < position ? "bg-frontier-whiskey" : "bg-muted",
            )}
          />
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// RewardsRow
// =============================================================================

export function RewardsRow({ rewards }: { rewards: Quest["rewards"] }) {
  const hasRewards = rewards.xp > 0 || rewards.gold > 0 || (rewards.items?.length ?? 0) > 0;
  if (!hasRewards) return null;

  return (
    <View className="flex-row items-center gap-3 flex-wrap">
      <Text className="text-xs text-muted-foreground font-body">Rewards:</Text>
      {rewards.xp > 0 ? (
        <Text className="text-xs text-frontier-sky font-body font-medium">+{rewards.xp} XP</Text>
      ) : null}
      {rewards.gold > 0 ? (
        <Text className="text-xs text-frontier-whiskey font-body font-medium">
          +{rewards.gold} Gold
        </Text>
      ) : null}
      {rewards.reputation &&
        Object.keys(rewards.reputation).length > 0 &&
        Object.entries(rewards.reputation).map(([faction, rep]) => (
          <Text
            key={faction}
            className={cn(
              "text-xs font-body font-medium",
              rep > 0 ? "text-frontier-sage" : "text-frontier-blood",
            )}
          >
            {rep > 0 ? "+" : ""}
            {rep} {faction}
          </Text>
        ))}
      {(rewards.items?.length ?? 0) > 0 ? (
        <Text className="text-xs text-frontier-sky font-body font-medium">
          +{rewards.items?.length} Item{rewards.items?.length > 1 ? "s" : ""}
        </Text>
      ) : null}
    </View>
  );
}
