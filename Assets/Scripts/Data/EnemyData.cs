using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Enemy type classification.
    /// </summary>
    public enum EnemyType
    {
        /// <summary>Generic outlaw.</summary>
        Bandit,
        /// <summary>Fast, accurate shooter.</summary>
        Gunslinger,
        /// <summary>High HP, melee focused.</summary>
        Brute,
        /// <summary>Long range, high damage.</summary>
        Sharpshooter,
        /// <summary>Explosives user.</summary>
        Dynamiter,
        /// <summary>Mechanical enemies (The Remnant).</summary>
        Automaton,
        /// <summary>Wildlife (wolves, snakes, etc.).</summary>
        Animal
    }

    /// <summary>
    /// Enemy faction allegiance.
    /// </summary>
    public enum EnemyFaction
    {
        /// <summary>Copperhead Gang.</summary>
        Copperhead,
        /// <summary>IVRC Security guards.</summary>
        IVRCGuards,
        /// <summary>Animals and wildlife.</summary>
        Wildlife,
        /// <summary>Automatons from The Remnant.</summary>
        Remnant,
        /// <summary>Generic bandits.</summary>
        Raiders
    }

    /// <summary>
    /// Enemy AI behavior patterns.
    /// </summary>
    public enum EnemyBehavior
    {
        /// <summary>Rushes into combat.</summary>
        Aggressive,
        /// <summary>Uses cover, protects self.</summary>
        Defensive,
        /// <summary>Prefers long range attacks.</summary>
        Ranged,
        /// <summary>Buffs/heals allies.</summary>
        Support
    }

    /// <summary>
    /// Loot table entry for enemy drops.
    /// </summary>
    [Serializable]
    public struct LootEntry
    {
        /// <summary>Item reference.</summary>
        public ItemData item;

        /// <summary>Item ID for serialization.</summary>
        public string itemId;

        /// <summary>Probability weight.</summary>
        [Min(0)]
        public float weight;

        /// <summary>Minimum quantity dropped.</summary>
        [Min(1)]
        public int minQuantity;

        /// <summary>Maximum quantity dropped.</summary>
        [Min(1)]
        public int maxQuantity;

        /// <summary>Minimum player level for this drop.</summary>
        [Min(0)]
        public int minPlayerLevel;

        /// <summary>Maximum player level for this drop (0 = no limit).</summary>
        [Min(0)]
        public int maxPlayerLevel;

        /// <summary>Required quest for this drop.</summary>
        public string requiredQuestId;
    }

    /// <summary>
    /// Loot table defining possible drops.
    /// </summary>
    [Serializable]
    public struct LootTable
    {
        /// <summary>Unique identifier.</summary>
        public string id;

        /// <summary>Display name.</summary>
        public string name;

        /// <summary>Loot entries with weights.</summary>
        public List<LootEntry> entries;

        /// <summary>Number of rolls on this table.</summary>
        [Min(1)]
        public int rolls;

        /// <summary>Chance for table to produce nothing (0-1).</summary>
        [Range(0f, 1f)]
        public float emptyChance;
    }

    /// <summary>
    /// Enemy ability definition.
    /// </summary>
    [Serializable]
    public struct EnemyAbility
    {
        /// <summary>Ability name.</summary>
        public string name;

        /// <summary>Description of what it does.</summary>
        [TextArea(1, 3)]
        public string description;

        /// <summary>Cooldown in turns.</summary>
        [Min(0)]
        public int cooldown;

        /// <summary>Action point cost.</summary>
        [Min(0)]
        public int apCost;

        /// <summary>Damage multiplier (1.0 = normal).</summary>
        [Min(0)]
        public float damageMultiplier;

        /// <summary>Tags describing ability effects.</summary>
        public List<string> tags;
    }

    /// <summary>
    /// Enemy data definition as a ScriptableObject.
    /// Defines enemy templates with stats, abilities, and loot tables.
    /// </summary>
    [CreateAssetMenu(fileName = "New Enemy", menuName = "Iron Frontier/Data/Enemy Data", order = 6)]
    public class EnemyData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier.</summary>
        [Tooltip("Unique identifier")]
        public string id;

        /// <summary>Display name.</summary>
        [Tooltip("Display name")]
        public string displayName;

        /// <summary>Enemy type classification.</summary>
        [Tooltip("Enemy type")]
        public EnemyType type;

        /// <summary>Faction allegiance.</summary>
        [Tooltip("Faction")]
        public EnemyFaction faction;

        [Header("Description")]
        /// <summary>Description for UI.</summary>
        [Tooltip("Description")]
        [TextArea(2, 4)]
        public string description;

        [Header("Combat Stats")]
        /// <summary>Base health points.</summary>
        [Tooltip("Max health")]
        [Min(1)]
        public int maxHealth = 30;

        /// <summary>Action points per turn.</summary>
        [Tooltip("Action points per turn")]
        [Range(1, 10)]
        public int actionPoints = 4;

        /// <summary>Base damage (unarmed).</summary>
        [Tooltip("Base damage")]
        [Min(0)]
        public int baseDamage = 5;

        /// <summary>Armor/damage reduction.</summary>
        [Tooltip("Armor value")]
        [Min(0)]
        public int armor = 0;

        /// <summary>Accuracy modifier (-50 to +50).</summary>
        [Tooltip("Accuracy modifier")]
        [Range(-50, 50)]
        public int accuracyMod = 0;

        /// <summary>Evasion chance (0-100).</summary>
        [Tooltip("Evasion chance")]
        [Range(0, 100)]
        public int evasion = 10;

        /// <summary>Movement speed in tiles per turn.</summary>
        [Tooltip("Movement speed")]
        [Min(1)]
        public int moveSpeed = 3;

        [Header("Equipment")]
        /// <summary>Primary weapon.</summary>
        [Tooltip("Primary weapon")]
        public ItemData weapon;

        /// <summary>Weapon ID for serialization.</summary>
        [Tooltip("Weapon ID")]
        public string weaponId;

        [Header("AI Behavior")]
        /// <summary>AI behavior type.</summary>
        [Tooltip("Behavior pattern")]
        public EnemyBehavior behavior = EnemyBehavior.Aggressive;

        /// <summary>Preferred combat range (0 = melee).</summary>
        [Tooltip("Preferred range")]
        [Min(0)]
        public int preferredRange = 0;

        /// <summary>Flee threshold (health percentage).</summary>
        [Tooltip("Flee at health %")]
        [Range(0f, 1f)]
        public float fleeThreshold = 0f;

        /// <summary>Can this enemy call for reinforcements?</summary>
        [Tooltip("Can call reinforcements")]
        public bool canCallReinforcements = false;

        [Header("Abilities")]
        /// <summary>Special abilities.</summary>
        [Tooltip("Special abilities")]
        public List<EnemyAbility> abilities = new List<EnemyAbility>();

        [Header("Rewards")]
        /// <summary>Experience reward on defeat.</summary>
        [Tooltip("XP reward")]
        [Min(0)]
        public int xpReward = 10;

        /// <summary>Gold dropped on defeat.</summary>
        [Tooltip("Gold reward")]
        [Min(0)]
        public int goldReward = 0;

        /// <summary>Loot table ID.</summary>
        [Tooltip("Loot table ID")]
        public string lootTableId;

        /// <summary>Inline loot table definition.</summary>
        [Tooltip("Loot table")]
        public LootTable lootTable;

        [Header("Visuals")]
        /// <summary>Sprite ID for combat.</summary>
        [Tooltip("Sprite ID")]
        public string spriteId;

        /// <summary>Combat sprite.</summary>
        [Tooltip("Combat sprite")]
        public Sprite combatSprite;

        /// <summary>World prefab.</summary>
        [Tooltip("World prefab")]
        public GameObject worldPrefab;

        [Header("Boss Settings")]
        /// <summary>Is this a boss enemy?</summary>
        [Tooltip("Is boss")]
        public bool isBoss = false;

        /// <summary>Number of combat phases (for bosses).</summary>
        [Tooltip("Combat phases")]
        [Min(1)]
        public int phases = 1;

        /// <summary>Enemies summoned during fight.</summary>
        [Tooltip("Summons")]
        public List<EnemyData> summons = new List<EnemyData>();

        /// <summary>Summon IDs for serialization.</summary>
        [Tooltip("Summon IDs")]
        public List<string> summonIds = new List<string>();

        [Header("Metadata")]
        /// <summary>Tags for filtering.</summary>
        [Tooltip("Tags")]
        public List<string> tags = new List<string>();

        /// <summary>Checks if this enemy has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Checks if this is a melee enemy.</summary>
        public bool IsMelee => HasTag("melee") || preferredRange == 0;

        /// <summary>Checks if this is a ranged enemy.</summary>
        public bool IsRanged => HasTag("ranged") || preferredRange > 0;

        /// <summary>Gets difficulty category based on stats.</summary>
        public string GetDifficulty()
        {
            if (HasTag("legendary") || isBoss) return "Boss";
            if (HasTag("rare") || HasTag("elite")) return "Hard";
            if (HasTag("uncommon")) return "Medium";
            return "Easy";
        }

        /// <summary>Calculates hit chance against a target.</summary>
        public int CalculateHitChance(int targetEvasion, int range, bool isAimedShot = false)
        {
            int baseAccuracy = weapon != null && weapon.hasWeaponStats
                ? weapon.weaponStats.accuracy
                : 70;

            int hitChance = baseAccuracy + accuracyMod;

            // Aimed shot bonus
            if (isAimedShot)
                hitChance += 25;

            // Range penalty (beyond optimal)
            int rangePenalty = Mathf.Max(0, (range - 3) * 5);
            hitChance -= rangePenalty;

            // Target evasion
            hitChance -= targetEvasion;

            return Mathf.Clamp(hitChance, 5, 95);
        }

        /// <summary>Calculates damage dealt.</summary>
        public int CalculateDamage(int targetArmor, bool isCritical = false)
        {
            int damage = weapon != null && weapon.hasWeaponStats
                ? weapon.weaponStats.damage
                : baseDamage;

            // Critical doubles damage
            if (isCritical)
                damage *= 2;

            // Armor reduction
            damage = Mathf.Max(1, damage - targetArmor);

            return damage;
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }

            // Auto-tag based on type
            if (isBoss && !tags.Contains("boss"))
                tags.Add("boss");
        }
