using System;
using System.Collections;
using UnityEngine;
using IronFrontier.Systems;

namespace IronFrontier.Core
{
    /// <summary>
    /// Main game phases corresponding to different gameplay states.
    /// </summary>
    public enum GamePhase
    {
        /// <summary>Title screen / main menu</summary>
        Title,
        /// <summary>Loading screen between phases</summary>
        Loading,
        /// <summary>Open world exploration</summary>
        Overworld,
        /// <summary>Inside a town or settlement</summary>
        Town,
        /// <summary>In a dialogue with an NPC</summary>
        Dialogue,
        /// <summary>Turn-based combat encounter</summary>
        Combat,
        /// <summary>Shopping at a vendor</summary>
        Shop,
        /// <summary>Pause menu / inventory screen</summary>
        Menu,
        /// <summary>Resting at a campsite</summary>
        Camp,
        /// <summary>Game over state</summary>
        GameOver
    }

    /// <summary>
    /// Event arguments for game phase transitions.
    /// </summary>
    public class GamePhaseChangedEventArgs : EventArgs
    {
        /// <summary>The phase being transitioned from.</summary>
        public GamePhase FromPhase { get; }

        /// <summary>The phase being transitioned to.</summary>
        public GamePhase ToPhase { get; }

        /// <summary>Optional context data for the transition.</summary>
        public object Context { get; }

        public GamePhaseChangedEventArgs(GamePhase from, GamePhase to, object context = null)
        {
            FromPhase = from;
            ToPhase = to;
            Context = context;
        }
    }

    /// <summary>
    /// Event arguments for game save/load operations.
    /// </summary>
    public class GameSaveEventArgs : EventArgs
    {
        /// <summary>The slot ID that was saved to or loaded from.</summary>
        public string SlotId { get; }

        /// <summary>Whether the operation was successful.</summary>
        public bool Success { get; }

        public GameSaveEventArgs(string slotId, bool success)
        {
            SlotId = slotId;
            Success = success;
        }
    }

    /// <summary>
    /// Singleton game manager that orchestrates all game systems.
    /// Handles game flow, phase transitions, and coordinates between subsystems.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript GameSession.ts and GameController.ts.
    /// Uses Unity 6 conventions with C# events for cross-system communication.
    /// </remarks>
    public class GameManager : MonoBehaviour
    {
        #region Singleton

        private static GameManager _instance;

        /// <summary>
        /// Global singleton instance of the GameManager.
        /// </summary>
        public static GameManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<GameManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[GameManager]");
                        _instance = go.AddComponent<GameManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>
        /// Fired when the game phase changes.
        /// </summary>
        public event EventHandler<GamePhaseChangedEventArgs> OnPhaseChanged;

        /// <summary>
        /// Fired when a new game is started.
        /// </summary>
        public event EventHandler OnGameStarted;

        /// <summary>
        /// Fired when a game is saved.
        /// </summary>
        public event EventHandler<GameSaveEventArgs> OnGameSaved;

        /// <summary>
        /// Fired when a game is loaded.
        /// </summary>
        public event EventHandler<GameSaveEventArgs> OnGameLoaded;

        /// <summary>
        /// Fired when the game is paused or resumed.
        /// </summary>
        public event EventHandler<bool> OnPauseStateChanged;

        /// <summary>
        /// Fired when the player enters a town.
        /// </summary>
        public event EventHandler<string> OnTownEntered;

        /// <summary>
        /// Fired when the player exits a town.
        /// </summary>
        public event EventHandler OnTownExited;

        /// <summary>
        /// Fired when the player levels up.
        /// </summary>
        public event EventHandler<int> OnPlayerLevelUp;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Enable auto-save functionality")]
        private bool enableAutoSave = true;

        [SerializeField]
        [Tooltip("Auto-save interval in seconds")]
        private float autoSaveInterval = 300f;

        [SerializeField]
        [Tooltip("Starting town ID for new games")]
        private string startingTownId = "frontiers_edge";

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private GamePhase _currentPhase = GamePhase.Title;
        private GamePhase _previousPhase = GamePhase.Title;
        private bool _isPaused = false;
        private bool _isInitialized = false;
        private float _totalPlayTime = 0f;
        private float _autoSaveTimer = 0f;
        private string _currentTownId = null;
        private string _playerName = "Stranger";
        private int _playerLevel = 1;

        #endregion

        #region Properties

        /// <summary>
        /// Current game phase.
        /// </summary>
        public GamePhase CurrentPhase => _currentPhase;

        /// <summary>
        /// Previous game phase (before current transition).
        /// </summary>
        public GamePhase PreviousPhase => _previousPhase;

        /// <summary>
        /// Whether the game is currently paused.
        /// </summary>
        public bool IsPaused => _isPaused;

        /// <summary>
        /// Whether the GameManager has been initialized.
        /// </summary>
        public bool IsInitialized => _isInitialized;

        /// <summary>
        /// Total play time in seconds.
        /// </summary>
        public float TotalPlayTime => _totalPlayTime;

        /// <summary>
        /// Currently active town ID (null if not in a town).
        /// </summary>
        public string CurrentTownId => _currentTownId;

