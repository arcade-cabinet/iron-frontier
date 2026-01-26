using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using IronFrontier.Core;
using IronFrontier.Systems;

namespace IronFrontier.Environment
{
    /// <summary>
    /// Configuration for a weather particle effect.
    /// </summary>
    [Serializable]
    public class WeatherParticleConfig
    {
        /// <summary>Weather type this effect applies to.</summary>
        public WeatherType weatherType;

        /// <summary>Particle system prefab.</summary>
        public ParticleSystem particlePrefab;

        /// <summary>Base emission rate.</summary>
        public float baseEmissionRate = 100f;

        /// <summary>Emission rate multiplier per severity level.</summary>
        public float severityMultiplier = 1.5f;

        /// <summary>Follow camera.</summary>
        public bool followCamera = true;

        /// <summary>Offset from camera.</summary>
        public Vector3 cameraOffset = new Vector3(0f, 5f, 0f);

        /// <summary>Spawn area size.</summary>
        public Vector3 spawnArea = new Vector3(50f, 1f, 50f);
    }

    /// <summary>
    /// Configuration for weather post-processing effects.
    /// </summary>
    [Serializable]
    public class WeatherPostProcessConfig
    {
        /// <summary>Weather type this config applies to.</summary>
        public WeatherType weatherType;

        /// <summary>Target fog density.</summary>
        public float fogDensity = 0.01f;

        /// <summary>Fog color.</summary>
        public Color fogColor = Color.gray;

        /// <summary>Color grading saturation.</summary>
        [Range(0f, 2f)]
        public float saturation = 1f;

        /// <summary>Color grading contrast.</summary>
        [Range(0f, 2f)]
        public float contrast = 1f;

        /// <summary>Post-exposure adjustment.</summary>
        [Range(-2f, 2f)]
        public float exposure = 0f;

        /// <summary>Vignette intensity.</summary>
        [Range(0f, 1f)]
        public float vignetteIntensity = 0f;

        /// <summary>Chromatic aberration intensity.</summary>
        [Range(0f, 1f)]
        public float chromaticAberration = 0f;

        /// <summary>Screen distortion for storms.</summary>
        [Range(0f, 1f)]
        public float screenDistortion = 0f;
    }

    /// <summary>
    /// Active weather effect instance.
    /// </summary>
    public class ActiveWeatherEffect
    {
        /// <summary>The particle system instance.</summary>
        public ParticleSystem particleSystem;

        /// <summary>Configuration for this effect.</summary>
        public WeatherParticleConfig config;

        /// <summary>Current emission rate.</summary>
        public float currentEmission;

        /// <summary>Target emission rate.</summary>
        public float targetEmission;

        /// <summary>Whether this effect is fading out.</summary>
        public bool isFadingOut;
    }

    /// <summary>
    /// Manages visual weather effects including particles, post-processing, and audio.
    /// Works in conjunction with WeatherSystem for gameplay effects.
    /// </summary>
    /// <remarks>
    /// Features:
    /// - Rain, dust storm, fog particle systems
    /// - Post-processing effects (fog, color grading, vignette)
    /// - Smooth weather transitions
    /// - Lightning effects for thunderstorms
    /// - Wind effects integration
    /// - Audio ambience triggers
    /// </remarks>
    public class WeatherController : MonoBehaviour
    {
        #region Singleton

        private static WeatherController _instance;

        /// <summary>
        /// Global singleton instance of WeatherController.
        /// </summary>
        public static WeatherController Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<WeatherController>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[WeatherController]");
                        _instance = go.AddComponent<WeatherController>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when lightning strikes.</summary>
        public event EventHandler<Vector3> OnLightningStrike;

        /// <summary>Fired when weather visual transition completes.</summary>
        public event EventHandler<WeatherType> OnWeatherTransitionComplete;

        #endregion

        #region Configuration

        [Header("Particle Configurations")]
        [SerializeField]
        [Tooltip("Weather particle effect configurations")]
        private List<WeatherParticleConfig> particleConfigs = new List<WeatherParticleConfig>();

        [Header("Post-Processing Configurations")]
        [SerializeField]
        [Tooltip("Weather post-processing configurations")]
        private List<WeatherPostProcessConfig> postProcessConfigs = new List<WeatherPostProcessConfig>();

        [Header("Transition Settings")]
        [SerializeField]
        [Tooltip("Duration for weather transitions in seconds")]
        private float transitionDuration = 10f;

