using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using IronFrontier.Core;
using IronFrontier.Systems;

namespace IronFrontier.Environment
{
    /// <summary>
    /// Lighting preset for a specific time of day.
    /// </summary>
    [Serializable]
    public class LightingPreset
    {
        /// <summary>Time phase this preset applies to.</summary>
        public TimePhase timePhase;

        /// <summary>Display name for this preset.</summary>
        public string displayName;

        [Header("Sun Settings")]
        /// <summary>Sun rotation (Euler angles).</summary>
        public Vector3 sunRotation;

        /// <summary>Sun light color.</summary>
        public Color sunColor = Color.white;

        /// <summary>Sun intensity.</summary>
        [Range(0f, 3f)]
        public float sunIntensity = 1f;

        /// <summary>Enable shadows.</summary>
        public bool enableShadows = true;

        /// <summary>Shadow strength.</summary>
        [Range(0f, 1f)]
        public float shadowStrength = 1f;

        [Header("Ambient Settings")]
        /// <summary>Ambient light color (sky).</summary>
        public Color ambientSkyColor = new Color(0.5f, 0.6f, 0.7f);

        /// <summary>Ambient equator color.</summary>
        public Color ambientEquatorColor = new Color(0.4f, 0.4f, 0.4f);

        /// <summary>Ambient ground color.</summary>
        public Color ambientGroundColor = new Color(0.2f, 0.2f, 0.2f);

        /// <summary>Ambient intensity.</summary>
        [Range(0f, 2f)]
        public float ambientIntensity = 1f;

        [Header("Fog Settings")]
        /// <summary>Fog color.</summary>
        public Color fogColor = new Color(0.5f, 0.5f, 0.5f);

        /// <summary>Fog density.</summary>
        [Range(0f, 0.1f)]
        public float fogDensity = 0.01f;

        /// <summary>Enable fog.</summary>
        public bool enableFog = true;

        [Header("Skybox")]
        /// <summary>Skybox tint color.</summary>
        public Color skyboxTint = Color.white;

        /// <summary>Skybox exposure.</summary>
        [Range(0f, 8f)]
        public float skyboxExposure = 1f;

        /// <summary>Skybox atmosphere thickness.</summary>
        [Range(0f, 5f)]
        public float atmosphereThickness = 1f;

        /// <summary>Create a default dawn preset.</summary>
        public static LightingPreset CreateDawn()
        {
            return new LightingPreset
            {
                timePhase = TimePhase.Dawn,
                displayName = "Dawn",
                sunRotation = new Vector3(10f, -30f, 0f),
                sunColor = new Color(1f, 0.7f, 0.5f),
                sunIntensity = 0.6f,
                enableShadows = true,
                shadowStrength = 0.6f,
                ambientSkyColor = new Color(0.6f, 0.5f, 0.6f),
                ambientEquatorColor = new Color(0.5f, 0.4f, 0.4f),
                ambientGroundColor = new Color(0.3f, 0.25f, 0.25f),
                ambientIntensity = 0.8f,
                fogColor = new Color(0.6f, 0.5f, 0.5f),
                fogDensity = 0.015f,
                enableFog = true,
                skyboxTint = new Color(1f, 0.85f, 0.8f),
                skyboxExposure = 1.2f,
                atmosphereThickness = 1.5f
            };
        }

        /// <summary>Create a default day preset.</summary>
        public static LightingPreset CreateDay()
        {
            return new LightingPreset
            {
                timePhase = TimePhase.Day,
                displayName = "Day",
                sunRotation = new Vector3(50f, 30f, 0f),
                sunColor = new Color(1f, 0.96f, 0.9f),
                sunIntensity = 1.2f,
                enableShadows = true,
                shadowStrength = 1f,
                ambientSkyColor = new Color(0.7f, 0.8f, 0.95f),
                ambientEquatorColor = new Color(0.5f, 0.55f, 0.6f),
                ambientGroundColor = new Color(0.3f, 0.3f, 0.3f),
                ambientIntensity = 1f,
                fogColor = new Color(0.65f, 0.7f, 0.75f),
                fogDensity = 0.005f,
                enableFog = true,
                skyboxTint = Color.white,
                skyboxExposure = 1f,
                atmosphereThickness = 1f
            };
        }

