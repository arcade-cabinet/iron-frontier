// Inventory Panel - Bottom sheet for items
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useGameStore, type InventoryItem, type EquipmentSlot } from '../store/gameStore';
import { getItem } from '../../data/items/index';
import { getItemTypeName } from '../../data/schemas/item';

// Item type icons (simple SVG paths)
const TYPE_ICONS: Record<string, string> = {
  weapon: 'M12 2l3 7h6l-5 4 2 7-6-4-6 4 2-7-5-4h6l3-7z', // star/weapon
  consumable: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', // potion
  key_item: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', // checkmark
  junk: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z', // x
  currency: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z', // dollar
  armor: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z', // shield
};

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

  const inventoryOpen = activePanel === 'inventory';
  const totalWeight = getTotalWeight();
  const isOverweight = totalWeight > maxCarryWeight;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950';
      case 'rare': return 'bg-gradient-to-r from-purple-500 to-violet-500 text-purple-950';
      case 'uncommon': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-green-950';
      default: return 'bg-amber-600/80 text-amber-950';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500/50 shadow-yellow-500/20 shadow-md';
      case 'rare': return 'border-purple-500/50';
      case 'uncommon': return 'border-green-500/50';
      default: return 'border-amber-700/50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weapon': return 'text-red-400';
      case 'consumable': return 'text-green-400';
      case 'key_item': return 'text-yellow-400';
      case 'currency': return 'text-amber-400';
      case 'armor': return 'text-blue-400';
      default: return 'text-amber-500/50';
    }
  };

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

  // Get full item details from library
  const getItemDetails = (itemId: string) => {
    return getItem(itemId);
  };

  return (
    <Sheet open={inventoryOpen} onOpenChange={() => togglePanel('inventory')}>
      <SheetContent side="bottom" className="h-[75vh] bg-amber-950 border-amber-700">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-amber-100 flex items-center justify-between">
            <span>Saddlebag</span>
            <div className="flex items-center gap-3 text-sm font-normal">
              <span className="text-amber-400">
                {inventory.length} / {maxInventorySlots} items
              </span>
              <span className={cn(
                'font-mono',
                isOverweight ? 'text-red-400' : 'text-amber-400'
              )}>
                {totalWeight.toFixed(1)} / {maxCarryWeight} lbs
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Player money */}
        <div className="flex items-center gap-4 mb-3 p-2 bg-amber-900/30 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
              <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">$</text>
            </svg>
            <span className="text-amber-200 font-bold">${playerStats.gold}</span>
          </div>
          {playerStats.ivrcScript > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-copper-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
                <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor">IVRC</text>
              </svg>
              <span className="text-amber-300 font-bold">{playerStats.ivrcScript} Script</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 h-[calc(100%-110px)]">
          {/* Item Grid */}
          <ScrollArea className="flex-1">
            {inventory.length === 0 ? (
              <div className="text-amber-400/60 text-center py-12">
                <svg className="w-12 h-12 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>Your saddlebag is empty</p>
                <p className="text-sm mt-1 text-amber-500/50">Explore to find items!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pr-2">
                {inventory.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <Card
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={cn(
                        'bg-amber-900/40 border cursor-pointer transition-all',
                        getRarityBorder(item.rarity),
                        isSelected && 'ring-2 ring-amber-400 bg-amber-800/50'
                      )}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Type icon */}
                          <svg
                            className={cn('w-4 h-4 flex-shrink-0', getTypeColor(item.type))}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d={TYPE_ICONS[item.type] || TYPE_ICONS.junk} />
                          </svg>
                          <span className="text-amber-100 font-medium text-xs truncate flex-1">
                            {item.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-amber-300 text-xs font-mono">
                              x{item.quantity}
                            </span>
                          )}
                        </div>
                        {/* Condition bar for non-consumables */}
                        {item.type === 'weapon' && item.condition < 100 && (
                          <div className="w-full h-1 bg-amber-900 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                item.condition > 50 ? 'bg-green-500' :
                                item.condition > 25 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${item.condition}%` }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Item Details Panel */}
          <div className="w-48 bg-amber-900/20 rounded-lg p-3 flex flex-col">
            {selectedItem ? (
              <>
                <div className="mb-2">
                  <div className="text-amber-100 font-bold text-sm mb-1">{selectedItem.name}</div>
                  <Badge className={cn('text-xs', getRarityColor(selectedItem.rarity))}>
                    {selectedItem.rarity}
                  </Badge>
                </div>

                <div className="text-amber-400/80 text-xs mb-3 flex-1">
                  {selectedItem.description || 'No description available.'}
                </div>

                {/* Item stats */}
                <div className="space-y-1 text-xs text-amber-300/70 mb-3">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-amber-200">{getItemTypeName(selectedItem.type as any)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="text-amber-200">{selectedItem.weight} lbs</span>
                  </div>
                  {selectedItem.type === 'weapon' && (
                    <>
                      <div className="flex justify-between">
                        <span>Condition:</span>
                        <span className={cn(
                          selectedItem.condition > 50 ? 'text-green-400' :
                          selectedItem.condition > 25 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {selectedItem.condition}%
                        </span>
                      </div>
                      {(() => {
                        const details = getItemDetails(selectedItem.itemId);
                        if (details?.weaponStats) {
                          return (
                            <>
                              <div className="flex justify-between">
                                <span>Damage:</span>
                                <span className="text-red-400">{details.weaponStats.damage}</span>
                              </div>
                              <div className="flex justify-between">
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
                  {selectedItem.type === 'consumable' && (() => {
                    const details = getItemDetails(selectedItem.itemId);
                    if (details?.consumableStats) {
                      return (
                        <>
                          {details.consumableStats.healAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Heals:</span>
                              <span className="text-green-400">+{details.consumableStats.healAmount} HP</span>
                            </div>
                          )}
                          {details.consumableStats.staminaAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Stamina:</span>
                              <span className="text-blue-400">+{details.consumableStats.staminaAmount}</span>
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
                      className="flex-1 h-8 text-xs bg-green-900/30 border-green-700/50 text-green-300 hover:bg-green-800/50"
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
                        "flex-1 h-8 text-xs",
                        isItemEquipped(selectedItem.id)
                          ? "bg-blue-900/30 border-blue-700/50 text-blue-300/50 cursor-not-allowed"
                          : "bg-blue-900/30 border-blue-700/50 text-blue-300 hover:bg-blue-800/50"
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
                      className="flex-1 h-8 text-xs bg-red-900/20 border-red-700/30 text-red-400 hover:bg-red-800/30"
                    >
                      Drop
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-amber-500/50 text-xs text-center">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
