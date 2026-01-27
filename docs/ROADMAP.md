# Iron Frontier - Development Roadmap

## Current State: v0.1 Release Candidate

The game has complete monorepo infrastructure with DRY cross-platform architecture.

### What Works
- [x] **Monorepo Architecture** - pnpm workspaces with apps/packages structure
- [x] **Web App** - Vite + React 19 + Babylon.js 8 (WebGPU)
- [x] **Mobile App** - Expo SDK 54 + React Native 0.81 + Filament
- [x] **Shared Package** - Zod v4 schemas, 15,000+ lines of generation code
- [x] **CI/CD Pipelines** - GitHub Actions for web, mobile, and docs
- [x] **Documentation Site** - Astro + Starlight
- [x] **203 Tests Passing** - Vitest unit + Playwright E2E
- [x] **SQLite Persistence** - sql.js (web) + expo-sqlite (mobile)
- [x] **Responsive UI** - Mobile-first with breakpoint scaling (320px-1920px)
- [x] **Procedural Generation** - Daggerfall-style seeded content

### What Needs Testing/Refinement
- [ ] Mobile touch controls need real device testing
- [ ] Performance optimization for 60fps on mobile
- [ ] Audio system (western ambient music and SFX)
- [ ] PWA manifest for offline support

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

| Test Suite | Tests | Status |
|-----------|-------|--------|
| Web App (apps/web) | ~150 | Passing |
| Shared Package (packages/shared) | ~50 | Passing |
| Playwright E2E | ~3 | Passing |

**Total**: 203 tests passing

---

## Immediate Next Steps (For Any Agent)

1. **Verify game runs**: `pnpm dev` and check browser at http://localhost:8080
2. **Run tests**: `pnpm test` - all 203 should pass
3. **Check TypeScript**: `pnpm typecheck` - zero errors
4. **Test mobile viewport**: 320px-414px widths in DevTools
5. **Review PR #1**: All AI review comments resolved
6. **Deploy to Render.com**: Blueprint configured

### Key Commands
```bash
pnpm dev              # Web dev server (port 8080)
pnpm test             # All tests
pnpm typecheck        # TypeScript check all packages
pnpm build            # Production build (7.7 MB)
pnpm lint             # Biome linting
```

The monorepo infrastructure is complete. Focus should now shift to **v0.1 release** and **mobile device testing**.
