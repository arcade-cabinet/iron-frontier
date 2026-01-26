using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;
using IronFrontier.Data;
using IronFrontier.Inventory;
using IronFrontier.Systems;
using IronFrontier.Core;

namespace IronFrontier.UI
{
    /// <summary>
    /// UI component for displaying loot from chests and containers.
    /// Uses UI Toolkit for rendering.
    /// </summary>
    [RequireComponent(typeof(UIDocument))]
    public class LootUI : MonoBehaviour
    {
        #region Singleton

        private static LootUI _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static LootUI Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<LootUI>();
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when loot UI is opened.</summary>
        public event EventHandler OnOpened;

        /// <summary>Fired when loot UI is closed.</summary>
        public event EventHandler OnClosed;

        /// <summary>Fired when all loot is collected.</summary>
        public event EventHandler OnLootCollected;

        #endregion

        #region Serialized Fields

        [Header("UI Assets")]
        [SerializeField] private StyleSheet _mainTheme;
        [SerializeField] private StyleSheet _lootStyle;

        [Header("Audio")]
        [SerializeField] private AudioClip _openSound;
        [SerializeField] private AudioClip _closeSound;
        [SerializeField] private AudioClip _collectSound;
        [SerializeField] private AudioClip _collectAllSound;

        #endregion

        #region Private Fields

        private UIDocument _document;
        private VisualElement _root;
        private VisualElement _container;
        private VisualElement _lootPanel;
        private Label _titleLabel;
        private Label _goldLabel;
        private VisualElement _itemsContainer;
        private Button _takeAllButton;
        private Button _closeButton;

        private ChestContainer _currentChest;
        private AudioSource _audioSource;
        private bool _isVisible;

        #endregion

        #region Properties

        /// <summary>Whether the loot UI is currently visible.</summary>
        public bool IsVisible => _isVisible;

        /// <summary>The current chest being looted.</summary>
        public ChestContainer CurrentChest => _currentChest;

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

            _document = GetComponent<UIDocument>();
            _audioSource = gameObject.AddComponent<AudioSource>();
            _audioSource.playOnAwake = false;
        }

