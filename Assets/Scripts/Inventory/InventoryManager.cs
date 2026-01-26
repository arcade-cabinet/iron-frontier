using System;
using System.Collections.Generic;
using System.Linq;
using IronFrontier.Core;
using IronFrontier.Data;
using UnityEngine;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Event arguments for inventory changes.
    /// </summary>
    public class InventoryChangedEventArgs : EventArgs
    {
        /// <summary>The item that changed.</summary>
        public ItemData Item { get; }

        /// <summary>Quantity added (positive) or removed (negative).</summary>
        public int QuantityChange { get; }

        /// <summary>Type of change.</summary>
        public InventoryChangeType ChangeType { get; }

        public InventoryChangedEventArgs(ItemData item, int quantityChange, InventoryChangeType changeType)
        {
            Item = item;
            QuantityChange = quantityChange;
            ChangeType = changeType;
        }
    }

    /// <summary>
    /// Types of inventory changes.
    /// </summary>
    public enum InventoryChangeType
    {
        Added,
        Removed,
        Used,
        Dropped,
        Equipped,
        Sold,
        Bought
    }

    /// <summary>
    /// Result of an inventory operation.
    /// </summary>
    public enum InventoryOperationResult
    {
        Success,
        InventoryFull,
        WeightLimitExceeded,
        ItemNotFound,
        InsufficientQuantity,
        ItemNotUsable,
        ItemNotDroppable
    }

    /// <summary>
    /// Singleton inventory manager that handles all inventory operations.
    /// Supports adding/removing items, stack management, weight limits, and category filtering.
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        #region Singleton

        private static InventoryManager _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static InventoryManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<InventoryManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[InventoryManager]");
                        _instance = go.AddComponent<InventoryManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>
        /// Fired when inventory changes.
        /// </summary>
        public event EventHandler<InventoryChangedEventArgs> OnInventoryChanged;

        /// <summary>
        /// Fired when inventory is full.
        /// </summary>
        public event EventHandler OnInventoryFull;

        /// <summary>
        /// Fired when weight limit is exceeded.
        /// </summary>
        public event EventHandler<float> OnWeightLimitExceeded;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Maximum number of inventory slots")]
        private int maxSlots = 40;

        [SerializeField]
        [Tooltip("Maximum carry weight in pounds")]
        private float maxCarryWeight = 100f;

        [SerializeField]
        [Tooltip("Number of quick slots available")]
        private int quickSlotCount = 10;

        [Header("References")]
        [SerializeField]
        [Tooltip("Item database reference")]
        private ItemDatabase itemDatabase;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private readonly List<InventorySlot> _slots = new List<InventorySlot>();
        private readonly Dictionary<int, InventorySlot> _quickSlots = new Dictionary<int, InventorySlot>();
        private float _currentWeight = 0f;
        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>
        /// Maximum inventory slots.
        /// </summary>
        public int MaxSlots => maxSlots;

        /// <summary>
        /// Number of used slots.
        /// </summary>
        public int UsedSlots => _slots.Count(s => !s.IsEmpty);

        /// <summary>
        /// Number of available slots.
        /// </summary>
        public int AvailableSlots => maxSlots - UsedSlots;

        /// <summary>
        /// Maximum carry weight.
        /// </summary>
        public float MaxCarryWeight => maxCarryWeight;

        /// <summary>
        /// Current total weight.
        /// </summary>
        public float CurrentWeight => _currentWeight;

        /// <summary>
        /// Available carry weight.
        /// </summary>
        public float AvailableWeight => maxCarryWeight - _currentWeight;

        /// <summary>
        /// Whether inventory is full.
        /// </summary>
        public bool IsFull => UsedSlots >= maxSlots;

        /// <summary>
        /// Whether weight limit is exceeded.
        /// </summary>
        public bool IsOverweight => _currentWeight > maxCarryWeight;

        /// <summary>
        /// All inventory slots.
        /// </summary>
        public IReadOnlyList<InventorySlot> Slots => _slots;

        /// <summary>
        /// Number of quick slots.
        /// </summary>
        public int QuickSlotCount => quickSlotCount;

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
        /// Initialize the inventory system.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized)
                return;

            // Initialize slots
            _slots.Clear();
            for (int i = 0; i < maxSlots; i++)
            {
                _slots.Add(new InventorySlot());
            }

            // Initialize quick slots
            _quickSlots.Clear();
            for (int i = 0; i < quickSlotCount; i++)
            {
                _quickSlots[i] = null;
            }

            // Auto-find item database
            if (itemDatabase == null)
            {
                itemDatabase = ItemDatabase.Instance;
            }

            _currentWeight = 0f;
            _isInitialized = true;

            Log("InventoryManager initialized");
        }

        #endregion

        #region Add Items

        /// <summary>
        /// Add an item to the inventory.
        /// </summary>
        /// <param name="item">The item to add.</param>
        /// <param name="quantity">Quantity to add.</param>
        /// <returns>Number of items actually added.</returns>
        public int AddItem(ItemData item, int quantity = 1)
        {
            if (item == null || quantity <= 0)
                return 0;

            // Check weight limit
            float additionalWeight = item.weight * quantity;
            if (_currentWeight + additionalWeight > maxCarryWeight)
            {
                // Calculate how many we can fit by weight
                int maxByWeight = Mathf.FloorToInt(AvailableWeight / item.weight);
                if (maxByWeight <= 0)
                {
                    OnWeightLimitExceeded?.Invoke(this, additionalWeight);
                    LogWarning($"Cannot add {item.displayName}: weight limit exceeded");
                    return 0;
                }
                quantity = Mathf.Min(quantity, maxByWeight);
            }

            int remaining = quantity;
            int totalAdded = 0;

            // First, try to stack with existing items
            if (item.stackable)
            {
                foreach (var slot in _slots)
                {
                    if (remaining <= 0)
                        break;

                    if (slot.CanStackWith(item))
                    {
                        int overflow = slot.AddQuantity(remaining);
                        int added = remaining - overflow;
                        remaining = overflow;
                        totalAdded += added;
                    }
                }
            }

            // Then, use empty slots
            while (remaining > 0)
            {
                var emptySlot = _slots.FirstOrDefault(s => s.IsEmpty);
                if (emptySlot == null)
                {
                    OnInventoryFull?.Invoke(this, EventArgs.Empty);
                    LogWarning($"Inventory full, could not add {remaining} {item.displayName}");
                    break;
                }

                int toAdd = Mathf.Min(remaining, item.maxStack);
                emptySlot.SetItem(item, toAdd);
                remaining -= toAdd;
                totalAdded += toAdd;
            }

            if (totalAdded > 0)
            {
                RecalculateWeight();
                NotifyInventoryChanged(item, totalAdded, InventoryChangeType.Added);
                Log($"Added {totalAdded}x {item.displayName}");
            }

            return totalAdded;
        }

        /// <summary>
        /// Add an item by ID.
        /// </summary>
        /// <param name="itemId">The item ID.</param>
        /// <param name="quantity">Quantity to add.</param>
        /// <returns>Number of items actually added.</returns>
        public int AddItemById(string itemId, int quantity = 1)
        {
            if (itemDatabase == null)
            {
                LogWarning("ItemDatabase not available");
                return 0;
            }

            var item = itemDatabase.GetItemById(itemId);
            if (item == null)
            {
                LogWarning($"Item not found: {itemId}");
                return 0;
            }

            return AddItem(item, quantity);
        }

        #endregion

        #region Remove Items

        /// <summary>
        /// Remove an item from the inventory.
        /// </summary>
        /// <param name="item">The item to remove.</param>
        /// <param name="quantity">Quantity to remove.</param>
        /// <returns>Number of items actually removed.</returns>
        public int RemoveItem(ItemData item, int quantity = 1)
        {
            if (item == null || quantity <= 0)
                return 0;

            int remaining = quantity;
            int totalRemoved = 0;

            // Remove from slots (prefer partial stacks first)
            var slotsWithItem = _slots
                .Where(s => !s.IsEmpty && s.ItemData.id == item.id)
                .OrderBy(s => s.Quantity)
                .ToList();

            foreach (var slot in slotsWithItem)
            {
                if (remaining <= 0)
                    break;

                int removed = slot.RemoveQuantity(remaining);
                remaining -= removed;
                totalRemoved += removed;
            }

            if (totalRemoved > 0)
            {
                RecalculateWeight();
                NotifyInventoryChanged(item, -totalRemoved, InventoryChangeType.Removed);
                Log($"Removed {totalRemoved}x {item.displayName}");
            }

            return totalRemoved;
        }

        /// <summary>
        /// Remove an item by ID.
        /// </summary>
        /// <param name="itemId">The item ID.</param>
        /// <param name="quantity">Quantity to remove.</param>
        /// <returns>Number of items actually removed.</returns>
        public int RemoveItemById(string itemId, int quantity = 1)
        {
            if (itemDatabase == null)
            {
                LogWarning("ItemDatabase not available");
                return 0;
            }

            var item = itemDatabase.GetItemById(itemId);
            if (item == null)
            {
                LogWarning($"Item not found: {itemId}");
                return 0;
            }

            return RemoveItem(item, quantity);
        }

        /// <summary>
        /// Remove all items of a specific type.
        /// </summary>
        /// <param name="item">The item to remove.</param>
        /// <returns>Total quantity removed.</returns>
        public int RemoveAllOfItem(ItemData item)
        {
            int count = GetItemCount(item);
            if (count > 0)
            {
                return RemoveItem(item, count);
            }
            return 0;
        }

        #endregion

        #region Use Items

        /// <summary>
        /// Use a consumable item.
        /// </summary>
        /// <param name="slot">The inventory slot containing the item.</param>
        /// <returns>Result of the operation.</returns>
        public InventoryOperationResult UseItem(InventorySlot slot)
        {
            if (slot == null || slot.IsEmpty)
                return InventoryOperationResult.ItemNotFound;

            var item = slot.ItemData;

            if (!item.usable)
                return InventoryOperationResult.ItemNotUsable;

            // Apply item effects
            ApplyItemEffects(item);

            // Remove one item
            slot.RemoveQuantity(1);
            RecalculateWeight();

            NotifyInventoryChanged(item, -1, InventoryChangeType.Used);
            EventBus.Instance?.Publish(GameEvents.ItemUsed, item.id);

            Log($"Used {item.displayName}");
            return InventoryOperationResult.Success;
        }

        /// <summary>
        /// Use an item by slot index.
        /// </summary>
        /// <param name="slotIndex">The slot index.</param>
        /// <returns>Result of the operation.</returns>
        public InventoryOperationResult UseItemAtSlot(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= _slots.Count)
                return InventoryOperationResult.ItemNotFound;

            return UseItem(_slots[slotIndex]);
        }

        private void ApplyItemEffects(ItemData item)
        {
            if (item.effects == null || item.effects.Count == 0)
                return;

            foreach (var effect in item.effects)
            {
                switch (effect.type)
                {
                    case EffectType.Heal:
                        EventBus.Instance?.Publish<int>(GameEvents.PlayerHealed, effect.value);
                        break;

                    case EffectType.Stamina:
                        // Handled by player stats system
                        break;

                    case EffectType.Buff:
                        // Apply buff through combat/status system
                        break;

                    case EffectType.Cure:
                        // Remove status effects
                        break;
                }
            }

            // Apply consumable stats if present
            if (item.hasConsumableStats)
            {
                if (item.consumableStats.healAmount > 0)
                {
                    EventBus.Instance?.Publish<int>(GameEvents.PlayerHealed, item.consumableStats.healAmount);
                }
            }
        }

        #endregion

        #region Drop Items

        /// <summary>
        /// Drop an item from the inventory.
        /// </summary>
        /// <param name="slot">The inventory slot.</param>
        /// <param name="quantity">Quantity to drop.</param>
        /// <returns>Result of the operation.</returns>
        public InventoryOperationResult DropItem(InventorySlot slot, int quantity = 1)
        {
            if (slot == null || slot.IsEmpty)
                return InventoryOperationResult.ItemNotFound;

            var item = slot.ItemData;

            if (!item.droppable)
                return InventoryOperationResult.ItemNotDroppable;

            if (slot.Quantity < quantity)
                return InventoryOperationResult.InsufficientQuantity;

            // Remove from inventory
            slot.RemoveQuantity(quantity);
            RecalculateWeight();

            NotifyInventoryChanged(item, -quantity, InventoryChangeType.Dropped);

            // TODO: Spawn world item at player position

            Log($"Dropped {quantity}x {item.displayName}");
            return InventoryOperationResult.Success;
        }

        #endregion

        #region Query Methods

        /// <summary>
        /// Get the total count of a specific item.
        /// </summary>
        /// <param name="item">The item to count.</param>
        /// <returns>Total quantity.</returns>
        public int GetItemCount(ItemData item)
        {
            if (item == null)
                return 0;

            return _slots
                .Where(s => !s.IsEmpty && s.ItemData.id == item.id)
                .Sum(s => s.Quantity);
        }

        /// <summary>
        /// Get the total count of an item by ID.
        /// </summary>
        /// <param name="itemId">The item ID.</param>
        /// <returns>Total quantity.</returns>
        public int GetItemCountById(string itemId)
        {
            return _slots
                .Where(s => !s.IsEmpty && s.ItemData.id == itemId)
                .Sum(s => s.Quantity);
        }

        /// <summary>
        /// Check if the inventory contains an item.
        /// </summary>
        /// <param name="item">The item to check.</param>
        /// <param name="quantity">Minimum quantity required.</param>
        /// <returns>True if the item exists with sufficient quantity.</returns>
        public bool HasItem(ItemData item, int quantity = 1)
        {
            return GetItemCount(item) >= quantity;
        }

        /// <summary>
        /// Check if the inventory contains an item by ID.
        /// </summary>
        /// <param name="itemId">The item ID.</param>
        /// <param name="quantity">Minimum quantity required.</param>
        /// <returns>True if the item exists with sufficient quantity.</returns>
        public bool HasItemById(string itemId, int quantity = 1)
        {
            return GetItemCountById(itemId) >= quantity;
        }

        /// <summary>
        /// Get a slot by its instance ID.
        /// </summary>
        /// <param name="instanceId">The instance ID.</param>
        /// <returns>The slot, or null if not found.</returns>
        public InventorySlot GetSlotByInstanceId(string instanceId)
        {
            return _slots.FirstOrDefault(s => s.InstanceId == instanceId);
        }

        /// <summary>
        /// Get all items of a specific type.
        /// </summary>
        /// <param name="type">The item type.</param>
        /// <returns>List of matching slots.</returns>
        public List<InventorySlot> GetItemsByType(ItemType type)
        {
            return _slots
                .Where(s => !s.IsEmpty && s.ItemData.type == type)
                .ToList();
        }

        /// <summary>
        /// Get all items with a specific tag.
        /// </summary>
        /// <param name="tag">The tag to search.</param>
        /// <returns>List of matching slots.</returns>
        public List<InventorySlot> GetItemsByTag(string tag)
        {
            return _slots
                .Where(s => !s.IsEmpty && s.ItemData.HasTag(tag))
                .ToList();
        }

        /// <summary>
        /// Get all usable items.
        /// </summary>
        /// <returns>List of usable item slots.</returns>
        public List<InventorySlot> GetUsableItems()
        {
            return _slots
                .Where(s => !s.IsEmpty && s.ItemData.usable)
                .ToList();
        }

        /// <summary>
        /// Get all weapons.
        /// </summary>
        /// <returns>List of weapon slots.</returns>
        public List<InventorySlot> GetWeapons()
        {
            return GetItemsByType(ItemType.Weapon);
        }

        /// <summary>
        /// Get all armor.
        /// </summary>
        /// <returns>List of armor slots.</returns>
        public List<InventorySlot> GetArmor()
        {
            return GetItemsByType(ItemType.Armor);
        }

        /// <summary>
        /// Get all consumables.
        /// </summary>
        /// <returns>List of consumable slots.</returns>
        public List<InventorySlot> GetConsumables()
        {
            return GetItemsByType(ItemType.Consumable);
        }

        /// <summary>
        /// Get all key items.
        /// </summary>
        /// <returns>List of key item slots.</returns>
        public List<InventorySlot> GetKeyItems()
        {
            return GetItemsByType(ItemType.KeyItem);
        }

        #endregion

        #region Quick Slots

        /// <summary>
        /// Bind a slot to a quick slot.
        /// </summary>
        /// <param name="slot">The inventory slot.</param>
        /// <param name="quickSlotIndex">Quick slot index (0-9).</param>
        public void BindToQuickSlot(InventorySlot slot, int quickSlotIndex)
        {
            if (quickSlotIndex < 0 || quickSlotIndex >= quickSlotCount)
                return;

            // Unbind any existing slot from this quick slot
            var existingSlot = _quickSlots[quickSlotIndex];
            if (existingSlot != null)
            {
                existingSlot.QuickSlotIndex = -1;
            }

            // Unbind the slot from its previous quick slot
            if (slot.QuickSlotIndex >= 0)
            {
                _quickSlots[slot.QuickSlotIndex] = null;
            }

            // Bind to new quick slot
            slot.QuickSlotIndex = quickSlotIndex;
            _quickSlots[quickSlotIndex] = slot;

            Log($"Bound {slot.ItemData?.displayName ?? "empty"} to quick slot {quickSlotIndex}");
        }

        /// <summary>
        /// Unbind a quick slot.
        /// </summary>
        /// <param name="quickSlotIndex">Quick slot index.</param>
        public void UnbindQuickSlot(int quickSlotIndex)
        {
            if (quickSlotIndex < 0 || quickSlotIndex >= quickSlotCount)
                return;

            var slot = _quickSlots[quickSlotIndex];
            if (slot != null)
            {
                slot.QuickSlotIndex = -1;
                _quickSlots[quickSlotIndex] = null;
            }
        }

        /// <summary>
        /// Get the slot bound to a quick slot.
        /// </summary>
        /// <param name="quickSlotIndex">Quick slot index.</param>
        /// <returns>The bound slot, or null.</returns>
        public InventorySlot GetQuickSlot(int quickSlotIndex)
        {
            if (quickSlotIndex < 0 || quickSlotIndex >= quickSlotCount)
                return null;

            return _quickSlots.TryGetValue(quickSlotIndex, out var slot) ? slot : null;
        }

        /// <summary>
        /// Use an item from a quick slot.
        /// </summary>
        /// <param name="quickSlotIndex">Quick slot index.</param>
        /// <returns>Result of the operation.</returns>
        public InventoryOperationResult UseQuickSlot(int quickSlotIndex)
        {
            var slot = GetQuickSlot(quickSlotIndex);
            if (slot == null || slot.IsEmpty)
                return InventoryOperationResult.ItemNotFound;

            return UseItem(slot);
        }

        #endregion

        #region Slot Management

        /// <summary>
        /// Swap two inventory slots.
        /// </summary>
        /// <param name="slotIndex1">First slot index.</param>
        /// <param name="slotIndex2">Second slot index.</param>
        public void SwapSlots(int slotIndex1, int slotIndex2)
        {
            if (slotIndex1 < 0 || slotIndex1 >= _slots.Count ||
                slotIndex2 < 0 || slotIndex2 >= _slots.Count)
                return;

            _slots[slotIndex1].SwapWith(_slots[slotIndex2]);
            Log($"Swapped slots {slotIndex1} and {slotIndex2}");
        }

        /// <summary>
        /// Split a stack in a slot.
        /// </summary>
        /// <param name="slotIndex">Source slot index.</param>
        /// <param name="splitAmount">Amount to split off.</param>
        /// <returns>True if split was successful.</returns>
        public bool SplitStack(int slotIndex, int splitAmount)
        {
            if (slotIndex < 0 || slotIndex >= _slots.Count)
                return false;

            var sourceSlot = _slots[slotIndex];
            if (sourceSlot.IsEmpty || sourceSlot.Quantity <= splitAmount)
                return false;

            // Find an empty slot
            var emptySlot = _slots.FirstOrDefault(s => s.IsEmpty);
            if (emptySlot == null)
            {
                LogWarning("No empty slot for split stack");
                return false;
            }

            var newSlot = sourceSlot.Split(splitAmount);
            if (newSlot != null)
            {
                emptySlot.MergeFrom(newSlot);
                Log($"Split {splitAmount} from slot {slotIndex}");
                return true;
            }

            return false;
        }

        /// <summary>
        /// Merge stacks where possible to consolidate inventory.
        /// </summary>
        public void ConsolidateStacks()
        {
            var itemGroups = _slots
                .Where(s => !s.IsEmpty && s.ItemData.stackable && !s.IsFull)
                .GroupBy(s => s.ItemData.id);

            foreach (var group in itemGroups)
            {
                var slots = group.OrderByDescending(s => s.Quantity).ToList();
                for (int i = 0; i < slots.Count - 1; i++)
                {
                    for (int j = slots.Count - 1; j > i; j--)
                    {
                        if (!slots[i].IsFull && !slots[j].IsEmpty)
                        {
                            slots[i].MergeFrom(slots[j]);
                        }
                    }
                }
            }

            Log("Consolidated inventory stacks");
        }

        /// <summary>
        /// Sort inventory by type, then rarity, then name.
        /// </summary>
        public void SortInventory()
        {
            var sortedItems = _slots
                .Where(s => !s.IsEmpty)
                .OrderBy(s => s.ItemData.type)
                .ThenByDescending(s => s.ItemData.rarity)
                .ThenBy(s => s.ItemData.displayName)
                .Select(s => s.Clone())
                .ToList();

            // Clear all slots
            foreach (var slot in _slots)
            {
                slot.Clear();
            }

            // Repopulate sorted
            for (int i = 0; i < sortedItems.Count && i < _slots.Count; i++)
            {
                _slots[i].MergeFrom(sortedItems[i]);
            }

            Log("Sorted inventory");
        }

        /// <summary>
        /// Clear the entire inventory.
        /// </summary>
        public void ClearAll()
        {
            foreach (var slot in _slots)
            {
                slot.Clear();
            }

            foreach (var key in _quickSlots.Keys.ToList())
            {
                _quickSlots[key] = null;
            }

            _currentWeight = 0f;
            Log("Cleared all inventory");
        }

        #endregion

        #region Weight Management

        /// <summary>
        /// Set the maximum carry weight.
        /// </summary>
        /// <param name="weight">New maximum weight.</param>
        public void SetMaxCarryWeight(float weight)
        {
            maxCarryWeight = Mathf.Max(0f, weight);
            Log($"Max carry weight set to {maxCarryWeight}");
        }

        /// <summary>
        /// Add bonus carry weight capacity.
        /// </summary>
        /// <param name="bonus">Bonus weight to add.</param>
        public void AddCarryWeightBonus(float bonus)
        {
            maxCarryWeight += bonus;
            Log($"Carry weight bonus added: {bonus}, new max: {maxCarryWeight}");
        }

        private void RecalculateWeight()
        {
            _currentWeight = _slots.Sum(s => s.TotalWeight);
        }

        #endregion

        #region Value Calculation

        /// <summary>
        /// Get the total value of all items.
        /// </summary>
        /// <returns>Total value.</returns>
        public int GetTotalValue()
        {
            return _slots.Sum(s => s.TotalValue);
        }

        /// <summary>
        /// Get the total value of sellable items.
        /// </summary>
        /// <returns>Total sellable value.</returns>
        public int GetSellableValue()
        {
            return _slots
                .Where(s => !s.IsEmpty && s.ItemData.sellable)
                .Sum(s => s.TotalValue);
        }

        #endregion

        #region Serialization

        /// <summary>
        /// Serializable inventory state.
        /// </summary>
        [Serializable]
        public struct SerializedInventoryState
        {
            public InventorySlot.SerializedData[] slots;
            public int[] quickSlotBindings;
            public int maxSlots;
            public float maxCarryWeight;
        }

        /// <summary>
        /// Get serialized inventory state.
        /// </summary>
        public SerializedInventoryState GetSerializedState()
        {
            var state = new SerializedInventoryState
            {
                slots = _slots.Select(s => s.GetSerializedData()).ToArray(),
                quickSlotBindings = new int[quickSlotCount],
                maxSlots = maxSlots,
                maxCarryWeight = maxCarryWeight
            };

            for (int i = 0; i < quickSlotCount; i++)
            {
                state.quickSlotBindings[i] = _quickSlots.TryGetValue(i, out var slot) && slot != null
                    ? _slots.IndexOf(slot)
                    : -1;
            }

            return state;
        }

        /// <summary>
        /// Restore inventory from serialized state.
        /// </summary>
        /// <param name="state">Serialized state.</param>
        /// <param name="database">Item database for lookup.</param>
        public void RestoreFromSerializedState(SerializedInventoryState state, ItemDatabase database)
        {
            // Restore slots
            for (int i = 0; i < state.slots.Length && i < _slots.Count; i++)
            {
                _slots[i].RestoreFromSerializedData(state.slots[i], database);
            }

            // Restore quick slot bindings
            for (int i = 0; i < state.quickSlotBindings.Length && i < quickSlotCount; i++)
            {
                int slotIndex = state.quickSlotBindings[i];
                if (slotIndex >= 0 && slotIndex < _slots.Count)
                {
                    BindToQuickSlot(_slots[slotIndex], i);
                }
            }

            maxSlots = state.maxSlots;
            maxCarryWeight = state.maxCarryWeight;
            RecalculateWeight();

            Log("Restored inventory from serialized state");
        }

        #endregion

        #region Notifications

        private void NotifyInventoryChanged(ItemData item, int quantityChange, InventoryChangeType changeType)
        {
            var args = new InventoryChangedEventArgs(item, quantityChange, changeType);
            OnInventoryChanged?.Invoke(this, args);

            // Publish to event bus
            string eventType = quantityChange > 0 ? GameEvents.ItemAdded : GameEvents.ItemRemoved;
            EventBus.Instance?.Publish(eventType, item.id);
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[InventoryManager] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[InventoryManager] {message}");
        }

        #endregion
    }
}
