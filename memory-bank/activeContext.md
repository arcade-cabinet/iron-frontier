# Active Context

## Current Focus

**Phase 9: Unity 6 Migration - COMPLETE** - Full game implementation with all systems ported and working.

## Session Summary (2026-01-26 - CI/CD & E2E Testing)

### CI/CD Pipeline Complete

1. **Release-Please Integration**:
   - `release-please-config.json` - Automated changelog/version management
   - `.release-please-manifest.json` - Version tracking (starts at 0.1.0)
   - Conventional commits → automatic releases on main branch
   - Changelog sections: Features, Bug Fixes, Performance, Refactoring, Docs, Tests, Build, CI

2. **GitHub Actions Workflow** (`.github/workflows/ci.yml`):
   - **Unity Tests**: EditMode tests with coverage reports via GameCI
   - **WebGL Build**: Deploys to GitHub Pages on main branch
   - **Android Build**: Debug APK uploaded to GitHub releases
   - **Playwright E2E**: WebGL tests on Chromium and Firefox
   - **Maestro E2E**: Android tests on Pixel 8 and Pixel Tablet emulators
   - Concurrency control, artifact caching, and summary reports

3. **Maestro Android Flows Updated** (all 10 flows):
   - Switched from `${IOS_APP_ID}` to `${ANDROID_APP_ID}`
   - Added priority tags (p0 for critical, p1 for standard)
   - Uses environment variables from `.maestro/config.yaml`
   - Error checking with `assertNotVisible: "Error"`

4. **Playwright WebGL Tests**:
   - `tests/e2e/playwright.config.ts` - WebGL-specific browser args
   - `tests/e2e/pages/GamePage.ts` - Unity WebGL page object
   - 4 test specs covering app launch, menu, character creation, gameplay
   - Chromium, Firefox, WebKit, mobile viewport support

### Environment Variables

```yaml
# .maestro/config.yaml
ANDROID_APP_ID: com.ironfrontier.game
DEFAULT_TIMEOUT: 15000
LONG_TIMEOUT: 30000
ANIMATION_TIMEOUT: 5000
PLAYER_NAME: "Dusty Rhodes"
```

---

## Session Summary (2026-01-26 - Continuation)

### System Integration Completed

