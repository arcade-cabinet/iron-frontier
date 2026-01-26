using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Combat
{
    /// <summary>
    /// AI system for enemy turn decisions in combat.
    /// Supports multiple behavior types for varied enemy tactics.
    /// </summary>
    public static class CombatAI
    {
        #region Target Selection

        /// <summary>
        /// Select a target based on the given strategy.
        /// </summary>
        /// <param name="combatManager">The combat manager instance.</param>
        /// <param name="actorId">ID of the acting combatant.</param>
        /// <param name="strategy">Target selection strategy.</param>
        /// <returns>Selected target or null if none available.</returns>
        public static Combatant SelectTarget(
            CombatManager combatManager,
            string actorId,
            TargetSelectionStrategy strategy)
        {
            var actor = combatManager.GetCombatantById(actorId);
            if (actor == null)
                return null;

            var targets = combatManager.GetValidTargetsFor(actor);
            if (targets.Count == 0)
                return null;

            return strategy switch
            {
                TargetSelectionStrategy.LowestHP => SelectLowestHP(targets),
                TargetSelectionStrategy.HighestThreat => SelectHighestThreat(targets),
                TargetSelectionStrategy.PlayerFirst => SelectPlayerFirst(targets),
                TargetSelectionStrategy.Random => SelectRandom(targets),
                _ => SelectRandom(targets)
            };
        }

        /// <summary>
        /// Select the target with the lowest HP.
        /// </summary>
        private static Combatant SelectLowestHP(List<Combatant> targets)
        {
            return targets.OrderBy(t => t.Stats.HP).First();
        }

        /// <summary>
        /// Select the target with the highest attack (perceived threat).
        /// </summary>
        private static Combatant SelectHighestThreat(List<Combatant> targets)
        {
            return targets.OrderByDescending(t => t.GetEffectiveStats().Attack).First();
        }

        /// <summary>
        /// Select the player if available, otherwise random.
        /// </summary>
        private static Combatant SelectPlayerFirst(List<Combatant> targets)
        {
            var player = targets.FirstOrDefault(t => t.IsPlayer);
            return player ?? targets[0];
        }

        /// <summary>
        /// Select a random target.
        /// </summary>
        private static Combatant SelectRandom(List<Combatant> targets)
        {
            return targets[Random.Range(0, targets.Count)];
        }

        #endregion

        #region Decision Making

        /// <summary>
        /// Decide what action an enemy should take.
        /// </summary>
        /// <param name="combatManager">The combat manager instance.</param>
        /// <param name="actorId">ID of the acting combatant.</param>
        /// <returns>AI decision with action and reasoning.</returns>
        public static AIDecision DecideAction(CombatManager combatManager, string actorId)
        {
            var actor = combatManager.GetCombatantById(actorId);
            if (actor == null || !actor.IsAlive || actor.IsPlayer)
                return null;

            return actor.Behavior switch
            {
                CombatantBehavior.Aggressive => DecideAggressive(combatManager, actor),
                CombatantBehavior.Defensive => DecideDefensive(combatManager, actor),
                CombatantBehavior.Ranged => DecideRanged(combatManager, actor),
                CombatantBehavior.Support => DecideSupport(combatManager, actor),
                CombatantBehavior.Random => DecideRandom(combatManager, actor),
                _ => DecideAggressive(combatManager, actor)
            };
        }

        /// <summary>
        /// Aggressive AI: Always attack, prefer low HP targets.
        /// </summary>
        private static AIDecision DecideAggressive(CombatManager combatManager, Combatant actor)
        {
            var target = SelectTarget(combatManager, actor.Id, TargetSelectionStrategy.LowestHP);

            if (target == null)
                return CreateDefendDecision(actor);

            return new AIDecision
            {
                Action = CombatAction.Attack(actor.Id, target.Id),
                Priority = 100,
                Reasoning = "Aggressive behavior: Attack the weakest enemy"
            };
        }

        /// <summary>
        /// Defensive AI: Defend when low HP, otherwise attack.
        /// </summary>
        private static AIDecision DecideDefensive(CombatManager combatManager, Combatant actor)
        {
            float hpPercent = actor.HPPercentage;

            // If HP is below 30%, defend
            if (hpPercent < 0.3f)
                return CreateDefendDecision(actor);

            // If HP is below 50%, 50% chance to defend
            if (hpPercent < 0.5f && Random.value < 0.5f)
                return CreateDefendDecision(actor);

            // Otherwise attack
            var target = SelectTarget(combatManager, actor.Id, TargetSelectionStrategy.Random);

            if (target == null)
                return CreateDefendDecision(actor);

            return new AIDecision
            {
                Action = CombatAction.Attack(actor.Id, target.Id),
                Priority = 80,
                Reasoning = "Defensive behavior: Attack when HP is stable"
            };
        }

        /// <summary>
        /// Ranged AI: Similar to aggressive but always targets player first.
        /// </summary>
        private static AIDecision DecideRanged(CombatManager combatManager, Combatant actor)
        {
            var target = SelectTarget(combatManager, actor.Id, TargetSelectionStrategy.PlayerFirst);

            if (target == null)
                return CreateDefendDecision(actor);

            return new AIDecision
            {
                Action = CombatAction.Attack(actor.Id, target.Id),
                Priority = 90,
                Reasoning = "Ranged behavior: Target the player"
            };
        }

        /// <summary>
        /// Support AI: Target highest threat to protect allies.
        /// </summary>
        private static AIDecision DecideSupport(CombatManager combatManager, Combatant actor)
        {
            // Check if any allies need healing (future expansion)
            // For now, attack the highest threat

            var target = SelectTarget(combatManager, actor.Id, TargetSelectionStrategy.HighestThreat);

            if (target == null)
                return CreateDefendDecision(actor);

            return new AIDecision
            {
                Action = CombatAction.Attack(actor.Id, target.Id),
                Priority = 70,
                Reasoning = "Support behavior: Target highest threat"
            };
        }

        /// <summary>
        /// Random AI: Randomly choose actions.
        /// </summary>
        private static AIDecision DecideRandom(CombatManager combatManager, Combatant actor)
        {
            // 20% chance to defend, 80% chance to attack
            if (Random.value < 0.2f)
                return CreateDefendDecision(actor);

            var target = SelectTarget(combatManager, actor.Id, TargetSelectionStrategy.Random);

            if (target == null)
                return CreateDefendDecision(actor);

            return new AIDecision
            {
                Action = CombatAction.Attack(actor.Id, target.Id),
                Priority = 50,
                Reasoning = "Random behavior: Randomly attacking"
            };
        }

        /// <summary>
        /// Create a defend decision.
        /// </summary>
        private static AIDecision CreateDefendDecision(Combatant actor)
        {
            return new AIDecision
            {
                Action = CombatAction.Defend(actor.Id),
                Priority = 60,
                Reasoning = "Defending to reduce incoming damage"
            };
        }

        #endregion

        #region AI Utilities

        /// <summary>
        /// Get the best action for an AI-controlled combatant.
        /// </summary>
        public static CombatAction GetAIAction(CombatManager combatManager, string actorId)
        {
            var decision = DecideAction(combatManager, actorId);
            return decision?.Action;
        }

        /// <summary>
        /// Check if a combatant should use an item (if available).
        /// </summary>
        /// <param name="actor">The combatant to check.</param>
        /// <param name="availableItems">List of available item IDs.</param>
        /// <returns>Item ID to use, or null if no item should be used.</returns>
        public static string ShouldUseItem(Combatant actor, List<string> availableItems)
        {
            if (availableItems == null || availableItems.Count == 0)
                return null;

            float hpPercent = actor.HPPercentage;

            // Use healing item if HP is below 25%
            if (hpPercent < 0.25f)
            {
                // Return first available item (assuming it's a healing item)
                // In a full implementation, this would check item types
                return availableItems[0];
            }

            return null;
        }

        /// <summary>
        /// Evaluate the current combat situation for an AI combatant.
        /// </summary>
        public static CombatSituation EvaluateSituation(CombatManager combatManager, string actorId)
        {
            var actor = combatManager.GetCombatantById(actorId);
            if (actor == null)
            {
                return new CombatSituation
                {
                    IsWinning = false,
                    Allies = new List<Combatant>(),
                    Enemies = new List<Combatant>(),
                    HPPercentage = 0f,
                    AverageEnemyHP = 0f
                };
            }

            return actor.EvaluateSituation(combatManager.Combatants.ToList());
        }

        /// <summary>
        /// Calculate threat level of a target.
        /// </summary>
        public static float CalculateThreatLevel(Combatant target)
        {
            var stats = target.GetEffectiveStats();

            // Threat based on attack power and current HP
            float attackThreat = stats.Attack / 10f;
            float survivalFactor = target.HPPercentage;

            return attackThreat * survivalFactor;
        }

        /// <summary>
        /// Get all possible actions for a combatant with their priorities.
        /// </summary>
        public static List<AIDecision> GetAllPossibleActions(CombatManager combatManager, string actorId)
        {
            var decisions = new List<AIDecision>();
            var actor = combatManager.GetCombatantById(actorId);

            if (actor == null || !actor.IsAlive)
                return decisions;

            var targets = combatManager.GetValidTargetsFor(actor);

            // Attack each possible target
            foreach (var target in targets)
            {
                int priority = CalculateAttackPriority(actor, target);
                decisions.Add(new AIDecision
                {
                    Action = CombatAction.Attack(actor.Id, target.Id),
                    Priority = priority,
                    Reasoning = $"Attack {target.DisplayName}"
                });
            }

            // Defend option
            int defendPriority = actor.HPPercentage < 0.5f ? 80 : 40;
            decisions.Add(new AIDecision
            {
                Action = CombatAction.Defend(actor.Id),
                Priority = defendPriority,
                Reasoning = "Defend"
            });

            return decisions.OrderByDescending(d => d.Priority).ToList();
        }

        /// <summary>
        /// Calculate attack priority for a specific target.
        /// </summary>
        private static int CalculateAttackPriority(Combatant actor, Combatant target)
        {
            int basePriority = 50;

            // Prefer low HP targets
            if (target.HPPercentage < 0.25f)
                basePriority += 30;
            else if (target.HPPercentage < 0.5f)
                basePriority += 15;

            // Prefer players
            if (target.IsPlayer)
                basePriority += 20;

            // Prefer high threat targets
            float threat = CalculateThreatLevel(target);
            basePriority += Mathf.FloorToInt(threat * 10);

            return basePriority;
        }

        #endregion
    }

    /// <summary>
    /// MonoBehaviour wrapper for AI turn processing.
    /// Handles timing and coroutines for AI actions.
    /// </summary>
    public class CombatAIController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private CombatManager _combatManager;

        [Header("Timing")]
        [SerializeField] private float _thinkingDelay = 0.5f;
        [SerializeField] private float _actionDelay = 0.5f;

        private void OnEnable()
        {
            if (_combatManager != null)
            {
                _combatManager.OnPhaseChanged.AddListener(OnPhaseChanged);
            }
        }

        private void OnDisable()
        {
            if (_combatManager != null)
            {
                _combatManager.OnPhaseChanged.RemoveListener(OnPhaseChanged);
            }
        }

        private void OnPhaseChanged(CombatPhase phase)
        {
            if (phase == CombatPhase.EnemyTurn || phase == CombatPhase.AllyTurn)
            {
                ProcessAITurn();
            }
        }

        /// <summary>
        /// Process the current AI combatant's turn.
        /// </summary>
        public void ProcessAITurn()
        {
            StartCoroutine(ProcessAITurnCoroutine());
        }

        private System.Collections.IEnumerator ProcessAITurnCoroutine()
        {
            var currentCombatant = _combatManager.GetCurrentCombatant();
            if (currentCombatant == null || currentCombatant.IsPlayer)
            {
                yield break;
            }

            // Thinking delay
            yield return new WaitForSeconds(_thinkingDelay);

            // Get AI decision
            var action = CombatAI.GetAIAction(_combatManager, currentCombatant.Id);
            if (action == null)
            {
                _combatManager.AdvanceTurn();
                yield break;
            }

            // Execute action
            _combatManager.ExecuteAction(action);

            // Action delay
            yield return new WaitForSeconds(_actionDelay);

            // Check if combat is still active and advance turn
            if (_combatManager.IsCombatActive)
            {
                _combatManager.AdvanceTurn();
            }
        }
    }
}
