using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using IronFrontier.Core;
using IronFrontier.Data;
using IronFrontier.Inventory;

namespace IronFrontier.Shop
{
    /// <summary>
    /// UI tab modes for the shop interface.
    /// </summary>
    public enum ShopTab
    {
        Buy,
        Sell,
        Repair
    }

    /// <summary>
    /// Represents an item slot in the shop UI.
    /// </summary>
    [Serializable]
    public class ShopItemSlot
    {
        public GameObject slotObject;
        public Image iconImage;
        public TMP_Text nameText;
        public TMP_Text priceText;
        public TMP_Text stockText;
        public Button selectButton;
        public Image selectedHighlight;
        public Image featuredBadge;
        public string itemId;
        public int stock;
        public int price;
    }

    /// <summary>
    /// Shop user interface controller.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript ShopPanel.tsx and ShopScreen.tsx.
    /// Handles buy/sell UI, item selection, and transaction confirmation.
    /// </remarks>
    public class ShopUI : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Panels")]
        [SerializeField]
        private GameObject shopPanel;

        [SerializeField]
        private GameObject confirmationPanel;

        [SerializeField]
        private GameObject hagglePanel;

        [Header("Header")]
        [SerializeField]
        private TMP_Text shopNameText;

        [SerializeField]
        private TMP_Text shopkeeperNameText;

        [SerializeField]
        private Image shopkeeperPortrait;

        [Header("Tabs")]
        [SerializeField]
        private Button buyTabButton;

        [SerializeField]
        private Button sellTabButton;

        [SerializeField]
        private Button repairTabButton;

        [SerializeField]
        private Color activeTabColor = Color.white;

        [SerializeField]
        private Color inactiveTabColor = Color.gray;

        [Header("Item List")]
        [SerializeField]
        private Transform itemListContainer;

        [SerializeField]
        private GameObject itemSlotPrefab;

        [SerializeField]
        private int maxVisibleSlots = 8;

        [SerializeField]
        private ScrollRect itemScrollRect;

        [Header("Item Details")]
        [SerializeField]
        private GameObject detailsPanel;

        [SerializeField]
        private Image detailsIcon;

        [SerializeField]
        private TMP_Text detailsNameText;

        [SerializeField]
        private TMP_Text detailsDescriptionText;

        [SerializeField]
        private TMP_Text detailsPriceText;

        [SerializeField]
        private TMP_Text detailsStockText;

        [SerializeField]
        private TMP_Text detailsStatsText;

        [Header("Transaction")]
        [SerializeField]
        private TMP_Text quantityText;

        [SerializeField]
        private Button decreaseQuantityButton;

        [SerializeField]
        private Button increaseQuantityButton;

        [SerializeField]
        private Button transactionButton;

        [SerializeField]
        private TMP_Text transactionButtonText;

        [SerializeField]
        private Button haggleButton;

        [Header("Player Info")]
        [SerializeField]
        private TMP_Text playerGoldText;

        [SerializeField]
        private TMP_Text playerInventoryText;

        [Header("Confirmation")]
        [SerializeField]
        private TMP_Text confirmationText;

        [SerializeField]
        private Button confirmYesButton;

        [SerializeField]
        private Button confirmNoButton;

        [Header("Haggle")]
        [SerializeField]
        private TMP_Text haggleResponseText;

        [SerializeField]
        private TMP_Text hagglePriceText;

        [SerializeField]
        private Button haggleAcceptButton;

        [SerializeField]
        private Button haggleDeclineButton;

        [SerializeField]
        private Button haggleContinueButton;

        [Header("Footer")]
        [SerializeField]
        private Button closeButton;

        [SerializeField]
        private TMP_Text statusText;

        [Header("Audio")]
        [SerializeField]
        private AudioClip tabSwitchSound;

        [SerializeField]
        private AudioClip selectSound;

        [SerializeField]
        private AudioClip errorSound;

        #endregion

        #region Private Fields