        private void OnEnable()
        {
            SetupUI();
            Hide();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        private void Update()
        {
            if (_isVisible && UnityEngine.Input.GetKeyDown(KeyCode.Escape))
            {
                Hide();
            }
        }

        #endregion

        #region UI Setup

        private void SetupUI()
        {
            _root = _document.rootVisualElement;
            _root.Clear();

            // Apply stylesheets
            if (_mainTheme == null)
            {
                _mainTheme = Resources.Load<StyleSheet>("UI/Stylesheets/MainTheme");
            }
            if (_lootStyle == null)
            {
                _lootStyle = Resources.Load<StyleSheet>("UI/Stylesheets/Loot");
            }

            if (_mainTheme != null) _root.styleSheets.Add(_mainTheme);
            if (_lootStyle != null) _root.styleSheets.Add(_lootStyle);

            // Create container with overlay background
            _container = new VisualElement();
            _container.name = "loot-overlay";
            _container.AddToClassList("loot-overlay");
            _root.Add(_container);

            // Create loot panel
            _lootPanel = new VisualElement();
            _lootPanel.name = "loot-panel";
            _lootPanel.AddToClassList("loot-panel");
            _container.Add(_lootPanel);

            // Create header
            var header = new VisualElement();
            header.AddToClassList("loot-header");
            _lootPanel.Add(header);

            _titleLabel = new Label("Chest");
            _titleLabel.AddToClassList("loot-title");
            header.Add(_titleLabel);

            _closeButton = new Button(OnCloseClicked);
            _closeButton.text = "X";
            _closeButton.AddToClassList("loot-close-button");
            header.Add(_closeButton);

            // Create gold display
            var goldRow = new VisualElement();
            goldRow.AddToClassList("loot-gold-row");
            _lootPanel.Add(goldRow);

            var goldIcon = new VisualElement();
            goldIcon.AddToClassList("loot-gold-icon");
            goldRow.Add(goldIcon);

            _goldLabel = new Label("0 Gold");
            _goldLabel.AddToClassList("loot-gold-text");
            goldRow.Add(_goldLabel);

            // Create items container
            _itemsContainer = new VisualElement();
            _itemsContainer.name = "loot-items";
            _itemsContainer.AddToClassList("loot-items");
            _lootPanel.Add(_itemsContainer);

            // Create buttons row
            var buttonsRow = new VisualElement();
            buttonsRow.AddToClassList("loot-buttons");
            _lootPanel.Add(buttonsRow);

            _takeAllButton = new Button(OnTakeAllClicked);
            _takeAllButton.text = "Take All";
            _takeAllButton.AddToClassList("loot-button");
            _takeAllButton.AddToClassList("loot-button--primary");
            buttonsRow.Add(_takeAllButton);

            var closeBtn = new Button(OnCloseClicked);
            closeBtn.text = "Close";
            closeBtn.AddToClassList("loot-button");
            buttonsRow.Add(closeBtn);
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Shows the loot UI for a chest.
        /// </summary>
        /// <param name="chest">The chest to display loot from.</param>
        public void Show(ChestContainer chest)
        {
            if (chest == null) return;

            _currentChest = chest;

            // Open the chest if not already open
            chest.Open();

            // Update UI
            _titleLabel.text = chest.DisplayName;
            UpdateGoldDisplay();
            UpdateItemsDisplay();

            // Show container
            _container.style.display = DisplayStyle.Flex;
            _isVisible = true;

            // Play sound
            PlaySound(_openSound);

            // Fire event
            OnOpened?.Invoke(this, EventArgs.Empty);

            // Publish to event bus
            EventBus.Instance?.Publish("loot_ui_opened", chest.gameObject.name);
        }

        /// <summary>
        /// Shows loot UI with custom loot data (not from a chest).
        /// </summary>
        /// <param name="title">Title to display.</param>
        /// <param name="loot">List of loot items.</param>
        /// <param name="gold">Gold amount.</param>
        public void ShowCustomLoot(string title, List<LootResult> loot, int gold = 0)
        {
            _currentChest = null;

            _titleLabel.text = title;
            _goldLabel.text = gold > 0 ? $"{gold} Gold" : "";

            UpdateItemsDisplay(loot);

            _container.style.display = DisplayStyle.Flex;
            _isVisible = true;

            PlaySound(_openSound);
            OnOpened?.Invoke(this, EventArgs.Empty);
        }

        /// <summary>
        /// Hides the loot UI.
        /// </summary>
        public void Hide()
        {
            if (!_isVisible) return;

            _container.style.display = DisplayStyle.None;
            _isVisible = false;

            // Close the chest
            if (_currentChest != null)
            {
                _currentChest.Close();
            }

            PlaySound(_closeSound);
            OnClosed?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish("loot_ui_closed", "");

            _currentChest = null;
        }

        #endregion

        #region Private Methods

        private void UpdateGoldDisplay()
        {
            if (_currentChest == null) return;

            int gold = _currentChest.GeneratedGold;
            _goldLabel.text = gold > 0 ? $"{gold} Gold" : "No Gold";
            _goldLabel.style.display = gold > 0 ? DisplayStyle.Flex : DisplayStyle.None;
        }

        private void UpdateItemsDisplay()
        {
            if (_currentChest == null) return;
            UpdateItemsDisplay(_currentChest.GeneratedLoot as List<LootResult>);
        }

        private void UpdateItemsDisplay(List<LootResult> loot)
        {
            _itemsContainer.Clear();

            if (loot == null || loot.Count == 0)
            {
                var emptyLabel = new Label("No items");
                emptyLabel.AddToClassList("loot-empty");
                _itemsContainer.Add(emptyLabel);
                return;
            }

            foreach (var item in loot)
            {
                var itemRow = CreateItemRow(item);
                _itemsContainer.Add(itemRow);
            }
        }

        private VisualElement CreateItemRow(LootResult item)
        {
            var row = new VisualElement();
            row.AddToClassList("loot-item-row");

            // Item icon placeholder
            var icon = new VisualElement();
            icon.AddToClassList("loot-item-icon");

            // Get item data for icon/rarity
            var itemData = ItemDatabase.Instance?.GetItemById(item.ItemId);
            if (itemData != null)
            {
                // Set icon background based on rarity
                icon.AddToClassList($"loot-item-icon--{itemData.rarity.ToString().ToLower()}");
            }
            row.Add(icon);

            // Item details
            var details = new VisualElement();
            details.AddToClassList("loot-item-details");

            var nameLabel = new Label(GetItemDisplayName(item));
            nameLabel.AddToClassList("loot-item-name");
            if (itemData != null)
            {
                nameLabel.AddToClassList($"loot-item-name--{itemData.rarity.ToString().ToLower()}");
            }
            details.Add(nameLabel);

            if (item.Quantity > 1)
            {
                var qtyLabel = new Label($"x{item.Quantity}");
                qtyLabel.AddToClassList("loot-item-quantity");
                details.Add(qtyLabel);
            }

            row.Add(details);

            // Take button
            var takeButton = new Button(() => OnTakeItemClicked(item));
            takeButton.text = "Take";
            takeButton.AddToClassList("loot-item-button");
            row.Add(takeButton);

            return row;
        }

        private string GetItemDisplayName(LootResult item)
        {
            var itemData = ItemDatabase.Instance?.GetItemById(item.ItemId);
            if (itemData != null)
            {
                return itemData.displayName;
            }
            return item.ItemId.Replace("_", " ");
        }

        private void OnTakeItemClicked(LootResult item)
        {
            if (_currentChest != null)
            {
                int collected = _currentChest.CollectItem(item.ItemId);
                if (collected > 0)
                {
                    PlaySound(_collectSound);
                    UpdateItemsDisplay();

                    // Check if all loot collected
                    if (_currentChest.HasBeenLooted)
                    {
                        OnLootCollected?.Invoke(this, EventArgs.Empty);
                    }
                }
            }
            else
            {
                // Custom loot - add directly to inventory
                if (InventoryManager.Instance != null)
                {
                    int added = InventoryManager.Instance.AddItemById(item.ItemId, item.Quantity);
                    if (added > 0)
                    {
                        PlaySound(_collectSound);
                        EventBus.Instance?.Publish(GameEvents.ItemAdded, item.ItemId);
                    }
                }
            }
        }

        private void OnTakeAllClicked()
        {
            if (_currentChest != null)
            {
                if (_currentChest.CollectAllLoot())
                {
                    PlaySound(_collectAllSound ?? _collectSound);
                    OnLootCollected?.Invoke(this, EventArgs.Empty);

                    // Show notification
                    EventBus.Instance?.Publish("notification_show", "Collected all loot!");

                    // Close after collecting all
                    Hide();
                }
            }
        }

        private void OnCloseClicked()
        {
            Hide();
        }

        private void PlaySound(AudioClip clip)
        {
            if (clip != null && _audioSource != null)
            {
                _audioSource.PlayOneShot(clip);
            }
        }

        #endregion
    }
}
