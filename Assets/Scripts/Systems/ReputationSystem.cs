using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Event arguments for reputation change events.
    /// </summary>
    public class ReputationChangedEventArgs : EventArgs
    {
        /// <summary>Faction ID that changed.</summary>
        public string FactionId { get; }

        /// <summary>Previous reputation value.</summary>
        public int PreviousReputation { get; }

        /// <summary>New reputation value.</summary>
        public int NewReputation { get; }

        /// <summary>Change amount (delta).</summary>
        public int Delta { get; }

        /// <summary>Previous tier.</summary>
        public ReputationTier PreviousTier { get; }

        /// <summary>New tier.</summary>
        public ReputationTier NewTier { get; }

        /// <summary>Action that caused the change (if any).</summary>
        public string ActionId { get; }

        /// <summary>Whether tier changed.</summary>
        public bool TierChanged => PreviousTier != NewTier;

        public ReputationChangedEventArgs(
            string factionId,
            int previousReputation,
            int newReputation,
            int delta,
            ReputationTier previousTier,
            ReputationTier newTier,
            string actionId = null)
        {
            FactionId = factionId;
            PreviousReputation = previousReputation;
            NewReputation = newReputation;
            Delta = delta;
            PreviousTier = previousTier;
            NewTier = newTier;
            ActionId = actionId;
        }
    }

    /// <summary>
    /// Event arguments for tier change events.
    /// </summary>
    public class TierChangedEventArgs : EventArgs
    {
        /// <summary>Faction ID.</summary>
        public string FactionId { get; }

        /// <summary>Previous tier.</summary>
        public ReputationTier PreviousTier { get; }

        /// <summary>New tier.</summary>
        public ReputationTier NewTier { get; }

        /// <summary>Current reputation value.</summary>
        public int Reputation { get; }

        /// <summary>Whether tier improved (went up).</summary>
        public bool Improved => (int)NewTier > (int)PreviousTier;

        public TierChangedEventArgs(
            string factionId,
            ReputationTier previousTier,
            ReputationTier newTier,
            int reputation)
        {
            FactionId = factionId;
            PreviousTier = previousTier;
            NewTier = newTier;
            Reputation = reputation;
        }
    }

    /// <summary>
    /// Player's standing with a specific faction.
    /// </summary>
    [Serializable]
    public class PlayerFactionStanding
    {
        /// <summary>Faction ID.</summary>
        public string factionId;

        /// <summary>Current reputation (-100 to 100).</summary>
        public int reputation;

        /// <summary>Current tier.</summary>
        public ReputationTier currentTier;

        /// <summary>Actions completed (for one-time tracking).</summary>
        public List<string> completedActionIds = new List<string>();

        /// <summary>Action cooldowns (actionId -> game hour when available).</summary>
        public Dictionary<string, float> actionCooldowns = new Dictionary<string, float>();

        /// <summary>Last game hour when decay was applied.</summary>
        public float lastDecayHour;

        /// <summary>Highest reputation ever achieved.</summary>
        public int peakReputation;

        /// <summary>Lowest reputation ever reached.</summary>
        public int lowestReputation;

        /// <summary>
        /// Create a new standing for a faction.
        /// </summary>
        public PlayerFactionStanding(string factionId, int defaultReputation)
        {
            this.factionId = factionId;
            this.reputation = defaultReputation;
            this.currentTier = ReputationTierBoundaries.GetTier(defaultReputation);
            this.completedActionIds = new List<string>();
            this.actionCooldowns = new Dictionary<string, float>();
            this.lastDecayHour = 0f;
            this.peakReputation = defaultReputation;
            this.lowestReputation = defaultReputation;
        }

        /// <summary>
        /// Default constructor for serialization.
        /// </summary>
        public PlayerFactionStanding() { }
    }

    /// <summary>
    /// Save data for the reputation system.
    /// </summary>
    [Serializable]
    public class ReputationSystemSaveData
    {
        /// <summary>All faction standings.</summary>
        public List<PlayerFactionStanding> standings = new List<PlayerFactionStanding>();

        /// <summary>Total reputation changes made.</summary>
        public int totalReputationChanges;

        /// <summary>Last update timestamp.</summary>
        public long lastUpdated;
    }

    /// <summary>
    /// Faction reputation tracking system.
    /// Manages player reputation with all factions including ripple effects,
    /// decay mechanics, tier benefits, and action tracking.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript factions/index.ts.
    /// Features:
    /// - 7 reputation tiers from Hated (-100) to Revered (+100)
    /// - Ripple effects between related factions
    /// - Reputation decay toward neutral over time
    /// - One-time and cooldown action tracking
    /// - Integration with EventBus and SaveSystem
    /// </remarks>
    public class ReputationSystem : MonoBehaviour
    {
        #region Singleton

        private static ReputationSystem _instance;

        /// <summary>
        /// Global singleton instance of ReputationSystem.
        /// </summary>
        public static ReputationSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<ReputationSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[ReputationSystem]");
                        _instance = go.AddComponent<ReputationSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when any faction reputation changes.</summary>
        public event EventHandler<ReputationChangedEventArgs> OnReputationChanged;

        /// <summary>Fired when a faction tier changes.</summary>
        public event EventHandler<TierChangedEventArgs> OnTierChanged;

        #endregion

        #region Configuration

        [Header("Faction Data")]
        [SerializeField]
        [Tooltip("All faction data assets")]
        private List<FactionData> factions = new List<FactionData>();

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Whether to automatically apply reputation decay")]
        private bool autoDecay = true;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Player standings with each faction
        private Dictionary<string, PlayerFactionStanding> _standings =
            new Dictionary<string, PlayerFactionStanding>();

        // Faction data lookup
        private Dictionary<string, FactionData> _factionLookup =
            new Dictionary<string, FactionData>();

        // Total reputation changes counter
        private int _totalReputationChanges = 0;

        // Unsubscribe actions
        private Action _unsubscribeHour;

        #endregion

        #region Properties

        /// <summary>Total reputation changes made.</summary>
        public int TotalReputationChanges => _totalReputationChanges;

        /// <summary>Number of registered factions.</summary>
        public int FactionCount => _factionLookup.Count;

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

            InitializeFactions();
            Log("ReputationSystem initialized");
        }

        private void Start()
        {
            // Subscribe to time events for decay
            if (autoDecay && TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged += OnHourChanged;
            }

            // Register with save system
            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.RegisterSaveProvider("reputation", GetSaveDataJson);
                SaveSystem.Instance.RegisterLoadConsumer("reputation", LoadSaveDataJson);
            }
        }

        private void OnDestroy()
        {
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged -= OnHourChanged;
            }

            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.Unregister("reputation");
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        private void InitializeFactions()
        {
            _factionLookup.Clear();
            _standings.Clear();

            foreach (var faction in factions)
            {
                if (faction == null) continue;

                _factionLookup[faction.id] = faction;
                _standings[faction.id] = new PlayerFactionStanding(faction.id, faction.defaultReputation);

                Log($"Registered faction: {faction.id} (default rep: {faction.defaultReputation})");
            }
        }

        /// <summary>
        /// Register a faction at runtime.
        /// </summary>
        /// <param name="faction">Faction data to register.</param>
        public void RegisterFaction(FactionData faction)
        {
            if (faction == null) return;

            _factionLookup[faction.id] = faction;
            if (!_standings.ContainsKey(faction.id))
            {
                _standings[faction.id] = new PlayerFactionStanding(faction.id, faction.defaultReputation);
            }

            Log($"Registered faction at runtime: {faction.id}");
        }

        /// <summary>
        /// Reset all reputations to defaults.
        /// </summary>
        public void ResetToDefaults()
        {
            _standings.Clear();
            _totalReputationChanges = 0;

            foreach (var faction in _factionLookup.Values)
            {
                _standings[faction.id] = new PlayerFactionStanding(faction.id, faction.defaultReputation);
            }

            Log("Reset all reputations to defaults");
        }

        #endregion

        #region Reputation Queries

        /// <summary>
        /// Get current reputation with a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Current reputation value (-100 to 100).</returns>
        public int GetReputation(string factionId)
        {
            if (_standings.TryGetValue(factionId, out var standing))
            {
                return standing.reputation;
            }
            return 0;
        }

        /// <summary>
        /// Get current tier with a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Current reputation tier.</returns>
        public ReputationTier GetTier(string factionId)
        {
            if (_standings.TryGetValue(factionId, out var standing))
            {
                return standing.currentTier;
            }
            return ReputationTier.Neutral;
        }

        /// <summary>
        /// Get the player's standing with a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Standing data or null if not found.</returns>
        public PlayerFactionStanding GetStanding(string factionId)
        {
            return _standings.TryGetValue(factionId, out var standing) ? standing : null;
        }

        /// <summary>
        /// Get all faction standings.
        /// </summary>
        /// <returns>Dictionary of all standings.</returns>
        public IReadOnlyDictionary<string, PlayerFactionStanding> GetAllStandings()
        {
            return _standings;
        }

        /// <summary>
        /// Get faction data by ID.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Faction data or null if not found.</returns>
        public FactionData GetFaction(string factionId)
        {
            return _factionLookup.TryGetValue(factionId, out var faction) ? faction : null;
        }

        /// <summary>
        /// Get all faction IDs.
        /// </summary>
        /// <returns>Array of faction IDs.</returns>
        public string[] GetAllFactionIds()
        {
            var ids = new string[_factionLookup.Count];
            _factionLookup.Keys.CopyTo(ids, 0);
            return ids;
        }

        /// <summary>
        /// Check if player is hostile with a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>True if faction will attack on sight.</returns>
        public bool IsHostile(string factionId)
        {
            var faction = GetFaction(factionId);
            if (faction == null) return false;

            return faction.IsHostile(GetReputation(factionId));
        }

        /// <summary>
        /// Get shop price modifier for a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Price modifier (1.0 = normal).</returns>
        public float GetPriceModifier(string factionId)
        {
            var faction = GetFaction(factionId);
            if (faction == null) return 1.0f;

            return faction.GetPriceModifier(GetReputation(factionId));
        }

        /// <summary>
        /// Get tier effects for a faction at current reputation.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Tier effects or null if faction not found.</returns>
        public FactionTierEffects? GetTierEffects(string factionId)
        {
            var faction = GetFaction(factionId);
            if (faction == null) return null;

            return faction.GetTierEffects(GetReputation(factionId));
        }

        /// <summary>
        /// Get active perks for a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>List of active perk IDs.</returns>
        public List<string> GetActivePerks(string factionId)
        {
            var effects = GetTierEffects(factionId);
            return effects?.perks ?? new List<string>();
        }

        /// <summary>
        /// Check if player has a specific perk from any faction.
        /// </summary>
        /// <param name="perkId">Perk ID to check.</param>
        /// <returns>True if player has the perk.</returns>
        public bool HasPerk(string perkId)
        {
            foreach (var factionId in _factionLookup.Keys)
            {
                var perks = GetActivePerks(factionId);
                if (perks.Contains(perkId))
                    return true;
            }
            return false;
        }

        #endregion

        #region Reputation Modification

        /// <summary>
        /// Directly modify reputation with a faction.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <param name="delta">Amount to change (-100 to 100).</param>
        /// <param name="applyRipple">Whether to apply ripple effects to related factions.</param>
        /// <param name="actionId">Optional action ID that caused this change.</param>
        /// <returns>Actual change applied.</returns>
        public int ModifyReputation(string factionId, int delta, bool applyRipple = true, string actionId = null)
        {
            if (!_standings.TryGetValue(factionId, out var standing))
            {
                Log($"Unknown faction: {factionId}");
                return 0;
            }

            var previousRep = standing.reputation;
            var previousTier = standing.currentTier;

            // Apply change with clamping
            standing.reputation = Mathf.Clamp(standing.reputation + delta, -100, 100);
            standing.currentTier = ReputationTierBoundaries.GetTier(standing.reputation);

            // Track peak/lowest
            standing.peakReputation = Mathf.Max(standing.peakReputation, standing.reputation);
            standing.lowestReputation = Mathf.Min(standing.lowestReputation, standing.reputation);

            int actualDelta = standing.reputation - previousRep;

            if (actualDelta != 0)
            {
                _totalReputationChanges++;

                // Emit events
                EmitReputationChanged(factionId, previousRep, standing.reputation, actualDelta, previousTier, standing.currentTier, actionId);

                if (previousTier != standing.currentTier)
                {
                    EmitTierChanged(factionId, previousTier, standing.currentTier, standing.reputation);
                }

                // Apply ripple effects
                if (applyRipple && _factionLookup.TryGetValue(factionId, out var faction))
                {
                    ApplyRippleEffects(faction, actualDelta);
                }

                Log($"Reputation with {factionId}: {previousRep} -> {standing.reputation} (delta: {actualDelta})");
            }

            return actualDelta;
        }

        /// <summary>
        /// Set reputation to a specific value.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <param name="reputation">Reputation value to set.</param>
        /// <param name="applyRipple">Whether to apply ripple effects.</param>
        public void SetReputation(string factionId, int reputation, bool applyRipple = false)
        {
            if (!_standings.TryGetValue(factionId, out var standing)) return;

            int delta = reputation - standing.reputation;
            ModifyReputation(factionId, delta, applyRipple);
        }

        private void ApplyRippleEffects(FactionData sourceFaction, int delta)
        {
            foreach (var relationship in sourceFaction.relationships)
            {
                if (Mathf.Approximately(relationship.rippleMultiplier, 0f)) continue;

                var targetId = !string.IsNullOrEmpty(relationship.otherFactionId)
                    ? relationship.otherFactionId
                    : relationship.otherFaction?.id;

                if (string.IsNullOrEmpty(targetId)) continue;
                if (!_standings.ContainsKey(targetId)) continue;

                int rippleDelta = Mathf.RoundToInt(delta * relationship.rippleMultiplier);
                if (rippleDelta != 0)
                {
                    ModifyReputation(targetId, rippleDelta, applyRipple: false);
                    Log($"Ripple effect: {sourceFaction.id} -> {targetId}: {rippleDelta}");
                }
            }
        }

        #endregion

        #region Action System

        /// <summary>
        /// Check if an action can be performed.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <param name="actionId">Action ID.</param>
        /// <returns>Tuple of (canPerform, reason).</returns>
        public (bool canPerform, string reason) CanPerformAction(string factionId, string actionId)
        {
            var faction = GetFaction(factionId);
            if (faction == null)
                return (false, "Unknown faction");

            var action = faction.GetAction(actionId);
            if (!action.HasValue)
                return (false, "Unknown action");

            var standing = GetStanding(factionId);
            if (standing == null)
                return (false, "No standing with faction");

            // Check one-time actions
            if (action.Value.oneTime && standing.completedActionIds.Contains(actionId))
                return (false, "This action can only be performed once");

            // Check cooldown
            if (action.Value.cooldownHours > 0 && standing.actionCooldowns.ContainsKey(actionId))
            {
                float currentHour = TimeSystem.Instance?.TotalHours ?? 0f;
                float cooldownEnd = standing.actionCooldowns[actionId];

                if (currentHour < cooldownEnd)
                {
                    int hoursRemaining = Mathf.CeilToInt(cooldownEnd - currentHour);
                    return (false, $"Action on cooldown ({hoursRemaining} hours remaining)");
                }
            }

            return (true, null);
        }

        /// <summary>
        /// Perform a faction action and apply reputation changes.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <param name="actionId">Action ID to perform.</param>
        /// <returns>Tuple of (success, changes by faction, message).</returns>
        public (bool success, Dictionary<string, int> changes, string message) PerformAction(string factionId, string actionId)
        {
            var (canPerform, reason) = CanPerformAction(factionId, actionId);
            if (!canPerform)
            {
                return (false, new Dictionary<string, int>(), reason);
            }

            var faction = GetFaction(factionId);
            var action = faction.GetAction(actionId);
            var standing = GetStanding(factionId);

            var changes = new Dictionary<string, int>();

            // Apply primary change
            int primaryChange = ModifyReputation(factionId, action.Value.reputationDelta, applyRipple: true, actionId);
            changes[factionId] = primaryChange;

            // Calculate ripple changes (already applied by ModifyReputation)
            foreach (var relationship in faction.relationships)
            {
                if (Mathf.Approximately(relationship.rippleMultiplier, 0f)) continue;

                var targetId = !string.IsNullOrEmpty(relationship.otherFactionId)
                    ? relationship.otherFactionId
                    : relationship.otherFaction?.id;

                if (!string.IsNullOrEmpty(targetId) && _standings.ContainsKey(targetId))
                {
                    int rippleDelta = Mathf.RoundToInt(action.Value.reputationDelta * relationship.rippleMultiplier);
                    if (rippleDelta != 0)
                    {
                        changes[targetId] = rippleDelta;
                    }
                }
            }

            // Track one-time completion
            if (action.Value.oneTime)
            {
                standing.completedActionIds.Add(actionId);
            }

            // Set cooldown
            if (action.Value.cooldownHours > 0)
            {
                float currentHour = TimeSystem.Instance?.TotalHours ?? 0f;
                standing.actionCooldowns[actionId] = currentHour + action.Value.cooldownHours;
            }

            Log($"Performed action: {actionId} for {factionId}");

            return (true, changes, $"{action.Value.name} - reputation changed");
        }

        /// <summary>
        /// Perform an action by category without a specific action ID.
        /// Creates a generic action with the given delta.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <param name="category">Action category.</param>
        /// <param name="delta">Reputation change amount.</param>
        /// <param name="description">Optional description for logging.</param>
        /// <returns>Actual change applied.</returns>
        public int PerformGenericAction(string factionId, FactionActionCategory category, int delta, string description = null)
        {
            var actionId = $"generic_{category}_{DateTime.UtcNow.Ticks}";
            return ModifyReputation(factionId, delta, applyRipple: true, actionId);
        }

        #endregion

        #region Decay System

        private void OnHourChanged(object sender, TimeChangedEventArgs args)
        {
            if (autoDecay)
            {
                ApplyDecay(args.Hour + args.Day * 24);
            }
        }

        /// <summary>
        /// Apply reputation decay to all factions.
        /// </summary>
        /// <param name="currentGameHour">Current total game hour.</param>
        public void ApplyDecay(float currentGameHour)
        {
            foreach (var kvp in _standings)
            {
                var standing = kvp.Value;
                var faction = GetFaction(kvp.Key);

                if (faction == null) continue;
                if (faction.decayRatePerDay <= 0f) continue;

                float hoursElapsed = currentGameHour - standing.lastDecayHour;
                if (hoursElapsed <= 0) continue;

                int previousRep = standing.reputation;

                // Only decay if outside threshold
                if (Mathf.Abs(standing.reputation) > faction.decayThreshold)
                {
                    // Calculate total decay
                    float totalDecay = faction.decayRatePerDay * (hoursElapsed / 24f);

                    // Decay toward zero
                    if (standing.reputation > 0)
                    {
                        standing.reputation = Mathf.Max(
                            faction.decayThreshold,
                            Mathf.RoundToInt(standing.reputation - totalDecay)
                        );
                    }
                    else
                    {
                        standing.reputation = Mathf.Min(
                            -faction.decayThreshold,
                            Mathf.RoundToInt(standing.reputation + totalDecay)
                        );
                    }

                    // Update tier
                    var previousTier = standing.currentTier;
                    standing.currentTier = ReputationTierBoundaries.GetTier(standing.reputation);

                    if (previousRep != standing.reputation)
                    {
                        Log($"Decay applied to {kvp.Key}: {previousRep} -> {standing.reputation}");

                        if (previousTier != standing.currentTier)
                        {
                            EmitTierChanged(kvp.Key, previousTier, standing.currentTier, standing.reputation);
                        }
                    }
                }

                standing.lastDecayHour = currentGameHour;
            }
        }

        #endregion

        #region Event Emission

        private void EmitReputationChanged(
            string factionId,
            int previousRep,
            int newRep,
            int delta,
            ReputationTier previousTier,
            ReputationTier newTier,
            string actionId)
        {
            var args = new ReputationChangedEventArgs(
                factionId, previousRep, newRep, delta, previousTier, newTier, actionId
            );

            OnReputationChanged?.Invoke(this, args);

            EventBus.Instance?.Publish(GameEvents.ReputationChanged, factionId);

            // Also publish typed event
            EventBus.Instance?.Publish<ReputationChangedEventArgs>(
                GameEvents.ReputationChanged, args
            );
        }

        private void EmitTierChanged(
            string factionId,
            ReputationTier previousTier,
            ReputationTier newTier,
            int reputation)
        {
            var args = new TierChangedEventArgs(factionId, previousTier, newTier, reputation);
            OnTierChanged?.Invoke(this, args);

            Log($"Tier changed for {factionId}: {previousTier} -> {newTier}");
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data.
        /// </summary>
        public ReputationSystemSaveData GetSaveData()
        {
            var data = new ReputationSystemSaveData
            {
                standings = new List<PlayerFactionStanding>(_standings.Values),
                totalReputationChanges = _totalReputationChanges,
                lastUpdated = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            return data;
        }

        /// <summary>
        /// Load from save data.
        /// </summary>
        public void LoadSaveData(ReputationSystemSaveData data)
        {
            if (data == null) return;

            _standings.Clear();
            foreach (var standing in data.standings)
            {
                _standings[standing.factionId] = standing;
            }

            _totalReputationChanges = data.totalReputationChanges;

            // Re-initialize any missing factions
            foreach (var faction in _factionLookup.Values)
            {
                if (!_standings.ContainsKey(faction.id))
                {
                    _standings[faction.id] = new PlayerFactionStanding(faction.id, faction.defaultReputation);
                }
            }

            Log("Loaded save data");
        }

        private string GetSaveDataJson()
        {
            return JsonUtility.ToJson(GetSaveData());
        }

        private void LoadSaveDataJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return;

            try
            {
                var data = JsonUtility.FromJson<ReputationSystemSaveData>(json);
                LoadSaveData(data);
            }
            catch (Exception e)
            {
                Debug.LogError($"[ReputationSystem] Failed to load save data: {e}");
            }
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Get a formatted reputation description.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Formatted string like "Friendly (+25)".</returns>
        public string GetReputationDescription(string factionId)
        {
            var standing = GetStanding(factionId);
            if (standing == null) return "Unknown";

            string sign = standing.reputation >= 0 ? "+" : "";
            return $"{standing.currentTier} ({sign}{standing.reputation})";
        }

        /// <summary>
        /// Get reputation progress toward next tier.
        /// </summary>
        /// <param name="factionId">Faction ID.</param>
        /// <returns>Progress (0-1) toward next higher tier, or 1.0 if at max.</returns>
        public float GetTierProgress(string factionId)
        {
            var standing = GetStanding(factionId);
            if (standing == null) return 0f;

            if (standing.currentTier == ReputationTier.Revered)
                return 1f;

            int currentMin = ReputationTierBoundaries.GetMinimumForTier(standing.currentTier);
            int nextMin = ReputationTierBoundaries.GetMinimumForTier(standing.currentTier + 1);
            int range = nextMin - currentMin;

            if (range <= 0) return 1f;

            return (float)(standing.reputation - currentMin) / range;
        }

        /// <summary>
        /// Get all factions where player is hostile.
        /// </summary>
        /// <returns>List of faction IDs where player is attacked on sight.</returns>
        public List<string> GetHostileFactions()
        {
            var hostile = new List<string>();
            foreach (var factionId in _factionLookup.Keys)
            {
                if (IsHostile(factionId))
                    hostile.Add(factionId);
            }
            return hostile;
        }

        /// <summary>
        /// Get all factions at or above a specific tier.
        /// </summary>
        /// <param name="minTier">Minimum tier to include.</param>
        /// <returns>List of faction IDs at or above the tier.</returns>
        public List<string> GetFactionsAtTier(ReputationTier minTier)
        {
            var result = new List<string>();
            foreach (var kvp in _standings)
            {
                if ((int)kvp.Value.currentTier >= (int)minTier)
                    result.Add(kvp.Key);
            }
            return result;
        }

        #endregion

        #region Debug

        /// <summary>
        /// Debug: Set all reputations to a specific value.
        /// </summary>
        [ContextMenu("Debug: Set All to Neutral")]
        private void DebugSetAllNeutral()
        {
            foreach (var factionId in _standings.Keys)
            {
                SetReputation(factionId, 0, applyRipple: false);
            }
        }

        /// <summary>
        /// Debug: Set all reputations to max.
        /// </summary>
        [ContextMenu("Debug: Set All to Revered")]
        private void DebugSetAllRevered()
        {
            foreach (var factionId in _standings.Keys)
            {
                SetReputation(factionId, 100, applyRipple: false);
            }
        }

        /// <summary>
        /// Debug: Log all standings.
        /// </summary>
        [ContextMenu("Debug: Log All Standings")]
        private void DebugLogAllStandings()
        {
            foreach (var kvp in _standings)
            {
                Debug.Log($"[ReputationSystem] {kvp.Key}: {kvp.Value.reputation} ({kvp.Value.currentTier})");
            }
        }

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[ReputationSystem] {message}");
            }
        }

        #endregion
    }
}
