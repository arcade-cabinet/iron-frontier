# Fallout HUD & UI Reference for Iron Frontier

Research reference covering HUD and UI patterns from Fallout 3, Fallout: New Vegas, and Fallout 4.
Goal: extract design patterns adaptable to Iron Frontier's Western frontier theme (amber/sepia tones).

---

## 1. HUD Layout

### Compass Bar

| Game | Position | Details |
|------|----------|---------|
| Fallout 3 | Bottom-center, beneath HP bar | Horizontal strip showing cardinal directions with tick marks |
| New Vegas | Bottom-center, beneath HP bar | Same style as F3 with sky-marks, stripe between sky-marks |
| Fallout 4 | Bottom-center | Wider, cleaner compass strip; slightly redesigned markers |

**What the compass shows:**
- Cardinal/intercardinal direction tick marks (N, NE, E, SE, S, SW, W, NW)
- **Location markers**: Small triangles for undiscovered locations (hollow/punched-out); filled triangles for discovered/visited locations. Markers appear only when relatively near.
- **Quest markers**: Arrow/chevron below the compass line pointing toward active quest objectives.
- **Enemy markers**: Red blips/ticks for hostile NPCs.
- **Friendly markers**: Yellow/amber blips for friendly NPCs.
- In Fallout 4 Survival mode, compass detection range is reduced for immersion.

### HP / AP Bars

| Game | HP Position | AP Position | Style |
|------|-------------|-------------|-------|
| Fallout 3 | Bottom-left | Bottom-left, below HP | Segmented bars inside bordered brackets |
| New Vegas | Bottom-left | Bottom-left, below HP | Same bracket style as F3 with edge cone shapes |
| Fallout 4 | Bottom-left | Bottom-left, below HP | Cleaner, flatter segmented bars |

- HP and AP are represented as segmented line/bar indicators inside stylized bracket frames.
- **Radiation**: Displayed as a red overlay encroaching into the HP bar from the right, visually reducing max health.
- HP, AP, ammo, and grenade counts are permanently visible (unless using immersive HUD settings).
- Active effects (chems, food buffs) display near the ammo/AP area.

### Ammo Count

- **Position**: Bottom-right corner in all three games.
- Displays: current magazine count / total reserve ammo.
- Grenade/throwable count shown separately nearby.
- Weapon name sometimes displayed alongside ammo count (Fallout 4).

### Crosshair / Reticle

- **Fallout 3/NV default**: The iconic `> <` bracket-style crosshair (two opposing angle brackets).
- **Fallout 4 default**: Simple dot reticle; changes dynamically based on weapon type (expands for shotguns, tightens for scoped weapons).
- Crosshair turns **red** when aimed at a hostile target.
- In Fallout 4, the crosshair adapts per weapon: dot for pistols, spread indicator for shotguns, scope overlay for sniper rifles.

### Contextual Interaction Prompts

- Appear at **screen center**, directly below the crosshair, when aiming at an interactable object.
- Format: `[Button] Action` -- e.g., `[E] Open`, `[E] Talk`, `[E] Search`, `[A] Activate`.
- Additional context shown: item name, lock difficulty (`[Locked - Novice]`, `[Locked - Master]`), owner name for NPCs.
- For containers: shows container name + action (Open/Search/Steal if owned).
- For NPCs: shows NPC name + "Talk".
- For terminals: shows terminal name + "Activate".
- Prompts fade in when crosshair lands on the object, fade out when moved away.

### Stealth / Sneak Indicator

- **Position**: Top-center of screen (F3/NV) or center-screen (F4), only visible while crouched.
- Four detection states displayed as bracketed text:
  - `[HIDDEN]` -- Completely undetected.
  - `[CAUTION]` -- Enemies are suspicious, searching.
  - `[DANGER]` -- Enemies are aware of presence, actively searching last known location.
  - `[DETECTED]` -- Enemies have direct line of sight.
- Fallout 4 adds a visual "eye" icon that opens/closes based on detection level.

### Damage Direction Indicators

- Appear as **radial hit markers** around the crosshair/screen center.
- Red arc/wedge segments indicating the direction damage came from.
- Flash briefly on hit, then fade out.
- Multiple simultaneous hits from different directions show multiple arcs.

### Enemy Health Display

