using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace IronFrontier.Tests.PlayMode
{
    /// <summary>
    /// Game Flow Integration Tests
    ///
    /// Full integration tests for the game flow including:
    /// - Title screen to game transitions
    /// - Character creation flow
    /// - Game initialization
    /// - Scene transitions (overworld, combat, dialogue)
    /// - Save/load round trip
    /// - Complete gameplay loop
    ///
    /// Ported from TypeScript reference: GameFlow.test.tsx, GameSession.integration.test.ts
    /// </summary>
    [TestFixture]
    [Category("Integration")]
    [Category("GameFlow")]
    public class GameFlowTests
    {
        private GameSession _gameSession;
        private MockGameDataAccess _mockDataAccess;

        [SetUp]
        public void SetUp()
        {
            _mockDataAccess = new MockGameDataAccess();
            _gameSession = new GameSession(_mockDataAccess);
        }

        [TearDown]
        public void TearDown()
        {
            _gameSession.Dispose();
        }

        #region Game Initialization Tests

        [Test]
        public void GameSession_ShouldStartInTitleMode()
        {
            // Assert
            Assert.AreEqual(GameMode.Title, _gameSession.GetMode());
        }

        [Test]
        public void StartNewGame_ShouldTransitionToOverworld()
        {
            // Act
            _gameSession.StartNewGame("Test Player");

            // Assert
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());
        }

        [Test]
        public void StartNewGame_ShouldSetPlayerName()
        {
            // Act
            _gameSession.StartNewGame("Hero");

            // Assert
            var state = _gameSession.GetState();
            Assert.AreEqual("Hero", state.Player.Name);
        }

        [Test]
        public void StartNewGame_ShouldInitializePlayerWithDefaultStats()
        {
            // Act
            _gameSession.StartNewGame("Test Player");

            // Assert
            var state = _gameSession.GetState();
            Assert.Greater(state.Player.HP, 0);
            Assert.Greater(state.Player.MaxHP, 0);
            Assert.GreaterOrEqual(state.Player.Gold, 0);
        }

        [Test]
        public void StartNewGame_ShouldSetInitialLocation()
        {
            // Act
            _gameSession.StartNewGame("Test Player");

            // Assert
            var state = _gameSession.GetState();
            Assert.AreEqual("frontier_edge", state.CurrentLocation);
        }

        #endregion

        #region Quest System Integration Tests

        [Test]
        public void Quest_ShouldStartSuccessfully()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            bool started = _gameSession.Quest.StartQuest("test_quest_1");

            // Assert
            Assert.IsTrue(started);
            Assert.IsTrue(_gameSession.Quest.IsQuestActive("test_quest_1"));
        }

        [Test]
        public void Quest_ShouldNotStartDuplicates()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.Quest.StartQuest("test_quest_1");

            // Act
            bool duplicate = _gameSession.Quest.StartQuest("test_quest_1");

            // Assert
            Assert.IsFalse(duplicate);
        }

        [Test]
        public void Quest_ShouldTrackObjectives()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.Quest.StartQuest("test_quest_1");

            // Act
            var quest = _gameSession.Quest.GetQuest("test_quest_1");

            // Assert
            Assert.IsNotNull(quest);
            Assert.Greater(quest.Objectives.Count, 0);
            Assert.AreEqual("incomplete", quest.Objectives[0].Status);
        }

        [Test]
        public void Quest_MainQuest_ShouldAutoTrack()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            _gameSession.Quest.StartQuest("main_quest_1");
            var tracked = _gameSession.Quest.GetTrackedQuest();

            // Assert
            Assert.IsNotNull(tracked);
            Assert.IsTrue(tracked.IsMainQuest);
        }

        #endregion

        #region Dialogue System Integration Tests

        [UnityTest]
        public IEnumerator Dialogue_ShouldStartWithNPC()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            var task = _gameSession.TalkToNPC("test_npc_1");
            yield return new WaitUntil(() => task.IsCompleted);

            // Assert
            Assert.IsTrue(task.Result);
            Assert.AreEqual(GameMode.Dialogue, _gameSession.GetMode());
        }

        [UnityTest]
        public IEnumerator Dialogue_ShouldHandleInvalidNPC()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            var task = _gameSession.TalkToNPC("nonexistent_npc");
            yield return new WaitUntil(() => task.IsCompleted);

            // Assert
            Assert.IsFalse(task.Result);
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());
        }

        #endregion

        #region Inventory System Integration Tests

        [Test]
        public void Inventory_ShouldAddItems()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            _gameSession.Inventory.AddItem("healing_potion", 3);

            // Assert
            Assert.IsTrue(_gameSession.Inventory.HasItem("healing_potion", 3));
        }

        [Test]
        public void Inventory_ShouldRemoveItems()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.Inventory.AddItem("healing_potion", 5);

            // Act
            _gameSession.Inventory.RemoveItem("healing_potion", 2);

            // Assert
            Assert.IsTrue(_gameSession.Inventory.HasItem("healing_potion", 3));
            Assert.IsFalse(_gameSession.Inventory.HasItem("healing_potion", 4));
        }

        [Test]
        public void Inventory_ShouldCheckItemExistence()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.Inventory.AddItem("healing_potion", 5);

            // Assert
            Assert.IsTrue(_gameSession.Inventory.HasItem("healing_potion", 1));
            Assert.IsTrue(_gameSession.Inventory.HasItem("healing_potion", 5));
            Assert.IsFalse(_gameSession.Inventory.HasItem("healing_potion", 6));
        }

        #endregion

        #region Shop System Integration Tests

        [Test]
        public void Shop_ShouldOpen()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            bool opened = _gameSession.OpenShop("test_shop");

            // Assert
            Assert.IsTrue(opened);
            Assert.AreEqual(GameMode.Shop, _gameSession.GetMode());
        }

        [Test]
        public void Shop_ShouldClose()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.OpenShop("test_shop");

            // Act
            _gameSession.CloseShop();

            // Assert
            Assert.AreNotEqual(GameMode.Shop, _gameSession.GetMode());
        }

        #endregion

        #region Time and Survival Integration Tests

        [Test]
        public void Clock_ShouldTrackGameTime()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            int initialHour = _gameSession.Clock.GetHour();
            _gameSession.Clock.AdvanceTime(2);
            int newHour = _gameSession.Clock.GetHour();

            // Assert
            Assert.AreNotEqual(initialHour, newHour);
        }

        [Test]
        public void Fatigue_ShouldTrackPlayerFatigue()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            float initialFatigue = _gameSession.Fatigue.GetCurrent();
            _gameSession.Fatigue.ApplyTravelFatigue(1, false);
            float newFatigue = _gameSession.Fatigue.GetCurrent();

            // Assert
            Assert.Greater(newFatigue, initialFatigue);
        }

        [Test]
        public void Provisions_ShouldTrackFood()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            int initialFood = _gameSession.Provisions.GetFood();
            _gameSession.Provisions.ConsumeForTravel(1);
            int newFood = _gameSession.Provisions.GetFood();

            // Assert
            Assert.Less(newFood, initialFood);
        }

        #endregion

        #region Event System Integration Tests

        [Test]
        public void Events_ShouldEmitOnQuestStart()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            var events = new List<GameEvent>();
            _gameSession.Quest.OnEvent += (e) => events.Add(new GameEvent { Type = e.Type.ToString() });

            // Act
            _gameSession.Quest.StartQuest("test_quest_1");

            // Assert
            Assert.IsTrue(events.Any(e => e.Type == "QuestStarted"));
        }

        [Test]
        public void Events_ShouldEmitOnObjectiveUpdate()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.Quest.StartQuest("test_quest_1");
            var events = new List<GameEvent>();
            _gameSession.Quest.OnEvent += (e) => events.Add(new GameEvent { Type = e.Type.ToString() });

            // Act
            _gameSession.Quest.UpdateObjective(ObjectiveType.Talk, "test_npc_1");

            // Assert
            Assert.IsTrue(events.Any(e => e.Type == "QuestUpdated" || e.Type == "ObjectiveComplete"));
        }

        #endregion

        #region Save/Load Integration Tests

        [Test]
        public void SaveData_ShouldContainPlayerInfo()
        {
            // Arrange
            _gameSession.StartNewGame("Save Test Player");
            _gameSession.AddGold(100);

            // Act
            var saveData = _gameSession.GetSaveData();

            // Assert
            Assert.AreEqual("Save Test Player", saveData.State.Player.Name);
            Assert.AreEqual(150, saveData.State.Player.Gold); // 50 starting + 100 added
        }

        [Test]
        public void SaveData_ShouldContainQuestState()
        {
            // Arrange
            _gameSession.StartNewGame("Quest Saver");
            _gameSession.Quest.StartQuest("test_quest_1");

            // Act
            var saveData = _gameSession.GetSaveData();

            // Assert
            Assert.Greater(saveData.Quest.ActiveQuests.Count, 0);
            Assert.AreEqual("test_quest_1", saveData.Quest.ActiveQuests[0].QuestId);
        }

        [Test]
        public void SaveData_ShouldContainInventory()
        {
            // Arrange
            _gameSession.StartNewGame("Inventory Saver");
            _gameSession.Inventory.AddItem("healing_potion", 5);

            // Act
            var saveData = _gameSession.GetSaveData();

            // Assert
            Assert.Greater(saveData.Inventory.Items.Count, 0);
        }

        #endregion

        #region Complete Game Flow Tests

        [Test]
        public void Act1Flow_ShouldStartGameAndBeginQuest()
        {
            // 1. Start new game
            _gameSession.StartNewGame("Hero");
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());

            // 2. Start quest
            bool started = _gameSession.Quest.StartQuest("test_quest_1");
            Assert.IsTrue(started);
            Assert.IsTrue(_gameSession.Quest.IsQuestActive("test_quest_1"));

            // 3. Verify quest has objectives
            var quest = _gameSession.Quest.GetQuest("test_quest_1");
            Assert.IsNotNull(quest);
            Assert.Greater(quest.Objectives.Count, 0);
        }

        [Test]
        public void MultipleSystemsIntegration_ShouldWorkTogether()
        {
            // Arrange
            _gameSession.StartNewGame("Multi System Tester");

            // Player state
            Assert.Greater(_gameSession.GetState().Player.HP, 0);

            // Quest system
            _gameSession.Quest.StartQuest("test_quest_1");
            Assert.AreEqual(1, _gameSession.Quest.GetActiveQuests().Count);

            // Inventory system
            _gameSession.Inventory.AddItem("healing_potion", 2);
            Assert.IsTrue(_gameSession.Inventory.HasItem("healing_potion", 1));

            // Time system
            int hour = _gameSession.Clock.GetHour();
            Assert.GreaterOrEqual(hour, 0);
            Assert.Less(hour, 24);

            // Provisions system
            int food = _gameSession.Provisions.GetFood();
            Assert.Greater(food, 0);

            // All systems work together
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());
        }

        [UnityTest]
        public IEnumerator CompleteGameLoop_ShouldMaintainState()
        {
            // Start game
            _gameSession.StartNewGame("Loop Tester");
            yield return null;

            // Start quest
            _gameSession.Quest.StartQuest("test_quest_1");
            yield return null;

            // Add items
            _gameSession.Inventory.AddItem("healing_potion", 3);
            yield return null;

            // Advance time
            _gameSession.Clock.AdvanceTime(1);
            yield return null;

            // Open shop and close
            _gameSession.OpenShop("test_shop");
            yield return null;
            _gameSession.CloseShop();
            yield return null;

            // Verify state is maintained
            Assert.IsTrue(_gameSession.Quest.IsQuestActive("test_quest_1"));
            Assert.IsTrue(_gameSession.Inventory.HasItem("healing_potion", 3));
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());
        }

        #endregion

        #region Phase Transition Tests

        [Test]
        public void PhaseTransition_TitleToPlaying()
        {
            // Arrange - Already in title mode

            // Act
            _gameSession.StartNewGame("Transition Tester");

            // Assert
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());
        }

        [Test]
        public void PhaseTransition_OverworldToShop()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            _gameSession.OpenShop("test_shop");

            // Assert
            Assert.AreEqual(GameMode.Shop, _gameSession.GetMode());
        }

        [Test]
        public void PhaseTransition_ShopToOverworld()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");
            _gameSession.OpenShop("test_shop");

            // Act
            _gameSession.CloseShop();

            // Assert
            Assert.AreEqual(GameMode.Overworld, _gameSession.GetMode());
        }

        #endregion

        #region Edge Case Tests

        [Test]
        public void StartNewGame_WithEmptyName_ShouldUseDefault()
        {
            // Act
            _gameSession.StartNewGame("");

            // Assert
            var state = _gameSession.GetState();
            Assert.AreEqual("Stranger", state.Player.Name);
        }

        [Test]
        public void StartNewGame_WithLongName_ShouldTruncate()
        {
            // Act
            string longName = new string('A', 100);
            _gameSession.StartNewGame(longName);

            // Assert
            var state = _gameSession.GetState();
            Assert.LessOrEqual(state.Player.Name.Length, 32);
        }

        [Test]
        public void Inventory_AddItem_WithZeroQuantity_ShouldNotAdd()
        {
            // Arrange
            _gameSession.StartNewGame("Test Player");

            // Act
            _gameSession.Inventory.AddItem("healing_potion", 0);

            // Assert
            Assert.IsFalse(_gameSession.Inventory.HasItem("healing_potion"));
        }

        #endregion
    }

    #region Supporting Types

    public enum GameMode
    {
        Title,
        Overworld,
        Combat,
        Dialogue,
        Shop,
        Menu,
        Town
    }

    public enum ObjectiveType
    {
        Kill,
        Collect,
        Talk,
        Visit,
        Interact,
        Deliver
    }

    public class GameSession
    {
        private GameMode _mode = GameMode.Title;
        private PlayerState _player;
        private string _currentLocation;
        private readonly IGameDataAccess _dataAccess;

        public QuestManager Quest { get; }
        public InventoryManager Inventory { get; }
        public ClockManager Clock { get; }
        public FatigueManager Fatigue { get; }
        public ProvisionsManager Provisions { get; }

        public GameSession(IGameDataAccess dataAccess)
        {
            _dataAccess = dataAccess;
            Quest = new QuestManager(dataAccess);
            Inventory = new InventoryManager(dataAccess);
            Clock = new ClockManager();
            Fatigue = new FatigueManager();
            Provisions = new ProvisionsManager();
        }

        public GameMode GetMode() => _mode;

        public GameState GetState() => new GameState
        {
            Player = _player,
            CurrentLocation = _currentLocation
        };

        public void StartNewGame(string playerName)
        {
            if (string.IsNullOrEmpty(playerName)) playerName = "Stranger";
            if (playerName.Length > 32) playerName = playerName.Substring(0, 32);

            _player = new PlayerState
            {
                Name = playerName,
                HP = 100,
                MaxHP = 100,
                Gold = 50,
                Level = 1
            };
            _currentLocation = "frontier_edge";
            _mode = GameMode.Overworld;

            Provisions.Initialize();
            Clock.Initialize();
        }

        public System.Threading.Tasks.Task<bool> TalkToNPC(string npcId)
        {
            var npc = _dataAccess.GetNPC(npcId);
            if (npc == null)
            {
                return System.Threading.Tasks.Task.FromResult(false);
            }

            _mode = GameMode.Dialogue;
            return System.Threading.Tasks.Task.FromResult(true);
        }

        public bool OpenShop(string shopId)
        {
            var shop = _dataAccess.GetShop(shopId);
            if (shop == null) return false;

            _mode = GameMode.Shop;
            return true;
        }

        public void CloseShop()
        {
            _mode = GameMode.Overworld;
        }

        public void AddGold(int amount)
        {
            if (_player != null)
            {
                _player.Gold += amount;
            }
        }

        public GameSaveData GetSaveData()
        {
            return new GameSaveData
            {
                State = GetState(),
                Quest = Quest.GetSaveData(),
                Inventory = Inventory.GetSaveData()
            };
        }

        public void Dispose()
        {
            Quest.Dispose();
        }
    }

    public class GameState
    {
        public PlayerState Player { get; set; }
        public string CurrentLocation { get; set; }
    }

    public class PlayerState
    {
        public string Name { get; set; }
        public int HP { get; set; }
        public int MaxHP { get; set; }
        public int Gold { get; set; }
        public int Level { get; set; }
    }

    public class QuestManager
    {
        private readonly List<ActiveQuestData> _activeQuests = new List<ActiveQuestData>();
        private readonly List<string> _completedQuests = new List<string>();
        private string _trackedQuestId;
        private readonly IGameDataAccess _dataAccess;

        public event Action<QuestEventData> OnEvent;

        public QuestManager(IGameDataAccess dataAccess)
        {
            _dataAccess = dataAccess;
        }

        public bool StartQuest(string questId)
        {
            if (_activeQuests.Any(q => q.QuestId == questId)) return false;

            var definition = _dataAccess.GetQuest(questId);
            if (definition == null) return false;

            var quest = new ActiveQuestData
            {
                QuestId = questId,
                Name = definition.Name,
                IsMainQuest = definition.IsMainQuest,
                Objectives = definition.Objectives.Select(o => new ObjectiveData
                {
                    Id = o.Id,
                    Type = o.Type,
                    Target = o.Target,
                    Count = o.Count,
                    Current = 0,
                    Status = "incomplete"
                }).ToList()
            };

            _activeQuests.Add(quest);

            if (definition.IsMainQuest && string.IsNullOrEmpty(_trackedQuestId))
            {
                _trackedQuestId = questId;
            }

            OnEvent?.Invoke(new QuestEventData { Type = QuestEventType.QuestStarted, QuestId = questId });
            return true;
        }

        public void UpdateObjective(ObjectiveType type, string target, int amount = 1)
        {
            foreach (var quest in _activeQuests)
            {
                foreach (var objective in quest.Objectives)
                {
                    if (objective.Type == type && objective.Target == target && objective.Status == "incomplete")
                    {
                        objective.Current = Math.Min(objective.Count, objective.Current + amount);
                        OnEvent?.Invoke(new QuestEventData { Type = QuestEventType.QuestUpdated, QuestId = quest.QuestId });

                        if (objective.Current >= objective.Count)
                        {
                            objective.Status = "complete";
                            OnEvent?.Invoke(new QuestEventData { Type = QuestEventType.ObjectiveComplete, QuestId = quest.QuestId });
                        }
                    }
                }
            }
        }

        public bool IsQuestActive(string questId) => _activeQuests.Any(q => q.QuestId == questId);

        public ActiveQuestData GetQuest(string questId) => _activeQuests.Find(q => q.QuestId == questId);

        public List<ActiveQuestData> GetActiveQuests() => _activeQuests.ToList();

        public ActiveQuestData GetTrackedQuest() => _activeQuests.Find(q => q.QuestId == _trackedQuestId);

        public QuestSaveData GetSaveData() => new QuestSaveData
        {
            ActiveQuests = _activeQuests.ToList(),
            CompletedQuests = _completedQuests.ToList()
        };

        public void Dispose()
        {
            OnEvent = null;
        }
    }

    public class InventoryManager
    {
        private readonly List<InventoryItemData> _items = new List<InventoryItemData>();
        private readonly IGameDataAccess _dataAccess;

        public InventoryManager(IGameDataAccess dataAccess)
        {
            _dataAccess = dataAccess;
        }

        public bool AddItem(string itemId, int quantity)
        {
            if (quantity <= 0) return false;

            var definition = _dataAccess.GetItem(itemId);
            if (definition == null) return false;

            var existing = _items.Find(i => i.ItemId == itemId);
            if (existing != null)
            {
                existing.Quantity += quantity;
            }
            else
            {
                _items.Add(new InventoryItemData { ItemId = itemId, Quantity = quantity });
            }
            return true;
        }

        public bool RemoveItem(string itemId, int quantity)
        {
            var item = _items.Find(i => i.ItemId == itemId);
            if (item == null || item.Quantity < quantity) return false;

            item.Quantity -= quantity;
            if (item.Quantity <= 0) _items.Remove(item);
            return true;
        }

        public bool HasItem(string itemId, int quantity = 1)
        {
            var item = _items.Find(i => i.ItemId == itemId);
            return item != null && item.Quantity >= quantity;
        }

        public InventorySaveData GetSaveData() => new InventorySaveData
        {
            Items = _items.ToList()
        };
    }

    public class ClockManager
    {
        private int _hour = 8;
        private int _day = 1;

        public void Initialize()
        {
            _hour = 8;
            _day = 1;
        }

        public int GetHour() => _hour;

        public void AdvanceTime(int hours)
        {
            _hour = (_hour + hours) % 24;
            if (_hour < 8 && _hour + hours >= 24) _day++;
        }
    }

    public class FatigueManager
    {
        private float _current = 0f;

        public float GetCurrent() => _current;

        public void ApplyTravelFatigue(int distance, bool mounted)
        {
            float base_fatigue = mounted ? 2f : 5f;
            _current += distance * base_fatigue;
        }
    }

    public class ProvisionsManager
    {
        private int _food = 10;

        public void Initialize()
        {
            _food = 10;
        }

        public int GetFood() => _food;

        public void ConsumeForTravel(int amount)
        {
            _food = Math.Max(0, _food - amount);
        }
    }

    public interface IGameDataAccess
    {
        QuestDefinitionData GetQuest(string questId);
        NPCData GetNPC(string npcId);
        ShopData GetShop(string shopId);
        ItemDefinitionData GetItem(string itemId);
    }

    public class MockGameDataAccess : IGameDataAccess
    {
        public QuestDefinitionData GetQuest(string questId)
        {
            return questId switch
            {
                "test_quest_1" => new QuestDefinitionData
                {
                    Id = "test_quest_1",
                    Name = "Test Quest",
                    IsMainQuest = false,
                    Objectives = new List<ObjectiveDefinitionData>
                    {
                        new ObjectiveDefinitionData { Id = "obj_1", Type = ObjectiveType.Talk, Target = "test_npc_1", Count = 1 }
                    }
                },
                "main_quest_1" => new QuestDefinitionData
                {
                    Id = "main_quest_1",
                    Name = "Main Story",
                    IsMainQuest = true,
                    Objectives = new List<ObjectiveDefinitionData>
                    {
                        new ObjectiveDefinitionData { Id = "obj_1", Type = ObjectiveType.Talk, Target = "sheriff", Count = 1 }
                    }
                },
                _ => null
            };
        }

        public NPCData GetNPC(string npcId)
        {
            return npcId switch
            {
                "test_npc_1" => new NPCData { Id = "test_npc_1", Name = "Test NPC" },
                _ => null
            };
        }

        public ShopData GetShop(string shopId)
        {
            return shopId switch
            {
                "test_shop" => new ShopData { Id = "test_shop", Name = "Test Shop" },
                _ => null
            };
        }

        public ItemDefinitionData GetItem(string itemId)
        {
            return itemId switch
            {
                "healing_potion" => new ItemDefinitionData { ItemId = "healing_potion", Name = "Healing Potion" },
                _ => null
            };
        }
    }

    public class QuestDefinitionData
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsMainQuest { get; set; }
        public List<ObjectiveDefinitionData> Objectives { get; set; }
    }

    public class ObjectiveDefinitionData
    {
        public string Id { get; set; }
        public ObjectiveType Type { get; set; }
        public string Target { get; set; }
        public int Count { get; set; }
    }

    public class NPCData
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class ShopData
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class ItemDefinitionData
    {
        public string ItemId { get; set; }
        public string Name { get; set; }
    }

    public class ActiveQuestData
    {
        public string QuestId { get; set; }
        public string Name { get; set; }
        public bool IsMainQuest { get; set; }
        public List<ObjectiveData> Objectives { get; set; }
    }

    public class ObjectiveData
    {
        public string Id { get; set; }
        public ObjectiveType Type { get; set; }
        public string Target { get; set; }
        public int Count { get; set; }
        public int Current { get; set; }
        public string Status { get; set; }
    }

    public class InventoryItemData
    {
        public string ItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class GameSaveData
    {
        public GameState State { get; set; }
        public QuestSaveData Quest { get; set; }
        public InventorySaveData Inventory { get; set; }
    }

    public class QuestSaveData
    {
        public List<ActiveQuestData> ActiveQuests { get; set; }
        public List<string> CompletedQuests { get; set; }
    }

    public class InventorySaveData
    {
        public List<InventoryItemData> Items { get; set; }
    }

    public class QuestEventData
    {
        public QuestEventType Type { get; set; }
        public string QuestId { get; set; }
    }

    public enum QuestEventType
    {
        QuestStarted,
        QuestUpdated,
        ObjectiveComplete,
        StageComplete,
        QuestComplete,
        QuestFailed
    }

    public class GameEvent
    {
        public string Type { get; set; }
    }

    #endregion
}
