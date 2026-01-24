// Quest Log - Journal of active and completed quests
// Updated to support the stage-based quest system
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/gameStore';
import { getQuestById } from '../../data/quests/index';
import type { ActiveQuest, Quest, QuestStage, Objective } from '../../data/schemas/quest';

// ============================================================================
// ICONS
// ============================================================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4 text-green-400', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4 text-amber-500', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" strokeWidth={2} />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3 h-3', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getQuestTypeBadge(type: Quest['type']) {
  const styles: Record<Quest['type'], { bg: string; text: string; label: string }> = {
    main: { bg: 'bg-yellow-600', text: 'text-yellow-100', label: 'Main' },
    side: { bg: 'bg-amber-600', text: 'text-amber-100', label: 'Side' },
    faction: { bg: 'bg-purple-600', text: 'text-purple-100', label: 'Faction' },
    bounty: { bg: 'bg-red-600', text: 'text-red-100', label: 'Bounty' },
    delivery: { bg: 'bg-blue-600', text: 'text-blue-100', label: 'Delivery' },
    exploration: { bg: 'bg-green-600', text: 'text-green-100', label: 'Explore' },
  };
  return styles[type] || styles.side;
}

function isObjectiveComplete(objective: Objective, progress: Record<string, number>): boolean {
  const current = progress[objective.id] ?? 0;
  return current >= objective.count;
}

// ============================================================================
// ACTIVE QUEST CARD
// ============================================================================

interface ActiveQuestCardProps {
  activeQuest: ActiveQuest;
  quest: Quest;
}

