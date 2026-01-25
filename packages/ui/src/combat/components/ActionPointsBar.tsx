/**
 * Action Points Bar Component
 *
 * Displays action points as individual pips in a steampunk style.
 * Styled as brass/copper rivets or gauge indicators.
 */

import * as React from 'react';
import { cn } from '../../primitives/utils';

export interface ActionPointsBarProps {
  /** Current action points */
  current: number;
  /** Maximum action points */
  max: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show numeric label */
  showLabel?: boolean;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export const ActionPointsBar = React.forwardRef<HTMLDivElement, ActionPointsBarProps>(
  ({ current, max, size = 'md', showLabel = false, className, testID }, ref) => {
    const sizeStyles = {
      sm: {
        pip: 'w-2 h-2',
        gap: 'gap-0.5',
        text: 'text-[9px]',
      },
      md: {
        pip: 'w-3 h-3',
        gap: 'gap-1',
        text: 'text-[10px]',
      },
      lg: {
        pip: 'w-4 h-4',
        gap: 'gap-1.5',
        text: 'text-xs',
      },
    };

    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn('flex items-center', styles.gap, className)}
        data-testid={testID}
        role="meter"
        aria-label={`Action Points: ${current} of ${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {showLabel && (
          <span className={cn('text-bronze-400/70 font-medium mr-1', styles.text)}>AP</span>
        )}

        <div className={cn('flex', styles.gap)}>
          {Array.from({ length: max }).map((_, index) => {
            const isFilled = index < current;
            return (
              <div
                key={index}
                className={cn(
                  'rounded-sm border transition-all duration-200',
                  styles.pip,
                  isFilled
                    ? 'bg-bronze-500 border-bronze-400 shadow-sm shadow-bronze-500/30'
                    : 'bg-obsidian-800 border-obsidian-700'
                )}
              >
                {/* Inner highlight for filled pips */}
                {isFilled && (
                  <div className="w-full h-full rounded-sm bg-gradient-to-br from-bronze-300/30 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ActionPointsBar.displayName = 'ActionPointsBar';
