using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Quests
{
    /// <summary>
    /// ScriptableObject database containing all quest definitions.
    /// Provides lookup and filtering methods for quest data.
    /// </summary>
    [CreateAssetMenu(fileName = "QuestDatabase", menuName = "Iron Frontier/Data/Quest Database", order = 10)]
    public class QuestDatabase : ScriptableObject
    {
        #region Serialized Fields

        [Header("Quests")]
        [SerializeField]
        [Tooltip("All quest definitions")]
        private List<QuestData> quests = new List<QuestData>();

        [Header("Categories")]
        [SerializeField]
        [Tooltip("Quest category names for filtering")]
        private List<string> categories = new List<string>();

        #endregion

        #region Properties

        /// <summary>Total number of quests in the database.</summary>
        public int QuestCount => quests.Count;

        /// <summary>All available categories.</summary>
        public IReadOnlyList<string> Categories => categories;

        #endregion

        #region Lookup Methods

        /// <summary>
        /// Get a quest by ID.
        /// </summary>
        /// <param name="questId">The quest ID to look up.</param>
        /// <returns>The quest data, or null if not found.</returns>
        public QuestData GetQuest(string questId)
        {
            if (string.IsNullOrEmpty(questId)) return null;
            return quests.FirstOrDefault(q => q.id == questId);
        }

        /// <summary>
        /// Get all quests in the database.
        /// </summary>
        /// <returns>All quest data objects.</returns>
        public IReadOnlyList<QuestData> GetAllQuests()
        {
            return quests;
        }

        /// <summary>
        /// Check if a quest exists in the database.
        /// </summary>
        /// <param name="questId">The quest ID to check.</param>
        /// <returns>True if the quest exists.</returns>
        public bool HasQuest(string questId)
        {
            return GetQuest(questId) != null;
        }

        #endregion

        #region Filtering Methods

        /// <summary>
        /// Get quests by type.
        /// </summary>
        /// <param name="type">The quest type to filter by.</param>
        /// <returns>Quests of the specified type.</returns>
        public IEnumerable<QuestData> GetQuestsByType(QuestType type)
        {
            return quests.Where(q => q.type == type);
        }

        /// <summary>
        /// Get all main story quests.
        /// </summary>
        /// <returns>Main quests.</returns>
        public IEnumerable<QuestData> GetMainQuests()
        {
            return GetQuestsByType(QuestType.Main);
        }

        /// <summary>
        /// Get all side quests.
        /// </summary>
        /// <returns>Side quests.</returns>
        public IEnumerable<QuestData> GetSideQuests()
        {
            return GetQuestsByType(QuestType.Side);
        }

        /// <summary>
        /// Get quests given by a specific NPC.
        /// </summary>
        /// <param name="npcId">The NPC ID.</param>
        /// <returns>Quests from that NPC.</returns>
        public IEnumerable<QuestData> GetQuestsByNPC(string npcId)
        {
            return quests.Where(q => q.giverNpcId == npcId);
        }

        /// <summary>
        /// Get quests available at a specific location.
        /// </summary>
        /// <param name="locationId">The location ID.</param>
        /// <returns>Quests at that location.</returns>
        public IEnumerable<QuestData> GetQuestsByLocation(string locationId)
        {
            return quests.Where(q => q.startLocationId == locationId);
        }

        /// <summary>
        /// Get quests with a specific tag.
        /// </summary>
        /// <param name="tag">The tag to filter by.</param>
        /// <returns>Quests with that tag.</returns>
        public IEnumerable<QuestData> GetQuestsByTag(string tag)
        {
            return quests.Where(q => q.HasTag(tag));
        }

        /// <summary>
        /// Get quests for a specific level range.
        /// </summary>
        /// <param name="minLevel">Minimum level.</param>
        /// <param name="maxLevel">Maximum level.</param>
        /// <returns>Quests in the level range.</returns>
        public IEnumerable<QuestData> GetQuestsForLevel(int minLevel, int maxLevel)
        {
            return quests.Where(q => q.recommendedLevel >= minLevel && q.recommendedLevel <= maxLevel);
        }

        /// <summary>
        /// Get repeatable quests.
        /// </summary>
        /// <returns>Repeatable quests.</returns>
        public IEnumerable<QuestData> GetRepeatableQuests()
        {
            return quests.Where(q => q.repeatable);
        }

        /// <summary>
        /// Get timed quests (quests with time limits).
        /// </summary>
        /// <returns>Timed quests.</returns>
        public IEnumerable<QuestData> GetTimedQuests()
        {
            return quests.Where(q => q.timeLimitHours > 0);
        }

        /// <summary>
        /// Get quests sorted by recommended level.
        /// </summary>
        /// <returns>Quests sorted by level.</returns>
        public IEnumerable<QuestData> GetQuestsSortedByLevel()
        {
            return quests.OrderBy(q => q.recommendedLevel);
        }

        /// <summary>
        /// Search quests by title or description.
        /// </summary>
        /// <param name="searchTerm">The search term.</param>
        /// <returns>Matching quests.</returns>
        public IEnumerable<QuestData> SearchQuests(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return quests;

            var term = searchTerm.ToLowerInvariant();
            return quests.Where(q =>
                q.title.ToLowerInvariant().Contains(term) ||
                q.description.ToLowerInvariant().Contains(term));
        }

        #endregion

        #region Statistics

        /// <summary>
        /// Get statistics about the quest database.
        /// </summary>
        /// <returns>Database statistics.</returns>
        public QuestDatabaseStats GetStats()
        {
            return new QuestDatabaseStats
            {
                TotalQuests = quests.Count,
                MainQuests = quests.Count(q => q.type == QuestType.Main),
                SideQuests = quests.Count(q => q.type == QuestType.Side),
                FactionQuests = quests.Count(q => q.type == QuestType.Faction),
                BountyQuests = quests.Count(q => q.type == QuestType.Bounty),
                RepeatableQuests = quests.Count(q => q.repeatable),
                TimedQuests = quests.Count(q => q.timeLimitHours > 0),
                TotalXPAvailable = quests.Sum(q => q.TotalXP),
                TotalGoldAvailable = quests.Sum(q => q.TotalGold)
            };
        }

        #endregion

        #region Editor Methods

#if UNITY_EDITOR
        /// <summary>
        /// Add a quest to the database (Editor only).
        /// </summary>
        /// <param name="quest">The quest to add.</param>
        public void AddQuest(QuestData quest)
        {
            if (quest == null) return;
            if (quests.Contains(quest)) return;
            if (HasQuest(quest.id))
            {
                Debug.LogWarning($"Quest with ID '{quest.id}' already exists in database");
                return;
            }

            quests.Add(quest);
            UnityEditor.EditorUtility.SetDirty(this);
        }

        /// <summary>
        /// Remove a quest from the database (Editor only).
        /// </summary>
        /// <param name="quest">The quest to remove.</param>
        public void RemoveQuest(QuestData quest)
        {
            if (quests.Remove(quest))
            {
                UnityEditor.EditorUtility.SetDirty(this);
            }
        }

        /// <summary>
        /// Clear all quests from the database (Editor only).
        /// </summary>
        public void ClearAll()
        {
            quests.Clear();
            UnityEditor.EditorUtility.SetDirty(this);
        }

        /// <summary>
        /// Validate all quests in the database (Editor only).
        /// </summary>
        /// <returns>List of validation errors.</returns>
        public List<string> ValidateDatabase()
        {
            var errors = new List<string>();
            var seenIds = new HashSet<string>();

            for (int i = 0; i < quests.Count; i++)
            {
                var quest = quests[i];

                if (quest == null)
                {
                    errors.Add($"Quest at index {i} is null");
                    continue;
                }

                if (string.IsNullOrEmpty(quest.id))
                {
                    errors.Add($"Quest '{quest.name}' has no ID");
                }
                else if (seenIds.Contains(quest.id))
                {
                    errors.Add($"Duplicate quest ID: {quest.id}");
                }
                else
                {
                    seenIds.Add(quest.id);
                }

                if (string.IsNullOrEmpty(quest.title))
                {
                    errors.Add($"Quest '{quest.id}' has no title");
                }

                if (quest.stages == null || quest.stages.Count == 0)
                {
                    errors.Add($"Quest '{quest.id}' has no stages");
                }
                else
                {
                    foreach (var stage in quest.stages)
                    {
                        if (stage.objectives == null || stage.objectives.Count == 0)
                        {
                            errors.Add($"Quest '{quest.id}' stage '{stage.id}' has no objectives");
                        }
                    }
                }

                // Validate prerequisites
                if (quest.prerequisites.completedQuestIds != null)
                {
                    foreach (var prereqId in quest.prerequisites.completedQuestIds)
                    {
                        if (!HasQuest(prereqId))
                        {
                            errors.Add($"Quest '{quest.id}' has invalid prerequisite: {prereqId}");
                        }
                    }
                }
            }

            return errors;
        }

        /// <summary>
        /// Sort quests by various criteria (Editor only).
        /// </summary>
        public void SortByLevel()
        {
            quests = quests.OrderBy(q => q.recommendedLevel).ThenBy(q => q.title).ToList();
            UnityEditor.EditorUtility.SetDirty(this);
        }

        public void SortByType()
        {
            quests = quests.OrderBy(q => q.type).ThenBy(q => q.title).ToList();
            UnityEditor.EditorUtility.SetDirty(this);
        }

        public void SortByTitle()
        {
            quests = quests.OrderBy(q => q.title).ToList();
            UnityEditor.EditorUtility.SetDirty(this);
        }

        private void OnValidate()
        {
            // Remove null entries
            quests.RemoveAll(q => q == null);
        }
#endif

        #endregion
    }

    #region Statistics

    /// <summary>
    /// Statistics about the quest database.
    /// </summary>
    [Serializable]
    public struct QuestDatabaseStats
    {
        public int TotalQuests;
        public int MainQuests;
        public int SideQuests;
        public int FactionQuests;
        public int BountyQuests;
        public int RepeatableQuests;
        public int TimedQuests;
        public int TotalXPAvailable;
        public int TotalGoldAvailable;

        public override string ToString()
        {
            return $"Quest Database: {TotalQuests} quests ({MainQuests} main, {SideQuests} side), " +
                   $"Total XP: {TotalXPAvailable}, Total Gold: {TotalGoldAvailable}";
        }
    }

    #endregion
}
