using System;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using UnityEngine;

namespace IronFrontier.Tests.EditMode
{
    /// <summary>
    /// Inventory Management Unit Tests
    ///
    /// Tests for the inventory system including:
    /// - Adding and removing items
    /// - Item stacking
    /// - Equipment slots
    /// - Item usage (consumables)
    /// - Quick slots
    /// - Weight management
    /// - Category filtering
    ///
    /// Ported from TypeScript reference: InventoryController.ts, gameStore.test.ts
    /// </summary>
    [TestFixture]
    [Category("Inventory")]
    public class InventoryTests
    {
        private InventoryController _inventoryController;
        private MockInventoryDataAccess _mockDataAccess;

        [SetUp]
        public void SetUp()
        {
            _mockDataAccess = new MockInventoryDataAccess();
            _inventoryController = new InventoryController(_mockDataAccess, maxSlots: 30, maxWeight: 100f);
        }

        [TearDown]
        public void TearDown()
        {
            _inventoryController.Dispose();
        }

        #region Add Item Tests

        [Test]
        public void AddItem_ShouldReturnTrueForValidItem()
        {
            // Act
            bool added = _inventoryController.AddItem("healing_potion", 1);

            // Assert
            Assert.IsTrue(added);
        }

        [Test]
        public void AddItem_ShouldAddToInventory()
        {
            // Act
            _inventoryController.AddItem("healing_potion", 3);

            // Assert
            Assert.IsTrue(_inventoryController.HasItem("healing_potion", 3));
        }

        [Test]
        public void AddItem_ShouldReturnFalseForUnknownItem()
        {
            // Act
            bool added = _inventoryController.AddItem("unknown_item", 1);

            // Assert
            Assert.IsFalse(added);
        }

        [Test]
        public void AddItem_ShouldUpdateWeight()
        {
            // Act
            _inventoryController.AddItem("iron_ore", 5);
            var weightInfo = _inventoryController.GetWeightInfo();

            // Assert - iron_ore weighs 1.0 per unit
            Assert.AreEqual(5f, weightInfo.Current);
        }

        [Test]
        public void AddItem_ShouldFailWhenOverWeight()
        {
            // Arrange - Add items up to max weight
            _inventoryController.AddItem("iron_ore", 100); // 100 weight

            // Act
            bool added = _inventoryController.AddItem("iron_ore", 1);

            // Assert
            Assert.IsFalse(added);
        }

        #endregion

        #region Item Stacking Tests

        [Test]
        public void AddItem_ShouldStackIdenticalItems()
        {
            // Act
            _inventoryController.AddItem("healing_potion", 5);
            _inventoryController.AddItem("healing_potion", 3);

            // Assert
            Assert.AreEqual(8, _inventoryController.GetItemCount("healing_potion"));
        }

        [Test]
        public void AddItem_ShouldNotExceedMaxStack()
        {
            // Arrange - healing_potion has maxStack of 10
            _inventoryController.AddItem("healing_potion", 10);

            // Act - Try to add more to the same stack
            _inventoryController.AddItem("healing_potion", 5);

            // Assert - Should create new stack
            var state = _inventoryController.GetState();
            Assert.AreEqual(15, _inventoryController.GetItemCount("healing_potion"));
            Assert.AreEqual(2, state.Items.Count); // Two stacks
        }

        [Test]
        public void AddItem_NonStackable_ShouldCreateSeparateEntries()
        {
            // Arrange - weapons typically don't stack
            _inventoryController.AddItem("revolver", 1);

            // Act
            _inventoryController.AddItem("revolver", 1);

            // Assert
            var state = _inventoryController.GetState();
            Assert.AreEqual(2, state.Items.Count(i => i.ItemId == "revolver"));
        }

        #endregion

        #region Remove Item Tests

        [Test]
        public void RemoveItem_ShouldReturnTrueWhenSuccessful()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 5);

            // Act
            bool removed = _inventoryController.RemoveItem("healing_potion", 3);

