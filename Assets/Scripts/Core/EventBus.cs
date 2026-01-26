using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Core
{
    /// <summary>
    /// Interface for event data payload.
    /// </summary>
    public interface IEventData
    {
        /// <summary>
        /// The event type identifier.
        /// </summary>
        string EventType { get; }

        /// <summary>
        /// Timestamp when the event was created.
        /// </summary>
        float Timestamp { get; }
    }

    /// <summary>
    /// Base class for typed event data.
    /// </summary>
    /// <typeparam name="T">Type of the event payload.</typeparam>
    public class EventData<T> : IEventData
    {
        /// <inheritdoc/>
        public string EventType { get; }

        /// <inheritdoc/>
        public float Timestamp { get; }

        /// <summary>
        /// The event payload data.
        /// </summary>
        public T Data { get; }

        public EventData(string eventType, T data)
        {
            EventType = eventType;
            Data = data;
            Timestamp = Time.time;
        }
    }

    /// <summary>
    /// Global event bus for decoupled cross-system communication.
    /// Uses a publish/subscribe pattern to allow systems to communicate
    /// without direct dependencies on each other.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript event patterns in GameSession.ts and controllers.
    /// Implements a type-safe event system with support for:
    /// - String-based simple events
    /// - Typed event payloads
    /// - One-time subscriptions
    /// - Event history for debugging
    /// </remarks>
    public class EventBus : MonoBehaviour
    {
        #region Singleton

        private static EventBus _instance;

        /// <summary>
        /// Global singleton instance of the EventBus.
        /// </summary>
        public static EventBus Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<EventBus>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[EventBus]");
                        _instance = go.AddComponent<EventBus>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Configuration

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Maximum number of events to keep in history")]
        private int maxEventHistory = 100;

        [SerializeField]
        [Tooltip("Enable debug logging of events")]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // String-based event subscribers (legacy support)
        private readonly Dictionary<string, List<Action<string>>> _stringSubscribers =
            new Dictionary<string, List<Action<string>>>();

        // Typed event subscribers
        private readonly Dictionary<string, List<Delegate>> _typedSubscribers =
            new Dictionary<string, List<Delegate>>();

        // One-time subscribers
        private readonly Dictionary<string, List<Action<string>>> _onceSubscribers =
            new Dictionary<string, List<Action<string>>>();

        // Event history for debugging
        private readonly Queue<IEventData> _eventHistory = new Queue<IEventData>();

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

            Log("EventBus initialized");
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _stringSubscribers.Clear();
                _typedSubscribers.Clear();
                _onceSubscribers.Clear();
                _eventHistory.Clear();
                _instance = null;
            }
        }

        #endregion

        #region String-Based Events (Simple)

        /// <summary>
        /// Subscribe to a string-based event.
        /// </summary>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="callback">Callback to invoke when event is published.</param>
        /// <returns>Unsubscribe action.</returns>
        public Action Subscribe(string eventType, Action<string> callback)
        {
            if (!_stringSubscribers.ContainsKey(eventType))
            {
                _stringSubscribers[eventType] = new List<Action<string>>();
            }

            _stringSubscribers[eventType].Add(callback);
            Log($"Subscribed to: {eventType}");

            return () => Unsubscribe(eventType, callback);
        }

        /// <summary>
        /// Subscribe to a string-based event (one-time only).
        /// </summary>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="callback">Callback to invoke once.</param>
        public void SubscribeOnce(string eventType, Action<string> callback)
        {
            if (!_onceSubscribers.ContainsKey(eventType))
            {
                _onceSubscribers[eventType] = new List<Action<string>>();
            }

            _onceSubscribers[eventType].Add(callback);
            Log($"Subscribed once to: {eventType}");
        }

        /// <summary>
        /// Unsubscribe from a string-based event.
        /// </summary>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="callback">Callback to remove.</param>
        public void Unsubscribe(string eventType, Action<string> callback)
        {
            if (_stringSubscribers.ContainsKey(eventType))
            {
                _stringSubscribers[eventType].Remove(callback);
                Log($"Unsubscribed from: {eventType}");
            }
        }

        /// <summary>
        /// Publish a string-based event.
        /// </summary>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="data">String data payload.</param>
        public void Publish(string eventType, string data = "")
        {
            Log($"Publishing: {eventType} with data: {data}");

            // Record in history
            RecordEvent(new EventData<string>(eventType, data));

            // Notify regular subscribers
            if (_stringSubscribers.ContainsKey(eventType))
            {
                // Create a copy to avoid modification during iteration
                var subscribers = new List<Action<string>>(_stringSubscribers[eventType]);
                foreach (var callback in subscribers)
                {
                    try
                    {
                        callback?.Invoke(data);
                    }
                    catch (Exception e)
                    {
                        Debug.LogError($"[EventBus] Error in subscriber for {eventType}: {e}");
                    }
                }
            }

            // Notify and remove one-time subscribers
            if (_onceSubscribers.ContainsKey(eventType))
            {
                var onceCallbacks = new List<Action<string>>(_onceSubscribers[eventType]);
                _onceSubscribers[eventType].Clear();

                foreach (var callback in onceCallbacks)
                {
                    try
                    {
                        callback?.Invoke(data);
                    }
                    catch (Exception e)
                    {
                        Debug.LogError($"[EventBus] Error in once subscriber for {eventType}: {e}");
                    }
                }
            }
        }

        #endregion

        #region Typed Events

        /// <summary>
        /// Subscribe to a typed event.
        /// </summary>
        /// <typeparam name="T">Type of the event payload.</typeparam>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="callback">Callback to invoke with typed data.</param>
        /// <returns>Unsubscribe action.</returns>
        public Action Subscribe<T>(string eventType, Action<T> callback)
        {
            if (!_typedSubscribers.ContainsKey(eventType))
            {
                _typedSubscribers[eventType] = new List<Delegate>();
            }

            _typedSubscribers[eventType].Add(callback);
            Log($"Subscribed (typed) to: {eventType}");

            return () => Unsubscribe<T>(eventType, callback);
        }

        /// <summary>
        /// Unsubscribe from a typed event.
        /// </summary>
        /// <typeparam name="T">Type of the event payload.</typeparam>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="callback">Callback to remove.</param>
        public void Unsubscribe<T>(string eventType, Action<T> callback)
        {
            if (_typedSubscribers.ContainsKey(eventType))
            {
                _typedSubscribers[eventType].Remove(callback);
                Log($"Unsubscribed (typed) from: {eventType}");
            }
        }

        /// <summary>
        /// Publish a typed event.
        /// </summary>
        /// <typeparam name="T">Type of the event payload.</typeparam>
        /// <param name="eventType">Event type identifier.</param>
        /// <param name="data">Typed data payload.</param>
        public void Publish<T>(string eventType, T data)
        {
            Log($"Publishing (typed): {eventType}");

            // Record in history
            RecordEvent(new EventData<T>(eventType, data));

            if (_typedSubscribers.ContainsKey(eventType))
            {
                var subscribers = new List<Delegate>(_typedSubscribers[eventType]);
                foreach (var callback in subscribers)
                {
                    try
                    {
                        if (callback is Action<T> typedCallback)
                        {
                            typedCallback(data);
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.LogError($"[EventBus] Error in typed subscriber for {eventType}: {e}");
                    }
                }
            }
        }

        #endregion

        #region Event History

        /// <summary>
        /// Get the event history.
        /// </summary>
        /// <returns>Array of recorded events.</returns>
        public IEventData[] GetEventHistory()
        {
            return _eventHistory.ToArray();
        }

        /// <summary>
        /// Clear the event history.
        /// </summary>
        public void ClearEventHistory()
        {
            _eventHistory.Clear();
        }

        private void RecordEvent(IEventData eventData)
        {
            _eventHistory.Enqueue(eventData);

            // Trim history if over limit
            while (_eventHistory.Count > maxEventHistory)
            {
                _eventHistory.Dequeue();
            }
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Check if there are any subscribers for an event type.
        /// </summary>
        /// <param name="eventType">Event type to check.</param>
        /// <returns>True if there are subscribers.</returns>
        public bool HasSubscribers(string eventType)
        {
            bool hasString = _stringSubscribers.ContainsKey(eventType) &&
                            _stringSubscribers[eventType].Count > 0;
            bool hasTyped = _typedSubscribers.ContainsKey(eventType) &&
                           _typedSubscribers[eventType].Count > 0;
            bool hasOnce = _onceSubscribers.ContainsKey(eventType) &&
                          _onceSubscribers[eventType].Count > 0;

            return hasString || hasTyped || hasOnce;
        }

        /// <summary>
        /// Get count of subscribers for an event type.
        /// </summary>
        /// <param name="eventType">Event type to check.</param>
        /// <returns>Number of subscribers.</returns>
        public int GetSubscriberCount(string eventType)
        {
            int count = 0;

            if (_stringSubscribers.ContainsKey(eventType))
                count += _stringSubscribers[eventType].Count;

            if (_typedSubscribers.ContainsKey(eventType))
                count += _typedSubscribers[eventType].Count;

            if (_onceSubscribers.ContainsKey(eventType))
                count += _onceSubscribers[eventType].Count;

            return count;
        }

        /// <summary>
        /// Remove all subscribers for an event type.
        /// </summary>
        /// <param name="eventType">Event type to clear.</param>
        public void ClearSubscribers(string eventType)
        {
            _stringSubscribers.Remove(eventType);
            _typedSubscribers.Remove(eventType);
            _onceSubscribers.Remove(eventType);
            Log($"Cleared all subscribers for: {eventType}");
        }

        /// <summary>
        /// Remove all subscribers.
        /// </summary>
        public void ClearAllSubscribers()
        {
            _stringSubscribers.Clear();
            _typedSubscribers.Clear();
            _onceSubscribers.Clear();
            Log("Cleared all subscribers");
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[EventBus] {message}");
            }
        }

        #endregion
    }

    #region Common Event Types

    /// <summary>
    /// Static class containing common event type constants.
    /// </summary>
    public static class GameEvents
    {
        // Game Flow Events
        public const string GameStarted = "game_started";
        public const string GameEnded = "game_ended";
        public const string GamePaused = "game_paused";
        public const string GameResumed = "game_resumed";
        public const string GameSaved = "game_saved";
        public const string GameLoaded = "game_loaded";

        // Phase Events
        public const string PhaseChanged = "phase_changed";

        // Location Events
        public const string TownEntered = "town_entered";
        public const string TownExited = "town_exited";
        public const string BuildingEntered = "building_entered";
        public const string BuildingExited = "building_exited";

        // Combat Events
        public const string CombatStarted = "combat_started";
        public const string CombatEnded = "combat_ended";
        public const string CombatVictory = "combat_victory";
        public const string CombatDefeat = "combat_defeat";
        public const string CombatFled = "combat_fled";

        // Dialogue Events
        public const string DialogueStarted = "dialogue_started";
        public const string DialogueEnded = "dialogue_ended";
        public const string DialogueChoiceMade = "dialogue_choice_made";

        // Quest Events
        public const string QuestStarted = "quest_started";
        public const string QuestUpdated = "quest_updated";
        public const string QuestCompleted = "quest_completed";
        public const string QuestFailed = "quest_failed";

        // Player Events
        public const string PlayerLevelUp = "player_level_up";
        public const string PlayerDamaged = "player_damaged";
        public const string PlayerHealed = "player_healed";
        public const string PlayerDied = "player_died";

        // Inventory Events
        public const string ItemAdded = "item_added";
        public const string ItemRemoved = "item_removed";
        public const string ItemUsed = "item_used";
        public const string ItemEquipped = "item_equipped";
        public const string ItemUnequipped = "item_unequipped";
        public const string GoldChanged = "gold_changed";

        // Shop Events
        public const string ShopOpened = "shop_opened";
        public const string ShopClosed = "shop_closed";
        public const string ItemBought = "item_bought";
        public const string ItemSold = "item_sold";

        // Time Events
        public const string TimeChanged = "time_changed";
        public const string HourChanged = "hour_changed";
        public const string PhaseOfDayChanged = "phase_of_day_changed";
        public const string DayChanged = "day_changed";

        // Weather Events
        public const string WeatherChanged = "weather_changed";
        public const string SeverityChanged = "severity_changed";

        // Reputation Events
        public const string ReputationChanged = "reputation_changed";

        // Notification Events
        public const string Notification = "notification";
        public const string NotificationInfo = "notification_info";
        public const string NotificationWarning = "notification_warning";
        public const string NotificationError = "notification_error";
        public const string NotificationSuccess = "notification_success";
    }

    #endregion
}