        [SerializeField]
        [Tooltip("Fade out duration for old effects")]
        private float fadeOutDuration = 5f;

        [Header("Lightning Settings")]
        [SerializeField]
        [Tooltip("Lightning flash light")]
        private Light lightningLight;

        [SerializeField]
        [Tooltip("Lightning flash intensity")]
        private float lightningIntensity = 5f;

        [SerializeField]
        [Tooltip("Lightning flash duration")]
        private float lightningDuration = 0.1f;

        [SerializeField]
        [Tooltip("Minimum time between lightning strikes")]
        private float minLightningInterval = 3f;

        [SerializeField]
        [Tooltip("Maximum time between lightning strikes")]
        private float maxLightningInterval = 15f;

        [Header("Wind Settings")]
        [SerializeField]
        [Tooltip("Wind zone for vegetation")]
        private WindZone windZone;

        [SerializeField]
        [Tooltip("Base wind strength")]
        private float baseWindStrength = 0.5f;

        [Header("Audio")]
        [SerializeField]
        [Tooltip("Audio source for weather ambience")]
        private AudioSource ambienceSource;

        [SerializeField]
        [Tooltip("Rain ambience clip")]
        private AudioClip rainAmbience;

        [SerializeField]
        [Tooltip("Wind ambience clip")]
        private AudioClip windAmbience;

        [SerializeField]
        [Tooltip("Thunder sound clips")]
        private AudioClip[] thunderSounds;

        [Header("References")]
        [SerializeField]
        [Tooltip("Camera for particle effects to follow")]
        private Camera targetCamera;

        [SerializeField]
        [Tooltip("Volume profile for post-processing (URP)")]
        private VolumeProfile volumeProfile;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region State

        private Dictionary<WeatherType, ActiveWeatherEffect> _activeEffects;
        private WeatherType _currentWeather;
        private WeatherSeverity _currentSeverity;
        private float _transitionProgress;
        private bool _isTransitioning;
        private Coroutine _transitionCoroutine;
        private Coroutine _lightningCoroutine;
        private float _lastLightningTime;
        private bool _isInitialized;

        // Post-processing state
        private WeatherPostProcessConfig _currentPostProcess;
        private WeatherPostProcessConfig _targetPostProcess;
        private float _baseFogDensity;
        private Color _baseFogColor;

        #endregion

        #region Properties

        /// <summary>Current visual weather type.</summary>
        public WeatherType CurrentWeather => _currentWeather;

        /// <summary>Whether currently transitioning weather.</summary>
        public bool IsTransitioning => _isTransitioning;

        /// <summary>Current wind strength.</summary>
        public float WindStrength => windZone != null ? windZone.windMain : 0f;

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
            _activeEffects = new Dictionary<WeatherType, ActiveWeatherEffect>();

            Log("WeatherController awakened");
        }

        private void Start()
        {
            Initialize();
        }

        private void Update()
        {
            if (!_isInitialized) return;

            // Update particle systems to follow camera
            UpdateParticlePositions();

            // Update active effects
            UpdateActiveEffects();
        }