        private ShopTab _currentTab = ShopTab.Buy;
        private readonly List<ShopItemSlot> _itemSlots = new();
        private ShopItemSlot _selectedSlot;
        private int _selectedQuantity = 1;
        private string _pendingItemId;
        private int _pendingQuantity;
        private bool _pendingIsBuy;
        private HaggleResult _lastHaggleResult;

        #endregion

        #region Properties

        /// <summary>
        /// Currently selected tab.
        /// </summary>
        public ShopTab CurrentTab => _currentTab;

        /// <summary>
        /// Currently selected item ID.
        /// </summary>
        public string SelectedItemId => _selectedSlot?.itemId;

        /// <summary>
        /// Selected quantity for transaction.
        /// </summary>
        public int SelectedQuantity => _selectedQuantity;

        #endregion

        #region Unity Lifecycle

        private void Start()
        {
            SetupButtons();
            HideAllPanels();

            // Subscribe to shop events
            if (ShopManager.Instance != null)
            {
                ShopManager.Instance.OnShopOpened += HandleShopOpened;
                ShopManager.Instance.OnShopClosed += HandleShopClosed;
                ShopManager.Instance.OnItemPurchased += HandleItemPurchased;
                ShopManager.Instance.OnItemSold += HandleItemSold;
                ShopManager.Instance.OnTransactionFailed += HandleTransactionFailed;
                ShopManager.Instance.OnHaggleAttempted += HandleHaggleAttempted;
            }
        }

        private void OnDestroy()
        {
            if (ShopManager.Instance != null)
            {
                ShopManager.Instance.OnShopOpened -= HandleShopOpened;
                ShopManager.Instance.OnShopClosed -= HandleShopClosed;
                ShopManager.Instance.OnItemPurchased -= HandleItemPurchased;
                ShopManager.Instance.OnItemSold -= HandleItemSold;
                ShopManager.Instance.OnTransactionFailed -= HandleTransactionFailed;
                ShopManager.Instance.OnHaggleAttempted -= HandleHaggleAttempted;
            }
        }

