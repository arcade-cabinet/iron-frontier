# Iron Frontier - Balance Document

This document outlines the intended balance for Iron Frontier's combat and economy systems.

## Table of Contents
1. [Player Progression](#player-progression)
2. [Combat Balance](#combat-balance)
3. [Economy Balance](#economy-balance)
4. [Quest Rewards](#quest-rewards)
5. [Shop Configuration](#shop-configuration)
6. [Balance Summary](#balance-summary)

---

## Player Progression

### Starting Stats
| Stat | Value |
|------|-------|
| Level | 1 |
| HP | 100 |
| Attack | 10 |
| Defense | 5 |
| Speed | 10 |
| Gold | 50 |
| XP to Level 2 | 100 |

### XP Curve
- **Formula**: `xpToNextLevel = floor(previousXP * 1.5)`
- Level 2: 100 XP
- Level 3: 150 XP
- Level 4: 225 XP
- Level 5: 338 XP
- Level 6: 507 XP
- Level 7: 760 XP
- Level 8: 1140 XP
- Level 9: 1710 XP
- Level 10: 2565 XP

### Level-Up Bonuses
| Level Up | MaxHP | Attack | Defense |
|----------|-------|--------|---------|
| +1 Level | +10 | +2 | +1 |

**Note**: Player receives full heal on level up.

### Expected Level by Content
| Content | Expected Level | Notes |
|---------|----------------|-------|
| Frontier's Edge (Tutorial) | 1 | ~50-125 XP total |
| Iron Gulch (Act 1) | 2-3 | ~225-400 XP total |
| Act 1 Boss (Bandit King) | 3-4 | ~450-650 XP total |
| Mesa Point / Coldwater | 4-5 | ~700-1000 XP total |
| Act 2 Boss (Saboteur) | 5-6 | ~1100-1500 XP total |
| Salvation (Act 3) | 6-7 | ~1600-2200 XP total |
| Final Boss (Iron Tyrant) | 8-10 | ~2500+ XP total |

---

## Combat Balance

### Difficulty Tiers

#### Early Game (Level 1-3): Easy
Target: Player can win most encounters without consumables.

| Enemy | HP | Damage | XP | Gold | Notes |
|-------|-----|--------|-----|------|-------|
| Coyote | 20 | 8 | 10 | 0 | Pack animal, 2-3 per encounter |
| Rattlesnake | 10 | 12 | 8 | 0 | Low HP, poison threat |
| Scorpion | 15 | 10 | 10 | 0 | Armored, defensive |
| Buzzard | 12 | 6 | 6 | 0 | High evasion |
| Lone Bandit | 30 | 10 | 15 | 8 | Basic human enemy |
| Bandit Gunner | 25 | 15 | 20 | 12 | Ranged, fragile |

**Early Encounter XP**: 20-50 XP per encounter

#### Mid Game (Level 4-6): Challenging
Target: Strategic use of consumables, some losses expected.

| Enemy | HP | Damage | XP | Gold | Notes |
|-------|-----|--------|-----|------|-------|
| Wolf | 35 | 14 | 20 | 0 | Pack tactics |
| Mountain Lion | 45 | 18 | 30 | 0 | Fast, high damage |
| Bear | 80 | 22 | 50 | 0 | Tank, slow |
| Bandit Brute | 50 | 14 | 25 | 15 | Tank |
| Bandit Leader | 60 | 16 | 40 | 30 | Buffs allies |
| Outlaw Gunslinger | 40 | 20 | 45 | 25 | High accuracy |
| Copperhead Enforcer | 50 | 15 | 40 | 15 | Shotgun user |
| Copperhead Gunslinger | 35 | 14 | 45 | 20 | Quick-draw |

**Mid Encounter XP**: 50-150 XP per encounter

#### Late Game (Level 7-10): Difficult & Strategic
Target: Requires preparation, consumables mandatory.

| Enemy | HP | Damage | XP | Gold | Notes |
|-------|-----|--------|-----|------|-------|
| Outlaw Enforcer | 70 | 18 | 55 | 35 | Heavy armor |
| Red Eye's Lieutenant | 80 | 22 | 80 | 50 | Mini-boss |
| Clockwork Drone | 45 | 14 | 40 | 5 | High armor |
| Steam Golem | 100 | 25 | 75 | 15 | Very slow, tanky |
| Mechanical Horror | 120 | 28 | 100 | 30 | Multi-attack |
| IVRC Elite Captain | 90 | 20 | 100 | 50 | Buffs allies |
| Canyon Stalker | 60 | 24 | 65 | 0 | Ambush predator |

**Late Encounter XP**: 100-250 XP per encounter

#### Bosses
| Boss | HP | Damage | XP | Gold | Location |
|------|-----|--------|-----|------|----------|
| Bandit King | 150 | 24 | 200 | 100 | Act 1 Climax |
| The Saboteur | 100 | 30 | 250 | 75 | Act 2 Mid-Boss |
| Cornelius Thorne | 200 | 28 | 400 | 300 | IVRC Path Boss |
| Rattlesnake King | 180 | 32 | 350 | 0 | Optional Boss |
| Iron Golem | 220 | 35 | 380 | 100 | IVRC Facility |
| Ghost of the Gallows | 140 | 26 | 320 | 50 | Optional Boss |
| Diamondback | 160 | 24 | 400 | 200 | Copperhead Boss |
| Iron Tyrant | 250 | 35 | 500 | 200 | Final Boss |

**Boss Encounter XP**: 400-1000 XP (including adds)

### Combat Math Analysis

**Player Damage Output (Per Round)**:
- Base Attack: 10 + (level - 1) * 2
- Level 1: 10 damage
- Level 5: 18 damage
- Level 10: 28 damage

**Player Survivability**:
- Base HP: 100 + (level - 1) * 10
- Level 1: 100 HP
- Level 5: 140 HP
- Level 10: 190 HP

**Rounds to Kill (Player vs Enemy)**:
| Enemy | Level 1 | Level 5 | Level 10 |
|-------|---------|---------|----------|
| Coyote (20 HP) | 2 | 2 | 1 |
| Lone Bandit (30 HP) | 3 | 2 | 2 |
| Wolf (35 HP) | 4 | 2 | 2 |
| Bandit King (150 HP) | 15 | 9 | 6 |
| Iron Tyrant (250 HP) | 25 | 14 | 9 |

**Enemy Damage vs Player HP**:
| Enemy Damage | Hits to Kill L1 | Hits to Kill L5 | Hits to Kill L10 |
|--------------|-----------------|-----------------|------------------|
| 8 (Coyote) | 13 | 18 | 24 |
| 14 (Wolf) | 8 | 10 | 14 |
| 24 (Bandit King) | 5 | 6 | 8 |
| 35 (Iron Tyrant) | 3 | 4 | 6 |

---

## Economy Balance

### Starting Economy
- **Starting Gold**: 50
- **Design Goal**: Player can afford 2-3 basic items

**What 50 Gold Buys**:
- 2x Bandages (4g) + 1x Herbal Remedy (4g) + Revolver (25g) = 33g
- Bandages (2g) + Bowie Knife (10g) + Coffee (1g) + Jerky (2g) = 15g
- Medical Kit (15g) + Bandages (2g) = 17g

**Verdict**: Starting gold is appropriate. Players can gear up with basics.

### Item Pricing

#### Weapons
| Tier | Item | Price | Damage | Notes |
|------|------|-------|--------|-------|
| Common | Hunting Knife | 5 | 8 | Starter melee |
| Common | Bowie Knife | 10-15 | 10-12 | Early melee upgrade |
| Common | Revolver (Basic) | 25 | 15 | Starter gun |
| Common | Shotgun | 40 | 35 | Close range |
| Common | Hunting Rifle | 45 | 30 | Long range, slow |
| Uncommon | Navy Revolver | 40 | 18 | Early pistol upgrade |
| Uncommon | Coach Gun | 60 | 40 | Shotgun upgrade |
| Uncommon | Repeater | 65 | 22 | Balanced rifle |
| Uncommon | Winchester | 75 | 25 | Best mid-tier rifle |
| Rare | Schofield | 80 | 22 | Quick reload |
| Rare | Engraved Colt | 150 | 24 | Best pistol, premium |
| Rare | Reinforced Bowie | 35 | 18 | Best knife |
| Quest | Blackwood's Rifle | 100 | 28 | Quest reward |

**Weapon Upgrade Path**:
- Tutorial: Free Basic Revolver (MQ1 reward)
- Early Mid: Navy Revolver (40g) or Hunting Rifle (45g)
- Late Mid: Winchester (75g) or Schofield (80g)
- End Game: Unique quest weapons

#### Consumables
| Item | Price | Effect | Value Ratio |
|------|-------|--------|-------------|
| Bandages | 2 | Heal 15 | 7.5 HP/gold |
| Herbal Remedy | 4 | Heal 20 | 5 HP/gold |
| Whiskey | 3 | Heal 20 + buff | 6.7 HP/gold |
| Medical Kit | 15 | Heal 50 | 3.3 HP/gold |
| Laudanum | 8 | Heal 35 | 4.4 HP/gold |
| Stimulant | 25 | Speed buff | Buff item |
| Antivenom | 12 | Heal 25 + cure | Situational |
| Dynamite | 15 | 50 damage | 3.3 dmg/gold |

**Healing Economy**:
- Bandages are most cost-effective for small heals
- Medical Kit is best for large heals in tough fights
- Price-to-heal ratio encourages buying cheaper items early

#### Armor/Accessories
| Item | Price | Defense | Notes |
|------|-------|---------|-------|
| Quickdraw Holster | 75 | 0 | Speed bonus |
| Lucky Charm | 30 | 0 | Luck bonus |
| Freeminer's Harness | 180 | 18 | Best common armor |
| IVRC Executive Suit | 350 | 12 | Rare drop |
| Outlaw's Duster | 200 | 10 | Quest reward |

### Shop Configuration

| Shop | Location | Buy Modifier | Sell Modifier |
|------|----------|--------------|---------------|
| Hawkins General | Frontier's Edge | 1.0x | 0.4x (40%) |
| Mining Supply | Iron Gulch | 1.0x-1.2x | 0.5x (50%) |
| Saloon | Iron Gulch | 0.8x-1.3x | 0.3x (30%) |
| Apothecary | Iron Gulch | 1.0x-1.5x | 0.4x (40%) |

**Sell Values**: Items sell at 30-50% of base value, averaging 40%.

---

## Quest Rewards

### Main Quests

| Quest | XP | Gold | Items | Level Range |
|-------|-----|------|-------|-------------|
| MQ1: A Stranger Arrives | 50 | 20 | Revolver (25g value) | 1 |
| MQ2: Missing Prospector | 75 | 30 | - | 1-2 |
| MQ3: Deep Trouble | 100 | 50 | - | 2 |
| MQ4: Engineer's Secret | 100 | 0 | Clara's Gadget | 2-3 |
| MQ5: Confrontation | 200 | 100 | - | 3 |
| MQ6a: Honor Among Thieves | 175 | 50 | Outlaw Ledger | 4 |
| MQ6b: Rancher's Plight | 175 | 60 | - | 4 |
| MQ7: Pieces of the Puzzle | 100 | 0 | - | 5 |
| MQ8: The Final Trail | 125 | 0 | - | 5-6 |
| MQ9: Salvation's Secret | 150 | 0 | Solomon's Key | 6 |
| MQ10: Reckoning | 500 | 500 | - | 6-10 |

**Main Quest XP Total**: ~1,750 XP (one path) to ~1,950 XP (both paths)

### Side Quests

| Quest | XP | Gold | Items | Notes |
|-------|-----|------|-------|-------|
| Old Timer's Tales | 50 | 5 | Lucky Charm | Lore, dialogue |
| Sheriff's Bounty | 75 | 40 | - | Combat bounty |
| Saloon Brawl | 60 | 20 | 2x Whiskey | Non-lethal combat |
| Doc's Dilemma | 80 | 25 | 2x Med Kit, 3x Antivenom | Exploration |
| The Informant | 100 | 50 | - | Investigation |
| Informant's Price | 80 | 0 | Information | Moral choice |
| Bounty Hunter's Mark | 85 | 35 | - | Ally recruitment |
| Cattle Rustlers | 95 | 40 | 10x Jerky, 2x Canteen | Combat + tracking |
| The Wanderer's Tale | 100 | 0 | Wanderer's Token | Lore, sequel hook |

**Side Quest XP Total**: ~725 XP
**Combined Total**: ~2,475-2,675 XP

### XP Pacing Analysis

| Milestone | Cumulative XP | Expected Level |
|-----------|---------------|----------------|
| Complete Tutorial (MQ1) | 50 | 1 |
| Complete Act 1 (MQ1-5) | 525 | 3-4 |
| + 2 Side Quests | 675-775 | 4 |
| Complete Act 2 | 1,100-1,300 | 5-6 |
| + All Side Quests | ~1,700 | 6-7 |
| Complete Act 3 | ~2,500 | 8 |

**Verdict**: XP pacing allows for level-ups every 2-4 quests, meeting design goals.

### Gold Pacing Analysis

| Milestone | Gold Earned | Gold Spent (Est.) | Net Gold |
|-----------|-------------|-------------------|----------|
| Start | 50 | 0 | 50 |
| Complete MQ1 | +20 | -15 (supplies) | 55 |
| Complete Act 1 | +200 | -75 (weapon upgrade) | ~180 |
| + Early Side Quests | +125 | -50 (consumables) | ~255 |
| Complete Act 2 | +350 | -150 (gear) | ~455 |
| Complete Act 3 | +500 | -200 (final prep) | ~755 |

**Weapon Affordability**:
- Navy Revolver (40g): Affordable after MQ2-3
- Winchester (75g): Affordable mid-Act 1
- Schofield (80g): Affordable by end of Act 1

---

## Balance Summary

### Current Balance State: GOOD

The combat and economy systems are well-balanced with minor opportunities for tuning:

**Strengths**:
1. XP curve allows natural progression through content
2. Starting gold enables basic purchases without being overpowered
3. Consumable pricing creates meaningful choices
4. Enemy scaling matches expected player power
5. Quest rewards provide steady progression
6. Shop sell modifiers (40-50%) prevent gold farming exploits

**Identified Issues**:
1. Some duplicate item IDs exist (e.g., `bowie_knife` vs `knife_bowie`)
2. ~~Engraved Colt (150g) has lower damage (20) than Schofield (80g, 22 damage)~~ **FIXED**: Adjusted to 24 damage, 85 accuracy
3. Some boss encounters may need companion/ally mechanics to be balanced

**Recommendations**:
1. Consolidate duplicate item IDs in future cleanup
2. ~~Adjust Engraved Colt to 24 damage or reduce price to 120g~~ **DONE**
3. Consider adding health potions to boss encounter loot tables
4. Monitor late-game difficulty when ally system is implemented

### Balance Formulas Reference

**Player Stats by Level**:
```
MaxHP = 100 + (level - 1) * 10
Attack = 10 + (level - 1) * 2
Defense = 5 + (level - 1) * 1
XP to Next = floor(100 * 1.5^(level-1))
```

**Encounter XP Guidelines**:
```
Easy Encounter: 20-50 XP
Medium Encounter: 50-100 XP
Hard Encounter: 100-200 XP
Boss Encounter: 200-500 XP
Final Boss: 500-1000 XP
```

**Gold Reward Guidelines**:
```
Early Quest: 20-40 gold
Mid Quest: 40-75 gold
Late Quest: 75-150 gold
Boss Quest: 100-200 gold
Side Quest: 25-50 gold
```

**Item Value Guidelines**:
```
Common Weapon: 5-45 gold
Uncommon Weapon: 40-75 gold
Rare Weapon: 75-150 gold
Quest Reward Weapon: 100-300 gold value
Healing Consumable: 2-15 gold
Buff Consumable: 15-25 gold
```

---

*Last Updated: Balance pass for v0.1 release candidate*
