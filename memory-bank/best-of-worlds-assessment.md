# Best-of-Worlds Assessment (Branches + Legacy + Current)

## Direction Lock (Non‑Negotiable)
- **Target architecture**: single Ionic Angular + Capacitor app at repo root (web/android/ios/electron), Babylon.js direct engine integration, mobile‑first UX.
- **Parity mandate**: 1:1 port of legacy React UI/UX and game flows before enhancements.
- **Source of truth**: current `memory-bank/*` on `main`.

## Branch Alignment Summary

### main (Ionic Angular + Capacitor)
- **Alignment**: ✅ Primary direction.
- **Keep**: current Angular app, Capacitor + Electron setup, Babylon.js engine, mobile‑first layout, parity fixes already landed.
- **Risk**: parity gaps remain vs legacy React; tests must prove parity.

### release/v0.1-candidate (React monorepo + Babylon/Reactylon)
- **Alignment**: ⚠️ Partially aligned (gameplay/UI parity reference) but old platform stack.
- **Value to extract**:
  - **Legacy UI/UX baseline** (TSX panels, HUD, flow, copy, interaction order) for parity.
  - **Shared content/data** in `packages/shared/` (quests, items, NPCs, procedural generators).
  - **Existing test intent** (Playwright/Maestro coverage themes, not implementation).
- **Do NOT merge**: React/Reactylon/Expo app code, monorepo structure, or R3F migration.

### feature/expo-unified-architecture (Expo unified)
- **Alignment**: ❌ Diverges from Ionic/Capacitor direction.
- **Potential salvage**:
  - **Documentation/CI cleanup ideas** only if stack‑agnostic.
  - **Test structure** patterns (Jest/vitest migration notes) if they help current stack.
- **Drift**: full Expo app rewrite, monorepo removal, Expo‑specific CI pipelines.

### v1.0-unity6 (Unity 6)
- **Alignment**: ❌ Different engine + toolchain; conflicts with Babylon.js.
- **Potential salvage**:
  - **Gameplay system designs** (survival, reputation, skills, loot) as *data/specs* to port into shared TS systems.
  - **Test strategy** (E2E coverage breadth) if adaptable to web + mobile.
  - **Content data** (factions/skills/loot tables) to port into `packages/shared` data schema.
- **Drift**: Unity codebase, WebGL pipeline, Unity-specific CI and UI Toolkit.

## “Best of All Worlds” – What to Bring Forward

### 1) Parity First (Legacy React → Angular)
- Port **every legacy TSX/TS screen, HUD, panel, and flow** 1:1.
- Verify: title → main menu → play → dialogue/combat/travel/panels match legacy ordering/copy/controls.

### 2) Shared Data + Systems (from release/v0.1-candidate)
- Preserve **procedural generation + shared schema** approach.
- Port or reconcile any **expanded content datasets** that existed in `packages/shared/` (quests, NPCs, items, world routes) into current shared data structure.

### 3) Systems “Upgrades” (from Unity branch) as Specs
- **Survival layer**: fatigue, provisions, camping (as TS systems + data).
- **Reputation/faction**: tiers, modifiers, quest gating.
- **Skills/loot**: data‑driven tables and effects (not Unity implementations).

### 4) Testing Strategy (from Unity + release)
- **Playwright**: expand to parity‑critical UI flows (title → HUD → panels → dialog/combat, world map).
- **Maestro**: minimal but equivalent coverage for mobile‑first flows.
- **CI**: keep stack‑agnostic improvements (artifact retention, device matrix); drop Unity/Expo pipelines.

### 5) Pipeline/Process Hygiene
- Consolidate roadmap into **one migration plan** and **one parity checklist** to stop drift.
- Treat release/v0.1-candidate and feature/v1.0-unity6 as **reference/harvest-only branches**.

## What Is “AI Drift” (Do Not Carry Forward)
- **Engine pivots** (R3F, Unity) that conflict with Babylon.js.
- **Platform stack pivots** (Expo/React Native) that conflict with Ionic/Capacitor.
- **Authored-only world pivot** that conflicts with procedural vision.

## Immediate Next Actions (Audit + Merge Plan)
1. Create a **parity matrix** comparing legacy TSX vs current Angular per screen/panel/flow.
2. Inventory `packages/shared` content from `release/v0.1-candidate` for **data to port**, not app code.
3. Extract Unity branch **data tables/specs** into shared TS schemas if compatible.
4. Expand Playwright + Maestro to assert parity, not new UX.
5. Update `memory-bank/parity-assessment.md` with concrete gaps and fixes.

