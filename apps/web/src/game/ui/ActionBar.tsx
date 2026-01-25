// Action Bar - Bottom navigation (streamlined 5-button layout)
// Responsive: larger touch targets on mobile, hide labels on xs
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useGameStore } from '../store/webGameStore';

// Icons - Western-themed with responsive sizing
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function SaddlebagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function WantedPosterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

interface ActionBarProps {
  onOpenMap?: () => void;
}

export function ActionBar({ onOpenMap }: ActionBarProps) {
  const { togglePanel, activeQuests, inventory, activePanel } = useGameStore();

  // Helper to check if button is active
  const isActive = (panel: string) => activePanel === panel;

  // Responsive button classes:
  // - Larger touch targets on mobile (min-h-[56px])
  // - Standard sizing on tablet/desktop
  // - More padding on mobile for easier tapping
  const buttonBase = cn(
    "flex flex-col items-center justify-center gap-0.5 h-auto rounded-lg transition-all",
    "min-h-[56px] sm:min-h-[48px] md:min-h-[44px]", // Touch targets
    "py-2 px-3 sm:py-2 sm:px-3 md:py-1.5 md:px-3"   // Padding
  );
  const buttonNormal = "text-amber-300/80 hover:text-amber-100 hover:bg-amber-800/40";
  const buttonActive = "text-amber-100 bg-amber-700/60";

  // Responsive icon class - larger on mobile for visibility
  const iconClass = "w-7 h-7 sm:w-6 sm:h-6";

  return (
    <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-2 md:p-3 pb-safe">
      <Card className="bg-amber-950/95 border-amber-800/60 backdrop-blur-md shadow-lg">
        <CardContent className="p-1 sm:p-1.5">
          <div className="flex justify-around items-center">
            {/* Character Stats */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('character')}
              aria-label="Character Stats"
              className={cn(buttonBase, isActive('character') ? buttonActive : buttonNormal)}
            >
              <WantedPosterIcon className={iconClass} />
              <span className="hidden sm:block text-[10px] font-medium">Outlaw</span>
            </Button>

            {/* World Map */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenMap}
              aria-label="World Map"
              className={cn(buttonBase, buttonNormal)}
            >
              <MapIcon className={iconClass} />
              <span className="hidden sm:block text-[10px] font-medium">Territory</span>
            </Button>

            {/* Inventory - center focus */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('inventory')}
              aria-label="Inventory"
              className={cn(
                buttonBase,
                "relative px-4 sm:px-4",
                isActive('inventory') ? buttonActive : buttonNormal
              )}
            >
              <SaddlebagIcon className={iconClass} />
              <span className="hidden sm:block text-[10px] font-medium">Saddlebag</span>
              {inventory.length > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 sm:h-4 sm:min-w-4 px-1 flex items-center justify-center bg-amber-600 text-white text-[9px] font-bold rounded-full">
                  {inventory.length}
                </Badge>
              )}
            </Button>

            {/* Quests */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('quests')}
              aria-label="Quest Journal"
              className={cn(
                buttonBase,
                "relative",
                isActive('quests') ? buttonActive : buttonNormal
              )}
            >
              <JournalIcon className={iconClass} />
              <span className="hidden sm:block text-[10px] font-medium">Journal</span>
              {activeQuests.length > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 sm:h-4 sm:min-w-4 px-1 flex items-center justify-center bg-yellow-600 text-white text-[9px] font-bold rounded-full">
                  {activeQuests.length}
                </Badge>
              )}
            </Button>

            {/* Menu (includes Settings) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('menu')}
              aria-label="Menu"
              className={cn(buttonBase, isActive('menu') ? buttonActive : buttonNormal)}
            >
              <MenuIcon className={iconClass} />
              <span className="hidden sm:block text-[10px] font-medium">Menu</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
