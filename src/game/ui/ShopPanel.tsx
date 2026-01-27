/**
 * ShopPanel - Western-themed buy/sell interface
 */

import { getItem } from '@/data/items';
import { getRarityColor } from '@/data/schemas/item';
import {
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  getAvailableShopItems,
  getShopById,
  type ShopDefinition,
  type ShopItem,
} from '@/data/shops';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/webGameStore';

// ============================================================================
// ICONS
// ============================================================================

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
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

function InfinityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.781 0-4.781 8 0 8 5.606 0 7.644-8 12.74-8z"
      />
    </svg>
  );
}

// ============================================================================
// RARITY BADGE
// ============================================================================

function RarityBadge({ rarity }: { rarity: string }) {
  const styles = {
    legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    rare: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    uncommon: 'bg-green-500/20 text-green-400 border-green-500/40',
    common: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  };

  return (
    <span
      className={cn(
        'text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase',
        styles[rarity as keyof typeof styles] || styles.common
      )}
    >
      {rarity}
    </span>
  );
}

// ============================================================================
// SHOP ITEM ROW
// ============================================================================

function ShopItemRow({
  shopItem,
  shop,
  onBuy,
  canAfford,
}: {
  shopItem: ShopItem;
  shop: ShopDefinition;
  onBuy: () => void;
  canAfford: boolean;
}) {
  const itemDef = getItem(shopItem.itemId);
  if (!itemDef) return null;

  const price = calculateBuyPrice(shop, shopItem);
  const stock = shopItem.stock ?? -1;
  const isUnlimited = stock < 0;
  const isOutOfStock = stock === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border transition-all',
        'bg-amber-900/20 border-amber-800/30',
        isOutOfStock && 'opacity-50',
        canAfford && !isOutOfStock && 'hover:bg-amber-900/40 hover:border-amber-700/50'
      )}
    >
      {/* Item Icon Placeholder */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-amber-800/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
        <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span
            className="font-medium text-xs sm:text-sm truncate"
            style={{ color: getRarityColor(itemDef.rarity) }}
          >
            {itemDef.name}
          </span>
          <RarityBadge rarity={itemDef.rarity} />
        </div>
        <div className="text-[9px] sm:text-[10px] text-amber-500/60 truncate mt-0.5 hidden sm:block">
          {itemDef.description}
        </div>
      </div>

      {/* Stock - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-1 text-amber-400/60 text-xs">
        {isUnlimited ? (
          <InfinityIcon className="w-4 h-4" />
        ) : isOutOfStock ? (
          <span className="text-red-400">Sold Out</span>
        ) : (
          <span>x{shopItem.stock}</span>
        )}
      </div>

      {/* Price & Buy Button */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            'flex items-center gap-0.5 sm:gap-1 font-mono text-xs sm:text-sm font-medium',
            canAfford ? 'text-amber-400' : 'text-red-400'
          )}
        >
          <CoinIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{price}</span>
        </div>
        <button
          onClick={onBuy}
          disabled={!canAfford || isOutOfStock}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors min-h-[36px] sm:min-h-0',
            canAfford && !isOutOfStock
              ? 'bg-green-700 hover:bg-green-600 text-white'
              : 'bg-amber-900/30 text-amber-700 cursor-not-allowed'
          )}
        >
          Buy
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// INVENTORY ITEM ROW (for selling)
// ============================================================================

