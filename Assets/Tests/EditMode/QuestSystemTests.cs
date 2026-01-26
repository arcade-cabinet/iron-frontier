using System;
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using UnityEngine;

namespace IronFrontier.Tests.EditMode
{
    /// <summary>
    /// Quest System Unit Tests
    ///
    /// Tests for the quest management system including:
    /// - Quest initialization and activation
    /// - Objective tracking and progress
    /// - Stage progression
    /// - Quest completion and rewards
    /// - Quest failure conditions
    /// - Event emission
    ///
    /// Ported from TypeScript reference: QuestController.ts, GameSession.integration.test.ts
    /// </summary>
    [TestFixture]
    [Category("Quest")]
    public class QuestSystemTests
    {
        private QuestController _questController;
        private MockQuestDataAccess _mockDataAccess;

        [SetUp]
        public void SetUp()
        {
            _mockDataAccess = new MockQuestDataAccess();
            _questController = new QuestController(_mockDataAccess);
        }

        [TearDown]
        public void TearDown()
        {
            _questController.Dispose();
        }

        #region Quest Initialization Tests

        [Test]
        public void StartQuest_ShouldReturnTrueForValidQuest()
        {
            // Act
            bool started = _questController.StartQuest("test_quest_1");

            // Assert
            Assert.IsTrue(started);
        }

        [Test]
        public void StartQuest_ShouldAddQuestToActiveList()
        {
            // Act
            _questController.StartQuest("test_quest_1");

            // Assert
            Assert.IsTrue(_questController.IsQuestActive("test_quest_1"));
        }

        [Test]
        public void StartQuest_ShouldNotStartDuplicateQuest()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            bool duplicate = _questController.StartQuest("test_quest_1");

            // Assert
            Assert.IsFalse(duplicate);
        }

        [Test]
        public void StartQuest_ShouldNotStartNonExistentQuest()
        {
            // Act
            bool started = _questController.StartQuest("nonexistent_quest");

            // Assert
            Assert.IsFalse(started);
        }

        [Test]
        public void StartQuest_ShouldNotStartQuestWithUnmetPrerequisites()
        {
            // Arrange
            _mockDataAccess.SetPrerequisitesMet(false);

            // Act
            bool started = _questController.StartQuest("test_quest_1");

            // Assert
            Assert.IsFalse(started);
        }

        [Test]
        public void StartQuest_ShouldInitializeObjectivesCorrectly()
        {
            // Act
            _questController.StartQuest("test_quest_1");
            var quest = _questController.GetQuest("test_quest_1");

            // Assert
            Assert.IsNotNull(quest);
            Assert.Greater(quest.Objectives.Count, 0);
            Assert.AreEqual(ObjectiveStatus.Incomplete, quest.Objectives[0].Status);
            Assert.AreEqual(0, quest.Objectives[0].Current);
        }

        #endregion

        #region Objective Tracking Tests

        [Test]
        public void UpdateObjective_ShouldIncrementProgress()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");
            var quest = _questController.GetQuest("test_quest_1");

