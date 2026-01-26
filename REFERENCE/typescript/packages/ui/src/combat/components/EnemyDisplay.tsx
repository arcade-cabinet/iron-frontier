/**
 * Enemy Display Component
 *
 * Displays a row of enemy combatants with health bars, status effects,
 * and targeting highlights. Supports 1-4 enemies.
 */

import * as React from 'react';
import { cn } from '../../primitives/utils';
import type { CombatantUI, EnemyDisplayProps } from '../types';
import { ActionPointsBar } from './ActionPointsBar';
import { HealthBar } from './HealthBar';
import { StatusEffectIcon } from './StatusEffectIcon';

/**
 * Target crosshair icon
 */
const CrosshairIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <line x1="12" y1="2" x2="12" y2="6" strokeWidth={2} />
    <line x1="12" y1="18" x2="12" y2="22" strokeWidth={2} />
    <line x1="2" y1="12" x2="6" y2="12" strokeWidth={2} />
    <line x1="18" y1="12" x2="22" y2="12" strokeWidth={2} />
  </svg>
);

/**
 * Skull icon for death state
 */
const SkullIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12v2c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1h2v-3h2v3h4v-3h2v3h2c.55 0 1-.45 1-1v-3h1c.55 0 1-.45 1-1v-2c0-5.52-4.48-10-10-10zm-4 12c-.83 0-1.5-.67-1.5-1.5S7.17 11 8 11s1.5.67 1.5 1.5S8.83 14 8 14zm8 0c-.83 0-1.5-.67-1.5-1.5S15.17 11 16 11s1.5.67 1.5 1.5S16.83 14 16 14z" />
  </svg>
);

/**
 * Default enemy sprite placeholder
 */
const EnemySprite: React.FC<{ name: string; isDead: boolean; className?: string }> = ({
  name,
  isDead,
  className,
}) => (
  <div
    className={cn(
      'w-full aspect-square rounded-lg flex items-center justify-center',
      'bg-gradient-to-b from-obsidian-700 to-obsidian-800',
      'border-2 border-obsidian-600',
      isDead && 'opacity-40 grayscale',
      className
    )}
  >
    {isDead ? (
      <SkullIcon className="w-12 h-12 text-obsidian-500" />
    ) : (
      <div className="text-4xl select-none" role="img" aria-label={name}>
        {/* Use first letter as placeholder */}
        <span className="text-crimson-500 font-bold">{name.charAt(0).toUpperCase()}</span>
      </div>
    )}
  </div>
);

/**
 * Get threat level color
 */
function getThreatColor(threatLevel?: 'low' | 'medium' | 'high' | 'boss'): string {
  switch (threatLevel) {
    case 'boss':
      return 'border-amber-500 ring-amber-500/30';
    case 'high':
      return 'border-crimson-500';
    case 'medium':
      return 'border-rust-500';
    case 'low':
    default:
      return 'border-obsidian-600';
  }
}

/**
 * Single enemy card
 */
interface EnemyCardProps {
  enemy: CombatantUI;
  isSelected: boolean;
  isTargetable: boolean;
  onSelect: () => void;
}

