# Iron Frontier - Game Design Document

## Vision Statement

Iron Frontier is a **mobile-first isometric RPG** that captures the atmosphere of classic PS1-era RPGs (like Final Fantasy VII's pre-rendered backgrounds) while leveraging modern procedural generation and touch-first design.

The game should be:
- **Compelling within 30 seconds** of starting
- **Playable for 20+ minutes** with meaningful progression
- **Fun on a phone** with thumb-friendly controls
- **Visually distinctive** with its steampunk frontier theme

---

## Core Gameplay Loop

```
    ┌──────────────┐
    │   EXPLORE    │ ◄─── Move through sectors
    └──────┬───────┘      Discover landmarks
           │
           v
    ┌──────────────┐
    │   COLLECT    │ ◄─── Pick up items
    └──────┬───────┘      Gain XP
           │
           v
    ┌──────────────┐
    │    TALK      │ ◄─── Meet NPCs
    └──────┬───────┘      Get quests
           │
           v
    ┌──────────────┐
    │   IMPROVE    │ ◄─── Level up
    └──────┬───────┘      Better gear
           │
           v
    ┌──────────────┐
    │   UNLOCK     │ ◄─── New sectors
    └──────┬───────┘      New abilities
           │
           └──────────────► REPEAT
```

### "One More Minute" Hooks

The game uses multiple motivational systems:

1. **Short-term goals**: Always visible next objective
2. **Loot dopamine**: Frequent item drops with rarity tiers
3. **Micro-upgrades**: Small but frequent stat improvements
4. **New traversal**: Unlock doors, paths, vehicles
5. **Story hooks**: Intriguing NPCs and mysteries
6. **Map reveals**: Fog of war / gated zones

---

## Player Experience Timeline

### First 30 Seconds
- Splash screen with atmospheric branding
- Quick menu with clear "Begin Adventure" CTA
- Name entry (optional, defaults work)
- Immediate drop into first sector

### First 5 Minutes
- Tutorial-lite: Tap to move is intuitive
- Find first item (satisfying pickup animation)
- Meet first NPC with personality
- Receive first quest with clear objective
- Understand health/gold/XP from HUD

### First 20 Minutes
- Visit 2-3 sectors with different themes
- Complete first quest chain
- Level up at least once
- Find rare item
- Encounter first challenge (puzzle/stealth)
- Meet 3-5 distinct NPCs
- Understand inventory and quest systems

---

## Control Systems

### Primary: Tap-to-Move
- Tap anywhere on walkable ground to move
- Character pathfinds to destination
- Tap on NPC to approach and talk
- Tap on item to approach and collect
- Long-press for context menu (future)

### Secondary: Virtual Joystick (Toggle)
- Optional floating joystick
- Appears on touch, disappears on release
- Direct 360° movement control
- Better for precise movement

### Camera Controls
- Two-finger pan to rotate view
- Pinch to zoom in/out
- Auto-follow player (smooth)
- Bounds to keep player visible

### Touch Target Guidelines
- Minimum 44x44px for all interactive elements
- Generous hit detection for world objects
- Visual feedback before action confirms
- Haptic feedback on interactions

---

## World Design

### Sector Structure
Each sector is a 24x24 grid (48x48 world units):
- Multiple landmarks (buildings, plazas)
- Connected by carved paths
- 2-4 exits to other sectors
- Theme-appropriate props and NPCs

### Sector Themes

| Theme | Setting | Props | NPCs | Color |
|-------|---------|-------|------|-------|
| Town | Frontier settlement | Crates, barrels, lamps, troughs | Sheriff, merchant, inventor | Warm amber |
| Desert | Arid wasteland | Cacti, rocks, pipes, windmills | Prospector, hermit, bandit | Sandy tan |
| Railyard | Train station | Crates, gears, anvils, lamps | Engineer, conductor, mechanic | Industrial gray |
| Mine | Underground cavern | Lamps, rocks, barrels, pipes | Miner, foreman, geologist | Dark brown |

### Landmark Types
- **Saloon**: Social hub, quest givers
- **General Store**: Merchant, supplies
- **Workshop**: Crafting, upgrades (future)
- **Station**: Travel hub, sector transitions
- **Plaza**: Town square, events
- **Camp**: Rest point, side quests

---

## Character Systems

### Player Stats
| Stat | Base | Per Level | Purpose |
|------|------|-----------|---------|
| Health | 100 | +10 | Survival |
| Stamina | 100 | +5 | Actions (future) |
| Level | 1 | - | Progression gate |
| XP | 0 | Scales | Reach next level |
| Gold | 50 | - | Economy |
| Reputation | 0 | - | Faction standing |

### Experience Gains
| Action | XP |
|--------|-----|
| Collect common item | 5 |
| Collect uncommon item | 10 |
| Collect rare item | 20 |
| Collect legendary item | 50 |
| Talk to new NPC | 15 |
| Complete quest step | 25 |
| Complete quest | 100 |
| Discover new sector | 50 |

### Level Progression
```
Level 1:  0 XP needed
Level 2:  100 XP
Level 3:  150 XP (1.5x)
Level 4:  225 XP
Level 5:  337 XP
...continues at 1.5x scaling
```

---

## Item System

### Rarity Tiers
| Tier | Color | Drop Rate | XP | Sell Value |
|------|-------|-----------|-----|------------|
| Common | Amber | 55% | 5 | 1-5 gold |
| Uncommon | Green | 30% | 10 | 5-15 gold |
| Rare | Purple | 12% | 20 | 15-50 gold |
| Legendary | Gold | 3% | 50 | 50-200 gold |

### Item Categories

**Consumables** (usable)
- Bandage: Heal 25 HP
- Medicinal Tonic: Heal 50 HP
- Stamina Elixir: Restore stamina (future)

**Materials** (crafting/selling)
- Brass Screws
- Copper Wire
- Coal Chunk
- Steam Core
- Precision Gear

**Key Items** (quest gates)
- Ancient Map
- Workshop Key
- Automaton Eye

**Equipment** (future)
- Hats, coats, tools
- Stat modifiers
- Special abilities

### Inventory
- 20 slots maximum
- Stackable items (materials)
- Quick-use for consumables
- Drop option for cleanup

---

## Quest System

### Quest Structure
```typescript
interface Quest {
  id: string;
  title: string;           // "The Missing Gear"
  description: string;     // Full context
  giverNpcId: string;      // Who gives it
  steps: QuestStep[];      // Sequential objectives
  rewards: {
    xp: number;
    gold: number;
    items?: string[];
  };
}
```

### Quest Types
1. **Fetch**: Collect X items
2. **Delivery**: Bring item to NPC
3. **Talk**: Speak to specific NPC
4. **Explore**: Discover location
5. **Defeat**: Complete encounter (future)

### Example Quest Chain

**Quest 1: "Welcome to Rustwater"**
- Step 1: Talk to Sheriff Ironside
- Step 2: Collect 3 Brass Screws
- Step 3: Return to Sheriff
- Reward: 100 XP, 25 Gold

**Quest 2: "The Inventor's Request"**
- Prerequisite: Complete Quest 1
- Step 1: Find Dr. Steamsworth
- Step 2: Retrieve Steam Core from mine
- Step 3: Deliver to Dr. Steamsworth
- Reward: 150 XP, 50 Gold, Uncommon item

---

## NPC System

### NPC Roles
| Role | Function | Quest Potential |
|------|----------|-----------------|
| Sheriff | Law, main quests | High |
| Merchant | Trading | Medium |
| Prospector | Mining info | Medium |
| Inventor | Gadgets, upgrades | High |
| Saloon Keeper | Rumors, side quests | Medium |
| Engineer | Railroad quests | High |
| Mechanic | Repairs | Low |
| Civilian | Flavor, hints | Low |

### Personality System
NPCs have randomly assigned personalities:
- Gruff but kind-hearted
- Suspicious of strangers
- Eager to share tall tales
- Haunted by the past
- Optimistic dreamer
- Shrewd businessperson
- Weary traveler
- Eccentric genius

### Dialogue Generation
```
[Greeting based on personality]
"Howdy, stranger. Name's {name}."

[Personality-specific line]
"Don't got time for pleasantries, but I respect hard work."

[Quest hook if applicable]
"Say... you look capable. Got a job needs doing."
```

---

## Encounter System (Future)

### Encounter Types

**Puzzle Rooms**
- Gear alignment puzzles
- Pressure plate sequences
- Steam valve timing
- Reward: Items, XP, shortcuts

**Stealth Sections**
- Avoid patrol patterns
- Use cover and timing
- Detection = combat or reset
- Reward: Bonus loot, story

**Repair Challenges**
- Timed mini-games
- Match gears, connect pipes
- Skill-based rewards
- Reward: Access, items

**Chase Sequences**
- Escape collapsing area
- Dodge obstacles
- Quick decisions
- Reward: Story progression

### Difficulty Scaling
- Encounters have difficulty 1-4
- Player level affects success
- Rewards scale with difficulty
- Optional retry with hints

---

## Economy

### Currency: Gold
- Primary trade currency
- Earned from quests, selling items
- Spent on items, services (future)

### Price Guidelines
| Item Type | Price Range |
|-----------|-------------|
| Bandage | 10 gold |
| Tonic | 25 gold |
| Common material | 5 gold |
| Uncommon material | 15 gold |
| Equipment (future) | 50-500 gold |

### Economy Balance
- Early game: Slightly scarce, encourages exploration
- Mid game: Comfortable, enables choices
- Late game: Abundant, focus on rare items

---

## Progression Gates

### Soft Gates
- Level recommendations
- Difficulty warnings
- NPC hints about preparation

### Hard Gates
- Key items required
- Quest prerequisites
- Reputation thresholds (future)

### Sector Unlocking
```
Start: Rustwater (Town)
    │
    ├── Level 2 → Scorched Flats (Desert)
    │
    ├── Quest Complete → Junction 47 (Railyard)
    │
    └── Key Item → Deepvein Shaft (Mine)
```

---

## Save System

### Auto-save Triggers
- Entering new sector
- Completing quest
- Every 30 seconds during play
- Before boss encounters (future)

### Save Data
- Player stats and position
- Inventory contents
- Quest progress
- World state (collected items, talked NPCs)
- Settings

### Multiple Saves (Future)
- 3 manual save slots
- 1 auto-save slot
- Cloud sync option

---

## Accessibility

### Visual
- High contrast UI option
- Scalable text size
- Color-blind friendly indicators
- Clear iconography

### Motor
- Large touch targets
- Adjustable controls
- No time-critical main gameplay
- Pause anytime

### Cognitive
- Clear objectives always visible
- Minimal UI clutter
- Consistent interactions
- Optional tutorials

### Settings
```typescript
interface GameSettings {
  musicVolume: number;      // 0-1
  sfxVolume: number;        // 0-1
  haptics: boolean;         // Vibration feedback
  controlMode: 'tap' | 'joystick';
  reducedMotion: boolean;   // Respect system pref
  showMinimap: boolean;
  lowPowerMode: boolean;    // Reduce visual effects
}
```

---

## Technical Constraints

### Mobile Performance
- Target 60fps, graceful degradation to 30fps
- Dynamic resolution scaling
- Aggressive LOD and culling
- Minimal draw calls via instancing
- Asset pooling and reuse

### Memory Budget
- ~100MB total asset budget
- Lazy load sectors
- Dispose unused scenes
- Texture compression

### Battery Consideration
- Low power mode option
- Reduce particle effects
- Lower frame rate option
- Efficient render loop
