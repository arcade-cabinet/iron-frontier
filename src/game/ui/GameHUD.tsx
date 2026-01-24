// Game HUD - Always visible stats display
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '../store/gameStore';
import { getQuestById } from '../../data/quests/index';

// Icons
function HeartIcon() {
  return (
    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">$</text>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function GameHUD() {
  const { playerStats, playerName, activeQuests } = useGameStore();

  const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
  const xpPercent = (playerStats.xp / playerStats.xpToNext) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none">
      <div className="flex justify-between items-start gap-2">
        {/* Left - Player Name & Level */}
        <Card className="bg-amber-950/90 border-amber-700/50 backdrop-blur-sm pointer-events-auto">
          <CardContent className="p-2 px-3">
            <div className="text-amber-100 font-bold text-sm truncate max-w-[120px]">
              {playerName}
            </div>
            <div className="flex items-center gap-1 text-amber-300 text-xs">
              <StarIcon />
              <span>Level {playerStats.level}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right - Health & Gold */}
        <Card className="bg-amber-950/90 border-amber-700/50 backdrop-blur-sm pointer-events-auto min-w-[130px]">
          <CardContent className="p-2 space-y-1.5">
            {/* Health bar */}
            <div className="flex items-center gap-2">
              <HeartIcon />
              <div className="flex-1 relative">
                <Progress
                  value={healthPercent}
                  className="h-2 bg-amber-900/50"
                  aria-label="Health"
                />
              </div>
              <span className="text-amber-100 text-xs w-12 text-right font-mono whitespace-nowrap">
                {playerStats.health}/{playerStats.maxHealth} HP
              </span>
            </div>

            {/* XP bar */}
            <div className="flex items-center gap-2">
              <StarIcon />
              <div className="flex-1">
                <Progress
                  value={xpPercent}
                  className="h-1.5 bg-amber-900/50"
                  aria-label="Experience"
                />
              </div>
              <span className="text-amber-400 text-xs w-8 text-right font-mono">
                {playerStats.xp}
              </span>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-2">
              <CoinIcon />
              <span className="text-amber-200 text-sm font-bold">{playerStats.gold}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active quest indicator */}
      {activeQuests.length > 0 && (() => {
        const activeQuest = activeQuests[0];
        const questDef = getQuestById(activeQuest.questId);
        if (!questDef) return null;

        const currentStage = questDef.stages[activeQuest.currentStageIndex];
        const currentObjective = currentStage?.objectives.find(obj => {
          const progress = activeQuest.objectiveProgress[obj.id] ?? 0;
          return progress < obj.count;
        });

        return (
          <div className="mt-2">
            <Card className="bg-amber-950/80 border-amber-700/30 backdrop-blur-sm inline-block">
              <CardContent className="p-2 px-3">
                <div className="text-amber-400 text-xs font-medium">
                  {questDef.title}
                </div>
                <div className="text-amber-300/70 text-xs">
                  {currentObjective?.description || currentStage?.title || 'Complete quest'}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
