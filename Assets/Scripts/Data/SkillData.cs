using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Target types for skills/abilities.
    /// Determines what entities can be targeted by a skill.
    /// </summary>
    public enum SkillTargetType
    {
        /// <summary>Skill affects the caster only.</summary>
        Self,

        /// <summary>Skill targets a single ally.</summary>
        Ally,

        /// <summary>Skill targets a single enemy.</summary>
        Enemy,

        /// <summary>Skill targets an area, hitting multiple enemies.</summary>
        AreaEnemy,

        /// <summary>Skill targets an area, affecting multiple allies.</summary>
        AreaAlly,

        /// <summary>Skill affects all allies simultaneously.</summary>
        AllAllies,

        /// <summary>Skill affects all enemies simultaneously.</summary>
        AllEnemies,

        /// <summary>Skill targets a ground position (hex).</summary>
        Ground
    }

    /// <summary>
    /// Effect types that skills can apply.
    /// </summary>
    public enum SkillEffectType
    {
        /// <summary>Deal direct damage to target.</summary>
        Damage,

        /// <summary>Restore health to target.</summary>
        Heal,

        /// <summary>Apply a positive status effect.</summary>
        Buff,

        /// <summary>Apply a negative status effect.</summary>
        Debuff,

        /// <summary>Prevent target from acting.</summary>
        Stun,

        /// <summary>Push target away from caster.</summary>
        Knockback,

        /// <summary>Pull target towards caster.</summary>
        Pull,

        /// <summary>Create a damage absorption shield.</summary>
        Shield,

        /// <summary>Force enemies to attack the caster.</summary>
        Taunt,

        /// <summary>Become hidden from enemies.</summary>
        Stealth,

        /// <summary>Mark target for bonus damage.</summary>
        Mark,

        /// <summary>Deal bonus damage to low health targets.</summary>
        Execute,

        /// <summary>Incapacitate without killing.</summary>
        NonLethal,

        /// <summary>Create a temporary ally unit.</summary>
        Summon
    }

    /// <summary>
    /// Individual effect within a skill.
    /// A skill can have multiple effects (e.g., damage + stun).
    /// </summary>
    [Serializable]
    public class SkillEffect
    {
        [Header("Effect Type")]
        [Tooltip("Type of effect to apply.")]
        public SkillEffectType Type;

        [Header("Values")]
        [Tooltip("Base value (damage, heal amount, etc.).")]
        [Min(0)]
        public int Value;

        [Tooltip("Duration in turns (0 = instant).")]
        [Min(0)]
        public int Duration;

        [Tooltip("Chance to apply (0-100, for secondary effects).")]
        [Range(0, 100)]
        public int Chance = 100;

        [Header("Status Effect")]
        [Tooltip("Status effect ID to apply (for buff/debuff types).")]
        public string StatusId;

        [Header("Scaling")]
        [Tooltip("Scaling with caster level: value * (1 + level * scaling).")]
        [Range(0f, 1f)]
        public float LevelScaling = 0.1f;

        /// <summary>
        /// Calculate the scaled value based on caster level.
        /// </summary>
        /// <param name="level">Caster's level (1-10).</param>
        /// <returns>Scaled effect value.</returns>
        public int GetScaledValue(int level)
        {
            return Mathf.FloorToInt(Value * (1f + level * LevelScaling));
        }

        /// <summary>
        /// Roll for effect application based on chance.
        /// </summary>
        /// <param name="randomValue">Optional fixed random value for testing.</param>
        /// <returns>True if effect should apply.</returns>
        public bool RollChance(float? randomValue = null)
        {
            if (Chance >= 100) return true;
            if (Chance <= 0) return false;

            float roll = randomValue ?? UnityEngine.Random.value;
            return roll * 100f < Chance;
        }

        /// <summary>
        /// Create a deep copy of this effect.
        /// </summary>
        public SkillEffect Clone()
        {
            return new SkillEffect
            {
                Type = Type,
                Value = Value,
                Duration = Duration,
                Chance = Chance,
                StatusId = StatusId,
                LevelScaling = LevelScaling
            };
        }
    }

    /// <summary>
    /// Skill/ability data definition as a ScriptableObject.
    /// Based on TypeScript CompanionAbilitySchema from companion.ts.
    /// </summary>
    [CreateAssetMenu(fileName = "New Skill", menuName = "Iron Frontier/Data/Skill Data", order = 3)]
    public class SkillData : ScriptableObject
    {
        #region Identity

        [Header("Identity")]
        [Tooltip("Unique identifier for this skill.")]
        public string Id;

        [Tooltip("Display name shown in UI.")]
        public string DisplayName;

        [Tooltip("Description of the skill.")]
        [TextArea(2, 4)]
        public string Description;

        [Tooltip("Icon for UI display.")]
        public Sprite Icon;

        [Tooltip("Icon ID for dynamic loading.")]
        public string IconId;

        #endregion

        #region Targeting

        [Header("Targeting")]
        [Tooltip("What this skill can target.")]
        public SkillTargetType TargetType = SkillTargetType.Enemy;

        [Tooltip("Range in hexes (0 = melee/self).")]
        [Range(0, 10)]
        public int Range = 1;

        [Tooltip("Area of effect radius (0 = single target).")]
        [Range(0, 5)]
        public int AreaRadius;

        #endregion

        #region Costs

        [Header("Costs")]
        [Tooltip("Action point cost to use (0-10).")]
        [Range(0, 10)]
        public int APCost = 2;

        [Tooltip("Cooldown in turns (0 = no cooldown).")]
        [Range(0, 10)]
        public int Cooldown;

        #endregion

        #region Effects

        [Header("Effects")]
        [Tooltip("Effects applied when skill is used.")]
        public List<SkillEffect> Effects = new List<SkillEffect>();

        #endregion

        #region Unlock Requirements

        [Header("Unlock Requirements")]
        [Tooltip("Is this skill unlocked from the start?")]
        public bool UnlockedByDefault = true;

        [Tooltip("Quest ID that unlocks this skill (if not default).")]
        public string UnlockedByQuest;

        [Tooltip("Minimum caster level required.")]
        [Range(1, 10)]
        public int LevelRequired = 1;

        #endregion

        #region Metadata

        [Header("Metadata")]
        [Tooltip("Tags for categorization and filtering.")]
        public List<string> Tags = new List<string>();

        [Tooltip("Sound effect ID to play on use.")]
        public string SoundId;

        [Tooltip("Animation trigger name.")]
        public string AnimationTrigger;

        [Tooltip("VFX prefab to spawn.")]
        public GameObject EffectPrefab;

        #endregion

        #region Properties

        /// <summary>
        /// Does this skill require a target?
        /// </summary>
        public bool RequiresTarget => TargetType != SkillTargetType.Self &&
                                       TargetType != SkillTargetType.AllAllies &&
                                       TargetType != SkillTargetType.AllEnemies;

        /// <summary>
        /// Does this skill affect an area?
        /// </summary>
        public bool IsAreaOfEffect => AreaRadius > 0 ||
                                       TargetType == SkillTargetType.AreaEnemy ||
                                       TargetType == SkillTargetType.AreaAlly ||
                                       TargetType == SkillTargetType.AllAllies ||
                                       TargetType == SkillTargetType.AllEnemies;

        /// <summary>
        /// Does this skill target enemies?
        /// </summary>
        public bool TargetsEnemies => TargetType == SkillTargetType.Enemy ||
                                       TargetType == SkillTargetType.AreaEnemy ||
                                       TargetType == SkillTargetType.AllEnemies;

        /// <summary>
        /// Does this skill target allies?
        /// </summary>
        public bool TargetsAllies => TargetType == SkillTargetType.Ally ||
                                      TargetType == SkillTargetType.AreaAlly ||
                                      TargetType == SkillTargetType.AllAllies ||
                                      TargetType == SkillTargetType.Self;

        /// <summary>
        /// Does this skill have a cooldown?
        /// </summary>
        public bool HasCooldown => Cooldown > 0;

        /// <summary>
        /// Is this a melee skill?
        /// </summary>
        public bool IsMelee => Range == 0;

        #endregion

        #region Methods

        /// <summary>
        /// Check if this skill has a specific tag.
        /// </summary>
        public bool HasTag(string tag)
        {
            return Tags.Contains(tag);
        }

        /// <summary>
        /// Get the primary effect type of this skill.
        /// </summary>
        public SkillEffectType GetPrimaryEffectType()
        {
            return Effects.Count > 0 ? Effects[0].Type : SkillEffectType.Damage;
        }

        /// <summary>
        /// Calculate total damage from all damage effects.
        /// </summary>
        /// <param name="level">Caster level for scaling.</param>
        /// <returns>Total damage value.</returns>
        public int GetTotalDamage(int level = 1)
        {
            int total = 0;
            foreach (var effect in Effects)
            {
                if (effect.Type == SkillEffectType.Damage ||
                    effect.Type == SkillEffectType.Execute)
                {
                    total += effect.GetScaledValue(level);
                }
            }
            return total;
        }

        /// <summary>
        /// Calculate total healing from all heal effects.
        /// </summary>
        /// <param name="level">Caster level for scaling.</param>
        /// <returns>Total heal value.</returns>
        public int GetTotalHealing(int level = 1)
        {
            int total = 0;
            foreach (var effect in Effects)
            {
                if (effect.Type == SkillEffectType.Heal)
                {
                    total += effect.GetScaledValue(level);
                }
            }
            return total;
        }

        /// <summary>
        /// Get display text for the skill cost.
        /// </summary>
        public string GetCostDisplay()
        {
            if (APCost == 0) return "Free";
            return $"{APCost} AP";
        }

        /// <summary>
        /// Get display text for the cooldown.
        /// </summary>
        public string GetCooldownDisplay()
        {
            if (Cooldown == 0) return "None";
            return $"{Cooldown} turn{(Cooldown > 1 ? "s" : "")}";
        }

        /// <summary>
        /// Get display text for the range.
        /// </summary>
        public string GetRangeDisplay()
        {
            if (Range == 0) return "Melee";
            return $"{Range} hex{(Range > 1 ? "es" : "")}";
        }

        /// <summary>
        /// Get a formatted tooltip for UI display.
        /// </summary>
        public string GetTooltip()
        {
            var lines = new List<string>
            {
                $"<b>{DisplayName}</b>",
                Description,
                "",
                $"Cost: {GetCostDisplay()}",
                $"Range: {GetRangeDisplay()}"
            };

            if (HasCooldown)
            {
                lines.Add($"Cooldown: {GetCooldownDisplay()}");
            }

            if (IsAreaOfEffect)
            {
                lines.Add($"Area: {AreaRadius} radius");
            }

            return string.Join("\n", lines);
        }

        #endregion

        #region Validation

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(Id))
            {
                Id = name.ToLowerInvariant().Replace(" ", "_");
            }

            // Ensure at least one effect
            if (Effects.Count == 0)
            {
                Effects.Add(new SkillEffect
                {
                    Type = SkillEffectType.Damage,
                    Value = 10,
                    Chance = 100,
                    LevelScaling = 0.1f
                });
            }

            // Self-targeting skills don't need range
            if (TargetType == SkillTargetType.Self)
            {
                Range = 0;
            }
        }
