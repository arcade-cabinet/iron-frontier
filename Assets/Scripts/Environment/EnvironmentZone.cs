using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Environment
{
    /// <summary>
    /// Types of environment zones that trigger different behaviors.
    /// </summary>
    public enum EnvironmentZoneType
    {
        /// <summary>Town entry/exit zone.</summary>
        Town,
        /// <summary>Safe zone where combat is disabled.</summary>
        SafeZone,
        /// <summary>Combat zone with increased encounter rates.</summary>
        CombatZone,
        /// <summary>Danger zone with environmental hazards.</summary>
        DangerZone,
        /// <summary>Building interior trigger.</summary>
        Building,
        /// <summary>Ambient sound region.</summary>
        AmbientSound,
        /// <summary>Weather override region.</summary>
        WeatherOverride,
        /// <summary>Fast travel point.</summary>
        FastTravel,
        /// <summary>Quest trigger area.</summary>
        QuestTrigger,
        /// <summary>NPC spawn area.</summary>
        NPCSpawn,
        /// <summary>Loot spawn area.</summary>
        LootArea,
        /// <summary>Hidden/secret area.</summary>
        Secret,
        /// <summary>Music transition zone.</summary>
        MusicZone,
        /// <summary>Tutorial trigger zone.</summary>
        Tutorial
    }

    /// <summary>
    /// Event arguments for zone entry/exit.
    /// </summary>
    public class ZoneEventArgs : EventArgs
    {
        /// <summary>The zone that was entered/exited.</summary>
        public EnvironmentZone Zone { get; }

        /// <summary>The entity that triggered the zone.</summary>
        public GameObject Entity { get; }

        /// <summary>Whether this is an entry (true) or exit (false) event.</summary>
        public bool IsEntry { get; }

        public ZoneEventArgs(EnvironmentZone zone, GameObject entity, bool isEntry)
        {
            Zone = zone;
            Entity = entity;
            IsEntry = isEntry;
        }
    }

    /// <summary>
    /// Configuration for zone-specific settings.
    /// </summary>
    [Serializable]
    public class ZoneSettings
    {
        [Header("Encounters")]
        /// <summary>Whether encounters are disabled in this zone.</summary>
        public bool disableEncounters = false;

        /// <summary>Encounter rate modifier.</summary>
        [Range(0f, 3f)]
        public float encounterRateModifier = 1f;

        [Header("Safety")]
        /// <summary>Whether this is a safe zone (no combat).</summary>
        public bool isSafeZone = false;

        /// <summary>Whether PvP is disabled.</summary>
        public bool disablePvP = false;

        /// <summary>Respawn point within zone.</summary>
        public Transform respawnPoint;

        [Header("Audio")]
        /// <summary>Ambient sound clip to play.</summary>
        public AudioClip ambientSound;

        /// <summary>Ambient volume.</summary>
        [Range(0f, 1f)]
        public float ambientVolume = 0.5f;

        /// <summary>Music track override.</summary>
        public AudioClip musicOverride;

        /// <summary>Music crossfade duration.</summary>
        public float musicFadeDuration = 2f;

        [Header("Weather")]
        /// <summary>Override weather in this zone.</summary>
        public bool overrideWeather = false;

        /// <summary>Weather type to force.</summary>
        public Systems.WeatherType forcedWeather;

        [Header("Visuals")]
        /// <summary>Color tint for the zone.</summary>
        public Color zoneTint = Color.white;

        /// <summary>Fog density override.</summary>
        public float fogDensityOverride = -1f;

        [Header("Gameplay")]
        /// <summary>Movement speed modifier.</summary>
        [Range(0.1f, 3f)]
        public float movementSpeedModifier = 1f;

        /// <summary>Healing rate modifier.</summary>
        [Range(0f, 5f)]
        public float healingRateModifier = 1f;

        /// <summary>Custom data tag.</summary>
        public string customTag = "";
    }

    /// <summary>
    /// Environment zone trigger component for managing area-based game events.
    /// Handles town entry/exit, combat zones, safe zones, ambient sounds, and more.
    /// </summary>
    /// <remarks>
    /// Features:
    /// - Multiple zone types for different behaviors
    /// - Player and NPC detection
    /// - Ambient sound triggers
    /// - Weather overrides
    /// - Quest trigger integration
    /// - Fast travel points
    /// - Combat/safe zone management
    /// </remarks>
    [RequireComponent(typeof(Collider))]
    public class EnvironmentZone : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when an entity enters the zone.</summary>
        public event EventHandler<ZoneEventArgs> OnZoneEnter;

        /// <summary>Fired when an entity exits the zone.</summary>
        public event EventHandler<ZoneEventArgs> OnZoneExit;

        /// <summary>Fired when the player enters the zone.</summary>
        public event EventHandler<ZoneEventArgs> OnPlayerEnter;

        /// <summary>Fired when the player exits the zone.</summary>
        public event EventHandler<ZoneEventArgs> OnPlayerExit;

        #endregion

        #region Configuration

        [Header("Zone Identity")]
        [SerializeField]
        [Tooltip("Unique identifier for this zone")]
        private string zoneId;

        [SerializeField]
        [Tooltip("Display name for this zone")]
        private string zoneName;

        [SerializeField]
        [Tooltip("Type of zone")]
        private EnvironmentZoneType zoneType = EnvironmentZoneType.SafeZone;

        [SerializeField]
        [Tooltip("Priority when zones overlap (higher = takes precedence)")]
        private int priority = 0;

        [Header("Detection")]
        [SerializeField]
        [Tooltip("Layers to detect for triggers")]
        private LayerMask detectionLayers = ~0;

        [SerializeField]
        [Tooltip("Tag required for trigger (empty = all)")]
        private string requiredTag = "Player";

        [SerializeField]
        [Tooltip("Only trigger once then disable")]
        private bool triggerOnce = false;

        [Header("Zone Settings")]
        [SerializeField]
        [Tooltip("Zone-specific settings")]
        private ZoneSettings settings = new ZoneSettings();

        [Header("Connected Data")]
        [SerializeField]
        [Tooltip("Location data for town zones")]
        private LocationData locationData;

        [SerializeField]
        [Tooltip("Quest ID for quest trigger zones")]
        private string questId;

        [SerializeField]
        [Tooltip("Connected zones (for linked behaviors)")]
        private List<EnvironmentZone> connectedZones = new List<EnvironmentZone>();

        [Header("Visual Feedback")]
        [SerializeField]
        [Tooltip("Show zone bounds in editor")]
        private bool showGizmos = true;

        [SerializeField]
        [Tooltip("Zone gizmo color")]
        private Color gizmoColor = new Color(0f, 1f, 0f, 0.3f);

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region State

        private Collider _collider;
        private HashSet<GameObject> _entitiesInZone;
        private bool _playerInZone = false;
        private bool _hasTriggered = false;
        private AudioSource _ambientSource;
        private float _originalFogDensity;
        private Color _originalFogColor;
        private bool _wasAmbientPlaying = false;

        #endregion

        #region Properties

        /// <summary>Unique zone identifier.</summary>
        public string ZoneId => zoneId;

        /// <summary>Zone display name.</summary>
        public string ZoneName => zoneName;

        /// <summary>Zone type.</summary>
        public EnvironmentZoneType ZoneType => zoneType;

        /// <summary>Zone priority.</summary>
        public int Priority => priority;

        /// <summary>Whether player is currently in zone.</summary>
        public bool PlayerInZone => _playerInZone;

        /// <summary>Zone settings.</summary>
        public ZoneSettings Settings => settings;

        /// <summary>Number of entities in zone.</summary>
        public int EntityCount => _entitiesInZone?.Count ?? 0;

        /// <summary>Location data for town zones.</summary>
        public LocationData Location => locationData;

        /// <summary>Quest ID for quest trigger zones.</summary>
        public string QuestId => questId;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _entitiesInZone = new HashSet<GameObject>();
            _collider = GetComponent<Collider>();

            // Ensure collider is trigger
            if (_collider != null)
            {
                _collider.isTrigger = true;
            }

            // Generate ID if not set
            if (string.IsNullOrEmpty(zoneId))
            {
                zoneId = $"zone_{gameObject.name}_{GetInstanceID()}";
            }

            // Create ambient audio source
            if (settings.ambientSound != null)
            {
                CreateAmbientSource();
            }
        }

        private void Start()
        {
            // Register with zone manager
            EnvironmentZoneManager.Instance?.RegisterZone(this);

            // Store original fog settings
            _originalFogDensity = RenderSettings.fogDensity;
            _originalFogColor = RenderSettings.fogColor;
        }

        private void OnDestroy()
        {
            // Unregister from zone manager
            EnvironmentZoneManager.Instance?.UnregisterZone(this);

            // Clean up audio
            if (_ambientSource != null)
            {
                Destroy(_ambientSource.gameObject);
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (!IsValidEntity(other.gameObject)) return;
            if (triggerOnce && _hasTriggered) return;

            HandleEntityEnter(other.gameObject);
        }

        private void OnTriggerExit(Collider other)
        {
            if (!_entitiesInZone.Contains(other.gameObject)) return;

            HandleEntityExit(other.gameObject);
        }

        private void OnDrawGizmos()
        {
            if (!showGizmos) return;

            var collider = GetComponent<Collider>();
            if (collider == null) return;

            Gizmos.color = gizmoColor;

            if (collider is BoxCollider box)
            {
                Gizmos.matrix = transform.localToWorldMatrix;
                Gizmos.DrawCube(box.center, box.size);
                Gizmos.color = new Color(gizmoColor.r, gizmoColor.g, gizmoColor.b, 1f);
                Gizmos.DrawWireCube(box.center, box.size);
            }
            else if (collider is SphereCollider sphere)
            {
                Gizmos.DrawSphere(transform.position + sphere.center, sphere.radius);
                Gizmos.color = new Color(gizmoColor.r, gizmoColor.g, gizmoColor.b, 1f);
                Gizmos.DrawWireSphere(transform.position + sphere.center, sphere.radius);
            }
            else if (collider is CapsuleCollider capsule)
            {
                // Simplified capsule visualization
                Gizmos.DrawSphere(transform.position + capsule.center, capsule.radius);
            }
        }

        private void OnDrawGizmosSelected()
        {
            // Draw zone name
            #if UNITY_EDITOR
            UnityEditor.Handles.Label(
                transform.position + Vector3.up * 2f,
                $"{zoneName ?? zoneId}\n{zoneType}"
            );
            #endif

            // Draw connections
            Gizmos.color = Color.yellow;
            foreach (var connected in connectedZones)
            {
                if (connected != null)
                {
                    Gizmos.DrawLine(transform.position, connected.transform.position);
                }
            }
        }

        #endregion

        #region Entity Detection

        private bool IsValidEntity(GameObject entity)
        {
            // Check layer
            if ((detectionLayers.value & (1 << entity.layer)) == 0)
            {
                return false;
            }

            // Check tag if required
            if (!string.IsNullOrEmpty(requiredTag) && !entity.CompareTag(requiredTag))
            {
                return false;
            }

            return true;
        }

        private void HandleEntityEnter(GameObject entity)
        {
            _entitiesInZone.Add(entity);

            bool isPlayer = entity.CompareTag("Player");
            if (isPlayer)
            {
                _playerInZone = true;
                HandlePlayerEnter(entity);
            }

            // Fire events
            var args = new ZoneEventArgs(this, entity, true);
            OnZoneEnter?.Invoke(this, args);

            if (isPlayer)
            {
                OnPlayerEnter?.Invoke(this, args);
            }

            // Publish to event bus
            EventBus.Instance?.Publish("zone_entered", zoneId);

            Log($"Entity entered zone: {entity.name}");

            if (triggerOnce)
            {
                _hasTriggered = true;
            }
        }

        private void HandleEntityExit(GameObject entity)
        {
            _entitiesInZone.Remove(entity);

            bool isPlayer = entity.CompareTag("Player");
            if (isPlayer)
            {
                _playerInZone = false;
                HandlePlayerExit(entity);
            }

            // Fire events
            var args = new ZoneEventArgs(this, entity, false);
            OnZoneExit?.Invoke(this, args);

            if (isPlayer)
            {
                OnPlayerExit?.Invoke(this, args);
            }

            // Publish to event bus
            EventBus.Instance?.Publish("zone_exited", zoneId);

            Log($"Entity exited zone: {entity.name}");
        }

        #endregion

        #region Player-Specific Handling

        private void HandlePlayerEnter(GameObject player)
        {
            // Zone type specific actions
            switch (zoneType)
            {
                case EnvironmentZoneType.Town:
                    HandleTownEnter();
                    break;

                case EnvironmentZoneType.SafeZone:
                    HandleSafeZoneEnter();
                    break;

                case EnvironmentZoneType.CombatZone:
                    HandleCombatZoneEnter();
                    break;

                case EnvironmentZoneType.DangerZone:
                    HandleDangerZoneEnter();
                    break;

                case EnvironmentZoneType.Building:
                    HandleBuildingEnter();
                    break;

                case EnvironmentZoneType.QuestTrigger:
                    HandleQuestTrigger();
                    break;

                case EnvironmentZoneType.FastTravel:
                    HandleFastTravelEnter();
                    break;

                case EnvironmentZoneType.Tutorial:
                    HandleTutorialTrigger();
                    break;
            }

            // Apply zone settings
            ApplyZoneSettings();
        }

        private void HandlePlayerExit(GameObject player)
        {
            // Zone type specific cleanup
            switch (zoneType)
            {
                case EnvironmentZoneType.Town:
                    HandleTownExit();
                    break;

                case EnvironmentZoneType.SafeZone:
                    HandleSafeZoneExit();
                    break;

                case EnvironmentZoneType.CombatZone:
                    HandleCombatZoneExit();
                    break;

                case EnvironmentZoneType.DangerZone:
                    HandleDangerZoneExit();
                    break;

                case EnvironmentZoneType.Building:
                    HandleBuildingExit();
                    break;
            }

            // Revert zone settings
            RevertZoneSettings();
        }

        #endregion

        #region Zone Type Handlers

        private void HandleTownEnter()
        {
            if (locationData != null)
            {
                GameManager.Instance?.EnterTown(locationData.id);
                Log($"Entered town: {locationData.displayName}");
            }

            // Show town name notification
            EventBus.Instance?.Publish(GameEvents.TownEntered, locationData?.id ?? zoneName);
        }

        private void HandleTownExit()
        {
            GameManager.Instance?.ExitTown();
            EventBus.Instance?.Publish(GameEvents.TownExited, "");
            Log("Exited town");
        }

        private void HandleSafeZoneEnter()
        {
            // Disable encounters
            EventBus.Instance?.Publish("safe_zone_entered", zoneId);
            Log("Entered safe zone");
        }

        private void HandleSafeZoneExit()
        {
            EventBus.Instance?.Publish("safe_zone_exited", zoneId);
            Log("Exited safe zone");
        }

        private void HandleCombatZoneEnter()
        {
            // Increase encounter rate
            EventBus.Instance?.Publish("combat_zone_entered", zoneId);
            Log("Entered combat zone");
        }

        private void HandleCombatZoneExit()
        {
            EventBus.Instance?.Publish("combat_zone_exited", zoneId);
            Log("Exited combat zone");
        }

        private void HandleDangerZoneEnter()
        {
            // Enable environmental hazards
            EventBus.Instance?.Publish("danger_zone_entered", zoneId);
            Log("Entered danger zone");
        }

        private void HandleDangerZoneExit()
        {
            EventBus.Instance?.Publish("danger_zone_exited", zoneId);
            Log("Exited danger zone");
        }

        private void HandleBuildingEnter()
        {
            EventBus.Instance?.Publish(GameEvents.BuildingEntered, zoneId);
            Log($"Entered building: {zoneName}");
        }

        private void HandleBuildingExit()
        {
            EventBus.Instance?.Publish(GameEvents.BuildingExited, zoneId);
            Log($"Exited building: {zoneName}");
        }

        private void HandleQuestTrigger()
        {
            if (!string.IsNullOrEmpty(questId))
            {
                EventBus.Instance?.Publish("quest_trigger", questId);
                Log($"Quest trigger activated: {questId}");
            }
        }

        private void HandleFastTravelEnter()
        {
            // Enable fast travel UI
            EventBus.Instance?.Publish("fast_travel_available", zoneId);
            Log("Fast travel point reached");
        }

        private void HandleTutorialTrigger()
        {
            EventBus.Instance?.Publish("tutorial_trigger", settings.customTag);
            Log($"Tutorial triggered: {settings.customTag}");
        }

        #endregion

        #region Zone Settings Application

        private void ApplyZoneSettings()
        {
            // Ambient sound
            if (settings.ambientSound != null && _ambientSource != null)
            {
                _ambientSource.clip = settings.ambientSound;
                _ambientSource.volume = settings.ambientVolume;
                _ambientSource.loop = true;
                _ambientSource.Play();
                _wasAmbientPlaying = true;
            }

            // Music override
            if (settings.musicOverride != null)
            {
                EventBus.Instance?.Publish("music_zone_entered", zoneName);
                // MusicManager would handle the actual music change
            }

            // Weather override
            if (settings.overrideWeather)
            {
                WeatherController.Instance?.ForceWeatherEffect(
                    settings.forcedWeather,
                    Systems.WeatherSeverity.Moderate
                );
            }

            // Fog override
            if (settings.fogDensityOverride >= 0f)
            {
                _originalFogDensity = RenderSettings.fogDensity;
                RenderSettings.fogDensity = settings.fogDensityOverride;
            }
        }

        private void RevertZoneSettings()
        {
            // Stop ambient sound
            if (_wasAmbientPlaying && _ambientSource != null)
            {
                _ambientSource.Stop();
                _wasAmbientPlaying = false;
            }

            // Music revert
            if (settings.musicOverride != null)
            {
                EventBus.Instance?.Publish("music_zone_exited", zoneName);
            }

            // Weather revert
            if (settings.overrideWeather)
            {
                // WeatherController will transition back to actual weather
                if (Systems.WeatherSystem.Instance != null)
                {
                    WeatherController.Instance?.TransitionToWeather(
                        Systems.WeatherSystem.Instance.CurrentWeather,
                        Systems.WeatherSystem.Instance.CurrentSeverity
                    );
                }
            }

            // Fog revert
            if (settings.fogDensityOverride >= 0f)
            {
                RenderSettings.fogDensity = _originalFogDensity;
            }
        }

        private void CreateAmbientSource()
        {
            var audioGO = new GameObject($"AmbientSource_{zoneId}");
            audioGO.transform.SetParent(transform);
            _ambientSource = audioGO.AddComponent<AudioSource>();
            _ambientSource.spatialBlend = 0f; // 2D sound
            _ambientSource.playOnAwake = false;
        }

        #endregion

        #region Public API

        /// <summary>
        /// Check if a specific entity is in this zone.
        /// </summary>
        public bool ContainsEntity(GameObject entity)
        {
            return _entitiesInZone.Contains(entity);
        }

        /// <summary>
        /// Get all entities currently in the zone.
        /// </summary>
        public IEnumerable<GameObject> GetEntitiesInZone()
        {
            return _entitiesInZone;
        }

        /// <summary>
        /// Check if a world position is inside this zone.
        /// </summary>
        public bool ContainsPoint(Vector3 worldPosition)
        {
            if (_collider == null) return false;
            return _collider.bounds.Contains(worldPosition);
        }

        /// <summary>
        /// Get the closest point on the zone boundary.
        /// </summary>
        public Vector3 GetClosestPoint(Vector3 worldPosition)
        {
            if (_collider == null) return worldPosition;
            return _collider.ClosestPoint(worldPosition);
        }

        /// <summary>
        /// Force trigger the zone effects for an entity.
        /// </summary>
        public void ForceTrigger(GameObject entity)
        {
            if (IsValidEntity(entity))
            {
                HandleEntityEnter(entity);
            }
        }

        /// <summary>
        /// Reset the trigger state (for one-time triggers).
        /// </summary>
        public void ResetTrigger()
        {
            _hasTriggered = false;
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[EnvironmentZone:{zoneId}] {message}");
            }
        }

        #endregion
    }

    /// <summary>
    /// Manager for tracking all environment zones in the scene.
    /// </summary>
    public class EnvironmentZoneManager : MonoBehaviour
    {
        #region Singleton

        private static EnvironmentZoneManager _instance;

        public static EnvironmentZoneManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<EnvironmentZoneManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[EnvironmentZoneManager]");
                        _instance = go.AddComponent<EnvironmentZoneManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when any zone is entered.</summary>
        public event EventHandler<ZoneEventArgs> OnAnyZoneEntered;

        /// <summary>Fired when any zone is exited.</summary>
        public event EventHandler<ZoneEventArgs> OnAnyZoneExited;

        #endregion

        private Dictionary<string, EnvironmentZone> _zones;
        private List<EnvironmentZone> _playerZones;

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            _zones = new Dictionary<string, EnvironmentZone>();
            _playerZones = new List<EnvironmentZone>();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        /// <summary>
        /// Register a zone with the manager.
        /// </summary>
        public void RegisterZone(EnvironmentZone zone)
        {
            if (zone == null) return;

            _zones[zone.ZoneId] = zone;

            // Subscribe to zone events
            zone.OnPlayerEnter += HandleZoneEntered;
            zone.OnPlayerExit += HandleZoneExited;
        }

        /// <summary>
        /// Unregister a zone from the manager.
        /// </summary>
        public void UnregisterZone(EnvironmentZone zone)
        {
            if (zone == null) return;

            _zones.Remove(zone.ZoneId);
            _playerZones.Remove(zone);

            zone.OnPlayerEnter -= HandleZoneEntered;
            zone.OnPlayerExit -= HandleZoneExited;
        }

        private void HandleZoneEntered(object sender, ZoneEventArgs args)
        {
            _playerZones.Add(args.Zone);
            _playerZones.Sort((a, b) => b.Priority.CompareTo(a.Priority));

            OnAnyZoneEntered?.Invoke(this, args);
        }

        private void HandleZoneExited(object sender, ZoneEventArgs args)
        {
            _playerZones.Remove(args.Zone);

            OnAnyZoneExited?.Invoke(this, args);
        }

        /// <summary>
        /// Get zone by ID.
        /// </summary>
        public EnvironmentZone GetZone(string zoneId)
        {
            _zones.TryGetValue(zoneId, out var zone);
            return zone;
        }

        /// <summary>
        /// Get all zones of a specific type.
        /// </summary>
        public IEnumerable<EnvironmentZone> GetZonesByType(EnvironmentZoneType type)
        {
            foreach (var zone in _zones.Values)
            {
                if (zone.ZoneType == type)
                {
                    yield return zone;
                }
            }
        }

        /// <summary>
        /// Get the highest priority zone the player is currently in.
        /// </summary>
        public EnvironmentZone GetActivePlayerZone()
        {
            return _playerZones.Count > 0 ? _playerZones[0] : null;
        }

        /// <summary>
        /// Get all zones the player is currently in.
        /// </summary>
        public IReadOnlyList<EnvironmentZone> GetPlayerZones()
        {
            return _playerZones.AsReadOnly();
        }

        /// <summary>
        /// Check if player is in any safe zone.
        /// </summary>
        public bool IsPlayerInSafeZone()
        {
            foreach (var zone in _playerZones)
            {
                if (zone.Settings.isSafeZone)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Get the current encounter rate modifier based on active zones.
        /// </summary>
        public float GetEncounterRateModifier()
        {
            var activeZone = GetActivePlayerZone();
            if (activeZone != null)
            {
                if (activeZone.Settings.disableEncounters)
                {
                    return 0f;
                }
                return activeZone.Settings.encounterRateModifier;
            }
            return 1f;
        }

        /// <summary>
        /// Get the current movement speed modifier based on active zones.
        /// </summary>
        public float GetMovementSpeedModifier()
        {
            var activeZone = GetActivePlayerZone();
            return activeZone?.Settings.movementSpeedModifier ?? 1f;
        }
    }
}
