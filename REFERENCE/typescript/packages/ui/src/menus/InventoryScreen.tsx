/**
 * InventoryScreen Component
 *
 * Full-screen inventory management with categories, item details,
 * and item actions (use, drop, equip).
 *
 * @example
 * ```tsx
 * <InventoryScreen
 *   open={showInventory}
 *   onClose={() => setShowInventory(false)}
 *   items={inventory}
 *   gold={playerGold}
 *   weight={currentWeight}
 *   maxWeight={50}
 *   onUseItem={(id) => useItem(id)}
 *   onDropItem={(id) => dropItem(id)}
 *   onEquipItem={(id) => equipItem(id)}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import type { MenuBaseProps, MenuItem } from './types';
import {
  CloseIcon,
  CoinIcon,
  KeyIcon,
  MenuOverlay,
  PotionIcon,
  ScrollIcon,
  ShieldIcon,
  SwordIcon,
  TabGroup,
  getRarityBgColor,
  getRarityColor,
} from './shared';

export interface InventoryScreenProps extends MenuBaseProps {
  /** Items in inventory */
  items?: MenuItem[];
  /** Player's gold */
  gold?: number;
  /** Current carry weight */
  weight?: number;
  /** Maximum carry weight */
  maxWeight?: number;
  /** Callback when an item is used */
  onUseItem?: (itemId: string) => void;
  /** Callback when an item is dropped */
  onDropItem?: (itemId: string) => void;
  /** Callback when an item is equipped */
  onEquipItem?: (itemId: string) => void;
  /** Callback when an item is unequipped */
  onUnequipItem?: (itemId: string) => void;
}

type ItemCategory = 'all' | 'weapons' | 'armor' | 'items' | 'quest' | 'key';

const CATEGORY_TABS: { id: ItemCategory; label: string; types: string[] }[] = [
  { id: 'all', label: 'All', types: [] },
  { id: 'weapons', label: 'Weapons', types: ['weapon'] },
  { id: 'armor', label: 'Armor', types: ['armor'] },
  { id: 'items', label: 'Items', types: ['consumable', 'junk'] },
  { id: 'quest', label: 'Quest', types: ['quest'] },
  { id: 'key', label: 'Key', types: ['key_item'] },
];

function getItemIcon(type: string) {
  switch (type) {
    case 'weapon':
      return <SwordIcon className="w-full h-full" />;
    case 'armor':
      return <ShieldIcon className="w-full h-full" />;
    case 'consumable':
      return <PotionIcon className="w-full h-full" />;
    case 'key_item':
      return <KeyIcon className="w-full h-full" />;
    case 'quest':
      return <ScrollIcon className="w-full h-full" />;
    default:
      return <PotionIcon className="w-full h-full" />;
  }
}

