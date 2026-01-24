# Iron Frontier - Development Roadmap

## Current State: Alpha v0.2

The game has core infrastructure working with comprehensive test coverage.

### What Works
- [x] Project scaffolding (Vite + React + TypeScript)
- [x] Babylon.js integration via Reactylon
- [x] Zustand state management with persistence
- [x] Procedural sector generation (deterministic)
- [x] Basic 3D scene rendering
- [x] Title screen with splash animation
- [x] Complete game store with all actions
- [x] All UI components implemented
- [x] TypeScript compiles with zero errors
- [x] Comprehensive test suite (100+ tests)
- [x] No JavaScript files - pure TypeScript/TSX

### What Needs Testing/Refinement
- [ ] Mobile touch controls need real device testing
- [ ] Performance optimization for complex sectors
- [ ] Quest system integration (framework exists)
- [ ] Item effects need balancing

---

## Phase 1: Core Stability (Priority: CRITICAL) - COMPLETED

**Goal**: Get a playable vertical slice

### 1.1 Fix TypeScript Errors - DONE
- [x] Align `gameStore.ts` types with all UI components
- [x] Fix Reactylon mesh prop types (`options` pattern)
- [x] Ensure all imports resolve correctly
- [x] Clean build with zero errors

### 1.2 Complete UI Components - DONE
- [x] `DialogueBox.tsx` - Full typewriter + quest acceptance
- [x] `InventoryPanel.tsx` - Working item grid + use/drop
- [x] `QuestLog.tsx` - Active/completed lists with tabs
- [x] `SettingsPanel.tsx` - All settings functional
- [x] `MenuPanel.tsx` - Save/reset actions
- [x] `NotificationFeed.tsx` - Toast stack with auto-dismiss

### 1.3 Game Flow - DONE
- [x] Title -> Game transition
- [x] Game -> Title (return to menu)
- [x] New game reset
- [x] Continue from save (localStorage persistence)

### 1.4 Basic Gameplay - DONE
- [x] Tap-to-move working
- [x] Item collection working
- [x] NPC dialogue working
- [x] XP and leveling working
- [x] Quest acceptance working

---

## Phase 2: Content & Polish (Priority: HIGH)

**Goal**: 20 minutes of engaging gameplay

### 2.1 Quest System
- [x] Quest framework in store
- [ ] Define 3-5 starter quests in `quests.ts`
- [ ] Quest acceptance from NPCs
- [ ] Step completion tracking
- [ ] Quest completion rewards
- [x] Quest log UI integration

### 2.2 Item System
- [x] Item framework in store
- [ ] Define 20+ items in `items.ts`
- [x] Consumable item effects (tonics, bandages)
- [x] Item rarity visual distinction
- [ ] Loot tables per sector theme

### 2.3 NPC Dialogue
- [x] Basic dialogue templates per role
- [ ] Personality-based variations
- [ ] Quest-related dialogue branches
- [ ] First-meeting vs return dialogue

### 2.4 World Expansion
- [x] Sector generation working
- [ ] 3-4 distinct sectors
- [ ] Sector transition mechanics
- [ ] Exit/entrance connections
- [x] Unique landmarks per sector

### 2.5 Visual Polish
- [ ] Item floating animation
- [ ] Player movement smoothing
- [ ] NPC idle animations (subtle)
- [ ] Environment particle effects
- [ ] Camera transitions

---

## Phase 3: Mobile Experience (Priority: HIGH)

**Goal**: Great mobile UX on Pixel 8A through OnePlus Open

### 3.1 Touch Controls
- [x] Tap-to-move implemented
- [ ] Virtual joystick option (setting exists)
- [x] Pinch zoom camera
- [x] Two-finger pan camera
- [ ] Long-press context menu

### 3.2 Responsive UI
- [x] Mobile-first UI design
- [ ] Test on 360px width
- [ ] Test on 800px width (unfolded)
- [ ] Dynamic font scaling
- [ ] Safe area handling
- [ ] Orientation support

