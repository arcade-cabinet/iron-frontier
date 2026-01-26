/**
 * Health Bar Component
 *
 * A stylized health bar with steampunk western aesthetic.
 * Shows current/max HP with color gradient based on health percentage.
 */

import * as React from 'react';
import { cn } from '../../primitives/utils';

export interface HealthBarProps {
  /** Current health */
  current: number;
  /** Maximum health */
  max: number;
  /** Label to display */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show numeric values */
  showValues?: boolean;
  /** Whether this is the player's health bar */
  isPlayer?: boolean;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Get health bar color based on percentage
 */
function getHealthColor(percentage: number): string {
  if (percentage > 60) return 'bg-sage-500';
  if (percentage > 30) return 'bg-amber-500';
  return 'bg-crimson-500';
}

/**
 * Get text color based on health percentage
 */
function getTextColor(percentage: number): string {
  if (percentage > 60) return 'text-sage-400';
  if (percentage > 30) return 'text-amber-400';
  return 'text-crimson-400';
}

export const HealthBar = React.forwardRef<HTMLDivElement, HealthBarProps>(
  (
    { current, max, label, size = 'md', showValues = true, isPlayer = false, className, testID },
    ref
  ) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const healthColor = getHealthColor(percentage);
    const textColor = getTextColor(percentage);

    const sizeStyles = {
      sm: {
        bar: 'h-1.5',
        text: 'text-[10px]',
        gap: 'gap-0.5',
      },
      md: {
        bar: 'h-2',
        text: 'text-xs',
        gap: 'gap-1',
      },
      lg: {
        bar: 'h-3',
        text: 'text-sm',
        gap: 'gap-1.5',
      },
    };

    const styles = sizeStyles[size];

    return (
      <div ref={ref} className={cn('w-full', styles.gap, className)} data-testid={testID}>
        {/* Label and values row */}
        {(label || showValues) && (
          <div className={cn('flex justify-between items-center mb-0.5', styles.text)}>
            {label && (
              <span
                className={cn(
                  'font-medium truncate',
                  isPlayer ? 'text-bronze-300' : 'text-parchment-300'
                )}
              >
                {label}
              </span>
            )}
            {showValues && (
              <span className={cn('font-mono tabular-nums', textColor)}>
                {current}/{max}
              </span>
            )}
          </div>
        )}

        {/* Bar container */}
        <div
          className={cn(
            'relative w-full rounded-full overflow-hidden',
            'bg-obsidian-800 border border-obsidian-700',
            styles.bar
          )}
        >
          {/* Health fill */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out',
              healthColor
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Brass trim overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent" />
        </div>

        {/* Low health warning */}
        {percentage <= 25 && percentage > 0 && (
          <div className={cn('text-crimson-400 animate-pulse mt-0.5', styles.text)}>
            Critical!
          </div>
        )}
      </div>
    );
  }
);

HealthBar.displayName = 'HealthBar';
