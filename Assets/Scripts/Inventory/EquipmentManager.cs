using System;
using System.Collections.Generic;
using IronFrontier.Core;
using IronFrontier.Data;
using UnityEngine;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Event arguments for equipment changes.
    /// </summary>
    public class EquipmentChangedEventArgs : EventArgs
    {
        /// <summary>The slot that changed.</summary>
        public EquipmentSlot Slot { get; }

        /// <summary>The previously equipped item (null if none).</summary>
        public ItemData PreviousItem { get; }

        /// <summary>The newly equipped item (null if unequipped).</summary>
        public ItemData NewItem { get; }

        public EquipmentChangedEventArgs(EquipmentSlot slot, ItemData previousItem, ItemData newItem)
        {
            Slot = slot;
            PreviousItem = previousItem;
            NewItem = newItem;
        }
    }

    /// <summary>
    /// Calculated stat bonuses from equipped items.
    /// </summary>
    [Serializable]
    public struct EquipmentBonuses
    {
        public int damage;
        public int defense;
        public int accuracy;
        public float movementPenalty;
        public Dictionary<string, int> resistances;

        public static EquipmentBonuses Empty => new EquipmentBonuses
        {
            damage = 0,
            defense = 0,
            accuracy = 0,
            movementPenalty = 0f,
            resistances = new Dictionary<string, int>()
        };
    }

    /// <summary>
    /// Manages player equipment across all slots.
    /// Handles equipping, unequipping, and calculating stat bonuses.
    /// </summary>
    public class EquipmentManager : MonoBehaviour
    {
        #region Singleton

        private static EquipmentManager _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static EquipmentManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<EquipmentManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[EquipmentManager]");
                        _instance = go.AddComponent<EquipmentManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>
        /// Fired when equipment changes in any slot.
        /// </summary>
        public event EventHandler<EquipmentChangedEventArgs> OnEquipmentChanged;

        /// <summary>
        /// Fired when equipment bonuses are recalculated.
        /// </summary>
        public event EventHandler<EquipmentBonuses> OnBonusesChanged;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Reference to the inventory manager")]
        private InventoryManager inventoryManager;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private readonly Dictionary<EquipmentSlot, InventorySlot> _equippedItems =
            new Dictionary<EquipmentSlot, InventorySlot>();

        private EquipmentBonuses _cachedBonuses;
        private bool _bonusesDirty = true;

        #endregion

        #region Properties

        /// <summary>
        /// Currently equipped weapon.
        /// </summary>
        public ItemData EquippedWeapon => GetEquippedItem(EquipmentSlot.Weapon);

        /// <summary>
        /// Currently equipped offhand item.
        /// </summary>
        public ItemData EquippedOffhand => GetEquippedItem(EquipmentSlot.Offhand);

        /// <summary>
        /// Currently equipped head armor.
        /// </summary>
        public ItemData EquippedHead => GetEquippedItem(EquipmentSlot.Head);

        /// <summary>
        /// Currently equipped body armor.
        /// </summary>
        public ItemData EquippedBody => GetEquippedItem(EquipmentSlot.Body);

        /// <summary>
        /// Currently equipped leg armor.
        /// </summary>
        public ItemData EquippedLegs => GetEquippedItem(EquipmentSlot.Legs);

        /// <summary>
        /// Currently equipped foot armor.
        /// </summary>
        public ItemData EquippedFeet => GetEquippedItem(EquipmentSlot.Feet);

        /// <summary>
        /// Currently equipped accessory 1.
        /// </summary>
        public ItemData EquippedAccessory1 => GetEquippedItem(EquipmentSlot.Accessory1);

        /// <summary>
        /// Currently equipped accessory 2.
        /// </summary>
        public ItemData EquippedAccessory2 => GetEquippedItem(EquipmentSlot.Accessory2);

        /// <summary>
        /// Current equipment bonuses.
        /// </summary>
        public EquipmentBonuses Bonuses
        {
            get
            {
                if (_bonusesDirty)
                {
                    RecalculateBonuses();
                }
                return _cachedBonuses;
            }
        }

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

            InitializeSlots();
            Log("EquipmentManager initialized");
        }

        private void Start()
        {
            // Auto-find inventory manager if not assigned
            if (inventoryManager == null)
            {
                inventoryManager = InventoryManager.Instance;
            }
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

        private void InitializeSlots()
        {
            foreach (EquipmentSlot slot in Enum.GetValues(typeof(EquipmentSlot)))
            {
                _equippedItems[slot] = new InventorySlot();
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Get the item equipped in a specific slot.
        /// </summary>
        /// <param name="slot">The equipment slot.</param>
        /// <returns>The equipped item data, or null if empty.</returns>
        public ItemData GetEquippedItem(EquipmentSlot slot)
        {
            return _equippedItems.TryGetValue(slot, out var inventorySlot)
                ? inventorySlot.ItemData
                : null;
        }

        /// <summary>
        /// Get the full inventory slot for equipped item.
        /// </summary>
        /// <param name="slot">The equipment slot.</param>
        /// <returns>The inventory slot.</returns>
        public InventorySlot GetEquippedSlot(EquipmentSlot slot)
        {
            return _equippedItems.TryGetValue(slot, out var inventorySlot) ? inventorySlot : null;
        }

        /// <summary>
        /// Check if a slot has an item equipped.
        /// </summary>
        /// <param name="slot">The equipment slot.</param>
        /// <returns>True if the slot has an item.</returns>
        public bool IsSlotOccupied(EquipmentSlot slot)
        {
            return _equippedItems.TryGetValue(slot, out var inventorySlot) && !inventorySlot.IsEmpty;
        }

        /// <summary>
        /// Check if an item can be equipped.
        /// </summary>
        /// <param name="item">The item to check.</param>
        /// <param name="slot">Optional specific slot to check.</param>
        /// <returns>True if the item can be equipped.</returns>
        public bool CanEquip(ItemData item, EquipmentSlot? slot = null)
        {
            if (item == null)
                return false;

            // Determine valid slot for this item
            var targetSlot = slot ?? GetSlotForItem(item);
            if (targetSlot == null)
                return false;

            return true;
        }

        /// <summary>
        /// Equip an item from the inventory.
        /// </summary>
        /// <param name="inventorySlot">The inventory slot containing the item.</param>
        /// <param name="targetSlot">Optional specific slot to equip to.</param>
        /// <returns>True if equip was successful.</returns>
        public bool EquipItem(InventorySlot inventorySlot, EquipmentSlot? targetSlot = null)
        {
            if (inventorySlot == null || inventorySlot.IsEmpty)
            {
                LogWarning("Cannot equip empty slot");
                return false;
            }

            var item = inventorySlot.ItemData;
            var slot = targetSlot ?? GetSlotForItem(item);

            if (slot == null)
            {
                LogWarning($"No valid equipment slot for item: {item.displayName}");
                return false;
            }

            return EquipToSlot(inventorySlot, slot.Value);
        }

        /// <summary>
        /// Equip an item by ID.
        /// </summary>
        /// <param name="inventoryInstanceId">The inventory slot instance ID.</param>
        /// <param name="targetSlot">Optional specific slot to equip to.</param>
        /// <returns>True if equip was successful.</returns>
        public bool EquipItemById(string inventoryInstanceId, EquipmentSlot? targetSlot = null)
        {
            if (inventoryManager == null)
            {
                LogWarning("InventoryManager not available");
                return false;
            }

            var slot = inventoryManager.GetSlotByInstanceId(inventoryInstanceId);
            if (slot == null)
            {
                LogWarning($"Inventory slot not found: {inventoryInstanceId}");
                return false;
            }

            return EquipItem(slot, targetSlot);
        }

        /// <summary>
        /// Unequip an item from a slot, returning it to inventory.
        /// </summary>
        /// <param name="slot">The equipment slot to unequip.</param>
        /// <returns>True if unequip was successful.</returns>
        public bool UnequipItem(EquipmentSlot slot)
        {
            if (!_equippedItems.TryGetValue(slot, out var equippedSlot) || equippedSlot.IsEmpty)
            {
                Log($"Nothing equipped in slot: {slot}");
                return false;
            }

            var item = equippedSlot.ItemData;
            var quantity = equippedSlot.Quantity;
            var condition = equippedSlot.Condition;

            // Try to add back to inventory
            if (inventoryManager != null)
            {
                int added = inventoryManager.AddItem(item, quantity);
                if (added < quantity)
                {
                    LogWarning($"Inventory full, could not return all items. Lost {quantity - added}");
                }
            }

            // Clear the equipment slot
            var previousItem = item;
            equippedSlot.Clear();

            // Mark bonuses as dirty
            _bonusesDirty = true;

            // Notify listeners
            var args = new EquipmentChangedEventArgs(slot, previousItem, null);
            OnEquipmentChanged?.Invoke(this, args);

            // Publish to event bus
            EventBus.Instance?.Publish(GameEvents.ItemUnequipped, item.id);

            Log($"Unequipped {item.displayName} from {slot}");
            return true;
        }

        /// <summary>
        /// Unequip all items.
        /// </summary>
        public void UnequipAll()
        {
            foreach (EquipmentSlot slot in Enum.GetValues(typeof(EquipmentSlot)))
            {
                if (IsSlotOccupied(slot))
                {
                    UnequipItem(slot);
                }
            }

            Log("Unequipped all items");
        }

        /// <summary>
        /// Swap equipment between two slots.
        /// </summary>
        /// <param name="slot1">First slot.</param>
        /// <param name="slot2">Second slot.</param>
        /// <returns>True if swap was successful.</returns>
        public bool SwapEquipment(EquipmentSlot slot1, EquipmentSlot slot2)
        {
            if (!_equippedItems.TryGetValue(slot1, out var equipped1) ||
                !_equippedItems.TryGetValue(slot2, out var equipped2))
            {
                return false;
            }

            // Validate that items can go in swapped slots
            if (!equipped1.IsEmpty && GetSlotForItem(equipped1.ItemData) != slot2)
                return false;

            if (!equipped2.IsEmpty && GetSlotForItem(equipped2.ItemData) != slot1)
                return false;

            equipped1.SwapWith(equipped2);
            _bonusesDirty = true;

            Log($"Swapped equipment between {slot1} and {slot2}");
            return true;
        }

        /// <summary>
        /// Get the appropriate equipment slot for an item.
        /// </summary>
        /// <param name="item">The item to check.</param>
        /// <returns>The appropriate slot, or null if item cannot be equipped.</returns>
        public EquipmentSlot? GetSlotForItem(ItemData item)
        {
            if (item == null)
                return null;

            // Weapons
            if (item.type == ItemType.Weapon && item.hasWeaponStats)
            {
                return EquipmentSlot.Weapon;
            }

            // Armor
            if (item.type == ItemType.Armor && item.hasArmorStats)
            {
                return item.armorStats.slot switch
                {
                    ArmorSlot.Head => EquipmentSlot.Head,
                    ArmorSlot.Body => EquipmentSlot.Body,
                    ArmorSlot.Legs => EquipmentSlot.Legs,
                    ArmorSlot.Accessory => GetAvailableAccessorySlot(),
                    _ => null
                };
            }

            return null;
        }

        /// <summary>
        /// Get all equipped items.
        /// </summary>
        /// <returns>Dictionary of slot to item data.</returns>
        public Dictionary<EquipmentSlot, ItemData> GetAllEquipped()
        {
            var result = new Dictionary<EquipmentSlot, ItemData>();
            foreach (var kvp in _equippedItems)
            {
                if (!kvp.Value.IsEmpty)
                {
                    result[kvp.Key] = kvp.Value.ItemData;
                }
            }
            return result;
        }

        /// <summary>
        /// Get calculated equipment bonuses.
        /// </summary>
        /// <returns>Equipment bonuses struct.</returns>
        public EquipmentBonuses GetEquipmentBonuses()
        {
            if (_bonusesDirty)
            {
                RecalculateBonuses();
            }
            return _cachedBonuses;
        }

        /// <summary>
        /// Force recalculation of equipment bonuses.
        /// </summary>
        public void RefreshBonuses()
        {
            _bonusesDirty = true;
            RecalculateBonuses();
        }

        #endregion

        #region Private Methods

        private bool EquipToSlot(InventorySlot sourceSlot, EquipmentSlot targetSlot)
        {
            var item = sourceSlot.ItemData;

            // Get current equipped item if any
            var currentEquipped = _equippedItems[targetSlot];
            var previousItem = currentEquipped.ItemData;

            // If slot is occupied, unequip first
            if (!currentEquipped.IsEmpty)
            {
                // Return to inventory
                if (inventoryManager != null)
                {
                    inventoryManager.AddItem(currentEquipped.ItemData, currentEquipped.Quantity);
                }
            }

            // Move item to equipment slot
            _equippedItems[targetSlot] = sourceSlot.Clone();

            // Remove from source (inventory)
            if (inventoryManager != null)
            {
                inventoryManager.RemoveItem(sourceSlot.ItemData, sourceSlot.Quantity);
            }

            // Mark bonuses as dirty
            _bonusesDirty = true;

            // Notify listeners
            var args = new EquipmentChangedEventArgs(targetSlot, previousItem, item);
            OnEquipmentChanged?.Invoke(this, args);

            // Publish to event bus
            EventBus.Instance?.Publish(GameEvents.ItemEquipped, item.id);

            Log($"Equipped {item.displayName} to {targetSlot}");
            return true;
        }

        private EquipmentSlot? GetAvailableAccessorySlot()
        {
            if (!IsSlotOccupied(EquipmentSlot.Accessory1))
                return EquipmentSlot.Accessory1;

            if (!IsSlotOccupied(EquipmentSlot.Accessory2))
                return EquipmentSlot.Accessory2;

            return EquipmentSlot.Accessory1; // Default to replacing first accessory
        }

        private void RecalculateBonuses()
        {
            var bonuses = EquipmentBonuses.Empty;
            bonuses.resistances = new Dictionary<string, int>();

            foreach (var kvp in _equippedItems)
            {
                var slot = kvp.Value;
                if (slot.IsEmpty)
                    continue;

                var item = slot.ItemData;

                // Weapon bonuses
                if (item.hasWeaponStats)
                {
                    bonuses.damage += item.weaponStats.damage;
                    bonuses.accuracy += item.weaponStats.accuracy;
                }

                // Armor bonuses
                if (item.hasArmorStats)
                {
                    bonuses.defense += item.armorStats.defense;
                    bonuses.movementPenalty += item.armorStats.movementPenalty;

                    // Resistances
                    if (item.armorStats.resistances != null)
                    {
                        foreach (var resistance in item.armorStats.resistances)
                        {
                            if (!bonuses.resistances.ContainsKey(resistance.type))
                            {
                                bonuses.resistances[resistance.type] = 0;
                            }
                            bonuses.resistances[resistance.type] += resistance.value;
                        }
                    }
                }
            }

            _cachedBonuses = bonuses;
            _bonusesDirty = false;

            OnBonusesChanged?.Invoke(this, bonuses);
            Log($"Recalculated bonuses: Damage={bonuses.damage}, Defense={bonuses.defense}, Accuracy={bonuses.accuracy}");
        }

        #endregion

        #region Serialization

        /// <summary>
        /// Serializable equipment state for saving.
        /// </summary>
        [Serializable]
        public struct SerializedEquipmentState
        {
            public InventorySlot.SerializedData weapon;
            public InventorySlot.SerializedData offhand;
            public InventorySlot.SerializedData head;
            public InventorySlot.SerializedData body;
            public InventorySlot.SerializedData legs;
            public InventorySlot.SerializedData feet;
            public InventorySlot.SerializedData accessory1;
            public InventorySlot.SerializedData accessory2;
        }

        /// <summary>
        /// Get serialized equipment state.
        /// </summary>
        public SerializedEquipmentState GetSerializedState()
        {
            return new SerializedEquipmentState
            {
                weapon = _equippedItems[EquipmentSlot.Weapon].GetSerializedData(),
                offhand = _equippedItems[EquipmentSlot.Offhand].GetSerializedData(),
                head = _equippedItems[EquipmentSlot.Head].GetSerializedData(),
                body = _equippedItems[EquipmentSlot.Body].GetSerializedData(),
                legs = _equippedItems[EquipmentSlot.Legs].GetSerializedData(),
                feet = _equippedItems[EquipmentSlot.Feet].GetSerializedData(),
                accessory1 = _equippedItems[EquipmentSlot.Accessory1].GetSerializedData(),
                accessory2 = _equippedItems[EquipmentSlot.Accessory2].GetSerializedData()
            };
        }

        /// <summary>
        /// Restore equipment from serialized state.
        /// </summary>
        /// <param name="state">Serialized state.</param>
        /// <param name="database">Item database for lookup.</param>
        public void RestoreFromSerializedState(SerializedEquipmentState state, ItemDatabase database)
        {
            _equippedItems[EquipmentSlot.Weapon].RestoreFromSerializedData(state.weapon, database);
            _equippedItems[EquipmentSlot.Offhand].RestoreFromSerializedData(state.offhand, database);
            _equippedItems[EquipmentSlot.Head].RestoreFromSerializedData(state.head, database);
            _equippedItems[EquipmentSlot.Body].RestoreFromSerializedData(state.body, database);
            _equippedItems[EquipmentSlot.Legs].RestoreFromSerializedData(state.legs, database);
            _equippedItems[EquipmentSlot.Feet].RestoreFromSerializedData(state.feet, database);
            _equippedItems[EquipmentSlot.Accessory1].RestoreFromSerializedData(state.accessory1, database);
            _equippedItems[EquipmentSlot.Accessory2].RestoreFromSerializedData(state.accessory2, database);

            _bonusesDirty = true;
            RecalculateBonuses();

            Log("Restored equipment from serialized state");
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[EquipmentManager] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[EquipmentManager] {message}");
        }

        #endregion
    }
}
