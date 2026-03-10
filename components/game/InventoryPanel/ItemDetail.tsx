/**
 * Item detail card and stat rows for the inventory panel.
 */

import { View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { getItem } from "@/src/game/data/items";
import { getItemTypeName, type ItemType } from "@/src/game/data/schemas/item";
import type { EquipmentState, InventoryItem } from "@/src/game/store/types";
import { conditionColor, isItemEquipped, rarityBadgeVariant } from "./helpers.ts";

// =============================================================================
// StatRow
// =============================================================================

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
      <Text className="text-frontier-dust/40 text-[11px] font-data">{label}</Text>
      <Text className={cn("text-frontier-dust text-[11px] font-data", valueClassName)}>
        {value}
      </Text>
    </View>
  );
}

// =============================================================================
// ItemDetail
// =============================================================================

export function ItemDetail({
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
  const canEquip = item.type === "weapon" || item.type === "armor";

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
            {equipped ? (
              <Badge variant="info">
                <Text className="text-xs">Equipped</Text>
              </Badge>
            ) : null}
          </View>
        </View>

        {/* Description */}
        <Text className="text-frontier-dust/60 text-xs font-body leading-relaxed mb-3">
          {def?.description ?? item.description ?? "No description available."}
        </Text>

        <Separator className="bg-frontier-leather/30 mb-3" />

        {/* Stats */}
        <View className="gap-1.5 mb-3">
          <StatRow label="Type" value={getItemTypeName(item.type as ItemType)} />
          <StatRow label="Weight" value={`${item.weight} lbs`} />
          {item.type === "weapon" ? (
            <>
              <StatRow
                label="Condition"
                value={`${item.condition}%`}
                valueClassName={conditionColor(item.condition)}
              />
              {def?.weaponStats ? (
                <>
                  <StatRow
                    label="Damage"
                    value={String(def.weaponStats.damage)}
                    valueClassName="text-frontier-blood"
                  />
                  <StatRow label="Range" value={`${def.weaponStats.range}m`} />
                  <StatRow label="Accuracy" value={`${def.weaponStats.accuracy}%`} />
                </>
              ) : null}
            </>
          ) : null}
          {item.type === "consumable" && def?.consumableStats ? (
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
          ) : null}
          {item.type === "armor" && def?.armorStats ? (
            <>
              <StatRow
                label="Defense"
                value={String(def.armorStats.defense)}
                valueClassName="text-frontier-sky"
              />
              <StatRow label="Slot" value={def.armorStats.slot} />
            </>
          ) : null}
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          {item.usable ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-frontier-sage/40 bg-frontier-sage/10"
              onPress={() => onUse(item.id)}
            >
              <Text className="text-frontier-sage text-xs font-body">Use</Text>
            </Button>
          ) : null}
          {canEquip ? (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1",
                equipped
                  ? "border-frontier-iron/30 bg-frontier-iron/10 opacity-50"
                  : "border-frontier-sky/40 bg-frontier-sky/10",
              )}
              onPress={() => onEquip(item.id)}
              disabled={equipped}
            >
              <Text
                className={cn(
                  "text-xs font-body",
                  equipped ? "text-frontier-iron" : "text-frontier-sky",
                )}
              >
                {equipped ? "Equipped" : "Equip"}
              </Text>
            </Button>
          ) : null}
          {item.droppable ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-frontier-blood/30 bg-frontier-blood/10"
              onPress={() => onDrop(item.id)}
            >
              <Text className="text-frontier-blood text-xs font-body">Drop</Text>
            </Button>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// EmptyDetail
// =============================================================================

export function EmptyDetail() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-frontier-iron text-sm font-body mb-1">No item selected</Text>
      <Text className="text-frontier-iron/60 text-xs font-body">Tap an item to see details</Text>
    </View>
  );
}