#endif

        #endregion
    }

    /// <summary>
    /// Database container for all skill definitions.
    /// </summary>
    [CreateAssetMenu(fileName = "SkillDatabase", menuName = "Iron Frontier/Data/Skill Database", order = 4)]
    public class SkillDatabase : ScriptableObject
    {
        [Tooltip("All available skill definitions.")]
        public List<SkillData> Skills = new List<SkillData>();

        private Dictionary<string, SkillData> _skillLookup;

        /// <summary>
        /// Initialize the lookup dictionary.
        /// </summary>
        public void Initialize()
        {
            _skillLookup = new Dictionary<string, SkillData>();
            foreach (var skill in Skills)
            {
                if (skill != null && !string.IsNullOrEmpty(skill.Id))
                {
                    _skillLookup[skill.Id] = skill;
                }
            }
        }

        /// <summary>
        /// Get a skill by ID.
        /// </summary>
        /// <param name="skillId">The skill's unique identifier.</param>
        /// <returns>The skill data, or null if not found.</returns>
        public SkillData GetSkill(string skillId)
        {
            if (_skillLookup == null)
            {
                Initialize();
            }

            return _skillLookup.TryGetValue(skillId, out var skill) ? skill : null;
        }

        /// <summary>
        /// Get all skills with a specific tag.
        /// </summary>
        /// <param name="tag">Tag to filter by.</param>
        /// <returns>List of matching skills.</returns>
        public List<SkillData> GetSkillsByTag(string tag)
        {
            var result = new List<SkillData>();
            foreach (var skill in Skills)
            {
                if (skill != null && skill.HasTag(tag))
                {
                    result.Add(skill);
                }
            }
            return result;
        }

        /// <summary>
        /// Get all skills of a specific target type.
        /// </summary>
        /// <param name="targetType">Target type to filter by.</param>
        /// <returns>List of matching skills.</returns>
        public List<SkillData> GetSkillsByTargetType(SkillTargetType targetType)
        {
            var result = new List<SkillData>();
            foreach (var skill in Skills)
            {
                if (skill != null && skill.TargetType == targetType)
                {
                    result.Add(skill);
                }
            }
            return result;
        }

        /// <summary>
        /// Get all skills available at a specific level.
        /// </summary>
        /// <param name="level">Character level.</param>
        /// <returns>List of skills unlockable at this level.</returns>
        public List<SkillData> GetSkillsForLevel(int level)
        {
            var result = new List<SkillData>();
            foreach (var skill in Skills)
            {
                if (skill != null && skill.LevelRequired <= level)
                {
                    result.Add(skill);
                }
            }
            return result;
        }
    }
}
