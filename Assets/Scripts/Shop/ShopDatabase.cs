using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Shop
{
    /// <summary>
    /// Central database for all shop definitions.
    /// Loads from JSON files and provides query methods.
    /// </summary>
    [CreateAssetMenu(fileName = "ShopDatabase", menuName = "Iron Frontier/Shop/Shop Database", order = 0)]
    public class ShopDatabase : ScriptableObject
    {
        #region Singleton

        private static ShopDatabase _instance;

        /// <summary>
        /// Global singleton instance of the ShopDatabase.
        /// </summary>
        public static ShopDatabase Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = Resources.Load<ShopDatabase>("ShopDatabase");
                    if (_instance == null)
                    {
                        Debug.LogWarning("[ShopDatabase] No ShopDatabase found in Resources folder. Creating runtime instance.");
                        _instance = CreateInstance<ShopDatabase>();
                        _instance.LoadFromResources();
                    }
                    _instance.Initialize();
                }
                return _instance;
            }
        }

        #endregion

        #region Serialized Fields

        [Header("Data Sources")]
        [SerializeField]
        [Tooltip("JSON file containing shop definitions")]
        private TextAsset shopsJsonFile;

        [SerializeField]
        [Tooltip("List of shop ScriptableObjects")]
        private List<ShopData> shops = new List<ShopData>();

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Auto-initialize on first access")]
        private bool autoInitialize = true;

        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private Dictionary<string, ShopData> _shopsById;
        private Dictionary<string, List<ShopData>> _shopsByLocation;
        private Dictionary<ShopType, List<ShopData>> _shopsByType;
        private Dictionary<string, List<ShopData>> _shopsByTag;
        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>
        /// All shops in the database.
        /// </summary>
        public IReadOnlyList<ShopData> AllShops => shops;

        /// <summary>
        /// Number of shops in the database.
        /// </summary>
        public int Count => shops.Count;

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

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the database.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized)
                return;

            Log("Initializing ShopDatabase...");

            _shopsById = new Dictionary<string, ShopData>();
            _shopsByLocation = new Dictionary<string, List<ShopData>>();
            _shopsByType = new Dictionary<ShopType, List<ShopData>>();
            _shopsByTag = new Dictionary<string, List<ShopData>>();

            // Initialize type buckets
            foreach (ShopType type in Enum.GetValues(typeof(ShopType)))
            {
                _shopsByType[type] = new List<ShopData>();
            }

            // Index existing shops
            foreach (var shop in shops)
            {
                IndexShop(shop);
            }

            // Load from JSON if available
            if (shopsJsonFile != null)
            {
                LoadFromJson(shopsJsonFile.text);
            }
            else
            {
                // Try loading from Resources
                LoadFromResources();
            }

            _isInitialized = true;
            Log($"ShopDatabase initialized with {shops.Count} shops");
        }

        /// <summary>
        /// Load shops from Resources folder.
        /// </summary>
        private void LoadFromResources()
        {
            var jsonFile = Resources.Load<TextAsset>("Data/Shops/shops");
            if (jsonFile != null)
            {
                LoadFromJson(jsonFile.text);
            }
        }

        /// <summary>
        /// Load shops from JSON string.
        /// </summary>
        public void LoadFromJson(string json)
        {
            if (string.IsNullOrEmpty(json))
                return;

            try
            {
                var wrapper = JsonUtility.FromJson<ShopsJsonWrapper>(json);
                if (wrapper?.shops == null)
                    return;

                Log($"Loading {wrapper.shops.Length} shops from JSON...");

                foreach (var jsonShop in wrapper.shops)
                {
                    if (_shopsById.ContainsKey(jsonShop.id))
                    {
                        Log($"Skipping duplicate shop: {jsonShop.id}");
                        continue;
                    }

                    var shop = CreateShopFromJson(jsonShop);
                    if (shop != null)
                    {
                        shops.Add(shop);
                        IndexShop(shop);
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[ShopDatabase] Failed to load shops from JSON: {e.Message}");
            }
        }

        private void IndexShop(ShopData shop)
        {
            if (shop == null || string.IsNullOrEmpty(shop.shopId))
                return;

            // Index by ID
            if (_shopsById.ContainsKey(shop.shopId))
            {
                LogWarning($"Duplicate shop ID: {shop.shopId}");
            }
            _shopsById[shop.shopId] = shop;

            // Index by location
            if (!string.IsNullOrEmpty(shop.locationId))
            {
                if (!_shopsByLocation.ContainsKey(shop.locationId))
                {
                    _shopsByLocation[shop.locationId] = new List<ShopData>();
                }
                _shopsByLocation[shop.locationId].Add(shop);
            }

            // Index by type
            _shopsByType[shop.shopType].Add(shop);

            // Index by tags
            foreach (var tag in shop.tags)
            {
                if (!_shopsByTag.ContainsKey(tag))
                {
                    _shopsByTag[tag] = new List<ShopData>();
                }
                _shopsByTag[tag].Add(shop);
            }
        }

        private ShopData CreateShopFromJson(JsonShopData json)
        {
            if (string.IsNullOrEmpty(json.id))
                return null;

            var shop = CreateInstance<ShopData>();
            shop.shopId = json.id;
            shop.displayName = json.name ?? json.id;
            shop.description = json.description ?? "";
            shop.shopType = ParseShopType(json.type);
            shop.iconId = json.icon ?? "";
            shop.locationId = json.locationId ?? "";
            shop.shopkeeperId = json.shopkeeperId ?? "";

            // Pricing
            shop.buyPriceMultiplier = json.buyMultiplier > 0 ? json.buyMultiplier : 1.0f;
            shop.sellPriceMultiplier = json.sellMultiplier > 0 ? json.sellMultiplier : 0.5f;
            shop.reputationAffectsPrices = json.reputationAffectsPrices;
            shop.maxReputationDiscount = json.maxReputationDiscount > 0 ? json.maxReputationDiscount : 0.2f;
            shop.allowHaggling = json.allowHaggling;
            shop.maxHaggleDiscount = json.maxHaggleDiscount > 0 ? json.maxHaggleDiscount : 0.15f;

            // Stock
            shop.stockItems = new List<ShopStockEntry>();
            if (json.stock != null)
            {
                foreach (var stockJson in json.stock)
                {
                    shop.stockItems.Add(new ShopStockEntry
                    {
                        itemId = stockJson.itemId,
                        quantity = stockJson.quantity,
                        maxQuantity = stockJson.maxQuantity > 0 ? stockJson.maxQuantity : stockJson.quantity,
                        priceModifier = stockJson.priceModifier > 0 ? stockJson.priceModifier : 1.0f,
                        featured = stockJson.featured,
                        requiredReputation = stockJson.requiredReputation,
                        requiredQuestId = stockJson.requiredQuestId ?? ""
                    });
                }
            }

            // Accepted types
            shop.acceptedBuyTypes = new List<string>();
            if (json.acceptedTypes != null)
            {
                shop.acceptedBuyTypes.AddRange(json.acceptedTypes);
            }

            // Restock
            shop.restockConfig = new RestockConfig
            {
                enabled = json.restockEnabled,
                intervalHours = json.restockIntervalHours > 0 ? json.restockIntervalHours : 24f,
                restockPercentage = json.restockPercentage > 0 ? json.restockPercentage : 1.0f,
                addRandomItems = json.addRandomItems,
                randomItemCount = json.randomItemCount
            };

            // Hours
            shop.hasOperatingHours = json.hasOperatingHours;
            shop.openHour = json.openHour;
            shop.closeHour = json.closeHour;

            // Features
            shop.offersRepairs = json.offersRepairs;
            shop.repairCostMultiplier = json.repairCostMultiplier > 0 ? json.repairCostMultiplier : 0.25f;
            shop.offersUpgrades = json.offersUpgrades;
            shop.greetingDialogueId = json.greetingDialogueId ?? "";

            // Tags
            shop.tags = new List<string>();
            if (json.tags != null)
            {
                shop.tags.AddRange(json.tags);
            }

            return shop;
        }

        private ShopType ParseShopType(string typeStr)
        {
            return typeStr?.ToLowerInvariant() switch
            {
                "general" => ShopType.General,
                "blacksmith" => ShopType.Blacksmith,
                "medical" => ShopType.Medical,
                "saloon" => ShopType.Saloon,
                "gunsmith" => ShopType.Gunsmith,
                "fence" => ShopType.Fence,
                "bank" => ShopType.Bank,
                "stable" => ShopType.Stable,
                "tradingpost" or "trading_post" => ShopType.TradingPost,
                "gadgets" => ShopType.Gadgets,
                _ => ShopType.General
            };
        }

        #endregion

        #region Query Methods

        /// <summary>
        /// Get a shop by its unique ID.
        /// </summary>
        public ShopData GetShopById(string shopId)
        {
            if (!_isInitialized)
                Initialize();

            if (string.IsNullOrEmpty(shopId))
                return null;

            _shopsById.TryGetValue(shopId, out var shop);
            return shop;
        }

        /// <summary>
        /// Try to get a shop by ID.
        /// </summary>
        public bool TryGetShop(string shopId, out ShopData shop)
        {
            shop = GetShopById(shopId);
            return shop != null;
        }

        /// <summary>
        /// Get all shops in a specific location.
        /// </summary>
        public IReadOnlyList<ShopData> GetShopsInLocation(string locationId)
        {
            if (!_isInitialized)
                Initialize();

            if (string.IsNullOrEmpty(locationId))
                return new List<ShopData>();

            return _shopsByLocation.TryGetValue(locationId, out var list) ? list : new List<ShopData>();
        }

        /// <summary>
        /// Get all shops of a specific type.
        /// </summary>
        public IReadOnlyList<ShopData> GetShopsByType(ShopType type)
        {
            if (!_isInitialized)
                Initialize();

            return _shopsByType.TryGetValue(type, out var list) ? list : new List<ShopData>();
        }

        /// <summary>
        /// Get all shops with a specific tag.
        /// </summary>
        public IReadOnlyList<ShopData> GetShopsByTag(string tag)
        {
            if (!_isInitialized)
                Initialize();

            return _shopsByTag.TryGetValue(tag, out var list) ? list : new List<ShopData>();
        }

        /// <summary>
        /// Get all shops run by a specific shopkeeper.
        /// </summary>
        public IReadOnlyList<ShopData> GetShopsByShopkeeper(string shopkeeperId)
        {
            if (!_isInitialized)
                Initialize();

            return shops.Where(s => s.shopkeeperId == shopkeeperId).ToList();
        }

        /// <summary>
        /// Get all shops that are currently open.
        /// </summary>
        public IReadOnlyList<ShopData> GetOpenShops(int currentHour)
        {
            if (!_isInitialized)
                Initialize();

            return shops.Where(s => s.IsOpen(currentHour)).ToList();
        }

        /// <summary>
        /// Get all shops that offer repairs.
        /// </summary>
        public IReadOnlyList<ShopData> GetRepairShops()
        {
            if (!_isInitialized)
                Initialize();

            return shops.Where(s => s.offersRepairs).ToList();
        }

        /// <summary>
        /// Get all fence shops.
        /// </summary>
        public IReadOnlyList<ShopData> GetFences()
        {
            return GetShopsByType(ShopType.Fence);
        }

        /// <summary>
        /// Check if a shop ID exists.
        /// </summary>
        public bool HasShop(string shopId)
        {
            if (!_isInitialized)
                Initialize();

            return !string.IsNullOrEmpty(shopId) && _shopsById.ContainsKey(shopId);
        }

        /// <summary>
        /// Get all unique location IDs.
        /// </summary>
        public IReadOnlyList<string> GetAllLocations()
        {
            if (!_isInitialized)
                Initialize();

            return _shopsByLocation.Keys.ToList();
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[ShopDatabase] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[ShopDatabase] {message}");
        }

        #endregion

        #region JSON Data Structures

        [Serializable]
        private class ShopsJsonWrapper
        {
            public JsonShopData[] shops;
        }

        [Serializable]
        private class JsonShopData
        {
            public string id;
            public string name;
            public string description;
            public string type;
            public string icon;
            public string locationId;
            public string shopkeeperId;
            public float buyMultiplier;
            public float sellMultiplier;
            public bool reputationAffectsPrices;
            public float maxReputationDiscount;
            public bool allowHaggling;
            public float maxHaggleDiscount;
            public JsonStockEntry[] stock;
            public string[] acceptedTypes;
            public bool restockEnabled;
            public float restockIntervalHours;
            public float restockPercentage;
            public bool addRandomItems;
            public int randomItemCount;
            public bool hasOperatingHours;
            public int openHour;
            public int closeHour;
            public bool offersRepairs;
            public float repairCostMultiplier;
            public bool offersUpgrades;
            public string greetingDialogueId;
            public string[] tags;
        }

        [Serializable]
        private class JsonStockEntry
        {
            public string itemId;
            public int quantity;
            public int maxQuantity;
            public float priceModifier;
            public bool featured;
            public int requiredReputation;
            public string requiredQuestId;
        }

        #endregion
    }
}
