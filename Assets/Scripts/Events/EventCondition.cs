using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Events
{
    /// <summary>
    /// Types of conditions that can gate event availability.
    /// </summary>
    public enum ConditionType
    {
        /// <summary>Check time of day.</summary>
        TimeOfDay,
        /// <summary>Check minimum player level.</summary>
        MinLevel,
        /// <summary>Check maximum player level.</summary>
        MaxLevel,
        /// <summary>Check minimum gold amount.</summary>
        MinGold,
        /// <summary>Check minimum health percentage.</summary>
        MinHealthPercent,
        /// <summary>Check for required item in inventory.</summary>
        RequiredItem,
        /// <summary>Check for any of required items in inventory.</summary>
        RequiredItemAny,
        /// <summary>Check for required flag.</summary>
        RequiredFlag,
        /// <summary>Check for forbidden flag.</summary>
        ForbiddenFlag,
        /// <summary>Check minimum reputation with faction.</summary>
        MinReputation,
        /// <summary>Check maximum reputation with faction.</summary>
        MaxReputation,
        /// <summary>Check for completed quest.</summary>
        CompletedQuest,
        /// <summary>Check for active quest.</summary>
        ActiveQuest,
        /// <summary>Check current location ID.</summary>
        LocationId,
        /// <summary>Check current region ID.</summary>
        RegionId,
        /// <summary>Check current terrain type.</summary>
        TerrainType,
        /// <summary>Check current weather.</summary>
        Weather,
        /// <summary>Check current season.</summary>
        Season,
        /// <summary>Random chance check.</summary>
        RandomChance
    }

    /// <summary>
    /// Represents a single condition for event availability.
    /// </summary>
    [Serializable]
    public struct EventCondition
    {
        /// <summary>Type of condition to check.</summary>
        public ConditionType type;

        /// <summary>Target value for comparison (faction name, flag name, item id, etc).</summary>
        public string target;

        /// <summary>Numeric value for comparison.</summary>
        public float value;

        /// <summary>String value for comparison (time of day, weather, etc).</summary>
        public string stringValue;

        /// <summary>List of valid string values.</summary>
        public List<string> validValues;

        /// <summary>Creates a time of day condition.</summary>
        public static EventCondition TimeOfDayCondition(params string[] validTimes)
        {
            return new EventCondition
            {
                type = ConditionType.TimeOfDay,
                validValues = new List<string>(validTimes)
            };
        }

        /// <summary>Creates a minimum level condition.</summary>
        public static EventCondition MinLevelCondition(int level)
        {
            return new EventCondition
            {
                type = ConditionType.MinLevel,
                value = level
            };
        }

        /// <summary>Creates a maximum level condition.</summary>
        public static EventCondition MaxLevelCondition(int level)
        {
            return new EventCondition
            {
                type = ConditionType.MaxLevel,
                value = level
            };
        }

        /// <summary>Creates a minimum gold condition.</summary>
        public static EventCondition MinGoldCondition(int gold)
        {
            return new EventCondition
            {
                type = ConditionType.MinGold,
                value = gold
            };
        }

        /// <summary>Creates a required item condition.</summary>
        public static EventCondition RequiredItemCondition(string itemId)
        {
            return new EventCondition
            {
                type = ConditionType.RequiredItem,
                target = itemId
            };
        }

        /// <summary>Creates a required item (any) condition.</summary>
        public static EventCondition RequiredItemAnyCondition(params string[] itemIds)
        {
            return new EventCondition
            {
                type = ConditionType.RequiredItemAny,
                validValues = new List<string>(itemIds)
            };
        }

        /// <summary>Creates a required flag condition.</summary>
        public static EventCondition RequiredFlagCondition(string flag)
        {
            return new EventCondition
            {
                type = ConditionType.RequiredFlag,
                target = flag
            };
        }

        /// <summary>Creates a forbidden flag condition.</summary>
        public static EventCondition ForbiddenFlagCondition(string flag)
        {
            return new EventCondition
            {
                type = ConditionType.ForbiddenFlag,
                target = flag
            };
        }

        /// <summary>Creates a minimum reputation condition.</summary>
        public static EventCondition MinReputationCondition(string faction, int reputation)
        {
            return new EventCondition
            {
                type = ConditionType.MinReputation,
                target = faction,
                value = reputation
            };
        }

        /// <summary>Creates a maximum reputation condition.</summary>
        public static EventCondition MaxReputationCondition(string faction, int reputation)
        {
            return new EventCondition
            {
                type = ConditionType.MaxReputation,
                target = faction,
                value = reputation
            };
        }

        /// <summary>Creates a random chance condition.</summary>
        public static EventCondition RandomChanceCondition(float chance)
        {
            return new EventCondition
            {
                type = ConditionType.RandomChance,
                value = Mathf.Clamp01(chance)
            };
        }
    }

    /// <summary>
    /// Context data for evaluating event conditions.
    /// </summary>
    public struct EventContext
    {
        /// <summary>Current time of day.</summary>
        public TimeOfDay timeOfDay;

        /// <summary>Player level.</summary>
        public int playerLevel;

        /// <summary>Player gold amount.</summary>
        public int playerGold;

        /// <summary>Player health percentage (0-1).</summary>
        public float playerHealthPercent;

        /// <summary>Player inventory item IDs.</summary>
        public HashSet<string> inventory;

        /// <summary>Faction reputation values.</summary>
        public Dictionary<string, int> factionReputation;

        /// <summary>Active game flags.</summary>
        public HashSet<string> gameFlags;

        /// <summary>Completed quest IDs.</summary>
        public HashSet<string> completedQuests;

        /// <summary>Active quest IDs.</summary>
        public HashSet<string> activeQuests;

        /// <summary>Current location ID.</summary>
        public string currentLocationId;

        /// <summary>Current region ID.</summary>
        public string currentRegionId;

        /// <summary>Current terrain type.</summary>
        public string currentTerrain;

        /// <summary>Current weather.</summary>
        public string currentWeather;

        /// <summary>Current season.</summary>
        public string currentSeason;

        /// <summary>Creates a default context with empty collections.</summary>
        public static EventContext CreateDefault()
        {
            return new EventContext
            {
                timeOfDay = TimeOfDay.Morning,
                playerLevel = 1,
                playerGold = 0,
                playerHealthPercent = 1f,
                inventory = new HashSet<string>(),
                factionReputation = new Dictionary<string, int>(),
                gameFlags = new HashSet<string>(),
                completedQuests = new HashSet<string>(),
                activeQuests = new HashSet<string>(),
                currentLocationId = "",
                currentRegionId = "",
                currentTerrain = "desert",
                currentWeather = "clear",
                currentSeason = "summer"
            };
        }
    }

    /// <summary>
    /// Static utility class for checking event conditions.
    /// </summary>
    public static class EventConditionChecker
    {
        /// <summary>
        /// Checks if all conditions are met for the given context.
        /// </summary>
        /// <param name="conditions">List of conditions to check.</param>
        /// <param name="context">Current game context.</param>
        /// <returns>True if all conditions are met.</returns>
        public static bool CheckAllConditions(List<EventCondition> conditions, EventContext context)
        {
            if (conditions == null || conditions.Count == 0)
                return true;

            return conditions.All(c => CheckCondition(c, context));
        }

        /// <summary>
        /// Checks if a single condition is met.
        /// </summary>
        /// <param name="condition">Condition to check.</param>
        /// <param name="context">Current game context.</param>
        /// <returns>True if the condition is met.</returns>
        public static bool CheckCondition(EventCondition condition, EventContext context)
        {
            switch (condition.type)
            {
                case ConditionType.TimeOfDay:
                    return CheckTimeOfDay(condition, context);

                case ConditionType.MinLevel:
                    return context.playerLevel >= (int)condition.value;

                case ConditionType.MaxLevel:
                    return context.playerLevel <= (int)condition.value;

                case ConditionType.MinGold:
                    return context.playerGold >= (int)condition.value;

                case ConditionType.MinHealthPercent:
                    return context.playerHealthPercent >= condition.value;

                case ConditionType.RequiredItem:
                    return context.inventory != null && context.inventory.Contains(condition.target);

                case ConditionType.RequiredItemAny:
                    return CheckRequiredItemAny(condition, context);

                case ConditionType.RequiredFlag:
                    return context.gameFlags != null && context.gameFlags.Contains(condition.target);

                case ConditionType.ForbiddenFlag:
                    return context.gameFlags == null || !context.gameFlags.Contains(condition.target);

                case ConditionType.MinReputation:
                    return CheckMinReputation(condition, context);

                case ConditionType.MaxReputation:
                    return CheckMaxReputation(condition, context);

                case ConditionType.CompletedQuest:
                    return context.completedQuests != null && context.completedQuests.Contains(condition.target);

                case ConditionType.ActiveQuest:
                    return context.activeQuests != null && context.activeQuests.Contains(condition.target);

                case ConditionType.LocationId:
                    return CheckLocationId(condition, context);

                case ConditionType.RegionId:
                    return CheckRegionId(condition, context);

                case ConditionType.TerrainType:
                    return CheckTerrainType(condition, context);

                case ConditionType.Weather:
                    return CheckWeather(condition, context);

                case ConditionType.Season:
                    return CheckSeason(condition, context);

                case ConditionType.RandomChance:
                    return UnityEngine.Random.value <= condition.value;

                default:
                    Debug.LogWarning($"[EventConditionChecker] Unknown condition type: {condition.type}");
                    return true;
            }
        }

        private static bool CheckTimeOfDay(EventCondition condition, EventContext context)
        {
            if (condition.validValues == null || condition.validValues.Count == 0)
                return true;

            string currentTime = context.timeOfDay.ToString().ToLowerInvariant();
            return condition.validValues.Any(v =>
                v.ToLowerInvariant() == currentTime ||
                v.ToLowerInvariant() == "any");
        }

        private static bool CheckRequiredItemAny(EventCondition condition, EventContext context)
        {
            if (condition.validValues == null || condition.validValues.Count == 0)
                return true;

            if (context.inventory == null)
                return false;

            return condition.validValues.Any(item => context.inventory.Contains(item));
        }

        private static bool CheckMinReputation(EventCondition condition, EventContext context)
        {
            if (context.factionReputation == null)
                return false;

            if (context.factionReputation.TryGetValue(condition.target, out int rep))
                return rep >= (int)condition.value;

            return 0 >= (int)condition.value; // Default reputation is 0
        }

        private static bool CheckMaxReputation(EventCondition condition, EventContext context)
        {
            if (context.factionReputation == null)
                return true;

            if (context.factionReputation.TryGetValue(condition.target, out int rep))
                return rep <= (int)condition.value;

            return 0 <= (int)condition.value; // Default reputation is 0
        }

        private static bool CheckLocationId(EventCondition condition, EventContext context)
        {
            if (condition.validValues != null && condition.validValues.Count > 0)
            {
                return condition.validValues.Contains(context.currentLocationId);
            }
            return condition.target == context.currentLocationId;
        }

        private static bool CheckRegionId(EventCondition condition, EventContext context)
        {
            if (condition.validValues != null && condition.validValues.Count > 0)
            {
                return condition.validValues.Contains(context.currentRegionId);
            }
            return condition.target == context.currentRegionId;
        }

        private static bool CheckTerrainType(EventCondition condition, EventContext context)
        {
            if (condition.validValues != null && condition.validValues.Count > 0)
            {
                return condition.validValues.Any(v =>
                    v.ToLowerInvariant() == context.currentTerrain?.ToLowerInvariant());
            }
            return condition.stringValue?.ToLowerInvariant() == context.currentTerrain?.ToLowerInvariant();
        }

        private static bool CheckWeather(EventCondition condition, EventContext context)
        {
            if (condition.validValues != null && condition.validValues.Count > 0)
            {
                return condition.validValues.Any(v =>
                    v.ToLowerInvariant() == context.currentWeather?.ToLowerInvariant());
            }
            return condition.stringValue?.ToLowerInvariant() == context.currentWeather?.ToLowerInvariant();
        }

        private static bool CheckSeason(EventCondition condition, EventContext context)
        {
            if (condition.validValues != null && condition.validValues.Count > 0)
            {
                return condition.validValues.Any(v =>
                    v.ToLowerInvariant() == context.currentSeason?.ToLowerInvariant());
            }
            return condition.stringValue?.ToLowerInvariant() == context.currentSeason?.ToLowerInvariant();
        }

        /// <summary>
        /// Filters a list of items by their conditions.
        /// </summary>
        /// <typeparam name="T">Type with conditions.</typeparam>
        /// <param name="items">Items to filter.</param>
        /// <param name="getConditions">Function to get conditions from an item.</param>
        /// <param name="context">Current game context.</param>
        /// <returns>Filtered list of items.</returns>
        public static List<T> FilterByConditions<T>(
            IEnumerable<T> items,
            Func<T, List<EventCondition>> getConditions,
            EventContext context)
        {
            return items.Where(item => CheckAllConditions(getConditions(item), context)).ToList();
        }
    }
}
