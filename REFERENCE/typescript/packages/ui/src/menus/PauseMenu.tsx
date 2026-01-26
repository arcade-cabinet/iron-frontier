/**
 * PauseMenu Component
 *
 * Overlay menu shown when the game is paused.
 * Provides access to inventory, map, save/load, settings, and quit options.
 *
 * @example
 * ```tsx
 * <PauseMenu
 *   open={isPaused}
 *   onResume={() => resumeGame()}
 *   onInventory={() => openInventory()}
 *   onMap={() => openMap()}
 *   onSave={() => openSaveMenu()}
 *   onLoad={() => openLoadMenu()}
 *   onSettings={() => openSettings()}
 *   onQuit={() => quitToMenu()}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps } from './types';
import {
  BackpackIcon,
  GearIcon,
  HomeIcon,
  LoadIcon,
  MapIcon,
  MenuButton,
  MenuOverlay,
  MenuPanel,
  PlayIcon,
  QuitIcon,
  SaveIcon,
} from './shared';

export interface PauseMenuProps extends MenuBaseProps {
  /** Callback when Resume is clicked */
  onResume?: () => void;
  /** Callback when Inventory is clicked */
  onInventory?: () => void;
  /** Callback when Map is clicked */
  onMap?: () => void;
  /** Callback when Save is clicked */
  onSave?: () => void;
  /** Callback when Load is clicked */
  onLoad?: () => void;
  /** Callback when Settings is clicked */
  onSettings?: () => void;
  /** Callback when Quit to Menu is clicked */
  onQuit?: () => void;
  /** Current game time for display */
  gameTime?: string;
  /** Current location for display */
  currentLocation?: string;
}

export function PauseMenu({
  open = false,
  onClose,
  onResume,
  onInventory,
  onMap,
  onSave,
  onLoad,
  onSettings,
  onQuit,
  gameTime,
  currentLocation,
  className,
  testID,
}: PauseMenuProps) {
  const handleResume = () => {
    onResume?.();
    onClose?.();
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case 'p':
        case 'P':
          e.preventDefault();
          handleResume();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          onInventory?.();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          onMap?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onInventory, onMap]);

  return (
    <MenuOverlay
      open={open}
      onClose={handleResume}
      transparent
      className={className}
    >
      <div
        data-testid={testID}
        className="flex items-center justify-center min-h-full p-4"
      >
        <MenuPanel maxWidth="sm" className="animate-in zoom-in-95 fade-in duration-200">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-200 tracking-wide uppercase">
              Paused
            </h2>
            {(gameTime || currentLocation) && (
              <div className="flex items-center justify-center gap-3 mt-2 text-xs sm:text-sm text-stone-400">
                {currentLocation && <span>{currentLocation}</span>}
                {gameTime && currentLocation && <span className="text-stone-600">|</span>}
                {gameTime && <span>{gameTime}</span>}
              </div>
            )}
          </div>

          {/* Menu Buttons */}
          <div className="flex flex-col gap-2">
            <MenuButton
              variant="primary"
              icon={<PlayIcon className="w-5 h-5" />}
              onClick={handleResume}
            >
              Resume
            </MenuButton>

            <div className="h-px bg-amber-800/30 my-2" />

            {onInventory && (
              <MenuButton
                variant="secondary"
                icon={<BackpackIcon className="w-5 h-5" />}
                onClick={onInventory}
              >
                <span className="flex-1 text-left">Inventory</span>
                <kbd className="hidden sm:inline text-[10px] text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded">I</kbd>
              </MenuButton>
            )}

            {onMap && (
              <MenuButton
                variant="secondary"
                icon={<MapIcon className="w-5 h-5" />}
                onClick={onMap}
              >
                <span className="flex-1 text-left">Map</span>
                <kbd className="hidden sm:inline text-[10px] text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded">M</kbd>
              </MenuButton>
            )}

            <div className="h-px bg-amber-800/30 my-2" />

            {onSave && (
              <MenuButton
                variant="secondary"
                icon={<SaveIcon className="w-5 h-5" />}
                onClick={onSave}
              >
                Save Game
              </MenuButton>
            )}

            {onLoad && (
              <MenuButton
                variant="secondary"
                icon={<LoadIcon className="w-5 h-5" />}
                onClick={onLoad}
              >
                Load Game
              </MenuButton>
            )}

            <div className="h-px bg-amber-800/30 my-2" />

            {onSettings && (
              <MenuButton
                variant="ghost"
                icon={<GearIcon className="w-5 h-5" />}
                onClick={onSettings}
              >
                Settings
              </MenuButton>
            )}

            {onQuit && (
              <MenuButton
                variant="danger"
                icon={<QuitIcon className="w-5 h-5" />}
                onClick={onQuit}
              >
                Quit to Menu
              </MenuButton>
            )}
          </div>

          {/* Footer hint */}
          <p className="text-center text-[10px] sm:text-xs text-stone-600 mt-4">
            Press ESC or P to resume
          </p>
        </MenuPanel>
      </div>
    </MenuOverlay>
  );
}

PauseMenu.displayName = 'PauseMenu';

export default PauseMenu;
