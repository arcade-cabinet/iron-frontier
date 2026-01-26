using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Systems;

namespace IronFrontier.Core
{
    /// <summary>
    /// Metadata for a save slot.
    /// </summary>
    [Serializable]
    public class SaveSlotMeta
    {
        /// <summary>Unique slot identifier.</summary>
        public string slotId;

        /// <summary>Unix timestamp when saved.</summary>
        public long timestamp;

        /// <summary>Total play time in seconds.</summary>
        public float playTime;

        /// <summary>Player character name.</summary>
        public string playerName;

        /// <summary>Current in-game day number.</summary>
        public int currentDay;

        /// <summary>Current location display name.</summary>
        public string location;

        /// <summary>Save format version for migration.</summary>
        public int version;

        /// <summary>Whether this is a quick save slot.</summary>
        public bool isQuickSave;

        /// <summary>Whether this is an auto save slot.</summary>
        public bool isAutoSave;

        /// <summary>
        /// Get the save time as a DateTime.
        /// </summary>
        public DateTime SaveTime => DateTimeOffset.FromUnixTimeMilliseconds(timestamp).DateTime;
    }

    /// <summary>
    /// Complete save file data structure.
    /// </summary>
    [Serializable]
    public class SaveFileData
    {
        /// <summary>Save metadata.</summary>
        public SaveSlotMeta meta;

        /// <summary>GameManager state.</summary>
        public GameManagerSaveData gameManager;

        /// <summary>TimeSystem state.</summary>
        public TimeSystemSaveData timeSystem;

        /// <summary>WeatherSystem state.</summary>
        public WeatherSystemSaveData weatherSystem;

        /// <summary>FatigueSystem state.</summary>
        public FatigueSystemSaveData fatigueSystem;

        /// <summary>ProvisionsSystem state.</summary>
        public ProvisionsSystemSaveData provisionsSystem;

        /// <summary>Custom data from other systems.</summary>
        public Dictionary<string, string> customData;
    }

    /// <summary>
    /// FatigueSystem save state.
    /// </summary>
    [Serializable]
    public class FatigueSystemSaveData
    {
        /// <summary>Current fatigue value (0-100).</summary>
        public float currentFatigue;

        /// <summary>Last time fatigue was updated.</summary>
        public float lastUpdateTime;

        /// <summary>Whether a stumble event is pending.</summary>
        public bool pendingStumble;
    }

    /// <summary>
    /// GameManager save state.
    /// </summary>
    [Serializable]
    public class GameManagerSaveData
    {
        public string playerName;
        public float totalPlayTime;
        public string currentPhase;
        public string currentTownId;
        public int playerLevel = 1;
    }

    /// <summary>
    /// TimeSystem save state.
    /// </summary>
    [Serializable]
    public class TimeSystemSaveData
    {
        public int hour;
        public int minute;
        public int day;
        public int totalMinutes;
    }

    /// <summary>
    /// WeatherSystem save state.
    /// </summary>
    [Serializable]
    public class WeatherSystemSaveData
    {
        public string currentWeather;
        public string severity;
        public float hoursUntilChange;
        public float hoursSinceCurrent;
        public float temperature;
        public string currentBiome;
        public string currentSeason;
    }

    /// <summary>
    /// Event args for save system events.
    /// </summary>
    public class SaveSystemEventArgs : EventArgs
    {
        public string SlotId { get; }
        public bool Success { get; }
        public SaveSlotMeta Meta { get; }

        public SaveSystemEventArgs(string slotId, bool success, SaveSlotMeta meta = null)
        {
            SlotId = slotId;
            Success = success;
            Meta = meta;
        }
    }

    /// <summary>
    /// Save/Load system using PlayerPrefs and JSON serialization.
    /// Supports multiple save slots, quick save, auto save, and save versioning.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript SaveSystem.ts.
    /// Uses PlayerPrefs for web/mobile compatibility with JSON serialization.
    /// </remarks>
    public class SaveSystem : MonoBehaviour
    {
        #region Singleton

        private static SaveSystem _instance;