            // Assert
            Assert.IsTrue(removed);
        }

        [Test]
        public void RemoveItem_ShouldReduceQuantity()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 5);

            // Act
            _inventoryController.RemoveItem("healing_potion", 2);

            // Assert
            Assert.AreEqual(3, _inventoryController.GetItemCount("healing_potion"));
        }

        [Test]
        public void RemoveItem_ShouldReturnFalseWhenNotEnough()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 3);

            // Act
            bool removed = _inventoryController.RemoveItem("healing_potion", 5);

            // Assert
            Assert.IsFalse(removed);
        }

        [Test]
        public void RemoveItem_ShouldRemoveItemEntirelyWhenQuantityReachesZero()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 3);

            // Act
            _inventoryController.RemoveItem("healing_potion", 3);

            // Assert
            Assert.IsFalse(_inventoryController.HasItem("healing_potion"));
        }

        [Test]
        public void RemoveItem_ShouldUpdateWeight()
        {
            // Arrange
            _inventoryController.AddItem("iron_ore", 10);
            var initialWeight = _inventoryController.GetWeightInfo().Current;

            // Act
            _inventoryController.RemoveItem("iron_ore", 4);
            var finalWeight = _inventoryController.GetWeightInfo().Current;

            // Assert
            Assert.AreEqual(6f, finalWeight);
        }

        #endregion

        #region Use Item Tests

        [Test]
        public void UseItem_ShouldConsumeConsumableItem()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 3);

            // Act
            bool used = _inventoryController.UseItem("healing_potion");

            // Assert
            Assert.IsTrue(used);
            Assert.AreEqual(2, _inventoryController.GetItemCount("healing_potion"));
        }

        [Test]
        public void UseItem_ShouldApplyEffects()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);

            // Act
            _inventoryController.UseItem("healing_potion");

            // Assert
            Assert.IsTrue(_mockDataAccess.EffectsApplied);
        }

        [Test]
        public void UseItem_ShouldReturnFalseForNonConsumable()
        {
            // Arrange
            _inventoryController.AddItem("revolver", 1);

            // Act
            bool used = _inventoryController.UseItem("revolver");

            // Assert
            Assert.IsFalse(used);
        }

        [Test]
        public void UseItem_ShouldReturnFalseWhenItemNotFound()
        {
            // Act
            bool used = _inventoryController.UseItem("nonexistent");

            // Assert
            Assert.IsFalse(used);
        }

        #endregion

        #region Equipment Tests

        [Test]
        public void EquipItem_ShouldReturnTrueForEquippableItem()
        {
            // Arrange
            _inventoryController.AddItem("leather_armor", 1);

            // Act
            bool equipped = _inventoryController.EquipItem("leather_armor");

            // Assert
            Assert.IsTrue(equipped);
        }

        [Test]
        public void EquipItem_ShouldSetCorrectSlot()
        {
            // Arrange
            _inventoryController.AddItem("leather_armor", 1);

            // Act
            _inventoryController.EquipItem("leather_armor");
            var state = _inventoryController.GetState();

            // Assert
            Assert.AreEqual("leather_armor", state.Equipment.Body);
        }

        [Test]
        public void EquipItem_ShouldReturnFalseForNonEquippableItem()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);

            // Act
            bool equipped = _inventoryController.EquipItem("healing_potion");

            // Assert
            Assert.IsFalse(equipped);
        }

        [Test]
        public void UnequipSlot_ShouldClearSlot()
        {
            // Arrange
            _inventoryController.AddItem("leather_armor", 1);
            _inventoryController.EquipItem("leather_armor");

            // Act
            bool unequipped = _inventoryController.UnequipSlot(EquipmentSlot.Body);
            var state = _inventoryController.GetState();

            // Assert
            Assert.IsTrue(unequipped);
            Assert.IsNull(state.Equipment.Body);
        }

        [Test]
        public void GetEquipmentStats_ShouldSumAllEquippedStats()
        {
            // Arrange
            _inventoryController.AddItem("leather_armor", 1);
            _inventoryController.AddItem("iron_helmet", 1);
            _inventoryController.EquipItem("leather_armor");
            _inventoryController.EquipItem("iron_helmet");

            // Act
            var stats = _inventoryController.GetEquipmentStats();

            // Assert - leather_armor: 5 defense, iron_helmet: 3 defense
            Assert.AreEqual(8, stats.Defense);
        }

        #endregion

        #region Quick Slot Tests

        [Test]
        public void SetQuickSlot_ShouldAssignConsumableItem()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);

            // Act
            bool set = _inventoryController.SetQuickSlot(0, "healing_potion");

            // Assert
            Assert.IsTrue(set);
        }

        [Test]
        public void SetQuickSlot_ShouldRejectNonConsumable()
        {
            // Arrange
            _inventoryController.AddItem("revolver", 1);

            // Act
            bool set = _inventoryController.SetQuickSlot(0, "revolver");

            // Assert
            Assert.IsFalse(set);
        }

        [Test]
        public void UseQuickSlot_ShouldUseAssignedItem()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 3);
            _inventoryController.SetQuickSlot(0, "healing_potion");

            // Act
            bool used = _inventoryController.UseQuickSlot(0);

            // Assert
            Assert.IsTrue(used);
            Assert.AreEqual(2, _inventoryController.GetItemCount("healing_potion"));
        }

        [Test]
        public void UseQuickSlot_ShouldReturnFalseForEmptySlot()
        {
            // Act
            bool used = _inventoryController.UseQuickSlot(0);

            // Assert
            Assert.IsFalse(used);
        }

        [Test]
        public void RemoveItem_ShouldClearFromQuickSlotWhenEmpty()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);
            _inventoryController.SetQuickSlot(0, "healing_potion");

            // Act
            _inventoryController.RemoveItem("healing_potion", 1);
            var state = _inventoryController.GetState();

            // Assert
            Assert.IsNull(state.QuickSlots[0]);
        }

        #endregion

        #region Category Filtering Tests

        [Test]
        public void GetItemsByCategory_ShouldReturnFilteredItems()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);
            _inventoryController.AddItem("revolver", 1);
            _inventoryController.AddItem("iron_ore", 5);

            // Act
            var consumables = _inventoryController.GetItemsByCategory(ItemCategory.Consumable);

            // Assert
            Assert.AreEqual(1, consumables.Count);
            Assert.AreEqual("healing_potion", consumables[0].ItemId);
        }

        [Test]
        public void SetCategory_ShouldUpdateSelectedCategory()
        {
            // Act
            _inventoryController.SetCategory(ItemCategory.Weapon);
            var state = _inventoryController.GetState();

            // Assert
            Assert.AreEqual(ItemCategory.Weapon, state.SelectedCategory);
        }

        [Test]
        public void GetFilteredItems_ShouldRespectCategoryFilter()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);
            _inventoryController.AddItem("revolver", 1);
            _inventoryController.SetCategory(ItemCategory.Weapon);

            // Act
            var filtered = _inventoryController.GetFilteredItems();

            // Assert
            Assert.AreEqual(1, filtered.Count);
            Assert.AreEqual("revolver", filtered[0].ItemId);
        }

        #endregion

        #region Weight Tests

        [Test]
        public void GetWeightInfo_ShouldReturnCorrectValues()
        {
            // Arrange
            _inventoryController.AddItem("iron_ore", 50); // 50 weight

            // Act
            var info = _inventoryController.GetWeightInfo();

            // Assert
            Assert.AreEqual(50f, info.Current);
            Assert.AreEqual(100f, info.Max);
            Assert.AreEqual(50f, info.Percent);
        }

        [Test]
        public void AddItem_ShouldEmitInventoryFullEventWhenOverWeight()
        {
            // Arrange
            InventoryEvent capturedEvent = null;
            _inventoryController.OnEvent += (e) => capturedEvent = e;
            _inventoryController.AddItem("iron_ore", 100);

            // Act
            _inventoryController.AddItem("iron_ore", 1);

            // Assert
            Assert.IsNotNull(capturedEvent);
            Assert.AreEqual(InventoryEventType.InventoryFull, capturedEvent.Type);
        }

        #endregion

        #region Event Emission Tests

        [Test]
        public void AddItem_ShouldEmitItemAddedEvent()
        {
            // Arrange
            InventoryEvent capturedEvent = null;
            _inventoryController.OnEvent += (e) => capturedEvent = e;

            // Act
            _inventoryController.AddItem("healing_potion", 3);

            // Assert
            Assert.IsNotNull(capturedEvent);
            Assert.AreEqual(InventoryEventType.ItemAdded, capturedEvent.Type);
            Assert.AreEqual("healing_potion", capturedEvent.ItemId);
            Assert.AreEqual(3, capturedEvent.Quantity);
        }

        [Test]
        public void RemoveItem_ShouldEmitItemRemovedEvent()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 5);
            InventoryEvent capturedEvent = null;
            _inventoryController.OnEvent += (e) => capturedEvent = e;

            // Act
            _inventoryController.RemoveItem("healing_potion", 2);

            // Assert
            Assert.IsNotNull(capturedEvent);
            Assert.AreEqual(InventoryEventType.ItemRemoved, capturedEvent.Type);
        }

        [Test]
        public void UseItem_ShouldEmitItemUsedEvent()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 1);
            var events = new List<InventoryEvent>();
            _inventoryController.OnEvent += (e) => events.Add(e);

            // Act
            _inventoryController.UseItem("healing_potion");

            // Assert
            Assert.IsTrue(events.Any(e => e.Type == InventoryEventType.ItemUsed));
        }

        [Test]
        public void EquipItem_ShouldEmitItemEquippedEvent()
        {
            // Arrange
            _inventoryController.AddItem("leather_armor", 1);
            InventoryEvent capturedEvent = null;
            _inventoryController.OnEvent += (e) => capturedEvent = e;

            // Act
            _inventoryController.EquipItem("leather_armor");

            // Assert
            Assert.IsNotNull(capturedEvent);
            Assert.AreEqual(InventoryEventType.ItemEquipped, capturedEvent.Type);
        }

        #endregion

        #region Save/Load Tests

        [Test]
        public void GetSaveData_ShouldIncludeAllItems()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 5);
            _inventoryController.AddItem("revolver", 1);

            // Act
            var saveData = _inventoryController.GetSaveData();

            // Assert
            Assert.AreEqual(2, saveData.Items.Count);
        }

        [Test]
        public void GetSaveData_ShouldIncludeEquipment()
        {
            // Arrange
            _inventoryController.AddItem("leather_armor", 1);
            _inventoryController.EquipItem("leather_armor");

            // Act
            var saveData = _inventoryController.GetSaveData();

            // Assert
            Assert.AreEqual("leather_armor", saveData.Equipment.Body);
        }

        [Test]
        public void LoadFromSave_ShouldRestoreItems()
        {
            // Arrange
            var saveData = new InventorySaveData
            {
                Items = new List<ItemSaveEntry>
                {
                    new ItemSaveEntry { ItemId = "healing_potion", Quantity = 3 },
                    new ItemSaveEntry { ItemId = "revolver", Quantity = 1 }
                },
                Equipment = new EquipmentState(),
                QuickSlots = new List<string> { null, null, null, null }
            };

            // Act
            _inventoryController.LoadFromSave(saveData);

            // Assert
            Assert.IsTrue(_inventoryController.HasItem("healing_potion", 3));
            Assert.IsTrue(_inventoryController.HasItem("revolver", 1));
        }

        #endregion

        #region Has Item Tests

        [Test]
        public void HasItem_ShouldReturnTrueWhenHasEnough()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 5);

            // Assert
            Assert.IsTrue(_inventoryController.HasItem("healing_potion", 1));
            Assert.IsTrue(_inventoryController.HasItem("healing_potion", 5));
        }

        [Test]
        public void HasItem_ShouldReturnFalseWhenNotEnough()
        {
            // Arrange
            _inventoryController.AddItem("healing_potion", 3);

            // Assert
            Assert.IsFalse(_inventoryController.HasItem("healing_potion", 5));
        }

        [Test]
        public void HasItem_ShouldReturnFalseForMissingItem()
        {
            // Assert
            Assert.IsFalse(_inventoryController.HasItem("nonexistent"));
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Inventory controller for managing player items
    /// </summary>
    public class InventoryController
    {
        private InventoryControllerState _state;
        private readonly IInventoryDataAccess _dataAccess;

        public event Action<InventoryEvent> OnEvent;

        public InventoryController(IInventoryDataAccess dataAccess, int maxSlots = 30, float maxWeight = 100f)
        {
            _dataAccess = dataAccess;
            _state = new InventoryControllerState
            {
                Items = new List<InventoryItem>(),
                Equipment = new EquipmentState(),
                QuickSlots = new List<string> { null, null, null, null },
                MaxSlots = maxSlots,
                CurrentWeight = 0f,
                MaxWeight = maxWeight,
                SelectedCategory = null
            };
        }

        public bool AddItem(string itemId, int quantity = 1)
        {
            var definition = _dataAccess.GetItemDefinition(itemId);
            if (definition == null) return false;

            float additionalWeight = definition.Weight * quantity;
            if (_state.CurrentWeight + additionalWeight > _state.MaxWeight)
            {
                OnEvent?.Invoke(new InventoryEvent { Type = InventoryEventType.InventoryFull });
                return false;
            }

            var existing = _state.Items.Find(i => i.ItemId == itemId && i.Quantity < i.MaxStack);
            if (existing != null && definition.MaxStack > 1)
            {
                int canAdd = Mathf.Min(quantity, existing.MaxStack - existing.Quantity);
                existing.Quantity += canAdd;
                int remainder = quantity - canAdd;

                if (remainder > 0 && _state.Items.Count < _state.MaxSlots)
                {
                    _state.Items.Add(CreateItemFromDefinition(definition, remainder));
                }
            }
            else if (_state.Items.Count < _state.MaxSlots)
            {
                _state.Items.Add(CreateItemFromDefinition(definition, quantity));
            }
            else
            {
                OnEvent?.Invoke(new InventoryEvent { Type = InventoryEventType.InventoryFull });
                return false;
            }

            _state.CurrentWeight += additionalWeight;
            int newTotal = GetItemCount(itemId);
            OnEvent?.Invoke(new InventoryEvent
            {
                Type = InventoryEventType.ItemAdded,
                ItemId = itemId,
                Quantity = quantity,
                NewTotal = newTotal
            });

            return true;
        }

        private InventoryItem CreateItemFromDefinition(ItemDefinition def, int quantity)
        {
            return new InventoryItem
            {
                ItemId = def.ItemId,
                Name = def.Name,
                Description = def.Description,
                Category = def.Category,
                Quantity = quantity,
                MaxStack = def.MaxStack,
                Value = def.Value,
                Weight = def.Weight,
                IsEquippable = def.IsEquippable,
                IsConsumable = def.IsConsumable,
                IsQuestItem = def.IsQuestItem,
                EquipSlot = def.EquipSlot,
                Effects = def.Effects
            };
        }

        public bool RemoveItem(string itemId, int quantity = 1)
        {
            var item = _state.Items.Find(i => i.ItemId == itemId);
            if (item == null || item.Quantity < quantity) return false;

            item.Quantity -= quantity;
            _state.CurrentWeight -= item.Weight * quantity;

            if (item.Quantity <= 0)
            {
                _state.Items.Remove(item);
                // Clear from quick slots
                for (int i = 0; i < _state.QuickSlots.Count; i++)
                {
                    if (_state.QuickSlots[i] == itemId)
                        _state.QuickSlots[i] = null;
                }
            }

            int newTotal = GetItemCount(itemId);
            OnEvent?.Invoke(new InventoryEvent
            {
                Type = InventoryEventType.ItemRemoved,
                ItemId = itemId,
                Quantity = quantity,
                NewTotal = newTotal
            });

            return true;
        }

        public bool UseItem(string itemId)
        {
            var item = _state.Items.Find(i => i.ItemId == itemId);
            if (item == null || !item.IsConsumable) return false;

            if (item.Effects != null && item.Effects.Count > 0)
            {
                _dataAccess.ApplyItemEffects(item.Effects);
                OnEvent?.Invoke(new InventoryEvent
                {
                    Type = InventoryEventType.ItemUsed,
                    ItemId = itemId,
                    Effects = item.Effects
                });
            }

            RemoveItem(itemId, 1);
            return true;
        }

        public bool EquipItem(string itemId)
        {
            var item = _state.Items.Find(i => i.ItemId == itemId);
            if (item == null || !item.IsEquippable || !item.EquipSlot.HasValue) return false;

            var slot = item.EquipSlot.Value;
            string previousItemId = GetEquippedInSlot(slot);
            SetEquippedInSlot(slot, itemId);

            OnEvent?.Invoke(new InventoryEvent
            {
                Type = InventoryEventType.ItemEquipped,
                ItemId = itemId,
                Slot = slot,
                PreviousItemId = previousItemId
            });

            return true;
        }

        public bool UnequipSlot(EquipmentSlot slot)
        {
            string itemId = GetEquippedInSlot(slot);
            if (string.IsNullOrEmpty(itemId)) return false;

            SetEquippedInSlot(slot, null);
            OnEvent?.Invoke(new InventoryEvent
            {
                Type = InventoryEventType.ItemUnequipped,
                ItemId = itemId,
                Slot = slot
            });

            return true;
        }

        private string GetEquippedInSlot(EquipmentSlot slot)
        {
            return slot switch
            {
                EquipmentSlot.MainHand => _state.Equipment.MainHand,
                EquipmentSlot.OffHand => _state.Equipment.OffHand,
                EquipmentSlot.Head => _state.Equipment.Head,
                EquipmentSlot.Body => _state.Equipment.Body,
                EquipmentSlot.Legs => _state.Equipment.Legs,
                EquipmentSlot.Accessory1 => _state.Equipment.Accessory1,
                EquipmentSlot.Accessory2 => _state.Equipment.Accessory2,
                _ => null
            };
        }

        private void SetEquippedInSlot(EquipmentSlot slot, string itemId)
        {
            switch (slot)
            {
                case EquipmentSlot.MainHand: _state.Equipment.MainHand = itemId; break;
                case EquipmentSlot.OffHand: _state.Equipment.OffHand = itemId; break;
                case EquipmentSlot.Head: _state.Equipment.Head = itemId; break;
                case EquipmentSlot.Body: _state.Equipment.Body = itemId; break;
                case EquipmentSlot.Legs: _state.Equipment.Legs = itemId; break;
                case EquipmentSlot.Accessory1: _state.Equipment.Accessory1 = itemId; break;
                case EquipmentSlot.Accessory2: _state.Equipment.Accessory2 = itemId; break;
            }
        }

        public bool SetQuickSlot(int slotIndex, string itemId)
        {
            if (slotIndex < 0 || slotIndex >= _state.QuickSlots.Count) return false;

            if (!string.IsNullOrEmpty(itemId))
            {
                var item = _state.Items.Find(i => i.ItemId == itemId);
                if (item == null || !item.IsConsumable) return false;
            }

            _state.QuickSlots[slotIndex] = itemId;
            OnEvent?.Invoke(new InventoryEvent
            {
                Type = InventoryEventType.QuickSlotSet,
                SlotIndex = slotIndex,
                ItemId = itemId
            });

            return true;
        }

        public bool UseQuickSlot(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= _state.QuickSlots.Count) return false;
            string itemId = _state.QuickSlots[slotIndex];
            if (string.IsNullOrEmpty(itemId)) return false;
            return UseItem(itemId);
        }

        public int GetItemCount(string itemId)
        {
            return _state.Items.Where(i => i.ItemId == itemId).Sum(i => i.Quantity);
        }

        public bool HasItem(string itemId, int quantity = 1)
        {
            return GetItemCount(itemId) >= quantity;
        }

        public List<InventoryItem> GetItemsByCategory(ItemCategory category)
        {
            return _state.Items.Where(i => i.Category == category).ToList();
        }

        public void SetCategory(ItemCategory? category)
        {
            _state.SelectedCategory = category;
        }

        public List<InventoryItem> GetFilteredItems()
        {
            if (!_state.SelectedCategory.HasValue) return _state.Items.ToList();
            return GetItemsByCategory(_state.SelectedCategory.Value);
        }

        public EquipmentStats GetEquipmentStats()
        {
            var stats = new EquipmentStats();
            var equippedItems = new[]
            {
                _state.Equipment.MainHand, _state.Equipment.OffHand,
                _state.Equipment.Head, _state.Equipment.Body,
                _state.Equipment.Legs, _state.Equipment.Accessory1,
                _state.Equipment.Accessory2
            };

            foreach (var itemId in equippedItems)
            {
                if (!string.IsNullOrEmpty(itemId))
                {
                    var itemStats = _dataAccess.GetEquipmentStats(itemId);
                    if (itemStats != null)
                    {
                        stats.Attack += itemStats.Attack;
                        stats.Defense += itemStats.Defense;
                        stats.Speed += itemStats.Speed;
                    }
                }
            }

            return stats;
        }

        public WeightInfo GetWeightInfo()
        {
            return new WeightInfo
            {
                Current = _state.CurrentWeight,
                Max = _state.MaxWeight,
                Percent = (_state.CurrentWeight / _state.MaxWeight) * 100f
            };
        }

        public InventoryControllerState GetState()
        {
            return new InventoryControllerState
            {
                Items = _state.Items.ToList(),
                Equipment = new EquipmentState
                {
                    MainHand = _state.Equipment.MainHand,
                    OffHand = _state.Equipment.OffHand,
                    Head = _state.Equipment.Head,
                    Body = _state.Equipment.Body,
                    Legs = _state.Equipment.Legs,
                    Accessory1 = _state.Equipment.Accessory1,
                    Accessory2 = _state.Equipment.Accessory2
                },
                QuickSlots = _state.QuickSlots.ToList(),
                MaxSlots = _state.MaxSlots,
                CurrentWeight = _state.CurrentWeight,
                MaxWeight = _state.MaxWeight,
                SelectedCategory = _state.SelectedCategory
            };
        }

        public InventorySaveData GetSaveData()
        {
            return new InventorySaveData
            {
                Items = _state.Items.Select(i => new ItemSaveEntry { ItemId = i.ItemId, Quantity = i.Quantity }).ToList(),
                Equipment = new EquipmentState
                {
                    MainHand = _state.Equipment.MainHand,
                    OffHand = _state.Equipment.OffHand,
                    Head = _state.Equipment.Head,
                    Body = _state.Equipment.Body,
                    Legs = _state.Equipment.Legs,
                    Accessory1 = _state.Equipment.Accessory1,
                    Accessory2 = _state.Equipment.Accessory2
                },
                QuickSlots = _state.QuickSlots.ToList()
            };
        }

        public void LoadFromSave(InventorySaveData data)
        {
            _state.Items.Clear();
            _state.CurrentWeight = 0f;

            foreach (var entry in data.Items)
            {
                AddItem(entry.ItemId, entry.Quantity);
            }

            _state.Equipment = new EquipmentState
            {
                MainHand = data.Equipment.MainHand,
                OffHand = data.Equipment.OffHand,
                Head = data.Equipment.Head,
                Body = data.Equipment.Body,
                Legs = data.Equipment.Legs,
                Accessory1 = data.Equipment.Accessory1,
                Accessory2 = data.Equipment.Accessory2
            };
            _state.QuickSlots = data.QuickSlots.ToList();
        }

        public void Dispose()
        {
            OnEvent = null;
        }
    }

    public interface IInventoryDataAccess
    {
        ItemDefinition GetItemDefinition(string itemId);
        void ApplyItemEffects(List<ItemEffect> effects);
        EquipmentStats GetEquipmentStats(string itemId);
    }

    public class MockInventoryDataAccess : IInventoryDataAccess
    {
        public bool EffectsApplied { get; private set; }

        public ItemDefinition GetItemDefinition(string itemId)
        {
            return itemId switch
            {
                "healing_potion" => new ItemDefinition
                {
                    ItemId = "healing_potion",
                    Name = "Healing Potion",
                    Description = "Restores health",
                    Category = ItemCategory.Consumable,
                    MaxStack = 10,
                    Value = 25,
                    Weight = 0.5f,
                    IsEquippable = false,
                    IsConsumable = true,
                    IsQuestItem = false,
                    Effects = new List<ItemEffect> { new ItemEffect { Type = ItemEffectType.HealHP, Value = 30 } }
                },
                "iron_ore" => new ItemDefinition
                {
                    ItemId = "iron_ore",
                    Name = "Iron Ore",
                    Description = "Raw iron ore",
                    Category = ItemCategory.Material,
                    MaxStack = 99,
                    Value = 5,
                    Weight = 1.0f,
                    IsEquippable = false,
                    IsConsumable = false,
                    IsQuestItem = false
                },
                "revolver" => new ItemDefinition
                {
                    ItemId = "revolver",
                    Name = "Revolver",
                    Description = "A trusty six-shooter",
                    Category = ItemCategory.Weapon,
                    MaxStack = 1,
                    Value = 100,
                    Weight = 2.0f,
                    IsEquippable = true,
                    IsConsumable = false,
                    IsQuestItem = false,
                    EquipSlot = EquipmentSlot.MainHand
                },
                "leather_armor" => new ItemDefinition
                {
                    ItemId = "leather_armor",
                    Name = "Leather Armor",
                    Description = "Basic protection",
                    Category = ItemCategory.Armor,
                    MaxStack = 1,
                    Value = 75,
                    Weight = 5.0f,
                    IsEquippable = true,
                    IsConsumable = false,
                    IsQuestItem = false,
                    EquipSlot = EquipmentSlot.Body
                },
                "iron_helmet" => new ItemDefinition
                {
                    ItemId = "iron_helmet",
                    Name = "Iron Helmet",
                    Description = "Sturdy head protection",
                    Category = ItemCategory.Armor,
                    MaxStack = 1,
                    Value = 50,
                    Weight = 3.0f,
                    IsEquippable = true,
                    IsConsumable = false,
                    IsQuestItem = false,
                    EquipSlot = EquipmentSlot.Head
                },
                _ => null
            };
        }

        public void ApplyItemEffects(List<ItemEffect> effects)
        {
            EffectsApplied = true;
        }

        public EquipmentStats GetEquipmentStats(string itemId)
        {
            return itemId switch
            {
                "revolver" => new EquipmentStats { Attack = 15 },
                "leather_armor" => new EquipmentStats { Defense = 5 },
                "iron_helmet" => new EquipmentStats { Defense = 3 },
                _ => null
            };
        }
    }

    public class ItemDefinition
    {
        public string ItemId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ItemCategory Category { get; set; }
        public int MaxStack { get; set; }
        public int Value { get; set; }
        public float Weight { get; set; }
        public bool IsEquippable { get; set; }
        public bool IsConsumable { get; set; }
        public bool IsQuestItem { get; set; }
        public EquipmentSlot? EquipSlot { get; set; }
        public List<ItemEffect> Effects { get; set; }
    }

    public class InventoryItem
    {
        public string ItemId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ItemCategory Category { get; set; }
        public int Quantity { get; set; }
        public int MaxStack { get; set; }
        public int Value { get; set; }
        public float Weight { get; set; }
        public bool IsEquippable { get; set; }
        public bool IsConsumable { get; set; }
        public bool IsQuestItem { get; set; }
        public EquipmentSlot? EquipSlot { get; set; }
        public List<ItemEffect> Effects { get; set; }
    }

    public class ItemEffect
    {
        public ItemEffectType Type { get; set; }
        public int Value { get; set; }
        public int? Duration { get; set; }
    }

    public enum ItemEffectType
    {
        HealHP,
        HealStamina,
        RestoreFood,
        RestoreWater,
        BuffAttack,
        BuffDefense,
        CureStatus,
        Damage
    }

    public enum ItemCategory
    {
        Weapon,
        Armor,
        Consumable,
        Provision,
        Material,
        Quest,
        Key,
        Misc
    }

    public enum EquipmentSlot
    {
        MainHand,
        OffHand,
        Head,
        Body,
        Legs,
        Accessory1,
        Accessory2
    }

    public class EquipmentState
    {
        public string MainHand { get; set; }
        public string OffHand { get; set; }
        public string Head { get; set; }
        public string Body { get; set; }
        public string Legs { get; set; }
        public string Accessory1 { get; set; }
        public string Accessory2 { get; set; }
    }

    public class EquipmentStats
    {
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int Speed { get; set; }
    }

    public class WeightInfo
    {
        public float Current { get; set; }
        public float Max { get; set; }
        public float Percent { get; set; }
    }

    public class InventoryControllerState
    {
        public List<InventoryItem> Items { get; set; }
        public EquipmentState Equipment { get; set; }
        public List<string> QuickSlots { get; set; }
        public int MaxSlots { get; set; }
        public float CurrentWeight { get; set; }
        public float MaxWeight { get; set; }
        public ItemCategory? SelectedCategory { get; set; }
    }

    public class InventorySaveData
    {
        public List<ItemSaveEntry> Items { get; set; }
        public EquipmentState Equipment { get; set; }
        public List<string> QuickSlots { get; set; }
    }

    public class ItemSaveEntry
    {
        public string ItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class InventoryEvent
    {
        public InventoryEventType Type { get; set; }
        public string ItemId { get; set; }
        public int Quantity { get; set; }
        public int NewTotal { get; set; }
        public List<ItemEffect> Effects { get; set; }
        public EquipmentSlot? Slot { get; set; }
        public string PreviousItemId { get; set; }
        public int SlotIndex { get; set; }
    }

    public enum InventoryEventType
    {
        ItemAdded,
        ItemRemoved,
        ItemUsed,
        ItemEquipped,
        ItemUnequipped,
        InventoryFull,
        QuickSlotSet
    }

    #endregion
}