        /// <summary>Create a default dusk preset.</summary>
        public static LightingPreset CreateDusk()
        {
            return new LightingPreset
            {
                timePhase = TimePhase.Dusk,
                displayName = "Dusk",
                sunRotation = new Vector3(5f, 150f, 0f),
                sunColor = new Color(1f, 0.5f, 0.3f),
                sunIntensity = 0.7f,
                enableShadows = true,
                shadowStrength = 0.7f,
                ambientSkyColor = new Color(0.6f, 0.45f, 0.5f),
                ambientEquatorColor = new Color(0.4f, 0.3f, 0.35f),
                ambientGroundColor = new Color(0.25f, 0.2f, 0.2f),
                ambientIntensity = 0.7f,
                fogColor = new Color(0.5f, 0.4f, 0.4f),
                fogDensity = 0.012f,
                enableFog = true,
                skyboxTint = new Color(1f, 0.7f, 0.6f),
                skyboxExposure = 0.9f,
                atmosphereThickness = 2f
            };
        }

        /// <summary>Create a default night preset.</summary>
        public static LightingPreset CreateNight()
        {
            return new LightingPreset
            {
                timePhase = TimePhase.Night,
                displayName = "Night",
                sunRotation = new Vector3(-30f, 0f, 0f),
                sunColor = new Color(0.3f, 0.35f, 0.5f),
                sunIntensity = 0.1f,
                enableShadows = false,
                shadowStrength = 0.3f,
                ambientSkyColor = new Color(0.1f, 0.12f, 0.2f),
                ambientEquatorColor = new Color(0.08f, 0.08f, 0.12f),
                ambientGroundColor = new Color(0.05f, 0.05f, 0.08f),
                ambientIntensity = 0.4f,
                fogColor = new Color(0.1f, 0.12f, 0.18f),
                fogDensity = 0.02f,
                enableFog = true,
                skyboxTint = new Color(0.15f, 0.18f, 0.25f),
                skyboxExposure = 0.3f,
                atmosphereThickness = 0.5f
            };
        }
    }

    /// <summary>
    /// Scheduled time event configuration.
    /// </summary>
    [Serializable]
    public class TimeEvent
    {
        /// <summary>Event identifier.</summary>
        public string eventId;

        /// <summary>Hour to trigger (0-23).</summary>
        [Range(0, 23)]
        public int triggerHour;

        /// <summary>Minute to trigger (0-59).</summary>
        [Range(0, 59)]
        public int triggerMinute;

        /// <summary>Whether this event repeats daily.</summary>
        public bool repeatsDaily = true;

        /// <summary>Whether this event has triggered today.</summary>
        [NonSerialized]
        public bool triggeredToday = false;

        /// <summary>Event callback action.</summary>
        public Action callback;
    }

    /// <summary>
    /// Event arguments for time-based events.
    /// </summary>
    public class TimeEventArgs : EventArgs
    {
        /// <summary>Event identifier.</summary>
        public string EventId { get; }

        /// <summary>Time phase when event triggered.</summary>
        public TimePhase Phase { get; }

        /// <summary>Hour when event triggered.</summary>
        public int Hour { get; }

        public TimeEventArgs(string eventId, TimePhase phase, int hour)
        {
            EventId = eventId;
            Phase = phase;
            Hour = hour;
        }
    }

    /// <summary>
    /// Manages day/night cycle visuals including sun rotation, lighting presets,
    /// skybox blending, and time-based events.
    /// </summary>
    /// <remarks>
    /// Features:
    /// - Sun rotation based on time of day
    /// - Smooth blending between lighting presets (dawn, day, dusk, night)
    /// - Skybox parameter animation
    /// - Scheduled time-based events (shop hours, NPC schedules, etc.)
    /// - Integration with TimeSystem for game clock
    /// </remarks>
    public class DayNightCycle : MonoBehaviour
    {
        #region Singleton

