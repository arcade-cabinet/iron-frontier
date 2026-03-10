# Iron Frontier - UI Components Reference

## Component Overview

All UI components live in `apps/web/src/game/ui/` and follow these principles:
- Mobile-first responsive design (320px - 1920px)
- Consistent steampunk/frontier theming
- shadcn/ui base components with custom styling
- Zustand store integration
- Touch targets minimum 44px (iOS HIG)

---

## Component Inventory

### Currently Implemented

| Component | File | Purpose | Store Dependencies |
|-----------|------|---------|-------------------|
| GameHUD | `GameHUD.tsx` | Top stats display | player, currentSector, activeQuests |
| ActionBar | `ActionBar.tsx` | Bottom navigation (5 buttons) | toggles, inventory.length, activeQuests.length |
| DialogueBox | `DialogueBox.tsx` | FF7-style branching dialogue | dialogueOpen, selectedNPC, dialogueText |
| InventoryPanel | `InventoryPanel.tsx` | Grid with categories/filters | inventoryOpen, inventory, player |
| QuestLog | `QuestLog.tsx` | Active/completed quests | questLogOpen, activeQuests, completedQuests |
| MenuPanel | `MenuPanel.tsx` | Game/Settings tabs | menuOpen, player |
| CharacterPanel | `CharacterPanel.tsx` | Stats and equipment | characterOpen, player, equipment |
| CombatPanel | `CombatPanel.tsx` | Turn-based combat UI | combatState, enemies, abilities |
| ShopPanel | `ShopPanel.tsx` | Buy/sell interface | shopOpen, inventory, gold |
| WorldMap | `WorldMap.tsx` | Region navigation | worldMapOpen, regions, currentLocation |
| TravelPanel | `TravelPanel.tsx` | Route progress and encounters | travelState, currentRoute |
| GameOverScreen | `GameOverScreen.tsx` | Death/restart UI | gameOver |
| NotificationFeed | `NotificationFeed.tsx` | Toast messages | notifications |

### Planned / Backlog

| Component | Purpose | Priority |
|-----------|---------|----------|
| VirtualJoystick | Alternative movement control | Medium |
| Minimap | Sector overview | Low |
| ContextMenu | Long-press actions | Low |
| CraftingPanel | Item creation | Low |

---

## Component Specifications

### GameHUD

**Location**: Top of screen, always visible during gameplay

**Layout**:
```
┌─────────────┐                    ┌──────────────┐
│ Sector Name │                    │ ❤️ ████░░ 75 │
│ ⭐ Level 3  │                    │ ⭐ ██░░░░ 45 │
└─────────────┘                    │ 💰 150      │
                                   └──────────────┘
┌─────────────────────────────────────────────────┐
│ 📜 Current Quest: Find the Steam Core           │
│    Next: Search the abandoned workshop          │
└─────────────────────────────────────────────────┘
```

**Implementation**:
```tsx
export function GameHUD() {
  const { player, currentSector, activeQuests } = useGameStore();
  
  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none">
      {/* Two-column layout for stats */}
      {/* Optional quest tracker below */}
    </div>
  );
}
```

---

### ActionBar

**Location**: Bottom of screen, fixed position

**Layout**:
```
┌─────────────────────────────────────────────────┐
│   [Menu]    [Items 5]   [Quests 2]  [Settings]  │
└─────────────────────────────────────────────────┘
```

**Features**:
- Badge counts on Items and Quests
- Each button toggles respective panel
- Closes other panels when opening one

**Implementation**:
```tsx
export function ActionBar() {
  const { toggleMenu, toggleInventory, toggleQuestLog, toggleSettings, 
          activeQuests, inventory } = useGameStore();
  
  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 pb-safe">
      <Card className="bg-amber-950/95 border-amber-700/50">
        {/* Four icon buttons with labels */}
      </Card>
    </div>
  );
}
```

---

### DialogueBox

**Location**: Bottom of screen, above ActionBar when visible

