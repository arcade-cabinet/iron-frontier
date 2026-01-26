/**
 * Combat Keyboard Hook
 *
 * Handles keyboard shortcuts for combat actions.
 * Platform-agnostic implementation that can be used in web or adapted for mobile.
 */

import { useCallback, useEffect } from 'react';
import type { CombatActionType, CombatantUI } from '../types';

interface UseCombatKeyboardOptions {
  /** Whether keyboard controls are enabled */
  enabled: boolean;
  /** Currently available actions */
  actions: { type: CombatActionType; shortcut?: string }[];
  /** Selectable targets */
  targets: CombatantUI[];
  /** Currently selected action */
  selectedAction?: CombatActionType;
  /** Currently selected target index */
  selectedTargetIndex: number;
  /** Callbacks */
  onSelectAction: (action: CombatActionType) => void;
  onSelectTarget: (targetId: string) => void;
  onExecute: () => void;
  onCancel: () => void;
  onTargetIndexChange: (index: number) => void;
}

export function useCombatKeyboard(options: UseCombatKeyboardOptions): void {
  const {
    enabled,
    actions,
    targets,
    selectedAction,
    selectedTargetIndex,
    onSelectAction,
    onSelectTarget,
    onExecute,
    onCancel,
    onTargetIndexChange,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = event.key.toLowerCase();

      // Number keys 1-9 for action selection
      if (/^[1-9]$/.test(key)) {
        const index = parseInt(key, 10) - 1;
        if (index < actions.length) {
          event.preventDefault();
          onSelectAction(actions[index].type);
        }
        return;
      }

      // Target selection with arrow keys when action is selected
      if (selectedAction && targets.length > 0) {
        if (key === 'arrowleft' || key === 'a') {
          event.preventDefault();
          const newIndex = selectedTargetIndex > 0 ? selectedTargetIndex - 1 : targets.length - 1;
          onTargetIndexChange(newIndex);
          onSelectTarget(targets[newIndex].id);
          return;
        }

        if (key === 'arrowright' || key === 'd') {
          event.preventDefault();
          const newIndex = selectedTargetIndex < targets.length - 1 ? selectedTargetIndex + 1 : 0;
          onTargetIndexChange(newIndex);
          onSelectTarget(targets[newIndex].id);
          return;
        }

        // Enter/Space to confirm
        if (key === 'enter' || key === ' ') {
          event.preventDefault();
          if (targets[selectedTargetIndex]) {
            onExecute();
          }
          return;
        }
      }

      // Escape to cancel
      if (key === 'escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      // Tab to cycle through targets
      if (key === 'tab' && selectedAction && targets.length > 0) {
        event.preventDefault();
        const direction = event.shiftKey ? -1 : 1;
        let newIndex = selectedTargetIndex + direction;
        if (newIndex < 0) newIndex = targets.length - 1;
        if (newIndex >= targets.length) newIndex = 0;
        onTargetIndexChange(newIndex);
        onSelectTarget(targets[newIndex].id);
        return;
      }
    },
    [
      enabled,
      actions,
      targets,
      selectedAction,
      selectedTargetIndex,
      onSelectAction,
      onSelectTarget,
      onExecute,
      onCancel,
      onTargetIndexChange,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    // Only add listener if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
}
