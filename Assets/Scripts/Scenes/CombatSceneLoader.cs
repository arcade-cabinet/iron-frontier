using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using IronFrontier.Core;
using IronFrontier.Combat;
using IronFrontier.Data;

namespace IronFrontier.Scenes
{
    /// <summary>
    /// Context data for initiating combat.
    /// </summary>
    [Serializable]
    public class CombatLoadContext
    {
        /// <summary>Unique encounter identifier.</summary>
        public string EncounterId { get; set; }

        /// <summary>Enemy data for the encounter.</summary>
        public List<EnemyData> Enemies { get; set; } = new List<EnemyData>();

        /// <summary>Player combat stats.</summary>
        public CombatStats PlayerStats { get; set; }

        /// <summary>Player character name.</summary>
        public string PlayerName { get; set; }

        /// <summary>Player's equipped weapon ID.</summary>
        public string PlayerWeaponId { get; set; }

        /// <summary>Player fatigue level (0-1).</summary>
        public float PlayerFatigue { get; set; }

        /// <summary>Whether the player can flee from this combat.</summary>
        public bool CanFlee { get; set; } = true;

        /// <summary>Whether this is a boss fight.</summary>
        public bool IsBoss { get; set; }

        /// <summary>Combat arena/background type.</summary>
        public string ArenaType { get; set; } = "default";

        /// <summary>Background music track to play.</summary>
        public string MusicTrack { get; set; }

        /// <summary>Scene to return to after combat.</summary>
        public string ReturnScene { get; set; }

        /// <summary>Context data to restore after combat.</summary>
        public object ReturnContext { get; set; }
    }

    /// <summary>
    /// Result of a combat encounter.
    /// </summary>
    [Serializable]
    public class CombatResult
    {
        /// <summary>Combat outcome phase (Victory, Defeat, Fled).</summary>
        public CombatPhase Outcome { get; set; }

        /// <summary>Encounter ID that was completed.</summary>
        public string EncounterId { get; set; }

        /// <summary>XP earned from the encounter.</summary>
        public int XPEarned { get; set; }

        /// <summary>Gold earned from the encounter.</summary>
        public int GoldEarned { get; set; }

        /// <summary>Items dropped during combat.</summary>
        public List<string> ItemsDropped { get; set; } = new List<string>();

        /// <summary>Total combat duration in seconds.</summary>
        public float CombatDuration { get; set; }

        /// <summary>Number of rounds the combat lasted.</summary>
        public int RoundsCompleted { get; set; }

        /// <summary>Player HP remaining after combat.</summary>
        public int PlayerHPRemaining { get; set; }
    }

    /// <summary>
    /// Event args for combat completion.
    /// </summary>
    public class CombatCompletedEventArgs : EventArgs
    {
        public CombatResult Result { get; }

        public CombatCompletedEventArgs(CombatResult result)
        {
            Result = result;
        }
    }

    /// <summary>
    /// Manages loading combat scenes additively and handling combat flow.
    /// Coordinates between the main game and combat system.
    /// </summary>
    public class CombatSceneLoader : MonoBehaviour
    {
        #region Singleton

        private static CombatSceneLoader _instance;

        /// <summary>
        /// Global singleton instance of CombatSceneLoader.
        /// </summary>
        public static CombatSceneLoader Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<CombatSceneLoader>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[CombatSceneLoader]");
                        _instance = go.AddComponent<CombatSceneLoader>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when combat is about to begin.</summary>
        public event EventHandler<CombatLoadContext> OnCombatStarting;

        /// <summary>Fired when combat scene is loaded and ready.</summary>
        public event EventHandler<string> OnCombatSceneReady;

        /// <summary>Fired when combat ends with result.</summary>
        public event EventHandler<CombatCompletedEventArgs> OnCombatCompleted;

        /// <summary>Fired when returning to previous scene after combat.</summary>
        public event EventHandler OnReturnToPreviousScene;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Combat scene name")]
        private string combatSceneName = "Combat";

