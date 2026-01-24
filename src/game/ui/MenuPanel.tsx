// Menu Panel - Main game menu
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/gameStore';

export function MenuPanel() {
  const {
    activePanel,
    togglePanel,
    resetGame,
    playerStats,
    playerName,
    saveGame,
    settings,
    setPhase
  } = useGameStore();

  const menuOpen = activePanel === 'menu';

  const xpPercent = (playerStats.xp / playerStats.xpToNext) * 100;
  const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;

  const handleSaveAndClose = () => {
    saveGame();
    togglePanel('menu');
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleNewGame = () => {
    if (confirm('Start a new journey? Current progress will be saved but you will start fresh.')) {
      resetGame();
    }
  };

  const handleMainMenu = () => {
    if (confirm('Return to main menu? Your progress has been auto-saved.')) {
      saveGame();
      setPhase('title');
      togglePanel('menu');
    }
  };

  return (
    <Sheet open={menuOpen} onOpenChange={() => togglePanel('menu')}>
      <SheetContent side="left" className="w-[300px] bg-amber-950 border-amber-700">
        <SheetHeader>
          <SheetTitle className="text-amber-100 text-xl">Iron Frontier</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Player Info Card */}
          <Card className="bg-amber-900/40 border-amber-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-amber-100 font-bold">{playerName}</div>
                  <div className="text-amber-400 text-sm">Level {playerStats.level}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Health */}
                <div>
                  <div className="flex justify-between text-xs text-amber-400 mb-1">
                    <span>Health</span>
                    <span>{playerStats.health} / {playerStats.maxHealth}</span>
                  </div>
                  <Progress value={healthPercent} className="h-2 bg-amber-900/50" />
                </div>

                {/* XP */}
                <div>
                  <div className="flex justify-between text-xs text-amber-400 mb-1">
                    <span>Experience</span>
                    <span>{playerStats.xp} / {playerStats.xpToNext}</span>
                  </div>
                  <Progress value={xpPercent} className="h-2 bg-amber-900/50" />
                </div>

                {/* Gold */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-amber-400 text-sm">Gold</span>
                  <span className="text-yellow-400 font-bold">{playerStats.gold}</span>
                </div>

                {/* Reputation */}
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 text-sm">Reputation</span>
                  <span className={cn(
                    'font-medium',
                    playerStats.reputation >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {playerStats.reputation >= 0 ? '+' : ''}{playerStats.reputation}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-amber-700/30" />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50 justify-start"
              onClick={handleSaveAndClose}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Progress
            </Button>

            <Button
              variant="outline"
              className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50 justify-start"
              onClick={handleMainMenu}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Main Menu
            </Button>

            <Separator className="bg-amber-700/30" />

            <Button
              variant="outline"
              className="w-full border-red-700/50 text-red-400 hover:bg-red-900/30 justify-start"
              onClick={handleNewGame}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Game
            </Button>
          </div>

          {/* Version */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-amber-600/50 text-xs text-center">
              Iron Frontier v1.0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
