using System;
using UnityEngine;
using IronFrontier.Core;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Time phases representing different parts of the day.
    /// Each phase affects gameplay differently (visibility, encounters, NPC schedules).
    /// </summary>
    public enum TimePhase
    {
        /// <summary>Early morning (5-7)</summary>
        Dawn,
        /// <summary>Daytime (7-18)</summary>
        Day,
        /// <summary>Evening transition (18-20)</summary>
        Dusk,
        /// <summary>Nighttime (20-5)</summary>
        Night
    }

    /// <summary>
    /// Event arguments for time-related events.
    /// </summary>
    public class TimeChangedEventArgs : EventArgs
    {
        /// <summary>Current hour (0-23).</summary>
        public int Hour { get; }

        /// <summary>Current minute (0-59).</summary>
        public int Minute { get; }

        /// <summary>Current day number.</summary>
        public int Day { get; }

        /// <summary>Current time phase.</summary>
        public TimePhase Phase { get; }

        /// <summary>Previous time phase (for phase change events).</summary>
        public TimePhase? PreviousPhase { get; }

        public TimeChangedEventArgs(int hour, int minute, int day, TimePhase phase, TimePhase? previousPhase = null)
        {
            Hour = hour;
            Minute = minute;
            Day = day;
            Phase = phase;
            PreviousPhase = previousPhase;
        }
    }

    /// <summary>
    /// Day/night cycle system with real-time progression.
    /// Manages game time with configurable time scale, day/night phase detection,
    /// and event emission for time-based game systems.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript time.ts (GameClock class).
    /// Features:
    /// - Configurable time scale (default: 1 game hour = 2 real minutes)
    /// - Day/night phase detection with callbacks
    /// - Pause/resume capability
    /// - Serializable state for save/load
    /// - Event emission for hourly and phase changes
    /// </remarks>
    public class TimeSystem : MonoBehaviour
    {
        #region Singleton

        private static TimeSystem _instance;

        /// <summary>
        /// Global singleton instance of TimeSystem.
        /// </summary>
        public static TimeSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<TimeSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[TimeSystem]");
                        _instance = go.AddComponent<TimeSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired every time update tick.</summary>
        public event EventHandler<TimeChangedEventArgs> OnTick;

        /// <summary>Fired when the hour changes.</summary>
        public event EventHandler<TimeChangedEventArgs> OnHourChanged;

        /// <summary>Fired when the time phase changes.</summary>
        public event EventHandler<TimeChangedEventArgs> OnPhaseChanged;

        /// <summary>Fired when the day changes.</summary>
        public event EventHandler<TimeChangedEventArgs> OnDayChanged;

        #endregion

        #region Configuration

        [Header("Time Configuration")]
        [SerializeField]
        [Tooltip("Real seconds per game minute (default: 2 = 1 game hour per 2 real minutes)")]
        private float realSecondsPerGameMinute = 2f;

        [SerializeField]
        [Tooltip("Starting hour (0-23)")]
        [Range(0, 23)]
        private int startingHour = 10;

        [SerializeField]
        [Tooltip("Starting day")]
        private int startingDay = 1;

        [Header("Phase Boundaries (Hour)")]
        [SerializeField]
        [Range(0, 23)]
        private int dawnStart = 5;

        [SerializeField]
        [Range(0, 23)]
        private int dayStart = 7;

        [SerializeField]
        [Range(0, 23)]
        private int duskStart = 18;

        [SerializeField]
        [Range(0, 23)]
        private int nightStart = 20;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region State

        private int _hour;
        private int _minute;
        private int _day;
        private int _totalMinutes;
        private bool _isPaused = true;
        private float _accumulatedTime = 0f;
        private TimePhase _currentPhase;

        #endregion

        #region Properties

        /// <summary>Current hour (0-23).</summary>
        public int Hour => _hour;

        /// <summary>Current minute (0-59).</summary>
        public int Minute => _minute;

        /// <summary>Current day number.</summary>
        public int Day => _day;

        /// <summary>Total elapsed game time in minutes.</summary>
        public int TotalMinutes => _totalMinutes;

        /// <summary>Total elapsed game time in hours (fractional).</summary>
        public float TotalHours => _totalMinutes / 60f;

        /// <summary>Whether the clock is paused.</summary>
        public bool IsPaused => _isPaused;

        /// <summary>Current time phase.</summary>
        public TimePhase CurrentPhase => _currentPhase;

        /// <summary>Whether it's currently nighttime.</summary>
        public bool IsNight => _currentPhase == TimePhase.Night;

        /// <summary>Whether it's currently daytime (dawn, day, or dusk).</summary>
        public bool IsDay => _currentPhase != TimePhase.Night;

        /// <summary>
        /// Ambient light level (0-1) based on time of day.
        /// Useful for rendering systems.
        /// </summary>
        public float AmbientLight
        {
            get
            {
                float hourFraction = _hour + _minute / 60f;

                // Night: very dark
                if (hourFraction >= nightStart || hourFraction < dawnStart)
                    return 0.2f;

                // Dawn: gradual brightening
                if (hourFraction >= dawnStart && hourFraction < dayStart)
                {
                    float progress = (hourFraction - dawnStart) / (dayStart - dawnStart);
                    return 0.2f + progress * 0.6f;
                }

                // Day: full brightness
                if (hourFraction >= dayStart && hourFraction < duskStart)
                    return 1.0f;

                // Dusk: gradual darkening
                if (hourFraction >= duskStart && hourFraction < nightStart)
                {
                    float progress = (hourFraction - duskStart) / (nightStart - duskStart);
                    return 1.0f - progress * 0.6f;
                }

                return 1.0f;
            }
        }

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
            Log("TimeSystem initialized");
        }

        private void Update()
        {
            if (_isPaused) return;

            // Accumulate real time
            _accumulatedTime += Time.deltaTime;

            // Convert to game minutes
            int gameMinutes = Mathf.FloorToInt(_accumulatedTime / realSecondsPerGameMinute);

            if (gameMinutes > 0)
            {
                _accumulatedTime -= gameMinutes * realSecondsPerGameMinute;
                AdvanceTime(gameMinutes);
            }
            else
            {
                // Emit tick even without time change for UI updates
                EmitTick();
            }
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Public API - Time Queries

        /// <summary>
        /// Get formatted time string (HH:MM).
        /// </summary>
        public string GetFormattedTime()
        {
            return $"{_hour:D2}:{_minute:D2}";
        }

        /// <summary>
        /// Get formatted datetime string (Day X, HH:MM).
        /// </summary>
        public string GetFormattedDateTime()
        {
            return $"Day {_day}, {GetFormattedTime()}";
        }

        /// <summary>
        /// Get the time phase for a specific hour.
        /// </summary>
        /// <param name="hour">Hour to check (0-23).</param>
        /// <returns>Time phase for that hour.</returns>
        public TimePhase GetPhaseForHour(int hour)
        {
            // Night wraps around midnight
            if (hour >= nightStart || hour < dawnStart)
                return TimePhase.Night;

            if (hour >= dawnStart && hour < dayStart)
                return TimePhase.Dawn;

            if (hour >= dayStart && hour < duskStart)
                return TimePhase.Day;

            if (hour >= duskStart && hour < nightStart)
                return TimePhase.Dusk;

            return TimePhase.Day; // Fallback
        }

        #endregion

        #region Public API - Time Control

        /// <summary>
        /// Start the game clock.
        /// </summary>
        public void StartClock()
        {
            if (!_isPaused) return;

            Log("Clock started");
            _isPaused = false;
            _accumulatedTime = 0f;
        }

        /// <summary>
        /// Pause the game clock.
        /// </summary>
        public void PauseClock()
        {
            if (_isPaused) return;

            Log("Clock paused");
            _isPaused = true;
        }

        /// <summary>
        /// Resume the game clock after being paused.
        /// </summary>
        public void ResumeClock()
        {
            if (!_isPaused) return;

            Log("Clock resumed");
            StartClock();
        }

        /// <summary>
        /// Toggle between paused and running states.
        /// </summary>
        public void ToggleClock()
        {
            if (_isPaused)
                ResumeClock();
            else
                PauseClock();
        }

        /// <summary>
        /// Advance time by a specified number of game minutes.
        /// Useful for sleeping, waiting, or time skips.
        /// </summary>
        /// <param name="minutes">Number of game minutes to advance.</param>
        /// <param name="emitEvents">Whether to emit time events (default: true).</param>
        public void AdvanceTime(int minutes, bool emitEvents = true)
        {
            if (minutes <= 0) return;

            var previousPhase = _currentPhase;
            int previousHour = _hour;
            int previousDay = _day;

            // Update total minutes
            _totalMinutes += minutes;

            // Calculate new time
            int totalMinutesInDay = _hour * 60 + _minute + minutes;
            int daysToAdd = totalMinutesInDay / (24 * 60);
            totalMinutesInDay = totalMinutesInDay % (24 * 60);

            _day += daysToAdd;
            _hour = totalMinutesInDay / 60;
            _minute = totalMinutesInDay % 60;

            // Update phase
            _currentPhase = GetPhaseForHour(_hour);

            if (!emitEvents) return;

            // Emit events
            EmitTick();

            if (_hour != previousHour)
            {
                EmitHourChanged();
            }

            if (_currentPhase != previousPhase)
            {
                EmitPhaseChanged(previousPhase);
            }

            if (_day != previousDay)
            {
                EmitDayChanged();
            }
        }

        /// <summary>
        /// Advance time by a specified number of game hours.
        /// </summary>
        /// <param name="hours">Number of game hours to advance.</param>
        /// <param name="emitEvents">Whether to emit time events (default: true).</param>
        public void AdvanceHours(int hours, bool emitEvents = true)
        {
            AdvanceTime(hours * 60, emitEvents);
        }

        /// <summary>
        /// Set the time to a specific hour and minute.
        /// </summary>
        /// <param name="hour">Hour to set (0-23).</param>
        /// <param name="minute">Minute to set (0-59, default: 0).</param>
        public void SetTime(int hour, int minute = 0)
        {
            var previousPhase = _currentPhase;

            _hour = Mathf.Clamp(hour, 0, 23);
            _minute = Mathf.Clamp(minute, 0, 59);
            _currentPhase = GetPhaseForHour(_hour);

            if (_currentPhase != previousPhase)
            {
                EmitPhaseChanged(previousPhase);
            }

            Log($"Time set to {GetFormattedTime()}");
        }

        /// <summary>
        /// Advance to the next occurrence of a specific hour.
        /// If the hour is in the past today, advances to tomorrow.
        /// </summary>
        /// <param name="targetHour">The hour to advance to (0-23).</param>
        public void AdvanceToHour(int targetHour)
        {
            float currentHour = _hour + _minute / 60f;
            int hoursToAdvance;

            if (targetHour > currentHour)
            {
                hoursToAdvance = Mathf.CeilToInt(targetHour - currentHour);
            }
            else
            {
                hoursToAdvance = Mathf.CeilToInt(24 - currentHour + targetHour);
            }

            AdvanceHours(hoursToAdvance);
        }

        /// <summary>
        /// Wait until a specific time phase.
        /// </summary>
        /// <param name="targetPhase">The phase to wait for.</param>
        public void AdvanceToPhase(TimePhase targetPhase)
        {
            int targetHour = targetPhase switch
            {
                TimePhase.Dawn => dawnStart,
                TimePhase.Day => dayStart,
                TimePhase.Dusk => duskStart,
                TimePhase.Night => nightStart,
                _ => dayStart
            };

            AdvanceToHour(targetHour);
        }

        /// <summary>
        /// Reset to default starting state.
        /// </summary>
        public void ResetToDefault()
        {
            _hour = startingHour;
            _minute = 0;
            _day = startingDay;
            _totalMinutes = startingHour * 60;
            _isPaused = true;
            _accumulatedTime = 0f;
            _currentPhase = GetPhaseForHour(_hour);

            Log($"Reset to default: {GetFormattedDateTime()}");
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data for serialization.
        /// </summary>
        public TimeSystemSaveData GetSaveData()
        {
            return new TimeSystemSaveData
            {
                hour = _hour,
                minute = _minute,
                day = _day,
                totalMinutes = _totalMinutes
            };
        }

        /// <summary>
        /// Load state from save data.
        /// </summary>
        public void LoadSaveData(TimeSystemSaveData data)
        {
            _hour = data.hour;
            _minute = data.minute;
            _day = data.day;
            _totalMinutes = data.totalMinutes;
            _currentPhase = GetPhaseForHour(_hour);
            _accumulatedTime = 0f;

            Log($"Loaded: {GetFormattedDateTime()}");
        }

        #endregion

        #region Event Emission

        private void EmitTick()
        {
            var args = CreateEventArgs();
            OnTick?.Invoke(this, args);
        }

        private void EmitHourChanged()
        {
            var args = CreateEventArgs();
            OnHourChanged?.Invoke(this, args);

            EventBus.Instance?.Publish(GameEvents.HourChanged, _hour.ToString());
            Log($"Hour changed: {GetFormattedTime()}");
        }

        private void EmitPhaseChanged(TimePhase previousPhase)
        {
            var args = CreateEventArgs(previousPhase);
            OnPhaseChanged?.Invoke(this, args);

            EventBus.Instance?.Publish(GameEvents.PhaseOfDayChanged, _currentPhase.ToString());
            Log($"Phase changed: {previousPhase} -> {_currentPhase}");
        }

        private void EmitDayChanged()
        {
            var args = CreateEventArgs();
            OnDayChanged?.Invoke(this, args);

            EventBus.Instance?.Publish(GameEvents.DayChanged, _day.ToString());
            Log($"Day changed: Day {_day}");
        }

        private TimeChangedEventArgs CreateEventArgs(TimePhase? previousPhase = null)
        {
            return new TimeChangedEventArgs(_hour, _minute, _day, _currentPhase, previousPhase);
        }

        #endregion

        #region Utility

        /// <summary>
        /// Convert real seconds to game minutes.
        /// </summary>
        public float RealSecondsToGameMinutes(float realSeconds)
        {
            return realSeconds / realSecondsPerGameMinute;
        }

        /// <summary>
        /// Convert game minutes to real seconds.
        /// </summary>
        public float GameMinutesToRealSeconds(int gameMinutes)
        {
            return gameMinutes * realSecondsPerGameMinute;
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[TimeSystem] {message}");
            }
        }

        #endregion
    }
}