        [SerializeField]
        [Tooltip("Transition type for entering combat")]
        private TransitionType combatEnterTransition = TransitionType.CircleWipe;

        [SerializeField]
        [Tooltip("Transition type for exiting combat")]
        private TransitionType combatExitTransition = TransitionType.Fade;

        [SerializeField]
        [Tooltip("Combat transition duration")]
        private float transitionDuration = 0.5f;

        [Header("Arena Settings")]
        [SerializeField]
        [Tooltip("Container for combat arena elements")]
        private Transform arenaContainer;

        [SerializeField]
        [Tooltip("Default combat arena prefab")]
        private GameObject defaultArenaPrefab;

        [Header("Combatant Positioning")]
        [SerializeField]
        [Tooltip("Player spawn position in combat")]
        private Vector3 playerSpawnPosition = new Vector3(-3f, 0f, 0f);

        [SerializeField]
        [Tooltip("Player facing direction in combat")]
        private Vector3 playerFacingDirection = Vector3.right;

        [SerializeField]
        [Tooltip("Starting position for enemies")]
        private Vector3 enemyStartPosition = new Vector3(3f, 0f, 0f);

        [SerializeField]
        [Tooltip("Spacing between enemies")]
        private float enemySpacing = 2f;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private CombatLoadContext _currentContext;
        private CombatResult _lastResult;
        private bool _isCombatActive = false;
        private bool _isLoading = false;
        private Scene _combatScene;
        private CombatManager _combatManager;
        private List<GameObject> _spawnedCombatants = new List<GameObject>();
        private float _combatStartTime;

        #endregion

        #region Properties

        /// <summary>Whether combat is currently active.</summary>
        public bool IsCombatActive => _isCombatActive;

        /// <summary>Whether combat scene is loading.</summary>
        public bool IsLoading => _isLoading;

        /// <summary>Current combat context.</summary>
        public CombatLoadContext CurrentContext => _currentContext;

        /// <summary>Last combat result.</summary>
        public CombatResult LastResult => _lastResult;

        /// <summary>Reference to the active CombatManager.</summary>
        public CombatManager CombatManager => _combatManager;

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

            Log("CombatSceneLoader initialized");
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                UnsubscribeFromCombatManager();
                _instance = null;
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Start a combat encounter.
        /// </summary>
        /// <param name="context">Combat initialization context.</param>
        public void StartCombat(CombatLoadContext context)
        {
            if (_isCombatActive || _isLoading)
            {
                LogWarning("Combat already active or loading");
                return;
            }

            if (context == null || context.Enemies == null || context.Enemies.Count == 0)
            {
                LogWarning("Invalid combat context - no enemies specified");
                return;
            }

            _currentContext = context;

            // Store current scene for return if not specified
            if (string.IsNullOrEmpty(context.ReturnScene))
            {
                context.ReturnScene = SceneManager.GetActiveScene().name;
            }

            StartCoroutine(LoadCombatCoroutine(context));
        }

        /// <summary>
        /// Start combat with a simplified enemy list.
        /// </summary>
        /// <param name="encounterId">Encounter identifier.</param>
        /// <param name="enemies">List of enemy data.</param>
        /// <param name="canFlee">Whether player can flee.</param>
        public void StartCombat(string encounterId, List<EnemyData> enemies, bool canFlee = true)
        {
            var context = new CombatLoadContext
            {
                EncounterId = encounterId,
                Enemies = enemies,
                CanFlee = canFlee,
                PlayerName = GameManager.Instance?.PlayerName ?? "Player"
            };

            StartCombat(context);
        }

        /// <summary>
        /// Force end combat and return to previous scene.
        /// </summary>
        /// <param name="outcome">Combat outcome to use.</param>
        public void ForceEndCombat(CombatPhase outcome)
        {
            if (!_isCombatActive)
            {
                LogWarning("No active combat to end");
                return;
            }

            _lastResult = new CombatResult
            {
                Outcome = outcome,
                EncounterId = _currentContext?.EncounterId,
                CombatDuration = Time.time - _combatStartTime
            };

            StartCoroutine(EndCombatCoroutine());
        }

