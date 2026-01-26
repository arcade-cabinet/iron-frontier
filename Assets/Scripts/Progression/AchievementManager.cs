using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Progression
{
    /// <summary>
    /// Event args for achievement unlocked events
    /// </summary>
    public class AchievementUnlockedEventArgs : EventArgs
    {
        public AchievementData Achievement { get; }
        public PlayerAchievementState State { get; }
        public int TotalScore { get; }
        public int TotalUnlocked { get; }

        public AchievementUnlockedEventArgs(AchievementData achievement, PlayerAchievementState state, int totalScore, int totalUnlocked)
        {
            Achievement = achievement;
            State = state;
            TotalScore = totalScore;
            TotalUnlocked = totalUnlocked;
        }
    }

    /// <summary>
    /// Event args for achievement progress updated events
    /// </summary>
    public class AchievementProgressEventArgs : EventArgs
    {
        public AchievementData Achievement { get; }
        public int OldProgress { get; }
        public int NewProgress { get; }
        public int MaxProgress { get; }

        public AchievementProgressEventArgs(AchievementData achievement, int oldProgress, int newProgress, int maxProgress)
        {
            Achievement = achievement;
            OldProgress = oldProgress;
            NewProgress = newProgress;
            MaxProgress = maxProgress;
        }
    }

    /// <summary>
    /// Manages achievement tracking, unlocking, and persistence
    /// </summary>
    public class AchievementManager : MonoBehaviour
    {
        public static AchievementManager Instance { get; private set; }

        [Header("Configuration")]
        [SerializeField] private string achievementsJsonPath = "Data/achievements";
        [SerializeField] private string saveKey = "PlayerAchievements";
        [SerializeField] private bool debugMode = false;

        // Achievement data
        private List<AchievementData> allAchievements = new List<AchievementData>();
        private Dictionary<string, AchievementData> achievementsById = new Dictionary<string, AchievementData>();
        private Dictionary<AchievementCategory, List<AchievementData>> achievementsByCategory = new Dictionary<AchievementCategory, List<AchievementData>>();
        private Dictionary<AchievementRarity, List<AchievementData>> achievementsByRarity = new Dictionary<AchievementRarity, List<AchievementData>>();

        // Player state
        private PlayerAchievementSaveData playerData;
        private Dictionary<string, PlayerAchievementState> statesById = new Dictionary<string, PlayerAchievementState>();

        // Events
        public event EventHandler<AchievementUnlockedEventArgs> OnAchievementUnlocked;
        public event EventHandler<AchievementProgressEventArgs> OnProgressUpdated;
        public event EventHandler OnAchievementsLoaded;

        // Statistics
        public int TotalAchievements => allAchievements.Count;
        public int UnlockedCount => playerData?.totalUnlocked ?? 0;
        public int TotalScore => playerData?.totalScore ?? 0;
        public int TotalPossiblePoints { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeCategories();
            LoadAchievementData();
            LoadPlayerData();
        }

        private void InitializeCategories()
        {
            foreach (AchievementCategory category in Enum.GetValues(typeof(AchievementCategory)))
            {
                achievementsByCategory[category] = new List<AchievementData>();
            }

            foreach (AchievementRarity rarity in Enum.GetValues(typeof(AchievementRarity)))
            {
                achievementsByRarity[rarity] = new List<AchievementData>();
            }
        }

        /// <summary>
        /// Load achievement definitions from JSON
        /// </summary>
        private void LoadAchievementData()
        {
            try
            {
                TextAsset jsonFile = Resources.Load<TextAsset>(achievementsJsonPath);
                if (jsonFile == null)
                {
                    Debug.LogError($"[AchievementManager] Failed to load achievements from: {achievementsJsonPath}");
                    return;
                }

                var wrapper = JsonUtility.FromJson<AchievementDataWrapper>(jsonFile.text);
                if (wrapper == null || wrapper.achievements == null)
                {
                    Debug.LogError("[AchievementManager] Failed to parse achievements JSON");
                    return;
                }

                foreach (var jsonData in wrapper.achievements)
                {
                    var achievement = ConvertJsonToAchievement(jsonData);
                    if (achievement != null)
                    {
                        allAchievements.Add(achievement);
                        achievementsById[achievement.id] = achievement;
                        achievementsByCategory[achievement.category].Add(achievement);
                        achievementsByRarity[achievement.rarity].Add(achievement);
                    }
                }

                TotalPossiblePoints = allAchievements.Sum(a => a.points);

                if (debugMode)
                {
                    Debug.Log($"[AchievementManager] Loaded {allAchievements.Count} achievements with {TotalPossiblePoints} total points");
                }

                OnAchievementsLoaded?.Invoke(this, EventArgs.Empty);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[AchievementManager] Error loading achievements: {ex.Message}");
            }
        }

        /// <summary>
        /// Convert JSON data to AchievementData ScriptableObject
        /// </summary>
        private AchievementData ConvertJsonToAchievement(AchievementJsonData json)
        {
            var achievement = ScriptableObject.CreateInstance<AchievementData>();

            achievement.id = json.id;
            achievement.title = json.title;
            achievement.description = json.description;
            achievement.category = ParseCategory(json.category);
            achievement.rarity = ParseRarity(json.rarity);
            achievement.hidden = json.hidden;
            achievement.icon = json.icon;
            achievement.tags = json.tags ?? new List<string>();
            achievement.points = json.points;
            achievement.sortOrder = json.sortOrder;

            // Parse unlock condition
            if (json.unlockCondition != null)
            {
                achievement.unlockCondition = new UnlockCondition
                {
                    type = ParseConditionType(json.unlockCondition.type),
                    target = json.unlockCondition.target,
                    count = json.unlockCondition.count ?? 0,
                    description = json.unlockCondition.description
                };
            }

            // Parse rewards
            achievement.rewards = new List<AchievementReward>();
            if (json.rewards != null)
            {
                foreach (var rewardJson in json.rewards)
                {
                    achievement.rewards.Add(new AchievementReward
                    {
                        type = ParseRewardType(rewardJson.type),
                        value = rewardJson.value?.ToString(),
                        description = rewardJson.description
                    });
                }
            }

            // Parse progress tracking
            if (json.progress != null && json.progress.enabled)
            {
                achievement.progress = new ProgressTracking
                {
                    enabled = true,
                    current = 0,
                    max = json.progress.max,
                    displayFormat = json.progress.displayFormat
                };
            }

            return achievement;
        }

        private AchievementCategory ParseCategory(string category)
        {
            return category?.ToLower() switch
            {
                "story" => AchievementCategory.Story,
                "combat" => AchievementCategory.Combat,
                "exploration" => AchievementCategory.Exploration,
                "economic" => AchievementCategory.Economic,
                "social" => AchievementCategory.Social,
                "secret" => AchievementCategory.Secret,
                _ => AchievementCategory.Story
            };
        }

        private AchievementRarity ParseRarity(string rarity)
        {
            return rarity?.ToLower() switch
            {
                "common" => AchievementRarity.Common,
                "uncommon" => AchievementRarity.Uncommon,
                "rare" => AchievementRarity.Rare,
                "legendary" => AchievementRarity.Legendary,
                _ => AchievementRarity.Common
            };
        }

        private UnlockConditionType ParseConditionType(string type)
        {
            return type?.ToLower() switch
            {
                "quest_complete" => UnlockConditionType.QuestComplete,
                "kill_count" => UnlockConditionType.KillCount,
                "kill_specific" => UnlockConditionType.KillSpecific,
                "visit_location" => UnlockConditionType.VisitLocation,
                "visit_all" => UnlockConditionType.VisitAll,
                "collect_item" => UnlockConditionType.CollectItem,
                "collect_count" => UnlockConditionType.CollectCount,
                "gold_earned" => UnlockConditionType.GoldEarned,
                "gold_spent" => UnlockConditionType.GoldSpent,
                "shop_count" => UnlockConditionType.ShopCount,
                "sell_count" => UnlockConditionType.SellCount,
                "talk_npc" => UnlockConditionType.TalkNpc,
                "talk_all" => UnlockConditionType.TalkAll,
                "reputation_max" => UnlockConditionType.ReputationMax,
                "side_quest_count" => UnlockConditionType.SideQuestCount,
                "moral_choice" => UnlockConditionType.MoralChoice,
                "ability_use" => UnlockConditionType.AbilityUse,
                "travel_distance" => UnlockConditionType.TravelDistance,
                "no_damage" => UnlockConditionType.NoDamage,
                "lore_discovered" => UnlockConditionType.LoreDiscovered,
                "hidden_area" => UnlockConditionType.HiddenArea,
                "special_action" => UnlockConditionType.SpecialAction,
                "bounty_complete" => UnlockConditionType.BountyComplete,
                _ => UnlockConditionType.QuestComplete
            };
        }

        private RewardType ParseRewardType(string type)
        {
            return type?.ToLower() switch
            {
                "gold" => RewardType.Gold,
                "xp" => RewardType.Xp,
                "item" => RewardType.Item,
                "title" => RewardType.Title,
                "cosmetic" => RewardType.Cosmetic,
                _ => RewardType.Xp
            };
        }

        /// <summary>
        /// Load player achievement progress from PlayerPrefs
        /// </summary>
        private void LoadPlayerData()
        {
            string json = PlayerPrefs.GetString(saveKey, "");

            if (!string.IsNullOrEmpty(json))
            {
                try
                {
                    playerData = JsonUtility.FromJson<PlayerAchievementSaveData>(json);
                }
                catch
                {
                    playerData = null;
                }
            }

            if (playerData == null)
            {
                playerData = new PlayerAchievementSaveData();
            }

            // Ensure all achievements have states
            foreach (var achievement in allAchievements)
            {
                if (playerData.GetState(achievement.id) == null)
                {
                    playerData.states.Add(new PlayerAchievementState(achievement.id));
                }
            }

            // Build lookup dictionary
            statesById.Clear();
            foreach (var state in playerData.states)
            {
                statesById[state.achievementId] = state;
            }

            // Update stats
            playerData.UpdateStats(allAchievements);

            if (debugMode)
            {
                Debug.Log($"[AchievementManager] Loaded player data: {playerData.totalUnlocked}/{allAchievements.Count} unlocked, {playerData.totalScore} points");
            }
        }

        /// <summary>
        /// Save player achievement progress to PlayerPrefs
        /// </summary>
        public void SavePlayerData()
        {
            playerData.UpdateStats(allAchievements);
            string json = JsonUtility.ToJson(playerData);
            PlayerPrefs.SetString(saveKey, json);
            PlayerPrefs.Save();

            if (debugMode)
            {
                Debug.Log("[AchievementManager] Player data saved");
            }
        }

        /// <summary>
        /// Get an achievement by its ID
        /// </summary>
        public AchievementData GetAchievement(string id)
        {
            return achievementsById.TryGetValue(id, out var achievement) ? achievement : null;
        }

        /// <summary>
        /// Get player state for an achievement
        /// </summary>
        public PlayerAchievementState GetState(string achievementId)
        {
            return statesById.TryGetValue(achievementId, out var state) ? state : null;
        }

        /// <summary>
        /// Check if an achievement is unlocked
        /// </summary>
        public bool IsUnlocked(string achievementId)
        {
            return GetState(achievementId)?.unlocked ?? false;
        }

        /// <summary>
        /// Get all achievements in a category
        /// </summary>
        public List<AchievementData> GetByCategory(AchievementCategory category)
        {
            return achievementsByCategory.TryGetValue(category, out var list)
                ? list.OrderBy(a => a.sortOrder).ToList()
                : new List<AchievementData>();
        }

        /// <summary>
        /// Get all achievements of a rarity
        /// </summary>
        public List<AchievementData> GetByRarity(AchievementRarity rarity)
        {
            return achievementsByRarity.TryGetValue(rarity, out var list)
                ? list.ToList()
                : new List<AchievementData>();
        }

        /// <summary>
        /// Get all visible (non-hidden) achievements
        /// </summary>
        public List<AchievementData> GetVisibleAchievements()
        {
            return allAchievements.Where(a => !a.hidden).ToList();
        }

        /// <summary>
        /// Get all unlocked achievements
        /// </summary>
        public List<AchievementData> GetUnlockedAchievements()
        {
            return allAchievements.Where(a => IsUnlocked(a.id)).ToList();
        }

        /// <summary>
        /// Get completion percentage for a category
        /// </summary>
        public float GetCategoryCompletion(AchievementCategory category)
        {
            var categoryAchievements = GetByCategory(category);
            if (categoryAchievements.Count == 0) return 0f;

            int unlocked = categoryAchievements.Count(a => IsUnlocked(a.id));
            return (float)unlocked / categoryAchievements.Count;
        }

        /// <summary>
        /// Get overall completion percentage
        /// </summary>
        public float GetOverallCompletion()
        {
            if (allAchievements.Count == 0) return 0f;
            return (float)playerData.totalUnlocked / allAchievements.Count;
        }

        /// <summary>
        /// Unlock an achievement by ID
        /// </summary>
        public bool Unlock(string achievementId)
        {
            var achievement = GetAchievement(achievementId);
            if (achievement == null)
            {
                Debug.LogWarning($"[AchievementManager] Achievement not found: {achievementId}");
                return false;
            }

            var state = GetState(achievementId);
            if (state == null || state.unlocked)
            {
                return false;
            }

            state.Unlock();
            playerData.UpdateStats(allAchievements);
            SavePlayerData();

            if (debugMode)
            {
                Debug.Log($"[AchievementManager] Achievement unlocked: {achievement.title}");
            }

            // Grant rewards
            GrantRewards(achievement);

            // Fire event
            OnAchievementUnlocked?.Invoke(this, new AchievementUnlockedEventArgs(
                achievement,
                state,
                playerData.totalScore,
                playerData.totalUnlocked
            ));

            return true;
        }

        /// <summary>
        /// Update progress for a progressive achievement
        /// </summary>
        public void UpdateProgress(string achievementId, int progress)
        {
            var achievement = GetAchievement(achievementId);
            if (achievement == null || !achievement.HasProgressTracking)
            {
                return;
            }

            var state = GetState(achievementId);
            if (state == null || state.unlocked)
            {
                return;
            }

            int oldProgress = state.progress;
            int newProgress = Mathf.Min(progress, achievement.progress.max);
            state.UpdateProgress(newProgress);

            if (debugMode)
            {
                Debug.Log($"[AchievementManager] Progress updated for {achievement.title}: {oldProgress} -> {newProgress}/{achievement.progress.max}");
            }

            // Fire progress event
            OnProgressUpdated?.Invoke(this, new AchievementProgressEventArgs(
                achievement,
                oldProgress,
                newProgress,
                achievement.progress.max
            ));

            // Check for completion
            if (newProgress >= achievement.progress.max)
            {
                Unlock(achievementId);
            }
            else
            {
                SavePlayerData();
            }
        }

        /// <summary>
        /// Increment progress for a progressive achievement
        /// </summary>
        public void IncrementProgress(string achievementId, int amount = 1)
        {
            var state = GetState(achievementId);
            if (state != null && !state.unlocked)
            {
                UpdateProgress(achievementId, state.progress + amount);
            }
        }

        /// <summary>
        /// Check and unlock achievements based on game events
        /// </summary>
        public void CheckCondition(UnlockConditionType type, string target = null, int count = 0)
        {
            foreach (var achievement in allAchievements)
            {
                if (IsUnlocked(achievement.id))
                    continue;

                var condition = achievement.unlockCondition;
                if (condition == null || condition.type != type)
                    continue;

                bool matches = true;

                // Check target match
                if (!string.IsNullOrEmpty(condition.target) && !string.IsNullOrEmpty(target))
                {
                    matches = condition.target.Equals(target, StringComparison.OrdinalIgnoreCase);
                }

                // Check count requirement
                if (matches && condition.count > 0)
                {
                    if (achievement.HasProgressTracking)
                    {
                        // Update progress for progressive achievements
                        IncrementProgress(achievement.id, count > 0 ? count : 1);
                        continue;
                    }
                    else
                    {
                        matches = count >= condition.count;
                    }
                }

                if (matches)
                {
                    Unlock(achievement.id);
                }
            }
        }

        /// <summary>
        /// Grant rewards for an unlocked achievement
        /// </summary>
        private void GrantRewards(AchievementData achievement)
        {
            foreach (var reward in achievement.rewards)
            {
                switch (reward.type)
                {
                    case RewardType.Gold:
                        // Integration point: Grant gold to player
                        // GameManager.Instance?.AddGold(reward.GetNumericValue());
                        if (debugMode) Debug.Log($"[AchievementManager] Grant reward: {reward.GetNumericValue()} gold");
                        break;

                    case RewardType.Xp:
                        // Integration point: Grant XP to player
                        // GameManager.Instance?.AddExperience(reward.GetNumericValue());
                        if (debugMode) Debug.Log($"[AchievementManager] Grant reward: {reward.GetNumericValue()} XP");
                        break;

                    case RewardType.Item:
                        // Integration point: Add item to inventory
                        // InventoryManager.Instance?.AddItem(reward.value);
                        if (debugMode) Debug.Log($"[AchievementManager] Grant reward: Item '{reward.value}'");
                        break;

                    case RewardType.Title:
                        // Integration point: Unlock title
                        // PlayerProfile.Instance?.UnlockTitle(reward.value);
                        if (debugMode) Debug.Log($"[AchievementManager] Grant reward: Title '{reward.value}'");
                        break;

                    case RewardType.Cosmetic:
                        // Integration point: Unlock cosmetic
                        // CosmeticManager.Instance?.UnlockCosmetic(reward.value);
                        if (debugMode) Debug.Log($"[AchievementManager] Grant reward: Cosmetic '{reward.value}'");
                        break;
                }
            }
        }

        /// <summary>
        /// Mark an achievement notification as seen
        /// </summary>
        public void MarkNotified(string achievementId)
        {
            var state = GetState(achievementId);
            if (state != null)
            {
                state.MarkNotified();
                SavePlayerData();
            }
        }

        /// <summary>
        /// Get achievements that have been unlocked but not notified
        /// </summary>
        public List<AchievementData> GetPendingNotifications()
        {
            return allAchievements
                .Where(a => {
                    var state = GetState(a.id);
                    return state != null && state.unlocked && !state.notified;
                })
                .ToList();
        }

        /// <summary>
        /// Reset all achievement progress (for debugging/new game)
        /// </summary>
        public void ResetAllProgress()
        {
            playerData = new PlayerAchievementSaveData();
            statesById.Clear();

            foreach (var achievement in allAchievements)
            {
                var state = new PlayerAchievementState(achievement.id);
                playerData.states.Add(state);
                statesById[achievement.id] = state;
            }

            SavePlayerData();

            if (debugMode)
            {
                Debug.Log("[AchievementManager] All progress reset");
            }
        }

        #region Convenience Methods for Common Game Events

        /// <summary>
        /// Call when a quest is completed
        /// </summary>
        public void OnQuestCompleted(string questId)
        {
            CheckCondition(UnlockConditionType.QuestComplete, questId);
        }

        /// <summary>
        /// Call when an enemy is killed
        /// </summary>
        public void OnEnemyKilled(string enemyId = null)
        {
            CheckCondition(UnlockConditionType.KillCount, count: 1);
            if (!string.IsNullOrEmpty(enemyId))
            {
                CheckCondition(UnlockConditionType.KillSpecific, enemyId);
            }
        }

        /// <summary>
        /// Call when a location is visited
        /// </summary>
        public void OnLocationVisited(string locationId)
        {
            CheckCondition(UnlockConditionType.VisitLocation, locationId);
        }

        /// <summary>
        /// Call when gold is earned
        /// </summary>
        public void OnGoldEarned(int amount)
        {
            CheckCondition(UnlockConditionType.GoldEarned, count: amount);
        }

        /// <summary>
        /// Call when gold is spent
        /// </summary>
        public void OnGoldSpent(int amount)
        {
            CheckCondition(UnlockConditionType.GoldSpent, count: amount);
        }

        /// <summary>
        /// Call when an item is collected
        /// </summary>
        public void OnItemCollected(string itemId)
        {
            CheckCondition(UnlockConditionType.CollectItem, itemId);
            CheckCondition(UnlockConditionType.CollectCount, itemId, 1);
        }

        /// <summary>
        /// Call when an NPC is talked to
        /// </summary>
        public void OnNpcTalkedTo(string npcId)
        {
            CheckCondition(UnlockConditionType.TalkNpc, npcId);
        }

        /// <summary>
        /// Call when a combat is won without taking damage
        /// </summary>
        public void OnFlawlessVictory()
        {
            CheckCondition(UnlockConditionType.NoDamage);
        }

        /// <summary>
        /// Call when a hidden area is discovered
        /// </summary>
        public void OnHiddenAreaDiscovered(string areaId = null)
        {
            CheckCondition(UnlockConditionType.HiddenArea, areaId, 1);
        }

        /// <summary>
        /// Call when a special action is performed
        /// </summary>
        public void OnSpecialAction(string actionId)
        {
            CheckCondition(UnlockConditionType.SpecialAction, actionId);
        }

        #endregion
    }
}