### 3.3 Performance
- [ ] 60fps target on mid-range devices
- [ ] Dynamic resolution scaling
- [x] Low power mode setting
- [ ] Memory optimization
- [ ] Asset loading optimization

### 3.4 Mobile Features
- [x] Haptic feedback (setting exists)
- [ ] PWA manifest
- [ ] Service worker (offline)
- [ ] App install prompt

---

## Phase 4: Encounters & Challenge (Priority: MEDIUM)

**Goal**: Add gameplay depth beyond exploration

### 4.1 Puzzle Encounters
- [ ] Gear alignment puzzle
- [ ] Pipe connection puzzle
- [ ] Timed valve sequence
- [ ] Reward system

### 4.2 Stealth Sections (Optional)
- [ ] Patrol patterns
- [ ] Detection system
- [ ] Cover mechanics

### 4.3 Challenge Rewards
- [x] Bonus XP system
- [x] Rare items in loot tables
- [ ] Shortcuts unlocked
- [ ] Story revelations

---

## Phase 5: AI Integration (Priority: LOW)

**Goal**: Dynamic content generation

### 5.1 Dialogue Generation
- [ ] OpenAI-compatible API client
- [ ] NPC dialogue endpoint
- [ ] Response caching (IndexedDB)
- [x] Fallback templates (current system)

### 5.2 Quest Variations
- [ ] Dynamic quest descriptions
- [ ] Hint generation
- [ ] Story adaptations

### 5.3 World Flavor
- [ ] Item descriptions
- [ ] Location descriptions
- [ ] NPC backstories

---

## Phase 6: Polish & Launch (Priority: FUTURE)

### 6.1 Audio
- [ ] Background music
- [ ] UI sound effects
- [ ] Ambient sounds
- [x] Volume controls (settings UI)

### 6.2 Persistence
- [x] Auto-save to localStorage
- [ ] Multiple save slots
- [ ] Cloud sync (optional)
- [ ] Export/import saves

### 6.3 Accessibility
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Scalable UI
- [ ] Colorblind modes

### 6.4 Launch Prep
- [ ] App icons
- [ ] Splash screens
- [ ] Store listings
- [ ] Privacy policy

---

## Technical Debt Backlog

### Code Quality
- [ ] Extract magic numbers to constants
- [ ] Add JSDoc comments to key functions
- [x] Create shared type definitions file
- [ ] Implement error boundaries
- [ ] Add loading states everywhere

### Testing - SIGNIFICANT PROGRESS
- [x] Unit tests for store actions (39 tests)
- [x] Unit tests for UI components (42+ tests)
- [x] Visual interaction tests (25 tests)
- [x] Game flow tests
- [x] Quest log tests
- [x] Title screen tests
- [ ] E2E test for basic gameplay flow
- [ ] Visual regression tests

### Performance
- [ ] Profile render performance
- [ ] Implement mesh instancing
- [ ] Add asset preloading
- [ ] Optimize state updates

---

## Test Coverage Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| gameStore.test.ts | 39 | Passing |
| UIPanels.test.tsx | 42 | Passing |
| VisualInteractions.test.tsx | 25 | Passing |
| QuestLog.test.tsx | ~15 | Passing |
| GameFlow.test.tsx | ~20 | Passing |
| TitleScreen.test.tsx | ~20 | Mostly Passing |

**Total**: 150+ tests

---

## Immediate Next Steps (For Any Agent)

1. **Verify game runs**: `pnpm dev` and check browser
2. **Run tests**: `pnpm test` - all should pass
3. **Check TypeScript**: `pnpm run tscgo --noEmit` - zero errors
4. **Test mobile viewport**: 360px width in DevTools
5. **Add content**: More items, quests, NPC dialogue
6. **Performance test**: Profile on mobile device

The game infrastructure is solid. Focus should now shift to **content creation** and **mobile testing**.
