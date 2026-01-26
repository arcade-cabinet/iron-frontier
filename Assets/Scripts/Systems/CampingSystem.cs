using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Events;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Standard rest duration options in hours.
    /// </summary>
    public enum RestDuration
    {
        /// <summary>Short rest - 2 hours.</summary>
        Short = 2,
        /// <summary>Medium rest - 4 hours.</summary>
        Medium = 4,
        /// <summary>Full rest - 8 hours.</summary>
        Full = 8
    }

    /// <summary>
    /// Types of camping activities.
    /// </summary>
    public enum CampActivity
    {
        /// <summary>Resting to recover fatigue.</summary>
        Rest,
        /// <summary>Hunting for food.</summary>
        Hunt,
        /// <summary>Foraging for supplies.</summary>
        Forage,
        /// <summary>Keeping watch for danger.</summary>
        KeepWatch,
        /// <summary>Breaking camp to leave.</summary>
        BreakCamp
    }

    /// <summary>
    /// Camp fire states.
    /// </summary>
    public enum FireState
    {
        /// <summary>No fire.</summary>
        None,
        /// <summary>Fire is dying down.</summary>
        Smoldering,
        /// <summary>Normal burning fire.</summary>
        Burning,
        /// <summary>Large, bright fire.</summary>
        Blazing
    }

    /// <summary>
    /// Current state of the camping session.
    /// </summary>
    public enum CampState
    {
        /// <summary>Camp is set up and active.</summary>
        Active,
        /// <summary>Currently resting.</summary>
        Resting,
        /// <summary>Rest was interrupted by an encounter.</summary>
        Interrupted,
        /// <summary>Rest completed successfully.</summary>
        Complete
    }

    /// <summary>
    /// Random encounter types while camping.
    /// </summary>
    public enum CampEncounterType
    {
        /// <summary>No encounter.</summary>
        None,
        /// <summary>Curious animals, no threat.</summary>
        WildlifePassive,
        /// <summary>Predator attack.</summary>
        WildlifeHostile,
        /// <summary>Bandits spotted your camp.</summary>
        BanditScout,
        /// <summary>Full bandit attack.</summary>
        BanditRaid,
        /// <summary>Fellow traveler passes by.</summary>
        TravelerFriendly,
        /// <summary>Suspicious character.</summary>
        TravelerSuspicious,
        /// <summary>Sudden weather change.</summary>
        WeatherEvent,
        /// <summary>Find something interesting.</summary>
        Discovery
    }

    /// <summary>
    /// Terrain types affecting encounter rates.
    /// </summary>
    public enum CampTerrainType
    {
        Desert,
        Plains,
        Grassland,
        Forest,
        Mountains,
        Badlands,
        Riverside,
        Town
    }

    /// <summary>
    /// Resource changes from an encounter.
    /// </summary>
    [Serializable]
    public struct ResourceChange
    {
        public int food;
        public int water;
        public int gold;

        public ResourceChange(int food = 0, int water = 0, int gold = 0)
        {
            this.food = food;
            this.water = water;
            this.gold = gold;
        }

        public bool HasChanges => food != 0 || water != 0 || gold != 0;
    }

    /// <summary>
    /// Result of a camping encounter check.
    /// </summary>
    [Serializable]
    public class CampEncounter
    {
        /// <summary>Type of encounter.</summary>
        public CampEncounterType type;

        /// <summary>Whether it triggers combat.</summary>
        public bool isCombat;

        /// <summary>Associated encounter ID (if combat).</summary>
        public string encounterId;

        /// <summary>Flavor text describing the encounter.</summary>
        public string description;

        /// <summary>Whether the player was awakened.</summary>
        public bool wakesPlayer;

        /// <summary>Any resources gained or lost.</summary>
        public ResourceChange resourceChange;

        /// <summary>EncounterData reference for combat encounters.</summary>
        public EncounterData encounterData;
    }

    /// <summary>
    /// Result of a camping session.
    /// </summary>
    [Serializable]
    public class CampingResult
    {
        /// <summary>Hours actually rested (may be interrupted).</summary>
        public int hoursRested;

        /// <summary>Fatigue recovered.</summary>
        public float fatigueRecovered;

        /// <summary>Food consumed.</summary>
        public int foodConsumed;

        /// <summary>Water consumed.</summary>
        public int waterConsumed;

        /// <summary>Whether rest was interrupted.</summary>
        public bool wasInterrupted;

        /// <summary>Any encounters that occurred.</summary>
        public List<CampEncounter> encounters = new List<CampEncounter>();

        /// <summary>Time phase at the end of rest.</summary>
        public TimePhase endPhase;

        /// <summary>Summary description.</summary>
        public string summary;
    }

    /// <summary>
    /// Serializable state for save/load functionality.
    /// </summary>
    [Serializable]
    public class CampingSystemSaveData
    {
        /// <summary>Whether player is currently camping.</summary>
        public bool isCamping;

        /// <summary>Current fire state.</summary>
        public string fireState;

        /// <summary>Fuel remaining for fire.</summary>
        public float fuelRemaining;

        /// <summary>Time camping started (total game minutes).</summary>
        public int campStartTime;

        /// <summary>Total hours camped this session.</summary>
        public float hoursCamped;

        /// <summary>Current camp state.</summary>
        public string campState;

        /// <summary>Current terrain type.</summary>
        public string currentTerrain;
    }

    /// <summary>
    /// Event arguments for camping events.
    /// </summary>
    public class CampingEventArgs : EventArgs
    {
        public CampState State { get; }
        public CampingResult Result { get; }
        public CampEncounter Encounter { get; }

        public CampingEventArgs(CampState state, CampingResult result = null, CampEncounter encounter = null)
        {
            State = state;
            Result = result;
            Encounter = encounter;
        }
    }

    /// <summary>
    /// CampingSystem manages wilderness camping, rest, fire management, and encounters.
    /// Integrates with TimeSystem, WeatherSystem, and encounter systems.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript camping.ts.
    /// Features:
    /// - Make camp action (only in wilderness)
    /// - Rest duration selection (2/4/8 hours)
    /// - Fatigue recovery with fire/no-fire options
    /// - Random encounter chances while camping
    /// - Provisions consumption during camping
    /// - Fire management for safety vs. visibility tradeoff
    /// </remarks>
    public class CampingSystem : MonoBehaviour
    {
        #region Singleton

        private static CampingSystem _instance;

        /// <summary>
        /// Global singleton instance of CampingSystem.
        /// </summary>
        public static CampingSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<CampingSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[CampingSystem]");
                        _instance = go.AddComponent<CampingSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when camp is set up.</summary>
        public event EventHandler<CampingEventArgs> OnCampSetup;

        /// <summary>Fired when camp is broken.</summary>
        public event EventHandler<CampingEventArgs> OnCampBreak;

        /// <summary>Fired when rest is complete.</summary>
        public event EventHandler<CampingEventArgs> OnRestComplete;

        /// <summary>Fired when an encounter occurs during camping.</summary>
        public event EventHandler<CampingEventArgs> OnEncounterOccurred;

        /// <summary>Fired when fire state changes.</summary>
        public event EventHandler<FireState> OnFireStateChanged;

        #endregion

        #region Configuration

        [Header("Recovery Rates (per hour)")]
        [SerializeField]
        [Tooltip("Fatigue recovery per hour without fire")]
        private float recoveryRateNoFire = 12f;

        [SerializeField]
        [Tooltip("Fatigue recovery per hour with fire")]
        private float recoveryRateWithFire = 15f;

        [SerializeField]
        [Tooltip("Bonus fatigue recovery during day")]
        private float dayBonus = 3f;

        [Header("Fire Settings")]
        [SerializeField]
        [Tooltip("Safety bonus against hostile encounters (0-1)")]
        [Range(0f, 1f)]
        private float fireSafetyBonus = 0.5f;

        [SerializeField]
        [Tooltip("Detection range increase with fire")]
        private float fireVisibilityIncrease = 2f;

        [SerializeField]
        [Tooltip("Fuel consumption per hour")]
        private float fuelPerHour = 1f;

        [Header("Encounter Settings")]
        [SerializeField]
        [Tooltip("Base encounter chance per hour (0-1)")]
        [Range(0f, 1f)]
        private float baseEncounterChance = 0.15f;

        [SerializeField]
        [Tooltip("Night encounter multiplier")]
        private float nightMultiplier = 1.5f;

        [Header("Terrain Modifiers")]
        [SerializeField]
        [Tooltip("Badlands terrain modifier (+30%)")]
        private float badlandsModifier = 1.3f;

        [SerializeField]
        [Tooltip("Forest terrain modifier (+20%)")]
        private float forestModifier = 1.2f;

        [SerializeField]
        [Tooltip("Mountains terrain modifier (+10%)")]
        private float mountainsModifier = 1.1f;

        [SerializeField]
        [Tooltip("Desert terrain modifier (-20%)")]
        private float desertModifier = 0.8f;

        [SerializeField]
        [Tooltip("Riverside terrain modifier (-10%)")]
        private float riversideModifier = 0.9f;

        [Header("Encounter Data")]
        [SerializeField]
        [Tooltip("Wildlife attack encounter data")]
        private EncounterData wildlifeEncounterData;

        [SerializeField]
        [Tooltip("Bandit raid encounter data")]
        private EncounterData banditRaidEncounterData;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Encounter Descriptions

        private static readonly Dictionary<CampEncounterType, string[]> EncounterDescriptions = new Dictionary<CampEncounterType, string[]>
        {
            { CampEncounterType.None, Array.Empty<string>() },
            { CampEncounterType.WildlifePassive, new[] {
                "A curious rabbit watches your camp from a distance.",
                "An owl hoots softly from a nearby tree.",
                "A family of deer passes by peacefully.",
                "You hear coyotes howling in the distance."
            }},
            { CampEncounterType.WildlifeHostile, new[] {
                "A rattlesnake slithers into your camp!",
                "A pack of coyotes circles your camp, drawn by the smell of food.",
                "You wake to find a mountain lion prowling nearby!",
                "An angry javelina charges out of the brush!"
            }},
            { CampEncounterType.BanditScout, new[] {
                "You spot a figure watching your camp from the shadows.",
                "The sound of hooves retreating quickly catches your attention.",
                "You find fresh boot prints around your camp perimeter."
            }},
            { CampEncounterType.BanditRaid, new[] {
                "Armed men emerge from the darkness, demanding your valuables!",
                "You wake to find bandits rifling through your belongings!",
                "A voice calls out: \"Nobody moves, nobody gets hurt!\""
            }},
            { CampEncounterType.TravelerFriendly, new[] {
                "A weary traveler asks to share your fire.",
                "A prospector passes by and shares some water.",
                "A friendly trader offers to share news of the road ahead."
            }},
            { CampEncounterType.TravelerSuspicious, new[] {
                "A stranger in a long coat watches your camp from a distance.",
                "Someone approaches but turns away when they see you're awake.",
                "You notice someone has been going through your things..."
            }},
            { CampEncounterType.WeatherEvent, new[] {
                "A sudden dust storm forces you to take cover.",
                "Thunder rumbles as a storm rolls in.",
                "The temperature drops sharply as night deepens."
            }},
            { CampEncounterType.Discovery, new[] {
                "You find an old trail marker pointing to a hidden spring.",
                "Digging to make camp, you uncover an old coin purse.",
                "You spot tracks leading to what might be an abandoned mine."
            }}
        };

        #endregion

        #region Encounter Probabilities

        private static readonly Dictionary<CampEncounterType, float> EncounterProbabilities = new Dictionary<CampEncounterType, float>
        {
            { CampEncounterType.None, 0f },
            { CampEncounterType.WildlifePassive, 0.25f },
            { CampEncounterType.WildlifeHostile, 0.15f },
            { CampEncounterType.BanditScout, 0.15f },
            { CampEncounterType.BanditRaid, 0.10f },
            { CampEncounterType.TravelerFriendly, 0.15f },
            { CampEncounterType.TravelerSuspicious, 0.10f },
            { CampEncounterType.WeatherEvent, 0.05f },
            { CampEncounterType.Discovery, 0.05f }
        };

        #endregion

        #region State

        private bool _isCamping = false;
        private FireState _fireState = FireState.None;
        private float _fuelRemaining = 0f;
        private int _campStartTime = 0;
        private float _hoursCamped = 0f;
        private CampState _campState = CampState.Active;
        private CampTerrainType _currentTerrain = CampTerrainType.Plains;
        private List<CampEncounter> _sessionEncounters = new List<CampEncounter>();

        #endregion

        #region Properties

        /// <summary>Whether player is currently camping.</summary>
        public bool IsCamping => _isCamping;

        /// <summary>Current fire state.</summary>
        public FireState CurrentFireState => _fireState;

        /// <summary>Whether there is an active fire.</summary>
        public bool HasFire => _fireState != FireState.None;

        /// <summary>Fuel remaining for the fire.</summary>
        public float FuelRemaining => _fuelRemaining;

        /// <summary>Total hours camped this session.</summary>
        public float HoursCamped => _hoursCamped;

        /// <summary>Current camp state.</summary>
        public CampState CurrentCampState => _campState;

        /// <summary>Current terrain type.</summary>
        public CampTerrainType CurrentTerrain => _currentTerrain;

        /// <summary>Available rest durations.</summary>
        public RestDuration[] AvailableRestDurations => new[] { RestDuration.Short, RestDuration.Medium, RestDuration.Full };

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

            Log("CampingSystem initialized");
        }

        private void Start()
        {
            // Register with SaveSystem
            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.RegisterSaveProvider("camping", GetSaveDataJson);
                SaveSystem.Instance.RegisterLoadConsumer("camping", LoadSaveDataJson);
            }
        }

        private void OnDestroy()
        {
            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.Unregister("camping");
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Public API - Camp Queries

        /// <summary>
        /// Checks if camping is possible in the given terrain.
        /// </summary>
        /// <param name="terrain">Current terrain type.</param>
        /// <returns>Whether camping is allowed.</returns>
        public bool CanCamp(CampTerrainType terrain)
        {
            // Cannot camp in towns
            return terrain != CampTerrainType.Town;
        }

        /// <summary>
        /// Estimates fatigue recovery for a rest duration.
        /// </summary>
        /// <param name="duration">Rest duration.</param>
        /// <param name="hasFire">Whether fire is active.</param>
        /// <param name="isDay">Whether it's daytime.</param>
        /// <returns>Estimated fatigue recovery.</returns>
        public float EstimateRecovery(RestDuration duration, bool hasFire, bool isDay)
        {
            float rate = hasFire ? recoveryRateWithFire : recoveryRateNoFire;
            if (isDay)
            {
                rate += dayBonus;
            }
            return (int)duration * rate;
        }

        /// <summary>
        /// Gets the encounter chance for current conditions.
        /// </summary>
        /// <param name="terrain">Current terrain type.</param>
        /// <param name="isNight">Whether it's night time.</param>
        /// <param name="hasFire">Whether fire is active.</param>
        /// <returns>Encounter chance per hour (0-1).</returns>
        public float GetEncounterChance(CampTerrainType terrain, bool isNight, bool hasFire)
        {
            float chance = baseEncounterChance;

            // Apply terrain modifier
            chance *= GetTerrainModifier(terrain);

            // Apply night multiplier
            if (isNight)
            {
                chance *= nightMultiplier;
            }

            // Fire provides safety but increases visibility
            // Net effect: slight reduction in hostile encounters
            if (hasFire)
            {
                chance *= 1f - fireSafetyBonus * 0.3f;
            }

            return Mathf.Clamp01(chance);
        }

        /// <summary>
        /// Gets the terrain modifier for encounter rates.
        /// </summary>
        private float GetTerrainModifier(CampTerrainType terrain)
        {
            return terrain switch
            {
                CampTerrainType.Badlands => badlandsModifier,
                CampTerrainType.Forest => forestModifier,
                CampTerrainType.Mountains => mountainsModifier,
                CampTerrainType.Desert => desertModifier,
                CampTerrainType.Riverside => riversideModifier,
                CampTerrainType.Town => 0f, // No camping in town
                _ => 1.0f // Plains, Grassland = normal
            };
        }

        /// <summary>
        /// Gets the display name for a rest duration.
        /// </summary>
        public string GetRestDurationLabel(RestDuration duration)
        {
            return duration switch
            {
                RestDuration.Short => "Short Rest (2 hours)",
                RestDuration.Medium => "Medium Rest (4 hours)",
                RestDuration.Full => "Full Rest (8 hours)",
                _ => "Rest"
            };
        }

        /// <summary>
        /// Gets the recommended rest duration based on fatigue level.
        /// </summary>
        /// <param name="fatigue">Current fatigue (0-100).</param>
        /// <returns>Recommended rest duration.</returns>
        public RestDuration GetRecommendedRestDuration(float fatigue)
        {
            if (fatigue >= 75f) return RestDuration.Full;
            if (fatigue >= 50f) return RestDuration.Medium;
            return RestDuration.Short;
        }

        #endregion

        #region Public API - Camp Management

        /// <summary>
        /// Sets up a camp site.
        /// </summary>
        /// <param name="terrain">Current terrain type.</param>
        /// <param name="withFire">Whether to start a fire.</param>
        /// <param name="fuelAmount">Amount of fuel for the fire.</param>
        public void SetupCamp(CampTerrainType terrain, bool withFire = false, float fuelAmount = 0f)
        {
            if (!CanCamp(terrain))
            {
                Log($"Cannot camp in terrain: {terrain}");
                return;
            }

            _isCamping = true;
            _currentTerrain = terrain;
            _campStartTime = TimeSystem.Instance?.TotalMinutes ?? 0;
            _hoursCamped = 0f;
            _sessionEncounters.Clear();
            _campState = CampState.Active;

            if (withFire && fuelAmount > 0)
            {
                _fireState = FireState.Burning;
                _fuelRemaining = fuelAmount;
            }
            else
            {
                _fireState = FireState.None;
                _fuelRemaining = 0f;
            }

            // Transition to Camp phase
            GameManager.Instance?.SetPhase(GamePhase.Camp);

            // Emit events
            var args = new CampingEventArgs(CampState.Active);
            OnCampSetup?.Invoke(this, args);
            EventBus.Instance?.Publish("camp_setup", terrain.ToString());

            Log($"Camp set up in {terrain} (fire: {withFire}, fuel: {fuelAmount})");
        }

        /// <summary>
        /// Adds fuel to the fire.
        /// </summary>
        /// <param name="amount">Fuel to add.</param>
        public void AddFuel(float amount)
        {
            _fuelRemaining += amount;

            var previousState = _fireState;
            if (_fireState == FireState.None || _fireState == FireState.Smoldering)
            {
                _fireState = FireState.Burning;
            }

            if (_fuelRemaining > 8f)
            {
                _fireState = FireState.Blazing;
            }

            if (_fireState != previousState)
            {
                OnFireStateChanged?.Invoke(this, _fireState);
            }

            Log($"Added {amount} fuel, total: {_fuelRemaining}, state: {_fireState}");
        }

        /// <summary>
        /// Breaks camp and cleans up.
        /// </summary>
        public void BreakCamp()
        {
            if (!_isCamping)
            {
                Log("Not currently camping");
                return;
            }

            Log("Breaking camp");

            _isCamping = false;
            _fireState = FireState.None;
            _fuelRemaining = 0f;
            _campState = CampState.Active;

            // Return to appropriate phase
            if (GameManager.Instance != null)
            {
                if (GameManager.Instance.CurrentTownId != null)
                {
                    GameManager.Instance.SetPhase(GamePhase.Town);
                }
                else
                {
                    GameManager.Instance.SetPhase(GamePhase.Overworld);
                }
            }

            // Emit events
            var args = new CampingEventArgs(CampState.Complete);
            OnCampBreak?.Invoke(this, args);
            EventBus.Instance?.Publish("camp_break", string.Empty);
        }

        /// <summary>
        /// Performs rest activity at camp.
        /// </summary>
        /// <param name="duration">Rest duration in hours.</param>
        /// <returns>Camping result.</returns>
        public CampingResult Rest(RestDuration duration)
        {
            if (!_isCamping)
            {
                Log("Cannot rest - not camping");
                return null;
            }

            _campState = CampState.Resting;

            int hours = (int)duration;
            int hoursRested = 0;
            float fatigueRecovered = 0f;
            var encounters = new List<CampEncounter>();
            bool wasInterrupted = false;

            Log($"Starting rest for {hours} hours");

            // Rest hour by hour to check for encounters
            for (int hour = 0; hour < hours && !wasInterrupted; hour++)
            {
                bool isNight = TimeSystem.Instance?.IsNight ?? false;

                // Check for encounter
                var encounter = CheckEncounter(_currentTerrain, isNight);
                if (encounter.type != CampEncounterType.None)
                {
                    encounters.Add(encounter);
                    _sessionEncounters.Add(encounter);

                    // Emit encounter event
                    var encounterArgs = new CampingEventArgs(CampState.Resting, null, encounter);
                    OnEncounterOccurred?.Invoke(this, encounterArgs);
                    EventBus.Instance?.Publish("camp_encounter", encounter.type.ToString());

                    if (encounter.wakesPlayer)
                    {
                        wasInterrupted = true;
                        _campState = CampState.Interrupted;
                        hoursRested = hour;

                        // If combat encounter, transition to combat
                        if (encounter.isCombat && encounter.encounterData != null)
                        {
                            EventBus.Instance?.Publish("combat_started", encounter.encounterId);
                        }

                        break;
                    }
                }

                // Consume fuel
                if (HasFire)
                {
                    _fuelRemaining -= fuelPerHour;
                    if (_fuelRemaining <= 0)
                    {
                        _fuelRemaining = 0f;
                        var previousState = _fireState;
                        _fireState = FireState.Smoldering;

                        if (previousState != _fireState)
                        {
                            OnFireStateChanged?.Invoke(this, _fireState);
                        }
                    }
                }

                // Advance time
                TimeSystem.Instance?.AdvanceHours(1, false);

                hoursRested = hour + 1;
            }

            // Calculate fatigue recovery
            float recoveryRate = HasFire ? recoveryRateWithFire : recoveryRateNoFire;
            bool isDay = !(TimeSystem.Instance?.IsNight ?? false);
            float dayBonusApplied = isDay ? dayBonus : 0f;

            fatigueRecovered = hoursRested * (recoveryRate + dayBonusApplied);

            // Update state
            _hoursCamped += hoursRested;

            if (!wasInterrupted)
            {
                _campState = CampState.Complete;
            }

            // Generate summary
            string summary = wasInterrupted
                ? $"Your rest was interrupted after {hoursRested} hour{(hoursRested != 1 ? "s" : "")}!"
                : $"You rested for {hoursRested} hour{(hoursRested != 1 ? "s" : "")}.";

            if (encounters.Count > 0)
            {
                summary += $" You had {encounters.Count} encounter{(encounters.Count != 1 ? "s" : "")}.";
            }

            var result = new CampingResult
            {
                hoursRested = hoursRested,
                fatigueRecovered = fatigueRecovered,
                foodConsumed = 0, // Would integrate with ProvisionsSystem
                waterConsumed = 0, // Would integrate with ProvisionsSystem
                wasInterrupted = wasInterrupted,
                encounters = encounters,
                endPhase = TimeSystem.Instance?.CurrentPhase ?? TimePhase.Day,
                summary = summary
            };

            // Emit rest complete event
            var args = new CampingEventArgs(_campState, result);
            OnRestComplete?.Invoke(this, args);
            EventBus.Instance?.Publish("rest_complete", summary);

            Log(summary);

            return result;
        }

        /// <summary>
        /// Checks for a random encounter while camping.
        /// </summary>
        /// <param name="terrain">Current terrain type.</param>
        /// <param name="isNight">Whether it's night time.</param>
        /// <returns>Encounter result.</returns>
        public CampEncounter CheckEncounter(CampTerrainType terrain, bool isNight)
        {
            float chance = GetEncounterChance(terrain, isNight, HasFire);

            // Roll for encounter
            if (UnityEngine.Random.value > chance)
            {
                return new CampEncounter
                {
                    type = CampEncounterType.None,
                    isCombat = false,
                    description = string.Empty,
                    wakesPlayer = false
                };
            }

            // Determine encounter type
            var encounterType = RollEncounterType();

            return GenerateEncounter(encounterType);
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Rolls for an encounter type based on probabilities.
        /// </summary>
        private CampEncounterType RollEncounterType()
        {
            float roll = UnityEngine.Random.value;
            float cumulative = 0f;

            foreach (var kvp in EncounterProbabilities)
            {
                if (kvp.Key == CampEncounterType.None) continue;

                cumulative += kvp.Value;
                if (roll < cumulative)
                {
                    return kvp.Key;
                }
            }

            return CampEncounterType.WildlifePassive; // Fallback
        }

        /// <summary>
        /// Generates an encounter with full details.
        /// </summary>
        private CampEncounter GenerateEncounter(CampEncounterType type)
        {
            string[] descriptions = EncounterDescriptions.ContainsKey(type)
                ? EncounterDescriptions[type]
                : Array.Empty<string>();

            string description = descriptions.Length > 0
                ? descriptions[UnityEngine.Random.Range(0, descriptions.Length)]
                : string.Empty;

            var encounter = new CampEncounter
            {
                type = type,
                isCombat = false,
                description = description,
                wakesPlayer = false,
                resourceChange = new ResourceChange()
            };

            // Customize based on type
            switch (type)
            {
                case CampEncounterType.WildlifeHostile:
                    encounter.isCombat = true;
                    encounter.encounterId = "camp_wildlife_attack";
                    encounter.encounterData = wildlifeEncounterData;
                    encounter.wakesPlayer = true;
                    break;

                case CampEncounterType.BanditRaid:
                    encounter.isCombat = true;
                    encounter.encounterId = "camp_bandit_raid";
                    encounter.encounterData = banditRaidEncounterData;
                    encounter.wakesPlayer = true;
                    break;

                case CampEncounterType.BanditScout:
                    // May or may not wake player
                    encounter.wakesPlayer = UnityEngine.Random.value > 0.5f;
                    break;

                case CampEncounterType.TravelerSuspicious:
                    encounter.wakesPlayer = true;
                    if (UnityEngine.Random.value > 0.7f)
                    {
                        int goldLoss = UnityEngine.Random.Range(5, 15);
                        encounter.resourceChange = new ResourceChange(0, 0, -goldLoss);
                    }
                    break;

                case CampEncounterType.Discovery:
                    encounter.wakesPlayer = false;
                    int goldGain = UnityEngine.Random.Range(5, 20);
                    encounter.resourceChange = new ResourceChange(0, 0, goldGain);
                    break;

                case CampEncounterType.WeatherEvent:
                    encounter.wakesPlayer = true;
                    break;

                case CampEncounterType.WildlifePassive:
                case CampEncounterType.TravelerFriendly:
                default:
                    // No special handling needed
                    break;
            }

            Log($"Generated encounter: {type} (wakes: {encounter.wakesPlayer}, combat: {encounter.isCombat})");

            return encounter;
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data for serialization.
        /// </summary>
        public CampingSystemSaveData GetSaveData()
        {
            return new CampingSystemSaveData
            {
                isCamping = _isCamping,
                fireState = _fireState.ToString(),
                fuelRemaining = _fuelRemaining,
                campStartTime = _campStartTime,
                hoursCamped = _hoursCamped,
                campState = _campState.ToString(),
                currentTerrain = _currentTerrain.ToString()
            };
        }

        /// <summary>
        /// Load state from save data.
        /// </summary>
        public void LoadSaveData(CampingSystemSaveData data)
        {
            _isCamping = data.isCamping;
            Enum.TryParse(data.fireState, out _fireState);
            _fuelRemaining = data.fuelRemaining;
            _campStartTime = data.campStartTime;
            _hoursCamped = data.hoursCamped;
            Enum.TryParse(data.campState, out _campState);
            Enum.TryParse(data.currentTerrain, out _currentTerrain);

            Log($"Loaded: camping={_isCamping}, fire={_fireState}");
        }

        /// <summary>
        /// Get save data as JSON string for SaveSystem integration.
        /// </summary>
        private string GetSaveDataJson()
        {
            return JsonUtility.ToJson(GetSaveData());
        }

        /// <summary>
        /// Load save data from JSON string for SaveSystem integration.
        /// </summary>
        private void LoadSaveDataJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return;

            try
            {
                var data = JsonUtility.FromJson<CampingSystemSaveData>(json);
                LoadSaveData(data);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[CampingSystem] Failed to load save data: {e.Message}");
            }
        }

        /// <summary>
        /// Resets to default state.
        /// </summary>
        public void Reset()
        {
            _isCamping = false;
            _fireState = FireState.None;
            _fuelRemaining = 0f;
            _campStartTime = 0;
            _hoursCamped = 0f;
            _campState = CampState.Active;
            _currentTerrain = CampTerrainType.Plains;
            _sessionEncounters.Clear();

            Log("Reset to default");
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[CampingSystem] {message}");
            }
        }

        #endregion
    }
}
