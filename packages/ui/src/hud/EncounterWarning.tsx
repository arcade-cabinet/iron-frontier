/**
 * EncounterWarning Component
 *
 * Displays a pulsing warning indicator when an encounter is imminent.
 * Shows danger level with distinct visual styling.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { AlertIcon, DangerIcon } from './icons';
import { useReducedMotion } from './hooks';
import type { EncounterWarningData } from './types';

const encounterWarningVariants = cva(
  [
    'flex items-center gap-2',
    'px-4 py-2 rounded-lg',
    'backdrop-blur-sm',
    'border-2',
    'shadow-lg',
    'font-semibold',
  ].join(' '),
  {
    variants: {
      dangerLevel: {
        low: 'bg-yellow-950/80 border-yellow-600/60 text-yellow-200',
        medium: 'bg-orange-950/80 border-orange-600/60 text-orange-200',
        high: 'bg-red-950/80 border-red-600/60 text-red-200',
        extreme: 'bg-red-950/90 border-red-500 text-red-100',
      },
    },
    defaultVariants: {
      dangerLevel: 'medium',
    },
  }
);

export interface EncounterWarningProps extends VariantProps<typeof encounterWarningVariants> {
  /** Encounter warning data */
  warning: EncounterWarningData;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show text label */
  showLabel?: boolean;
  /** Compact mode (icon only) */
  compact?: boolean;
}

/**
 * Get warning text based on danger level
 */
function getWarningText(level: EncounterWarningData['dangerLevel']): string {
  switch (level) {
    case 'low':
      return 'Encounter Ahead';
    case 'medium':
      return 'Danger Nearby';
    case 'high':
      return 'High Danger!';
    case 'extreme':
      return 'EXTREME DANGER!';
    default:
      return 'Warning';
  }
}

/**
 * Get icon based on danger level
 */
function getWarningIcon(
  level: EncounterWarningData['dangerLevel'],
  className?: string
): React.ReactNode {
  switch (level) {
    case 'low':
    case 'medium':
      return <AlertIcon className={cn('w-5 h-5', className)} aria-label="Warning" />;
    case 'high':
    case 'extreme':
      return <DangerIcon className={cn('w-5 h-5', className)} aria-label="Danger" />;
    default:
      return <AlertIcon className={cn('w-5 h-5', className)} aria-label="Warning" />;
  }
}

/**
 * Get pulse animation class based on danger level
 */
function getPulseClass(level: EncounterWarningData['dangerLevel']): string {
  switch (level) {
    case 'low':
      return 'animate-pulse';
    case 'medium':
      return 'animate-pulse';
    case 'high':
      return 'animate-[pulse_0.75s_ease-in-out_infinite]';
    case 'extreme':
      return 'animate-[pulse_0.5s_ease-in-out_infinite]';
    default:
      return 'animate-pulse';
  }
}

/**
 * EncounterWarning component for the game HUD
 */
export function EncounterWarning({
  warning,
  dangerLevel: overrideDangerLevel,
  showLabel = true,
  compact = false,
  className,
}: EncounterWarningProps) {
  const reducedMotion = useReducedMotion();

  // Don't show if no imminent encounter
  if (!warning.isImminent) {
    return null;
  }

  const dangerLevel = overrideDangerLevel || warning.dangerLevel;
  const pulseClass = getPulseClass(dangerLevel);
  const iconColorClass =
    dangerLevel === 'extreme'
      ? 'text-red-400'
      : dangerLevel === 'high'
        ? 'text-red-400'
        : dangerLevel === 'medium'
          ? 'text-orange-400'
          : 'text-yellow-400';

  // Compact mode - just the icon
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10 rounded-full',
          'backdrop-blur-sm',
          encounterWarningVariants({ dangerLevel }),
          !reducedMotion && pulseClass,
          className
        )}
        role="alert"
        aria-live="assertive"
        aria-label={getWarningText(dangerLevel)}
        title={getWarningText(dangerLevel)}
      >
        {getWarningIcon(dangerLevel, iconColorClass)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        encounterWarningVariants({ dangerLevel }),
        !reducedMotion && pulseClass,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Pulsing icon */}
      <span className={iconColorClass}>{getWarningIcon(dangerLevel)}</span>

      {/* Warning text */}
      {showLabel && (
        <span className="text-sm">{getWarningText(dangerLevel)}</span>
      )}

      {/* Danger level indicator (visual pattern for accessibility) */}
      <div
        className="flex gap-1 ml-1"
        aria-label={`Danger level: ${dangerLevel}`}
        role="img"
      >
        {['low', 'medium', 'high', 'extreme'].map((level, index) => {
          const isActive =
            index <=
            ['low', 'medium', 'high', 'extreme'].indexOf(dangerLevel);
          return (
            <div
              key={level}
              className={cn(
                'w-2 h-4 rounded-sm',
                isActive
                  ? dangerLevel === 'extreme'
                    ? 'bg-red-500'
                    : dangerLevel === 'high'
                      ? 'bg-red-400'
                      : dangerLevel === 'medium'
                        ? 'bg-orange-400'
                        : 'bg-yellow-400'
                  : 'bg-gray-600/50'
              )}
            />
          );
        })}
      </div>

      {/* Type indicator if available */}
      {warning.type && (
        <span className="text-xs opacity-70 ml-2">({warning.type})</span>
      )}
    </div>
  );
}

export { encounterWarningVariants };