const EnemyCard = React.memo<EnemyCardProps>(({ enemy, isSelected, isTargetable, onSelect }) => {
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  const isLowHealth = healthPercent <= 25;

  if (enemy.isDead) {
    return (
      <div
        className={cn(
          'relative p-2 sm:p-3 rounded-lg border-2 border-obsidian-700',
          'bg-obsidian-900/50 backdrop-blur-sm',
          'min-w-[100px] sm:min-w-[140px] max-w-[160px]',
          'opacity-50 transition-opacity duration-500'
        )}
      >
        <EnemySprite name={enemy.name} isDead={true} className="mb-2" />
        <div className="text-xs text-obsidian-500 text-center italic">Defeated</div>
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      disabled={!isTargetable}
      className={cn(
        'relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-150',
        'bg-obsidian-900/90 backdrop-blur-sm',
        'min-w-[100px] sm:min-w-[140px] max-w-[160px]',
        getThreatColor(enemy.threatLevel),
        isSelected
          ? 'ring-2 ring-crimson-500/50 shadow-lg shadow-crimson-500/20 border-crimson-500 scale-105'
          : isTargetable
            ? 'hover:border-bronze-500 hover:scale-102 cursor-crosshair'
            : 'opacity-60 cursor-not-allowed'
      )}
      aria-label={`Target ${enemy.name}, ${enemy.health} of ${enemy.maxHealth} health`}
      aria-pressed={isSelected}
    >
      {/* Selected target indicator */}
      {isSelected && (
        <div
          className={cn(
            'absolute -top-2 -right-2 w-6 h-6 rounded-full',
            'bg-crimson-600 border-2 border-crimson-400',
            'flex items-center justify-center',
            'shadow-lg shadow-crimson-500/50',
            'animate-pulse'
          )}
        >
          <CrosshairIcon className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Threat level indicator for bosses */}
      {enemy.threatLevel === 'boss' && (
        <div
          className={cn(
            'absolute -top-1 left-1/2 -translate-x-1/2',
            'px-2 py-0.5 rounded-full',
            'bg-amber-600 border border-amber-400',
            'text-[8px] font-bold text-amber-100 uppercase tracking-wider'
          )}
        >
          Boss
        </div>
      )}

      {/* Enemy sprite/image placeholder */}
      <EnemySprite name={enemy.name} isDead={false} className="mb-2" />

      {/* Name */}
      <div
        className={cn(
          'text-xs sm:text-sm font-bold mb-1.5 truncate text-center',
          enemy.threatLevel === 'boss' ? 'text-amber-300' : 'text-crimson-300'
        )}
      >
        {enemy.name}
      </div>

      {/* Health bar */}
      <HealthBar current={enemy.health} max={enemy.maxHealth} size="sm" showValues={true} />

      {/* Status effects and AP */}
      <div className="flex items-center justify-between mt-2">
        <ActionPointsBar current={enemy.actionPoints} max={enemy.maxActionPoints} size="sm" />

        {/* Status effects */}
        {enemy.statusEffects.length > 0 && (
          <div className="flex gap-0.5">
            {enemy.statusEffects.slice(0, 2).map((effect, index) => (
              <StatusEffectIcon
                key={`${effect.type}-${index}`}
                type={effect.type}
                turnsRemaining={effect.turnsRemaining}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Low health warning */}
      {isLowHealth && (
        <div className="text-[9px] sm:text-[10px] text-crimson-400 text-center mt-1 animate-pulse">
          Wounded
        </div>
      )}
    </button>
  );
});

EnemyCard.displayName = 'EnemyCard';

/**
 * Enemy Display Container
 */
export const EnemyDisplay = React.forwardRef<HTMLDivElement, EnemyDisplayProps>(
  ({ enemies, selectedTargetId, isTargetable, onSelectTarget, className, testID }, ref) => {
    const aliveEnemies = enemies.filter((e) => !e.isDead);
    const deadEnemies = enemies.filter((e) => e.isDead);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap justify-center gap-2 sm:gap-4',
          'overflow-x-auto pb-2 scrollbar-hide',
          className
        )}
        role="list"
        aria-label="Enemies"
        data-testid={testID}
      >
        {/* Alive enemies first */}
        {aliveEnemies.map((enemy) => (
          <EnemyCard
            key={enemy.id}
            enemy={enemy}
            isSelected={selectedTargetId === enemy.id}
            isTargetable={isTargetable}
            onSelect={() => onSelectTarget(enemy.id)}
          />
        ))}

        {/* Dead enemies (faded) */}
        {deadEnemies.map((enemy) => (
          <EnemyCard
            key={enemy.id}
            enemy={enemy}
            isSelected={false}
            isTargetable={false}
            onSelect={() => {}}
          />
        ))}

        {/* Empty state */}
        {enemies.length === 0 && (
          <div className="text-parchment-400 text-sm italic">No enemies</div>
        )}
      </div>
    );
  }
);

EnemyDisplay.displayName = 'EnemyDisplay';
