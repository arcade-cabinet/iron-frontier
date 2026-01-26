using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Data;
using IronFrontier.Inventory;

namespace IronFrontier.Shop
{
    /// <summary>
    /// Event arguments for shop inventory changes.
    /// </summary>
    public class ShopInventoryChangedEventArgs : EventArgs
    {
        /// <summary>The item that changed.</summary>
        public string ItemId { get; }

        /// <summary>Previous quantity.</summary>
        public int PreviousQuantity { get; }

        /// <summary>New quantity.</summary>
        public int NewQuantity { get; }

        /// <summary>Whether the item is now out of stock.</summary>
        public bool IsNowOutOfStock => NewQuantity == 0;

        /// <summary>Whether the item was restocked.</summary>
        public bool WasRestocked => NewQuantity > PreviousQuantity;

        public ShopInventoryChangedEventArgs(string itemId, int previousQty, int newQty)
        {
            ItemId = itemId;
            PreviousQuantity = previousQty;
            NewQuantity = newQty;
        }
    }

    /// <summary>
    /// Manages a shop's runtime inventory state.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript ShopController.ts inventory management.
    /// Handles stock tracking, restocking, and price lookups.
    /// </remarks>
    public class ShopInventory
    {
        #region Events

        /// <summary>
        /// Fired when the inventory changes.
        /// </summary>
        public event EventHandler<ShopInventoryChangedEventArgs> OnInventoryChanged;

        /// <summary>
        /// Fired when the shop is restocked.
        /// </summary>
        public event EventHandler OnRestocked;

        #endregion

        #region Private Fields

        private readonly ShopData _shopData;
        private readonly Dictionary<string, int> _currentStock;
        private readonly Dictionary<string, float> _itemPriceModifiers;
        private float _lastRestockTime;
        private bool _isInitialized;

        #endregion

        #region Properties

        /// <summary>
        /// The shop's static data.
        /// </summary>
        public ShopData ShopData => _shopData;

        /// <summary>
        /// Shop identifier.
        /// </summary>
        public string ShopId => _shopData?.shopId ?? "";

        /// <summary>
        /// Whether the inventory has been initialized.
        /// </summary>
        public bool IsInitialized => _isInitialized;

        /// <summary>
        /// Time of last restock in game hours.
        /// </summary>
        public float LastRestockTime => _lastRestockTime;

        /// <summary>
        /// All items currently in stock.
        /// </summary>
        public IEnumerable<ShopStockEntry> InStockItems
        {
            get
            {
                if (_shopData?.stockItems == null)
                    yield break;

                foreach (var entry in _shopData.stockItems)
                {
                    if (GetStock(entry.itemId) != 0)
                    {
                        yield return entry;
                    }
                }
            }
        }

        /// <summary>
        /// Number of unique items in stock.
        /// </summary>
        public int UniqueItemCount => InStockItems.Count();

        #endregion

        #region Constructor

        /// <summary>
        /// Create a new shop inventory instance.
        /// </summary>
        /// <param name="shopData">The shop's static data.</param>
        public ShopInventory(ShopData shopData)
        {
            _shopData = shopData ?? throw new ArgumentNullException(nameof(shopData));
            _currentStock = new Dictionary<string, int>();
            _itemPriceModifiers = new Dictionary<string, float>();
            _lastRestockTime = 0f;
            _isInitialized = false;
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the inventory from shop data.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized)
                return;

            _currentStock.Clear();
            _itemPriceModifiers.Clear();

            // Load initial stock from shop data
            foreach (var entry in _shopData.stockItems)
            {
                _currentStock[entry.itemId] = entry.quantity;
                _itemPriceModifiers[entry.itemId] = entry.priceModifier;
            }

            _isInitialized = true;
            Debug.Log($"[ShopInventory] Initialized {_shopData.displayName} with {_currentStock.Count} items");
        }

        /// <summary>
        /// Initialize from saved state.
        /// </summary>
        /// <param name="savedStock">Saved stock quantities.</param>
        /// <param name="lastRestock">Last restock time.</param>
        public void InitializeFromSave(Dictionary<string, int> savedStock, float lastRestock)
        {
            if (savedStock != null)
            {
                _currentStock.Clear();
                foreach (var kvp in savedStock)
                {
                    _currentStock[kvp.Key] = kvp.Value;
                }
            }

            _lastRestockTime = lastRestock;
            _isInitialized = true;
        }

        #endregion

        #region Stock Management

        /// <summary>
        /// Get current stock for an item.
        /// </summary>
        /// <param name="itemId">Item ID to check.</param>
        /// <returns>Stock quantity (-1 = unlimited, 0 = out of stock).</returns>
        public int GetStock(string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
                return 0;

            if (_currentStock.TryGetValue(itemId, out int stock))
            {
                return stock;
            }

            // Check if item is in base shop data with unlimited stock
            var entry = _shopData.GetStockEntry(itemId);
            return entry?.quantity ?? 0;
        }