- When aiming at an enemy, their **name and health bar** appear at screen center (above crosshair in F3/NV, or top-center area in F4).
- Fallout 4 adds: enemy level, legendary status indicator (star icon).
- Health bar depletes from right to left; bar empties completely on death.
- In F3/NV, enemy health bar is centered and depletes toward center.

### Notifications

- **Quest updates**: Appear upper-left as text popups: "Quest Started:", "Quest Completed:", "Quest Updated:".
- **XP gained**: Brief popup near quest notifications.
- **Level up**: Prominent notification.
- **Item picked up**: Brief text near bottom or center.
- Notifications fade in, persist for a few seconds, then fade out.
- Multiple notifications can stack vertically.

---

## 2. Interaction System

### NPC Interaction Flow

1. **Approach**: Walk up to NPC in 3D world. No special trigger zone -- proximity-based.
2. **Crosshair prompt**: When crosshair lands on NPC, prompt appears: `[E] Talk to <Name>`.
3. **Initiate**: Press button. Camera smoothly zooms in on NPC's face (F3/NV) or shifts to cinematic over-the-shoulder angle (F4).
4. **Dialogue**: NPC speaks (voiced), then player selects response.
5. **Exit**: Player can leave dialogue at any time; camera smoothly zooms back out.

### Dialogue Systems

**Fallout 3 / New Vegas -- Full Text List:**
- All dialogue options shown as a scrollable list of full sentences.
- Skill/attribute checks shown in brackets: `[Speech 40] You should let us pass.`
- If player meets the requirement, the check number is shown plainly.
- If player does NOT meet it, a second number shows current vs. required: `[Speech 25/40]`.
- NV changed speech checks from percentage-based (F3) to pass/fail threshold (NV).
- Topics the player can ask about shown as clickable text lines.

**Fallout 4 -- Dialogue Wheel:**
- Four options arranged in a diamond/cross pattern (up, down, left, right).
- Each option shows only a 1-3 word paraphrase of the actual response.
- General mapping: Up = question/more info, Right = agree/positive, Left = sarcastic/neutral, Down = refuse/negative.
- Widely criticized because short labels don't always represent what the character actually says.
- Camera alternates between player and NPC in cinematic shot-reverse-shot.

### Locked Doors & Containers

- Prompt shows lock difficulty: `[Locked - Novice/Advanced/Expert/Master]`.
- If player has sufficient Lockpick skill (NV) or perk level (F4), they can attempt it.
- **Lockpicking minigame**: Top-down view of lock cylinder. Player positions a bobby pin at an angle, then tries to turn the lock. If the pin wobbles, adjust angle. If forced too hard, the bobby pin breaks. Find the sweet spot where the lock turns fully.
- Locked with a key: `[Locked - Requires Key]` -- no minigame, must find the key.

### Terminal Hacking

- Player approaches terminal, prompt: `[E] Activate`.
- Screen transitions to full-screen terminal view (green/amber monochrome CRT display).
- **Hacking minigame**: Screen shows jumbled characters interspersed with words of equal length. Player selects candidate passwords.
- After each wrong guess: "Access Denied" + number of correct letter positions ("likeness").
- Bracket pairs `()`, `[]`, `{}`, `<>` in the character jumble can be selected to remove wrong answers or reset attempts (does not consume a guess).
- 4 attempts before lockout (temporary in F4, permanent in F3/NV unless backed out).
- Difficulty tiers increase word length and number of candidates.

### V.A.T.S. (Vault-Tec Assisted Targeting System)

**Activation:**
- Press VATS button in real-time. Time freezes (F3/NV) or slows dramatically (F4).
- Camera shifts to a cinematic angle focused on the nearest targetable enemy.

**Targeting UI overlay:**
- Enemy silhouette displayed with selectable body regions highlighted.
- **Humanoid targets**: Head, Torso, Left Arm, Right Arm, Weapon, Left Leg, Right Leg (7 zones).
- **Non-humanoid**: Varies (e.g., robot combat inhibitor, ant antennae).
- Each body part shows a **hit percentage** (0-95% max) based on distance, visibility, weapon skill.
- Body part condition bar shown beside each region (empty = crippled).
- **AP cost**: Each queued shot consumes AP. Remaining AP shown as a depleting bar.
- Player queues multiple shots across body parts, then confirms to execute.

**Execution:**
- Cinematic slow-motion camera follows each shot.
- Critical hits trigger special kill-cam animations.

