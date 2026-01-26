/**
 * ProvisionsDisplay Component
 *
 * Displays food, water, and gold counts with warning indicators.
 * Located in the bottom-right corner of the HUD.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { FoodIcon, WaterIcon, CoinIcon, WarningIcon } from './icons';
import { useReducedMotion } from './hooks';
import type { ProvisionsData } from './types';

const provisionsDisplayVariants = cva(
  [
    'px-3 py-2 rounded-lg',
    'bg-amber-950/80 backdrop-blur-sm',
    'border border-amber-800/50',
    'shadow-lg',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
      layout: {
        vertical: 'space-y-1.5',
        horizontal: 'flex items-center gap-4',
      },
    },
    defaultVariants: {
      size: 'md',
      layout: 'vertical',
    },
  }
);

export interface ProvisionsDisplayProps extends VariantProps<typeof provisionsDisplayVariants> {
  /** Provisions data */
  provisions: ProvisionsData;
  /** Additional CSS classes */
  className?: string;
  /** Food warning threshold */
  foodWarningThreshold?: number;
  /** Water warning threshold */
  waterWarningThreshold?: number;
  /** Whether to show gold */
  showGold?: boolean;
}

/**
 * Single provision item display
 */
interface ProvisionItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  isLow: boolean;
  colorClass: string;
  lowColorClass: string;
}

function ProvisionItem({
  icon,
  label,
  value,
  isLow,
  colorClass,
  lowColorClass,
}: ProvisionItemProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isLow && !reducedMotion && 'animate-pulse'
      )}
      role="status"
      aria-label={`${label}: ${value}${isLow ? ' (low)' : ''}`}
    >
      <span className={cn('flex-shrink-0', isLow ? lowColorClass : colorClass)}>
        {icon}
      </span>
      <span
        className={cn(
          'font-mono font-semibold min-w-[28px]',
          isLow ? lowColorClass : 'text-amber-100'
        )}
      >
        {value}
      </span>
      {isLow && (
        <WarningIcon
          className={cn('w-3 h-3', lowColorClass)}
          aria-label="Low supplies"
        />
      )}
    </div>
  );
}

/**
 * ProvisionsDisplay component for the game HUD
 */
export function ProvisionsDisplay({
  provisions,
  size,
  layout,
  className,
  foodWarningThreshold = 3,
  waterWarningThreshold = 3,
  showGold = true,
}: ProvisionsDisplayProps) {
  const isLowFood = provisions.food <= foodWarningThreshold;
  const isLowWater = provisions.water <= waterWarningThreshold;
  const isAnyLow = isLowFood || isLowWater;

  return (
    <div
      className={cn(
        provisionsDisplayVariants({ size, layout }),
        // Add extra border emphasis when provisions are low
        isAnyLow && 'border-red-700/50',
        className
      )}
      role="region"
      aria-label="Provisions"
    >
      {/* Food */}
      <ProvisionItem
        icon={<FoodIcon className="w-4 h-4" />}
        label="Food"
        value={provisions.food}
        isLow={isLowFood}
        colorClass="text-amber-400"
        lowColorClass="text-red-400"
      />

      {/* Water */}
      <ProvisionItem
        icon={<WaterIcon className="w-4 h-4" />}
        label="Water"
        value={provisions.water}
        isLow={isLowWater}
        colorClass="text-blue-400"
        lowColorClass="text-red-400"
      />

      {/* Gold */}
      {showGold && (
        <div
          className={cn(
            'flex items-center gap-2',
            layout === 'vertical' && 'mt-1.5 pt-1.5 border-t border-amber-700/30'
          )}
        >
          <CoinIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <span className="font-mono font-bold text-yellow-400 min-w-[40px]">
            ${provisions.gold}
          </span>
        </div>
      )}

      {/* Warning message (accessibility) */}
      {isAnyLow && (
        <div
          className={cn(
            'text-[0.7em] text-red-400 font-semibold',
            layout === 'vertical' ? 'mt-1' : 'ml-2'
          )}
          role="alert"
        >
          {isLowFood && isLowWater
            ? 'Low supplies!'
            : isLowFood
              ? 'Low food!'
              : 'Low water!'}
        </div>
      )}
    </div>
  );
}

export { provisionsDisplayVariants };