        /// <summary>
        /// Get combat result and clear it.
        /// </summary>
        /// <returns>Last combat result.</returns>
        public CombatResult ConsumeResult()
        {
            var result = _lastResult;
            _lastResult = null;
            return result;
        }

        #endregion

        #region Combat Loading

        private IEnumerator LoadCombatCoroutine(CombatLoadContext context)
        {
            _isLoading = true;
            Log($"Loading combat: {context.EncounterId}");

            OnCombatStarting?.Invoke(this, context);
            EventBus.Instance?.Publish(GameEvents.CombatStarted, context.EncounterId);

            // Notify GameManager of phase change
            GameManager.Instance?.SetPhase(GamePhase.Combat, context.EncounterId);

            // Perform transition out
            if (SceneController.Instance?.sceneTransition != null)
            {
                var transition = SceneController.Instance.GetComponent<SceneTransition>();
                if (transition != null)
                {
                    yield return StartCoroutine(transition.TransitionOut(combatEnterTransition, transitionDuration));
                }
            }

            // Load combat scene additively
            var loadOperation = SceneManager.LoadSceneAsync(combatSceneName, LoadSceneMode.Additive);
            if (loadOperation == null)
            {
                LogWarning($"Failed to load combat scene: {combatSceneName}");
                _isLoading = false;
                yield break;
            }

            while (!loadOperation.isDone)
            {
                yield return null;
            }

            // Get reference to loaded scene
            _combatScene = SceneManager.GetSceneByName(combatSceneName);

            // Set combat scene as active
            SceneManager.SetActiveScene(_combatScene);

            // Initialize combat
            yield return StartCoroutine(InitializeCombatCoroutine(context));

            _isLoading = false;
            _isCombatActive = true;
            _combatStartTime = Time.time;

            OnCombatSceneReady?.Invoke(this, context.EncounterId);

            // Transition in
            if (SceneController.Instance?.sceneTransition != null)
            {
                var transition = SceneController.Instance.GetComponent<SceneTransition>();
                if (transition != null)
                {
                    yield return StartCoroutine(transition.TransitionIn(combatEnterTransition, transitionDuration));
                }
            }

            Log("Combat ready");
        }

        private IEnumerator InitializeCombatCoroutine(CombatLoadContext context)
        {
            // Find or create CombatManager
            _combatManager = FindFirstObjectByType<CombatManager>();
            if (_combatManager == null)
            {
                var managerGO = new GameObject("CombatManager");
                SceneManager.MoveGameObjectToScene(managerGO, _combatScene);
                _combatManager = managerGO.AddComponent<CombatManager>();
            }

            // Subscribe to combat events
            SubscribeToCombatManager();

            // Set up arena
            yield return StartCoroutine(SetupArenaCoroutine(context.ArenaType));

            // Position player
            PositionPlayer(context);

            // Spawn and position enemies
            var enemyCombatants = SpawnEnemies(context.Enemies);

            // Create combat init context
            var initContext = new CombatInitContext
            {
                EncounterId = context.EncounterId,
                PlayerStats = context.PlayerStats ?? GetDefaultPlayerStats(),
                PlayerName = context.PlayerName ?? "Player",
                PlayerWeaponId = context.PlayerWeaponId,
                PlayerFatigue = context.PlayerFatigue
            };

            // Initialize combat manager
            _combatManager.InitializeCombat(initContext, enemyCombatants, context.CanFlee, context.IsBoss);

            yield return null;
        }

        #endregion

        #region Arena Setup

        private IEnumerator SetupArenaCoroutine(string arenaType)
        {
            Log($"Setting up arena: {arenaType}");

            // Find arena container in combat scene
            if (arenaContainer == null)
            {
                var containerGO = GameObject.Find("ArenaContainer");
                if (containerGO != null)
                {
                    arenaContainer = containerGO.transform;
                }
                else
                {
                    containerGO = new GameObject("ArenaContainer");
                    SceneManager.MoveGameObjectToScene(containerGO, _combatScene);
                    arenaContainer = containerGO.transform;
                }
            }

            // Load arena prefab based on type
            // In a full implementation, this would load different arena prefabs
            if (defaultArenaPrefab != null)
            {
                Instantiate(defaultArenaPrefab, arenaContainer);
            }

            yield return null;
        }

