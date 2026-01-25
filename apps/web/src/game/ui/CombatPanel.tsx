/**
 * CombatPanel - Western-themed turn-based combat UI
 *
 * Features:
 * - Enemy cards with health bars and threat indicators
 * - Action buttons with AP costs
 * - Combat log with color-coded messages
 * - Victory/defeat/fled outcome screens
 */

import { useGameStore } from '../store/webGameStore';
import type { Combatant } from '@iron-frontier/shared/data/schemas/combat';
import type { CombatActionType } from '@iron-frontier/shared/store';
import { AP_COSTS } from '@iron-frontier/shared/data/schemas/combat';
import { cn } from '@/lib/utils';

// ============================================================================
// ICONS
// ============================================================================

function CrosshairIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <line x1="12" y1="2" x2="12" y2="6" strokeWidth={2} />
      <line x1="12" y1="18" x2="12" y2="22" strokeWidth={2} />
      <line x1="2" y1="12" x2="6" y2="12" strokeWidth={2} />
      <line x1="18" y1="12" x2="22" y2="12" strokeWidth={2} />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6v4l4 8a2 2 0 01-2 2H7a2 2 0 01-2-2l4-8V3z" />
      <line x1="9" y1="3" x2="15" y2="3" strokeWidth={2} />
    </svg>
  );
}

function RunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <polyline points="12 6 12 12 16 14" strokeWidth={2} />
    </svg>
  );
}

function SkullIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12v2c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1h2v-3h2v3h4v-3h2v3h2c.55 0 1-.45 1-1v-3h1c.55 0 1-.45 1-1v-2c0-5.52-4.48-10-10-10zm-4 12c-.83 0-1.5-.67-1.5-1.5S7.17 11 8 11s1.5.67 1.5 1.5S8.83 14 8 14zm8 0c-.83 0-1.5-.67-1.5-1.5S15.17 11 16 11s1.5.67 1.5 1.5S16.83 14 16 14z" />
    </svg>
  );
}

// ============================================================================
// HEALTH BAR
// ============================================================================

function HealthBar({ current, max, name, isPlayer = false }: {
  current: number;
  max: number;
  name: string;
  isPlayer?: boolean;
}) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const getColor = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span className={isPlayer ? 'text-amber-300 font-medium' : 'text-stone-300'}>{name}</span>
        <span className={cn(
          'font-mono',
          percentage > 60 ? 'text-green-400' : percentage > 30 ? 'text-yellow-400' : 'text-red-400'
        )}>
          {current}/{max}
        </span>
      </div>
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// AP BAR
// ============================================================================

function APBar({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border',
            i < current
              ? 'bg-amber-500 border-amber-400'
              : 'bg-stone-800 border-stone-700'
          )}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ACTION BUTTON
// ============================================================================

function ActionButton({
  label,
  icon,
  apCost,
  currentAP,
  disabled,
  onClick,
  variant = 'default'
}: {
  label: string;
  icon: React.ReactNode;
  apCost: number;
  currentAP: number;
  disabled: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'secondary';
}) {
  const canAfford = currentAP >= apCost;
  const isDisabled = disabled || !canAfford;

  const variantStyles = {
    default: isDisabled
      ? 'bg-stone-800 text-stone-500'
      : 'bg-amber-800 hover:bg-amber-700 text-amber-100',
    danger: isDisabled
      ? 'bg-stone-800 text-stone-500'
      : 'bg-red-900/60 hover:bg-red-800/60 text-red-200 border-red-700/50',
    secondary: isDisabled
      ? 'bg-stone-800 text-stone-500'
      : 'bg-stone-700 hover:bg-stone-600 text-stone-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-stone-700/50 transition-all',
        'min-w-[52px] sm:min-w-[70px] min-h-[52px] sm:min-h-0',
        isDisabled && 'cursor-not-allowed opacity-60',
        variantStyles[variant]
      )}
    >
      <div className="w-4 h-4 sm:w-5 sm:h-5">{icon}</div>
      <span className="text-[9px] sm:text-[10px] font-medium">{label}</span>
      {apCost > 0 && (
        <span className={cn(
          'text-[8px] sm:text-[9px] font-mono',
          canAfford ? 'text-amber-400' : 'text-red-400'
        )}>
          {apCost} AP
        </span>
      )}
    </button>
  );
}

// ============================================================================
// ENEMY CARD
// ============================================================================