        private static DayNightCycle _instance;

        /// <summary>
        /// Global singleton instance of DayNightCycle.
        /// </summary>
        public static DayNightCycle Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<DayNightCycle>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[DayNightCycle]");
                        _instance = go.AddComponent<DayNightCycle>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when a scheduled time event triggers.</summary>
        public event EventHandler<TimeEventArgs> OnTimeEvent;

        /// <summary>Fired when lighting preset changes.</summary>
        public event EventHandler<TimePhase> OnPresetChanged;

        #endregion

        #region Configuration

        [Header("Sun Settings")]
        [SerializeField]
        [Tooltip("Directional light used as the sun")]
        private Light sunLight;

        [SerializeField]
        [Tooltip("Enable continuous sun rotation")]
        private bool enableSunRotation = true;

        [SerializeField]
        [Tooltip("Sun rotation axis")]
        private Vector3 sunAxis = new Vector3(1f, 0f, 0f);

        [Header("Moon Settings")]
        [SerializeField]
        [Tooltip("Optional moon light for night")]
        private Light moonLight;

        [SerializeField]
        [Tooltip("Moon light intensity at night")]
        private float moonIntensity = 0.2f;

        [Header("Lighting Presets")]
        [SerializeField]
        [Tooltip("Dawn lighting preset")]
        private LightingPreset dawnPreset;

        [SerializeField]
        [Tooltip("Day lighting preset")]
        private LightingPreset dayPreset;

        [SerializeField]
        [Tooltip("Dusk lighting preset")]
        private LightingPreset duskPreset;

        [SerializeField]
        [Tooltip("Night lighting preset")]
        private LightingPreset nightPreset;

        [Header("Blending")]
        [SerializeField]
        [Tooltip("Transition duration in seconds")]
        private float transitionDuration = 5f;

        [SerializeField]
        [Tooltip("Blend curve for transitions")]
        private AnimationCurve blendCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("Skybox")]
        [SerializeField]
        [Tooltip("Skybox material (procedural)")]
        private Material skyboxMaterial;

        [SerializeField]
        [Tooltip("Star intensity at night")]
        [Range(0f, 1f)]
        private float starIntensity = 0.8f;

        [Header("Time Events")]
        [SerializeField]
        [Tooltip("Scheduled time events")]
        private List<TimeEvent> timeEvents = new List<TimeEvent>();

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        [SerializeField]
        [Range(0f, 24f)]
        private float debugHour = 12f;

        [SerializeField]
        private bool useDebugTime = false;

        #endregion

        #region State

        private TimePhase _currentPhase;
        private TimePhase _targetPhase;
        private LightingPreset _currentPreset;
        private LightingPreset _targetPreset;
        private float _transitionProgress = 1f;
        private bool _isTransitioning = false;
        private bool _isInitialized = false;
        private int _lastDay = -1;

        #endregion

        #region Properties

        /// <summary>Current lighting time phase.</summary>
        public TimePhase CurrentPhase => _currentPhase;

        /// <summary>Whether currently transitioning between presets.</summary>
        public bool IsTransitioning => _isTransitioning;

        /// <summary>Current transition progress (0-1).</summary>
        public float TransitionProgress => _transitionProgress;

