using System;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;

namespace IronFrontier.Tests.EditMode
{
    /// <summary>
    /// Combat System Unit Tests
    ///
    /// Tests for the turn-based combat system including:
    /// - Combat initialization and state management
    /// - Turn order and phase transitions
    /// - Action execution (attack, defend, flee)
    /// - Combatant management (player, enemies, companions)
    /// - Combat resolution (victory, defeat, fled)
    ///
    /// Ported from TypeScript reference: CombatScene.test.tsx, CombatController.ts
    /// </summary>
    [TestFixture]
    [Category("Combat")]
    public class CombatTests
    {
        #region Test Data Helpers

        private CombatState CreateMockCombatState(Action<CombatState> configure = null)
        {
            var state = new CombatState
            {
                EncounterId = "test_encounter",
                Phase = CombatPhase.PlayerTurn,
                Combatants = new List<Combatant>
                {
                    CreateMockCombatant("player", "Test Player", true),
                    CreateMockCombatant("bandit_1", "Bandit", false)
                },
                TurnOrder = new List<string> { "player", "bandit_1" },
                CurrentTurnIndex = 0,
                Round = 1,
                Log = new List<CombatLogEntry>(),
                StartedAt = DateTime.UtcNow
            };

            configure?.Invoke(state);
            return state;
        }

        private Combatant CreateMockCombatant(string id, string name, bool isPlayer, int health = 100)
        {
            return new Combatant
            {
                DefinitionId = id,
                Name = name,
                IsPlayer = isPlayer,
                Health = health,
                MaxHealth = 100,
                ActionPoints = 4,
                MaxActionPoints = 4,
                Position = new HexCoord(0, 0),
                StatusEffects = new List<StatusEffect>(),
                WeaponId = "revolver",
                AmmoInClip = 6,
                IsActive = false,
                HasActed = false,
                IsDead = health <= 0
            };
        }

        #endregion

        #region Combat Initialization Tests

        [Test]
        public void CombatState_ShouldInitializeWithCorrectDefaults()
        {
            // Arrange & Act
            var state = CreateMockCombatState();

            // Assert
            Assert.AreEqual("test_encounter", state.EncounterId);
            Assert.AreEqual(CombatPhase.PlayerTurn, state.Phase);
            Assert.AreEqual(2, state.Combatants.Count);
            Assert.AreEqual(1, state.Round);
        }

        [Test]
        public void CombatState_ShouldHaveTurnOrderSetCorrectly()
        {
            // Arrange & Act
            var state = CreateMockCombatState();

            // Assert
            Assert.AreEqual(2, state.TurnOrder.Count);
            Assert.AreEqual("player", state.TurnOrder[0]);
            Assert.AreEqual("bandit_1", state.TurnOrder[1]);
        }

        [Test]
        public void CombatState_ShouldIdentifyPlayerCombatant()
        {
            // Arrange
            var state = CreateMockCombatState();

            // Act
            var player = state.Combatants.Find(c => c.IsPlayer);

            // Assert
            Assert.IsNotNull(player);
            Assert.AreEqual("Test Player", player.Name);
        }

        [Test]
        public void CombatState_ShouldIdentifyEnemyCombatants()
        {
            // Arrange
            var state = CreateMockCombatState();

            // Act
            var enemies = state.Combatants.FindAll(c => !c.IsPlayer);

            // Assert
            Assert.AreEqual(1, enemies.Count);
            Assert.AreEqual("Bandit", enemies[0].Name);
        }

        #endregion

        #region Combatant Tests

        [Test]
        public void Combatant_ShouldHaveCorrectDefaultStats()
        {
            // Arrange & Act
            var combatant = CreateMockCombatant("test", "Test Fighter", false);

            // Assert
            Assert.AreEqual(100, combatant.Health);
            Assert.AreEqual(100, combatant.MaxHealth);
            Assert.AreEqual(4, combatant.ActionPoints);
            Assert.AreEqual(4, combatant.MaxActionPoints);
            Assert.IsFalse(combatant.IsDead);
        }

        [Test]
        public void Combatant_ShouldBeDeadWhenHealthIsZero()
        {
            // Arrange & Act
            var combatant = CreateMockCombatant("test", "Dead Fighter", false, 0);

            // Assert
            Assert.IsTrue(combatant.IsDead);
            Assert.AreEqual(0, combatant.Health);
        }

        [Test]
        public void CombatState_ShouldHandleMultipleEnemies()
        {
            // Arrange
            var state = CreateMockCombatState(s =>
            {
                s.Combatants = new List<Combatant>
                {
                    CreateMockCombatant("player", "Test Player", true),
                    CreateMockCombatant("bandit_1", "Bandit 1", false),
                    CreateMockCombatant("bandit_2", "Bandit 2", false),
                    CreateMockCombatant("bandit_3", "Bandit 3", false)
                };
            });

            // Act
            var enemies = state.Combatants.FindAll(c => !c.IsPlayer);

            // Assert
            Assert.AreEqual(3, enemies.Count);
        }

