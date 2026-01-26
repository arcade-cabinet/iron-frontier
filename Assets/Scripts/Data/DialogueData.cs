using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Condition types that can gate dialogue options.
    /// </summary>
    public enum DialogueConditionType
    {
        /// <summary>Player has quest in progress.</summary>
        QuestActive,
        /// <summary>Player has completed quest.</summary>
        QuestComplete,
        /// <summary>Player hasn't started quest.</summary>
        QuestNotStarted,
        /// <summary>Player has specific item.</summary>
        HasItem,
        /// <summary>Player doesn't have item.</summary>
        LacksItem,
        /// <summary>Reputation >= threshold.</summary>
        ReputationGte,
        /// <summary>Reputation <= threshold.</summary>
        ReputationLte,
        /// <summary>Gold >= amount.</summary>
        GoldGte,
        /// <summary>Has talked to specific NPC.</summary>
        TalkedTo,
        /// <summary>Hasn't talked to specific NPC.</summary>
        NotTalkedTo,
        /// <summary>Morning, afternoon, evening, night.</summary>
        TimeOfDay,
        /// <summary>Custom flag is set.</summary>
        FlagSet,
        /// <summary>Custom flag is not set.</summary>
        FlagNotSet,
        /// <summary>First time talking to this NPC.</summary>
        FirstMeeting,
        /// <summary>Not first time talking.</summary>
        ReturnVisit
    }

    /// <summary>
    /// Effect types that modify game state after dialogue.
    /// </summary>
    public enum DialogueEffectType
    {
        /// <summary>Begin a quest.</summary>
        StartQuest,
        /// <summary>Mark quest complete.</summary>
        CompleteQuest,
        /// <summary>Update quest progress.</summary>
        AdvanceQuest,
        /// <summary>Give item to player.</summary>
        GiveItem,
        /// <summary>Remove item from player.</summary>
        TakeItem,
        /// <summary>Award gold.</summary>
        GiveGold,
        /// <summary>Charge gold.</summary>
        TakeGold,
        /// <summary>Modify player reputation.</summary>
        ChangeReputation,
        /// <summary>Set a custom flag.</summary>
        SetFlag,
        /// <summary>Clear a custom flag.</summary>
        ClearFlag,
        /// <summary>Discover a location.</summary>
        UnlockLocation,
        /// <summary>Modify NPC disposition/state.</summary>
        ChangeNpcState,
        /// <summary>Trigger a world event.</summary>
        TriggerEvent,
        /// <summary>Open NPC's shop for trading.</summary>
        OpenShop,
        /// <summary>Start combat encounter.</summary>
        TriggerCombat
    }

    /// <summary>
    /// A condition that must be met for dialogue to be available.
    /// </summary>
    [Serializable]
    public struct DialogueCondition
    {
        /// <summary>Type of condition.</summary>
        public DialogueConditionType type;

        /// <summary>Target ID (quest, item, NPC, flag).</summary>
        public string target;

        /// <summary>Numeric value for thresholds.</summary>
        public int value;

        /// <summary>String value for time_of_day, etc.</summary>
        public string stringValue;

        public static DialogueCondition QuestActive(string questId) => new DialogueCondition
        {
            type = DialogueConditionType.QuestActive,
            target = questId
        };

        public static DialogueCondition QuestComplete(string questId) => new DialogueCondition
        {
            type = DialogueConditionType.QuestComplete,
            target = questId
        };

        public static DialogueCondition HasItem(string itemId) => new DialogueCondition
        {
            type = DialogueConditionType.HasItem,
            target = itemId
        };

        public static DialogueCondition FlagSet(string flagId) => new DialogueCondition
        {
            type = DialogueConditionType.FlagSet,
            target = flagId
        };

        public static DialogueCondition FirstMeeting() => new DialogueCondition
        {
            type = DialogueConditionType.FirstMeeting
        };
    }

    /// <summary>
    /// An effect that modifies game state after dialogue.
    /// </summary>
    [Serializable]
    public struct DialogueEffect
    {
        /// <summary>Type of effect.</summary>
        public DialogueEffectType type;

        /// <summary>Target ID (quest, item, location, flag).</summary>
        public string target;

        /// <summary>Numeric value for amounts.</summary>
        public int value;

        /// <summary>String value for additional data.</summary>
        public string stringValue;

        public static DialogueEffect StartQuest(string questId) => new DialogueEffect
        {
            type = DialogueEffectType.StartQuest,
            target = questId
        };

        public static DialogueEffect GiveItem(string itemId, int count = 1) => new DialogueEffect
        {
            type = DialogueEffectType.GiveItem,
            target = itemId,
            value = count
        };

        public static DialogueEffect GiveGold(int amount) => new DialogueEffect
        {
            type = DialogueEffectType.GiveGold,
            value = amount
        };

        public static DialogueEffect SetFlag(string flagId) => new DialogueEffect
        {
            type = DialogueEffectType.SetFlag,
            target = flagId
        };

        public static DialogueEffect OpenShop(string shopId = null) => new DialogueEffect
        {
            type = DialogueEffectType.OpenShop,
            target = shopId
        };
    }

    /// <summary>
    /// A player choice in dialogue.
    /// </summary>
    [Serializable]
    public struct DialogueChoice
    {
        /// <summary>Display text for this choice.</summary>
        [TextArea(1, 2)]
        public string text;

        /// <summary>ID of the next dialogue node (empty = end conversation).</summary>
        public string nextNodeId;

        /// <summary>Conditions that must be met to show this choice.</summary>
        public List<DialogueCondition> conditions;

        /// <summary>Effects triggered when this choice is selected.</summary>
        public List<DialogueEffect> effects;

        /// <summary>Tags for filtering/styling (e.g., 'aggressive', 'kind', 'bribe').</summary>
        public List<string> tags;

        /// <summary>Tooltip or hint text.</summary>
        public string hint;

        /// <summary>Creates a simple choice that leads to another node.</summary>
        public static DialogueChoice Simple(string text, string nextNodeId = null)
        {
            return new DialogueChoice
            {
                text = text,
                nextNodeId = nextNodeId ?? "",
                conditions = new List<DialogueCondition>(),
                effects = new List<DialogueEffect>(),
                tags = new List<string>()
            };
        }

        /// <summary>Creates a choice that ends the conversation.</summary>
        public static DialogueChoice EndConversation(string text = "Goodbye.")
        {
            return new DialogueChoice
            {
                text = text,
                nextNodeId = "",
                conditions = new List<DialogueCondition>(),
                effects = new List<DialogueEffect>(),
                tags = new List<string> { "end" }
            };
        }
    }

    /// <summary>
    /// A single node in a dialogue tree.
    /// </summary>
    [Serializable]
    public struct DialogueNode
    {
        /// <summary>Unique ID within the dialogue tree.</summary>
        public string id;

        /// <summary>The NPC's spoken text.</summary>
        [TextArea(2, 5)]
        public string text;

        /// <summary>Speaker override (for cutscenes with multiple speakers).</summary>
        public string speaker;

        /// <summary>Conditions required to show this node.</summary>
        public List<DialogueCondition> conditions;

        /// <summary>Available player choices.</summary>
        public List<DialogueChoice> choices;

        /// <summary>Auto-advance to next node (for monologues). Empty = no auto-advance.</summary>
        public string nextNodeId;

        /// <summary>Delay before showing choices (ms, for dramatic effect).</summary>
        [Min(0)]
        public int choiceDelayMs;

        /// <summary>Effects triggered when this node is shown.</summary>
        public List<DialogueEffect> onEnterEffects;

        /// <summary>Tags for this node (for analytics, conditionals).</summary>
        public List<string> tags;

        /// <summary>Portrait expression override (e.g., 'angry', 'happy', 'suspicious').</summary>
        public string expression;

        /// <summary>Checks if this node auto-advances to another.</summary>
        public bool HasAutoAdvance => !string.IsNullOrEmpty(nextNodeId);

        /// <summary>Checks if this is a terminal node (ends conversation).</summary>
        public bool IsTerminal => string.IsNullOrEmpty(nextNodeId) && (choices == null || choices.Count == 0);
    }

    /// <summary>
    /// Entry point definition for dialogue trees.
    /// </summary>
    [Serializable]
    public struct DialogueEntryPoint
    {
        /// <summary>Node ID to start from.</summary>
        public string nodeId;

        /// <summary>Conditions that determine if this entry point is used.</summary>
        public List<DialogueCondition> conditions;

        /// <summary>Priority (higher = checked first).</summary>
        public int priority;
    }

    /// <summary>
    /// Dialogue tree data definition as a ScriptableObject.
    /// Contains branching conversations with conditions and effects.
    /// </summary>
    [CreateAssetMenu(fileName = "New Dialogue", menuName = "Iron Frontier/Data/Dialogue Data", order = 4)]
    public class DialogueData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier for this dialogue tree.</summary>
        [Tooltip("Unique identifier")]
        public string id;

        /// <summary>Human-readable name (for editors).</summary>
        [Tooltip("Human-readable name for editors")]
        public string displayName;

        /// <summary>Description of this dialogue's purpose.</summary>
        [Tooltip("Description of this dialogue's purpose")]
        [TextArea(1, 3)]
        public string description;

        [Header("Structure")]
        /// <summary>All nodes in this dialogue tree.</summary>
        [Tooltip("All nodes in this tree")]
        public List<DialogueNode> nodes = new List<DialogueNode>();

        /// <summary>Entry points - conditions determine which one starts.</summary>
        [Tooltip("Entry points - conditions determine which starts")]
        public List<DialogueEntryPoint> entryPoints = new List<DialogueEntryPoint>();

        [Header("Metadata")]
        /// <summary>Tags for categorization.</summary>
        [Tooltip("Tags for categorization")]
        public List<string> tags = new List<string>();

        /// <summary>Gets a node by its ID.</summary>
        public DialogueNode? GetNode(string nodeId)
        {
            foreach (var node in nodes)
            {
                if (node.id == nodeId)
                    return node;
            }
            return null;
        }

        /// <summary>Gets the starting node based on conditions.</summary>
        /// <param name="checkCondition">Function to evaluate conditions.</param>
        public DialogueNode? GetEntryNode(Func<DialogueCondition, bool> checkCondition)
        {
            // Sort by priority (higher first)
            var sorted = new List<DialogueEntryPoint>(entryPoints);
            sorted.Sort((a, b) => b.priority.CompareTo(a.priority));

            foreach (var entry in sorted)
            {
                bool allMet = true;
                if (entry.conditions != null)
                {
                    foreach (var condition in entry.conditions)
                    {
                        if (!checkCondition(condition))
                        {
                            allMet = false;
                            break;
                        }
                    }
                }

                if (allMet)
                {
                    return GetNode(entry.nodeId);
                }
            }

            // Fall back to first entry point
            if (sorted.Count > 0)
            {
                return GetNode(sorted[sorted.Count - 1].nodeId);
            }

            return null;
        }

        /// <summary>Gets available choices for a node based on conditions.</summary>
        public List<DialogueChoice> GetAvailableChoices(DialogueNode node, Func<DialogueCondition, bool> checkCondition)
        {
            var available = new List<DialogueChoice>();

            if (node.choices == null)
                return available;

            foreach (var choice in node.choices)
            {
                bool allMet = true;
                if (choice.conditions != null && choice.conditions.Count > 0)
                {
                    foreach (var condition in choice.conditions)
                    {
                        if (!checkCondition(condition))
                        {
                            allMet = false;
                            break;
                        }
                    }
                }

                if (allMet)
                {
                    available.Add(choice);
                }
            }

            return available;
        }

        /// <summary>Validates that all node references are valid.</summary>
        public List<string> Validate()
        {
            var errors = new List<string>();
            var nodeIds = new HashSet<string>();

            foreach (var node in nodes)
            {
                nodeIds.Add(node.id);
            }

            // Check entry points
            foreach (var entry in entryPoints)
            {
                if (!nodeIds.Contains(entry.nodeId))
                {
                    errors.Add($"Entry point references unknown node: {entry.nodeId}");
                }
            }

            // Check node references
            foreach (var node in nodes)
            {
                if (!string.IsNullOrEmpty(node.nextNodeId) && !nodeIds.Contains(node.nextNodeId))
                {
                    errors.Add($"Node '{node.id}' references unknown next node: {node.nextNodeId}");
                }

                if (node.choices != null)
                {
                    foreach (var choice in node.choices)
                    {
                        if (!string.IsNullOrEmpty(choice.nextNodeId) && !nodeIds.Contains(choice.nextNodeId))
                        {
                            errors.Add($"Choice in node '{node.id}' references unknown node: {choice.nextNodeId}");
                        }
                    }
                }
            }

            return errors;
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
