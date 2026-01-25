/**
 * Platform-agnostic utility functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 * This is the standard shadcn/ui pattern for class merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID for accessibility
 */
let idCounter = 0;
export function generateId(prefix = 'ui'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Create platform-specific style object from tokens
 */
export function createStyleFromTokens<T extends Record<string, unknown>>(
  tokens: T
): T {
  return tokens;
}

/**
 * Check if running in React Native environment
 */
export function isReactNative(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'
  );
}

/**
 * Check if running in web browser environment
 */
export function isWeb(): boolean {
  return typeof window !== 'undefined' && !isReactNative();
}

/**
 * Safely access platform-specific values
 */
export function platformSelect<T>(options: {
  web?: T;
  native?: T;
  default: T;
}): T {
  if (isWeb() && options.web !== undefined) {
    return options.web;
  }
  if (isReactNative() && options.native !== undefined) {
    return options.native;
  }
  return options.default;
}
