/**
 * Dialogue Box Component
 *
 * Main dialogue container that combines portrait, text, and choices.
 * Positioned at the bottom of the screen with semi-transparent background.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '../primitives/utils';
import { ChoiceList } from './ChoiceList';
import { DialogueText } from './DialogueText';
import { NPCPortrait } from './NPCPortrait';
import type { DialogueBaseProps, DialogueUIState, TypewriterConfig } from './types';

/**
 * Dialogue box container variants
 */
const dialogueBoxVariants = cva(
  [
    'fixed left-0 right-0 bottom-0',
    'z-50',
    // Semi-transparent dark overlay for the full width
    'bg-gradient-to-t from-obsidian-950/95 via-obsidian-900/90 to-transparent',
    'backdrop-blur-sm',
    // Animation
    'transition-transform duration-300 ease-out',
  ].join(' '),
  {
    variants: {
      visible: {
        true: 'translate-y-0',
        false: 'translate-y-full',
      },
      layout: {
        standard: 'pb-4 pt-8',
        compact: 'pb-2 pt-4',
      },
    },
    defaultVariants: {
      visible: true,
      layout: 'standard',
    },
  }
);

/**
 * Inner content container
 */
const contentContainerVariants = cva(
  [
    'mx-auto',
    'px-4',
    'flex gap-4',
    'items-start',
  ].join(' '),
  {
    variants: {
      layout: {
        standard: 'max-w-4xl flex-row',
        compact: 'max-w-2xl flex-col sm:flex-row',
      },
    },
    defaultVariants: {
      layout: 'standard',
    },
  }
);

export interface DialogueBoxProps
  extends DialogueBaseProps,
    VariantProps<typeof dialogueBoxVariants> {
  /** Dialogue state */
  state: DialogueUIState;
  /** Called when a choice is selected */
  onSelectChoice: (index: number) => void;
  /** Called when dialogue should advance (auto-advance or continue) */
  onAdvance: () => void;
  /** Called when dialogue should close */
  onClose: () => void;
  /** Typewriter configuration */
  typewriterConfig?: TypewriterConfig;
  /** Whether to enable typewriter effect */
  enableTypewriter?: boolean;
  /** Show portrait */
  showPortrait?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Layout variant */
  layout?: 'standard' | 'compact';
  /** Custom portrait renderer */
  renderPortrait?: (npc: DialogueUIState['npc']) => React.ReactNode;
}

/**
 * Close button component
 */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-2 right-2',
        'w-8 h-8',
        'flex items-center justify-center',
        'rounded-full',
        'bg-obsidian-800/50 text-parchment-200',
        'hover:bg-obsidian-700 hover:text-parchment-50',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-bronze-500'
      )}
      aria-label="Close dialogue"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

/**
 * DialogueBox component
 *
 * The main dialogue UI container that combines all dialogue elements:
 * - NPC portrait with name and emotion
 * - Dialogue text with typewriter effect
 * - Choice list for player responses
 *
 * Positioned at the bottom of the screen, allowing the game world to
 * remain visible above.
 */
export const DialogueBox = React.forwardRef<HTMLDivElement, DialogueBoxProps>(
  (
    {
      state,
      onSelectChoice,
      onAdvance,
      onClose,
      typewriterConfig,
      enableTypewriter = true,
      showPortrait = true,
      showCloseButton = true,
      layout = 'standard',
      visible = true,
      renderPortrait,
      className,
      testID,
    },
    ref
  ) => {
    const [textComplete, setTextComplete] = useState(false);
    const [showChoices, setShowChoices] = useState(false);

    // Reset states when dialogue node changes
    useEffect(() => {
      setTextComplete(false);
      setShowChoices(false);
    }, [state.text]);

    // Handle text completion
    const handleTextComplete = useCallback(() => {
      setTextComplete(true);
      // Show choices after a brief delay
      setTimeout(() => setShowChoices(true), 200);
    }, []);

    // Handle click on text area
    const handleTextClick = useCallback(() => {
      if (textComplete) {
        // If no choices and auto-advance, advance
        if (state.autoAdvance || state.choices.length === 0) {
          onAdvance();
        }
      }
    }, [textComplete, state.autoAdvance, state.choices.length, onAdvance]);

    // Keyboard handler for escape to close
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Determine if we have choices to show
    const hasChoices = state.choices.length > 0;
    const shouldShowChoices = hasChoices && showChoices;

    return (
      <div
        ref={ref}
        className={cn(dialogueBoxVariants({ visible, layout }), className)}
        role="dialog"
        aria-label={`Dialogue with ${state.npc.name}`}
        aria-modal="true"
        data-testid={testID}
      >
        {/* Close button */}
        {showCloseButton && <CloseButton onClick={onClose} />}

        {/* Content container */}
        <div className={contentContainerVariants({ layout })}>
          {/* Portrait section */}
          {showPortrait && (
            <div className="flex-shrink-0">
              {renderPortrait ? (
                renderPortrait(state.npc)
              ) : (
                <NPCPortrait
                  npc={state.npc}
                  emotion={state.npc.emotion}
                  size={layout === 'compact' ? 'sm' : 'md'}
                  animate={true}
                  showName={true}
                />
              )}
            </div>
          )}

          {/* Text and choices section */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Dialogue text */}
            <DialogueText
              text={state.text}
              speaker={state.speaker}
              typewriterConfig={typewriterConfig}
              enableTypewriter={enableTypewriter}
              onComplete={handleTextComplete}
              onClick={handleTextClick}
              showContinueIndicator={textComplete && !hasChoices}
              size={layout === 'compact' ? 'sm' : 'md'}
              variant="dialogue"
            />

            {/* Choice list */}
            {shouldShowChoices && (
              <ChoiceList
                choices={state.choices}
                onSelect={onSelectChoice}
                enableKeyboard={true}
                showNumbers={true}
                showConsequences={true}
                interactionDelay={100}
                size={layout === 'compact' ? 'sm' : 'md'}
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-2 duration-300'
                )}
              />
            )}

            {/* Auto-advance hint */}
            {textComplete && state.autoAdvance && (
              <div className="text-center text-sm text-parchment-300">
                Click or press any key to continue...
              </div>
            )}
          </div>
        </div>

        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-bronze-500/50 to-transparent" />
      </div>
    );
  }
);

DialogueBox.displayName = 'DialogueBox';

export { dialogueBoxVariants, contentContainerVariants };
