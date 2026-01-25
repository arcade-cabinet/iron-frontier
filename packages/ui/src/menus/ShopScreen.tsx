/**
 * ShopScreen Component
 *
 * Buy/sell interface for interacting with merchants.
 * Shows available items, prices, stock, and player inventory for selling.
 *
 * @example
 * ```tsx
 * <ShopScreen
 *   open={inShop}
 *   onClose={() => leaveShop()}
 *   shopkeeper={{ name: "Martha", shopName: "General Store" }}
 *   shopItems={shopInventory}
 *   playerItems={playerInventory}
 *   playerGold={playerStats.gold}
 *   onBuy={(id, qty) => buyItem(id, qty)}
 *   onSell={(id, qty) => sellItem(id, qty)}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps, ShopItem, MenuItem, ShopKeeper } from './types';
import {
  CloseIcon,
  CoinIcon,
  MenuOverlay,
  TabGroup,
  getRarityBgColor,
  getRarityColor,
} from './shared';

export interface ShopScreenProps extends MenuBaseProps {
  /** Shop keeper information */
  shopkeeper?: ShopKeeper;
  /** Items available for purchase */
  shopItems?: ShopItem[];
  /** Player's inventory for selling */
  playerItems?: MenuItem[];
  /** Player's current gold */
  playerGold?: number;
  /** Callback when buying an item */
  onBuy?: (itemId: string, quantity: number) => void;
  /** Callback when selling an item */
  onSell?: (itemId: string, quantity: number) => void;
  /** Sell price multiplier (e.g., 0.5 = 50% of buy price) */
  sellMultiplier?: number;
}

type ShopTab = 'buy' | 'sell';

function ItemRow({
  item,
  price,
  stock,
  canAfford,
  mode,
  onAction,
}: {
  item: { id: string; name: string; description?: string; rarity: string; type?: string };
  price: number;
  stock?: number;
  canAfford?: boolean;
  mode: 'buy' | 'sell';
  onAction: () => void;
}) {
  const isOutOfStock = stock !== undefined && stock <= 0;
  const isDisabled = mode === 'buy' ? (!canAfford || isOutOfStock) : false;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2',
        'transition-all duration-150',
        getRarityBgColor(item.rarity),
        isDisabled && 'opacity-50'
      )}
    >
      {/* Item Icon Placeholder */}
      <div
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
          'bg-stone-900/50 border border-stone-700/50',
          getRarityColor(item.rarity)
        )}
      >
        <span className="text-lg font-bold">{item.name.charAt(0)}</span>
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm sm:text-base font-medium truncate', getRarityColor(item.rarity))}>
            {item.name}
          </span>
          <span
            className={cn(
              'text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded uppercase font-medium',
              getRarityBgColor(item.rarity)
            )}
          >
            {item.rarity}
          </span>
        </div>
        {item.description && (
          <p className="text-[10px] sm:text-xs text-stone-500 truncate mt-0.5">
            {item.description}
          </p>
        )}
      </div>

      {/* Stock (for buying) */}
      {stock !== undefined && mode === 'buy' && (
        <div className="hidden sm:block text-xs text-stone-500 text-right min-w-[40px]">
          {isOutOfStock ? (
            <span className="text-red-400">Sold out</span>
          ) : stock < 0 ? (
            <span className="text-stone-600">Unlimited</span>
          ) : (
            <span>x{stock}</span>
          )}
        </div>
      )}

      {/* Price */}
      <div
        className={cn(
          'flex items-center gap-1 font-mono text-sm sm:text-base font-medium min-w-[50px] justify-end',
          mode === 'buy'
            ? canAfford
              ? 'text-amber-400'
              : 'text-red-400'
            : 'text-green-400'
        )}
      >
        <CoinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>${price}</span>
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        disabled={isDisabled}
        className={cn(
          'px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm',
          'transition-colors min-h-[40px] sm:min-h-[36px] min-w-[60px]',
          isDisabled
            ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
            : mode === 'buy'
              ? 'bg-amber-700 hover:bg-amber-600 text-white'
              : 'bg-green-700 hover:bg-green-600 text-white'
        )}
      >
        {mode === 'buy' ? 'Buy' : 'Sell'}
      </button>
    </div>
  );
}

