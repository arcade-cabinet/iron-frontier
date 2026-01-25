/**
 * StatsScreen Component
 *
 * Character statistics and equipment screen showing player info,
 * stats, equipped gear, status effects, and skills.
 *
 * @example
 * ```tsx
 * <StatsScreen
 *   open={showStats}
 *   onClose={() => setShowStats(false)}
 *   character={playerStats}
 *   equipment={playerEquipment}
 *   statusEffects={activeEffects}
 *   skills={playerSkills}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps, CharacterStats, Equipment, StatusEffect, Skill, MenuItem } from './types';
import {
  CloseIcon,
  CoinIcon,
  MenuOverlay,
  ProgressBar,
  ShieldIcon,
  SwordIcon,
  TabGroup,
  UserIcon,
  getRarityBgColor,
  getRarityColor,
} from './shared';

export interface StatsScreenProps extends MenuBaseProps {
  /** Character stats */
  character?: CharacterStats;
  /** Equipped items */
  equipment?: Equipment;
  /** Active status effects */
  statusEffects?: StatusEffect[];
  /** Unlocked skills */
  skills?: Skill[];
  /** Callback when an equipment slot is clicked */
  onEquipmentClick?: (slot: keyof Equipment) => void;
  /** Callback when a skill is clicked */
  onSkillClick?: (skillId: string) => void;
}

type StatsTab = 'stats' | 'equipment' | 'skills';

const STAT_TABS: { id: StatsTab; label: string }[] = [
  { id: 'stats', label: 'Stats' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'skills', label: 'Skills' },
];

const EQUIPMENT_SLOTS: { id: keyof Equipment; label: string; icon: React.ReactNode }[] = [
  { id: 'weapon', label: 'Weapon', icon: <SwordIcon className="w-full h-full" /> },
  { id: 'offhand', label: 'Off-Hand', icon: <ShieldIcon className="w-full h-full" /> },
  { id: 'head', label: 'Head', icon: <UserIcon className="w-full h-full" /> },
  { id: 'body', label: 'Body', icon: <ShieldIcon className="w-full h-full" /> },
  { id: 'accessory', label: 'Accessory', icon: <CoinIcon className="w-full h-full" /> },
];

function EquipmentSlot({
  slot,
  item,
  onClick,
}: {
  slot: { id: keyof Equipment; label: string; icon: React.ReactNode };
  item: MenuItem | null;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 w-full',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        item
          ? cn(getRarityBgColor(item.rarity), 'hover:scale-[1.02]')
          : 'bg-stone-800/30 border-stone-700/30 border-dashed hover:border-stone-600/50'
      )}
    >
      {/* Slot Icon */}
      <div
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
          item ? getRarityColor(item.rarity) : 'text-stone-600'
        )}
      >
        {slot.icon}
      </div>

      {/* Slot Info */}
      <div className="flex-1 text-left">
        <div className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wide">{slot.label}</div>
        {item ? (
          <>
            <div className={cn('text-sm sm:text-base font-medium', getRarityColor(item.rarity))}>
              {item.name}
            </div>
            {item.condition !== undefined && (
              <div className="w-16 mt-1">
                <ProgressBar
                  value={item.condition}
                  max={100}
                  color={item.condition > 50 ? 'green' : item.condition > 25 ? 'amber' : 'red'}
                  size="sm"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-stone-600 italic">Empty</div>
        )}
      </div>
    </button>
  );
}

