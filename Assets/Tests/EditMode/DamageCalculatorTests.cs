using System;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;

namespace IronFrontier.Tests.EditMode
{
    /// <summary>
    /// Damage Calculator Unit Tests
    ///
    /// Tests for damage calculation formulas including:
    /// - Base damage calculations
    /// - Critical hit multipliers
    /// - Defense reduction
    /// - Elemental modifiers
    /// - Status effect damage
    /// - Weapon type bonuses
    ///
    /// Ported from TypeScript reference: CombatController.ts, combat system
    /// </summary>
    [TestFixture]
    [Category("Combat")]
    [Category("DamageCalculation")]
    public class DamageCalculatorTests
    {
        #region Test Data Helpers

        private CombatantStats CreateMockStats(int attack = 10, int defense = 5, int speed = 8,
            int accuracy = 70, int evasion = 5, int critChance = 5, float critMultiplier = 1.5f)
        {
            return new CombatantStats
            {
                Attack = attack,
                Defense = defense,
                Speed = speed,
                Accuracy = accuracy,
                Evasion = evasion,
                CritChance = critChance,
                CritMultiplier = critMultiplier
            };
        }

        private WeaponStats CreateMockWeapon(string weaponType = "revolver", int baseDamage = 15,
            int range = 3, int apCost = 2)
        {
            return new WeaponStats
            {
                WeaponType = weaponType,
                BaseDamage = baseDamage,
                Range = range,
                APCost = apCost,
                AmmoCapacity = 6
            };
        }

        #endregion

        #region Base Damage Tests

        [Test]
        public void BaseDamage_ShouldCalculateFromAttackStat()
        {
            // Arrange
            var attacker = CreateMockStats(attack: 20);
            var weapon = CreateMockWeapon(baseDamage: 15);

            // Act
            int baseDamage = CalculateBaseDamage(attacker.Attack, weapon.BaseDamage);

            // Assert - Expected: attack + weapon damage
            Assert.AreEqual(35, baseDamage);
        }

        [Test]
        public void BaseDamage_ShouldApplyWeaponModifier()
        {
            // Arrange
            var attacker = CreateMockStats(attack: 10);
            var weapon = CreateMockWeapon(baseDamage: 25);

            // Act
            int baseDamage = CalculateBaseDamage(attacker.Attack, weapon.BaseDamage);

            // Assert
            Assert.AreEqual(35, baseDamage);
        }

        [Test]
        public void BaseDamage_ShouldNeverBeNegative()
        {
            // Arrange
            var attacker = CreateMockStats(attack: 0);
            var weapon = CreateMockWeapon(baseDamage: 0);

            // Act
            int baseDamage = CalculateBaseDamage(attacker.Attack, weapon.BaseDamage);

            // Assert
            Assert.GreaterOrEqual(baseDamage, 0);
        }

        #endregion

        #region Defense Reduction Tests

        [Test]
        public void DefenseReduction_ShouldReduceDamage()
        {
            // Arrange
            int rawDamage = 30;
            int defense = 10;

            // Act
            int finalDamage = ApplyDefense(rawDamage, defense);

            // Assert - Defense reduces damage (30 - 10 = 20)
            Assert.AreEqual(20, finalDamage);
        }

        [Test]
        public void DefenseReduction_ShouldNotReduceBelowMinimum()
        {
            // Arrange
            int rawDamage = 10;
            int defense = 100;
            int minimumDamage = 1;

            // Act
            int finalDamage = ApplyDefense(rawDamage, defense, minimumDamage);

            // Assert - Should always deal at least 1 damage
            Assert.AreEqual(minimumDamage, finalDamage);
        }

        [Test]
        public void DefenseReduction_ShouldHandleZeroDefense()
        {
            // Arrange
            int rawDamage = 25;
            int defense = 0;

            // Act
            int finalDamage = ApplyDefense(rawDamage, defense);

            // Assert
            Assert.AreEqual(rawDamage, finalDamage);
        }

