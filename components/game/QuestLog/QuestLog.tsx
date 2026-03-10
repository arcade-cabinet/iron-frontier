/**
 * QuestLog - Quest tracking interface (React Native / Expo)
 *
 * Full-screen modal with tabs for active/completed quests,
 * quest list on left, detail view on right (landscape) or inline (portrait).
 */

import * as React from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { SlideInUp, SlideOutDown } from "react-native-reanimated";

import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { gameStore } from "@/src/game/store/webGameStore";

import {
  buildActiveQuestsWithDefs,
  buildCompletedQuestsDisplay,
  type QuestLogProps,
} from "./helpers.ts";
import { ActiveQuestDetail, CompletedQuestDetail } from "./QuestDetail.tsx";
import {
  CompletedQuestListItem,
  EmptyActiveQuests,
  EmptyCompletedQuests,
  QuestListItem,
} from "./QuestListItems.tsx";

export function QuestLog({ open, onClose }: QuestLogProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Store
  const activeQuests = gameStore((s) => s.activeQuests);
  const completedQuests = gameStore((s) => s.completedQuests);
  const completedQuestIds = gameStore((s) => s.completedQuestIds);

  // Local state
  const [activeTab, setActiveTab] = React.useState<"active" | "completed">("active");
  const [selectedQuestId, setSelectedQuestId] = React.useState<string | null>(null);
  const [trackedQuestId, setTrackedQuestId] = React.useState<string | null>(null);

  // Derived data
  const activeQuestsWithDefs = React.useMemo(
    () => buildActiveQuestsWithDefs(activeQuests),
    [activeQuests],
  );

  const completedQuestsDisplay = React.useMemo(
    () => buildCompletedQuestsDisplay(completedQuests, completedQuestIds),
    [completedQuests, completedQuestIds],
  );

  // Auto-select first quest when opening or switching tabs
  React.useEffect(() => {
    if (!open) return;
    if (activeTab === "active" && activeQuestsWithDefs.length > 0) {
      if (!selectedQuestId || !activeQuestsWithDefs.some((q) => q.quest.id === selectedQuestId)) {
        setSelectedQuestId(activeQuestsWithDefs[0].quest.id);
      }
    } else if (activeTab === "completed" && completedQuestsDisplay.length > 0) {
      if (!selectedQuestId || !completedQuestsDisplay.some((q) => q.id === selectedQuestId)) {
        setSelectedQuestId(completedQuestsDisplay[0].id);
      }
    }
  }, [open, activeTab, activeQuestsWithDefs, completedQuestsDisplay, selectedQuestId]);

  const handleToggleTrack = React.useCallback((questId: string) => {
    setTrackedQuestId((prev) => (prev === questId ? null : questId));
  }, []);

  const selectedActiveItem =
    activeTab === "active"
      ? (activeQuestsWithDefs.find((q) => q.quest.id === selectedQuestId) ?? null)
      : null;

  const selectedCompletedQuest =
    activeTab === "completed"
      ? (completedQuestsDisplay.find((q) => q.id === selectedQuestId) ?? null)
      : null;

  if (!open) return null;

  const questListContent = (
    <View className={cn("border-border/30", isWide ? "w-80 border-r" : "flex-1")}>
      <ScrollArea className="flex-1">
        {activeTab === "active" &&
          (activeQuestsWithDefs.length === 0 ? (
            <EmptyActiveQuests />
          ) : (
            activeQuestsWithDefs.map((item) => (
              <QuestListItem
                key={item.quest.id}
                item={item}
                isSelected={selectedQuestId === item.quest.id}
                isTracked={trackedQuestId === item.quest.id}
                onSelect={() => setSelectedQuestId(item.quest.id)}
                onToggleTrack={() => handleToggleTrack(item.quest.id)}
              />
            ))
          ))}
        {activeTab === "completed" &&
          (completedQuestsDisplay.length === 0 ? (
            <EmptyCompletedQuests />
          ) : (
            completedQuestsDisplay.map((quest) => (
              <CompletedQuestListItem
                key={quest.id}
                quest={quest}
                isSelected={selectedQuestId === quest.id}
                onSelect={() => setSelectedQuestId(quest.id)}
              />
            ))
          ))}
      </ScrollArea>
    </View>
  );

  const detailContent = (
    <View className={cn("flex-1 px-4 pt-3", !isWide && "mt-2")}>
      {activeTab === "active" && selectedActiveItem && (
        <ActiveQuestDetail
          item={selectedActiveItem}
          isTracked={trackedQuestId === selectedActiveItem.quest.id}
          onToggleTrack={() => handleToggleTrack(selectedActiveItem.quest.id)}
        />
      )}
      {activeTab === "completed" && selectedCompletedQuest && (
        <CompletedQuestDetail quest={selectedCompletedQuest} />
      )}
      {!selectedActiveItem && !selectedCompletedQuest && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-muted-foreground font-body">
            Select a quest to view details
          </Text>
        </View>
      )}
    </View>
  );

  const backButton = (
    <Pressable
      className="min-h-[44px] flex-row items-center px-4 py-2 border-b border-border/30"
      onPress={() => setSelectedQuestId(null)}
      accessibilityRole="button"
      accessibilityLabel="Back to quest list"
    >
      <Text className="text-sm text-frontier-whiskey font-body">{"\u2190"} Back to quests</Text>
    </Pressable>
  );

  return (
    <Modal
      transparent
      visible={open}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <Pressable
        className="absolute inset-0 bg-black/70"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close quest log"
      />

      <Animated.View
        entering={SlideInUp.duration(250)}
        exiting={SlideOutDown.duration(200)}
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-2xl overflow-hidden",
          "bg-card border-t border-border",
          "dark:border-frontier-leather/40 dark:bg-card",
          isWide ? "top-[5%]" : "top-[8%]",
        )}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text variant="subheading" className="text-card-foreground">
            Journal
          </Text>
          <Pressable
            className="min-w-[44px] min-h-[44px] items-center justify-center"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text className="text-lg text-muted-foreground">{"\u2715"}</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "completed")}>
          <TabsList className="mx-4 mb-2 bg-muted">
            <TabsTrigger value="active">
              <Text>Active ({activeQuestsWithDefs.length})</Text>
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Text>Completed ({completedQuestsDisplay.length})</Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="flex-1">
            {isWide ? (
              <View className="flex-1 flex-row">
                {questListContent}
                {detailContent}
              </View>
            ) : selectedActiveItem ? (
              <View className="flex-1">
                {backButton}
                {detailContent}
              </View>
            ) : (
              questListContent
            )}
          </TabsContent>

          <TabsContent value="completed" className="flex-1">
            {isWide ? (
              <View className="flex-1 flex-row">
                {questListContent}
                {detailContent}
              </View>
            ) : selectedCompletedQuest ? (
              <View className="flex-1">
                {backButton}
                {detailContent}
              </View>
            ) : (
              questListContent
            )}
          </TabsContent>
        </Tabs>
      </Animated.View>
    </Modal>
  );
}
