using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;
using IronFrontier.Inventory;

namespace IronFrontier.Shop
{
    /// <summary>
    /// Result of a shop transaction.
    /// </summary>
    public struct TransactionResult
    {
        /// <summary>Whether the transaction succeeded.</summary>
        public bool Success;

        /// <summary>Error message if failed.</summary>
        public string ErrorMessage;

        /// <summary>The item involved.</summary>
        public string ItemId;

        /// <summary>Quantity transacted.</summary>
        public int Quantity;

        /// <summary>Total gold exchanged.</summary>
        public int TotalGold;

        /// <summary>Player's new gold balance.</summary>
        public int NewBalance;

        /// <summary>Create a success result.</summary>
        public static TransactionResult Succeeded(string itemId, int qty, int gold, int balance) =>
            new TransactionResult
            {
                Success = true,
                ItemId = itemId,
                Quantity = qty,
                TotalGold = gold,
                NewBalance = balance
            };

        /// <summary>Create a failure result.</summary>
        public static TransactionResult Failed(string message) =>
            new TransactionResult { Success = false, ErrorMessage = message };
    }

    /// <summary>
    /// Event arguments for shop transactions.
    /// </summary>
    public class ShopTransactionEventArgs : EventArgs
    {
        /// <summary>The shop involved.</summary>
        public string ShopId { get; }

        /// <summary>The item transacted.</summary>
        public string ItemId { get; }

        /// <summary>Quantity transacted.</summary>
        public int Quantity { get; }

        /// <summary>Gold exchanged.</summary>
        public int Gold { get; }

        /// <summary>Whether player was buying (true) or selling (false).</summary>
        public bool WasBuying { get; }

        public ShopTransactionEventArgs(string shopId, string itemId, int qty, int gold, bool wasBuying)
        {
            ShopId = shopId;
            ItemId = itemId;
            Quantity = qty;
            Gold = gold;
            WasBuying = wasBuying;
        }
    }

    /// <summary>
    /// Central manager for all shop operations and transactions.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript ShopController.ts and ShopPanel.tsx.
    /// Handles buy/sell transactions, shop state, and coordinates with inventory system.
    /// </remarks>
    public class ShopManager : MonoBehaviour
    {
        #region Singleton

        private static ShopManager _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static ShopManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<ShopManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[ShopManager]");
                        _instance = go.AddComponent<ShopManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>
        /// Fired when a shop is opened.
        /// </summary>
        public event EventHandler<string> OnShopOpened;

        /// <summary>
        /// Fired when a shop is closed.
        /// </summary>
        public event EventHandler OnShopClosed;

        /// <summary>
        /// Fired when a purchase is made.
        /// </summary>
        public event EventHandler<ShopTransactionEventArgs> OnItemPurchased;

        /// <summary>
        /// Fired when an item is sold.
        /// </summary>
        public event EventHandler<ShopTransactionEventArgs> OnItemSold;

        /// <summary>
        /// Fired when a transaction fails.
        /// </summary>
        public event EventHandler<string> OnTransactionFailed;

        /// <summary>
        /// Fired when a haggle is attempted.
        /// </summary>
        public event EventHandler<HaggleResult> OnHaggleAttempted;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("JSON file containing shop definitions")]
        private TextAsset shopsJsonFile;

        [SerializeField]
        [Tooltip("Enable debug logging")]
        private bool debugMode = false;

        [Header("Audio")]
        [SerializeField]
        [Tooltip("Sound for successful purchase")]
        private AudioClip purchaseSound;

        [SerializeField]
        [Tooltip("Sound for successful sale")]
        private AudioClip sellSound;

        [SerializeField]
        [Tooltip("Sound for failed transaction")]
        private AudioClip failSound;

        [SerializeField]
        [Tooltip("Sound for cash register/coins")]
        private AudioClip coinSound;

        #endregion

        #region Private Fields

        private readonly Dictionary<string, ShopData> _shopDataCache = new();
        private readonly Dictionary<string, ShopInventory> _shopInventories = new();
        private ShopInventory _currentShop;
        private int _currentHaggleAttempts;
        private float _currentHaggleDiscount;
        private bool _isInitialized;