1. **QuestManager Prerequisite Checks** (Task #27):
   - Full prerequisite checking: completed quests, player level, required items
   - Faction reputation requirements via `ReputationSystem`
   - Time-of-day restrictions via `TimeSystem` (Day, Night, Morning, Afternoon, Evening, LateNight)
   - Added `TimeRestriction` enum and `ReputationRequirement` struct to `QuestData.cs`
   - Added `PlayerLevel` property to `GameManager` with save/load support

2. **WorldEventManager Effect Application** (Task #28):
   - Implemented all 13 effect types: GiveGold, TakeGold, GiveItem, TakeItem, GiveXp, Heal, Damage
   - ChangeMorale, ChangeReputation, SetFlag, RemoveFlag, TriggerCombat, StartQuest
   - UnlockLocation, RevealLore, TriggerEvent (recursive event triggering)
   - Integrated with: `InventoryManager`, `ReputationSystem`, `QuestManager`, `ItemDatabase`
   - All effects publish appropriate events via `EventBus`

3. **Earlier Completed Tasks**:
   - **PlayerInteraction** (#22): WorldItem, ChestContainer, LootUI
   - **MainMenuUI** (#23): Full save/load integration with SaveSystem
   - **Inventory Drop** (#24): WorldItem spawning, ItemDropped event
   - **CombatUI Items** (#25): Consumable selection panel, buff effects
   - **ShopManager** (#26): TimeSystem and ReputationSystem integration

### Code Quality Fixes

- Updated `FindObjectOfType` → `FindFirstObjectByType` (Unity 6 deprecation warnings)
- Added `playerLevel` to `GameManagerSaveData` for save/load
- Updated `GameManager.ApplyLoadedState()` and `GetGameState()` for player level

---

## Session Summary (2026-01-26 - Original)

### Major Systems Implemented

1. **Survival Systems** (NEW):
   - `FatigueSystem.cs` - Player exhaustion with 5 levels (Rested→Collapsed), combat penalties, recovery
   - `ProvisionsSystem.cs` - Food/water tracking, foraging, hunting, dehydration damage
   - `CampingSystem.cs` - Rest mechanics, fire, random encounters, terrain modifiers

2. **Combat Skills System** (NEW):
   - `SkillData.cs` - ScriptableObject for 57 skills across player and companions
   - `SkillManager.cs` - Skill execution, cooldowns, effect processing
   - `SkillTargeting.cs` - Target validation, AoE calculations
   - 14 effect types: damage, heal, buff, debuff, stun, knockback, shield, taunt, stealth, mark, execute, etc.

3. **Reputation/Faction System** (NEW):
   - `FactionData.cs` - ScriptableObject with 5 factions (IVRC, Copperheads, Freeminers, Law, Townsfolk)
   - `ReputationSystem.cs` - 7 tiers (Hated→Revered), ripple effects, decay, action tracking
   - 235 faction actions across 10 categories (Quest, Combat, Trade, Crime, etc.)
   - Shop price modifiers, quest availability, NPC behavior based on reputation

4. **Loot System** (NEW):
   - `LootSystem.cs` - Weighted random drops, enemy loot mapping
   - `lootTables.json` - 25+ loot tables for enemies, containers, bosses

### Content Data Files Created

| File | Content |
|------|---------|
| `factions.json` | 5 factions with 235 actions, tier effects, relationships |
| `skills.json` | 57 combat skills for player and 6 companions |
| `lootTables.json` | 25+ weighted loot tables |

### Creative Vision Locked

**Iron Frontier is a hand-crafted 3-hour steampunk Western epic:**

- **NOT procedural** - Every quest, enemy, dialogue deliberately authored
- **10 main quests** - 3-act conspiracy story with multiple endings
- **15 side quests** - Character development, bounties, lore
- **38 enemy types** - All serving narrative (Wildlife, Raiders, Copperheads, IVRC, Remnants)
- **12 major NPCs** - Full dialogue trees with choices/consequences
- **5 factions** - Interlocking reputation affecting gameplay

### Test Status

- **167 tests total**
- **167 passed** (100%)
- **0 failed**

**Fixed Issues (2026-01-26):**
- QuestSystemTests: Fixed collection modification during enumeration with `.ToList()`
- QuestSystemTests: Fixed `GetQuest` to return full quest data for completed quests via `CompletedQuestData` dictionary
- DamageCalculatorTests: Fixed `CriticalChance_ShouldBeInValidRange(0)` - 0% crit is valid

### Build & E2E Testing Automation (NEW)

**Target Devices:**
- iPhone (15 Pro simulator)
- iPad (Pro simulator)
- Pixel 8a (API 34 emulator)
- Pixel Tablet (API 34 emulator)

**Maestro E2E Flows Created:**
| Flow | Tests |
|------|-------|
| `01-app-launch.yaml` | Smoke test, main menu verification |
| `02-main-menu.yaml` | Menu navigation |
| `03-new-game.yaml` | New game flow |
| `04-character-creation.yaml` | Name input, background selection, stats |
| `05-tutorial-combat.yaml` | Combat tutorial completion |
| `06-dialogue-system.yaml` | NPC dialogue, choices |
| `07-inventory-shop.yaml` | Inventory management, shop |
| `08-quest-tracking.yaml` | Quest log, tracking |
| `09-save-load.yaml` | Save/load functionality |
| `10-settings.yaml` | Audio, graphics, gameplay settings |

**CI/CD Pipeline:**
- `.github/workflows/ci.yml` - Full Unity build & test workflow
  - Unity EditMode tests with coverage
  - iOS build (macOS runner)
  - Android build (Ubuntu runner)
  - WebGL build (optional)
  - Maestro E2E tests on all 4 target devices
  - Automatic test summary report

**Local Build Scripts:**
- `scripts/build.sh [ios|android|webgl|macos] [release]`
- `scripts/setup-unity-modules.sh` - Install iOS/Android modules
- `scripts/local-e2e-test.sh` - Run Maestro tests locally
- `scripts/test-webgl.sh` - Build WebGL and run Playwright tests

**Playwright E2E Tests (WebGL):**
- `tests/e2e/` - Playwright test suite
- `tests/e2e/specs/01-app-launch.spec.ts` - App loading tests
- `tests/e2e/specs/02-main-menu.spec.ts` - Menu navigation
- `tests/e2e/specs/03-character-creation.spec.ts` - Character creation
- `tests/e2e/specs/04-gameplay.spec.ts` - Core gameplay tests
- `tests/e2e/pages/GamePage.ts` - Page object for Unity WebGL

**Test Commands:**
```bash
# Run Playwright E2E tests (WebGL)
cd tests/e2e && npm install && npm test

# Run with specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run Maestro mobile tests
./scripts/local-e2e-test.sh ios
./scripts/local-e2e-test.sh android
```

### File Statistics

| Category | Count |
|----------|-------|
| C# Scripts | 100+ |
| JSON Data Files | 37 |
| UXML Layouts | 9 |
| USS Stylesheets | 7 |
| Unity Scenes | 5 |
| Dialogue Trees | 12 |

---

## Unity 6 Project Structure

```
iron-frontier/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/       # GameManager, EventBus, SaveSystem
│   │   ├── Systems/    # Time, Weather, Fatigue, Provisions, Camping, Reputation, Loot
│   │   ├── Combat/     # CombatManager, Skills, DamageCalculator
│   │   ├── Dialogue/   # DialogueManager, UI, Effects
│   │   ├── Quests/     # QuestManager, Tracker
│   │   ├── Inventory/  # InventoryManager, Equipment
│   │   ├── Shop/       # ShopManager, Pricing
│   │   ├── AI/         # AIController, NPCBehavior
│   │   ├── Player/     # PlayerController, Stats, Camera
│   │   └── Data/       # ScriptableObjects (Items, NPCs, Factions, Skills)
│   ├── Resources/Data/ # JSON content (quests, dialogues, items, enemies)
│   ├── UI/             # UXML layouts, USS styles
│   └── Scenes/         # MainMenu, Overworld, Town, Combat, Loading
├── Packages/           # Unity packages (URP, Input, Cinemachine, etc.)
└── memory-bank/        # AI agent context
```

## Next Steps for Production

1. [ ] Create Unity prefabs for NPCs, enemies, items
2. [ ] Set up NavMesh surfaces for all scenes
3. [ ] Import 3D models and configure materials
4. [ ] Configure Cinemachine cameras per scene
5. [ ] Wire up UI Toolkit layouts to game systems
6. [ ] Add audio clips for music/SFX cues
7. [ ] Final polish pass on dialogue and quest text
8. [ ] Build and test on target platforms (iOS, Android, WebGL)

---

## Headless Development Commands

```bash
# Compile project
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -batchmode -quit -projectPath . -logFile -

# Run tests
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -batchmode -runTests -testPlatform EditMode -projectPath . -logFile -

# Build Android
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity -batchmode -quit -projectPath . -buildTarget Android -executeMethod BuildScript.BuildAndroid -logFile -
```