        /// <summary>
        /// Check if an item is in stock.
        /// </summary>
        /// <param name="itemId">Item ID to check.</param>
        /// <returns>True if in stock.</returns>
        public bool IsInStock(string itemId)
        {
            int stock = GetStock(itemId);
            return stock < 0 || stock > 0; // -1 = unlimited
        }

        /// <summary>
        /// Check if an item is in stock with sufficient quantity.
        /// </summary>
        /// <param name="itemId">Item ID to check.</param>
        /// <param name="quantity">Required quantity.</param>
        /// <returns>True if sufficient stock available.</returns>
        public bool HasSufficientStock(string itemId, int quantity)
        {
            int stock = GetStock(itemId);
            return stock < 0 || stock >= quantity; // -1 = unlimited
        }

        /// <summary>
        /// Reduce stock when an item is purchased.
        /// </summary>
        /// <param name="itemId">Item ID purchased.</param>
        /// <param name="quantity">Quantity purchased.</param>
        /// <returns>True if successful.</returns>
        public bool ReduceStock(string itemId, int quantity = 1)
        {
            if (!HasSufficientStock(itemId, quantity))
            {
                Debug.LogWarning($"[ShopInventory] Insufficient stock for {itemId}");
                return false;
            }

            int currentStock = GetStock(itemId);
            if (currentStock < 0)
            {
                // Unlimited stock, no change needed
                return true;
            }

            int previousQty = currentStock;
            int newQty = Math.Max(0, currentStock - quantity);
            _currentStock[itemId] = newQty;

            OnInventoryChanged?.Invoke(this,
                new ShopInventoryChangedEventArgs(itemId, previousQty, newQty));

            return true;
        }

        /// <summary>
        /// Add stock when the shop buys an item from the player.
        /// </summary>
        /// <param name="itemId">Item ID sold to shop.</param>
        /// <param name="quantity">Quantity sold.</param>
        public void AddStock(string itemId, int quantity = 1)
        {
            int currentStock = GetStock(itemId);
            int previousQty = currentStock;

            if (currentStock < 0)
            {
                // Unlimited stock, no tracking needed
                return;
            }

            int newQty = currentStock + quantity;

            // Get max stock from entry if available
            var entry = _shopData.GetStockEntry(itemId);
            if (entry != null && entry.maxQuantity > 0)
            {
                newQty = Math.Min(newQty, entry.maxQuantity);
            }

            _currentStock[itemId] = newQty;

            OnInventoryChanged?.Invoke(this,
                new ShopInventoryChangedEventArgs(itemId, previousQty, newQty));
        }

        /// <summary>
        /// Set stock to a specific quantity.
        /// </summary>
        /// <param name="itemId">Item ID.</param>
        /// <param name="quantity">New quantity.</param>
        public void SetStock(string itemId, int quantity)
        {
            int previousQty = GetStock(itemId);
            _currentStock[itemId] = quantity;

            if (previousQty != quantity)
            {
                OnInventoryChanged?.Invoke(this,
                    new ShopInventoryChangedEventArgs(itemId, previousQty, quantity));
            }
        }

        #endregion

        #region Price Lookup

        /// <summary>
        /// Get the price modifier for an item.
        /// </summary>
        /// <param name="itemId">Item ID.</param>
        /// <returns>Price modifier (1.0 = base price).</returns>
        public float GetPriceModifier(string itemId)
        {
            if (_itemPriceModifiers.TryGetValue(itemId, out float modifier))
            {
                return modifier;
            }

            var entry = _shopData.GetStockEntry(itemId);
            return entry?.priceModifier ?? 1.0f;
        }

        /// <summary>
        /// Get the buy price for an item.
        /// </summary>
        /// <param name="item">Item data.</param>
        /// <param name="playerReputation">Player's reputation.</param>
        /// <param name="haggleDiscount">Discount from haggling.</param>
        /// <returns>Price calculation result.</returns>
        public PriceResult GetBuyPrice(ItemData item, int playerReputation = 50, float haggleDiscount = 0f)
        {
            if (item == null)
                return new PriceResult { BasePrice = 0, FinalPrice = 0 };

            var entry = _shopData.GetStockEntry(item.id);
            int currentStock = GetStock(item.id);
            int maxStock = entry?.maxQuantity ?? -1;

            return PriceCalculator.CalculateBuyPrice(
                item,
                _shopData,
                entry,
                playerReputation,
                currentStock,
                maxStock,
                haggleDiscount
            );
        }