        /// <summary>Current sun rotation.</summary>
        public Quaternion SunRotation => sunLight != null ? sunLight.transform.rotation : Quaternion.identity;

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
            Log("DayNightCycle awakened");
        }

        private void Start()
        {
            Initialize();
        }

        private void Update()
        {
            if (!_isInitialized) return;

            // Update transition
            if (_isTransitioning)
            {
                UpdateTransition();
            }

            // Update sun rotation
            if (enableSunRotation)
            {
                UpdateSunRotation();
            }

            // Debug time override
            if (useDebugTime)
            {
                ApplyTimeOfDay(debugHour);
            }
        }

        private void OnDestroy()
        {
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnPhaseChanged -= OnTimePhaseChanged;
                TimeSystem.Instance.OnHourChanged -= OnHourChanged;
                TimeSystem.Instance.OnDayChanged -= OnDayChanged;
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the day/night cycle system.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            Log("Initializing DayNightCycle...");

            // Create default presets if not assigned
            CreateDefaultPresets();

            // Find or create sun light
            if (sunLight == null)
            {
                sunLight = FindDirectionalLight();
                if (sunLight == null)
                {
                    sunLight = CreateSunLight();
                }
            }

            // Subscribe to TimeSystem events
            if (TimeSystem.Instance != null)
            {
                TimeSystem.Instance.OnPhaseChanged += OnTimePhaseChanged;
                TimeSystem.Instance.OnHourChanged += OnHourChanged;
                TimeSystem.Instance.OnDayChanged += OnDayChanged;

                // Apply initial state
                _currentPhase = TimeSystem.Instance.CurrentPhase;
                _currentPreset = GetPresetForPhase(_currentPhase);
                ApplyPreset(_currentPreset);
            }
            else
            {
                // Default to day
                _currentPhase = TimePhase.Day;
                _currentPreset = dayPreset;
                ApplyPreset(_currentPreset);
            }

            // Get skybox material if not assigned
            if (skyboxMaterial == null && RenderSettings.skybox != null)
            {
                skyboxMaterial = RenderSettings.skybox;
            }

            _isInitialized = true;
            Log("DayNightCycle initialized");
        }

        private void CreateDefaultPresets()
        {
            if (dawnPreset == null) dawnPreset = LightingPreset.CreateDawn();
            if (dayPreset == null) dayPreset = LightingPreset.CreateDay();
            if (duskPreset == null) duskPreset = LightingPreset.CreateDusk();
            if (nightPreset == null) nightPreset = LightingPreset.CreateNight();
        }

        private Light FindDirectionalLight()
        {
            var lights = FindObjectsByType<Light>(FindObjectsSortMode.None);
            foreach (var light in lights)
            {
                if (light.type == LightType.Directional)
                {
                    return light;
                }
            }
            return null;
        }

        private Light CreateSunLight()
        {
            var sunGO = new GameObject("Sun");
            sunGO.transform.SetParent(transform);
            var light = sunGO.AddComponent<Light>();
            light.type = LightType.Directional;
            light.shadows = LightShadows.Soft;
            return light;
        }

        #endregion

        #region Time Integration

        private void OnTimePhaseChanged(object sender, TimeChangedEventArgs args)
        {
            if (!args.PreviousPhase.HasValue || args.Phase == _currentPhase) return;

            Log($"Time phase changed: {args.PreviousPhase} -> {args.Phase}");
            StartTransition(args.Phase);
        }

        private void OnHourChanged(object sender, TimeChangedEventArgs args)
        {
            // Check scheduled events
            CheckTimeEvents(args.Hour, args.Minute);
        }

        private void OnDayChanged(object sender, TimeChangedEventArgs args)
        {
            // Reset daily events
            if (args.Day != _lastDay)
            {
                _lastDay = args.Day;
                ResetDailyEvents();
            }
        }

        #endregion

        #region Preset Transitions

        /// <summary>
        /// Start a transition to a new time phase.
        /// </summary>
        public void StartTransition(TimePhase targetPhase)
        {
            if (targetPhase == _currentPhase && !_isTransitioning) return;

            _targetPhase = targetPhase;
            _targetPreset = GetPresetForPhase(targetPhase);
            _transitionProgress = 0f;
            _isTransitioning = true;

            Log($"Starting transition to {targetPhase}");
        }

        /// <summary>
        /// Immediately apply a time phase without transition.
        /// </summary>
        public void ApplyPhaseImmediate(TimePhase phase)
        {
            _currentPhase = phase;
            _currentPreset = GetPresetForPhase(phase);
            _isTransitioning = false;
            _transitionProgress = 1f;

            ApplyPreset(_currentPreset);
            OnPresetChanged?.Invoke(this, phase);
        }

        private void UpdateTransition()
        {
            // Advance progress
            _transitionProgress += Time.deltaTime / transitionDuration;
            _transitionProgress = Mathf.Clamp01(_transitionProgress);

            // Apply blend curve
            float blendT = blendCurve.Evaluate(_transitionProgress);

            // Lerp between presets
            ApplyBlendedPreset(_currentPreset, _targetPreset, blendT);

            // Check if transition complete
            if (_transitionProgress >= 1f)
            {
                CompleteTransition();
            }
        }

        private void CompleteTransition()
        {
            _currentPhase = _targetPhase;
            _currentPreset = _targetPreset;
            _isTransitioning = false;

            ApplyPreset(_currentPreset);
            OnPresetChanged?.Invoke(this, _currentPhase);

            Log($"Transition complete: {_currentPhase}");
        }

        private LightingPreset GetPresetForPhase(TimePhase phase)
        {
            return phase switch
            {
                TimePhase.Dawn => dawnPreset,
                TimePhase.Day => dayPreset,
                TimePhase.Dusk => duskPreset,
                TimePhase.Night => nightPreset,
                _ => dayPreset
            };
        }

        #endregion

        #region Preset Application

        private void ApplyPreset(LightingPreset preset)
        {
            if (preset == null) return;

            // Sun light
            if (sunLight != null)
            {
                sunLight.transform.rotation = Quaternion.Euler(preset.sunRotation);
                sunLight.color = preset.sunColor;
                sunLight.intensity = preset.sunIntensity;
                sunLight.shadows = preset.enableShadows ? LightShadows.Soft : LightShadows.None;
                sunLight.shadowStrength = preset.shadowStrength;
            }

            // Moon light
            if (moonLight != null)
            {
                bool isNight = preset.timePhase == TimePhase.Night;
                moonLight.enabled = isNight;
                if (isNight)
                {
                    moonLight.intensity = moonIntensity;
                }
            }

            // Ambient lighting
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = preset.ambientSkyColor;
            RenderSettings.ambientEquatorColor = preset.ambientEquatorColor;
            RenderSettings.ambientGroundColor = preset.ambientGroundColor;
            RenderSettings.ambientIntensity = preset.ambientIntensity;

            // Fog
            RenderSettings.fog = preset.enableFog;
            RenderSettings.fogColor = preset.fogColor;
            RenderSettings.fogDensity = preset.fogDensity;

            // Skybox
            ApplySkyboxSettings(preset);
        }

        private void ApplyBlendedPreset(LightingPreset from, LightingPreset to, float t)
        {
            if (from == null || to == null) return;

            // Sun light
            if (sunLight != null)
            {
                sunLight.transform.rotation = Quaternion.Slerp(
                    Quaternion.Euler(from.sunRotation),
                    Quaternion.Euler(to.sunRotation),
                    t
                );
                sunLight.color = Color.Lerp(from.sunColor, to.sunColor, t);
                sunLight.intensity = Mathf.Lerp(from.sunIntensity, to.sunIntensity, t);
                sunLight.shadowStrength = Mathf.Lerp(from.shadowStrength, to.shadowStrength, t);

                // Enable shadows if either preset has them
                sunLight.shadows = (from.enableShadows || to.enableShadows) && t < 0.5f
                    ? (from.enableShadows ? LightShadows.Soft : LightShadows.None)
                    : (to.enableShadows ? LightShadows.Soft : LightShadows.None);
            }

            // Moon light
            if (moonLight != null)
            {
                bool fromNight = from.timePhase == TimePhase.Night;
                bool toNight = to.timePhase == TimePhase.Night;
                moonLight.enabled = fromNight || toNight;

                if (moonLight.enabled)
                {
                    float moonT = fromNight && toNight ? 1f : (toNight ? t : 1f - t);
                    moonLight.intensity = moonIntensity * moonT;
                }
            }

            // Ambient
            RenderSettings.ambientSkyColor = Color.Lerp(from.ambientSkyColor, to.ambientSkyColor, t);
            RenderSettings.ambientEquatorColor = Color.Lerp(from.ambientEquatorColor, to.ambientEquatorColor, t);
            RenderSettings.ambientGroundColor = Color.Lerp(from.ambientGroundColor, to.ambientGroundColor, t);
            RenderSettings.ambientIntensity = Mathf.Lerp(from.ambientIntensity, to.ambientIntensity, t);

            // Fog
            RenderSettings.fog = from.enableFog || to.enableFog;
            RenderSettings.fogColor = Color.Lerp(from.fogColor, to.fogColor, t);
            RenderSettings.fogDensity = Mathf.Lerp(from.fogDensity, to.fogDensity, t);

            // Skybox
            ApplyBlendedSkybox(from, to, t);
        }

        private void ApplySkyboxSettings(LightingPreset preset)
        {
            if (skyboxMaterial == null) return;

            // Common procedural skybox properties
            if (skyboxMaterial.HasProperty("_SkyTint"))
            {
                skyboxMaterial.SetColor("_SkyTint", preset.skyboxTint);
            }
            if (skyboxMaterial.HasProperty("_Exposure"))
            {
                skyboxMaterial.SetFloat("_Exposure", preset.skyboxExposure);
            }
            if (skyboxMaterial.HasProperty("_AtmosphereThickness"))
            {
                skyboxMaterial.SetFloat("_AtmosphereThickness", preset.atmosphereThickness);
            }

            // Stars for night
            if (skyboxMaterial.HasProperty("_StarIntensity"))
            {
                float stars = preset.timePhase == TimePhase.Night ? starIntensity : 0f;
                skyboxMaterial.SetFloat("_StarIntensity", stars);
            }
        }

        private void ApplyBlendedSkybox(LightingPreset from, LightingPreset to, float t)
        {
            if (skyboxMaterial == null) return;

            if (skyboxMaterial.HasProperty("_SkyTint"))
            {
                skyboxMaterial.SetColor("_SkyTint", Color.Lerp(from.skyboxTint, to.skyboxTint, t));
            }
            if (skyboxMaterial.HasProperty("_Exposure"))
            {
                skyboxMaterial.SetFloat("_Exposure", Mathf.Lerp(from.skyboxExposure, to.skyboxExposure, t));
            }
            if (skyboxMaterial.HasProperty("_AtmosphereThickness"))
            {
                skyboxMaterial.SetFloat("_AtmosphereThickness", Mathf.Lerp(from.atmosphereThickness, to.atmosphereThickness, t));
            }

            // Stars
            if (skyboxMaterial.HasProperty("_StarIntensity"))
            {
                float fromStars = from.timePhase == TimePhase.Night ? starIntensity : 0f;
                float toStars = to.timePhase == TimePhase.Night ? starIntensity : 0f;
                skyboxMaterial.SetFloat("_StarIntensity", Mathf.Lerp(fromStars, toStars, t));
            }
        }

        #endregion

        #region Sun Rotation

        private void UpdateSunRotation()
        {
            if (sunLight == null || TimeSystem.Instance == null) return;

            // Calculate sun angle based on time of day
            float hour = TimeSystem.Instance.Hour + TimeSystem.Instance.Minute / 60f;
            float sunAngle = CalculateSunAngle(hour);

            // Apply rotation around configured axis
            sunLight.transform.rotation = Quaternion.AngleAxis(sunAngle, sunAxis);
        }

        private float CalculateSunAngle(float hour)
        {
            // Sun rises at 6 (0 degrees), peaks at 12 (90 degrees), sets at 18 (180 degrees)
            // Night time (18-6): sun below horizon (-90 to 0 degrees)

            // Normalize hour to 0-1 range over day cycle
            float normalizedTime = hour / 24f;

            // Convert to angle: 0h = -90, 6h = 0, 12h = 90, 18h = 180, 24h = 270
            float angle = normalizedTime * 360f - 90f;

            return angle;
        }

        /// <summary>
        /// Apply a specific time of day (0-24 hours).
        /// </summary>
        public void ApplyTimeOfDay(float hour)
        {
            if (sunLight == null) return;

            float sunAngle = CalculateSunAngle(hour);
            sunLight.transform.rotation = Quaternion.AngleAxis(sunAngle, sunAxis);

            // Determine phase and apply preset
            TimePhase phase;
            if (hour >= 5f && hour < 7f) phase = TimePhase.Dawn;
            else if (hour >= 7f && hour < 18f) phase = TimePhase.Day;
            else if (hour >= 18f && hour < 20f) phase = TimePhase.Dusk;
            else phase = TimePhase.Night;

            if (phase != _currentPhase)
            {
                ApplyPhaseImmediate(phase);
            }
        }

        #endregion

        #region Time Events

        /// <summary>
        /// Register a time-based event.
        /// </summary>
        public void RegisterTimeEvent(string eventId, int hour, int minute, Action callback, bool repeatsDaily = true)
        {
            var timeEvent = new TimeEvent
            {
                eventId = eventId,
                triggerHour = hour,
                triggerMinute = minute,
                repeatsDaily = repeatsDaily,
                callback = callback
            };

            timeEvents.Add(timeEvent);
            Log($"Registered time event: {eventId} at {hour:D2}:{minute:D2}");
        }

        /// <summary>
        /// Unregister a time event.
        /// </summary>
        public void UnregisterTimeEvent(string eventId)
        {
            timeEvents.RemoveAll(e => e.eventId == eventId);
            Log($"Unregistered time event: {eventId}");
        }

        private void CheckTimeEvents(int hour, int minute)
        {
            foreach (var timeEvent in timeEvents)
            {
                if (timeEvent.triggeredToday && timeEvent.repeatsDaily) continue;

                if (timeEvent.triggerHour == hour && timeEvent.triggerMinute <= minute)
                {
                    TriggerTimeEvent(timeEvent);
                }
            }
        }

        private void TriggerTimeEvent(TimeEvent timeEvent)
        {
            timeEvent.triggeredToday = true;
            timeEvent.callback?.Invoke();

            var args = new TimeEventArgs(
                timeEvent.eventId,
                _currentPhase,
                timeEvent.triggerHour
            );

            OnTimeEvent?.Invoke(this, args);
            EventBus.Instance?.Publish("time_event", timeEvent.eventId);

            Log($"Time event triggered: {timeEvent.eventId}");
        }

        private void ResetDailyEvents()
        {
            foreach (var timeEvent in timeEvents)
            {
                if (timeEvent.repeatsDaily)
                {
                    timeEvent.triggeredToday = false;
                }
            }
            Log("Daily events reset");
        }

        #endregion

        #region Public API

        /// <summary>
        /// Get current ambient light level (0-1).
        /// </summary>
        public float GetAmbientLevel()
        {
            if (TimeSystem.Instance != null)
            {
                return TimeSystem.Instance.AmbientLight;
            }

            return _currentPhase switch
            {
                TimePhase.Day => 1f,
                TimePhase.Dawn or TimePhase.Dusk => 0.6f,
                TimePhase.Night => 0.2f,
                _ => 0.5f
            };
        }

        /// <summary>
        /// Check if it's currently dark (night or late dusk).
        /// </summary>
        public bool IsDark()
        {
            return _currentPhase == TimePhase.Night ||
                   (_currentPhase == TimePhase.Dusk && _transitionProgress > 0.7f);
        }

        /// <summary>
        /// Get the current sun direction.
        /// </summary>
        public Vector3 GetSunDirection()
        {
            if (sunLight != null)
            {
                return -sunLight.transform.forward;
            }
            return Vector3.up;
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[DayNightCycle] {message}");
            }
        }

        #endregion
    }
}
