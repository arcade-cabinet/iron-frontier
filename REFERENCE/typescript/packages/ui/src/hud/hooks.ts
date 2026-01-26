/**
 * HUD Hooks
 *
 * Custom hooks for HUD component logic and state derivation.
 */

import { useCallback, useEffect, useState } from 'react';
import type { TimeDisplayData, TimeOfDay } from './types';

/**
 * Derive the time of day from the game hour
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'evening';
  if (hour >= 19 && hour < 21) return 'dusk';
  return 'night';
}

/**
 * Format game time to 12-hour display format
 */
export function formatGameTime(hour: number): { time: string; period: 'am' | 'pm' } {
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  const minutes = '00'; // Game time is hour-based
  return {
    time: `${displayHour}:${minutes}`,
    period,
  };
}

/**
 * Get the day number from day of year
 */
export function getDayNumber(dayOfYear: number): number {
  return dayOfYear; // Could be modified to show seasonal days
}

/**
 * Get temperature description based on time and season
 */
export function getTemperature(
  hour: number,
  dayOfYear: number
): { value: string; label: string } {
  // Simple temperature model based on time of day and season
  const isSummer = dayOfYear > 91 && dayOfYear < 274;
  const isNight = hour < 6 || hour >= 20;
  const isMidday = hour >= 11 && hour <= 14;

  if (isNight) {
    return isSummer
      ? { value: 'Warm', label: 'Comfortable evening' }
      : { value: 'Cold', label: 'Chilly night' };
  }
  if (isMidday) {
    return isSummer
      ? { value: 'Hot', label: 'Scorching heat' }
      : { value: 'Mild', label: 'Pleasant weather' };
  }
  return isSummer
    ? { value: 'Warm', label: 'Nice temperature' }
    : { value: 'Cool', label: 'Crisp air' };
}

/**
 * Hook for auto-dismissing notifications
 */
export function useAutoDismiss<T extends { id: string; timestamp: number }>(
  items: T[],
  onDismiss: (id: string) => void,
  duration: number = 3000
): T[] {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);

  useEffect(() => {
    // Update visible items when new items come in
    const now = Date.now();
    const newVisible = items.filter((item) => now - item.timestamp < duration);
    setVisibleItems(newVisible);

    // Set up timers for auto-dismissal
    const timers = items.map((item) => {
      const remaining = duration - (now - item.timestamp);
      if (remaining > 0) {
        return setTimeout(() => {
          onDismiss(item.id);
        }, remaining);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, [items, duration, onDismiss]);

  return visibleItems;
}

/**
 * Hook for pulsing animation when value is low
 */
export function useLowValuePulse(
  value: number,
  threshold: number,
  criticalThreshold?: number
): { isPulsing: boolean; isCritical: boolean } {
  const isPulsing = value <= threshold;
  const isCritical = criticalThreshold !== undefined && value <= criticalThreshold;
  return { isPulsing, isCritical };
}

/**
 * Hook for keyboard shortcut handling
 */
export function useKeyboardShortcut(
  shortcuts: Map<string, () => void>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const handler = shortcuts.get(key);
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook for detecting reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * Hook for touch device detection
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}
