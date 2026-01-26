/**
 * PlayerStatus Component
 *
 * Displays player health, fatigue/stamina, and active status effects.
 * Located in the bottom-left corner of the HUD.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { HeartIcon, FatigueIcon } from './icons';
import { useLowValuePulse, useReducedMotion } from './hooks';
import type { PlayerStatusData, StatusEffect } from './types';

const playerStatusVariants = cva(
  [
    'px-3 py-2 rounded-lg',
    'bg-amber-950/80 backdrop-blur-sm',
    'border border-amber-800/50',
    'shadow-lg',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'min-w-[140px]',
        md: 'min-w-[160px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface PlayerStatusProps extends VariantProps<typeof playerStatusVariants> {
  /** Player status data */
  status: PlayerStatusData;
  /** Additional CSS classes */
  className?: string;
  /** HP threshold for warning (percentage) */
  healthWarningThreshold?: number;
  /** HP threshold for critical (percentage) */
  healthCriticalThreshold?: number;
  /** Fatigue threshold for warning (percentage) */
  fatigueWarningThreshold?: number;
  /** Fatigue threshold for critical (percentage) */
  fatigueCriticalThreshold?: number;
}

/**
 * Progress bar component with color variations
 */
interface ProgressBarProps {
  value: number;
  max: number;
  colorClass: string;
  pulsingClass?: string;
  isPulsing?: boolean;
  ariaLabel: string;
}

function ProgressBar({
  value,
  max,
  colorClass,
  pulsingClass,
  isPulsing,
  ariaLabel,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative h-2 w-full bg-amber-900/60 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'h-full transition-all duration-300 rounded-full',
          colorClass,
          isPulsing && !reducedMotion && pulsingClass
        )}
        style={{ width: `${percent}%` }}
      />
      {/* Pattern overlay for accessibility (not just color) */}
      {percent < 30 && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              currentColor 2px,
              currentColor 4px
            )`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Status effect badge component
 */
interface StatusEffectBadgeProps {
  effect: StatusEffect;
}

function StatusEffectBadge({ effect }: StatusEffectBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'w-6 h-6 rounded',
        'text-xs font-bold',
        effect.isDebuff ? 'bg-red-900/60 text-red-300' : 'bg-green-900/60 text-green-300',
        'border',
        effect.isDebuff ? 'border-red-700/50' : 'border-green-700/50'
      )}
      title={`${effect.name}: ${effect.description}`}
      role="img"
      aria-label={`${effect.isDebuff ? 'Debuff' : 'Buff'}: ${effect.name}`}
    >
      <span aria-hidden="true">{effect.icon}</span>
      {effect.stacks && effect.stacks > 1 && (
        <span className="absolute -bottom-1 -right-1 text-[0.6em] bg-amber-950 rounded px-0.5">
          {effect.stacks}
        </span>
      )}
    </div>
  );
}

/**
 * PlayerStatus component for the game HUD
 */
export function PlayerStatus({
  status,
  size,
  className,
  healthWarningThreshold = 30,
  healthCriticalThreshold = 15,
  fatigueWarningThreshold = 60,
  fatigueCriticalThreshold = 80,
}: PlayerStatusProps) {
  const healthPercent = (status.health / status.maxHealth) * 100;
  const fatiguePercent = 100 - (status.stamina / status.maxStamina) * 100; // Fatigue is inverse of stamina

  // Determine health state
  const healthPulse = useLowValuePulse(
    healthPercent,
    healthWarningThreshold,
    healthCriticalThreshold
  );

  // Determine fatigue state (high fatigue is bad)
  const fatiguePulse = useLowValuePulse(
    100 - fatiguePercent, // Invert for the hook
    100 - fatigueWarningThreshold,
    100 - fatigueCriticalThreshold
  );

  // Get health bar color
  const getHealthColor = () => {
    if (healthPercent > 60) return 'bg-green-500';
    if (healthPercent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get health text color
  const getHealthTextColor = () => {
    if (healthPercent > 60) return 'text-green-400';
    if (healthPercent > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get fatigue bar color (lower stamina = more fatigue = worse)
  const getFatigueColor = () => {
    if (fatiguePercent < 40) return 'bg-blue-500';
    if (fatiguePercent < 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Get fatigue text color
  const getFatigueTextColor = () => {
    if (fatiguePercent < 40) return 'text-blue-400';
    if (fatiguePercent < 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div
      className={cn(playerStatusVariants({ size }), className)}
      role="region"
      aria-label="Player status"
    >
      {/* Health */}
      <div className="flex items-center gap-2 mb-2">
        <HeartIcon
          className={cn(
            'w-4 h-4 flex-shrink-0',
            getHealthTextColor(),
            healthPulse.isPulsing && 'animate-pulse'
          )}
          aria-label="Health"
        />
        <div className="flex-1 flex items-center gap-2">
          <ProgressBar
            value={status.health}
            max={status.maxHealth}
            colorClass={getHealthColor()}
            pulsingClass="animate-pulse"
            isPulsing={healthPulse.isPulsing}
            ariaLabel="Health bar"
          />
          <span
            className={cn(
              'text-xs font-mono min-w-[48px] text-right',
              getHealthTextColor()
            )}
          >
            {status.health}/{status.maxHealth}
          </span>
        </div>
      </div>

      {/* Fatigue (displayed as inverse of stamina) */}
      <div className="flex items-center gap-2">
        <FatigueIcon
          className={cn(
            'w-4 h-4 flex-shrink-0',
            getFatigueTextColor(),
            fatiguePulse.isPulsing && 'animate-pulse'
          )}
          aria-label="Fatigue"
        />
        <div className="flex-1 flex items-center gap-2">
          <ProgressBar
            value={status.maxStamina - status.stamina} // Show fatigue (inverse)
            max={status.maxStamina}
            colorClass={getFatigueColor()}
            pulsingClass="animate-pulse"
            isPulsing={fatiguePulse.isPulsing}
            ariaLabel="Fatigue bar"
          />
          <span
            className={cn(
              'text-xs font-mono min-w-[32px] text-right',
              getFatigueTextColor()
            )}
          >
            {Math.round(fatiguePercent)}%
          </span>
        </div>
      </div>

      {/* Status Effects */}
      {status.statusEffects && status.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-amber-700/30">
          {status.statusEffects.map((effect) => (
            <StatusEffectBadge key={effect.id} effect={effect} />
          ))}
        </div>
      )}

      {/* Low HP Warning Text (accessibility) */}
      {healthPulse.isCritical && (
        <div className="mt-2 text-[0.7em] text-red-400 font-semibold" role="alert">
          Low Health!
        </div>
      )}

      {/* High Fatigue Warning Text (accessibility) */}
      {fatiguePulse.isCritical && (
        <div className="mt-1 text-[0.7em] text-orange-400 font-semibold" role="alert">
          Exhausted!
        </div>
      )}
    </div>
  );
}

export { playerStatusVariants };
