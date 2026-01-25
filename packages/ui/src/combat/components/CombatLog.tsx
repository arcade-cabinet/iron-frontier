/**
 * Combat Log Component
 *
 * Displays a scrolling log of combat actions and results.
 * Messages are color-coded by type (damage, heal, miss, etc.).
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../primitives/utils';
import type { CombatLogEntry, CombatLogProps, LogEntryType } from '../types';

/**
 * Get color class for log entry type
 */
function getLogEntryColor(type: LogEntryType, isCritical?: boolean): string {
  if (isCritical) return 'text-amber-300 font-medium';

  switch (type) {
    case 'damage':
      return 'text-crimson-400';
    case 'heal':
      return 'text-sage-400';
    case 'miss':
      return 'text-obsidian-400 italic';
    case 'critical':
      return 'text-amber-300 font-medium';
    case 'status':
      return 'text-sky-400';
    case 'system':
    default:
      return 'text-parchment-300';
  }
}

/**
 * Get prefix icon for log entry type
 */
function getLogEntryPrefix(type: LogEntryType, isCritical?: boolean): string {
  if (isCritical) return '\u2605 '; // Star
  switch (type) {
    case 'damage':
      return '\u2694 '; // Crossed swords
    case 'heal':
      return '\u2764 '; // Heart
    case 'miss':
      return '\u00d7 '; // Multiplication sign (X)
    case 'status':
      return '\u26a1 '; // Lightning
    default:
      return '';
  }
}

/**
 * Single log entry component
 */
const LogEntry = React.memo<{ entry: CombatLogEntry; isLatest?: boolean }>(
  ({ entry, isLatest }) => {
    const colorClass = getLogEntryColor(entry.type, entry.isCritical);
    const prefix = getLogEntryPrefix(entry.type, entry.isCritical);

    return (
      <div
        className={cn(
          'text-xs sm:text-sm leading-relaxed transition-opacity duration-300',
          colorClass,
          isLatest && 'animate-fade-in'
        )}
      >
        <span className="select-none">{prefix}</span>
        {entry.message}
      </div>
    );
  }
);

LogEntry.displayName = 'LogEntry';

/**
 * Combat Log Component
 */
export const CombatLog = React.forwardRef<HTMLDivElement, CombatLogProps>(
  ({ entries, maxEntries = 5, className, testID }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new entries are added
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [entries.length]);

    // Get the most recent entries
    const visibleEntries = entries.slice(-maxEntries);

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-obsidian-700/50',
          'bg-obsidian-900/80 backdrop-blur-sm',
          'p-2 sm:p-3',
          className
        )}
        data-testid={testID}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[9px] sm:text-[10px] font-medium text-bronze-500/70 uppercase tracking-wider">
            Combat Log
          </div>
          <div className="flex-1 h-px bg-obsidian-700" />
        </div>

        {/* Log entries */}
        <div
          ref={scrollRef}
          className="space-y-1 min-h-[40px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-obsidian-600 scrollbar-track-transparent"
        >
          {visibleEntries.length === 0 ? (
            <div className="text-obsidian-500 text-xs sm:text-sm italic">
              The standoff begins...
            </div>
          ) : (
            visibleEntries.map((entry, index) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                isLatest={index === visibleEntries.length - 1}
              />
            ))
          )}
        </div>
      </div>
    );
  }
);

CombatLog.displayName = 'CombatLog';
