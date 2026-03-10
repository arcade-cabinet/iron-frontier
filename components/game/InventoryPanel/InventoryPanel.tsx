/**
 * InventoryPanel - Full-screen inventory overlay (main component).
 */

import * as React from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from "react-native-reanimated";

import { ScrollArea } from "@/components/ui/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Text } from "@/components/ui/Text";
import { gameStore } from "@/src/game/store";
import type { EquipmentSlot, InventoryItem } from "@/src/game/store/types";

import { EquipmentStrip } from "./EquipmentStrip.tsx";
import {
  FILTER_TABS,
  type FilterCategory,
  type InventoryPanelProps,
  isItemEquipped,
} from "./helpers.ts";
import { ItemCell } from "./ItemCell.tsx";
import { EmptyDetail, ItemDetail } from "./ItemDetail.tsx";
import { PanelHeader } from "./PanelHeader.tsx";

export function InventoryPanel({ visible, onClose }: InventoryPanelProps) {
  const [activeTab, setActiveTab] = React.useState<FilterCategory>("all");
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  // Store selectors
  const inventory = gameStore((s) => s.inventory);
  const equipment = gameStore((s) => s.equipment);
  const gold = gameStore((s) => s.playerStats.gold);
  const maxSlots = gameStore((s) => s.maxInventorySlots);
  const maxWeight = gameStore((s) => s.maxCarryWeight);

  // Store actions
  const useItem = gameStore((s) => s.useItem);
  const dropItem = gameStore((s) => s.dropItem);
  const equipItem = gameStore((s) => s.equipItem);
  const unequipItem = gameStore((s) => s.unequipItem);

  // Derived values
  const totalWeight = React.useMemo(
    () => inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0),
    [inventory],
  );

  const filteredItems = React.useMemo(() => {
    if (activeTab === "all") return inventory;
    return inventory.filter((item) => item.type === activeTab);
  }, [inventory, activeTab]);

  const selectedItem = React.useMemo(
    () => (selectedItemId ? (inventory.find((i) => i.id === selectedItemId) ?? null) : null),
    [inventory, selectedItemId],
  );

  React.useEffect(() => {
    setSelectedItemId(null);
  }, [activeTab]);

  React.useEffect(() => {
    if (selectedItemId && !inventory.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [inventory, selectedItemId]);

  const handleUse = React.useCallback(
    (id: string) => {
      // biome-ignore lint/correctness/useHookAtTopLevel: useItem is a store action, not a React hook
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
  const handleSelectItem = React.useCallback((item: InventoryItem) => {
    setSelectedItemId((prev) => (prev === item.id ? null : item.id));
  }, []);

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
      <View className="absolute inset-0 bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
      </View>

      <Animated.View
        entering={
          Platform.OS !== "web" ? SlideInRight.duration(300).springify() : FadeIn.duration(200)
        }
        exiting={Platform.OS !== "web" ? SlideOutRight.duration(250) : FadeOut.duration(150)}
        className="absolute inset-0 bg-frontier-night"
      >
        <PanelHeader
          itemCount={inventory.length}
          maxSlots={maxSlots}
          totalWeight={totalWeight}
          maxWeight={maxWeight}
          gold={gold}
          onClose={onClose}
        />

        <EquipmentStrip equipment={equipment} inventory={inventory} onUnequip={handleUnequip} />

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
                  {tabCounts[tab.value] ? ` (${tabCounts[tab.value]})` : ""}
                </Text>
              </TabsTrigger>
            ))}
          </TabsList>

          {FILTER_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="flex-1">
              <View className="flex-1 flex-row">
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
                        <Text className="text-frontier-iron text-sm font-body">No items</Text>
                      </View>
                    )}
                  </View>

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

                  {!selectedItem && filteredItems.length > 0 && <EmptyDetail />}
                </ScrollArea>
              </View>
            </TabsContent>
          ))}
        </Tabs>
      </Animated.View>
    </Modal>
  );
}
