/**
 * GameOverScreen - Displayed when the player dies
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '../store/gameStore';

export function GameOverScreen() {
  const { phase, playerName, resetGame, setPhase, playerStats, heal } = useGameStore();

  if (phase !== 'game_over') return null;

  const handleLoadLastSave = () => {
    // For now, just restore health and continue
    // In a full implementation, this would load from save file
    heal(playerStats.maxHealth);
    setPhase('playing');
  };

  const handleReturnToTitle = () => {
    resetGame();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <Card className="bg-stone-900 border-red-900 max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          {/* Skull decoration */}
          <div className="text-red-600 mb-6">
            <svg
              className="w-24 h-24 mx-auto"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12c0 3.32 1.62 6.27 4.12 8.09L4 22l2.91-2.91c.02.01.05.01.07.01 1.47.58 3.1.9 4.82.9 5.52 0 10-4.48 10-10S17.52 2 12 2zm-3.5 14c-.83 0-1.5-.67-1.5-1.5S7.67 13 8.5 13s1.5.67 1.5 1.5S9.33 16 8.5 16zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm.5-5H8c-.55 0-1-.45-1-1V9c0-2.21 1.79-4 4-4h2c2.21 0 4 1.79 4 4v1c0 .55-.45 1-1 1z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-red-600 mb-2">DEAD</h1>
          <p className="text-stone-400 mb-2">
            {playerName} met their end on the frontier.
          </p>
          <p className="text-stone-500 text-sm mb-8">
            The West claims another soul...
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleLoadLastSave}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white"
            >
              Rise Again
            </Button>
            <Button
              onClick={handleReturnToTitle}
              variant="outline"
              className="w-full border-stone-600 text-stone-300 hover:bg-stone-800"
            >
              Return to Title
            </Button>
          </div>

          <p className="text-stone-600 text-xs mt-6">
            "Every man dies. Not every man really lives."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default GameOverScreen;
