using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Item type categories.
    /// </summary>
    public enum ItemType
    {
        Weapon,
        Armor,
        Consumable,
        KeyItem,
        Junk,
        Currency
    }

    /// <summary>
    /// Item rarity levels affecting value and spawn rates.
    /// </summary>
    public enum ItemRarity
    {
        Common,
        Uncommon,
        Rare,
        Legendary
    }

    /// <summary>
    /// Weapon type classification.
    /// </summary>
    public enum WeaponType
    {
        Revolver,
        Rifle,
        Shotgun,
        Knife,
        Explosive,
        Melee
    }

    /// <summary>
    /// Ammunition type for ranged weapons.
    /// </summary>
    public enum AmmoType
    {
        Pistol,
        Rifle,
        Shotgun,
        None
    }

    /// <summary>
    /// Buff effect types for consumables and equipment.
    /// </summary>
    public enum BuffType
    {
        None,
        HealthRegen,
        StaminaRegen,
        DamageBoost,
        DefenseBoost,
        SpeedBoost,
        DamageResist,
        PoisonResist,
        HeatResist,
        ColdResist
    }

    /// <summary>
    /// Effect types when using items.
    /// </summary>
    public enum EffectType
    {
        None,
        Heal,
        Stamina,
        Buff,
        Damage,
        Unlock,
        Cure
    }

    /// <summary>
    /// Equipment slot types.
    /// </summary>
    public enum EquipmentSlot
    {
        Weapon,
        Offhand,
        Head,
        Body,
        Legs,
        Feet,
        Accessory1,
        Accessory2
    }

    /// <summary>
    /// Armor slot types (subset of equipment slots).
    /// </summary>
    public enum ArmorSlot
    {
        Head,
        Body,
        Legs,
        Accessory
    }

    /// <summary>
    /// Effect applied when an item is used.
    /// </summary>
    [Serializable]
    public struct ItemEffect
    {
        /// <summary>Type of effect.</summary>
        public EffectType type;

        /// <summary>Effect value/amount.</summary>
        public int value;

        /// <summary>Duration in seconds (0 = instant).</summary>
        public float duration;

        /// <summary>Buff type if effect is a buff.</summary>
        public BuffType buffType;
    }

    /// <summary>
    /// Weapon-specific statistics.
    /// </summary>
    [Serializable]
    public struct WeaponStats
    {
        /// <summary>Weapon type classification.</summary>
        public WeaponType weaponType;

        /// <summary>Base damage per hit.</summary>
        [Min(1)]
        public int damage;

        /// <summary>Effective range (0 = melee).</summary>
        [Min(0)]
        public float range;

        /// <summary>Base accuracy percentage (0-100).</summary>
        [Range(0, 100)]
        public int accuracy;

        /// <summary>Shots per second.</summary>
        [Min(0)]
        public float fireRate;

        /// <summary>Required ammunition type.</summary>
        public AmmoType ammoType;

        /// <summary>Magazine/clip size (0 = no reload).</summary>
        [Min(0)]
        public int clipSize;

        /// <summary>Reload time in seconds.</summary>
        [Min(0)]
        public float reloadTime;

        public static WeaponStats DefaultMelee => new WeaponStats
        {
            weaponType = WeaponType.Knife,
            damage = 5,
            range = 0,
            accuracy = 85,
            fireRate = 2f,
            ammoType = AmmoType.None,
            clipSize = 0,
            reloadTime = 0
        };

        public static WeaponStats DefaultRevolver => new WeaponStats
        {
            weaponType = WeaponType.Revolver,
            damage = 8,
            range = 30,
            accuracy = 70,
            fireRate = 1.5f,
            ammoType = AmmoType.Pistol,
            clipSize = 6,
            reloadTime = 3f
        };
    }

    /// <summary>
    /// Resistance entry for elemental/damage type resistances.
    /// </summary>
    [Serializable]
    public struct ResistanceEntry
    {
        /// <summary>Resistance type name (e.g., "fire", "slashing").</summary>
        public string type;

        /// <summary>Resistance percentage.</summary>
        [Range(0, 100)]
        public int value;
    }

    /// <summary>
    /// Armor-specific statistics.
    /// </summary>
    [Serializable]
    public struct ArmorStats
    {
        /// <summary>Base defense value.</summary>
        [Min(0)]
        public int defense;

        /// <summary>Equipment slot this armor occupies.</summary>
        public ArmorSlot slot;

        /// <summary>Movement speed reduction (0-1).</summary>
        [Range(0f, 1f)]
        public float movementPenalty;

        /// <summary>Elemental/type resistances.</summary>
        public List<ResistanceEntry> resistances;

        public static ArmorStats Default => new ArmorStats
        {
            defense = 2,
            slot = ArmorSlot.Body,
            movementPenalty = 0,
            resistances = new List<ResistanceEntry>()
        };
    }

    /// <summary>
    /// Consumable-specific statistics.
    /// </summary>
    [Serializable]
    public struct ConsumableStats
    {
        /// <summary>Health restored on use.</summary>
        [Min(0)]
        public int healAmount;

        /// <summary>Stamina restored on use.</summary>
        [Min(0)]
        public int staminaAmount;

        /// <summary>Buff type applied.</summary>
        public BuffType buffType;

        /// <summary>Buff duration in seconds.</summary>
        [Min(0)]
        public float buffDuration;

        /// <summary>Buff strength/value.</summary>
        [Min(0)]
        public int buffStrength;

        public static ConsumableStats DefaultHealing => new ConsumableStats
        {
            healAmount = 20,
            staminaAmount = 0,
            buffType = BuffType.None,
            buffDuration = 0,
            buffStrength = 0
        };
    }

    /// <summary>
    /// Item data definition as a ScriptableObject.
    /// Supports weapons, armor, consumables, key items, junk, and currency.
    /// </summary>
    [CreateAssetMenu(fileName = "New Item", menuName = "Iron Frontier/Data/Item Data", order = 2)]
    public class ItemData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier for this item.</summary>
        [Tooltip("Unique identifier for this item")]
        public string id;

        /// <summary>Display name shown in inventory.</summary>
        [Tooltip("Display name shown in inventory")]
        public string displayName;

        /// <summary>Flavor description for tooltips.</summary>
        [Tooltip("Flavor description for tooltips")]
        [TextArea(2, 4)]
        public string description;

        /// <summary>Item category.</summary>
        [Tooltip("Item category")]
        public ItemType type;

        /// <summary>Rarity level.</summary>
        [Tooltip("Rarity level")]
        public ItemRarity rarity = ItemRarity.Common;

        [Header("Economy")]
        /// <summary>Base value in dollars.</summary>
        [Tooltip("Base value in dollars")]
        [Min(0)]
        public int value;

        /// <summary>Weight in pounds.</summary>
        [Tooltip("Weight in pounds")]
        [Min(0)]
        public float weight = 0.1f;

        [Header("Stacking")]
        /// <summary>Can this item be stacked?</summary>
        [Tooltip("Can this item be stacked?")]
        public bool stackable = true;

        /// <summary>Maximum stack size.</summary>
        [Tooltip("Maximum stack size")]
        [Min(1)]
        public int maxStack = 99;

        [Header("Usage")]
        /// <summary>Can be used from inventory.</summary>
        [Tooltip("Can be used from inventory")]
        public bool usable;

        /// <summary>Can be dropped.</summary>
        [Tooltip("Can be dropped")]
        public bool droppable = true;

        /// <summary>Can be sold to merchants.</summary>
        [Tooltip("Can be sold to merchants")]
        public bool sellable = true;

        [Header("Visuals")]
        /// <summary>Inventory icon sprite.</summary>
        [Tooltip("Inventory icon sprite")]
        public Sprite icon;

        /// <summary>Icon ID for dynamic loading.</summary>
        [Tooltip("Icon ID for dynamic loading")]
        public string iconId;

        /// <summary>World model prefab.</summary>
        [Tooltip("World model prefab")]
        public GameObject worldModelPrefab;

        [Header("Effects")]
        /// <summary>Effects when used.</summary>
        [Tooltip("Effects when used")]
        public List<ItemEffect> effects = new List<ItemEffect>();

        [Header("Weapon Stats")]
        /// <summary>Enable if this is a weapon.</summary>
        [Tooltip("Enable if this is a weapon")]
        public bool hasWeaponStats;

        /// <summary>Weapon-specific statistics.</summary>
        [Tooltip("Weapon-specific statistics")]
        public WeaponStats weaponStats;

        [Header("Armor Stats")]
        /// <summary>Enable if this is armor.</summary>
        [Tooltip("Enable if this is armor")]
        public bool hasArmorStats;

        /// <summary>Armor-specific statistics.</summary>
        [Tooltip("Armor-specific statistics")]
        public ArmorStats armorStats;

        [Header("Consumable Stats")]
        /// <summary>Enable if this is a consumable.</summary>
        [Tooltip("Enable if this is a consumable")]
        public bool hasConsumableStats;

        /// <summary>Consumable-specific statistics.</summary>
        [Tooltip("Consumable-specific statistics")]
        public ConsumableStats consumableStats;

        [Header("Key Item")]
        /// <summary>Quest this key item relates to.</summary>
        [Tooltip("Quest this key item relates to")]
        public QuestData relatedQuest;

        /// <summary>Quest ID for serialization.</summary>
        [Tooltip("Quest ID for serialization")]
        public string questId;

        /// <summary>What this key unlocks (location, door, etc.).</summary>
        [Tooltip("What this key unlocks")]
        public string unlocksId;

        [Header("Currency")]
        /// <summary>Exchange rate to base currency (dollars).</summary>
        [Tooltip("Exchange rate to base currency")]
        [Min(0)]
        public float exchangeRate = 1f;

        [Header("Metadata")]
        /// <summary>Tags for filtering and categorization.</summary>
        [Tooltip("Tags for filtering and categorization")]
        public List<string> tags = new List<string>();

        /// <summary>Checks if this item has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Checks if this is a weapon.</summary>
        public bool IsWeapon => type == ItemType.Weapon && hasWeaponStats;

        /// <summary>Checks if this is armor.</summary>
        public bool IsArmor => type == ItemType.Armor && hasArmorStats;

        /// <summary>Checks if this is a consumable.</summary>
        public bool IsConsumable => type == ItemType.Consumable;

        /// <summary>Checks if this is a key item.</summary>
        public bool IsKeyItem => type == ItemType.KeyItem;

        /// <summary>Gets the rarity color for UI display.</summary>
        public Color GetRarityColor()
        {
            return rarity switch
            {
                ItemRarity.Legendary => new Color(1f, 0.843f, 0f),      // Gold
                ItemRarity.Rare => new Color(0.608f, 0.349f, 0.714f),   // Purple
                ItemRarity.Uncommon => new Color(0.153f, 0.682f, 0.376f), // Green
                _ => new Color(0.584f, 0.647f, 0.651f)                   // Gray
            };
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }

            // Auto-configure based on type
            switch (type)
            {
                case ItemType.Weapon:
                    hasWeaponStats = true;
                    stackable = false;
                    maxStack = 1;
                    usable = false;
                    break;
                case ItemType.Armor:
                    hasArmorStats = true;
                    stackable = false;
                    maxStack = 1;
                    usable = false;
                    break;
                case ItemType.Consumable:
                    hasConsumableStats = true;
                    usable = true;
                    break;
                case ItemType.KeyItem:
                    droppable = false;
                    sellable = false;
                    stackable = false;
                    maxStack = 1;
                    break;
                case ItemType.Currency:
                    droppable = false;
                    usable = false;
                    weight = 0;
                    break;
            }
        }
#endif
    }
}
