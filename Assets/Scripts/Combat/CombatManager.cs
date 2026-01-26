using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Events;
using IronFrontier.Data;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Combat phase states representing the turn-based combat flow.
    /// </summary>
    public enum CombatPhase
    {
        Initializing,
        PlayerTurn,
        EnemyTurn,
        AllyTurn,
        Processing,
        Victory,
        Defeat,
        Fled
    }

    /// <summary>
    /// Rewards earned from winning combat.
    /// </summary>
    [Serializable]
    public class CombatRewards
    {
        public int XP;
        public int Gold;
        public List<ItemDrop> Loot = new();

        [Serializable]
        public class ItemDrop
        {
            public string ItemId;
            public int Quantity;
        }
    }

    /// <summary>
    /// Context for initializing combat.
    /// </summary>
    [Serializable]
    public class CombatInitContext
    {
        public string EncounterId;
        public CombatStats PlayerStats;
        public string PlayerName;
        public string PlayerWeaponId;
        public float PlayerFatigue;
        public List<Combatant> Allies;
    }

    /// <summary>
    /// Result of a combat action execution.
    /// </summary>
    [Serializable]
    public class CombatResult
    {
        public CombatAction Action;
        public bool Success;
        public int Damage;
        public bool IsCritical;
        public bool WasDodged;
        public bool WasBlocked;
        public StatusEffect StatusEffectApplied;
        public int HealAmount;
        public bool TargetKilled;
        public bool FleeSuccess;
        public string Message;
        public long Timestamp;

        public static CombatResult Failure(CombatAction action, string message)
        {
            return new CombatResult
            {
                Action = action,
                Success = false,
                Message = message,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }
    }

    /// <summary>
    /// Turn-based combat orchestration using state machine pattern.
    /// Manages combat flow, turn order, and coordinates actions between combatants.
    /// </summary>
    public class CombatManager : MonoBehaviour
    {
        #region Constants

        /// <summary>Maximum combat log entries to keep.</summary>
        public const int MaxLogEntries = 50;

        /// <summary>Base flee chance (modified by speed comparison).</summary>
        public const float BaseFleeChance = 40f;

        /// <summary>Flee chance bonus per speed point difference.</summary>
        public const float FleeSpeedBonus = 2f;

        #endregion

        #region Events

        /// <summary>Fired when combat state changes phase.</summary>
        public UnityEvent<CombatPhase> OnPhaseChanged;

        /// <summary>Fired when a combat action is executed.</summary>
        public UnityEvent<CombatResult> OnActionExecuted;

        /// <summary>Fired when a combatant takes damage.</summary>
        public UnityEvent<Combatant, int> OnCombatantDamaged;

        /// <summary>Fired when a combatant is defeated.</summary>
        public UnityEvent<Combatant> OnCombatantDefeated;

        /// <summary>Fired when turn order changes.</summary>
        public UnityEvent<List<string>> OnTurnOrderChanged;

        /// <summary>Fired when combat ends with a result.</summary>
        public UnityEvent<CombatPhase, CombatRewards> OnCombatEnded;

        /// <summary>Fired when combat log is updated.</summary>
        public UnityEvent<CombatResult> OnLogUpdated;

        #endregion

        #region State

        [Header("Combat State")]
        [SerializeField] private string _combatId;
        [SerializeField] private string _encounterId;
        [SerializeField] private CombatPhase _phase = CombatPhase.Initializing;
        [SerializeField] private int _round = 1;
        [SerializeField] private int _currentTurnIndex;
        [SerializeField] private bool _canFlee = true;
        [SerializeField] private bool _isBoss;

        [Header("Managers")]
        [SerializeField] private SkillManager _skillManager;

        private List<Combatant> _combatants = new();
        private List<string> _turnOrder = new();
        private List<CombatResult> _combatLog = new();
        private CombatActionType? _selectedAction;
        private string _selectedTargetId;
        private string _selectedSkillId;
        private long _startedAt;

        #endregion

        #region Properties

        /// <summary>Unique identifier for this combat instance.</summary>
        public string CombatId => _combatId;

        /// <summary>Reference to the encounter definition.</summary>
        public string EncounterId => _encounterId;

        /// <summary>Current phase of combat.</summary>
        public CombatPhase Phase => _phase;

        /// <summary>Current round number (starts at 1).</summary>
        public int Round => _round;

        /// <summary>All combatants in this fight.</summary>
        public IReadOnlyList<Combatant> Combatants => _combatants;

        /// <summary>Turn order (combatant IDs sorted by speed).</summary>
        public IReadOnlyList<string> TurnOrder => _turnOrder;

        /// <summary>Combat log (last N results).</summary>
        public IReadOnlyList<CombatResult> CombatLog => _combatLog;

        /// <summary>Can the player flee from this combat?</summary>
        public bool CanFlee => _canFlee;

        /// <summary>Is this a boss fight?</summary>
        public bool IsBoss => _isBoss;

        /// <summary>Currently selected action type.</summary>
        public CombatActionType? SelectedAction => _selectedAction;

        /// <summary>Currently selected target ID.</summary>
        public string SelectedTargetId => _selectedTargetId;

        /// <summary>Currently selected skill ID.</summary>
        public string SelectedSkillId => _selectedSkillId;

        /// <summary>Reference to the skill manager.</summary>
        public SkillManager SkillManager => _skillManager;

        /// <summary>Is combat currently active?</summary>
        public bool IsCombatActive => _phase != CombatPhase.Victory &&
                                       _phase != CombatPhase.Defeat &&
                                       _phase != CombatPhase.Fled &&
                                       _phase != CombatPhase.Initializing;

        /// <summary>Is it currently the player's turn?</summary>
        public bool IsPlayerTurn => _phase == CombatPhase.PlayerTurn;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            OnPhaseChanged ??= new UnityEvent<CombatPhase>();
            OnActionExecuted ??= new UnityEvent<CombatResult>();
            OnCombatantDamaged ??= new UnityEvent<Combatant, int>();
            OnCombatantDefeated ??= new UnityEvent<Combatant>();
            OnTurnOrderChanged ??= new UnityEvent<List<string>>();
            OnCombatEnded ??= new UnityEvent<CombatPhase, CombatRewards>();
            OnLogUpdated ??= new UnityEvent<CombatResult>();

            // Auto-find SkillManager if not assigned
            if (_skillManager == null)
            {
                _skillManager = GetComponent<SkillManager>();
                if (_skillManager == null)
                {
                    _skillManager = gameObject.AddComponent<SkillManager>();
                }
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize combat with the given context and enemy definitions.
        /// </summary>
        /// <param name="context">Combat initialization context.</param>
        /// <param name="enemies">Enemy combatant definitions to spawn.</param>
        /// <param name="canFlee">Whether the player can flee from this combat.</param>
        /// <param name="isBoss">Whether this is a boss fight.</param>
        public void InitializeCombat(
            CombatInitContext context,
            List<Combatant> enemies,
            bool canFlee = true,
            bool isBoss = false)
        {
            _combatId = $"combat_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            _encounterId = context.EncounterId;
            _canFlee = canFlee;
            _isBoss = isBoss;
            _round = 1;
            _currentTurnIndex = 0;
            _startedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            _combatLog.Clear();
            _selectedAction = null;
            _selectedTargetId = null;

            // Initialize combatants list
            _combatants.Clear();

            // Add player combatant
            var player = CreatePlayerCombatant(
                context.PlayerName,
                context.PlayerStats,
                context.PlayerWeaponId
            );
            _combatants.Add(player);

            // Add allies if any
            if (context.Allies != null)
            {
                _combatants.AddRange(context.Allies);
            }

            // Add enemies
            _combatants.AddRange(enemies);

            // Calculate initial turn order
            CalculateTurnOrder();

            // Initialize skills for all combatants
            if (_skillManager != null)
            {
                _skillManager.ResetCombatState();
                foreach (var combatant in _combatants)
                {
                    _skillManager.UnlockDefaultSkills(combatant.Id, 1);
                }
            }

            // Set initial phase based on first combatant
            var firstCombatant = GetCombatantById(_turnOrder[0]);
            SetPhase(firstCombatant?.IsPlayer == true ? CombatPhase.PlayerTurn : CombatPhase.EnemyTurn);

            Debug.Log($"[CombatManager] Combat initialized: {_combatId} with {_combatants.Count} combatants");
        }

        /// <summary>
        /// Create a player combatant from stats.
        /// </summary>
        private Combatant CreatePlayerCombatant(string name, CombatStats stats, string weaponId)
        {
            var combatant = ScriptableObject.CreateInstance<Combatant>();
            combatant.Initialize(
                id: "player",
                definitionId: "player",
                displayName: name,
                type: CombatantType.Player,
                stats: stats,
                weaponId: weaponId
            );
            return combatant;
        }

        /// <summary>
        /// Calculate turn order based on combatant speed stats.
        /// Higher speed goes first.
        /// </summary>
        public void CalculateTurnOrder()
        {
            _turnOrder = _combatants
                .Where(c => c.IsAlive)
                .OrderByDescending(c =>
                {
                    var effectiveStats = c.GetEffectiveStats();
                    return effectiveStats.Speed;
                })
                .ThenByDescending(c => c.IsPlayer) // Player wins ties
                .Select(c => c.Id)
                .ToList();

            OnTurnOrderChanged?.Invoke(_turnOrder.ToList());
        }

        #endregion

        #region Turn Management

        /// <summary>
        /// Get the current active combatant.
        /// </summary>
        public Combatant GetCurrentCombatant()
        {
            if (_turnOrder.Count == 0 || _currentTurnIndex >= _turnOrder.Count)
                return null;

            return GetCombatantById(_turnOrder[_currentTurnIndex]);
        }

        /// <summary>
        /// Get a combatant by their ID.
        /// </summary>
        public Combatant GetCombatantById(string id)
        {
            return _combatants.FirstOrDefault(c => c.Id == id);
        }

        /// <summary>
        /// Get the player combatant.
        /// </summary>
        public Combatant GetPlayer()
        {
            return _combatants.FirstOrDefault(c => c.IsPlayer);
        }

        /// <summary>
        /// Get all living enemies.
        /// </summary>
        public List<Combatant> GetLivingEnemies()
        {
            return _combatants.Where(c => c.Type == CombatantType.Enemy && c.IsAlive).ToList();
        }

        /// <summary>
        /// Get all living allies (including player).
        /// </summary>
        public List<Combatant> GetLivingAllies()
        {
            return _combatants.Where(c =>
                (c.IsPlayer || c.Type == CombatantType.Ally) && c.IsAlive).ToList();
        }

        /// <summary>
        /// Advance to the next turn.
        /// </summary>
        public void AdvanceTurn()
        {
            if (!IsCombatActive)
                return;

            // Find next alive combatant
            int nextIndex = (_currentTurnIndex + 1) % _turnOrder.Count;
            int loopCount = 0;

            while (loopCount < _turnOrder.Count)
            {
                var combatant = GetCombatantById(_turnOrder[nextIndex]);
                if (combatant != null && combatant.IsAlive)
                    break;

                nextIndex = (nextIndex + 1) % _turnOrder.Count;
                loopCount++;
            }

            // Check if we wrapped around (new round)
            if (nextIndex <= _currentTurnIndex || loopCount >= _turnOrder.Count)
            {
                StartNewRound();
            }

            _currentTurnIndex = nextIndex;

            // Reset hasActed for the new combatant
            var currentCombatant = GetCurrentCombatant();
            if (currentCombatant != null)
            {
                currentCombatant.ResetTurn();

                // Determine new phase
                if (currentCombatant.IsPlayer)
                    SetPhase(CombatPhase.PlayerTurn);
                else if (currentCombatant.Type == CombatantType.Ally)
                    SetPhase(CombatPhase.AllyTurn);
                else
                    SetPhase(CombatPhase.EnemyTurn);
            }

            // Process end-of-turn for skill manager
            if (currentCombatant != null)
            {
                _skillManager?.ProcessTurnEnd(currentCombatant.Id);
            }

            // Clear selections
            _selectedAction = null;
            _selectedTargetId = null;
            _selectedSkillId = null;
        }

        /// <summary>
        /// Start a new round (recalculate turn order, apply start-of-round effects).
        /// </summary>
        private void StartNewRound()
        {
            _round++;

            // Recalculate turn order
            CalculateTurnOrder();

            // Apply status effects at start of round
            ApplyStatusEffectsToAll();

            // Check for combat end after status effects
            CheckCombatEnd();

            Debug.Log($"[CombatManager] Round {_round} started");
        }

        /// <summary>
        /// Apply status effects to all combatants.
        /// </summary>
        private void ApplyStatusEffectsToAll()
        {
            foreach (var combatant in _combatants.Where(c => c.IsAlive))
            {
                var results = combatant.ProcessStatusEffects();
                foreach (var result in results)
                {
                    AddToLog(result);
                    OnActionExecuted?.Invoke(result);

                    if (result.TargetKilled)
                    {
                        OnCombatantDefeated?.Invoke(combatant);
                    }
                }
            }
        }

        #endregion

        #region Action Selection

        /// <summary>
        /// Select an action for the current turn.
        /// </summary>
        public void SelectAction(CombatActionType actionType)
        {
            if (!IsPlayerTurn)
            {
                Debug.LogWarning("[CombatManager] Cannot select action when not player turn");
                return;
            }

            _selectedAction = actionType;
        }

        /// <summary>
        /// Select a target for the current action.
        /// </summary>
        public void SelectTarget(string targetId)
        {
            if (!IsPlayerTurn)
            {
                Debug.LogWarning("[CombatManager] Cannot select target when not player turn");
                return;
            }

            _selectedTargetId = targetId;
        }

        /// <summary>
        /// Select a skill for the current action.
        /// </summary>
        public void SelectSkill(string skillId)
        {
            if (!IsPlayerTurn)
            {
                Debug.LogWarning("[CombatManager] Cannot select skill when not player turn");
                return;
            }

            _selectedSkillId = skillId;
            _selectedAction = CombatActionType.Skill;
        }

        /// <summary>
        /// Get valid targets for a specific skill.
        /// </summary>
        public List<Combatant> GetValidSkillTargets(string skillId)
        {
            var actor = GetCurrentCombatant();
            if (actor == null || _skillManager == null)
                return new List<Combatant>();

            var skill = _skillManager.GetSkill(skillId);
            if (skill == null)
                return new List<Combatant>();

            return SkillTargeting.GetValidTargets(skill, actor, _combatants);
        }

        /// <summary>
        /// Get all usable skills for the current combatant.
        /// </summary>
        public List<SkillData> GetUsableSkills()
        {
            var actor = GetCurrentCombatant();
            if (actor == null || _skillManager == null)
                return new List<SkillData>();

            return _skillManager.GetUsableSkills(actor.Id);
        }

        /// <summary>
        /// Get valid targets for the current combatant.
        /// </summary>
        public List<Combatant> GetValidTargets()
        {
            var actor = GetCurrentCombatant();
            if (actor == null)
                return new List<Combatant>();

            return GetValidTargetsFor(actor);
        }

        /// <summary>
        /// Get valid targets for a specific combatant.
        /// </summary>
        public List<Combatant> GetValidTargetsFor(Combatant actor)
        {
            if (actor.Type == CombatantType.Enemy)
            {
                return _combatants.Where(c =>
                    (c.IsPlayer || c.Type == CombatantType.Ally) && c.IsAlive).ToList();
            }

            return _combatants.Where(c =>
                c.Type == CombatantType.Enemy && c.IsAlive).ToList();
        }

        #endregion

        #region Action Execution

        /// <summary>
        /// Execute the currently selected action.
        /// </summary>
        public CombatResult ExecuteAction()
        {
            if (!_selectedAction.HasValue)
            {
                Debug.LogWarning("[CombatManager] No action selected");
                return null;
            }

            var actor = GetCurrentCombatant();
            if (actor == null || !actor.IsAlive)
            {
                Debug.LogWarning("[CombatManager] Invalid actor for action");
                return null;
            }

            var action = new CombatAction
            {
                Type = _selectedAction.Value,
                ActorId = actor.Id,
                TargetId = _selectedTargetId
            };

            return ExecuteAction(action);
        }

        /// <summary>
        /// Execute a specific combat action.
        /// </summary>
        public CombatResult ExecuteAction(CombatAction action)
        {
            var actor = GetCombatantById(action.ActorId);
            if (actor == null || !actor.IsAlive)
            {
                return CombatResult.Failure(action, "Actor is not available");
            }

            // Validate action
            var validation = ValidateAction(action, actor);
            if (!validation.IsValid)
            {
                Debug.LogWarning($"[CombatManager] Invalid action: {validation.Reason}");
                return CombatResult.Failure(action, validation.Reason);
            }

            SetPhase(CombatPhase.Processing);

            CombatResult result = action.Type switch
            {
                CombatActionType.Attack => ProcessAttack(action, actor),
                CombatActionType.Defend => ProcessDefend(action, actor),
                CombatActionType.Item => ProcessItem(action, actor),
                CombatActionType.Flee => ProcessFlee(action, actor),
                CombatActionType.Skill => ProcessSkill(action, actor),
                _ => CombatResult.Failure(action, "Unknown action type")
            };

            // Mark actor as having acted
            actor.MarkActed();

            // Add to log
            AddToLog(result);
            OnActionExecuted?.Invoke(result);

            // Check for combat end
            if (CheckCombatEnd())
            {
                return result;
            }

            return result;
        }

        /// <summary>
        /// Validate if an action is valid.
        /// </summary>
        private (bool IsValid, string Reason) ValidateAction(CombatAction action, Combatant actor)
        {
            if (!actor.IsAlive)
                return (false, "Actor is dead");

            if (actor.HasActedThisTurn)
                return (false, "Actor has already acted this turn");

            if (action.Type == CombatActionType.Attack && string.IsNullOrEmpty(action.TargetId))
                return (false, "Attack requires a target");

            if (action.Type == CombatActionType.Item && string.IsNullOrEmpty(action.ItemId))
                return (false, "Item use requires an item");

            if (action.Type == CombatActionType.Flee && !_canFlee)
                return (false, "Cannot flee from this battle");

            // Check if actor is stunned
            if (actor.HasStatusEffect(StatusEffectType.Stunned))
                return (false, "Actor is stunned");

            return (true, null);
        }

        #endregion

        #region Action Processing

        /// <summary>
        /// Process an attack action.
        /// </summary>
        private CombatResult ProcessAttack(CombatAction action, Combatant actor)
        {
            var target = GetCombatantById(action.TargetId);
            if (target == null || !target.IsAlive)
            {
                return CombatResult.Failure(action, "Target is not available");
            }

            var actorStats = actor.GetEffectiveStats();
            var targetStats = target.GetEffectiveStats();

            // Calculate hit chance
            float hitChance = DamageCalculator.CalculateHitChance(actorStats.Accuracy, targetStats.Evasion);
            bool didHit = DamageCalculator.RollHit(hitChance);

            if (!didHit)
            {
                // Miss
                return new CombatResult
                {
                    Action = action,
                    Success = false,
                    WasDodged = true,
                    Message = $"{actor.DisplayName} attacks {target.DisplayName} but misses!",
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
            }

            // Check for critical hit
            bool isCritical = DamageCalculator.RollCritical(actorStats.CritChance);

            // Check if target is defending
            bool isDefending = target.HasStatusEffect(StatusEffectType.Defending);

            // Calculate damage
            var damageInput = new DamageCalculationInput
            {
                AttackPower = actorStats.Attack,
                DefenderDefense = targetStats.Defense,
                IsDefenderDefending = isDefending,
                IsCritical = isCritical,
                CritMultiplier = actorStats.CritMultiplier
            };

            var damageResult = DamageCalculator.CalculateDamage(damageInput);

            // Apply damage
            int newHP = Mathf.Max(0, target.Stats.HP - damageResult.FinalDamage);
            bool targetKilled = newHP == 0;

            target.TakeDamage(damageResult.FinalDamage);
            OnCombatantDamaged?.Invoke(target, damageResult.FinalDamage);

            if (targetKilled)
            {
                OnCombatantDefeated?.Invoke(target);
            }

            // Build result message
            string message = $"{actor.DisplayName} attacks {target.DisplayName}";
            if (isCritical)
                message += " with a CRITICAL HIT";
            message += $" for {damageResult.FinalDamage} damage!";
            if (targetKilled)
                message += $" {target.DisplayName} is defeated!";

            return new CombatResult
            {
                Action = action,
                Success = true,
                Damage = damageResult.FinalDamage,
                IsCritical = isCritical,
                WasBlocked = isDefending,
                TargetKilled = targetKilled,
                Message = message,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }

        /// <summary>
        /// Process a defend action.
        /// </summary>
        private CombatResult ProcessDefend(CombatAction action, Combatant actor)
        {
            // Add defending status effect
            var defendEffect = new StatusEffect
            {
                Type = StatusEffectType.Defending,
                TurnsRemaining = 1,
                Value = 50f // 50% damage reduction
            };

            actor.ApplyStatusEffect(defendEffect);

            return new CombatResult
            {
                Action = action,
                Success = true,
                StatusEffectApplied = defendEffect,
                Message = $"{actor.DisplayName} takes a defensive stance!",
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }

        /// <summary>
        /// Process an item use action.
        /// </summary>
        private CombatResult ProcessItem(CombatAction action, Combatant actor)
        {
            if (string.IsNullOrEmpty(action.ItemId))
            {
                return CombatResult.Failure(action, "No item specified");
            }

            // For now, assume all items are healing potions
            // In a full implementation, this would look up the item effect
            int healAmount = 30;

            int actualHeal = DamageCalculator.CalculateHeal(actor.Stats.HP, actor.Stats.MaxHP, healAmount);
            actor.Heal(actualHeal);

            return new CombatResult
            {
                Action = action,
                Success = true,
                HealAmount = actualHeal,
                Message = $"{actor.DisplayName} uses an item and recovers {actualHeal} HP!",
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }

        /// <summary>
        /// Process a flee action.
        /// </summary>
        private CombatResult ProcessFlee(CombatAction action, Combatant actor)
        {
            if (!_canFlee)
            {
                return CombatResult.Failure(action, "Cannot flee from this battle!");
            }

            var actorStats = actor.GetEffectiveStats();
            var enemies = GetLivingEnemies();

            float avgEnemySpeed = enemies.Count > 0
                ? (float)enemies.Average(e => e.Stats.Speed)
                : actorStats.Speed;

            float speedDiff = actorStats.Speed - avgEnemySpeed;
            float fleeChance = BaseFleeChance + speedDiff * FleeSpeedBonus;
            fleeChance = Mathf.Clamp(fleeChance, 10f, 90f);

            bool fleeSuccess = UnityEngine.Random.value * 100f < fleeChance;

            if (fleeSuccess)
            {
                SetPhase(CombatPhase.Fled);
                OnCombatEnded?.Invoke(CombatPhase.Fled, null);

                return new CombatResult
                {
                    Action = action,
                    Success = true,
                    FleeSuccess = true,
                    Message = $"{actor.DisplayName} successfully escapes!",
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
            }

            return new CombatResult
            {
                Action = action,
                Success = false,
                FleeSuccess = false,
                Message = $"{actor.DisplayName} failed to escape!",
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }

        /// <summary>
        /// Process a skill action using the SkillManager.
        /// </summary>
        private CombatResult ProcessSkill(CombatAction action, Combatant actor)
        {
            if (_skillManager == null)
            {
                return CombatResult.Failure(action, "SkillManager not available");
            }

            // Use selected skill ID if not in action
            if (string.IsNullOrEmpty(action.SkillId) && !string.IsNullOrEmpty(_selectedSkillId))
            {
                action.SkillId = _selectedSkillId;
            }

            if (string.IsNullOrEmpty(action.SkillId))
            {
                return CombatResult.Failure(action, "No skill specified");
            }

            // Process the skill through SkillManager
            var skillResult = _skillManager.ProcessSkill(action, actor, _combatants);

            // Convert SkillResult to CombatResult
            var combatResult = new CombatResult
            {
                Action = action,
                Success = skillResult.Success,
                Damage = skillResult.TotalDamage,
                HealAmount = skillResult.TotalHealing,
                TargetKilled = skillResult.TargetsKilled > 0,
                Message = skillResult.Message,
                Timestamp = skillResult.Timestamp
            };

            // Apply status effects to targets (already done in SkillManager, but track in result)
            if (skillResult.StatusEffectsApplied.Count > 0)
            {
                combatResult.StatusEffectApplied = skillResult.StatusEffectsApplied[0];
            }

            // Fire damage/defeat events for each affected target
            foreach (var target in skillResult.Targets)
            {
                if (skillResult.DamagePerTarget.TryGetValue(target.Id, out var damage) && damage > 0)
                {
                    OnCombatantDamaged?.Invoke(target, damage);
                }

                if (!target.IsAlive)
                {
                    OnCombatantDefeated?.Invoke(target);
                }
            }

            // Break stealth on attack skills
            var skill = _skillManager.GetSkill(action.SkillId);
            if (skill != null && skill.TargetsEnemies && skillResult.TotalDamage > 0)
            {
                _skillManager.BreakStealth(actor.Id);
            }

            return combatResult;
        }

        #endregion

        #region Combat End Detection

        /// <summary>
        /// Check if combat has ended and update state accordingly.
        /// </summary>
        /// <returns>True if combat ended.</returns>
        private bool CheckCombatEnd()
        {
            var player = GetPlayer();
            var enemies = GetLivingEnemies();

            // Check defeat - player dead
            if (player == null || !player.IsAlive)
            {
                SetPhase(CombatPhase.Defeat);
                OnCombatEnded?.Invoke(CombatPhase.Defeat, null);
                return true;
            }

            // Check victory - all enemies dead
            if (enemies.Count == 0)
            {
                var rewards = CalculateRewards();
                SetPhase(CombatPhase.Victory);
                OnCombatEnded?.Invoke(CombatPhase.Victory, rewards);
                return true;
            }

            return false;
        }

        /// <summary>
        /// Calculate rewards from winning combat.
        /// </summary>
        private CombatRewards CalculateRewards()
        {
            var rewards = new CombatRewards();

            foreach (var combatant in _combatants)
            {
                if (combatant.Type == CombatantType.Enemy && !combatant.IsAlive)
                {
                    rewards.XP += combatant.XPReward;
                    rewards.Gold += combatant.GoldReward;
                }
            }

            return rewards;
        }

        /// <summary>
        /// End combat and clean up.
        /// </summary>
        public CombatRewards EndCombat()
        {
            CombatRewards rewards = null;

            if (_phase == CombatPhase.Victory)
            {
                rewards = CalculateRewards();
            }

            // Clean up skill manager state
            _skillManager?.ResetCombatState();

            // Clean up combatants
            foreach (var combatant in _combatants)
            {
                if (!combatant.IsPlayer)
                {
                    Destroy(combatant);
                }
            }

            _combatants.Clear();
            _turnOrder.Clear();
            _combatLog.Clear();
            _selectedSkillId = null;
            _phase = CombatPhase.Initializing;

            return rewards;
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Set the combat phase and fire event.
        /// </summary>
        private void SetPhase(CombatPhase phase)
        {
            if (_phase != phase)
            {
                _phase = phase;
                OnPhaseChanged?.Invoke(phase);
            }
        }

        /// <summary>
        /// Add a result to the combat log.
        /// </summary>
        private void AddToLog(CombatResult result)
        {
            _combatLog.Add(result);
            if (_combatLog.Count > MaxLogEntries)
            {
                _combatLog.RemoveAt(0);
            }

            OnLogUpdated?.Invoke(result);
        }

        /// <summary>
        /// Get the latest log entry.
        /// </summary>
        public CombatResult GetLatestLogEntry()
        {
            return _combatLog.Count > 0 ? _combatLog[^1] : null;
        }

        /// <summary>
        /// Get player HP percentage (0-100).
        /// </summary>
        public float GetPlayerHPPercentage()
        {
            var player = GetPlayer();
            if (player == null)
                return 0f;

            return (float)player.Stats.HP / player.Stats.MaxHP * 100f;
        }

        #endregion
    }
}
