// =============================================================================
// PlayerStats.cs - Player Statistics and Progression
// Iron Frontier - Unity 6
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;

namespace IronFrontier.Player
{
    /// <summary>
    /// Types of player stats.
    /// </summary>
    public enum StatType
    {
        Health,
        MaxHealth,
        Stamina,
        MaxStamina,
        Attack,
        Defense,
        Speed,
        Luck,
        Charisma
    }

    /// <summary>
    /// Stat modifier with source tracking for buff management.
    /// </summary>
    [Serializable]
    public class StatModifier
    {
        /// <summary>Unique identifier for this modifier.</summary>
        public string Id { get; set; }

        /// <summary>Source of the modifier (item ID, skill name, etc.).</summary>
        public string Source { get; set; }

        /// <summary>The stat being modified.</summary>
        public StatType Stat { get; set; }

        /// <summary>Flat value added to the stat.</summary>
        public int FlatBonus { get; set; }

        /// <summary>Percentage multiplier (1.0 = 100%).</summary>
        public float Multiplier { get; set; } = 1f;

        /// <summary>Duration in seconds (0 = permanent).</summary>
        public float Duration { get; set; }

        /// <summary>Time when this modifier was applied.</summary>
        public float AppliedAt { get; set; }

        /// <summary>Whether this modifier has expired.</summary>
        public bool IsExpired => Duration > 0f && Time.time - AppliedAt >= Duration;

        /// <summary>Remaining duration in seconds.</summary>
        public float RemainingDuration => Duration > 0f
            ? Mathf.Max(0f, Duration - (Time.time - AppliedAt))
            : float.MaxValue;
    }

    /// <summary>
    /// Event arguments for stat changes.
    /// </summary>
    public class StatChangedEventArgs : EventArgs
    {
        /// <summary>The stat that changed.</summary>
        public StatType Stat { get; }

        /// <summary>Previous value.</summary>
        public int OldValue { get; }

        /// <summary>New value.</summary>
        public int NewValue { get; }

        /// <summary>Change amount (can be negative).</summary>
        public int Delta => NewValue - OldValue;

        public StatChangedEventArgs(StatType stat, int oldValue, int newValue)
        {
            Stat = stat;
            OldValue = oldValue;
            NewValue = newValue;
        }
    }

    /// <summary>
    /// Event arguments for level up.
    /// </summary>
    public class LevelUpEventArgs : EventArgs
    {
        /// <summary>New level.</summary>
        public int NewLevel { get; }

        /// <summary>Previous level.</summary>
        public int OldLevel { get; }

        /// <summary>Stats gained from leveling.</summary>
        public Dictionary<StatType, int> StatsGained { get; }

        public LevelUpEventArgs(int oldLevel, int newLevel, Dictionary<StatType, int> statsGained)
        {
            OldLevel = oldLevel;
            NewLevel = newLevel;
            StatsGained = statsGained;
        }
    }

    /// <summary>
    /// Manages player statistics including health, stamina, XP, level progression,
    /// and stat modifiers from equipment and buffs.
    /// </summary>
    /// <remarks>
    /// Supports save/load through serializable state and integrates with
    /// EventBus for cross-system notifications.
    /// </remarks>
    public class PlayerStats : MonoBehaviour
    {
        #region Singleton

        private static PlayerStats _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static PlayerStats Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<PlayerStats>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[PlayerStats]");
                        _instance = go.AddComponent<PlayerStats>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when any stat changes.</summary>
        public event EventHandler<StatChangedEventArgs> OnStatChanged;

        /// <summary>Fired when player takes damage.</summary>
        public event EventHandler<int> OnDamaged;

        /// <summary>Fired when player is healed.</summary>
        public event EventHandler<int> OnHealed;

        /// <summary>Fired when player dies.</summary>
        public event EventHandler OnDied;

        /// <summary>Fired when player levels up.</summary>
        public event EventHandler<LevelUpEventArgs> OnLevelUp;

        /// <summary>Fired when XP is gained.</summary>
        public event EventHandler<int> OnXPGained;

        /// <summary>Fired when a modifier is added.</summary>
        public event EventHandler<StatModifier> OnModifierAdded;

        /// <summary>Fired when a modifier is removed.</summary>
        public event EventHandler<StatModifier> OnModifierRemoved;

        #endregion

        #region Serialized Fields

