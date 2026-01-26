/**
 * Combat UI Type Definitions
 *
 * Platform-agnostic types for combat UI components.
 * These types mirror the combat schemas from @iron-frontier/shared
 * but are tailored for UI consumption.
 */

import type { ReactNode } from 'react';

// ============================================================================
// STATUS EFFECT TYPES
// ============================================================================

export type StatusEffectType = 'bleeding' | 'stunned' | 'poisoned' | 'burning' | 'buffed';

export interface StatusEffect {
  type: StatusEffectType;
  turnsRemaining: number;
  value?: number;
}

// ============================================================================
// COMBATANT (UI representation)
// ============================================================================

export interface CombatantUI {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Is this the player? */
  isPlayer: boolean;
  /** Current health */
  health: number;
  /** Maximum health */
  maxHealth: number;
  /** Remaining action points */
  actionPoints: number;
  /** Max action points per turn */
  maxActionPoints: number;
  /** Current status effects */
  statusEffects: StatusEffect[];
  /** Is dead? */
  isDead: boolean;
  /** Is currently active (their turn)? */
  isActive: boolean;
  /** Optional sprite/image URL */
  spriteUrl?: string;
  /** Enemy threat level for UI coloring */
  threatLevel?: 'low' | 'medium' | 'high' | 'boss';
}

// ============================================================================
// COMBAT ACTION
// ============================================================================

export type CombatActionType =
  | 'attack'
  | 'aimed_shot'
  | 'move'
  | 'reload'
  | 'use_item'
  | 'defend'
  | 'flee'
  | 'end_turn';

export interface CombatActionConfig {
  type: CombatActionType;
  label: string;
  icon: ReactNode;
  apCost: number;
  description?: string;
  variant?: 'default' | 'danger' | 'secondary';
  /** Keyboard shortcut (1-4, etc.) */
  shortcut?: string;
}

// ============================================================================
// COMBAT LOG ENTRY
// ============================================================================

export type LogEntryType = 'damage' | 'heal' | 'miss' | 'status' | 'system' | 'critical';

export interface CombatLogEntry {
  id: string;
  message: string;
  type: LogEntryType;
  timestamp: number;
  /** Damage/heal amount if applicable */
  value?: number;
  /** Was this a critical hit? */
  isCritical?: boolean;
  /** Actor name */
  actorName?: string;
  /** Target name */
  targetName?: string;
}

// ============================================================================
// COMBAT PHASE
// ============================================================================

export type CombatPhase =
  | 'starting'
  | 'player_turn'
  | 'enemy_turn'
  | 'victory'
  | 'defeat'
  | 'fled';

// ============================================================================
// COMBAT STATE (UI representation)
// ============================================================================

export interface CombatStateUI {
  /** Current phase */
  phase: CombatPhase;
  /** Current round number */
  round: number;
  /** All combatants */
  combatants: CombatantUI[];
  /** Combat log entries */
  log: CombatLogEntry[];
  /** Currently selected action */
  selectedAction?: CombatActionType;
  /** Currently selected target ID */
  selectedTargetId?: string;
  /** Can the player flee? */
  canFlee: boolean;
  /** Is this a boss fight? */
  isBoss: boolean;
}

// ============================================================================
// DAMAGE NUMBER ANIMATION
// ============================================================================

export interface DamageNumberConfig {
  id: string;
  value: number;
  type: 'damage' | 'heal' | 'critical' | 'miss' | 'block';
  targetId: string;
  /** Position offset from target center */
  offsetX?: number;
  offsetY?: number;
}

// ============================================================================
// COMBAT EFFECTS
// ============================================================================

export type CombatEffectType =
  | 'screen_flash'
  | 'screen_shake'
  | 'hit_spark'
  | 'heal_glow'
  | 'status_apply';

export interface CombatEffect {
  id: string;
  type: CombatEffectType;
  targetId?: string;
  duration: number;
  color?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

// ============================================================================
// COMBAT STORE INTERFACE (for mocking)
// ============================================================================

export interface CombatStore {
  /** Current combat state */
  combatState: CombatStateUI | null;
  /** Select an action */
  selectAction: (action: CombatActionType) => void;
  /** Select a target */
  selectTarget: (targetId: string) => void;
  /** Execute the selected action */
  executeAction: () => void;
  /** Cancel current selection */
  cancelSelection: () => void;
  /** End turn early */
  endTurn: () => void;
  /** Attempt to flee */
  attemptFlee: () => void;
  /** Use an item */
  useItem: (itemId: string) => void;
  /** End combat (after outcome) */
  endCombat: () => void;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface CombatScreenProps {
  /** Combat store or state */
  store?: CombatStore;
  /** Override combat state for testing */
  combatState?: CombatStateUI;
  /** Callback when combat ends */
  onCombatEnd?: (outcome: 'victory' | 'defeat' | 'fled') => void;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export interface EnemyDisplayProps {
  /** Enemies to display */
  enemies: CombatantUI[];
  /** Currently selected target ID */
  selectedTargetId?: string;
  /** Whether targets can be selected */
  isTargetable: boolean;
  /** Callback when enemy is selected */
  onSelectTarget: (targetId: string) => void;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export interface PlayerPanelProps {
  /** Player combatant */
  player: CombatantUI;
  /** Whether it's the player's turn */
  isPlayerTurn: boolean;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export interface ActionButtonsProps {
  /** Available actions */
  actions: CombatActionConfig[];
  /** Current action points */
  currentAP: number;
  /** Whether actions are disabled (enemy turn) */
  disabled: boolean;
  /** Currently selected action */
  selectedAction?: CombatActionType;
  /** Callback when action is selected */
  onSelectAction: (action: CombatActionType) => void;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export interface CombatLogProps {
  /** Log entries */
  entries: CombatLogEntry[];
  /** Maximum entries to show */
  maxEntries?: number;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export interface DamageNumbersProps {
  /** Active damage numbers */
  damageNumbers: DamageNumberConfig[];
  /** Callback when animation completes */
  onAnimationComplete: (id: string) => void;
  /** Custom class name */
  className?: string;
}

export interface TargetSelectorProps {
  /** Targetable combatants */
  targets: CombatantUI[];
  /** Selected target ID */
  selectedTargetId?: string;
  /** Callback when target is selected */
  onSelectTarget: (targetId: string) => void;
  /** Callback when selection is cancelled */
  onCancel: () => void;
  /** Current action being targeted */
  action?: CombatActionType;
  /** Custom class name */
  className?: string;
  /** Test ID */
  testID?: string;
}

export interface CombatEffectsProps {
  /** Active effects */
  effects: CombatEffect[];
  /** Callback when effect completes */
  onEffectComplete: (id: string) => void;
  /** Custom class name */
  className?: string;
}
