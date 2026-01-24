/**
 * CharacterPanel - Player stats and equipment display
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useGameStore, type EquipmentSlot } from '../store/gameStore';
import { getItem } from '../../data/items/index';
import { getRarityColor } from '../../data/schemas/item';

// ============================================================================
// EQUIPMENT SLOT DISPLAY
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
  const { getEquippedItem, unequipItem, inventory, equipItem } = useGameStore();
  const equippedItem = getEquippedItem(slot);

  // Get item details
  const itemDef = equippedItem ? getItem(equippedItem.itemId) : null;

  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 flex items-center justify-center text-amber-500">
          {icon}
        </div>
        <span className="text-xs text-stone-400 uppercase">{label}</span>
      </div>

      {equippedItem ? (
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: getRarityColor(equippedItem.rarity) }}
            >
              {equippedItem.name}
            </div>
            {itemDef?.weaponStats && (
              <div className="text-xs text-stone-400">
                DMG: {itemDef.weaponStats.damage} | ACC: {itemDef.weaponStats.accuracy}%
              </div>
            )}
            {itemDef?.armorStats && (
              <div className="text-xs text-stone-400">
                DEF: {itemDef.armorStats.defense}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => unequipItem(slot)}
            className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30"
          >
            X
          </Button>
        </div>
      ) : (
        <div className="text-xs text-stone-500 italic">Empty</div>
      )}
    </div>
  );
}

// ============================================================================
// STAT BAR
// ============================================================================

function StatBar({
  label,
  current,
  max,
  color,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
}) {
  const percentage = Math.round((current / max) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-stone-300">{label}</span>
        <span className="text-stone-400">
          {current} / {max}
        </span>
      </div>
      <Progress value={percentage} className={cn('h-2', color)} />
    </div>
  );
}

// ============================================================================
// MAIN CHARACTER PANEL
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

  return (
    <Sheet open={isOpen} onOpenChange={() => togglePanel('character')}>
      <SheetContent side="left" className="w-80 bg-amber-950 border-amber-700">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-amber-100 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {playerName}
          </SheetTitle>
        </SheetHeader>

        {/* Level & XP */}
        <Card className="bg-stone-900/50 border-stone-700 mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-amber-600 text-amber-100">
                Level {playerStats.level}
              </Badge>
              <span className="text-xs text-stone-400">
                {playerStats.xp} / {playerStats.xpToNext} XP
              </span>
            </div>
            <Progress
              value={(playerStats.xp / playerStats.xpToNext) * 100}
              className="h-2 bg-stone-800"
            />
          </CardContent>
        </Card>

        {/* Vital Stats */}
        <Card className="bg-stone-900/50 border-stone-700 mb-4">
          <CardContent className="p-3 space-y-3">
            <StatBar
              label="Health"
              current={playerStats.health}
              max={playerStats.maxHealth}
              color="[&>div]:bg-red-500"
            />
            <StatBar
              label="Stamina"
              current={playerStats.stamina}
              max={playerStats.maxStamina}
              color="[&>div]:bg-green-500"
            />
          </CardContent>
        </Card>

        {/* Combat Stats */}
        <Card className="bg-stone-900/50 border-stone-700 mb-4">
          <CardContent className="p-3">
            <div className="text-xs text-stone-400 uppercase mb-2">
              Combat Stats
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-stone-800/50 rounded p-2">
                <div className="text-red-400 font-bold text-lg">
                  {bonuses.damage}
                </div>
                <div className="text-xs text-stone-400">Damage</div>
              </div>
              <div className="bg-stone-800/50 rounded p-2">
                <div className="text-blue-400 font-bold text-lg">
                  {bonuses.defense}
                </div>
                <div className="text-xs text-stone-400">Defense</div>
              </div>
              <div className="bg-stone-800/50 rounded p-2">
                <div className="text-yellow-400 font-bold text-lg">
                  {bonuses.accuracy}%
                </div>
                <div className="text-xs text-stone-400">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Slots */}
        <Card className="bg-stone-900/50 border-stone-700">
          <CardContent className="p-3">
            <div className="text-xs text-stone-400 uppercase mb-2">
              Equipment
            </div>
            <div className="space-y-2">
              <EquipmentSlotDisplay
                slot="weapon"
                label="Main Weapon"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6l3-7z" />
                  </svg>
                }
              />
              <EquipmentSlotDisplay
                slot="offhand"
                label="Sidearm"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              />
              <EquipmentSlotDisplay
                slot="head"
                label="Head"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="5" strokeWidth={2} fill="none" />
                    <path strokeLinecap="round" strokeWidth={2} d="M7 13v7h10v-7" />
                  </svg>
                }
              />
              <EquipmentSlotDisplay
                slot="body"
                label="Body Armor"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                }
              />
              <EquipmentSlotDisplay
                slot="accessory"
                label="Accessory"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                    <path strokeWidth={2} d="M12 2v3m0 14v3m10-10h-3M5 12H2m15.36-5.36l-2.12 2.12M8.76 15.24l-2.12 2.12m12.72 0l-2.12-2.12M8.76 8.76L6.64 6.64" />
                  </svg>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Reputation */}
        <div className="mt-4 p-3 bg-stone-900/30 rounded border border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-300">Reputation</span>
            <span
              className={cn(
                'font-bold',
                playerStats.reputation >= 50
                  ? 'text-green-400'
                  : playerStats.reputation >= 0
                  ? 'text-amber-400'
                  : 'text-red-400'
              )}
            >
              {playerStats.reputation}
            </span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {playerStats.reputation >= 50
              ? 'Respected'
              : playerStats.reputation >= 20
              ? 'Known'
              : playerStats.reputation >= 0
              ? 'Neutral'
              : playerStats.reputation >= -20
              ? 'Suspicious'
              : 'Notorious'}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CharacterPanel;