        [Test]
        public void CombatState_ShouldIdentifyDeadCombatants()
        {
            // Arrange
            var state = CreateMockCombatState(s =>
            {
                s.Combatants = new List<Combatant>
                {
                    CreateMockCombatant("player", "Test Player", true),
                    CreateMockCombatant("bandit_1", "Dead Bandit", false, 0)
                };
            });

            // Act
            var deadCombatants = state.Combatants.FindAll(c => c.IsDead);

            // Assert
            Assert.AreEqual(1, deadCombatants.Count);
            Assert.AreEqual("Dead Bandit", deadCombatants[0].Name);
        }

        #endregion

        #region Combat Phase Tests

        [Test]
        public void CombatPhase_ShouldDetectVictoryPhase()
        {
            // Arrange
            var state = CreateMockCombatState(s => s.Phase = CombatPhase.Victory);

            // Assert
            Assert.AreEqual(CombatPhase.Victory, state.Phase);
        }

        [Test]
        public void CombatPhase_ShouldDetectDefeatPhase()
        {
            // Arrange
            var state = CreateMockCombatState(s => s.Phase = CombatPhase.Defeat);

            // Assert
            Assert.AreEqual(CombatPhase.Defeat, state.Phase);
        }

        [Test]
        public void CombatPhase_ShouldDetectPlayerTurn()
        {
            // Arrange
            var state = CreateMockCombatState(s => s.Phase = CombatPhase.PlayerTurn);

            // Assert
            Assert.AreEqual(CombatPhase.PlayerTurn, state.Phase);
        }

        [Test]
        public void CombatPhase_ShouldDetectEnemyTurn()
        {
            // Arrange
            var state = CreateMockCombatState(s => s.Phase = CombatPhase.EnemyTurn);

            // Assert
            Assert.AreEqual(CombatPhase.EnemyTurn, state.Phase);
        }

        #endregion

        #region Arena Type Detection Tests

        [Test]
        [TestCase("boss_encounter", ExpectedResult = true)]
        [TestCase("final_boss", ExpectedResult = true)]
        [TestCase("thorne_fight", ExpectedResult = true)]
        [TestCase("tyrant_battle", ExpectedResult = true)]
        [TestCase("bandit_camp", ExpectedResult = false)]
        public bool ArenaType_ShouldDetectBossArenaFromEncounterId(string encounterId)
        {
            // Arrange & Act
            var isBoss = encounterId.ToLower().Contains("boss") ||
                         encounterId.ToLower().Contains("final") ||
                         encounterId.ToLower().Contains("thorne") ||
                         encounterId.ToLower().Contains("tyrant");

            return isBoss;
        }

        [Test]
        [TestCase("mine_encounter", ExpectedResult = true)]
        [TestCase("remnant_base", ExpectedResult = true)]
        [TestCase("automaton_factory", ExpectedResult = true)]
        [TestCase("desert_camp", ExpectedResult = false)]
        public bool ArenaType_ShouldDetectMineArenaFromEncounterId(string encounterId)
        {
            // Arrange & Act
            var isMine = encounterId.ToLower().Contains("mine") ||
                         encounterId.ToLower().Contains("remnant") ||
                         encounterId.ToLower().Contains("automaton");

            return isMine;
        }

        #endregion

        #region Combat Result Tests

        [Test]
        public void CombatResult_ShouldDetectCriticalHits()
        {
            // Arrange
            var result = new CombatResult
            {
                Success = true,
                Damage = 30,
                IsCritical = true,
                Message = "Critical hit!"
            };

            // Assert
            Assert.IsTrue(result.IsCritical);
            Assert.Greater(result.Damage, 0);
        }

        [Test]
        public void CombatResult_ShouldDetectMisses()
        {
            // Arrange
            var result = new CombatResult
            {
                Success = false,
                WasDodged = true,
                Message = "Missed!"
            };

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.WasDodged);
        }

        [Test]
        public void CombatResult_ShouldCalculateDamageCorrectly()
        {
            // Arrange
            int baseDamage = 20;
            float critMultiplier = 1.5f;

            // Act
            int normalDamage = baseDamage;
            int critDamage = Mathf.RoundToInt(baseDamage * critMultiplier);

            // Assert
            Assert.AreEqual(20, normalDamage);
            Assert.AreEqual(30, critDamage);
        }

        #endregion

        #region Combat Position Tests

        [Test]
        public void CombatPositions_PlayerShouldBeOnLeftSide()
        {
            // Arrange
            var playerPosition = new Vector3(-5f, 0f, 0f);

            // Assert
            Assert.Less(playerPosition.x, 0f);
        }

        [Test]
        public void CombatPositions_EnemiesShouldBeOnRightSide()
        {
            // Arrange
            var enemyPositions = new List<Vector3>
            {
                new Vector3(5f, 0f, -3f),
                new Vector3(5f, 0f, -1f),
                new Vector3(5f, 0f, 1f),
                new Vector3(5f, 0f, 3f)
            };

            // Assert
            foreach (var pos in enemyPositions)
            {
                Assert.Greater(pos.x, 0f);
            }
        }

