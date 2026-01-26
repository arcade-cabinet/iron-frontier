/**
 * Typewriter Effect Hook
 *
 * Custom hook for creating typewriter text animations.
 * Supports configurable speed, skip functionality, and callbacks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TypewriterConfig } from './types';

/**
 * Default typewriter configuration
 */
const DEFAULT_CONFIG: Required<TypewriterConfig> = {
  speed: 40,
  startDelay: 0,
  soundEnabled: false,
};

/**
 * Typewriter hook return value
 */
export interface UseTypewriterResult {
  /** Currently displayed text */
  displayedText: string;
  /** Whether typing is complete */
  isComplete: boolean;
  /** Whether currently typing */
  isTyping: boolean;
  /** Skip to full text */
  skip: () => void;
  /** Reset and start over */
  reset: () => void;
}

/**
 * useTypewriter hook
 *
 * Creates a typewriter effect for displaying text character by character.
 *
 * @param fullText - The complete text to display
 * @param config - Configuration options
 * @returns Typewriter state and controls
 *
 * @example
 * ```tsx
 * const { displayedText, isComplete, skip } = useTypewriter(
 *   "Hello, stranger. Welcome to Dusty Springs.",
 *   { speed: 50 }
 * );
 * ```
 */
export function useTypewriter(
  fullText: string,
  config: TypewriterConfig = {}
): UseTypewriterResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Refs for cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const textRef = useRef(fullText);

  // Calculate interval from speed (characters per second)
  const intervalMs = Math.round(1000 / mergedConfig.speed);

  // Clear any pending timeouts
  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Skip to full text
  const skip = useCallback(() => {
    clearPendingTimeout();
    setDisplayedText(textRef.current);
    setIsComplete(true);
    setIsTyping(false);
    indexRef.current = textRef.current.length;
  }, [clearPendingTimeout]);

  // Reset and start over
  const reset = useCallback(() => {
    clearPendingTimeout();
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(false);
    indexRef.current = 0;
  }, [clearPendingTimeout]);

  // Main typing effect
  useEffect(() => {
    // Update text ref when fullText changes
    textRef.current = fullText;

    // Reset state for new text
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    // Handle empty text
    if (!fullText || fullText.length === 0) {
      setIsComplete(true);
      return;
    }

    // Start typing after delay
    const startTyping = () => {
      setIsTyping(true);

      const typeNextChar = () => {
        if (indexRef.current < textRef.current.length) {
          // Get next character
          const nextChar = textRef.current[indexRef.current];
          indexRef.current += 1;

          // Update displayed text
          setDisplayedText(textRef.current.slice(0, indexRef.current));

          // Calculate delay for next character
          // Add extra delay for punctuation
          let delay = intervalMs;
          if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
            delay = intervalMs * 4; // Pause after sentences
          } else if (nextChar === ',' || nextChar === ';' || nextChar === ':') {
            delay = intervalMs * 2; // Brief pause after clauses
          } else if (nextChar === '*') {
            delay = intervalMs * 1.5; // Pause for action text
          }

          // Schedule next character
          timeoutRef.current = setTimeout(typeNextChar, delay);
        } else {
          // Typing complete
          setIsTyping(false);
          setIsComplete(true);
        }
      };

      typeNextChar();
    };

    // Start after delay
    if (mergedConfig.startDelay > 0) {
      timeoutRef.current = setTimeout(startTyping, mergedConfig.startDelay);
    } else {
      startTyping();
    }

    // Cleanup on unmount or text change
    return clearPendingTimeout;
  }, [fullText, intervalMs, mergedConfig.startDelay, clearPendingTimeout]);

  return {
    displayedText,
    isComplete,
    isTyping,
    skip,
    reset,
  };
}

/**
 * Parse text for formatting markers
 *
 * Supports:
 * - *text* for action/emote text
 * - **text** for emphasis
 * - [color:text] for colored text
 */
export interface TextSegment {
  text: string;
  type: 'normal' | 'action' | 'emphasis' | 'color';
  color?: string;
}

export function parseDialogueText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;

  // Regex patterns
  const patterns = [
    { regex: /^\*\*([^*]+)\*\*/, type: 'emphasis' as const },
    { regex: /^\*([^*]+)\*/, type: 'action' as const },
    { regex: /^\[([^:]+):([^\]]+)\]/, type: 'color' as const },
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match) {
        if (pattern.type === 'color') {
          segments.push({
            text: match[2],
            type: 'color',
            color: match[1],
          });
        } else {
          segments.push({
            text: match[1],
            type: pattern.type,
          });
        }
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Find next special character or end
      const nextSpecial = remaining.search(/[*\[]/);
      if (nextSpecial === -1) {
        // No more special chars, add rest as normal
        segments.push({ text: remaining, type: 'normal' });
        break;
      } else if (nextSpecial === 0) {
        // Special char at start but didn't match pattern, treat as normal
        segments.push({ text: remaining[0], type: 'normal' });
        remaining = remaining.slice(1);
      } else {
        // Add text before special char
        segments.push({ text: remaining.slice(0, nextSpecial), type: 'normal' });
        remaining = remaining.slice(nextSpecial);
      }
    }
  }

  // Merge adjacent normal segments
  const merged: TextSegment[] = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (last && last.type === 'normal' && segment.type === 'normal') {
      last.text += segment.text;
    } else {
      merged.push(segment);
    }
  }

  return merged;
}
