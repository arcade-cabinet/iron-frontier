using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Combat
{
    /// <summary>
    /// Type of combatant in battle.
    /// </summary>
    public enum CombatantType
    {
        Player,
        Enemy,
        Ally
    }

    /// <summary>
    /// AI behavior type for enemy combatants.
    /// </summary>
    public enum CombatantBehavior
    {
        Aggressive,  // Always attack, prefer low HP targets
        Defensive,   // Defend when low HP, otherwise attack
        Ranged,      // Prefer ranged attacks
        Random,      // Random action selection
        Support      // Prioritize helping allies
    }

    /// <summary>
    /// Combat statistics for a combatant.
    /// </summary>
    [Serializable]
    public class CombatStats
    {
        [Header("Health")]
        public int HP = 100;
        public int MaxHP = 100;

        [Header("Offense")]
        public int Attack = 10;
        public int Accuracy = 75;
        public int CritChance = 10;
        public float CritMultiplier = 1.5f;

        [Header("Defense")]
        public int Defense = 5;
        public int Evasion = 10;

        [Header("Speed")]
        public int Speed = 10;

        /// <summary>
        /// Create a copy of these stats.
        /// </summary>
        public CombatStats Clone()
        {
            return new CombatStats
            {
                HP = HP,
                MaxHP = MaxHP,
                Attack = Attack,
                Accuracy = Accuracy,
                CritChance = CritChance,
                CritMultiplier = CritMultiplier,
                Defense = Defense,
                Evasion = Evasion,
                Speed = Speed
            };
        }

        /// <summary>
        /// Default combat stats for a level 1 player.
        /// </summary>
        public static CombatStats DefaultPlayerStats => new CombatStats
        {
            HP = 100,
            MaxHP = 100,
            Attack = 10,
            Defense = 5,
            Speed = 10,
            Accuracy = 75,
            Evasion = 10,
            CritChance = 10,
            CritMultiplier = 1.5f
        };
    }

    /// <summary>
    /// Base combatant class for all participants in combat (player, enemies, allies).
    /// Uses ScriptableObject for data-driven enemy definitions.
    /// </summary>
    [CreateAssetMenu(fileName = "NewCombatant", menuName = "Iron Frontier/Combat/Combatant")]
    public class Combatant : ScriptableObject
    {
        #region Serialized Fields

        [Header("Identity")]
        [SerializeField] private string _id;
        [SerializeField] private string _definitionId;
        [SerializeField] private string _displayName;
        [SerializeField] private CombatantType _type = CombatantType.Enemy;

        [Header("Stats")]
        [SerializeField] private CombatStats _stats;

        [Header("Equipment")]
        [SerializeField] private string _weaponId;
        [SerializeField] private int _ammoInClip = 6;

        [Header("AI Behavior")]
        [SerializeField] private CombatantBehavior _behavior = CombatantBehavior.Aggressive;

        [Header("Visual")]
        [SerializeField] private string _spriteId;

        [Header("Rewards")]
        [SerializeField] private int _xpReward = 10;
        [SerializeField] private int _goldReward = 5;
        [SerializeField] private string _lootTableId;

        [Header("Grid Position")]
        [SerializeField] private Vector2Int _position;

        #endregion

        #region Runtime State

        private List<StatusEffect> _statusEffects = new();
        private bool _isAlive = true;
        private bool _hasActedThisTurn;

        #endregion

        #region Properties

        /// <summary>Unique identifier for this combatant instance.</summary>
        public string Id => _id;

        /// <summary>Reference to the definition (enemy ID, 'player', or ally ID).</summary>
        public string DefinitionId => _definitionId;

        /// <summary>Display name shown in UI.</summary>
        public string DisplayName => _displayName;

        /// <summary>Type of combatant.</summary>
        public CombatantType Type => _type;

        /// <summary>Is this the player character?</summary>
        public bool IsPlayer => _type == CombatantType.Player;

        /// <summary>Combat statistics.</summary>
        public CombatStats Stats => _stats;

        /// <summary>Current active status effects.</summary>
        public IReadOnlyList<StatusEffect> StatusEffects => _statusEffects;

        /// <summary>Position on combat grid.</summary>
        public Vector2Int Position
        {
            get => _position;
            set => _position = value;
        }

        /// <summary>Currently equipped weapon ID.</summary>
        public string WeaponId => _weaponId;

        /// <summary>Remaining ammo in clip (for ranged weapons).</summary>
        public int AmmoInClip
        {
            get => _ammoInClip;
            set => _ammoInClip = value;
        }

        /// <summary>Is this combatant alive?</summary>
        public bool IsAlive => _isAlive;

        /// <summary>Has this combatant acted this turn?</summary>
        public bool HasActedThisTurn => _hasActedThisTurn;

        /// <summary>AI behavior type (for enemies).</summary>
        public CombatantBehavior Behavior => _behavior;

        /// <summary>Sprite/model ID for rendering.</summary>
        public string SpriteId => _spriteId;

        /// <summary>XP reward when defeated.</summary>
        public int XPReward => _xpReward;

        /// <summary>Gold reward when defeated.</summary>
        public int GoldReward => _goldReward;

        /// <summary>Loot table ID for drops.</summary>
        public string LootTableId => _lootTableId;

        /// <summary>HP as a percentage (0-1).</summary>
        public float HPPercentage => _stats.MaxHP > 0 ? (float)_stats.HP / _stats.MaxHP : 0f;

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the combatant at runtime.
        /// </summary>
        public void Initialize(
            string id,
            string definitionId,
            string displayName,
            CombatantType type,
            CombatStats stats,
            string weaponId = null,
            CombatantBehavior behavior = CombatantBehavior.Aggressive,
            int xpReward = 0,
            int goldReward = 0)
        {
            _id = id;
            _definitionId = definitionId;
            _displayName = displayName;
            _type = type;
            _stats = stats.Clone();
            _weaponId = weaponId;
            _behavior = behavior;
            _xpReward = xpReward;
            _goldReward = goldReward;

            _statusEffects = new List<StatusEffect>();
            _isAlive = true;
            _hasActedThisTurn = false;
        }

        /// <summary>
        /// Create a combatant instance from a definition ScriptableObject.
        /// </summary>
        public static Combatant CreateFromDefinition(Combatant definition, int index = 0)
        {
            var instance = CreateInstance<Combatant>();

            string suffix = index > 0 ? $" {(char)('A' + index)}" : "";

            instance.Initialize(
                id: $"{definition.DefinitionId}_{index}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                definitionId: definition.DefinitionId,
                displayName: $"{definition.DisplayName}{suffix}",
                type: definition.Type,
                stats: definition.Stats,
                weaponId: definition.WeaponId,
                behavior: definition.Behavior,
                xpReward: definition.XPReward,
                goldReward: definition.GoldReward
            );

            instance._spriteId = definition.SpriteId;
            instance._lootTableId = definition.LootTableId;
            instance._position = new Vector2Int(1 + index, 0);

            return instance;
        }

        #endregion

        #region Combat Actions

        /// <summary>
        /// Apply damage to this combatant.
        /// </summary>
        /// <param name="damage">Amount of damage to apply.</param>
        /// <returns>Actual damage dealt after any reductions.</returns>
        public int TakeDamage(int damage)
        {
            if (!_isAlive)
                return 0;

            int actualDamage = Mathf.Min(damage, _stats.HP);
            _stats.HP -= actualDamage;

            if (_stats.HP <= 0)
            {
                _stats.HP = 0;
                _isAlive = false;
            }

            return actualDamage;
        }

        /// <summary>
        /// Heal this combatant.
        /// </summary>
        /// <param name="amount">Amount to heal.</param>
        /// <returns>Actual amount healed.</returns>
        public int Heal(int amount)
        {
            if (!_isAlive)
                return 0;

            int maxHeal = _stats.MaxHP - _stats.HP;
            int actualHeal = Mathf.Min(amount, maxHeal);
            _stats.HP += actualHeal;

            return actualHeal;
        }

        /// <summary>
        /// Mark this combatant as having acted this turn.
        /// </summary>
        public void MarkActed()
        {
            _hasActedThisTurn = true;
        }

        /// <summary>
        /// Reset turn-based state (call at start of combatant's turn).
        /// </summary>
        public void ResetTurn()
        {
            _hasActedThisTurn = false;
        }

        #endregion

        #region Status Effects

        /// <summary>
        /// Apply a status effect to this combatant.
        /// </summary>
        public void ApplyStatusEffect(StatusEffect effect)
        {
            // Check for stacking rules
            var existing = _statusEffects.FirstOrDefault(e => e.Type == effect.Type);
            if (existing != null)
            {
                // Refresh duration or stack value based on effect type
                if (effect.Type == StatusEffectType.Defending)
                {
                    existing.TurnsRemaining = Mathf.Max(existing.TurnsRemaining, effect.TurnsRemaining);
                }
                else
                {
                    // Stack damage effects, refresh duration
                    existing.Value += effect.Value;
                    existing.TurnsRemaining = Mathf.Max(existing.TurnsRemaining, effect.TurnsRemaining);
                }
            }
            else
            {
                _statusEffects.Add(effect.Clone());
            }
        }

        /// <summary>
        /// Remove a specific status effect.
        /// </summary>
        public void RemoveStatusEffect(StatusEffectType type)
        {
            _statusEffects.RemoveAll(e => e.Type == type);
        }

        /// <summary>
        /// Check if the combatant has a specific status effect.
        /// </summary>
        public bool HasStatusEffect(StatusEffectType type)
        {
            return _statusEffects.Any(e => e.Type == type);
        }

        /// <summary>
        /// Get a specific status effect if present.
        /// </summary>
        public StatusEffect GetStatusEffect(StatusEffectType type)
        {
            return _statusEffects.FirstOrDefault(e => e.Type == type);
        }

        /// <summary>
        /// Process status effects at the start of turn/round.
        /// Returns damage results from DoT effects.
        /// </summary>
        public List<CombatResult> ProcessStatusEffects()
        {
            var results = new List<CombatResult>();
            var effectsToRemove = new List<StatusEffect>();

            foreach (var effect in _statusEffects)
            {
                // Apply DoT effects
                if (effect.IsDamageOverTime)
                {
                    int damage = DamageCalculator.CalculateStatusEffectDamage(effect, _stats.MaxHP);
                    TakeDamage(damage);

                    results.Add(new CombatResult
                    {
                        Action = new CombatAction
                        {
                            Type = CombatActionType.Attack,
                            ActorId = "status_effect"
                        },
                        Success = true,
                        Damage = damage,
                        TargetKilled = !_isAlive,
                        Message = $"{_displayName} takes {damage} damage from {effect.Type}!",
                        Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                    });
                }

                // Decrement duration
                effect.TurnsRemaining--;
                if (effect.TurnsRemaining <= 0)
                {
                    effectsToRemove.Add(effect);
                }
            }

            // Remove expired effects
            foreach (var effect in effectsToRemove)
            {
                _statusEffects.Remove(effect);
            }

            return results;
        }

        /// <summary>
        /// Clear all status effects.
        /// </summary>
        public void ClearAllStatusEffects()
        {
            _statusEffects.Clear();
        }

        #endregion

        #region Stats with Modifiers

        /// <summary>
        /// Get effective stats after applying status effect modifiers.
        /// </summary>
        public CombatStats GetEffectiveStats()
        {
            var effective = _stats.Clone();

            foreach (var effect in _statusEffects)
            {
                switch (effect.Type)
                {
                    case StatusEffectType.Buffed:
                        // Buff increases attack and defense by value percentage
                        effective.Attack = Mathf.FloorToInt(effective.Attack * (1f + effect.Value / 100f));
                        effective.Defense = Mathf.FloorToInt(effective.Defense * (1f + effect.Value / 100f));
                        break;

                    case StatusEffectType.Debuffed:
                        // Debuff decreases attack and accuracy
                        effective.Attack = Mathf.FloorToInt(effective.Attack * (1f - effect.Value / 100f));
                        effective.Accuracy = Mathf.FloorToInt(effective.Accuracy * (1f - effect.Value / 100f));
                        break;

                    case StatusEffectType.Stunned:
                        // Stunned reduces speed to 0
                        effective.Speed = 0;
                        break;

                    case StatusEffectType.Defending:
                        // Defending increases defense temporarily
                        effective.Defense = Mathf.FloorToInt(effective.Defense * 1.5f);
                        break;
                }
            }

            return effective;
        }

        #endregion

        #region AI Utilities

        /// <summary>
        /// Evaluate the combat situation from this combatant's perspective.
        /// </summary>
        public CombatSituation EvaluateSituation(List<Combatant> allCombatants)
        {
            var situation = new CombatSituation();

            // Determine allies and enemies from this combatant's perspective
            if (_type == CombatantType.Enemy)
            {
                situation.Allies = allCombatants
                    .Where(c => c.Type == CombatantType.Enemy && c.IsAlive && c.Id != _id)
                    .ToList();
                situation.Enemies = allCombatants
                    .Where(c => (c.IsPlayer || c.Type == CombatantType.Ally) && c.IsAlive)
                    .ToList();
            }
            else
            {
                situation.Allies = allCombatants
                    .Where(c => (c.IsPlayer || c.Type == CombatantType.Ally) && c.IsAlive && c.Id != _id)
                    .ToList();
                situation.Enemies = allCombatants
                    .Where(c => c.Type == CombatantType.Enemy && c.IsAlive)
                    .ToList();
            }

            situation.HPPercentage = HPPercentage;
            situation.AverageEnemyHP = situation.Enemies.Count > 0
                ? situation.Enemies.Average(e => e.HPPercentage)
                : 1f;

            // Determine if winning
            bool allyAdvantage = situation.Allies.Count + 1 > situation.Enemies.Count;
            bool hpAdvantage = situation.HPPercentage > situation.AverageEnemyHP;
            situation.IsWinning = allyAdvantage || hpAdvantage;

            return situation;
        }

        #endregion

        #region Utility

        /// <summary>
        /// Reset combatant to initial state (for reuse).
        /// </summary>
        public void Reset()
        {
            _stats.HP = _stats.MaxHP;
            _statusEffects.Clear();
            _isAlive = true;
            _hasActedThisTurn = false;
        }

        public override string ToString()
        {
            return $"{_displayName} ({_type}) HP: {_stats.HP}/{_stats.MaxHP}";
        }

        #endregion
    }

    /// <summary>
    /// Combat situation evaluation for AI decision making.
    /// </summary>
    public class CombatSituation
    {
        public bool IsWinning;
        public List<Combatant> Allies = new();
        public List<Combatant> Enemies = new();
        public float HPPercentage;
        public float AverageEnemyHP;
    }
}