        private void Update()
        {
            // Handle escape key
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (confirmationPanel.activeSelf)
                {
                    HideConfirmation();
                }
                else if (hagglePanel.activeSelf)
                {
                    HideHaggle();
                }
                else if (shopPanel.activeSelf)
                {
                    CloseShop();
                }
            }
        }

        #endregion

        #region Setup

        private void SetupButtons()
        {
            // Tab buttons
            buyTabButton?.onClick.AddListener(() => SwitchTab(ShopTab.Buy));
            sellTabButton?.onClick.AddListener(() => SwitchTab(ShopTab.Sell));
            repairTabButton?.onClick.AddListener(() => SwitchTab(ShopTab.Repair));

            // Quantity buttons
            decreaseQuantityButton?.onClick.AddListener(DecreaseQuantity);
            increaseQuantityButton?.onClick.AddListener(IncreaseQuantity);

            // Transaction buttons
            transactionButton?.onClick.AddListener(StartTransaction);
            haggleButton?.onClick.AddListener(StartHaggle);

            // Confirmation buttons
            confirmYesButton?.onClick.AddListener(ConfirmTransaction);
            confirmNoButton?.onClick.AddListener(HideConfirmation);

            // Haggle buttons
            haggleAcceptButton?.onClick.AddListener(AcceptHaggle);
            haggleDeclineButton?.onClick.AddListener(DeclineHaggle);
            haggleContinueButton?.onClick.AddListener(ContinueHaggle);

            // Close button
            closeButton?.onClick.AddListener(CloseShop);
        }

        private void HideAllPanels()
        {
            shopPanel?.SetActive(false);
            confirmationPanel?.SetActive(false);
            hagglePanel?.SetActive(false);
        }

        #endregion

        #region Event Handlers

        private void HandleShopOpened(object sender, string shopId)
        {
            OpenUI();
        }

        private void HandleShopClosed(object sender, EventArgs e)
        {
            CloseUI();
        }

        private void HandleItemPurchased(object sender, ShopTransactionEventArgs e)
        {
            ShowStatus($"Purchased {e.Quantity}x item for ${e.Gold}");
            RefreshUI();
            HideConfirmation();
        }

        private void HandleItemSold(object sender, ShopTransactionEventArgs e)
        {
            ShowStatus($"Sold {e.Quantity}x item for ${e.Gold}");
            RefreshUI();
            HideConfirmation();
        }

        private void HandleTransactionFailed(object sender, string message)
        {
            ShowStatus(message, true);
            PlaySound(errorSound);
        }

        private void HandleHaggleAttempted(object sender, HaggleResult result)
        {
            _lastHaggleResult = result;
            ShowHaggleResult(result);
        }

        #endregion

        #region UI Control

        /// <summary>
        /// Open the shop UI.
        /// </summary>
        public void OpenUI()
        {
            var shop = ShopManager.Instance?.CurrentShop;
            if (shop == null)
                return;

            // Update header
            UpdateHeader(shop.ShopData);

            // Set initial tab
            SwitchTab(ShopTab.Buy);

            // Show panel
            shopPanel?.SetActive(true);
            confirmationPanel?.SetActive(false);
            hagglePanel?.SetActive(false);

            // Refresh
            RefreshUI();
        }

        /// <summary>
        /// Close the shop UI.
        /// </summary>
        public void CloseUI()
        {
            HideAllPanels();
            ClearItemSlots();
            _selectedSlot = null;
            _selectedQuantity = 1;
        }

        /// <summary>
        /// Refresh all UI elements.
        /// </summary>
        public void RefreshUI()
        {
            RefreshPlayerInfo();
            RefreshItemList();
            RefreshDetails();
            RefreshTransactionButtons();
        }

        private void UpdateHeader(ShopData shopData)
        {
            if (shopNameText != null)
                shopNameText.text = shopData.displayName;

            if (shopkeeperNameText != null)
                shopkeeperNameText.text = shopData.shopkeeperId; // Would look up NPC name

            // Would load portrait sprite from shopData.shopkeeperId
        }

        private void RefreshPlayerInfo()
        {
            if (playerGoldText != null)
            {
                int gold = InventoryManager.Instance?.Gold ?? 0;
                playerGoldText.text = $"${gold:N0}";
            }

            if (playerInventoryText != null)
            {
                // Would show inventory capacity
                playerInventoryText.text = "Inventory: --/--";
            }
        }

        #endregion

        #region Tab Switching

        /// <summary>
        /// Switch to a different shop tab.
        /// </summary>
        public void SwitchTab(ShopTab tab)
        {
            _currentTab = tab;

            // Update tab button visuals
            UpdateTabVisuals();

            // Clear selection
            _selectedSlot = null;
            _selectedQuantity = 1;

            // Show/hide repair tab if not available
            if (repairTabButton != null)
            {
                var shop = ShopManager.Instance?.CurrentShop;
                repairTabButton.gameObject.SetActive(shop?.ShopData.offersRepairs ?? false);
            }

            // Refresh item list
            RefreshItemList();
            RefreshDetails();
            RefreshTransactionButtons();

            PlaySound(tabSwitchSound);
        }

        private void UpdateTabVisuals()
        {
            if (buyTabButton != null)
            {
                var colors = buyTabButton.colors;
                colors.normalColor = _currentTab == ShopTab.Buy ? activeTabColor : inactiveTabColor;
                buyTabButton.colors = colors;
            }

            if (sellTabButton != null)
            {
                var colors = sellTabButton.colors;
                colors.normalColor = _currentTab == ShopTab.Sell ? activeTabColor : inactiveTabColor;
                sellTabButton.colors = colors;
            }

            if (repairTabButton != null)
            {
                var colors = repairTabButton.colors;
                colors.normalColor = _currentTab == ShopTab.Repair ? activeTabColor : inactiveTabColor;
                repairTabButton.colors = colors;
            }
        }

        #endregion

        #region Item List

        private void RefreshItemList()
        {
            ClearItemSlots();

            var shop = ShopManager.Instance?.CurrentShop;
            if (shop == null)
                return;

            switch (_currentTab)
            {
                case ShopTab.Buy:
                    PopulateBuyItems(shop);
                    break;
                case ShopTab.Sell:
                    PopulateSellItems();
                    break;
                case ShopTab.Repair:
                    PopulateRepairItems();
                    break;
            }
        }

        private void PopulateBuyItems(ShopInventory shop)
        {
            var database = ItemDatabase.Instance;
            if (database == null)
                return;

            foreach (var entry in shop.InStockItems)
            {
                var item = database.GetItemById(entry.itemId);
                if (item == null)
                    continue;

                var priceResult = shop.GetBuyPrice(item, GetPlayerReputation());
                CreateItemSlot(item, entry.itemId, priceResult.FinalPrice, shop.GetStock(entry.itemId), entry.featured);
            }
        }

        private void PopulateSellItems()
        {
            var inventory = InventoryManager.Instance;
            var database = ItemDatabase.Instance;
            var shop = ShopManager.Instance?.CurrentShop;

            if (inventory == null || database == null || shop == null)
                return;

            // Get player's sellable items
            foreach (var slot in inventory.GetAllItems())
            {
                var item = database.GetItemById(slot.ItemId);
                if (item == null || !item.sellable)
                    continue;

                // Check if shop accepts this type
                if (!shop.ShopData.AcceptsItemType(item.type.ToString()))
                    continue;

                var priceResult = shop.GetSellPrice(item, GetPlayerReputation());
                CreateItemSlot(item, slot.ItemId, priceResult.FinalPrice, slot.Quantity, false);
            }
        }

        private void PopulateRepairItems()
        {
            // Would populate with damaged items from player inventory
            // For now, show message that no items need repair
            if (statusText != null)
                statusText.text = "No items need repair";
        }

        private void CreateItemSlot(ItemData item, string itemId, int price, int stock, bool featured)
        {
            if (itemSlotPrefab == null || itemListContainer == null)
                return;

            var slotObj = Instantiate(itemSlotPrefab, itemListContainer);
            var slot = new ShopItemSlot
            {
                slotObject = slotObj,
                itemId = itemId,
                price = price,
                stock = stock
            };

            // Get components
            slot.iconImage = slotObj.transform.Find("Icon")?.GetComponent<Image>();
            slot.nameText = slotObj.transform.Find("Name")?.GetComponent<TMP_Text>();
            slot.priceText = slotObj.transform.Find("Price")?.GetComponent<TMP_Text>();
            slot.stockText = slotObj.transform.Find("Stock")?.GetComponent<TMP_Text>();
            slot.selectButton = slotObj.GetComponent<Button>();
            slot.selectedHighlight = slotObj.transform.Find("Highlight")?.GetComponent<Image>();
            slot.featuredBadge = slotObj.transform.Find("Featured")?.GetComponent<Image>();

            // Set values
            if (slot.nameText != null)
                slot.nameText.text = item.displayName;

            if (slot.priceText != null)
                slot.priceText.text = $"${price:N0}";

            if (slot.stockText != null)
            {
                slot.stockText.text = stock < 0 ? "Unlimited" : $"x{stock}";
            }

            if (slot.featuredBadge != null)
                slot.featuredBadge.gameObject.SetActive(featured);

            if (slot.selectedHighlight != null)
                slot.selectedHighlight.gameObject.SetActive(false);

            // Load icon (would use asset loading system)
            // slot.iconImage.sprite = ...

            // Setup button
            if (slot.selectButton != null)
            {
                slot.selectButton.onClick.AddListener(() => SelectItem(slot));
            }

            _itemSlots.Add(slot);
        }

        private void ClearItemSlots()
        {
            foreach (var slot in _itemSlots)
            {
                if (slot.slotObject != null)
                    Destroy(slot.slotObject);
            }
            _itemSlots.Clear();
        }

        #endregion

        #region Item Selection

        private void SelectItem(ShopItemSlot slot)
        {
            // Deselect previous
            if (_selectedSlot?.selectedHighlight != null)
                _selectedSlot.selectedHighlight.gameObject.SetActive(false);

            // Select new
            _selectedSlot = slot;
            _selectedQuantity = 1;

            if (slot.selectedHighlight != null)
                slot.selectedHighlight.gameObject.SetActive(true);

            RefreshDetails();
            RefreshTransactionButtons();
            PlaySound(selectSound);
        }

        private void RefreshDetails()
        {
            if (detailsPanel == null)
                return;

            if (_selectedSlot == null)
            {
                detailsPanel.SetActive(false);
                return;
            }

            detailsPanel.SetActive(true);

            var item = ItemDatabase.Instance?.GetItemById(_selectedSlot.itemId);
            if (item == null)
                return;

            if (detailsNameText != null)
                detailsNameText.text = item.displayName;

            if (detailsDescriptionText != null)
                detailsDescriptionText.text = item.description;

            if (detailsPriceText != null)
            {
                int total = _selectedSlot.price * _selectedQuantity;
                detailsPriceText.text = $"${total:N0}";
            }

            if (detailsStockText != null)
            {
                detailsStockText.text = _selectedSlot.stock < 0
                    ? "Available: Unlimited"
                    : $"Available: {_selectedSlot.stock}";
            }

            if (detailsStatsText != null)
            {
                detailsStatsText.text = GetItemStatsText(item);
            }

            // Update quantity display
            if (quantityText != null)
                quantityText.text = _selectedQuantity.ToString();
        }

        private string GetItemStatsText(ItemData item)
        {
            var lines = new List<string>();

            lines.Add($"Type: {item.type}");
            lines.Add($"Rarity: {item.rarity}");

            if (item.hasWeaponStats)
            {
                lines.Add($"Damage: {item.weaponStats.damage}");
                lines.Add($"Range: {item.weaponStats.range}");
                lines.Add($"Accuracy: {item.weaponStats.accuracy}%");
            }

            if (item.hasArmorStats)
            {
                lines.Add($"Defense: {item.armorStats.defense}");
                lines.Add($"Slot: {item.armorStats.slot}");
            }

            if (item.hasConsumableStats && item.consumableStats.healAmount > 0)
            {
                lines.Add($"Heals: {item.consumableStats.healAmount} HP");
            }

            return string.Join("\n", lines);
        }

        #endregion

        #region Quantity Control

        private void IncreaseQuantity()
        {
            if (_selectedSlot == null)
                return;

            int maxQty = _selectedSlot.stock < 0 ? 99 : _selectedSlot.stock;

            if (_currentTab == ShopTab.Buy)
            {
                // Also limit by gold
                int playerGold = InventoryManager.Instance?.Gold ?? 0;
                int maxAffordable = playerGold / Math.Max(1, _selectedSlot.price);
                maxQty = Math.Min(maxQty, maxAffordable);
            }

            if (_selectedQuantity < maxQty)
            {
                _selectedQuantity++;
                RefreshDetails();
                RefreshTransactionButtons();
            }
        }

        private void DecreaseQuantity()
        {
            if (_selectedQuantity > 1)
            {
                _selectedQuantity--;
                RefreshDetails();
                RefreshTransactionButtons();
            }
        }

        #endregion

        #region Transaction

        private void RefreshTransactionButtons()
        {
            bool hasSelection = _selectedSlot != null;
            bool canTransact = hasSelection && CanPerformTransaction();

            if (transactionButton != null)
            {
                transactionButton.interactable = canTransact;
            }

            if (transactionButtonText != null)
            {
                transactionButtonText.text = _currentTab switch
                {
                    ShopTab.Buy => "Buy",
                    ShopTab.Sell => "Sell",
                    ShopTab.Repair => "Repair",
                    _ => "Confirm"
                };
            }

            if (haggleButton != null)
            {
                var shop = ShopManager.Instance?.CurrentShop;
                bool canHaggle = hasSelection &&
                                 (shop?.ShopData.allowHaggling ?? false) &&
                                 ShopManager.Instance.CurrentHaggleAttempts < PriceCalculator.MAX_HAGGLE_ATTEMPTS;
                haggleButton.interactable = canHaggle;
            }
        }

        private bool CanPerformTransaction()
        {
            if (_selectedSlot == null)
                return false;

            int totalCost = _selectedSlot.price * _selectedQuantity;
            int playerGold = InventoryManager.Instance?.Gold ?? 0;

            return _currentTab switch
            {
                ShopTab.Buy => playerGold >= totalCost,
                ShopTab.Sell => true,
                ShopTab.Repair => playerGold >= totalCost,
                _ => false
            };
        }

        private void StartTransaction()
        {
            if (_selectedSlot == null)
                return;

            _pendingItemId = _selectedSlot.itemId;
            _pendingQuantity = _selectedQuantity;
            _pendingIsBuy = _currentTab == ShopTab.Buy;

            ShowConfirmation();
        }

        private void ShowConfirmation()
        {
            if (confirmationPanel == null)
                return;

            var item = ItemDatabase.Instance?.GetItemById(_pendingItemId);
            int total = _selectedSlot.price * _pendingQuantity;

            string action = _pendingIsBuy ? "buy" : "sell";
            confirmationText.text = $"Are you sure you want to {action}\n{_pendingQuantity}x {item?.displayName}\nfor ${total:N0}?";

            confirmationPanel.SetActive(true);
        }

        private void HideConfirmation()
        {
            confirmationPanel?.SetActive(false);
        }

        private void ConfirmTransaction()
        {
            HideConfirmation();

            TransactionResult result;
            if (_pendingIsBuy)
            {
                result = ShopManager.Instance.BuyItem(_pendingItemId, _pendingQuantity);
            }
            else
            {
                result = ShopManager.Instance.SellItem(_pendingItemId, _pendingQuantity);
            }

            if (!result.Success)
            {
                ShowStatus(result.ErrorMessage, true);
            }
        }

        #endregion

        #region Haggling

        private void StartHaggle()
        {
            if (_selectedSlot == null)
                return;

            ShopManager.Instance?.AttemptHaggle(_selectedSlot.itemId, _currentTab == ShopTab.Buy);
        }

        private void ShowHaggleResult(HaggleResult result)
        {
            if (hagglePanel == null)
                return;

            hagglePanel.SetActive(true);

            if (haggleResponseText != null)
                haggleResponseText.text = $"\"{result.Response}\"";

            if (hagglePriceText != null)
            {
                if (result.Success)
                {
                    hagglePriceText.text = $"New price: ${result.NewPrice:N0}";
                }
                else
                {
                    hagglePriceText.text = "Price unchanged";
                }
            }

            // Show/hide buttons based on result
            if (haggleAcceptButton != null)
                haggleAcceptButton.gameObject.SetActive(result.Success);

            if (haggleContinueButton != null)
                haggleContinueButton.gameObject.SetActive(!result.IsFinalOffer && !result.Success);

            if (haggleDeclineButton != null)
                haggleDeclineButton.gameObject.SetActive(true);
        }

        private void AcceptHaggle()
        {
            // Price has been updated in ShopManager
            HideHaggle();
            RefreshUI();
        }

        private void DeclineHaggle()
        {
            ShopManager.Instance?.ResetHaggle();
            HideHaggle();
            RefreshUI();
        }

        private void ContinueHaggle()
        {
            HideHaggle();
            // Try again
            StartHaggle();
        }

        private void HideHaggle()
        {
            hagglePanel?.SetActive(false);
        }

        #endregion

        #region Status

        private void ShowStatus(string message, bool isError = false)
        {
            if (statusText != null)
            {
                statusText.text = message;
                statusText.color = isError ? Color.red : Color.white;
            }

            if (isError)
                PlaySound(errorSound);
        }

        #endregion

        #region Close

        private void CloseShop()
        {
            ShopManager.Instance?.CloseShop();
        }

        #endregion

        #region Helpers

        private int GetPlayerReputation()
        {
            // Would get from reputation system
            return 50;
        }

        private void PlaySound(AudioClip clip)
        {
            if (clip == null)
                return;

            AudioSource.PlayClipAtPoint(clip, Camera.main?.transform.position ?? Vector3.zero);
        }

        #endregion
    }
}
