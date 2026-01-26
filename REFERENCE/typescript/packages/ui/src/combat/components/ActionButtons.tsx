/**
 * Action Buttons Component
 *
 * Grid of combat action buttons with AP costs and keyboard shortcuts.
 * Styled with a steampunk western aesthetic - brass rivets and worn leather.
 */

import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { cn } from '../../primitives/utils';
import type { ActionButtonsProps, CombatActionConfig, CombatActionType } from '../types';

/**
 * Default action icons as SVG components
 */
const ActionIcons: Record<CombatActionType, React.ReactNode> = {
  attack: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <line x1="12" y1="2" x2="12" y2="6" strokeWidth={2} />
      <line x1="12" y1="18" x2="12" y2="22" strokeWidth={2} />
      <line x1="2" y1="12" x2="6" y2="12" strokeWidth={2} />
      <line x1="18" y1="12" x2="22" y2="12" strokeWidth={2} />
    </svg>
  ),
  aimed_shot: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <circle cx="12" cy="12" r="8" strokeWidth={2} />
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
      <line x1="12" y1="2" x2="12" y2="5" strokeWidth={2} />
      <line x1="12" y1="19" x2="12" y2="22" strokeWidth={2} />
      <line x1="2" y1="12" x2="5" y2="12" strokeWidth={2} />
      <line x1="19" y1="12" x2="22" y2="12" strokeWidth={2} />
    </svg>
  ),
  defend: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
      />
    </svg>
  ),
  use_item: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3h6v4l4 8a2 2 0 01-2 2H7a2 2 0 01-2-2l4-8V3z"
      />
      <line x1="9" y1="3" x2="15" y2="3" strokeWidth={2} />
    </svg>
  ),
  flee: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  reload: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  move: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  ),
  end_turn: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <polyline points="12 6 12 12 16 14" strokeWidth={2} />
    </svg>
  ),
};

/**
 * Single action button
 */
interface ActionButtonProps {
  config: CombatActionConfig;
  currentAP: number;
  disabled: boolean;
  isSelected: boolean;
  shortcutKey?: string;
  onSelect: () => void;
}

const ActionButton = React.memo<ActionButtonProps>(
  ({ config, currentAP, disabled, isSelected, shortcutKey, onSelect }) => {
    const canAfford = currentAP >= config.apCost;
    const isDisabled = disabled || !canAfford;

    const variantStyles = {
      default: isDisabled
        ? 'bg-obsidian-800 text-obsidian-500 border-obsidian-700'
        : isSelected
          ? 'bg-bronze-600 text-bronze-100 border-bronze-400 ring-2 ring-bronze-400/50'
          : 'bg-bronze-800/80 hover:bg-bronze-700 text-bronze-100 border-bronze-600/50',
      danger: isDisabled
        ? 'bg-obsidian-800 text-obsidian-500 border-obsidian-700'
        : isSelected
          ? 'bg-crimson-700 text-crimson-100 border-crimson-400 ring-2 ring-crimson-400/50'
          : 'bg-crimson-900/60 hover:bg-crimson-800/60 text-crimson-200 border-crimson-700/50',
      secondary: isDisabled
        ? 'bg-obsidian-800 text-obsidian-500 border-obsidian-700'
        : isSelected
          ? 'bg-obsidian-600 text-parchment-100 border-obsidian-400 ring-2 ring-obsidian-400/50'
          : 'bg-obsidian-700 hover:bg-obsidian-600 text-parchment-200 border-obsidian-600/50',
    };

    return (
      <button
        onClick={onSelect}
        disabled={isDisabled}
        className={cn(
          'relative flex flex-col items-center justify-center gap-0.5 sm:gap-1',
          'px-2 sm:px-3 py-1.5 sm:py-2',
          'rounded-lg border transition-all duration-150',
          'min-w-[52px] sm:min-w-[70px] min-h-[52px] sm:min-h-[64px]',
          isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-95',
          variantStyles[config.variant ?? 'default']
        )}
        aria-label={`${config.label}${config.apCost > 0 ? `, costs ${config.apCost} action points` : ''}`}
        aria-disabled={isDisabled}
      >
        {/* Keyboard shortcut badge */}
        {shortcutKey && !isDisabled && (
          <div
            className={cn(
              'absolute -top-1 -left-1 w-4 h-4 rounded',
              'bg-obsidian-900/90 border border-obsidian-600',
              'flex items-center justify-center',
              'text-[9px] font-mono text-parchment-400'
            )}
          >
            {shortcutKey}
          </div>
        )}

        {/* Icon */}
        <div className="w-4 h-4 sm:w-5 sm:h-5">{config.icon ?? ActionIcons[config.type]}</div>

        {/* Label */}
        <span className="text-[9px] sm:text-[10px] font-medium leading-tight">{config.label}</span>

        {/* AP Cost */}
        {config.apCost > 0 && (
          <span
            className={cn(
              'text-[8px] sm:text-[9px] font-mono',
              canAfford ? 'text-bronze-400' : 'text-crimson-400'
            )}
          >
            {config.apCost} AP
          </span>
        )}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

/**
 * Action Buttons Container
 */
export const ActionButtons = React.forwardRef<HTMLDivElement, ActionButtonsProps>(
  ({ actions, currentAP, disabled, selectedAction, onSelectAction, className, testID }, ref) => {
    // Handle keyboard shortcuts
    useEffect(() => {
      if (disabled || typeof window === 'undefined') return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // Number keys 1-9
        if (/^[1-9]$/.test(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (index < actions.length) {
            const action = actions[index];
            if (currentAP >= action.apCost) {
              e.preventDefault();
              onSelectAction(action.type);
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disabled, actions, currentAP, onSelectAction]);

    const handleSelect = useCallback(
      (type: CombatActionType) => {
        onSelectAction(type);
      },
      [onSelectAction]
    );

    return (
      <div
        ref={ref}
        className={cn(
          'grid grid-cols-6 sm:flex sm:flex-wrap sm:justify-center',
          'gap-1 sm:gap-2',
          className
        )}
        role="toolbar"
        aria-label="Combat actions"
        data-testid={testID}
      >
        {actions.map((action, index) => (
          <ActionButton
            key={action.type}
            config={action}
            currentAP={currentAP}
            disabled={disabled}
            isSelected={selectedAction === action.type}
            shortcutKey={`${index + 1}`}
            onSelect={() => handleSelect(action.type)}
          />
        ))}
      </div>
    );
  }
);

ActionButtons.displayName = 'ActionButtons';