#endif
    }

    /// <summary>
    /// Combat encounter preset combining multiple enemies.
    /// </summary>
    [CreateAssetMenu(fileName = "New Encounter", menuName = "Iron Frontier/Data/Combat Encounter", order = 7)]
    public class CombatEncounterData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier.</summary>
        [Tooltip("Unique identifier")]
        public string id;

        /// <summary>Display name.</summary>
        [Tooltip("Display name")]
        public string displayName;

        /// <summary>Description.</summary>
        [Tooltip("Description")]
        [TextArea(1, 3)]
        public string description;

        [Header("Enemies")]
        /// <summary>Enemies in this encounter.</summary>
        [Tooltip("Enemies")]
        public List<EncounterEnemy> enemies = new List<EncounterEnemy>();

        [Header("Settings")]
        /// <summary>Required player level (minimum).</summary>
        [Tooltip("Min level")]
        [Min(1)]
        public int minLevel = 1;

        /// <summary>Is this a boss fight?</summary>
        [Tooltip("Is boss fight")]
        public bool isBoss = false;

        /// <summary>Can player flee?</summary>
        [Tooltip("Can flee")]
        public bool canFlee = true;

        /// <summary>Music track ID.</summary>
        [Tooltip("Music ID")]
        public string musicId;

        /// <summary>Arena/background ID.</summary>
        [Tooltip("Arena ID")]
        public string arenaId;

        [Header("Rewards")]
        /// <summary>Bonus XP for completing encounter.</summary>
        [Tooltip("Bonus XP")]
        [Min(0)]
        public int bonusXp = 0;

        /// <summary>Bonus gold for completing encounter.</summary>
        [Tooltip("Bonus gold")]
        [Min(0)]
        public int bonusGold = 0;

        /// <summary>Guaranteed item drops.</summary>
        [Tooltip("Guaranteed drops")]
        public List<GuaranteedDrop> guaranteedDrops = new List<GuaranteedDrop>();

        [Header("Metadata")]
        /// <summary>Tags for triggering.</summary>
        [Tooltip("Tags")]
        public List<string> tags = new List<string>();

        /// <summary>Gets total XP reward including all enemies.</summary>
        public int TotalXP
        {
            get
            {
                int total = bonusXp;
                foreach (var entry in enemies)
                {
                    if (entry.enemy != null)
                        total += entry.enemy.xpReward * entry.count;
                }
                return total;
            }
        }

        /// <summary>Gets total gold reward including all enemies.</summary>
        public int TotalGold
        {
            get
            {
                int total = bonusGold;
                foreach (var entry in enemies)
                {
                    if (entry.enemy != null)
                        total += entry.enemy.goldReward * entry.count;
                }
                return total;
            }
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }
        }
#endif
    }

    /// <summary>
    /// Enemy entry in a combat encounter.
    /// </summary>
    [Serializable]
    public struct EncounterEnemy
    {
        /// <summary>Enemy reference.</summary>
        public EnemyData enemy;

        /// <summary>Enemy ID for serialization.</summary>
        public string enemyId;

        /// <summary>Number of this enemy.</summary>
        [Min(1)]
        public int count;

        /// <summary>Level scaling for this enemy.</summary>
        [Min(1)]
        public int level;
    }

    /// <summary>
    /// Guaranteed drop from an encounter.
    /// </summary>
    [Serializable]
    public struct GuaranteedDrop
    {
        /// <summary>Item reference.</summary>
        public ItemData item;

        /// <summary>Item ID for serialization.</summary>
        public string itemId;

        /// <summary>Quantity to drop.</summary>
        [Min(1)]
        public int quantity;

        /// <summary>Chance to drop (0-1).</summary>
        [Range(0f, 1f)]
        public float chance;
    }
}
