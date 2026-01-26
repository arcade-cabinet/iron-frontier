/**
 * SaveLoadScreen Component
 *
 * Save and load game menu with multiple save slots.
 * Shows location, playtime, date, and optional thumbnails for each slot.
 *
 * @example
 * ```tsx
 * <SaveLoadScreen
 *   open={showSaveLoad}
 *   onClose={() => setShowSaveLoad(false)}
 *   mode="save"
 *   slots={saveSlots}
 *   onSave={(slotId) => saveGame(slotId)}
 *   onLoad={(slotId) => loadGame(slotId)}
 *   onDelete={(slotId) => deleteSave(slotId)}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps, SaveSlot } from './types';
import {
  CloseIcon,
  LoadIcon,
  MenuOverlay,
  MenuPanel,
  SaveIcon,
  TabGroup,
  TrashIcon,
  formatDate,
  formatPlayTime,
} from './shared';

export interface SaveLoadScreenProps extends MenuBaseProps {
  /** Mode: 'save' or 'load' */
  mode?: 'save' | 'load';
  /** Available save slots */
  slots?: SaveSlot[];
  /** Callback when saving to a slot */
  onSave?: (slotId: string) => void;
  /** Callback when loading from a slot */
  onLoad?: (slotId: string) => void;
  /** Callback when deleting a save */
  onDelete?: (slotId: string) => void;
  /** Whether to show the auto-save slot */
  showAutoSave?: boolean;
}

function SaveSlotCard({
  slot,
  mode,
  onAction,
  onDelete,
}: {
  slot: SaveSlot;
  mode: 'save' | 'load';
  onAction: () => void;
  onDelete?: () => void;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const canSave = mode === 'save' && !slot.isAutoSave;
  const canLoad = mode === 'load' && !slot.isEmpty;
  const canDelete = !slot.isEmpty && !slot.isAutoSave;

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete?.();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };

  // Reset confirm state when mode changes
  React.useEffect(() => {
    setShowConfirmDelete(false);
  }, [mode]);

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 overflow-hidden',
        'transition-all duration-200',
        slot.isEmpty
          ? 'bg-stone-800/30 border-stone-700/30 border-dashed'
          : 'bg-stone-800/50 border-stone-700/50',
        slot.isAutoSave && 'border-amber-700/50'
      )}
    >
      {/* Auto-save badge */}
      {slot.isAutoSave && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-700/50 text-amber-300 text-[10px] font-medium uppercase tracking-wide z-10">
          Auto-Save
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Thumbnail placeholder */}
        <div
          className={cn(
            'w-20 h-14 sm:w-28 sm:h-20 rounded bg-stone-900 flex-shrink-0',
            'flex items-center justify-center',
            slot.isEmpty ? 'border border-stone-700/50' : ''
          )}
        >
          {slot.thumbnail ? (
            <img
              src={slot.thumbnail}
              alt="Save thumbnail"
              className="w-full h-full object-cover rounded"
            />
          ) : slot.isEmpty ? (
            <span className="text-stone-600 text-2xl">+</span>
          ) : (
            <SaveIcon className="w-8 h-8 text-stone-600" />
          )}
        </div>

        {/* Slot info */}
        <div className="flex-1 min-w-0">
          {slot.isEmpty ? (
            <div className="h-full flex flex-col items-start justify-center">
              <p className="text-stone-500 text-sm">Empty Slot</p>
              <p className="text-stone-600 text-xs mt-1">
                {mode === 'save' ? 'Click to save here' : 'No save data'}
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-base sm:text-lg font-bold text-stone-200 truncate">
                {slot.playerName || 'Unknown'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 truncate">
                {slot.location || 'Unknown location'}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[10px] sm:text-xs text-stone-500">
                {slot.playTime !== undefined && (
                  <span>{formatPlayTime(slot.playTime)}</span>
                )}
                {slot.dateSaved && (
                  <>
                    <span className="text-stone-700">|</span>
                    <span>{formatDate(slot.dateSaved)}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {(canSave || canLoad) && (
            <button
              onClick={onAction}
              disabled={mode === 'load' && slot.isEmpty}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm',
                'transition-colors min-h-[40px] sm:min-h-[36px] min-w-[60px]',
                mode === 'save'
                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                  : slot.isEmpty
                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    : 'bg-green-700 hover:bg-green-600 text-white'
              )}
            >
              {mode === 'save' ? 'Save' : 'Load'}
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm',
                'transition-colors min-h-[40px] sm:min-h-[36px]',
                showConfirmDelete
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-red-400'
              )}
            >
              {showConfirmDelete ? 'Confirm' : <TrashIcon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Confirm delete warning */}
      {showConfirmDelete && (
        <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50">
          <p className="text-xs text-red-400">
            Delete this save? This cannot be undone.
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="ml-2 underline hover:no-underline"
            >
              Cancel
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

// Default save slots
const DEFAULT_SLOTS: SaveSlot[] = [
  { id: 'auto', isEmpty: true, isAutoSave: true },
  { id: 'slot1', isEmpty: true },
  { id: 'slot2', isEmpty: true },
  { id: 'slot3', isEmpty: true },
  { id: 'slot4', isEmpty: true },
  { id: 'slot5', isEmpty: true },
];

export function SaveLoadScreen({
  open = false,
  onClose,
  mode: initialMode = 'save',
  slots = DEFAULT_SLOTS,
  onSave,
  onLoad,
  onDelete,
  showAutoSave = true,
  className,
  testID,
}: SaveLoadScreenProps) {
  const [mode, setMode] = React.useState<'save' | 'load'>(initialMode);

  // Update mode when prop changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Filter slots based on showAutoSave
  const displaySlots = showAutoSave ? slots : slots.filter((s) => !s.isAutoSave);

  const handleAction = (slotId: string) => {
    if (mode === 'save') {
      onSave?.(slotId);
    } else {
      onLoad?.(slotId);
    }
  };

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4"
      >
        <MenuPanel maxWidth="lg" className="sm:max-h-[80vh] flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {mode === 'save' ? (
                <SaveIcon className="w-6 h-6 text-amber-400" />
              ) : (
                <LoadIcon className="w-6 h-6 text-green-400" />
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-amber-200 tracking-wide uppercase">
                {mode === 'save' ? 'Save Game' : 'Load Game'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </header>

          {/* Mode Tabs */}
          <div className="mb-4">
            <TabGroup
              tabs={[
                { id: 'save', label: 'Save', icon: <SaveIcon className="w-4 h-4" /> },
                { id: 'load', label: 'Load', icon: <LoadIcon className="w-4 h-4" /> },
              ]}
              activeTab={mode}
              onTabChange={(id) => setMode(id as 'save' | 'load')}
            />
          </div>

          {/* Slots List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {displaySlots.map((slot) => (
              <SaveSlotCard
                key={slot.id}
                slot={slot}
                mode={mode}
                onAction={() => handleAction(slot.id)}
                onDelete={() => onDelete?.(slot.id)}
              />
            ))}
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-stone-600 mt-4 pt-4 border-t border-stone-800/50">
            Press ESC to close
          </p>
        </MenuPanel>
      </div>
    </MenuOverlay>
  );
}

SaveLoadScreen.displayName = 'SaveLoadScreen';

export default SaveLoadScreen;
