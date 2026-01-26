/**
 * Combat Screen Component
 *
 * Main container for the turn-based combat UI.
 * Orchestrates all sub-components and manages combat flow.
 *
 * Layout:
 * - Top: Header with round info and turn indicator
 * - Middle (60%): Enemy display area
 * - Effects layer: Damage numbers, status effects
 * - Bottom (40%): Player panel, actions, combat log
 */

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { cn } from '../../primitives/utils';
import { useCombatEffects } from '../hooks/useCombatEffects';
import { useDamageNumbers } from '../hooks/useDamageNumbers';
import type {
  CombatActionConfig,
  CombatActionType,
  CombatLogEntry,
  CombatPhase,
  CombatScreenProps,
  CombatStateUI,
} from '../types';
import { ActionButtons } from './ActionButtons';
import { CombatEffects } from './CombatEffects';
import { CombatLog } from './CombatLog';
import { DamageNumbers } from './DamageNumbers';
import { EnemyDisplay } from './EnemyDisplay';
import { PlayerPanel } from './PlayerPanel';
import { TargetSelector } from './TargetSelector';

/**
 * Default action point costs
 */
const DEFAULT_AP_COSTS: Record<CombatActionType, number> = {
  attack: 2,
  aimed_shot: 4,
  move: 1,
  reload: 2,
  use_item: 2,
  defend: 2,
  flee: 3,
  end_turn: 0,
};

/**
 * Build default action configurations
 */
function getDefaultActions(): CombatActionConfig[] {
  return [
    {
      type: 'attack',
      label: 'Attack',
      apCost: DEFAULT_AP_COSTS.attack,
      description: 'Basic attack',
      icon: undefined, // Uses default icon
    },
    {
      type: 'aimed_shot',
      label: 'Aimed',
      apCost: DEFAULT_AP_COSTS.aimed_shot,
      description: 'Accurate but costly attack',
      icon: undefined,
    },
    {
      type: 'defend',
      label: 'Defend',
      apCost: DEFAULT_AP_COSTS.defend,
      description: 'Reduce incoming damage',
      icon: undefined,
    },
    {
      type: 'use_item',
      label: 'Item',
      apCost: DEFAULT_AP_COSTS.use_item,
      description: 'Use a consumable item',
      icon: undefined,
    },
    {
      type: 'flee',
      label: 'Flee',
      apCost: DEFAULT_AP_COSTS.flee,
      description: 'Attempt to escape combat',
      variant: 'danger',
      icon: undefined,
    },
    {
      type: 'end_turn',
      label: 'End',
      apCost: 0,
      description: 'End your turn early',
      variant: 'secondary',
      icon: undefined,
    },
  ];
}

/**
 * Star icon for victory screen
 */
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/**
 * Skull icon for defeat screen
 */
const SkullIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12v2c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1h2v-3h2v3h4v-3h2v3h2c.55 0 1-.45 1-1v-3h1c.55 0 1-.45 1-1v-2c0-5.52-4.48-10-10-10zm-4 12c-.83 0-1.5-.67-1.5-1.5S7.17 11 8 11s1.5.67 1.5 1.5S8.83 14 8 14zm8 0c-.83 0-1.5-.67-1.5-1.5S15.17 11 16 11s1.5.67 1.5 1.5S16.83 14 16 14z" />
  </svg>
);

/**
 * Run icon for fled screen
 */
const RunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

/**
 * Outcome Screen Component
 */
interface OutcomeScreenProps {
  type: 'victory' | 'defeat' | 'fled';
  onContinue: () => void;
}