function ItemSlot({
  item,
  isSelected,
  onClick,
}: {
  item?: MenuItem;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  if (!item) {
    return (
      <div className="aspect-square rounded-lg bg-stone-800/30 border border-stone-700/30" />
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'aspect-square rounded-lg border-2 p-1.5 sm:p-2',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'relative',
        getRarityBgColor(item.rarity),
        isSelected && 'ring-2 ring-amber-400 scale-105',
        !isSelected && 'hover:scale-105'
      )}
    >
      {/* Item Icon */}
      <div className={cn('w-full h-full', getRarityColor(item.rarity))}>
        {getItemIcon(item.type)}
      </div>

      {/* Quantity badge */}
      {item.quantity > 1 && (
        <span className="absolute bottom-0.5 right-0.5 text-[9px] sm:text-[10px] font-mono bg-stone-900/80 text-stone-300 px-1 rounded">
          x{item.quantity}
        </span>
      )}

      {/* Equipped indicator */}
      {item.equipped && (
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Condition bar for weapons/armor */}
      {item.condition !== undefined && item.condition < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-900/80 rounded-b">
          <div
            className={cn(
              'h-full rounded-b',
              item.condition > 50 ? 'bg-green-500' : item.condition > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${item.condition}%` }}
          />
        </div>
      )}
    </button>
  );
}

function ItemDetails({
  item,
  onUse,
  onDrop,
  onEquip,
  onUnequip,
}: {
  item: MenuItem | null;
  onUse?: () => void;
  onDrop?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
}) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-stone-500 p-4">
        <SwordIcon className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Select an item</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      {/* Item Header */}
      <div className="mb-3">
        <h3 className={cn('text-base sm:text-lg font-bold', getRarityColor(item.rarity))}>
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              'text-[10px] sm:text-xs px-1.5 py-0.5 rounded uppercase font-medium',
              getRarityBgColor(item.rarity)
            )}
          >
            {item.rarity}
          </span>
          {item.equipped && (
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Equipped
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-stone-400 mb-4 flex-shrink-0">
        {item.description || 'No description available.'}
      </p>

      {/* Stats */}
      <div className="flex-1 space-y-1 text-xs sm:text-sm border-t border-stone-700/50 pt-3 overflow-y-auto">
        <div className="flex justify-between text-stone-400">
          <span>Type</span>
          <span className="text-stone-200 capitalize">{item.type.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between text-stone-400">
          <span>Weight</span>
          <span className="text-stone-200">{item.weight} lbs</span>
        </div>
        <div className="flex justify-between text-stone-400">
          <span>Value</span>
          <span className="text-amber-400">${item.value}</span>
        </div>
        {item.condition !== undefined && (
          <div className="flex justify-between text-stone-400">
            <span>Condition</span>
            <span
              className={cn(
                item.condition > 50 ? 'text-green-400' : item.condition > 25 ? 'text-yellow-400' : 'text-red-400'
              )}
            >
              {item.condition}%
            </span>
          </div>
        )}
        {item.stats &&
          Object.entries(item.stats).map(([stat, value]) => (
            <div key={stat} className="flex justify-between text-stone-400">
              <span className="capitalize">{stat}</span>
              <span className={cn(value > 0 ? 'text-green-400' : 'text-red-400')}>
                {value > 0 ? `+${value}` : value}
              </span>
            </div>
          ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 mt-auto border-t border-stone-700/50">
        {item.usable && onUse && (
          <button
            onClick={onUse}
            className="flex-1 py-2.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
          >
            Use
          </button>
        )}
        {item.equippable && !item.equipped && onEquip && (
          <button
            onClick={onEquip}
            className="flex-1 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
          >
            Equip
          </button>
        )}
        {item.equipped && onUnequip && (
          <button
            onClick={onUnequip}
            className="flex-1 py-2.5 rounded-lg bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
          >
            Unequip
          </button>
        )}
        {onDrop && item.type !== 'quest' && item.type !== 'key_item' && (
          <button
            onClick={onDrop}
            className="flex-1 py-2.5 rounded-lg bg-red-900/50 hover:bg-red-800/50 text-red-300 text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
          >
            Drop
          </button>
        )}
      </div>
    </div>
  );
}

export function InventoryScreen({
  open = false,
  onClose,
  items = [],
  gold = 0,
  weight = 0,
  maxWeight = 50,
  onUseItem,
  onDropItem,
  onEquipItem,
  onUnequipItem,
  className,
  testID,
}: InventoryScreenProps) {
  const [activeCategory, setActiveCategory] = React.useState<ItemCategory>('all');
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  // Filter items by category
  const filteredItems = React.useMemo(() => {
    if (activeCategory === 'all') return items;
    const categoryTypes = CATEGORY_TABS.find((t) => t.id === activeCategory)?.types || [];
    return items.filter((item) => categoryTypes.includes(item.type));
  }, [items, activeCategory]);

  // Count items per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    CATEGORY_TABS.forEach((tab) => {
      if (tab.id !== 'all') {
        counts[tab.id] = items.filter((item) => tab.types.includes(item.type)).length;
      }
    });
    return counts;
  }, [items]);

  // Reset selection when closing
  React.useEffect(() => {
    if (!open) {
      setSelectedItem(null);
    }
  }, [open]);

  const isOverweight = weight > maxWeight;

  return (
    <MenuOverlay open={open} onClose={onClose} className={className}>
      <div
        data-testid={testID}
        className="h-full flex flex-col bg-stone-950"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b border-amber-800/30 bg-stone-900/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-amber-200 tracking-wide uppercase">
              Inventory
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Weight */}
            <div
              className={cn(
                'text-xs sm:text-sm font-mono px-2 py-1 rounded',
                isOverweight ? 'bg-red-900/50 text-red-400' : 'bg-stone-800 text-stone-400'
              )}
            >
              {weight.toFixed(1)}/{maxWeight} lbs
            </div>
            {/* Gold */}
            <div className="flex items-center gap-1 text-amber-400">
              <CoinIcon className="w-4 h-4" />
              <span className="font-bold text-sm sm:text-base">${gold}</span>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close inventory"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Category Tabs */}
        <div className="px-3 sm:px-4 py-2 bg-stone-900/30 border-b border-stone-800/50">
          <TabGroup
            tabs={CATEGORY_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              count: categoryCounts[tab.id] || 0,
            }))}
            activeTab={activeCategory}
            onTabChange={(id) => setActiveCategory(id as ItemCategory)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 p-3 sm:p-4 overflow-hidden">
          {/* Item Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-500">
                <SwordIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">
                  {activeCategory === 'all' ? 'Your saddlebag is empty' : `No ${activeCategory}`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {filteredItems.map((item) => (
                  <ItemSlot
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Item Details Panel */}
          <div
            className={cn(
              'w-full sm:w-56 md:w-64 bg-stone-900/50 rounded-lg border border-stone-700/50',
              'min-h-[200px] sm:min-h-0',
              !selectedItem && 'hidden sm:block'
            )}
          >
            <ItemDetails
              item={selectedItem}
              onUse={selectedItem?.usable ? () => onUseItem?.(selectedItem.id) : undefined}
              onDrop={() => selectedItem && onDropItem?.(selectedItem.id)}
              onEquip={selectedItem?.equippable && !selectedItem.equipped ? () => onEquipItem?.(selectedItem.id) : undefined}
              onUnequip={selectedItem?.equipped ? () => onUnequipItem?.(selectedItem.id) : undefined}
            />
          </div>
        </div>
      </div>
    </MenuOverlay>
  );
}

InventoryScreen.displayName = 'InventoryScreen';

export default InventoryScreen;