        /// <summary>
        /// Global singleton instance of SaveSystem.
        /// </summary>
        public static SaveSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<SaveSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[SaveSystem]");
                        _instance = go.AddComponent<SaveSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Constants

        /// <summary>PlayerPrefs key prefix for save data.</summary>
        private const string SAVE_PREFIX = "iron-frontier-save-";

        /// <summary>PlayerPrefs key for save index.</summary>
        private const string SAVE_INDEX_KEY = "iron-frontier-save-index";

        /// <summary>Quick save slot identifier.</summary>
        public const string QUICK_SAVE_SLOT = "quicksave";

        /// <summary>Auto save slot identifier.</summary>
        public const string AUTO_SAVE_SLOT = "autosave";

        /// <summary>Current save format version.</summary>
        public const int SAVE_VERSION = 1;

        /// <summary>Maximum number of manual save slots.</summary>
        public const int MAX_MANUAL_SLOTS = 10;

        #endregion

        #region Events

        /// <summary>Fired when a game is saved.</summary>
        public event EventHandler<SaveSystemEventArgs> OnSaved;

        /// <summary>Fired when a game is loaded.</summary>
        public event EventHandler<SaveSystemEventArgs> OnLoaded;

        /// <summary>Fired when a save slot is deleted.</summary>
        public event EventHandler<SaveSystemEventArgs> OnDeleted;

        #endregion

        #region Configuration

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Enable debug logging")]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Registered save data providers
        private readonly Dictionary<string, Func<string>> _saveProviders =
            new Dictionary<string, Func<string>>();

        // Registered load data consumers
        private readonly Dictionary<string, Action<string>> _loadConsumers =
            new Dictionary<string, Action<string>>();

        // Cached save index
        private List<string> _saveIndex;

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

            LoadSaveIndex();
            Log("SaveSystem initialized");
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Registration

        /// <summary>
        /// Register a custom data provider for saving.
        /// </summary>
        /// <param name="key">Unique key for this data.</param>
        /// <param name="provider">Function that returns JSON data to save.</param>
        public void RegisterSaveProvider(string key, Func<string> provider)
        {
            _saveProviders[key] = provider;
            Log($"Registered save provider: {key}");
        }

        /// <summary>
        /// Register a custom data consumer for loading.
        /// </summary>
        /// <param name="key">Unique key for this data.</param>
        /// <param name="consumer">Action that receives JSON data to load.</param>
        public void RegisterLoadConsumer(string key, Action<string> consumer)
        {
            _loadConsumers[key] = consumer;
            Log($"Registered load consumer: {key}");
        }

        /// <summary>
        /// Unregister a save provider and load consumer.
        /// </summary>
        /// <param name="key">Key to unregister.</param>
        public void Unregister(string key)
        {
            _saveProviders.Remove(key);
            _loadConsumers.Remove(key);
            Log($"Unregistered: {key}");
        }

        #endregion

        #region Save Operations

        /// <summary>
        /// Save the game to a specific slot.
        /// </summary>
        /// <param name="slotId">Slot to save to.</param>
        /// <returns>True if successful.</returns>
        public bool SaveGame(string slotId)
        {
            Log($"Saving to slot: {slotId}");

            try
            {
                var saveData = CreateSaveData(slotId);
                var json = JsonUtility.ToJson(saveData, true);

                PlayerPrefs.SetString(SAVE_PREFIX + slotId, json);
                PlayerPrefs.Save();

                // Update save index
                UpdateSaveIndex(slotId);

                var meta = saveData.meta;
                OnSaved?.Invoke(this, new SaveSystemEventArgs(slotId, true, meta));
                EventBus.Instance?.Publish(GameEvents.GameSaved, slotId);

                Log($"Saved successfully to slot: {slotId}");
                return true;
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveSystem] Failed to save: {e}");
                OnSaved?.Invoke(this, new SaveSystemEventArgs(slotId, false));
                return false;
            }
        }

        /// <summary>
        /// Quick save to the quick save slot.
        /// </summary>
        /// <returns>True if successful.</returns>
        public bool QuickSave()
        {
            return SaveGame(QUICK_SAVE_SLOT);
        }

