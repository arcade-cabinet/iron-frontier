using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Companions
{
    /// <summary>
    /// AI behavior states.
    /// </summary>
    public enum CompanionBehaviorState
    {
        Idle,
        Following,
        Combat,
        Retreating,
        UsingAbility,
        Healing,
        Protecting
    }

    /// <summary>
    /// Combat action decision.
    /// </summary>
    public struct CombatDecision
    {
        public string abilityId;
        public Vector2Int targetPosition;
        public GameObject targetEntity;
        public int priority;
        public string reason;
    }

    /// <summary>
    /// AI controller for companion combat and follow behavior.
    /// </summary>
    public class CompanionAI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private CompanionData companionData;
        [SerializeField] private Transform playerTransform;

        [Header("Follow Settings")]
        [SerializeField] private float followDistance = 2f;
        [SerializeField] private float maxFollowDistance = 10f;
        [SerializeField] private float moveSpeed = 4f;
        [SerializeField] private float rotationSpeed = 5f;

        [Header("Combat Settings")]
        [SerializeField] private float combatRange = 8f;
        [SerializeField] private float aggroRange = 12f;
        [SerializeField] private float retreatDistance = 3f;

        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;

        /// <summary>Current behavior state.</summary>
        public CompanionBehaviorState CurrentState { get; private set; } = CompanionBehaviorState.Idle;

        /// <summary>Current target entity.</summary>
        public GameObject CurrentTarget { get; private set; }

        /// <summary>Companion state reference.</summary>
        public CompanionState State { get; private set; }

        private CompanionAIConfig aiConfig;
        private List<GameObject> nearbyEnemies = new List<GameObject>();
        private List<GameObject> nearbyAllies = new List<GameObject>();
        private float lastAbilityTime;
        private float decisionCooldown = 0.5f;
        private float lastDecisionTime;

        private void Start()
        {
            if (companionData != null)
            {
                aiConfig = companionData.aiConfig;
                State = CompanionManager.Instance?.GetCompanionState(companionData.id);
            }

            // Find player if not assigned
            if (playerTransform == null)
            {
                var player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                    playerTransform = player.transform;
            }
        }

        private void Update()
        {
            if (companionData == null || State == null || !State.inParty) return;
            if (!State.alive) return;

            // Update nearby entities
            UpdateNearbyEntities();

            // State machine
            switch (CurrentState)
            {
                case CompanionBehaviorState.Idle:
                    UpdateIdleState();
                    break;
                case CompanionBehaviorState.Following:
                    UpdateFollowingState();
                    break;
                case CompanionBehaviorState.Combat:
                    UpdateCombatState();
                    break;
                case CompanionBehaviorState.Retreating:
                    UpdateRetreatingState();
                    break;
                case CompanionBehaviorState.Healing:
                    UpdateHealingState();
                    break;
                case CompanionBehaviorState.Protecting:
                    UpdateProtectingState();
                    break;
            }
        }

        /// <summary>
        /// Updates list of nearby entities.
        /// </summary>
        private void UpdateNearbyEntities()
        {
            nearbyEnemies.Clear();
            nearbyAllies.Clear();

            // Find enemies in range
            var enemies = GameObject.FindGameObjectsWithTag("Enemy");
            foreach (var enemy in enemies)
            {
                float dist = Vector3.Distance(transform.position, enemy.transform.position);
                if (dist <= aggroRange)
                {
                    nearbyEnemies.Add(enemy);
                }
            }

            // Find allies in range
            var allies = GameObject.FindGameObjectsWithTag("Ally");
            foreach (var ally in allies)
            {
                if (ally != gameObject)
                {
                    float dist = Vector3.Distance(transform.position, ally.transform.position);
                    if (dist <= aggroRange)
                    {
                        nearbyAllies.Add(ally);
                    }
                }
            }

            // Add player to allies
            if (playerTransform != null)
            {
                nearbyAllies.Add(playerTransform.gameObject);
            }
        }

        /// <summary>
        /// Updates idle state behavior.
        /// </summary>
        private void UpdateIdleState()
        {
            // Check for enemies
            if (nearbyEnemies.Count > 0)
            {
                TransitionToState(CompanionBehaviorState.Combat);
                return;
            }

            // Check if too far from player
            if (playerTransform != null)
            {
                float distToPlayer = Vector3.Distance(transform.position, playerTransform.position);
                if (distToPlayer > followDistance)
                {
                    TransitionToState(CompanionBehaviorState.Following);
                }
            }
        }

        /// <summary>
        /// Updates following state behavior.
        /// </summary>
        private void UpdateFollowingState()
        {
            if (playerTransform == null)
            {
                TransitionToState(CompanionBehaviorState.Idle);
                return;
            }

            // Check for enemies
            if (nearbyEnemies.Count > 0)
            {
                TransitionToState(CompanionBehaviorState.Combat);
                return;
            }

            float distToPlayer = Vector3.Distance(transform.position, playerTransform.position);

            // If close enough, go idle
            if (distToPlayer <= followDistance)
            {
                TransitionToState(CompanionBehaviorState.Idle);
                return;
            }

            // If too far, teleport
            if (distToPlayer > maxFollowDistance)
            {
                TeleportToPlayer();
                return;
            }

            // Move toward player
            MoveToward(playerTransform.position, followDistance);
        }

        /// <summary>
        /// Updates combat state behavior.
        /// </summary>
        private void UpdateCombatState()
        {
            // Check if combat is over
            if (nearbyEnemies.Count == 0)
            {
                CurrentTarget = null;
                TransitionToState(CompanionBehaviorState.Following);
                return;
            }

            // Check health for retreat
            float healthPercent = (float)State.currentHealth / companionData.stats.maxHealth * 100f;
            if (healthPercent <= aiConfig.retreatThreshold)
            {
                TransitionToState(CompanionBehaviorState.Retreating);
                return;
            }

            // Check if should protect wounded ally
            if (aiConfig.protectsWounded && ShouldProtectAlly(out var woundedAlly))
            {
                CurrentTarget = woundedAlly;
                TransitionToState(CompanionBehaviorState.Protecting);
                return;
            }

            // Decision cooldown
            if (Time.time - lastDecisionTime < decisionCooldown) return;
            lastDecisionTime = Time.time;

            // Make combat decision
            var decision = MakeCombatDecision();
            if (!string.IsNullOrEmpty(decision.abilityId))
            {
                ExecuteAbility(decision);
            }
            else
            {
                // Default: move to preferred range
                MoveToPreferredRange();
            }
        }

        /// <summary>
        /// Updates retreating state behavior.
        /// </summary>
        private void UpdateRetreatingState()
        {
            float healthPercent = (float)State.currentHealth / companionData.stats.maxHealth * 100f;

            // Use consumables if allowed
            if (aiConfig.usesConsumables && healthPercent < 50)
            {
                TryUseHealingConsumable();
            }

            // If health recovered, return to combat
            if (healthPercent > aiConfig.retreatThreshold + 20)
            {
                TransitionToState(CompanionBehaviorState.Combat);
                return;
            }

            // Retreat toward player or away from enemies
            if (playerTransform != null)
            {
                MoveToward(playerTransform.position, retreatDistance);
            }
            else if (nearbyEnemies.Count > 0)
            {
                var nearestEnemy = GetNearestEnemy();
                if (nearestEnemy != null)
                {
                    Vector3 retreatDir = (transform.position - nearestEnemy.transform.position).normalized;
                    MoveToward(transform.position + retreatDir * retreatDistance, 0);
                }
            }
        }

        /// <summary>
        /// Updates healing state behavior.
        /// </summary>
        private void UpdateHealingState()
        {
            // Check if healing is needed
            var woundedAlly = GetMostWoundedAlly();
            if (woundedAlly == null)
            {
                TransitionToState(CompanionBehaviorState.Combat);
                return;
            }

            // Try to use healing ability
            var healAbility = GetBestHealingAbility();
            if (healAbility != null && !State.IsAbilityOnCooldown(healAbility.id))
            {
                // Move into range if needed
                float dist = Vector3.Distance(transform.position, woundedAlly.transform.position);
                if (dist > healAbility.range)
                {
                    MoveToward(woundedAlly.transform.position, healAbility.range);
                }
                else
                {
                    var decision = new CombatDecision
                    {
                        abilityId = healAbility.id,
                        targetEntity = woundedAlly,
                        reason = "Healing ally"
                    };
                    ExecuteAbility(decision);
                }
            }
            else
            {
                // No healing available, return to combat
                TransitionToState(CompanionBehaviorState.Combat);
            }
        }

        /// <summary>
        /// Updates protecting state behavior.
        /// </summary>
        private void UpdateProtectingState()
        {
            if (CurrentTarget == null || !CurrentTarget.activeSelf)
            {
                TransitionToState(CompanionBehaviorState.Combat);
                return;
            }

            // Stay close to target
            float dist = Vector3.Distance(transform.position, CurrentTarget.transform.position);
            if (dist > 2f)
            {
                MoveToward(CurrentTarget.transform.position, 1f);
            }

            // Look for taunt ability
            var tauntAbility = GetAbilityWithTag("taunt");
            if (tauntAbility != null && !State.IsAbilityOnCooldown(tauntAbility.id) && nearbyEnemies.Count > 0)
            {
                var decision = new CombatDecision
                {
                    abilityId = tauntAbility.id,
                    targetEntity = GetNearestEnemy(),
                    reason = "Protecting ally"
                };
                ExecuteAbility(decision);
            }

            // Check if ally is safe
            float allyHealth = GetEntityHealthPercent(CurrentTarget);
            if (allyHealth > 50)
            {
                TransitionToState(CompanionBehaviorState.Combat);
            }
        }

        /// <summary>
        /// Makes a combat decision based on AI config and situation.
        /// </summary>
        private CombatDecision MakeCombatDecision()
        {
            var decisions = new List<CombatDecision>();

            // Evaluate each available ability
            foreach (var ability in companionData.abilities)
            {
                if (!State.unlockedAbilities.Contains(ability.id)) continue;
                if (State.IsAbilityOnCooldown(ability.id)) continue;
                if (ability.apCost > companionData.stats.actionPoints) continue;

                int priority = EvaluateAbility(ability, out var target);
                if (priority > 0)
                {
                    decisions.Add(new CombatDecision
                    {
                        abilityId = ability.id,
                        targetEntity = target,
                        priority = priority,
                        reason = $"Using {ability.name}"
                    });
                }
            }

            // Sort by priority and return best
            if (decisions.Count > 0)
            {
                decisions.Sort((a, b) => b.priority.CompareTo(a.priority));
                return decisions[0];
            }

            return new CombatDecision();
        }

        /// <summary>
        /// Evaluates an ability and returns priority.
        /// </summary>
        private int EvaluateAbility(CompanionAbility ability, out GameObject target)
        {
            target = null;
            int basePriority = aiConfig.abilityPriorities.TryGetValue(ability.id, out int configPriority)
                ? configPriority : 5;

            // Evaluate based on target type
            switch (ability.target)
            {
                case AbilityTarget.Self:
                    target = gameObject;
                    // Check if self buff is useful
                    if (HasEffect(ability, AbilityEffectType.Shield) && State.currentHealth < companionData.stats.maxHealth * 0.5f)
                        return basePriority + 3;
                    if (HasEffect(ability, AbilityEffectType.Buff))
                        return basePriority;
                    break;

                case AbilityTarget.Enemy:
                    target = GetBestEnemyTarget(ability);
                    if (target != null)
                    {
                        // Prioritize execute on low health targets
                        if (HasEffect(ability, AbilityEffectType.Execute) && GetEntityHealthPercent(target) < 30)
                            return basePriority + 5;
                        return basePriority;
                    }
                    break;

                case AbilityTarget.AreaEnemy:
                    if (nearbyEnemies.Count >= 2)
                    {
                        target = GetEnemyCluster();
                        if (target != null)
                            return basePriority + nearbyEnemies.Count;
                    }
                    break;

                case AbilityTarget.Ally:
                    if (HasEffect(ability, AbilityEffectType.Heal))
                    {
                        target = GetMostWoundedAlly();
                        if (target != null && GetEntityHealthPercent(target) < 50)
                            return basePriority + 4;
                    }
                    else if (HasEffect(ability, AbilityEffectType.Buff))
                    {
                        target = playerTransform?.gameObject;
                        if (target != null)
                            return basePriority;
                    }
                    break;

                case AbilityTarget.AllAllies:
                    if (HasEffect(ability, AbilityEffectType.Shield) || HasEffect(ability, AbilityEffectType.Buff))
                    {
                        target = gameObject;
                        return basePriority + 2;
                    }
                    break;
            }

            return 0;
        }

        /// <summary>
        /// Executes a combat decision.
        /// </summary>
        private void ExecuteAbility(CombatDecision decision)
        {
            var ability = companionData.GetAbility(decision.abilityId);
            if (ability == null) return;

            // Set cooldown
            State.SetAbilityCooldown(ability.id, ability.cooldown);
            lastAbilityTime = Time.time;

            if (showDebugInfo)
            {
                Debug.Log($"[CompanionAI] {companionData.DisplayName} using {ability.name}: {decision.reason}");
            }

            // Would trigger actual ability effect here
            // CombatManager.Instance.ExecuteAbility(gameObject, ability, decision.targetEntity);
        }

        /// <summary>
        /// Moves toward a position.
        /// </summary>
        private void MoveToward(Vector3 targetPosition, float stopDistance)
        {
            float dist = Vector3.Distance(transform.position, targetPosition);
            if (dist <= stopDistance) return;

            Vector3 direction = (targetPosition - transform.position).normalized;
            transform.position += direction * moveSpeed * Time.deltaTime;

            // Rotate to face movement direction
            if (direction != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(direction);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
            }
        }

        /// <summary>
        /// Moves to preferred combat range.
        /// </summary>
        private void MoveToPreferredRange()
        {
            var target = CurrentTarget ?? GetNearestEnemy();
            if (target == null) return;

            float dist = Vector3.Distance(transform.position, target.transform.position);
            float preferredDist = aiConfig.preferredRange;

            if (dist < preferredDist - 1)
            {
                // Too close, back up
                Vector3 awayDir = (transform.position - target.transform.position).normalized;
                MoveToward(transform.position + awayDir * 2f, 0);
            }
            else if (dist > preferredDist + 1)
            {
                // Too far, move closer
                MoveToward(target.transform.position, preferredDist);
            }
        }

        /// <summary>
        /// Teleports companion near player.
        /// </summary>
        private void TeleportToPlayer()
        {
            if (playerTransform == null) return;

            Vector3 offset = UnityEngine.Random.insideUnitSphere * followDistance;
            offset.y = 0;
            transform.position = playerTransform.position + offset;

            if (showDebugInfo)
            {
                Debug.Log($"[CompanionAI] {companionData.DisplayName} teleported to player");
            }
        }

        /// <summary>
        /// Transitions to a new state.
        /// </summary>
        private void TransitionToState(CompanionBehaviorState newState)
        {
            if (CurrentState != newState)
            {
                if (showDebugInfo)
                {
                    Debug.Log($"[CompanionAI] {companionData.DisplayName} state: {CurrentState} -> {newState}");
                }
                CurrentState = newState;
            }
        }

        /// <summary>
        /// Gets nearest enemy.
        /// </summary>
        private GameObject GetNearestEnemy()
        {
            GameObject nearest = null;
            float minDist = float.MaxValue;

            foreach (var enemy in nearbyEnemies)
            {
                float dist = Vector3.Distance(transform.position, enemy.transform.position);
                if (dist < minDist)
                {
                    minDist = dist;
                    nearest = enemy;
                }
            }

            return nearest;
        }

        /// <summary>
        /// Gets best enemy target for ability.
        /// </summary>
        private GameObject GetBestEnemyTarget(CompanionAbility ability)
        {
            foreach (var enemy in nearbyEnemies)
            {
                float dist = Vector3.Distance(transform.position, enemy.transform.position);
                if (dist <= ability.range)
                {
                    return enemy;
                }
            }
            return null;
        }

        /// <summary>
        /// Gets enemy cluster center for AoE.
        /// </summary>
        private GameObject GetEnemyCluster()
        {
            // Return enemy with most enemies nearby
            GameObject best = null;
            int maxNearby = 0;

            foreach (var enemy in nearbyEnemies)
            {
                int nearby = 0;
                foreach (var other in nearbyEnemies)
                {
                    if (other != enemy && Vector3.Distance(enemy.transform.position, other.transform.position) < 3f)
                    {
                        nearby++;
                    }
                }
                if (nearby > maxNearby)
                {
                    maxNearby = nearby;
                    best = enemy;
                }
            }

            return best;
        }

        /// <summary>
        /// Gets most wounded ally.
        /// </summary>
        private GameObject GetMostWoundedAlly()
        {
            GameObject mostWounded = null;
            float lowestHealth = 100f;

            foreach (var ally in nearbyAllies)
            {
                float health = GetEntityHealthPercent(ally);
                if (health < lowestHealth && health < 80)
                {
                    lowestHealth = health;
                    mostWounded = ally;
                }
            }

            return mostWounded;
        }

        /// <summary>
        /// Checks if should protect an ally.
        /// </summary>
        private bool ShouldProtectAlly(out GameObject ally)
        {
            ally = null;
            foreach (var a in nearbyAllies)
            {
                float health = GetEntityHealthPercent(a);
                if (health < 30)
                {
                    ally = a;
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Gets entity health percent.
        /// </summary>
        private float GetEntityHealthPercent(GameObject entity)
        {
            // Would check actual health component
            // var health = entity.GetComponent<HealthComponent>();
            // return health != null ? health.HealthPercent : 100f;
            return 100f;
        }

        /// <summary>
        /// Checks if ability has a specific effect type.
        /// </summary>
        private bool HasEffect(CompanionAbility ability, AbilityEffectType type)
        {
            return ability.effects.Any(e => e.type == type);
        }

        /// <summary>
        /// Gets ability with specific tag.
        /// </summary>
        private CompanionAbility GetAbilityWithTag(string tag)
        {
            return companionData.abilities.FirstOrDefault(a =>
                State.unlockedAbilities.Contains(a.id) &&
                a.tags.Contains(tag) &&
                !State.IsAbilityOnCooldown(a.id));
        }

        /// <summary>
        /// Gets best healing ability.
        /// </summary>
        private CompanionAbility GetBestHealingAbility()
        {
            return companionData.abilities
                .Where(a => State.unlockedAbilities.Contains(a.id) &&
                           HasEffect(a, AbilityEffectType.Heal) &&
                           !State.IsAbilityOnCooldown(a.id))
                .OrderByDescending(a => a.effects.FirstOrDefault(e => e.type == AbilityEffectType.Heal).value)
                .FirstOrDefault();
        }

        /// <summary>
        /// Tries to use healing consumable.
        /// </summary>
        private void TryUseHealingConsumable()
        {
            // Would check inventory for healing items
            // InventoryManager.Instance.UseItem("health_potion");
        }

        /// <summary>
        /// Called when combat turn starts.
        /// </summary>
        public void OnTurnStart()
        {
            State?.TickCooldowns();
        }

        /// <summary>
        /// Sets companion data at runtime.
        /// </summary>
        public void SetCompanionData(CompanionData data)
        {
            companionData = data;
            if (data != null)
            {
                aiConfig = data.aiConfig;
                State = CompanionManager.Instance?.GetCompanionState(data.id);
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            if (!showDebugInfo) return;

            // Draw follow distance
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, followDistance);

            // Draw combat range
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, combatRange);

            // Draw aggro range
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, aggroRange);

            // Draw line to current target
            if (CurrentTarget != null)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawLine(transform.position, CurrentTarget.transform.position);
            }

            // Draw line to player
            if (playerTransform != null)
            {
                Gizmos.color = Color.blue;
                Gizmos.DrawLine(transform.position, playerTransform.position);
            }
        }
#endif
    }
}
