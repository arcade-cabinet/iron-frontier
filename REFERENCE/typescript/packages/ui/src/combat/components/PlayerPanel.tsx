/**
 * Player Panel Component
 *
 * Displays the player's combat status including health, action points,
 * status effects, and turn indicator.
 */

import * as React from 'react';
import { cn } from '../../primitives/utils';
import type { PlayerPanelProps } from '../types';
import { ActionPointsBar } from './ActionPointsBar';
import { HealthBar } from './HealthBar';
import { StatusEffectIcon } from './StatusEffectIcon';

/**
 * Player avatar placeholder
 */
const PlayerAvatar: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <div
    className={cn(
      'w-8 h-8 sm:w-10 sm:h-10 rounded-full',
      'bg-gradient-to-br from-bronze-600 to-bronze-800',
      'border-2 border-bronze-500',
      'flex items-center justify-center',
      'shadow-inner shadow-bronze-900/50',
      className
    )}
  >
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-bronze-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  </div>
);

/**
 * Player Panel Component
 */
export const PlayerPanel = React.forwardRef<HTMLDivElement, PlayerPanelProps>(
  ({ player, isPlayerTurn, className, testID }, ref) => {
    const healthPercent = (player.health / player.maxHealth) * 100;
    const isLowHealth = healthPercent <= 25;
    const isCriticalHealth = healthPercent <= 10;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border-2 backdrop-blur-sm',
          'p-3 sm:p-4',
          'min-w-[180px] sm:min-w-[220px] max-w-[280px]',
          'transition-all duration-300',
          isPlayerTurn
            ? 'border-bronze-500/80 bg-bronze-950/90 shadow-lg shadow-bronze-500/20'
            : 'border-obsidian-600 bg-obsidian-900/90',
          isCriticalHealth && 'animate-pulse border-crimson-500',
          className
        )}
        data-testid={testID}
      >
        {/* Header with avatar and name */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <PlayerAvatar name={player.name} />
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'font-bold text-sm sm:text-base truncate',
                isPlayerTurn ? 'text-bronze-200' : 'text-parchment-300'
              )}
            >
              {player.name}
            </div>
            <div className="text-[10px] sm:text-xs text-bronze-500/70">Outlaw</div>
          </div>

          {/* Turn indicator */}
          {isPlayerTurn && (
            <div
              className={cn(
                'px-2 py-0.5 rounded-full',
                'bg-sage-900/60 border border-sage-700/50',
                'text-[9px] sm:text-[10px] font-medium text-sage-400'
              )}
            >
              Your Turn
            </div>
          )}
        </div>

        {/* Health bar */}
        <HealthBar
          current={player.health}
          max={player.maxHealth}
          label="Health"
          size="md"
          showValues={true}
          isPlayer={true}
        />

        {/* Action points */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] sm:text-xs text-bronze-400/70">Action Points</span>
          <ActionPointsBar current={player.actionPoints} max={player.maxActionPoints} size="md" />
        </div>

        {/* Status effects */}
        {player.statusEffects.length > 0 && (
          <div className="mt-3 pt-3 border-t border-obsidian-700/50">
            <div className="text-[9px] sm:text-[10px] text-parchment-500 mb-1.5">Status Effects</div>
            <div className="flex flex-wrap gap-1">
              {player.statusEffects.map((effect, index) => (
                <StatusEffectIcon
                  key={`${effect.type}-${index}`}
                  type={effect.type}
                  turnsRemaining={effect.turnsRemaining}
                  size="md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Low health warning */}
        {isLowHealth && (
          <div
            className={cn(
              'mt-3 p-2 rounded',
              'bg-crimson-950/50 border border-crimson-800/50',
              'text-[10px] sm:text-xs text-crimson-400 text-center',
              isCriticalHealth && 'animate-pulse'
            )}
          >
            {isCriticalHealth ? 'CRITICAL CONDITION!' : 'Health is low - consider healing!'}
          </div>
        )}
      </div>
    );
  }
);

PlayerPanel.displayName = 'PlayerPanel';
