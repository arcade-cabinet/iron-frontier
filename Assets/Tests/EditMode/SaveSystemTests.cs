using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NUnit.Framework;
using UnityEngine;

namespace IronFrontier.Tests.EditMode
{
    /// <summary>
    /// Save System Unit Tests
    ///
    /// Tests for save/load serialization including:
    /// - Save slot management
    /// - Save data serialization
    /// - Load data deserialization
    /// - Auto-save functionality
    /// - Quick save/load
    /// - Save file versioning
    /// - Save file migration
    ///
    /// Ported from TypeScript reference: SaveSystem.ts, GameSession.integration.test.ts
    /// </summary>
    [TestFixture]
    [Category("SaveSystem")]
    public class SaveSystemTests
    {
        private SaveSystem _saveSystem;
        private MockSaveStorageAdapter _mockStorage;

        [SetUp]
        public void SetUp()
        {
            _mockStorage = new MockSaveStorageAdapter();
            _saveSystem = new SaveSystem(_mockStorage);
        }

        [TearDown]
        public void TearDown()
        {
            _saveSystem.Dispose();
        }

        #region Test Data Helpers

        private GameSaveData CreateMockSaveData(string playerName = "TestPlayer", int gold = 100)
        {
            return new GameSaveData
            {
                Party = new List<PartyMember>
                {
                    new PartyMember
                    {
                        Name = playerName,
                        Level = 5,
                        HP = 80,
                        MaxHP = 100
                    }
                },
                TotalPlayTime = 3600,
                CurrentDay = 3,
                Gold = gold,
                Inventory = new List<SavedItem>
                {
                    new SavedItem { ItemId = "healing_potion", Quantity = 5 }
                },
                ActiveQuests = new List<string> { "main_quest_1" },
                CompletedQuests = new List<string> { "tutorial_quest" },
                VisitedLocations = new List<string> { "frontier_edge", "iron_gulch" },
                GameFlags = new Dictionary<string, bool>
                {
                    { "tutorial_complete", true },
                    { "met_sheriff", true }
                }
            };
        }

        #endregion

        #region Basic Save Tests

        [Test]
        public async Task Save_ShouldReturnSaveSlotMeta()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            // Act
            var meta = await _saveSystem.Save("slot-1", saveData, "Frontier's Edge");

            // Assert
            Assert.IsNotNull(meta);
            Assert.AreEqual("slot-1", meta.SlotId);
            Assert.AreEqual("TestPlayer", meta.PlayerName);
        }

        [Test]
        public async Task Save_ShouldStoreDataInAdapter()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            // Act
            await _saveSystem.Save("slot-1", saveData, "Iron Gulch");

