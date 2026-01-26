using System;
using IronFrontier.Data;
using UnityEngine;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Represents a single inventory slot that can hold an item stack.
    /// </summary>
    [Serializable]
    public class InventorySlot
    {
        #region Serialized Fields

        [SerializeField]
        private ItemData _itemData;

        [SerializeField]
        private int _quantity;

        [SerializeField]
        private int _quickSlotIndex = -1;

        [SerializeField]
        private float _condition = 1f;

        [SerializeField]
        private string _instanceId;

        #endregion

        #region Properties

        /// <summary>
        /// The item data stored in this slot.
        /// </summary>
        public ItemData ItemData => _itemData;

        /// <summary>
        /// The item ID, or null if empty.
        /// </summary>
        public string ItemId => _itemData?.id;

        /// <summary>
        /// The quantity of items in this slot.
        /// </summary>
        public int Quantity => _quantity;

        /// <summary>
        /// Quick slot binding index (-1 = not bound).
        /// </summary>
        public int QuickSlotIndex
        {
            get => _quickSlotIndex;
            set => _quickSlotIndex = Mathf.Clamp(value, -1, 9);
        }

        /// <summary>
        /// Item condition (0-1, where 1 is pristine).
        /// </summary>
        public float Condition
        {
            get => _condition;
            set => _condition = Mathf.Clamp01(value);
        }

        /// <summary>
        /// Unique instance ID for this slot (for tracking specific items).
        /// </summary>
        public string InstanceId => _instanceId;

        /// <summary>
        /// Whether this slot is empty.
        /// </summary>
        public bool IsEmpty => _itemData == null || _quantity <= 0;

        /// <summary>
        /// Whether this slot has reached its max stack size.
        /// </summary>
        public bool IsFull => _itemData != null && _quantity >= _itemData.maxStack;

        /// <summary>
        /// The total weight of items in this slot.
        /// </summary>
        public float TotalWeight => _itemData != null ? _itemData.weight * _quantity : 0f;

        /// <summary>
        /// The total value of items in this slot.
        /// </summary>
        public int TotalValue => _itemData != null ? _itemData.value * _quantity : 0;

        /// <summary>
        /// Space remaining in this stack.
        /// </summary>
        public int SpaceRemaining => _itemData != null ? _itemData.maxStack - _quantity : 0;

        #endregion

        #region Constructors

        /// <summary>
        /// Create an empty inventory slot.
        /// </summary>
        public InventorySlot()
        {
            _itemData = null;
            _quantity = 0;
            _quickSlotIndex = -1;
            _condition = 1f;
            _instanceId = GenerateInstanceId();
        }

        /// <summary>
        /// Create an inventory slot with an item.
        /// </summary>
        /// <param name="itemData">The item to store.</param>
        /// <param name="quantity">The quantity of items.</param>
        /// <param name="condition">The item condition (0-1).</param>
        public InventorySlot(ItemData itemData, int quantity = 1, float condition = 1f)
        {
            _itemData = itemData;
            _quantity = itemData != null ? Mathf.Clamp(quantity, 0, itemData.maxStack) : 0;
            _quickSlotIndex = -1;
            _condition = Mathf.Clamp01(condition);
            _instanceId = GenerateInstanceId();
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Set the item in this slot.
        /// </summary>
        /// <param name="itemData">The item data.</param>
        /// <param name="quantity">The quantity.</param>
        public void SetItem(ItemData itemData, int quantity = 1)
        {
            _itemData = itemData;
            _quantity = itemData != null ? Mathf.Clamp(quantity, 1, itemData.maxStack) : 0;
            _condition = 1f;
            _instanceId = GenerateInstanceId();
        }

        /// <summary>
        /// Add items to this slot.
        /// </summary>
        /// <param name="amount">Amount to add.</param>
        /// <returns>Amount that could not be added (overflow).</returns>
        public int AddQuantity(int amount)
        {
            if (_itemData == null || amount <= 0)
                return amount;

            int spaceAvailable = _itemData.maxStack - _quantity;
            int toAdd = Mathf.Min(amount, spaceAvailable);
            _quantity += toAdd;

            return amount - toAdd;
        }

        /// <summary>
        /// Remove items from this slot.
        /// </summary>
        /// <param name="amount">Amount to remove.</param>
        /// <returns>Amount actually removed.</returns>
        public int RemoveQuantity(int amount)
        {
            if (_itemData == null || amount <= 0)
                return 0;

            int toRemove = Mathf.Min(amount, _quantity);
            _quantity -= toRemove;

            if (_quantity <= 0)
            {
                Clear();
            }

            return toRemove;
        }

        /// <summary>
        /// Check if a specific amount can be removed.
        /// </summary>
        /// <param name="amount">Amount to check.</param>
        /// <returns>True if the amount can be removed.</returns>
        public bool CanRemove(int amount)
        {
            return _quantity >= amount;
        }

        /// <summary>
        /// Check if another item can be stacked in this slot.
        /// </summary>
        /// <param name="item">Item to check.</param>
        /// <returns>True if the item can be stacked here.</returns>
        public bool CanStackWith(ItemData item)
        {
            if (_itemData == null || item == null)
                return false;

            return _itemData.id == item.id &&
                   _itemData.stackable &&
                   _quantity < _itemData.maxStack;
        }

        /// <summary>
        /// Check if this slot can accept a specific quantity of an item.
        /// </summary>
        /// <param name="item">Item to check.</param>
        /// <param name="quantity">Quantity to add.</param>
        /// <returns>True if all items can fit.</returns>
        public bool CanAccept(ItemData item, int quantity)
        {
            if (IsEmpty)
                return quantity <= item.maxStack;

            if (!CanStackWith(item))
                return false;

            return SpaceRemaining >= quantity;
        }

        /// <summary>
        /// Clear this slot.
        /// </summary>
        public void Clear()
        {
            _itemData = null;
            _quantity = 0;
            _quickSlotIndex = -1;
            _condition = 1f;
            _instanceId = GenerateInstanceId();
        }

        /// <summary>
        /// Split this stack, returning a new slot with the split items.
        /// </summary>
        /// <param name="splitAmount">Amount to split off.</param>
        /// <returns>New slot with split items, or null if split failed.</returns>
        public InventorySlot Split(int splitAmount)
        {
            if (_itemData == null || splitAmount <= 0 || splitAmount >= _quantity)
                return null;

            InventorySlot newSlot = new InventorySlot(_itemData, splitAmount, _condition);
            _quantity -= splitAmount;

            return newSlot;
        }

        /// <summary>
        /// Merge another slot into this one.
        /// </summary>
        /// <param name="other">Slot to merge from.</param>
        /// <returns>True if merge was successful.</returns>
        public bool MergeFrom(InventorySlot other)
        {
            if (other == null || other.IsEmpty)
                return false;

            if (IsEmpty)
            {
                SetItem(other.ItemData, other.Quantity);
                _condition = other.Condition;
                other.Clear();
                return true;
            }

            if (!CanStackWith(other.ItemData))
                return false;

            int overflow = AddQuantity(other.Quantity);
            if (overflow > 0)
            {
                other._quantity = overflow;
            }
            else
            {
                other.Clear();
            }

            return true;
        }

        /// <summary>
        /// Swap contents with another slot.
        /// </summary>
        /// <param name="other">Slot to swap with.</param>
        public void SwapWith(InventorySlot other)
        {
            if (other == null)
                return;

            (other._itemData, _itemData) = (_itemData, other._itemData);
            (other._quantity, _quantity) = (_quantity, other._quantity);
            (other._condition, _condition) = (_condition, other._condition);
            (other._quickSlotIndex, _quickSlotIndex) = (_quickSlotIndex, other._quickSlotIndex);
            (other._instanceId, _instanceId) = (_instanceId, other._instanceId);
        }

        /// <summary>
        /// Create a copy of this slot.
        /// </summary>
        /// <returns>A new slot with the same contents.</returns>
        public InventorySlot Clone()
        {
            return new InventorySlot(_itemData, _quantity, _condition)
            {
                _quickSlotIndex = _quickSlotIndex,
                _instanceId = _instanceId
            };
        }

        /// <summary>
        /// Degrade the item condition.
        /// </summary>
        /// <param name="amount">Amount to degrade (0-1).</param>
        public void DegradeCondition(float amount)
        {
            _condition = Mathf.Max(0f, _condition - amount);
        }

        /// <summary>
        /// Repair the item condition.
        /// </summary>
        /// <param name="amount">Amount to repair (0-1).</param>
        public void RepairCondition(float amount)
        {
            _condition = Mathf.Min(1f, _condition + amount);
        }

        public override string ToString()
        {
            if (IsEmpty)
                return "[Empty Slot]";

            return $"[{_itemData.displayName} x{_quantity}]";
        }

        #endregion

        #region Private Methods

        private static string GenerateInstanceId()
        {
            return Guid.NewGuid().ToString("N")[..8];
        }

        #endregion

        #region Serialization Support

        /// <summary>
        /// Serializable data for saving/loading.
        /// </summary>
        [Serializable]
        public struct SerializedData
        {
            public string itemId;
            public int quantity;
            public int quickSlotIndex;
            public float condition;
            public string instanceId;
        }

        /// <summary>
        /// Get serializable data for this slot.
        /// </summary>
        public SerializedData GetSerializedData()
        {
            return new SerializedData
            {
                itemId = _itemData?.id ?? string.Empty,
                quantity = _quantity,
                quickSlotIndex = _quickSlotIndex,
                condition = _condition,
                instanceId = _instanceId
            };
        }

        /// <summary>
        /// Restore from serialized data.
        /// </summary>
        /// <param name="data">Serialized data.</param>
        /// <param name="database">Item database for lookup.</param>
        public void RestoreFromSerializedData(SerializedData data, ItemDatabase database)
        {
            if (database != null && !string.IsNullOrEmpty(data.itemId))
            {
                _itemData = database.GetItemById(data.itemId);
            }
            else
            {
                _itemData = null;
            }

            _quantity = data.quantity;
            _quickSlotIndex = data.quickSlotIndex;
            _condition = data.condition;
            _instanceId = data.instanceId;
        }

        #endregion
    }
}
