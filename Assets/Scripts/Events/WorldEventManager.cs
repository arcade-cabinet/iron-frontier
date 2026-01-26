using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Inventory;
using IronFrontier.Quests;
using IronFrontier.Systems;

namespace IronFrontier.Events
{
    /// <summary>
    /// Event rarity classifications.
    /// </summary>
    public enum EventRarity
    {
        Common,
        Uncommon,
        Rare,
        Legendary
    }

    /// <summary>
    /// Event categories for filtering.
    /// </summary>
    public enum EventCategory
    {
        Travel,
        Town,
        Camp,
        Story,
        World
    }

    /// <summary>
    /// Types of effects that events can apply.
    /// </summary>
    public enum EventEffectType
    {
        GiveGold,
        TakeGold,
        GiveItem,
        TakeItem,
        GiveXp,
        Heal,
        Damage,
        ChangeMorale,
        ChangeReputation,
        SetFlag,
        RemoveFlag,
        TriggerCombat,
        StartQuest,
        UnlockLocation,
        RevealLore,
        TriggerEvent
    }

    /// <summary>
    /// Represents an effect applied when an event choice is selected.
    /// </summary>
    [Serializable]
    public struct EventEffect
    {
        /// <summary>Type of effect.</summary>
        public EventEffectType type;

        /// <summary>Target for the effect (item id, faction name, etc).</summary>
        public string target;

        /// <summary>Numeric value.</summary>
        public int value;

        /// <summary>Range for random value [min, max].</summary>
        public int[] valueRange;

        /// <summary>String value for flags, lore, etc.</summary>
        public string stringValue;

        /// <summary>Chance of effect occurring (0-1).</summary>
        [Range(0f, 1f)]
        public float chance;

        /// <summary>Gets the actual value, potentially randomized from range.</summary>
        public int GetValue()
        {
            if (valueRange != null && valueRange.Length == 2)
            {
                return UnityEngine.Random.Range(valueRange[0], valueRange[1] + 1);
            }
            return value;
        }

        /// <summary>Checks if this effect should occur based on chance.</summary>
        public bool ShouldOccur()
        {
            if (chance <= 0 || chance >= 1f)
                return true;
            return UnityEngine.Random.value <= chance;
        }
    }

    /// <summary>
    /// Represents a skill check within an event choice.
    /// </summary>
    [Serializable]
    public struct SkillCheck
    {
        /// <summary>Skill to check (combat, speech, survival, stealth, medicine).</summary>
        public string skill;

        /// <summary>Difficulty (0-100).</summary>
        [Range(0, 100)]
        public int difficulty;

        /// <summary>Text shown on success.</summary>
        [TextArea(1, 3)]
        public string successText;

        /// <summary>Text shown on failure.</summary>
        [TextArea(1, 3)]
        public string failureText;

        /// <summary>Effects applied on success.</summary>
        public List<EventEffect> successEffects;

        /// <summary>Effects applied on failure.</summary>
        public List<EventEffect> failureEffects;
    }

    /// <summary>
    /// Represents a choice the player can make during an event.
    /// </summary>
    [Serializable]
    public class EventChoice
    {
        /// <summary>Choice identifier.</summary>
        public string id;

        /// <summary>Display text for the choice.</summary>
        public string text;

        /// <summary>Tooltip text.</summary>
        public string tooltip;

        /// <summary>Result text shown after selecting.</summary>
        [TextArea(2, 4)]
        public string resultText;

        /// <summary>Conditions required to show this choice.</summary>
        public List<EventCondition> conditions = new List<EventCondition>();

        /// <summary>Effects applied when chosen.</summary>
        public List<EventEffect> effects = new List<EventEffect>();

        /// <summary>Optional skill check.</summary>
        public SkillCheck? skillCheck;

        /// <summary>Tags describing this choice.</summary>
        public List<string> tags = new List<string>();
    }

    /// <summary>
    /// Represents a random event that can occur during gameplay.
    /// </summary>
    [Serializable]
    public class RandomEventData
    {
        /// <summary>Unique identifier.</summary>
        public string id;

        /// <summary>Display title.</summary>
        public string title;

        /// <summary>Event description.</summary>
        [TextArea(3, 6)]
        public string description;

        /// <summary>Event category.</summary>
        public EventCategory category;

        /// <summary>Event rarity.</summary>
        public EventRarity rarity;

        /// <summary>Weight for random selection.</summary>
        public float weight = 1f;

        /// <summary>Spawn conditions.</summary>
        public List<EventCondition> conditions = new List<EventCondition>();

        /// <summary>Available choices.</summary>
        public List<EventChoice> choices = new List<EventChoice>();

        /// <summary>Can this event repeat?</summary>
        public bool repeatable = true;

        /// <summary>Cooldown in game hours.</summary>
        public int cooldownHours = 24;

        /// <summary>Tags for filtering.</summary>
        public List<string> tags = new List<string>();
    }