        private void OnDestroy()
        {
            if (WeatherSystem.Instance != null)
            {
                WeatherSystem.Instance.OnWeatherChanged -= OnWeatherChanged;
                WeatherSystem.Instance.OnSeverityChanged -= OnSeverityChanged;
            }

            // Clean up particle systems
            foreach (var effect in _activeEffects.Values)
            {
                if (effect.particleSystem != null)
                {
                    Destroy(effect.particleSystem.gameObject);
                }
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the weather controller.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            Log("Initializing WeatherController...");

            // Find camera if not assigned
            if (targetCamera == null)
            {
                targetCamera = Camera.main;
            }

            // Store base fog settings
            _baseFogDensity = RenderSettings.fogDensity;
            _baseFogColor = RenderSettings.fogColor;

            // Create default post-process configs
            CreateDefaultPostProcessConfigs();

            // Subscribe to weather system
            if (WeatherSystem.Instance != null)
            {
                WeatherSystem.Instance.OnWeatherChanged += OnWeatherChanged;
                WeatherSystem.Instance.OnSeverityChanged += OnSeverityChanged;

                // Apply initial weather
                _currentWeather = WeatherSystem.Instance.CurrentWeather;
                _currentSeverity = WeatherSystem.Instance.CurrentSeverity;
                ApplyWeatherImmediate(_currentWeather, _currentSeverity);
            }

            // Create lightning light if not assigned
            if (lightningLight == null)
            {
                lightningLight = CreateLightningLight();
            }

            // Create wind zone if not assigned
            if (windZone == null)
            {
                windZone = CreateWindZone();
            }

            _isInitialized = true;
            Log("WeatherController initialized");
        }

        private void CreateDefaultPostProcessConfigs()
        {
            if (postProcessConfigs.Count > 0) return;

            postProcessConfigs = new List<WeatherPostProcessConfig>
            {
                // Clear weather
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.Clear,
                    fogDensity = 0.002f,
                    fogColor = new Color(0.7f, 0.8f, 0.9f),
                    saturation = 1.1f,
                    contrast = 1f,
                    exposure = 0f,
                    vignetteIntensity = 0f
                },

                // Cloudy
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.Cloudy,
                    fogDensity = 0.008f,
                    fogColor = new Color(0.6f, 0.6f, 0.65f),
                    saturation = 0.9f,
                    contrast = 0.95f,
                    exposure = -0.1f,
                    vignetteIntensity = 0.1f
                },

                // Rain
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.Rain,
                    fogDensity = 0.015f,
                    fogColor = new Color(0.5f, 0.55f, 0.6f),
                    saturation = 0.8f,
                    contrast = 0.9f,
                    exposure = -0.2f,
                    vignetteIntensity = 0.15f
                },

