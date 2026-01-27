// Inventory Panel - Improved bottom sheet with categories and better mobile UX

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getItem } from '@/data/items';
import { getItemTypeName } from '@/data/schemas/item';
import { cn } from '@/lib/utils';
import { type InventoryItem, useGameStore } from '../store/webGameStore';

// ============================================================================
// TYPE ICONS
// ============================================================================

const TYPE_ICONS: Record<string, string> = {
  weapon: 'M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6l3-7z',
  consumable:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  key_item:
    'M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13l2 2 2-2 2 2 2-2v-4zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
  junk: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  currency:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z',
  armor: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
};

// Filter categories
type FilterCategory = 'all' | 'weapon' | 'armor' | 'consumable' | 'key_item' | 'junk';

const FILTER_CATEGORIES: { id: FilterCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'weapon', label: 'Weapons', icon: TYPE_ICONS.weapon },
  { id: 'armor', label: 'Armor', icon: TYPE_ICONS.armor },
  { id: 'consumable', label: 'Supplies', icon: TYPE_ICONS.consumable },
  { id: 'key_item', label: 'Keys', icon: TYPE_ICONS.key_item },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950';
    case 'rare':
      return 'bg-gradient-to-r from-purple-500 to-violet-500 text-purple-950';
    case 'uncommon':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-green-950';
    default:
      return 'bg-amber-600/80 text-amber-950';
  }
};

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'border-yellow-500/60 shadow-yellow-500/20 shadow-md';
    case 'rare':
      return 'border-purple-500/60';
    case 'uncommon':
      return 'border-green-500/60';
    default:
      return 'border-amber-700/40';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'weapon':
      return 'text-red-400';
    case 'consumable':
      return 'text-green-400';
    case 'key_item':
      return 'text-yellow-400';
    case 'currency':
      return 'text-amber-400';
    case 'armor':
      return 'text-blue-400';
    default:
      return 'text-amber-500/50';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function InventoryPanel() {
  const {
    activePanel,
    togglePanel,
    inventory,
    useItem,
    dropItem,
    equipItem,
    equipment,
    playerStats,
    settings,
    maxInventorySlots,
    maxCarryWeight,
    getTotalWeight,
  } = useGameStore();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const inventoryOpen = activePanel === 'inventory';
  const totalWeight = getTotalWeight();
  const isOverweight = totalWeight > maxCarryWeight;

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return inventory;
    return inventory.filter((item) => item.type === activeFilter);
  }, [inventory, activeFilter]);

  // Count items by type
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: inventory.length };
    inventory.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [inventory]);

  const handleUseItem = (id: string) => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }
    useItem(id);
  };

  const handleDropItem = (id: string) => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(20);
    }
    dropItem(id);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleEquipItem = (id: string) => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }
    equipItem(id);
  };

  const isItemEquipped = (id: string) => {
    return Object.values(equipment).includes(id);
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const getItemDetails = (itemId: string) => {
    return getItem(itemId);
  };

  return (
    <Sheet open={inventoryOpen} onOpenChange={() => togglePanel('inventory')}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[80vh] bg-amber-950 border-amber-800/60 p-0"
      >
        {/* Header */}
        <SheetHeader className="p-2 sm:p-3 pb-1 sm:pb-2 border-b border-amber-800/50">
          <SheetTitle className="text-amber-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span className="text-sm sm:text-base">Saddlebag</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-normal">
              <span className="text-amber-400/80">
                {inventory.length}/{maxInventorySlots}
              </span>
              <span
                className={cn(
                  'font-mono px-1 sm:px-1.5 py-0.5 rounded',
                  isOverweight ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/30 text-amber-400/80'
                )}
              >
                {totalWeight.toFixed(1)}/{maxCarryWeight} lbs
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Currency Bar */}
        <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-900/20 border-b border-amber-800/30">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-amber-200 font-bold text-xs sm:text-sm">${playerStats.gold}</span>
          </div>
          {playerStats.ivrcScript > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              <span className="text-orange-300 font-bold text-xs sm:text-sm">
                {playerStats.ivrcScript}
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-900/10 border-b border-amber-800/30 overflow-x-auto scrollbar-hide">
          {FILTER_CATEGORIES.map((cat) => (
            <button type="button" type="button"
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] sm:min-h-0',
                activeFilter === cat.id
                  ? 'bg-amber-700/60 text-amber-100'
                  : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-800/30'
              )}
            >
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d={cat.icon} />
              </svg>
              <span className="hidden xs:inline sm:inline">{cat.label}</span>
              {(itemCounts[cat.id] || 0) > 0 && (
                <span
                  className={cn(
                    'text-[9px] sm:text-[10px] px-1 py-0.5 rounded',
                    activeFilter === cat.id ? 'bg-amber-600/50' : 'bg-amber-800/50'
                  )}
                >
                  {itemCounts[cat.id] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col sm:flex-row gap-2 p-2 sm:p-3 h-[calc(100%-120px)] sm:h-[calc(100%-140px)]">
          {/* Item Grid */}
          <ScrollArea className="flex-1 min-h-0">
            {filteredItems.length === 0 ? (
              <div className="text-amber-400/60 text-center py-8 sm:py-12">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-amber-700/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-xs sm:text-sm">
                  {activeFilter === 'all'
                    ? 'Your saddlebag is empty'
                    : `No ${activeFilter === 'key_item' ? 'key items' : `${activeFilter}s`}`}
                </p>
                {activeFilter === 'all' && (
                  <p className="text-[10px] sm:text-xs mt-1 text-amber-500/40">
                    Explore to find items!
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 pr-2">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isEquipped = isItemEquipped(item.id);
                  return (
                    <Card
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={cn(
                        'bg-amber-900/30 border cursor-pointer transition-all relative min-h-[60px] sm:min-h-0',
                        getRarityBorder(item.rarity),
                        isSelected && 'ring-2 ring-amber-400 bg-amber-800/40',
                        isEquipped && 'ring-1 ring-blue-500/50'
                      )}
                    >
                      <CardContent className="p-1.5 sm:p-2">
                        {/* Equipped badge */}
                        {isEquipped && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}

                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                          <svg
                            className={cn(
                              'w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0',
                              getTypeColor(item.type)
                            )}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d={TYPE_ICONS[item.type] || TYPE_ICONS.junk} />
                          </svg>
                          <span className="text-amber-100 font-medium text-[9px] sm:text-[11px] truncate flex-1">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          {item.quantity > 1 && (
                            <span className="text-amber-400/70 text-[9px] sm:text-[10px] font-mono">
                              x{item.quantity}
                            </span>
                          )}
                          {item.type === 'weapon' && item.condition < 100 && (
                            <div className="flex-1 ml-1">
                              <div className="w-full h-0.5 sm:h-1 bg-amber-900/60 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    item.condition > 50
                                      ? 'bg-green-500'
                                      : item.condition > 25
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  )}
                                  style={{ width: `${item.condition}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Item Details Panel - hidden on xs when no item selected */}
          <div
            className={cn(
              'bg-amber-900/20 rounded-lg p-2 sm:p-2.5 flex flex-col border border-amber-800/30',
              'w-full sm:w-44 md:w-52',
              'min-h-[100px] sm:min-h-0',
              !selectedItem && 'hidden sm:flex'
            )}
          >
            {selectedItem ? (
              <>
                <div className="mb-1.5 sm:mb-2">
                  <div className="text-amber-100 font-bold text-xs sm:text-sm mb-1 leading-tight">
                    {selectedItem.name}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <Badge
                      className={cn(
                        'text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0',
                        getRarityColor(selectedItem.rarity)
                      )}
                    >
                      {selectedItem.rarity}
                    </Badge>
                    {isItemEquipped(selectedItem.id) && (
                      <Badge className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-blue-600 text-blue-100">
                        Equipped
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-amber-400/70 text-[10px] sm:text-[11px] mb-1.5 sm:mb-2 leading-relaxed flex-1 overflow-y-auto max-h-[60px] sm:max-h-none">
                  {selectedItem.description || 'No description available.'}
                </div>

                {/* Item stats - horizontal on mobile, vertical on larger */}
                <div className="flex flex-wrap sm:flex-col gap-x-3 gap-y-0.5 text-[9px] sm:text-[10px] text-amber-300/60 mb-1.5 sm:mb-2 pt-1.5 sm:pt-2 border-t border-amber-700/30">
                  <div className="flex justify-between gap-1 sm:gap-0">
                    <span>Type:</span>
                    <span className="text-amber-200">
                      {getItemTypeName(selectedItem.type as any)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-1 sm:gap-0">
                    <span>Weight:</span>
                    <span className="text-amber-200">{selectedItem.weight} lbs</span>
                  </div>
                  {selectedItem.type === 'weapon' && (
                    <>
                      <div className="flex justify-between gap-1 sm:gap-0">
                        <span>Condition:</span>
                        <span
                          className={cn(
                            selectedItem.condition > 50
                              ? 'text-green-400'
                              : selectedItem.condition > 25
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          )}
                        >
                          {selectedItem.condition}%
                        </span>
                      </div>
                      {(() => {
                        const details = getItemDetails(selectedItem.itemId);
                        if (details?.weaponStats) {
                          return (
                            <>
                              <div className="flex justify-between gap-1 sm:gap-0">
                                <span>Damage:</span>
                                <span className="text-red-400">{details.weaponStats.damage}</span>
                              </div>
                              <div className="flex justify-between gap-1 sm:gap-0">
                                <span>Range:</span>
                                <span className="text-amber-200">{details.weaponStats.range}m</span>
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                  {selectedItem.type === 'consumable' &&
                    (() => {
                      const details = getItemDetails(selectedItem.itemId);
                      if (details?.consumableStats) {
                        return (
                          <>
                            {details.consumableStats.healAmount > 0 && (
                              <div className="flex justify-between gap-1 sm:gap-0">
                                <span>Heals:</span>
                                <span className="text-green-400">
                                  +{details.consumableStats.healAmount} HP
                                </span>
                              </div>
                            )}
                            {details.consumableStats.staminaAmount > 0 && (
                              <div className="flex justify-between gap-1 sm:gap-0">
                                <span>Stamina:</span>
                                <span className="text-blue-400">
                                  +{details.consumableStats.staminaAmount}
                                </span>
                              </div>
                            )}
                          </>
                        );
                      }
                      return null;
                    })()}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 flex-wrap">
                  {selectedItem.usable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseItem(selectedItem.id)}
                      className="flex-1 h-8 sm:h-7 text-[10px] bg-green-900/30 border-green-700/50 text-green-300 hover:bg-green-800/50 min-h-[36px] sm:min-h-0"
                    >
                      Use
                    </Button>
                  )}
                  {(selectedItem.type === 'weapon' || selectedItem.type === 'armor') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipItem(selectedItem.id)}
                      disabled={isItemEquipped(selectedItem.id)}
                      className={cn(
                        'flex-1 h-8 sm:h-7 text-[10px] min-h-[36px] sm:min-h-0',
                        isItemEquipped(selectedItem.id)
                          ? 'bg-blue-900/20 border-blue-700/30 text-blue-400/50 cursor-not-allowed'
                          : 'bg-blue-900/30 border-blue-700/50 text-blue-300 hover:bg-blue-800/50'
                      )}
                    >
                      {isItemEquipped(selectedItem.id) ? 'Equipped' : 'Equip'}
                    </Button>
                  )}
                  {selectedItem.droppable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDropItem(selectedItem.id)}
                      className="flex-1 h-8 sm:h-7 text-[10px] bg-red-900/20 border-red-700/30 text-red-400 hover:bg-red-800/30 min-h-[36px] sm:min-h-0"
                    >
                      Drop
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-amber-500/40 text-[10px] sm:text-xs text-center">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-amber-700/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <span>Select an item</span>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