        [Header("Base Stats")]
        [SerializeField]
        private int baseMaxHealth = 100;

        [SerializeField]
        private int baseMaxStamina = 50;

        [SerializeField]
        private int baseAttack = 10;

        [SerializeField]
        private int baseDefense = 5;

        [SerializeField]
        private int baseSpeed = 10;

        [SerializeField]
        private int baseLuck = 5;

        [SerializeField]
        private int baseCharisma = 5;

        [Header("Progression")]
        [SerializeField]
        [Tooltip("XP required for level 2")]
        private int baseXPRequired = 100;

        [SerializeField]
        [Tooltip("XP scaling factor per level")]
        private float xpScaleFactor = 1.5f;

        [SerializeField]
        [Tooltip("Maximum level")]
        private int maxLevel = 50;

        [Header("Regeneration")]
        [SerializeField]
        [Tooltip("Health regeneration per second")]
        private float healthRegenRate = 0f;

        [SerializeField]
        [Tooltip("Stamina regeneration per second")]
        private float staminaRegenRate = 5f;

        [SerializeField]
        [Tooltip("Stamina regen delay after use (seconds)")]
        private float staminaRegenDelay = 2f;

        [Header("Level Up Bonuses")]
        [SerializeField]
        private int healthPerLevel = 10;

        [SerializeField]
        private int staminaPerLevel = 5;

        [SerializeField]
        private int attackPerLevel = 2;

        [SerializeField]
        private int defensePerLevel = 1;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Current values
        private int _currentHealth;
        private int _currentStamina;
        private int _currentXP;
        private int _currentLevel = 1;

        // Modifiers
        private readonly List<StatModifier> _modifiers = new List<StatModifier>();

        // Timers
        private float _lastStaminaUse;

        // State
        private bool _isDead = false;
        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>Current health.</summary>
        public int Health => _currentHealth;

        /// <summary>Maximum health (base + level + modifiers).</summary>
        public int MaxHealth => GetModifiedStat(StatType.MaxHealth);

        /// <summary>Health percentage (0-1).</summary>
        public float HealthPercent => MaxHealth > 0 ? (float)_currentHealth / MaxHealth : 0f;

        /// <summary>Current stamina.</summary>
        public int Stamina => _currentStamina;

        /// <summary>Maximum stamina (base + level + modifiers).</summary>
        public int MaxStamina => GetModifiedStat(StatType.MaxStamina);

        /// <summary>Stamina percentage (0-1).</summary>
        public float StaminaPercent => MaxStamina > 0 ? (float)_currentStamina / MaxStamina : 0f;

        /// <summary>Current XP.</summary>
        public int XP => _currentXP;

        /// <summary>XP required for next level.</summary>
        public int XPToNextLevel => CalculateXPForLevel(_currentLevel + 1);

        /// <summary>XP progress toward next level (0-1).</summary>
        public float XPProgress
        {
            get
            {
                int currentLevelXP = _currentLevel > 1 ? CalculateXPForLevel(_currentLevel) : 0;
                int nextLevelXP = XPToNextLevel;
                int xpIntoLevel = _currentXP - currentLevelXP;
                int xpNeeded = nextLevelXP - currentLevelXP;
                return xpNeeded > 0 ? (float)xpIntoLevel / xpNeeded : 1f;
            }
        }

        /// <summary>Current level.</summary>
        public int Level => _currentLevel;

        /// <summary>Attack stat (base + level + modifiers).</summary>
        public int Attack => GetModifiedStat(StatType.Attack);

        /// <summary>Defense stat (base + level + modifiers).</summary>
        public int Defense => GetModifiedStat(StatType.Defense);

        /// <summary>Speed stat (base + modifiers).</summary>
        public int Speed => GetModifiedStat(StatType.Speed);

        /// <summary>Luck stat (base + modifiers).</summary>
        public int Luck => GetModifiedStat(StatType.Luck);

        /// <summary>Charisma stat (base + modifiers).</summary>
        public int Charisma => GetModifiedStat(StatType.Charisma);

        /// <summary>Whether the player is dead.</summary>
        public bool IsDead => _isDead;

        /// <summary>Whether the player is at full health.</summary>
        public bool IsFullHealth => _currentHealth >= MaxHealth;

        /// <summary>Whether the player is at full stamina.</summary>
        public bool IsFullStamina => _currentStamina >= MaxStamina;