    /// <summary>
    /// Represents a world-scale event that affects the game world.
    /// </summary>
    [Serializable]
    public class WorldEvent
    {
        /// <summary>Unique identifier.</summary>
        public string id;

        /// <summary>Display name.</summary>
        public string name;

        /// <summary>Description.</summary>
        [TextArea(2, 4)]
        public string description;

        /// <summary>Event type (ongoing, weather, economic, story).</summary>
        public string type;

        /// <summary>Duration in game hours (-1 for permanent).</summary>
        public int duration;

        /// <summary>Start time (game time).</summary>
        public float startTime;

        /// <summary>Is this event currently active?</summary>
        public bool isActive;

        /// <summary>World-scale effects.</summary>
        public WorldEventEffects effects;

        /// <summary>Trigger conditions.</summary>
        public List<EventCondition> triggerConditions = new List<EventCondition>();

        /// <summary>End conditions.</summary>
        public List<EventCondition> endConditions = new List<EventCondition>();
    }

    /// <summary>
    /// Effects that a world event has on the game.
    /// </summary>
    [Serializable]
    public struct WorldEventEffects
    {
        /// <summary>Multiplier for encounter rates.</summary>
        public float encounterMultiplier;

        /// <summary>Multiplier for shop prices.</summary>
        public float shopPriceModifier;

        /// <summary>Multiplier for gold prices.</summary>
        public float goldPrice;

        /// <summary>Multiplier for mining tool prices.</summary>
        public float miningToolPrice;

        /// <summary>Multiplier for tech item drop rates.</summary>
        public float techItemDropRate;

        /// <summary>Multiplier for remnant spawn rates.</summary>
        public float remnantSpawnRate;

        /// <summary>Multiplier for wildlife aggression.</summary>
        public float wildlifeAggression;

        /// <summary>Multiplier for water consumption.</summary>
        public float waterConsumption;

        /// <summary>Multiplier for crop yield.</summary>
        public float cropYield;

        /// <summary>Faction hostility modifiers.</summary>
        public Dictionary<string, int> factionHostility;
    }

