/**
 * InventoryPanel - Full-screen inventory overlay
 *
 * Ported from legacy/angular-ui/inventory-panel.component.ts
 * to React Native with NativeWind styling and Zustand store.
 */

import * as React from 'react';
import { Modal, Pressable, View, Platform } from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutRight,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/utils';
import { gameStore } from '@/src/game/store';
import { getItem } from '@/src/game/data/items';
import {
  getItemTypeName,
  type ItemType,
} from '@/src/game/data/schemas/item';
import type {
  EquipmentSlot,
  EquipmentState,
  InventoryItem,
} from '@/src/game/store/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type FilterCategory = 'all' | 'weapon' | 'armor' | 'consumable' | 'key_item';

const FILTER_TABS: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'weapon', label: 'Weapons' },
  { value: 'consumable', label: 'Consumables' },
  { value: 'armor', label: 'Gear' },
  { value: 'key_item', label: 'Quest' },
];

const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string }[] = [
  { slot: 'weapon', label: 'Weapon' },
  { slot: 'head', label: 'Hat' },
  { slot: 'body', label: 'Duster' },
  { slot: 'accessory', label: 'Accessory' },
  { slot: 'offhand', label: 'Offhand' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rarityBadgeVariant(rarity: string) {
  switch (rarity) {
    case 'legendary':
      return 'warning' as const;
    case 'rare':
      return 'info' as const;
    case 'uncommon':
      return 'success' as const;
    default:
      return 'default' as const;
  }
}

function rarityBorderColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'border-frontier-whiskey/60';
    case 'rare':
      return 'border-frontier-sky/40';
    case 'uncommon':
      return 'border-frontier-sage/40';
    default:
      return 'border-frontier-leather/40';
  }
}

function conditionColor(condition: number): string {
  if (condition > 50) return 'text-frontier-sage';
  if (condition > 25) return 'text-frontier-whiskey';
  return 'text-frontier-blood';
}

