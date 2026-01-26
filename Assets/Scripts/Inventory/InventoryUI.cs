using System;
using System.Collections.Generic;
using IronFrontier.Core;
using IronFrontier.Data;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Inventory slot UI element that displays a single inventory slot.
    /// </summary>
    [Serializable]
    public class InventorySlotUI : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler,
        IPointerClickHandler, IBeginDragHandler, IDragHandler, IEndDragHandler, IDropHandler
    {
        #region Serialized Fields

        [Header("UI References")]
        [SerializeField]
        private Image itemIcon;

        [SerializeField]
        private Text quantityText;

        [SerializeField]
        private Image rarityBorder;

        [SerializeField]
        private Image selectionHighlight;

        [SerializeField]
        private Image quickSlotIndicator;

        [SerializeField]
        private Text quickSlotNumber;

        [SerializeField]
        private Image conditionBar;

        #endregion

        #region Private Fields

        private InventorySlot _slot;
        private int _slotIndex;
        private InventoryUI _parentUI;
        private bool _isDragging;
        private CanvasGroup _canvasGroup;

        #endregion

        #region Properties

        /// <summary>
        /// The inventory slot this UI represents.
        /// </summary>
        public InventorySlot Slot => _slot;

        /// <summary>
        /// Index of this slot in the inventory.
        /// </summary>
        public int SlotIndex => _slotIndex;

        #endregion

        #region Public Methods

        /// <summary>
        /// Initialize this slot UI.
        /// </summary>
        /// <param name="parentUI">Parent inventory UI.</param>
        /// <param name="slotIndex">Index of this slot.</param>
        public void Initialize(InventoryUI parentUI, int slotIndex)
        {
            _parentUI = parentUI;
            _slotIndex = slotIndex;
            _canvasGroup = GetComponent<CanvasGroup>();

            if (_canvasGroup == null)
            {
                _canvasGroup = gameObject.AddComponent<CanvasGroup>();
            }

            SetSelected(false);
        }

        /// <summary>
        /// Update the display with slot data.
        /// </summary>
        /// <param name="slot">The inventory slot to display.</param>
        public void UpdateDisplay(InventorySlot slot)
        {
            _slot = slot;

            if (slot == null || slot.IsEmpty)
            {
                ClearDisplay();
                return;
            }

            var item = slot.ItemData;

            // Icon
            if (itemIcon != null)
            {
                itemIcon.enabled = true;
                itemIcon.sprite = item.icon;
                itemIcon.color = Color.white;
            }

            // Quantity
            if (quantityText != null)
            {
                if (slot.Quantity > 1)
                {
                    quantityText.enabled = true;
                    quantityText.text = slot.Quantity.ToString();
                }
                else
                {
                    quantityText.enabled = false;
                }
            }

            // Rarity border
            if (rarityBorder != null)
            {
                rarityBorder.enabled = true;
                rarityBorder.color = item.GetRarityColor();
            }

            // Quick slot indicator
            if (quickSlotIndicator != null && quickSlotNumber != null)
            {
                if (slot.QuickSlotIndex >= 0)
                {
                    quickSlotIndicator.enabled = true;
                    quickSlotNumber.enabled = true;
                    quickSlotNumber.text = (slot.QuickSlotIndex + 1).ToString();
                }
                else
                {
                    quickSlotIndicator.enabled = false;
                    quickSlotNumber.enabled = false;
                }
            }

            // Condition bar
            if (conditionBar != null)
            {
                if (slot.Condition < 1f)
                {
                    conditionBar.enabled = true;
                    conditionBar.fillAmount = slot.Condition;
                    conditionBar.color = GetConditionColor(slot.Condition);
                }
                else
                {
                    conditionBar.enabled = false;
                }
            }
        }

        /// <summary>
        /// Clear the display (empty slot).
        /// </summary>
        public void ClearDisplay()
        {
            if (itemIcon != null)
            {
                itemIcon.enabled = false;
            }

            if (quantityText != null)
            {
                quantityText.enabled = false;
            }

            if (rarityBorder != null)
            {
                rarityBorder.enabled = false;
            }

            if (quickSlotIndicator != null)
            {
                quickSlotIndicator.enabled = false;
            }

            if (quickSlotNumber != null)
            {
                quickSlotNumber.enabled = false;
            }

            if (conditionBar != null)
            {
                conditionBar.enabled = false;
            }
        }

        /// <summary>
        /// Set whether this slot is selected.
        /// </summary>
        /// <param name="selected">Selection state.</param>
        public void SetSelected(bool selected)
        {
            if (selectionHighlight != null)
            {
                selectionHighlight.enabled = selected;
            }
        }

        #endregion

        #region Event Handlers

        public void OnPointerEnter(PointerEventData eventData)
        {
            _parentUI?.OnSlotHoverEnter(this);
        }

        public void OnPointerExit(PointerEventData eventData)
        {
            _parentUI?.OnSlotHoverExit(this);
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            if (eventData.button == PointerEventData.InputButton.Left)
            {
                _parentUI?.OnSlotLeftClick(this);
            }
            else if (eventData.button == PointerEventData.InputButton.Right)
            {
                _parentUI?.OnSlotRightClick(this);
            }
        }

        public void OnBeginDrag(PointerEventData eventData)
        {
            if (_slot == null || _slot.IsEmpty)
                return;

            _isDragging = true;
            _canvasGroup.alpha = 0.6f;
            _canvasGroup.blocksRaycasts = false;

            _parentUI?.OnSlotBeginDrag(this, eventData);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (!_isDragging)
                return;

            _parentUI?.OnSlotDrag(this, eventData);
        }

        public void OnEndDrag(PointerEventData eventData)
        {
            if (!_isDragging)
                return;

            _isDragging = false;
            _canvasGroup.alpha = 1f;
            _canvasGroup.blocksRaycasts = true;

            _parentUI?.OnSlotEndDrag(this, eventData);
        }

        public void OnDrop(PointerEventData eventData)
        {
            _parentUI?.OnSlotDrop(this, eventData);
        }

        #endregion

        #region Private Methods

        private Color GetConditionColor(float condition)
        {
            if (condition > 0.5f)
                return Color.Lerp(Color.yellow, Color.green, (condition - 0.5f) * 2f);
            else
                return Color.Lerp(Color.red, Color.yellow, condition * 2f);
        }

        #endregion
    }

    /// <summary>
    /// Main inventory UI controller.
    /// Handles grid display, drag and drop, tooltips, and context menus.
    /// </summary>
    public class InventoryUI : MonoBehaviour
    {
        #region Events

        /// <summary>
        /// Fired when an item is selected.
        /// </summary>
        public event EventHandler<InventorySlot> OnItemSelected;

        /// <summary>
        /// Fired when an item is used via UI.
        /// </summary>
        public event EventHandler<InventorySlot> OnItemUsed;

        /// <summary>
        /// Fired when an item is dropped via UI.
        /// </summary>
        public event EventHandler<InventorySlot> OnItemDropped;

        #endregion

        #region Serialized Fields

        [Header("References")]
        [SerializeField]
        private InventoryManager inventoryManager;

        [SerializeField]
        private EquipmentManager equipmentManager;

        [Header("Grid Settings")]
        [SerializeField]
        private Transform slotsContainer;

        [SerializeField]
        private GameObject slotPrefab;

        [SerializeField]
        private int columns = 8;

        [Header("Tooltip")]
        [SerializeField]
        private GameObject tooltipPanel;

        [SerializeField]
        private Text tooltipTitle;

        [SerializeField]
        private Text tooltipDescription;

        [SerializeField]
        private Text tooltipStats;

        [SerializeField]
        private Text tooltipValue;

        [SerializeField]
        private Image tooltipRarityBar;

        [SerializeField]
        private Vector2 tooltipOffset = new Vector2(10f, -10f);

        [Header("Context Menu")]
        [SerializeField]
        private GameObject contextMenuPanel;

        [SerializeField]
        private Button useButton;

        [SerializeField]
        private Button equipButton;

        [SerializeField]
        private Button dropButton;

        [SerializeField]
        private Button splitButton;

        [SerializeField]
        private Button bindQuickSlotButton;

        [Header("Info Display")]
        [SerializeField]
        private Text weightText;

        [SerializeField]
        private Text slotsText;

        [SerializeField]
        private Text goldText;

        [Header("Drag Visual")]
        [SerializeField]
        private Image dragIcon;

        [SerializeField]
        private Canvas dragCanvas;

        [Header("Filters")]
        [SerializeField]
        private Toggle filterAllToggle;

        [SerializeField]
        private Toggle filterWeaponsToggle;

        [SerializeField]
        private Toggle filterArmorToggle;

        [SerializeField]
        private Toggle filterConsumablesToggle;

        [SerializeField]
        private Toggle filterKeyItemsToggle;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private readonly List<InventorySlotUI> _slotUIs = new List<InventorySlotUI>();
        private InventorySlotUI _selectedSlot;
        private InventorySlotUI _hoveredSlot;
        private InventorySlotUI _dragSourceSlot;
        private ItemType? _activeFilter = null;
        private RectTransform _dragIconRect;

        #endregion

        #region Properties

        /// <summary>
        /// Currently selected slot.
        /// </summary>
        public InventorySlotUI SelectedSlot => _selectedSlot;

        /// <summary>
        /// Currently hovered slot.
        /// </summary>
        public InventorySlotUI HoveredSlot => _hoveredSlot;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            // Auto-find managers
            if (inventoryManager == null)
            {
                inventoryManager = InventoryManager.Instance;
            }

            if (equipmentManager == null)
            {
                equipmentManager = EquipmentManager.Instance;
            }

            if (dragIcon != null)
            {
                _dragIconRect = dragIcon.GetComponent<RectTransform>();
                dragIcon.enabled = false;
            }
        }

        private void Start()
        {
            CreateSlotGrid();
            SetupFilters();
            SetupContextMenu();
            HideTooltip();
            HideContextMenu();

            // Subscribe to inventory changes
            if (inventoryManager != null)
            {
                inventoryManager.OnInventoryChanged += HandleInventoryChanged;
            }

            RefreshDisplay();
        }

        private void OnDestroy()
        {
            if (inventoryManager != null)
            {
                inventoryManager.OnInventoryChanged -= HandleInventoryChanged;
            }
        }

        private void Update()
        {
            // Update drag icon position
            if (dragIcon != null && dragIcon.enabled && _dragIconRect != null)
            {
                Vector2 mousePos;
                RectTransformUtility.ScreenPointToLocalPointInRectangle(
                    dragCanvas.transform as RectTransform,
                    UnityEngine.Input.mousePosition,
                    dragCanvas.worldCamera,
                    out mousePos
                );
                _dragIconRect.anchoredPosition = mousePos;
            }

            // Update tooltip position
            if (tooltipPanel != null && tooltipPanel.activeSelf)
            {
                UpdateTooltipPosition();
            }
        }

        #endregion

        #region Initialization

        private void CreateSlotGrid()
        {
            if (slotsContainer == null || slotPrefab == null)
            {
                LogWarning("Slots container or prefab not assigned");
                return;
            }

            // Clear existing slots
            foreach (Transform child in slotsContainer)
            {
                Destroy(child.gameObject);
            }
            _slotUIs.Clear();

            // Create slot UIs
            int slotCount = inventoryManager?.MaxSlots ?? 40;
            for (int i = 0; i < slotCount; i++)
            {
                var slotGO = Instantiate(slotPrefab, slotsContainer);
                slotGO.name = $"Slot_{i}";

                var slotUI = slotGO.GetComponent<InventorySlotUI>();
                if (slotUI == null)
                {
                    slotUI = slotGO.AddComponent<InventorySlotUI>();
                }

                slotUI.Initialize(this, i);
                _slotUIs.Add(slotUI);
            }

            Log($"Created {slotCount} inventory slot UIs");
        }

        private void SetupFilters()
        {
            if (filterAllToggle != null)
            {
                filterAllToggle.onValueChanged.AddListener((on) => { if (on) SetFilter(null); });
            }
            if (filterWeaponsToggle != null)
            {
                filterWeaponsToggle.onValueChanged.AddListener((on) => { if (on) SetFilter(ItemType.Weapon); });
            }
            if (filterArmorToggle != null)
            {
                filterArmorToggle.onValueChanged.AddListener((on) => { if (on) SetFilter(ItemType.Armor); });
            }
            if (filterConsumablesToggle != null)
            {
                filterConsumablesToggle.onValueChanged.AddListener((on) => { if (on) SetFilter(ItemType.Consumable); });
            }
            if (filterKeyItemsToggle != null)
            {
                filterKeyItemsToggle.onValueChanged.AddListener((on) => { if (on) SetFilter(ItemType.KeyItem); });
            }
        }

        private void SetupContextMenu()
        {
            if (useButton != null)
            {
                useButton.onClick.AddListener(OnContextMenuUse);
            }
            if (equipButton != null)
            {
                equipButton.onClick.AddListener(OnContextMenuEquip);
            }
            if (dropButton != null)
            {
                dropButton.onClick.AddListener(OnContextMenuDrop);
            }
            if (splitButton != null)
            {
                splitButton.onClick.AddListener(OnContextMenuSplit);
            }
            if (bindQuickSlotButton != null)
            {
                bindQuickSlotButton.onClick.AddListener(OnContextMenuBindQuickSlot);
            }
        }

        #endregion

        #region Display Update

        /// <summary>
        /// Refresh the entire inventory display.
        /// </summary>
        public void RefreshDisplay()
        {
            if (inventoryManager == null)
                return;

            var slots = inventoryManager.Slots;

            for (int i = 0; i < _slotUIs.Count && i < slots.Count; i++)
            {
                var slot = slots[i];

                // Apply filter
                if (_activeFilter.HasValue && !slot.IsEmpty && slot.ItemData.type != _activeFilter.Value)
                {
                    _slotUIs[i].ClearDisplay();
                    _slotUIs[i].gameObject.SetActive(false);
                }
                else
                {
                    _slotUIs[i].gameObject.SetActive(true);
                    _slotUIs[i].UpdateDisplay(slot);
                }
            }

            UpdateInfoDisplay();
        }

        private void UpdateInfoDisplay()
        {
            if (inventoryManager == null)
                return;

            if (weightText != null)
            {
                weightText.text = $"{inventoryManager.CurrentWeight:F1} / {inventoryManager.MaxCarryWeight:F1} lbs";
                weightText.color = inventoryManager.IsOverweight ? Color.red : Color.white;
            }

            if (slotsText != null)
            {
                slotsText.text = $"{inventoryManager.UsedSlots} / {inventoryManager.MaxSlots}";
                slotsText.color = inventoryManager.IsFull ? Color.red : Color.white;
            }

            // Gold display would require integration with player stats
            if (goldText != null)
            {
                // goldText.text = $"${PlayerStats.Gold}";
            }
        }

        /// <summary>
        /// Set the active filter.
        /// </summary>
        /// <param name="filter">Item type to filter, or null for all.</param>
        public void SetFilter(ItemType? filter)
        {
            _activeFilter = filter;
            RefreshDisplay();
            Log($"Filter set to: {filter?.ToString() ?? "All"}");
        }

        #endregion

        #region Slot Events

        internal void OnSlotHoverEnter(InventorySlotUI slotUI)
        {
            _hoveredSlot = slotUI;

            if (slotUI.Slot != null && !slotUI.Slot.IsEmpty)
            {
                ShowTooltip(slotUI.Slot);
            }
        }

        internal void OnSlotHoverExit(InventorySlotUI slotUI)
        {
            if (_hoveredSlot == slotUI)
            {
                _hoveredSlot = null;
            }

            HideTooltip();
        }

        internal void OnSlotLeftClick(InventorySlotUI slotUI)
        {
            // Deselect previous
            if (_selectedSlot != null)
            {
                _selectedSlot.SetSelected(false);
            }

            // Select new
            _selectedSlot = slotUI;
            slotUI.SetSelected(true);

            if (slotUI.Slot != null && !slotUI.Slot.IsEmpty)
            {
                OnItemSelected?.Invoke(this, slotUI.Slot);
            }

            HideContextMenu();
        }

        internal void OnSlotRightClick(InventorySlotUI slotUI)
        {
            if (slotUI.Slot == null || slotUI.Slot.IsEmpty)
            {
                HideContextMenu();
                return;
            }

            _selectedSlot = slotUI;
            ShowContextMenu(slotUI);
        }

        internal void OnSlotBeginDrag(InventorySlotUI slotUI, PointerEventData eventData)
        {
            if (slotUI.Slot == null || slotUI.Slot.IsEmpty)
                return;

            _dragSourceSlot = slotUI;

            // Show drag icon
            if (dragIcon != null)
            {
                dragIcon.sprite = slotUI.Slot.ItemData.icon;
                dragIcon.enabled = true;
            }

            HideContextMenu();
        }

        internal void OnSlotDrag(InventorySlotUI slotUI, PointerEventData eventData)
        {
            // Position handled in Update
        }

        internal void OnSlotEndDrag(InventorySlotUI slotUI, PointerEventData eventData)
        {
            // Hide drag icon
            if (dragIcon != null)
            {
                dragIcon.enabled = false;
            }

            // Check if dropped outside inventory (drop item)
            if (!eventData.pointerCurrentRaycast.isValid && slotUI.Slot != null)
            {
                // Could trigger drop confirmation here
            }

            _dragSourceSlot = null;
        }

        internal void OnSlotDrop(InventorySlotUI targetSlotUI, PointerEventData eventData)
        {
            if (_dragSourceSlot == null || _dragSourceSlot == targetSlotUI)
                return;

            // Swap or stack
            if (targetSlotUI.Slot.IsEmpty ||
                !targetSlotUI.Slot.CanStackWith(_dragSourceSlot.Slot.ItemData))
            {
                // Swap
                inventoryManager.SwapSlots(_dragSourceSlot.SlotIndex, targetSlotUI.SlotIndex);
            }
            else
            {
                // Stack
                targetSlotUI.Slot.MergeFrom(_dragSourceSlot.Slot);
            }

            RefreshDisplay();
            Log($"Moved item from slot {_dragSourceSlot.SlotIndex} to {targetSlotUI.SlotIndex}");
        }

        #endregion

        #region Tooltip

        private void ShowTooltip(InventorySlot slot)
        {
            if (tooltipPanel == null || slot == null || slot.IsEmpty)
                return;

            var item = slot.ItemData;

            // Title
            if (tooltipTitle != null)
            {
                tooltipTitle.text = item.displayName;
                tooltipTitle.color = item.GetRarityColor();
            }

            // Description
            if (tooltipDescription != null)
            {
                tooltipDescription.text = item.description;
            }

            // Stats
            if (tooltipStats != null)
            {
                tooltipStats.text = BuildStatsText(item);
            }

            // Value
            if (tooltipValue != null)
            {
                tooltipValue.text = $"Value: ${item.value}  Weight: {item.weight:F1} lbs";
            }

            // Rarity bar
            if (tooltipRarityBar != null)
            {
                tooltipRarityBar.color = item.GetRarityColor();
            }

            tooltipPanel.SetActive(true);
            UpdateTooltipPosition();
        }

        private void HideTooltip()
        {
            if (tooltipPanel != null)
            {
                tooltipPanel.SetActive(false);
            }
        }

        private void UpdateTooltipPosition()
        {
            if (tooltipPanel == null)
                return;

            var rect = tooltipPanel.GetComponent<RectTransform>();
            if (rect == null)
                return;

            Vector2 mousePos = UnityEngine.Input.mousePosition;
            Vector2 tooltipPos = mousePos + tooltipOffset;

            // Keep tooltip on screen
            Canvas canvas = tooltipPanel.GetComponentInParent<Canvas>();
            if (canvas != null)
            {
                Vector2 canvasSize = canvas.GetComponent<RectTransform>().sizeDelta;
                Vector2 tooltipSize = rect.sizeDelta;

                // Clamp to screen bounds
                tooltipPos.x = Mathf.Clamp(tooltipPos.x, 0, Screen.width - tooltipSize.x);
                tooltipPos.y = Mathf.Clamp(tooltipPos.y, tooltipSize.y, Screen.height);
            }

            rect.position = tooltipPos;
        }

        private string BuildStatsText(ItemData item)
        {
            var stats = new List<string>();

            if (item.hasWeaponStats)
            {
                stats.Add($"Type: {item.weaponStats.weaponType}");
                stats.Add($"Damage: {item.weaponStats.damage}");
                stats.Add($"Accuracy: {item.weaponStats.accuracy}%");

                if (item.weaponStats.range > 0)
                {
                    stats.Add($"Range: {item.weaponStats.range}");
                }

                if (item.weaponStats.clipSize > 0)
                {
                    stats.Add($"Ammo: {item.weaponStats.clipSize} ({item.weaponStats.ammoType})");
                }
            }

            if (item.hasArmorStats)
            {
                stats.Add($"Slot: {item.armorStats.slot}");
                stats.Add($"Defense: {item.armorStats.defense}");

                if (item.armorStats.movementPenalty > 0)
                {
                    stats.Add($"Move Penalty: {item.armorStats.movementPenalty * 100:F0}%");
                }
            }

            if (item.hasConsumableStats)
            {
                if (item.consumableStats.healAmount > 0)
                {
                    stats.Add($"Heals: {item.consumableStats.healAmount} HP");
                }

                if (item.consumableStats.staminaAmount > 0)
                {
                    stats.Add($"Stamina: +{item.consumableStats.staminaAmount}");
                }

                if (item.consumableStats.buffType != BuffType.None)
                {
                    stats.Add($"Buff: {item.consumableStats.buffType} ({item.consumableStats.buffDuration}s)");
                }
            }

            return string.Join("\n", stats);
        }

        #endregion

        #region Context Menu

        private void ShowContextMenu(InventorySlotUI slotUI)
        {
            if (contextMenuPanel == null || slotUI.Slot == null || slotUI.Slot.IsEmpty)
                return;

            var item = slotUI.Slot.ItemData;

            // Show/hide buttons based on item properties
            if (useButton != null)
            {
                useButton.gameObject.SetActive(item.usable);
            }

            if (equipButton != null)
            {
                bool canEquip = item.type == ItemType.Weapon || item.type == ItemType.Armor;
                equipButton.gameObject.SetActive(canEquip);
            }

            if (dropButton != null)
            {
                dropButton.gameObject.SetActive(item.droppable);
            }

            if (splitButton != null)
            {
                splitButton.gameObject.SetActive(item.stackable && slotUI.Slot.Quantity > 1);
            }

            if (bindQuickSlotButton != null)
            {
                bindQuickSlotButton.gameObject.SetActive(item.usable);
            }

            // Position near the slot
            var rect = contextMenuPanel.GetComponent<RectTransform>();
            if (rect != null)
            {
                rect.position = UnityEngine.Input.mousePosition;
            }

            contextMenuPanel.SetActive(true);
        }

        private void HideContextMenu()
        {
            if (contextMenuPanel != null)
            {
                contextMenuPanel.SetActive(false);
            }
        }

        private void OnContextMenuUse()
        {
            if (_selectedSlot?.Slot != null)
            {
                inventoryManager.UseItem(_selectedSlot.Slot);
                OnItemUsed?.Invoke(this, _selectedSlot.Slot);
                RefreshDisplay();
            }
            HideContextMenu();
        }

        private void OnContextMenuEquip()
        {
            if (_selectedSlot?.Slot != null && equipmentManager != null)
            {
                equipmentManager.EquipItem(_selectedSlot.Slot);
                RefreshDisplay();
            }
            HideContextMenu();
        }

        private void OnContextMenuDrop()
        {
            if (_selectedSlot?.Slot != null)
            {
                inventoryManager.DropItem(_selectedSlot.Slot);
                OnItemDropped?.Invoke(this, _selectedSlot.Slot);
                RefreshDisplay();
            }
            HideContextMenu();
        }

        private void OnContextMenuSplit()
        {
            if (_selectedSlot?.Slot != null && _selectedSlot.Slot.Quantity > 1)
            {
                int splitAmount = _selectedSlot.Slot.Quantity / 2;
                inventoryManager.SplitStack(_selectedSlot.SlotIndex, splitAmount);
                RefreshDisplay();
            }
            HideContextMenu();
        }

        private void OnContextMenuBindQuickSlot()
        {
            if (_selectedSlot?.Slot != null)
            {
                // Find first available quick slot
                for (int i = 0; i < inventoryManager.QuickSlotCount; i++)
                {
                    if (inventoryManager.GetQuickSlot(i) == null)
                    {
                        inventoryManager.BindToQuickSlot(_selectedSlot.Slot, i);
                        RefreshDisplay();
                        break;
                    }
                }
            }
            HideContextMenu();
        }

        #endregion

        #region Event Handlers

        private void HandleInventoryChanged(object sender, InventoryChangedEventArgs args)
        {
            RefreshDisplay();
        }

        #endregion

        #region Public API

        /// <summary>
        /// Show the inventory UI.
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
            RefreshDisplay();
        }

        /// <summary>
        /// Hide the inventory UI.
        /// </summary>
        public void Hide()
        {
            HideTooltip();
            HideContextMenu();
            gameObject.SetActive(false);
        }

        /// <summary>
        /// Toggle inventory visibility.
        /// </summary>
        public void Toggle()
        {
            if (gameObject.activeSelf)
                Hide();
            else
                Show();
        }

        /// <summary>
        /// Sort inventory and refresh display.
        /// </summary>
        public void SortInventory()
        {
            inventoryManager?.SortInventory();
            RefreshDisplay();
        }

        /// <summary>
        /// Consolidate stacks and refresh display.
        /// </summary>
        public void ConsolidateStacks()
        {
            inventoryManager?.ConsolidateStacks();
            RefreshDisplay();
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[InventoryUI] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[InventoryUI] {message}");
        }

        #endregion
    }
}
