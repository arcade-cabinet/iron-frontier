using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Events;
using IronFrontier.Data;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Result of a skill execution with detailed breakdown.
    /// </summary>
    [Serializable]
    public class SkillResult
    {
        /// <summary>The skill that was used.</summary>
        public SkillData Skill;

        /// <summary>The caster who used the skill.</summary>
        public Combatant Caster;

        /// <summary>All targets affected by the skill.</summary>
        public List<Combatant> Targets = new List<Combatant>();

        /// <summary>Whether the skill executed successfully.</summary>
        public bool Success;

        /// <summary>Total damage dealt (summed across all targets).</summary>
        public int TotalDamage;

        /// <summary>Total healing done (summed across all targets).</summary>
        public int TotalHealing;

        /// <summary>Status effects applied.</summary>
        public List<StatusEffect> StatusEffectsApplied = new List<StatusEffect>();

        /// <summary>Number of targets killed.</summary>
        public int TargetsKilled;

        /// <summary>Detailed message for combat log.</summary>
        public string Message;

        /// <summary>Timestamp of execution.</summary>
        public long Timestamp;

        /// <summary>Per-target damage breakdown.</summary>
        public Dictionary<string, int> DamagePerTarget = new Dictionary<string, int>();

        /// <summary>Per-target healing breakdown.</summary>
        public Dictionary<string, int> HealingPerTarget = new Dictionary<string, int>();
    }

    /// <summary>
    /// Skill execution validation result.
    /// </summary>
    public struct SkillValidationResult
    {
        public bool IsValid;
        public string Reason;

        public static SkillValidationResult Valid => new SkillValidationResult { IsValid = true };
        public static SkillValidationResult Invalid(string reason) =>
            new SkillValidationResult { IsValid = false, Reason = reason };
    }

    /// <summary>
    /// Manages combat skills/abilities including execution, cooldowns, and unlocks.
    /// Integrates with CombatManager to handle skill-based combat actions.
    /// </summary>
    public class SkillManager : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when a skill is successfully used.</summary>
        public UnityEvent<SkillResult> OnSkillUsed;

        /// <summary>Fired when a skill is unlocked for a character.</summary>
        public UnityEvent<string, SkillData> OnSkillUnlocked;

        /// <summary>Fired when a skill goes on cooldown.</summary>
        public UnityEvent<string, SkillData, int> OnCooldownStarted;

        /// <summary>Fired when a skill comes off cooldown.</summary>
        public UnityEvent<string, SkillData> OnCooldownEnded;

        /// <summary>Fired when skill execution fails.</summary>
        public UnityEvent<SkillData, string> OnSkillFailed;

        #endregion

        #region Serialized Fields

        [Header("Skill Database")]
        [Tooltip("Reference to the skill database.")]
        [SerializeField] private SkillDatabase _skillDatabase;

        [Header("Settings")]
        [Tooltip("Execute threshold for bonus damage (HP percentage).")]
        [Range(0f, 0.5f)]
        [SerializeField] private float _executeThreshold = 0.25f;

        [Tooltip("Execute bonus damage multiplier.")]
        [Range(1f, 3f)]
        [SerializeField] private float _executeBonusMultiplier = 2f;

        [Tooltip("Mark bonus damage multiplier.")]
        [Range(1f, 2f)]
        [SerializeField] private float _markBonusMultiplier = 1.5f;

        #endregion

        #region Private State

        /// <summary>Unlocked skills per combatant ID.</summary>
        private Dictionary<string, HashSet<string>> _unlockedSkills = new Dictionary<string, HashSet<string>>();

        /// <summary>Cooldowns per combatant ID, skill ID -> turns remaining.</summary>
        private Dictionary<string, Dictionary<string, int>> _cooldowns = new Dictionary<string, Dictionary<string, int>>();

        /// <summary>Active shields per combatant ID -> remaining shield HP.</summary>
        private Dictionary<string, int> _activeShields = new Dictionary<string, int>();

        /// <summary>Marked targets (combatant ID -> marking source ID).</summary>
        private Dictionary<string, string> _markedTargets = new Dictionary<string, string>();

        /// <summary>Stealthed combatants.</summary>
        private HashSet<string> _stealthedCombatants = new HashSet<string>();

        /// <summary>Taunting combatants per enemy (enemy ID -> taunter ID).</summary>
        private Dictionary<string, string> _tauntTargets = new Dictionary<string, string>();

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            OnSkillUsed ??= new UnityEvent<SkillResult>();
            OnSkillUnlocked ??= new UnityEvent<string, SkillData>();
            OnCooldownStarted ??= new UnityEvent<string, SkillData, int>();
            OnCooldownEnded ??= new UnityEvent<string, SkillData>();
            OnSkillFailed ??= new UnityEvent<SkillData, string>();

            _skillDatabase?.Initialize();
        }

        #endregion

        #region Skill Database Access

        /// <summary>
        /// Get a skill by ID from the database.
        /// </summary>
        public SkillData GetSkill(string skillId)
        {
            return _skillDatabase?.GetSkill(skillId);
        }

        /// <summary>
        /// Get all skills available in the database.
        /// </summary>
        public List<SkillData> GetAllSkills()
        {
            return _skillDatabase?.Skills ?? new List<SkillData>();
        }

        #endregion

        #region Skill Unlocking

        /// <summary>
        /// Check if a skill is unlocked for a combatant.
        /// </summary>
        public bool IsSkillUnlocked(string combatantId, string skillId)
        {
            if (!_unlockedSkills.TryGetValue(combatantId, out var skills))
                return false;

            return skills.Contains(skillId);
        }

        /// <summary>
        /// Unlock a skill for a combatant.
        /// </summary>
        public void UnlockSkill(string combatantId, string skillId)
        {
            if (!_unlockedSkills.ContainsKey(combatantId))
            {
                _unlockedSkills[combatantId] = new HashSet<string>();
            }

            if (_unlockedSkills[combatantId].Add(skillId))
            {
                var skill = GetSkill(skillId);
                if (skill != null)
                {
                    OnSkillUnlocked?.Invoke(combatantId, skill);
                    Debug.Log($"[SkillManager] Unlocked skill {skillId} for {combatantId}");
                }
            }
        }

        /// <summary>
        /// Unlock all default skills for a combatant.
        /// </summary>
        public void UnlockDefaultSkills(string combatantId, int level = 1)
        {
            foreach (var skill in GetAllSkills())
            {
                if (skill.UnlockedByDefault && skill.LevelRequired <= level)
                {
                    UnlockSkill(combatantId, skill.Id);
                }
            }
        }

        /// <summary>
        /// Get all unlocked skills for a combatant.
        /// </summary>
        public List<SkillData> GetUnlockedSkills(string combatantId)
        {
            if (!_unlockedSkills.TryGetValue(combatantId, out var skillIds))
                return new List<SkillData>();

            var skills = new List<SkillData>();
            foreach (var id in skillIds)
            {
                var skill = GetSkill(id);
                if (skill != null)
                {
                    skills.Add(skill);
                }
            }
            return skills;
        }

        /// <summary>
        /// Get usable skills for a combatant (unlocked and not on cooldown).
        /// </summary>
        public List<SkillData> GetUsableSkills(string combatantId)
        {
            return GetUnlockedSkills(combatantId)
                .Where(s => !IsOnCooldown(combatantId, s.Id))
                .ToList();
        }

        #endregion

        #region Cooldown Management

        /// <summary>
        /// Check if a skill is on cooldown.
        /// </summary>
        public bool IsOnCooldown(string combatantId, string skillId)
        {
            if (!_cooldowns.TryGetValue(combatantId, out var cooldowns))
                return false;

            return cooldowns.TryGetValue(skillId, out var remaining) && remaining > 0;
        }

        /// <summary>
        /// Get remaining cooldown turns for a skill.
        /// </summary>
        public int GetCooldownRemaining(string combatantId, string skillId)
        {
            if (!_cooldowns.TryGetValue(combatantId, out var cooldowns))
                return 0;

            return cooldowns.TryGetValue(skillId, out var remaining) ? remaining : 0;
        }

        /// <summary>
        /// Start cooldown for a skill.
        /// </summary>
        private void StartCooldown(string combatantId, SkillData skill)
        {
            if (!skill.HasCooldown)
                return;

            if (!_cooldowns.ContainsKey(combatantId))
            {
                _cooldowns[combatantId] = new Dictionary<string, int>();
            }

            _cooldowns[combatantId][skill.Id] = skill.Cooldown;
            OnCooldownStarted?.Invoke(combatantId, skill, skill.Cooldown);

            Debug.Log($"[SkillManager] {skill.DisplayName} on cooldown for {skill.Cooldown} turns");
        }

        /// <summary>
        /// Decrement all cooldowns for a combatant (call at end of their turn).
        /// </summary>
        public void DecrementCooldowns(string combatantId)
        {
            if (!_cooldowns.TryGetValue(combatantId, out var cooldowns))
                return;

            var expiredCooldowns = new List<string>();

            foreach (var kvp in cooldowns.ToList())
            {
                int newValue = kvp.Value - 1;
                if (newValue <= 0)
                {
                    expiredCooldowns.Add(kvp.Key);
                    cooldowns.Remove(kvp.Key);
                }
                else
                {
                    cooldowns[kvp.Key] = newValue;
                }
            }

            // Fire events for expired cooldowns
            foreach (var skillId in expiredCooldowns)
            {
                var skill = GetSkill(skillId);
                if (skill != null)
                {
                    OnCooldownEnded?.Invoke(combatantId, skill);
                }
            }
        }

        /// <summary>
        /// Reset all cooldowns for a combatant.
        /// </summary>
        public void ResetCooldowns(string combatantId)
        {
            if (_cooldowns.ContainsKey(combatantId))
            {
                _cooldowns[combatantId].Clear();
            }
        }

        #endregion

        #region Skill Execution

        /// <summary>
        /// Validate if a skill can be used.
        /// </summary>
        public SkillValidationResult ValidateSkillUse(
            CombatAction action,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            if (string.IsNullOrEmpty(action.SkillId))
                return SkillValidationResult.Invalid("No skill specified");

            var skill = GetSkill(action.SkillId);
            if (skill == null)
                return SkillValidationResult.Invalid("Skill not found");

            if (!IsSkillUnlocked(caster.Id, skill.Id))
                return SkillValidationResult.Invalid("Skill not unlocked");

            if (IsOnCooldown(caster.Id, skill.Id))
            {
                int remaining = GetCooldownRemaining(caster.Id, skill.Id);
                return SkillValidationResult.Invalid($"Skill on cooldown ({remaining} turns)");
            }

            if (caster.HasStatusEffect(StatusEffectType.Silenced))
                return SkillValidationResult.Invalid("Cannot use skills while silenced");

            // Validate target
            if (skill.RequiresTarget && string.IsNullOrEmpty(action.TargetId))
                return SkillValidationResult.Invalid("Skill requires a target");

            if (!string.IsNullOrEmpty(action.TargetId))
            {
                var target = allCombatants.FirstOrDefault(c => c.Id == action.TargetId);
                var validation = SkillTargeting.ValidateTarget(skill, caster, target);
                if (!validation.IsValid)
                    return SkillValidationResult.Invalid(validation.Reason);
            }

            return SkillValidationResult.Valid;
        }

        /// <summary>
        /// Process a skill action.
        /// </summary>
        /// <param name="action">The combat action with skill info.</param>
        /// <param name="caster">The combatant using the skill.</param>
        /// <param name="allCombatants">All combatants for targeting.</param>
        /// <returns>The result of skill execution.</returns>
        public SkillResult ProcessSkill(
            CombatAction action,
            Combatant caster,
            IEnumerable<Combatant> allCombatants)
        {
            var result = new SkillResult
            {
                Caster = caster,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            // Validate skill use
            var validation = ValidateSkillUse(action, caster, allCombatants);
            if (!validation.IsValid)
            {
                result.Success = false;
                result.Message = validation.Reason;
                OnSkillFailed?.Invoke(result.Skill, validation.Reason);
                return result;
            }

            var skill = GetSkill(action.SkillId);
            result.Skill = skill;

            // Determine targets
            List<Combatant> targets;
            if (skill.TargetType == SkillTargetType.Self)
            {
                targets = new List<Combatant> { caster };
            }
            else if (skill.TargetType == SkillTargetType.AllAllies)
            {
                targets = SkillTargeting.GetValidTargets(skill, caster, allCombatants);
            }
            else if (skill.TargetType == SkillTargetType.AllEnemies)
            {
                targets = SkillTargeting.GetValidTargets(skill, caster, allCombatants);
            }
            else if (!string.IsNullOrEmpty(action.TargetId))
            {
                var primaryTarget = allCombatants.FirstOrDefault(c => c.Id == action.TargetId);
                if (primaryTarget != null)
                {
                    if (skill.IsAreaOfEffect)
                    {
                        targets = SkillTargeting.GetAreaTargets(skill, primaryTarget.Position, allCombatants, caster);
                    }
                    else
                    {
                        targets = new List<Combatant> { primaryTarget };
                    }
                }
                else
                {
                    targets = new List<Combatant>();
                }
            }
            else
            {
                targets = new List<Combatant>();
            }

            result.Targets = targets;

            if (targets.Count == 0 && skill.RequiresTarget)
            {
                result.Success = false;
                result.Message = "No valid targets";
                OnSkillFailed?.Invoke(skill, result.Message);
                return result;
            }

            // Get caster level for scaling
            int casterLevel = 1; // Default, could be pulled from combatant data

            // Apply effects to each target
            foreach (var target in targets)
            {
                ApplySkillEffects(skill, caster, target, casterLevel, result);
            }

            // Start cooldown
            StartCooldown(caster.Id, skill);

            // Build result message
            result.Success = true;
            result.Message = BuildSkillMessage(skill, caster, result);

            OnSkillUsed?.Invoke(result);
            Debug.Log($"[SkillManager] {result.Message}");

            return result;
        }

        /// <summary>
        /// Apply all skill effects to a single target.
        /// </summary>
        private void ApplySkillEffects(
            SkillData skill,
            Combatant caster,
            Combatant target,
            int casterLevel,
            SkillResult result)
        {
            foreach (var effect in skill.Effects)
            {
                // Check if effect applies (chance roll)
                if (!effect.RollChance())
                    continue;

                int scaledValue = effect.GetScaledValue(casterLevel);

                switch (effect.Type)
                {
                    case SkillEffectType.Damage:
                        ApplyDamageEffect(effect, caster, target, scaledValue, result);
                        break;

                    case SkillEffectType.Heal:
                        ApplyHealEffect(target, scaledValue, result);
                        break;

                    case SkillEffectType.Buff:
                        ApplyBuffEffect(effect, target, result);
                        break;

                    case SkillEffectType.Debuff:
                        ApplyDebuffEffect(effect, target, result);
                        break;

                    case SkillEffectType.Stun:
                        ApplyStunEffect(effect, target, result);
                        break;

                    case SkillEffectType.Knockback:
                        ApplyKnockbackEffect(caster, target, scaledValue, result);
                        break;

                    case SkillEffectType.Pull:
                        ApplyPullEffect(caster, target, scaledValue, result);
                        break;

                    case SkillEffectType.Shield:
                        ApplyShieldEffect(target, scaledValue, result);
                        break;

                    case SkillEffectType.Taunt:
                        ApplyTauntEffect(caster, target, effect.Duration, result);
                        break;

                    case SkillEffectType.Stealth:
                        ApplyStealthEffect(caster, effect.Duration, result);
                        break;

                    case SkillEffectType.Mark:
                        ApplyMarkEffect(caster, target, effect.Duration, result);
                        break;

                    case SkillEffectType.Execute:
                        ApplyExecuteEffect(effect, caster, target, scaledValue, result);
                        break;

                    case SkillEffectType.NonLethal:
                        ApplyNonLethalEffect(effect, caster, target, scaledValue, result);
                        break;

                    case SkillEffectType.Summon:
                        // Summon would require spawning a new combatant
                        Debug.Log($"[SkillManager] Summon effect not yet implemented");
                        break;
                }
            }
        }

        #endregion

        #region Effect Application

        private void ApplyDamageEffect(SkillEffect effect, Combatant caster, Combatant target, int damage, SkillResult result)
        {
            // Check for mark bonus
            if (_markedTargets.ContainsKey(target.Id))
            {
                damage = Mathf.FloorToInt(damage * _markBonusMultiplier);
            }

            // Apply shield absorption
            damage = AbsorbDamageWithShield(target.Id, damage);

            int actualDamage = target.TakeDamage(damage);

            result.TotalDamage += actualDamage;
            if (!result.DamagePerTarget.ContainsKey(target.Id))
                result.DamagePerTarget[target.Id] = 0;
            result.DamagePerTarget[target.Id] += actualDamage;

            if (!target.IsAlive)
            {
                result.TargetsKilled++;
                // Remove any marks/taunts on killed target
                _markedTargets.Remove(target.Id);
                _tauntTargets.Remove(target.Id);
            }
        }

        private void ApplyHealEffect(Combatant target, int healAmount, SkillResult result)
        {
            int actualHeal = DamageCalculator.CalculateHeal(target.Stats.HP, target.Stats.MaxHP, healAmount);
            target.Heal(actualHeal);

            result.TotalHealing += actualHeal;
            if (!result.HealingPerTarget.ContainsKey(target.Id))
                result.HealingPerTarget[target.Id] = 0;
            result.HealingPerTarget[target.Id] += actualHeal;
        }

        private void ApplyBuffEffect(SkillEffect effect, Combatant target, SkillResult result)
        {
            var statusEffect = new StatusEffect
            {
                Type = StatusEffectType.Buffed,
                TurnsRemaining = effect.Duration > 0 ? effect.Duration : 3,
                Value = effect.Value,
                SourceId = effect.StatusId ?? "skill_buff"
            };

            target.ApplyStatusEffect(statusEffect);
            result.StatusEffectsApplied.Add(statusEffect);
        }

        private void ApplyDebuffEffect(SkillEffect effect, Combatant target, SkillResult result)
        {
            var statusEffect = new StatusEffect
            {
                Type = StatusEffectType.Debuffed,
                TurnsRemaining = effect.Duration > 0 ? effect.Duration : 3,
                Value = effect.Value,
                SourceId = effect.StatusId ?? "skill_debuff"
            };

            target.ApplyStatusEffect(statusEffect);
            result.StatusEffectsApplied.Add(statusEffect);
        }

        private void ApplyStunEffect(SkillEffect effect, Combatant target, SkillResult result)
        {
            var statusEffect = new StatusEffect
            {
                Type = StatusEffectType.Stunned,
                TurnsRemaining = effect.Duration > 0 ? effect.Duration : 1,
                Value = 0,
                SourceId = "skill_stun"
            };

            target.ApplyStatusEffect(statusEffect);
            result.StatusEffectsApplied.Add(statusEffect);
        }

        private void ApplyKnockbackEffect(Combatant caster, Combatant target, int distance, SkillResult result)
        {
            // Calculate direction from caster to target
            Vector2Int direction = target.Position - caster.Position;
            if (direction != Vector2Int.zero)
            {
                direction.x = direction.x != 0 ? (direction.x > 0 ? 1 : -1) : 0;
                direction.y = direction.y != 0 ? (direction.y > 0 ? 1 : -1) : 0;
            }

            // Move target away
            target.Position += direction * distance;
        }

        private void ApplyPullEffect(Combatant caster, Combatant target, int distance, SkillResult result)
        {
            // Calculate direction from target to caster
            Vector2Int direction = caster.Position - target.Position;
            if (direction != Vector2Int.zero)
            {
                direction.x = direction.x != 0 ? (direction.x > 0 ? 1 : -1) : 0;
                direction.y = direction.y != 0 ? (direction.y > 0 ? 1 : -1) : 0;
            }

            // Move target towards caster (but not on top of caster)
            for (int i = 0; i < distance; i++)
            {
                Vector2Int newPos = target.Position + direction;
                if (newPos != caster.Position)
                {
                    target.Position = newPos;
                }
                else
                {
                    break;
                }
            }
        }

        private void ApplyShieldEffect(Combatant target, int shieldAmount, SkillResult result)
        {
            if (!_activeShields.ContainsKey(target.Id))
                _activeShields[target.Id] = 0;

            _activeShields[target.Id] += shieldAmount;
        }

        private void ApplyTauntEffect(Combatant caster, Combatant target, int duration, SkillResult result)
        {
            // Only enemies can be taunted
            if (target.Type == CombatantType.Enemy)
            {
                _tauntTargets[target.Id] = caster.Id;

                // Apply a status effect to track duration
                var statusEffect = new StatusEffect
                {
                    Type = StatusEffectType.Debuffed, // Using debuff as a proxy for taunt display
                    TurnsRemaining = duration > 0 ? duration : 2,
                    Value = 0,
                    SourceId = "skill_taunt"
                };

                target.ApplyStatusEffect(statusEffect);
                result.StatusEffectsApplied.Add(statusEffect);
            }
        }

        private void ApplyStealthEffect(Combatant caster, int duration, SkillResult result)
        {
            _stealthedCombatants.Add(caster.Id);

            var statusEffect = new StatusEffect
            {
                Type = StatusEffectType.Hasted, // Using hasted as a proxy for stealth display
                TurnsRemaining = duration > 0 ? duration : 3,
                Value = 100, // 100% evasion bonus
                SourceId = "skill_stealth"
            };

            caster.ApplyStatusEffect(statusEffect);
            result.StatusEffectsApplied.Add(statusEffect);
        }

        private void ApplyMarkEffect(Combatant caster, Combatant target, int duration, SkillResult result)
        {
            _markedTargets[target.Id] = caster.Id;

            var statusEffect = new StatusEffect
            {
                Type = StatusEffectType.Debuffed,
                TurnsRemaining = duration > 0 ? duration : 3,
                Value = 0,
                SourceId = "skill_mark"
            };

            target.ApplyStatusEffect(statusEffect);
            result.StatusEffectsApplied.Add(statusEffect);
        }

        private void ApplyExecuteEffect(SkillEffect effect, Combatant caster, Combatant target, int baseDamage, SkillResult result)
        {
            int damage = baseDamage;

            // Execute bonus on low HP targets
            if (target.HPPercentage <= _executeThreshold)
            {
                damage = Mathf.FloorToInt(damage * _executeBonusMultiplier);
            }

            // Check for mark bonus
            if (_markedTargets.ContainsKey(target.Id))
            {
                damage = Mathf.FloorToInt(damage * _markBonusMultiplier);
            }

            // Apply shield absorption
            damage = AbsorbDamageWithShield(target.Id, damage);

            int actualDamage = target.TakeDamage(damage);

            result.TotalDamage += actualDamage;
            if (!result.DamagePerTarget.ContainsKey(target.Id))
                result.DamagePerTarget[target.Id] = 0;
            result.DamagePerTarget[target.Id] += actualDamage;

            if (!target.IsAlive)
            {
                result.TargetsKilled++;
                _markedTargets.Remove(target.Id);
                _tauntTargets.Remove(target.Id);
            }
        }

        private void ApplyNonLethalEffect(SkillEffect effect, Combatant caster, Combatant target, int damage, SkillResult result)
        {
            // Non-lethal damage reduces HP to minimum 1
            int maxDamage = target.Stats.HP - 1;
            int actualDamage = Mathf.Min(damage, maxDamage);

            if (actualDamage > 0)
            {
                target.TakeDamage(actualDamage);

                result.TotalDamage += actualDamage;
                if (!result.DamagePerTarget.ContainsKey(target.Id))
                    result.DamagePerTarget[target.Id] = 0;
                result.DamagePerTarget[target.Id] += actualDamage;
            }

            // Apply stun to incapacitate
            if (target.Stats.HP <= 1)
            {
                var statusEffect = new StatusEffect
                {
                    Type = StatusEffectType.Stunned,
                    TurnsRemaining = 99, // Effectively permanent
                    Value = 0,
                    SourceId = "skill_non_lethal"
                };

                target.ApplyStatusEffect(statusEffect);
                result.StatusEffectsApplied.Add(statusEffect);
            }
        }

        private int AbsorbDamageWithShield(string targetId, int damage)
        {
            if (!_activeShields.TryGetValue(targetId, out var shieldHP) || shieldHP <= 0)
                return damage;

            if (shieldHP >= damage)
            {
                _activeShields[targetId] = shieldHP - damage;
                return 0;
            }
            else
            {
                int remaining = damage - shieldHP;
                _activeShields[targetId] = 0;
                return remaining;
            }
        }

        #endregion

        #region State Queries

        /// <summary>
        /// Check if a combatant is stealthed.
        /// </summary>
        public bool IsStealthed(string combatantId)
        {
            return _stealthedCombatants.Contains(combatantId);
        }

        /// <summary>
        /// Check if a combatant is marked.
        /// </summary>
        public bool IsMarked(string combatantId)
        {
            return _markedTargets.ContainsKey(combatantId);
        }

        /// <summary>
        /// Get the taunter for a combatant (if any).
        /// </summary>
        public string GetTaunter(string combatantId)
        {
            return _tauntTargets.TryGetValue(combatantId, out var taunter) ? taunter : null;
        }

        /// <summary>
        /// Get remaining shield HP for a combatant.
        /// </summary>
        public int GetShieldHP(string combatantId)
        {
            return _activeShields.TryGetValue(combatantId, out var hp) ? hp : 0;
        }

        /// <summary>
        /// Remove stealth from a combatant (e.g., when they attack).
        /// </summary>
        public void BreakStealth(string combatantId)
        {
            if (_stealthedCombatants.Remove(combatantId))
            {
                Debug.Log($"[SkillManager] {combatantId} stealth broken");
            }
        }

        /// <summary>
        /// Clear mark from a combatant.
        /// </summary>
        public void ClearMark(string combatantId)
        {
            _markedTargets.Remove(combatantId);
        }

        /// <summary>
        /// Clear taunt from a combatant.
        /// </summary>
        public void ClearTaunt(string combatantId)
        {
            _tauntTargets.Remove(combatantId);
        }

        #endregion

        #region Combat State Management

        /// <summary>
        /// Reset all combat-related state (call when combat ends).
        /// </summary>
        public void ResetCombatState()
        {
            _cooldowns.Clear();
            _activeShields.Clear();
            _markedTargets.Clear();
            _stealthedCombatants.Clear();
            _tauntTargets.Clear();
        }

        /// <summary>
        /// Process end-of-turn updates for a combatant.
        /// </summary>
        public void ProcessTurnEnd(string combatantId)
        {
            DecrementCooldowns(combatantId);

            // Check for expired marks, taunts, stealth based on status effects
            // (These are tracked via status effects on the combatants themselves)
        }

        #endregion

        #region Helpers

        private string BuildSkillMessage(SkillData skill, Combatant caster, SkillResult result)
        {
            var parts = new List<string> { $"{caster.DisplayName} uses {skill.DisplayName}" };

            if (result.Targets.Count > 0)
            {
                if (result.Targets.Count == 1)
                {
                    parts.Add($"on {result.Targets[0].DisplayName}");
                }
                else
                {
                    parts.Add($"on {result.Targets.Count} targets");
                }
            }

            if (result.TotalDamage > 0)
            {
                parts.Add($"for {result.TotalDamage} damage");
            }

            if (result.TotalHealing > 0)
            {
                parts.Add($"healing {result.TotalHealing} HP");
            }

            if (result.StatusEffectsApplied.Count > 0)
            {
                var effectNames = result.StatusEffectsApplied.Select(e => e.GetDisplayName()).Distinct();
                parts.Add($"applying {string.Join(", ", effectNames)}");
            }

            if (result.TargetsKilled > 0)
            {
                parts.Add($"({result.TargetsKilled} defeated)");
            }

            return string.Join(" ", parts) + "!";
        }

        #endregion
    }
}
