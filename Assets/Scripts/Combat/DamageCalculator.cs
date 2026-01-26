using System;
using UnityEngine;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Input parameters for damage calculation.
    /// </summary>
    [Serializable]
    public class DamageCalculationInput
    {
        /// <summary>Base attack power of the attacker.</summary>
        public int AttackPower;

        /// <summary>Defense of the defender.</summary>
        public int DefenderDefense;

        /// <summary>Is the defender in defensive stance?</summary>
        public bool IsDefenderDefending;

        /// <summary>Variance factor (typically 0.1 for +/-10%).</summary>
        public float VarianceFactor = 0.1f;

        /// <summary>Is this a critical hit?</summary>
        public bool IsCritical;

        /// <summary>Critical multiplier (default 1.5).</summary>
        public float CritMultiplier = 1.5f;

        /// <summary>Fatigue penalty (0-100, where 100 is fully fatigued).</summary>
        public float FatiguePenalty;

        /// <summary>Elemental/type effectiveness multiplier.</summary>
        public float TypeEffectiveness = 1f;
    }

    /// <summary>
    /// Result of damage calculation with breakdown.
    /// </summary>
    [Serializable]
    public class DamageCalculationResult
    {
        /// <summary>Final damage to apply.</summary>
        public int FinalDamage;

        /// <summary>Base damage before modifiers.</summary>
        public int BaseDamage;

        /// <summary>Damage reduced by defense.</summary>
        public int DamageReduction;

        /// <summary>Variance applied.</summary>
        public int VarianceApplied;

        /// <summary>Critical multiplier that was applied.</summary>
        public float CritMultiplierApplied;

        /// <summary>Fatigue penalty that was applied.</summary>
        public float FatiguePenaltyApplied;
    }

    /// <summary>
    /// Pure static functions for calculating combat damage.
    /// All functions are deterministic given the same inputs for testability.
    /// </summary>
    public static class DamageCalculator
    {
        #region Constants

        /// <summary>Default damage variance (+/- 10%).</summary>
        public const float DefaultVariance = 0.1f;

        /// <summary>Default critical hit multiplier.</summary>
        public const float DefaultCritMultiplier = 1.5f;

        /// <summary>Minimum damage that can be dealt.</summary>
        public const int MinimumDamage = 1;

        /// <summary>Defense stance damage reduction (50%).</summary>
        public const float DefendDamageReduction = 0.5f;

        /// <summary>Maximum fatigue penalty (at 100% fatigue).</summary>
        public const float MaxFatiguePenalty = 0.3f;

        /// <summary>Minimum hit chance (5%).</summary>
        public const float MinHitChance = 5f;

        /// <summary>Maximum hit chance (95%).</summary>
        public const float MaxHitChance = 95f;

        #endregion

        #region Base Damage Calculation

        /// <summary>
        /// Calculate base damage before any modifiers.
        /// Formula: attackPower - (defenderDefense * 0.5)
        /// Ensures minimum damage of 1.
        /// </summary>
        public static int CalculateBaseDamage(int attackPower, int defenderDefense)
        {
            float rawDamage = attackPower - defenderDefense * 0.5f;
            return Mathf.Max(MinimumDamage, Mathf.FloorToInt(rawDamage));
        }

        /// <summary>
        /// Apply variance to damage.
        /// </summary>
        /// <param name="baseDamage">The base damage to apply variance to.</param>
        /// <param name="varianceFactor">The variance factor (0.1 = +/-10%).</param>
        /// <param name="randomValue">A value between 0 and 1 (for deterministic testing).</param>
        /// <returns>The damage with variance applied.</returns>
        public static int ApplyVariance(int baseDamage, float varianceFactor, float? randomValue = null)
        {
            float roll = randomValue ?? UnityEngine.Random.value;
            // Convert 0-1 random to -1 to 1 range
            float varianceMultiplier = 1f + (roll * 2f - 1f) * varianceFactor;
            return Mathf.Max(MinimumDamage, Mathf.FloorToInt(baseDamage * varianceMultiplier));
        }

        /// <summary>
        /// Apply critical hit multiplier.
        /// </summary>
        public static int ApplyCriticalMultiplier(int damage, bool isCritical, float critMultiplier = DefaultCritMultiplier)
        {
            if (!isCritical)
                return damage;

            return Mathf.FloorToInt(damage * critMultiplier);
        }

        /// <summary>
        /// Apply defensive stance reduction.
        /// </summary>
        public static int ApplyDefenseReduction(int damage, bool isDefending)
        {
            if (!isDefending)
                return damage;

            return Mathf.Max(MinimumDamage, Mathf.FloorToInt(damage * (1f - DefendDamageReduction)));
        }

        /// <summary>
        /// Apply fatigue penalty to damage output.
        /// </summary>
        /// <param name="damage">The damage to reduce.</param>
        /// <param name="fatigue">Fatigue level 0-100.</param>
        /// <returns>Damage reduced by fatigue penalty.</returns>
        public static int ApplyFatiguePenalty(int damage, float fatigue)
        {
            // Normalize fatigue to 0-1 range
            float normalizedFatigue = Mathf.Clamp01(fatigue / 100f);
            // Calculate penalty (up to 30% reduction at max fatigue)
            float penalty = normalizedFatigue * MaxFatiguePenalty;
            return Mathf.Max(MinimumDamage, Mathf.FloorToInt(damage * (1f - penalty)));
        }

        /// <summary>
        /// Apply type effectiveness multiplier.
        /// </summary>
        public static int ApplyTypeEffectiveness(int damage, float effectiveness)
        {
            return Mathf.Max(MinimumDamage, Mathf.FloorToInt(damage * effectiveness));
        }

        #endregion

        #region Complete Damage Calculation

        /// <summary>
        /// Calculate final damage using the complete damage formula.
        /// </summary>
        /// <param name="input">All inputs for damage calculation.</param>
        /// <param name="randomValue">A value between 0 and 1 for variance (optional).</param>
        /// <returns>Complete damage calculation result with breakdown.</returns>
        public static DamageCalculationResult CalculateDamage(
            DamageCalculationInput input,
            float? randomValue = null)
        {
            // Step 1: Calculate base damage
            int baseDamage = CalculateBaseDamage(input.AttackPower, input.DefenderDefense);

            // Step 2: Apply variance
            int damageAfterVariance = ApplyVariance(baseDamage, input.VarianceFactor, randomValue);

            // Step 3: Apply critical multiplier
            int damageAfterCrit = ApplyCriticalMultiplier(
                damageAfterVariance,
                input.IsCritical,
                input.CritMultiplier > 0 ? input.CritMultiplier : DefaultCritMultiplier
            );

            // Step 4: Apply fatigue penalty
            int damageAfterFatigue = ApplyFatiguePenalty(damageAfterCrit, input.FatiguePenalty);

            // Step 5: Apply type effectiveness
            int damageAfterType = ApplyTypeEffectiveness(damageAfterFatigue, input.TypeEffectiveness);

            // Step 6: Apply defensive stance
            int finalDamage = ApplyDefenseReduction(damageAfterType, input.IsDefenderDefending);

            return new DamageCalculationResult
            {
                FinalDamage = finalDamage,
                BaseDamage = baseDamage,
                DamageReduction = input.DefenderDefense,
                VarianceApplied = damageAfterVariance - baseDamage,
                CritMultiplierApplied = input.IsCritical ? input.CritMultiplier : 1f,
                FatiguePenaltyApplied = input.FatiguePenalty
            };
        }

        #endregion

        #region Hit/Miss Calculation

        /// <summary>
        /// Calculate hit chance between attacker and defender.
        /// Formula: attacker.accuracy - defender.evasion + modifiers
        /// Clamped between 5% and 95%.
        /// </summary>
        /// <param name="attackerAccuracy">Attacker's accuracy stat (0-100).</param>
        /// <param name="defenderEvasion">Defender's evasion stat (0-100).</param>
        /// <param name="modifiers">Additional hit chance modifiers.</param>
        /// <returns>Hit chance as a percentage (5-95).</returns>
        public static float CalculateHitChance(
            int attackerAccuracy,
            int defenderEvasion,
            float modifiers = 0f)
        {
            float rawChance = attackerAccuracy - defenderEvasion + modifiers;
            return Mathf.Clamp(rawChance, MinHitChance, MaxHitChance);
        }

        /// <summary>
        /// Determine if an attack hits.
        /// </summary>
        /// <param name="hitChance">The hit chance (0-100).</param>
        /// <param name="randomValue">A value between 0 and 1 (optional).</param>
        /// <returns>True if the attack hits.</returns>
        public static bool RollHit(float hitChance, float? randomValue = null)
        {
            float roll = randomValue ?? UnityEngine.Random.value;
            return roll * 100f < hitChance;
        }

        #endregion

        #region Critical Hit Calculation

        /// <summary>
        /// Determine if an attack is a critical hit.
        /// </summary>
        /// <param name="critChance">The critical hit chance (0-100).</param>
        /// <param name="randomValue">A value between 0 and 1 (optional).</param>
        /// <returns>True if the attack is a critical hit.</returns>
        public static bool RollCritical(int critChance, float? randomValue = null)
        {
            float roll = randomValue ?? UnityEngine.Random.value;
            return roll * 100f < critChance;
        }

        #endregion

        #region Status Effect Damage

        /// <summary>
        /// Calculate damage from a status effect (DoT).
        /// </summary>
        /// <param name="effect">The status effect.</param>
        /// <param name="maxHP">The target's maximum HP (for percentage-based effects).</param>
        /// <returns>Damage to apply.</returns>
        public static int CalculateStatusEffectDamage(StatusEffect effect, int maxHP)
        {
            switch (effect.Type)
            {
                case StatusEffectType.Poisoned:
                    // Poison deals flat damage based on effect value
                    return Mathf.FloorToInt(effect.Value);

                case StatusEffectType.Burning:
                    // Burning deals higher flat damage
                    return Mathf.FloorToInt(effect.Value * 1.5f);

                case StatusEffectType.Bleeding:
                    // Bleeding deals percentage of max HP
                    return Mathf.Max(MinimumDamage, Mathf.FloorToInt(maxHP * (effect.Value / 100f)));

                default:
                    return 0;
            }
        }

        #endregion

        #region Heal Calculation

        /// <summary>
        /// Calculate healing amount (capped at max HP).
        /// </summary>
        /// <param name="currentHP">Current HP.</param>
        /// <param name="maxHP">Maximum HP.</param>
        /// <param name="healAmount">Base heal amount.</param>
        /// <returns>Actual HP to heal (won't exceed max).</returns>
        public static int CalculateHeal(int currentHP, int maxHP, int healAmount)
        {
            int maxHeal = maxHP - currentHP;
            return Mathf.Max(0, Mathf.Min(maxHeal, healAmount));
        }

        #endregion

        #region Type Effectiveness

        /// <summary>
        /// Get type effectiveness multiplier.
        /// </summary>
        /// <param name="attackType">The damage type of the attack.</param>
        /// <param name="targetWeakness">The target's weakness type (if any).</param>
        /// <param name="targetResistance">The target's resistance type (if any).</param>
        /// <returns>Effectiveness multiplier (0.5 = resist, 1.0 = normal, 2.0 = weakness).</returns>
        public static float GetTypeEffectiveness(
            DamageType attackType,
            DamageType? targetWeakness,
            DamageType? targetResistance)
        {
            // True damage ignores all modifiers
            if (attackType == DamageType.True)
                return 1f;

            if (targetWeakness.HasValue && attackType == targetWeakness.Value)
                return 2f;

            if (targetResistance.HasValue && attackType == targetResistance.Value)
                return 0.5f;

            return 1f;
        }

        /// <summary>
        /// Standard elemental effectiveness chart.
        /// </summary>
        public static float GetElementalEffectiveness(DamageType attackType, DamageType defenderType)
        {
            // Fire > Ice, Ice > Lightning, Lightning > Fire
            // Holy > Dark, Dark > Holy
            // Physical and Poison are neutral

            return (attackType, defenderType) switch
            {
                (DamageType.Fire, DamageType.Ice) => 2f,
                (DamageType.Ice, DamageType.Lightning) => 2f,
                (DamageType.Lightning, DamageType.Fire) => 2f,
                (DamageType.Holy, DamageType.Dark) => 2f,
                (DamageType.Dark, DamageType.Holy) => 2f,

                (DamageType.Fire, DamageType.Fire) => 0.5f,
                (DamageType.Ice, DamageType.Ice) => 0.5f,
                (DamageType.Lightning, DamageType.Lightning) => 0.5f,
                (DamageType.Holy, DamageType.Holy) => 0.5f,
                (DamageType.Dark, DamageType.Dark) => 0.5f,

                (DamageType.Ice, DamageType.Fire) => 0.5f,
                (DamageType.Lightning, DamageType.Ice) => 0.5f,
                (DamageType.Fire, DamageType.Lightning) => 0.5f,

                (DamageType.True, _) => 1f, // True damage always neutral

                _ => 1f // Neutral
            };
        }

        #endregion

        #region Utility

        /// <summary>
        /// Calculate expected damage for AI decision making.
        /// Returns average expected damage without random factors.
        /// </summary>
        public static int CalculateExpectedDamage(int attackPower, int defenderDefense, int critChance)
        {
            int baseDamage = CalculateBaseDamage(attackPower, defenderDefense);

            // Calculate expected damage including crit probability
            float critProbability = critChance / 100f;
            float expectedCritBonus = critProbability * (DefaultCritMultiplier - 1f);

            return Mathf.FloorToInt(baseDamage * (1f + expectedCritBonus));
        }

        /// <summary>
        /// Calculate damage range (min-max) for UI display.
        /// </summary>
        public static (int min, int max, int avgCrit) CalculateDamageRange(
            int attackPower,
            int defenderDefense,
            float variance = DefaultVariance)
        {
            int baseDamage = CalculateBaseDamage(attackPower, defenderDefense);

            int minDamage = Mathf.Max(MinimumDamage, Mathf.FloorToInt(baseDamage * (1f - variance)));
            int maxDamage = Mathf.FloorToInt(baseDamage * (1f + variance));
            int avgCritDamage = Mathf.FloorToInt(baseDamage * DefaultCritMultiplier);

            return (minDamage, maxDamage, avgCritDamage);
        }

        #endregion
    }
}
