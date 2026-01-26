/**
 * Status Effect Icon Component
 *
 * Displays a status effect with icon and remaining duration.
 */

import * as React from 'react';
import { cn } from '../../primitives/utils';
import type { StatusEffectType } from '../types';

export interface StatusEffectIconProps {
  /** Type of status effect */
  type: StatusEffectType;
  /** Turns remaining */
  turnsRemaining: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Status effect configuration
 */
const STATUS_CONFIG: Record<
  StatusEffectType,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  bleeding: {
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v18M12 3c-4.97 4.97-4.97 13.03 0 18M12 3c4.97 4.97 4.97 13.03 0 18"
        />
      </svg>
    ),
    color: 'text-crimson-500',
    bgColor: 'bg-crimson-950/80',
    label: 'Bleeding',
  },
  stunned: {
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L9 9l-7 2 5 5-1 7 6-3 6 3-1-7 5-5-7-2-3-7z" />
      </svg>
    ),
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/80',
    label: 'Stunned',
  },
  poisoned: {
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    color: 'text-sage-400',
    bgColor: 'bg-sage-950/80',
    label: 'Poisoned',
  },
  burning: {
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.42 4-8 4-12 0 0 3.5 2 5 6 .71-2.29 2-4 4-5 0 2.5.5 4.5 1 6 .5-1.5 1.5-3 3-4 0 3.42.5 7-1 10-.63 1.21-1.87 3-4 4-.87.41-1.87.87-3 1z" />
      </svg>
    ),
    color: 'text-rust-400',
    bgColor: 'bg-rust-950/80',
    label: 'Burning',
  },
  buffed: {
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    ),
    color: 'text-sky-400',
    bgColor: 'bg-sky-950/80',
    label: 'Buffed',
  },
};

export const StatusEffectIcon = React.forwardRef<HTMLDivElement, StatusEffectIconProps>(
  ({ type, turnsRemaining, size = 'md', className, testID }, ref) => {
    const config = STATUS_CONFIG[type];

    const sizeStyles = {
      sm: {
        container: 'w-5 h-5',
        icon: 'w-3 h-3',
        badge: 'text-[8px] -bottom-0.5 -right-0.5 min-w-[12px] h-[12px]',
      },
      md: {
        container: 'w-6 h-6',
        icon: 'w-4 h-4',
        badge: 'text-[9px] -bottom-1 -right-1 min-w-[14px] h-[14px]',
      },
      lg: {
        container: 'w-8 h-8',
        icon: 'w-5 h-5',
        badge: 'text-[10px] -bottom-1 -right-1 min-w-[16px] h-[16px]',
      },
    };

    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center rounded',
          'border border-obsidian-600',
          config.bgColor,
          styles.container,
          className
        )}
        title={`${config.label} (${turnsRemaining} turns)`}
        data-testid={testID}
      >
        <div className={cn(config.color, styles.icon)}>{config.icon}</div>

        {/* Duration badge */}
        <div
          className={cn(
            'absolute flex items-center justify-center rounded-full',
            'bg-obsidian-900 border border-obsidian-700',
            'font-mono font-bold text-parchment-200',
            styles.badge
          )}
        >
          {turnsRemaining}
        </div>
      </div>
    );
  }
);

StatusEffectIcon.displayName = 'StatusEffectIcon';
