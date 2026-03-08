/**
 * QuestLog - Quest tracking interface (React Native / Expo)
 *
 * Ported from legacy/angular-ui/quest-log.component.ts
 * Full-screen modal with tabs for active/completed quests,
 * quest list on left, detail view on right (landscape) or inline (portrait).
 *
 * @module components/game/QuestLog
 */

import * as React from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';

import {
  Badge,
  Card,
  CardContent,
  Progress,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { getQuestById } from '@/src/game/data/quests';
import type { ActiveQuest, Objective, Quest, QuestType } from '@/src/game/data/schemas/quest';
import { gameStore } from '@/src/game/store/webGameStore';

// =============================================================================
// TYPES
// =============================================================================

interface QuestLogProps {
  /** Whether the quest log modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
}

interface QuestWithActive {
  activeQuest: ActiveQuest;
  quest: Quest;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const QUEST_TYPE_STYLES: Record<
  QuestType,
  { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }
> = {
  main: { variant: 'warning', label: 'Main' },
  side: { variant: 'default', label: 'Side' },
  faction: { variant: 'info', label: 'Faction' },
  bounty: { variant: 'danger', label: 'Bounty' },
  delivery: { variant: 'info', label: 'Delivery' },
  exploration: { variant: 'success', label: 'Explore' },
};

// =============================================================================
// HELPERS
// =============================================================================

function getTypeBadge(type: QuestType) {
  return QUEST_TYPE_STYLES[type] ?? QUEST_TYPE_STYLES.side;
}

function isObjectiveComplete(objective: Objective, progress: Record<string, number>): boolean {
  const current = progress[objective.id] ?? objective.current ?? 0;
  return current >= objective.count;
}

function getObjectiveProgress(objective: Objective, progress: Record<string, number>): number {
  return progress[objective.id] ?? objective.current ?? 0;
}

function shouldShowObjective(objective: Objective, progress: Record<string, number>): boolean {
  if (!objective.hidden) return true;
  return isObjectiveComplete(objective, progress);
}

function buildActiveQuestsWithDefs(activeQuests: ActiveQuest[]): QuestWithActive[] {
  const items = activeQuests
    .map((activeQuest) => {
      const quest = getQuestById(activeQuest.questId);
      return quest ? { activeQuest, quest } : null;
    })
    .filter((item): item is QuestWithActive => item !== null);

  // Main quests first, then by start time
  items.sort((a, b) => {
    if (a.quest.type === 'main' && b.quest.type !== 'main') return -1;
    if (a.quest.type !== 'main' && b.quest.type === 'main') return 1;
    return a.activeQuest.startedAt - b.activeQuest.startedAt;
  });

  return items;
}

function buildCompletedQuestsDisplay(
  completedQuests: Quest[],
  completedQuestIds: string[],
): Quest[] {
  if (completedQuests.length > 0) return completedQuests;
  return completedQuestIds
    .map((id) => getQuestById(id))
    .filter((q): q is Quest => q !== undefined);
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Star icon for main quests */
function StarIcon() {
  return (
    <Text className="text-frontier-whiskey text-sm">{'*'}</Text>
  );
}

/** Pin icon for tracked quest */
function PinIcon({ active }: { active: boolean }) {
  return (
    <Text className={cn('text-base', active ? 'text-frontier-whiskey' : 'text-muted-foreground')}>
      {active ? '\u2605' : '\u2606'}
    </Text>
  );
}

// -----------------------------------------------------------------------------
// Quest List Item (left panel / list row)
// -----------------------------------------------------------------------------

interface QuestListItemProps {
  item: QuestWithActive;
  isSelected: boolean;
  isTracked: boolean;
  onSelect: () => void;
  onToggleTrack: () => void;
}

function QuestListItem({ item, isSelected, isTracked, onSelect, onToggleTrack }: QuestListItemProps) {
  const { quest, activeQuest } = item;
  const badge = getTypeBadge(quest.type);
  const stageProgress = `${activeQuest.currentStageIndex + 1}/${quest.stages.length}`;

  return (
    <Pressable
      className={cn(
        'min-h-[44px] flex-row items-center px-3 py-2.5 border-b border-border/30',
        isSelected && 'bg-frontier-leather/20',
      )}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Quest: ${quest.title}`}
    >
      {/* Track button */}
      <Pressable
        className="min-w-[44px] min-h-[44px] items-center justify-center -ml-2"
        onPress={onToggleTrack}
        accessibilityRole="button"
        accessibilityLabel={isTracked ? 'Untrack quest' : 'Track quest'}
        hitSlop={8}
      >
        <PinIcon active={isTracked} />
      </Pressable>

      {/* Quest info */}
      <View className="flex-1 min-w-0 mr-2">
        <View className="flex-row items-center gap-1.5">
          {quest.type === 'main' && <StarIcon />}
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

      {/* Type badge */}
      <Badge variant={badge.variant} className="ml-auto">
        <Text>{badge.label}</Text>
      </Badge>
    </Pressable>
  );
}

// -----------------------------------------------------------------------------
// Completed Quest List Item
// -----------------------------------------------------------------------------

interface CompletedQuestListItemProps {
  quest: Quest;
  isSelected: boolean;
  onSelect: () => void;
}

function CompletedQuestListItem({ quest, isSelected, onSelect }: CompletedQuestListItemProps) {
  const badge = getTypeBadge(quest.type);

  return (
    <Pressable
      className={cn(
        'min-h-[44px] flex-row items-center px-3 py-2.5 border-b border-border/30',
        isSelected && 'bg-frontier-leather/20',
      )}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Completed quest: ${quest.title}`}
    >
      <Text className="text-frontier-sage mr-2">{'\u2713'}</Text>
      <View className="flex-1 min-w-0 mr-2">
        <Text
          className="text-sm font-medium text-muted-foreground font-heading"
          numberOfLines={1}
        >
          {quest.title}
        </Text>
      </View>
      <Badge variant={badge.variant} className="opacity-60">
        <Text>{badge.label}</Text>
      </Badge>
    </Pressable>
  );
}

// -----------------------------------------------------------------------------
// Objective Row
// -----------------------------------------------------------------------------

interface ObjectiveRowProps {
  objective: Objective;
  progress: Record<string, number>;
}

function ObjectiveRow({ objective, progress }: ObjectiveRowProps) {
  const completed = isObjectiveComplete(objective, progress);
  const current = getObjectiveProgress(objective, progress);
  const showCount = objective.count > 1;

  return (
    <View className="flex-row items-start gap-2 py-1">
      {/* Status icon */}
      <Text className={cn('text-sm mt-0.5', completed ? 'text-frontier-sage' : 'text-frontier-whiskey')}>
        {completed ? '\u2713' : '\u25CB'}
      </Text>

      {/* Description */}
      <View className="flex-1 min-w-0">
        <Text
          className={cn(
            'text-sm font-body',
            completed ? 'text-frontier-sage line-through opacity-60' : 'text-card-foreground',
          )}
        >
          {objective.description}
          {showCount ? ` (${current}/${objective.count})` : ''}
        </Text>

        {objective.optional && (
          <Text className="text-xs text-muted-foreground font-body">(Optional)</Text>
        )}

        {objective.mapMarker && (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Text className="text-xs text-muted-foreground">{'\u{1F4CD}'}</Text>
            <Text className="text-xs text-muted-foreground font-body">
              {objective.mapMarker.markerLabel ?? objective.mapMarker.locationId}
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar for multi-count objectives */}
      {showCount && !completed && (
        <View className="w-16 justify-center">
          <Progress value={(current / objective.count) * 100} className="h-2" />
        </View>
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Stage Progress Dots
// -----------------------------------------------------------------------------

interface StageProgressProps {
  stages: Quest['stages'];
  currentIndex: number;
}

function StageProgress({ stages, currentIndex }: StageProgressProps) {
  if (stages.length <= 1) return null;

  return (
    <View className="flex-row gap-1 mt-3">
      {stages.map((stage, idx) => (
        <View
          key={stage.id}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            idx < currentIndex
              ? 'bg-frontier-sage'
              : idx === currentIndex
                ? 'bg-frontier-whiskey'
                : 'bg-muted',
          )}
        />
      ))}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Quest Chain Indicator
// -----------------------------------------------------------------------------

function QuestChainIndicator({ quest }: { quest: Quest }) {
  // Show chain info if quest unlocks other quests or has prerequisites
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
              'w-2 h-2 rounded-full',
              i < position ? 'bg-frontier-whiskey' : 'bg-muted',
            )}
          />
        ))}
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Rewards Row
// -----------------------------------------------------------------------------

function RewardsRow({ rewards }: { rewards: Quest['rewards'] }) {
  const hasRewards = rewards.xp > 0 || rewards.gold > 0 || (rewards.items?.length ?? 0) > 0;
  if (!hasRewards) return null;

  return (
    <View className="flex-row items-center gap-3 flex-wrap">
      <Text className="text-xs text-muted-foreground font-body">Rewards:</Text>
      {rewards.xp > 0 && (
        <Text className="text-xs text-frontier-sky font-body font-medium">+{rewards.xp} XP</Text>
      )}
      {rewards.gold > 0 && (
        <Text className="text-xs text-frontier-whiskey font-body font-medium">
          +{rewards.gold} Gold
        </Text>
      )}
      {rewards.reputation && Object.keys(rewards.reputation).length > 0 && (
        <>
          {Object.entries(rewards.reputation).map(([faction, rep]) => (
            <Text
              key={faction}
              className={cn(
                'text-xs font-body font-medium',
                rep > 0 ? 'text-frontier-sage' : 'text-frontier-blood',
              )}
            >
              {rep > 0 ? '+' : ''}
              {rep} {faction}
            </Text>
          ))}
        </>
      )}
      {(rewards.items?.length ?? 0) > 0 && (
        <Text className="text-xs text-frontier-sky font-body font-medium">
          +{rewards.items!.length} Item{rewards.items!.length > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Active Quest Detail
// -----------------------------------------------------------------------------

interface ActiveQuestDetailProps {
  item: QuestWithActive;
  isTracked: boolean;
  onToggleTrack: () => void;
}

function ActiveQuestDetail({ item, isTracked, onToggleTrack }: ActiveQuestDetailProps) {
  const { quest, activeQuest } = item;
  const currentStage = quest.stages[activeQuest.currentStageIndex];

  return (
    <ScrollArea contentContainerClassName="pb-8">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1 min-w-0 mr-3">
          <View className="flex-row items-center gap-2">
            {quest.type === 'main' && <StarIcon />}
            <Text variant="subheading" className="text-card-foreground">
              {quest.title}
            </Text>
          </View>
        </View>
        <Pressable
          className="min-w-[44px] min-h-[44px] items-center justify-center"
          onPress={onToggleTrack}
          accessibilityRole="button"
          accessibilityLabel={isTracked ? 'Untrack quest' : 'Set as tracked quest'}
        >
          <PinIcon active={isTracked} />
        </Pressable>
      </View>

      {/* Type badge + stage indicator */}
      <View className="flex-row items-center gap-2 mb-3">
        <Badge variant={getTypeBadge(quest.type).variant}>
          <Text>{getTypeBadge(quest.type).label}</Text>
        </Badge>
        <Text className="text-xs text-muted-foreground font-body">
          Stage {activeQuest.currentStageIndex + 1} of {quest.stages.length}
        </Text>
      </View>

      {/* Description */}
      <Text className="text-sm text-muted-foreground font-body leading-5 mb-3">
        {quest.description}
      </Text>

      <Separator className="mb-3" />

      {/* Stages list with checkmarks */}
      <Text className="text-xs text-muted-foreground font-body font-medium mb-2">
        Quest Stages
      </Text>
      {quest.stages.map((stage, idx) => {
        const isCompleted = idx < activeQuest.currentStageIndex;
        const isCurrent = idx === activeQuest.currentStageIndex;

        return (
          <View key={stage.id} className="flex-row items-start gap-2 mb-1.5">
            <Text
              className={cn(
                'text-sm mt-0.5',
                isCompleted
                  ? 'text-frontier-sage'
                  : isCurrent
                    ? 'text-frontier-whiskey'
                    : 'text-muted',
              )}
            >
              {isCompleted ? '\u2713' : isCurrent ? '\u25B6' : '\u25CB'}
            </Text>
            <Text
              className={cn(
                'text-sm font-body',
                isCompleted
                  ? 'text-frontier-sage line-through opacity-60'
                  : isCurrent
                    ? 'text-card-foreground font-medium'
                    : 'text-muted-foreground',
              )}
            >
              {stage.title}
            </Text>
          </View>
        );
      })}

      <StageProgress stages={quest.stages} currentIndex={activeQuest.currentStageIndex} />

      <Separator className="my-3" />

      {/* Current stage objectives */}
      {currentStage && (
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
            if (!shouldShowObjective(obj, activeQuest.objectiveProgress)) {
              return null;
            }
            return (
              <ObjectiveRow
                key={obj.id}
                objective={obj}
                progress={activeQuest.objectiveProgress}
              />
            );
          })}
        </>
      )}

      <Separator className="my-3" />

      {/* Rewards */}
      <RewardsRow rewards={quest.rewards} />

      {/* Quest chain */}
      <QuestChainIndicator quest={quest} />
    </ScrollArea>
  );
}

// -----------------------------------------------------------------------------
// Completed Quest Detail
// -----------------------------------------------------------------------------

function CompletedQuestDetail({ quest }: { quest: Quest }) {
  return (
    <ScrollArea contentContainerClassName="pb-8">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-1">
        <Text className="text-frontier-sage text-lg">{'\u2713'}</Text>
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

      {/* All stages (completed) */}
      <Text className="text-xs text-muted-foreground font-body font-medium mb-2">
        Quest Stages
      </Text>
      {quest.stages.map((stage) => (
        <View key={stage.id} className="flex-row items-start gap-2 mb-1.5">
          <Text className="text-sm text-frontier-sage mt-0.5">{'\u2713'}</Text>
          <Text className="text-sm font-body text-frontier-sage line-through opacity-60">
            {stage.title}
          </Text>
        </View>
      ))}

      <Separator className="my-3" />

      {/* Rewards earned */}
      <Text className="text-xs text-muted-foreground font-body font-medium mb-2">
        Rewards Earned
      </Text>
      <RewardsRow rewards={quest.rewards} />

      {/* Quest chain */}
      <QuestChainIndicator quest={quest} />
    </ScrollArea>
  );
}

// -----------------------------------------------------------------------------
// Empty States
// -----------------------------------------------------------------------------

function EmptyActiveQuests() {
  return (
    <View className="flex-1 items-center justify-center py-12 px-4">
      <Text className="text-3xl mb-3">{'\u{1F4DC}'}</Text>
      <Text className="text-sm text-muted-foreground font-body text-center">
        No active quests
      </Text>
      <Text className="text-xs text-muted-foreground/50 font-body text-center mt-1">
        Talk to folks around town!
      </Text>
    </View>
  );
}

function EmptyCompletedQuests() {
  return (
    <View className="flex-1 items-center justify-center py-12 px-4">
      <Text className="text-3xl mb-3">{'\u{2705}'}</Text>
      <Text className="text-sm text-muted-foreground font-body text-center">
        No completed quests yet
      </Text>
      <Text className="text-xs text-muted-foreground/50 font-body text-center mt-1">
        Your deeds will be recorded here
      </Text>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestLog({ open, onClose }: QuestLogProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // ---------------------------------------------------------------------------
  // Store
  // ---------------------------------------------------------------------------
  const activeQuests = gameStore((s) => s.activeQuests);
  const completedQuests = gameStore((s) => s.completedQuests);
  const completedQuestIds = gameStore((s) => s.completedQuestIds);

  // ---------------------------------------------------------------------------
  // Local state
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = React.useState<'active' | 'completed'>('active');
  const [selectedQuestId, setSelectedQuestId] = React.useState<string | null>(null);
  const [trackedQuestId, setTrackedQuestId] = React.useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
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
    if (activeTab === 'active' && activeQuestsWithDefs.length > 0) {
      if (!selectedQuestId || !activeQuestsWithDefs.some((q) => q.quest.id === selectedQuestId)) {
        setSelectedQuestId(activeQuestsWithDefs[0].quest.id);
      }
    } else if (activeTab === 'completed' && completedQuestsDisplay.length > 0) {
      if (!selectedQuestId || !completedQuestsDisplay.some((q) => q.id === selectedQuestId)) {
        setSelectedQuestId(completedQuestsDisplay[0].id);
      }
    }
  }, [open, activeTab, activeQuestsWithDefs, completedQuestsDisplay, selectedQuestId]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleToggleTrack = React.useCallback(
    (questId: string) => {
      setTrackedQuestId((prev) => (prev === questId ? null : questId));
    },
    [],
  );

  // Find selected quest data
  const selectedActiveItem =
    activeTab === 'active'
      ? activeQuestsWithDefs.find((q) => q.quest.id === selectedQuestId) ?? null
      : null;

  const selectedCompletedQuest =
    activeTab === 'completed'
      ? completedQuestsDisplay.find((q) => q.id === selectedQuestId) ?? null
      : null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (!open) return null;

  const questListContent = (
    <View className={cn('border-border/30', isWide ? 'w-80 border-r' : 'flex-1')}>
      <ScrollArea className="flex-1">
        {activeTab === 'active' && (
          <>
            {activeQuestsWithDefs.length === 0 ? (
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
            )}
          </>
        )}
        {activeTab === 'completed' && (
          <>
            {completedQuestsDisplay.length === 0 ? (
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
            )}
          </>
        )}
      </ScrollArea>
    </View>
  );

  const detailContent = (
    <View className={cn('flex-1 px-4 pt-3', !isWide && 'mt-2')}>
      {activeTab === 'active' && selectedActiveItem && (
        <ActiveQuestDetail
          item={selectedActiveItem}
          isTracked={trackedQuestId === selectedActiveItem.quest.id}
          onToggleTrack={() => handleToggleTrack(selectedActiveItem.quest.id)}
        />
      )}
      {activeTab === 'completed' && selectedCompletedQuest && (
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

  return (
    <Modal
      transparent
      visible={open}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        className="absolute inset-0 bg-black/70"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close quest log"
      />

      {/* Panel */}
      <Animated.View
        entering={SlideInUp.duration(250)}
        exiting={SlideOutDown.duration(200)}
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-2xl overflow-hidden',
          'bg-card border-t border-border',
          'dark:border-frontier-leather/40 dark:bg-card',
          isWide ? 'top-[5%]' : 'top-[8%]',
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
            <Text className="text-lg text-muted-foreground">{'\u2715'}</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'completed')}>
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
                {/* Back button for narrow screens when detail is shown */}
                <Pressable
                  className="min-h-[44px] flex-row items-center px-4 py-2 border-b border-border/30"
                  onPress={() => setSelectedQuestId(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Back to quest list"
                >
                  <Text className="text-sm text-frontier-whiskey font-body">
                    {'\u2190'} Back to quests
                  </Text>
                </Pressable>
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
                <Pressable
                  className="min-h-[44px] flex-row items-center px-4 py-2 border-b border-border/30"
                  onPress={() => setSelectedQuestId(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Back to quest list"
                >
                  <Text className="text-sm text-frontier-whiskey font-body">
                    {'\u2190'} Back to quests
                  </Text>
                </Pressable>
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
