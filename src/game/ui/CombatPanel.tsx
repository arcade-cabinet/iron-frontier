/**
 * CombatPanel - Turn-based combat UI
 *
 * Displays during combat encounters with:
 * - Enemy health bars
 * - Action buttons (attack, defend, use item, flee)
 * - Combat log
 * - Player stats
 */

import { useGameStore } from '../store/gameStore';
import type { Combatant, CombatActionType } from '../../data/schemas/combat';
import { AP_COSTS } from '../../data/schemas/combat';

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
  const color = percentage > 50 ? 'bg-green-600' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-600';

  return (
    <div className={`mb-2 ${isPlayer ? 'w-48' : 'w-36'}`}>
      <div className="flex justify-between text-xs mb-1">
        <span className={isPlayer ? 'text-amber-400' : 'text-stone-300'}>{name}</span>
        <span className="text-stone-400">{current}/{max}</span>
      </div>
      <div className="h-2 bg-stone-800 rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// ACTION BUTTON
// ============================================================================

function ActionButton({ action, label, apCost, currentAP, disabled, onClick }: {
  action: CombatActionType;
  label: string;
  apCost: number;
  currentAP: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const canAfford = currentAP >= apCost;
  const isDisabled = disabled || !canAfford;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        px-4 py-2 rounded font-medium text-sm
        flex items-center justify-between gap-2
        transition-colors
        ${isDisabled
          ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
          : 'bg-amber-700 hover:bg-amber-600 text-white'
        }
      `}
    >
      <span>{label}</span>
      <span className={`text-xs ${canAfford ? 'text-amber-300' : 'text-red-400'}`}>
        {apCost} AP
      </span>
    </button>
  );
}

// ============================================================================
// COMBATANT CARD
// ============================================================================

function CombatantCard({ combatant, isSelected, onSelect }: {
  combatant: Combatant;
  isSelected: boolean;
  onSelect: () => void;
}) {
  if (combatant.isDead) return null;

  return (
    <button
      onClick={onSelect}
      className={`
        p-3 rounded border-2 transition-all
        ${isSelected
          ? 'border-amber-500 bg-stone-800'
          : 'border-stone-600 bg-stone-900 hover:border-stone-500'
        }
        ${combatant.isPlayer ? 'cursor-default' : 'cursor-pointer'}
      `}
      disabled={combatant.isPlayer}
    >
      <HealthBar
        current={combatant.health}
        max={combatant.maxHealth}
        name={combatant.name}
        isPlayer={combatant.isPlayer}
      />
      <div className="text-xs text-stone-400 mt-1">
        AP: {combatant.actionPoints}/{combatant.maxActionPoints}
      </div>
    </button>
  );
}

// ============================================================================
// COMBAT LOG
// ============================================================================

function CombatLog() {
  const combatState = useGameStore(state => state.combatState);

  if (!combatState) return null;

  const recentLogs = combatState.log.slice(-5);

  return (
    <div className="bg-stone-900/90 rounded p-3 max-h-32 overflow-y-auto">
      <div className="text-xs font-medium text-amber-500 mb-2">Combat Log</div>
      {recentLogs.length === 0 ? (
        <div className="text-stone-500 text-sm italic">Combat begins...</div>
      ) : (
        recentLogs.map((entry, i) => (
          <div
            key={i}
            className={`text-sm mb-1 ${
              entry.success
                ? entry.isCritical ? 'text-yellow-400' : 'text-stone-300'
                : 'text-red-400'
            }`}
          >
            {entry.message}
          </div>
        ))
      )}
    </div>
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
    playerStats,
  } = useGameStore();

  if (!combatState) return null;

  const player = combatState.combatants.find(c => c.isPlayer);
  const enemies = combatState.combatants.filter(c => !c.isPlayer && !c.isDead);
  const currentCombatant = combatState.combatants[combatState.currentTurnIndex];
  const isPlayerTurn = combatState.phase === 'player_turn';

  // Get player's current AP
  const playerAP = player?.actionPoints ?? 0;

  // Handle action selection
  const handleAction = (action: CombatActionType) => {
    if (action === 'end_turn') {
      endCombatTurn();
    } else if (action === 'flee') {
      attemptFlee();
    } else {
      selectCombatAction(action);
    }
  };

  // Handle target selection
  const handleTargetSelect = (targetId: string) => {
    selectCombatTarget(targetId);
    // If action already selected, execute
    if (combatState.selectedAction) {
      executeCombatAction();
    }
  };

  // Victory/Defeat screens
  if (combatState.phase === 'victory') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-stone-900 border-2 border-amber-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Victory!</h2>
          <p className="text-stone-300 mb-6">You have defeated your enemies.</p>
          <button
            onClick={() => useGameStore.getState().endCombat()}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (combatState.phase === 'defeat') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-stone-900 border-2 border-red-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Defeated</h2>
          <p className="text-stone-300 mb-6">You have been overcome by your enemies.</p>
          <button
            onClick={() => useGameStore.getState().endCombat()}
            className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (combatState.phase === 'fled') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-stone-900 border-2 border-stone-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-stone-400 mb-4">Escaped</h2>
          <p className="text-stone-300 mb-6">You managed to flee from combat.</p>
          <button
            onClick={() => useGameStore.getState().endCombat()}
            className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col z-50">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-amber-500">Combat</h2>
            <div className="text-sm text-stone-400">Round {combatState.round}</div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-medium ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
              {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
            </div>
            {player && (
              <div className="text-sm text-stone-400">
                AP: {player.actionPoints}/{player.maxActionPoints}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Combat Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Enemies Row */}
        <div className="flex justify-center gap-4">
          {enemies.map(enemy => (
            <CombatantCard
              key={enemy.definitionId + enemy.name}
              combatant={enemy}
              isSelected={combatState.selectedTargetId === enemy.definitionId}
              onSelect={() => handleTargetSelect(enemy.definitionId)}
            />
          ))}
        </div>

        {/* Combat Log */}
        <div className="flex-1 flex justify-center">
          <div className="w-96">
            <CombatLog />
          </div>
        </div>

        {/* Player Info Row */}
        <div className="flex justify-center">
          {player && (
            <CombatantCard
              combatant={player}
              isSelected={false}
              onSelect={() => {}}
            />
          )}
        </div>
      </div>

      {/* Action Bar */}
      {isPlayerTurn && (
        <div className="bg-stone-900 border-t border-stone-700 p-4">
          <div className="flex justify-center gap-3">
            <ActionButton
              action="attack"
              label="Attack"
              apCost={AP_COSTS.attack}
              currentAP={playerAP}
              disabled={!combatState.selectedTargetId}
              onClick={() => handleAction('attack')}
            />
            <ActionButton
              action="aimed_shot"
              label="Aimed Shot"
              apCost={AP_COSTS.aimed_shot}
              currentAP={playerAP}
              disabled={!combatState.selectedTargetId}
              onClick={() => handleAction('aimed_shot')}
            />
            <ActionButton
              action="defend"
              label="Defend"
              apCost={AP_COSTS.defend}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('defend')}
            />
            <ActionButton
              action="use_item"
              label="Use Item"
              apCost={AP_COSTS.use_item}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('use_item')}
            />
            <ActionButton
              action="flee"
              label="Flee"
              apCost={AP_COSTS.flee}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('flee')}
            />
            <ActionButton
              action="end_turn"
              label="End Turn"
              apCost={0}
              currentAP={playerAP}
              disabled={false}
              onClick={() => handleAction('end_turn')}
            />
          </div>
          {combatState.selectedAction && !combatState.selectedTargetId && (
            <div className="text-center mt-2 text-amber-400 text-sm">
              Select a target to attack
            </div>
          )}
        </div>
      )}

      {/* Enemy Turn Indicator */}
      {!isPlayerTurn && combatState.phase === 'enemy_turn' && (
        <div className="bg-stone-900 border-t border-stone-700 p-4">
          <div className="text-center text-red-400">
            {currentCombatant?.name ?? 'Enemy'} is taking their turn...
          </div>
        </div>
      )}
    </div>
  );
}

export default CombatPanel;
