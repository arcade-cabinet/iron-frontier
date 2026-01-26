using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Represents a single node in a dialogue tree.
    /// Contains NPC speech, player choices, and optional effects.
    /// </summary>
    [Serializable]
    public class DialogueNode
    {
        [Tooltip("Unique ID within the dialogue tree")]
        public string id;

        [Tooltip("The NPC's spoken text")]
        [TextArea(2, 5)]
        public string text;

        [Tooltip("Localization key for the text (optional)")]
        public string localizationKey;

        [Tooltip("Speaker override (for cutscenes with multiple speakers)")]
        public string speaker;

        [Tooltip("Portrait expression override (e.g., 'angry', 'happy', 'suspicious')")]
        public string expression;

        [Tooltip("Conditions required to show this node")]
        public List<DialogueCondition> conditions = new List<DialogueCondition>();

        [Tooltip("Available player choices")]
        public List<DialogueOption> choices = new List<DialogueOption>();

        [Tooltip("Auto-advance to next node (for monologues, leave empty for choices)")]
        public string nextNodeId;

        [Tooltip("Delay before showing choices (seconds, for dramatic effect)")]
        [Range(0f, 5f)]
        public float choiceDelay;

        [Tooltip("Effects triggered when this node is shown")]
        public List<DialogueEffect> onEnterEffects = new List<DialogueEffect>();

        [Tooltip("Tags for this node (for analytics, conditionals)")]
        public List<string> tags = new List<string>();

        /// <summary>
        /// Whether this node is a monologue (auto-advances without choices)
        /// </summary>
        public bool IsMonologue => !string.IsNullOrEmpty(nextNodeId);

        /// <summary>
        /// Whether this node has player choices
        /// </summary>
        public bool HasChoices => choices != null && choices.Count > 0;

        /// <summary>
        /// Whether this node ends the conversation
        /// </summary>
        public bool IsEndNode => string.IsNullOrEmpty(nextNodeId) && !HasChoices;

        /// <summary>
        /// Whether this node has any conditions
        /// </summary>
        public bool HasConditions => conditions != null && conditions.Count > 0;

        /// <summary>
        /// Whether this node has any on-enter effects
        /// </summary>
        public bool HasOnEnterEffects => onEnterEffects != null && onEnterEffects.Count > 0;

        /// <summary>
        /// Get the display text, using localization if available
        /// </summary>
        public string GetDisplayText()
        {
            // TODO: Integrate with Unity Localization package
            // if (!string.IsNullOrEmpty(localizationKey))
            // {
            //     return LocalizationSettings.StringDatabase.GetLocalizedString(localizationKey);
            // }
            return text;
        }

        /// <summary>
        /// Get the speaker name (or null if no override)
        /// </summary>
        public string GetSpeaker()
        {
            return string.IsNullOrEmpty(speaker) ? null : speaker;
        }

        /// <summary>
        /// Check if this node has a specific tag
        /// </summary>
        public bool HasTag(string tag)
        {
            return tags != null && tags.Contains(tag);
        }

        public DialogueNode() { }

        public DialogueNode(string id, string text)
        {
            this.id = id;
            this.text = text;
        }

        /// <summary>
        /// Create a simple node with choices
        /// </summary>
        public static DialogueNode WithChoices(string id, string text, params DialogueOption[] options)
        {
            var node = new DialogueNode
            {
                id = id,
                text = text
            };
            node.choices.AddRange(options);
            return node;
        }

        /// <summary>
        /// Create a monologue node that auto-advances
        /// </summary>
        public static DialogueNode Monologue(string id, string text, string nextNodeId)
        {
            return new DialogueNode
            {
                id = id,
                text = text,
                nextNodeId = nextNodeId
            };
        }

        /// <summary>
        /// Create an end node
        /// </summary>
        public static DialogueNode End(string id, string text)
        {
            return new DialogueNode
            {
                id = id,
                text = text
            };
        }

        /// <summary>
        /// Add a choice to this node (fluent API)
        /// </summary>
        public DialogueNode AddChoice(DialogueOption option)
        {
            choices ??= new List<DialogueOption>();
            choices.Add(option);
            return this;
        }

        /// <summary>
        /// Add an on-enter effect (fluent API)
        /// </summary>
        public DialogueNode AddOnEnterEffect(DialogueEffect effect)
        {
            onEnterEffects ??= new List<DialogueEffect>();
            onEnterEffects.Add(effect);
            return this;
        }

        /// <summary>
        /// Set the expression (fluent API)
        /// </summary>
        public DialogueNode WithExpression(string expr)
        {
            expression = expr;
            return this;
        }

        /// <summary>
        /// Set the speaker override (fluent API)
        /// </summary>
        public DialogueNode WithSpeaker(string speakerName)
        {
            speaker = speakerName;
            return this;
        }

        public override string ToString()
        {
            var choiceCount = choices?.Count ?? 0;
            var suffix = IsMonologue ? $" -> {nextNodeId}" : (IsEndNode ? " [END]" : $" [{choiceCount} choices]");
            return $"Node[{id}]: {text.Substring(0, Math.Min(40, text.Length))}...{suffix}";
        }
    }
}
