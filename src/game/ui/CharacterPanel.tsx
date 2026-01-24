/**
 * CharacterPanel - Player stats and equipment display
 * Western-themed "Outlaw" character sheet
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useGameStore, type EquipmentSlot } from '../store/gameStore';
import { getItem } from '../../data/items/index';
import { getRarityColor } from '../../data/schemas/item';

// ============================================================================
// ICONS
// ============================================================================

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function SwordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" />
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

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <circle cx="12" cy="12" r="6" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" strokeWidth={2} />
    </svg>
  );
}

function GunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8h18v4H9l-3 3v-3H3V8z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12v4" />
    </svg>
  );
}

function HatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="17" rx="10" ry="3" strokeWidth={2} />
      <path strokeWidth={2} d="M7 17v-5a5 5 0 0110 0v5" />
    </svg>
  );
}

function VestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 2h12l-2 8v12H8V10L6 2z" />
      <path strokeWidth={2} d="M10 2v4M14 2v4" />
    </svg>
  );
}

function RingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="14" r="6" strokeWidth={2} />
      <path strokeWidth={2} d="M12 8V2M9 4h6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ============================================================================
// STAT BAR
// ============================================================================

function StatBar({
  label,
  current,
  max,
  icon,
  barColor,
  textColor,
}: {
  label: string;
  current: number;
  max: number;
  icon: React.ReactNode;
  barColor: string;
  textColor: string;
}) {
  const percentage = Math.round((current / max) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-amber-300">{label}</span>
        </div>
        <span className={cn('font-mono font-medium', textColor)}>
          {current} / {max}
        </span>
      </div>
      <div className="h-2.5 bg-amber-900/50 rounded-full overflow-hidden border border-amber-700/30">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EQUIPMENT SLOT
// ============================================================================

function EquipmentSlotDisplay({
  slot,
  label,
  icon,
}: {
  slot: EquipmentSlot;
  label: string;
  icon: React.ReactNode;
}) {
  const { getEquippedItem, unequipItem } = useGameStore();
  const equippedItem = getEquippedItem(slot);
  const itemDef = equippedItem ? getItem(equippedItem.itemId) : null;

  return (
    <div className="bg-amber-900/30 border border-amber-800/40 rounded-lg p-2.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 flex items-center justify-center text-amber-500">
          {icon}
        </div>
        <span className="text-[10px] text-amber-500/70 uppercase tracking-wider">{label}</span>
      </div>

      {equippedItem ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: getRarityColor(equippedItem.rarity) }}
            >
              {equippedItem.name}
            </div>
            {itemDef?.weaponStats && (
              <div className="flex items-center gap-2 text-[10px] text-amber-500/70 mt-0.5">
                <span className="text-red-400">DMG {itemDef.weaponStats.damage}</span>
                <span className="text-amber-400">ACC {itemDef.weaponStats.accuracy}%</span>
              </div>
            )}
            {itemDef?.armorStats && (
              <div className="text-[10px] text-blue-400 mt-0.5">
                DEF {itemDef.armorStats.defense}
              </div>
            )}
          </div>
          <button
            onClick={() => unequipItem(slot)}
            className="p-1 rounded hover:bg-red-900/40 text-red-400/60 hover:text-red-400 transition-colors"
            title="Unequip"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-xs text-amber-600/40 italic">Empty</div>
      )}
    </div>
  );
}

// ============================================================================
// COMBAT STAT CARD
// ============================================================================

function CombatStatCard({
  label,
  value,
  icon,
  textColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  textColor: string;
}) {
  return (
    <div className="bg-amber-900/30 border border-amber-800/40 rounded-lg p-2.5 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon}
      </div>
      <div className={cn('text-xl font-bold', textColor)}>{value}</div>
      <div className="text-[10px] text-amber-500/60 uppercase">{label}</div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CharacterPanel() {
  const {
    activePanel,
    togglePanel,
    playerName,
    playerStats,
    getEquipmentBonuses,
  } = useGameStore();

  const isOpen = activePanel === 'character';
  const bonuses = getEquipmentBonuses();

  // Determine reputation status
  const getReputationStatus = (rep: number) => {
    if (rep >= 50) return { label: 'Respected', color: 'text-green-400', bg: 'bg-green-900/30' };
    if (rep >= 20) return { label: 'Known', color: 'text-lime-400', bg: 'bg-lime-900/30' };
    if (rep >= 0) return { label: 'Neutral', color: 'text-amber-400', bg: 'bg-amber-900/30' };
    if (rep >= -20) return { label: 'Suspicious', color: 'text-orange-400', bg: 'bg-orange-900/30' };
    return { label: 'Notorious', color: 'text-red-400', bg: 'bg-red-900/30' };
  };

  const repStatus = getReputationStatus(playerStats.reputation);

  return (
    <Sheet open={isOpen} onOpenChange={() => togglePanel('character')}>
      <SheetContent side="left" className="w-80 bg-amber-950 border-amber-700">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-amber-100 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {playerName}
          </SheetTitle>
        </SheetHeader>

        {/* Level & XP */}
        <div className="bg-amber-900/30 border border-amber-800/40 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-amber-200 font-bold">Level {playerStats.level}</span>
            </div>
            <span className="text-xs text-amber-400/70 font-mono">
              {playerStats.xp} / {playerStats.xpToNext} XP
            </span>
          </div>
          <div className="h-2 bg-amber-900/50 rounded-full overflow-hidden border border-amber-700/30">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full transition-all duration-300"
              style={{ width: `${(playerStats.xp / playerStats.xpToNext) * 100}%` }}
            />
          </div>
        </div>

        {/* Vital Stats */}
        <div className="bg-amber-900/30 border border-amber-800/40 rounded-lg p-3 mb-4 space-y-3">
          <StatBar
            label="Health"
            current={playerStats.health}
            max={playerStats.maxHealth}
            icon={<HeartIcon className="w-4 h-4 text-red-400" />}
            barColor="bg-gradient-to-r from-red-600 to-red-500"
            textColor="text-red-400"
          />
          <StatBar
            label="Stamina"
            current={playerStats.stamina}
            max={playerStats.maxStamina}
            icon={<BoltIcon className="w-4 h-4 text-green-400" />}
            barColor="bg-gradient-to-r from-green-600 to-green-500"
            textColor="text-green-400"
          />
        </div>

        {/* Combat Stats */}
        <div className="mb-4">
          <div className="text-[10px] text-amber-500/70 uppercase tracking-wider mb-2">
            Combat Stats
          </div>
          <div className="grid grid-cols-3 gap-2">
            <CombatStatCard
              label="Damage"
              value={bonuses.damage}
              icon={<SwordIcon className="w-4 h-4 text-red-400" />}
              textColor="text-red-400"
            />
            <CombatStatCard
              label="Defense"
              value={bonuses.defense}
              icon={<ShieldIcon className="w-4 h-4 text-blue-400" />}
              textColor="text-blue-400"
            />
            <CombatStatCard
              label="Accuracy"
              value={`${bonuses.accuracy}%`}
              icon={<TargetIcon className="w-4 h-4 text-yellow-400" />}
              textColor="text-yellow-400"
            />
          </div>
        </div>

        {/* Equipment Slots */}
        <div className="mb-4">
          <div className="text-[10px] text-amber-500/70 uppercase tracking-wider mb-2">
            Equipment
          </div>
          <div className="space-y-2">
            <EquipmentSlotDisplay
              slot="weapon"
              label="Main Weapon"
              icon={<GunIcon className="w-5 h-5" />}
            />
            <EquipmentSlotDisplay
              slot="offhand"
              label="Sidearm"
              icon={<SwordIcon className="w-5 h-5" />}
            />
            <EquipmentSlotDisplay
              slot="head"
              label="Hat"
              icon={<HatIcon className="w-5 h-5" />}
            />
            <EquipmentSlotDisplay
              slot="body"
              label="Vest"
              icon={<VestIcon className="w-5 h-5" />}
            />
            <EquipmentSlotDisplay
              slot="accessory"
              label="Accessory"
              icon={<RingIcon className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Reputation */}
        <div className={cn(
          'p-3 rounded-lg border',
          repStatus.bg,
          'border-amber-800/40'
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-300">Reputation</span>
            <span className={cn('font-bold font-mono', repStatus.color)}>
              {playerStats.reputation}
            </span>
          </div>
          <div className={cn('text-xs mt-1', repStatus.color)}>
            {repStatus.label}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CharacterPanel;
