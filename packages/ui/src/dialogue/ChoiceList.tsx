/**
 * Choice List Component
 *
 * Displays a list of dialogue choices for player selection.
 * Supports keyboard navigation, hover states, and disabled choices.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '../primitives/utils';
import type { DialogueBaseProps, DialogueChoiceData } from './types';

/**
 * Choice list container variants
 */
const choiceListVariants = cva(
  [
    'flex flex-col gap-2',
    'p-3',
    'rounded-lg',
    // Subtle parchment background
    'bg-parchment-100/80',
    'border border-leather-200',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Individual choice button variants
 */
const choiceButtonVariants = cva(
  [
    'relative',
    'flex items-start gap-3',
    'w-full',
    'px-4 py-3',
    'rounded-md',
    'text-left',
    'transition-all duration-150',
    'border-2',
    // Focus styles
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-bronze-500 focus-visible:ring-offset-2',
  ].join(' '),
  {
    variants: {
      state: {
        default: [
          'bg-parchment-50',
          'border-leather-300',
          'text-obsidian-800',
          'hover:bg-parchment-200',
          'hover:border-bronze-400',
          'active:bg-parchment-300',
          'cursor-pointer',
        ].join(' '),
        focused: [
          'bg-bronze-50',
          'border-bronze-500',
          'text-obsidian-900',
          'shadow-md',
          'cursor-pointer',
        ].join(' '),
        disabled: [
          'bg-parchment-200/50',
          'border-leather-200',
          'text-obsidian-400',
          'cursor-not-allowed',
          'opacity-60',
        ].join(' '),
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

/**
 * Choice number badge variants
 */
const choiceNumberVariants = cva(
  [
    'flex items-center justify-center',
    'w-6 h-6',
    'rounded-full',
    'font-mono font-bold',
    'text-sm',
    'flex-shrink-0',
  ].join(' '),
  {
    variants: {
      state: {
        default: 'bg-leather-300 text-parchment-50',
        focused: 'bg-bronze-500 text-white',
        disabled: 'bg-leather-200 text-obsidian-400',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface ChoiceListProps
  extends DialogueBaseProps,
    VariantProps<typeof choiceListVariants> {
  /** List of choices to display */
  choices: DialogueChoiceData[];
  /** Called when a choice is selected */
  onSelect: (index: number) => void;
  /** Whether keyboard navigation is enabled */
  enableKeyboard?: boolean;
  /** Maximum number of visible choices (scroll for more) */
  maxVisible?: number;
  /** Show choice numbers (for keyboard hints) */
  showNumbers?: boolean;
  /** Show consequence previews */
  showConsequences?: boolean;
  /** Delay before choices are interactive (ms) */
  interactionDelay?: number;
}

/**
 * Tooltip component for disabled choice reasons
 */
function DisabledTooltip({
  reason,
  visible,
  children,
}: {
  reason?: string;
  visible: boolean;
  children: React.ReactNode;
}) {
  if (!reason) return <>{children}</>;

  return (
    <div className="relative group">
      {children}
      {visible && (
        <div
          className={cn(
            'absolute left-full top-1/2 -translate-y-1/2 ml-2',
            'px-3 py-2',
            'bg-obsidian-800 text-parchment-50',
            'text-sm rounded shadow-lg',
            'whitespace-nowrap',
            'z-10',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-150'
          )}
        >
          {reason}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-obsidian-800" />
        </div>
      )}
    </div>
  );
}

/**
 * Consequence preview badge
 */
function ConsequenceBadge({ consequence }: { consequence: string }) {
  // Determine badge style based on consequence content
  const isNegative =
    consequence.toLowerCase().includes('anger') ||
    consequence.toLowerCase().includes('negative') ||
    consequence.toLowerCase().includes('hostile');
  const isPositive =
    consequence.toLowerCase().includes('trust') ||
    consequence.toLowerCase().includes('positive') ||
    consequence.toLowerCase().includes('friendly');

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-2 py-0.5 ml-2',
        'text-xs rounded-full',
        'font-medium',
        isNegative && 'bg-crimson-100 text-crimson-700',
        isPositive && 'bg-sage-100 text-sage-700',
        !isNegative && !isPositive && 'bg-amber-100 text-amber-700'
      )}
    >
      {consequence}
    </span>
  );
}

/**
 * ChoiceList component
 *
 * Displays dialogue choices with keyboard navigation support (1-9 keys),
 * hover/focus states, and disabled choices with tooltip explanations.
 */
export const ChoiceList = React.forwardRef<HTMLDivElement, ChoiceListProps>(
  (
    {
      choices,
      onSelect,
      enableKeyboard = true,
      maxVisible = 5,
      showNumbers = true,
      showConsequences = true,
      interactionDelay = 0,
      size,
      className,
      testID,
    },
    ref
  ) => {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isInteractive, setIsInteractive] = useState(interactionDelay === 0);
    const [hoveredDisabledIndex, setHoveredDisabledIndex] = useState(-1);

    // Enable interaction after delay
    useEffect(() => {
      if (interactionDelay > 0) {
        const timer = setTimeout(() => {
          setIsInteractive(true);
        }, interactionDelay);
        return () => clearTimeout(timer);
      }
    }, [interactionDelay]);

    // Keyboard navigation
    useEffect(() => {
      if (!enableKeyboard || !isInteractive) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // Number keys 1-9 for quick selection
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9 && num <= choices.length) {
          const index = num - 1;
          const choice = choices[index];
          if (choice.available) {
            e.preventDefault();
            onSelect(index);
          }
          return;
        }

        // Arrow key navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();

          const direction = e.key === 'ArrowDown' ? 1 : -1;
          let newIndex = focusedIndex;

          // Find next available choice
          for (let i = 0; i < choices.length; i++) {
            newIndex = (newIndex + direction + choices.length) % choices.length;
            if (choices[newIndex].available) {
              break;
            }
          }

          setFocusedIndex(newIndex);
        }

        // Enter to select focused
        if (e.key === 'Enter' && focusedIndex >= 0) {
          const choice = choices[focusedIndex];
          if (choice.available) {
            e.preventDefault();
            onSelect(focusedIndex);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enableKeyboard, isInteractive, choices, focusedIndex, onSelect]);

    // Reset focus when choices change
    useEffect(() => {
      setFocusedIndex(-1);
    }, [choices]);

    // Handle choice click
    const handleClick = useCallback(
      (index: number) => {
        if (!isInteractive) return;

        const choice = choices[index];
        if (choice.available) {
          onSelect(index);
        }
      },
      [choices, isInteractive, onSelect]
    );

    // Get choice state
    const getChoiceState = (index: number): 'default' | 'focused' | 'disabled' => {
      if (!choices[index].available) return 'disabled';
      if (focusedIndex === index) return 'focused';
      return 'default';
    };

    return (
      <div
        ref={ref}
        className={cn(
          choiceListVariants({ size }),
          !isInteractive && 'opacity-50 pointer-events-none',
          'transition-opacity duration-300',
          className
        )}
        role="listbox"
        aria-label="Dialogue choices"
        data-testid={testID}
        style={{
          maxHeight: maxVisible * 60, // Approximate height per choice
          overflowY: choices.length > maxVisible ? 'auto' : 'visible',
        }}
      >
        {choices.map((choice, index) => {
          const state = getChoiceState(index);
          const isDisabled = !choice.available;

          return (
            <DisabledTooltip
              key={index}
              reason={choice.unavailableReason}
              visible={hoveredDisabledIndex === index}
            >
              <button
                type="button"
                className={choiceButtonVariants({ state })}
                onClick={() => handleClick(index)}
                onMouseEnter={() => {
                  if (!isDisabled) setFocusedIndex(index);
                  if (isDisabled) setHoveredDisabledIndex(index);
                }}
                onMouseLeave={() => {
                  if (focusedIndex === index) setFocusedIndex(-1);
                  if (isDisabled) setHoveredDisabledIndex(-1);
                }}
                onFocus={() => !isDisabled && setFocusedIndex(index)}
                onBlur={() => focusedIndex === index && setFocusedIndex(-1)}
                disabled={isDisabled}
                role="option"
                aria-selected={focusedIndex === index}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : 0}
              >
                {/* Number badge */}
                {showNumbers && (
                  <span className={choiceNumberVariants({ state })}>{index + 1}</span>
                )}

                {/* Choice content */}
                <div className="flex-1">
                  {/* Choice text */}
                  <span className="font-serif">{choice.text}</span>

                  {/* Consequence preview */}
                  {showConsequences && choice.consequence && (
                    <ConsequenceBadge consequence={choice.consequence} />
                  )}

                  {/* Hint text */}
                  {choice.hint && (
                    <span className="block mt-1 text-xs text-obsidian-500 italic">
                      {choice.hint}
                    </span>
                  )}
                </div>

                {/* Arrow indicator for focused state */}
                {state === 'focused' && (
                  <svg
                    className="w-5 h-5 text-bronze-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}

                {/* Lock icon for disabled */}
                {isDisabled && (
                  <svg
                    className="w-4 h-4 text-obsidian-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </button>
            </DisabledTooltip>
          );
        })}

        {/* Keyboard hint */}
        {enableKeyboard && isInteractive && (
          <div className="mt-2 pt-2 border-t border-leather-200 text-center">
            <span className="text-xs text-obsidian-400">
              Press <kbd className="px-1 py-0.5 bg-parchment-200 rounded text-obsidian-600">1</kbd>-
              <kbd className="px-1 py-0.5 bg-parchment-200 rounded text-obsidian-600">
                {Math.min(choices.length, 9)}
              </kbd>{' '}
              to select
            </span>
          </div>
        )}
      </div>
    );
  }
);

ChoiceList.displayName = 'ChoiceList';

export { choiceListVariants, choiceButtonVariants, choiceNumberVariants };