const OutcomeScreen: React.FC<OutcomeScreenProps> = ({ type, onContinue }) => {
  const config = {
    victory: {
      title: 'Victory',
      subtitle: 'You have bested your foes',
      icon: <StarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400" />,
      borderColor: 'border-bronze-500',
      bgColor: 'bg-bronze-950/95',
      buttonColor: 'bg-bronze-600 hover:bg-bronze-500 text-bronze-100',
    },
    defeat: {
      title: 'Defeated',
      subtitle: 'The frontier claims another soul',
      icon: <SkullIcon className="w-12 h-12 sm:w-16 sm:h-16 text-crimson-500" />,
      borderColor: 'border-crimson-500',
      bgColor: 'bg-crimson-950/95',
      buttonColor: 'bg-crimson-600 hover:bg-crimson-500 text-crimson-100',
    },
    fled: {
      title: 'Escaped',
      subtitle: 'You live to fight another day',
      icon: <RunIcon className="w-12 h-12 sm:w-16 sm:h-16 text-parchment-400" />,
      borderColor: 'border-obsidian-500',
      bgColor: 'bg-obsidian-900/95',
      buttonColor: 'bg-obsidian-600 hover:bg-obsidian-500 text-parchment-200',
    },
  };

  const { title, subtitle, icon, borderColor, bgColor, buttonColor } = config[type];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
      <div
        className={cn(
          'rounded-lg border-2 p-6 sm:p-8',
          'text-center max-w-xs sm:max-w-sm mx-4',
          'backdrop-blur-sm',
          borderColor,
          bgColor
        )}
      >
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-xl sm:text-2xl font-bold text-parchment-100 mb-2">{title}</h2>
        <p className="text-parchment-400 text-xs sm:text-sm mb-6">{subtitle}</p>
        <button
          onClick={onContinue}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium',
            'transition-colors min-h-[44px]',
            buttonColor
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

/**
 * Combat Header Component
 */
interface CombatHeaderProps {
  round: number;
  phase: CombatPhase;
  isBoss: boolean;
}

const CombatHeader: React.FC<CombatHeaderProps> = ({ round, phase, isBoss }) => {
  const isPlayerTurn = phase === 'player_turn';

  return (
    <div
      className={cn(
        'px-3 sm:px-4 py-2 sm:py-3',
        'border-b backdrop-blur-sm',
        isBoss
          ? 'bg-amber-950/90 border-amber-800/50'
          : 'bg-bronze-950/90 border-bronze-800/50'
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={cn(
              'text-base sm:text-lg font-bold',
              isBoss ? 'text-amber-400' : 'text-bronze-400'
            )}
          >
            {isBoss ? 'Boss Battle' : 'Showdown'}
          </h2>
          <div className="text-[10px] sm:text-xs text-bronze-500/60">Round {round}</div>
        </div>
        <div
          className={cn(
            'px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium',
            isPlayerTurn
              ? 'bg-sage-900/60 text-sage-400 border border-sage-700/50'
              : 'bg-crimson-900/60 text-crimson-400 border border-crimson-700/50'
          )}
        >
          {isPlayerTurn ? 'Your Move' : 'Enemy Turn'}
        </div>
      </div>
    </div>
  );
};

/**
 * Enemy Turn Indicator
 */
interface EnemyTurnIndicatorProps {
  currentEnemyName?: string;
}

const EnemyTurnIndicator: React.FC<EnemyTurnIndicatorProps> = ({ currentEnemyName }) => (
  <div className="bg-crimson-950/90 border-t border-crimson-800/50 p-3 sm:p-4 backdrop-blur-sm">
    <div className="text-center text-crimson-300 text-xs sm:text-sm">
      <span className="animate-pulse">\u2694</span> {currentEnemyName ?? 'Enemy'} is making their
      move... <span className="animate-pulse">\u2694</span>
    </div>
  </div>
);

/**
 * Main Combat Screen Component
 */
export const CombatScreen = React.forwardRef<HTMLDivElement, CombatScreenProps>(
  ({ store, combatState: externalCombatState, onCombatEnd, className, testID }, ref) => {
    // Use external combat state or store state
    const combatState = externalCombatState ?? store?.combatState;

    // Local UI state
    const [selectedAction, setSelectedAction] = useState<CombatActionType | undefined>();
    const [selectedTargetId, setSelectedTargetId] = useState<string | undefined>();
    const [targetSelectorOpen, setTargetSelectorOpen] = useState(false);

    // Effects hooks
    const {
      damageNumbers,
      addDamageNumber,
      removeDamageNumber,
    } = useDamageNumbers();

    const {
      effects,
      removeEffect,
      triggerScreenFlash,
      triggerScreenShake,
    } = useCombatEffects();

    // Derived state
    const player = useMemo(
      () => combatState?.combatants.find((c) => c.isPlayer),
      [combatState?.combatants]
    );

    const enemies = useMemo(
      () => combatState?.combatants.filter((c) => !c.isPlayer) ?? [],
      [combatState?.combatants]
    );

    const aliveEnemies = useMemo(
      () => enemies.filter((e) => !e.isDead),
      [enemies]
    );

    const isPlayerTurn = combatState?.phase === 'player_turn';
    const playerAP = player?.actionPoints ?? 0;

    // Actions configuration
    const actions = useMemo(() => {
      const defaultActions = getDefaultActions();
      // Filter out flee if combat doesn't allow it
      if (combatState && !combatState.canFlee) {
        return defaultActions.filter((a) => a.type !== 'flee');
      }
      return defaultActions;
    }, [combatState?.canFlee]);

    // Convert combat log entries to UI format
    const logEntries: CombatLogEntry[] = useMemo(() => {
      if (!combatState?.log) return [];
      return combatState.log.map((entry, index) => ({
        id: `log-${index}`,
        message: entry.message,
        type: entry.isCritical
          ? 'critical'
          : entry.value && entry.value > 0
            ? 'damage'
            : entry.value && entry.value < 0
              ? 'heal'
              : 'system',
        timestamp: Date.now() - (combatState.log.length - index) * 1000,
        value: entry.value,
        isCritical: entry.isCritical,
        actorName: entry.actorName,
        targetName: entry.targetName,
      }));
    }, [combatState?.log]);

    // Handlers
    const handleSelectAction = useCallback(
      (action: CombatActionType) => {
        setSelectedAction(action);

        // Some actions need a target
        const needsTarget = ['attack', 'aimed_shot'].includes(action);
        if (needsTarget && aliveEnemies.length > 0) {
          setTargetSelectorOpen(true);
          // Auto-select first enemy
          if (!selectedTargetId && aliveEnemies[0]) {
            setSelectedTargetId(aliveEnemies[0].id);
          }
        } else {
          // Execute immediately for non-targeted actions
          store?.selectAction(action);

          if (action === 'end_turn') {
            store?.endTurn();
          } else if (action === 'flee') {
            store?.attemptFlee();
          } else if (action === 'defend') {
            store?.executeAction();
          }
        }
      },
      [store, aliveEnemies, selectedTargetId]
    );

    const handleSelectTarget = useCallback(
      (targetId: string) => {
        setSelectedTargetId(targetId);
        store?.selectTarget(targetId);
      },
      [store]
    );

    const handleExecuteAction = useCallback(() => {
      if (selectedAction && selectedTargetId) {
        store?.selectAction(selectedAction);
        store?.selectTarget(selectedTargetId);
        store?.executeAction();

        // Trigger visual effects
        triggerScreenFlash('#ff4400', 'light');
        triggerScreenShake('medium');
        addDamageNumber({
          value: Math.floor(Math.random() * 20) + 5, // Mock damage
          type: Math.random() > 0.9 ? 'critical' : 'damage',
          targetId: selectedTargetId,
        });

        // Reset selection
        setSelectedAction(undefined);
        setSelectedTargetId(undefined);
        setTargetSelectorOpen(false);
      }
    }, [selectedAction, selectedTargetId, store, triggerScreenFlash, triggerScreenShake, addDamageNumber]);

    const handleCancelSelection = useCallback(() => {
      setSelectedAction(undefined);
      setSelectedTargetId(undefined);
      setTargetSelectorOpen(false);
      store?.cancelSelection();
    }, [store]);

    const handleCombatEnd = useCallback(() => {
      const outcome = combatState?.phase as 'victory' | 'defeat' | 'fled';
      store?.endCombat();
      onCombatEnd?.(outcome);
    }, [combatState?.phase, store, onCombatEnd]);

    // Guard clause for no combat state
    if (!combatState) {
      return null;
    }

    // Outcome screens
    if (['victory', 'defeat', 'fled'].includes(combatState.phase)) {
      return (
        <OutcomeScreen
          type={combatState.phase as 'victory' | 'defeat' | 'fled'}
          onContinue={handleCombatEnd}
        />
      );
    }

    return (
      <div
        ref={ref}
        id="combat-screen-container"
        className={cn(
          'fixed inset-0 bg-black/70 flex flex-col z-50',
          className
        )}
        data-testid={testID}
        role="region"
        aria-label="Combat screen"
      >
        {/* Combat effects layer */}
        <CombatEffects effects={effects} onEffectComplete={removeEffect} />

        {/* Damage numbers layer */}
        <DamageNumbers damageNumbers={damageNumbers} onAnimationComplete={removeDamageNumber} />

        {/* Header */}
        <CombatHeader
          round={combatState.round}
          phase={combatState.phase}
          isBoss={combatState.isBoss}
        />

        {/* Main combat area */}
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
          {/* Enemy display (top 50-60%) */}
          <div className="flex-[3] flex items-center justify-center min-h-0">
            <EnemyDisplay
              enemies={enemies}
              selectedTargetId={selectedTargetId}
              isTargetable={isPlayerTurn && !!selectedAction && targetSelectorOpen}
              onSelectTarget={(targetId) => {
                handleSelectTarget(targetId);
                handleExecuteAction();
              }}
            />
          </div>

          {/* Combat log (middle) */}
          <div className="flex-1 flex justify-center items-center min-h-0">
            <div className="w-full max-w-md">
              <CombatLog entries={logEntries} maxEntries={4} />
            </div>
          </div>

          {/* Player panel (bottom) */}
          <div className="flex justify-center">
            {player && <PlayerPanel player={player} isPlayerTurn={isPlayerTurn} />}
          </div>
        </div>

        {/* Target selector overlay */}
        {targetSelectorOpen && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10">
            <TargetSelector
              targets={aliveEnemies}
              selectedTargetId={selectedTargetId}
              onSelectTarget={handleSelectTarget}
              onCancel={handleCancelSelection}
              action={selectedAction}
            />
          </div>
        )}

        {/* Action bar (player turn) */}
        {isPlayerTurn && !targetSelectorOpen && (
          <div className="bg-bronze-950/90 border-t border-bronze-800/50 p-2 sm:p-3 backdrop-blur-sm">
            <ActionButtons
              actions={actions}
              currentAP={playerAP}
              disabled={false}
              selectedAction={selectedAction}
              onSelectAction={handleSelectAction}
            />
            {selectedAction && !targetSelectorOpen && (
              <div className="text-center mt-2 text-bronze-400 text-[10px] sm:text-xs animate-pulse">
                Select a target...
              </div>
            )}
          </div>
        )}

        {/* Enemy turn indicator */}
        {combatState.phase === 'enemy_turn' && (
          <EnemyTurnIndicator
            currentEnemyName={
              combatState.combatants.find((c) => c.isActive && !c.isPlayer)?.name
            }
          />
        )}
      </div>
    );
  }
);

CombatScreen.displayName = 'CombatScreen';
