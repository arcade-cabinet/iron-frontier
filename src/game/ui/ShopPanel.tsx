/**
 * ShopPanel - Buy/Sell items with merchants
 */

import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  getShopById,
  getAvailableShopItems,
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  type ShopDefinition,
  type ShopItem,
} from '../../data/shops/index';
import { getItem } from '../../data/items/index';
import { getRarityColor } from '../../data/schemas/item';

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
  const stockText = shopItem.stock < 0 ? '∞' : shopItem.stock.toString();

  return (
    <div className="flex items-center justify-between p-2 bg-stone-800/50 rounded hover:bg-stone-800">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="font-medium"
            style={{ color: getRarityColor(itemDef.rarity) }}
          >
            {itemDef.name}
          </span>
          <span className="text-xs text-stone-500">x{stockText}</span>
        </div>
        <div className="text-xs text-stone-400">{itemDef.description}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
          ${price}
        </span>
        <button
          onClick={onBuy}
          disabled={!canAfford || shopItem.stock === 0}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            canAfford && shopItem.stock !== 0
              ? 'bg-green-700 hover:bg-green-600 text-white'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
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
    <div className="flex items-center justify-between p-2 bg-stone-800/50 rounded hover:bg-stone-800">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="font-medium"
            style={{ color: getRarityColor(itemDef.rarity) }}
          >
            {item.name}
          </span>
          <span className="text-xs text-stone-500">x{item.quantity}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {canSell ? (
          <>
            <span className="text-sm text-amber-400">${price}</span>
            <button
              onClick={onSell}
              className="px-3 py-1 rounded text-sm font-medium bg-amber-700 hover:bg-amber-600 text-white transition-colors"
            >
              Sell
            </button>
          </>
        ) : (
          <span className="text-xs text-stone-500">Cannot sell here</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SHOP PANEL
// ============================================================================

export function ShopPanel() {
  const {
    shopState,
    closeShop,
    buyItem,
    sellItem,
    playerStats,
    inventory,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  if (!shopState) return null;

  const shop = getShopById(shopState.shopId);
  if (!shop) return null;

  const availableItems = getAvailableShopItems(shop, playerStats.reputation);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 border-2 border-amber-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-stone-700">
          <div>
            <h2 className="text-xl font-bold text-amber-500">{shop.name}</h2>
            {shop.description && (
              <p className="text-sm text-stone-400">{shop.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-stone-400">Your Gold</div>
            <div className="text-lg font-bold text-amber-400">${playerStats.gold}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-700">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 px-4 py-2 font-medium transition-colors ${
              activeTab === 'buy'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-stone-800/50'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 px-4 py-2 font-medium transition-colors ${
              activeTab === 'sell'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-stone-800/50'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'buy' ? (
            <div className="space-y-2">
              {availableItems.length === 0 ? (
                <div className="text-center text-stone-500 py-8">
                  No items available
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
            <div className="space-y-2">
              {inventory.length === 0 ? (
                <div className="text-center text-stone-500 py-8">
                  No items to sell
                </div>
              ) : !shop.canSell ? (
                <div className="text-center text-stone-500 py-8">
                  This merchant doesn't buy items
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
        <div className="p-4 border-t border-stone-700">
          <button
            onClick={closeShop}
            className="w-full px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded font-medium transition-colors"
          >
            Leave Shop
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopPanel;
