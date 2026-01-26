using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Quest status states.
    /// </summary>
    public enum QuestStatus
    {
        /// <summary>Can be started.</summary>
        Available,
        /// <summary>Currently in progress.</summary>
        Active,
        /// <summary>Successfully finished.</summary>
        Completed,
        /// <summary>Failed (time limit, wrong choice, etc.).</summary>
        Failed,
        /// <summary>Player dropped it.</summary>
        Abandoned
    }

    /// <summary>
    /// Quest type classification.
    /// </summary>
    public enum QuestType
    {
        /// <summary>Main storyline quest.</summary>
        Main,
        /// <summary>Optional side quest.</summary>
        Side,
        /// <summary>Faction reputation quest.</summary>
        Faction,
        /// <summary>Kill target for reward.</summary>
        Bounty,
        /// <summary>Fetch/deliver quest.</summary>
        Delivery,
        /// <summary>Discover locations.</summary>
        Exploration
    }

    /// <summary>
    /// Objective types defining what the player must do.
    /// </summary>
    public enum ObjectiveType
    {
        /// <summary>Defeat specific enemies or enemy types.</summary>
        Kill,
        /// <summary>Gather items (loot, pickup, craft).</summary>
        Collect,
        /// <summary>Speak to specific NPCs.</summary>
        Talk,
        /// <summary>Reach a location or marker.</summary>
        Visit,
        /// <summary>Use/activate something in the world.</summary>
        Interact,
        /// <summary>Bring item to NPC/location.</summary>
        Deliver
    }

    /// <summary>
    /// Map marker information for quest objectives.
    /// </summary>
    [Serializable]
    public struct ObjectiveMapMarker
    {
        /// <summary>Location ID for the marker.</summary>
        public string locationId;

        /// <summary>Optional label for the marker.</summary>
        public string markerLabel;
    }

    /// <summary>
    /// A single trackable objective within a quest stage.
    /// </summary>
    [Serializable]
    public struct QuestObjective
    {
        /// <summary>Unique ID within the quest.</summary>
        public string id;

        /// <summary>Human-readable description shown to player.</summary>
        [TextArea(1, 3)]
        public string description;

        /// <summary>Type of objective.</summary>
        public ObjectiveType type;

        /// <summary>
        /// Target identifier - meaning depends on type:
        /// - kill: enemy ID or enemy type
        /// - collect: item ID
        /// - talk: NPC ID
        /// - visit: location ID or marker ID
        /// - interact: interactable ID
        /// - deliver: item ID
        /// </summary>
        public string target;

        /// <summary>Delivery destination (for deliver type).</summary>
        public string deliverTo;

        /// <summary>Required count to complete.</summary>
        [Min(1)]
        public int count;

        /// <summary>Is this objective optional?</summary>
        public bool optional;

        /// <summary>Is this objective hidden until discovered?</summary>
        public bool hidden;

        /// <summary>Hint text shown when objective is active.</summary>
        public string hint;

        /// <summary>Map marker for this objective.</summary>
        public ObjectiveMapMarker mapMarker;

        public static QuestObjective CreateTalkTo(string npcId, string description)
        {
            return new QuestObjective
            {
                id = $"talk_{npcId}",
                description = description,
                type = ObjectiveType.Talk,
                target = npcId,
                count = 1,
                optional = false,
                hidden = false
            };
        }

        public static QuestObjective CreateKill(string enemyId, int count, string description)
        {
            return new QuestObjective
            {
                id = $"kill_{enemyId}",
                description = description,
                type = ObjectiveType.Kill,
                target = enemyId,
                count = count,
                optional = false,
                hidden = false
            };
        }

        public static QuestObjective CreateCollect(string itemId, int count, string description)
        {
            return new QuestObjective
            {
                id = $"collect_{itemId}",
                description = description,
                type = ObjectiveType.Collect,
                target = itemId,
                count = count,
                optional = false,
                hidden = false
            };
        }
    }

    /// <summary>
    /// Reward item with quantity.
    /// </summary>
    [Serializable]
    public struct RewardItem
    {
        /// <summary>Reference to the item.</summary>
        public ItemData item;

        /// <summary>Item ID for serialization.</summary>
        public string itemId;

        /// <summary>Quantity to give.</summary>
        [Min(1)]
        public int quantity;
    }

    /// <summary>
    /// Reputation change with a faction.
    /// </summary>
    [Serializable]
    public struct ReputationChange
    {
        /// <summary>Faction ID.</summary>
        public string factionId;

        /// <summary>Reputation amount (positive or negative).</summary>
        public int amount;
    }

    /// <summary>
    /// Rewards granted on quest/stage completion.
    /// </summary>
    [Serializable]
    public struct QuestRewards
    {
        /// <summary>Experience points.</summary>
        [Min(0)]
        public int xp;

        /// <summary>Gold/money.</summary>
        [Min(0)]
        public int gold;

        /// <summary>Items to give.</summary>
        public List<RewardItem> items;

        /// <summary>Reputation changes with factions.</summary>
        public List<ReputationChange> reputation;

        /// <summary>Quest IDs unlocked by this reward.</summary>
        public List<string> unlocksQuests;

        public static QuestRewards Empty => new QuestRewards
        {
            xp = 0,
            gold = 0,
            items = new List<RewardItem>(),
            reputation = new List<ReputationChange>(),
            unlocksQuests = new List<string>()
        };
    }

    /// <summary>
    /// A stage/phase of a quest with its own objectives.
    /// </summary>
    [Serializable]
    public struct QuestStage
    {
        /// <summary>Unique ID within the quest.</summary>
        public string id;

        /// <summary>Stage title (e.g., "Find the Address").</summary>
        public string title;

        /// <summary>Narrative description for this stage.</summary>
        [TextArea(2, 4)]
        public string description;

        /// <summary>Objectives for this stage.</summary>
        public List<QuestObjective> objectives;

        /// <summary>Journal entry shown when stage begins.</summary>
        [TextArea(2, 4)]
        public string onStartText;

        /// <summary>Journal entry shown when stage completes.</summary>
        [TextArea(2, 4)]
        public string onCompleteText;

        /// <summary>Rewards granted when this stage completes.</summary>
        public QuestRewards stageRewards;
    }

    /// <summary>
    /// Prerequisites required to start a quest.
    /// </summary>
    [Serializable]
    public struct QuestPrerequisites
    {
        /// <summary>Quests that must be completed first.</summary>
        public List<QuestData> completedQuests;

        /// <summary>Quest IDs for serialization.</summary>
        public List<string> completedQuestIds;

        /// <summary>Minimum player level required.</summary>
        [Min(1)]
        public int minLevel;

        /// <summary>Required faction reputation.</summary>
        public List<ReputationChange> factionReputation;

        /// <summary>Required items in inventory.</summary>
        public List<ItemData> requiredItems;

        /// <summary>Required item IDs for serialization.</summary>
        public List<string> requiredItemIds;

        public static QuestPrerequisites None => new QuestPrerequisites
        {
            completedQuests = new List<QuestData>(),
            completedQuestIds = new List<string>(),
            minLevel = 1,
            factionReputation = new List<ReputationChange>(),
            requiredItems = new List<ItemData>(),
            requiredItemIds = new List<string>()
        };
    }

    /// <summary>
    /// Quest data definition as a ScriptableObject.
    /// Quests are multi-stage journeys with objectives, rewards, and narrative.
    /// </summary>
    [CreateAssetMenu(fileName = "New Quest", menuName = "Iron Frontier/Data/Quest Data", order = 3)]
    public class QuestData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique quest identifier.</summary>
        [Tooltip("Unique quest identifier")]
        public string id;

        /// <summary>Display title shown in quest log.</summary>
        [Tooltip("Display title shown in quest log")]
        public string title;

        /// <summary>Brief description shown in quest log.</summary>
        [Tooltip("Brief description shown in quest log")]
        [TextArea(2, 4)]
        public string description;

        /// <summary>Quest type (main, side, etc.).</summary>
        [Tooltip("Quest type")]
        public QuestType type;

        [Header("Quest Giver")]
        /// <summary>NPC who gives this quest (null for auto-triggered).</summary>
        [Tooltip("NPC who gives this quest")]
        public NPCData giverNpc;

        /// <summary>NPC ID for serialization.</summary>
        [Tooltip("NPC ID for serialization")]
        public string giverNpcId;

        /// <summary>Location where quest can be started.</summary>
        [Tooltip("Location where quest can be started")]
        public LocationData startLocation;

        /// <summary>Location ID for serialization.</summary>
        [Tooltip("Location ID for serialization")]
        public string startLocationId;

        [Header("Difficulty")]
        /// <summary>Recommended player level.</summary>
        [Tooltip("Recommended player level")]
        [Range(1, 10)]
        public int recommendedLevel = 1;

        [Header("Stages")]
        /// <summary>Ordered stages of the quest.</summary>
        [Tooltip("Ordered stages of the quest")]
        public List<QuestStage> stages = new List<QuestStage>();

        [Header("Prerequisites")]
        /// <summary>Requirements to start this quest.</summary>
        [Tooltip("Requirements to start this quest")]
        public QuestPrerequisites prerequisites = QuestPrerequisites.None;

        [Header("Rewards")]
        /// <summary>Final rewards granted on quest completion.</summary>
        [Tooltip("Final rewards on completion (in addition to stage rewards)")]
        public QuestRewards rewards = QuestRewards.Empty;

        [Header("Options")]
        /// <summary>Is this quest repeatable?</summary>
        [Tooltip("Is this quest repeatable?")]
        public bool repeatable;

        /// <summary>Time limit in game-hours (0 = no limit).</summary>
        [Tooltip("Time limit in game-hours (0 = no limit)")]
        [Min(0)]
        public int timeLimitHours;

        [Header("Metadata")]
        /// <summary>Tags for categorization and filtering.</summary>
        [Tooltip("Tags for categorization")]
        public List<string> tags = new List<string>();

        /// <summary>Checks if this quest is a main quest.</summary>
        public bool IsMainQuest => type == QuestType.Main;

        /// <summary>Gets the total number of stages.</summary>
        public int StageCount => stages.Count;

        /// <summary>Gets the total XP reward including all stages.</summary>
        public int TotalXP
        {
            get
            {
                int total = rewards.xp;
                foreach (var stage in stages)
                {
                    total += stage.stageRewards.xp;
                }
                return total;
            }
        }

        /// <summary>Gets the total gold reward including all stages.</summary>
        public int TotalGold
        {
            get
            {
                int total = rewards.gold;
                foreach (var stage in stages)
                {
                    total += stage.stageRewards.gold;
                }
                return total;
            }
        }

        /// <summary>Checks if this quest has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Gets a stage by index.</summary>
        public QuestStage? GetStage(int index)
        {
            if (index >= 0 && index < stages.Count)
                return stages[index];
            return null;
        }

        /// <summary>Checks if all required objectives in a stage are complete.</summary>
        public bool IsStageComplete(int stageIndex, Dictionary<string, int> progress)
        {
            if (stageIndex < 0 || stageIndex >= stages.Count)
                return false;

            var stage = stages[stageIndex];
            foreach (var objective in stage.objectives)
            {
                if (objective.optional)
                    continue;

                int current = progress.TryGetValue(objective.id, out var val) ? val : 0;
                if (current < objective.count)
                    return false;
            }
            return true;
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }
        }
#endif
    }
}
