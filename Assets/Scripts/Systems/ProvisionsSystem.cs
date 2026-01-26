using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;
using IronFrontier.Player;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Provision status levels based on percentage of maximum.
    /// </summary>
    public enum ProvisionStatus
    {
        /// <summary>Greater than 75% - well stocked.</summary>
        Abundant,
        /// <summary>50-75% - comfortable levels.</summary>
        Adequate,
        /// <summary>25-50% - running low, consider restocking.</summary>
        Low,
        /// <summary>10-25% - critically low, resupply urgently needed.</summary>
        Critical,
        /// <summary>Less than 10% - depleted, survival effects active.</summary>
        Depleted
    }

    /// <summary>
    /// Terrain types for foraging chance calculations.
    /// Maps to BiomeType for game integration.
    /// </summary>
    public enum ForagingTerrainType
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
    /// Result of a hunting attempt.
    /// </summary>
    [Serializable]
    public class HuntingResult
    {
        /// <summary>Whether the hunt was successful.</summary>
        public bool success;

        /// <summary>Amount of food gained.</summary>
        public int foodGained;

        /// <summary>Amount of water gained (from animal sources).</summary>
        public int waterGained;

        /// <summary>Fatigue cost of the hunt.</summary>
        public int fatigueCost;

        /// <summary>Time spent hunting (in game hours).</summary>
        public int timeSpent;

        /// <summary>Flavor text describing the hunt.</summary>
        public string description;
    }

    /// <summary>
    /// Result of a foraging attempt.
    /// </summary>
    [Serializable]
    public class ForagingResult
    {
        /// <summary>Whether foraging found anything.</summary>
        public bool success;

        /// <summary>Amount of food found.</summary>
        public int foodFound;

        /// <summary>Amount of water found.</summary>
        public int waterFound;

        /// <summary>Time spent foraging (in game hours).</summary>
        public float timeSpent;

        /// <summary>What was found (for flavor text).</summary>
        public List<string> foundItems;
    }

    /// <summary>
    /// Event arguments for provision changes.
    /// </summary>
    public class ProvisionsChangedEventArgs : EventArgs
    {
        /// <summary>Current food amount.</summary>
        public int Food { get; }

        /// <summary>Current water amount.</summary>
        public int Water { get; }

        /// <summary>Food status level.</summary>
        public ProvisionStatus FoodStatus { get; }

        /// <summary>Water status level.</summary>
        public ProvisionStatus WaterStatus { get; }

        /// <summary>Food consumed in this event.</summary>
        public int FoodConsumed { get; }

        /// <summary>Water consumed in this event.</summary>
        public int WaterConsumed { get; }

        public ProvisionsChangedEventArgs(int food, int water, ProvisionStatus foodStatus,
            ProvisionStatus waterStatus, int foodConsumed = 0, int waterConsumed = 0)
        {
            Food = food;
            Water = water;
            FoodStatus = foodStatus;
            WaterStatus = waterStatus;
            FoodConsumed = foodConsumed;
            WaterConsumed = waterConsumed;
        }
    }

    /// <summary>
    /// Event arguments for status level changes.
    /// </summary>
    public class ProvisionStatusChangedEventArgs : EventArgs
    {
        /// <summary>Whether this is a food status change (false = water).</summary>
        public bool IsFood { get; }

        /// <summary>Previous status level.</summary>
        public ProvisionStatus PreviousStatus { get; }

        /// <summary>New status level.</summary>
        public ProvisionStatus NewStatus { get; }

        public ProvisionStatusChangedEventArgs(bool isFood, ProvisionStatus previous, ProvisionStatus newStatus)
        {
            IsFood = isFood;
            PreviousStatus = previous;
            NewStatus = newStatus;
        }
    }

    /// <summary>
    /// Serializable save data for ProvisionsSystem.
    /// </summary>
    [Serializable]
    public class ProvisionsSystemSaveData
    {
        public int food;
        public int water;
        public float hoursSinceFood;
        public float hoursSinceWater;
    }

    /// <summary>
    /// ProvisionsSystem manages player food and water supplies during travel.
    /// Tracks consumption, applies survival effects when depleted, and handles
    /// hunting and foraging for resupply.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript systems/provisions.ts.
    /// Features:
    /// - Separate tracking for food and water
    /// - Consumption during travel (4 food/hour, 6 water/hour)
    /// - Effects when running out (increased fatigue, health drain)
    /// - Hunting mini-game for acquiring food
    /// - Foraging based on terrain type
    /// - Serializable state for save/load
    /// </remarks>
    public class ProvisionsSystem : MonoBehaviour
    {
        #region Singleton

        private static ProvisionsSystem _instance;

        /// <summary>
        /// Global singleton instance of ProvisionsSystem.
        /// </summary>
        public static ProvisionsSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<ProvisionsSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[ProvisionsSystem]");
                        _instance = go.AddComponent<ProvisionsSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when provision amounts change.</summary>
        public event EventHandler<ProvisionsChangedEventArgs> OnProvisionsChanged;

        /// <summary>Fired when food is depleted (reaches zero).</summary>
        public event EventHandler OnFoodDepleted;

        /// <summary>Fired when water is depleted (reaches zero).</summary>
        public event EventHandler OnWaterDepleted;

        /// <summary>Fired when food or water status level changes.</summary>
        public event EventHandler<ProvisionStatusChangedEventArgs> OnStatusChanged;

        /// <summary>Fired when a hunt is completed.</summary>
        public event EventHandler<HuntingResult> OnHuntCompleted;

        /// <summary>Fired when foraging is completed.</summary>
        public event EventHandler<ForagingResult> OnForagingCompleted;

        #endregion

        #region Constants

        /// <summary>Maximum food capacity.</summary>
        public const int MAX_FOOD = 100;

        /// <summary>Maximum water capacity.</summary>
        public const int MAX_WATER = 100;

        /// <summary>Food consumed per hour of travel.</summary>
        public const int FOOD_PER_HOUR = 4;

        /// <summary>Water consumed per hour of travel.</summary>
        public const int WATER_PER_HOUR = 6;

        /// <summary>Fatigue multiplier when out of food.</summary>
        public const float NO_FOOD_FATIGUE_MULTIPLIER = 2.0f;

        /// <summary>Fatigue multiplier when out of water.</summary>
        public const float NO_WATER_FATIGUE_MULTIPLIER = 3.0f;

        /// <summary>HP damage per hour when dehydrated.</summary>
        public const int DEHYDRATION_DAMAGE_PER_HOUR = 5;

        /// <summary>Base hunting success chance.</summary>
        public const float HUNTING_BASE_CHANCE = 0.6f;

        /// <summary>Time required for hunting (game hours).</summary>
        public const int HUNTING_DURATION = 2;

        /// <summary>Fatigue cost of hunting.</summary>
        public const int HUNTING_FATIGUE_COST = 15;

        /// <summary>Minimum food yield from successful hunt.</summary>
        public const int HUNTING_FOOD_MIN = 15;

        /// <summary>Maximum food yield from successful hunt.</summary>
        public const int HUNTING_FOOD_MAX = 30;

        /// <summary>Chance of finding water while hunting.</summary>
        public const float HUNTING_WATER_CHANCE = 0.3f;

        /// <summary>Minimum water yield from hunt.</summary>
        public const int HUNTING_WATER_MIN = 5;

        /// <summary>Maximum water yield from hunt.</summary>
        public const int HUNTING_WATER_MAX = 15;

        #endregion

        #region Configuration

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Maximum food capacity")]
        private int maxFood = MAX_FOOD;

        [SerializeField]
        [Tooltip("Maximum water capacity")]
        private int maxWater = MAX_WATER;

        [SerializeField]
        [Tooltip("Food consumed per hour of travel")]
        private int foodPerHour = FOOD_PER_HOUR;

        [SerializeField]
        [Tooltip("Water consumed per hour of travel")]
        private int waterPerHour = WATER_PER_HOUR;

        [Header("Starting Values")]
        [SerializeField]
        [Tooltip("Starting food amount")]
        private int startingFood = 75;

        [SerializeField]
        [Tooltip("Starting water amount")]
        private int startingWater = 75;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region State

        private int _food;
        private int _water;
        private float _hoursSinceFood;
        private float _hoursSinceWater;
        private ProvisionStatus _previousFoodStatus;
        private ProvisionStatus _previousWaterStatus;
        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>Current food amount.</summary>
        public int Food => _food;

        /// <summary>Current water amount.</summary>
        public int Water => _water;

        /// <summary>Maximum food capacity.</summary>
        public int MaxFood => maxFood;

        /// <summary>Maximum water capacity.</summary>
        public int MaxWater => maxWater;

        /// <summary>Food as a percentage of maximum (0-1).</summary>
        public float FoodPercentage => (float)_food / maxFood;

        /// <summary>Water as a percentage of maximum (0-1).</summary>
        public float WaterPercentage => (float)_water / maxWater;

        /// <summary>Current food status level.</summary>
        public ProvisionStatus FoodStatus => GetStatus(FoodPercentage);

        /// <summary>Current water status level.</summary>
        public ProvisionStatus WaterStatus => GetStatus(WaterPercentage);

        /// <summary>Overall status (worst of food/water).</summary>
        public ProvisionStatus OverallStatus
        {
            get
            {
                var foodStatus = FoodStatus;
                var waterStatus = WaterStatus;
                return (int)foodStatus > (int)waterStatus ? foodStatus : waterStatus;
            }
        }

        /// <summary>Whether player has any food.</summary>
        public bool HasFood => _food > 0;

        /// <summary>Whether player has any water.</summary>
        public bool HasWater => _water > 0;

        /// <summary>Hours since last food consumption.</summary>
        public float HoursSinceFood => _hoursSinceFood;

        /// <summary>Hours since last water consumption.</summary>
        public float HoursSinceWater => _hoursSinceWater;

        /// <summary>Whether the system is initialized.</summary>
        public bool IsInitialized => _isInitialized;

        #endregion

        #region Foraging Chances

        /// <summary>Foraging success chances by terrain type.</summary>
        private static readonly Dictionary<ForagingTerrainType, float> ForagingChances = new Dictionary<ForagingTerrainType, float>
        {
            { ForagingTerrainType.Riverside, 0.60f },
            { ForagingTerrainType.Forest, 0.50f },
            { ForagingTerrainType.Grassland, 0.35f },
            { ForagingTerrainType.Plains, 0.25f },
            { ForagingTerrainType.Mountains, 0.15f },
            { ForagingTerrainType.Badlands, 0.10f },
            { ForagingTerrainType.Desert, 0.05f },
            { ForagingTerrainType.Town, 0f }
        };

        /// <summary>Foraging yield ranges by terrain type.</summary>
        private static readonly Dictionary<ForagingTerrainType, (int foodMin, int foodMax, int waterMin, int waterMax)> ForagingYields =
            new Dictionary<ForagingTerrainType, (int, int, int, int)>
        {
            { ForagingTerrainType.Desert, (1, 3, 0, 1) },
            { ForagingTerrainType.Plains, (2, 6, 1, 3) },
            { ForagingTerrainType.Grassland, (3, 8, 2, 5) },
            { ForagingTerrainType.Forest, (5, 12, 3, 8) },
            { ForagingTerrainType.Mountains, (2, 5, 2, 6) },
            { ForagingTerrainType.Badlands, (1, 4, 0, 2) },
            { ForagingTerrainType.Riverside, (4, 10, 8, 15) },
            { ForagingTerrainType.Town, (0, 0, 0, 0) }
        };

        /// <summary>Foraging item descriptions by terrain.</summary>
        private static readonly Dictionary<ForagingTerrainType, string[]> ForagingItems = new Dictionary<ForagingTerrainType, string[]>
        {
            { ForagingTerrainType.Desert, new[] { "cactus fruit", "desert roots", "lizard eggs" } },
            { ForagingTerrainType.Plains, new[] { "wild berries", "prairie herbs", "small game" } },
            { ForagingTerrainType.Grassland, new[] { "wild vegetables", "bird eggs", "edible flowers" } },
            { ForagingTerrainType.Forest, new[] { "mushrooms", "nuts", "wild berries", "herbs" } },
            { ForagingTerrainType.Mountains, new[] { "mountain berries", "pine nuts", "spring water" } },
            { ForagingTerrainType.Badlands, new[] { "tough roots", "snake eggs", "bitter herbs" } },
            { ForagingTerrainType.Riverside, new[] { "fish", "crawfish", "watercress", "fresh water" } },
            { ForagingTerrainType.Town, new string[0] }
        };

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
            Log("ProvisionsSystem initialized");
        }

        private void Start()
        {
            // Subscribe to time events
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged += OnHourChanged;
            }

            _isInitialized = true;
        }

        private void OnDestroy()
        {
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged -= OnHourChanged;
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Time Integration

        private void OnHourChanged(object sender, TimeChangedEventArgs args)
        {
            // Update time since last consumption
            if (!HasFood)
            {
                _hoursSinceFood += 1f;
            }

            if (!HasWater)
            {
                _hoursSinceWater += 1f;

                // Apply dehydration damage
                ApplyDehydrationDamage();
            }
        }

        #endregion

        #region Public API - Queries

        /// <summary>
        /// Get the fatigue multiplier based on provision status.
        /// </summary>
        /// <returns>Multiplier to apply to fatigue accumulation.</returns>
        public float GetFatigueMultiplier()
        {
            float multiplier = 1.0f;

            if (!HasFood)
            {
                multiplier *= NO_FOOD_FATIGUE_MULTIPLIER;
            }
            if (!HasWater)
            {
                multiplier *= NO_WATER_FATIGUE_MULTIPLIER;
            }

            return multiplier;
        }

        /// <summary>
        /// Get health damage from dehydration (per hour).
        /// Returns 0 if player has water.
        /// </summary>
        public int GetDehydrationDamage()
        {
            return HasWater ? 0 : DEHYDRATION_DAMAGE_PER_HOUR;
        }

        /// <summary>
        /// Estimate hours of travel until food runs out.
        /// </summary>
        public float EstimateFoodDuration()
        {
            if (!HasFood) return 0f;
            return (float)_food / foodPerHour;
        }

        /// <summary>
        /// Estimate hours of travel until water runs out.
        /// </summary>
        public float EstimateWaterDuration()
        {
            if (!HasWater) return 0f;
            return (float)_water / waterPerHour;
        }

        /// <summary>
        /// Get a human-readable description of provision status.
        /// </summary>
        public string GetDescription()
        {
            var foodStatus = FoodStatus;
            var waterStatus = WaterStatus;

            if (foodStatus == ProvisionStatus.Depleted && waterStatus == ProvisionStatus.Depleted)
            {
                return "You are starving and severely dehydrated. Find supplies immediately!";
            }
            if (waterStatus == ProvisionStatus.Depleted)
            {
                return "You are severely dehydrated. Your health is draining!";
            }
            if (foodStatus == ProvisionStatus.Depleted)
            {
                return "You are starving. Fatigue is building rapidly.";
            }
            if (foodStatus == ProvisionStatus.Critical || waterStatus == ProvisionStatus.Critical)
            {
                return "Supplies are critically low. Resupply soon or hunt for food.";
            }
            if (foodStatus == ProvisionStatus.Low || waterStatus == ProvisionStatus.Low)
            {
                return "Supplies are running low. Consider restocking.";
            }
            if (foodStatus == ProvisionStatus.Abundant && waterStatus == ProvisionStatus.Abundant)
            {
                return "Well-stocked with provisions.";
            }
            return "Supplies are adequate for now.";
        }

        /// <summary>
        /// Get the foraging success chance for a terrain type.
        /// </summary>
        /// <param name="terrain">Terrain type.</param>
        /// <returns>Success chance (0-1).</returns>
        public float GetForagingChance(ForagingTerrainType terrain)
        {
            return ForagingChances.TryGetValue(terrain, out float chance) ? chance : 0f;
        }

        /// <summary>
        /// Check if provisions are sufficient for a journey.
        /// </summary>
        /// <param name="travelHours">Estimated travel time.</param>
        /// <returns>Whether provisions are sufficient.</returns>
        public bool HasEnoughProvisions(float travelHours)
        {
            int foodNeeded = Mathf.CeilToInt(travelHours * foodPerHour);
            int waterNeeded = Mathf.CeilToInt(travelHours * waterPerHour);
            return _food >= foodNeeded && _water >= waterNeeded;
        }

        #endregion

        #region Public API - Consumption

        /// <summary>
        /// Consume provisions for a travel duration.
        /// </summary>
        /// <param name="hours">Hours of travel.</param>
        /// <returns>Object with amounts consumed and any warnings.</returns>
        public (int foodConsumed, int waterConsumed, bool ranOutOfFood, bool ranOutOfWater) ConsumeForTravel(float hours)
        {
            int foodToConsume = Mathf.RoundToInt(hours * foodPerHour);
            int waterToConsume = Mathf.RoundToInt(hours * waterPerHour);

            int previousFood = _food;
            int previousWater = _water;
            var previousFoodStatus = FoodStatus;
            var previousWaterStatus = WaterStatus;

            _food = Mathf.Max(0, _food - foodToConsume);
            _water = Mathf.Max(0, _water - waterToConsume);

            // Track time since consumption
            if (HasFood)
            {
                _hoursSinceFood = 0f;
            }
            else
            {
                _hoursSinceFood += hours;
            }

            if (HasWater)
            {
                _hoursSinceWater = 0f;
            }
            else
            {
                _hoursSinceWater += hours;
            }

            int foodConsumed = previousFood - _food;
            int waterConsumed = previousWater - _water;
            bool ranOutOfFood = previousFood > 0 && _food == 0;
            bool ranOutOfWater = previousWater > 0 && _water == 0;

            Log($"Consumed {foodConsumed} food, {waterConsumed} water for {hours}h travel");

            // Check for status changes and emit events
            CheckAndEmitStatusChanges(previousFoodStatus, previousWaterStatus);

            if (ranOutOfFood)
            {
                OnFoodDepleted?.Invoke(this, EventArgs.Empty);
                EventBus.Instance?.Publish("provisions_food_depleted", string.Empty);
            }
            if (ranOutOfWater)
            {
                OnWaterDepleted?.Invoke(this, EventArgs.Empty);
                EventBus.Instance?.Publish("provisions_water_depleted", string.Empty);
            }

            EmitProvisionsChanged(foodConsumed, waterConsumed);

            return (foodConsumed, waterConsumed, ranOutOfFood, ranOutOfWater);
        }

        /// <summary>
        /// Consume provisions while camping (reduced rate).
        /// </summary>
        /// <param name="hours">Hours of camping.</param>
        /// <returns>Object with amounts consumed.</returns>
        public (int foodConsumed, int waterConsumed) ConsumeForCamping(float hours)
        {
            // Half consumption rate while camping
            int foodToConsume = Mathf.RoundToInt((hours * foodPerHour) / 2f);
            int waterToConsume = Mathf.RoundToInt((hours * waterPerHour) / 2f);

            int previousFood = _food;
            int previousWater = _water;
            var previousFoodStatus = FoodStatus;
            var previousWaterStatus = WaterStatus;

            _food = Mathf.Max(0, _food - foodToConsume);
            _water = Mathf.Max(0, _water - waterToConsume);

            int foodConsumed = previousFood - _food;
            int waterConsumed = previousWater - _water;

            Log($"Consumed {foodConsumed} food, {waterConsumed} water for {hours}h camping");

            CheckAndEmitStatusChanges(previousFoodStatus, previousWaterStatus);
            EmitProvisionsChanged(foodConsumed, waterConsumed);

            return (foodConsumed, waterConsumed);
        }

        #endregion

        #region Public API - Provision Modification

        /// <summary>
        /// Add food to inventory (clamped to max).
        /// </summary>
        /// <param name="amount">Amount of food to add.</param>
        public void AddFood(int amount)
        {
            if (amount <= 0) return;

            var previousStatus = FoodStatus;
            _food = Mathf.Min(maxFood, _food + amount);
            _hoursSinceFood = 0f;

            Log($"Added {amount} food. Total: {_food}");

            CheckAndEmitStatusChanges(previousStatus, WaterStatus);
            EmitProvisionsChanged(0, 0);
        }

        /// <summary>
        /// Add water to inventory (clamped to max).
        /// </summary>
        /// <param name="amount">Amount of water to add.</param>
        public void AddWater(int amount)
        {
            if (amount <= 0) return;

            var previousStatus = WaterStatus;
            _water = Mathf.Min(maxWater, _water + amount);
            _hoursSinceWater = 0f;

            Log($"Added {amount} water. Total: {_water}");

            CheckAndEmitStatusChanges(FoodStatus, previousStatus);
            EmitProvisionsChanged(0, 0);
        }

        /// <summary>
        /// Add both food and water.
        /// </summary>
        /// <param name="food">Amount of food to add.</param>
        /// <param name="water">Amount of water to add.</param>
        public void AddProvisions(int food, int water)
        {
            AddFood(food);
            AddWater(water);
        }

        /// <summary>
        /// Refill provisions to maximum (e.g., at a town).
        /// </summary>
        public void RefillAll()
        {
            var previousFoodStatus = FoodStatus;
            var previousWaterStatus = WaterStatus;

            _food = maxFood;
            _water = maxWater;
            _hoursSinceFood = 0f;
            _hoursSinceWater = 0f;

            Log("Provisions refilled to maximum");

            CheckAndEmitStatusChanges(previousFoodStatus, previousWaterStatus);
            EmitProvisionsChanged(0, 0);
        }

        #endregion

        #region Public API - Hunting & Foraging

        /// <summary>
        /// Attempt to hunt for food.
        /// </summary>
        /// <param name="skillModifier">Player's hunting skill modifier (0-1 bonus).</param>
        /// <returns>Hunting result with gains and costs.</returns>
        public HuntingResult AttemptHunt(float skillModifier = 0f)
        {
            float successChance = Mathf.Min(1f, HUNTING_BASE_CHANCE + skillModifier);
            bool success = UnityEngine.Random.value < successChance;

            var result = new HuntingResult
            {
                success = success,
                fatigueCost = HUNTING_FATIGUE_COST,
                timeSpent = HUNTING_DURATION
            };

            if (!success)
            {
                result.foodGained = 0;
                result.waterGained = 0;
                result.description = "The hunt was unsuccessful. No game was found.";
            }
            else
            {
                // Calculate yields
                result.foodGained = UnityEngine.Random.Range(HUNTING_FOOD_MIN, HUNTING_FOOD_MAX + 1);
                result.description = $"You caught game and gained {result.foodGained} food.";

                // Chance for water
                if (UnityEngine.Random.value < HUNTING_WATER_CHANCE)
                {
                    result.waterGained = UnityEngine.Random.Range(HUNTING_WATER_MIN, HUNTING_WATER_MAX + 1);
                    result.description += $" You also found {result.waterGained} water.";
                }

                // Apply the gains
                AddProvisions(result.foodGained, result.waterGained);
            }

            Log($"Hunt result: success={success}, food={result.foodGained}, water={result.waterGained}");

            // Apply fatigue cost to player stats
            ApplyFatigueCost(result.fatigueCost);

            // Advance game time
            AdvanceGameTime(result.timeSpent);

            OnHuntCompleted?.Invoke(this, result);
            EventBus.Instance?.Publish("provisions_hunt_completed", success ? "success" : "failure");

            return result;
        }

        /// <summary>
        /// Attempt to forage for provisions based on terrain.
        /// </summary>
        /// <param name="terrain">Current terrain type.</param>
        /// <returns>Foraging result.</returns>
        public ForagingResult AttemptForage(ForagingTerrainType terrain)
        {
            float chance = GetForagingChance(terrain);

            var result = new ForagingResult
            {
                foundItems = new List<string>()
            };

            // Zero chance means impossible (e.g., in town)
            if (chance <= 0f || UnityEngine.Random.value >= chance)
            {
                result.success = false;
                result.foodFound = 0;
                result.waterFound = 0;
                result.timeSpent = 0.5f; // Half hour spent looking

                Log($"Foraging failed in {terrain}");
            }
            else
            {
                result.success = true;
                result.timeSpent = 1f; // One hour foraging

                // Calculate yields
                if (ForagingYields.TryGetValue(terrain, out var yields))
                {
                    result.foodFound = UnityEngine.Random.Range(yields.foodMin, yields.foodMax + 1);
                    result.waterFound = UnityEngine.Random.Range(yields.waterMin, yields.waterMax + 1);
                }

                // Pick random items found
                if (ForagingItems.TryGetValue(terrain, out var items) && items.Length > 0)
                {
                    int numItems = Mathf.Min(items.Length, 1 + UnityEngine.Random.Range(0, 2));
                    var availableItems = new List<string>(items);

                    for (int i = 0; i < numItems && availableItems.Count > 0; i++)
                    {
                        int idx = UnityEngine.Random.Range(0, availableItems.Count);
                        result.foundItems.Add(availableItems[idx]);
                        availableItems.RemoveAt(idx);
                    }
                }

                // Apply the gains
                AddProvisions(result.foodFound, result.waterFound);

                Log($"Foraging succeeded in {terrain}: food={result.foodFound}, water={result.waterFound}");
            }

            // Advance game time (half hour for failed, one hour for success)
            AdvanceGameTime(Mathf.CeilToInt(result.timeSpent));

            OnForagingCompleted?.Invoke(this, result);
            EventBus.Instance?.Publish("provisions_forage_completed", result.success ? "success" : "failure");

            return result;
        }

        /// <summary>
        /// Convert BiomeType to ForagingTerrainType for foraging.
        /// </summary>
        /// <param name="biome">Biome type from WeatherSystem.</param>
        /// <returns>Corresponding foraging terrain type.</returns>
        public ForagingTerrainType BiomeToForagingTerrain(BiomeType biome)
        {
            return biome switch
            {
                BiomeType.Desert => ForagingTerrainType.Desert,
                BiomeType.Plains => ForagingTerrainType.Plains,
                BiomeType.Canyon => ForagingTerrainType.Badlands,
                BiomeType.Badlands => ForagingTerrainType.Badlands,
                BiomeType.Mountains => ForagingTerrainType.Mountains,
                BiomeType.Riverside => ForagingTerrainType.Riverside,
                BiomeType.Forest => ForagingTerrainType.Forest,
                _ => ForagingTerrainType.Plains
            };
        }

        /// <summary>
        /// Attempt foraging using the current biome.
        /// </summary>
        /// <returns>Foraging result.</returns>
        public ForagingResult AttemptForageCurrentBiome()
        {
            var biome = WeatherSystem.Instance?.CurrentBiome ?? BiomeType.Plains;
            return AttemptForage(BiomeToForagingTerrain(biome));
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data for serialization.
        /// </summary>
        public ProvisionsSystemSaveData GetSaveData()
        {
            return new ProvisionsSystemSaveData
            {
                food = _food,
                water = _water,
                hoursSinceFood = _hoursSinceFood,
                hoursSinceWater = _hoursSinceWater
            };
        }

        /// <summary>
        /// Load state from save data.
        /// </summary>
        public void LoadSaveData(ProvisionsSystemSaveData data)
        {
            if (data == null) return;

            _food = Mathf.Clamp(data.food, 0, maxFood);
            _water = Mathf.Clamp(data.water, 0, maxWater);
            _hoursSinceFood = data.hoursSinceFood;
            _hoursSinceWater = data.hoursSinceWater;

            _previousFoodStatus = FoodStatus;
            _previousWaterStatus = WaterStatus;

            Log($"Loaded: food={_food}, water={_water}");
        }

        /// <summary>
        /// Reset to default starting state.
        /// </summary>
        public void ResetToDefault()
        {
            _food = startingFood;
            _water = startingWater;
            _hoursSinceFood = 0f;
            _hoursSinceWater = 0f;
            _previousFoodStatus = FoodStatus;
            _previousWaterStatus = WaterStatus;

            Log($"Reset to default: food={_food}, water={_water}");
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Convert a percentage to a provision status.
        /// </summary>
        private ProvisionStatus GetStatus(float percentage)
        {
            if (percentage >= 0.75f) return ProvisionStatus.Abundant;
            if (percentage >= 0.50f) return ProvisionStatus.Adequate;
            if (percentage >= 0.25f) return ProvisionStatus.Low;
            if (percentage >= 0.10f) return ProvisionStatus.Critical;
            return ProvisionStatus.Depleted;
        }

        /// <summary>
        /// Check for status changes and emit events.
        /// </summary>
        private void CheckAndEmitStatusChanges(ProvisionStatus previousFoodStatus, ProvisionStatus previousWaterStatus)
        {
            var currentFoodStatus = FoodStatus;
            var currentWaterStatus = WaterStatus;

            if (currentFoodStatus != previousFoodStatus)
            {
                OnStatusChanged?.Invoke(this, new ProvisionStatusChangedEventArgs(true, previousFoodStatus, currentFoodStatus));
                Log($"Food status changed: {previousFoodStatus} -> {currentFoodStatus}");
            }

            if (currentWaterStatus != previousWaterStatus)
            {
                OnStatusChanged?.Invoke(this, new ProvisionStatusChangedEventArgs(false, previousWaterStatus, currentWaterStatus));
                Log($"Water status changed: {previousWaterStatus} -> {currentWaterStatus}");
            }

            _previousFoodStatus = currentFoodStatus;
            _previousWaterStatus = currentWaterStatus;
        }

        /// <summary>
        /// Emit provisions changed event.
        /// </summary>
        private void EmitProvisionsChanged(int foodConsumed, int waterConsumed)
        {
            var args = new ProvisionsChangedEventArgs(
                _food, _water, FoodStatus, WaterStatus, foodConsumed, waterConsumed
            );
            OnProvisionsChanged?.Invoke(this, args);
        }

        /// <summary>
        /// Apply dehydration damage to player.
        /// </summary>
        private void ApplyDehydrationDamage()
        {
            if (HasWater) return;

            int damage = DEHYDRATION_DAMAGE_PER_HOUR;

            if (PlayerStats.Instance != null)
            {
                PlayerStats.Instance.TakeDamage(damage, ignoreDefense: true);
                Log($"Dehydration damage: {damage} HP");
            }
        }

        /// <summary>
        /// Apply fatigue cost from hunting.
        /// </summary>
        private void ApplyFatigueCost(int cost)
        {
            // Use stamina as fatigue proxy
            if (PlayerStats.Instance != null)
            {
                PlayerStats.Instance.UseStamina(cost);
            }
        }

        /// <summary>
        /// Advance game time for hunting/foraging.
        /// </summary>
        private void AdvanceGameTime(int hours)
        {
            if (TimeSystem.Instance != null && hours > 0)
            {
                TimeSystem.Instance.AdvanceHours(hours);
            }
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[ProvisionsSystem] {message}");
            }
        }

        #endregion
    }
}
