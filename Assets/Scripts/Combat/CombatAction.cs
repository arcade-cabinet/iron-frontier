using System;
using UnityEngine;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Types of actions a combatant can take during combat.
    /// </summary>
    public enum CombatActionType
    {
        /// <summary>Basic attack against a target.</summary>
        Attack,

        /// <summary>Defensive stance (reduce incoming damage).</summary>
        Defend,

        /// <summary>Use a consumable item.</summary>
        Item,

        /// <summary>Attempt to escape from combat.</summary>
        Flee,

        /// <summary>Special ability (future expansion).</summary>
        Skill
    }

    /// <summary>
    /// A combat action to be executed by a combatant.
    /// </summary>
    [Serializable]
    public class CombatAction
    {
        /// <summary>Type of action being performed.</summary>
        public CombatActionType Type;

        /// <summary>ID of the combatant performing the action.</summary>
        public string ActorId;

        /// <summary>ID of the target combatant (if applicable).</summary>
        public string TargetId;

        /// <summary>ID of the item being used (for 'Item' action).</summary>
        public string ItemId;

        /// <summary>ID of the skill being used (for 'Skill' action).</summary>
        public string SkillId;

        /// <summary>
        /// Create an attack action.
        /// </summary>
        public static CombatAction Attack(string actorId, string targetId)
        {
            return new CombatAction
            {
                Type = CombatActionType.Attack,
                ActorId = actorId,
                TargetId = targetId
            };
        }

        /// <summary>
        /// Create a defend action.
        /// </summary>
        public static CombatAction Defend(string actorId)
        {
            return new CombatAction
            {
                Type = CombatActionType.Defend,
                ActorId = actorId
            };
        }

        /// <summary>
        /// Create an item use action.
        /// </summary>
        public static CombatAction UseItem(string actorId, string itemId, string targetId = null)
        {
            return new CombatAction
            {
                Type = CombatActionType.Item,
                ActorId = actorId,
                ItemId = itemId,
                TargetId = targetId
            };
        }

        /// <summary>
        /// Create a flee action.
        /// </summary>
        public static CombatAction Flee(string actorId)
        {
            return new CombatAction
            {
                Type = CombatActionType.Flee,
                ActorId = actorId
            };
        }

        /// <summary>
        /// Create a skill use action.
        /// </summary>
        public static CombatAction UseSkill(string actorId, string skillId, string targetId = null)
        {
            return new CombatAction
            {
                Type = CombatActionType.Skill,
                ActorId = actorId,
                SkillId = skillId,
                TargetId = targetId
            };
        }

        public override string ToString()
        {
            return Type switch
            {
                CombatActionType.Attack => $"Attack: {ActorId} -> {TargetId}",
                CombatActionType.Defend => $"Defend: {ActorId}",
                CombatActionType.Item => $"Item: {ActorId} uses {ItemId}",
                CombatActionType.Flee => $"Flee: {ActorId}",
                CombatActionType.Skill => $"Skill: {ActorId} uses {SkillId}",
                _ => $"Unknown action by {ActorId}"
            };
        }
    }

    /// <summary>
    /// ScriptableObject definition for combat action templates.
    /// Used for skill and special ability definitions.
    /// </summary>
    [CreateAssetMenu(fileName = "NewCombatActionDef", menuName = "Iron Frontier/Combat/Action Definition")]
    public class CombatActionDefinition : ScriptableObject
    {
        [Header("Identity")]
        [Tooltip("Unique identifier for this action.")]
        public string ActionId;

        [Tooltip("Display name shown in UI.")]
        public string DisplayName;

        [Tooltip("Description of the action.")]
        [TextArea(2, 4)]
        public string Description;

        [Header("Action Type")]
        [Tooltip("Base type of this action.")]
        public CombatActionType BaseType = CombatActionType.Attack;

        [Header("Targeting")]
        [Tooltip("Does this action require a target?")]
        public bool RequiresTarget = true;

        [Tooltip("Can target self?")]
        public bool CanTargetSelf;

        [Tooltip("Can target allies?")]
        public bool CanTargetAllies;

        [Tooltip("Can target enemies?")]
        public bool CanTargetEnemies = true;

        [Tooltip("Affects all valid targets (AoE)?")]
        public bool IsAreaOfEffect;

        [Header("Damage")]
        [Tooltip("Base damage modifier (multiplier to attack stat).")]
        [Range(0f, 5f)]
        public float DamageMultiplier = 1f;

        [Tooltip("Damage type for resistance calculations.")]
        public DamageType DamageType = DamageType.Physical;

        [Header("Effects")]
        [Tooltip("Status effect to apply on hit.")]
        public StatusEffectType? AppliedEffect;

        [Tooltip("Effect duration in turns.")]
        [Range(1, 10)]
        public int EffectDuration = 3;

        [Tooltip("Effect value (damage per turn, stat modifier percentage, etc.).")]
        public float EffectValue = 10f;

        [Header("Costs")]
        [Tooltip("Mana/energy cost to use.")]
        [Range(0, 100)]
        public int ManaCost;

        [Tooltip("Cooldown in turns.")]
        [Range(0, 10)]
        public int Cooldown;

        [Header("Visual")]
        [Tooltip("Icon for UI display.")]
        public Sprite Icon;

        [Tooltip("Animation trigger name.")]
        public string AnimationTrigger;

        [Tooltip("VFX prefab to spawn.")]
        public GameObject EffectPrefab;

        [Header("Audio")]
        [Tooltip("Sound effect on use.")]
        public AudioClip UseSound;

        [Tooltip("Sound effect on hit.")]
        public AudioClip HitSound;
    }

    /// <summary>
    /// Damage types for elemental/resistance calculations.
    /// </summary>
    public enum DamageType
    {
        Physical,
        Fire,
        Ice,
        Lightning,
        Poison,
        Holy,
        Dark,
        True // Ignores all resistances
    }

    /// <summary>
    /// Target selection strategy for AI.
    /// </summary>
    public enum TargetSelectionStrategy
    {
        /// <summary>Target the combatant with lowest HP.</summary>
        LowestHP,

        /// <summary>Target the combatant dealing most damage.</summary>
        HighestThreat,

        /// <summary>Random target selection.</summary>
        Random,

        /// <summary>Always target player if possible.</summary>
        PlayerFirst
    }

    /// <summary>
    /// AI decision result with action and reasoning.
    /// </summary>
    [Serializable]
    public class AIDecision
    {
        /// <summary>Action to take.</summary>
        public CombatAction Action;

        /// <summary>Priority/weight of this decision.</summary>
        public int Priority;

        /// <summary>Reasoning for this decision (for debugging).</summary>
        public string Reasoning;

        public override string ToString()
        {
            return $"AI Decision (P:{Priority}): {Action} - {Reasoning}";
        }
    }
}