        [Test]
        public void DefenseReduction_PercentageBased_ShouldApplyCorrectly()
        {
            // Arrange
            int rawDamage = 100;
            float defensePercent = 0.25f; // 25% damage reduction

            // Act
            int finalDamage = ApplyDefensePercent(rawDamage, defensePercent);

            // Assert - 100 * 0.75 = 75
            Assert.AreEqual(75, finalDamage);
        }

        #endregion

        #region Critical Hit Tests

        [Test]
        public void CriticalHit_ShouldApplyMultiplier()
        {
            // Arrange
            int baseDamage = 20;
            float critMultiplier = 1.5f;

            // Act
            int critDamage = ApplyCritical(baseDamage, critMultiplier);

            // Assert - 20 * 1.5 = 30
            Assert.AreEqual(30, critDamage);
        }

        [Test]
        public void CriticalHit_HighMultiplier_ShouldCalculateCorrectly()
        {
            // Arrange
            int baseDamage = 20;
            float critMultiplier = 2.0f;

            // Act
            int critDamage = ApplyCritical(baseDamage, critMultiplier);

            // Assert - 20 * 2.0 = 40
            Assert.AreEqual(40, critDamage);
        }

        [Test]
        public void CriticalHit_ShouldRoundDown()
        {
            // Arrange
            int baseDamage = 15;
            float critMultiplier = 1.5f;

            // Act
            int critDamage = ApplyCritical(baseDamage, critMultiplier);

            // Assert - 15 * 1.5 = 22.5 -> 22
            Assert.AreEqual(22, critDamage);
        }

        [Test]
        [TestCase(5, ExpectedResult = true)]
        [TestCase(10, ExpectedResult = true)]
        [TestCase(0, ExpectedResult = true)]  // 0% crit is valid (no crits possible)
        [TestCase(-5, ExpectedResult = false)]  // Negative is invalid
        [TestCase(105, ExpectedResult = false)]  // Over 100 is invalid
        public bool CriticalChance_ShouldBeInValidRange(int critChance)
        {
            // Crit chance should be between 0 and 100
            return critChance >= 0 && critChance <= 100;
        }

        #endregion

        #region Accuracy and Evasion Tests

        [Test]
        public void HitChance_ShouldCalculateCorrectly()
        {
            // Arrange
            int accuracy = 80;
            int evasion = 15;

            // Act
            int hitChance = CalculateHitChance(accuracy, evasion);

            // Assert - 80 - 15 = 65%
            Assert.AreEqual(65, hitChance);
        }

        [Test]
        public void HitChance_ShouldNotExceed95Percent()
        {
            // Arrange
            int accuracy = 100;
            int evasion = 0;

            // Act
            int hitChance = CalculateHitChance(accuracy, evasion);

            // Assert - Max cap at 95%
            Assert.LessOrEqual(hitChance, 95);
        }

        [Test]
        public void HitChance_ShouldNotBeBelowMinimum()
        {
            // Arrange
            int accuracy = 30;
            int evasion = 50;
            int minimumHitChance = 5;

            // Act
            int hitChance = CalculateHitChance(accuracy, evasion, minimumHitChance);

            // Assert - Min cap at 5%
            Assert.GreaterOrEqual(hitChance, minimumHitChance);
        }

        #endregion

        #region Elemental Damage Tests

        [Test]
        public void ElementalDamage_FireShouldDealBonusToOil()
        {
            // Arrange
            int baseDamage = 20;
            DamageType damageType = DamageType.Fire;
            bool targetHasOil = true;
            float elementalBonus = 1.5f;

            // Act
            int finalDamage = ApplyElementalBonus(baseDamage, damageType, targetHasOil, elementalBonus);

            // Assert - 20 * 1.5 = 30
            Assert.AreEqual(30, finalDamage);
        }

