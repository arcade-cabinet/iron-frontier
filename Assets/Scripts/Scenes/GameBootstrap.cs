using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using IronFrontier.Core;

namespace IronFrontier.Scenes
{
    /// <summary>
    /// Initialization state during bootstrap.
    /// </summary>
    public enum BootstrapState
    {
        /// <summary>Not started.</summary>
        NotStarted,
        /// <summary>Initializing core systems.</summary>
        InitializingCoreSystems,
        /// <summary>Loading persistent managers.</summary>
        LoadingManagers,
        /// <summary>Initializing save system.</summary>
        InitializingSaveSystem,
        /// <summary>Loading player data.</summary>
        LoadingPlayerData,
        /// <summary>Loading configuration.</summary>
        LoadingConfiguration,
        /// <summary>Initializing audio.</summary>
        InitializingAudio,
        /// <summary>Preloading assets.</summary>
        PreloadingAssets,
        /// <summary>Starting game flow.</summary>
        StartingGameFlow,
        /// <summary>Bootstrap complete.</summary>
        Complete,
        /// <summary>Bootstrap failed.</summary>
        Failed
    }

    /// <summary>
    /// Event args for bootstrap progress updates.
    /// </summary>
    public class BootstrapProgressEventArgs : EventArgs
    {
        public BootstrapState State { get; }
        public float Progress { get; }
        public string Message { get; }

        public BootstrapProgressEventArgs(BootstrapState state, float progress, string message)
        {
            State = state;
            Progress = progress;
            Message = message;
        }
    }

    /// <summary>
    /// Game initialization and bootstrap system.
    /// Ensures all persistent managers are loaded and initialized before starting the game.
    /// Should be placed in the first scene that loads (typically a splash or bootstrap scene).
    /// </summary>
    /// <remarks>
    /// Bootstrap sequence:
    /// 1. Initialize core systems (EventBus, GameManager)
    /// 2. Load persistent managers
    /// 3. Initialize save system
    /// 4. Load player preferences
    /// 5. Preload essential assets
    /// 6. Start game flow (load main menu)
    /// </remarks>
    [DefaultExecutionOrder(-100)] // Run before other scripts
    public class GameBootstrap : MonoBehaviour
    {
        #region Singleton

        private static GameBootstrap _instance;
        private static bool _isBootstrapped = false;

        /// <summary>
        /// Global singleton instance of GameBootstrap.
        /// </summary>
        public static GameBootstrap Instance => _instance;

        /// <summary>
        /// Whether the game has been bootstrapped.
        /// </summary>
        public static bool IsBootstrapped => _isBootstrapped;

        #endregion

        #region Events

        /// <summary>Fired when bootstrap progress updates.</summary>
        public event EventHandler<BootstrapProgressEventArgs> OnProgressUpdated;

        /// <summary>Fired when bootstrap completes successfully.</summary>
        public event EventHandler OnBootstrapComplete;

        /// <summary>Fired when bootstrap fails.</summary>
        public event EventHandler<string> OnBootstrapFailed;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Scene to load after bootstrap (usually MainMenu)")]
        private string firstSceneName = "MainMenu";

        [SerializeField]
        [Tooltip("Automatically start bootstrap on Awake")]
        private bool autoStart = true;

        [SerializeField]
        [Tooltip("Skip directly to a specific scene (for debugging)")]
        private string debugSkipToScene = "";

        [Header("Persistent Managers")]
        [SerializeField]
        [Tooltip("Prefabs for persistent manager objects")]
        private GameObject[] managerPrefabs;

        [Header("Preload Assets")]
        [SerializeField]
        [Tooltip("Assets to preload during bootstrap")]
        private UnityEngine.Object[] preloadAssets;

        [Header("Timing")]
        [SerializeField]
        [Tooltip("Minimum time to show splash screen")]
        private float minimumSplashTime = 1.0f;

        [SerializeField]
        [Tooltip("Time between initialization steps")]
        private float stepDelay = 0.1f;

        [Header("UI")]
        [SerializeField]
        [Tooltip("Loading progress bar (optional)")]
        private UnityEngine.UI.Slider progressBar;