### Pip-Boy Menu System

**Access**: Press Pip-Boy button. Character raises wrist-mounted device (F4 shows the arm animation; can toggle to full-screen mode).

**Structure -- Three main tabs:**

| Tab | Contents |
|-----|----------|
| **STAT** | SPECIAL attributes, Perks, Health/AP/Limb condition, Status effects |
| **INV** (Inventory) | Weapons, Apparel, Aid, Misc, Junk, Ammo. Shows carry weight and caps at bottom |
| **DATA** | Quests (active/completed), Workshops, World Map, Radio stations |

**Visual design:**
- CRT screen aesthetic with thick curved glass distortion effect.
- Monochrome color (green default in F3; amber default in NV; customizable in F4).
- Scanline/CRT shader overlay.
- Hard lines, clean readable text, bold drop shadows.
- Game world freezes while Pip-Boy is open.
- Pip-OS supports concurrent systems: health monitoring, quest tracking, radio playback.

---

## 3. World Presentation

### Towns and Settlements

- Towns are **places in the open world** -- not separate instances or menus.
- No transition screen to enter a town. The player walks/runs directly into the settlement.
- Towns have NPCs walking around, shops with named vendors, quest givers.
- Some towns have gates or walls but no loading screen to enter.
- Fallout 4 adds the **settlement building system**: player can construct and manage 30+ workshop settlements, placing structures, defenses, crops, and assigning settlers.

### Building Interiors

- **Small buildings**: Some interiors are part of the exterior cell (seamless entry, no loading screen). Common for shacks, open structures, ruins.
- **Large/complex interiors**: Use separate "interior cells" with a **loading screen** triggered by interacting with the door. This is necessary for engine performance -- breaks up what's loaded at once.
- Loading screen shows: location name, loading spinner, lore tips/artwork.
- Interior cells can contain multi-floor dungeons, vaults, subway tunnels, buildings.
- The loading door is a standard game door with a brief interaction prompt.

### Fast Travel

- **Unlock**: Discover a location by physically visiting it. An undiscovered marker appears on the compass as you approach; walking close enough "discovers" it (name popup + map marker added).
- **Use**: Open Pip-Boy world map, select any discovered location marker, confirm fast travel.
- **Restrictions**: Cannot fast travel while indoors, while in combat, while enemies are nearby, while in the air, or while over-encumbered.
- **Time passage**: Fast travel advances in-game time proportional to distance.
- Fallout 4 Survival mode disables fast travel entirely.

### World Map

- **Fallout 3**: Top-down stylized map of the Capital Wasteland. Location markers appear as icons when discovered.
- **New Vegas**: Similar top-down map of the Mojave Wasteland. Starts with only Goodsprings; locations fill in as discovered. Filled squares = visited, hollow squares = discovered but unvisited.
- **Fallout 4**: Full 3D rendered map that can be zoomed and rotated. Location icons with names. Custom markers can be placed. Cleaner, more modern presentation.
- All games: Quest objective markers shown on the world map with chevron/arrow indicators. Active quest destination highlighted.

### Quest Objectives in the World

- Active quest objective marked with a **floating marker/chevron** visible in 3D space (appears above the destination, visible through walls at distance).
- Compass shows quest direction arrow below the compass line.
- Multiple active quests can show multiple markers (selectable in Pip-Boy).
- Quest givers sometimes have a special icon or indicator above their head before the quest is accepted.

---

## 4. UI Style

### Color Palette

| Game | Default HUD Color | RGB Values | Pip-Boy Color | Customizable? |
|------|-------------------|------------|---------------|---------------|
| Fallout 3 | Green | R:25, G:255, B:128 | Green (same) | Yes, in settings (presets: green, amber, blue, white) |
| New Vegas | Amber | R:255, G:182, B:66 | Amber (same) | Yes, in settings |
| Fallout 4 | Green | Customizable | Customizable | Full RGB slider in settings; HUD, Pip-Boy, and VATS colors independent |

- **Monochrome design**: All HUD elements use a single color against transparency. No multi-color elements in the base HUD.
- The monochrome approach creates strong visual identity and ensures readability against varied 3D backgrounds.
- Terminal screens share the HUD color (green CRT in F3, amber in NV).

### Typography