    /// <summary>
    /// Manages random events and world events in the game.
    /// </summary>
    public class WorldEventManager : MonoBehaviour
    {
        #region Singleton
        private static WorldEventManager _instance;
        public static WorldEventManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<WorldEventManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("WorldEventManager");
                        _instance = go.AddComponent<WorldEventManager>();
                    }
                }
                return _instance;
            }
        }
        #endregion

        #region Events
        /// <summary>Fired when a random event is triggered.</summary>
        public event Action<RandomEventData> OnRandomEventTriggered;

        /// <summary>Fired when a player makes an event choice.</summary>
        public event Action<RandomEventData, EventChoice, bool> OnEventChoiceSelected;

        /// <summary>Fired when event effects are applied.</summary>
        public event Action<List<EventEffect>> OnEffectsApplied;

        /// <summary>Fired when a world event starts.</summary>
        public event Action<WorldEvent> OnWorldEventStarted;

        /// <summary>Fired when a world event ends.</summary>
        public event Action<WorldEvent> OnWorldEventEnded;
        #endregion

        #region Serialized Fields
        [Header("Configuration")]
        [Tooltip("Path to events JSON in Resources")]
        [SerializeField] private string eventsJsonPath = "Data/Events/events";

        [Tooltip("Enable debug logging")]
        [SerializeField] private bool debugMode = false;
        #endregion

        #region Private Fields
        private Dictionary<string, RandomEventData> _events = new Dictionary<string, RandomEventData>();
        private Dictionary<string, WorldEvent> _worldEvents = new Dictionary<string, WorldEvent>();
        private List<WorldEvent> _activeWorldEvents = new List<WorldEvent>();
        private Dictionary<string, float> _rarityWeights = new Dictionary<string, float>();

        // Cooldown tracking
        private Dictionary<string, float> _eventCooldowns = new Dictionary<string, float>();
        private HashSet<string> _triggeredUniqueEvents = new HashSet<string>();

        // Current event state
        private RandomEventData _currentEvent;
        private EventContext _currentContext;

        private bool _isInitialized;
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

            LoadEventData();
        }

        private void Update()
        {
            if (!_isInitialized) return;

            // Update active world events
            UpdateWorldEvents();
        }
        #endregion

        #region Public API
        /// <summary>
        /// Updates the current game context for event filtering.
        /// </summary>
        public void SetContext(EventContext context)
        {
            _currentContext = context;
        }

        /// <summary>
        /// Attempts to trigger a random event for the specified category.
        /// </summary>
        /// <param name="category">Event category to check.</param>
        /// <returns>True if an event was triggered.</returns>
        public bool TryTriggerRandomEvent(EventCategory category)
        {
            var eligibleEvents = GetEligibleEvents(category);
            if (eligibleEvents.Count == 0)
            {
                if (debugMode)
                    Debug.Log($"[WorldEventManager] No eligible events for category: {category}");
                return false;
            }

            var selectedEvent = SelectWeightedEvent(eligibleEvents);
            if (selectedEvent == null)
                return false;

            TriggerEvent(selectedEvent);
            return true;
        }

        /// <summary>
        /// Forces a specific event to trigger by ID.
        /// </summary>
        public void TriggerEventById(string eventId)
        {
            if (_events.TryGetValue(eventId, out var eventData))
            {
                TriggerEvent(eventData);
            }
            else
            {
                Debug.LogWarning($"[WorldEventManager] Event not found: {eventId}");
            }
        }

        /// <summary>
        /// Gets the currently active event.
        /// </summary>
        public RandomEventData GetCurrentEvent() => _currentEvent;

        /// <summary>
        /// Gets available choices for the current event based on context.
        /// </summary>
        public List<EventChoice> GetAvailableChoices()
        {
            if (_currentEvent == null)
                return new List<EventChoice>();

            return _currentEvent.choices
                .Where(c => EventConditionChecker.CheckAllConditions(c.conditions, _currentContext))
                .ToList();
        }

        /// <summary>
        /// Selects a choice for the current event.
        /// </summary>
        /// <param name="choiceId">ID of the choice to select.</param>
        /// <returns>Result text and whether a skill check passed (if applicable).</returns>
        public (string resultText, bool? skillCheckPassed) SelectChoice(string choiceId)
        {
            if (_currentEvent == null)
            {
                Debug.LogWarning("[WorldEventManager] No active event");
                return ("", null);
            }

            var choice = _currentEvent.choices.FirstOrDefault(c => c.id == choiceId);
            if (choice == null)
            {
                Debug.LogWarning($"[WorldEventManager] Choice not found: {choiceId}");
                return ("", null);
            }

            string resultText = choice.resultText;
            bool? skillCheckPassed = null;
            List<EventEffect> effectsToApply;

            // Handle skill check if present
            if (choice.skillCheck.HasValue)
            {
                var check = choice.skillCheck.Value;
                skillCheckPassed = PerformSkillCheck(check.skill, check.difficulty);

                if (skillCheckPassed.Value)
                {
                    resultText = check.successText;
                    effectsToApply = check.successEffects ?? new List<EventEffect>();
                }
                else
                {
                    resultText = check.failureText;
                    effectsToApply = check.failureEffects ?? new List<EventEffect>();
                }
            }
            else
            {
                effectsToApply = choice.effects ?? new List<EventEffect>();
            }

            // Apply effects
            ApplyEffects(effectsToApply);

            // Fire event
            OnEventChoiceSelected?.Invoke(_currentEvent, choice, skillCheckPassed ?? true);

            // Update cooldown/completion
            if (!_currentEvent.repeatable)
            {
                _triggeredUniqueEvents.Add(_currentEvent.id);
            }
            else if (_currentEvent.cooldownHours > 0)
            {
                _eventCooldowns[_currentEvent.id] = Time.time + (_currentEvent.cooldownHours * 60f); // Simplified game time
            }

            // Clear current event
            _currentEvent = null;

            return (resultText, skillCheckPassed);
        }

        /// <summary>
        /// Starts a world event.
        /// </summary>
        public void StartWorldEvent(string eventId)
        {
            if (_worldEvents.TryGetValue(eventId, out var worldEvent))
            {
                worldEvent.isActive = true;
                worldEvent.startTime = Time.time;
                _activeWorldEvents.Add(worldEvent);

                OnWorldEventStarted?.Invoke(worldEvent);

                if (debugMode)
                    Debug.Log($"[WorldEventManager] World event started: {eventId}");
            }
        }

        /// <summary>
        /// Ends a world event.
        /// </summary>
        public void EndWorldEvent(string eventId)
        {
            var worldEvent = _activeWorldEvents.FirstOrDefault(e => e.id == eventId);
            if (worldEvent != null)
            {
                worldEvent.isActive = false;
                _activeWorldEvents.Remove(worldEvent);

                OnWorldEventEnded?.Invoke(worldEvent);

                if (debugMode)
                    Debug.Log($"[WorldEventManager] World event ended: {eventId}");
            }
        }

        /// <summary>
        /// Gets all active world events.
        /// </summary>
        public List<WorldEvent> GetActiveWorldEvents() => new List<WorldEvent>(_activeWorldEvents);

        /// <summary>
        /// Gets the combined world event effects.
        /// </summary>
        public WorldEventEffects GetCombinedWorldEffects()
        {
            var combined = new WorldEventEffects
            {
                encounterMultiplier = 1f,
                shopPriceModifier = 1f,
                goldPrice = 1f,
                miningToolPrice = 1f,
                techItemDropRate = 1f,
                remnantSpawnRate = 1f,
                wildlifeAggression = 1f,
                waterConsumption = 1f,
                cropYield = 1f,
                factionHostility = new Dictionary<string, int>()
            };

            foreach (var worldEvent in _activeWorldEvents)
            {
                var effects = worldEvent.effects;

                if (effects.encounterMultiplier > 0)
                    combined.encounterMultiplier *= effects.encounterMultiplier;
                if (effects.shopPriceModifier > 0)
                    combined.shopPriceModifier *= effects.shopPriceModifier;
                if (effects.goldPrice > 0)
                    combined.goldPrice *= effects.goldPrice;
                if (effects.miningToolPrice > 0)
                    combined.miningToolPrice *= effects.miningToolPrice;
                if (effects.techItemDropRate > 0)
                    combined.techItemDropRate *= effects.techItemDropRate;
                if (effects.remnantSpawnRate > 0)
                    combined.remnantSpawnRate *= effects.remnantSpawnRate;
                if (effects.wildlifeAggression > 0)
                    combined.wildlifeAggression *= effects.wildlifeAggression;
                if (effects.waterConsumption > 0)
                    combined.waterConsumption *= effects.waterConsumption;
                if (effects.cropYield > 0)
                    combined.cropYield *= effects.cropYield;

                if (effects.factionHostility != null)
                {
                    foreach (var kvp in effects.factionHostility)
                    {
                        if (!combined.factionHostility.ContainsKey(kvp.Key))
                            combined.factionHostility[kvp.Key] = 0;
                        combined.factionHostility[kvp.Key] += kvp.Value;
                    }
                }
            }

            return combined;
        }

        /// <summary>
        /// Gets an event by ID.
        /// </summary>
        public RandomEventData GetEvent(string id)
        {
            _events.TryGetValue(id, out var eventData);
            return eventData;
        }

        /// <summary>
        /// Gets all events with a specific tag.
        /// </summary>
        public List<RandomEventData> GetEventsWithTag(string tag)
        {
            return _events.Values.Where(e => e.tags.Contains(tag)).ToList();
        }

        /// <summary>
        /// Resets all event cooldowns.
        /// </summary>
        public void ResetCooldowns()
        {
            _eventCooldowns.Clear();
        }
        #endregion

        #region Private Methods
        private void LoadEventData()
        {
            try
            {
                var jsonAsset = Resources.Load<TextAsset>(eventsJsonPath);
                if (jsonAsset == null)
                {
                    Debug.LogError($"[WorldEventManager] Failed to load events from: {eventsJsonPath}");
                    return;
                }

                var data = JsonUtility.FromJson<EventDatabase>(jsonAsset.text);
                if (data == null)
                {
                    Debug.LogError("[WorldEventManager] Failed to parse events JSON");
                    return;
                }

                // Load random events
                if (data.events != null)
                {
                    foreach (var eventJson in data.events)
                    {
                        var eventData = ParseRandomEvent(eventJson);
                        _events[eventData.id] = eventData;
                    }
                }

                // Load world events
                if (data.worldEvents != null)
                {
                    foreach (var worldEventJson in data.worldEvents)
                    {
                        var worldEvent = ParseWorldEvent(worldEventJson);
                        _worldEvents[worldEvent.id] = worldEvent;
                    }
                }

                // Load rarity weights
                if (data.rarityWeights != null)
                {
                    _rarityWeights = data.rarityWeights;
                }
                else
                {
                    // Default weights
                    _rarityWeights = new Dictionary<string, float>
                    {
                        { "common", 50f },
                        { "uncommon", 30f },
                        { "rare", 15f },
                        { "legendary", 5f }
                    };
                }

                _currentContext = EventContext.CreateDefault();
                _isInitialized = true;

                Debug.Log($"[WorldEventManager] Loaded {_events.Count} random events, {_worldEvents.Count} world events");
            }
            catch (Exception e)
            {
                Debug.LogError($"[WorldEventManager] Error loading event data: {e.Message}");
            }
        }

        private RandomEventData ParseRandomEvent(EventJson json)
        {
            var eventData = new RandomEventData
            {
                id = json.id,
                title = json.title,
                description = json.description,
                category = ParseCategory(json.category),
                rarity = ParseRarity(json.rarity),
                weight = json.weight,
                repeatable = json.repeatable,
                cooldownHours = json.cooldownHours,
                tags = json.tags != null ? new List<string>(json.tags) : new List<string>()
            };

            // Parse conditions
            eventData.conditions = ParseConditions(json.conditions);

            // Parse choices
            if (json.choices != null)
            {
                foreach (var choiceJson in json.choices)
                {
                    eventData.choices.Add(ParseChoice(choiceJson));
                }
            }

            return eventData;
        }

        private EventChoice ParseChoice(ChoiceJson json)
        {
            var choice = new EventChoice
            {
                id = json.id,
                text = json.text,
                tooltip = json.tooltip,
                resultText = json.resultText,
                tags = json.tags != null ? new List<string>(json.tags) : new List<string>()
            };

            // Parse conditions
            choice.conditions = ParseChoiceConditions(json.conditions);

            // Parse effects
            if (json.effects != null)
            {
                foreach (var effectJson in json.effects)
                {
                    choice.effects.Add(ParseEffect(effectJson));
                }
            }

            // Parse skill check
            if (json.skillCheck != null)
            {
                choice.skillCheck = new SkillCheck
                {
                    skill = json.skillCheck.skill,
                    difficulty = json.skillCheck.difficulty,
                    successText = json.skillCheck.successText,
                    failureText = json.skillCheck.failureText,
                    successEffects = ParseEffects(json.skillCheck.successEffects),
                    failureEffects = ParseEffects(json.skillCheck.failureEffects)
                };
            }

            return choice;
        }

        private List<EventCondition> ParseConditions(ConditionsJson json)
        {
            var conditions = new List<EventCondition>();
            if (json == null) return conditions;

            if (json.timeOfDay != null && json.timeOfDay.Length > 0)
                conditions.Add(EventCondition.TimeOfDayCondition(json.timeOfDay));
            if (json.minLevel > 0)
                conditions.Add(EventCondition.MinLevelCondition(json.minLevel));
            if (json.maxLevel > 0)
                conditions.Add(EventCondition.MaxLevelCondition(json.maxLevel));
            if (json.minGold > 0)
                conditions.Add(EventCondition.MinGoldCondition(json.minGold));
            if (json.requiredItems != null)
            {
                foreach (var item in json.requiredItems)
                    conditions.Add(EventCondition.RequiredItemCondition(item));
            }
            if (json.requiredFlags != null)
            {
                foreach (var flag in json.requiredFlags)
                    conditions.Add(EventCondition.RequiredFlagCondition(flag));
            }
            if (json.forbiddenFlags != null)
            {
                foreach (var flag in json.forbiddenFlags)
                    conditions.Add(EventCondition.ForbiddenFlagCondition(flag));
            }
            if (json.regionIds != null && json.regionIds.Length > 0)
            {
                conditions.Add(new EventCondition
                {
                    type = ConditionType.RegionId,
                    validValues = new List<string>(json.regionIds)
                });
            }
            if (json.terrainTypes != null && json.terrainTypes.Length > 0)
            {
                conditions.Add(new EventCondition
                {
                    type = ConditionType.TerrainType,
                    validValues = new List<string>(json.terrainTypes)
                });
            }

            return conditions;
        }

        private List<EventCondition> ParseChoiceConditions(ChoiceConditionsJson json)
        {
            var conditions = new List<EventCondition>();
            if (json == null) return conditions;

            if (json.minGold > 0)
                conditions.Add(EventCondition.MinGoldCondition(json.minGold));
            if (json.requiredItems != null && json.requiredItems.Length > 0)
                conditions.Add(EventCondition.RequiredItemAnyCondition(json.requiredItems));
            if (json.requiredFlags != null)
            {
                foreach (var flag in json.requiredFlags)
                    conditions.Add(EventCondition.RequiredFlagCondition(flag));
            }
            if (json.forbiddenFlags != null)
            {
                foreach (var flag in json.forbiddenFlags)
                    conditions.Add(EventCondition.ForbiddenFlagCondition(flag));
            }

            return conditions;
        }

        private EventEffect ParseEffect(EffectJson json)
        {
            return new EventEffect
            {
                type = ParseEffectType(json.type),
                target = json.target ?? json.stringValue,
                value = json.value,
                valueRange = json.valueRange,
                stringValue = json.stringValue,
                chance = json.chance > 0 ? json.chance : 1f
            };
        }

        private List<EventEffect> ParseEffects(List<EffectJson> jsons)
        {
            if (jsons == null) return new List<EventEffect>();
            return jsons.Select(ParseEffect).ToList();
        }

        private WorldEvent ParseWorldEvent(WorldEventJson json)
        {
            return new WorldEvent
            {
                id = json.id,
                name = json.name,
                description = json.description,
                type = json.type,
                duration = json.duration,
                isActive = false,
                effects = new WorldEventEffects
                {
                    encounterMultiplier = json.effects?.encounterMultiplier ?? 1f,
                    shopPriceModifier = json.effects?.shopPriceModifier ?? 1f,
                    goldPrice = json.effects?.goldPrice ?? 1f,
                    miningToolPrice = json.effects?.miningToolPrice ?? 1f,
                    techItemDropRate = json.effects?.techItemDropRate ?? 1f,
                    remnantSpawnRate = json.effects?.remnantSpawnRate ?? 1f,
                    wildlifeAggression = json.effects?.wildlifeAggression ?? 1f,
                    waterConsumption = json.effects?.waterConsumption ?? 1f,
                    cropYield = json.effects?.cropYield ?? 1f,
                    factionHostility = json.effects?.factionHostility ?? new Dictionary<string, int>()
                }
            };
        }

        private EventCategory ParseCategory(string category)
        {
            if (Enum.TryParse<EventCategory>(category, true, out var result))
                return result;
            return EventCategory.Travel;
        }

        private EventRarity ParseRarity(string rarity)
        {
            if (Enum.TryParse<EventRarity>(rarity, true, out var result))
                return result;
            return EventRarity.Common;
        }

        private EventEffectType ParseEffectType(string type)
        {
            type = type?.ToLowerInvariant().Replace("_", "") ?? "";
            return type switch
            {
                "givegold" => EventEffectType.GiveGold,
                "takegold" => EventEffectType.TakeGold,
                "giveitem" => EventEffectType.GiveItem,
                "takeitem" => EventEffectType.TakeItem,
                "givexp" or "give_xp" => EventEffectType.GiveXp,
                "heal" => EventEffectType.Heal,
                "damage" => EventEffectType.Damage,
                "changemorale" or "change_morale" => EventEffectType.ChangeMorale,
                "changereputation" or "change_reputation" => EventEffectType.ChangeReputation,
                "setflag" or "set_flag" => EventEffectType.SetFlag,
                "removeflag" or "remove_flag" => EventEffectType.RemoveFlag,
                "triggercombat" or "trigger_combat" => EventEffectType.TriggerCombat,
                "startquest" or "start_quest" => EventEffectType.StartQuest,
                "unlocklocation" or "unlock_location" => EventEffectType.UnlockLocation,
                "reveallore" or "reveal_lore" => EventEffectType.RevealLore,
                "triggerevent" or "trigger_event" => EventEffectType.TriggerEvent,
                _ => EventEffectType.GiveXp
            };
        }

        private List<RandomEventData> GetEligibleEvents(EventCategory category)
        {
            return _events.Values
                .Where(e => e.category == category &&
                           !IsOnCooldown(e.id) &&
                           !_triggeredUniqueEvents.Contains(e.id) &&
                           EventConditionChecker.CheckAllConditions(e.conditions, _currentContext))
                .ToList();
        }

        private bool IsOnCooldown(string eventId)
        {
            if (_eventCooldowns.TryGetValue(eventId, out float cooldownEnd))
            {
                return Time.time < cooldownEnd;
            }
            return false;
        }

        private RandomEventData SelectWeightedEvent(List<RandomEventData> events)
        {
            if (events.Count == 0) return null;

            // Calculate weights
            float totalWeight = 0f;
            var weights = new List<(RandomEventData evt, float weight)>();

            foreach (var evt in events)
            {
                float rarityWeight = _rarityWeights.GetValueOrDefault(evt.rarity.ToString().ToLowerInvariant(), 25f);
                float weight = rarityWeight * evt.weight;
                weights.Add((evt, weight));
                totalWeight += weight;
            }

            // Select random
            float roll = UnityEngine.Random.value * totalWeight;
            float cumulative = 0f;

            foreach (var (evt, weight) in weights)
            {
                cumulative += weight;
                if (roll <= cumulative)
                    return evt;
            }

            return weights.Last().evt;
        }

        private void TriggerEvent(RandomEventData eventData)
        {
            _currentEvent = eventData;
            OnRandomEventTriggered?.Invoke(eventData);

            if (debugMode)
                Debug.Log($"[WorldEventManager] Event triggered: {eventData.id} ({eventData.title})");
        }

        private bool PerformSkillCheck(string skill, int difficulty)
        {
            // TODO: Integrate with actual skill system
            // For now, use a simple random check
            int playerSkill = 50; // Placeholder
            int roll = UnityEngine.Random.Range(1, 101);
            return roll + playerSkill >= difficulty;
        }

        private void ApplyEffects(List<EventEffect> effects)
        {
            var appliedEffects = new List<EventEffect>();

            foreach (var effect in effects)
            {
                if (!effect.ShouldOccur())
                    continue;

                ApplySingleEffect(effect);
                appliedEffects.Add(effect);
            }

            if (appliedEffects.Count > 0)
                OnEffectsApplied?.Invoke(appliedEffects);
        }

        /// <summary>
        /// Applies a single event effect to the game systems.
        /// </summary>
        private void ApplySingleEffect(EventEffect effect)
        {
            int value = effect.GetValue();
            string target = effect.target;

            if (debugMode)
                Debug.Log($"[WorldEventManager] Applying effect: {effect.type} = {value} ({target})");

            switch (effect.type)
            {
                case EventEffectType.GiveGold:
                    ApplyGoldChange(value);
                    break;

                case EventEffectType.TakeGold:
                    ApplyGoldChange(-value);
                    break;

                case EventEffectType.GiveItem:
                    ApplyGiveItem(target, value > 0 ? value : 1);
                    break;

                case EventEffectType.TakeItem:
                    ApplyTakeItem(target, value > 0 ? value : 1);
                    break;

                case EventEffectType.GiveXp:
                    ApplyXpGain(value);
                    break;

                case EventEffectType.Heal:
                    ApplyHeal(value);
                    break;

                case EventEffectType.Damage:
                    ApplyDamage(value);
                    break;

                case EventEffectType.ChangeMorale:
                    ApplyMoraleChange(value);
                    break;

                case EventEffectType.ChangeReputation:
                    ApplyReputationChange(target, value);
                    break;

                case EventEffectType.SetFlag:
                    ApplySetFlag(effect.stringValue ?? target, true);
                    break;

                case EventEffectType.RemoveFlag:
                    ApplySetFlag(effect.stringValue ?? target, false);
                    break;

                case EventEffectType.TriggerCombat:
                    ApplyTriggerCombat(target);
                    break;

                case EventEffectType.StartQuest:
                    ApplyStartQuest(target);
                    break;

                case EventEffectType.UnlockLocation:
                    ApplyUnlockLocation(target);
                    break;

                case EventEffectType.RevealLore:
                    ApplyRevealLore(effect.stringValue ?? target);
                    break;

                case EventEffectType.TriggerEvent:
                    TriggerEventById(target);
                    break;

                default:
                    Debug.LogWarning($"[WorldEventManager] Unknown effect type: {effect.type}");
                    break;
            }
        }

        #region Effect Application Methods

        private void ApplyGoldChange(int amount)
        {
            if (InventoryManager.Instance != null)
            {
                InventoryManager.Instance.AddGold(amount);

                string message = amount >= 0
                    ? $"Gained {amount} gold"
                    : $"Lost {-amount} gold";
                EventBus.Instance?.Publish(GameEvents.NotificationInfo, message);
            }
            EventBus.Instance?.Publish(GameEvents.GoldChanged, amount.ToString());
        }

        private void ApplyGiveItem(string itemId, int quantity)
        {
            if (string.IsNullOrEmpty(itemId)) return;

            if (InventoryManager.Instance != null)
            {
                int added = InventoryManager.Instance.AddItemById(itemId, quantity);
                if (added > 0)
                {
                    var itemData = ItemDatabase.Instance?.GetItemById(itemId);
                    string itemName = itemData?.displayName ?? itemId;
                    EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"Received: {itemName} x{added}");
                }
            }
        }

        private void ApplyTakeItem(string itemId, int quantity)
        {
            if (string.IsNullOrEmpty(itemId)) return;

            if (InventoryManager.Instance != null)
            {
                InventoryManager.Instance.RemoveItemById(itemId, quantity);

                var itemData = ItemDatabase.Instance?.GetItemById(itemId);
                string itemName = itemData?.displayName ?? itemId;
                EventBus.Instance?.Publish(GameEvents.NotificationInfo, $"Lost: {itemName} x{quantity}");
            }
        }

        private void ApplyXpGain(int amount)
        {
            if (amount <= 0) return;

            // Publish XP gain event - a leveling system should handle this
            EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"Gained {amount} XP");

            // The actual XP tracking would be handled by a dedicated XP/Leveling system
            // For now, publish to EventBus for any subscribers
            EventBus.Instance?.Publish("xp_gained", amount.ToString());
        }

        private void ApplyHeal(int amount)
        {
            if (amount <= 0) return;

            EventBus.Instance?.Publish(GameEvents.PlayerHealed, amount.ToString());
            EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"Healed for {amount} HP");
        }

        private void ApplyDamage(int amount)
        {
            if (amount <= 0) return;

            EventBus.Instance?.Publish(GameEvents.PlayerDamaged, amount.ToString());
            EventBus.Instance?.Publish(GameEvents.NotificationWarning, $"Took {amount} damage");
        }

        private void ApplyMoraleChange(int amount)
        {
            // Morale system - publish event for any subscribers
            string message = amount >= 0
                ? $"Morale increased by {amount}"
                : $"Morale decreased by {-amount}";
            EventBus.Instance?.Publish(GameEvents.NotificationInfo, message);
            EventBus.Instance?.Publish("morale_changed", amount.ToString());
        }

        private void ApplyReputationChange(string factionId, int amount)
        {
            if (string.IsNullOrEmpty(factionId)) return;

            if (ReputationSystem.Instance != null)
            {
                ReputationSystem.Instance.ModifyReputation(factionId, amount);
            }

            // Also publish through EventBus
            var repChange = new Data.ReputationChange { factionId = factionId, amount = amount };
            EventBus.Instance?.Publish(GameEvents.ReputationChanged, repChange);
        }

        private void ApplySetFlag(string flagName, bool value)
        {
            if (string.IsNullOrEmpty(flagName)) return;

            if (QuestManager.Instance != null)
            {
                QuestManager.Instance.SetQuestFlag(flagName, value);
            }

            if (debugMode)
                Debug.Log($"[WorldEventManager] Flag '{flagName}' set to {value}");
        }

        private void ApplyTriggerCombat(string encounterId)
        {
            if (string.IsNullOrEmpty(encounterId)) return;

            EventBus.Instance?.Publish(GameEvents.CombatStarted, encounterId);

            if (debugMode)
                Debug.Log($"[WorldEventManager] Combat triggered: {encounterId}");
        }

        private void ApplyStartQuest(string questId)
        {
            if (string.IsNullOrEmpty(questId)) return;

            if (QuestManager.Instance != null)
            {
                QuestManager.Instance.StartQuest(questId);
            }
            else
            {
                // Fallback: publish event
                EventBus.Instance?.Publish(GameEvents.QuestStarted, questId);
            }
        }

        private void ApplyUnlockLocation(string locationId)
        {
            if (string.IsNullOrEmpty(locationId)) return;

            // Set a flag for the location being unlocked
            ApplySetFlag($"location_{locationId}_unlocked", true);

            EventBus.Instance?.Publish("location_unlocked", locationId);
            EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"New location discovered!");
        }

        private void ApplyRevealLore(string loreEntry)
        {
            if (string.IsNullOrEmpty(loreEntry)) return;

            // Set a flag for the lore being revealed
            ApplySetFlag($"lore_{loreEntry}_revealed", true);

            EventBus.Instance?.Publish("lore_revealed", loreEntry);
            EventBus.Instance?.Publish(GameEvents.NotificationInfo, "New lore entry discovered!");
        }

        #endregion

        private void UpdateWorldEvents()
        {
            // Check for events that should end
            for (int i = _activeWorldEvents.Count - 1; i >= 0; i--)
            {
                var worldEvent = _activeWorldEvents[i];

                // Check duration
                if (worldEvent.duration > 0)
                {
                    float elapsed = Time.time - worldEvent.startTime;
                    if (elapsed >= worldEvent.duration * 60f) // Convert hours to game time
                    {
                        EndWorldEvent(worldEvent.id);
                        continue;
                    }
                }

                // Check end conditions
                if (worldEvent.endConditions.Count > 0 &&
                    EventConditionChecker.CheckAllConditions(worldEvent.endConditions, _currentContext))
                {
                    EndWorldEvent(worldEvent.id);
                }
            }

            // Check for events that should start
            foreach (var worldEvent in _worldEvents.Values)
            {
                if (worldEvent.isActive)
                    continue;

                if (worldEvent.triggerConditions.Count > 0 &&
                    EventConditionChecker.CheckAllConditions(worldEvent.triggerConditions, _currentContext))
                {
                    StartWorldEvent(worldEvent.id);
                }
            }
        }
        #endregion

        #region JSON Data Classes
        [Serializable]
        private class EventDatabase
        {
            public string version;
            public string description;
            public Dictionary<string, float> rarityWeights;
            public List<EventJson> events;
            public List<WorldEventJson> worldEvents;
        }

        [Serializable]
        private class EventJson
        {
            public string id;
            public string title;
            public string description;
            public string category;
            public string rarity;
            public float weight;
            public ConditionsJson conditions;
            public List<ChoiceJson> choices;
            public bool repeatable;
            public int cooldownHours;
            public string[] tags;
        }

        [Serializable]
        private class ConditionsJson
        {
            public string[] timeOfDay;
            public int minLevel;
            public int maxLevel;
            public int minGold;
            public float minHealthPercent;
            public string[] requiredItems;
            public string[] requiredFlags;
            public string[] forbiddenFlags;
            public string[] regionIds;
            public string[] terrainTypes;
            public string[] weather;
        }

        [Serializable]
        private class ChoiceJson
        {
            public string id;
            public string text;
            public string tooltip;
            public string resultText;
            public ChoiceConditionsJson conditions;
            public List<EffectJson> effects;
            public SkillCheckJson skillCheck;
            public string[] tags;
        }

        [Serializable]
        private class ChoiceConditionsJson
        {
            public int minGold;
            public string[] requiredItems;
            public string[] requiredFlags;
            public string[] forbiddenFlags;
        }

        [Serializable]
        private class EffectJson
        {
            public string type;
            public string target;
            public int value;
            public int[] valueRange;
            public string stringValue;
            public float chance;
        }

        [Serializable]
        private class SkillCheckJson
        {
            public string skill;
            public int difficulty;
            public string successText;
            public string failureText;
            public List<EffectJson> successEffects;
            public List<EffectJson> failureEffects;
        }

        [Serializable]
        private class WorldEventJson
        {
            public string id;
            public string name;
            public string description;
            public string type;
            public int duration;
            public WorldEventEffectsJson effects;
            public ConditionsJson triggerConditions;
            public ConditionsJson endConditions;
        }

        [Serializable]
        private class WorldEventEffectsJson
        {
            public float encounterMultiplier;
            public float shopPriceModifier;
            public float goldPrice;
            public float miningToolPrice;
            public float techItemDropRate;
            public float remnantSpawnRate;
            public float wildlifeAggression;
            public float waterConsumption;
            public float cropYield;
            public Dictionary<string, int> factionHostility;
        }
        #endregion
    }
}