**Style**: FF7-inspired text box with typewriter effect

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Marshal Cogburn                        [Quest]  │
├─────────────────────────────────────────────────┤
│ Howdy, stranger. Name's Marshal Cogburn.        │
│                                                 │
│ We've got trouble brewin' at the old mine.     │
│ Could use someone with your look about 'em.▌   │
├─────────────────────────────────────────────────┤
│                              Tap to continue    │
└─────────────────────────────────────────────────┘
```

**Features**:
- Typewriter text animation (30ms per character)
- Tap to skip animation or continue
- Quest badge if NPC offers quest
- Portrait area (future)

**State Flow**:
```
talkToNPC(npc) → dialogueOpen=true, selectedNPC=npc
    │
    v
Generate/display dialogue with typewriter
    │
    v
[Tap] → If typing: skip to end
        If complete: close or accept quest
    │
    v
closeDialogue() → dialogueOpen=false
```

---

### InventoryPanel

**Location**: Bottom sheet (slides up from bottom)

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Saddlebag                              💰 150   │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Brass    │ │ Steam    │ │ Bandage  │         │
│ │ Screws   │ │ Core     │ │ [USE]    │         │
│ │ Common   │ │ Uncommon │ │ Common   │         │
│ │ x5       │ │ x1       │ │ x3       │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                 │
│ ┌──────────┐ ┌──────────┐                       │
│ │ Copper   │ │ Ancient  │                       │
│ │ Wire     │ │ Map      │                       │
│ │ Common   │ │ Rare     │                       │
│ │ x12      │ │ x1       │                       │
│ └──────────┘ └──────────┘                       │
└─────────────────────────────────────────────────┘
```

**Features**:
- Grid layout (2 columns on mobile)
- Rarity-colored badges
- Stack counts
- Use button for consumables
- Drop action (hold or menu)

---

### QuestLog

**Location**: Bottom sheet

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Journal                                         │
├─────────────────────────────────────────────────┤
│ ACTIVE QUESTS                                   │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ The Missing Gear                          │   │
│ │ Help Sheriff Ironside investigate         │   │
│ │ ─────────────────────────────────────────│   │
│ │ ✓ Talk to Sheriff Ironside               │   │
│ │ ○ Find 3 brass screws                    │   │
│ │ ○ Return to Sheriff                      │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│ COMPLETED (2)                                   │
│ ┌───────────────────────────────────────────┐   │
│ │ Welcome to Rustwater            ✓ Done    │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Features**:
- Separate active/completed sections
- Step checklist with completion state
- Quest rewards preview
- Collapsible completed section

---

### SettingsPanel

**Location**: Bottom sheet

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Settings                                        │
├─────────────────────────────────────────────────┤
│ AUDIO                                           │
│ Music Volume          [━━━━━━━○━━━] 70%         │
│ Sound Effects         [━━━━━━━━○━] 80%          │
│                                                 │
│ CONTROLS                                        │
│ Control Mode          [Virtual Joystick ▼]       │
│ Haptic Feedback       [ON]                      │
│                                                 │
│ DISPLAY                                         │
│ Show Minimap          [ON]                      │
│ Reduced Motion        [OFF]                     │
│ Low Power Mode        [OFF]                     │
├─────────────────────────────────────────────────┤
│ [Save Progress]                                 │
└─────────────────────────────────────────────────┘
```

**Settings**:
```typescript
interface GameSettings {
  musicVolume: number;      // Slider 0-1
  sfxVolume: number;        // Slider 0-1
  haptics: boolean;         // Toggle
  controlMode: 'tap' | 'joystick';  // Select
  reducedMotion: boolean;   // Toggle
  showMinimap: boolean;     // Toggle
  lowPowerMode: boolean;    // Toggle
}
```

---

### MenuPanel

**Location**: Left-side sheet (slides from left)

**Layout**:
```
┌───────────────────────────┐
│ IRON FRONTIER             │
├───────────────────────────┤
│ ┌───────────────────────┐ │
│ │ Wanderer              │ │
│ │ Level 3               │ │
│ │ XP: 45/225            │ │
│ │ Health: 110/110       │ │
│ │ Gold: 150             │ │
│ └───────────────────────┘ │
├───────────────────────────┤
│ [Save Progress]           │
│ [Return to Title]         │
│ [New Journey]             │
└───────────────────────────┘
```

**Actions**:
- Save: Triggers save and notification
- Return to Title: Goes to main menu (keeps save)
- New Journey: Resets game (with confirmation)

---

### NotificationFeed

**Location**: Top-center, below HUD

**Layout**:
```
          ┌─────────────────────┐
          │ Found: Steam Core   │ ← Newest
          └─────────────────────┘
          ┌─────────────────────┐
          │ +50 XP              │
          └─────────────────────┘
          ┌─────────────────────┐
          │ Level Up! Now Lv 3  │ ← Oldest visible
          └─────────────────────┘
