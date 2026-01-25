/**
 * Dialogue Text Component
 *
 * Displays NPC dialogue text with typewriter effect and formatting support.
 * Shows a continue indicator when text is complete.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../primitives/utils';
import type { DialogueBaseProps, TypewriterConfig } from './types';
import { parseDialogueText, useTypewriter, type TextSegment } from './useTypewriter';

/**
 * Text container variants
 */
const textContainerVariants = cva(
  [
    'relative',
    'p-4',
    'rounded-lg',
    'overflow-hidden',
    // Parchment paper effect
    'bg-parchment-50',
    'border-2 border-leather-300',
    // Subtle paper texture shadow
    'shadow-inner',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'min-h-16 text-sm',
        md: 'min-h-20 text-base',
        lg: 'min-h-24 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Text style variants
 */
const textStyleVariants = cva(
  [
    'leading-relaxed',
    'whitespace-pre-wrap',
    // Western/period appropriate font
    'font-serif',
    'text-obsidian-800',
  ].join(' '),
  {
    variants: {
      variant: {
        dialogue: '',
        narration: 'italic text-obsidian-600',
      },
    },
    defaultVariants: {
      variant: 'dialogue',
    },
  }
);

export interface DialogueTextProps
  extends DialogueBaseProps,
    VariantProps<typeof textContainerVariants> {
  /** Full dialogue text to display */
  text: string;
  /** Typewriter configuration */
  typewriterConfig?: TypewriterConfig;
  /** Whether to show typewriter effect */
  enableTypewriter?: boolean;
  /** Speaker name (shown above text) */
  speaker?: string;
  /** Callback when text is complete */
  onComplete?: () => void;
  /** Callback when clicked/tapped */
  onClick?: () => void;
  /** Whether to show continue indicator */
  showContinueIndicator?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: number | string;
  /** Text variant */
  variant?: 'dialogue' | 'narration';
}

/**
 * Render formatted text segment
 */
function FormattedSegment({ segment }: { segment: TextSegment }) {
  switch (segment.type) {
    case 'action':
      return <span className="italic text-obsidian-500">{segment.text}</span>;
    case 'emphasis':
      return <strong className="font-bold text-obsidian-900">{segment.text}</strong>;
    case 'color':
      return <span style={{ color: segment.color }}>{segment.text}</span>;
    default:
      return <>{segment.text}</>;
  }
}

/**
 * Render text with formatting
 */
function FormattedText({ text }: { text: string }) {
  const segments = parseDialogueText(text);

  return (
    <>
      {segments.map((segment, index) => (
        <FormattedSegment key={index} segment={segment} />
      ))}
    </>
  );
}

/**
 * Continue indicator component
 */
function ContinueIndicator({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        'absolute bottom-2 right-3',
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex items-center gap-1 text-bronze-600 text-sm">
        <span className="font-medium">Continue</span>
        <svg
          className="w-4 h-4 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Typing indicator cursor
 */
function TypingCursor({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span className="inline-block w-0.5 h-5 ml-0.5 bg-obsidian-700 animate-pulse align-middle" />
  );
}

/**
 * DialogueText component
 *
 * Displays dialogue text with optional typewriter effect, formatting support,
 * and a continue indicator when text is complete.
 */
export const DialogueText = React.forwardRef<HTMLDivElement, DialogueTextProps>(
  (
    {
      text,
      typewriterConfig,
      enableTypewriter = true,
      speaker,
      onComplete,
      onClick,
      showContinueIndicator = true,
      maxHeight = 160,
      size,
      variant = 'dialogue',
      className,
      testID,
    },
    ref
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevCompleteRef = useRef(false);

    // Typewriter effect
    const { displayedText, isComplete, isTyping, skip } = useTypewriter(
      text,
      enableTypewriter ? typewriterConfig : { speed: 10000 } // Very fast = instant
    );

    // Call onComplete when typing finishes
    useEffect(() => {
      if (isComplete && !prevCompleteRef.current) {
        prevCompleteRef.current = true;
        onComplete?.();
      }
    }, [isComplete, onComplete]);

    // Reset complete ref when text changes
    useEffect(() => {
      prevCompleteRef.current = false;
    }, [text]);

    // Auto-scroll to bottom as text appears
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [displayedText]);

    // Handle click - skip typewriter or trigger onClick
    const handleClick = () => {
      if (isTyping) {
        skip();
      } else {
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(textContainerVariants({ size }), 'cursor-pointer select-none', className)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={isTyping ? 'Click to skip typing animation' : 'Click to continue'}
        data-testid={testID}
      >
        {/* Decorative corner flourishes */}
        <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-leather-400 rounded-tl opacity-60" />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-leather-400 rounded-tr opacity-60" />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-leather-400 rounded-bl opacity-60" />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-leather-400 rounded-br opacity-60" />

        {/* Speaker name */}
        {speaker && (
          <div className="mb-2 pb-1 border-b border-leather-200">
            <span className="font-semibold text-bronze-700 text-sm uppercase tracking-wide">
              {speaker}
            </span>
          </div>
        )}

        {/* Scrollable text area */}
        <div
          ref={scrollRef}
          className="overflow-y-auto pr-2"
          style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
        >
          <p className={cn(textStyleVariants({ variant }))}>
            {/* Opening quote */}
            {variant === 'dialogue' && (
              <span className="text-2xl leading-none text-bronze-400 font-serif mr-1">"</span>
            )}

            {/* Main text with formatting */}
            <FormattedText text={displayedText} />

            {/* Typing cursor */}
            <TypingCursor visible={isTyping} />

            {/* Closing quote (only when complete for dialogue) */}
            {variant === 'dialogue' && isComplete && (
              <span className="text-2xl leading-none text-bronze-400 font-serif ml-0.5">"</span>
            )}
          </p>
        </div>

        {/* Continue indicator */}
        {showContinueIndicator && <ContinueIndicator visible={isComplete && !isTyping} />}
      </div>
    );
  }
);

DialogueText.displayName = 'DialogueText';

export { textContainerVariants, textStyleVariants };
