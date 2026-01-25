/**
 * CampScreen Component
 *
 * Camp menu for resting, eating, and survival activities.
 * Shows current fatigue, provisions, and time information.
 *
 * @example
 * ```tsx
 * <CampScreen
 *   open={atCamp}
 *   onClose={() => leaveCamp()}
 *   fatigue={playerFatigue}
 *   maxFatigue={100}
 *   provisions={playerProvisions}
 *   maxProvisions={10}
 *   currentTime="Day 3, 18:00"
 *   isDangerous={isWilderness}
 *   onRest={(hours) => rest(hours)}
 *   onSetupFire={() => setUpFire()}
 *   onEatMeal={() => eatMeal()}
 *   onHunt={() => startHunting()}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps } from './types';
import {
  CampfireIcon,
  CloseIcon,
  MenuButton,
  MenuOverlay,
  MenuPanel,
  MoonIcon,
  ProgressBar,
  TargetIcon,
} from './shared';

export interface CampScreenProps extends MenuBaseProps {
  /** Current fatigue level */
  fatigue?: number;
  /** Maximum fatigue */
  maxFatigue?: number;
  /** Current provisions count */
  provisions?: number;
  /** Maximum provisions capacity */
  maxProvisions?: number;
  /** Current game time display */
  currentTime?: string;
  /** Whether the area is dangerous */
  isDangerous?: boolean;
  /** Whether a campfire is set up */
  hasFireSetUp?: boolean;
  /** Callback when resting */
  onRest?: (hours: number) => void;
  /** Callback when setting up fire */
  onSetupFire?: () => void;
  /** Callback when eating a meal */
  onEatMeal?: () => void;
  /** Callback when starting to hunt */
  onHunt?: () => void;
  /** Callback when breaking camp */
  onBreakCamp?: () => void;
}

interface RestOption {
  hours: number;
  label: string;
  description: string;
  fatigueRestore: number;
}

const REST_OPTIONS: RestOption[] = [
  {
    hours: 2,
    label: 'Short Rest',
    description: 'A quick nap to restore some energy',
    fatigueRestore: 20,
  },
  {
    hours: 4,
    label: 'Medium Rest',
    description: 'A decent rest to recover strength',
    fatigueRestore: 40,
  },
  {
    hours: 8,
    label: 'Full Rest',
    description: 'Sleep through the night for full recovery',
    fatigueRestore: 100,
  },
];

function RestOptionCard({
  option,
  onSelect,
  isDangerous,
}: {
  option: RestOption;
  onSelect: () => void;
  isDangerous?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-3 sm:p-4 rounded-lg border-2 text-left',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'bg-stone-800/50 border-stone-700/50',
        'hover:border-amber-600/50 hover:bg-stone-800'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <MoonIcon className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-stone-200">{option.label}</span>
        </div>
        <span className="text-xs text-stone-500">{option.hours}h</span>
      </div>
      <p className="text-xs text-stone-400 mb-2">{option.description}</p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
          +{option.fatigueRestore}% fatigue
        </span>
        {isDangerous && option.hours >= 4 && (
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            Risk of encounter
          </span>
        )}
      </div>
    </button>
  );
}

function StatusBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: 'green' | 'red' | 'blue' | 'amber';
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-stone-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-stone-400">{icon}</span>}
          <span className="text-sm text-stone-300">{label}</span>
        </div>
        <span className="text-sm font-mono text-stone-400">
          {value}/{max}
        </span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
    </div>
  );
}

