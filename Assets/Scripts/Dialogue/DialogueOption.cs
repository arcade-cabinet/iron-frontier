using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Represents a player choice in dialogue.
    /// Each option can have conditions, effects, and leads to another node.
    /// </summary>
    [Serializable]
    public class DialogueOption
    {
        [Tooltip("Display text for this choice")]
        [TextArea(1, 3)]
        public string text;

        [Tooltip("Localization key for the text (optional)")]
        public string localizationKey;

        [Tooltip("ID of the next dialogue node (empty = end conversation)")]
        public string nextNodeId;

        [Tooltip("Conditions that must be met to show this choice")]
        public List<DialogueCondition> conditions = new List<DialogueCondition>();

        [Tooltip("Effects triggered when this choice is selected")]
        public List<DialogueEffect> effects = new List<DialogueEffect>();

        [Tooltip("Tags for filtering/styling (e.g., 'aggressive', 'kind', 'bribe')")]
        public List<string> tags = new List<string>();

        [Tooltip("Tooltip or hint text shown on hover")]
        public string hint;

        /// <summary>
        /// Whether this option ends the conversation
        /// </summary>
        public bool EndsConversation => string.IsNullOrEmpty(nextNodeId);

        /// <summary>
        /// Whether this option has any conditions
        /// </summary>
        public bool HasConditions => conditions != null && conditions.Count > 0;

        /// <summary>
        /// Whether this option has any effects
        /// </summary>
        public bool HasEffects => effects != null && effects.Count > 0;

        /// <summary>
        /// Check if this option has a specific tag
        /// </summary>
        public bool HasTag(string tag)
        {
            return tags != null && tags.Contains(tag);
        }

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

        public DialogueOption() { }

        public DialogueOption(string text, string nextNodeId = null)
        {
            this.text = text;
            this.nextNodeId = nextNodeId;
        }

        /// <summary>
        /// Create a simple option that leads to another node
        /// </summary>
        public static DialogueOption Simple(string text, string nextNodeId)
        {
            return new DialogueOption
            {
                text = text,
                nextNodeId = nextNodeId
            };
        }

        /// <summary>
        /// Create an option that ends the conversation
        /// </summary>
        public static DialogueOption Exit(string text)
        {
            return new DialogueOption
            {
                text = text,
                nextNodeId = null
            };
        }

        /// <summary>
        /// Create an option with conditions
        /// </summary>
        public static DialogueOption Conditional(string text, string nextNodeId, params DialogueCondition[] conditions)
        {
            var option = new DialogueOption
            {
                text = text,
                nextNodeId = nextNodeId
            };
            option.conditions.AddRange(conditions);
            return option;
        }

        /// <summary>
        /// Create an option with effects
        /// </summary>
        public static DialogueOption WithEffects(string text, string nextNodeId, params DialogueEffect[] effects)
        {
            var option = new DialogueOption
            {
                text = text,
                nextNodeId = nextNodeId
            };
            option.effects.AddRange(effects);
            return option;
        }

        /// <summary>
        /// Add an effect to this option (fluent API)
        /// </summary>
        public DialogueOption AddEffect(DialogueEffect effect)
        {
            effects ??= new List<DialogueEffect>();
            effects.Add(effect);
            return this;
        }

        /// <summary>
        /// Add a condition to this option (fluent API)
        /// </summary>
        public DialogueOption AddCondition(DialogueCondition condition)
        {
            conditions ??= new List<DialogueCondition>();
            conditions.Add(condition);
            return this;
        }

        /// <summary>
        /// Add a tag to this option (fluent API)
        /// </summary>
        public DialogueOption AddTag(string tag)
        {
            tags ??= new List<string>();
            tags.Add(tag);
            return this;
        }

        public override string ToString()
        {
            var suffix = EndsConversation ? " [END]" : $" -> {nextNodeId}";
            return $"[{text}]{suffix}";
        }
    }
}
