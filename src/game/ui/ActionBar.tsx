// Action Bar - Bottom navigation
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '../store/gameStore';

// Icons
function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function BackpackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function ActionBar() {
  const { togglePanel, activeQuests, inventory } = useGameStore();

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 pb-safe">
      <Card className="bg-amber-950/95 border-amber-700/50 backdrop-blur-sm">
        <CardContent className="p-2">
          <div className="flex justify-around items-center">
            {/* Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('menu')}
              className="flex flex-col items-center gap-1 h-auto py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-800/50"
            >
              <MenuIcon />
              <span className="text-xs">Menu</span>
            </Button>

            {/* Inventory */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('inventory')}
              className="flex flex-col items-center gap-1 h-auto py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-800/50 relative"
            >
              <BackpackIcon />
              <span className="text-xs">Items</span>
              {inventory.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-600 text-white text-xs">
                  {inventory.length}
                </Badge>
              )}
            </Button>

            {/* Quests */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('quests')}
              className="flex flex-col items-center gap-1 h-auto py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-800/50 relative"
            >
              <ScrollIcon />
              <span className="text-xs">Quests</span>
              {activeQuests.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-yellow-600 text-white text-xs">
                  {activeQuests.length}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('settings')}
              className="flex flex-col items-center gap-1 h-auto py-2 text-amber-200 hover:text-amber-100 hover:bg-amber-800/50"
            >
              <SettingsIcon />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