function ActiveQuestCard({ activeQuest, quest }: ActiveQuestCardProps) {
  const currentStage = quest.stages[activeQuest.currentStageIndex];
  const typeBadge = getQuestTypeBadge(quest.type);
  const stageProgress = `${activeQuest.currentStageIndex + 1}/${quest.stages.length}`;

  return (
    <Card className="bg-amber-900/40 border-amber-700/50">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-amber-100 text-base flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {quest.type === 'main' && <StarIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
            <span className="truncate">{quest.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={cn(typeBadge.bg, typeBadge.text, 'text-xs')}>
              {typeBadge.label}
            </Badge>
            <Badge variant="outline" className="border-amber-600 text-amber-400 text-xs">
              Stage {stageProgress}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {/* Quest Description */}
        <p className="text-amber-300/80 text-sm mb-2">
          {quest.description}
        </p>

        <Separator className="bg-amber-700/30 my-2" />

        {/* Current Stage Info */}
        {currentStage && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-amber-500 font-medium">
                Current Stage: {currentStage.title}
              </div>
            </div>
            <p className="text-amber-200/70 text-xs mb-3 italic">
              {currentStage.description}
            </p>

            {/* Objectives */}
            <div className="text-xs text-amber-500 mb-2">Objectives:</div>
            <div className="space-y-2">
              {currentStage.objectives.map((objective) => {
                // Skip hidden objectives that haven't been revealed
                if (objective.hidden && !isObjectiveComplete(objective, activeQuest.objectiveProgress)) {
                  return null;
                }

                const current = activeQuest.objectiveProgress[objective.id] ?? 0;
                const completed = current >= objective.count;
                const showProgress = objective.count > 1;

                return (
                  <div
                    key={objective.id}
                    className={cn(
                      'flex items-start gap-2 text-sm',
                      completed ? 'text-green-400' : 'text-amber-200',
                      objective.optional && 'opacity-75'
                    )}
                  >
                    {completed ? <CheckIcon className="mt-0.5 flex-shrink-0" /> : <CircleIcon className="mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <span className={completed ? 'line-through opacity-60' : ''}>
                        {objective.description}
                        {showProgress && ` (${current}/${objective.count})`}
                      </span>
                      {objective.optional && (
                        <span className="text-amber-500 text-xs ml-1">(Optional)</span>
                      )}
                      {objective.mapMarker && (
                        <div className="flex items-center gap-1 text-xs text-amber-400/60 mt-0.5">
                          <MapPinIcon />
                          <span>{objective.mapMarker.markerLabel || objective.mapMarker.locationId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Separator className="bg-amber-700/30 my-2" />

        {/* Rewards Preview */}
        <div className="flex items-center gap-4 text-xs text-amber-500">
          <span>Rewards:</span>
          {quest.rewards.xp > 0 && (
            <span className="text-amber-300">+{quest.rewards.xp} XP</span>
          )}
          {quest.rewards.gold > 0 && (
            <span className="text-yellow-400">+{quest.rewards.gold} Gold</span>
          )}
          {quest.rewards.items && quest.rewards.items.length > 0 && (
            <span className="text-blue-300">+{quest.rewards.items.length} Items</span>
          )}
        </div>

        {/* Stage Progress Bar */}
        {quest.stages.length > 1 && (
          <div className="mt-3">
            <div className="flex gap-1">
              {quest.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    index < activeQuest.currentStageIndex
                      ? 'bg-green-500'
                      : index === activeQuest.currentStageIndex
                        ? 'bg-amber-500'
                        : 'bg-amber-800'
                  )}
                  title={stage.title}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPLETED QUEST CARD
// ============================================================================

interface CompletedQuestCardProps {
  quest: Quest;
}

function CompletedQuestCard({ quest }: CompletedQuestCardProps) {
  const typeBadge = getQuestTypeBadge(quest.type);

  return (
    <Card className="bg-amber-900/20 border-amber-700/30">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <CheckIcon className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-300/80 text-sm font-medium truncate">
                {quest.title}
              </span>
              <Badge className={cn(typeBadge.bg, typeBadge.text, 'text-xs opacity-60')}>
                {typeBadge.label}
              </Badge>
            </div>
            <p className="text-amber-500/50 text-xs mt-0.5 line-clamp-1">
              {quest.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QuestLog() {
  const { activePanel, togglePanel, activeQuests, completedQuests, completedQuestIds } = useGameStore();

  const questLogOpen = activePanel === 'quests';

  // Build active quests with their definitions
  const activeQuestsWithDefs = activeQuests
    .map(aq => ({
      activeQuest: aq,
      quest: getQuestById(aq.questId),
    }))
    .filter((item): item is { activeQuest: ActiveQuest; quest: Quest } => item.quest !== undefined);

  // Sort: main quests first, then by start time
  activeQuestsWithDefs.sort((a, b) => {
    if (a.quest.type === 'main' && b.quest.type !== 'main') return -1;
    if (a.quest.type !== 'main' && b.quest.type === 'main') return 1;
    return a.activeQuest.startedAt - b.activeQuest.startedAt;
  });

  // For completed quests, use the full quest data if available, otherwise look up by ID
  const completedQuestsDisplay = completedQuests.length > 0
    ? completedQuests
    : completedQuestIds.map(id => getQuestById(id)).filter((q): q is Quest => q !== undefined);

  return (
    <Sheet open={questLogOpen} onOpenChange={() => togglePanel('quests')}>
      <SheetContent side="bottom" className="h-[75vh] bg-amber-950 border-amber-700">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-amber-100">Journal</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="active" className="h-[calc(100%-60px)]">
          <TabsList className="w-full bg-amber-900/50">
            <TabsTrigger
              value="active"
              className="flex-1 data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
            >
              Active ({activeQuestsWithDefs.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
            >
              Completed ({completedQuestsDisplay.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="h-[calc(100%-50px)] mt-4">
            <ScrollArea className="h-full pr-2">
              {activeQuestsWithDefs.length === 0 ? (
                <div className="text-amber-400/60 text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No active quests</p>
                  <p className="text-sm mt-1 text-amber-500/50">Talk to folks around town!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeQuestsWithDefs.map(({ activeQuest, quest }) => (
                    <ActiveQuestCard
                      key={activeQuest.questId}
                      activeQuest={activeQuest}
                      quest={quest}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="h-[calc(100%-50px)] mt-4">
            <ScrollArea className="h-full pr-2">
              {completedQuestsDisplay.length === 0 ? (
                <div className="text-amber-400/60 text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No completed quests yet</p>
                  <p className="text-sm mt-1 text-amber-500/50">Your deeds will be recorded here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedQuestsDisplay.map((quest) => (
                    <CompletedQuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