function SelectedItemPanel({
  item,
  price,
  mode,
  quantity,
  maxQuantity,
  onQuantityChange,
  onAction,
  canAfford,
}: {
  item: { name: string; description?: string; rarity: string } | null;
  price: number;
  mode: 'buy' | 'sell';
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (qty: number) => void;
  onAction: () => void;
  canAfford: boolean;
}) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-stone-500 p-4">
        <CoinIcon className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Select an item</p>
      </div>
    );
  }

  const totalPrice = price * quantity;
  const isDisabled = mode === 'buy' ? !canAfford : false;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Item Header */}
      <div className="mb-4">
        <h3 className={cn('text-lg font-bold', getRarityColor(item.rarity))}>
          {item.name}
        </h3>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded uppercase font-medium mt-1 inline-block',
            getRarityBgColor(item.rarity)
          )}
        >
          {item.rarity}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-400 mb-4 flex-1">
        {item.description || 'No description available.'}
      </p>

      {/* Quantity Selector */}
      <div className="mb-4">
        <label className="text-xs text-stone-500 uppercase tracking-wide block mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold transition-colors"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
            className="flex-1 h-10 rounded-lg bg-stone-800 border border-stone-700 text-center text-stone-200 font-mono"
          />
          <button
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold transition-colors"
          >
            +
          </button>
        </div>
        {maxQuantity > 1 && (
          <div className="flex justify-between mt-2">
            <button
              onClick={() => onQuantityChange(1)}
              className="text-xs text-stone-500 hover:text-stone-300"
            >
              Min
            </button>
            <button
              onClick={() => onQuantityChange(maxQuantity)}
              className="text-xs text-stone-500 hover:text-stone-300"
            >
              Max ({maxQuantity})
            </button>
          </div>
        )}
      </div>

      {/* Total Price */}
      <div className="flex items-center justify-between py-3 border-t border-stone-700/50 mb-4">
        <span className="text-sm text-stone-400">Total</span>
        <span
          className={cn(
            'text-xl font-bold font-mono flex items-center gap-1',
            mode === 'buy' ? (canAfford ? 'text-amber-400' : 'text-red-400') : 'text-green-400'
          )}
        >
          <CoinIcon className="w-5 h-5" />
          ${totalPrice}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        disabled={isDisabled}
        className={cn(
          'w-full py-3 rounded-lg font-medium text-base',
          'transition-colors min-h-[48px]',
          isDisabled
            ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
            : mode === 'buy'
              ? 'bg-amber-700 hover:bg-amber-600 text-white'
              : 'bg-green-700 hover:bg-green-600 text-white'
        )}
      >
        {mode === 'buy' ? `Buy ${quantity}` : `Sell ${quantity}`}
      </button>
    </div>
  );
}

