using System;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Types of conditions that can gate dialogue options.
    /// Mirrors the TypeScript ConditionType enum.
    /// </summary>
    public enum ConditionType
    {
        QuestActive,        // Player has quest in progress
        QuestComplete,      // Player has completed quest
        QuestNotStarted,    // Player hasn't started quest
        HasItem,            // Player has specific item
        LacksItem,          // Player doesn't have item
        ReputationGte,      // Reputation >= threshold
        ReputationLte,      // Reputation <= threshold
        GoldGte,            // Gold >= amount
        TalkedTo,           // Has talked to specific NPC
        NotTalkedTo,        // Hasn't talked to specific NPC
        TimeOfDay,          // Morning, afternoon, evening, night
        FlagSet,            // Custom flag is set
        FlagNotSet,         // Custom flag is not set
        FirstMeeting,       // First time talking to this NPC
        ReturnVisit         // Not first time talking
    }

    /// <summary>
    /// Represents a condition that gates dialogue options or entry points.
    /// </summary>
    [Serializable]
    public class DialogueCondition
    {
        [Tooltip("The type of condition to check")]
        public ConditionType type;

        [Tooltip("Target ID (quest, item, NPC, flag)")]
        public string target;

        [Tooltip("Numeric value for thresholds")]
        public int value;

        [Tooltip("String value for time_of_day, etc.")]
        public string stringValue;

        public DialogueCondition() { }

        public DialogueCondition(ConditionType type, string target = null, int value = 0, string stringValue = null)
        {
            this.type = type;
            this.target = target;
            this.value = value;
            this.stringValue = stringValue;
        }

        /// <summary>
        /// Create a QuestActive condition
        /// </summary>
        public static DialogueCondition QuestActive(string questId) =>
            new DialogueCondition(ConditionType.QuestActive, questId);

        /// <summary>
        /// Create a QuestComplete condition
        /// </summary>
        public static DialogueCondition QuestComplete(string questId) =>
            new DialogueCondition(ConditionType.QuestComplete, questId);

        /// <summary>
        /// Create a HasItem condition
        /// </summary>
        public static DialogueCondition HasItem(string itemId) =>
            new DialogueCondition(ConditionType.HasItem, itemId);

        /// <summary>
        /// Create a ReputationGte condition
        /// </summary>
        public static DialogueCondition ReputationGte(int threshold) =>
            new DialogueCondition(ConditionType.ReputationGte, null, threshold);

        /// <summary>
        /// Create a ReputationLte condition
        /// </summary>
        public static DialogueCondition ReputationLte(int threshold) =>
            new DialogueCondition(ConditionType.ReputationLte, null, threshold);

        /// <summary>
        /// Create a GoldGte condition
        /// </summary>
        public static DialogueCondition GoldGte(int amount) =>
            new DialogueCondition(ConditionType.GoldGte, null, amount);

        /// <summary>
        /// Create a FlagSet condition
        /// </summary>
        public static DialogueCondition FlagSet(string flagId) =>
            new DialogueCondition(ConditionType.FlagSet, flagId);

        /// <summary>
        /// Create a FlagNotSet condition
        /// </summary>
        public static DialogueCondition FlagNotSet(string flagId) =>
            new DialogueCondition(ConditionType.FlagNotSet, flagId);

        /// <summary>
        /// Create a FirstMeeting condition
        /// </summary>
        public static DialogueCondition FirstMeeting() =>
            new DialogueCondition(ConditionType.FirstMeeting);

        /// <summary>
        /// Create a ReturnVisit condition
        /// </summary>
        public static DialogueCondition ReturnVisit() =>
            new DialogueCondition(ConditionType.ReturnVisit);

        public override string ToString()
        {
            return type switch
            {
                ConditionType.QuestActive => $"Quest Active: {target}",
                ConditionType.QuestComplete => $"Quest Complete: {target}",
                ConditionType.QuestNotStarted => $"Quest Not Started: {target}",
                ConditionType.HasItem => $"Has Item: {target}",
                ConditionType.LacksItem => $"Lacks Item: {target}",
                ConditionType.ReputationGte => $"Reputation >= {value}",
                ConditionType.ReputationLte => $"Reputation <= {value}",
                ConditionType.GoldGte => $"Gold >= {value}",
                ConditionType.TalkedTo => $"Talked To: {target}",
                ConditionType.NotTalkedTo => $"Not Talked To: {target}",
                ConditionType.TimeOfDay => $"Time of Day: {stringValue}",
                ConditionType.FlagSet => $"Flag Set: {target}",
                ConditionType.FlagNotSet => $"Flag Not Set: {target}",
                ConditionType.FirstMeeting => "First Meeting",
                ConditionType.ReturnVisit => "Return Visit",
                _ => $"Unknown Condition: {type}"
            };
        }
    }
}