        [SerializeField]
        [Tooltip("Loading status text (optional)")]
        private TMPro.TMP_Text statusText;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private BootstrapState _state = BootstrapState.NotStarted;
        private float _progress = 0f;
        private float _startTime;
        private List<GameObject> _spawnedManagers = new List<GameObject>();

        #endregion

        #region Properties

        /// <summary>Current bootstrap state.</summary>
        public BootstrapState State => _state;

        /// <summary>Overall bootstrap progress (0-1).</summary>
        public float Progress => _progress;

        /// <summary>Whether bootstrap is in progress.</summary>
        public bool IsBootstrapping => _state != BootstrapState.NotStarted &&
                                        _state != BootstrapState.Complete &&
                                        _state != BootstrapState.Failed;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            // Prevent duplicate bootstrapping
            if (_isBootstrapped && _instance != this)
            {
                Log("Already bootstrapped, destroying duplicate");
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);

            if (autoStart)
            {
                StartBootstrap();
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
        /// Start the bootstrap process.
        /// </summary>
        public void StartBootstrap()
        {
            if (IsBootstrapping)
            {
                LogWarning("Bootstrap already in progress");
                return;
            }

            if (_isBootstrapped)
            {
                Log("Already bootstrapped, skipping");
                LoadFirstScene();
                return;
            }

            Log("Starting bootstrap...");
            _startTime = Time.realtimeSinceStartup;
            StartCoroutine(BootstrapCoroutine());
        }

        /// <summary>
        /// Reset bootstrap state (for testing).
        /// </summary>
        public void ResetBootstrap()
        {
            _isBootstrapped = false;
            _state = BootstrapState.NotStarted;
            _progress = 0f;

            // Destroy spawned managers
            foreach (var manager in _spawnedManagers)
            {
                if (manager != null)
                {
                    Destroy(manager);
                }
            }
            _spawnedManagers.Clear();

            Log("Bootstrap reset");
        }

        #endregion

        #region Bootstrap Coroutine

        private IEnumerator BootstrapCoroutine()
        {
            // Step 1: Initialize Core Systems
            yield return StartCoroutine(InitializeCoreSystems());
            if (_state == BootstrapState.Failed) yield break;

            // Step 2: Load Persistent Managers
            yield return StartCoroutine(LoadPersistentManagers());
            if (_state == BootstrapState.Failed) yield break;

            // Step 3: Initialize Save System
            yield return StartCoroutine(InitializeSaveSystem());
            if (_state == BootstrapState.Failed) yield break;

            // Step 4: Load Player Data
            yield return StartCoroutine(LoadPlayerData());
            if (_state == BootstrapState.Failed) yield break;

            // Step 5: Load Configuration
            yield return StartCoroutine(LoadConfiguration());
            if (_state == BootstrapState.Failed) yield break;

            // Step 6: Initialize Audio
            yield return StartCoroutine(InitializeAudio());
            if (_state == BootstrapState.Failed) yield break;

            // Step 7: Preload Assets
            yield return StartCoroutine(PreloadAssets());
            if (_state == BootstrapState.Failed) yield break;

            // Ensure minimum splash time
            float elapsed = Time.realtimeSinceStartup - _startTime;
            if (elapsed < minimumSplashTime)
            {
                yield return new WaitForSecondsRealtime(minimumSplashTime - elapsed);
            }

            // Step 8: Start Game Flow
            yield return StartCoroutine(StartGameFlow());

            // Complete
            SetState(BootstrapState.Complete, 1f, "Bootstrap complete");
            _isBootstrapped = true;

            Log($"Bootstrap completed in {Time.realtimeSinceStartup - _startTime:F2}s");

            OnBootstrapComplete?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish("bootstrap_complete", "");
        }

        #endregion

        #region Initialization Steps

        private IEnumerator InitializeCoreSystems()
        {
            SetState(BootstrapState.InitializingCoreSystems, 0.05f, "Initializing core systems...");

            try
            {
                // Ensure EventBus exists
                var eventBus = EventBus.Instance;
                if (eventBus == null)
                {
                    throw new Exception("Failed to create EventBus");
                }

                yield return new WaitForSecondsRealtime(stepDelay);

                // Ensure GameManager exists
                var gameManager = GameManager.Instance;
                if (gameManager == null)
                {
                    throw new Exception("Failed to create GameManager");
                }

                Log("Core systems initialized");
            }
            catch (Exception e)
            {
                FailBootstrap($"Core systems initialization failed: {e.Message}");
            }

            yield return new WaitForSecondsRealtime(stepDelay);
        }

        private IEnumerator LoadPersistentManagers()
        {
            SetState(BootstrapState.LoadingManagers, 0.15f, "Loading managers...");

            if (managerPrefabs == null || managerPrefabs.Length == 0)
            {
                Log("No manager prefabs to load");
                yield break;
            }

            float progressPerManager = 0.15f / managerPrefabs.Length;

            foreach (var prefab in managerPrefabs)
            {
                if (prefab == null) continue;

                try
                {
                    // Check if manager already exists
                    var existingType = prefab.GetComponent<MonoBehaviour>()?.GetType();
                    if (existingType != null && FindFirstObjectByType(existingType) != null)
                    {
                        Log($"Manager already exists: {prefab.name}");
                        continue;
                    }

                    // Instantiate manager
                    var managerGO = Instantiate(prefab);
                    managerGO.name = prefab.name;
                    DontDestroyOnLoad(managerGO);
                    _spawnedManagers.Add(managerGO);

                    Log($"Loaded manager: {prefab.name}");
                }
                catch (Exception e)
                {
                    LogWarning($"Failed to load manager {prefab.name}: {e.Message}");
                }

                _progress += progressPerManager;
                UpdateUI();

                yield return new WaitForSecondsRealtime(stepDelay);
            }
        }

        private IEnumerator InitializeSaveSystem()
        {
            SetState(BootstrapState.InitializingSaveSystem, 0.35f, "Initializing save system...");

            try
            {
                // Ensure SaveSystem exists
                var saveSystem = SaveSystem.Instance;
                if (saveSystem == null)
                {
                    throw new Exception("Failed to create SaveSystem");
                }

                Log("Save system initialized");
            }
            catch (Exception e)
            {
                FailBootstrap($"Save system initialization failed: {e.Message}");
            }

            yield return new WaitForSecondsRealtime(stepDelay);
        }

        private IEnumerator LoadPlayerData()
        {
            SetState(BootstrapState.LoadingPlayerData, 0.45f, "Loading player data...");

            try
            {
                // Load player preferences
                LoadPlayerPreferences();

                // Check for existing save data
                CheckForSaveData();

                Log("Player data loaded");
            }
            catch (Exception e)
            {
                LogWarning($"Player data loading failed: {e.Message}");
                // Non-fatal - continue bootstrap
            }

            yield return new WaitForSecondsRealtime(stepDelay);
        }

        private IEnumerator LoadConfiguration()
        {
            SetState(BootstrapState.LoadingConfiguration, 0.55f, "Loading configuration...");

            try
            {
                // Load game configuration
                LoadGameConfiguration();

                Log("Configuration loaded");
            }
            catch (Exception e)
            {
                LogWarning($"Configuration loading failed: {e.Message}");
                // Non-fatal - continue bootstrap
            }

            yield return new WaitForSecondsRealtime(stepDelay);
        }

        private IEnumerator InitializeAudio()
        {
            SetState(BootstrapState.InitializingAudio, 0.65f, "Initializing audio...");

            try
            {
                // Initialize audio system
                InitializeAudioSystem();

                Log("Audio initialized");
            }
            catch (Exception e)
            {
                LogWarning($"Audio initialization failed: {e.Message}");
                // Non-fatal - continue bootstrap
            }

            yield return new WaitForSecondsRealtime(stepDelay);
        }

        private IEnumerator PreloadAssets()
        {
            SetState(BootstrapState.PreloadingAssets, 0.75f, "Preloading assets...");

            if (preloadAssets == null || preloadAssets.Length == 0)
            {
                Log("No assets to preload");
                yield break;
            }

            float progressPerAsset = 0.15f / preloadAssets.Length;

            foreach (var asset in preloadAssets)
            {
                if (asset == null) continue;

                // Force asset to load into memory
                // This is a simple approach - for production, use Addressables
                Log($"Preloaded asset: {asset.name}");

                _progress += progressPerAsset;
                UpdateUI();

                yield return null;
            }
        }

        private IEnumerator StartGameFlow()
        {
            SetState(BootstrapState.StartingGameFlow, 0.95f, "Starting game...");

            yield return new WaitForSecondsRealtime(stepDelay);

            // Load first scene
            LoadFirstScene();
        }

        #endregion

        #region Helper Methods

        private void LoadPlayerPreferences()
        {
            // Load audio settings
            float masterVolume = PlayerPrefs.GetFloat("MasterVolume", 1f);
            float musicVolume = PlayerPrefs.GetFloat("MusicVolume", 0.7f);
            float sfxVolume = PlayerPrefs.GetFloat("SFXVolume", 1f);

            AudioListener.volume = masterVolume;

            // Load display settings
            int qualityLevel = PlayerPrefs.GetInt("QualityLevel", QualitySettings.GetQualityLevel());
            QualitySettings.SetQualityLevel(qualityLevel);

            bool fullscreen = PlayerPrefs.GetInt("Fullscreen", 1) == 1;
            Screen.fullScreen = fullscreen;

            Log($"Loaded preferences - Volume: {masterVolume}, Quality: {qualityLevel}");
        }

        private void CheckForSaveData()
        {
            bool hasQuickSave = SaveSystem.Instance?.HasQuickSave ?? false;
            bool hasAutoSave = SaveSystem.Instance?.HasAutoSave ?? false;
            var allSlots = SaveSystem.Instance?.GetAllSlots() ?? Array.Empty<SaveSlotMeta>();

            Log($"Save data check - QuickSave: {hasQuickSave}, AutoSave: {hasAutoSave}, Slots: {allSlots.Length}");
        }

        private void LoadGameConfiguration()
        {
            // Load game-specific configuration
            // This could include difficulty settings, accessibility options, etc.
            Log("Game configuration loaded (using defaults)");
        }

        private void InitializeAudioSystem()
        {
            // Initialize audio mixer and pools
            // In a full implementation, this would set up audio pooling, mixer snapshots, etc.
            Log("Audio system initialized (basic)");
        }

        private void LoadFirstScene()
        {
            string targetScene = firstSceneName;

            // Check for debug override
            if (!string.IsNullOrEmpty(debugSkipToScene) && debugMode)
            {
                targetScene = debugSkipToScene;
                Log($"Debug: Skipping to scene {targetScene}");
            }

            // Use SceneController if available
            if (SceneController.Instance != null)
            {
                SceneController.Instance.LoadScene(targetScene);
            }
            else
            {
                // Fallback to direct load
                SceneManager.LoadScene(targetScene);
            }

            Log($"Loading first scene: {targetScene}");
        }

        private void SetState(BootstrapState state, float progress, string message)
        {
            _state = state;
            _progress = progress;

            UpdateUI();

            var args = new BootstrapProgressEventArgs(state, progress, message);
            OnProgressUpdated?.Invoke(this, args);

            Log($"[{state}] {message} ({progress:P0})");
        }

        private void UpdateUI()
        {
            if (progressBar != null)
            {
                progressBar.value = _progress;
            }

            if (statusText != null)
            {
                statusText.text = GetStatusMessage(_state);
            }
        }

        private string GetStatusMessage(BootstrapState state)
        {
            return state switch
            {
                BootstrapState.InitializingCoreSystems => "Initializing core systems...",
                BootstrapState.LoadingManagers => "Loading managers...",
                BootstrapState.InitializingSaveSystem => "Initializing save system...",
                BootstrapState.LoadingPlayerData => "Loading player data...",
                BootstrapState.LoadingConfiguration => "Loading configuration...",
                BootstrapState.InitializingAudio => "Initializing audio...",
                BootstrapState.PreloadingAssets => "Preloading assets...",
                BootstrapState.StartingGameFlow => "Starting game...",
                BootstrapState.Complete => "Ready!",
                BootstrapState.Failed => "Error occurred",
                _ => "Loading..."
            };
        }

        private void FailBootstrap(string reason)
        {
            LogWarning($"Bootstrap failed: {reason}");
            _state = BootstrapState.Failed;

            OnBootstrapFailed?.Invoke(this, reason);
            EventBus.Instance?.Publish("bootstrap_failed", reason);
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[GameBootstrap] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[GameBootstrap] {message}");
        }

        #endregion
    }
}
