# Parity Matrix (Legacy React → Ionic Angular)

Legend: ✅ aligned, 🟡 partial, ❌ missing, 🔍 needs review

| Area | Legacy Source | Angular Status | Gaps / Notes |
| --- | --- | --- | --- |
| Title Screen | `apps/web/src/game/screens/TitleScreen.tsx` | ✅ | Aligned layout, copy, flow (splash → menu → name input). |
| Game HUD | `apps/web/src/game/ui/GameHUD.tsx` | ✅ | Top bar + location/quest row aligned. |
| Action Bar | `apps/web/src/game/ui/ActionBar.tsx` | 🟡 | Buttons present; verify labels/ordering/haptics and exact iconography. |
| Notification Feed | `apps/web/src/game/ui/NotificationFeed.tsx` | 🔍 | Needs side‑by‑side copy/ordering/animations check. |
| Inventory Panel | `apps/web/src/game/ui/InventoryPanel.tsx` | 🟡 | Detail panel, rarity/equipped badges, condition/weapon/consumable stats, and action row restored. Needs visual parity check for spacing, icons, and responsive breakpoints. |
| Character Panel | `apps/web/src/game/ui/CharacterPanel.tsx` | 🟡 | Layout aligned; verify exact stat ordering, badges, and copy parity. |
| Quest Log | `apps/web/src/game/ui/QuestLog.tsx` | 🟡 | Stage UI, badges, objective markers, rewards preview, progress bar, empty states, and sorting restored. Needs visual parity check and copy verification. |
| Menu Panel | `apps/web/src/game/ui/MenuPanel.tsx` | 🟡 | Rebuilt; verify all quick actions, stats, and exact copy/ordering. |
| Dialogue Box | `apps/web/src/game/ui/DialogueBox.tsx` | 🟡 | Typewriter, badges, choices, and prompts restored; validate spacing, icon treatment, and mobile tap targets. |
| Combat Panel | `apps/web/src/game/ui/CombatPanel.tsx` | 🟡 | Layout, log, action bar, outcome overlay, and target selection restored; validate spacing, audio timing, and mobile scroll behavior. |
| Shop Panel | `apps/web/src/game/ui/ShopPanel.tsx` | 🔍 | Needs parity check: buy/sell tabs, pricing rules, reputation text, layout. |
| Travel Panel | `apps/web/src/game/ui/TravelPanel.tsx` | 🔍 | Needs parity check: card layout, risk indicators, encounter text. |
| World Map | `apps/web/src/game/ui/WorldMap.tsx` | ✅ | Rebuilt to legacy bottom sheet, legend, compass, tooltip, discovery gating. |
| Pipe Puzzle | `apps/web/src/game/ui/PipePuzzle.tsx` | 🔍 | Needs parity check for grid sizing, controls, and completion flow. |
| Game Over Screen | `apps/web/src/game/ui/GameOverScreen.tsx` | 🔍 | Needs parity check for copy, button order, and visuals. |
| Loading/Error Overlays | `apps/web/src/game/Game.tsx` | 🟡 | Loading overlay exists; ensure behavior matches legacy (no blocking in normal play) and e2e bypass doesn't regress real flow. |

## Highest‑Priority Corrections (Next)
1) **Shop/Travel/Notification/Pipe/Game Over**: validate copy/layout vs legacy (1:1) and correct any drift.
2) **Dialogue + Combat**: verify spacing, icon treatment, and mobile/landscape breakpoints.
3) **Inventory + Quest Log**: verify spacing, icons, copy, and mobile/landscape breakpoints.