        #endregion

        #region Combatant Positioning

        private void PositionPlayer(CombatLoadContext context)
        {
            // Player positioning is handled by CombatManager or player controller
            // This just provides the spawn position info
            Log($"Player spawn position: {playerSpawnPosition}");

            EventBus.Instance?.Publish("combat_player_position",
                $"{playerSpawnPosition.x},{playerSpawnPosition.y},{playerSpawnPosition.z}");
        }

        private List<Combatant> SpawnEnemies(List<EnemyData> enemies)
        {
            var combatants = new List<Combatant>();

            for (int i = 0; i < enemies.Count; i++)
            {
                var enemyData = enemies[i];
                if (enemyData == null) continue;

                // Calculate position for this enemy
                Vector3 position = CalculateEnemyPosition(i, enemies.Count);

                // Create combatant from enemy data
                var combatant = CreateCombatantFromEnemy(enemyData, i);
                if (combatant != null)
                {
                    combatants.Add(combatant);
                }

                Log($"Spawned enemy: {enemyData.displayName} at {position}");
            }

            return combatants;
        }

        private Vector3 CalculateEnemyPosition(int index, int totalCount)
        {
            // Arrange enemies in a row or formation
            float offset = (index - (totalCount - 1) * 0.5f) * enemySpacing;

            return new Vector3(
                enemyStartPosition.x,
                enemyStartPosition.y,
                enemyStartPosition.z + offset
            );
        }

        private Combatant CreateCombatantFromEnemy(EnemyData enemyData, int index)
        {
            var combatant = ScriptableObject.CreateInstance<Combatant>();

            // Map EnemyData properties to CombatStats
            var stats = new CombatStats
            {
                MaxHP = enemyData.maxHealth,
                HP = enemyData.maxHealth,
                Attack = enemyData.baseDamage,
                Defense = enemyData.armor,
                Speed = enemyData.moveSpeed,
                Accuracy = 70 + enemyData.accuracyMod, // Base 70 + modifier
                Evasion = enemyData.evasion,
                CritChance = 10, // Default crit chance
                CritMultiplier = 1.5f
            };

            // Map EnemyBehavior to CombatantBehavior
            var behavior = enemyData.behavior switch
            {
                EnemyBehavior.Aggressive => CombatantBehavior.Aggressive,
                EnemyBehavior.Defensive => CombatantBehavior.Defensive,
                EnemyBehavior.Ranged => CombatantBehavior.Ranged,
                EnemyBehavior.Support => CombatantBehavior.Support,
                _ => CombatantBehavior.Aggressive
            };

            combatant.Initialize(
                id: $"{enemyData.id}_{index}",
                definitionId: enemyData.id,
                displayName: enemyData.displayName,
                type: CombatantType.Enemy,
                stats: stats,
                weaponId: enemyData.weaponId,
                behavior: behavior,
                xpReward: enemyData.xpReward,
                goldReward: enemyData.goldReward
            );

            return combatant;
        }

        #endregion

        #region Combat End Handling

        private void SubscribeToCombatManager()
        {
            if (_combatManager == null) return;

            _combatManager.OnCombatEnded.AddListener(HandleCombatEnded);
        }

        private void UnsubscribeFromCombatManager()
        {
            if (_combatManager == null) return;

            _combatManager.OnCombatEnded.RemoveListener(HandleCombatEnded);
        }

