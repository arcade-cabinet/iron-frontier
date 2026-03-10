# Parity Assessment - Legacy React/Expo vs Ionic Angular

## Scope
Baseline source of truth: legacy React UI/UX in `release/v0.1-candidate` (`apps/web/src/game/**/*.tsx`) plus shared data in `packages/shared`.
Target: `src/app/game/**` (Ionic Angular).
Reference: `memory-bank/parity-matrix.md` for a per‑panel gap table.

## Alignment Summary (This Pass)
- **Title Screen**: Restored legacy splash + menu layout, button order, name input flow, and About modal copy.
- **Game HUD**: Restored legacy layout (top bar + secondary location/quest row) and styling cues.
- **World Map**: Restored legacy bottom sheet layout, legend, paper texture, compass, fog/discovery gating, tooltip content, and travel options list.
- **Game Page**: Restored legacy overlay structure, loading/error overlays, keyboard shortcuts (M/Escape), audio init, and scene reload on travel.
- **Character Panel**: Restored legacy sheet layout, stat bars, combat stats, equipment list with rarity colors, and reputation status.
- **Menu Panel**: Restored legacy sheet layout, tabs, player card, quick actions, settings sections, and confirmation prompts.
- **Inventory/Quest Log**: Expanded toward legacy parity (badges, stage/reward UI), still requires visual validation.
- **Dialogue/Combat**: Layout, prompts, and action flows restored; requires visual and interaction parity check.

## Component Parity Checklist

### Core Screens
- **TitleScreen (legacy `TitleScreen.tsx`)**
  - Status: **Aligned**
  - Notes: Splash timing, gear animations, menu layout, and About modal copy now mirror legacy.

- **Game Root (`Game.tsx`)**
  - Status: **Aligned (core flow)**
  - Notes: Overlay structure and scene lifecycle now mirror legacy; travel reloads reinitialize scene.

### UI Panels / HUD
- **GameHUD (`GameHUD.tsx`)**
  - Status: **Aligned**
  - Notes: Top bar + secondary location/quest row matches legacy layout and data.

- **ActionBar (`ActionBar.tsx`)**
  - Status: **Likely aligned**
  - Notes: Button layout and labels match legacy; needs visual compare for exact spacing.

- **InventoryPanel (`InventoryPanel.tsx`)**
  - Status: **Partial**
  - Notes: Detail panel, badges, stats, and empty state restored; needs visual parity check and breakpoint validation.

- **CharacterPanel (`CharacterPanel.tsx`)**
  - Status: **Aligned**
  - Notes: Sheet layout, stat bars, combat stats, equipment list, reputation status now mirror legacy.

- **QuestLog (`QuestLog.tsx`)**
  - Status: **Partial**
  - Notes: Stage UI, badges, objective markers, rewards preview, and sorting restored; needs visual parity check and copy validation.

- **MenuPanel (`MenuPanel.tsx`)**
  - Status: **Aligned**
  - Notes: Tabs, settings, confirmation prompts, and player card now mirror legacy.

- **WorldMap (`WorldMap.tsx`)**
  - Status: **Aligned**
  - Notes: Bottom sheet, map render, legend, tooltip, and travel options match legacy behavior.

### Gameplay Overlays
- **DialogueBox (`DialogueBox.tsx`)**
  - Status: **Partial**
  - Notes: Typewriter, badges, choice layout, and prompts restored; verify spacing, icon treatment, and tap targets.

- **CombatPanel (`CombatPanel.tsx`)**
  - Status: **Partial**
  - Notes: Action bar, log, cards, and outcome overlays restored; verify spacing, audio timing, and mobile scroll behavior.

- **ShopPanel, TravelPanel, PipePuzzle, NotificationFeed, GameOverScreen**
  - Status: **Needs detailed parity audit**
  - Notes: Present and functional but not fully diffed against legacy TSX for layout and copy.

### Engine/Logic
- **Scene lifecycle + travel reload**
  - Status: **Aligned**
  - Notes: NPC/item markers, encounter logic, and travel-based scene reload behavior match legacy flow.

- **Audio init**
  - Status: **Aligned**
  - Notes: Initializes on game entry like legacy.

## Gaps Remaining (Next Pass)
1) **Shop/Travel/Notification/Pipe/GameOver parity**: full UI audit vs legacy, correct copy/layout drift.
2) **Dialogue/Combat visual parity**: spacing, icon treatments, scroll behavior, and tap targets.
3) **Inventory/Quest Log visual parity**: spacing, copy, and breakpoints.
4) **Verify copy/labels** match legacy for all panels.
5) **Visual parity** across breakpoints (mobile portrait/landscape/tablet/foldable) for each panel.
6) **Legacy animation/motion** parity where applicable (panel transitions, hover/active states).

## Tests Alignment
- Playwright adjusted to match legacy flow (Start button, menu label, world map open).
- Maestro flows updated for Start button and About modal text.

## Branch Creep / Best‑of‑Worlds
- Full assessment captured in `memory-bank/best-of-worlds-assessment.md`.
- Non‑aligned branches (Expo/Unity) are **harvest‑only** for data/specs, not stack changes.

## Self-Correction Notes
- Removed non-legacy world map “quick travel” UI in favor of legacy travel options list.
- Restored legacy menu/character panels to sheet-based layouts and feature parity.
- Re-aligned loading and error overlays to legacy copy and placement.
