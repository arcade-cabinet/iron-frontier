using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Quests
{
    /// <summary>
    /// Event arguments for quest-related events.
    /// </summary>
    public class QuestEventArgs : EventArgs
    {
        /// <summary>The quest involved in the event.</summary>
        public QuestData Quest { get; }

        /// <summary>The quest tracker for the active quest.</summary>
        public QuestTracker Tracker { get; }

        public QuestEventArgs(QuestData quest, QuestTracker tracker = null)
        {
            Quest = quest;
            Tracker = tracker;
        }
    }

    /// <summary>
    /// Event arguments for objective progress updates.
    /// </summary>
    public class ObjectiveProgressEventArgs : EventArgs
    {
        /// <summary>The quest containing the objective.</summary>
        public QuestData Quest { get; }

        /// <summary>The objective that was updated.</summary>
        public QuestObjective Objective { get; }

        /// <summary>Previous progress value.</summary>
        public int PreviousProgress { get; }

        /// <summary>New progress value.</summary>
        public int CurrentProgress { get; }

        /// <summary>Whether the objective is now complete.</summary>
        public bool IsComplete { get; }

        public ObjectiveProgressEventArgs(QuestData quest, QuestObjective objective,
            int previousProgress, int currentProgress)
        {
            Quest = quest;
            Objective = objective;
            PreviousProgress = previousProgress;
            CurrentProgress = currentProgress;
            IsComplete = currentProgress >= objective.count;
        }
    }

    /// <summary>
    /// Event arguments for quest stage changes.
    /// </summary>
    public class QuestStageEventArgs : EventArgs
    {
        /// <summary>The quest involved.</summary>
        public QuestData Quest { get; }

        /// <summary>Previous stage index.</summary>
        public int PreviousStage { get; }

        /// <summary>New stage index.</summary>
        public int CurrentStage { get; }

        /// <summary>The new stage data.</summary>
        public QuestStage StageData { get; }

        public QuestStageEventArgs(QuestData quest, int previousStage, int currentStage, QuestStage stageData)
        {
            Quest = quest;
            PreviousStage = previousStage;
            CurrentStage = currentStage;
            StageData = stageData;
        }
    }

    /// <summary>
    /// Singleton quest manager that tracks all active and completed quests.
    /// Handles quest progression, objective tracking, and reward distribution.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript quest system in quests.ts and webGameStore.ts.
    /// Integrates with EventBus for cross-system communication and SaveSystem for persistence.
    /// </remarks>
    public class QuestManager : MonoBehaviour
    {
        #region Singleton

        private static QuestManager _instance;

        /// <summary>
        /// Global singleton instance of QuestManager.
        /// </summary>
        public static QuestManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<QuestManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[QuestManager]");
                        _instance = go.AddComponent<QuestManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when a new quest is started.</summary>
        public event EventHandler<QuestEventArgs> OnQuestStarted;

        /// <summary>Fired when a quest is completed successfully.</summary>
        public event EventHandler<QuestEventArgs> OnQuestCompleted;

        /// <summary>Fired when a quest fails.</summary>
        public event EventHandler<QuestEventArgs> OnQuestFailed;

        /// <summary>Fired when a quest is abandoned by the player.</summary>
        public event EventHandler<QuestEventArgs> OnQuestAbandoned;

        /// <summary>Fired when any quest is updated (objective progress, stage change, etc.).</summary>
        public event EventHandler<QuestEventArgs> OnQuestUpdated;

        /// <summary>Fired when an objective's progress changes.</summary>
        public event EventHandler<ObjectiveProgressEventArgs> OnObjectiveProgress;

        /// <summary>Fired when an objective is completed.</summary>
        public event EventHandler<ObjectiveProgressEventArgs> OnObjectiveCompleted;

        /// <summary>Fired when a quest advances to a new stage.</summary>
        public event EventHandler<QuestStageEventArgs> OnStageAdvanced;

        /// <summary>Fired when rewards are granted.</summary>
        public event EventHandler<QuestRewards> OnRewardsGranted;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Maximum number of active quests")]
        private int maxActiveQuests = 20;

        [SerializeField]
        [Tooltip("Quest database containing all available quests")]
        private QuestDatabase questDatabase;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Active quest trackers keyed by quest ID
        private readonly Dictionary<string, QuestTracker> _activeQuests = new Dictionary<string, QuestTracker>();

        // Completed quest IDs
        private readonly HashSet<string> _completedQuests = new HashSet<string>();

        // Failed quest IDs
        private readonly HashSet<string> _failedQuests = new HashSet<string>();

        // Abandoned quest IDs
        private readonly HashSet<string> _abandonedQuests = new HashSet<string>();

        // Quest flags for conditional checks
        private readonly Dictionary<string, bool> _questFlags = new Dictionary<string, bool>();

        // Tracked NPCs talked to
        private readonly HashSet<string> _talkedToNpcs = new HashSet<string>();

        // Tracked locations visited
        private readonly HashSet<string> _visitedLocations = new HashSet<string>();

        // Tracked enemies killed (enemyId -> count)
        private readonly Dictionary<string, int> _enemiesKilled = new Dictionary<string, int>();

        // Tracked items collected (for quest tracking)
        private readonly Dictionary<string, int> _itemsCollected = new Dictionary<string, int>();

        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>Number of currently active quests.</summary>
        public int ActiveQuestCount => _activeQuests.Count;

        /// <summary>Number of completed quests.</summary>
        public int CompletedQuestCount => _completedQuests.Count;

        /// <summary>Whether the quest log is full.</summary>
        public bool IsQuestLogFull => _activeQuests.Count >= maxActiveQuests;

        /// <summary>All active quest trackers.</summary>
        public IReadOnlyCollection<QuestTracker> ActiveQuests => _activeQuests.Values;

        /// <summary>All completed quest IDs.</summary>
        public IReadOnlyCollection<string> CompletedQuestIds => _completedQuests;

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

            Log("QuestManager awakened");
        }

        private void Start()
        {
            Initialize();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                UnregisterFromSaveSystem();
                UnsubscribeFromEvents();
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the quest manager.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            RegisterWithSaveSystem();
            SubscribeToEvents();

            _isInitialized = true;
            Log("QuestManager initialized");
        }

        private void RegisterWithSaveSystem()
        {
            if (SaveSystem.Instance == null) return;

            SaveSystem.Instance.RegisterSaveProvider("quests", GetSaveData);
            SaveSystem.Instance.RegisterLoadConsumer("quests", LoadSaveData);
            Log("Registered with SaveSystem");
        }

        private void UnregisterFromSaveSystem()
        {
            SaveSystem.Instance?.Unregister("quests");
        }

        private void SubscribeToEvents()
        {
            if (EventBus.Instance == null) return;

            EventBus.Instance.Subscribe<string>(GameEvents.DialogueEnded, OnDialogueEnded);
            EventBus.Instance.Subscribe<EnemyKilledEventData>(GameEvents.CombatVictory, OnEnemyKilled);
            EventBus.Instance.Subscribe<string>(GameEvents.TownEntered, OnLocationVisited);
            EventBus.Instance.Subscribe<string>(GameEvents.BuildingEntered, OnLocationVisited);
            EventBus.Instance.Subscribe<ItemEventData>(GameEvents.ItemAdded, OnItemCollected);
        }

        private void UnsubscribeFromEvents()
        {
            // EventBus handles cleanup on destroy
        }

        #endregion

        #region Quest Management

        /// <summary>
        /// Start a new quest.
        /// </summary>
        /// <param name="questId">ID of the quest to start.</param>
        /// <returns>True if the quest was started successfully.</returns>
        public bool StartQuest(string questId)
        {
            if (string.IsNullOrEmpty(questId))
            {
                LogWarning("Cannot start quest with null or empty ID");
                return false;
            }

            // Check if already active
            if (_activeQuests.ContainsKey(questId))
            {
                Log($"Quest {questId} is already active");
                return false;
            }

            // Check if already completed (and not repeatable)
            if (_completedQuests.Contains(questId))
            {
                var completedQuest = GetQuestData(questId);
                if (completedQuest != null && !completedQuest.repeatable)
                {
                    Log($"Quest {questId} is already completed and not repeatable");
                    return false;
                }
            }

            // Check quest log capacity
            if (IsQuestLogFull)
            {
                LogWarning($"Cannot start quest {questId}: quest log is full");
                EventBus.Instance?.Publish(GameEvents.NotificationWarning, "Quest log is full!");
                return false;
            }

            // Get quest data
            var questData = GetQuestData(questId);
            if (questData == null)
            {
                LogWarning($"Quest not found: {questId}");
                return false;
            }

            // Check prerequisites
            if (!CheckPrerequisites(questData))
            {
                Log($"Prerequisites not met for quest: {questId}");
                return false;
            }

            // Create tracker and start quest
            var tracker = new QuestTracker(questData);
            _activeQuests[questId] = tracker;

            // Set quest flag
            SetQuestFlag($"quest_{questId}_started", true);

            Log($"Started quest: {questData.title}");

            // Fire events
            OnQuestStarted?.Invoke(this, new QuestEventArgs(questData, tracker));
            OnQuestUpdated?.Invoke(this, new QuestEventArgs(questData, tracker));
            EventBus.Instance?.Publish(GameEvents.QuestStarted, questId);
            EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"New Quest: {questData.title}");

            return true;
        }

        /// <summary>
        /// Get a quest tracker by quest ID.
        /// </summary>
        /// <param name="questId">The quest ID to look up.</param>
        /// <returns>The quest tracker, or null if not found.</returns>
        public QuestTracker GetQuestTracker(string questId)
        {
            return _activeQuests.TryGetValue(questId, out var tracker) ? tracker : null;
        }

        /// <summary>
        /// Check if a quest is currently active.
        /// </summary>
        /// <param name="questId">The quest ID to check.</param>
        /// <returns>True if the quest is active.</returns>
        public bool IsQuestActive(string questId)
        {
            return _activeQuests.ContainsKey(questId);
        }

        /// <summary>
        /// Check if a quest has been completed.
        /// </summary>
        /// <param name="questId">The quest ID to check.</param>
        /// <returns>True if the quest is completed.</returns>
        public bool IsQuestCompleted(string questId)
        {
            return _completedQuests.Contains(questId);
        }

        /// <summary>
        /// Abandon an active quest.
        /// </summary>
        /// <param name="questId">The quest ID to abandon.</param>
        /// <returns>True if the quest was abandoned.</returns>
        public bool AbandonQuest(string questId)
        {
            if (!_activeQuests.TryGetValue(questId, out var tracker))
            {
                LogWarning($"Cannot abandon quest {questId}: not active");
                return false;
            }

            var questData = tracker.QuestData;
            _activeQuests.Remove(questId);
            _abandonedQuests.Add(questId);

            SetQuestFlag($"quest_{questId}_abandoned", true);

            Log($"Abandoned quest: {questData.title}");

            OnQuestAbandoned?.Invoke(this, new QuestEventArgs(questData, tracker));
            EventBus.Instance?.Publish(GameEvents.NotificationInfo, $"Quest Abandoned: {questData.title}");

            return true;
        }

        /// <summary>
        /// Fail an active quest.
        /// </summary>
        /// <param name="questId">The quest ID to fail.</param>
        /// <param name="reason">Optional reason for failure.</param>
        public void FailQuest(string questId, string reason = null)
        {
            if (!_activeQuests.TryGetValue(questId, out var tracker))
            {
                LogWarning($"Cannot fail quest {questId}: not active");
                return;
            }

            var questData = tracker.QuestData;
            tracker.SetFailed();
            _activeQuests.Remove(questId);
            _failedQuests.Add(questId);

            SetQuestFlag($"quest_{questId}_failed", true);

            Log($"Failed quest: {questData.title}" + (reason != null ? $" - {reason}" : ""));

            OnQuestFailed?.Invoke(this, new QuestEventArgs(questData, tracker));
            EventBus.Instance?.Publish(GameEvents.QuestFailed, questId);
            EventBus.Instance?.Publish(GameEvents.NotificationError,
                $"Quest Failed: {questData.title}" + (reason != null ? $"\n{reason}" : ""));
        }

        /// <summary>
        /// Complete a quest and grant rewards.
        /// </summary>
        /// <param name="questId">The quest ID to complete.</param>
        private void CompleteQuest(string questId)
        {
            if (!_activeQuests.TryGetValue(questId, out var tracker))
            {
                LogWarning($"Cannot complete quest {questId}: not active");
                return;
            }

            var questData = tracker.QuestData;
            tracker.SetCompleted();
            _activeQuests.Remove(questId);
            _completedQuests.Add(questId);

            SetQuestFlag($"quest_{questId}_completed", true);

            Log($"Completed quest: {questData.title}");

            // Grant final rewards
            GrantRewards(questData.rewards);

            // Fire events
            OnQuestCompleted?.Invoke(this, new QuestEventArgs(questData, tracker));
            EventBus.Instance?.Publish(GameEvents.QuestCompleted, questId);
            EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"Quest Complete: {questData.title}");

            // Check for quests unlocked by this completion
            CheckUnlockedQuests(questData.rewards.unlocksQuests);
        }

        #endregion

        #region Objective Progression

        /// <summary>
        /// Progress an objective by a given amount.
        /// </summary>
        /// <param name="questId">The quest containing the objective.</param>
        /// <param name="objectiveId">The objective ID to progress.</param>
        /// <param name="amount">Amount to progress by (default 1).</param>
        /// <returns>True if progress was made.</returns>
        public bool ProgressObjective(string questId, string objectiveId, int amount = 1)
        {
            if (!_activeQuests.TryGetValue(questId, out var tracker))
            {
                return false;
            }

            var previousProgress = tracker.GetObjectiveProgress(objectiveId);
            var objective = tracker.GetObjective(objectiveId);

            if (objective == null || tracker.IsObjectiveComplete(objectiveId))
            {
                return false;
            }

            tracker.AddProgress(objectiveId, amount);
            var currentProgress = tracker.GetObjectiveProgress(objectiveId);

            Log($"Objective progress: {questId}/{objectiveId} - {currentProgress}/{objective.Value.count}");

            // Fire progress event
            var progressArgs = new ObjectiveProgressEventArgs(
                tracker.QuestData, objective.Value, previousProgress, currentProgress);
            OnObjectiveProgress?.Invoke(this, progressArgs);
            OnQuestUpdated?.Invoke(this, new QuestEventArgs(tracker.QuestData, tracker));
            EventBus.Instance?.Publish(GameEvents.QuestUpdated, questId);

            // Check if objective just completed
            if (progressArgs.IsComplete)
            {
                OnObjectiveCompleted?.Invoke(this, progressArgs);
                CheckStageCompletion(tracker);
            }

            return true;
        }

        /// <summary>
        /// Progress all objectives matching a target.
        /// Used for automatic progression from game events.
        /// </summary>
        /// <param name="objectiveType">Type of objective to match.</param>
        /// <param name="target">Target identifier to match.</param>
        /// <param name="amount">Amount to progress by.</param>
        public void ProgressObjectivesByTarget(ObjectiveType objectiveType, string target, int amount = 1)
        {
            foreach (var kvp in _activeQuests)
            {
                var tracker = kvp.Value;
                var currentStage = tracker.GetCurrentStage();

                if (currentStage == null) continue;

                foreach (var objective in currentStage.Value.objectives)
                {
                    if (objective.type == objectiveType && objective.target == target)
                    {
                        ProgressObjective(kvp.Key, objective.id, amount);
                    }
                }
            }
        }

        private void CheckStageCompletion(QuestTracker tracker)
        {
            if (!tracker.IsCurrentStageComplete())
            {
                return;
            }

            var previousStage = tracker.CurrentStageIndex;

            // Grant stage rewards
            var stage = tracker.GetCurrentStage();
            if (stage.HasValue)
            {
                GrantRewards(stage.Value.stageRewards);
            }

            // Advance to next stage
            if (tracker.AdvanceStage())
            {
                var newStage = tracker.GetCurrentStage();
                if (newStage.HasValue)
                {
                    Log($"Quest {tracker.QuestData.id} advanced to stage {tracker.CurrentStageIndex}");

                    var stageArgs = new QuestStageEventArgs(
                        tracker.QuestData, previousStage, tracker.CurrentStageIndex, newStage.Value);
                    OnStageAdvanced?.Invoke(this, stageArgs);
                    OnQuestUpdated?.Invoke(this, new QuestEventArgs(tracker.QuestData, tracker));

                    if (!string.IsNullOrEmpty(newStage.Value.onStartText))
                    {
                        EventBus.Instance?.Publish(GameEvents.NotificationInfo, newStage.Value.onStartText);
                    }
                }
            }
            else
            {
                // All stages complete - finish quest
                CompleteQuest(tracker.QuestData.id);
            }
        }

        #endregion

        #region Event Handlers

        private void OnDialogueEnded(string npcId)
        {
            if (string.IsNullOrEmpty(npcId)) return;

            _talkedToNpcs.Add(npcId);
            ProgressObjectivesByTarget(ObjectiveType.Talk, npcId);
        }

        private void OnEnemyKilled(EnemyKilledEventData data)
        {
            if (data == null || string.IsNullOrEmpty(data.EnemyId)) return;

            var enemyId = data.EnemyId;
            _enemiesKilled[enemyId] = _enemiesKilled.GetValueOrDefault(enemyId, 0) + 1;
            ProgressObjectivesByTarget(ObjectiveType.Kill, enemyId);

            // Also check enemy type
            if (!string.IsNullOrEmpty(data.EnemyType))
            {
                ProgressObjectivesByTarget(ObjectiveType.Kill, data.EnemyType);
            }
        }

        private void OnLocationVisited(string locationId)
        {
            if (string.IsNullOrEmpty(locationId)) return;

            _visitedLocations.Add(locationId);
            ProgressObjectivesByTarget(ObjectiveType.Visit, locationId);
        }

        private void OnItemCollected(ItemEventData data)
        {
            if (data == null || string.IsNullOrEmpty(data.ItemId)) return;

            var itemId = data.ItemId;
            _itemsCollected[itemId] = _itemsCollected.GetValueOrDefault(itemId, 0) + data.Quantity;
            ProgressObjectivesByTarget(ObjectiveType.Collect, itemId, data.Quantity);
        }

        #endregion

        #region Prerequisites

        /// <summary>
        /// Check if prerequisites are met for a quest.
        /// </summary>
        /// <param name="questData">The quest to check.</param>
        /// <returns>True if all prerequisites are met.</returns>
        public bool CheckPrerequisites(QuestData questData)
        {
            if (questData == null) return false;

            var prereqs = questData.prerequisites;

            // Check completed quests
            if (prereqs.completedQuestIds != null)
            {
                foreach (var prereqId in prereqs.completedQuestIds)
                {
                    if (!_completedQuests.Contains(prereqId))
                    {
                        return false;
                    }
                }
            }

            // Check minimum level
            if (prereqs.minLevel > 1)
            {
                // TODO: Integrate with player stats system
                // For now, assume level check passes
            }

            // Check required items
            if (prereqs.requiredItemIds != null)
            {
                // TODO: Integrate with inventory system
            }

            // Check faction reputation
            if (prereqs.factionReputation != null && prereqs.factionReputation.Count > 0)
            {
                // TODO: Integrate with reputation system
            }

            return true;
        }

        /// <summary>
        /// Get all quests available to start (prerequisites met, not active/completed).
        /// </summary>
        /// <returns>List of available quests.</returns>
        public List<QuestData> GetAvailableQuests()
        {
            var available = new List<QuestData>();

            if (questDatabase == null) return available;

            foreach (var quest in questDatabase.GetAllQuests())
            {
                if (_activeQuests.ContainsKey(quest.id)) continue;
                if (_completedQuests.Contains(quest.id) && !quest.repeatable) continue;
                if (!CheckPrerequisites(quest)) continue;

                available.Add(quest);
            }

            return available;
        }

        /// <summary>
        /// Get quests available from a specific NPC.
        /// </summary>
        /// <param name="npcId">The NPC ID to check.</param>
        /// <returns>List of quests the NPC can give.</returns>
        public List<QuestData> GetQuestsFromNPC(string npcId)
        {
            var quests = new List<QuestData>();

            foreach (var quest in GetAvailableQuests())
            {
                if (quest.giverNpcId == npcId)
                {
                    quests.Add(quest);
                }
            }

            return quests;
        }

        #endregion

        #region Rewards

        /// <summary>
        /// Grant rewards to the player.
        /// </summary>
        /// <param name="rewards">The rewards to grant.</param>
        private void GrantRewards(QuestRewards rewards)
        {
            if (rewards.xp > 0)
            {
                EventBus.Instance?.Publish<int>(GameEvents.PlayerLevelUp, rewards.xp);
                Log($"Granted {rewards.xp} XP");
            }

            if (rewards.gold > 0)
            {
                EventBus.Instance?.Publish<int>(GameEvents.GoldChanged, rewards.gold);
                Log($"Granted {rewards.gold} gold");
            }

            if (rewards.items != null)
            {
                foreach (var rewardItem in rewards.items)
                {
                    var itemData = new ItemEventData
                    {
                        ItemId = rewardItem.itemId ?? rewardItem.item?.id,
                        Quantity = rewardItem.quantity
                    };
                    EventBus.Instance?.Publish(GameEvents.ItemAdded, itemData);
                    Log($"Granted item: {itemData.ItemId} x{itemData.Quantity}");
                }
            }

            if (rewards.reputation != null)
            {
                foreach (var repChange in rewards.reputation)
                {
                    EventBus.Instance?.Publish(GameEvents.ReputationChanged, repChange);
                    Log($"Reputation change: {repChange.factionId} {repChange.amount:+#;-#}");
                }
            }

            OnRewardsGranted?.Invoke(this, rewards);
        }

        private void CheckUnlockedQuests(List<string> unlockedQuestIds)
        {
            if (unlockedQuestIds == null) return;

            foreach (var questId in unlockedQuestIds)
            {
                // Just set a flag - quests can check this
                SetQuestFlag($"quest_{questId}_unlocked", true);
            }
        }

        #endregion

        #region Quest Flags

        /// <summary>
        /// Set a quest flag.
        /// </summary>
        /// <param name="flag">Flag name.</param>
        /// <param name="value">Flag value.</param>
        public void SetQuestFlag(string flag, bool value)
        {
            _questFlags[flag] = value;
            Log($"Quest flag set: {flag} = {value}");
        }

        /// <summary>
        /// Get a quest flag value.
        /// </summary>
        /// <param name="flag">Flag name.</param>
        /// <returns>Flag value (false if not set).</returns>
        public bool GetQuestFlag(string flag)
        {
            return _questFlags.TryGetValue(flag, out var value) && value;
        }

        /// <summary>
        /// Check if player has talked to an NPC.
        /// </summary>
        /// <param name="npcId">The NPC ID to check.</param>
        /// <returns>True if talked to.</returns>
        public bool HasTalkedToNPC(string npcId)
        {
            return _talkedToNpcs.Contains(npcId);
        }

        /// <summary>
        /// Check if player has visited a location.
        /// </summary>
        /// <param name="locationId">The location ID to check.</param>
        /// <returns>True if visited.</returns>
        public bool HasVisitedLocation(string locationId)
        {
            return _visitedLocations.Contains(locationId);
        }

        /// <summary>
        /// Get the number of a specific enemy type killed.
        /// </summary>
        /// <param name="enemyId">The enemy ID to check.</param>
        /// <returns>Number killed.</returns>
        public int GetEnemiesKilled(string enemyId)
        {
            return _enemiesKilled.GetValueOrDefault(enemyId, 0);
        }

        #endregion

        #region Data Access

        private QuestData GetQuestData(string questId)
        {
            if (questDatabase != null)
            {
                return questDatabase.GetQuest(questId);
            }

            // Fallback: try to load from Resources
            return Resources.Load<QuestData>($"Quests/{questId}");
        }

        /// <summary>
        /// Set the quest database.
        /// </summary>
        /// <param name="database">The quest database to use.</param>
        public void SetQuestDatabase(QuestDatabase database)
        {
            questDatabase = database;
        }

        #endregion

        #region Save/Load

        private string GetSaveData()
        {
            var saveData = new QuestManagerSaveData
            {
                activeQuests = new List<QuestTrackerSaveData>(),
                completedQuests = _completedQuests.ToList(),
                failedQuests = _failedQuests.ToList(),
                abandonedQuests = _abandonedQuests.ToList(),
                questFlags = new List<QuestFlagEntry>(),
                talkedToNpcs = _talkedToNpcs.ToList(),
                visitedLocations = _visitedLocations.ToList(),
                enemiesKilled = new List<StringIntPair>(),
                itemsCollected = new List<StringIntPair>()
            };

            // Save active quest trackers
            foreach (var kvp in _activeQuests)
            {
                saveData.activeQuests.Add(kvp.Value.GetSaveData());
            }

            // Save quest flags
            foreach (var kvp in _questFlags)
            {
                saveData.questFlags.Add(new QuestFlagEntry { key = kvp.Key, value = kvp.Value });
            }

            // Save enemy kills
            foreach (var kvp in _enemiesKilled)
            {
                saveData.enemiesKilled.Add(new StringIntPair { key = kvp.Key, value = kvp.Value });
            }

            // Save items collected
            foreach (var kvp in _itemsCollected)
            {
                saveData.itemsCollected.Add(new StringIntPair { key = kvp.Key, value = kvp.Value });
            }

            return JsonUtility.ToJson(saveData);
        }

        private void LoadSaveData(string json)
        {
            if (string.IsNullOrEmpty(json)) return;

            try
            {
                var saveData = JsonUtility.FromJson<QuestManagerSaveData>(json);

                // Clear existing state
                _activeQuests.Clear();
                _completedQuests.Clear();
                _failedQuests.Clear();
                _abandonedQuests.Clear();
                _questFlags.Clear();
                _talkedToNpcs.Clear();
                _visitedLocations.Clear();
                _enemiesKilled.Clear();
                _itemsCollected.Clear();

                // Restore active quests
                if (saveData.activeQuests != null)
                {
                    foreach (var trackerData in saveData.activeQuests)
                    {
                        var questData = GetQuestData(trackerData.questId);
                        if (questData != null)
                        {
                            var tracker = new QuestTracker(questData);
                            tracker.LoadSaveData(trackerData);
                            _activeQuests[trackerData.questId] = tracker;
                        }
                    }
                }

                // Restore sets
                if (saveData.completedQuests != null)
                    _completedQuests.UnionWith(saveData.completedQuests);
                if (saveData.failedQuests != null)
                    _failedQuests.UnionWith(saveData.failedQuests);
                if (saveData.abandonedQuests != null)
                    _abandonedQuests.UnionWith(saveData.abandonedQuests);
                if (saveData.talkedToNpcs != null)
                    _talkedToNpcs.UnionWith(saveData.talkedToNpcs);
                if (saveData.visitedLocations != null)
                    _visitedLocations.UnionWith(saveData.visitedLocations);

                // Restore dictionaries
                if (saveData.questFlags != null)
                {
                    foreach (var entry in saveData.questFlags)
                        _questFlags[entry.key] = entry.value;
                }
                if (saveData.enemiesKilled != null)
                {
                    foreach (var entry in saveData.enemiesKilled)
                        _enemiesKilled[entry.key] = entry.value;
                }
                if (saveData.itemsCollected != null)
                {
                    foreach (var entry in saveData.itemsCollected)
                        _itemsCollected[entry.key] = entry.value;
                }

                Log("Quest data loaded successfully");
            }
            catch (Exception e)
            {
                Debug.LogError($"[QuestManager] Failed to load save data: {e}");
            }
        }

        /// <summary>
        /// Reset all quest state (for new game).
        /// </summary>
        public void ResetToDefault()
        {
            _activeQuests.Clear();
            _completedQuests.Clear();
            _failedQuests.Clear();
            _abandonedQuests.Clear();
            _questFlags.Clear();
            _talkedToNpcs.Clear();
            _visitedLocations.Clear();
            _enemiesKilled.Clear();
            _itemsCollected.Clear();

            Log("Quest state reset to default");
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[QuestManager] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[QuestManager] {message}");
        }

        #endregion
    }

    #region Save Data Classes

    [Serializable]
    public class QuestManagerSaveData
    {
        public List<QuestTrackerSaveData> activeQuests;
        public List<string> completedQuests;
        public List<string> failedQuests;
        public List<string> abandonedQuests;
        public List<QuestFlagEntry> questFlags;
        public List<string> talkedToNpcs;
        public List<string> visitedLocations;
        public List<StringIntPair> enemiesKilled;
        public List<StringIntPair> itemsCollected;
    }

    [Serializable]
    public struct QuestFlagEntry
    {
        public string key;
        public bool value;
    }

    [Serializable]
    public struct StringIntPair
    {
        public string key;
        public int value;
    }

    #endregion

    #region Event Data Classes

    /// <summary>
    /// Event data for enemy killed events.
    /// </summary>
    public class EnemyKilledEventData
    {
        public string EnemyId { get; set; }
        public string EnemyType { get; set; }
        public int XpGained { get; set; }
    }

    /// <summary>
    /// Event data for item events.
    /// </summary>
    public class ItemEventData
    {
        public string ItemId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    #endregion
}