function isItemEquipped(
  equipment: EquipmentState,
  instanceId: string,
): boolean {
  return Object.values(equipment).includes(instanceId);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header bar with title, slot/weight counters, and close button */
function PanelHeader({
  itemCount,
  maxSlots,
  totalWeight,
  maxWeight,
  gold,
  onClose,
}: {
  itemCount: number;
  maxSlots: number;
  totalWeight: number;
  maxWeight: number;
  gold: number;
  onClose: () => void;
}) {
  const isOverweight = totalWeight > maxWeight;

  return (
    <View className="px-4 pt-4 pb-3 border-b border-frontier-leather/30">
      {/* Top row: title + close */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          variant="subheading"
          className="text-frontier-dust font-heading"
        >
          Saddlebag
        </Text>
        <Pressable
          onPress={onClose}
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          accessibilityLabel="Close inventory"
          accessibilityRole="button"
        >
          <Text className="text-frontier-dust/60 text-lg font-bold">
            X
          </Text>
        </Pressable>
      </View>

      {/* Stats row: gold, slots, weight */}
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-frontier-whiskey" />
          <Text className="text-frontier-whiskey font-bold text-sm font-data">
            ${gold}
          </Text>
        </View>

        <Text className="text-frontier-dust/60 text-xs font-data">
          {itemCount}/{maxSlots} slots
        </Text>

        <View
          className={cn(
            'px-2 py-0.5 rounded',
            isOverweight
              ? 'bg-frontier-blood/20'
              : 'bg-frontier-leather/20',
          )}
        >
          <Text
            className={cn(
              'text-xs font-data',
              isOverweight ? 'text-frontier-blood' : 'text-frontier-dust/60',
            )}
          >
            {totalWeight.toFixed(1)}/{maxWeight} lbs
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Equipment slots strip */
function EquipmentStrip({
  equipment,
  inventory,
  onUnequip,
}: {
  equipment: EquipmentState;
  inventory: InventoryItem[];
  onUnequip: (slot: EquipmentSlot) => void;
}) {
  return (
    <View className="px-4 py-3 border-b border-frontier-leather/30 bg-frontier-night/50">
      <Text className="text-frontier-dust/50 text-xs font-heading mb-2 uppercase tracking-wider">
        Equipment
      </Text>
      <ScrollArea horizontal className="flex-none">
        <View className="flex-row gap-2">
          {EQUIPMENT_SLOTS.map(({ slot, label }) => {
            const equippedId = equipment[slot];
            const item = equippedId
              ? inventory.find((i) => i.id === equippedId)
              : null;
            const def = item ? getItem(item.itemId) : null;

            return (
              <Pressable
                key={slot}
                onPress={() => {
                  if (equippedId) onUnequip(slot);
                }}
                className={cn(
                  'min-h-[44px] min-w-[72px] px-2 py-1.5 rounded-md border items-center justify-center',
                  item
                    ? 'border-frontier-brass/40 bg-frontier-leather/20'
                    : 'border-frontier-iron/30 bg-frontier-gunmetal/30',
                )}
                accessibilityLabel={`${label} slot${item ? `: ${item.name}` : ': empty'}`}
              >
                <Text className="text-frontier-dust/40 text-[10px] font-data uppercase mb-0.5">
                  {label}
                </Text>
                {item ? (
                  <Text
                    className="text-frontier-dust text-xs font-body"
                    numberOfLines={1}
                  >
                    {def?.name ?? item.name}
                  </Text>
                ) : (
                  <Text className="text-frontier-iron text-[10px] font-body">
                    --
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollArea>
    </View>
  );
}

/** Single item cell in the grid */
function ItemCell({
  item,
  isSelected,
  isEquipped,
  onSelect,
}: {
  item: InventoryItem;
  isSelected: boolean;
  isEquipped: boolean;
  onSelect: () => void;
}) {
  const def = getItem(item.itemId);

  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'min-h-[44px] rounded-md border p-2',
        'bg-frontier-gunmetal/40',
        rarityBorderColor(item.rarity),
        isSelected && 'ring-2 ring-frontier-brass/60 border-frontier-brass/60',
      )}
      accessibilityLabel={`${def?.name ?? item.name}, quantity ${item.quantity}`}
      accessibilityRole="button"
    >
      {/* Icon placeholder + name row */}
      <View className="flex-row items-center gap-2">
        {/* Placeholder icon square */}
        <View
          className={cn(
            'w-8 h-8 rounded items-center justify-center',
            'bg-frontier-leather/30 border border-frontier-iron/20',
          )}
        >
          <Text className="text-frontier-dust/40 text-xs font-data">
            {(item.type as string).charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-frontier-dust text-xs font-body font-semibold"
            numberOfLines={1}
          >
            {def?.name ?? item.name}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text className="text-frontier-dust/40 text-[10px] font-data">
              x{item.quantity}
            </Text>
            {isEquipped && (
              <Badge variant="info" className="px-1.5 py-0">
                <Text className="text-[9px]">E</Text>
              </Badge>
            )}
          </View>
        </View>

        <Badge variant={rarityBadgeVariant(item.rarity)} className="px-1.5">
          <Text className="text-[9px] capitalize">{item.rarity}</Text>
        </Badge>
      </View>
    </Pressable>
  );
}

/** Item detail card */
function ItemDetail({
  item,
  equipment,
  onUse,
  onEquip,
  onDrop,
}: {
  item: InventoryItem;
  equipment: EquipmentState;
  onUse: (id: string) => void;
  onEquip: (id: string) => void;
  onDrop: (id: string) => void;
}) {
  const def = getItem(item.itemId);
  const equipped = isItemEquipped(equipment, item.id);
  const canEquip = item.type === 'weapon' || item.type === 'armor';

  return (
    <Card className="border-frontier-leather/40 bg-frontier-gunmetal/60">
      <CardContent className="p-3">
        {/* Name + rarity */}
        <View className="mb-2">
          <Text className="text-frontier-dust font-heading font-bold text-sm mb-1">
            {def?.name ?? item.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Badge variant={rarityBadgeVariant(item.rarity)}>
              <Text className="text-xs capitalize">{item.rarity}</Text>
            </Badge>
            {equipped && (
              <Badge variant="info">
                <Text className="text-xs">Equipped</Text>
              </Badge>
            )}
          </View>
        </View>

        {/* Description */}
        <Text className="text-frontier-dust/60 text-xs font-body leading-relaxed mb-3">
          {def?.description ?? item.description ?? 'No description available.'}
        </Text>

        <Separator className="bg-frontier-leather/30 mb-3" />

        {/* Stats */}
        <View className="gap-1.5 mb-3">
          <StatRow label="Type" value={getItemTypeName(item.type as ItemType)} />
          <StatRow
            label="Weight"
            value={`${item.weight} lbs`}
          />
          {item.type === 'weapon' && (
            <>
              <StatRow
                label="Condition"
                value={`${item.condition}%`}
                valueClassName={conditionColor(item.condition)}
              />
              {def?.weaponStats && (
                <>
                  <StatRow
                    label="Damage"
                    value={String(def.weaponStats.damage)}
                    valueClassName="text-frontier-blood"
                  />
                  <StatRow
                    label="Range"
                    value={`${def.weaponStats.range}m`}
                  />
                  <StatRow
                    label="Accuracy"
                    value={`${def.weaponStats.accuracy}%`}
                  />
                </>
              )}
            </>
          )}
          {item.type === 'consumable' && def?.consumableStats && (
            <>
              {def.consumableStats.healAmount > 0 && (
                <StatRow
                  label="Heals"
                  value={`+${def.consumableStats.healAmount} HP`}
                  valueClassName="text-frontier-sage"
                />
              )}
              {def.consumableStats.staminaAmount > 0 && (
                <StatRow
                  label="Stamina"
                  value={`+${def.consumableStats.staminaAmount}`}
                  valueClassName="text-frontier-sky"
                />
              )}
            </>
          )}
          {item.type === 'armor' && def?.armorStats && (
            <>
              <StatRow
                label="Defense"
                value={String(def.armorStats.defense)}
                valueClassName="text-frontier-sky"
              />
              <StatRow
                label="Slot"
                value={def.armorStats.slot}
              />
            </>
          )}
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          {item.usable && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-frontier-sage/40 bg-frontier-sage/10"
              onPress={() => onUse(item.id)}
            >
              <Text className="text-frontier-sage text-xs font-body">
                Use
              </Text>
            </Button>
          )}
          {canEquip && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'flex-1',
                equipped
                  ? 'border-frontier-iron/30 bg-frontier-iron/10 opacity-50'
                  : 'border-frontier-sky/40 bg-frontier-sky/10',
              )}
              onPress={() => onEquip(item.id)}
              disabled={equipped}
            >
              <Text
                className={cn(
                  'text-xs font-body',
                  equipped ? 'text-frontier-iron' : 'text-frontier-sky',
                )}
              >
                {equipped ? 'Equipped' : 'Equip'}
              </Text>
            </Button>
          )}
          {item.droppable && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-frontier-blood/30 bg-frontier-blood/10"
              onPress={() => onDrop(item.id)}
            >
              <Text className="text-frontier-blood text-xs font-body">
                Drop
              </Text>
            </Button>
          )}
        </View>
      </CardContent>
    </Card>
  );
}

/** Stat row for detail view */
function StatRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-frontier-dust/40 text-[11px] font-data">
        {label}
      </Text>
      <Text
        className={cn(
          'text-frontier-dust text-[11px] font-data',
          valueClassName,
        )}
      >
        {value}
      </Text>
    </View>
  );
}

/** Empty detail placeholder */
function EmptyDetail() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-frontier-iron text-sm font-body mb-1">
        No item selected
      </Text>
      <Text className="text-frontier-iron/60 text-xs font-body">
        Tap an item to see details
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface InventoryPanelProps {
  /** Whether the panel is visible */
  visible: boolean;
  /** Called when the panel should close */
  onClose: () => void;
}

export function InventoryPanel({ visible, onClose }: InventoryPanelProps) {
  const [activeTab, setActiveTab] = React.useState<FilterCategory>('all');
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null,
  );

  // --- Store selectors ---
  const inventory = gameStore((s) => s.inventory);
  const equipment = gameStore((s) => s.equipment);
  const gold = gameStore((s) => s.playerStats.gold);
  const maxSlots = gameStore((s) => s.maxInventorySlots);
  const maxWeight = gameStore((s) => s.maxCarryWeight);

  // --- Store actions ---
  const useItem = gameStore((s) => s.useItem);
  const dropItem = gameStore((s) => s.dropItem);
  const equipItem = gameStore((s) => s.equipItem);
  const unequipItem = gameStore((s) => s.unequipItem);

  // --- Derived values ---
  const totalWeight = React.useMemo(
    () => inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0),
    [inventory],
  );

  const filteredItems = React.useMemo(() => {
    if (activeTab === 'all') return inventory;
    return inventory.filter((item) => item.type === activeTab);
  }, [inventory, activeTab]);

  const selectedItem = React.useMemo(
    () =>
      selectedItemId
        ? inventory.find((i) => i.id === selectedItemId) ?? null
        : null,
    [inventory, selectedItemId],
  );

  // Clear selection when switching tabs
  React.useEffect(() => {
    setSelectedItemId(null);
  }, [activeTab]);

  // Clear selection if the selected item is removed from inventory
  React.useEffect(() => {
    if (
      selectedItemId &&
      !inventory.some((i) => i.id === selectedItemId)
    ) {
      setSelectedItemId(null);
    }
  }, [inventory, selectedItemId]);

  // --- Handlers ---
  const handleUse = React.useCallback(
    (id: string) => {
      useItem(id);
    },
    [useItem],
  );

  const handleEquip = React.useCallback(
    (id: string) => {
      equipItem(id);
    },
    [equipItem],
  );

  const handleDrop = React.useCallback(
    (id: string) => {
      dropItem(id);
      if (selectedItemId === id) setSelectedItemId(null);
    },
    [dropItem, selectedItemId],
  );

  const handleUnequip = React.useCallback(
    (slot: EquipmentSlot) => {
      unequipItem(slot);
    },
    [unequipItem],
  );

  const handleSelectItem = React.useCallback(
    (item: InventoryItem) => {
      setSelectedItemId((prev) => (prev === item.id ? null : item.id));
    },
    [],
  );

  // Tab counts for labels
  const tabCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: inventory.length };
    for (const item of inventory) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [inventory]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <View className="absolute inset-0 bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
      </View>

      {/* Panel */}
      <Animated.View
        entering={
          Platform.OS !== 'web'
            ? SlideInRight.duration(300).springify()
            : FadeIn.duration(200)
        }
        exiting={
          Platform.OS !== 'web'
            ? SlideOutRight.duration(250)
            : FadeOut.duration(150)
        }
        className="absolute inset-0 bg-frontier-night"
      >
        {/* Header */}
        <PanelHeader
          itemCount={inventory.length}
          maxSlots={maxSlots}
          totalWeight={totalWeight}
          maxWeight={maxWeight}
          gold={gold}
          onClose={onClose}
        />

        {/* Equipment strip */}
        <EquipmentStrip
          equipment={equipment}
          inventory={inventory}
          onUnequip={handleUnequip}
        />

        {/* Tab bar + content */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterCategory)}
          className="flex-1"
        >
          <TabsList className="mx-4 mt-3 bg-frontier-gunmetal/50">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Text className="text-xs font-body">
                  {tab.label}
                  {tabCounts[tab.value]
                    ? ` (${tabCounts[tab.value]})`
                    : ''}
                </Text>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Shared content area for all tabs (filtered by activeTab) */}
          {FILTER_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="flex-1">
              <View className="flex-1 flex-row">
                {/* Item grid */}
                <ScrollArea className="flex-1 px-4 pt-3 pb-4">
                  <View className="flex-row flex-wrap gap-2">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <View key={item.id} className="w-[48%]">
                          <ItemCell
                            item={item}
                            isSelected={selectedItemId === item.id}
                            isEquipped={isItemEquipped(equipment, item.id)}
                            onSelect={() => handleSelectItem(item)}
                          />
                        </View>
                      ))
                    ) : (
                      <View className="flex-1 items-center py-12">
                        <Text className="text-frontier-iron text-sm font-body">
                          No items
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Detail card (inline on mobile) */}
                  {selectedItem && (
                    <View className="mt-4">
                      <ItemDetail
                        item={selectedItem}
                        equipment={equipment}
                        onUse={handleUse}
                        onEquip={handleEquip}
                        onDrop={handleDrop}
                      />
                    </View>
                  )}

                  {!selectedItem && filteredItems.length > 0 && (
                    <EmptyDetail />
                  )}
                </ScrollArea>
              </View>
            </TabsContent>
          ))}
        </Tabs>
      </Animated.View>
    </Modal>
  );
}

export default InventoryPanel;