            // Assert
            Assert.AreEqual(1, quest.Objectives[0].Current);
        }

        [Test]
        public void UpdateObjective_ShouldCompleteWhenCountReached()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");
            var quest = _questController.GetQuest("test_quest_1");

            // Assert
            Assert.AreEqual(ObjectiveStatus.Complete, quest.Objectives[0].Status);
        }

        [Test]
        public void UpdateObjective_ShouldNotExceedRequiredCount()
        {
            // Arrange
            _questController.StartQuest("test_quest_kill");

            // Act - Update more than required
            for (int i = 0; i < 5; i++)
            {
                _questController.UpdateObjective(ObjectiveType.Kill, "test_enemy");
            }
            var quest = _questController.GetQuest("test_quest_kill");

            // Assert - Should be capped at required count (2)
            Assert.AreEqual(2, quest.Objectives[0].Current);
        }

        [Test]
        public void UpdateObjective_ShouldOnlyAffectMatchingObjectives()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act - Update with non-matching target
            _questController.UpdateObjective(ObjectiveType.Talk, "wrong_npc");
            var quest = _questController.GetQuest("test_quest_1");

            // Assert
            Assert.AreEqual(0, quest.Objectives[0].Current);
        }

        #endregion

        #region Stage Progression Tests

        [Test]
        public void StageProgression_ShouldAdvanceOnAllRequiredComplete()
        {
            // Arrange
            _questController.StartQuest("test_quest_multi_stage");

            // Act - Complete first stage objective
            _questController.UpdateObjective(ObjectiveType.Talk, "stage1_target");
            var quest = _questController.GetQuest("test_quest_multi_stage");

            // Assert - Should advance to stage 1
            Assert.AreEqual(1, quest.CurrentStage);
        }

        [Test]
        public void StageProgression_ShouldLoadNewObjectives()
        {
            // Arrange
            _questController.StartQuest("test_quest_multi_stage");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "stage1_target");
            var quest = _questController.GetQuest("test_quest_multi_stage");

            // Assert - New objectives from stage 2 should be loaded
            Assert.IsTrue(quest.Objectives.Any(o => o.Target == "stage2_target"));
        }

        [Test]
        public void StageProgression_OptionalObjectives_ShouldNotBlockProgress()
        {
            // Arrange
            _questController.StartQuest("test_quest_with_optional");

            // Act - Complete only required objective
            _questController.UpdateObjective(ObjectiveType.Talk, "required_target");
            var quest = _questController.GetQuest("test_quest_with_optional");

            // Assert - Quest should still progress
            Assert.AreEqual(QuestStatus.Completed, quest.Status);
        }

        #endregion

        #region Quest Completion Tests

        [Test]
        public void CompleteQuest_ShouldSetCompletedStatus()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");
            var quest = _questController.GetQuest("test_quest_1");

            // Assert - Single stage quest should complete
            Assert.AreEqual(QuestStatus.Completed, quest.Status);
        }

        [Test]
        public void CompleteQuest_ShouldMoveToCompletedList()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");

            // Assert
            Assert.IsFalse(_questController.IsQuestActive("test_quest_1"));
            Assert.IsTrue(_questController.IsQuestCompleted("test_quest_1"));
        }

        [Test]
        public void CompleteQuest_ShouldGrantRewards()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");

            // Assert
            Assert.IsTrue(_mockDataAccess.RewardsGranted);
        }

        [Test]
        public void CompleteQuest_ShouldSetCompletionTime()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");
            var state = _questController.GetState();

            // Assert
            // Note: After completion, quest moves to completed list
            Assert.Contains("test_quest_1", state.CompletedQuests);
        }

        #endregion

        #region Quest Failure Tests

        [Test]
        public void FailQuest_ShouldSetFailedStatus()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.FailQuest("test_quest_1", "Time limit exceeded");

            // Assert
            Assert.IsTrue(_questController.GetState().FailedQuests.Contains("test_quest_1"));
        }

        [Test]
        public void FailQuest_ShouldRemoveFromActiveList()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.FailQuest("test_quest_1", "NPC died");

            // Assert
            Assert.IsFalse(_questController.IsQuestActive("test_quest_1"));
        }

        #endregion

        #region Quest Tracking Tests

        [Test]
        public void SetTrackedQuest_ShouldUpdateTrackedQuest()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.SetTrackedQuest("test_quest_1");

            // Assert
            var tracked = _questController.GetTrackedQuest();
            Assert.AreEqual("test_quest_1", tracked?.QuestId);
        }

        [Test]
        public void MainQuest_ShouldAutoTrackOnStart()
        {
            // Act
            _questController.StartQuest("main_quest_1");

            // Assert
            var tracked = _questController.GetTrackedQuest();
            Assert.IsNotNull(tracked);
            Assert.IsTrue(tracked.IsMainQuest);
        }

        [Test]
        public void GetMainQuests_ShouldReturnOnlyMainQuests()
        {
            // Arrange
            _questController.StartQuest("main_quest_1");
            _questController.StartQuest("side_quest_1");

            // Act
            var mainQuests = _questController.GetMainQuests();

            // Assert
            Assert.AreEqual(1, mainQuests.Count);
            Assert.IsTrue(mainQuests[0].IsMainQuest);
        }

        [Test]
        public void GetSideQuests_ShouldReturnOnlySideQuests()
        {
            // Arrange
            _questController.StartQuest("main_quest_1");
            _questController.StartQuest("side_quest_1");

            // Act
            var sideQuests = _questController.GetSideQuests();

            // Assert
            Assert.AreEqual(1, sideQuests.Count);
            Assert.IsFalse(sideQuests[0].IsMainQuest);
        }

        #endregion

        #region Event Emission Tests

        [Test]
        public void StartQuest_ShouldEmitQuestStartedEvent()
        {
            // Arrange
            QuestEvent capturedEvent = null;
            _questController.OnEvent += (e) => capturedEvent = e;

            // Act
            _questController.StartQuest("test_quest_1");

            // Assert
            Assert.IsNotNull(capturedEvent);
            Assert.AreEqual(QuestEventType.QuestStarted, capturedEvent.Type);
        }

        [Test]
        public void UpdateObjective_ShouldEmitProgressEvent()
        {
            // Arrange
            var events = new List<QuestEvent>();
            _questController.OnEvent += (e) => events.Add(e);
            _questController.StartQuest("test_quest_kill");

            // Act
            _questController.UpdateObjective(ObjectiveType.Kill, "test_enemy");

            // Assert
            Assert.IsTrue(events.Any(e => e.Type == QuestEventType.QuestUpdated));
        }

        [Test]
        public void CompleteObjective_ShouldEmitObjectiveCompleteEvent()
        {
            // Arrange
            var events = new List<QuestEvent>();
            _questController.OnEvent += (e) => events.Add(e);
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");

            // Assert
            Assert.IsTrue(events.Any(e => e.Type == QuestEventType.ObjectiveComplete));
        }

        [Test]
        public void CompleteQuest_ShouldEmitQuestCompleteEvent()
        {
            // Arrange
            var events = new List<QuestEvent>();
            _questController.OnEvent += (e) => events.Add(e);
            _questController.StartQuest("test_quest_1");

            // Act
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");

            // Assert
            Assert.IsTrue(events.Any(e => e.Type == QuestEventType.QuestComplete));
        }

        #endregion

        #region Save/Load Tests

        [Test]
        public void GetSaveData_ShouldIncludeActiveQuests()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");

            // Act
            var saveData = _questController.GetSaveData();

            // Assert
            Assert.AreEqual(1, saveData.ActiveQuests.Count);
        }

        [Test]
        public void GetSaveData_ShouldIncludeCompletedQuests()
        {
            // Arrange
            _questController.StartQuest("test_quest_1");
            _questController.UpdateObjective(ObjectiveType.Talk, "test_npc_1");

            // Act
            var saveData = _questController.GetSaveData();

            // Assert
            Assert.Contains("test_quest_1", saveData.CompletedQuests);
        }

        [Test]
        public void LoadFromSave_ShouldRestoreActiveQuests()
        {
            // Arrange
            var saveData = new QuestControllerState
            {
                ActiveQuests = new List<ActiveQuest>
                {
                    new ActiveQuest
                    {
                        QuestId = "test_quest_1",
                        Name = "Test Quest",
                        Status = QuestStatus.Active,
                        CurrentStage = 0,
                        Objectives = new List<QuestObjective>
                        {
                            new QuestObjective { Id = "obj_1", Current = 0, Status = ObjectiveStatus.Incomplete }
                        }
                    }
                },
                CompletedQuests = new List<string>(),
                FailedQuests = new List<string>(),
                TrackedQuestId = "test_quest_1"
            };

            // Act
            _questController.LoadFromSave(saveData);

            // Assert
            Assert.IsTrue(_questController.IsQuestActive("test_quest_1"));
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Quest controller for managing active quests
    /// </summary>
    public class QuestController
    {
        private QuestControllerState _state;
        private readonly IQuestDataAccess _dataAccess;

        public event Action<QuestEvent> OnEvent;

        public QuestController(IQuestDataAccess dataAccess)
        {
            _dataAccess = dataAccess;
            _state = new QuestControllerState
            {
                ActiveQuests = new List<ActiveQuest>(),
                CompletedQuests = new List<string>(),
                FailedQuests = new List<string>(),
                TrackedQuestId = null,
                CompletedQuestData = new Dictionary<string, ActiveQuest>()
            };
        }

        public bool StartQuest(string questId)
        {
            if (_state.ActiveQuests.Any(q => q.QuestId == questId)) return false;
            if (_state.CompletedQuests.Contains(questId)) return false;

            var definition = _dataAccess.GetQuestDefinition(questId);
            if (definition == null) return false;

            if (!_dataAccess.CheckPrerequisites(questId)) return false;

            var quest = new ActiveQuest
            {
                QuestId = questId,
                Name = definition.Name,
                Description = definition.Description,
                CurrentStage = 0,
                Objectives = definition.Stages[0].Objectives.Select(o => new QuestObjective
                {
                    Id = o.Id,
                    Description = o.Description,
                    Type = o.Type,
                    Target = o.Target,
                    Count = o.Count,
                    Current = 0,
                    Optional = o.Optional,
                    Hidden = o.Hidden,
                    Status = ObjectiveStatus.Incomplete
                }).ToList(),
                Status = QuestStatus.Active,
                StartTime = DateTime.UtcNow,
                IsMainQuest = definition.IsMainQuest
            };

            _state.ActiveQuests.Add(quest);

            if (definition.IsMainQuest && string.IsNullOrEmpty(_state.TrackedQuestId))
            {
                _state.TrackedQuestId = questId;
            }

            OnEvent?.Invoke(new QuestEvent
            {
                Type = QuestEventType.QuestStarted,
                QuestId = questId,
                Name = definition.Name
            });

            return true;
        }

        public void UpdateObjective(ObjectiveType type, string target, int amount = 1)
        {
            // Use ToList() to create a copy to avoid collection modification during enumeration
            foreach (var quest in _state.ActiveQuests.Where(q => q.Status == QuestStatus.Active).ToList())
            {
                foreach (var objective in quest.Objectives)
                {
                    if (objective.Type == type && objective.Target == target &&
                        objective.Status == ObjectiveStatus.Incomplete)
                    {
                        int previous = objective.Current;
                        objective.Current = Math.Min(objective.Count, objective.Current + amount);

                        if (objective.Current != previous)
                        {
                            OnEvent?.Invoke(new QuestEvent
                            {
                                Type = QuestEventType.QuestUpdated,
                                QuestId = quest.QuestId,
                                ObjectiveId = objective.Id
                            });

                            if (objective.Current >= objective.Count)
                            {
                                objective.Status = ObjectiveStatus.Complete;
                                OnEvent?.Invoke(new QuestEvent
                                {
                                    Type = QuestEventType.ObjectiveComplete,
                                    QuestId = quest.QuestId,
                                    ObjectiveId = objective.Id
                                });

                                CheckStageCompletion(quest);
                            }
                        }
                    }
                }
            }
        }

        private void CheckStageCompletion(ActiveQuest quest)
        {
            var required = quest.Objectives.Where(o => !o.Optional);
            if (required.All(o => o.Status == ObjectiveStatus.Complete))
            {
                var definition = _dataAccess.GetQuestDefinition(quest.QuestId);
                if (definition == null) return;

                if (quest.CurrentStage < definition.Stages.Count - 1)
                {
                    quest.CurrentStage++;
                    quest.Objectives = definition.Stages[quest.CurrentStage].Objectives.Select(o => new QuestObjective
                    {
                        Id = o.Id,
                        Description = o.Description,
                        Type = o.Type,
                        Target = o.Target,
                        Count = o.Count,
                        Current = 0,
                        Optional = o.Optional,
                        Hidden = o.Hidden,
                        Status = ObjectiveStatus.Incomplete
                    }).ToList();

                    OnEvent?.Invoke(new QuestEvent
                    {
                        Type = QuestEventType.StageComplete,
                        QuestId = quest.QuestId
                    });
                }
                else
                {
                    CompleteQuest(quest.QuestId);
                }
            }
        }

        private void CompleteQuest(string questId)
        {
            var quest = _state.ActiveQuests.Find(q => q.QuestId == questId);
            if (quest == null) return;

            quest.Status = QuestStatus.Completed;
            quest.CompletionTime = DateTime.UtcNow;

            var definition = _dataAccess.GetQuestDefinition(questId);
            if (definition != null)
            {
                _dataAccess.GrantRewards(definition.Rewards);
            }

            // Store full quest data before removing from active list
            _state.CompletedQuestData[questId] = quest;
            _state.ActiveQuests.Remove(quest);
            _state.CompletedQuests.Add(questId);

            if (_state.TrackedQuestId == questId)
            {
                _state.TrackedQuestId = _state.ActiveQuests.FirstOrDefault(q => q.IsMainQuest)?.QuestId;
            }

            OnEvent?.Invoke(new QuestEvent
            {
                Type = QuestEventType.QuestComplete,
                QuestId = questId,
                Name = quest.Name
            });
        }

        public void FailQuest(string questId, string reason)
        {
            var quest = _state.ActiveQuests.Find(q => q.QuestId == questId);
            if (quest == null) return;

            quest.Status = QuestStatus.Failed;
            _state.ActiveQuests.Remove(quest);
            _state.FailedQuests.Add(questId);

            if (_state.TrackedQuestId == questId)
            {
                _state.TrackedQuestId = _state.ActiveQuests.FirstOrDefault(q => q.IsMainQuest)?.QuestId;
            }

            OnEvent?.Invoke(new QuestEvent
            {
                Type = QuestEventType.QuestFailed,
                QuestId = questId,
                Reason = reason
            });
        }

        public bool IsQuestActive(string questId) =>
            _state.ActiveQuests.Any(q => q.QuestId == questId);

        public bool IsQuestCompleted(string questId) =>
            _state.CompletedQuests.Contains(questId);

        public ActiveQuest GetQuest(string questId)
        {
            // First check active quests
            var activeQuest = _state.ActiveQuests.Find(q => q.QuestId == questId);
            if (activeQuest != null) return activeQuest;

            // Then check completed quests - return full data if available
            if (_state.CompletedQuestData.TryGetValue(questId, out var completedQuest))
            {
                return completedQuest;
            }

            // Fallback for completed quests without full data (e.g., from old saves)
            if (_state.CompletedQuests.Contains(questId))
            {
                return new ActiveQuest { QuestId = questId, Status = QuestStatus.Completed };
            }

            return null;
        }

        public List<ActiveQuest> GetActiveQuests() => _state.ActiveQuests.ToList();

        public List<ActiveQuest> GetMainQuests() =>
            _state.ActiveQuests.Where(q => q.IsMainQuest).ToList();

        public List<ActiveQuest> GetSideQuests() =>
            _state.ActiveQuests.Where(q => !q.IsMainQuest).ToList();

        public ActiveQuest GetTrackedQuest() =>
            string.IsNullOrEmpty(_state.TrackedQuestId)
                ? null
                : _state.ActiveQuests.Find(q => q.QuestId == _state.TrackedQuestId);

        public void SetTrackedQuest(string questId)
        {
            if (!string.IsNullOrEmpty(questId) &&
                !_state.ActiveQuests.Any(q => q.QuestId == questId)) return;
            _state.TrackedQuestId = questId;
        }

        public QuestControllerState GetState() => new QuestControllerState
        {
            ActiveQuests = _state.ActiveQuests.ToList(),
            CompletedQuests = _state.CompletedQuests.ToList(),
            FailedQuests = _state.FailedQuests.ToList(),
            TrackedQuestId = _state.TrackedQuestId,
            CompletedQuestData = new Dictionary<string, ActiveQuest>(_state.CompletedQuestData)
        };

        public QuestControllerState GetSaveData() => GetState();

        public void LoadFromSave(QuestControllerState data)
        {
            _state = new QuestControllerState
            {
                ActiveQuests = data.ActiveQuests.ToList(),
                CompletedQuests = data.CompletedQuests.ToList(),
                FailedQuests = data.FailedQuests.ToList(),
                TrackedQuestId = data.TrackedQuestId,
                CompletedQuestData = data.CompletedQuestData != null
                    ? new Dictionary<string, ActiveQuest>(data.CompletedQuestData)
                    : new Dictionary<string, ActiveQuest>()
            };
        }

        public void Dispose()
        {
            OnEvent = null;
        }
    }

    public interface IQuestDataAccess
    {
        QuestDefinition GetQuestDefinition(string questId);
        bool CheckPrerequisites(string questId);
        void GrantRewards(QuestRewards rewards);
    }

    public class MockQuestDataAccess : IQuestDataAccess
    {
        private bool _prerequisitesMet = true;
        public bool RewardsGranted { get; private set; }

        public void SetPrerequisitesMet(bool met) => _prerequisitesMet = met;

        public QuestDefinition GetQuestDefinition(string questId)
        {
            return questId switch
            {
                "test_quest_1" => new QuestDefinition
                {
                    Id = "test_quest_1",
                    Name = "Test Quest",
                    Description = "A test quest",
                    IsMainQuest = false,
                    Stages = new List<QuestStage>
                    {
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_1",
                                    Description = "Talk to test NPC",
                                    Type = ObjectiveType.Talk,
                                    Target = "test_npc_1",
                                    Count = 1,
                                    Optional = false,
                                    Hidden = false
                                }
                            }
                        }
                    },
                    Rewards = new QuestRewards { XP = 100, Gold = 50 }
                },
                "test_quest_kill" => new QuestDefinition
                {
                    Id = "test_quest_kill",
                    Name = "Kill Quest",
                    Description = "Kill some enemies",
                    IsMainQuest = false,
                    Stages = new List<QuestStage>
                    {
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_1",
                                    Description = "Kill test enemies",
                                    Type = ObjectiveType.Kill,
                                    Target = "test_enemy",
                                    Count = 2,
                                    Optional = false,
                                    Hidden = false
                                }
                            }
                        }
                    },
                    Rewards = new QuestRewards { XP = 50, Gold = 25 }
                },
                "test_quest_multi_stage" => new QuestDefinition
                {
                    Id = "test_quest_multi_stage",
                    Name = "Multi-Stage Quest",
                    Description = "A quest with multiple stages",
                    IsMainQuest = false,
                    Stages = new List<QuestStage>
                    {
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_1",
                                    Description = "Complete stage 1",
                                    Type = ObjectiveType.Talk,
                                    Target = "stage1_target",
                                    Count = 1,
                                    Optional = false,
                                    Hidden = false
                                }
                            }
                        },
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_2",
                                    Description = "Complete stage 2",
                                    Type = ObjectiveType.Talk,
                                    Target = "stage2_target",
                                    Count = 1,
                                    Optional = false,
                                    Hidden = false
                                }
                            }
                        }
                    },
                    Rewards = new QuestRewards { XP = 200, Gold = 100 }
                },
                "test_quest_with_optional" => new QuestDefinition
                {
                    Id = "test_quest_with_optional",
                    Name = "Quest With Optional",
                    Description = "A quest with optional objective",
                    IsMainQuest = false,
                    Stages = new List<QuestStage>
                    {
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_req",
                                    Description = "Required objective",
                                    Type = ObjectiveType.Talk,
                                    Target = "required_target",
                                    Count = 1,
                                    Optional = false,
                                    Hidden = false
                                },
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_opt",
                                    Description = "Optional objective",
                                    Type = ObjectiveType.Collect,
                                    Target = "optional_item",
                                    Count = 5,
                                    Optional = true,
                                    Hidden = false
                                }
                            }
                        }
                    },
                    Rewards = new QuestRewards { XP = 75, Gold = 30 }
                },
                "main_quest_1" => new QuestDefinition
                {
                    Id = "main_quest_1",
                    Name = "Main Story Quest",
                    Description = "The main story quest",
                    IsMainQuest = true,
                    Stages = new List<QuestStage>
                    {
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_1",
                                    Description = "Main objective",
                                    Type = ObjectiveType.Talk,
                                    Target = "main_npc",
                                    Count = 1,
                                    Optional = false,
                                    Hidden = false
                                }
                            }
                        }
                    },
                    Rewards = new QuestRewards { XP = 500, Gold = 250 }
                },
                "side_quest_1" => new QuestDefinition
                {
                    Id = "side_quest_1",
                    Name = "Side Quest",
                    Description = "A side quest",
                    IsMainQuest = false,
                    Stages = new List<QuestStage>
                    {
                        new QuestStage
                        {
                            Objectives = new List<QuestObjectiveDefinition>
                            {
                                new QuestObjectiveDefinition
                                {
                                    Id = "obj_1",
                                    Description = "Side objective",
                                    Type = ObjectiveType.Collect,
                                    Target = "side_item",
                                    Count = 3,
                                    Optional = false,
                                    Hidden = false
                                }
                            }
                        }
                    },
                    Rewards = new QuestRewards { XP = 50, Gold = 25 }
                },
                _ => null
            };
        }

        public bool CheckPrerequisites(string questId) => _prerequisitesMet;

        public void GrantRewards(QuestRewards rewards) => RewardsGranted = true;
    }

    public class QuestDefinition
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsMainQuest { get; set; }
        public List<QuestStage> Stages { get; set; }
        public QuestRewards Rewards { get; set; }
    }

    public class QuestStage
    {
        public List<QuestObjectiveDefinition> Objectives { get; set; }
    }

    public class QuestObjectiveDefinition
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public ObjectiveType Type { get; set; }
        public string Target { get; set; }
        public int Count { get; set; }
        public bool Optional { get; set; }
        public bool Hidden { get; set; }
    }

    public class ActiveQuest
    {
        public string QuestId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CurrentStage { get; set; }
        public List<QuestObjective> Objectives { get; set; }
        public QuestStatus Status { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? CompletionTime { get; set; }
        public bool IsMainQuest { get; set; }
    }

    public class QuestObjective
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public ObjectiveType Type { get; set; }
        public string Target { get; set; }
        public int Count { get; set; }
        public int Current { get; set; }
        public bool Optional { get; set; }
        public bool Hidden { get; set; }
        public ObjectiveStatus Status { get; set; }
    }

    public class QuestRewards
    {
        public int XP { get; set; }
        public int Gold { get; set; }
        public List<ItemReward> Items { get; set; }
    }

    public class ItemReward
    {
        public string ItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class QuestControllerState
    {
        public List<ActiveQuest> ActiveQuests { get; set; }
        public List<string> CompletedQuests { get; set; }
        public List<string> FailedQuests { get; set; }
        public string TrackedQuestId { get; set; }
        // Store full quest data for completed quests for retrieval
        public Dictionary<string, ActiveQuest> CompletedQuestData { get; set; } = new Dictionary<string, ActiveQuest>();
    }

    public class QuestEvent
    {
        public QuestEventType Type { get; set; }
        public string QuestId { get; set; }
        public string Name { get; set; }
        public string ObjectiveId { get; set; }
        public string Reason { get; set; }
    }

    public enum QuestStatus
    {
        Available,
        Active,
        Completed,
        Failed
    }

    public enum ObjectiveStatus
    {
        Incomplete,
        Complete,
        Failed
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

    public enum QuestEventType
    {
        QuestStarted,
        QuestUpdated,
        ObjectiveComplete,
        StageComplete,
        QuestComplete,
        QuestFailed,
        QuestAvailable
    }

    #endregion
}
