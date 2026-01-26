using System;
using UnityEngine;
using IronFrontier.Core;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Fatigue severity levels based on current fatigue value.
    /// Higher fatigue results in worse combat performance and potential collapse.
    /// </summary>
    public enum FatigueLevel
    {
        /// <summary>Well-rested, no penalties (0-24 fatigue).</summary>
        Rested,
        /// <summary>Starting to feel tired, minor penalties (25-49 fatigue).</summary>
        Tired,
        /// <summary>Weariness affects movement and combat (50-74 fatigue).</summary>
        Weary,
        /// <summary>Severe exhaustion, major penalties (75-99 fatigue).</summary>
        Exhausted,
        /// <summary>Cannot continue, forced rest required (100 fatigue).</summary>
        Collapsed
    }

    /// <summary>
    /// Rest types that affect fatigue recovery rate.
    /// </summary>
    public enum RestType
    {
        /// <summary>Resting at an inn (best recovery).</summary>
        Inn,
        /// <summary>Camping in the wilderness.</summary>
        Camp,
        /// <summary>Using a rest item.</summary>
        Item
    }

    /// <summary>
    /// Activity types that cause fatigue gain.
    /// </summary>
    public enum FatigueActivity
    {
        /// <summary>Traveling on the overworld.</summary>
        Travel,
        /// <summary>Engaging in combat.</summary>
        Combat,
        /// <summary>Being awake without activity.</summary>
        Idle,
        /// <summary>Bonus fatigue for night hours.</summary>
        NightPenalty
    }

    /// <summary>
    /// Combat effects applied at different fatigue thresholds.
    /// </summary>
    [Serializable]
    public class FatigueEffects
    {
        /// <summary>Combat accuracy modifier (1.0 = normal, 0.7 = 30% penalty).</summary>
        public float accuracyModifier = 1.0f;

        /// <summary>Combat damage modifier (1.0 = normal).</summary>
        public float damageModifier = 1.0f;

        /// <summary>Movement speed modifier (1.0 = normal).</summary>
        public float speedModifier = 1.0f;

        /// <summary>Chance of stumbling during movement (0-1).</summary>
        public float stumbleChance = 0f;

        /// <summary>Whether the player can take actions.</summary>
        public bool canAct = true;

        /// <summary>Whether the player is vulnerable to attacks (takes extra damage).</summary>
        public bool isVulnerable = false;

        /// <summary>
        /// Create a copy of these effects.
        /// </summary>
        public FatigueEffects Clone()
        {
            return new FatigueEffects
            {
                accuracyModifier = this.accuracyModifier,
                damageModifier = this.damageModifier,
                speedModifier = this.speedModifier,
                stumbleChance = this.stumbleChance,
                canAct = this.canAct,
                isVulnerable = this.isVulnerable
            };
        }
    }

    /// <summary>
    /// Event arguments for fatigue value changes.
    /// </summary>
    public class FatigueChangedEventArgs : EventArgs
    {
        /// <summary>Previous fatigue value.</summary>
        public float PreviousFatigue { get; }

        /// <summary>New fatigue value.</summary>
        public float NewFatigue { get; }

        /// <summary>Maximum fatigue value.</summary>
        public float MaxFatigue { get; }

        /// <summary>Current fatigue level.</summary>
        public FatigueLevel Level { get; }

        /// <summary>Amount of fatigue change (positive = gained, negative = recovered).</summary>
        public float Delta { get; }

        public FatigueChangedEventArgs(float previous, float current, float max, FatigueLevel level)
        {
            PreviousFatigue = previous;
            NewFatigue = current;
            MaxFatigue = max;
            Level = level;
            Delta = current - previous;
        }
    }

    /// <summary>
    /// Event arguments for fatigue level transitions.
    /// </summary>
    public class FatigueLevelChangedEventArgs : EventArgs
    {
        /// <summary>Previous fatigue level.</summary>
        public FatigueLevel PreviousLevel { get; }

        /// <summary>New fatigue level.</summary>
        public FatigueLevel NewLevel { get; }

        /// <summary>Current fatigue value.</summary>
        public float CurrentFatigue { get; }

        public FatigueLevelChangedEventArgs(FatigueLevel previous, FatigueLevel current, float fatigue)
        {
            PreviousLevel = previous;
            NewLevel = current;
            CurrentFatigue = fatigue;
        }
    }

    /// <summary>
    /// Interface for fatigue system operations, enabling unit testing and dependency injection.
    /// </summary>
    public interface IFatigueSystem
    {
        /// <summary>Current fatigue value (0-100).</summary>
        float CurrentFatigue { get; }

        /// <summary>Maximum fatigue value.</summary>
        float MaxFatigue { get; }

        /// <summary>Current fatigue level.</summary>
        FatigueLevel CurrentLevel { get; }

        /// <summary>Current fatigue effects.</summary>
        FatigueEffects CurrentEffects { get; }

        /// <summary>Whether the player can take actions.</summary>
        bool CanAct { get; }

        /// <summary>Apply fatigue from an activity.</summary>
        void ApplyFatigue(FatigueActivity activity, float hours = 1f, float intensity = 1f);

        /// <summary>Apply rest recovery.</summary>
        void ApplyRest(RestType type, float hours = 1f, float multiplier = 1f);

        /// <summary>Check if a stumble should occur.</summary>
        bool CheckStumble();

        /// <summary>Get the effects for the current fatigue level.</summary>
        FatigueEffects GetEffects();

        /// <summary>Reset to fully rested state.</summary>
        void FullRest();
    }

    /// <summary>
    /// Fatigue tracking and effects system for Iron Frontier.
    /// Manages player fatigue levels that increase with activity and decrease with rest.
    /// Fatigue affects combat effectiveness, movement speed, and can cause forced rest.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript fatigue.ts (FatigueSystem class).
    /// Features:
    /// - Fatigue increases with travel, combat, and being awake at night
    /// - Fatigue decreases with rest (inn, camping, items)
    /// - Effects at thresholds: combat penalties, speed reduction, stumble, collapse
    /// - Serializable state for save/load
    /// - EventBus integration for cross-system communication
    /// </remarks>
    public class FatigueSystem : MonoBehaviour, IFatigueSystem
    {
        #region Singleton

        private static FatigueSystem _instance;

        /// <summary>
        /// Global singleton instance of FatigueSystem.
        /// </summary>
        public static FatigueSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<FatigueSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[FatigueSystem]");
                        _instance = go.AddComponent<FatigueSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when fatigue value changes.</summary>
        public event EventHandler<FatigueChangedEventArgs> OnFatigueChanged;

        /// <summary>Fired when fatigue level threshold is crossed.</summary>
        public event EventHandler<FatigueLevelChangedEventArgs> OnFatigueLevelChanged;

        /// <summary>Fired when player stumbles due to fatigue.</summary>
        public event EventHandler OnStumble;

        /// <summary>Fired when player collapses from exhaustion.</summary>
        public event EventHandler OnCollapse;

        #endregion

        #region Configuration - Thresholds

        [Header("Fatigue Thresholds")]
        [SerializeField]
        [Tooltip("Maximum fatigue value")]
        private float maxFatigue = 100f;

        [SerializeField]
        [Tooltip("Threshold for Tired level (minor penalties)")]
        [Range(0, 100)]
        private float tiredThreshold = 25f;

        [SerializeField]
        [Tooltip("Threshold for Weary level (speed reduction)")]
        [Range(0, 100)]
        private float wearyThreshold = 50f;

        [SerializeField]
        [Tooltip("Threshold for Exhausted level (severe penalties)")]
        [Range(0, 100)]
        private float exhaustedThreshold = 75f;

        [SerializeField]
        [Tooltip("Threshold for Collapsed level (forced rest)")]
        [Range(0, 100)]
        private float collapsedThreshold = 100f;

        #endregion

        #region Configuration - Fatigue Rates

        [Header("Fatigue Gain Rates (per hour)")]
        [SerializeField]
        [Tooltip("Fatigue gained per hour while traveling")]
        private float travelFatigueRate = 8f;

        [SerializeField]
        [Tooltip("Fatigue gained per combat encounter")]
        private float combatFatigueRate = 15f;

        [SerializeField]
        [Tooltip("Additional fatigue per hour when awake at night")]
        private float nightPenaltyRate = 5f;

        [SerializeField]
        [Tooltip("Base fatigue when idle (awake but not traveling)")]
        private float idleFatigueRate = 2f;

        #endregion

        #region Configuration - Recovery Rates

        [Header("Recovery Rates (per hour)")]
        [SerializeField]
        [Tooltip("Fatigue recovered per hour at an inn")]
        private float innRecoveryRate = 25f;

        [SerializeField]
        [Tooltip("Fatigue recovered per hour while camping")]
        private float campRecoveryRate = 15f;

        [SerializeField]
        [Tooltip("Fatigue recovered per rest item use")]
        private float itemRecoveryAmount = 20f;

        #endregion

        #region Configuration - Debug

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region State

        private float _currentFatigue = 0f;
        private FatigueLevel _currentLevel = FatigueLevel.Rested;
        private bool _pendingStumble = false;
        private float _lastUpdateTime = 0f;

        // Cached effects for current level
        private FatigueEffects _cachedEffects;

        #endregion

        #region Properties

        /// <summary>Current fatigue value (0-100).</summary>
        public float CurrentFatigue => _currentFatigue;

        /// <summary>Maximum fatigue value.</summary>
        public float MaxFatigue => maxFatigue;

        /// <summary>Current fatigue as a percentage (0-1).</summary>
        public float FatiguePercentage => _currentFatigue / maxFatigue;

        /// <summary>Current fatigue level.</summary>
        public FatigueLevel CurrentLevel => _currentLevel;

        /// <summary>Current fatigue effects (cached).</summary>
        public FatigueEffects CurrentEffects => _cachedEffects;

        /// <summary>Whether the player can take actions.</summary>
        public bool CanAct => _cachedEffects?.canAct ?? true;

        /// <summary>Whether the player is vulnerable to attacks.</summary>
        public bool IsVulnerable => _cachedEffects?.isVulnerable ?? false;

        /// <summary>Whether there is a pending stumble event.</summary>
        public bool HasPendingStumble => _pendingStumble;

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

            ResetToDefault();
            Log("FatigueSystem initialized");
        }

        private void Start()
        {
            // Subscribe to time events for passive fatigue
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged += OnHourChanged;
            }

            // Subscribe to combat events
            if (EventBus.Instance != null)
            {
                EventBus.Instance.Subscribe<string>(GameEvents.CombatEnded, OnCombatEnded);
            }

            // Register with SaveSystem
            RegisterSaveLoad();
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged -= OnHourChanged;
            }

            if (EventBus.Instance != null)
            {
                EventBus.Instance.Unsubscribe<string>(GameEvents.CombatEnded, OnCombatEnded);
            }

            // Unregister from SaveSystem
            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.Unregister("fatigue");
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Event Handlers

        private void OnHourChanged(object sender, TimeChangedEventArgs args)
        {
            // Apply idle fatigue each hour when not traveling
            if (GameManager.Instance != null && GameManager.Instance.IsGameActive)
            {
                bool isNight = args.Phase == TimePhase.Night;
                ApplyFatigue(FatigueActivity.Idle, 1f, 1f);

                if (isNight)
                {
                    ApplyFatigue(FatigueActivity.NightPenalty, 1f, 1f);
                }
            }
        }

        private void OnCombatEnded(string result)
        {
            // Combat fatigue is applied when combat ends
            ApplyFatigue(FatigueActivity.Combat, 1f, 1f);
        }

        #endregion

        #region Public API - Fatigue Queries

        /// <summary>
        /// Gets the fatigue level for a given fatigue value.
        /// </summary>
        /// <param name="fatigue">Fatigue value to check.</param>
        /// <returns>The corresponding fatigue level.</returns>
        public FatigueLevel GetLevelForFatigue(float fatigue)
        {
            if (fatigue >= collapsedThreshold) return FatigueLevel.Collapsed;
            if (fatigue >= exhaustedThreshold) return FatigueLevel.Exhausted;
            if (fatigue >= wearyThreshold) return FatigueLevel.Weary;
            if (fatigue >= tiredThreshold) return FatigueLevel.Tired;
            return FatigueLevel.Rested;
        }

        /// <summary>
        /// Gets the effects for the current fatigue level.
        /// </summary>
        /// <returns>Fatigue effects for current level.</returns>
        public FatigueEffects GetEffects()
        {
            return _cachedEffects?.Clone() ?? GetEffectsForLevel(_currentLevel);
        }

        /// <summary>
        /// Gets the effects for a specific fatigue level.
        /// </summary>
        /// <param name="level">Fatigue level to query.</param>
        /// <returns>Effects for that level.</returns>
        public FatigueEffects GetEffectsForLevel(FatigueLevel level)
        {
            return level switch
            {
                FatigueLevel.Rested => new FatigueEffects
                {
                    accuracyModifier = 1.0f,
                    damageModifier = 1.0f,
                    speedModifier = 1.0f,
                    stumbleChance = 0f,
                    canAct = true,
                    isVulnerable = false
                },
                FatigueLevel.Tired => new FatigueEffects
                {
                    accuracyModifier = 0.95f,  // 5% accuracy penalty
                    damageModifier = 0.95f,     // 5% damage penalty
                    speedModifier = 1.0f,
                    stumbleChance = 0f,
                    canAct = true,
                    isVulnerable = false
                },
                FatigueLevel.Weary => new FatigueEffects
                {
                    accuracyModifier = 0.85f,  // 15% accuracy penalty
                    damageModifier = 0.90f,     // 10% damage penalty
                    speedModifier = 0.8f,       // 20% speed reduction
                    stumbleChance = 0.05f,      // 5% stumble chance
                    canAct = true,
                    isVulnerable = false
                },
                FatigueLevel.Exhausted => new FatigueEffects
                {
                    accuracyModifier = 0.70f,  // 30% accuracy penalty
                    damageModifier = 0.75f,     // 25% damage penalty
                    speedModifier = 0.6f,       // 40% speed reduction
                    stumbleChance = 0.15f,      // 15% stumble chance
                    canAct = true,
                    isVulnerable = false
                },
                FatigueLevel.Collapsed => new FatigueEffects
                {
                    accuracyModifier = 0f,
                    damageModifier = 0f,
                    speedModifier = 0f,
                    stumbleChance = 1.0f,       // Always stumble
                    canAct = false,              // Cannot take actions
                    isVulnerable = true          // Vulnerable to attacks
                },
                _ => new FatigueEffects()
            };
        }

        /// <summary>
        /// Gets a human-readable description of current fatigue state.
        /// </summary>
        /// <returns>Description string.</returns>
        public string GetDescription()
        {
            return _currentLevel switch
            {
                FatigueLevel.Rested => "You feel well-rested and ready for anything.",
                FatigueLevel.Tired => "You are starting to feel tired. Combat is slightly affected.",
                FatigueLevel.Weary => "Weariness slows your movements. You need rest soon.",
                FatigueLevel.Exhausted => "Exhaustion clouds your mind. Combat is severely impaired.",
                FatigueLevel.Collapsed => "You collapse from exhaustion and cannot continue.",
                _ => "Unknown fatigue state."
            };
        }

        /// <summary>
        /// Gets the display name for a fatigue level.
        /// </summary>
        /// <param name="level">Level to get name for.</param>
        /// <returns>Display name string.</returns>
        public string GetLevelDisplayName(FatigueLevel level)
        {
            return level switch
            {
                FatigueLevel.Rested => "Rested",
                FatigueLevel.Tired => "Tired",
                FatigueLevel.Weary => "Weary",
                FatigueLevel.Exhausted => "Exhausted",
                FatigueLevel.Collapsed => "Collapsed",
                _ => "Unknown"
            };
        }

        /// <summary>
        /// Checks if a stumble should occur based on current fatigue.
        /// Does not consume the check - use ConsumeStumble after handling.
        /// </summary>
        /// <returns>True if player stumbles.</returns>
        public bool CheckStumble()
        {
            if (_cachedEffects == null || _cachedEffects.stumbleChance <= 0)
                return false;

            bool shouldStumble = UnityEngine.Random.value < _cachedEffects.stumbleChance;
            if (shouldStumble)
            {
                _pendingStumble = true;
                Log($"Stumble check passed (chance: {_cachedEffects.stumbleChance:P0})");
            }

            return shouldStumble;
        }

        /// <summary>
        /// Consumes a pending stumble event.
        /// </summary>
        /// <returns>True if there was a pending stumble.</returns>
        public bool ConsumePendingStumble()
        {
            bool pending = _pendingStumble;
            _pendingStumble = false;

            if (pending)
            {
                OnStumble?.Invoke(this, EventArgs.Empty);
                EventBus.Instance?.Publish("player_stumbled", _currentFatigue.ToString());
            }

            return pending;
        }

        #endregion

        #region Public API - Fatigue Modification

        /// <summary>
        /// Apply fatigue from a specific activity.
        /// </summary>
        /// <param name="activity">The type of activity causing fatigue.</param>
        /// <param name="hours">Duration in game hours (for time-based activities).</param>
        /// <param name="intensity">Intensity multiplier (default: 1).</param>
        public void ApplyFatigue(FatigueActivity activity, float hours = 1f, float intensity = 1f)
        {
            float amount = activity switch
            {
                FatigueActivity.Travel => hours * travelFatigueRate * intensity,
                FatigueActivity.Combat => combatFatigueRate * intensity,
                FatigueActivity.Idle => hours * idleFatigueRate * intensity,
                FatigueActivity.NightPenalty => hours * nightPenaltyRate * intensity,
                _ => 0f
            };

            // Apply provisions-based fatigue multiplier (starvation/dehydration)
            if (ProvisionsSystem.Instance != null)
            {
                float provisionsMultiplier = ProvisionsSystem.Instance.GetFatigueMultiplier();
                amount *= provisionsMultiplier;
            }

            if (amount > 0)
            {
                AddFatigue(amount);
                Log($"Applied {activity} fatigue: +{amount:F1} (hours={hours}, intensity={intensity})");
            }
        }

        /// <summary>
        /// Apply travel fatigue for a duration.
        /// </summary>
        /// <param name="hours">Number of game hours traveled.</param>
        /// <param name="isNight">Whether it's currently night time.</param>
        public void ApplyTravelFatigue(float hours, bool isNight = false)
        {
            ApplyFatigue(FatigueActivity.Travel, hours);
            if (isNight)
            {
                ApplyFatigue(FatigueActivity.NightPenalty, hours);
            }
        }

        /// <summary>
        /// Apply combat fatigue.
        /// </summary>
        /// <param name="intensity">Combat intensity multiplier (default: 1).</param>
        public void ApplyCombatFatigue(float intensity = 1f)
        {
            ApplyFatigue(FatigueActivity.Combat, 1f, intensity);
        }

        /// <summary>
        /// Apply rest recovery.
        /// </summary>
        /// <param name="type">Type of rest (inn, camp, item).</param>
        /// <param name="hours">Duration in game hours (for inn/camp).</param>
        /// <param name="multiplier">Effectiveness multiplier (default: 1).</param>
        public void ApplyRest(RestType type, float hours = 1f, float multiplier = 1f)
        {
            float amount = type switch
            {
                RestType.Inn => hours * innRecoveryRate * multiplier,
                RestType.Camp => hours * campRecoveryRate * multiplier,
                RestType.Item => itemRecoveryAmount * multiplier,
                _ => 0f
            };

            if (amount > 0)
            {
                RemoveFatigue(amount);
                Log($"Applied {type} rest: -{amount:F1} (hours={hours}, multiplier={multiplier})");
            }
        }

        /// <summary>
        /// Apply inn rest for a duration.
        /// </summary>
        /// <param name="hours">Number of game hours rested.</param>
        public void ApplyInnRest(float hours)
        {
            ApplyRest(RestType.Inn, hours);
        }

        /// <summary>
        /// Apply camping rest for a duration.
        /// </summary>
        /// <param name="hours">Number of game hours rested.</param>
        public void ApplyCampRest(float hours)
        {
            ApplyRest(RestType.Camp, hours);
        }

        /// <summary>
        /// Apply rest from using an item.
        /// </summary>
        /// <param name="multiplier">Item effectiveness multiplier (default: 1).</param>
        public void ApplyItemRest(float multiplier = 1f)
        {
            ApplyRest(RestType.Item, 1f, multiplier);
        }

        /// <summary>
        /// Directly add fatigue (clamped to max).
        /// </summary>
        /// <param name="amount">Amount of fatigue to add.</param>
        public void AddFatigue(float amount)
        {
            if (amount <= 0) return;

            float previousFatigue = _currentFatigue;
            FatigueLevel previousLevel = _currentLevel;

            _currentFatigue = Mathf.Min(maxFatigue, _currentFatigue + amount);
            _currentLevel = GetLevelForFatigue(_currentFatigue);

            UpdateCachedEffects();
            EmitFatigueChanged(previousFatigue);

            if (_currentLevel != previousLevel)
            {
                EmitLevelChanged(previousLevel);

                // Check for collapse
                if (_currentLevel == FatigueLevel.Collapsed)
                {
                    HandleCollapse();
                }
            }
        }

        /// <summary>
        /// Directly remove fatigue (clamped to 0).
        /// </summary>
        /// <param name="amount">Amount of fatigue to remove.</param>
        public void RemoveFatigue(float amount)
        {
            if (amount <= 0) return;

            float previousFatigue = _currentFatigue;
            FatigueLevel previousLevel = _currentLevel;

            _currentFatigue = Mathf.Max(0f, _currentFatigue - amount);
            _currentLevel = GetLevelForFatigue(_currentFatigue);

            UpdateCachedEffects();
            EmitFatigueChanged(previousFatigue);

            if (_currentLevel != previousLevel)
            {
                EmitLevelChanged(previousLevel);
            }
        }

        /// <summary>
        /// Set fatigue to a specific value (clamped).
        /// </summary>
        /// <param name="value">Fatigue value to set.</param>
        public void SetFatigue(float value)
        {
            float previousFatigue = _currentFatigue;
            FatigueLevel previousLevel = _currentLevel;

            _currentFatigue = Mathf.Clamp(value, 0f, maxFatigue);
            _currentLevel = GetLevelForFatigue(_currentFatigue);

            UpdateCachedEffects();

            if (!Mathf.Approximately(previousFatigue, _currentFatigue))
            {
                EmitFatigueChanged(previousFatigue);
            }

            if (_currentLevel != previousLevel)
            {
                EmitLevelChanged(previousLevel);

                if (_currentLevel == FatigueLevel.Collapsed)
                {
                    HandleCollapse();
                }
            }
        }

        /// <summary>
        /// Reset fatigue to zero (fully rested).
        /// </summary>
        public void FullRest()
        {
            SetFatigue(0f);
            Log("Full rest applied - fatigue reset to 0");
        }

        /// <summary>
        /// Reset to default state.
        /// </summary>
        public void ResetToDefault()
        {
            _currentFatigue = 0f;
            _currentLevel = FatigueLevel.Rested;
            _pendingStumble = false;
            _lastUpdateTime = 0f;
            UpdateCachedEffects();

            Log("Reset to default state");
        }

        #endregion

        #region Collapse Handling

        private void HandleCollapse()
        {
            Log("Player collapsed from exhaustion!");

            OnCollapse?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish("player_collapsed", _currentFatigue.ToString());

            // Notify GameManager if available
            if (GameManager.Instance != null)
            {
                // Could trigger a forced rest or game over depending on game rules
                EventBus.Instance?.Publish(GameEvents.Notification, "You collapse from exhaustion!");
            }
        }

        #endregion

        #region Save/Load

        private void RegisterSaveLoad()
        {
            if (SaveSystem.Instance == null) return;

            SaveSystem.Instance.RegisterSaveProvider("fatigue", () =>
            {
                var data = GetSaveData();
                return JsonUtility.ToJson(data);
            });

            SaveSystem.Instance.RegisterLoadConsumer("fatigue", (json) =>
            {
                if (!string.IsNullOrEmpty(json))
                {
                    var data = JsonUtility.FromJson<FatigueSystemSaveData>(json);
                    LoadSaveData(data);
                }
            });

            Log("Registered with SaveSystem");
        }

        /// <summary>
        /// Get save data for serialization.
        /// </summary>
        public FatigueSystemSaveData GetSaveData()
        {
            return new FatigueSystemSaveData
            {
                currentFatigue = _currentFatigue,
                lastUpdateTime = _lastUpdateTime,
                pendingStumble = _pendingStumble
            };
        }

        /// <summary>
        /// Load state from save data.
        /// </summary>
        public void LoadSaveData(FatigueSystemSaveData data)
        {
            _currentFatigue = Mathf.Clamp(data.currentFatigue, 0f, maxFatigue);
            _lastUpdateTime = data.lastUpdateTime;
            _pendingStumble = data.pendingStumble;
            _currentLevel = GetLevelForFatigue(_currentFatigue);

            UpdateCachedEffects();
            Log($"Loaded state: fatigue={_currentFatigue:F1}, level={_currentLevel}");
        }

        #endregion

        #region Event Emission

        private void EmitFatigueChanged(float previousFatigue)
        {
            var args = new FatigueChangedEventArgs(
                previousFatigue,
                _currentFatigue,
                maxFatigue,
                _currentLevel
            );

            OnFatigueChanged?.Invoke(this, args);
            EventBus.Instance?.Publish("fatigue_changed", _currentFatigue.ToString("F1"));
        }

        private void EmitLevelChanged(FatigueLevel previousLevel)
        {
            var args = new FatigueLevelChangedEventArgs(
                previousLevel,
                _currentLevel,
                _currentFatigue
            );

            OnFatigueLevelChanged?.Invoke(this, args);
            EventBus.Instance?.Publish("fatigue_level_changed", _currentLevel.ToString());

            Log($"Fatigue level changed: {previousLevel} -> {_currentLevel}");
        }

        #endregion

        #region Utility

        private void UpdateCachedEffects()
        {
            _cachedEffects = GetEffectsForLevel(_currentLevel);
        }

        /// <summary>
        /// Calculate fatigue gain for a travel segment.
        /// </summary>
        /// <param name="hours">Travel duration in game hours.</param>
        /// <param name="isNight">Whether it's currently night time.</param>
        /// <returns>Fatigue amount.</returns>
        public float CalculateTravelFatigue(float hours, bool isNight)
        {
            float fatigue = hours * travelFatigueRate;
            if (isNight)
            {
                fatigue += hours * nightPenaltyRate;
            }

            // Apply provisions-based fatigue multiplier
            if (ProvisionsSystem.Instance != null)
            {
                fatigue *= ProvisionsSystem.Instance.GetFatigueMultiplier();
            }

            return fatigue;
        }

        /// <summary>
        /// Calculate fatigue recovery for a rest period.
        /// </summary>
        /// <param name="hours">Rest duration in game hours.</param>
        /// <param name="isInn">Whether resting at an inn (vs camping).</param>
        /// <returns>Fatigue recovery amount.</returns>
        public float CalculateRestRecovery(float hours, bool isInn)
        {
            float rate = isInn ? innRecoveryRate : campRecoveryRate;
            return hours * rate;
        }

        /// <summary>
        /// Get hours of rest needed to reach a target fatigue level.
        /// </summary>
        /// <param name="targetLevel">Desired fatigue level.</param>
        /// <param name="restType">Type of rest.</param>
        /// <returns>Hours of rest needed (0 if already at or below target).</returns>
        public float GetHoursToReachLevel(FatigueLevel targetLevel, RestType restType)
        {
            float targetFatigue = targetLevel switch
            {
                FatigueLevel.Rested => 0f,
                FatigueLevel.Tired => tiredThreshold - 1f,
                FatigueLevel.Weary => wearyThreshold - 1f,
                FatigueLevel.Exhausted => exhaustedThreshold - 1f,
                _ => 0f
            };

            if (_currentFatigue <= targetFatigue)
                return 0f;

            float recoveryRate = restType switch
            {
                RestType.Inn => innRecoveryRate,
                RestType.Camp => campRecoveryRate,
                _ => campRecoveryRate
            };

            return (_currentFatigue - targetFatigue) / recoveryRate;
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[FatigueSystem] {message}");
            }
        }

        #endregion
    }
}