export function ShopScreen({
  open = false,
  onClose,
  shopkeeper = { name: 'Merchant', shopName: 'General Store' },
  shopItems = [],
  playerItems = [],
  playerGold = 0,
  onBuy,
  onSell,
  sellMultiplier = 0.5,
  className,
  testID,
}: ShopScreenProps) {
  const [activeTab, setActiveTab] = React.useState<ShopTab>('buy');
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  // Reset selection when tab changes
  React.useEffect(() => {
    setSelectedItemId(null);
    setQuantity(1);
  }, [activeTab]);

  // Get selected item details
  const selectedItem = React.useMemo(() => {
    if (!selectedItemId) return null;
    if (activeTab === 'buy') {
      return shopItems.find((i) => i.id === selectedItemId);
    } else {
      return playerItems.find((i) => i.id === selectedItemId);
    }
  }, [selectedItemId, activeTab, shopItems, playerItems]);

  // Calculate price for selected item
  const selectedPrice = React.useMemo(() => {
    if (!selectedItem) return 0;
    if (activeTab === 'buy') {
      return (selectedItem as ShopItem).price;
    } else {
      return Math.floor((selectedItem as MenuItem).value * sellMultiplier);
    }
  }, [selectedItem, activeTab, sellMultiplier]);

  // Max quantity for selected item
  const maxQuantity = React.useMemo(() => {
    if (!selectedItem) return 1;
    if (activeTab === 'buy') {
      const stock = (selectedItem as ShopItem).stock;
      if (stock < 0) return 99; // Unlimited
      return Math.max(1, stock);
    } else {
      return (selectedItem as MenuItem).quantity;
    }
  }, [selectedItem, activeTab]);

  // Can afford selected item
  const canAfford = activeTab === 'buy' && selectedPrice * quantity <= playerGold;

  const handleAction = () => {
    if (!selectedItem) return;
    if (activeTab === 'buy') {
      onBuy?.(selectedItem.id, quantity);
    } else {
      onSell?.(selectedItem.id, quantity);
    }
    setQuantity(1);
  };

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col bg-stone-950"
      >
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border-b border-amber-800/30 bg-stone-900/50">
          <div className="flex items-center gap-3">
            {/* Shopkeeper avatar placeholder */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-700/30 border-2 border-amber-600/50 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-amber-400">
                {shopkeeper.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-200">
                {shopkeeper.shopName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">{shopkeeper.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {/* Player gold */}
            <div className="text-left sm:text-right">
              <div className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-wide">
                Your Gold
              </div>
              <div className="flex items-center gap-1 text-lg font-bold text-yellow-400">
                <CoinIcon className="w-4 h-4" />
                <span>${playerGold}</span>
              </div>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close shop"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Greeting */}
        {shopkeeper.greeting && (
          <div className="px-4 py-2 bg-stone-900/30 border-b border-stone-800/50">
            <p className="text-xs sm:text-sm text-stone-400 italic">
              "{shopkeeper.greeting}"
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-3 sm:px-4 py-2 border-b border-stone-800/50">
          <TabGroup
            tabs={[
              { id: 'buy', label: 'Buy', count: shopItems.length },
              { id: 'sell', label: 'Sell', count: playerItems.length },
            ]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as ShopTab)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {activeTab === 'buy' ? (
              shopItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-500">
                  <CoinIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">No items available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shopItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={cn(
                        'cursor-pointer',
                        selectedItemId === item.id && 'ring-2 ring-amber-400 rounded-lg'
                      )}
                    >
                      <ItemRow
                        item={item}
                        price={item.price}
                        stock={item.stock}
                        canAfford={item.price <= playerGold}
                        mode="buy"
                        onAction={() => {
                          setSelectedItemId(item.id);
                          setQuantity(1);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : playerItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-500">
                <CoinIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Nothing to sell</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playerItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      'cursor-pointer',
                      selectedItemId === item.id && 'ring-2 ring-green-400 rounded-lg'
                    )}
                  >
                    <ItemRow
                      item={item}
                      price={Math.floor(item.value * sellMultiplier)}
                      mode="sell"
                      onAction={() => {
                        setSelectedItemId(item.id);
                        setQuantity(1);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Item Panel */}
          <div
            className={cn(
              'w-full sm:w-64 md:w-72 bg-stone-900 border-t sm:border-t-0 sm:border-l border-stone-800',
              !selectedItem && 'hidden sm:block'
            )}
          >
            <SelectedItemPanel
              item={selectedItem ?? null}
              price={selectedPrice}
              mode={activeTab}
              quantity={quantity}
              maxQuantity={maxQuantity}
              onQuantityChange={setQuantity}
              onAction={handleAction}
              canAfford={canAfford || activeTab === 'sell'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800/50 bg-stone-900/30">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-500">
            <span>Sell rate: {Math.round(sellMultiplier * 100)}%</span>
            <span className="hidden sm:inline">Press ESC to leave</span>
          </div>
        </div>
      </div>
    </MenuOverlay>
  );
}

ShopScreen.displayName = 'ShopScreen';

export default ShopScreen;
