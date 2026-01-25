/**
 * MainMenu Component
 *
 * The primary menu screen shown when the game launches.
 * Features the game logo, main action buttons, and version info.
 *
 * @example
 * ```tsx
 * <MainMenu
 *   version="0.1.0"
 *   hasSaveData={true}
 *   onNewGame={() => startNewGame()}
 *   onContinue={() => continueGame()}
 *   onSettings={() => openSettings()}
 *   onCredits={() => showCredits()}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps } from './types';
import { GearIcon, MenuButton, PlayIcon } from './shared';

export interface MainMenuProps extends MenuBaseProps {
  /** Game version to display */
  version?: string;
  /** Whether there's existing save data to continue */
  hasSaveData?: boolean;
  /** Saved player name if continuing */
  savedPlayerName?: string;
  /** Callback when New Game is clicked */
  onNewGame?: () => void;
  /** Callback when Continue is clicked */
  onContinue?: () => void;
  /** Callback when Settings is clicked */
  onSettings?: () => void;
  /** Callback when Credits is clicked */
  onCredits?: () => void;
}

/**
 * Animated gear decoration
 */
function AnimatedGear({
  size,
  position,
  duration,
  reverse,
  opacity,
}: {
  size: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  duration: number;
  reverse?: boolean;
  opacity: number;
}) {
  return (
    <div
      className="absolute text-amber-600 animate-spin pointer-events-none"
      style={{
        width: size,
        height: size,
        ...position,
        opacity,
        animationDuration: `${duration}s`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      <GearIcon className="w-full h-full" />
    </div>
  );
}

export function MainMenu({
  version = '0.1.0',
  hasSaveData = false,
  savedPlayerName,
  onNewGame,
  onContinue,
  onSettings,
  onCredits,
  className,
  testID,
}: MainMenuProps) {
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [playerName, setPlayerName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showNameInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNameInput]);

  const handleNewGame = () => {
    if (showNameInput) {
      if (playerName.trim()) {
        onNewGame?.();
      }
    } else {
      setShowNameInput(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && playerName.trim()) {
      onNewGame?.();
    } else if (e.key === 'Escape') {
      setShowNameInput(false);
      setPlayerName('');
    }
  };

  return (
    <div
      data-testid={testID}
      className={cn(
        'fixed inset-0 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950',
        'flex flex-col items-center justify-center',
        'p-6 overflow-hidden',
        className
      )}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-orange-600/10 blur-[80px]" />

        {/* Animated gears */}
        <AnimatedGear size={96} position={{ top: '10%', right: '10%' }} duration={30} opacity={0.15} />
        <AnimatedGear size={64} position={{ bottom: '20%', left: '10%' }} duration={20} reverse opacity={0.1} />
        <AnimatedGear size={80} position={{ top: '50%', right: '25%' }} duration={25} opacity={0.08} />
        <AnimatedGear size={48} position={{ top: '30%', left: '20%' }} duration={15} reverse opacity={0.12} />
      </div>

      {/* Title Section */}
      <div className="text-center mb-8 sm:mb-12 relative z-10">
        {/* Logo/Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 font-serif">
            IRON FRONTIER
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-amber-600/80 text-xs sm:text-sm mt-2 sm:mt-3 tracking-widest uppercase">
          Tales of the Steam Frontier
        </p>
      </div>

      {/* Tagline */}
      <p className="text-stone-400 text-center max-w-sm mb-8 sm:mb-12 text-xs sm:text-sm relative z-10 px-4">
        The year is 1887. Steam and brass have conquered the frontier.
        Fortune awaits those brave enough to claim it.
      </p>

      {/* Menu Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs relative z-10">
        {showNameInput ? (
          /* Name Input State */
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your name, stranger..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              className={cn(
                'w-full px-4 py-3 rounded-lg text-center',
                'bg-stone-800 border-2 border-amber-700/50',
                'text-amber-100 placeholder:text-stone-500',
                'focus:outline-none focus:border-amber-500',
                'font-serif text-lg'
              )}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowNameInput(false);
                  setPlayerName('');
                }}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg font-medium',
                  'bg-stone-700 hover:bg-stone-600 text-stone-300',
                  'transition-colors min-h-[48px]'
                )}
              >
                Back
              </button>
              <button
                onClick={handleNewGame}
                disabled={!playerName.trim()}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg font-medium',
                  'bg-amber-700 hover:bg-amber-600 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2',
                  'transition-colors min-h-[48px]'
                )}
              >
                <PlayIcon className="w-5 h-5" />
                Start
              </button>
            </div>
          </div>
        ) : (
          /* Main Menu State */
          <div className="space-y-3 animate-in fade-in duration-200">
            {hasSaveData && onContinue && (
              <MenuButton
                variant="primary"
                icon={<PlayIcon className="w-5 h-5" />}
                onClick={onContinue}
              >
                Continue{savedPlayerName ? ` as ${savedPlayerName}` : ''}
              </MenuButton>
            )}

            <MenuButton
              variant={hasSaveData ? 'secondary' : 'primary'}
              icon={!hasSaveData ? <PlayIcon className="w-5 h-5" /> : undefined}
              onClick={handleNewGame}
            >
              {hasSaveData ? 'New Game' : 'Begin Adventure'}
            </MenuButton>

            {onSettings && (
              <MenuButton
                variant="ghost"
                icon={<GearIcon className="w-5 h-5" />}
                onClick={onSettings}
              >
                Settings
              </MenuButton>
            )}

            {onCredits && (
              <MenuButton variant="ghost" onClick={onCredits}>
                Credits
              </MenuButton>
            )}
          </div>
        )}
      </div>

      {/* Version */}
      <div className="absolute bottom-6 text-stone-600 text-xs sm:text-sm">
        v{version}
      </div>
    </div>
  );
}

MainMenu.displayName = 'MainMenu';

export default MainMenu;
