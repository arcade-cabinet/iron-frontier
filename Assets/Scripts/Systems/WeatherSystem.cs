using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Weather types affecting gameplay.
    /// </summary>
    public enum WeatherType
    {
        /// <summary>Clear skies, optimal conditions.</summary>
        Clear,
        /// <summary>Overcast, slightly reduced visibility.</summary>
        Cloudy,
        /// <summary>Rain reduces visibility and affects firearms.</summary>
        Rain,
        /// <summary>Severe storm with lightning, requires shelter.</summary>
        Thunderstorm,
        /// <summary>Desert dust storm, very low visibility.</summary>
        DustStorm,
        /// <summary>Extreme heat, increased water consumption.</summary>
        HeatWave,
        /// <summary>Cold snap, requires warm clothing.</summary>
        ColdSnap,
        /// <summary>Dense fog, severely reduced visibility.</summary>
        Fog
    }

    /// <summary>
    /// Severity levels for weather effects.
    /// </summary>
    public enum WeatherSeverity
    {
        /// <summary>Mild weather effects (50% intensity).</summary>
        Mild,
        /// <summary>Moderate weather effects (100% intensity).</summary>
        Moderate,
        /// <summary>Severe weather effects (150% intensity).</summary>
        Severe,
        /// <summary>Extreme weather effects (200% intensity).</summary>
        Extreme
    }

    /// <summary>
    /// Game seasons affecting weather patterns.
    /// </summary>
    public enum Season
    {
        Spring,
        Summer,
        Fall,
        Winter
    }

    /// <summary>
    /// Biome types with different weather patterns.
    /// </summary>
    public enum BiomeType
    {
        Desert,
        Mountains,
        Plains,
        Canyon,
        Badlands,
        Riverside,
        Forest
    }

    /// <summary>
    /// Weather effect modifiers applied to gameplay.
    /// </summary>
    [Serializable]
    public class WeatherEffects
    {
        /// <summary>Movement speed multiplier (1.0 = normal).</summary>
        public float movementMultiplier = 1.0f;

        /// <summary>Visibility range multiplier (1.0 = normal).</summary>
        public float visibilityMultiplier = 1.0f;

        /// <summary>Accuracy modifier for ranged attacks.</summary>
        public int accuracyModifier = 0;

        /// <summary>Firearm effectiveness multiplier.</summary>
        public float fireWeaponMultiplier = 1.0f;

        /// <summary>Tracking skill modifier.</summary>
        public int trackingModifier = 0;

        /// <summary>Ambush chance modifier.</summary>
        public int ambushChanceModifier = 0;

        /// <summary>Water consumption multiplier.</summary>
        public float waterConsumptionMultiplier = 1.0f;

        /// <summary>Stamina drain multiplier.</summary>
        public float staminaDrainMultiplier = 1.0f;

        /// <summary>Damage per hour when outdoors (without protection).</summary>
        public int outdoorDamagePerHour = 0;

        /// <summary>Whether shelter is required.</summary>
        public bool requiresShelter = false;

        /// <summary>Encounter rate modifier.</summary>
        public float encounterRateModifier = 1.0f;

        /// <summary>Whether fires can be started.</summary>
        public bool canStartFire = true;

        /// <summary>Lightning strike chance per hour.</summary>
        public float lightningChance = 0f;
    }

    /// <summary>
    /// Event arguments for weather changes.
    /// </summary>
    public class WeatherChangedEventArgs : EventArgs
    {
        /// <summary>Previous weather type.</summary>
        public WeatherType PreviousWeather { get; }

        /// <summary>New weather type.</summary>
        public WeatherType NewWeather { get; }

        /// <summary>New weather severity.</summary>
        public WeatherSeverity Severity { get; }

        /// <summary>Current temperature.</summary>
        public float Temperature { get; }

        public WeatherChangedEventArgs(WeatherType previous, WeatherType current, WeatherSeverity severity, float temperature)
        {
            PreviousWeather = previous;
            NewWeather = current;
            Severity = severity;
            Temperature = temperature;
        }
    }

    /// <summary>
    /// Weather state machine with biome-specific patterns and transitions.
    /// Manages weather types, severity, and effects on gameplay.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript environment/index.ts (WeatherSystem class).
    /// Features:
    /// - Biome-specific weather probability weights
    /// - Seasonal modifiers
    /// - Time-based weather transitions
    /// - Severity-scaled effects
    /// </remarks>
    public class WeatherSystem : MonoBehaviour
    {
        #region Singleton

        private static WeatherSystem _instance;

        /// <summary>
        /// Global singleton instance of WeatherSystem.
        /// </summary>
        public static WeatherSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<WeatherSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[WeatherSystem]");
                        _instance = go.AddComponent<WeatherSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when weather type changes.</summary>
        public event EventHandler<WeatherChangedEventArgs> OnWeatherChanged;

        /// <summary>Fired when weather severity changes.</summary>
        public event EventHandler<WeatherSeverity> OnSeverityChanged;

        #endregion

        #region Configuration

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Average weather duration in game hours")]
        private float averageWeatherDuration = 8f;

        [SerializeField]
        [Tooltip("Starting weather type")]
        private WeatherType startingWeather = WeatherType.Clear;

        [SerializeField]
        [Tooltip("Starting biome")]
        private BiomeType startingBiome = BiomeType.Plains;

        [SerializeField]
        [Tooltip("Starting season")]
        private Season startingSeason = Season.Summer;

        [Header("Temperature")]
        [SerializeField]
        [Tooltip("Base temperature in Fahrenheit")]
        private float baseTemperature = 70f;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region State

        private WeatherType _currentWeather;
        private WeatherSeverity _currentSeverity;
        private float _hoursUntilChange;
        private float _hoursSinceCurrent;
        private float _temperature;
        private BiomeType _currentBiome;
        private Season _currentSeason;

        // Cached effects
        private WeatherEffects _currentEffects;

        #endregion

        #region Properties

        /// <summary>Current weather type.</summary>
        public WeatherType CurrentWeather => _currentWeather;

        /// <summary>Current weather severity.</summary>
        public WeatherSeverity CurrentSeverity => _currentSeverity;

        /// <summary>Current temperature in Fahrenheit.</summary>
        public float Temperature => _temperature;

        /// <summary>Hours until next weather change.</summary>
        public float HoursUntilChange => _hoursUntilChange;

        /// <summary>Current biome.</summary>
        public BiomeType CurrentBiome => _currentBiome;

        /// <summary>Current season.</summary>
        public Season CurrentSeason => _currentSeason;

        /// <summary>Current weather effects (cached, severity-adjusted).</summary>
        public WeatherEffects CurrentEffects => _currentEffects;

        /// <summary>Whether current weather requires shelter.</summary>
        public bool RequiresShelter => _currentEffects?.requiresShelter ?? false;

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
            Log("WeatherSystem initialized");
        }

        private void Start()
        {
            // Subscribe to time events
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnHourChanged += OnHourChanged;
            }
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
            AdvanceWeather(1);
        }

        #endregion

        #region Public API

        /// <summary>
        /// Advance weather simulation by specified hours.
        /// </summary>
        /// <param name="hours">Hours to advance.</param>
        public void AdvanceWeather(float hours)
        {
            _hoursSinceCurrent += hours;
            _hoursUntilChange -= hours;

            if (_hoursUntilChange <= 0)
            {
                TransitionToNextWeather();
            }
        }

        /// <summary>
        /// Force a specific weather condition.
        /// </summary>
        /// <param name="weather">Weather type to set.</param>
        /// <param name="severity">Severity level (default: Moderate).</param>
        /// <param name="duration">Duration in hours (null = auto).</param>
        public void ForceWeather(WeatherType weather, WeatherSeverity severity = WeatherSeverity.Moderate, float? duration = null)
        {
            var previousWeather = _currentWeather;

            _currentWeather = weather;
            _currentSeverity = severity;
            _hoursSinceCurrent = 0f;
            _hoursUntilChange = duration ?? SelectDuration();

            UpdateTemperature();
            UpdateEffects();

            EmitWeatherChanged(previousWeather);
            Log($"Weather forced to {weather} ({severity})");
        }

        /// <summary>
        /// Set the current biome (affects weather patterns).
        /// </summary>
        /// <param name="biome">New biome.</param>
        public void SetBiome(BiomeType biome)
        {
            _currentBiome = biome;
            UpdateTemperature();
            Log($"Biome changed to {biome}");
        }

        /// <summary>
        /// Set the current season (affects weather patterns).
        /// </summary>
        /// <param name="season">New season.</param>
        public void SetSeason(Season season)
        {
            _currentSeason = season;
            UpdateTemperature();
            Log($"Season changed to {season}");
        }

        /// <summary>
        /// Get the display name for the current weather.
        /// </summary>
        public string GetWeatherDisplayName()
        {
            return _currentWeather switch
            {
                WeatherType.Clear => "Clear",
                WeatherType.Cloudy => "Cloudy",
                WeatherType.Rain => "Rain",
                WeatherType.Thunderstorm => "Thunderstorm",
                WeatherType.DustStorm => "Dust Storm",
                WeatherType.HeatWave => "Heat Wave",
                WeatherType.ColdSnap => "Cold Snap",
                WeatherType.Fog => "Fog",
                _ => "Unknown"
            };
        }

        /// <summary>
        /// Get a description of current conditions.
        /// </summary>
        public string GetConditionsDescription()
        {
            string severity = _currentSeverity switch
            {
                WeatherSeverity.Mild => "mild",
                WeatherSeverity.Moderate => "moderate",
                WeatherSeverity.Severe => "severe",
                WeatherSeverity.Extreme => "extreme",
                _ => ""
            };

            return $"{severity} {GetWeatherDisplayName().ToLower()}, {Mathf.RoundToInt(_temperature)}F";
        }

        /// <summary>
        /// Reset to default state.
        /// </summary>
        public void ResetToDefault()
        {
            _currentWeather = startingWeather;
            _currentSeverity = WeatherSeverity.Moderate;
            _hoursUntilChange = averageWeatherDuration;
            _hoursSinceCurrent = 0f;
            _temperature = baseTemperature;
            _currentBiome = startingBiome;
            _currentSeason = startingSeason;

            UpdateEffects();
            Log("Reset to default");
        }

        #endregion

        #region Weather Transition

        private void TransitionToNextWeather()
        {
            var previousWeather = _currentWeather;

            _currentWeather = SelectNextWeather();
            _currentSeverity = SelectSeverity();
            _hoursSinceCurrent = 0f;
            _hoursUntilChange = SelectDuration();

            UpdateTemperature();
            UpdateEffects();

            EmitWeatherChanged(previousWeather);
            Log($"Weather transitioned: {previousWeather} -> {_currentWeather} ({_currentSeverity})");
        }

        private WeatherType SelectNextWeather()
        {
            var weights = GetBiomeWeights();
            ApplySeasonalModifiers(weights);

            float totalWeight = 0f;
            foreach (var weight in weights.Values)
            {
                totalWeight += weight;
            }

            float random = UnityEngine.Random.Range(0f, totalWeight);

            foreach (var kvp in weights)
            {
                random -= kvp.Value;
                if (random <= 0)
                {
                    return kvp.Key;
                }
            }

            return WeatherType.Clear;
        }

        private WeatherSeverity SelectSeverity()
        {
            float roll = UnityEngine.Random.value;

            if (roll < 0.1f) return WeatherSeverity.Extreme;
            if (roll < 0.3f) return WeatherSeverity.Severe;
            if (roll < 0.6f) return WeatherSeverity.Moderate;
            return WeatherSeverity.Mild;
        }

        private float SelectDuration()
        {
            // 50% to 150% of average
            return averageWeatherDuration * (0.5f + UnityEngine.Random.value);
        }

        #endregion

        #region Biome Weather Weights

        private Dictionary<WeatherType, float> GetBiomeWeights()
        {
            return _currentBiome switch
            {
                BiomeType.Desert => new Dictionary<WeatherType, float>
                {
                    { WeatherType.Clear, 15f },
                    { WeatherType.Cloudy, 3f },
                    { WeatherType.Rain, 1f },
                    { WeatherType.Thunderstorm, 0.5f },
                    { WeatherType.DustStorm, 4f },
                    { WeatherType.HeatWave, 5f },
                    { WeatherType.ColdSnap, 0.5f },
                    { WeatherType.Fog, 0.5f }
                },
                BiomeType.Mountains => new Dictionary<WeatherType, float>
                {
                    { WeatherType.Clear, 8f },
                    { WeatherType.Cloudy, 6f },
                    { WeatherType.Rain, 3f },
                    { WeatherType.Thunderstorm, 2f },
                    { WeatherType.DustStorm, 0f },
                    { WeatherType.HeatWave, 0.5f },
                    { WeatherType.ColdSnap, 4f },
                    { WeatherType.Fog, 3f }
                },
                BiomeType.Canyon => new Dictionary<WeatherType, float>
                {
                    { WeatherType.Clear, 12f },
                    { WeatherType.Cloudy, 4f },
                    { WeatherType.Rain, 2f },
                    { WeatherType.Thunderstorm, 1.5f },
                    { WeatherType.DustStorm, 2f },
                    { WeatherType.HeatWave, 4f },
                    { WeatherType.ColdSnap, 1f },
                    { WeatherType.Fog, 1f }
                },
                BiomeType.Badlands => new Dictionary<WeatherType, float>
                {
                    { WeatherType.Clear, 14f },
                    { WeatherType.Cloudy, 3f },
                    { WeatherType.Rain, 1f },
                    { WeatherType.Thunderstorm, 1f },
                    { WeatherType.DustStorm, 3f },
                    { WeatherType.HeatWave, 4f },
                    { WeatherType.ColdSnap, 1f },
                    { WeatherType.Fog, 0.5f }
                },
                BiomeType.Riverside => new Dictionary<WeatherType, float>
                {
                    { WeatherType.Clear, 8f },
                    { WeatherType.Cloudy, 5f },
                    { WeatherType.Rain, 4f },
                    { WeatherType.Thunderstorm, 2f },
                    { WeatherType.DustStorm, 0f },
                    { WeatherType.HeatWave, 2f },
                    { WeatherType.ColdSnap, 2f },
                    { WeatherType.Fog, 5f }
                },
                BiomeType.Forest => new Dictionary<WeatherType, float>
                {
                    { WeatherType.Clear, 7f },
                    { WeatherType.Cloudy, 6f },
                    { WeatherType.Rain, 5f },
                    { WeatherType.Thunderstorm, 2f },
                    { WeatherType.DustStorm, 0f },
                    { WeatherType.HeatWave, 1f },
                    { WeatherType.ColdSnap, 2f },
                    { WeatherType.Fog, 4f }
                },
                _ => new Dictionary<WeatherType, float> // Plains (default)
                {
                    { WeatherType.Clear, 10f },
                    { WeatherType.Cloudy, 5f },
                    { WeatherType.Rain, 4f },
                    { WeatherType.Thunderstorm, 3f },
                    { WeatherType.DustStorm, 1f },
                    { WeatherType.HeatWave, 2f },
                    { WeatherType.ColdSnap, 2f },
                    { WeatherType.Fog, 2f }
                }
            };
        }

        private void ApplySeasonalModifiers(Dictionary<WeatherType, float> weights)
        {
            switch (_currentSeason)
            {
                case Season.Spring:
                    MultiplyWeight(weights, WeatherType.Rain, 1.5f);
                    MultiplyWeight(weights, WeatherType.Thunderstorm, 1.5f);
                    MultiplyWeight(weights, WeatherType.Clear, 0.8f);
                    break;

                case Season.Summer:
                    MultiplyWeight(weights, WeatherType.HeatWave, 2.0f);
                    MultiplyWeight(weights, WeatherType.DustStorm, 1.5f);
                    MultiplyWeight(weights, WeatherType.Clear, 1.5f);
                    MultiplyWeight(weights, WeatherType.ColdSnap, 0f);
                    break;

                case Season.Fall:
                    MultiplyWeight(weights, WeatherType.Fog, 2.0f);
                    MultiplyWeight(weights, WeatherType.Cloudy, 1.3f);
                    break;

                case Season.Winter:
                    MultiplyWeight(weights, WeatherType.ColdSnap, 2.5f);
                    MultiplyWeight(weights, WeatherType.HeatWave, 0f);
                    MultiplyWeight(weights, WeatherType.Clear, 1.0f);
                    break;
            }
        }

        private void MultiplyWeight(Dictionary<WeatherType, float> weights, WeatherType type, float multiplier)
        {
            if (weights.ContainsKey(type))
            {
                weights[type] *= multiplier;
            }
        }

        #endregion

        #region Effects

        private void UpdateEffects()
        {
            var baseEffects = GetBaseEffects(_currentWeather);
            float severityMult = GetSeverityMultiplier(_currentSeverity);

            // Apply severity to effects
            _currentEffects = new WeatherEffects
            {
                movementMultiplier = 1f - (1f - baseEffects.movementMultiplier) * severityMult,
                visibilityMultiplier = 1f - (1f - baseEffects.visibilityMultiplier) * severityMult,
                accuracyModifier = Mathf.RoundToInt(baseEffects.accuracyModifier * severityMult),
                fireWeaponMultiplier = baseEffects.fireWeaponMultiplier,
                trackingModifier = Mathf.RoundToInt(baseEffects.trackingModifier * severityMult),
                ambushChanceModifier = Mathf.RoundToInt(baseEffects.ambushChanceModifier * severityMult),
                waterConsumptionMultiplier = 1f + (baseEffects.waterConsumptionMultiplier - 1f) * severityMult,
                staminaDrainMultiplier = 1f + (baseEffects.staminaDrainMultiplier - 1f) * severityMult,
                outdoorDamagePerHour = Mathf.RoundToInt(baseEffects.outdoorDamagePerHour * severityMult),
                requiresShelter = baseEffects.requiresShelter,
                encounterRateModifier = baseEffects.encounterRateModifier,
                canStartFire = baseEffects.canStartFire,
                lightningChance = baseEffects.lightningChance * severityMult
            };
        }

        private WeatherEffects GetBaseEffects(WeatherType weather)
        {
            return weather switch
            {
                WeatherType.Clear => new WeatherEffects(),

                WeatherType.Cloudy => new WeatherEffects
                {
                    visibilityMultiplier = 0.85f,
                    accuracyModifier = -5,
                    ambushChanceModifier = 5,
                    waterConsumptionMultiplier = 0.9f
                },

                WeatherType.Rain => new WeatherEffects
                {
                    movementMultiplier = 0.85f,
                    visibilityMultiplier = 0.7f,
                    accuracyModifier = -15,
                    fireWeaponMultiplier = 0.7f,
                    trackingModifier = 20,
                    ambushChanceModifier = 10,
                    waterConsumptionMultiplier = 0.5f,
                    staminaDrainMultiplier = 1.2f,
                    encounterRateModifier = 0.8f,
                    canStartFire = false
                },

                WeatherType.Thunderstorm => new WeatherEffects
                {
                    movementMultiplier = 0.6f,
                    visibilityMultiplier = 0.4f,
                    accuracyModifier = -30,
                    fireWeaponMultiplier = 0.4f,
                    trackingModifier = -20,
                    ambushChanceModifier = 25,
                    waterConsumptionMultiplier = 0.3f,
                    staminaDrainMultiplier = 1.5f,
                    outdoorDamagePerHour = 2,
                    requiresShelter = true,
                    encounterRateModifier = 0.5f,
                    canStartFire = false,
                    lightningChance = 0.05f
                },

                WeatherType.DustStorm => new WeatherEffects
                {
                    movementMultiplier = 0.5f,
                    visibilityMultiplier = 0.2f,
                    accuracyModifier = -40,
                    fireWeaponMultiplier = 0.8f,
                    trackingModifier = -50,
                    ambushChanceModifier = 40,
                    waterConsumptionMultiplier = 2.0f,
                    staminaDrainMultiplier = 2.0f,
                    outdoorDamagePerHour = 5,
                    requiresShelter = true,
                    encounterRateModifier = 0.3f,
                    canStartFire = false
                },

                WeatherType.HeatWave => new WeatherEffects
                {
                    movementMultiplier = 0.8f,
                    visibilityMultiplier = 0.9f,
                    accuracyModifier = -10,
                    waterConsumptionMultiplier = 2.5f,
                    staminaDrainMultiplier = 1.8f,
                    outdoorDamagePerHour = 3,
                    encounterRateModifier = 0.7f
                },

                WeatherType.ColdSnap => new WeatherEffects
                {
                    movementMultiplier = 0.75f,
                    accuracyModifier = -10,
                    fireWeaponMultiplier = 0.9f,
                    trackingModifier = 15,
                    ambushChanceModifier = 5,
                    waterConsumptionMultiplier = 0.7f,
                    staminaDrainMultiplier = 1.6f,
                    outdoorDamagePerHour = 4,
                    encounterRateModifier = 0.8f
                },

                WeatherType.Fog => new WeatherEffects
                {
                    movementMultiplier = 0.9f,
                    visibilityMultiplier = 0.3f,
                    accuracyModifier = -25,
                    trackingModifier = 10,
                    ambushChanceModifier = 35,
                    waterConsumptionMultiplier = 0.8f,
                    encounterRateModifier = 1.2f
                },

                _ => new WeatherEffects()
            };
        }

        private float GetSeverityMultiplier(WeatherSeverity severity)
        {
            return severity switch
            {
                WeatherSeverity.Mild => 0.5f,
                WeatherSeverity.Moderate => 1.0f,
                WeatherSeverity.Severe => 1.5f,
                WeatherSeverity.Extreme => 2.0f,
                _ => 1.0f
            };
        }

        #endregion

        #region Temperature

        private void UpdateTemperature()
        {
            float temp = baseTemperature;

            // Season modifier
            temp += _currentSeason switch
            {
                Season.Spring => -5f,
                Season.Summer => 15f,
                Season.Fall => 0f,
                Season.Winter => -20f,
                _ => 0f
            };

            // Weather modifier
            temp += _currentWeather switch
            {
                WeatherType.HeatWave => 20f,
                WeatherType.ColdSnap => -25f,
                WeatherType.Rain => -10f,
                WeatherType.Thunderstorm => -10f,
                WeatherType.Cloudy => -5f,
                _ => 0f
            };

            // Biome modifier
            temp += _currentBiome switch
            {
                BiomeType.Desert => 15f,
                BiomeType.Mountains => -10f,
                BiomeType.Canyon => 10f,
                BiomeType.Badlands => 10f,
                BiomeType.Riverside => -5f,
                BiomeType.Forest => -5f,
                _ => 0f
            };

            _temperature = temp;
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data for serialization.
        /// </summary>
        public WeatherSystemSaveData GetSaveData()
        {
            return new WeatherSystemSaveData
            {
                currentWeather = _currentWeather.ToString(),
                severity = _currentSeverity.ToString(),
                hoursUntilChange = _hoursUntilChange,
                hoursSinceCurrent = _hoursSinceCurrent,
                temperature = _temperature,
                currentBiome = _currentBiome.ToString(),
                currentSeason = _currentSeason.ToString()
            };
        }

        /// <summary>
        /// Load state from save data.
        /// </summary>
        public void LoadSaveData(WeatherSystemSaveData data)
        {
            Enum.TryParse(data.currentWeather, out _currentWeather);
            Enum.TryParse(data.severity, out _currentSeverity);
            Enum.TryParse(data.currentBiome, out _currentBiome);
            Enum.TryParse(data.currentSeason, out _currentSeason);

            _hoursUntilChange = data.hoursUntilChange;
            _hoursSinceCurrent = data.hoursSinceCurrent;
            _temperature = data.temperature;

            UpdateEffects();
            Log($"Loaded: {_currentWeather} ({_currentSeverity})");
        }

        #endregion

        #region Event Emission

        private void EmitWeatherChanged(WeatherType previousWeather)
        {
            var args = new WeatherChangedEventArgs(previousWeather, _currentWeather, _currentSeverity, _temperature);
            OnWeatherChanged?.Invoke(this, args);

            EventBus.Instance?.Publish(GameEvents.WeatherChanged, _currentWeather.ToString());
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[WeatherSystem] {message}");
            }
        }

        #endregion
    }
}