```

**Features**:
- Max 5 visible notifications
- Auto-dismiss after 3 seconds
- Stacked with newest on top
- Different styles per type (item, xp, quest, level)

**Types**:
```typescript
type NotificationType = 'item' | 'xp' | 'quest' | 'level' | 'info';

const notificationStyles = {
  item: 'border-amber-500',
  xp: 'border-yellow-500',
  quest: 'border-blue-500',
  level: 'border-purple-500 bg-purple-900/20',
  info: 'border-stone-500',
};
```

---

## Shared UI Patterns

### Panel Base Structure
```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

function Panel({ open, onOpenChange, title, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[70vh] bg-amber-950 border-amber-700"
      >
        <SheetHeader>
          <SheetTitle className="text-amber-100">{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full mt-4">
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
```

### Card Styling
```tsx
// Standard game card
<Card className="bg-amber-900/50 border-amber-700/50">
  <CardContent className="p-3">
    {/* Content */}
  </CardContent>
</Card>

// Highlighted card (rare item, active quest)
<Card className="bg-amber-800/60 border-amber-500/70">
```

### Button Variants
```tsx
// Primary action
<Button className="bg-amber-700 hover:bg-amber-600 text-white">

// Secondary action
<Button className="bg-stone-700 hover:bg-stone-600 text-stone-200">

// Destructive action
<Button className="bg-red-900/50 hover:bg-red-800/50 text-red-300 border-red-700">

// Ghost (navigation)
<Button variant="ghost" className="text-amber-200 hover:bg-amber-800/50">
```

### Badge Colors (Rarity)
```tsx
const rarityClasses = {
  common: 'bg-amber-600 text-amber-950',
  uncommon: 'bg-green-500 text-green-950',
  rare: 'bg-purple-500 text-purple-950',
  legendary: 'bg-yellow-400 text-yellow-950',
};
```

---

## Animation Patterns

### Panel Entry
```tsx
// Sheet already handles slide animation
// For custom panels:
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 25 }}
>
```

### Notification Entry
```tsx
<motion.div
  initial={{ opacity: 0, y: -20, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -10, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
```

### Item Pickup Feedback
```tsx
// In NotificationFeed, item type gets special treatment:
<motion.div
  initial={{ scale: 1.2, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="border-amber-500"
>
  Found: {itemName}
</motion.div>
```

---

## Accessibility Checklist

### Each Component Should:
- [ ] Have proper ARIA labels
- [ ] Support keyboard navigation (when applicable)
- [ ] Respect `reducedMotion` setting
- [ ] Have sufficient color contrast
- [ ] Include proper focus indicators
- [ ] Use semantic HTML elements

### Touch Targets
- Minimum 44x44px for all buttons
- 8px minimum spacing between targets
- Visual feedback on press

### Screen Reader Support
```tsx
// Example: Badge with count
<Badge aria-label={`${count} items in inventory`}>
  {count}
</Badge>

// Example: Progress bar
<Progress 
  value={healthPercent} 
  aria-label={`Health: ${player.health} of ${player.maxHealth}`}
/>
```
