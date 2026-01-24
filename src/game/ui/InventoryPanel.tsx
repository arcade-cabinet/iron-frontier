// Inventory Panel - Bottom sheet for items
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/gameStore';

export function InventoryPanel() {
  const { activePanel, togglePanel, inventory, useItem, dropItem, playerStats, settings } = useGameStore();

  const inventoryOpen = activePanel === 'inventory';

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
      case 'legendary': return 'border-yellow-500/50';
      case 'rare': return 'border-purple-500/50';
      case 'uncommon': return 'border-green-500/50';
      default: return 'border-amber-700/50';
    }
  };

  const handleUseItem = (id: string) => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(30);
    }
    useItem(id);
  };

  return (
    <Sheet open={inventoryOpen} onOpenChange={() => togglePanel('inventory')}>
      <SheetContent side="bottom" className="h-[70vh] bg-amber-950 border-amber-700">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-amber-100 flex items-center justify-between">
            <span>Saddlebag</span>
            <span className="text-amber-400 text-sm font-normal">
              {inventory.length} / 20 items
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Player gold */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-900/30 rounded-lg">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">$</text>
          </svg>
          <span className="text-amber-200 font-bold">{playerStats.gold} Gold</span>
        </div>

        <ScrollArea className="h-[calc(100%-100px)]">
          {inventory.length === 0 ? (
            <div className="text-amber-400/60 text-center py-12">
              <svg className="w-12 h-12 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>Your saddlebag is empty</p>
              <p className="text-sm mt-1 text-amber-500/50">Explore to find items!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pr-2">
              {inventory.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    'bg-amber-900/40 border',
                    getRarityBorder(item.rarity)
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-amber-100 font-medium text-sm truncate">
                          {item.name}
                        </div>
                        <Badge className={cn('mt-1 text-xs', getRarityColor(item.rarity))}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <span className="text-amber-300 text-sm font-mono ml-2">
                        x{item.quantity}
                      </span>
                    </div>

                    {/* Item actions */}
                    <div className="flex gap-1 mt-2">
                      {item.usable && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUseItem(item.id)}
                          className="flex-1 h-7 text-xs bg-green-900/30 border-green-700/50 text-green-300 hover:bg-green-800/50"
                        >
                          Use
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dropItem(item.id)}
                        className="h-7 text-xs bg-red-900/20 border-red-700/30 text-red-400 hover:bg-red-800/30 px-2"
                      >
                        Drop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
