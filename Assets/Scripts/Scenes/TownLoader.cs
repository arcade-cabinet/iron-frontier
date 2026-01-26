using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Scenes
{
    /// <summary>
    /// Context data passed when loading a town scene.
    /// </summary>
    [Serializable]
    public class TownLoadContext
    {
        /// <summary>Town location data.</summary>
        public LocationData Location { get; set; }

        /// <summary>Town ID if location data is not available.</summary>
        public string TownId { get; set; }

        /// <summary>Entry point ID within the town.</summary>
        public string EntryPointId { get; set; }

        /// <summary>Player spawn position override.</summary>
        public Vector3? SpawnPosition { get; set; }

        /// <summary>Player spawn rotation override.</summary>
        public Quaternion? SpawnRotation { get; set; }

        /// <summary>Whether this is a return visit (affects some behaviors).</summary>
        public bool IsReturnVisit { get; set; }

        /// <summary>Time of day override for the town.</summary>
        public float? TimeOfDayOverride { get; set; }
    }

    /// <summary>
    /// Event args for town load events.
    /// </summary>
    public class TownLoadedEventArgs : EventArgs
    {
        public string TownId { get; }
        public LocationData Location { get; }
        public int NPCCount { get; }
        public int ShopCount { get; }

        public TownLoadedEventArgs(string townId, LocationData location, int npcCount, int shopCount)
        {
            TownId = townId;
            Location = location;
            NPCCount = npcCount;
            ShopCount = shopCount;
        }
    }

    /// <summary>
    /// Manages loading and setup of town scenes.
    /// Handles NPC spawning, shop configuration, lighting, and town-specific systems.
    /// </summary>
    public class TownLoader : MonoBehaviour
    {
        #region Singleton

        private static TownLoader _instance;

        /// <summary>
        /// Global singleton instance of TownLoader.
        /// </summary>
        public static TownLoader Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<TownLoader>();
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when town loading begins.</summary>
        public event EventHandler<string> OnTownLoadStarted;

        /// <summary>Fired when town loading completes.</summary>
        public event EventHandler<TownLoadedEventArgs> OnTownLoadCompleted;

        /// <summary>Fired when all NPCs have been spawned.</summary>
        public event EventHandler<int> OnNPCsSpawned;

        /// <summary>Fired when all shops have been configured.</summary>
        public event EventHandler<int> OnShopsConfigured;

        /// <summary>Fired when town is being unloaded.</summary>
        public event EventHandler<string> OnTownUnloading;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Database of all location data")]
        private LocationData[] locationDatabase;

        [SerializeField]
        [Tooltip("Default NPC prefab for spawning")]
        private GameObject defaultNPCPrefab;

        [SerializeField]
        [Tooltip("Container for spawned NPCs")]
        private Transform npcContainer;

        [Header("Lighting")]
        [SerializeField]
        [Tooltip("Town directional light")]
        private Light directionalLight;

        [SerializeField]
        [Tooltip("Day ambient color")]
        private Color dayAmbientColor = new Color(0.8f, 0.8f, 0.7f);

        [SerializeField]
        [Tooltip("Night ambient color")]
        private Color nightAmbientColor = new Color(0.1f, 0.1f, 0.2f);

        [SerializeField]
        [Tooltip("Day directional light color")]
        private Color dayLightColor = new Color(1f, 0.95f, 0.8f);

        [SerializeField]
        [Tooltip("Night directional light color")]
        private Color nightLightColor = new Color(0.3f, 0.3f, 0.5f);

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private LocationData _currentLocation;
        private string _currentTownId;
        private List<GameObject> _spawnedNPCs = new List<GameObject>();
        private List<string> _configuredShops = new List<string>();
        private bool _isLoading = false;

        #endregion

        #region Properties

        /// <summary>Currently loaded location data.</summary>
        public LocationData CurrentLocation => _currentLocation;

        /// <summary>Currently loaded town ID.</summary>
        public string CurrentTownId => _currentTownId;

        /// <summary>Whether town is currently loading.</summary>
        public bool IsLoading => _isLoading;

        /// <summary>Number of spawned NPCs.</summary>
        public int SpawnedNPCCount => _spawnedNPCs.Count;

        /// <summary>Number of configured shops.</summary>
        public int ConfiguredShopCount => _configuredShops.Count;

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

            // Create NPC container if not assigned
            if (npcContainer == null)
            {
                var containerGO = new GameObject("NPCs");
                containerGO.transform.SetParent(transform);
                npcContainer = containerGO.transform;
            }
        }

        private void Start()
        {
            // Check for context from SceneController
            var context = SceneController.Instance?.GetContext<TownLoadContext>();
            if (context != null)
            {
                StartCoroutine(LoadTownFromContext(context));
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

        #region Public API

        /// <summary>
        /// Load a town by its ID.
        /// </summary>
        /// <param name="townId">Town identifier.</param>
        /// <param name="entryPointId">Optional entry point within the town.</param>
        public void LoadTown(string townId, string entryPointId = null)
        {
            var context = new TownLoadContext
            {
                TownId = townId,
                EntryPointId = entryPointId
            };

            StartCoroutine(LoadTownFromContext(context));
        }

        /// <summary>
        /// Load a town from location data.
        /// </summary>
        /// <param name="location">Location data for the town.</param>
        /// <param name="entryPointId">Optional entry point.</param>
        public void LoadTown(LocationData location, string entryPointId = null)
        {
            var context = new TownLoadContext
            {
                Location = location,
                TownId = location.id,
                EntryPointId = entryPointId
            };

            StartCoroutine(LoadTownFromContext(context));
        }

        /// <summary>
        /// Unload the current town and clean up.
        /// </summary>
        public void UnloadTown()
        {
            if (_currentTownId == null)
            {
                Log("No town currently loaded");
                return;
            }

            Log($"Unloading town: {_currentTownId}");
            OnTownUnloading?.Invoke(this, _currentTownId);

            // Despawn all NPCs
            DespawnAllNPCs();

            // Clear shops
            _configuredShops.Clear();

            // Clear references
            _currentLocation = null;
            _currentTownId = null;

            EventBus.Instance?.Publish(GameEvents.TownExited, string.Empty);
        }

        /// <summary>
        /// Get a spawned NPC by ID.
        /// </summary>
        /// <param name="npcId">NPC identifier.</param>
        /// <returns>NPC GameObject or null if not found.</returns>
        public GameObject GetSpawnedNPC(string npcId)
        {
            foreach (var npcGO in _spawnedNPCs)
            {
                if (npcGO != null && npcGO.name == npcId)
                {
                    return npcGO;
                }
            }
            return null;
        }

        /// <summary>
        /// Refresh all NPCs (respawn at original positions).
        /// </summary>
        public void RefreshNPCs()
        {
            DespawnAllNPCs();
            if (_currentLocation != null)
            {
                SpawnNPCs(_currentLocation);
            }
        }

        /// <summary>
        /// Update lighting based on time of day.
        /// </summary>
        /// <param name="normalizedTime">Time of day (0-1, 0 = midnight, 0.5 = noon).</param>
        public void UpdateLighting(float normalizedTime)
        {
            if (directionalLight == null) return;

            // Calculate sun angle
            float sunAngle = (normalizedTime - 0.25f) * 360f;
            directionalLight.transform.rotation = Quaternion.Euler(sunAngle, -30f, 0f);

            // Interpolate colors based on time
            float dayFactor = CalculateDayFactor(normalizedTime);

            directionalLight.color = Color.Lerp(nightLightColor, dayLightColor, dayFactor);
            directionalLight.intensity = Mathf.Lerp(0.2f, 1.2f, dayFactor);

            RenderSettings.ambientLight = Color.Lerp(nightAmbientColor, dayAmbientColor, dayFactor);
        }

        #endregion

        #region Loading Coroutine

        private IEnumerator LoadTownFromContext(TownLoadContext context)
        {
            if (_isLoading)
            {
                LogWarning("Town loading already in progress");
                yield break;
            }

            _isLoading = true;

            // Get location data
            LocationData location = context.Location;
            string townId = context.TownId;

            if (location == null && !string.IsNullOrEmpty(townId))
            {
                location = FindLocationById(townId);
            }

            if (location == null)
            {
                LogWarning($"Could not find location data for town: {townId}");
                _isLoading = false;
                yield break;
            }

            Log($"Loading town: {location.displayName} ({location.id})");
            OnTownLoadStarted?.Invoke(this, location.id);

            // Clean up previous town if any
            if (_currentTownId != null)
            {
                UnloadTown();
            }

            _currentLocation = location;
            _currentTownId = location.id;

            // Configure lighting
            yield return StartCoroutine(ConfigureLighting(location, context.TimeOfDayOverride));

            // Spawn NPCs
            yield return StartCoroutine(SpawnNPCsAsync(location));

            // Configure shops
            yield return StartCoroutine(ConfigureShopsAsync(location));

            // Set up player spawn
            SetupPlayerSpawn(location, context);

            _isLoading = false;

            Log($"Town loaded: {location.displayName} - {_spawnedNPCs.Count} NPCs, {_configuredShops.Count} shops");

            var eventArgs = new TownLoadedEventArgs(
                location.id,
                location,
                _spawnedNPCs.Count,
                _configuredShops.Count
            );

            OnTownLoadCompleted?.Invoke(this, eventArgs);
            EventBus.Instance?.Publish(GameEvents.TownEntered, location.id);
            GameManager.Instance?.EnterTown(location.id);
        }

        #endregion

        #region NPC Management

        private void SpawnNPCs(LocationData location)
        {
            StartCoroutine(SpawnNPCsAsync(location));
        }

        private IEnumerator SpawnNPCsAsync(LocationData location)
        {
            int spawnedCount = 0;

            foreach (var slot in location.slots)
            {
                if (slot.npcIds == null || slot.npcIds.Count == 0) continue;

                foreach (var npcId in slot.npcIds)
                {
                    var npcGO = SpawnNPC(npcId, slot);
                    if (npcGO != null)
                    {
                        spawnedCount++;
                        _spawnedNPCs.Add(npcGO);
                    }

                    // Yield occasionally to avoid frame hitches
                    if (spawnedCount % 5 == 0)
                    {
                        yield return null;
                    }
                }
            }

            Log($"Spawned {spawnedCount} NPCs");
            OnNPCsSpawned?.Invoke(this, spawnedCount);
        }

        private GameObject SpawnNPC(string npcId, LocationSlot slot)
        {
            if (defaultNPCPrefab == null)
            {
                LogWarning("No default NPC prefab assigned");
                return null;
            }

            // Calculate world position from slot anchor
            Vector3 worldPos = HexToWorldPosition(slot.anchor);

            // Instantiate NPC
            var npcGO = Instantiate(defaultNPCPrefab, worldPos, Quaternion.identity, npcContainer);
            npcGO.name = npcId;

            Log($"Spawned NPC: {npcId} at {worldPos}");

            return npcGO;
        }

        private void DespawnAllNPCs()
        {
            foreach (var npcGO in _spawnedNPCs)
            {
                if (npcGO != null)
                {
                    Destroy(npcGO);
                }
            }

            _spawnedNPCs.Clear();
            Log("All NPCs despawned");
        }

        #endregion

        #region Shop Configuration

        private IEnumerator ConfigureShopsAsync(LocationData location)
        {
            int configuredCount = 0;

            foreach (var slot in location.slots)
            {
                if (string.IsNullOrEmpty(slot.shopId)) continue;

                ConfigureShop(slot);
                configuredCount++;
                _configuredShops.Add(slot.shopId);

                // Yield occasionally
                if (configuredCount % 3 == 0)
                {
                    yield return null;
                }
            }

            Log($"Configured {configuredCount} shops");
            OnShopsConfigured?.Invoke(this, configuredCount);
        }

        private void ConfigureShop(LocationSlot slot)
        {
            Log($"Configuring shop: {slot.shopId} at slot {slot.id}");

            // Shop configuration would involve:
            // 1. Loading shop inventory from data
            // 2. Setting up shop UI triggers
            // 3. Configuring price modifiers based on location atmosphere

            // This is a placeholder - actual implementation would depend on the shop system
        }

        #endregion

        #region Lighting Configuration

        private IEnumerator ConfigureLighting(LocationData location, float? timeOverride)
        {
            // Get current time or use override
            float normalizedTime = timeOverride ?? GetCurrentNormalizedTime();

            // Apply lighting based on time
            UpdateLighting(normalizedTime);

            // Apply location-specific lighting adjustments
            ApplyLocationLighting(location);

            yield return null;
        }

        private void ApplyLocationLighting(LocationData location)
        {
            // Adjust lighting based on location type
            switch (location.type)
            {
                case LocationType.Cave:
                    RenderSettings.ambientLight = new Color(0.1f, 0.1f, 0.15f);
                    if (directionalLight != null)
                    {
                        directionalLight.intensity = 0.1f;
                    }
                    break;

                case LocationType.Mine:
                    RenderSettings.ambientLight = new Color(0.15f, 0.12f, 0.1f);
                    if (directionalLight != null)
                    {
                        directionalLight.intensity = 0.2f;
                    }
                    break;

                default:
                    // Keep time-based lighting
                    break;
            }
        }

        private float CalculateDayFactor(float normalizedTime)
        {
            // Dawn at 0.25 (6 AM), Dusk at 0.75 (6 PM)
            // Full day from 0.25 to 0.75
            // Full night from 0.75 to 0.25 (wrapping)

            if (normalizedTime >= 0.25f && normalizedTime <= 0.75f)
            {
                // Day time - peak at noon (0.5)
                float dayProgress = (normalizedTime - 0.25f) / 0.5f;
                return Mathf.Sin(dayProgress * Mathf.PI);
            }
            else
            {
                // Night time
                return 0f;
            }
        }

        private float GetCurrentNormalizedTime()
        {
            // Get time from TimeSystem if available
            // Default to noon (0.5) if not available
            return 0.5f;
        }

        #endregion

        #region Player Spawn

        private void SetupPlayerSpawn(LocationData location, TownLoadContext context)
        {
            Vector3 spawnPos;
            Quaternion spawnRot;

            if (context.SpawnPosition.HasValue)
            {
                spawnPos = context.SpawnPosition.Value;
                spawnRot = context.SpawnRotation ?? Quaternion.identity;
            }
            else if (!string.IsNullOrEmpty(context.EntryPointId))
            {
                // Find specific entry point
                var entryPoint = FindEntryPoint(location, context.EntryPointId);
                if (entryPoint.HasValue)
                {
                    spawnPos = HexToWorldPosition(entryPoint.Value.coord);
                    spawnRot = DirectionToRotation(entryPoint.Value.direction);
                }
                else
                {
                    spawnPos = HexToWorldPosition(location.playerSpawn.coord);
                    spawnRot = Quaternion.Euler(0, location.playerSpawn.facing * 60f, 0);
                }
            }
            else
            {
                // Use default player spawn
                spawnPos = HexToWorldPosition(location.playerSpawn.coord);
                spawnRot = Quaternion.Euler(0, location.playerSpawn.facing * 60f, 0);
            }

            // Notify systems of spawn position
            EventBus.Instance?.Publish("player_spawn_set", $"{spawnPos.x},{spawnPos.y},{spawnPos.z}");

            Log($"Player spawn set to: {spawnPos}");
        }

        private LocationEntryPoint? FindEntryPoint(LocationData location, string entryPointId)
        {
            foreach (var entry in location.entryPoints)
            {
                if (entry.id == entryPointId)
                {
                    return entry;
                }
            }
            return null;
        }

        #endregion

        #region Utility Methods

        private LocationData FindLocationById(string locationId)
        {
            if (locationDatabase == null) return null;

            foreach (var location in locationDatabase)
            {
                if (location != null && location.id == locationId)
                {
                    return location;
                }
            }

            return null;
        }

        private Vector3 HexToWorldPosition(HexCoord coord)
        {
            // Convert hex coordinates to world position
            // Using pointy-top hexagon layout
            float hexWidth = 1.732f; // sqrt(3)
            float hexHeight = 2f;

            float x = hexWidth * (coord.q + coord.r * 0.5f);
            float z = hexHeight * coord.r * 0.75f;

            return new Vector3(x, 0f, z);
        }

        private Quaternion DirectionToRotation(EntryDirection direction)
        {
            return direction switch
            {
                EntryDirection.North => Quaternion.Euler(0, 0, 0),
                EntryDirection.South => Quaternion.Euler(0, 180, 0),
                EntryDirection.East => Quaternion.Euler(0, 90, 0),
                EntryDirection.West => Quaternion.Euler(0, -90, 0),
                EntryDirection.Up => Quaternion.Euler(-90, 0, 0),
                EntryDirection.Down => Quaternion.Euler(90, 0, 0),
                _ => Quaternion.identity
            };
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[TownLoader] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[TownLoader] {message}");
        }

        #endregion
    }
}