| Game | Primary Font | Style |
|------|-------------|-------|
| Fallout 3 / NV | Monofonto (monospace) | Retro terminal/typewriter feel. Fixed-width. |
| Fallout 4 | Roboto Condensed (Regular + Bold) | Modern, clean sans-serif. Bold for labels/numbers, Regular for body text. |
| Series branding | Overseer / modified Futura | Used in logos, loading screens, not in-game HUD. |

- F3/NV's monospace font reinforces the retro-tech Pip-Boy aesthetic.
- F4's shift to Roboto Condensed gives a flatter, more modern UI feel.
- Pip-Boy text uses the HUD monochrome color with dark background.

### Animation & Transitions

- **HUD elements**: Fade in/out smoothly. Contextual elements (interaction prompts, enemy health) appear with quick fade-in (~200ms) and disappear with slightly longer fade-out (~400ms).
- **Notifications**: Slide in from the edge or fade in at their position. Stack vertically. Fade out after display duration (typically 3-5 seconds).
- **Quest updates**: Text fades in upper-left, holds briefly, fades out.
- **Pip-Boy open/close**: F4 shows arm raise animation (skippable). F3/NV instant transition with brief fade.
- **Dialogue entry**: Camera smoothly zooms/pans to NPC over ~0.5-1 second.
- **VATS entry**: Dramatic slow-down with camera sweep to target.
- **Damage indicators**: Flash on with full opacity, fade out over ~1 second.
- No sliding/bouncing animations for core HUD elements -- they are positionally static; only opacity changes.

### Transparency & Opacity

- HUD elements use **semi-transparent backgrounds** or no background at all (text/icons rendered directly over the 3D scene).
- HP/AP bars: No background panel; bars and bracket frames are rendered with the monochrome HUD color at high opacity (~80-90%) with slight glow/bloom.
- Compass: Semi-transparent strip or no background; tick marks and markers rendered directly.
- The overall effect is a HUD that overlays without heavy boxing or panels -- elements "float" on the screen.
- Fallout 4 adds subtle shadow/outline behind HUD text for readability against bright backgrounds.

### Minimalism

- The default Fallout HUD is **moderately minimal**:
  - Always visible: HP bar, AP bar, compass, ammo count, crosshair.
  - Contextual (appear when relevant): enemy health, interaction prompts, stealth indicator, damage direction, notifications, quest updates.
  - Hidden until opened: Pip-Boy, VATS overlay, dialogue UI, lockpicking, terminal hacking.
- Fallout 4 introduced HUD opacity settings (adjustable in settings menu).
- The community "Immersive HUD" (iHUD) mod pattern -- hiding even the always-visible elements until needed -- is popular enough that it influenced F4's design.
- In Survival mode (F4), HUD is further stripped: no fast travel, reduced compass range, hunger/thirst/sleep indicators added.

---

## 5. Design Patterns for Iron Frontier Adaptation

### Direct Adaptations (Fallout -> Western Frontier)