        /// <summary>
        /// Auto save to the auto save slot.
        /// </summary>
        /// <returns>True if successful.</returns>
        public bool AutoSave()
        {
            return SaveGame(AUTO_SAVE_SLOT);
        }

        private SaveFileData CreateSaveData(string slotId)
        {
            var gameState = GameManager.Instance?.GetGameState() ??
                           ("Unknown", 0f, GamePhase.Title, (string)null, 1);

            var timeState = TimeSystem.Instance?.GetSaveData() ??
                           new TimeSystemSaveData { hour = 10, minute = 0, day = 1, totalMinutes = 600 };

            var weatherState = WeatherSystem.Instance?.GetSaveData() ??
                              new WeatherSystemSaveData
                              {
                                  currentWeather = "Clear",
                                  severity = "Moderate",
                                  temperature = 70f
                              };

            var fatigueState = FatigueSystem.Instance?.GetSaveData() ??
                               new FatigueSystemSaveData
                               {
                                   currentFatigue = 0f,
                                   lastUpdateTime = 0f,
                                   pendingStumble = false
                               };

            var provisionsState = ProvisionsSystem.Instance?.GetSaveData() ??
                                  new ProvisionsSystemSaveData
                                  {
                                      food = 75,
                                      water = 75,
                                      hoursSinceFood = 0f,
                                      hoursSinceWater = 0f
                                  };

            var meta = new SaveSlotMeta
            {
                slotId = slotId,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                playTime = gameState.playTime,
                playerName = gameState.playerName,
                currentDay = timeState.day,
                location = gameState.townId ?? "Overworld",
                version = SAVE_VERSION,
                isQuickSave = slotId == QUICK_SAVE_SLOT,
                isAutoSave = slotId == AUTO_SAVE_SLOT
            };

            var gameMgrData = new GameManagerSaveData
            {
                playerName = gameState.playerName,
                totalPlayTime = gameState.playTime,
                currentPhase = gameState.phase.ToString(),
                currentTownId = gameState.townId,
                playerLevel = gameState.playerLevel
            };

            // Collect custom data
            var customData = new Dictionary<string, string>();
            foreach (var kvp in _saveProviders)
            {
                try
                {
                    customData[kvp.Key] = kvp.Value();
                }
                catch (Exception e)
                {
                    Debug.LogWarning($"[SaveSystem] Provider {kvp.Key} failed: {e.Message}");
                }
            }

            return new SaveFileData
            {
                meta = meta,
                gameManager = gameMgrData,
                timeSystem = timeState,
                weatherSystem = weatherState,
                fatigueSystem = fatigueState,
                provisionsSystem = provisionsState,
                customData = customData
            };
        }

        #endregion

        #region Load Operations