export function CampScreen({
  open = false,
  onClose,
  fatigue = 50,
  maxFatigue = 100,
  provisions = 5,
  maxProvisions = 10,
  currentTime = 'Day 1, 12:00',
  isDangerous = false,
  hasFireSetUp = false,
  onRest,
  onSetupFire,
  onEatMeal,
  onHunt,
  onBreakCamp,
  className,
  testID,
}: CampScreenProps) {
  const [selectedRest, setSelectedRest] = React.useState<RestOption | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const fatiguePercentage = Math.round((fatigue / maxFatigue) * 100);
  const isExhausted = fatiguePercentage >= 80;
  const canEat = provisions > 0;
  const canHunt = !isExhausted;

  const handleRest = (option: RestOption) => {
    if (isDangerous && option.hours >= 4) {
      setSelectedRest(option);
      setShowConfirm(true);
    } else {
      onRest?.(option.hours);
    }
  };

  const confirmRest = () => {
    if (selectedRest) {
      onRest?.(selectedRest.hours);
      setShowConfirm(false);
      setSelectedRest(null);
    }
  };

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4"
      >
        <MenuPanel maxWidth="lg" className="sm:max-h-[90vh] flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-700/30 border-2 border-amber-600/50 flex items-center justify-center">
                <CampfireIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-amber-200 tracking-wide uppercase">
                  Camp
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">{currentTime}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </header>

          {/* Danger Warning */}
          {isDangerous && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <TargetIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-amber-400">
                This area is dangerous. Resting may attract enemies.
                {!hasFireSetUp && ' Setting up a fire may help deter wildlife.'}
              </p>
            </div>
          )}

          {/* Status Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <StatusBar
              label="Fatigue"
              value={maxFatigue - fatigue}
              max={maxFatigue}
              color={isExhausted ? 'red' : 'green'}
            />
            <StatusBar
              label="Provisions"
              value={provisions}
              max={maxProvisions}
              color={provisions <= 2 ? 'red' : 'amber'}
            />
          </div>

          {/* Confirm Rest Dialog */}
          {showConfirm && selectedRest && (
            <div className="mb-4 p-4 rounded-lg bg-amber-900/30 border border-amber-700/50">
              <h3 className="text-sm font-medium text-amber-200 mb-2">
                Rest in dangerous area?
              </h3>
              <p className="text-xs text-stone-400 mb-4">
                Resting for {selectedRest.hours} hours in this area may attract enemies.
                {hasFireSetUp ? ' Your campfire may help deter some creatures.' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRest}
                  className="flex-1 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm transition-colors min-h-[44px]"
                >
                  Rest Anyway
                </button>
              </div>
            </div>
          )}

          {/* Rest Options */}
          {!showConfirm && (
            <>
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">
                Rest
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {REST_OPTIONS.map((option) => (
                  <RestOptionCard
                    key={option.hours}
                    option={option}
                    onSelect={() => handleRest(option)}
                    isDangerous={isDangerous}
                  />
                ))}
              </div>
            </>
          )}

          {/* Time Warning */}
          <div className="mb-4 px-3 py-2 rounded-lg bg-stone-800/50 border border-stone-700/50">
            <p className="text-xs text-stone-500 text-center">
              Time will pass while resting. Plan accordingly.
            </p>
          </div>

          {/* Camp Actions */}
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">
            Camp Actions
          </h3>
          <div className="space-y-2">
            {onSetupFire && (
              <MenuButton
                variant="secondary"
                icon={<CampfireIcon className="w-5 h-5" />}
                onClick={onSetupFire}
                disabled={hasFireSetUp}
              >
                {hasFireSetUp ? 'Fire Already Set Up' : 'Set Up Fire'}
                {!hasFireSetUp && (
                  <span className="ml-auto text-xs text-stone-500">
                    Safer but visible
                  </span>
                )}
              </MenuButton>
            )}

            {onEatMeal && (
              <MenuButton
                variant="secondary"
                onClick={onEatMeal}
                disabled={!canEat}
              >
                Eat Meal
                <span className="ml-auto text-xs text-stone-500">
                  {canEat ? '-1 provisions, restore HP' : 'No provisions'}
                </span>
              </MenuButton>
            )}

            {onHunt && (
              <MenuButton
                variant="secondary"
                icon={<TargetIcon className="w-5 h-5" />}
                onClick={onHunt}
                disabled={!canHunt}
              >
                Go Hunting
                <span className="ml-auto text-xs text-stone-500">
                  {canHunt ? 'Gain provisions' : 'Too exhausted'}
                </span>
              </MenuButton>
            )}
          </div>

          {/* Leave Camp */}
          <div className="mt-auto pt-4 border-t border-stone-800/50">
            <MenuButton
              variant="ghost"
              onClick={onBreakCamp || onClose}
            >
              Break Camp
            </MenuButton>
          </div>
        </MenuPanel>
      </div>
    </MenuOverlay>
  );
}

CampScreen.displayName = 'CampScreen';

export default CampScreen;