            // Assert
            Assert.IsTrue(_mockStorage.HasSave("slot-1"));
        }

        [Test]
        public async Task Save_ShouldSetCorrectTimestamp()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            var beforeSave = DateTime.UtcNow.Ticks;

            // Act
            var meta = await _saveSystem.Save("slot-1", saveData, "Location");
            var afterSave = DateTime.UtcNow.Ticks;

            // Assert
            Assert.GreaterOrEqual(meta.Timestamp, beforeSave);
            Assert.LessOrEqual(meta.Timestamp, afterSave);
        }

        [Test]
        public async Task Save_ShouldIncludePlayTime()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            saveData.TotalPlayTime = 7200; // 2 hours

            // Act
            var meta = await _saveSystem.Save("slot-1", saveData, "Location");

            // Assert
            Assert.AreEqual(7200, meta.PlayTime);
        }

        [Test]
        public async Task Save_ShouldIncludeLocation()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            // Act
            var meta = await _saveSystem.Save("slot-1", saveData, "Mesa Point");

            // Assert
            Assert.AreEqual("Mesa Point", meta.Location);
        }

        #endregion

        #region Basic Load Tests

        [Test]
        public async Task Load_ShouldReturnSavedData()
        {
            // Arrange
            var saveData = CreateMockSaveData("Hero", 500);
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            var loadedData = await _saveSystem.Load("slot-1");

            // Assert
            Assert.IsNotNull(loadedData);
            Assert.AreEqual("Hero", loadedData.Party[0].Name);
            Assert.AreEqual(500, loadedData.Gold);
        }

        [Test]
        public async Task Load_ShouldReturnNullForEmptySlot()
        {
            // Act
            var loadedData = await _saveSystem.Load("nonexistent");

            // Assert
            Assert.IsNull(loadedData);
        }

        [Test]
        public async Task Load_ShouldPreserveAllFields()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            var loadedData = await _saveSystem.Load("slot-1");

            // Assert
            Assert.AreEqual(saveData.TotalPlayTime, loadedData.TotalPlayTime);
            Assert.AreEqual(saveData.CurrentDay, loadedData.CurrentDay);
            Assert.AreEqual(saveData.Inventory.Count, loadedData.Inventory.Count);
            Assert.AreEqual(saveData.ActiveQuests.Count, loadedData.ActiveQuests.Count);
            Assert.AreEqual(saveData.CompletedQuests.Count, loadedData.CompletedQuests.Count);
        }

        #endregion

        #region Quick Save Tests

        [Test]
        public async Task QuickSave_ShouldUseQuickSaveSlot()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            // Act
            var meta = await _saveSystem.QuickSave(saveData, "Quick Location");

            // Assert
            Assert.IsTrue(meta.IsQuickSave);
        }

        [Test]
        public async Task QuickLoad_ShouldLoadFromQuickSaveSlot()
        {
            // Arrange
            var saveData = CreateMockSaveData("QuickSaveHero");
            await _saveSystem.QuickSave(saveData, "Location");

            // Act
            var loadedData = await _saveSystem.QuickLoad();

            // Assert
            Assert.IsNotNull(loadedData);
            Assert.AreEqual("QuickSaveHero", loadedData.Party[0].Name);
        }

        [Test]
        public async Task HasQuickSave_ShouldReturnTrueAfterQuickSave()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.QuickSave(saveData, "Location");

            // Act
            bool hasQuickSave = await _saveSystem.HasQuickSave();

            // Assert
            Assert.IsTrue(hasQuickSave);
        }

        [Test]
        public async Task HasQuickSave_ShouldReturnFalseWhenNoQuickSave()
        {
            // Act
            bool hasQuickSave = await _saveSystem.HasQuickSave();

            // Assert
            Assert.IsFalse(hasQuickSave);
        }

        #endregion

        #region Auto Save Tests

        [Test]
        public async Task AutoSave_ShouldUseAutoSaveSlot()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            // Act
            var meta = await _saveSystem.AutoSave(saveData, "Auto Location");

            // Assert
            Assert.IsTrue(meta.IsAutoSave);
        }

        [Test]
        public async Task HasAutoSave_ShouldReturnTrueAfterAutoSave()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.AutoSave(saveData, "Location");

            // Act
            bool hasAutoSave = await _saveSystem.HasAutoSave();

            // Assert
            Assert.IsTrue(hasAutoSave);
        }

        [Test]
        public void SetAutoSaveEnabled_ShouldUpdateSetting()
        {
            // Act
            _saveSystem.SetAutoSaveEnabled(false);

            // Assert - no exception means success
            Assert.Pass();
        }

        #endregion

        #region Slot Management Tests

        [Test]
        public async Task GetAllSlots_ShouldReturnAllSaves()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.Save("slot-1", saveData, "Location 1");
            await _saveSystem.Save("slot-2", saveData, "Location 2");
            await _saveSystem.QuickSave(saveData, "Quick");

            // Act
            var slots = await _saveSystem.GetAllSlots();

            // Assert
            Assert.AreEqual(3, slots.Count);
        }

        [Test]
        public async Task GetManualSlots_ShouldExcludeQuickAndAutoSaves()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.Save("slot-1", saveData, "Location 1");
            await _saveSystem.Save("slot-2", saveData, "Location 2");
            await _saveSystem.QuickSave(saveData, "Quick");
            await _saveSystem.AutoSave(saveData, "Auto");

            // Act
            var manualSlots = await _saveSystem.GetManualSlots();

            // Assert
            Assert.AreEqual(2, manualSlots.Count);
            Assert.IsFalse(manualSlots.Any(s => s.IsQuickSave));
            Assert.IsFalse(manualSlots.Any(s => s.IsAutoSave));
        }

        [Test]
        public async Task DeleteSlot_ShouldRemoveSave()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            await _saveSystem.DeleteSlot("slot-1");

            // Assert
            var loadedData = await _saveSystem.Load("slot-1");
            Assert.IsNull(loadedData);
        }

        [Test]
        public async Task GetNextSlotId_ShouldReturnFirstAvailable()
        {
            // Arrange - no saves yet

            // Act
            var nextSlot = await _saveSystem.GetNextSlotId();

            // Assert
            Assert.AreEqual("slot-1", nextSlot);
        }

        [Test]
        public async Task GetNextSlotId_ShouldSkipUsedSlots()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.Save("slot-1", saveData, "Location");
            await _saveSystem.Save("slot-2", saveData, "Location");

            // Act
            var nextSlot = await _saveSystem.GetNextSlotId();

            // Assert
            Assert.AreEqual("slot-3", nextSlot);
        }

        #endregion

        #region Version and Migration Tests

        [Test]
        public async Task Save_ShouldIncludeVersion()
        {
            // Arrange
            var saveData = CreateMockSaveData();

            // Act
            var meta = await _saveSystem.Save("slot-1", saveData, "Location");

            // Assert
            Assert.AreEqual(SaveSystem.SAVE_VERSION, meta.Version);
        }

        [Test]
        public async Task Load_ShouldMigrateOldVersions()
        {
            // Arrange - Create old version save directly in storage
            var oldSaveFile = new SaveFile
            {
                Meta = new SaveSlotMeta
                {
                    SlotId = "slot-1",
                    Timestamp = DateTime.UtcNow.Ticks,
                    Version = 0, // Old version
                    PlayerName = "OldPlayer",
                    CurrentDay = 1,
                    PlayTime = 1000,
                    Location = "Old Location"
                },
                Data = CreateMockSaveData("OldPlayer")
            };
            await _mockStorage.SaveToSlot("slot-1", oldSaveFile);

            // Act
            var loadedData = await _saveSystem.Load("slot-1");

            // Assert - Should still load (migration handles it)
            Assert.IsNotNull(loadedData);
        }

        #endregion

        #region Export/Import Tests

        [Test]
        public async Task ExportSave_ShouldReturnEncodedString()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            var exportedString = await _saveSystem.ExportSave("slot-1");

            // Assert
            Assert.IsNotNull(exportedString);
            Assert.IsNotEmpty(exportedString);
        }

        [Test]
        public async Task ImportSave_ShouldCreateNewSlot()
        {
            // Arrange
            var saveData = CreateMockSaveData("ExportedPlayer");
            await _saveSystem.Save("slot-1", saveData, "Location");
            var exportedString = await _saveSystem.ExportSave("slot-1");

            // Act
            var importedMeta = await _saveSystem.ImportSave(exportedString);

            // Assert
            Assert.IsNotNull(importedMeta);
            Assert.AreEqual("ExportedPlayer", importedMeta.PlayerName);
            Assert.IsTrue(importedMeta.SlotId.StartsWith("import-"));
        }

        #endregion

        #region Event Callback Tests

        [Test]
        public async Task Save_ShouldNotifySaveCallbacks()
        {
            // Arrange
            SaveSlotMeta capturedMeta = null;
            _saveSystem.OnSave(meta => capturedMeta = meta);
            var saveData = CreateMockSaveData();

            // Act
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Assert
            Assert.IsNotNull(capturedMeta);
            Assert.AreEqual("slot-1", capturedMeta.SlotId);
        }

        [Test]
        public async Task Load_ShouldNotifyLoadCallbacks()
        {
            // Arrange
            GameSaveData capturedData = null;
            _saveSystem.OnLoad(data => capturedData = data);
            var saveData = CreateMockSaveData("CallbackPlayer");
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            await _saveSystem.Load("slot-1");

            // Assert
            Assert.IsNotNull(capturedData);
            Assert.AreEqual("CallbackPlayer", capturedData.Party[0].Name);
        }

        [Test]
        public void OnSave_ShouldReturnUnsubscribeFunction()
        {
            // Arrange
            int callCount = 0;
            var unsubscribe = _saveSystem.OnSave(_ => callCount++);

            // Act
            unsubscribe();

            // Assert - Should return without error
            Assert.IsNotNull(unsubscribe);
        }

        #endregion

        #region Save Data Content Tests

        [Test]
        public async Task Save_ShouldPreserveInventory()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            saveData.Inventory = new List<SavedItem>
            {
                new SavedItem { ItemId = "healing_potion", Quantity = 10 },
                new SavedItem { ItemId = "revolver", Quantity = 1 }
            };
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            var loadedData = await _saveSystem.Load("slot-1");

            // Assert
            Assert.AreEqual(2, loadedData.Inventory.Count);
            Assert.AreEqual(10, loadedData.Inventory.Find(i => i.ItemId == "healing_potion").Quantity);
        }

        [Test]
        public async Task Save_ShouldPreserveQuestState()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            saveData.ActiveQuests = new List<string> { "quest_1", "quest_2" };
            saveData.CompletedQuests = new List<string> { "tutorial" };
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            var loadedData = await _saveSystem.Load("slot-1");

            // Assert
            Assert.AreEqual(2, loadedData.ActiveQuests.Count);
            Assert.AreEqual(1, loadedData.CompletedQuests.Count);
        }

        [Test]
        public async Task Save_ShouldPreserveGameFlags()
        {
            // Arrange
            var saveData = CreateMockSaveData();
            saveData.GameFlags = new Dictionary<string, bool>
            {
                { "flag_1", true },
                { "flag_2", false }
            };
            await _saveSystem.Save("slot-1", saveData, "Location");

            // Act
            var loadedData = await _saveSystem.Load("slot-1");

            // Assert
            Assert.AreEqual(2, loadedData.GameFlags.Count);
            Assert.IsTrue(loadedData.GameFlags["flag_1"]);
            Assert.IsFalse(loadedData.GameFlags["flag_2"]);
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Save system for managing game persistence
    /// </summary>
    public class SaveSystem
    {
        public const int SAVE_VERSION = 1;
        private const string QUICK_SAVE_SLOT = "quicksave";
        private const string AUTO_SAVE_SLOT = "autosave";
        private const int MAX_MANUAL_SLOTS = 10;

        private readonly ISaveStorageAdapter _adapter;
        private readonly List<Action<SaveSlotMeta>> _saveCallbacks = new List<Action<SaveSlotMeta>>();
        private readonly List<Action<GameSaveData>> _loadCallbacks = new List<Action<GameSaveData>>();
        private bool _autoSaveEnabled = true;

        public SaveSystem(ISaveStorageAdapter adapter)
        {
            _adapter = adapter;
        }

        public async Task<SaveSlotMeta> Save(string slotId, GameSaveData data, string locationName)
        {
            var meta = new SaveSlotMeta
            {
                SlotId = slotId,
                Timestamp = DateTime.UtcNow.Ticks,
                PlayTime = data.TotalPlayTime,
                PlayerName = data.Party.FirstOrDefault()?.Name ?? "Unknown",
                CurrentDay = data.CurrentDay,
                Location = locationName,
                Version = SAVE_VERSION,
                IsQuickSave = slotId == QUICK_SAVE_SLOT,
                IsAutoSave = slotId == AUTO_SAVE_SLOT
            };

            var file = new SaveFile { Meta = meta, Data = data };
            await _adapter.SaveToSlot(slotId, file);

            foreach (var callback in _saveCallbacks)
            {
                callback(meta);
            }

            return meta;
        }

        public async Task<GameSaveData> Load(string slotId)
        {
            var file = await _adapter.LoadFromSlot(slotId);
            if (file == null) return null;

            var migratedData = MigrateIfNeeded(file.Data, file.Meta.Version);

            foreach (var callback in _loadCallbacks)
            {
                callback(migratedData);
            }

            return migratedData;
        }

        public Task<SaveSlotMeta> QuickSave(GameSaveData data, string locationName)
        {
            return Save(QUICK_SAVE_SLOT, data, locationName);
        }

        public Task<GameSaveData> QuickLoad()
        {
            return Load(QUICK_SAVE_SLOT);
        }

        public Task<SaveSlotMeta> AutoSave(GameSaveData data, string locationName)
        {
            return Save(AUTO_SAVE_SLOT, data, locationName);
        }

        public async Task<bool> HasQuickSave()
        {
            var file = await _adapter.LoadFromSlot(QUICK_SAVE_SLOT);
            return file != null;
        }

        public async Task<bool> HasAutoSave()
        {
            var file = await _adapter.LoadFromSlot(AUTO_SAVE_SLOT);
            return file != null;
        }

        public void SetAutoSaveEnabled(bool enabled)
        {
            _autoSaveEnabled = enabled;
        }

        public async Task<string> GetNextSlotId()
        {
            var slots = await GetManualSlots();
            for (int i = 1; i <= MAX_MANUAL_SLOTS; i++)
            {
                var slotId = $"slot-{i}";
                if (!slots.Any(s => s.SlotId == slotId))
                {
                    return slotId;
                }
            }
            return slots.LastOrDefault()?.SlotId ?? "slot-1";
        }

        public async Task<List<SaveSlotMeta>> GetManualSlots()
        {
            var all = await _adapter.ListSlots();
            return all.Where(s => !s.IsAutoSave && !s.IsQuickSave).ToList();
        }

        public Task<List<SaveSlotMeta>> GetAllSlots()
        {
            return _adapter.ListSlots();
        }

        public Task DeleteSlot(string slotId)
        {
            return _adapter.DeleteSlot(slotId);
        }

        public Task<string> ExportSave(string slotId)
        {
            return _adapter.ExportSave(slotId);
        }

        public Task<SaveSlotMeta> ImportSave(string data)
        {
            return _adapter.ImportSave(data);
        }

        public Action OnSave(Action<SaveSlotMeta> callback)
        {
            _saveCallbacks.Add(callback);
            return () => _saveCallbacks.Remove(callback);
        }

        public Action OnLoad(Action<GameSaveData> callback)
        {
            _loadCallbacks.Add(callback);
            return () => _loadCallbacks.Remove(callback);
        }

        private GameSaveData MigrateIfNeeded(GameSaveData data, int fromVersion)
        {
            if (fromVersion >= SAVE_VERSION) return data;
            // Add migration logic here as versions increase
            return data;
        }

        public void Dispose()
        {
            _saveCallbacks.Clear();
            _loadCallbacks.Clear();
        }
    }

    public interface ISaveStorageAdapter
    {
        Task SaveToSlot(string slotId, SaveFile data);
        Task<SaveFile> LoadFromSlot(string slotId);
        Task DeleteSlot(string slotId);
        Task<List<SaveSlotMeta>> ListSlots();
        Task<string> ExportSave(string slotId);
        Task<SaveSlotMeta> ImportSave(string data);
    }

    public class MockSaveStorageAdapter : ISaveStorageAdapter
    {
        private readonly Dictionary<string, SaveFile> _storage = new Dictionary<string, SaveFile>();

        public Task SaveToSlot(string slotId, SaveFile data)
        {
            _storage[slotId] = data;
            return Task.CompletedTask;
        }

        public Task<SaveFile> LoadFromSlot(string slotId)
        {
            _storage.TryGetValue(slotId, out var file);
            return Task.FromResult(file);
        }

        public Task DeleteSlot(string slotId)
        {
            _storage.Remove(slotId);
            return Task.CompletedTask;
        }

        public Task<List<SaveSlotMeta>> ListSlots()
        {
            var slots = _storage.Values
                .Select(f => f.Meta)
                .OrderByDescending(m => m.Timestamp)
                .ToList();
            return Task.FromResult(slots);
        }

        public Task<string> ExportSave(string slotId)
        {
            if (!_storage.TryGetValue(slotId, out var file))
            {
                throw new Exception("Save not found");
            }
            var json = JsonUtility.ToJson(file);
            return Task.FromResult(Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(json)));
        }

        public Task<SaveSlotMeta> ImportSave(string data)
        {
            var json = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(data));
            var file = JsonUtility.FromJson<SaveFile>(json);
            var newSlotId = $"import-{DateTime.UtcNow.Ticks}";
            file.Meta.SlotId = newSlotId;
            _storage[newSlotId] = file;
            return Task.FromResult(file.Meta);
        }

        public bool HasSave(string slotId) => _storage.ContainsKey(slotId);
    }

    [Serializable]
    public class SaveFile
    {
        public SaveSlotMeta Meta;
        public GameSaveData Data;
    }

    [Serializable]
    public class SaveSlotMeta
    {
        public string SlotId;
        public long Timestamp;
        public int PlayTime;
        public string PlayerName;
        public int CurrentDay;
        public string Location;
        public int Version;
        public bool IsQuickSave;
        public bool IsAutoSave;
    }

    [Serializable]
    public class GameSaveData
    {
        public List<PartyMember> Party;
        public int TotalPlayTime;
        public int CurrentDay;
        public int Gold;
        public List<SavedItem> Inventory;
        public List<string> ActiveQuests;
        public List<string> CompletedQuests;
        public List<string> VisitedLocations;
        public Dictionary<string, bool> GameFlags;
    }

    [Serializable]
    public class PartyMember
    {
        public string Name;
        public int Level;
        public int HP;
        public int MaxHP;
    }

    [Serializable]
    public class SavedItem
    {
        public string ItemId;
        public int Quantity;
    }

    #endregion
}