        /// <summary>
        /// Player's character name.
        /// </summary>
        public string PlayerName => _playerName;

        /// <summary>
        /// Player's current level.
        /// </summary>
        public int PlayerLevel => _playerLevel;

        /// <summary>
        /// Whether a game session is currently active.
        /// </summary>
        public bool IsGameActive => _currentPhase != GamePhase.Title &&
                                    _currentPhase != GamePhase.Loading &&
                                    _currentPhase != GamePhase.GameOver;

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

            Log("GameManager awakened");
        }

        private void Start()
        {
            Initialize();
        }

        private void Update()
        {
            if (!_isInitialized || _isPaused || !IsGameActive) return;

            // Track play time
            _totalPlayTime += Time.deltaTime;

            // Auto-save timer
            if (enableAutoSave)
            {
                _autoSaveTimer += Time.deltaTime;
                if (_autoSaveTimer >= autoSaveInterval)
                {
                    _autoSaveTimer = 0f;
                    AutoSave();
                }
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

        #region Initialization

        /// <summary>
        /// Initialize the GameManager and all dependent systems.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            Log("Initializing GameManager...");

            // Subscribe to EventBus events
            if (EventBus.Instance != null)
            {
                EventBus.Instance.Subscribe<string>("combat_started", OnCombatStarted);
                EventBus.Instance.Subscribe<string>("combat_ended", OnCombatEnded);
                EventBus.Instance.Subscribe<string>("dialogue_started", OnDialogueStarted);
                EventBus.Instance.Subscribe<string>("dialogue_ended", OnDialogueEnded);
            }

            _isInitialized = true;
            Log("GameManager initialized");
        }

        #endregion

        #region Game Flow

        /// <summary>
        /// Start a new game with the given player name.
        /// </summary>
        /// <param name="playerName">Name for the player character.</param>
        public void StartNewGame(string playerName)
        {
            Log($"Starting new game for player: {playerName}");

            _playerName = playerName;
            _playerLevel = 1;
            _totalPlayTime = 0f;
            _autoSaveTimer = 0f;

            // Reset systems
            SaveSystem.Instance?.ClearAllData();
            TimeSystem.Instance?.ResetToDefault();
            WeatherSystem.Instance?.ResetToDefault();
            FatigueSystem.Instance?.ResetToDefault();

            // Transition to overworld
            SetPhase(GamePhase.Overworld);

            // Set starting location
            _currentTownId = startingTownId;

            // Notify listeners
            OnGameStarted?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish("game_started", playerName);

            Log("New game started successfully");
        }

        /// <summary>
        /// Continue from a saved game.
        /// </summary>
        /// <param name="slotId">Save slot to load from.</param>
        /// <returns>True if load was successful.</returns>
        public bool ContinueGame(string slotId)
        {
            Log($"Continuing game from slot: {slotId}");

            if (SaveSystem.Instance == null)
            {
                LogWarning("SaveSystem not available");
                return false;
            }

            var success = SaveSystem.Instance.LoadGame(slotId);
            if (success)
            {
                OnGameLoaded?.Invoke(this, new GameSaveEventArgs(slotId, true));
                EventBus.Instance?.Publish("game_loaded", slotId);
                Log("Game loaded successfully");
            }
            else
            {
                OnGameLoaded?.Invoke(this, new GameSaveEventArgs(slotId, false));
                LogWarning($"Failed to load game from slot: {slotId}");
            }

            return success;
        }

        /// <summary>
        /// End the current game session.
        /// </summary>
        public void EndGame()
        {
            Log("Ending game session");

            SetPhase(GamePhase.Title);
            _currentTownId = null;

            EventBus.Instance?.Publish("game_ended", string.Empty);
        }

        /// <summary>
        /// Trigger game over state.
        /// </summary>
        public void GameOver()
        {
            Log("Game Over triggered");
            SetPhase(GamePhase.GameOver);
        }

        #endregion

        #region Phase Management

        /// <summary>
        /// Set the current game phase.
        /// </summary>
        /// <param name="newPhase">Phase to transition to.</param>
        /// <param name="context">Optional context data for the transition.</param>
        public void SetPhase(GamePhase newPhase, object context = null)
        {
            if (newPhase == _currentPhase)
            {
                Log($"Already in phase {newPhase}, ignoring transition");
                return;
            }

            Log($"Phase transition: {_currentPhase} -> {newPhase}");

            _previousPhase = _currentPhase;
            _currentPhase = newPhase;

            // Notify listeners
            var args = new GamePhaseChangedEventArgs(_previousPhase, newPhase, context);
            OnPhaseChanged?.Invoke(this, args);

            // Publish to EventBus
            EventBus.Instance?.Publish("phase_changed", newPhase.ToString());
        }

        /// <summary>
        /// Return to the previous phase.
        /// </summary>
        public void ReturnToPreviousPhase()
        {
            SetPhase(_previousPhase);
        }

        #endregion

        #region Location Management

        /// <summary>
        /// Enter a town or settlement.
        /// </summary>
        /// <param name="townId">ID of the town to enter.</param>
        public void EnterTown(string townId)
        {
            Log($"Entering town: {townId}");

            _currentTownId = townId;
            SetPhase(GamePhase.Town, townId);

            OnTownEntered?.Invoke(this, townId);
            EventBus.Instance?.Publish("town_entered", townId);
        }

        /// <summary>
        /// Exit the current town to the overworld.
        /// </summary>
        public void ExitTown()
        {
            if (_currentTownId == null)
            {
                LogWarning("Not currently in a town");
                return;
            }

            Log($"Exiting town: {_currentTownId}");

            _currentTownId = null;
            SetPhase(GamePhase.Overworld);

            OnTownExited?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish("town_exited", string.Empty);
        }

        #endregion

        #region Pause Management

        /// <summary>
        /// Pause the game.
        /// </summary>
        public void Pause()
        {
            if (_isPaused) return;

            Log("Game paused");
            _isPaused = true;
            Time.timeScale = 0f;

            OnPauseStateChanged?.Invoke(this, true);
            EventBus.Instance?.Publish("game_paused", string.Empty);
        }

        /// <summary>
        /// Resume the game.
        /// </summary>
        public void Resume()
        {
            if (!_isPaused) return;

            Log("Game resumed");
            _isPaused = false;
            Time.timeScale = 1f;

            OnPauseStateChanged?.Invoke(this, false);
            EventBus.Instance?.Publish("game_resumed", string.Empty);
        }

        /// <summary>
        /// Toggle pause state.
        /// </summary>
        public void TogglePause()
        {
            if (_isPaused)
                Resume();
            else
                Pause();
        }

        /// <summary>
        /// Open the pause menu.
        /// </summary>
        public void OpenMenu()
        {
            Pause();
            SetPhase(GamePhase.Menu);
        }

        /// <summary>
        /// Close the pause menu and return to gameplay.
        /// </summary>
        public void CloseMenu()
        {
            ReturnToPreviousPhase();
            Resume();
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Save the game to a specific slot.
        /// </summary>
        /// <param name="slotId">Save slot ID.</param>
        public void SaveGame(string slotId)
        {
            Log($"Saving game to slot: {slotId}");

            if (SaveSystem.Instance == null)
            {
                LogWarning("SaveSystem not available");
                OnGameSaved?.Invoke(this, new GameSaveEventArgs(slotId, false));
                return;
            }

            var success = SaveSystem.Instance.SaveGame(slotId);
            OnGameSaved?.Invoke(this, new GameSaveEventArgs(slotId, success));

            if (success)
            {
                EventBus.Instance?.Publish("game_saved", slotId);
                Log("Game saved successfully");
            }
            else
            {
                LogWarning("Failed to save game");
            }
        }

        /// <summary>
        /// Quick save to the default quick save slot.
        /// </summary>
        public void QuickSave()
        {
            SaveGame("quicksave");
        }

        /// <summary>
        /// Quick load from the default quick save slot.
        /// </summary>
        public void QuickLoad()
        {
            ContinueGame("quicksave");
        }

        private void AutoSave()
        {
            if (!IsGameActive) return;

            Log("Auto-saving...");
            SaveGame("autosave");
        }

        #endregion

        #region Event Handlers

        private void OnCombatStarted(string encounterId)
        {
            SetPhase(GamePhase.Combat, encounterId);
        }

        private void OnCombatEnded(string result)
        {
            // Return to appropriate phase after combat
            if (_currentTownId != null)
                SetPhase(GamePhase.Town);
            else
                SetPhase(GamePhase.Overworld);
        }

        private void OnDialogueStarted(string npcId)
        {
            SetPhase(GamePhase.Dialogue, npcId);
        }

        private void OnDialogueEnded(string npcId)
        {
            ReturnToPreviousPhase();
        }

        #endregion

        #region Public API

        /// <summary>
        /// Apply state from a loaded save.
        /// </summary>
        public void ApplyLoadedState(string playerName, float playTime, GamePhase phase, string townId, int playerLevel = 1)
        {
            _playerName = playerName;
            _playerLevel = Mathf.Max(1, playerLevel);
            _totalPlayTime = playTime;
            _currentTownId = townId;
            SetPhase(phase);
        }

        /// <summary>
        /// Get current game state for saving.
        /// </summary>
        public (string playerName, float playTime, GamePhase phase, string townId, int playerLevel) GetGameState()
        {
            return (_playerName, _totalPlayTime, _currentPhase, _currentTownId, _playerLevel);
        }

        /// <summary>
        /// Notify that the player has leveled up.
        /// </summary>
        public void NotifyLevelUp(int newLevel)
        {
            _playerLevel = newLevel;
            OnPlayerLevelUp?.Invoke(this, newLevel);
            EventBus.Instance?.Publish("player_level_up", newLevel.ToString());
        }

        /// <summary>
        /// Set the player's level directly (used when loading saves).
        /// </summary>
        public void SetPlayerLevel(int level)
        {
            _playerLevel = Mathf.Max(1, level);
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[GameManager] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[GameManager] {message}");
        }

        #endregion
    }
}