function EnemyCard({ combatant, isSelected, isTargetable, onSelect }: {
  combatant: Combatant;
  isSelected: boolean;
  isTargetable: boolean;
  onSelect: () => void;
}) {
  if (combatant.isDead) return null;

  const healthPercent = (combatant.health / combatant.maxHealth) * 100;

  return (
    <button
      onClick={onSelect}
      disabled={!isTargetable}
      className={cn(
        'relative p-2 sm:p-3 rounded-lg border-2 transition-all min-w-[100px] sm:min-w-[140px]',
        'bg-stone-900/90 backdrop-blur-sm',
        isSelected
          ? 'border-red-500 ring-2 ring-red-500/30 shadow-lg shadow-red-500/20'
          : isTargetable
            ? 'border-stone-600 hover:border-amber-600 cursor-crosshair'
            : 'border-stone-700 opacity-60 cursor-not-allowed'
      )}
    >
      {/* Target indicator */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center">
          <CrosshairIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      )}

      {/* Name & Threat */}
      <div className="text-xs sm:text-sm font-bold text-red-300 mb-1.5 sm:mb-2 truncate">{combatant.name}</div>

      {/* Health */}
      <HealthBar
        current={combatant.health}
        max={combatant.maxHealth}
        name=""
        isPlayer={false}
      />

      {/* Status */}
      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
        <APBar current={combatant.actionPoints} max={combatant.maxActionPoints} />
        {healthPercent < 25 && (
          <span className="text-[9px] sm:text-[10px] text-red-400 animate-pulse">Wounded</span>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// PLAYER CARD
// ============================================================================

function PlayerCard({ combatant }: { combatant: Combatant }) {
  return (
    <div className="p-2.5 sm:p-4 rounded-lg border-2 border-amber-600/50 bg-amber-950/90 backdrop-blur-sm min-w-[150px] sm:min-w-[180px]">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-800/60 border border-amber-600/50 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-amber-200 font-bold text-xs sm:text-sm truncate">{combatant.name}</div>
          <div className="text-amber-500/70 text-[9px] sm:text-[10px]">Outlaw</div>
        </div>
      </div>

      <HealthBar
        current={combatant.health}
        max={combatant.maxHealth}
        name="Health"
        isPlayer={true}
      />

      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
        <span className="text-[9px] sm:text-[10px] text-amber-400/70">Action Points</span>
        <APBar current={combatant.actionPoints} max={combatant.maxActionPoints} />
      </div>
    </div>
  );
}

// ============================================================================
// COMBAT LOG
// ============================================================================

function CombatLog() {
  const combatState = useGameStore(state => state.combatState);

  if (!combatState) return null;

  const recentLogs = combatState.log.slice(-4);

  return (
    <div className="bg-stone-900/80 rounded-lg p-2 sm:p-3 border border-stone-700/50 backdrop-blur-sm">
      <div className="text-[9px] sm:text-[10px] font-medium text-amber-500/70 uppercase tracking-wide mb-1.5 sm:mb-2">Combat Log</div>
      <div className="space-y-0.5 sm:space-y-1 min-h-[40px] sm:min-h-[60px]">
        {recentLogs.length === 0 ? (
          <div className="text-stone-500 text-[10px] sm:text-xs italic">The standoff begins...</div>
        ) : (
          recentLogs.map((entry, i) => (
            <div
              key={i}
              className={cn(
                'text-[10px] sm:text-xs',
                entry.success
                  ? entry.isCritical ? 'text-yellow-400 font-medium' : 'text-stone-300'
                  : 'text-red-400'
              )}
            >
              {entry.isCritical && '★ '}
              {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// OUTCOME SCREEN
// ============================================================================

function OutcomeScreen({ type, onContinue }: {
  type: 'victory' | 'defeat' | 'fled';
  onContinue: () => void;
}) {
  const config = {
    victory: {
      title: 'Victory',
      subtitle: 'You have bested your foes',
      icon: <StarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />,
      borderColor: 'border-amber-600',
      bgColor: 'bg-amber-950/95',
      buttonColor: 'bg-amber-700 hover:bg-amber-600',
    },
    defeat: {
      title: 'Defeated',
      subtitle: 'The frontier claims another soul',
      icon: <SkullIcon className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />,
      borderColor: 'border-red-600',
      bgColor: 'bg-red-950/95',
      buttonColor: 'bg-red-700 hover:bg-red-600',
    },
    fled: {
      title: 'Escaped',
      subtitle: 'You live to fight another day',
      icon: <RunIcon className="w-12 h-12 sm:w-16 sm:h-16 text-stone-400" />,
      borderColor: 'border-stone-600',
      bgColor: 'bg-stone-900/95',
      buttonColor: 'bg-stone-700 hover:bg-stone-600',
    },
  };

  const { title, subtitle, icon, borderColor, bgColor, buttonColor } = config[type];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className={cn(
        'rounded-lg border-2 p-6 sm:p-8 text-center max-w-xs sm:max-w-sm mx-4',
        borderColor,
        bgColor
      )}>
        <div className="flex justify-center mb-3 sm:mb-4">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-amber-100 mb-1.5 sm:mb-2">{title}</h2>
        <p className="text-stone-400 text-xs sm:text-sm mb-4 sm:mb-6">{subtitle}</p>
        <button
          onClick={onContinue}
          className={cn(
            'px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-white transition-colors min-h-[44px]',
            buttonColor
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ============================================================================
// MAIN COMBAT PANEL
// ============================================================================

export function CombatPanel() {
  const {
    combatState,
    selectCombatAction,
    selectCombatTarget,
    executeCombatAction,
    endCombatTurn,
    attemptFlee,
  } = useGameStore();

  if (!combatState) return null;

  const player = combatState.combatants.find(c => c.isPlayer);
  const enemies = combatState.combatants.filter(c => !c.isPlayer && !c.isDead);
  const currentCombatant = combatState.combatants[combatState.currentTurnIndex];
  const isPlayerTurn = combatState.phase === 'player_turn';
  const playerAP = player?.actionPoints ?? 0;

  const handleAction = (action: string) => {
    if (action === 'end_turn') {
      endCombatTurn();
    } else if (action === 'flee') {
      attemptFlee();
    } else if (action !== 'move') {
      selectCombatAction(action as CombatActionType);
    }
  };

  const handleTargetSelect = (targetId: string) => {
    selectCombatTarget(targetId);
    if (combatState.selectedAction) {
      executeCombatAction();
    }
  };

  // Outcome screens
  if (combatState.phase === 'victory') {
    return <OutcomeScreen type="victory" onContinue={() => useGameStore.getState().endCombat()} />;
  }
  if (combatState.phase === 'defeat') {
    return <OutcomeScreen type="defeat" onContinue={() => useGameStore.getState().endCombat()} />;
  }
  if (combatState.phase === 'fled') {
    return <OutcomeScreen type="fled" onContinue={() => useGameStore.getState().endCombat()} />;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col z-50">
      {/* Header */}
      <div className="bg-amber-950/90 border-b border-amber-800/50 px-2 sm:px-4 py-2 sm:py-3 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-400">Showdown</h2>
            <div className="text-[10px] sm:text-xs text-amber-500/60">Round {combatState.round}</div>
          </div>
          <div className={cn(
            'px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium',
            isPlayerTurn
              ? 'bg-green-900/60 text-green-400 border border-green-700/50'
              : 'bg-red-900/60 text-red-400 border border-red-700/50'
          )}>
            {isPlayerTurn ? 'Your Move' : 'Enemy Turn'}
          </div>
        </div>
      </div>

      {/* Main Combat Area */}
      <div className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
        {/* Enemies - horizontal scroll on mobile */}
        <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {enemies.map(enemy => (
            <EnemyCard
              key={enemy.definitionId + enemy.name}
              combatant={enemy}
              isSelected={combatState.selectedTargetId === enemy.definitionId}
              isTargetable={isPlayerTurn && !!combatState.selectedAction}
              onSelect={() => handleTargetSelect(enemy.definitionId)}
            />
          ))}
        </div>

        {/* Combat Log */}
        <div className="flex-1 flex justify-center items-center min-h-0">
          <div className="w-full max-w-md">
            <CombatLog />
          </div>
        </div>

        {/* Player */}
        <div className="flex justify-center">
          {player && <PlayerCard combatant={player} />}
        </div>
      </div>

      {/* Action Bar */}
      {isPlayerTurn && (
        <div className="bg-amber-950/90 border-t border-amber-800/50 p-2 sm:p-3 backdrop-blur-sm">
          <div className="grid grid-cols-6 sm:flex sm:justify-center gap-1 sm:gap-2">
            <ActionButton
              label="Attack"
              icon={<CrosshairIcon className="w-full h-full" />}
              apCost={AP_COSTS.attack}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('attack')}
            />
            <ActionButton
              label="Aimed"
              icon={<CrosshairIcon className="w-full h-full" />}
              apCost={AP_COSTS.aimed_shot}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('aimed_shot')}
            />
            <ActionButton
              label="Defend"
              icon={<ShieldIcon className="w-full h-full" />}
              apCost={AP_COSTS.defend}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('defend')}
            />
            <ActionButton
              label="Item"
              icon={<FlaskIcon className="w-full h-full" />}
              apCost={AP_COSTS.use_item}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('use_item')}
            />
            <ActionButton
              label="Flee"
              icon={<RunIcon className="w-full h-full" />}
              apCost={AP_COSTS.flee}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('flee')}
              variant="danger"
            />
            <ActionButton
              label="End"
              icon={<ClockIcon className="w-full h-full" />}
              apCost={0}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('end_turn')}
              variant="secondary"
            />
          </div>
          {combatState.selectedAction && !combatState.selectedTargetId && (
            <div className="text-center mt-1.5 sm:mt-2 text-amber-400 text-[10px] sm:text-xs animate-pulse">
              Select a target...
            </div>
          )}
        </div>
      )}

      {/* Enemy Turn */}
      {!isPlayerTurn && combatState.phase === 'enemy_turn' && (
        <div className="bg-red-950/90 border-t border-red-800/50 p-2 sm:p-4 backdrop-blur-sm">
          <div className="text-center text-red-300 text-xs sm:text-sm">
            <span className="animate-pulse">⚔</span>{' '}
            {currentCombatant?.name ?? 'Enemy'} is making their move...{' '}
            <span className="animate-pulse">⚔</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CombatPanel;
