// Game HUD - Compact always-visible stats display (western-themed)
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/gameStore';
import { getQuestById } from '../../data/quests/index';

// ============================================================================
// ICONS
// ============================================================================

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3.5 h-3.5', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3.5 h-3.5', className)} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3 h-3', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3.5 h-3.5', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
    </svg>
  );
}

// ============================================================================
// MAIN HUD COMPONENT
// ============================================================================

export function GameHUD() {
  const { playerStats, playerName, activeQuests, currentLocationId, loadedWorld } = useGameStore();

  const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
  const xpPercent = (playerStats.xp / playerStats.xpToNext) * 100;

  // Get current location name
  const currentLocation = currentLocationId ? loadedWorld?.locations.get(currentLocationId) : null;
  const locationName = currentLocation?.ref.name || 'Unknown Territory';

  // Get health color based on percentage
  const getHealthColor = () => {
    if (healthPercent > 60) return 'text-green-400';
    if (healthPercent > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBarColor = () => {
    if (healthPercent > 60) return '[&>div]:bg-green-500';
    if (healthPercent > 30) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-2 pointer-events-none">
      {/* Main HUD Bar */}
      <Card className="bg-amber-950/90 border-amber-800/60 backdrop-blur-md pointer-events-auto shadow-lg">
        <CardContent className="p-2">
          <div className="flex items-center gap-3">
            {/* Player Info - Left */}
            <div className="flex items-center gap-2 pr-3 border-r border-amber-700/40">
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-amber-800/60 border border-amber-600/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-amber-100 font-bold text-xs truncate max-w-[80px]">
                  {playerName}
                </div>
                <div className="flex items-center gap-1 text-amber-400/80 text-[10px]">
                  <StarIcon className="text-amber-500" />
                  <span>Lv.{playerStats.level}</span>
                </div>
              </div>
            </div>

            {/* Stats - Center */}
            <div className="flex-1 flex items-center gap-4">
              {/* Health */}
              <div className="flex items-center gap-1.5 min-w-[100px]">
                <HeartIcon className={getHealthColor()} />
                <div className="flex-1">
                  <Progress
                    value={healthPercent}
                    className={cn('h-1.5 bg-amber-900/60', getHealthBarColor())}
                    aria-label="Health"
                  />
                </div>
                <span className={cn('text-[10px] font-mono w-8 text-right', getHealthColor())}>
                  {playerStats.health}
                </span>
              </div>

              {/* XP */}
              <div className="flex items-center gap-1.5 min-w-[80px]">
                <StarIcon className="text-amber-400" />
                <div className="flex-1">
                  <Progress
                    value={xpPercent}
                    className="h-1 bg-amber-900/60 [&>div]:bg-amber-500"
                    aria-label="Experience"
                  />
                </div>
                <span className="text-amber-400/80 text-[10px] font-mono w-8 text-right">
                  {playerStats.xp}
                </span>
              </div>
            </div>

            {/* Gold - Right */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-amber-700/40">
              <CoinIcon className="text-yellow-500" />
              <span className="text-yellow-400 font-bold text-sm min-w-[40px] text-right">
                {playerStats.gold}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Quest Tracker - Below HUD */}
      <div className="flex items-start justify-between mt-1.5 gap-2">
        {/* Current Location */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-950/70 backdrop-blur-sm rounded border border-amber-800/40">
          <CompassIcon className="text-amber-500" />
          <span className="text-amber-200 text-[10px] font-medium">{locationName}</span>
        </div>

        {/* Active Quest Tracker */}
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
            <div className="max-w-[200px] px-2 py-1 bg-amber-950/70 backdrop-blur-sm rounded border border-amber-800/40">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-amber-300 text-[10px] font-medium truncate">
                  {questDef.title}
                </span>
              </div>
              <div className="text-amber-400/70 text-[9px] truncate mt-0.5">
                {currentObjective?.description || currentStage?.title || 'Complete quest'}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