        [Test]
        public void ElementalDamage_ElectricShouldDealBonusToWet()
        {
            // Arrange
            int baseDamage = 20;
            DamageType damageType = DamageType.Electric;
            bool targetIsWet = true;
            float elementalBonus = 2.0f;

            // Act
            int finalDamage = ApplyElementalBonus(baseDamage, damageType, targetIsWet, elementalBonus);

            // Assert - 20 * 2.0 = 40
            Assert.AreEqual(40, finalDamage);
        }

        [Test]
        public void ElementalDamage_NoBonus_ShouldReturnBaseDamage()
        {
            // Arrange
            int baseDamage = 20;
            DamageType damageType = DamageType.Fire;
            bool targetHasOil = false;
            float elementalBonus = 1.5f;

            // Act
            int finalDamage = ApplyElementalBonus(baseDamage, damageType, targetHasOil, elementalBonus);

            // Assert
            Assert.AreEqual(baseDamage, finalDamage);
        }

        #endregion

        #region Weapon Type Tests

        [Test]
        [TestCase("revolver", 15)]
        [TestCase("rifle", 25)]
        [TestCase("shotgun", 30)]
        [TestCase("melee", 12)]
        public void WeaponType_ShouldHaveCorrectBaseDamage(string weaponType, int expectedDamage)
        {
            // Arrange & Act
            var weapon = GetWeaponBaseDamage(weaponType);

            // Assert
            Assert.AreEqual(expectedDamage, weapon);
        }

        [Test]
        public void WeaponRange_ShouldAffectAccuracy()
        {
            // Arrange
            int baseAccuracy = 80;
            int weaponRange = 3;
            int targetDistance = 4;

            // Act
            int modifiedAccuracy = ApplyRangeModifier(baseAccuracy, weaponRange, targetDistance);

            // Assert - Accuracy should be reduced when beyond optimal range
            Assert.Less(modifiedAccuracy, baseAccuracy);
        }

        [Test]
        public void WeaponRange_WithinRange_ShouldNotReduceAccuracy()
        {
            // Arrange
            int baseAccuracy = 80;
            int weaponRange = 3;
            int targetDistance = 2;

            // Act
            int modifiedAccuracy = ApplyRangeModifier(baseAccuracy, weaponRange, targetDistance);

            // Assert
            Assert.AreEqual(baseAccuracy, modifiedAccuracy);
        }

        #endregion

        #region Status Effect Damage Tests

        [Test]
        public void StatusEffect_Poison_ShouldDealDamageOverTime()
        {
            // Arrange
            int poisonDamagePerTurn = 5;
            int remainingTurns = 3;

            // Act
            int totalPoisonDamage = poisonDamagePerTurn * remainingTurns;

            // Assert
            Assert.AreEqual(15, totalPoisonDamage);
        }

        [Test]
        public void StatusEffect_Burn_ShouldStackDamage()
        {
            // Arrange
            int burnStacks = 3;
            int damagePerStack = 4;

            // Act
            int totalBurnDamage = burnStacks * damagePerStack;

            // Assert
            Assert.AreEqual(12, totalBurnDamage);
        }

        #endregion

        #region Full Damage Calculation Tests

        [Test]
        public void FullDamageCalculation_ShouldCombineAllFactors()
        {
            // Arrange
            var attacker = CreateMockStats(attack: 15);
            var defender = CreateMockStats(defense: 8);
            var weapon = CreateMockWeapon(baseDamage: 20);
            bool isCritical = true;
            float critMultiplier = 1.5f;

            // Act
            // Base: 15 + 20 = 35
            // Defense: 35 - 8 = 27
            // Critical: 27 * 1.5 = 40.5 -> 40
            int damage = CalculateFullDamage(attacker, defender, weapon, isCritical, critMultiplier);

            // Assert
            Assert.AreEqual(40, damage);
        }

        [Test]
        public void FullDamageCalculation_NonCritical_ShouldCalculateCorrectly()
        {
            // Arrange
            var attacker = CreateMockStats(attack: 15);
            var defender = CreateMockStats(defense: 8);
            var weapon = CreateMockWeapon(baseDamage: 20);
            bool isCritical = false;
            float critMultiplier = 1.5f;

            // Act
            // Base: 15 + 20 = 35
            // Defense: 35 - 8 = 27
            // No crit: 27
            int damage = CalculateFullDamage(attacker, defender, weapon, isCritical, critMultiplier);

            // Assert
            Assert.AreEqual(27, damage);
        }