        /// <summary>
        /// Get the sell price for an item.
        /// </summary>
        /// <param name="item">Item data.</param>
        /// <param name="playerReputation">Player's reputation.</param>
        /// <param name="itemCondition">Item condition.</param>
        /// <param name="isStolen">Whether item is stolen.</param>
        /// <param name="haggleBonus">Bonus from haggling.</param>
        /// <returns>Price calculation result.</returns>
        public PriceResult GetSellPrice(
            ItemData item,
            int playerReputation = 50,
            float itemCondition = 1.0f,
            bool isStolen = false,
            float haggleBonus = 0f)
        {
            if (item == null || !item.sellable)
                return new PriceResult { BasePrice = 0, FinalPrice = 0 };

            return PriceCalculator.CalculateSellPrice(
                item,
                _shopData,
                playerReputation,
                itemCondition,
                isStolen,
                haggleBonus
            );
        }

        #endregion

        #region Restocking

        /// <summary>
        /// Check if the shop needs to restock.
        /// </summary>
        /// <param name="currentGameTime">Current game time in hours.</param>
        /// <returns>True if restock is needed.</returns>
        public bool NeedsRestock(float currentGameTime)
        {
            if (!_shopData.restockConfig.enabled)
                return false;

            float timeSinceRestock = currentGameTime - _lastRestockTime;
            return timeSinceRestock >= _shopData.restockConfig.intervalHours;
        }

        /// <summary>
        /// Perform a restock operation.
        /// </summary>
        /// <param name="currentGameTime">Current game time in hours.</param>
        public void Restock(float currentGameTime)
        {
            if (!_shopData.restockConfig.enabled)
                return;

            foreach (var entry in _shopData.stockItems)
            {
                if (entry.maxQuantity <= 0)
                    continue; // Skip unlimited items

                int currentStock = GetStock(entry.itemId);
                int restockAmount = Mathf.RoundToInt(
                    entry.maxQuantity * _shopData.restockConfig.restockPercentage
                );
                int newStock = Math.Min(entry.maxQuantity, currentStock + restockAmount);

                if (newStock != currentStock)
                {
                    SetStock(entry.itemId, newStock);
                }
            }

            // Add random items if configured
            if (_shopData.restockConfig.addRandomItems)
            {
                AddRandomItems(_shopData.restockConfig.randomItemCount);
            }

            _lastRestockTime = currentGameTime;
            OnRestocked?.Invoke(this, EventArgs.Empty);

            Debug.Log($"[ShopInventory] {_shopData.displayName} restocked at time {currentGameTime}");
        }

        /// <summary>
        /// Add random items to the shop inventory.
        /// </summary>
        /// <param name="count">Number of items to add.</param>
        private void AddRandomItems(int count)
        {
            // This would use ItemDatabase to get appropriate random items
            // based on shop type. Implementation depends on ItemDatabase API.
            Debug.Log($"[ShopInventory] Would add {count} random items (not implemented)");
        }

        #endregion

        #region Query Methods

        /// <summary>
        /// Get all items available for purchase.
        /// </summary>
        /// <param name="playerReputation">Player's reputation for filtering.</param>
        /// <param name="completedQuests">Completed quest IDs for filtering.</param>
        /// <returns>List of available stock entries.</returns>
        public List<ShopStockEntry> GetAvailableItems(
            int playerReputation = 0,
            IEnumerable<string> completedQuests = null)
        {
            var quests = completedQuests?.ToHashSet() ?? new HashSet<string>();

            return _shopData.stockItems
                .Where(entry =>
                    IsInStock(entry.itemId) &&
                    playerReputation >= entry.requiredReputation &&
                    (string.IsNullOrEmpty(entry.requiredQuestId) || quests.Contains(entry.requiredQuestId)))
                .ToList();
        }

        /// <summary>
        /// Get featured items.
        /// </summary>
        /// <returns>List of featured stock entries.</returns>
        public List<ShopStockEntry> GetFeaturedItems()
        {
            return _shopData.stockItems
                .Where(entry => entry.featured && IsInStock(entry.itemId))
                .ToList();
        }

        /// <summary>
        /// Search for items by name.
        /// </summary>
        /// <param name="searchTerm">Search term.</param>
        /// <returns>Matching stock entries.</returns>
        public List<ShopStockEntry> SearchItems(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<ShopStockEntry>(InStockItems);

            var lowerSearch = searchTerm.ToLowerInvariant();
            var database = ItemDatabase.Instance;

            return _shopData.stockItems
                .Where(entry =>
                {
                    if (!IsInStock(entry.itemId))
                        return false;

                    var item = database.GetItemById(entry.itemId);
                    if (item == null)
                        return false;

                    return item.displayName.ToLowerInvariant().Contains(lowerSearch) ||
                           item.id.ToLowerInvariant().Contains(lowerSearch);
                })
                .ToList();
        }

        #endregion

        #region Serialization

        /// <summary>
        /// Get current state for saving.
        /// </summary>
        /// <returns>Dictionary of item IDs to stock quantities.</returns>
        public Dictionary<string, int> GetSaveState()
        {
            return new Dictionary<string, int>(_currentStock);
        }

        #endregion
    }
}
