using System;
using UnityEngine;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Status effect types that can be applied to combatants.
    /// </summary>
    public enum StatusEffectType
    {
        /// <summary>Damage over time (poison).</summary>
        Poisoned,

        /// <summary>Skip next turn.</summary>
        Stunned,

        /// <summary>Damage over time, higher than poison.</summary>
        Burning,

        /// <summary>Damage over time, scales with movement.</summary>
        Bleeding,

        /// <summary>Increased stats.</summary>
        Buffed,

        /// <summary>Decreased stats.</summary>
        Debuffed,

        /// <summary>Reduced incoming damage.</summary>
        Defending,

        /// <summary>Cannot use abilities.</summary>
        Silenced,

        /// <summary>Reduced accuracy.</summary>
        Blinded,

        /// <summary>Reduced speed.</summary>
        Slowed,

        /// <summary>Health regeneration over time.</summary>
        Regenerating,

        /// <summary>Increased evasion.</summary>
        Hasted,

        /// <summary>Reflects portion of damage taken.</summary>
        Thorns,

        /// <summary>Immune to damage.</summary>
        Invulnerable,

        /// <summary>Cannot act but takes reduced damage.</summary>
        Frozen
    }

    /// <summary>
    /// A status effect instance on a combatant.
    /// </summary>
    [Serializable]
    public class StatusEffect
    {
        [Header("Effect Type")]
        [Tooltip("Type of the effect.")]
        public StatusEffectType Type;

        [Header("Duration")]
        [Tooltip("Remaining turns for this effect.")]
        public int TurnsRemaining;

        [Header("Magnitude")]
        [Tooltip("Value/magnitude of the effect (damage per turn, stat modifier %, etc.).")]
        public float Value;

        [Header("Source")]
        [Tooltip("Source of the effect (for stacking rules).")]
        public string SourceId;

        /// <summary>
        /// Does this effect deal damage over time?
        /// </summary>
        public bool IsDamageOverTime => Type switch
        {
            StatusEffectType.Poisoned => true,
            StatusEffectType.Burning => true,
            StatusEffectType.Bleeding => true,
            _ => false
        };

        /// <summary>
        /// Does this effect heal over time?
        /// </summary>
        public bool IsHealOverTime => Type == StatusEffectType.Regenerating;

        /// <summary>
        /// Does this effect prevent actions?
        /// </summary>
        public bool PreventsAction => Type switch
        {
            StatusEffectType.Stunned => true,
            StatusEffectType.Frozen => true,
            _ => false
        };

        /// <summary>
        /// Is this effect beneficial to the target?
        /// </summary>
        public bool IsBuff => Type switch
        {
            StatusEffectType.Buffed => true,
            StatusEffectType.Defending => true,
            StatusEffectType.Regenerating => true,
            StatusEffectType.Hasted => true,
            StatusEffectType.Thorns => true,
            StatusEffectType.Invulnerable => true,
            _ => false
        };

        /// <summary>
        /// Is this effect harmful to the target?
        /// </summary>
        public bool IsDebuff => !IsBuff;

        /// <summary>
        /// Create a clone of this status effect.
        /// </summary>
        public StatusEffect Clone()
        {
            return new StatusEffect
            {
                Type = Type,
                TurnsRemaining = TurnsRemaining,
                Value = Value,
                SourceId = SourceId
            };
        }

        /// <summary>
        /// Get display name for UI.
        /// </summary>
        public string GetDisplayName()
        {
            return Type switch
            {
                StatusEffectType.Poisoned => "Poisoned",
                StatusEffectType.Stunned => "Stunned",
                StatusEffectType.Burning => "Burning",
                StatusEffectType.Bleeding => "Bleeding",
                StatusEffectType.Buffed => "Buffed",
                StatusEffectType.Debuffed => "Debuffed",
                StatusEffectType.Defending => "Defending",
                StatusEffectType.Silenced => "Silenced",
                StatusEffectType.Blinded => "Blinded",
                StatusEffectType.Slowed => "Slowed",
                StatusEffectType.Regenerating => "Regenerating",
                StatusEffectType.Hasted => "Hasted",
                StatusEffectType.Thorns => "Thorns",
                StatusEffectType.Invulnerable => "Invulnerable",
                StatusEffectType.Frozen => "Frozen",
                _ => Type.ToString()
            };
        }

        /// <summary>
        /// Get description for UI.
        /// </summary>
        public string GetDescription()
        {
            return Type switch
            {
                StatusEffectType.Poisoned => $"Taking {Value:F0} poison damage per turn",
                StatusEffectType.Stunned => "Cannot take actions",
                StatusEffectType.Burning => $"Taking {Value * 1.5f:F0} fire damage per turn",
                StatusEffectType.Bleeding => $"Taking {Value:F0}% max HP as damage per turn",
                StatusEffectType.Buffed => $"+{Value:F0}% Attack and Defense",
                StatusEffectType.Debuffed => $"-{Value:F0}% Attack and Accuracy",
                StatusEffectType.Defending => $"-{Value:F0}% incoming damage",
                StatusEffectType.Silenced => "Cannot use abilities",
                StatusEffectType.Blinded => $"-{Value:F0}% Accuracy",
                StatusEffectType.Slowed => $"-{Value:F0}% Speed",
                StatusEffectType.Regenerating => $"Healing {Value:F0} HP per turn",
                StatusEffectType.Hasted => $"+{Value:F0}% Evasion and Speed",
                StatusEffectType.Thorns => $"Reflects {Value:F0}% of damage taken",
                StatusEffectType.Invulnerable => "Immune to all damage",
                StatusEffectType.Frozen => "Cannot act, -50% damage taken",
                _ => $"Effect value: {Value:F0}"
            };
        }

        /// <summary>
        /// Get icon color for UI.
        /// </summary>
        public Color GetIconColor()
        {
            return Type switch
            {
                StatusEffectType.Poisoned => new Color(0.2f, 0.8f, 0.2f),    // Green
                StatusEffectType.Stunned => new Color(1f, 1f, 0.2f),          // Yellow
                StatusEffectType.Burning => new Color(1f, 0.4f, 0.1f),        // Orange
                StatusEffectType.Bleeding => new Color(0.8f, 0.1f, 0.1f),     // Red
                StatusEffectType.Buffed => new Color(0.2f, 0.6f, 1f),         // Blue
                StatusEffectType.Debuffed => new Color(0.6f, 0.2f, 0.6f),     // Purple
                StatusEffectType.Defending => new Color(0.5f, 0.5f, 0.8f),    // Light blue
                StatusEffectType.Silenced => new Color(0.5f, 0.5f, 0.5f),     // Gray
                StatusEffectType.Blinded => new Color(0.3f, 0.3f, 0.3f),      // Dark gray
                StatusEffectType.Slowed => new Color(0.4f, 0.7f, 0.9f),       // Cyan
                StatusEffectType.Regenerating => new Color(0.5f, 1f, 0.5f),   // Light green
                StatusEffectType.Hasted => new Color(1f, 0.8f, 0.2f),         // Gold
                StatusEffectType.Thorns => new Color(0.7f, 0.5f, 0.3f),       // Brown
                StatusEffectType.Invulnerable => new Color(1f, 1f, 1f),       // White
                StatusEffectType.Frozen => new Color(0.7f, 0.9f, 1f),         // Ice blue
                _ => Color.white
            };
        }

        public override string ToString()
        {
            return $"{GetDisplayName()} ({TurnsRemaining} turns)";
        }
    }

    /// <summary>
    /// ScriptableObject definition for status effects.
    /// Used for creating reusable effect templates.
    /// </summary>
    [CreateAssetMenu(fileName = "NewStatusEffect", menuName = "Iron Frontier/Combat/Status Effect Definition")]
    public class StatusEffectDefinition : ScriptableObject
    {
        [Header("Identity")]
        [Tooltip("Unique identifier for this effect.")]
        public string EffectId;

        [Tooltip("Display name shown in UI.")]
        public string DisplayName;

        [Tooltip("Description of the effect.")]
        [TextArea(2, 4)]
        public string Description;

        [Header("Effect Properties")]
        [Tooltip("Type of status effect.")]
        public StatusEffectType Type;

        [Tooltip("Default duration in turns.")]
        [Range(1, 20)]
        public int DefaultDuration = 3;

        [Tooltip("Default value/magnitude.")]
        public float DefaultValue = 10f;

        [Header("Stacking")]
        [Tooltip("Can this effect stack with itself?")]
        public bool CanStack = false;

        [Tooltip("Maximum stacks if stackable.")]
        [Range(1, 10)]
        public int MaxStacks = 1;

        [Tooltip("Does applying refresh the duration?")]
        public bool RefreshesDuration = true;

        [Header("Visual")]
        [Tooltip("Icon for UI display.")]
        public Sprite Icon;

        [Tooltip("Color for UI tinting.")]
        public Color IconColor = Color.white;

        [Tooltip("Particle effect prefab.")]
        public GameObject ParticlePrefab;

        [Header("Audio")]
        [Tooltip("Sound on application.")]
        public AudioClip ApplySound;

        [Tooltip("Sound on tick (for DoT effects).")]
        public AudioClip TickSound;

        [Tooltip("Sound on removal.")]
        public AudioClip RemoveSound;

        /// <summary>
        /// Create a status effect instance from this definition.
        /// </summary>
        public StatusEffect CreateInstance(string sourceId = null, int? customDuration = null, float? customValue = null)
        {
            return new StatusEffect
            {
                Type = Type,
                TurnsRemaining = customDuration ?? DefaultDuration,
                Value = customValue ?? DefaultValue,
                SourceId = sourceId
            };
        }
    }

    /// <summary>
    /// Extension methods for status effect collections.
    /// </summary>
    public static class StatusEffectExtensions
    {
        /// <summary>
        /// Calculate total stat modifier from all effects of a given type.
        /// </summary>
        public static float GetTotalModifier(this System.Collections.Generic.IEnumerable<StatusEffect> effects, StatusEffectType type)
        {
            float total = 0f;
            foreach (var effect in effects)
            {
                if (effect.Type == type)
                {
                    total += effect.Value;
                }
            }
            return total;
        }

        /// <summary>
        /// Check if any effect prevents action.
        /// </summary>
        public static bool HasActionPreventingEffect(this System.Collections.Generic.IEnumerable<StatusEffect> effects)
        {
            foreach (var effect in effects)
            {
                if (effect.PreventsAction)
                    return true;
            }
            return false;
        }

        /// <summary>
        /// Get all buff effects.
        /// </summary>
        public static System.Collections.Generic.IEnumerable<StatusEffect> GetBuffs(
            this System.Collections.Generic.IEnumerable<StatusEffect> effects)
        {
            foreach (var effect in effects)
            {
                if (effect.IsBuff)
                    yield return effect;
            }
        }

        /// <summary>
        /// Get all debuff effects.
        /// </summary>
        public static System.Collections.Generic.IEnumerable<StatusEffect> GetDebuffs(
            this System.Collections.Generic.IEnumerable<StatusEffect> effects)
        {
            foreach (var effect in effects)
            {
                if (effect.IsDebuff)
                    yield return effect;
            }
        }
    }
}
