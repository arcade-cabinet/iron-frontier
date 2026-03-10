/**
 * A single item row in the Buy tab.
 */

import { Platform, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { getItem } from "@/src/game/data/items";
import { getRarityColor } from "@/src/game/data/schemas/item";
import { calculateBuyPrice, type ShopDefinition, type ShopItem } from "@/src/game/data/shops";

import { formatStock, getRarityBadgeVariant } from "./helpers.ts";
import { GoldIcon } from "./ShopHeader.tsx";

export function BuyItemRow({
  shopItem,
  shop,
  playerGold,
  onBuy,
}: {
  shopItem: ShopItem;
  shop: ShopDefinition;
  playerGold: number;
  onBuy: (itemId: string, price: number, itemName: string) => void;
}) {
  const itemDef = getItem(shopItem.itemId);
  const price = calculateBuyPrice(shop, shopItem);
  const affordable = playerGold >= price;
  const soldOut = shopItem.stock === 0;
  const disabled = !affordable || soldOut;
  const rarityColor = itemDef ? getRarityColor(itemDef.rarity) : "#95A5A6";
  const rarity = itemDef?.rarity ?? "common";
  const itemName = itemDef?.name ?? shopItem.itemId;

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-lg border border-frontier-leather/20 bg-frontier-gunmetal/30 px-3 py-2.5",
        soldOut && "opacity-40",
        !disabled &&
          Platform.select({
            web: "hover:border-frontier-leather/40 hover:bg-frontier-gunmetal/50",
          }),
      )}
    >
      <View className="h-10 w-10 items-center justify-center rounded border border-frontier-leather/20 bg-frontier-leather/10">
        <Text className="text-sm text-frontier-dust/50">
          {itemDef?.type === "weapon"
            ? "\u2694"
            : itemDef?.type === "consumable"
              ? "\u{1F9EA}"
              : "\u{1F4E6}"}
        </Text>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="text-sm font-medium" style={{ color: rarityColor }} numberOfLines={1}>
            {itemName}
          </Text>
          <Badge variant={getRarityBadgeVariant(rarity)}>
            <Text className="text-[9px] uppercase">{rarity}</Text>
          </Badge>
        </View>
        {itemDef?.description ? (
          <Text className="mt-0.5 text-[10px] text-frontier-dust/40" numberOfLines={1}>
            {itemDef.description}
          </Text>
        ) : null}
      </View>

      <Text
        className={cn("hidden text-xs text-frontier-dust/40", Platform.select({ web: "sm:block" }))}
      >
        {formatStock(shopItem.stock)}
      </Text>

      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1">
          <GoldIcon size={10} />
          <Text
            className={cn(
              "font-data text-sm font-medium",
              affordable ? "text-yellow-400" : "text-red-400",
            )}
          >
            {price}
          </Text>
        </View>
        <Button
          variant={disabled ? "ghost" : "primary"}
          size="sm"
          disabled={disabled}
          className={cn(
            "min-h-[36px] px-3",
            !disabled && "bg-green-700 active:bg-green-600",
            !disabled && Platform.select({ web: "hover:bg-green-600" }),
          )}
          onPress={() => onBuy(shopItem.itemId, price, itemName)}
        >
          <Text
            className={cn("text-xs font-medium", disabled ? "text-frontier-dust/30" : "text-white")}
          >
            Buy
          </Text>
        </Button>
      </View>
    </View>
  );
}