function StatRow({
  label,
  value,
  max,
  showBar,
  barColor,
}: {
  label: string;
  value: number | string;
  max?: number;
  showBar?: boolean;
  barColor?: 'green' | 'red' | 'blue' | 'amber';
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
      <span className="text-sm text-stone-400">{label}</span>
      <div className="flex items-center gap-3">
        {showBar && max && (
          <div className="w-24 sm:w-32">
            <ProgressBar value={Number(value)} max={max} color={barColor} size="sm" />
          </div>
        )}
        <span className="text-sm font-medium text-stone-200 min-w-[60px] text-right">
          {max ? `${value}/${max}` : value}
        </span>
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  onClick,
}: {
  skill: Skill;
  onClick?: () => void;
}) {
  const progressPercentage = (skill.level / skill.maxLevel) * 100;

  return (
    <button
      onClick={onClick}
      disabled={!skill.unlocked}
      className={cn(
        'p-3 rounded-lg border-2 text-left w-full',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        skill.unlocked
          ? 'bg-stone-800/50 border-stone-700/50 hover:border-stone-600'
          : 'bg-stone-900/30 border-stone-800/30 opacity-50'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={cn('text-sm font-medium', skill.unlocked ? 'text-stone-200' : 'text-stone-600')}>
          {skill.name}
        </span>
        <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
          Lv.{skill.level}/{skill.maxLevel}
        </span>
      </div>
      <p className="text-xs text-stone-500 mb-2 line-clamp-2">{skill.description}</p>
      <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </button>
  );
}

export function StatsScreen({
  open = false,
  onClose,
  character,
  equipment,
  statusEffects = [],
  skills = [],
  onEquipmentClick,
  onSkillClick,
  className,
  testID,
}: StatsScreenProps) {
  const [activeTab, setActiveTab] = React.useState<StatsTab>('stats');

  // Default character stats
  const stats: CharacterStats = character || {
    name: 'Unknown',
    level: 1,
    xp: 0,
    xpToNext: 100,
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    attack: 10,
    defense: 5,
    speed: 5,
    gold: 0,
  };

  // Default equipment
  const equip: Equipment = equipment || {
    weapon: null,
    offhand: null,
    head: null,
    body: null,
    accessory: null,
  };

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col bg-stone-950"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b border-amber-800/30 bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-700/30 border-2 border-amber-600/50 flex items-center justify-center">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-200">{stats.name}</h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-400">
                <span>Level {stats.level}</span>
                <span className="text-stone-600">|</span>
                <span>
                  {stats.xp}/{stats.xpToNext} XP
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400">
              <CoinIcon className="w-4 h-4" />
              <span className="font-bold text-sm sm:text-base">${stats.gold}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* XP Progress Bar */}
        <div className="px-3 sm:px-4 py-2 bg-stone-900/30">
          <ProgressBar value={stats.xp} max={stats.xpToNext} color="amber" size="sm" />
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-4 py-2 border-b border-stone-800/50">
          <TabGroup
            tabs={STAT_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as StatsTab)}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Vital Stats */}
              <div className="bg-stone-900/50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wide">
                  Vitals
                </h3>
                <StatRow
                  label="Health"
                  value={stats.health}
                  max={stats.maxHealth}
                  showBar
                  barColor="red"
                />
                <StatRow
                  label="Stamina"
                  value={stats.stamina}
                  max={stats.maxStamina}
                  showBar
                  barColor="green"
                />
              </div>

              {/* Combat Stats */}
              <div className="bg-stone-900/50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wide">
                  Combat
                </h3>
                <StatRow label="Attack" value={stats.attack} />
                <StatRow label="Defense" value={stats.defense} />
                <StatRow label="Speed" value={stats.speed} />
              </div>

              {/* Status Effects */}
              {statusEffects.length > 0 && (
                <div className="bg-stone-900/50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wide">
                    Status Effects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {statusEffects.map((effect) => (
                      <div
                        key={effect.id}
                        className={cn(
                          'px-2 py-1 rounded-lg border text-xs font-medium',
                          effect.isPositive
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        )}
                      >
                        {effect.name}
                        {effect.duration && <span className="text-stone-500 ml-1">({effect.duration}s)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-2">
              {EQUIPMENT_SLOTS.map((slot) => (
                <EquipmentSlot
                  key={slot.id}
                  slot={slot}
                  item={equip[slot.id]}
                  onClick={() => onEquipmentClick?.(slot.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-2">
              {skills.length === 0 ? (
                <div className="text-center text-stone-500 py-12">
                  <p className="text-sm">No skills learned yet</p>
                  <p className="text-xs mt-1">Level up to unlock new abilities</p>
                </div>
              ) : (
                skills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onClick={() => onSkillClick?.(skill.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MenuOverlay>
  );
}

StatsScreen.displayName = 'StatsScreen';

export default StatsScreen;