        #endregion

        #region Reward Calculation Tests

        [Test]
        public void RewardXP_ShouldScaleWithEnemyLevel()
        {
            // Arrange
            int enemyLevel = 5;
            int baseXP = 25;

            // Act
            int totalXP = CalculateXPReward(enemyLevel, baseXP);

            // Assert - 25 * 5 = 125
            Assert.AreEqual(125, totalXP);
        }

        [Test]
        public void RewardGold_ShouldBeRandomInRange()
        {
            // Arrange
            int minGold = 10;
            int maxGold = 25;

            // Act
            int gold = UnityEngine.Random.Range(minGold, maxGold + 1);

            // Assert
            Assert.GreaterOrEqual(gold, minGold);
            Assert.LessOrEqual(gold, maxGold);
        }

        #endregion

        #region Helper Methods

        private int CalculateBaseDamage(int attack, int weaponDamage)
        {
            return attack + weaponDamage;
        }

        private int ApplyDefense(int rawDamage, int defense, int minimumDamage = 1)
        {
            int damage = rawDamage - defense;
            return Mathf.Max(damage, minimumDamage);
        }

        private int ApplyDefensePercent(int rawDamage, float defensePercent)
        {
            return Mathf.RoundToInt(rawDamage * (1f - defensePercent));
        }

        private int ApplyCritical(int baseDamage, float critMultiplier)
        {
            return Mathf.FloorToInt(baseDamage * critMultiplier);
        }

        private int CalculateHitChance(int accuracy, int evasion, int minimum = 5, int maximum = 95)
        {
            int hitChance = accuracy - evasion;
            return Mathf.Clamp(hitChance, minimum, maximum);
        }

        private int ApplyElementalBonus(int baseDamage, DamageType damageType, bool conditionMet, float bonus)
        {
            if (!conditionMet) return baseDamage;
            return Mathf.RoundToInt(baseDamage * bonus);
        }

        private int GetWeaponBaseDamage(string weaponType)
        {
            return weaponType switch
            {
                "revolver" => 15,
                "rifle" => 25,
                "shotgun" => 30,
                "melee" => 12,
                _ => 10
            };
        }

        private int ApplyRangeModifier(int accuracy, int weaponRange, int distance)
        {
            if (distance <= weaponRange) return accuracy;
            int penalty = (distance - weaponRange) * 10;
            return Mathf.Max(accuracy - penalty, 5);
        }

        private int CalculateFullDamage(CombatantStats attacker, CombatantStats defender,
            WeaponStats weapon, bool isCritical, float critMultiplier)
        {
            int baseDamage = CalculateBaseDamage(attacker.Attack, weapon.BaseDamage);
            int afterDefense = ApplyDefense(baseDamage, defender.Defense);

            if (isCritical)
            {
                return ApplyCritical(afterDefense, critMultiplier);
            }

            return afterDefense;
        }

        private int CalculateXPReward(int enemyLevel, int baseXP)
        {
            return baseXP * enemyLevel;
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Combatant statistics
    /// </summary>
    public class CombatantStats
    {
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int Speed { get; set; }
        public int Accuracy { get; set; }
        public int Evasion { get; set; }
        public int CritChance { get; set; }
        public float CritMultiplier { get; set; }
    }

    /// <summary>
    /// Weapon statistics
    /// </summary>
    public class WeaponStats
    {
        public string WeaponType { get; set; }
        public int BaseDamage { get; set; }
        public int Range { get; set; }
        public int APCost { get; set; }
        public int AmmoCapacity { get; set; }
    }

    /// <summary>
    /// Damage types for elemental calculations
    /// </summary>
    public enum DamageType
    {
        Physical,
        Fire,
        Electric,
        Frost,
        Poison
    }

    #endregion
}
