/**
 * QuestLog list items: active and completed quest rows for the left panel.
 */

import * as React from "react";
import { Pressable, View } from "react-native";

import { Badge, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Quest } from "@/src/game/data/schemas/quest";
import { getTypeBadge, type QuestWithActive } from "./helpers.ts";

// =============================================================================
// Icons
// =============================================================================

export function StarIcon() {
  return <Text className="text-frontier-whiskey text-sm">{"*"}</Text>;
}

export function PinIcon({ active }: { active: boolean }) {
  return (
    <Text className={cn("text-base", active ? "text-frontier-whiskey" : "text-muted-foreground")}>
      {active ? "\u2605" : "\u2606"}
    </Text>
  );
}

// =============================================================================
// QuestListItem (active quests)
// =============================================================================

interface QuestListItemProps {
  item: QuestWithActive;
  isSelected: boolean;
  isTracked: boolean;
  onSelect: () => void;
  onToggleTrack: () => void;
}

export function QuestListItem({
  item,
  isSelected,
  isTracked,
  onSelect,
  onToggleTrack,
}: QuestListItemProps) {
  const { quest, activeQuest } = item;
  const badge = getTypeBadge(quest.type);
  const stageProgress = `${activeQuest.currentStageIndex + 1}/${quest.stages.length}`;

  return (
    <Pressable
      className={cn(
        "min-h-[44px] flex-row items-center px-3 py-2.5 border-b border-border/30",
        isSelected && "bg-frontier-leather/20",
      )}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Quest: ${quest.title}`}
    >
      <Pressable
        className="min-w-[44px] min-h-[44px] items-center justify-center -ml-2"
        onPress={onToggleTrack}
        accessibilityRole="button"
        accessibilityLabel={isTracked ? "Untrack quest" : "Track quest"}
        hitSlop={8}
      >
        <PinIcon active={isTracked} />
      </Pressable>

      <View className="flex-1 min-w-0 mr-2">
        <View className="flex-row items-center gap-1.5">
          {quest.type === "main" && <StarIcon />}
          <Text
            className="text-sm font-semibold text-card-foreground font-heading"
            numberOfLines={1}
          >
            {quest.title}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground font-body mt-0.5" numberOfLines={1}>
          Stage {stageProgress}
        </Text>
      </View>

      <Badge variant={badge.variant} className="ml-auto">
        <Text>{badge.label}</Text>
      </Badge>
    </Pressable>
  );
}

// =============================================================================
// CompletedQuestListItem
// =============================================================================

interface CompletedQuestListItemProps {
  quest: Quest;
  isSelected: boolean;
  onSelect: () => void;
}

export function CompletedQuestListItem({
  quest,
  isSelected,
  onSelect,
}: CompletedQuestListItemProps) {
  const badge = getTypeBadge(quest.type);

  return (
    <Pressable
      className={cn(
        "min-h-[44px] flex-row items-center px-3 py-2.5 border-b border-border/30",
        isSelected && "bg-frontier-leather/20",
      )}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Completed quest: ${quest.title}`}
    >
      <Text className="text-frontier-sage mr-2">{"\u2713"}</Text>
      <View className="flex-1 min-w-0 mr-2">
        <Text className="text-sm font-medium text-muted-foreground font-heading" numberOfLines={1}>
          {quest.title}
        </Text>
      </View>
      <Badge variant={badge.variant} className="opacity-60">
        <Text>{badge.label}</Text>
      </Badge>
    </Pressable>
  );
}

// =============================================================================
// Empty States
// =============================================================================

export function EmptyActiveQuests() {
  return (
    <View className="flex-1 items-center justify-center py-12 px-4">
      <Text className="text-3xl mb-3">{"\u{1F4DC}"}</Text>
      <Text className="text-sm text-muted-foreground font-body text-center">No active quests</Text>
      <Text className="text-xs text-muted-foreground/50 font-body text-center mt-1">
        Talk to folks around town!
      </Text>
    </View>
  );
}

export function EmptyCompletedQuests() {
  return (
    <View className="flex-1 items-center justify-center py-12 px-4">
      <Text className="text-3xl mb-3">{"\u{2705}"}</Text>
      <Text className="text-sm text-muted-foreground font-body text-center">
        No completed quests yet
      </Text>
      <Text className="text-xs text-muted-foreground/50 font-body text-center mt-1">
        Your deeds will be recorded here
      </Text>
    </View>
  );
}
