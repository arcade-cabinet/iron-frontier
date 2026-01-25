/**
 * Dialogue Provider
 *
 * Context provider for dialogue state management.
 * Provides dialogue state and actions to all dialogue components.
 */

import * as React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  DialogueActions,
  DialogueChoiceData,
  DialogueUIState,
  NPCPortraitData,
} from './types';

/**
 * Dialogue context value
 */
interface DialogueContextValue {
  /** Current dialogue state (null if no dialogue active) */
  state: DialogueUIState | null;
  /** Whether dialogue is currently active */
  isActive: boolean;
  /** Actions to control dialogue */
  actions: DialogueActions;
}

const DialogueContext = createContext<DialogueContextValue | null>(null);

/**
 * Props for DialogueProvider
 */
export interface DialogueProviderProps {
  /** Children components */
  children: React.ReactNode;
  /** Initial dialogue state */
  initialState?: DialogueUIState | null;
  /** Callback when choice is selected */
  onSelectChoice?: (index: number, choice: DialogueChoiceData) => void;
  /** Callback when dialogue advances */
  onAdvance?: () => void;
  /** Callback when dialogue closes */
  onClose?: () => void;
  /** External state control (for Zustand integration) */
  externalState?: DialogueUIState | null;
  /** External actions (for Zustand integration) */
  externalActions?: Partial<DialogueActions>;
}

/**
 * DialogueProvider component
 *
 * Provides dialogue context to child components. Can be used standalone
 * with internal state or integrated with external state management (Zustand).
 */
export function DialogueProvider({
  children,
  initialState = null,
  onSelectChoice,
  onAdvance,
  onClose,
  externalState,
  externalActions,
}: DialogueProviderProps) {
  // Internal state (used when not controlled externally)
  const [internalState, setInternalState] = useState<DialogueUIState | null>(initialState);

  // Use external state if provided, otherwise use internal
  const state = externalState !== undefined ? externalState : internalState;
  const isActive = state !== null;

  // Select choice action
  const selectChoice = useCallback(
    (index: number) => {
      if (!state) return;

      const choice = state.choices[index];
      if (!choice || !choice.available) return;

      // Call external action if provided
      if (externalActions?.selectChoice) {
        externalActions.selectChoice(index);
        return;
      }

      // Call callback
      onSelectChoice?.(index, choice);

      // If choice ends conversation
      if (choice.nextNodeId === null) {
        setInternalState(null);
        onClose?.();
      }
    },
    [state, externalActions, onSelectChoice, onClose]
  );

  // Advance action (for auto-advance nodes)
  const advance = useCallback(() => {
    if (!state?.autoAdvance) return;

    // Call external action if provided
    if (externalActions?.advance) {
      externalActions.advance();
      return;
    }

    onAdvance?.();
  }, [state, externalActions, onAdvance]);

  // Close action
  const close = useCallback(() => {
    // Call external action if provided
    if (externalActions?.close) {
      externalActions.close();
      return;
    }

    setInternalState(null);
    onClose?.();
  }, [externalActions, onClose]);

  // Go back action
  const goBack = useCallback(() => {
    if (!state || state.history.length === 0) return;

    // Call external action if provided
    if (externalActions?.goBack) {
      externalActions.goBack();
    }
  }, [state, externalActions]);

  // Memoized actions object
  const actions = useMemo<DialogueActions>(
    () => ({
      selectChoice,
      advance,
      close,
      goBack: state?.history && state.history.length > 0 ? goBack : undefined,
    }),
    [selectChoice, advance, close, goBack, state?.history]
  );

  // Memoized context value
  const value = useMemo<DialogueContextValue>(
    () => ({
      state,
      isActive,
      actions,
    }),
    [state, isActive, actions]
  );

  return <DialogueContext.Provider value={value}>{children}</DialogueContext.Provider>;
}

/**
 * Hook to access dialogue context
 *
 * @throws Error if used outside DialogueProvider
 */
export function useDialogue(): DialogueContextValue {
  const context = useContext(DialogueContext);

  if (!context) {
    throw new Error('useDialogue must be used within a DialogueProvider');
  }

  return context;
}

/**
 * Hook to access dialogue state only (memoized)
 */
export function useDialogueState(): DialogueUIState | null {
  const { state } = useDialogue();
  return state;
}

/**
 * Hook to access dialogue actions only (stable reference)
 */
export function useDialogueActions(): DialogueActions {
  const { actions } = useDialogue();
  return actions;
}

/**
 * Hook to check if dialogue is active
 */
export function useIsDialogueActive(): boolean {
  const { isActive } = useDialogue();
  return isActive;
}

/**
 * Helper to create dialogue state from game store data
 */
export function createDialogueUIState(params: {
  npc: NPCPortraitData;
  text: string;
  speaker?: string;
  choices: DialogueChoiceData[];
  autoAdvance?: boolean;
  history?: string[];
}): DialogueUIState {
  return {
    npc: params.npc,
    text: params.text,
    speaker: params.speaker,
    choices: params.choices,
    autoAdvance: params.autoAdvance ?? false,
    history: params.history ?? [],
  };
}

export { DialogueContext };
