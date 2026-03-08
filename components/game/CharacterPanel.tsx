/**
 * CharacterPanel - Full-screen player stats, equipment, and faction reputation view.
 *
 * Ported from legacy/angular-ui/character-panel.component.ts
 */

import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { cn } from '@/lib/utils';
import {
  Text,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  ScrollArea,
  Separator,
} from '@/components/ui';
import { gameStore } from '@/src/game/store/webGameStore';
import type { EquipmentSlot, InventoryItem } from '@/src/game/store/types';
import { getRarityColor } from '@/src/game/data/schemas/item';
import { getItem } from '@/src/game/data/items';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'weapon', label: 'Main Weapon', icon: '\u{1F52B}' },
  { slot: 'offhand', label: 'Sidearm', icon: '\u{1F5E1}' },
  { slot: 'head', label: 'Hat', icon: '\u{1F3A9}' },
  { slot: 'body', label: 'Vest', icon: '\u{1F9E5}' },
  { slot: 'accessory', label: 'Accessory', icon: '\u{1F48D}' },
];

/** Simplified faction list for the character panel. */
const DISPLAY_FACTIONS = [
  { id: 'law_enforcement', label: 'Lawmen' },
  { id: 'desperados', label: 'Outlaws' },
  { id: 'mining_consortium', label: 'Miners' },
  { id: 'cattle_barons', label: 'Ranchers' },
  { id: 'railroad_company', label: 'Railroad' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getReputationColor(rep: number): {
  label: string;
  textClass: string;
  barClass: string;
} {
  if (rep >= 60) return { label: 'Allied', textClass: 'text-yellow-400', barClass: 'bg-yellow-500' };
  if (rep >= 20) return { label: 'Friendly', textClass: 'text-green-400', barClass: 'bg-green-500' };
  if (rep >= -9) return { label: 'Neutral', textClass: 'text-gray-400', barClass: 'bg-gray-500' };
  if (rep >= -30) return { label: 'Unfriendly', textClass: 'text-orange-400', barClass: 'bg-orange-500' };
  return { label: 'Hostile', textClass: 'text-red-400', barClass: 'bg-red-500' };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatBar({
  label,
  current,
  max,
  variant,
}: {
  label: string;
  current: number;
  max: number;
  variant?: 'health' | 'xp' | 'default';
}) {
  const pct = max > 0 ? (current / max) * 100 : 0;
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text variant="small" className="text-muted-foreground">
          {label}
        </Text>
        <Text variant="small" className="text-foreground">
          {Math.round(current)}/{max}
        </Text>
      </View>
      <Progress value={pct} variant={variant ?? 'default'} />
    </View>
  );
}

function EquipmentSlotRow({
  slot,
  label,
  icon,
  item,
  onUnequip,
}: {
  slot: EquipmentSlot;
  label: string;
  icon: string;
  item: InventoryItem | null;
  onUnequip: (slot: EquipmentSlot) => void;
}) {
  const itemDef = item ? getItem(item.itemId) : null;
  const rarityColor = itemDef ? getRarityColor(itemDef.rarity ?? 'common') : undefined;

  return (
    <Pressable
      className={cn(
        'flex-row items-center gap-3 rounded-md border border-border/50 bg-muted/30 px-3 py-2.5',
        item && 'active:bg-muted/60',
      )}
      onPress={() => item && onUnequip(slot)}
    >
      <Text className="text-lg">{icon}</Text>
      <View className="flex-1">
        <Text variant="caption" className="text-muted-foreground">
          {label}
        </Text>
        {item ? (
          <Text
            variant="small"
            style={rarityColor ? { color: rarityColor } : undefined}
          >
            {item.name}
          </Text>
        ) : (
          <Text variant="small" className="text-muted-foreground/50 italic">
            Empty
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function FactionReputationRow({
  factionId,
  label,
  reputation,
}: {
  factionId: string;
  label: string;
  reputation: number;
}) {
  const { label: tierLabel, textClass, barClass } = getReputationColor(reputation);
  // Normalize reputation from -100..100 to 0..100 for the bar
  const barPercent = ((reputation + 100) / 200) * 100;

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text variant="small" className="text-foreground">
          {label}
        </Text>
        <Text variant="caption" className={textClass}>
          {tierLabel}
        </Text>
      </View>
      <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <View
          className={cn('h-full rounded-full', barClass)}
          style={{ width: `${Math.max(2, barPercent)}%` }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CharacterPanel() {
  const isOpen = gameStore((s) => s.activePanel === 'character');
  const playerStats = gameStore((s) => s.playerStats);
  const playerName = gameStore((s) => s.playerName);
  const equipment = gameStore((s) => s.equipment);
  const togglePanel = gameStore((s) => s.togglePanel);
  const getEquippedItem = gameStore((s) => s.getEquippedItem);
  const unequipItem = gameStore((s) => s.unequipItem);
  const getEquipmentBonuses = gameStore((s) => s.getEquipmentBonuses);

  const bonuses = React.useMemo(() => getEquipmentBonuses(), [equipment, getEquipmentBonuses]);

  if (!isOpen) return null;

  return (
    <Modal transparent visible={isOpen} onRequestClose={() => togglePanel('character')}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 bg-black/70"
      >
        <View className="flex-1 px-4 py-12">
          <Card className="flex-1 border-frontier-leather/40">
            {/* Header */}
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                <Text variant="subheading">{playerName || 'Stranger'}</Text>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => togglePanel('character')}
              >
                <Text variant="small">Close</Text>
              </Button>
            </CardHeader>

            <ScrollArea className="flex-1" contentContainerClassName="pb-6">
              <CardContent className="gap-6">
                {/* ----- Player Stats ----- */}
                <View className="gap-3">
                  <Text variant="label" className="text-muted-foreground uppercase tracking-widest">
                    Vitals
                  </Text>

                  <View className="flex-row items-center gap-4">
                    <Badge variant="info">
                      <Text>Lv. {playerStats.level}</Text>
                    </Badge>
                    <Text variant="caption" className="text-foreground">
                      {playerStats.gold} Gold
                    </Text>
                  </View>

                  <StatBar
                    label="Health"
                    current={playerStats.health}
                    max={playerStats.maxHealth}
                    variant="health"
                  />
                  <StatBar
                    label="Stamina"
                    current={playerStats.stamina}
                    max={playerStats.maxStamina}
                  />
                  <StatBar
                    label="Experience"
                    current={playerStats.xp}
                    max={playerStats.xpToNext}
                    variant="xp"
                  />
                </View>

                <Separator />

                {/* ----- Equipment Bonuses ----- */}
                {(bonuses.damage > 0 || bonuses.defense > 0 || bonuses.accuracy > 0) && (
                  <>
                    <View className="flex-row gap-4">
                      {bonuses.damage > 0 && (
                        <Badge variant="danger">
                          <Text>+{bonuses.damage} DMG</Text>
                        </Badge>
                      )}
                      {bonuses.defense > 0 && (
                        <Badge variant="info">
                          <Text>+{bonuses.defense} DEF</Text>
                        </Badge>
                      )}
                      {bonuses.accuracy > 0 && (
                        <Badge variant="success">
                          <Text>+{bonuses.accuracy} ACC</Text>
                        </Badge>
                      )}
                    </View>
                    <Separator />
                  </>
                )}

                {/* ----- Equipment Slots ----- */}
                <View className="gap-3">
                  <Text variant="label" className="text-muted-foreground uppercase tracking-widest">
                    Equipment
                  </Text>
                  {EQUIPMENT_SLOTS.map(({ slot, label, icon }) => (
                    <EquipmentSlotRow
                      key={slot}
                      slot={slot}
                      label={label}
                      icon={icon}
                      item={getEquippedItem(slot)}
                      onUnequip={unequipItem}
                    />
                  ))}
                </View>

                <Separator />

                {/* ----- Faction Reputation ----- */}
                <View className="gap-3">
                  <Text variant="label" className="text-muted-foreground uppercase tracking-widest">
                    Reputation
                  </Text>
                  {DISPLAY_FACTIONS.map(({ id, label }) => (
                    <FactionReputationRow
                      key={id}
                      factionId={id}
                      label={label}
                      reputation={playerStats.reputation ?? 0}
                    />
                  ))}
                </View>
              </CardContent>
            </ScrollArea>
          </Card>
        </View>
      </Animated.View>
    </Modal>
  );
}
