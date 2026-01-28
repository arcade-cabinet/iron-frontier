# Vision Baseline (Authoritative)

## Source of Truth
Primary: `memory-bank/vision-archive/ARCHITECTURE_V2.md` (3‑hour authored RPG, Pokemon‑style overworld).  
Secondary: `memory-bank/vision-archive/content-generation-report.md` (scope + content inventory).  
Supporting: `memory-bank/vision-archive/kiro-specs/expo-unified-architecture-design.md` (migration notes + authored‑first guidance).

This baseline supersedes any procedural‑only framing. Procedural systems may remain for reuse, but authored content is the priority for the core 3‑hour RPG experience.

## High-Level Vision
- **Game**: 3‑hour steampunk western RPG with seamless overworld flow.
- **Traversal**: Pokemon‑style routes; walk in/out of towns. No hard loading breaks between world/town.
- **Combat**: Turn‑based, separate combat screen (FF/Pokemon style). Effects‑driven, minimal animations.
- **Content**: Authored towns, routes, quests, NPC dialogue, items, and events.
- **Survival Layer**: Day/night, fatigue, provisions, camping.

## World Structure (Authored)
- **Towns (6)**: Frontier’s Edge (tutorial), Iron Gulch (Act 1 hub), Mesa Point (outlaw), Coldwater (ranch), Salvation (endgame), plus one additional authored town slot if needed by content expansion.
- **Routes (5)**: Dusty Trail, Desert Pass, Mountain Road, Badlands Trail, Final Trail.
- **Flow**: Town → Route → Town, with encounter/event gates and day/night variation.

## Systems (Must Exist)
- **Time**: 1 game hour = 2 real minutes. Impacts encounters, shops, NPC schedules.
- **Fatigue**: Grows with travel/combat; penalties at high fatigue; rest at inns/camps.
- **Provisions**: Food/water consumption; scarcity accelerates fatigue.
- **Combat**: Turn‑based, separate screen; Attack/Defend/Item/Flee.
- **Hunting/Camping**: Oregon Trail‑style mini‑game for provisions.
- **Encounter System**: Pokemon‑style random encounters by zone.

## Content Inventory (From Content Generation Report)
- **NPCs**: 14+ with full dialogue trees; ~20k+ dialogue lines.
- **Quests**: 10 main + 15 side (25 total).
- **Items**: 100+ total; 12 legendary/rare uniques.
- **Enemies**: 50+; 5 bosses; 10+ elites.
- **World Events**: 40+ random travel/town/camp events.
- **Narrative Systems**: Factions, endings, achievements, codex/lore entries.

## Tech & Platform Interpretation (Updated for Current Stack)
Original V2 assumed React/Expo; current implementation is **Ionic Angular + Capacitor + Babylon**. The vision is **stack‑agnostic**, but the gameplay experience and authored content remain the authoritative constraints.

## Design Pillars (Non‑Negotiables)
1) **Seamless Overworld** (Pokemon‑style).  
2) **Authored 3‑Hour RPG** (not procedural roguelike).  
3) **Turn‑Based Combat** (separate screen).  
4) **Survival Mechanics** (time/fatigue/provisions/camping).  
5) **Mobile‑First** UX (portrait/landscape + foldable safety).

## Alignment Rules
- When code conflicts with V2 vision: **fix code**, not vision.
- Procedural systems may remain, but cannot replace authored content.
- UI/UX must align to legacy panels where available; where legacy is missing, align to V2 vision.

## Gaps To Close (Immediate)
- Bind authored content (quests, lore, endings, companions, factions, achievements) to UI.
- Ensure travel flow uses authored routes/events first.
- Verify survival systems (fatigue/provisions/time) are wired into HUD + gameplay.
- Ensure encounter frequency matches 3‑hour pacing.

