/**
 * ShopPanel - main component for buy/sell interface.
 */

import * as React from "react";
import { Modal, Platform, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { ScrollArea } from "@/components/ui/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { getItem } from "@/src/game/data/items";
import {
  canSellItemToShop,
  getAvailableShopItems,
  getShopById,
  type ShopDefinition,
  type ShopItem,
} from "@/src/game/data/shops";
import type { InventoryItem } from "@/src/game/store/types";
import { gameStore } from "@/src/game/store/webGameStore";

import { BuyItemRow } from "./BuyItemRow.tsx";
import { ConfirmDialog, EmptyState } from "./ConfirmDialog.tsx";
import type { ConfirmationDialog } from "./helpers.ts";
import { SellItemRow } from "./SellItemRow.tsx";
import { ShopHeader } from "./ShopHeader.tsx";

export function ShopPanel() {
  // Store selectors
  const shopState = gameStore((s) => s.shopState);
  const playerStats = gameStore((s) => s.playerStats);
  const inventory = gameStore((s) => s.inventory);
  const buyItem = gameStore((s) => s.buyItem);
  const sellItem = gameStore((s) => s.sellItem);
  const closeShop = gameStore((s) => s.closeShop);

  // Local state
  const [activeTab, setActiveTab] = React.useState<"buy" | "sell">("buy");
  const [confirmation, setConfirmation] = React.useState<ConfirmationDialog>(null);

  // Derive shop data
  const shop: ShopDefinition | null = React.useMemo(() => {
    if (!shopState?.shopId) return null;
    return getShopById(shopState.shopId) ?? null;
  }, [shopState?.shopId]);

  const availableItems: ShopItem[] = React.useMemo(() => {
    if (!shop) return [];
    return getAvailableShopItems(shop, playerStats.reputation);
  }, [shop, playerStats.reputation]);

  const sellableInventory: InventoryItem[] = React.useMemo(() => {
    return inventory;
  }, [inventory]);

  const sellableCount = React.useMemo(() => {
    if (!shop) return 0;
    return inventory.filter((item) => {
      const def = getItem(item.itemId);
      return def ? canSellItemToShop(shop, item.type) && def.sellable : false;
    }).length;
  }, [inventory, shop]);

  if (!shopState || !shop) return null;

  const handleBuyRequest = (itemId: string, price: number, itemName: string) => {
    setConfirmation({ type: "buy", itemName, price, onConfirm: () => buyItem(itemId) });
  };

  const handleSellRequest = (inventoryId: string, price: number, itemName: string) => {
    setConfirmation({ type: "sell", itemName, price, onConfirm: () => sellItem(inventoryId) });
  };

  const handleClose = () => {
    setConfirmation(null);
    setActiveTab("buy");
    closeShop();
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={handleClose}>
      <View className="absolute inset-0 flex-1 items-center justify-center bg-black/80 p-2 sm:p-4">
        <Animated.View
          entering={Platform.OS !== "web" ? SlideInDown.duration(300) : FadeIn.duration(200)}
          exiting={Platform.OS !== "web" ? SlideOutDown.duration(250) : FadeOut.duration(150)}
          className={cn(
            "w-full max-w-2xl flex-1 overflow-hidden rounded-xl border-2 border-frontier-leather/40 bg-frontier-night shadow-2xl",
            Platform.select({ web: "sm:max-h-[80vh] sm:flex-initial" }),
          )}
        >
          <ShopHeader shop={shop} playerGold={playerStats.gold} onClose={handleClose} />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "buy" | "sell")}>
            <TabsList className="mx-0 rounded-none border-b border-frontier-leather/30 bg-transparent p-0">
              <TabsTrigger
                value="buy"
                className={cn(
                  "min-h-[44px] rounded-none border-b-2",
                  activeTab === "buy"
                    ? "border-amber-500 bg-frontier-gunmetal/30"
                    : "border-transparent",
                )}
              >
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      activeTab === "buy" ? "text-frontier-dust" : "text-frontier-dust/40",
                    )}
                  >
                    Buy
                  </Text>
                  <View className="rounded bg-frontier-gunmetal/60 px-1.5 py-0.5">
                    <Text className="text-[9px] text-frontier-dust/50">
                      {availableItems.length}
                    </Text>
                  </View>
                </View>
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                disabled={shop.canSell === false}
                className={cn(
                  "min-h-[44px] rounded-none border-b-2",
                  activeTab === "sell"
                    ? "border-amber-500 bg-frontier-gunmetal/30"
                    : "border-transparent",
                  shop.canSell === false && "opacity-40",
                )}
              >
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      activeTab === "sell" ? "text-frontier-dust" : "text-frontier-dust/40",
                    )}
                  >
                    Sell
                  </Text>
                  <View className="rounded bg-frontier-gunmetal/60 px-1.5 py-0.5">
                    <Text className="text-[9px] text-frontier-dust/50">{sellableCount}</Text>
                  </View>
                </View>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="flex-1">
              <ScrollArea className="flex-1" contentContainerClassName="p-3 gap-2">
                {availableItems.length === 0 ? (
                  <EmptyState message="No items available" hint="Check back later" />
                ) : (
                  availableItems.map((shopItem, idx) => (
                    <BuyItemRow
                      key={`${shopItem.itemId}-${idx}`}
                      shopItem={shopItem}
                      shop={shop}
                      playerGold={playerStats.gold}
                      onBuy={handleBuyRequest}
                    />
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sell" className="flex-1">
              <ScrollArea className="flex-1" contentContainerClassName="p-3 gap-2">
                {sellableInventory.length === 0 ? (
                  <EmptyState message="Nothing to sell" hint="Find some loot first" />
                ) : shop.canSell === false ? (
                  <EmptyState message="This merchant doesn't buy items" hint="" />
                ) : (
                  sellableInventory.map((item) => (
                    <SellItemRow key={item.id} item={item} shop={shop} onSell={handleSellRequest} />
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <View className="border-t border-frontier-leather/30 bg-frontier-gunmetal/20 px-4 py-2">
            <View
              className={cn(
                "flex-col items-center justify-between gap-1",
                Platform.select({ web: "sm:flex-row" }),
              )}
            >
              <Text className="text-[10px] text-frontier-dust/30">
                Sell rate: {Math.round((shop.buyModifier ?? 0.5) * 100)}%
              </Text>
              <Text
                className={cn(
                  "hidden text-[10px] text-frontier-dust/30",
                  Platform.select({ web: "sm:block" }),
                )}
              >
                Press ESC to leave
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {confirmation ? (
        <ConfirmDialog dialog={confirmation} onCancel={() => setConfirmation(null)} />
      ) : null}
    </Modal>
  );
}
