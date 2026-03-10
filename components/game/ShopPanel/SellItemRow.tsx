/**
 * A single item row in the Sell tab.
 */

import * as React from "react";
import { Platform, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { getItem } from "@/src/game/data/items";
import { getRarityColor } from "@/src/game/data/schemas/item";
import { calculateSellPrice, canSellItemToShop, type ShopDefinition } from "@/src/game/data/shops";
import type { InventoryItem } from "@/src/game/store/types";

import { getRarityBadgeVariant } from "./helpers.ts";
import { GoldIcon } from "./ShopHeader.tsx";

export function SellItemRow({
  item,
  shop,
  onSell,
}: {
  item: InventoryItem;
  shop: ShopDefinition;
  onSell: (inventoryId: string, price: number, itemName: string) => void;
}) {
  const itemDef = getItem(item.itemId);
  const canSell = itemDef ? canSellItemToShop(shop, item.type) && itemDef.sellable : false;
  const price = itemDef ? calculateSellPrice(shop, itemDef) : 0;
  const rarityColor = itemDef ? getRarityColor(itemDef.rarity) : "#95A5A6";
  const rarity = itemDef?.rarity ?? "common";

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-lg border border-frontier-leather/20 bg-frontier-gunmetal/30 px-3 py-2.5",
        !canSell && "opacity-40",
        canSell &&
          Platform.select({
            web: "hover:border-frontier-leather/40 hover:bg-frontier-gunmetal/50",
          }),
      )}
    >
      <View className="h-10 w-10 items-center justify-center rounded border border-frontier-leather/20 bg-frontier-leather/10">
        <Text className="text-sm text-frontier-dust/50">
          {item.type === "weapon"
            ? "\u2694"
            : item.type === "consumable"
              ? "\u{1F9EA}"
              : "\u{1F4E6}"}
        </Text>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="text-sm font-medium" style={{ color: rarityColor }} numberOfLines={1}>
            {item.name}
          </Text>
          <Badge variant={getRarityBadgeVariant(rarity)}>
            <Text className="text-[9px] uppercase">{rarity}</Text>
          </Badge>
        </View>
        <Text className="mt-0.5 text-[10px] text-frontier-dust/40">x{item.quantity}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        {canSell ? (
          <>
            <View className="flex-row items-center gap-1">
              <GoldIcon size={10} />
              <Text className="font-data text-sm font-medium text-yellow-400">{price}</Text>
            </View>
            <Button
              variant="primary"
              size="sm"
              className={cn(
                "min-h-[36px] bg-amber-700 px-3 active:bg-amber-600",
                Platform.select({ web: "hover:bg-amber-600" }),
              )}
              onPress={() => onSell(item.id, price, item.name)}
            >
              <Text className="text-xs font-medium text-white">Sell</Text>
            </Button>
          </>
        ) : (
          <Text className="text-[10px] italic text-frontier-dust/30">Not accepted</Text>
        )}
      </View>
    </View>
  );
}
