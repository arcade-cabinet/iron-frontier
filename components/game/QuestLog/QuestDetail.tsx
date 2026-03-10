/**
 * QuestLog detail views: active and completed quest detail panels.
 */

import { Pressable, View } from "react-native";

import { Badge, ScrollArea, Separator, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Quest } from "@/src/game/data/schemas/quest";
import { getTypeBadge, type QuestWithActive, shouldShowObjective } from "./helpers.ts";
import {
  ObjectiveRow,
  QuestChainIndicator,
  RewardsRow,
  StageProgress,
} from "./QuestDetailHelpers.tsx";
import { PinIcon, StarIcon } from "./QuestListItems.tsx";

// =============================================================================
// ActiveQuestDetail
// =============================================================================

interface ActiveQuestDetailProps {
  item: QuestWithActive;
  isTracked: boolean;
  onToggleTrack: () => void;
}

export function ActiveQuestDetail({ item, isTracked, onToggleTrack }: ActiveQuestDetailProps) {
  const { quest, activeQuest } = item;
  const currentStage = quest.stages[activeQuest.currentStageIndex];

  return (
    <ScrollArea contentContainerClassName="pb-8">
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1 min-w-0 mr-3">
          <View className="flex-row items-center gap-2">
            {quest.type === "main" ? <StarIcon /> : null}
            <Text variant="subheading" className="text-card-foreground">
              {quest.title}
            </Text>
          </View>
        </View>
        <Pressable
          className="min-w-[44px] min-h-[44px] items-center justify-center"
          onPress={onToggleTrack}
          accessibilityRole="button"
          accessibilityLabel={isTracked ? "Untrack quest" : "Set as tracked quest"}
        >
          <PinIcon active={isTracked} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2 mb-3">
        <Badge variant={getTypeBadge(quest.type).variant}>
          <Text>{getTypeBadge(quest.type).label}</Text>
        </Badge>
        <Text className="text-xs text-muted-foreground font-body">
          Stage {activeQuest.currentStageIndex + 1} of {quest.stages.length}
        </Text>
      </View>

      <Text className="text-sm text-muted-foreground font-body leading-5 mb-3">
        {quest.description}
      </Text>

      <Separator className="mb-3" />

      <Text className="text-xs text-muted-foreground font-body font-medium mb-2">Quest Stages</Text>
      {quest.stages.map((stage, idx) => {
        const isCompleted = idx < activeQuest.currentStageIndex;
        const isCurrent = idx === activeQuest.currentStageIndex;

        return (
          <View key={stage.id} className="flex-row items-start gap-2 mb-1.5">
            <Text
              className={cn(
                "text-sm mt-0.5",
                isCompleted
                  ? "text-frontier-sage"
                  : isCurrent
                    ? "text-frontier-whiskey"
                    : "text-muted",
              )}
            >
              {isCompleted ? "\u2713" : isCurrent ? "\u25B6" : "\u25CB"}
            </Text>
            <Text
              className={cn(
                "text-sm font-body",
                isCompleted
                  ? "text-frontier-sage line-through opacity-60"
                  : isCurrent
                    ? "text-card-foreground font-medium"
                    : "text-muted-foreground",
              )}
            >
              {stage.title}
            </Text>
          </View>
        );
      })}

      <StageProgress stages={quest.stages} currentIndex={activeQuest.currentStageIndex} />

      <Separator className="my-3" />

      {currentStage ? (
        <>
          <Text className="text-sm text-card-foreground font-heading font-semibold mb-1">
            {currentStage.title}
          </Text>
          <Text className="text-xs text-muted-foreground font-body italic mb-3">
            {currentStage.description}
          </Text>

          <Text className="text-xs text-muted-foreground font-body font-medium mb-2">
            Objectives
          </Text>
          {currentStage.objectives.map((obj) => {
            if (!shouldShowObjective(obj, activeQuest.objectiveProgress)) return null;
            return (
              <ObjectiveRow key={obj.id} objective={obj} progress={activeQuest.objectiveProgress} />
            );
          })}
        </>
      ) : null}

      <Separator className="my-3" />

      <RewardsRow rewards={quest.rewards} />
      <QuestChainIndicator quest={quest} />
    </ScrollArea>
  );
}

// =============================================================================
// CompletedQuestDetail
// =============================================================================

export function CompletedQuestDetail({ quest }: { quest: Quest }) {
  return (
    <ScrollArea contentContainerClassName="pb-8">
      <View className="flex-row items-center gap-2 mb-1">
        <Text className="text-frontier-sage text-lg">{"\u2713"}</Text>
        <Text variant="subheading" className="text-card-foreground">
          {quest.title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 mb-3">
        <Badge variant={getTypeBadge(quest.type).variant} className="opacity-60">
          <Text>{getTypeBadge(quest.type).label}</Text>
        </Badge>
        <Text className="text-xs text-frontier-sage font-body">Completed</Text>
      </View>

      <Text className="text-sm text-muted-foreground font-body leading-5 mb-3">
        {quest.description}
      </Text>

      <Separator className="mb-3" />

      <Text className="text-xs text-muted-foreground font-body font-medium mb-2">Quest Stages</Text>
      {quest.stages.map((stage) => (
        <View key={stage.id} className="flex-row items-start gap-2 mb-1.5">
          <Text className="text-sm text-frontier-sage mt-0.5">{"\u2713"}</Text>
          <Text className="text-sm font-body text-frontier-sage line-through opacity-60">
            {stage.title}
          </Text>
        </View>
      ))}

      <Separator className="my-3" />

      <Text className="text-xs text-muted-foreground font-body font-medium mb-2">
        Rewards Earned
      </Text>
      <RewardsRow rewards={quest.rewards} />
      <QuestChainIndicator quest={quest} />
    </ScrollArea>
  );
}