function InventoryItemRow({
  item,
  shop,
  onSell,
}: {
  item: { id: string; itemId: string; name: string; quantity: number; type: string };
  shop: ShopDefinition;
  onSell: () => void;
}) {
  const itemDef = getItem(item.itemId);
  if (!itemDef) return null;

  const canSell = canSellItemToShop(shop, item.type) && itemDef.sellable;
  const price = canSell ? calculateSellPrice(shop, itemDef) : 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border transition-all',
        'bg-amber-900/20 border-amber-800/30',
        !canSell && 'opacity-50',
        canSell && 'hover:bg-amber-900/40 hover:border-amber-700/50'
      )}
    >
      {/* Item Icon Placeholder */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-amber-800/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
        <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span
            className="font-medium text-xs sm:text-sm truncate"
            style={{ color: getRarityColor(itemDef.rarity) }}
          >
            {item.name}
          </span>
          <RarityBadge rarity={itemDef.rarity} />
        </div>
        <div className="text-[9px] sm:text-[10px] text-amber-500/60 mt-0.5">x{item.quantity}</div>
      </div>

      {/* Price & Sell Button */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {canSell ? (
          <>
            <div className="flex items-center gap-0.5 sm:gap-1 font-mono text-xs sm:text-sm font-medium text-amber-400">
              <CoinIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{price}</span>
            </div>
            <button
              onClick={onSell}
              className="px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium bg-amber-700 hover:bg-amber-600 text-white transition-colors min-h-[36px] sm:min-h-0"
            >
              Sell
            </button>
          </>
        ) : (
          <span className="text-[9px] sm:text-[10px] text-amber-600/50 italic">Not accepted</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SHOP PANEL
// ============================================================================

export function ShopPanel() {
  const { shopState, closeShop, buyItem, sellItem, playerStats, inventory } = useGameStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  if (!shopState) return null;

  const shop = getShopById(shopState.shopId);
  if (!shop) return null;

  const availableItems = getAvailableShopItems(shop, playerStats.reputation);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-amber-950 border-2 border-amber-700/60 rounded-xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 border-b border-amber-800/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-800/50 border border-amber-700/50 flex items-center justify-center flex-shrink-0">
              <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-amber-200 truncate">
                {shop.name}
              </h2>
              {shop.description && (
                <p className="text-[10px] sm:text-xs text-amber-500/70 truncate">
                  {shop.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {/* Player Gold */}
            <div className="text-left sm:text-right">
              <div className="text-[9px] sm:text-[10px] text-amber-500/60 uppercase tracking-wide">
                Your Gold
              </div>
              <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-yellow-400">
                <CoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>${playerStats.gold}</span>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={closeShop}
              className="p-2 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 text-amber-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-800/50">
          <button
            onClick={() => setActiveTab('buy')}
            className={cn(
              'flex-1 px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-xs sm:text-sm transition-colors min-h-[44px]',
              activeTab === 'buy'
                ? 'text-amber-200 border-b-2 border-amber-500 bg-amber-900/30'
                : 'text-amber-500/60 hover:text-amber-400'
            )}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <ShoppingBagIcon className="w-4 h-4" />
              Buy
              <span className="text-[9px] sm:text-[10px] bg-amber-800/50 px-1 sm:px-1.5 py-0.5 rounded">
                {availableItems.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            disabled={!shop.canSell}
            className={cn(
              'flex-1 px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-xs sm:text-sm transition-colors min-h-[44px]',
              !shop.canSell && 'opacity-50 cursor-not-allowed',
              activeTab === 'sell'
                ? 'text-amber-200 border-b-2 border-amber-500 bg-amber-900/30'
                : 'text-amber-500/60 hover:text-amber-400'
            )}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <TagIcon className="w-4 h-4" />
              Sell
              <span className="text-[9px] sm:text-[10px] bg-amber-800/50 px-1 sm:px-1.5 py-0.5 rounded">
                {inventory.length}
              </span>
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          {activeTab === 'buy' ? (
            <div className="space-y-1.5 sm:space-y-2">
              {availableItems.length === 0 ? (
                <div className="text-center text-amber-600/50 py-8 sm:py-12">
                  <ShoppingBagIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-amber-700/30" />
                  <p className="text-xs sm:text-sm">No items available</p>
                  <p className="text-[10px] sm:text-xs text-amber-700/40 mt-1">Check back later</p>
                </div>
              ) : (
                availableItems.map((shopItem, index) => (
                  <ShopItemRow
                    key={`${shopItem.itemId}-${index}`}
                    shopItem={shopItem}
                    shop={shop}
                    canAfford={playerStats.gold >= calculateBuyPrice(shop, shopItem)}
                    onBuy={() => buyItem(shopItem.itemId)}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {inventory.length === 0 ? (
                <div className="text-center text-amber-600/50 py-8 sm:py-12">
                  <TagIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-amber-700/30" />
                  <p className="text-xs sm:text-sm">Nothing to sell</p>
                  <p className="text-[10px] sm:text-xs text-amber-700/40 mt-1">
                    Find some loot first
                  </p>
                </div>
              ) : !shop.canSell ? (
                <div className="text-center text-amber-600/50 py-8 sm:py-12">
                  <p className="text-xs sm:text-sm">This merchant doesn't buy items</p>
                </div>
              ) : (
                inventory.map((item) => (
                  <InventoryItemRow
                    key={item.id}
                    item={item}
                    shop={shop}
                    onSell={() => sellItem(item.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 sm:p-3 border-t border-amber-800/50 bg-amber-900/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-[10px] text-amber-500/50">
            <span>Sell rate: {Math.round((shop.buyModifier ?? 0.5) * 100)}%</span>
            <span className="hidden sm:inline">Press ESC to leave</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPanel;
