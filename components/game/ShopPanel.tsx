import * as React from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/utils';
import { getItem } from '@/src/game/data/items';
import { getRarityColor } from '@/src/game/data/schemas/item';
import {
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  getAvailableShopItems,
  getShopById,
  type ShopDefinition,
  type ShopItem,
} from '@/src/game/data/shops';
import { gameStore } from '@/src/game/store/webGameStore';
import type { InventoryItem } from '@/src/game/store/types';

// ============================================================================
// TYPES
// ============================================================================

type ConfirmationDialog = {
  type: 'buy' | 'sell';
  itemName: string;
  price: number;
  onConfirm: () => void;
} | null;

// ============================================================================
// HELPERS
// ============================================================================

const RARITY_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  legendary: 'warning',
  rare: 'info',
  uncommon: 'success',
  common: 'default',
};

function getRarityBadgeVariant(rarity: string) {
  return RARITY_BADGE_VARIANT[rarity] ?? 'default';
}

function formatStock(stock: number | undefined): string {
  if (stock === undefined || stock < 0) return '\u221E'; // infinity
  if (stock === 0) return 'Sold Out';
  return `x${stock}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Gold coin icon */
function GoldIcon({ size = 12 }: { size?: number }) {
  return (
    <View
      className="rounded-full bg-yellow-400"
      style={{ width: size, height: size }}
    />
  );
}

/** Header with shop name, gold display, and close button */
function ShopHeader({
  shop,
  playerGold,
  onClose,
}: {
  shop: ShopDefinition;
  playerGold: number;
  onClose: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-frontier-leather/30 px-4 py-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        {/* Shop icon */}
        <View className="h-10 w-10 items-center justify-center rounded-lg border border-frontier-leather/40 bg-frontier-leather/20">
          <Text className="text-lg">🏪</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text
            variant="subheading"
            className="text-frontier-dust"
            numberOfLines={1}
          >
            {shop.name}
          </Text>
          {shop.description ? (
            <Text variant="caption" className="text-frontier-dust/50" numberOfLines={1}>
              {shop.description}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Gold display */}
      <View className="mr-3 items-end">
        <Text className="text-[10px] uppercase tracking-wider text-frontier-dust/40">
          Your Gold
        </Text>
        <View className="flex-row items-center gap-1">
          <GoldIcon size={14} />
          <Text className="font-data text-base font-bold text-yellow-400">
            ${playerGold}
          </Text>
        </View>
      </View>

      {/* Close button */}
      <Pressable
        className={cn(
          'min-h-[44px] min-w-[44px] items-center justify-center rounded-lg',
          'bg-frontier-gunmetal/50 active:bg-frontier-gunmetal/80',
          Platform.select({ web: 'hover:bg-frontier-gunmetal/70' }),
        )}
        onPress={onClose}
        accessibilityLabel="Close shop"
        accessibilityRole="button"
      >
        <Text className="text-lg text-frontier-dust/70">✕</Text>
      </Pressable>
    </View>
  );
}

/** A single item row in the Buy tab */
function BuyItemRow({
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
  const rarityColor = itemDef ? getRarityColor(itemDef.rarity) : '#95A5A6';
  const rarity = itemDef?.rarity ?? 'common';
  const itemName = itemDef?.name ?? shopItem.itemId;

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-lg border border-frontier-leather/20 bg-frontier-gunmetal/30 px-3 py-2.5',
        soldOut && 'opacity-40',
        !disabled &&
          Platform.select({ web: 'hover:border-frontier-leather/40 hover:bg-frontier-gunmetal/50' }),
      )}
    >
      {/* Item icon placeholder */}
      <View className="h-10 w-10 items-center justify-center rounded border border-frontier-leather/20 bg-frontier-leather/10">
        <Text className="text-sm text-frontier-dust/50">
          {itemDef?.type === 'weapon' ? '⚔' : itemDef?.type === 'consumable' ? '🧪' : '📦'}
        </Text>
      </View>

      {/* Item info */}
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text
            className="text-sm font-medium"
            style={{ color: rarityColor }}
            numberOfLines={1}
          >
            {itemName}
          </Text>
          <Badge variant={getRarityBadgeVariant(rarity)}>
            <Text className="text-[9px] uppercase">{rarity}</Text>
          </Badge>
        </View>
        {itemDef?.description ? (
          <Text
            className="mt-0.5 text-[10px] text-frontier-dust/40"
            numberOfLines={1}
          >
            {itemDef.description}
          </Text>
        ) : null}
      </View>

      {/* Stock indicator (wider screens only) */}
      <Text className={cn('hidden text-xs text-frontier-dust/40', Platform.select({ web: 'sm:block' }))}>
        {formatStock(shopItem.stock)}
      </Text>

      {/* Price + buy button */}
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1">
          <GoldIcon size={10} />
          <Text
            className={cn(
              'font-data text-sm font-medium',
              affordable ? 'text-yellow-400' : 'text-red-400',
            )}
          >
            {price}
          </Text>
        </View>
        <Button
          variant={disabled ? 'ghost' : 'primary'}
          size="sm"
          disabled={disabled}
          className={cn(
            'min-h-[36px] px-3',
            !disabled && 'bg-green-700 active:bg-green-600',
            !disabled && Platform.select({ web: 'hover:bg-green-600' }),
          )}
          onPress={() => onBuy(shopItem.itemId, price, itemName)}
        >
          <Text className={cn('text-xs font-medium', disabled ? 'text-frontier-dust/30' : 'text-white')}>
            Buy
          </Text>
        </Button>
      </View>
    </View>
  );
}

/** A single item row in the Sell tab */
function SellItemRow({
  item,
  shop,
  onSell,
}: {
  item: InventoryItem;
  shop: ShopDefinition;
  onSell: (inventoryId: string, price: number, itemName: string) => void;
}) {
  const itemDef = getItem(item.itemId);
  const canSell = itemDef
    ? canSellItemToShop(shop, item.type) && itemDef.sellable
    : false;
  const price = itemDef ? calculateSellPrice(shop, itemDef) : 0;
  const rarityColor = itemDef ? getRarityColor(itemDef.rarity) : '#95A5A6';
  const rarity = itemDef?.rarity ?? 'common';

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-lg border border-frontier-leather/20 bg-frontier-gunmetal/30 px-3 py-2.5',
        !canSell && 'opacity-40',
        canSell &&
          Platform.select({ web: 'hover:border-frontier-leather/40 hover:bg-frontier-gunmetal/50' }),
      )}
    >
      {/* Item icon placeholder */}
      <View className="h-10 w-10 items-center justify-center rounded border border-frontier-leather/20 bg-frontier-leather/10">
        <Text className="text-sm text-frontier-dust/50">
          {item.type === 'weapon' ? '⚔' : item.type === 'consumable' ? '🧪' : '📦'}
        </Text>
      </View>

      {/* Item info */}
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text
            className="text-sm font-medium"
            style={{ color: rarityColor }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Badge variant={getRarityBadgeVariant(rarity)}>
            <Text className="text-[9px] uppercase">{rarity}</Text>
          </Badge>
        </View>
        <Text className="mt-0.5 text-[10px] text-frontier-dust/40">
          x{item.quantity}
        </Text>
      </View>

      {/* Sell price + button */}
      <View className="flex-row items-center gap-2">
        {canSell ? (
          <>
            <View className="flex-row items-center gap-1">
              <GoldIcon size={10} />
              <Text className="font-data text-sm font-medium text-yellow-400">
                {price}
              </Text>
            </View>
            <Button
              variant="primary"
              size="sm"
              className={cn(
                'min-h-[36px] bg-amber-700 px-3 active:bg-amber-600',
                Platform.select({ web: 'hover:bg-amber-600' }),
              )}
              onPress={() => onSell(item.id, price, item.name)}
            >
              <Text className="text-xs font-medium text-white">Sell</Text>
            </Button>
          </>
        ) : (
          <Text className="text-[10px] italic text-frontier-dust/30">
            Not accepted
          </Text>
        )}
      </View>
    </View>
  );
}

/** Empty state for a tab */
function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <View className="items-center py-12">
      <Text className="mb-1 text-sm text-frontier-dust/30">{message}</Text>
      <Text className="text-xs text-frontier-dust/20">{hint}</Text>
    </View>
  );
}

/** Confirmation dialog for buy/sell */
function ConfirmDialog({
  dialog,
  onCancel,
}: {
  dialog: NonNullable<ConfirmationDialog>;
  onCancel: () => void;
}) {
  const isBuy = dialog.type === 'buy';

  return (
    <Modal transparent visible onRequestClose={onCancel}>
      <View className="absolute inset-0 flex-1 items-center justify-center bg-black/60">
        <Pressable className="absolute inset-0" onPress={onCancel} />
        <Animated.View
          entering={Platform.OS !== 'web' ? SlideInDown.duration(200) : FadeIn.duration(150)}
          exiting={Platform.OS !== 'web' ? SlideOutDown.duration(150) : FadeOut.duration(100)}
          className="mx-6 w-full max-w-sm rounded-xl border border-frontier-leather/40 bg-frontier-gunmetal p-5"
        >
          <Pressable>
            <Text variant="subheading" className="mb-2 text-center text-frontier-dust">
              {isBuy ? 'Confirm Purchase' : 'Confirm Sale'}
            </Text>
            <Text className="mb-4 text-center text-sm text-frontier-dust/70">
              {isBuy
                ? `Buy ${dialog.itemName} for ${dialog.price} gold?`
                : `Sell ${dialog.itemName} for ${dialog.price} gold?`}
            </Text>
            <View className="flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] flex-1"
                onPress={onCancel}
              >
                <Text className="text-sm text-frontier-dust/70">Cancel</Text>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={cn(
                  'min-h-[44px] flex-1',
                  isBuy ? 'bg-green-700' : 'bg-amber-700',
                )}
                onPress={() => {
                  dialog.onConfirm();
                  onCancel();
                }}
              >
                <Text className="text-sm font-medium text-white">
                  {isBuy ? 'Buy' : 'Sell'}
                </Text>
              </Button>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ShopPanel() {
  // Store selectors
  const shopState = gameStore((s) => s.shopState);
  const playerStats = gameStore((s) => s.playerStats);
  const inventory = gameStore((s) => s.inventory);
  const buyItem = gameStore((s) => s.buyItem);
  const sellItem = gameStore((s) => s.sellItem);
  const closeShop = gameStore((s) => s.closeShop);

  // Local state
  const [activeTab, setActiveTab] = React.useState<'buy' | 'sell'>('buy');
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

  // Don't render if no shop is open
  if (!shopState || !shop) return null;

  const handleBuyRequest = (itemId: string, price: number, itemName: string) => {
    setConfirmation({
      type: 'buy',
      itemName,
      price,
      onConfirm: () => buyItem(itemId),
    });
  };

  const handleSellRequest = (inventoryId: string, price: number, itemName: string) => {
    setConfirmation({
      type: 'sell',
      itemName,
      price,
      onConfirm: () => sellItem(inventoryId),
    });
  };

  const handleClose = () => {
    setConfirmation(null);
    setActiveTab('buy');
    closeShop();
  };

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="absolute inset-0 flex-1 items-center justify-center bg-black/80 p-2 sm:p-4">
        <Animated.View
          entering={Platform.OS !== 'web' ? SlideInDown.duration(300) : FadeIn.duration(200)}
          exiting={Platform.OS !== 'web' ? SlideOutDown.duration(250) : FadeOut.duration(150)}
          className={cn(
            'w-full max-w-2xl flex-1 overflow-hidden rounded-xl border-2 border-frontier-leather/40 bg-frontier-night shadow-2xl',
            Platform.select({ web: 'sm:max-h-[80vh] sm:flex-initial' }),
          )}
        >
          {/* Header */}
          <ShopHeader
            shop={shop}
            playerGold={playerStats.gold}
            onClose={handleClose}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
            <TabsList className="mx-0 rounded-none border-b border-frontier-leather/30 bg-transparent p-0">
              <TabsTrigger
                value="buy"
                className={cn(
                  'min-h-[44px] rounded-none border-b-2',
                  activeTab === 'buy'
                    ? 'border-amber-500 bg-frontier-gunmetal/30'
                    : 'border-transparent',
                )}
              >
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className={cn(
                      'text-xs font-medium',
                      activeTab === 'buy' ? 'text-frontier-dust' : 'text-frontier-dust/40',
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
                  'min-h-[44px] rounded-none border-b-2',
                  activeTab === 'sell'
                    ? 'border-amber-500 bg-frontier-gunmetal/30'
                    : 'border-transparent',
                  shop.canSell === false && 'opacity-40',
                )}
              >
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className={cn(
                      'text-xs font-medium',
                      activeTab === 'sell' ? 'text-frontier-dust' : 'text-frontier-dust/40',
                    )}
                  >
                    Sell
                  </Text>
                  <View className="rounded bg-frontier-gunmetal/60 px-1.5 py-0.5">
                    <Text className="text-[9px] text-frontier-dust/50">
                      {sellableCount}
                    </Text>
                  </View>
                </View>
              </TabsTrigger>
            </TabsList>

            {/* Buy tab content */}
            <TabsContent value="buy" className="flex-1">
              <ScrollArea className="flex-1" contentContainerClassName="p-3 gap-2">
                {availableItems.length === 0 ? (
                  <EmptyState
                    message="No items available"
                    hint="Check back later"
                  />
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

            {/* Sell tab content */}
            <TabsContent value="sell" className="flex-1">
              <ScrollArea className="flex-1" contentContainerClassName="p-3 gap-2">
                {sellableInventory.length === 0 ? (
                  <EmptyState
                    message="Nothing to sell"
                    hint="Find some loot first"
                  />
                ) : shop.canSell === false ? (
                  <EmptyState
                    message="This merchant doesn't buy items"
                    hint=""
                  />
                ) : (
                  sellableInventory.map((item) => (
                    <SellItemRow
                      key={item.id}
                      item={item}
                      shop={shop}
                      onSell={handleSellRequest}
                    />
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <View className="border-t border-frontier-leather/30 bg-frontier-gunmetal/20 px-4 py-2">
            <View
              className={cn(
                'flex-col items-center justify-between gap-1',
                Platform.select({ web: 'sm:flex-row' }),
              )}
            >
              <Text className="text-[10px] text-frontier-dust/30">
                Sell rate: {Math.round((shop.buyModifier ?? 0.5) * 100)}%
              </Text>
              <Text
                className={cn(
                  'hidden text-[10px] text-frontier-dust/30',
                  Platform.select({ web: 'sm:block' }),
                )}
              >
                Press ESC to leave
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Confirmation dialog */}
      {confirmation ? (
        <ConfirmDialog
          dialog={confirmation}
          onCancel={() => setConfirmation(null)}
        />
      ) : null}
    </Modal>
  );
}