        #endregion

        #region Properties

        /// <summary>
        /// Currently open shop, or null if none.
        /// </summary>
        public ShopInventory CurrentShop => _currentShop;

        /// <summary>
        /// Whether a shop is currently open.
        /// </summary>
        public bool IsShopOpen => _currentShop != null;

        /// <summary>
        /// Whether the manager has been initialized.
        /// </summary>
        public bool IsInitialized => _isInitialized;

        /// <summary>
        /// Current haggle attempts for this session.
        /// </summary>
        public int CurrentHaggleAttempts => _currentHaggleAttempts;

        /// <summary>
        /// Current accumulated haggle discount.
        /// </summary>
        public float CurrentHaggleDiscount => _currentHaggleDiscount;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            Initialize();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the shop manager.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized)
                return;

            Log("Initializing ShopManager...");

            // Load shops from JSON
            if (shopsJsonFile != null)
            {
                LoadShopsFromJson(shopsJsonFile.text);
            }

            // Load shops from Resources
            LoadShopsFromResources();

            _isInitialized = true;
            Log($"ShopManager initialized with {_shopDataCache.Count} shops");
        }

        /// <summary>
        /// Load shop definitions from JSON.
        /// </summary>
        private void LoadShopsFromJson(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<ShopsJsonWrapper>(json);
                if (wrapper?.shops == null)
                    return;

                foreach (var jsonShop in wrapper.shops)
                {
                    var shopData = CreateShopFromJson(jsonShop);
                    if (shopData != null)
                    {
                        RegisterShop(shopData);
                    }
                }

                Log($"Loaded {wrapper.shops.Length} shops from JSON");
            }
            catch (Exception e)
            {
                Debug.LogError($"[ShopManager] Failed to load shops from JSON: {e.Message}");
            }
        }

        /// <summary>
        /// Load shop ScriptableObjects from Resources.
        /// </summary>
        private void LoadShopsFromResources()
        {
            var shops = Resources.LoadAll<ShopData>("Shops");
            foreach (var shop in shops)
            {
                if (!_shopDataCache.ContainsKey(shop.shopId))
                {
                    RegisterShop(shop);
                }
            }
        }

        /// <summary>
        /// Create ShopData from JSON.
        /// </summary>
        private ShopData CreateShopFromJson(JsonShopData json)
        {
            if (string.IsNullOrEmpty(json.id))
                return null;

            var shop = ScriptableObject.CreateInstance<ShopData>();
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

            // Accepted buy types
            shop.acceptedBuyTypes = new List<string>();
            if (json.acceptedTypes != null)
            {
                shop.acceptedBuyTypes.AddRange(json.acceptedTypes);
            }

            // Restock config
            shop.restockConfig = new RestockConfig
            {
                enabled = json.restockEnabled,
                intervalHours = json.restockIntervalHours > 0 ? json.restockIntervalHours : 24f,
                restockPercentage = json.restockPercentage > 0 ? json.restockPercentage : 1.0f,
                addRandomItems = json.addRandomItems,
                randomItemCount = json.randomItemCount
            };

            // Operating hours
            shop.hasOperatingHours = json.hasOperatingHours;
            shop.openHour = json.openHour;
            shop.closeHour = json.closeHour;

            // Special features
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

        /// <summary>
        /// Register a shop with the manager.
        /// </summary>
        public void RegisterShop(ShopData shopData)
        {
            if (shopData == null || string.IsNullOrEmpty(shopData.shopId))
                return;

            _shopDataCache[shopData.shopId] = shopData;

            // Create inventory instance
            var inventory = new ShopInventory(shopData);
            inventory.Initialize();
            _shopInventories[shopData.shopId] = inventory;

            Log($"Registered shop: {shopData.displayName} ({shopData.shopId})");
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

        #region Shop Access

        /// <summary>
        /// Get shop data by ID.
        /// </summary>
        public ShopData GetShopData(string shopId)
        {
            if (string.IsNullOrEmpty(shopId))
                return null;

            _shopDataCache.TryGetValue(shopId, out var shop);
            return shop;
        }

        /// <summary>
        /// Get shop inventory by ID.
        /// </summary>
        public ShopInventory GetShopInventory(string shopId)
        {
            if (string.IsNullOrEmpty(shopId))
                return null;

            _shopInventories.TryGetValue(shopId, out var inventory);
            return inventory;
        }

        /// <summary>
        /// Get all shops in a location.
        /// </summary>
        public List<ShopData> GetShopsInLocation(string locationId)
        {
            return _shopDataCache.Values
                .Where(shop => shop.locationId == locationId)
                .ToList();
        }

        /// <summary>
        /// Get all shops of a specific type.
        /// </summary>
        public List<ShopData> GetShopsByType(ShopType type)
        {
            return _shopDataCache.Values
                .Where(shop => shop.shopType == type)
                .ToList();
        }

        #endregion

        #region Shop Session

        /// <summary>
        /// Open a shop for the player.
        /// </summary>
        /// <param name="shopId">Shop ID to open.</param>
        /// <returns>True if successfully opened.</returns>
        public bool OpenShop(string shopId)
        {
            if (string.IsNullOrEmpty(shopId))
            {
                Debug.LogWarning("[ShopManager] Cannot open shop: null shopId");
                return false;
            }

            if (!_shopInventories.TryGetValue(shopId, out var inventory))
            {
                Debug.LogWarning($"[ShopManager] Shop not found: {shopId}");
                return false;
            }

            // Check operating hours
            int currentHour = GetCurrentGameHour();
            if (!inventory.ShopData.IsOpen(currentHour))
            {
                Log($"Shop {shopId} is closed (hour {currentHour})");
                OnTransactionFailed?.Invoke(this, "Shop is closed");
                return false;
            }

            // Check if needs restock
            float gameTime = GetCurrentGameTime();
            if (inventory.NeedsRestock(gameTime))
            {
                inventory.Restock(gameTime);
            }

            _currentShop = inventory;
            _currentHaggleAttempts = 0;
            _currentHaggleDiscount = 0f;

            // Change game phase
            GameManager.Instance?.SetPhase(GamePhase.Shop, shopId);

            // Publish event
            EventBus.Instance?.Publish(GameEvents.ShopOpened, shopId);
            OnShopOpened?.Invoke(this, shopId);

            Log($"Opened shop: {inventory.ShopData.displayName}");
            return true;
        }

        /// <summary>
        /// Close the current shop.
        /// </summary>
        public void CloseShop()
        {
            if (_currentShop == null)
                return;

            string shopId = _currentShop.ShopId;
            _currentShop = null;
            _currentHaggleAttempts = 0;
            _currentHaggleDiscount = 0f;

            // Return to previous phase
            GameManager.Instance?.ReturnToPreviousPhase();

            // Publish event
            EventBus.Instance?.Publish(GameEvents.ShopClosed, shopId);
            OnShopClosed?.Invoke(this, EventArgs.Empty);

            Log($"Closed shop: {shopId}");
        }

        #endregion

        #region Transactions

        /// <summary>
        /// Buy an item from the current shop.
        /// </summary>
        /// <param name="itemId">Item ID to buy.</param>
        /// <param name="quantity">Quantity to buy.</param>
        /// <returns>Transaction result.</returns>
        public TransactionResult BuyItem(string itemId, int quantity = 1)
        {
            if (_currentShop == null)
            {
                return TransactionResult.Failed("No shop is open");
            }

            if (quantity <= 0)
            {
                return TransactionResult.Failed("Invalid quantity");
            }

            // Get item data
            var item = ItemDatabase.Instance?.GetItemById(itemId);
            if (item == null)
            {
                return TransactionResult.Failed("Item not found");
            }

            // Check stock
            if (!_currentShop.HasSufficientStock(itemId, quantity))
            {
                return TransactionResult.Failed("Not enough in stock");
            }

            // Calculate price
            int playerRep = GetPlayerReputation();
            var priceResult = _currentShop.GetBuyPrice(item, playerRep, _currentHaggleDiscount);
            int totalCost = priceResult.FinalPrice * quantity;

            // Check player gold
            int playerGold = GetPlayerGold();
            if (playerGold < totalCost)
            {
                OnTransactionFailed?.Invoke(this, "Not enough gold");
                PlaySound(failSound);
                return TransactionResult.Failed("Not enough gold");
            }

            // Check player inventory space
            if (!CanPlayerHoldItem(itemId, quantity))
            {
                OnTransactionFailed?.Invoke(this, "Inventory full");
                PlaySound(failSound);
                return TransactionResult.Failed("Inventory full");
            }

            // Execute transaction
            _currentShop.ReduceStock(itemId, quantity);
            RemovePlayerGold(totalCost);
            AddItemToPlayer(itemId, quantity);

            int newBalance = GetPlayerGold();

            // Play sound
            PlaySound(purchaseSound);
            PlaySound(coinSound);

            // Publish events
            var eventArgs = new ShopTransactionEventArgs(
                _currentShop.ShopId, itemId, quantity, totalCost, true);
            OnItemPurchased?.Invoke(this, eventArgs);
            EventBus.Instance?.Publish(GameEvents.ItemBought, itemId);

            Log($"Bought {quantity}x {item.displayName} for {totalCost} gold");

            // Reset haggle state
            _currentHaggleAttempts = 0;
            _currentHaggleDiscount = 0f;

            return TransactionResult.Succeeded(itemId, quantity, totalCost, newBalance);
        }

        /// <summary>
        /// Sell an item to the current shop.
        /// </summary>
        /// <param name="itemId">Item ID to sell.</param>
        /// <param name="quantity">Quantity to sell.</param>
        /// <param name="isStolen">Whether the item is stolen.</param>
        /// <returns>Transaction result.</returns>
        public TransactionResult SellItem(string itemId, int quantity = 1, bool isStolen = false)
        {
            if (_currentShop == null)
            {
                return TransactionResult.Failed("No shop is open");
            }

            if (quantity <= 0)
            {
                return TransactionResult.Failed("Invalid quantity");
            }

            // Get item data
            var item = ItemDatabase.Instance?.GetItemById(itemId);
            if (item == null)
            {
                return TransactionResult.Failed("Item not found");
            }

            // Check if item is sellable
            if (!item.sellable)
            {
                return TransactionResult.Failed("Item cannot be sold");
            }

            // Check if shop accepts this item type
            if (!_currentShop.ShopData.AcceptsItemType(item.type.ToString()))
            {
                return TransactionResult.Failed("Shop doesn't buy this type");
            }

            // Check if player has the item
            if (!PlayerHasItem(itemId, quantity))
            {
                return TransactionResult.Failed("You don't have that item");
            }

            // Check if stolen and shop allows it
            if (isStolen && !_currentShop.ShopData.IsFence)
            {
                // Non-fences might refuse stolen goods
                float refuseChance = 0.7f;
                if (UnityEngine.Random.value < refuseChance)
                {
                    OnTransactionFailed?.Invoke(this, "I don't deal in stolen goods");
                    PlaySound(failSound);
                    return TransactionResult.Failed("Shop refuses stolen goods");
                }
            }

            // Calculate price
            int playerRep = GetPlayerReputation();
            float condition = GetItemCondition(itemId);
            var priceResult = _currentShop.GetSellPrice(item, playerRep, condition, isStolen, _currentHaggleDiscount);
            int totalValue = priceResult.FinalPrice * quantity;

            // Execute transaction
            RemoveItemFromPlayer(itemId, quantity);
            AddPlayerGold(totalValue);
            _currentShop.AddStock(itemId, quantity);

            int newBalance = GetPlayerGold();

            // Play sound
            PlaySound(sellSound);
            PlaySound(coinSound);

            // Publish events
            var eventArgs = new ShopTransactionEventArgs(
                _currentShop.ShopId, itemId, quantity, totalValue, false);
            OnItemSold?.Invoke(this, eventArgs);
            EventBus.Instance?.Publish(GameEvents.ItemSold, itemId);

            Log($"Sold {quantity}x {item.displayName} for {totalValue} gold");

            // Reset haggle state
            _currentHaggleAttempts = 0;
            _currentHaggleDiscount = 0f;

            return TransactionResult.Succeeded(itemId, quantity, totalValue, newBalance);
        }

        #endregion

        #region Haggling

        /// <summary>
        /// Attempt to haggle on the current transaction.
        /// </summary>
        /// <param name="itemId">Item being haggled over.</param>
        /// <param name="isBuying">Whether player is buying.</param>
        /// <returns>Haggle result.</returns>
        public HaggleResult AttemptHaggle(string itemId, bool isBuying)
        {
            if (_currentShop == null)
            {
                return new HaggleResult
                {
                    Success = false,
                    Response = "No shop is open",
                    IsFinalOffer = true
                };
            }

            var item = ItemDatabase.Instance?.GetItemById(itemId);
            if (item == null)
            {
                return new HaggleResult
                {
                    Success = false,
                    Response = "Item not found",
                    IsFinalOffer = true
                };
            }

            _currentHaggleAttempts++;

            int currentPrice;
            if (isBuying)
            {
                var priceResult = _currentShop.GetBuyPrice(item, GetPlayerReputation(), _currentHaggleDiscount);
                currentPrice = priceResult.FinalPrice;
            }
            else
            {
                var priceResult = _currentShop.GetSellPrice(item, GetPlayerReputation());
                currentPrice = priceResult.FinalPrice;
            }

            int playerCharisma = GetPlayerCharisma();

            var result = PriceCalculator.AttemptHaggle(
                currentPrice,
                item.value,
                _currentShop.ShopData,
                playerCharisma,
                _currentHaggleAttempts,
                isBuying
            );

            if (result.Success)
            {
                _currentHaggleDiscount += result.Discount;
            }

            OnHaggleAttempted?.Invoke(this, result);
            Log($"Haggle attempt {_currentHaggleAttempts}: {(result.Success ? "Success" : "Failed")} - {result.Response}");

            return result;
        }

        /// <summary>
        /// Reset haggle state.
        /// </summary>
        public void ResetHaggle()
        {
            _currentHaggleAttempts = 0;
            _currentHaggleDiscount = 0f;
        }

        #endregion

        #region Repairs

        /// <summary>
        /// Get the repair cost for an item.
        /// </summary>
        /// <param name="itemId">Item to repair.</param>
        /// <returns>Repair cost, or -1 if repairs not offered.</returns>
        public int GetRepairCost(string itemId)
        {
            if (_currentShop == null || !_currentShop.ShopData.offersRepairs)
                return -1;

            var item = ItemDatabase.Instance?.GetItemById(itemId);
            if (item == null)
                return -1;

            float condition = GetItemCondition(itemId);
            int playerRep = GetPlayerReputation();

            return PriceCalculator.CalculateRepairCost(item, condition, _currentShop.ShopData, playerRep);
        }

        /// <summary>
        /// Repair an item at the current shop.
        /// </summary>
        /// <param name="itemId">Item to repair.</param>
        /// <returns>Transaction result.</returns>
        public TransactionResult RepairItem(string itemId)
        {
            if (_currentShop == null || !_currentShop.ShopData.offersRepairs)
            {
                return TransactionResult.Failed("This shop doesn't offer repairs");
            }

            int cost = GetRepairCost(itemId);
            if (cost <= 0)
            {
                return TransactionResult.Failed("Item doesn't need repairs");
            }

            int playerGold = GetPlayerGold();
            if (playerGold < cost)
            {
                PlaySound(failSound);
                return TransactionResult.Failed("Not enough gold");
            }

            // Execute repair
            RemovePlayerGold(cost);
            SetItemCondition(itemId, 1.0f);

            PlaySound(coinSound);

            Log($"Repaired {itemId} for {cost} gold");

            return TransactionResult.Succeeded(itemId, 1, cost, GetPlayerGold());
        }

        #endregion

        #region Player Interface (to be connected to actual player systems)

        /// <summary>
        /// Get current game hour. Override with TimeSystem integration.
        /// </summary>
        protected virtual int GetCurrentGameHour()
        {
            // TODO: Integrate with TimeSystem
            return 12; // Default to noon
        }

        /// <summary>
        /// Get current game time in hours. Override with TimeSystem integration.
        /// </summary>
        protected virtual float GetCurrentGameTime()
        {
            // TODO: Integrate with TimeSystem
            return Time.time / 60f; // 1 minute = 1 game hour for testing
        }

        /// <summary>
        /// Get player's gold. Override with InventoryManager integration.
        /// </summary>
        protected virtual int GetPlayerGold()
        {
            return InventoryManager.Instance?.Gold ?? 0;
        }

        /// <summary>
        /// Add gold to player. Override with InventoryManager integration.
        /// </summary>
        protected virtual void AddPlayerGold(int amount)
        {
            InventoryManager.Instance?.AddGold(amount);
        }

        /// <summary>
        /// Remove gold from player. Override with InventoryManager integration.
        /// </summary>
        protected virtual void RemovePlayerGold(int amount)
        {
            InventoryManager.Instance?.RemoveGold(amount);
        }

        /// <summary>
        /// Check if player has item. Override with InventoryManager integration.
        /// </summary>
        protected virtual bool PlayerHasItem(string itemId, int quantity)
        {
            return InventoryManager.Instance?.HasItemById(itemId, quantity) ?? false;
        }

        /// <summary>
        /// Check if player can hold item. Override with InventoryManager integration.
        /// </summary>
        protected virtual bool CanPlayerHoldItem(string itemId, int quantity)
        {
            return InventoryManager.Instance?.CanAddItemById(itemId, quantity) ?? true;
        }

        /// <summary>
        /// Add item to player inventory. Override with InventoryManager integration.
        /// </summary>
        protected virtual void AddItemToPlayer(string itemId, int quantity)
        {
            InventoryManager.Instance?.AddItemById(itemId, quantity);
        }

        /// <summary>
        /// Remove item from player inventory. Override with InventoryManager integration.
        /// </summary>
        protected virtual void RemoveItemFromPlayer(string itemId, int quantity)
        {
            InventoryManager.Instance?.RemoveItemById(itemId, quantity);
        }

        /// <summary>
        /// Get player's reputation. Override with reputation system integration.
        /// </summary>
        protected virtual int GetPlayerReputation()
        {
            // TODO: Integrate with reputation system
            return 50; // Neutral
        }

        /// <summary>
        /// Get player's charisma stat. Override with stats system integration.
        /// </summary>
        protected virtual int GetPlayerCharisma()
        {
            // TODO: Integrate with character stats
            return 50; // Average
        }

        /// <summary>
        /// Get item condition. Override with item durability system.
        /// </summary>
        protected virtual float GetItemCondition(string itemId)
        {
            // TODO: Integrate with item durability system
            return 1.0f; // Perfect condition
        }

        /// <summary>
        /// Set item condition. Override with item durability system.
        /// </summary>
        protected virtual void SetItemCondition(string itemId, float condition)
        {
            // TODO: Integrate with item durability system
        }

        #endregion

        #region Audio

        private void PlaySound(AudioClip clip)
        {
            if (clip == null)
                return;

            // Play sound (would use AudioManager in full implementation)
            AudioSource.PlayClipAtPoint(clip, Camera.main?.transform.position ?? Vector3.zero);
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data for all shops.
        /// </summary>
        public Dictionary<string, ShopSaveData> GetSaveData()
        {
            var data = new Dictionary<string, ShopSaveData>();

            foreach (var kvp in _shopInventories)
            {
                data[kvp.Key] = new ShopSaveData
                {
                    shopId = kvp.Key,
                    stock = kvp.Value.GetSaveState(),
                    lastRestockTime = kvp.Value.LastRestockTime
                };
            }

            return data;
        }

        /// <summary>
        /// Load save data for shops.
        /// </summary>
        public void LoadSaveData(Dictionary<string, ShopSaveData> data)
        {
            if (data == null)
                return;

            foreach (var kvp in data)
            {
                if (_shopInventories.TryGetValue(kvp.Key, out var inventory))
                {
                    inventory.InitializeFromSave(kvp.Value.stock, kvp.Value.lastRestockTime);
                }
            }

            Log("Loaded shop save data");
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[ShopManager] {message}");
            }
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
    }

    /// <summary>
    /// Save data structure for a shop.
    /// </summary>
    [Serializable]
    public class ShopSaveData
    {
        public string shopId;
        public Dictionary<string, int> stock;
        public float lastRestockTime;
    }

    #endregion
}
