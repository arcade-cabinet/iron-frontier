using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Progression
{
    /// <summary>
    /// Achievement category for grouping and filtering
    /// </summary>
    public enum AchievementCategory
    {
        Story,
        Combat,
        Exploration,
        Economic,
        Social,
        Secret
    }

    /// <summary>
    /// Achievement rarity determines visual treatment and points
    /// </summary>
    public enum AchievementRarity
    {
        Common,
        Uncommon,
        Rare,
        Legendary
    }

    /// <summary>
    /// Type of reward granted when achievement is unlocked
    /// </summary>
    public enum RewardType
    {
        Gold,
        Xp,
        Item,
        Title,
        Cosmetic
    }

    /// <summary>
    /// Type of condition required to unlock an achievement
    /// </summary>
    public enum UnlockConditionType
    {
        QuestComplete,
        KillCount,
        KillSpecific,
        VisitLocation,
        VisitAll,
        CollectItem,
        CollectCount,
        GoldEarned,
        GoldSpent,
        ShopCount,
        SellCount,
        TalkNpc,
        TalkAll,
        ReputationMax,
        SideQuestCount,
        MoralChoice,
        AbilityUse,
        TravelDistance,
        NoDamage,
        LoreDiscovered,
        HiddenArea,
        SpecialAction,
        BountyComplete
    }

    /// <summary>
    /// Reward granted when an achievement is unlocked
    /// </summary>
    [Serializable]
    public class AchievementReward
    {
        [Tooltip("Type of reward")]
        public RewardType type;

        [Tooltip("Numeric value for gold/xp, or item/title/cosmetic ID")]
        public string value;

        [Tooltip("Human-readable description of the reward")]
        public string description;

        public int GetNumericValue()
        {
            if (int.TryParse(value, out int result))
                return result;
            return 0;
        }
    }

    /// <summary>
    /// Condition that must be met to unlock an achievement
    /// </summary>
    [Serializable]
    public class UnlockCondition
    {
        [Tooltip("Type of condition to check")]
        public UnlockConditionType type;

        [Tooltip("Target ID (quest ID, enemy ID, location ID, etc.)")]
        public string target;

        [Tooltip("Count required (for cumulative achievements)")]
        public int count;

        [Tooltip("Human-readable description")]
        public string description;
    }

    /// <summary>
    /// Progress tracking for incremental achievements
    /// </summary>
    [Serializable]
    public class ProgressTracking
    {
        [Tooltip("Whether progress tracking is enabled")]
        public bool enabled;

        [Tooltip("Current progress value")]
        public int current;

        [Tooltip("Maximum value for completion")]
        public int max;

        [Tooltip("Display format string (e.g., '{current}/{max} enemies defeated')")]
        public string displayFormat;

        public float GetPercentage() => max > 0 ? (float)current / max : 0f;

        public string GetDisplayString() =>
            displayFormat?.Replace("{current}", current.ToString())
                         .Replace("{max}", max.ToString())
            ?? $"{current}/{max}";
    }

    /// <summary>
    /// ScriptableObject containing achievement definition data
    /// </summary>
    [CreateAssetMenu(fileName = "Achievement", menuName = "Iron Frontier/Achievement Data")]
    public class AchievementData : ScriptableObject
    {
        [Header("Identity")]
        [Tooltip("Unique identifier for this achievement")]
        public string id;

        [Tooltip("Display title")]
        public string title;

        [TextArea(2, 4)]
        [Tooltip("Flavor description")]
        public string description;

        [Header("Classification")]
        [Tooltip("Category for grouping")]
        public AchievementCategory category;

        [Tooltip("Rarity determines visual treatment")]
        public AchievementRarity rarity;

        [Header("Unlock Requirements")]
        [Tooltip("Condition to unlock this achievement")]
        public UnlockCondition unlockCondition;

        [Header("Rewards")]
        [Tooltip("Rewards granted on unlock")]
        public List<AchievementReward> rewards = new List<AchievementReward>();

        [Header("Display")]
        [Tooltip("Whether achievement is hidden until unlocked")]
        public bool hidden;

        [Tooltip("Icon identifier for UI")]
        public string icon;

        [Tooltip("Tags for filtering")]
        public List<string> tags = new List<string>();

        [Tooltip("Points value for achievement score")]
        public int points = 10;

        [Tooltip("Sort order within category")]
        public int sortOrder;

        [Header("Progress")]
        [Tooltip("Progress tracking configuration (optional)")]
        public ProgressTracking progress;

        /// <summary>
        /// Get the color associated with this achievement's rarity
        /// </summary>
        public Color GetRarityColor()
        {
            return rarity switch
            {
                AchievementRarity.Legendary => new Color(1f, 0.843f, 0f), // Gold
                AchievementRarity.Rare => new Color(0.608f, 0.349f, 0.714f), // Purple
                AchievementRarity.Uncommon => new Color(0.153f, 0.682f, 0.376f), // Green
                _ => new Color(0.584f, 0.647f, 0.651f) // Gray
            };
        }

        /// <summary>
        /// Get the hex color string for this achievement's rarity
        /// </summary>
        public string GetRarityHexColor()
        {
            return rarity switch
            {
                AchievementRarity.Legendary => "#FFD700",
                AchievementRarity.Rare => "#9B59B6",
                AchievementRarity.Uncommon => "#27AE60",
                _ => "#95A5A6"
            };
        }

        /// <summary>
        /// Check if this achievement has progress tracking
        /// </summary>
        public bool HasProgressTracking => progress != null && progress.enabled;
    }

    /// <summary>
    /// Player's state for a specific achievement
    /// </summary>
    [Serializable]
    public class PlayerAchievementState
    {
        public string achievementId;
        public bool unlocked;
        public long unlockedAt; // Unix timestamp
        public int progress;
        public bool notified;

        public PlayerAchievementState(string id)
        {
            achievementId = id;
            unlocked = false;
            unlockedAt = 0;
            progress = 0;
            notified = false;
        }

        public void Unlock()
        {
            if (!unlocked)
            {
                unlocked = true;
                unlockedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            }
        }

        public void UpdateProgress(int newProgress)
        {
            progress = newProgress;
        }

        public void MarkNotified()
        {
            notified = true;
        }
    }

    /// <summary>
    /// Container for all player achievement states (for serialization)
    /// </summary>
    [Serializable]
    public class PlayerAchievementSaveData
    {
        public List<PlayerAchievementState> states = new List<PlayerAchievementState>();
        public int totalScore;
        public int totalUnlocked;
        public long lastUpdated;

        public PlayerAchievementState GetState(string achievementId)
        {
            return states.Find(s => s.achievementId == achievementId);
        }

        public void UpdateStats(List<AchievementData> allAchievements)
        {
            totalUnlocked = 0;
            totalScore = 0;

            foreach (var state in states)
            {
                if (state.unlocked)
                {
                    totalUnlocked++;
                    var achievement = allAchievements.Find(a => a.id == state.achievementId);
                    if (achievement != null)
                    {
                        totalScore += achievement.points;
                    }
                }
            }

            lastUpdated = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        }
    }

    /// <summary>
    /// JSON wrapper for loading achievements from Resources
    /// </summary>
    [Serializable]
    public class AchievementDataWrapper
    {
        public string version;
        public List<string> categories;
        public List<string> rarities;
        public List<AchievementJsonData> achievements;
        public AchievementStatistics statistics;
        public RarityColors rarityColors;
    }

    [Serializable]
    public class AchievementJsonData
    {
        public string id;
        public string title;
        public string description;
        public string category;
        public string rarity;
        public UnlockConditionJson unlockCondition;
        public List<AchievementRewardJson> rewards;
        public bool hidden;
        public ProgressTrackingJson progress;
        public string icon;
        public List<string> tags;
        public int points;
        public int sortOrder;
    }

    [Serializable]
    public class UnlockConditionJson
    {
        public string type;
        public string target;
        public int? count;
        public string description;
    }

    [Serializable]
    public class AchievementRewardJson
    {
        public string type;
        public string value;
        public string description;
    }

    [Serializable]
    public class ProgressTrackingJson
    {
        public bool enabled;
        public int current;
        public int max;
        public string displayFormat;
    }

    [Serializable]
    public class AchievementStatistics
    {
        public int total;
        public CategoryCounts byCategory;
        public RarityCounts byRarity;
        public int totalPoints;
        public int hidden;
        public int visible;
    }

    [Serializable]
    public class CategoryCounts
    {
        public int story;
        public int combat;
        public int exploration;
        public int economic;
        public int social;
        public int secret;
    }

    [Serializable]
    public class RarityCounts
    {
        public int common;
        public int uncommon;
        public int rare;
        public int legendary;
    }

    [Serializable]
    public class RarityColors
    {
        public string common;
        public string uncommon;
        public string rare;
        public string legendary;
    }
}
