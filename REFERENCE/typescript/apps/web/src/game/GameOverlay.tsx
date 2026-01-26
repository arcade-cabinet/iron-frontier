/**
 * GameOverlay - React DOM UI elements that overlay the 3D canvas
 *
 * Contains all UI components that render on top of the R3F Canvas:
 * - HUD (health, gold, XP, location)
 * - Action Bar
 * - Modal Panels (inventory, quests, character, menu)
 * - World Map
 * - Dialogue Box
 * - Combat Panel
 * - Shop Panel
 * - Travel Panel
 * - Notifications
 * - Game Over Screen
 * - Puzzle Interface
 */

import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from './store/webGameStore';
import { useGamePhase } from './useGamePhase';

// UI Components
import { ActionBar } from './ui/ActionBar';
import { CharacterPanel } from './ui/CharacterPanel';
import { CombatPanel } from './ui/CombatPanel';
import { DialogueBox } from './ui/DialogueBox';
import { GameHUD } from './ui/GameHUD';
import { GameOverScreen } from './ui/GameOverScreen';
import { InventoryPanel } from './ui/InventoryPanel';
import { MenuPanel } from './ui/MenuPanel';
import { NotificationFeed } from './ui/NotificationFeed';
import { PipePuzzle } from './ui/PipePuzzle';
import { QuestLog } from './ui/QuestLog';
import { ShopPanel } from './ui/ShopPanel';
import { TravelPanel } from './ui/TravelPanel';
import { WorldMap } from './ui/WorldMap';

export interface GameOverlayProps {
  /** Whether to show the HUD */
  showHUD?: boolean;
  /** Whether to show the action bar */
  showActionBar?: boolean;
  /** Callback when world map is requested */
  onOpenWorldMap?: () => void;
}

/**
 * GameOverlay - All React DOM UI that sits on top of the 3D canvas
 */
export function GameOverlay({
  showHUD = true,
  showActionBar = true,
}: GameOverlayProps) {
  const { phase, isInCombat, allowsOverlay } = useGamePhase();
  const { travelTo, shopState, travelState } = useGameStore();
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);

  // Handle travel from world map
  const handleTravelTo = useCallback(
    (locationId: string) => {
      travelTo(locationId);
      setIsWorldMapOpen(false);
    },
    [travelTo]
  );

  // Keyboard shortcuts for world map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 'M' key opens world map
      if (e.key === 'm' || e.key === 'M') {
        if (phase === 'playing') {
          setIsWorldMapOpen((prev) => !prev);
        }
      }

      // Escape closes world map
      if (e.key === 'Escape' && isWorldMapOpen) {
        setIsWorldMapOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isWorldMapOpen]);

  // Don't render overlay if the current phase doesn't allow it
  if (!allowsOverlay) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Always-visible HUD elements */}
      {showHUD && (
        <div className="pointer-events-auto">
          <GameHUD />
        </div>
      )}

      {/* Action Bar */}
      {showActionBar && phase === 'playing' && (
        <div className="pointer-events-auto">
          <ActionBar onOpenMap={() => setIsWorldMapOpen(true)} />
        </div>
      )}

      {/* Dialogue Box */}
      <div className="pointer-events-auto">
        <DialogueBox />
      </div>

      {/* Notifications */}
      <div className="pointer-events-auto">
        <NotificationFeed />
      </div>

      {/* Modal Panels */}
      <CharacterPanel />
      <InventoryPanel />
      <QuestLog />
      <MenuPanel />

      {/* World Map */}
      <WorldMap
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        onTravelTo={handleTravelTo}
      />

      {/* Combat Panel */}
      {isInCombat && <CombatPanel />}

      {/* Puzzle Interface */}
      {phase === 'puzzle' && <PipePuzzle />}

      {/* Shop Panel */}
      {shopState && <ShopPanel />}

      {/* Travel Panel */}
      {travelState && <TravelPanel />}

      {/* Game Over Screen */}
      <GameOverScreen />
    </div>
  );
}

/**
 * LoadingOverlay - Shown while 3D scene is loading
 */
export function LoadingOverlay({
  message = 'Loading Iron Frontier...',
  subMessage = 'Preparing the frontier',
}: {
  message?: string;
  subMessage?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 z-50">
      <div className="text-center">
        <div className="text-amber-500 text-xl mb-2">{message}</div>
        <div className="text-stone-400 text-sm">{subMessage}</div>
        {/* Loading spinner */}
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

/**
 * ErrorOverlay - Shown when 3D scene fails to load
 */
export function ErrorOverlay({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-950/90 z-50">
      <div className="text-center max-w-md p-4">
        <div className="text-red-500 text-xl mb-2">Failed to load game</div>
        <div className="text-stone-400 text-sm mb-4">{error}</div>
        {onRetry && (
          <button
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
        <button
          className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded ml-2 transition-colors"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export default GameOverlay;