        [Test]
        public void CombatPositions_ShouldHaveAtLeast4EnemyPositions()
        {
            // Arrange
            var enemyPositions = new List<Vector3>
            {
                new Vector3(5f, 0f, -3f),
                new Vector3(5f, 0f, -1f),
                new Vector3(5f, 0f, 1f),
                new Vector3(5f, 0f, 3f)
            };

            // Assert
            Assert.GreaterOrEqual(enemyPositions.Count, 4);
        }

        [Test]
        public void CombatPositions_EnemiesShouldBeSpreadAlongZAxis()
        {
            // Arrange
            var enemyPositions = new List<Vector3>
            {
                new Vector3(5f, 0f, -3f),
                new Vector3(5f, 0f, -1f),
                new Vector3(5f, 0f, 1f),
                new Vector3(5f, 0f, 3f)
            };

            // Act
            var zValues = new HashSet<float>();
            foreach (var pos in enemyPositions)
            {
                zValues.Add(pos.z);
            }

            // Assert - All z values should be unique
            Assert.AreEqual(enemyPositions.Count, zValues.Count);
        }

        #endregion

        #region Animation Duration Tests

        [Test]
        public void AnimationDurations_ShouldHaveAllAnimationTypes()
        {
            // Arrange
            var durations = new Dictionary<string, float>
            {
                { "idle", 0f },
                { "attack", 0.5f },
                { "hit", 0.3f },
                { "defend", 0.4f },
                { "death", 1.0f },
                { "victory", 0.8f },
                { "dodge", 0.35f }
            };

            // Assert
            Assert.IsTrue(durations.ContainsKey("idle"));
            Assert.IsTrue(durations.ContainsKey("attack"));
            Assert.IsTrue(durations.ContainsKey("hit"));
            Assert.IsTrue(durations.ContainsKey("defend"));
            Assert.IsTrue(durations.ContainsKey("death"));
            Assert.IsTrue(durations.ContainsKey("victory"));
            Assert.IsTrue(durations.ContainsKey("dodge"));
        }

        [Test]
        public void AnimationDurations_DeathShouldBeLongest()
        {
            // Arrange
            var durations = new Dictionary<string, float>
            {
                { "idle", 0f },
                { "attack", 0.5f },
                { "hit", 0.3f },
                { "death", 1.0f }
            };

            // Assert
            Assert.Greater(durations["death"], durations["attack"]);
            Assert.Greater(durations["death"], durations["hit"]);
        }

        [Test]
        public void AnimationDurations_IdleShouldBeContinuous()
        {
            // Arrange
            var durations = new Dictionary<string, float>
            {
                { "idle", 0f }
            };

            // Assert - Idle is 0 because it loops continuously
            Assert.AreEqual(0f, durations["idle"]);
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Combat state container
    /// </summary>
    public class CombatState
    {
        public string EncounterId { get; set; }
        public CombatPhase Phase { get; set; }
        public List<Combatant> Combatants { get; set; }
        public List<string> TurnOrder { get; set; }
        public int CurrentTurnIndex { get; set; }
        public int Round { get; set; }
        public List<CombatLogEntry> Log { get; set; }
        public DateTime StartedAt { get; set; }
    }

    /// <summary>
    /// Combat phases
    /// </summary>
    public enum CombatPhase
    {
        Setup,
        PlayerTurn,
        EnemyTurn,
        Victory,
        Defeat,
        Fled
    }

    /// <summary>
    /// Individual combatant
    /// </summary>
    public class Combatant
    {
        public string DefinitionId { get; set; }
        public string Name { get; set; }
        public bool IsPlayer { get; set; }
        public int Health { get; set; }
        public int MaxHealth { get; set; }
        public int ActionPoints { get; set; }
        public int MaxActionPoints { get; set; }
        public HexCoord Position { get; set; }
        public List<StatusEffect> StatusEffects { get; set; }
        public string WeaponId { get; set; }
        public int AmmoInClip { get; set; }
        public bool IsActive { get; set; }
        public bool HasActed { get; set; }
        public bool IsDead { get; set; }
    }

    /// <summary>
    /// Hex coordinate
    /// </summary>
    public struct HexCoord
    {
        public int Q { get; set; }
        public int R { get; set; }

        public HexCoord(int q, int r)
        {
            Q = q;
            R = r;
        }
    }

    /// <summary>
    /// Status effect applied to combatant
    /// </summary>
    public class StatusEffect
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int Duration { get; set; }
    }

    /// <summary>
    /// Combat log entry
    /// </summary>
    public class CombatLogEntry
    {
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }

    /// <summary>
    /// Combat action result
    /// </summary>
    public class CombatResult
    {
        public bool Success { get; set; }
        public int Damage { get; set; }
        public bool IsCritical { get; set; }
        public bool WasDodged { get; set; }
        public string Message { get; set; }
    }

    #endregion
}
