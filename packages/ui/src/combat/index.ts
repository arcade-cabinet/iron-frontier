/**
 * Combat UI Package
 *
 * Turn-based combat UI components for Iron Frontier.
 * Styled with a steampunk western aesthetic.
 *
 * Components:
 * - CombatScreen: Main container orchestrating combat flow
 * - EnemyDisplay: Shows 1-4 enemies with health/status
 * - PlayerPanel: Player stats and status effects
 * - ActionButtons: Combat action buttons with AP costs
 * - CombatLog: Scrolling log of combat events
 * - DamageNumbers: Floating damage/heal numbers
 * - TargetSelector: Target selection overlay
 * - CombatEffects: Visual effects (screen flash, shake, etc.)
 *
 * Hooks:
 * - useCombatKeyboard: Keyboard shortcut handling
 * - useDamageNumbers: Manage floating damage numbers
 * - useCombatEffects: Manage visual effects
 *
 * Usage:
 * ```tsx
 * import { CombatScreen } from '@iron-frontier/ui/combat';
 *
 * function Game() {
 *   const combatStore = useCombatStore();
 *   return (
 *     <CombatScreen
 *       store={combatStore}
 *       onCombatEnd={(outcome) => console.log('Combat ended:', outcome)}
 *     />
 *   );
 * }
 * ```
 */

// Components
export {
  ActionButtons,
  ActionPointsBar,
  CombatEffects,
  CombatLog,
  CombatScreen,
  DamageNumbers,
  EnemyDisplay,
  HealthBar,
  PlayerPanel,
  StatusEffectIcon,
  TargetSelector,
} from './components';

// Hooks
export { useCombatEffects, useCombatKeyboard, useDamageNumbers } from './hooks';

// Types
export type {
  // Core types
  CombatActionConfig,
  CombatActionType,
  CombatEffect,
  CombatEffectType,
  CombatLogEntry,
  CombatPhase,
  CombatStateUI,
  CombatStore,
  CombatantUI,
  DamageNumberConfig,
  LogEntryType,
  StatusEffect,
  StatusEffectType,
  // Component props
  ActionButtonsProps,
  CombatEffectsProps,
  CombatLogProps,
  CombatScreenProps,
  DamageNumbersProps,
  EnemyDisplayProps,
  PlayerPanelProps,
  TargetSelectorProps,
} from './types';