                // Thunderstorm
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.Thunderstorm,
                    fogDensity = 0.025f,
                    fogColor = new Color(0.35f, 0.4f, 0.45f),
                    saturation = 0.7f,
                    contrast = 1.1f,
                    exposure = -0.3f,
                    vignetteIntensity = 0.25f,
                    chromaticAberration = 0.1f,
                    screenDistortion = 0.05f
                },

                // Dust storm
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.DustStorm,
                    fogDensity = 0.05f,
                    fogColor = new Color(0.7f, 0.55f, 0.4f),
                    saturation = 0.6f,
                    contrast = 0.85f,
                    exposure = -0.1f,
                    vignetteIntensity = 0.3f,
                    screenDistortion = 0.1f
                },

                // Fog
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.Fog,
                    fogDensity = 0.08f,
                    fogColor = new Color(0.75f, 0.78f, 0.8f),
                    saturation = 0.85f,
                    contrast = 0.85f,
                    exposure = 0f,
                    vignetteIntensity = 0.2f
                },

                // Heat wave
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.HeatWave,
                    fogDensity = 0.003f,
                    fogColor = new Color(0.8f, 0.75f, 0.7f),
                    saturation = 1.15f,
                    contrast = 1.1f,
                    exposure = 0.15f,
                    vignetteIntensity = 0.15f,
                    screenDistortion = 0.02f
                },

                // Cold snap
                new WeatherPostProcessConfig
                {
                    weatherType = WeatherType.ColdSnap,
                    fogDensity = 0.01f,
                    fogColor = new Color(0.8f, 0.85f, 0.9f),
                    saturation = 0.75f,
                    contrast = 1.05f,
                    exposure = 0.1f,
                    vignetteIntensity = 0.1f
                }
            };
        }

        private Light CreateLightningLight()
        {
            var lightGO = new GameObject("LightningFlash");
            lightGO.transform.SetParent(transform);
            var light = lightGO.AddComponent<Light>();
            light.type = LightType.Directional;
            light.color = new Color(0.9f, 0.95f, 1f);
            light.intensity = 0f;
            light.shadows = LightShadows.None;
            return light;
        }

        private WindZone CreateWindZone()
        {
            var windGO = new GameObject("WindZone");
            windGO.transform.SetParent(transform);
            var zone = windGO.AddComponent<WindZone>();
            zone.mode = WindZoneMode.Directional;
            zone.windMain = baseWindStrength;
            zone.windTurbulence = 0.5f;
            zone.windPulseMagnitude = 0.5f;
            zone.windPulseFrequency = 0.1f;
            return zone;
        }

        #endregion

        #region Weather System Integration

        private void OnWeatherChanged(object sender, WeatherChangedEventArgs args)
        {
            Log($"Weather changed: {args.PreviousWeather} -> {args.NewWeather} ({args.Severity})");
            TransitionToWeather(args.NewWeather, args.Severity);
        }

        private void OnSeverityChanged(object sender, WeatherSeverity severity)
        {
            _currentSeverity = severity;
            UpdateEffectIntensities();
        }

        #endregion

        #region Weather Transitions

        /// <summary>
        /// Transition to a new weather type with effects.
        /// </summary>
        public void TransitionToWeather(WeatherType weather, WeatherSeverity severity)
        {
            if (_transitionCoroutine != null)
            {
                StopCoroutine(_transitionCoroutine);
            }

            _transitionCoroutine = StartCoroutine(TransitionWeatherCoroutine(weather, severity));
        }

        /// <summary>
        /// Apply weather effects immediately without transition.
        /// </summary>
        public void ApplyWeatherImmediate(WeatherType weather, WeatherSeverity severity)
        {
            // Stop current effects
            foreach (var effect in _activeEffects.Values)
            {
                if (effect.particleSystem != null)
                {
                    var emission = effect.particleSystem.emission;
                    emission.rateOverTime = 0f;
                    effect.particleSystem.Stop();
                }
            }

            _currentWeather = weather;
            _currentSeverity = severity;

            // Start new effects
            StartWeatherEffect(weather, severity);

            // Apply post-processing
            _currentPostProcess = GetPostProcessConfig(weather);
            ApplyPostProcessing(_currentPostProcess, severity);

            // Update wind
            UpdateWind(weather, severity);

            // Start lightning if thunderstorm
            if (weather == WeatherType.Thunderstorm)
            {
                StartLightning(severity);
            }
            else
            {
                StopLightning();
            }

            // Update audio
            UpdateAudioAmbience(weather, severity);
        }

        private IEnumerator TransitionWeatherCoroutine(WeatherType targetWeather, WeatherSeverity severity)
        {
            _isTransitioning = true;
            _transitionProgress = 0f;

            // Mark current effects for fade out
            foreach (var effect in _activeEffects.Values)
            {
                effect.isFadingOut = true;
                effect.targetEmission = 0f;
            }

            // Get target post-processing
            _targetPostProcess = GetPostProcessConfig(targetWeather);

            // Start new effects at zero intensity
            StartWeatherEffect(targetWeather, severity, startAtZero: true);

            // Transition loop
            while (_transitionProgress < 1f)
            {
                _transitionProgress += Time.deltaTime / transitionDuration;
                _transitionProgress = Mathf.Clamp01(_transitionProgress);

                // Blend post-processing
                BlendPostProcessing(_currentPostProcess, _targetPostProcess, _transitionProgress, severity);

                // Update wind
                float windT = Mathf.SmoothStep(0f, 1f, _transitionProgress);
                BlendWind(_currentWeather, targetWeather, windT, severity);

                yield return null;
            }

            // Clean up old effects
            CleanupFadedEffects();

            _currentWeather = targetWeather;
            _currentSeverity = severity;
            _currentPostProcess = _targetPostProcess;
            _isTransitioning = false;

            // Start/stop lightning
            if (targetWeather == WeatherType.Thunderstorm)
            {
                StartLightning(severity);
            }
            else
            {
                StopLightning();
            }

            // Update audio
            UpdateAudioAmbience(targetWeather, severity);

            OnWeatherTransitionComplete?.Invoke(this, targetWeather);
            Log($"Weather transition complete: {targetWeather}");
        }

        #endregion

        #region Particle Effects

        private void StartWeatherEffect(WeatherType weather, WeatherSeverity severity, bool startAtZero = false)
        {
            var config = GetParticleConfig(weather);
            if (config == null || config.particlePrefab == null)
            {
                Log($"No particle config for weather: {weather}");
                return;
            }

            // Check if effect already exists
            if (_activeEffects.TryGetValue(weather, out var existingEffect))
            {
                existingEffect.isFadingOut = false;
                existingEffect.targetEmission = CalculateEmissionRate(config, severity);
                return;
            }

            // Create new effect
            var particleInstance = Instantiate(config.particlePrefab, transform);
            particleInstance.name = $"Weather_{weather}";

            float targetEmission = CalculateEmissionRate(config, severity);
            float startEmission = startAtZero ? 0f : targetEmission;

            var emission = particleInstance.emission;
            emission.rateOverTime = startEmission;

            var effect = new ActiveWeatherEffect
            {
                particleSystem = particleInstance,
                config = config,
                currentEmission = startEmission,
                targetEmission = targetEmission,
                isFadingOut = false
            };

            _activeEffects[weather] = effect;
            particleInstance.Play();

            Log($"Started weather effect: {weather} (emission: {targetEmission})");
        }

        private float CalculateEmissionRate(WeatherParticleConfig config, WeatherSeverity severity)
        {
            float severityMult = severity switch
            {
                WeatherSeverity.Mild => 0.5f,
                WeatherSeverity.Moderate => 1f,
                WeatherSeverity.Severe => 1.5f,
                WeatherSeverity.Extreme => 2f,
                _ => 1f
            };

            return config.baseEmissionRate * severityMult * config.severityMultiplier;
        }

        private void UpdateParticlePositions()
        {
            if (targetCamera == null) return;

            Vector3 cameraPos = targetCamera.transform.position;

            foreach (var effect in _activeEffects.Values)
            {
                if (effect.config.followCamera && effect.particleSystem != null)
                {
                    effect.particleSystem.transform.position = cameraPos + effect.config.cameraOffset;
                }
            }
        }

        private void UpdateActiveEffects()
        {
            float lerpSpeed = Time.deltaTime * 2f;

            foreach (var effect in _activeEffects.Values)
            {
                if (effect.particleSystem == null) continue;

                // Lerp emission rate
                effect.currentEmission = Mathf.Lerp(
                    effect.currentEmission,
                    effect.targetEmission,
                    lerpSpeed
                );

                var emission = effect.particleSystem.emission;
                emission.rateOverTime = effect.currentEmission;
            }
        }

        private void UpdateEffectIntensities()
        {
            foreach (var kvp in _activeEffects)
            {
                if (kvp.Value.isFadingOut) continue;

                var config = kvp.Value.config;
                kvp.Value.targetEmission = CalculateEmissionRate(config, _currentSeverity);
            }
        }

        private void CleanupFadedEffects()
        {
            var toRemove = new List<WeatherType>();

            foreach (var kvp in _activeEffects)
            {
                if (kvp.Value.isFadingOut && kvp.Value.currentEmission < 1f)
                {
                    if (kvp.Value.particleSystem != null)
                    {
                        Destroy(kvp.Value.particleSystem.gameObject);
                    }
                    toRemove.Add(kvp.Key);
                }
            }

            foreach (var key in toRemove)
            {
                _activeEffects.Remove(key);
            }
        }

        private WeatherParticleConfig GetParticleConfig(WeatherType weather)
        {
            foreach (var config in particleConfigs)
            {
                if (config.weatherType == weather)
                {
                    return config;
                }
            }
            return null;
        }

        #endregion

        #region Post-Processing

        private WeatherPostProcessConfig GetPostProcessConfig(WeatherType weather)
        {
            foreach (var config in postProcessConfigs)
            {
                if (config.weatherType == weather)
                {
                    return config;
                }
            }

            // Return clear weather config as default
            return postProcessConfigs.Count > 0 ? postProcessConfigs[0] : null;
        }

        private void ApplyPostProcessing(WeatherPostProcessConfig config, WeatherSeverity severity)
        {
            if (config == null) return;

            float severityMult = GetSeverityMultiplier(severity);

            // Fog
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogDensity = Mathf.Lerp(_baseFogDensity, config.fogDensity, severityMult);
            RenderSettings.fogColor = Color.Lerp(_baseFogColor, config.fogColor, severityMult);

            // Volume profile effects would be applied here
            // This requires URP/HDRP Volume system setup
            ApplyVolumeEffects(config, severityMult);
        }

        private void BlendPostProcessing(WeatherPostProcessConfig from, WeatherPostProcessConfig to, float t, WeatherSeverity severity)
        {
            if (from == null || to == null) return;

            float severityMult = GetSeverityMultiplier(severity);

            // Fog
            RenderSettings.fogDensity = Mathf.Lerp(
                Mathf.Lerp(_baseFogDensity, from.fogDensity, severityMult),
                Mathf.Lerp(_baseFogDensity, to.fogDensity, severityMult),
                t
            );
            RenderSettings.fogColor = Color.Lerp(
                Color.Lerp(_baseFogColor, from.fogColor, severityMult),
                Color.Lerp(_baseFogColor, to.fogColor, severityMult),
                t
            );

            // Volume effects
            BlendVolumeEffects(from, to, t, severityMult);
        }

        private void ApplyVolumeEffects(WeatherPostProcessConfig config, float severityMult)
        {
            // This would integrate with URP/HDRP Volume system
            // For now, we apply what we can through RenderSettings
            // Full implementation requires project-specific volume setup
        }

        private void BlendVolumeEffects(WeatherPostProcessConfig from, WeatherPostProcessConfig to, float t, float severityMult)
        {
            // Similar to above - requires volume profile integration
        }

        private float GetSeverityMultiplier(WeatherSeverity severity)
        {
            return severity switch
            {
                WeatherSeverity.Mild => 0.5f,
                WeatherSeverity.Moderate => 1f,
                WeatherSeverity.Severe => 1.25f,
                WeatherSeverity.Extreme => 1.5f,
                _ => 1f
            };
        }

        #endregion

        #region Wind

        private void UpdateWind(WeatherType weather, WeatherSeverity severity)
        {
            if (windZone == null) return;

            float windStrength = GetWindStrengthForWeather(weather, severity);
            float turbulence = GetWindTurbulenceForWeather(weather, severity);

            windZone.windMain = windStrength;
            windZone.windTurbulence = turbulence;
        }

        private void BlendWind(WeatherType from, WeatherType to, float t, WeatherSeverity severity)
        {
            if (windZone == null) return;

            float fromStrength = GetWindStrengthForWeather(from, severity);
            float toStrength = GetWindStrengthForWeather(to, severity);
            float fromTurbulence = GetWindTurbulenceForWeather(from, severity);
            float toTurbulence = GetWindTurbulenceForWeather(to, severity);

            windZone.windMain = Mathf.Lerp(fromStrength, toStrength, t);
            windZone.windTurbulence = Mathf.Lerp(fromTurbulence, toTurbulence, t);
        }

        private float GetWindStrengthForWeather(WeatherType weather, WeatherSeverity severity)
        {
            float severityMult = GetSeverityMultiplier(severity);

            float baseStrength = weather switch
            {
                WeatherType.Clear => 0.2f,
                WeatherType.Cloudy => 0.4f,
                WeatherType.Rain => 0.8f,
                WeatherType.Thunderstorm => 1.5f,
                WeatherType.DustStorm => 2f,
                WeatherType.Fog => 0.1f,
                WeatherType.HeatWave => 0.3f,
                WeatherType.ColdSnap => 0.6f,
                _ => 0.3f
            };

            return baseStrength * severityMult;
        }

        private float GetWindTurbulenceForWeather(WeatherType weather, WeatherSeverity severity)
        {
            float severityMult = GetSeverityMultiplier(severity);

            float baseTurbulence = weather switch
            {
                WeatherType.Clear => 0.2f,
                WeatherType.Cloudy => 0.4f,
                WeatherType.Rain => 0.6f,
                WeatherType.Thunderstorm => 1f,
                WeatherType.DustStorm => 1.2f,
                WeatherType.Fog => 0.1f,
                WeatherType.HeatWave => 0.5f,
                WeatherType.ColdSnap => 0.5f,
                _ => 0.3f
            };

            return baseTurbulence * severityMult;
        }

        #endregion

        #region Lightning

        private void StartLightning(WeatherSeverity severity)
        {
            if (_lightningCoroutine != null) return;

            _lightningCoroutine = StartCoroutine(LightningCoroutine(severity));
        }

        private void StopLightning()
        {
            if (_lightningCoroutine != null)
            {
                StopCoroutine(_lightningCoroutine);
                _lightningCoroutine = null;
            }

            if (lightningLight != null)
            {
                lightningLight.intensity = 0f;
            }
        }

        private IEnumerator LightningCoroutine(WeatherSeverity severity)
        {
            // Adjust interval based on severity
            float minInterval = minLightningInterval / GetSeverityMultiplier(severity);
            float maxInterval = maxLightningInterval / GetSeverityMultiplier(severity);

            while (true)
            {
                // Random wait
                float waitTime = UnityEngine.Random.Range(minInterval, maxInterval);
                yield return new WaitForSeconds(waitTime);

                // Flash
                yield return StartCoroutine(LightningFlash());

                // Chance of double flash
                if (UnityEngine.Random.value < 0.3f)
                {
                    yield return new WaitForSeconds(0.1f);
                    yield return StartCoroutine(LightningFlash());
                }
            }
        }

        private IEnumerator LightningFlash()
        {
            if (lightningLight == null) yield break;

            // Flash on
            lightningLight.intensity = lightningIntensity;

            // Play thunder sound
            PlayThunder();

            // Brief flash
            yield return new WaitForSeconds(lightningDuration);

            // Quick flicker
            lightningLight.intensity = lightningIntensity * 0.3f;
            yield return new WaitForSeconds(lightningDuration * 0.5f);

            lightningLight.intensity = lightningIntensity * 0.8f;
            yield return new WaitForSeconds(lightningDuration);

            // Fade out
            float fadeTime = lightningDuration * 2f;
            float elapsed = 0f;

            while (elapsed < fadeTime)
            {
                elapsed += Time.deltaTime;
                lightningLight.intensity = Mathf.Lerp(lightningIntensity * 0.5f, 0f, elapsed / fadeTime);
                yield return null;
            }

            lightningLight.intensity = 0f;

            // Fire event
            OnLightningStrike?.Invoke(this, lightningLight.transform.position);
        }

        private void PlayThunder()
        {
            if (thunderSounds == null || thunderSounds.Length == 0) return;
            if (ambienceSource == null) return;

            var clip = thunderSounds[UnityEngine.Random.Range(0, thunderSounds.Length)];
            ambienceSource.PlayOneShot(clip);
        }

        #endregion

        #region Audio

        private void UpdateAudioAmbience(WeatherType weather, WeatherSeverity severity)
        {
            if (ambienceSource == null) return;

            AudioClip targetClip = weather switch
            {
                WeatherType.Rain or WeatherType.Thunderstorm => rainAmbience,
                WeatherType.DustStorm or WeatherType.ColdSnap => windAmbience,
                _ => null
            };

            if (targetClip != ambienceSource.clip)
            {
                StartCoroutine(CrossfadeAmbience(targetClip, severity));
            }
            else
            {
                // Just update volume
                ambienceSource.volume = GetAmbienceVolume(weather, severity);
            }
        }

        private IEnumerator CrossfadeAmbience(AudioClip newClip, WeatherSeverity severity)
        {
            float fadeDuration = 2f;

            // Fade out current
            if (ambienceSource.isPlaying)
            {
                float startVolume = ambienceSource.volume;
                float elapsed = 0f;

                while (elapsed < fadeDuration)
                {
                    elapsed += Time.deltaTime;
                    ambienceSource.volume = Mathf.Lerp(startVolume, 0f, elapsed / fadeDuration);
                    yield return null;
                }

                ambienceSource.Stop();
            }

            // Start new clip
            if (newClip != null)
            {
                ambienceSource.clip = newClip;
                ambienceSource.loop = true;
                ambienceSource.volume = 0f;
                ambienceSource.Play();

                float targetVolume = GetAmbienceVolume(_currentWeather, severity);
                float elapsed = 0f;

                while (elapsed < fadeDuration)
                {
                    elapsed += Time.deltaTime;
                    ambienceSource.volume = Mathf.Lerp(0f, targetVolume, elapsed / fadeDuration);
                    yield return null;
                }
            }
        }

        private float GetAmbienceVolume(WeatherType weather, WeatherSeverity severity)
        {
            float baseVolume = weather switch
            {
                WeatherType.Rain => 0.5f,
                WeatherType.Thunderstorm => 0.7f,
                WeatherType.DustStorm => 0.6f,
                WeatherType.ColdSnap => 0.4f,
                _ => 0f
            };

            return baseVolume * GetSeverityMultiplier(severity);
        }

        #endregion

        #region Public API

        /// <summary>
        /// Force a specific weather effect for testing or events.
        /// </summary>
        public void ForceWeatherEffect(WeatherType weather, WeatherSeverity severity, float duration = 0f)
        {
            TransitionToWeather(weather, severity);

            if (duration > 0f)
            {
                StartCoroutine(RevertWeatherAfterDelay(duration));
            }
        }

        private IEnumerator RevertWeatherAfterDelay(float delay)
        {
            yield return new WaitForSeconds(delay);

            if (WeatherSystem.Instance != null)
            {
                TransitionToWeather(
                    WeatherSystem.Instance.CurrentWeather,
                    WeatherSystem.Instance.CurrentSeverity
                );
            }
        }

        /// <summary>
        /// Trigger a manual lightning strike.
        /// </summary>
        public void TriggerLightning()
        {
            StartCoroutine(LightningFlash());
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[WeatherController] {message}");
            }
        }

        #endregion
    }
}
