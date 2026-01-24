// Quest Log - Journal of active and completed quests
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/gameStore';

// Icons
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" strokeWidth={2} />
    </svg>
  );
}

export function QuestLog() {
  const { activePanel, togglePanel, activeQuests, completedQuestIds } = useGameStore();

  const questLogOpen = activePanel === 'quests';

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
              Active ({activeQuests.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
            >
              Completed ({completedQuestIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="h-[calc(100%-50px)] mt-4">
            <ScrollArea className="h-full pr-2">
              {activeQuests.length === 0 ? (
                <div className="text-amber-400/60 text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No active quests</p>
                  <p className="text-sm mt-1 text-amber-500/50">Talk to folks around town!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeQuests.map((quest) => (
                    <Card key={quest.id} className="bg-amber-900/40 border-amber-700/50">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-amber-100 text-base flex items-center justify-between">
                          <span>{quest.title}</span>
                          <Badge className="bg-amber-600 text-amber-100 text-xs">
                            Active
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-amber-300/80 text-sm mb-3">
                          {quest.description}
                        </p>

                        <Separator className="bg-amber-700/30 my-2" />

                        <div className="text-xs text-amber-500 mb-2">Objectives:</div>
                        <div className="space-y-2">
                          {quest.objectives.map((obj) => (
                            <div
                              key={obj.id}
                              className={cn(
                                'flex items-center gap-2 text-sm',
                                obj.completed ? 'text-green-400' : 'text-amber-200'
                              )}
                            >
                              {obj.completed ? <CheckIcon /> : <CircleIcon />}
                              <span className={obj.completed ? 'line-through opacity-60' : ''}>
                                {obj.description} ({obj.current}/{obj.required})
                              </span>
                            </div>
                          ))}
                        </div>

                        <Separator className="bg-amber-700/30 my-2" />

                        <div className="flex items-center gap-4 text-xs text-amber-500">
                          <span>Rewards:</span>
                          <span className="text-amber-300">+{quest.rewards.xp} XP</span>
                          <span className="text-yellow-400">+{quest.rewards.gold} Gold</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="h-[calc(100%-50px)] mt-4">
            <ScrollArea className="h-full pr-2">
              {completedQuestIds.length === 0 ? (
                <div className="text-amber-400/60 text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No completed quests yet</p>
                  <p className="text-sm mt-1 text-amber-500/50">Your deeds will be recorded here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedQuestIds.map((questId, index) => (
                    <Card key={questId} className="bg-amber-900/20 border-amber-700/30">
                      <CardContent className="p-3 flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-amber-300/60 text-sm">
                          Quest #{index + 1} ({questId}) Completed
                        </span>
                      </CardContent>
                    </Card>
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