        /// <summary>All active modifiers.</summary>
        public IReadOnlyList<StatModifier> Modifiers => _modifiers;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);

            Initialize();
        }

        private void Update()
        {
            if (!_isInitialized || _isDead) return;

            UpdateModifiers();
            UpdateRegeneration();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize stats to default values.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            // Subscribe to EventBus
            if (EventBus.Instance != null)
            {
                EventBus.Instance.Subscribe<int>(GameEvents.PlayerHealed, amount => Heal(amount));
                EventBus.Instance.Subscribe<int>(GameEvents.PlayerDamaged, amount => TakeDamage(amount));
            }

            ResetToDefaults();
            _isInitialized = true;
            Log("PlayerStats initialized");
        }

        /// <summary>
        /// Reset all stats to starting values.
        /// </summary>
        public void ResetToDefaults()
        {
            _currentLevel = 1;
            _currentXP = 0;
            _modifiers.Clear();

            _currentHealth = GetBaseStat(StatType.MaxHealth);
            _currentStamina = GetBaseStat(StatType.MaxStamina);
            _isDead = false;

            Log("Stats reset to defaults");
        }

        #endregion

        #region Stat Calculations

        /// <summary>
        /// Get the base value for a stat (before modifiers).
        /// </summary>
        /// <param name="stat">Stat type.</param>
        /// <returns>Base value including level bonuses.</returns>
        public int GetBaseStat(StatType stat)
        {
            int levelBonus = _currentLevel - 1;

            return stat switch
            {
                StatType.Health => _currentHealth,
                StatType.MaxHealth => baseMaxHealth + (healthPerLevel * levelBonus),
                StatType.Stamina => _currentStamina,
                StatType.MaxStamina => baseMaxStamina + (staminaPerLevel * levelBonus),
                StatType.Attack => baseAttack + (attackPerLevel * levelBonus),
                StatType.Defense => baseDefense + (defensePerLevel * levelBonus),
                StatType.Speed => baseSpeed,
                StatType.Luck => baseLuck,
                StatType.Charisma => baseCharisma,
                _ => 0
            };
        }

        /// <summary>
        /// Get the modified value for a stat (after applying modifiers).
        /// </summary>
        /// <param name="stat">Stat type.</param>
        /// <returns>Modified value.</returns>
        public int GetModifiedStat(StatType stat)
        {
            int baseValue = GetBaseStat(stat);
            int flatBonus = 0;
            float multiplier = 1f;

            foreach (var mod in _modifiers)
            {
                if (mod.Stat == stat && !mod.IsExpired)
                {
                    flatBonus += mod.FlatBonus;
                    multiplier *= mod.Multiplier;
                }
            }

            return Mathf.Max(1, Mathf.RoundToInt((baseValue + flatBonus) * multiplier));
        }

        private int CalculateXPForLevel(int level)
        {
            if (level <= 1) return 0;
            return Mathf.RoundToInt(baseXPRequired * Mathf.Pow(xpScaleFactor, level - 2));
        }

        #endregion

        #region Health

        /// <summary>
        /// Take damage and reduce health.
        /// </summary>
        /// <param name="amount">Raw damage amount.</param>
        /// <param name="ignoreDefense">Bypass defense calculation.</param>
        /// <returns>Actual damage dealt.</returns>
        public int TakeDamage(int amount, bool ignoreDefense = false)
        {
            if (_isDead || amount <= 0) return 0;

            // Apply defense reduction
            int actualDamage = amount;
            if (!ignoreDefense)
            {
                float reduction = Defense / (float)(Defense + 100);
                actualDamage = Mathf.Max(1, Mathf.RoundToInt(amount * (1f - reduction)));
            }

            int previousHealth = _currentHealth;
            _currentHealth = Mathf.Max(0, _currentHealth - actualDamage);

            Log($"Took {actualDamage} damage ({amount} raw). Health: {previousHealth} -> {_currentHealth}");

            NotifyStatChanged(StatType.Health, previousHealth, _currentHealth);
            OnDamaged?.Invoke(this, actualDamage);
            EventBus.Instance?.Publish(GameEvents.PlayerDamaged, actualDamage.ToString());

            if (_currentHealth <= 0)
            {
                Die();
            }

            return actualDamage;
        }

        /// <summary>
        /// Heal health.
        /// </summary>
        /// <param name="amount">Amount to heal.</param>
        /// <returns>Actual amount healed.</returns>
        public int Heal(int amount)
        {
            if (_isDead || amount <= 0) return 0;

            int previousHealth = _currentHealth;
            int maxH = MaxHealth;
            _currentHealth = Mathf.Min(maxH, _currentHealth + amount);
            int actualHealed = _currentHealth - previousHealth;

            if (actualHealed > 0)
            {
                Log($"Healed {actualHealed}. Health: {previousHealth} -> {_currentHealth}");
                NotifyStatChanged(StatType.Health, previousHealth, _currentHealth);
                OnHealed?.Invoke(this, actualHealed);
            }

            return actualHealed;
        }

        /// <summary>
        /// Set health directly (for save/load).
        /// </summary>
        /// <param name="value">Health value.</param>
        public void SetHealth(int value)
        {
            int previous = _currentHealth;
            _currentHealth = Mathf.Clamp(value, 0, MaxHealth);
            NotifyStatChanged(StatType.Health, previous, _currentHealth);
        }

        /// <summary>
        /// Restore health to maximum.
        /// </summary>
        public void RestoreFullHealth()
        {
            int previous = _currentHealth;
            _currentHealth = MaxHealth;
            NotifyStatChanged(StatType.Health, previous, _currentHealth);
        }

        private void Die()
        {
            if (_isDead) return;

            _isDead = true;
            Log("Player died");

            OnDied?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish(GameEvents.PlayerDied, string.Empty);

            GameManager.Instance?.GameOver();
        }

        /// <summary>
        /// Revive the player with specified health.
        /// </summary>
        /// <param name="healthPercent">Health percentage to revive with (0-1).</param>
        public void Revive(float healthPercent = 0.5f)
        {
            _isDead = false;
            _currentHealth = Mathf.Max(1, Mathf.RoundToInt(MaxHealth * healthPercent));
            Log($"Revived with {_currentHealth} health");
        }

        #endregion

        #region Stamina

        /// <summary>
        /// Use stamina.
        /// </summary>
        /// <param name="amount">Amount to use.</param>
        /// <returns>True if enough stamina was available.</returns>
        public bool UseStamina(int amount)
        {
            if (amount <= 0) return true;
            if (_currentStamina < amount) return false;

            int previous = _currentStamina;
            _currentStamina -= amount;
            _lastStaminaUse = Time.time;

            NotifyStatChanged(StatType.Stamina, previous, _currentStamina);
            return true;
        }

        /// <summary>
        /// Check if there is enough stamina for an action.
        /// </summary>
        /// <param name="amount">Required stamina.</param>
        /// <returns>True if sufficient stamina available.</returns>
        public bool HasStamina(int amount)
        {
            return _currentStamina >= amount;
        }

        /// <summary>
        /// Restore stamina.
        /// </summary>
        /// <param name="amount">Amount to restore.</param>
        /// <returns>Actual amount restored.</returns>
        public int RestoreStamina(int amount)
        {
            if (amount <= 0) return 0;

            int previous = _currentStamina;
            int maxS = MaxStamina;
            _currentStamina = Mathf.Min(maxS, _currentStamina + amount);
            int restored = _currentStamina - previous;

            if (restored > 0)
            {
                NotifyStatChanged(StatType.Stamina, previous, _currentStamina);
            }

            return restored;
        }

        /// <summary>
        /// Set stamina directly (for save/load).
        /// </summary>
        /// <param name="value">Stamina value.</param>
        public void SetStamina(int value)
        {
            int previous = _currentStamina;
            _currentStamina = Mathf.Clamp(value, 0, MaxStamina);
            NotifyStatChanged(StatType.Stamina, previous, _currentStamina);
        }

        /// <summary>
        /// Restore stamina to maximum.
        /// </summary>
        public void RestoreFullStamina()
        {
            int previous = _currentStamina;
            _currentStamina = MaxStamina;
            NotifyStatChanged(StatType.Stamina, previous, _currentStamina);
        }

        #endregion

        #region Experience & Leveling

        /// <summary>
        /// Add experience points.
        /// </summary>
        /// <param name="amount">XP to add.</param>
        public void AddXP(int amount)
        {
            if (amount <= 0 || _currentLevel >= maxLevel) return;

            _currentXP += amount;
            Log($"Gained {amount} XP. Total: {_currentXP}");

            OnXPGained?.Invoke(this, amount);

            // Check for level up
            while (_currentLevel < maxLevel && _currentXP >= XPToNextLevel)
            {
                LevelUp();
            }
        }

        private void LevelUp()
        {
            int previousLevel = _currentLevel;
            _currentLevel++;

            var statsGained = new Dictionary<StatType, int>
            {
                { StatType.MaxHealth, healthPerLevel },
                { StatType.MaxStamina, staminaPerLevel },
                { StatType.Attack, attackPerLevel },
                { StatType.Defense, defensePerLevel }
            };

            // Restore health and stamina on level up
            _currentHealth = MaxHealth;
            _currentStamina = MaxStamina;

            Log($"Leveled up! {previousLevel} -> {_currentLevel}");

            OnLevelUp?.Invoke(this, new LevelUpEventArgs(previousLevel, _currentLevel, statsGained));
            GameManager.Instance?.NotifyLevelUp(_currentLevel);
        }

        /// <summary>
        /// Set level directly (for save/load).
        /// </summary>
        /// <param name="level">Level to set.</param>
        public void SetLevel(int level)
        {
            _currentLevel = Mathf.Clamp(level, 1, maxLevel);
        }

        /// <summary>
        /// Set XP directly (for save/load).
        /// </summary>
        /// <param name="xp">XP value.</param>
        public void SetXP(int xp)
        {
            _currentXP = Mathf.Max(0, xp);
        }

        #endregion

        #region Modifiers

        /// <summary>
        /// Add a stat modifier.
        /// </summary>
        /// <param name="modifier">Modifier to add.</param>
        public void AddModifier(StatModifier modifier)
        {
            if (modifier == null) return;

            if (string.IsNullOrEmpty(modifier.Id))
            {
                modifier.Id = Guid.NewGuid().ToString();
            }

            modifier.AppliedAt = Time.time;
            _modifiers.Add(modifier);

            Log($"Added modifier: {modifier.Source} ({modifier.Stat}: +{modifier.FlatBonus}, x{modifier.Multiplier})");
            OnModifierAdded?.Invoke(this, modifier);
        }

        /// <summary>
        /// Add a simple flat bonus modifier.
        /// </summary>
        /// <param name="stat">Stat to modify.</param>
        /// <param name="bonus">Flat bonus value.</param>
        /// <param name="source">Source identifier.</param>
        /// <param name="duration">Duration in seconds (0 = permanent).</param>
        /// <returns>The created modifier.</returns>
        public StatModifier AddFlatBonus(StatType stat, int bonus, string source, float duration = 0f)
        {
            var modifier = new StatModifier
            {
                Stat = stat,
                FlatBonus = bonus,
                Source = source,
                Duration = duration
            };

            AddModifier(modifier);
            return modifier;
        }

        /// <summary>
        /// Add a multiplier modifier.
        /// </summary>
        /// <param name="stat">Stat to modify.</param>
        /// <param name="multiplier">Multiplier value (1.5 = 50% increase).</param>
        /// <param name="source">Source identifier.</param>
        /// <param name="duration">Duration in seconds (0 = permanent).</param>
        /// <returns>The created modifier.</returns>
        public StatModifier AddMultiplier(StatType stat, float multiplier, string source, float duration = 0f)
        {
            var modifier = new StatModifier
            {
                Stat = stat,
                Multiplier = multiplier,
                Source = source,
                Duration = duration
            };

            AddModifier(modifier);
            return modifier;
        }

        /// <summary>
        /// Remove a specific modifier.
        /// </summary>
        /// <param name="modifier">Modifier to remove.</param>
        public void RemoveModifier(StatModifier modifier)
        {
            if (_modifiers.Remove(modifier))
            {
                Log($"Removed modifier: {modifier.Source}");
                OnModifierRemoved?.Invoke(this, modifier);
            }
        }

        /// <summary>
        /// Remove a modifier by ID.
        /// </summary>
        /// <param name="modifierId">Modifier ID.</param>
        public void RemoveModifierById(string modifierId)
        {
            var modifier = _modifiers.Find(m => m.Id == modifierId);
            if (modifier != null)
            {
                RemoveModifier(modifier);
            }
        }

        /// <summary>
        /// Remove all modifiers from a source.
        /// </summary>
        /// <param name="source">Source identifier.</param>
        public void RemoveModifiersBySource(string source)
        {
            var toRemove = _modifiers.FindAll(m => m.Source == source);
            foreach (var modifier in toRemove)
            {
                RemoveModifier(modifier);
            }
        }

        /// <summary>
        /// Clear all modifiers.
        /// </summary>
        public void ClearAllModifiers()
        {
            _modifiers.Clear();
            Log("Cleared all modifiers");
        }

        private void UpdateModifiers()
        {
            // Remove expired modifiers
            for (int i = _modifiers.Count - 1; i >= 0; i--)
            {
                if (_modifiers[i].IsExpired)
                {
                    var modifier = _modifiers[i];
                    _modifiers.RemoveAt(i);
                    Log($"Modifier expired: {modifier.Source}");
                    OnModifierRemoved?.Invoke(this, modifier);
                }
            }
        }

        #endregion

        #region Regeneration

        private void UpdateRegeneration()
        {
            // Health regeneration
            if (healthRegenRate > 0f && !IsFullHealth)
            {
                int regenAmount = Mathf.Max(1, Mathf.RoundToInt(healthRegenRate * Time.deltaTime));
                Heal(regenAmount);
            }

            // Stamina regeneration (with delay after use)
            if (staminaRegenRate > 0f && !IsFullStamina)
            {
                if (Time.time - _lastStaminaUse >= staminaRegenDelay)
                {
                    int regenAmount = Mathf.Max(1, Mathf.RoundToInt(staminaRegenRate * Time.deltaTime));
                    RestoreStamina(regenAmount);
                }
            }
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Serializable save data for player stats.
        /// </summary>
        [Serializable]
        public class PlayerStatsSaveData
        {
            public int level;
            public int currentXP;
            public int currentHealth;
            public int currentStamina;
            public List<SerializedModifier> modifiers;

            [Serializable]
            public class SerializedModifier
            {
                public string id;
                public string source;
                public int stat;
                public int flatBonus;
                public float multiplier;
                public float remainingDuration;
            }
        }

        /// <summary>
        /// Get save data for serialization.
        /// </summary>
        /// <returns>Serializable save data.</returns>
        public PlayerStatsSaveData GetSaveData()
        {
            var data = new PlayerStatsSaveData
            {
                level = _currentLevel,
                currentXP = _currentXP,
                currentHealth = _currentHealth,
                currentStamina = _currentStamina,
                modifiers = new List<PlayerStatsSaveData.SerializedModifier>()
            };

            foreach (var mod in _modifiers)
            {
                // Only save modifiers with remaining duration or permanent
                if (!mod.IsExpired)
                {
                    data.modifiers.Add(new PlayerStatsSaveData.SerializedModifier
                    {
                        id = mod.Id,
                        source = mod.Source,
                        stat = (int)mod.Stat,
                        flatBonus = mod.FlatBonus,
                        multiplier = mod.Multiplier,
                        remainingDuration = mod.Duration > 0f ? mod.RemainingDuration : 0f
                    });
                }
            }

            return data;
        }

        /// <summary>
        /// Load save data.
        /// </summary>
        /// <param name="data">Save data to load.</param>
        public void LoadSaveData(PlayerStatsSaveData data)
        {
            if (data == null) return;

            _currentLevel = data.level;
            _currentXP = data.currentXP;
            _currentHealth = data.currentHealth;
            _currentStamina = data.currentStamina;
            _isDead = _currentHealth <= 0;

            _modifiers.Clear();
            if (data.modifiers != null)
            {
                foreach (var serialized in data.modifiers)
                {
                    var modifier = new StatModifier
                    {
                        Id = serialized.id,
                        Source = serialized.source,
                        Stat = (StatType)serialized.stat,
                        FlatBonus = serialized.flatBonus,
                        Multiplier = serialized.multiplier,
                        Duration = serialized.remainingDuration,
                        AppliedAt = Time.time
                    };
                    _modifiers.Add(modifier);
                }
            }

            Log("Loaded save data");
        }

        #endregion

        #region Notifications

        private void NotifyStatChanged(StatType stat, int oldValue, int newValue)
        {
            if (oldValue == newValue) return;

            OnStatChanged?.Invoke(this, new StatChangedEventArgs(stat, oldValue, newValue));
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[PlayerStats] {message}");
            }
        }

        #endregion
    }
}
