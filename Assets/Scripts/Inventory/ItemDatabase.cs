using System;
using System.Collections.Generic;
using System.Linq;
using IronFrontier.Data;
using UnityEngine;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Central database for all item definitions.
    /// Supports loading from ScriptableObjects and JSON.
    /// </summary>
    [CreateAssetMenu(fileName = "ItemDatabase", menuName = "Iron Frontier/Data/Item Database", order = 1)]
    public class ItemDatabase : ScriptableObject
    {
        #region Singleton

        private static ItemDatabase _instance;

        /// <summary>
        /// Global singleton instance of the ItemDatabase.
        /// </summary>
        public static ItemDatabase Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = Resources.Load<ItemDatabase>("ItemDatabase");
                    if (_instance == null)
                    {
                        Debug.LogWarning("[ItemDatabase] No ItemDatabase found in Resources folder. Creating runtime instance.");
                        _instance = CreateInstance<ItemDatabase>();
                    }
                    _instance.Initialize();
                }
                return _instance;
            }
        }

        #endregion

        #region Serialized Fields

        [Header("Item Sources")]
        [SerializeField]
        [Tooltip("List of all item ScriptableObjects")]
        private List<ItemData> items = new List<ItemData>();

        [SerializeField]
        [Tooltip("JSON file containing additional item definitions")]
        private TextAsset itemsJsonFile;

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Auto-initialize on first access")]
        private bool autoInitialize = true;

        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private Dictionary<string, ItemData> _itemsById;
        private Dictionary<ItemType, List<ItemData>> _itemsByType;
        private Dictionary<ItemRarity, List<ItemData>> _itemsByRarity;
        private Dictionary<string, List<ItemData>> _itemsByTag;
        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>
        /// All items in the database.
        /// </summary>
        public IReadOnlyList<ItemData> AllItems => items;

        /// <summary>
        /// Number of items in the database.
        /// </summary>
        public int Count => items.Count;

        /// <summary>
        /// Whether the database has been initialized.
        /// </summary>
        public bool IsInitialized => _isInitialized;

        #endregion

        #region Unity Lifecycle

        private void OnEnable()
        {
            if (autoInitialize)
            {
                Initialize();
            }
        }

        private void OnValidate()
        {
            // Rebuild indices when items change in editor
            if (_isInitialized)
            {
                RebuildIndices();
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the database and build lookup indices.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized)
                return;

            Log("Initializing ItemDatabase...");

            _itemsById = new Dictionary<string, ItemData>();
            _itemsByType = new Dictionary<ItemType, List<ItemData>>();
            _itemsByRarity = new Dictionary<ItemRarity, List<ItemData>>();
            _itemsByTag = new Dictionary<string, List<ItemData>>();

            // Initialize type buckets
            foreach (ItemType type in Enum.GetValues(typeof(ItemType)))
            {
                _itemsByType[type] = new List<ItemData>();
            }

            // Initialize rarity buckets
            foreach (ItemRarity rarity in Enum.GetValues(typeof(ItemRarity)))
            {
                _itemsByRarity[rarity] = new List<ItemData>();
            }

            // Index all items
            foreach (var item in items)
            {
                IndexItem(item);
            }

            // Load from JSON if available
            if (itemsJsonFile != null)
            {
                LoadFromJson(itemsJsonFile.text);
            }

            _isInitialized = true;
            Log($"ItemDatabase initialized with {items.Count} items");
        }

        /// <summary>
        /// Force rebuild of all lookup indices.
        /// </summary>
        public void RebuildIndices()
        {
            _isInitialized = false;
            Initialize();
        }

        private void IndexItem(ItemData item)
        {
            if (item == null)
                return;

            // Index by ID
            if (!string.IsNullOrEmpty(item.id))
            {
                if (_itemsById.ContainsKey(item.id))
                {
                    LogWarning($"Duplicate item ID: {item.id}");
                }
                _itemsById[item.id] = item;
            }

            // Index by type
            _itemsByType[item.type].Add(item);

            // Index by rarity
            _itemsByRarity[item.rarity].Add(item);

            // Index by tags
            foreach (var tag in item.tags)
            {
                if (!_itemsByTag.ContainsKey(tag))
                {
                    _itemsByTag[tag] = new List<ItemData>();
                }
                _itemsByTag[tag].Add(item);
            }
        }

        #endregion

        #region Query Methods

        /// <summary>
        /// Get an item by its unique ID.
        /// </summary>
        /// <param name="itemId">The item ID.</param>
        /// <returns>The item data, or null if not found.</returns>
        public ItemData GetItemById(string itemId)
        {
            if (!_isInitialized)
                Initialize();

            if (string.IsNullOrEmpty(itemId))
                return null;

            _itemsById.TryGetValue(itemId, out var item);
            return item;
        }

        /// <summary>
        /// Try to get an item by its ID.
        /// </summary>
        /// <param name="itemId">The item ID.</param>
        /// <param name="item">The found item.</param>
        /// <returns>True if the item was found.</returns>
        public bool TryGetItem(string itemId, out ItemData item)
        {
            item = GetItemById(itemId);
            return item != null;
        }

        /// <summary>
        /// Get all items of a specific type.
        /// </summary>
        /// <param name="type">The item type.</param>
        /// <returns>List of items of that type.</returns>
        public IReadOnlyList<ItemData> GetItemsByType(ItemType type)
        {
            if (!_isInitialized)
                Initialize();

            return _itemsByType.TryGetValue(type, out var list) ? list : new List<ItemData>();
        }

        /// <summary>
        /// Get all items of a specific rarity.
        /// </summary>
        /// <param name="rarity">The item rarity.</param>
        /// <returns>List of items of that rarity.</returns>
        public IReadOnlyList<ItemData> GetItemsByRarity(ItemRarity rarity)
        {
            if (!_isInitialized)
                Initialize();

            return _itemsByRarity.TryGetValue(rarity, out var list) ? list : new List<ItemData>();
        }

        /// <summary>
        /// Get all items with a specific tag.
        /// </summary>
        /// <param name="tag">The tag to search for.</param>
        /// <returns>List of items with that tag.</returns>
        public IReadOnlyList<ItemData> GetItemsByTag(string tag)
        {
            if (!_isInitialized)
                Initialize();

            return _itemsByTag.TryGetValue(tag, out var list) ? list : new List<ItemData>();
        }

        /// <summary>
        /// Get all weapons.
        /// </summary>
        public IReadOnlyList<ItemData> GetWeapons() => GetItemsByType(ItemType.Weapon);

        /// <summary>
        /// Get all armor.
        /// </summary>
        public IReadOnlyList<ItemData> GetArmor() => GetItemsByType(ItemType.Armor);

        /// <summary>
        /// Get all consumables.
        /// </summary>
        public IReadOnlyList<ItemData> GetConsumables() => GetItemsByType(ItemType.Consumable);

        /// <summary>
        /// Get all key items.
        /// </summary>
        public IReadOnlyList<ItemData> GetKeyItems() => GetItemsByType(ItemType.KeyItem);

        /// <summary>
        /// Get all weapons of a specific weapon type.
        /// </summary>
        /// <param name="weaponType">The weapon type.</param>
        /// <returns>List of weapons of that type.</returns>
        public IReadOnlyList<ItemData> GetWeaponsByType(WeaponType weaponType)
        {
            if (!_isInitialized)
                Initialize();

            return GetItemsByType(ItemType.Weapon)
                .Where(item => item.hasWeaponStats && item.weaponStats.weaponType == weaponType)
                .ToList();
        }

        /// <summary>
        /// Get all armor for a specific slot.
        /// </summary>
        /// <param name="slot">The armor slot.</param>
        /// <returns>List of armor for that slot.</returns>
        public IReadOnlyList<ItemData> GetArmorBySlot(ArmorSlot slot)
        {
            if (!_isInitialized)
                Initialize();

            return GetItemsByType(ItemType.Armor)
                .Where(item => item.hasArmorStats && item.armorStats.slot == slot)
                .ToList();
        }

        /// <summary>
        /// Get healing items.
        /// </summary>
        public IReadOnlyList<ItemData> GetHealingItems()
        {
            return GetItemsByTag("healing");
        }

        /// <summary>
        /// Search items by name (partial match).
        /// </summary>
        /// <param name="searchTerm">The search term.</param>
        /// <returns>List of matching items.</returns>
        public IReadOnlyList<ItemData> SearchByName(string searchTerm)
        {
            if (!_isInitialized)
                Initialize();

            if (string.IsNullOrEmpty(searchTerm))
                return items;

            var lowerSearch = searchTerm.ToLowerInvariant();
            return items
                .Where(item => item.displayName.ToLowerInvariant().Contains(lowerSearch))
                .ToList();
        }

        /// <summary>
        /// Get items within a value range.
        /// </summary>
        /// <param name="minValue">Minimum value.</param>
        /// <param name="maxValue">Maximum value.</param>
        /// <returns>List of items within the value range.</returns>
        public IReadOnlyList<ItemData> GetItemsByValueRange(int minValue, int maxValue)
        {
            if (!_isInitialized)
                Initialize();

            return items
                .Where(item => item.value >= minValue && item.value <= maxValue)
                .ToList();
        }

        /// <summary>
        /// Get sellable items.
        /// </summary>
        public IReadOnlyList<ItemData> GetSellableItems()
        {
            if (!_isInitialized)
                Initialize();

            return items.Where(item => item.sellable).ToList();
        }

        /// <summary>
        /// Get a random item of the specified type and rarity.
        /// </summary>
        /// <param name="type">Optional item type filter.</param>
        /// <param name="rarity">Optional rarity filter.</param>
        /// <returns>A random item matching criteria, or null if none found.</returns>
        public ItemData GetRandomItem(ItemType? type = null, ItemRarity? rarity = null)
        {
            if (!_isInitialized)
                Initialize();

            IEnumerable<ItemData> candidates = items;

            if (type.HasValue)
            {
                candidates = candidates.Where(item => item.type == type.Value);
            }

            if (rarity.HasValue)
            {
                candidates = candidates.Where(item => item.rarity == rarity.Value);
            }

            var list = candidates.ToList();
            if (list.Count == 0)
                return null;

            return list[UnityEngine.Random.Range(0, list.Count)];
        }

        /// <summary>
        /// Check if an item ID exists in the database.
        /// </summary>
        /// <param name="itemId">The item ID to check.</param>
        /// <returns>True if the item exists.</returns>
        public bool HasItem(string itemId)
        {
            if (!_isInitialized)
                Initialize();

            return !string.IsNullOrEmpty(itemId) && _itemsById.ContainsKey(itemId);
        }

        #endregion

        #region Management Methods

        /// <summary>
        /// Add an item to the database at runtime.
        /// </summary>
        /// <param name="item">The item to add.</param>
        public void AddItem(ItemData item)
        {
            if (item == null)
                return;

            if (!_isInitialized)
                Initialize();

            if (!items.Contains(item))
            {
                items.Add(item);
                IndexItem(item);
                Log($"Added item: {item.displayName}");
            }
        }

        /// <summary>
        /// Remove an item from the database at runtime.
        /// </summary>
        /// <param name="item">The item to remove.</param>
        public void RemoveItem(ItemData item)
        {
            if (item == null || !items.Contains(item))
                return;

            items.Remove(item);
            RebuildIndices();
            Log($"Removed item: {item.displayName}");
        }

        /// <summary>
        /// Clear all items from the database.
        /// </summary>
        public void ClearAll()
        {
            items.Clear();
            _itemsById?.Clear();
            _itemsByType?.Clear();
            _itemsByRarity?.Clear();
            _itemsByTag?.Clear();
            _isInitialized = false;
            Log("Database cleared");
        }

        #endregion

        #region JSON Loading

        /// <summary>
        /// Load items from a JSON string.
        /// </summary>
        /// <param name="json">JSON string containing item definitions.</param>
        public void LoadFromJson(string json)
        {
            if (string.IsNullOrEmpty(json))
                return;

            try
            {
                var wrapper = JsonUtility.FromJson<JsonItemsWrapper>(json);
                if (wrapper?.items != null)
                {
                    Log($"Loading {wrapper.items.Length} items from JSON...");
                    foreach (var jsonItem in wrapper.items)
                    {
                        var item = CreateItemFromJson(jsonItem);
                        if (item != null && !_itemsById.ContainsKey(item.id))
                        {
                            items.Add(item);
                            IndexItem(item);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[ItemDatabase] Failed to load items from JSON: {e.Message}");
            }
        }

        private ItemData CreateItemFromJson(JsonItemData jsonItem)
        {
            var item = CreateInstance<ItemData>();
            item.id = jsonItem.id;
            item.displayName = jsonItem.name;
            item.description = jsonItem.description;
            item.type = ParseItemType(jsonItem.type);
            item.rarity = ParseItemRarity(jsonItem.rarity);
            item.value = jsonItem.value;
            item.weight = jsonItem.weight;
            item.stackable = jsonItem.stackable;
            item.maxStack = jsonItem.maxStack;
            item.usable = jsonItem.usable;
            item.droppable = jsonItem.droppable;
            item.sellable = jsonItem.sellable;
            item.iconId = jsonItem.icon;
            item.tags = jsonItem.tags != null ? new List<string>(jsonItem.tags) : new List<string>();

            // Parse weapon stats
            if (jsonItem.weaponStats != null)
            {
                item.hasWeaponStats = true;
                item.weaponStats = new WeaponStats
                {
                    weaponType = ParseWeaponType(jsonItem.weaponStats.weaponType),
                    damage = jsonItem.weaponStats.damage,
                    range = jsonItem.weaponStats.range,
                    accuracy = jsonItem.weaponStats.accuracy,
                    fireRate = jsonItem.weaponStats.fireRate,
                    ammoType = ParseAmmoType(jsonItem.weaponStats.ammoType),
                    clipSize = jsonItem.weaponStats.clipSize,
                    reloadTime = jsonItem.weaponStats.reloadTime
                };
            }

            // Parse armor stats
            if (jsonItem.armorStats != null)
            {
                item.hasArmorStats = true;
                item.armorStats = new ArmorStats
                {
                    defense = jsonItem.armorStats.defense,
                    slot = ParseArmorSlot(jsonItem.armorStats.slot),
                    movementPenalty = jsonItem.armorStats.movementPenalty
                };
            }

            // Parse consumable stats
            if (jsonItem.consumableStats != null)
            {
                item.hasConsumableStats = true;
                item.consumableStats = new ConsumableStats
                {
                    healAmount = jsonItem.consumableStats.healAmount,
                    staminaAmount = jsonItem.consumableStats.staminaAmount,
                    buffType = ParseBuffType(jsonItem.consumableStats.buffType),
                    buffDuration = jsonItem.consumableStats.buffDuration,
                    buffStrength = jsonItem.consumableStats.buffStrength
                };
            }

            return item;
        }

        #endregion

        #region Type Parsing

        private ItemType ParseItemType(string typeStr)
        {
            return typeStr?.ToLowerInvariant() switch
            {
                "weapon" => ItemType.Weapon,
                "armor" => ItemType.Armor,
                "consumable" => ItemType.Consumable,
                "key_item" => ItemType.KeyItem,
                "junk" => ItemType.Junk,
                "currency" => ItemType.Currency,
                _ => ItemType.Junk
            };
        }

        private ItemRarity ParseItemRarity(string rarityStr)
        {
            return rarityStr?.ToLowerInvariant() switch
            {
                "common" => ItemRarity.Common,
                "uncommon" => ItemRarity.Uncommon,
                "rare" => ItemRarity.Rare,
                "legendary" or "epic" => ItemRarity.Legendary,
                _ => ItemRarity.Common
            };
        }

        private WeaponType ParseWeaponType(string typeStr)
        {
            return typeStr?.ToLowerInvariant() switch
            {
                "revolver" => WeaponType.Revolver,
                "rifle" => WeaponType.Rifle,
                "shotgun" => WeaponType.Shotgun,
                "knife" => WeaponType.Knife,
                "explosive" => WeaponType.Explosive,
                "melee" => WeaponType.Melee,
                _ => WeaponType.Melee
            };
        }

        private AmmoType ParseAmmoType(string typeStr)
        {
            return typeStr?.ToLowerInvariant() switch
            {
                "pistol" => AmmoType.Pistol,
                "rifle" => AmmoType.Rifle,
                "shotgun" => AmmoType.Shotgun,
                _ => AmmoType.None
            };
        }

        private ArmorSlot ParseArmorSlot(string slotStr)
        {
            return slotStr?.ToLowerInvariant() switch
            {
                "head" => ArmorSlot.Head,
                "body" => ArmorSlot.Body,
                "legs" => ArmorSlot.Legs,
                "accessory" => ArmorSlot.Accessory,
                _ => ArmorSlot.Body
            };
        }

        private BuffType ParseBuffType(string buffStr)
        {
            return buffStr?.ToLowerInvariant() switch
            {
                "health_regen" => BuffType.HealthRegen,
                "stamina_regen" => BuffType.StaminaRegen,
                "damage_boost" => BuffType.DamageBoost,
                "defense_boost" => BuffType.DefenseBoost,
                "speed_boost" => BuffType.SpeedBoost,
                "damage_resist" => BuffType.DamageResist,
                "poison_resist" => BuffType.PoisonResist,
                "heat_resist" => BuffType.HeatResist,
                "cold_resist" => BuffType.ColdResist,
                _ => BuffType.None
            };
        }

        #endregion

        #region JSON Data Structures

        [Serializable]
        private class JsonItemsWrapper
        {
            public JsonItemData[] items;
        }

        [Serializable]
        private class JsonItemData
        {
            public string id;
            public string name;
            public string description;
            public string type;
            public string rarity;
            public int value;
            public float weight;
            public bool stackable;
            public int maxStack;
            public bool usable;
            public bool droppable;
            public bool sellable;
            public string icon;
            public string[] tags;
            public JsonWeaponStats weaponStats;
            public JsonArmorStats armorStats;
            public JsonConsumableStats consumableStats;
        }

        [Serializable]
        private class JsonWeaponStats
        {
            public string weaponType;
            public int damage;
            public float range;
            public int accuracy;
            public float fireRate;
            public string ammoType;
            public int clipSize;
            public float reloadTime;
        }

        [Serializable]
        private class JsonArmorStats
        {
            public int defense;
            public string slot;
            public float movementPenalty;
        }

        [Serializable]
        private class JsonConsumableStats
        {
            public int healAmount;
            public int staminaAmount;
            public string buffType;
            public float buffDuration;
            public int buffStrength;
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[ItemDatabase] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[ItemDatabase] {message}");
        }

        #endregion
    }
}
