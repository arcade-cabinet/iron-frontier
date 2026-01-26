using System;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Types of effects that can modify game state after dialogue choices.
    /// Mirrors the TypeScript DialogueEffectType enum.
    /// </summary>
    public enum DialogueEffectType
    {
        StartQuest,         // Begin a quest
        CompleteQuest,      // Mark quest complete
        AdvanceQuest,       // Update quest progress
        GiveItem,           // Give item to player
        TakeItem,           // Remove item from player
        GiveGold,           // Award gold
        TakeGold,           // Charge gold
        ChangeReputation,   // Modify player reputation
        SetFlag,            // Set a custom flag
        ClearFlag,          // Clear a custom flag
        UnlockLocation,     // Discover a location
        ChangeNpcState,     // Modify NPC disposition/state
        TriggerEvent,       // Trigger a world event
        OpenShop            // Open NPC's shop for trading
    }

    /// <summary>
    /// Represents an effect triggered by dialogue choices or node entry.
    /// Effects modify game state (quests, items, reputation, flags, etc.)
    /// </summary>
    [Serializable]
    public class DialogueEffect
    {
        [Tooltip("The type of effect to apply")]
        public DialogueEffectType type;

        [Tooltip("Target ID (quest, item, location, flag, NPC)")]
        public string target;

        [Tooltip("Numeric value for amounts (gold, reputation change, etc.)")]
        public int value;

        [Tooltip("Additional string value for extra data")]
        public string stringValue;

        public DialogueEffect() { }

        public DialogueEffect(DialogueEffectType type, string target = null, int value = 0, string stringValue = null)
        {
            this.type = type;
            this.target = target;
            this.value = value;
            this.stringValue = stringValue;
        }

        /// <summary>
        /// Create a StartQuest effect
        /// </summary>
        public static DialogueEffect StartQuest(string questId) =>
            new DialogueEffect(DialogueEffectType.StartQuest, questId);

        /// <summary>
        /// Create a CompleteQuest effect
        /// </summary>
        public static DialogueEffect CompleteQuest(string questId) =>
            new DialogueEffect(DialogueEffectType.CompleteQuest, questId);

        /// <summary>
        /// Create a GiveItem effect
        /// </summary>
        public static DialogueEffect GiveItem(string itemId, int amount = 1) =>
            new DialogueEffect(DialogueEffectType.GiveItem, itemId, amount);

        /// <summary>
        /// Create a TakeItem effect
        /// </summary>
        public static DialogueEffect TakeItem(string itemId, int amount = 1) =>
            new DialogueEffect(DialogueEffectType.TakeItem, itemId, amount);

        /// <summary>
        /// Create a GiveGold effect
        /// </summary>
        public static DialogueEffect GiveGold(int amount) =>
            new DialogueEffect(DialogueEffectType.GiveGold, null, amount);

        /// <summary>
        /// Create a TakeGold effect
        /// </summary>
        public static DialogueEffect TakeGold(int amount) =>
            new DialogueEffect(DialogueEffectType.TakeGold, null, amount);

        /// <summary>
        /// Create a ChangeReputation effect
        /// </summary>
        public static DialogueEffect ChangeReputation(int amount, string factionId = null) =>
            new DialogueEffect(DialogueEffectType.ChangeReputation, factionId, amount);

        /// <summary>
        /// Create a SetFlag effect
        /// </summary>
        public static DialogueEffect SetFlag(string flagId) =>
            new DialogueEffect(DialogueEffectType.SetFlag, flagId);

        /// <summary>
        /// Create a ClearFlag effect
        /// </summary>
        public static DialogueEffect ClearFlag(string flagId) =>
            new DialogueEffect(DialogueEffectType.ClearFlag, flagId);

        /// <summary>
        /// Create an UnlockLocation effect
        /// </summary>
        public static DialogueEffect UnlockLocation(string locationId) =>
            new DialogueEffect(DialogueEffectType.UnlockLocation, locationId);

        /// <summary>
        /// Create an OpenShop effect
        /// </summary>
        public static DialogueEffect OpenShop(string shopId) =>
            new DialogueEffect(DialogueEffectType.OpenShop, shopId);

        public override string ToString()
        {
            return type switch
            {
                DialogueEffectType.StartQuest => $"Start Quest: {target}",
                DialogueEffectType.CompleteQuest => $"Complete Quest: {target}",
                DialogueEffectType.AdvanceQuest => $"Advance Quest: {target}",
                DialogueEffectType.GiveItem => $"Give Item: {target} x{value}",
                DialogueEffectType.TakeItem => $"Take Item: {target} x{value}",
                DialogueEffectType.GiveGold => $"Give Gold: {value}",
                DialogueEffectType.TakeGold => $"Take Gold: {value}",
                DialogueEffectType.ChangeReputation => $"Change Reputation: {value}",
                DialogueEffectType.SetFlag => $"Set Flag: {target}",
                DialogueEffectType.ClearFlag => $"Clear Flag: {target}",
                DialogueEffectType.UnlockLocation => $"Unlock Location: {target}",
                DialogueEffectType.ChangeNpcState => $"Change NPC State: {target}",
                DialogueEffectType.TriggerEvent => $"Trigger Event: {target}",
                DialogueEffectType.OpenShop => $"Open Shop: {target}",
                _ => $"Unknown Effect: {type}"
            };
        }
    }
}