        /// <summary>
        /// Load a game from a specific slot.
        /// </summary>
        /// <param name="slotId">Slot to load from.</param>
        /// <returns>True if successful.</returns>
        public bool LoadGame(string slotId)
        {
            Log($"Loading from slot: {slotId}");

            try
            {
                var json = PlayerPrefs.GetString(SAVE_PREFIX + slotId, null);
                if (string.IsNullOrEmpty(json))
                {
                    Debug.LogWarning($"[SaveSystem] No save found in slot: {slotId}");
                    OnLoaded?.Invoke(this, new SaveSystemEventArgs(slotId, false));
                    return false;
                }

                var saveData = JsonUtility.FromJson<SaveFileData>(json);

                // Migrate if needed
                saveData = MigrateIfNeeded(saveData);

                // Apply to systems
                ApplySaveData(saveData);

                OnLoaded?.Invoke(this, new SaveSystemEventArgs(slotId, true, saveData.meta));
                EventBus.Instance?.Publish(GameEvents.GameLoaded, slotId);

                Log($"Loaded successfully from slot: {slotId}");
                return true;
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveSystem] Failed to load: {e}");
                OnLoaded?.Invoke(this, new SaveSystemEventArgs(slotId, false));
                return false;
            }
        }

        /// <summary>
        /// Quick load from the quick save slot.
        /// </summary>
        /// <returns>True if successful.</returns>
        public bool QuickLoad()
        {
            return LoadGame(QUICK_SAVE_SLOT);
        }

        private void ApplySaveData(SaveFileData saveData)
        {
            // Apply to GameManager
            if (GameManager.Instance != null && saveData.gameManager != null)
            {
                var phase = Enum.TryParse<GamePhase>(saveData.gameManager.currentPhase, out var p)
                    ? p : GamePhase.Title;

                GameManager.Instance.ApplyLoadedState(
                    saveData.gameManager.playerName,
                    saveData.gameManager.totalPlayTime,
                    phase,
                    saveData.gameManager.currentTownId,
                    saveData.gameManager.playerLevel
                );
            }

            // Apply to TimeSystem
            if (TimeSystem.Instance != null && saveData.timeSystem != null)
            {
                TimeSystem.Instance.LoadSaveData(saveData.timeSystem);
            }

            // Apply to WeatherSystem
            if (WeatherSystem.Instance != null && saveData.weatherSystem != null)
            {
                WeatherSystem.Instance.LoadSaveData(saveData.weatherSystem);
            }

            // Apply to FatigueSystem
            if (FatigueSystem.Instance != null && saveData.fatigueSystem != null)
            {
                FatigueSystem.Instance.LoadSaveData(saveData.fatigueSystem);
            }

            // Apply to ProvisionsSystem
            if (ProvisionsSystem.Instance != null && saveData.provisionsSystem != null)
            {
                ProvisionsSystem.Instance.LoadSaveData(saveData.provisionsSystem);
            }

            // Apply custom data
            if (saveData.customData != null)
            {
                foreach (var kvp in saveData.customData)
                {
                    if (_loadConsumers.TryGetValue(kvp.Key, out var consumer))
                    {
                        try
                        {
                            consumer(kvp.Value);
                        }
                        catch (Exception e)
                        {
                            Debug.LogWarning($"[SaveSystem] Consumer {kvp.Key} failed: {e.Message}");
                        }
                    }
                }
            }
        }

        private SaveFileData MigrateIfNeeded(SaveFileData saveData)
        {
            if (saveData.meta.version >= SAVE_VERSION)
                return saveData;

            Log($"Migrating save from v{saveData.meta.version} to v{SAVE_VERSION}");

            // Add migration logic here as versions increase
            // if (saveData.meta.version < 2) { ... }

            saveData.meta.version = SAVE_VERSION;
            return saveData;
        }

        #endregion

        #region Slot Management

        /// <summary>
        /// Get all save slot metadata.
        /// </summary>
        /// <returns>Array of save slot metadata.</returns>
        public SaveSlotMeta[] GetAllSlots()
        {
            var slots = new List<SaveSlotMeta>();

            foreach (var slotId in _saveIndex)
            {
                var meta = GetSlotMeta(slotId);
                if (meta != null)
                {
                    slots.Add(meta);
                }
            }

            // Sort by timestamp, newest first
            return slots.OrderByDescending(s => s.timestamp).ToArray();
        }

        /// <summary>
        /// Get manual save slots (excluding quick/auto).
        /// </summary>
        /// <returns>Array of manual save slot metadata.</returns>
        public SaveSlotMeta[] GetManualSlots()
        {
            return GetAllSlots()
                .Where(s => !s.isQuickSave && !s.isAutoSave)
                .ToArray();
        }

        /// <summary>
        /// Get metadata for a specific slot.
        /// </summary>
        /// <param name="slotId">Slot ID to query.</param>
        /// <returns>Slot metadata or null if not found.</returns>
        public SaveSlotMeta GetSlotMeta(string slotId)
        {
            var json = PlayerPrefs.GetString(SAVE_PREFIX + slotId, null);
            if (string.IsNullOrEmpty(json))
                return null;

            try
            {
                var saveData = JsonUtility.FromJson<SaveFileData>(json);
                return saveData?.meta;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Check if a slot exists.
        /// </summary>
        /// <param name="slotId">Slot ID to check.</param>
        /// <returns>True if the slot has save data.</returns>
        public bool SlotExists(string slotId)
        {
            return PlayerPrefs.HasKey(SAVE_PREFIX + slotId);
        }

        /// <summary>
        /// Check if quick save exists.
        /// </summary>
        public bool HasQuickSave => SlotExists(QUICK_SAVE_SLOT);

        /// <summary>
        /// Check if auto save exists.
        /// </summary>
        public bool HasAutoSave => SlotExists(AUTO_SAVE_SLOT);

        /// <summary>
        /// Get the next available slot ID.
        /// </summary>
        /// <returns>Next available slot ID.</returns>
        public string GetNextSlotId()
        {
            var manualSlots = GetManualSlots();

            for (int i = 1; i <= MAX_MANUAL_SLOTS; i++)
            {
                var slotId = $"slot-{i}";
                if (!manualSlots.Any(s => s.slotId == slotId))
                {
                    return slotId;
                }
            }

            // All slots full, return oldest
            return manualSlots.LastOrDefault()?.slotId ?? "slot-1";
        }

        /// <summary>
        /// Delete a save slot.
        /// </summary>
        /// <param name="slotId">Slot to delete.</param>
        public void DeleteSlot(string slotId)
        {
            Log($"Deleting slot: {slotId}");

            PlayerPrefs.DeleteKey(SAVE_PREFIX + slotId);
            PlayerPrefs.Save();

            _saveIndex.Remove(slotId);
            SaveSaveIndex();

            OnDeleted?.Invoke(this, new SaveSystemEventArgs(slotId, true));
        }

        /// <summary>
        /// Clear all save data.
        /// </summary>
        public void ClearAllData()
        {
            Log("Clearing all save data");

            foreach (var slotId in _saveIndex.ToArray())
            {
                PlayerPrefs.DeleteKey(SAVE_PREFIX + slotId);
            }

            _saveIndex.Clear();
            SaveSaveIndex();
            PlayerPrefs.Save();
        }

        #endregion

        #region Export/Import

        /// <summary>
        /// Export a save as a base64-encoded string.
        /// </summary>
        /// <param name="slotId">Slot to export.</param>
        /// <returns>Base64 encoded save data.</returns>
        public string ExportSave(string slotId)
        {
            var json = PlayerPrefs.GetString(SAVE_PREFIX + slotId, null);
            if (string.IsNullOrEmpty(json))
            {
                throw new InvalidOperationException($"Save not found: {slotId}");
            }

            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(json));
        }

        /// <summary>
        /// Import a save from a base64-encoded string.
        /// </summary>
        /// <param name="data">Base64 encoded save data.</param>
        /// <returns>Metadata of the imported save.</returns>
        public SaveSlotMeta ImportSave(string data)
        {
            var json = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(data));
            var saveData = JsonUtility.FromJson<SaveFileData>(json);

            // Generate new slot ID
            var newSlotId = $"import-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            saveData.meta.slotId = newSlotId;

            PlayerPrefs.SetString(SAVE_PREFIX + newSlotId, JsonUtility.ToJson(saveData));
            PlayerPrefs.Save();

            UpdateSaveIndex(newSlotId);

            return saveData.meta;
        }

        #endregion

        #region Save Index Management

        private void LoadSaveIndex()
        {
            var json = PlayerPrefs.GetString(SAVE_INDEX_KEY, "[]");
            try
            {
                _saveIndex = JsonUtility.FromJson<StringListWrapper>(json)?.items
                            ?? new List<string>();
            }
            catch
            {
                _saveIndex = new List<string>();
            }
        }

        private void SaveSaveIndex()
        {
            var wrapper = new StringListWrapper { items = _saveIndex };
            PlayerPrefs.SetString(SAVE_INDEX_KEY, JsonUtility.ToJson(wrapper));
        }

        private void UpdateSaveIndex(string slotId)
        {
            if (!_saveIndex.Contains(slotId))
            {
                _saveIndex.Add(slotId);
                SaveSaveIndex();
            }
        }

        // Helper class for JSON serialization of string list
        [Serializable]
        private class StringListWrapper
        {
            public List<string> items = new List<string>();
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[SaveSystem] {message}");
            }
        }

        #endregion
    }
}