| Fallout Pattern | Iron Frontier Adaptation |
|----------------|--------------------------|
| Green/amber monochrome HUD | **Amber/sepia monochrome** -- warm gold (#D4A447) or weathered brass tones |
| Pip-Boy CRT terminal aesthetic | **Worn leather journal / pocket watch** aesthetic for menus |
| `> <` bracket crosshair | Similar minimal bracket or **iron sight** inspired crosshair |
| Bottom-left HP/AP bars in brackets | Bottom-left HP/Stamina bars in **railroad spike** or **barbed wire** bracket frames |
| Bottom-right ammo count | Bottom-right ammo: bullets remaining, shown with **cartridge** iconography |
| Bottom-center compass strip | Bottom-center compass with **sun position** and **frontier landmark** markers |
| `[E] Talk` interaction prompts | Same pattern: `[E] Talk to Sheriff`, `[E] Open Saloon Door` |
| `[HIDDEN/CAUTION/DANGER]` stealth | Same states with Western flavor or identical (universal gaming language) |
| Monofonto terminal font | **Clarendon / slab-serif** or **wanted poster** style typeface for Western feel |
| Segmented HP bar | Segmented bar styled as **notches on a gun barrel** or **rail ties** |

### Key Takeaways

1. **Monochrome is powerful**: A single-color HUD (amber/sepia for Western) creates instant visual identity and ensures readability. Limit the palette to one warm tone + transparency.

2. **Contextual > always-visible**: Show interaction prompts, enemy health, damage indicators only when relevant. Keep the persistent HUD to just HP, stamina, ammo, compass, crosshair.

3. **The compass is essential**: A horizontal compass strip at bottom-center is the spatial anchor. Show quest markers, discovered locations, enemies, and friendlies on it. This is the primary navigation tool during gameplay.

4. **Interaction is crosshair-driven**: Walk up, aim at object/NPC, see contextual prompt, press button. No special interaction zones or complex targeting. Simple and universal.

5. **Dialogue can be full-text**: F3/NV's full-text dialogue list (with skill check brackets) is more informative and better received than F4's paraphrased wheel. For a narrative Western, full-text dialogue options are preferable.

6. **Skill checks in dialogue**: Show requirements in brackets: `[Persuasion 40] I reckon you ought to reconsider.` -- lets the player see what's possible and invest accordingly.

7. **Loading screens for complex interiors**: Seamless entry for shacks/small buildings, loading transition for saloons/mines/multi-room interiors. The loading screen can show Western art, lore snippets, or frontier tips.

8. **Towns are in the world**: No town menus or separate screens. Walk into town, see the buildings, talk to people. This is the gold standard for open-world immersion.

9. **VATS-equivalent optional**: If Iron Frontier has a slow-time targeting mode (Dead Eye, per Western game tradition), the Fallout VATS body-part selection + hit percentage overlay is a proven UI pattern.

10. **Menu = diegetic object**: The Pip-Boy as an in-world device that freezes time is elegant. For Iron Frontier, a **journal/ledger** or **pocket watch** that the character physically holds up serves the same purpose with Western flavor.

---

## Sources

- [Game UI Database - Fallout: New Vegas](https://www.gameuidatabase.com/gameData.php?id=1099)
- [Game UI Database - Fallout 3](https://www.gameuidatabase.com/gameData.php?id=1098)
- [Game UI Database - Fallout 4](https://www.gameuidatabase.com/gameData.php?id=633)
- [Fallout Wiki - V.A.T.S.](https://fallout.fandom.com/wiki/VATS)
- [Fallout Wiki - Fallout 3 V.A.T.S.](https://fallout.wiki/wiki/Fallout_3_V.A.T.S.)
- [Fallout Wiki - Pip-Boy 3000 Mark IV](https://fallout.fandom.com/wiki/Pip-Boy_3000_Mark_IV)
- [Fallout Wiki - Fonts in the Fallout Series](https://fallout.fandom.com/wiki/Fonts_in_the_Fallout_series)
- [Fallout Wiki - Speech (New Vegas)](https://fallout.fandom.com/wiki/Speech_(Fallout:_New_Vegas))
- [Fallout Wiki - Sneak (New Vegas)](https://fallout.fandom.com/wiki/Sneak_(Fallout:_New_Vegas))
- [Fallout Wiki - World Map](https://fallout.fandom.com/wiki/World_map)
- [Fallout Wiki - Hacking](https://fallout.fandom.com/wiki/Hacking)
- [Fallout Wiki - Fallout 4 Dialogue System](https://fallout-archive.fandom.com/wiki/Fallout_4_dialogue_system)
- [Fallout Archive Wiki - Fast Travel](https://fallout-archive.fandom.com/wiki/Fast_travel)
- [Steam Guide - How to Read the Compass (Fallout 4)](https://steamcommunity.com/sharedfiles/filedetails/?id=2897797252)
- [SuperCheats - Reading the Compass (New Vegas)](https://www.supercheats.com/guides/fallout-new-vegas/compass)
- [TechRaptor - Fallout 4's Dialogue Wheel](https://techraptor.net/gaming/opinions/fallout-4s-dialogue-wheel-short-answers-that-make-no-sense)
- [Nexus Mods - Dynamic Interaction Prompts (New Vegas)](https://www.nexusmods.com/newvegas/mods/91449)
- [Nexus Mods - FallUI HUD (Fallout 4)](https://www.nexusmods.com/fallout4/mods/51813)
- [Nexus Mods - Immersive HUD iHUD (Fallout 4)](https://www.nexusmods.com/fallout4/mods/20830)
- [HUDMenu - Fallout 4 Creation Kit Wiki](https://falloutck.uesp.net/wiki/HUDMenu)
