using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Shop
{
    /// <summary>
    /// Types of shops in the game world.
    /// </summary>
    public enum ShopType
    {
        /// <summary>General store selling various goods</summary>
        General,
        /// <summary>Blacksmith selling weapons and armor</summary>
        Blacksmith,
        /// <summary>Apothecary/Doctor selling medical supplies</summary>
        Medical,
        /// <summary>Saloon selling food and drink</summary>
        Saloon,
        /// <summary>Gunsmith specializing in firearms</summary>
        Gunsmith,
        /// <summary>Fence dealing in stolen goods</summary>
        Fence,
        /// <summary>Bank for financial services</summary>
        Bank,
        /// <summary>Stable for horses and transportation</summary>
        Stable,
        /// <summary>Trading post with rare goods</summary>
        TradingPost,
        /// <summary>Inventor/Gadget shop</summary>
        Gadgets
    }

    /// <summary>
    /// Entry for a shop's stock item.
    /// </summary>
    [Serializable]
    public class ShopStockEntry
    {
        /// <summary>The item ID from ItemDatabase.</summary>
        public string itemId;

        /// <summary>Current stock quantity (-1 for unlimited).</summary>
        public int quantity;

        /// <summary>Maximum stock quantity for restocking.</summary>
        public int maxQuantity;

        /// <summary>Price markup/markdown multiplier (1.0 = base price).</summary>
        public float priceModifier;

        /// <summary>Whether this item is featured/highlighted.</summary>
        public bool featured;

        /// <summary>Minimum player reputation required to purchase.</summary>
        public int requiredReputation;

        /// <summary>Quest ID required to unlock this item (optional).</summary>
        public string requiredQuestId;

        /// <summary>
        /// Create a new stock entry.
        /// </summary>
        public ShopStockEntry()
        {
            quantity = -1; // Unlimited by default
            maxQuantity = -1;
            priceModifier = 1.0f;
            featured = false;
            requiredReputation = 0;
            requiredQuestId = "";
        }

        /// <summary>
        /// Create a stock entry with specific values.
        /// </summary>
        public ShopStockEntry(string itemId, int quantity = -1, float priceModifier = 1.0f)
        {
            this.itemId = itemId;
            this.quantity = quantity;
            this.maxQuantity = quantity;
            this.priceModifier = priceModifier;
            this.featured = false;
            this.requiredReputation = 0;
            this.requiredQuestId = "";
        }

        /// <summary>
        /// Whether this item has unlimited stock.
        /// </summary>
        public bool IsUnlimited => quantity < 0;

        /// <summary>
        /// Whether this item is in stock.
        /// </summary>
        public bool InStock => quantity != 0;
    }

    /// <summary>
    /// Restock configuration for a shop.
    /// </summary>
    [Serializable]
    public class RestockConfig
    {
        /// <summary>Whether the shop restocks automatically.</summary>
        public bool enabled;

        /// <summary>Time between restocks in game hours.</summary>
        public float intervalHours;

        /// <summary>Percentage of max stock to restore (0-1).</summary>
        public float restockPercentage;

        /// <summary>Whether to add new random items on restock.</summary>
        public bool addRandomItems;

        /// <summary>Number of random items to add.</summary>
        public int randomItemCount;

        public RestockConfig()
        {
            enabled = true;
            intervalHours = 24f;
            restockPercentage = 1.0f;
            addRandomItems = false;
            randomItemCount = 0;
        }
    }

    /// <summary>
    /// ScriptableObject defining a shop's properties and inventory.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript shopTemplates.ts and ShopController.ts.
    /// Supports both editor configuration and runtime JSON loading.
    /// </remarks>
    [CreateAssetMenu(fileName = "ShopData", menuName = "Iron Frontier/Shop/Shop Data", order = 1)]
    public class ShopData : ScriptableObject
    {
        #region Serialized Fields

        [Header("Identification")]
        [Tooltip("Unique identifier for this shop")]
        public string shopId;

        [Tooltip("Display name shown in UI")]
        public string displayName;

        [Tooltip("Shop description")]
        [TextArea(2, 4)]
        public string description;

        [Tooltip("Type of shop")]
        public ShopType shopType;

        [Tooltip("Icon identifier for UI")]
        public string iconId;

        [Header("Location")]
        [Tooltip("Location/town ID where this shop exists")]
        public string locationId;

        [Tooltip("NPC ID of the shopkeeper")]
        public string shopkeeperId;

        [Header("Pricing")]
        [Tooltip("Global buy price multiplier (player buying from shop)")]
        [Range(0.5f, 3.0f)]
        public float buyPriceMultiplier = 1.0f;

        [Tooltip("Global sell price multiplier (player selling to shop)")]
        [Range(0.1f, 1.0f)]
        public float sellPriceMultiplier = 0.5f;

        [Tooltip("Whether reputation affects prices")]
        public bool reputationAffectsPrices = true;

        [Tooltip("Maximum reputation discount percentage")]
        [Range(0f, 0.5f)]
        public float maxReputationDiscount = 0.2f;

        [Tooltip("Whether haggling is allowed")]
        public bool allowHaggling = true;

        [Tooltip("Maximum haggle discount percentage")]
        [Range(0f, 0.3f)]
        public float maxHaggleDiscount = 0.15f;

        [Header("Inventory")]
        [Tooltip("Items stocked by this shop")]
        public List<ShopStockEntry> stockItems = new List<ShopStockEntry>();

        [Tooltip("Item types this shop will buy")]
        public List<string> acceptedBuyTypes = new List<string>();

        [Header("Restocking")]
        [Tooltip("Restock configuration")]
        public RestockConfig restockConfig = new RestockConfig();

        [Header("Operating Hours")]
        [Tooltip("Whether shop has operating hours")]
        public bool hasOperatingHours = false;

        [Tooltip("Opening hour (0-23)")]
        [Range(0, 23)]
        public int openHour = 8;

        [Tooltip("Closing hour (0-23)")]
        [Range(0, 23)]
        public int closeHour = 20;

        [Header("Special Features")]
        [Tooltip("Whether shop offers repairs")]
        public bool offersRepairs = false;

        [Tooltip("Repair cost multiplier")]
        [Range(0.1f, 1.0f)]
        public float repairCostMultiplier = 0.25f;

        [Tooltip("Whether shop offers item upgrades")]
        public bool offersUpgrades = false;

        [Tooltip("Special dialogue when entering shop")]
        public string greetingDialogueId;

        [Tooltip("Tags for categorizing the shop")]
        public List<string> tags = new List<string>();

        #endregion

        #region Properties

        /// <summary>
        /// Whether the shop is currently open based on game time.
        /// </summary>
        /// <param name="currentHour">Current game hour (0-23).</param>
        public bool IsOpen(int currentHour)
        {
            if (!hasOperatingHours)
                return true;

            if (openHour <= closeHour)
            {
                return currentHour >= openHour && currentHour < closeHour;
            }
            else
            {
                // Wraps around midnight
                return currentHour >= openHour || currentHour < closeHour;
            }
        }

        /// <summary>
        /// Get the number of unique items in stock.
        /// </summary>
        public int UniqueItemCount => stockItems.Count;

        /// <summary>
        /// Whether this shop is a fence (deals in stolen goods).
        /// </summary>
        public bool IsFence => shopType == ShopType.Fence;

        #endregion

        #region Methods

        /// <summary>
        /// Get a stock entry by item ID.
        /// </summary>
        public ShopStockEntry GetStockEntry(string itemId)
        {
            return stockItems.Find(entry => entry.itemId == itemId);
        }

        /// <summary>
        /// Check if an item is in stock.
        /// </summary>
        public bool HasItem(string itemId)
        {
            var entry = GetStockEntry(itemId);
            return entry != null && entry.InStock;
        }

        /// <summary>
        /// Get all featured items.
        /// </summary>
        public List<ShopStockEntry> GetFeaturedItems()
        {
            return stockItems.FindAll(entry => entry.featured && entry.InStock);
        }

        /// <summary>
        /// Check if this shop accepts a given item type for selling.
        /// </summary>
        public bool AcceptsItemType(string itemType)
        {
            if (acceptedBuyTypes.Count == 0)
                return true; // Accept all by default

            return acceptedBuyTypes.Contains(itemType) || acceptedBuyTypes.Contains("all");
        }

        /// <summary>
        /// Create a deep copy of this shop data.
        /// </summary>
        public ShopData Clone()
        {
            var clone = CreateInstance<ShopData>();
            clone.shopId = shopId;
            clone.displayName = displayName;
            clone.description = description;
            clone.shopType = shopType;
            clone.iconId = iconId;
            clone.locationId = locationId;
            clone.shopkeeperId = shopkeeperId;
            clone.buyPriceMultiplier = buyPriceMultiplier;
            clone.sellPriceMultiplier = sellPriceMultiplier;
            clone.reputationAffectsPrices = reputationAffectsPrices;
            clone.maxReputationDiscount = maxReputationDiscount;
            clone.allowHaggling = allowHaggling;
            clone.maxHaggleDiscount = maxHaggleDiscount;
            clone.restockConfig = new RestockConfig
            {
                enabled = restockConfig.enabled,
                intervalHours = restockConfig.intervalHours,
                restockPercentage = restockConfig.restockPercentage,
                addRandomItems = restockConfig.addRandomItems,
                randomItemCount = restockConfig.randomItemCount
            };
            clone.hasOperatingHours = hasOperatingHours;
            clone.openHour = openHour;
            clone.closeHour = closeHour;
            clone.offersRepairs = offersRepairs;
            clone.repairCostMultiplier = repairCostMultiplier;
            clone.offersUpgrades = offersUpgrades;
            clone.greetingDialogueId = greetingDialogueId;
            clone.tags = new List<string>(tags);
            clone.acceptedBuyTypes = new List<string>(acceptedBuyTypes);

            clone.stockItems = new List<ShopStockEntry>();
            foreach (var entry in stockItems)
            {
                clone.stockItems.Add(new ShopStockEntry
                {
                    itemId = entry.itemId,
                    quantity = entry.quantity,
                    maxQuantity = entry.maxQuantity,
                    priceModifier = entry.priceModifier,
                    featured = entry.featured,
                    requiredReputation = entry.requiredReputation,
                    requiredQuestId = entry.requiredQuestId
                });
            }

            return clone;
        }

        #endregion
    }
}
