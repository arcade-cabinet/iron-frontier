using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Progression
{
    /// <summary>
    /// Path/faction alignment for endings
    /// </summary>
    public enum EndingPath
    {
        Ivrc,
        Copperhead,
        Freeminer,
        Law,
        Underground,
        Independent
    }

    /// <summary>
    /// Character fate outcome types
    /// </summary>
    public enum FateType
    {
        AliveHappy,
        AliveStruggling,
        DeadHeroic,
        DeadTragic,
        DeadJustice,
        Imprisoned,
        Departed,
        Redeemed
    }

    /// <summary>
    /// Type of condition for ending evaluation
    /// </summary>
    public enum EndingConditionType
    {
        QuestCompleted,
        ReputationGte,
        ReputationLte,
        FlagSet,
        FlagNotSet,
        NpcAlive,
        NpcDead,
        PeopleKilledGte,
        PeopleSavedGte
    }

    /// <summary>
    /// Type of unlock granted by an ending
    /// </summary>
    public enum EndingUnlockType
    {
        Achievement,
        Gallery,
        NewGamePlus,
        Music
    }

    /// <summary>
    /// Condition that contributes to ending selection
    /// </summary>
    [Serializable]
    public class EndingCondition
    {
        [Tooltip("Type of condition to check")]
        public EndingConditionType type;

        [Tooltip("Target ID (quest, faction, flag, NPC)")]
        public string target;

        [Tooltip("Numeric value for comparison conditions")]
        public int value;

        [Tooltip("Whether this condition must be met")]
        public bool required;

        [Tooltip("Score weight for this condition")]
        public int weight;

        [Tooltip("Human-readable description")]
        public string description;
    }

    /// <summary>
    /// Character's fate in a specific ending
    /// </summary>
    [Serializable]
    public class CharacterFate
    {
        [Tooltip("NPC ID")]
        public string npcId;

        [Tooltip("Display name for the character")]
        public string displayName;

        [Tooltip("Fate outcome")]
        public FateType fate;

        [TextArea(2, 4)]
        [Tooltip("Description of what happens to this character")]
        public string description;

        [Tooltip("Display priority (lower = shown first)")]
        public int priority;
    }

    /// <summary>
    /// Slide in the epilogue sequence
    /// </summary>
    [Serializable]
    public class EpilogueSlide
    {
        [Tooltip("Unique slide ID")]
        public string id;

        [Tooltip("Slide title")]
        public string title;

        [TextArea(3, 6)]
        [Tooltip("Narrative text for this slide")]
        public string text;

        [Tooltip("Image resource key")]
        public string imageKey;

        [Tooltip("Character featured in this slide (optional)")]
        public string characterId;

        [Tooltip("Tags for filtering/categorization")]
        public List<string> tags = new List<string>();
    }

    /// <summary>
    /// Unlock granted when an ending is achieved
    /// </summary>
    [Serializable]
    public class EndingUnlock
    {
        [Tooltip("Type of unlock")]
        public EndingUnlockType type;

        [Tooltip("Unlock ID")]
        public string id;

        [Tooltip("Display name")]
        public string name;
    }

    /// <summary>
    /// ScriptableObject containing ending definition data
    /// </summary>
    [CreateAssetMenu(fileName = "Ending", menuName = "Iron Frontier/Ending Data")]
    public class EndingData : ScriptableObject
    {
        [Header("Identity")]
        [Tooltip("Unique identifier for this ending")]
        public string id;

        [Tooltip("Display title")]
        public string title;

        [Tooltip("Short tagline")]
        public string tagline;

        [TextArea(3, 6)]
        [Tooltip("Full description of this ending")]
        public string description;

        [Header("Classification")]
        [Tooltip("Faction/path alignment")]
        public EndingPath path;

        [Tooltip("Whether this is considered a good/positive ending")]
        public bool isGoodEnding;

        [Tooltip("Whether this ending is hidden/secret")]
        public bool isSecret;

        [Header("Conditions")]
        [Tooltip("Conditions that determine if this ending is achieved")]
        public List<EndingCondition> conditions = new List<EndingCondition>();

        [Tooltip("Minimum score required to trigger this ending")]
        public int minimumScore;

        [Tooltip("Priority for selection when multiple endings qualify")]
        public int priority;

        [Header("Character Fates")]
        [Tooltip("What happens to each major character in this ending")]
        public List<CharacterFate> characterFates = new List<CharacterFate>();

        [Header("Epilogue")]
        [Tooltip("Slides shown in the epilogue sequence")]
        public List<EpilogueSlide> epilogueSlides = new List<EpilogueSlide>();

        [Tooltip("Template for displaying player statistics")]
        public string statisticsTemplate;

        [Header("Unlocks")]
        [Tooltip("Rewards unlocked by achieving this ending")]
        public List<EndingUnlock> unlocks = new List<EndingUnlock>();

        [Header("Metadata")]
        [Tooltip("Tags for filtering/categorization")]
        public List<string> tags = new List<string>();

        /// <summary>
        /// Get the path display name
        /// </summary>
        public string GetPathDisplayName()
        {
            return path switch
            {
                EndingPath.Ivrc => "IVRC Corporate",
                EndingPath.Copperhead => "Copperhead Revolution",
                EndingPath.Freeminer => "Freeminer Reform",
                EndingPath.Law => "Law & Order",
                EndingPath.Underground => "Underground Railroad",
                EndingPath.Independent => "Independent",
                _ => path.ToString()
            };
        }

        /// <summary>
        /// Get color representing this ending type
        /// </summary>
        public Color GetEndingColor()
        {
            if (isSecret)
                return new Color(1f, 0.843f, 0f); // Gold for secret
            if (isGoodEnding)
                return new Color(0.153f, 0.682f, 0.376f); // Green for good
            return new Color(0.906f, 0.298f, 0.235f); // Red for bad
        }

        /// <summary>
        /// Format the statistics template with actual values
        /// </summary>
        public string FormatStatistics(int peopleSaved, int peopleKilled, int questsCompleted, int daysSurvived)
        {
            if (string.IsNullOrEmpty(statisticsTemplate))
                return "";

            return statisticsTemplate
                .Replace("{peopleSaved}", peopleSaved.ToString())
                .Replace("{peopleKilled}", peopleKilled.ToString())
                .Replace("{questsCompleted}", questsCompleted.ToString())
                .Replace("{daysSurvived}", daysSurvived.ToString());
        }
    }

    /// <summary>
    /// Player's state for ending-related tracking
    /// </summary>
    [Serializable]
    public class PlayerEndingState
    {
        public List<string> unlockedEndingIds = new List<string>();
        public string currentPlaythroughEndingId;
        public int totalPlaythroughs;
        public Dictionary<string, int> endingCounts = new Dictionary<string, int>();

        public bool HasUnlocked(string endingId) => unlockedEndingIds.Contains(endingId);

        public void UnlockEnding(string endingId)
        {
            if (!unlockedEndingIds.Contains(endingId))
            {
                unlockedEndingIds.Add(endingId);
            }

            if (!endingCounts.ContainsKey(endingId))
            {
                endingCounts[endingId] = 0;
            }
            endingCounts[endingId]++;
            totalPlaythroughs++;
        }

        public int GetEndingCount(string endingId)
        {
            return endingCounts.TryGetValue(endingId, out int count) ? count : 0;
        }
    }

    /// <summary>
    /// Container for serializing player ending state
    /// </summary>
    [Serializable]
    public class PlayerEndingSaveData
    {
        public List<string> unlockedEndingIds = new List<string>();
        public string currentPlaythroughEndingId;
        public int totalPlaythroughs;
        public List<EndingCountEntry> endingCounts = new List<EndingCountEntry>();

        [Serializable]
        public class EndingCountEntry
        {
            public string endingId;
            public int count;
        }

        public PlayerEndingState ToState()
        {
            var state = new PlayerEndingState
            {
                unlockedEndingIds = new List<string>(unlockedEndingIds),
                currentPlaythroughEndingId = currentPlaythroughEndingId,
                totalPlaythroughs = totalPlaythroughs
            };

            foreach (var entry in endingCounts)
            {
                state.endingCounts[entry.endingId] = entry.count;
            }

            return state;
        }

        public static PlayerEndingSaveData FromState(PlayerEndingState state)
        {
            var data = new PlayerEndingSaveData
            {
                unlockedEndingIds = new List<string>(state.unlockedEndingIds),
                currentPlaythroughEndingId = state.currentPlaythroughEndingId,
                totalPlaythroughs = state.totalPlaythroughs
            };

            foreach (var kvp in state.endingCounts)
            {
                data.endingCounts.Add(new EndingCountEntry { endingId = kvp.Key, count = kvp.Value });
            }

            return data;
        }
    }

    /// <summary>
    /// JSON wrapper for loading endings from Resources
    /// </summary>
    [Serializable]
    public class EndingDataWrapper
    {
        public string version;
        public List<string> paths;
        public List<string> fateTypes;
        public List<string> conditionTypes;
        public List<string> unlockTypes;
        public List<EndingJsonData> endings;
        public EndingStatistics statistics;
        public string fallbackEndingId;
    }

    [Serializable]
    public class EndingJsonData
    {
        public string id;
        public string title;
        public string tagline;
        public string description;
        public string path;
        public bool isGoodEnding;
        public bool isSecret;
        public List<EndingConditionJson> conditions;
        public int minimumScore;
        public int priority;
        public List<CharacterFateJson> characterFates;
        public List<EpilogueSlideJson> epilogueSlides;
        public string statisticsTemplate;
        public List<EndingUnlockJson> unlocks;
        public List<string> tags;
    }

    [Serializable]
    public class EndingConditionJson
    {
        public string type;
        public string target;
        public int? value;
        public bool required;
        public int weight;
        public string description;
    }

    [Serializable]
    public class CharacterFateJson
    {
        public string npcId;
        public string displayName;
        public string fate;
        public string description;
        public int priority;
    }

    [Serializable]
    public class EpilogueSlideJson
    {
        public string id;
        public string title;
        public string text;
        public string imageKey;
        public string characterId;
        public List<string> tags;
    }

    [Serializable]
    public class EndingUnlockJson
    {
        public string type;
        public string id;
        public string name;
    }

    [Serializable]
    public class EndingStatistics
    {
        public int total;
        public int goodEndings;
        public int badEndings;
        public int secretEndings;
        public int standardEndings;
    }
}
