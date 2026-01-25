/**
 * Target Selector Component
 *
 * Overlay for selecting combat targets with keyboard/mouse support.
 * Shows when an action is selected and requires a target.
 */

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '../../primitives/utils';
import type { CombatantUI, TargetSelectorProps } from '../types';
import { HealthBar } from './HealthBar';

/**
 * Get action description for targeting
 */
function getActionDescription(action?: string): string {
  switch (action) {
    case 'attack':
      return 'Attack';
    case 'aimed_shot':
      return 'Aimed Shot';
    case 'use_item':
      return 'Use Item On';
    default:
      return 'Target';
  }
}

/**
 * Target card for selection
 */
interface TargetCardProps {
  target: CombatantUI;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
}

const TargetCard = React.memo<TargetCardProps>(({ target, isSelected, index, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-150',
        'bg-obsidian-900/95 backdrop-blur-sm',
        'min-w-[120px] sm:min-w-[150px]',
        isSelected
          ? 'border-crimson-500 ring-2 ring-crimson-500/50 scale-105 shadow-lg shadow-crimson-500/30'
          : 'border-obsidian-600 hover:border-bronze-500 hover:scale-102',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-500'
      )}
      aria-label={`Select ${target.name}`}
      aria-pressed={isSelected}
    >
      {/* Keyboard shortcut indicator */}
      <div
        className={cn(
          'absolute -top-2 -left-2 w-5 h-5 rounded',
          'bg-obsidian-800 border border-obsidian-600',
          'flex items-center justify-center',
          'text-[10px] font-mono font-bold',
          isSelected ? 'text-crimson-400' : 'text-parchment-400'
        )}
      >
        {index + 1}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div
          className={cn(
            'absolute -top-2 -right-2 w-6 h-6 rounded-full',
            'bg-crimson-600 border-2 border-crimson-400',
            'flex items-center justify-center animate-pulse'
          )}
        >
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <line x1="12" y1="2" x2="12" y2="6" strokeWidth={2} />
            <line x1="12" y1="18" x2="12" y2="22" strokeWidth={2} />
            <line x1="2" y1="12" x2="6" y2="12" strokeWidth={2} />
            <line x1="18" y1="12" x2="22" y2="12" strokeWidth={2} />
          </svg>
        </div>
      )}

      {/* Target name */}
      <div
        className={cn(
          'text-sm sm:text-base font-bold mb-2 truncate',
          target.isPlayer ? 'text-bronze-300' : 'text-crimson-300'
        )}
      >
        {target.name}
      </div>

      {/* Health bar */}
      <HealthBar current={target.health} max={target.maxHealth} size="sm" showValues={true} />
    </button>
  );
});

TargetCard.displayName = 'TargetCard';

/**
 * Target Selector Component
 */
export const TargetSelector = React.forwardRef<HTMLDivElement, TargetSelectorProps>(
  (
    { targets, selectedTargetId, onSelectTarget, onCancel, action, className, testID },
    ref
  ) => {
    const [selectedIndex, setSelectedIndex] = useState(() => {
      const idx = targets.findIndex((t) => t.id === selectedTargetId);
      return idx >= 0 ? idx : 0;
    });

    // Update selected index when selectedTargetId changes
    useEffect(() => {
      const idx = targets.findIndex((t) => t.id === selectedTargetId);
      if (idx >= 0) {
        setSelectedIndex(idx);
      }
    }, [selectedTargetId, targets]);

    // Keyboard navigation
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : targets.length - 1));
            break;
          case 'ArrowRight':
          case 'd':
            e.preventDefault();
            setSelectedIndex((prev) => (prev < targets.length - 1 ? prev + 1 : 0));
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (targets[selectedIndex]) {
              onSelectTarget(targets[selectedIndex].id);
            }
            break;
          case 'Escape':
            e.preventDefault();
            onCancel();
            break;
          default:
            // Number keys for direct selection
            if (/^[1-9]$/.test(e.key)) {
              const idx = parseInt(e.key, 10) - 1;
              if (idx < targets.length) {
                e.preventDefault();
                setSelectedIndex(idx);
                onSelectTarget(targets[idx].id);
              }
            }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [targets, selectedIndex, onSelectTarget, onCancel]);

    // Auto-select when index changes
    useEffect(() => {
      if (targets[selectedIndex]) {
        onSelectTarget(targets[selectedIndex].id);
      }
    }, [selectedIndex, targets, onSelectTarget]);

    const handleSelect = useCallback(
      (targetId: string) => {
        const idx = targets.findIndex((t) => t.id === targetId);
        if (idx >= 0) {
          setSelectedIndex(idx);
          onSelectTarget(targetId);
        }
      },
      [targets, onSelectTarget]
    );

    if (targets.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-bronze-700/50',
          'bg-obsidian-950/95 backdrop-blur-sm',
          'p-3 sm:p-4',
          className
        )}
        role="listbox"
        aria-label="Select target"
        data-testid={testID}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm sm:text-base font-medium text-bronze-400">
            {getActionDescription(action)} - Select Target
          </div>
          <button
            onClick={onCancel}
            className={cn(
              'p-1.5 rounded',
              'bg-obsidian-800 hover:bg-obsidian-700',
              'text-parchment-400 hover:text-parchment-200',
              'transition-colors'
            )}
            aria-label="Cancel selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Target cards */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          {targets.map((target, index) => (
            <TargetCard
              key={target.id}
              target={target}
              isSelected={selectedIndex === index}
              index={index}
              onSelect={() => handleSelect(target.id)}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-3 text-center text-[10px] sm:text-xs text-parchment-500">
          Use <kbd className="px-1 py-0.5 rounded bg-obsidian-800 font-mono">1-{targets.length}</kbd>{' '}
          or <kbd className="px-1 py-0.5 rounded bg-obsidian-800 font-mono">\u2190 \u2192</kbd> to
          select, <kbd className="px-1 py-0.5 rounded bg-obsidian-800 font-mono">Enter</kbd> to
          confirm, <kbd className="px-1 py-0.5 rounded bg-obsidian-800 font-mono">Esc</kbd> to
          cancel
        </div>
      </div>
    );
  }
);

TargetSelector.displayName = 'TargetSelector';