        private void HandleCombatEnded(CombatPhase outcome, CombatRewards rewards)
        {
            Log($"Combat ended: {outcome}");

            _lastResult = new CombatResult
            {
                Outcome = outcome,
                EncounterId = _currentContext?.EncounterId,
                CombatDuration = Time.time - _combatStartTime,
                RoundsCompleted = _combatManager?.Round ?? 0
            };

            if (rewards != null)
            {
                _lastResult.XPEarned = rewards.XP;
                _lastResult.GoldEarned = rewards.Gold;

                foreach (var drop in rewards.Loot)
                {
                    _lastResult.ItemsDropped.Add(drop.ItemId);
                }
            }

            // Get player HP remaining
            var player = _combatManager?.GetPlayer();
            if (player != null)
            {
                _lastResult.PlayerHPRemaining = player.Stats.HP;
            }

            StartCoroutine(EndCombatCoroutine());
        }

        private IEnumerator EndCombatCoroutine()
        {
            Log("Ending combat and returning to previous scene");

            // Notify listeners
            OnCombatCompleted?.Invoke(this, new CombatCompletedEventArgs(_lastResult));

            // Publish events based on outcome
            switch (_lastResult.Outcome)
            {
                case CombatPhase.Victory:
                    EventBus.Instance?.Publish(GameEvents.CombatVictory, _currentContext?.EncounterId ?? "");
                    break;
                case CombatPhase.Defeat:
                    EventBus.Instance?.Publish(GameEvents.CombatDefeat, _currentContext?.EncounterId ?? "");
                    break;
                case CombatPhase.Fled:
                    EventBus.Instance?.Publish(GameEvents.CombatFled, _currentContext?.EncounterId ?? "");
                    break;
            }

            // Transition out
            if (SceneController.Instance?.sceneTransition != null)
            {
                var transition = SceneController.Instance.GetComponent<SceneTransition>();
                if (transition != null)
                {
                    yield return StartCoroutine(transition.TransitionOut(combatExitTransition, transitionDuration));
                }
            }

            // Unsubscribe from combat manager
            UnsubscribeFromCombatManager();

            // Clean up combat manager
            if (_combatManager != null)
            {
                _combatManager.EndCombat();
            }

            // Clean up spawned objects
            foreach (var obj in _spawnedCombatants)
            {
                if (obj != null)
                {
                    Destroy(obj);
                }
            }
            _spawnedCombatants.Clear();

            // Unload combat scene
            if (_combatScene.isLoaded)
            {
                yield return SceneManager.UnloadSceneAsync(_combatScene);
            }

            _isCombatActive = false;
            _combatManager = null;

            // Return to previous scene
            string returnScene = _currentContext?.ReturnScene;
            if (!string.IsNullOrEmpty(returnScene))
            {
                var scene = SceneManager.GetSceneByName(returnScene);
                if (scene.isLoaded)
                {
                    SceneManager.SetActiveScene(scene);
                }
            }

            // Restore game phase
            if (_lastResult.Outcome == CombatPhase.Defeat)
            {
                GameManager.Instance?.GameOver();
            }
            else
            {
                // Return to appropriate phase
                var currentTownId = GameManager.Instance?.CurrentTownId;
                if (!string.IsNullOrEmpty(currentTownId))
                {
                    GameManager.Instance?.SetPhase(GamePhase.Town, currentTownId);
                }
                else
                {
                    GameManager.Instance?.SetPhase(GamePhase.Overworld);
                }
            }

            OnReturnToPreviousScene?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish(GameEvents.CombatEnded, _lastResult.Outcome.ToString());

            // Transition in
            if (SceneController.Instance?.sceneTransition != null)
            {
                var transition = SceneController.Instance.GetComponent<SceneTransition>();
                if (transition != null)
                {
                    yield return StartCoroutine(transition.TransitionIn(combatExitTransition, transitionDuration));
                }
            }

            _currentContext = null;
            Log("Returned to previous scene");
        }

        #endregion

        #region Utility Methods

        private CombatStats GetDefaultPlayerStats()
        {
            return new CombatStats
            {
                MaxHP = 100,
                HP = 100,
                Attack = 15,
                Defense = 10,
                Speed = 10,
                Accuracy = 85f,
                Evasion = 10f,
                CritChance = 5f,
                CritMultiplier = 1.5f
            };
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[CombatSceneLoader] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[CombatSceneLoader] {message}");
        }

        #endregion
    }
}
