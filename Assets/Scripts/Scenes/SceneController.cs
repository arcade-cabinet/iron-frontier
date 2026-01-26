using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using IronFrontier.Core;

namespace IronFrontier.Scenes
{
    /// <summary>
    /// Scene identifiers for all game scenes.
    /// </summary>
    public static class SceneNames
    {
        public const string MainMenu = "MainMenu";
        public const string Overworld = "Overworld";
        public const string Combat = "Combat";
        public const string Town = "Town";
        public const string Loading = "Loading";
    }

    /// <summary>
    /// Data for scene transition requests.
    /// </summary>
    public class SceneTransitionRequest
    {
        /// <summary>Scene to load.</summary>
        public string SceneName { get; set; }

        /// <summary>Optional context data for the target scene.</summary>
        public object Context { get; set; }

        /// <summary>Whether to use a transition effect.</summary>
        public bool UseTransition { get; set; } = true;

        /// <summary>Transition type to use.</summary>
        public TransitionType TransitionType { get; set; } = TransitionType.Fade;

        /// <summary>Whether to add to scene stack for back navigation.</summary>
        public bool AddToStack { get; set; } = true;

        /// <summary>Load mode (Single or Additive).</summary>
        public LoadSceneMode LoadMode { get; set; } = LoadSceneMode.Single;
    }

    /// <summary>
    /// Event args for scene change events.
    /// </summary>
    public class SceneChangedEventArgs : EventArgs
    {
        /// <summary>Previous scene name.</summary>
        public string FromScene { get; }

        /// <summary>New scene name.</summary>
        public string ToScene { get; }

        /// <summary>Context data passed to the scene.</summary>
        public object Context { get; }

        public SceneChangedEventArgs(string from, string to, object context = null)
        {
            FromScene = from;
            ToScene = to;
            Context = context;
        }
    }

    /// <summary>
    /// Singleton scene management controller handling all scene loading, unloading,
    /// transitions, and navigation stack management.
    /// </summary>
    /// <remarks>
    /// Provides a centralized system for:
    /// - Scene loading with transition effects
    /// - Loading screen management
    /// - Back navigation via scene stack
    /// - Additive scene loading for overlays
    /// - Context passing between scenes
    /// </remarks>
    public class SceneController : MonoBehaviour
    {
        #region Singleton

        private static SceneController _instance;

        /// <summary>
        /// Global singleton instance of SceneController.
        /// </summary>
        public static SceneController Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<SceneController>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[SceneController]");
                        _instance = go.AddComponent<SceneController>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when scene loading begins.</summary>
        public event EventHandler<string> OnSceneLoadStarted;

        /// <summary>Fired when scene loading completes.</summary>
        public event EventHandler<SceneChangedEventArgs> OnSceneLoadCompleted;

        /// <summary>Fired when scene unloading begins.</summary>
        public event EventHandler<string> OnSceneUnloadStarted;

        /// <summary>Fired when scene unloading completes.</summary>
        public event EventHandler<string> OnSceneUnloadCompleted;

        /// <summary>Fired when loading progress updates.</summary>
        public event EventHandler<float> OnLoadingProgress;

        /// <summary>Fired when back navigation occurs.</summary>
        public event EventHandler OnNavigatedBack;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Default transition type to use")]
        private TransitionType defaultTransitionType = TransitionType.Fade;

        [SerializeField]
        [Tooltip("Default transition duration in seconds")]
        private float defaultTransitionDuration = 0.5f;

        [SerializeField]
        [Tooltip("Minimum loading screen display time")]
        private float minimumLoadingTime = 0.5f;

        [SerializeField]
        [Tooltip("Loading screen scene name (loaded additively)")]
        private string loadingSceneName = "Loading";

        [Header("Scene Transition")]
        [SerializeField]
        [Tooltip("Scene transition component reference")]
        internal SceneTransition sceneTransition;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Scene navigation stack for back navigation
        private readonly Stack<string> _sceneStack = new Stack<string>();

        // Currently loading scene name
        private string _loadingSceneName;

        // Context data for the current scene
        private object _currentContext;

        // Whether a scene transition is in progress
        private bool _isTransitioning = false;

        // Additively loaded scenes
        private readonly List<string> _additiveScenes = new List<string>();

        #endregion

        #region Properties

        /// <summary>Current active scene name.</summary>
        public string CurrentSceneName => SceneManager.GetActiveScene().name;

        /// <summary>Previous scene name (if any in stack).</summary>
        public string PreviousSceneName => _sceneStack.Count > 0 ? _sceneStack.Peek() : null;

        /// <summary>Whether a scene transition is in progress.</summary>
        public bool IsTransitioning => _isTransitioning;

        /// <summary>Whether back navigation is available.</summary>
        public bool CanGoBack => _sceneStack.Count > 0;

        /// <summary>Number of scenes in the navigation stack.</summary>
        public int StackDepth => _sceneStack.Count;

        /// <summary>Context data for the current scene.</summary>
        public object CurrentContext => _currentContext;

        /// <summary>Default transition duration.</summary>
        public float TransitionDuration => defaultTransitionDuration;

        /// <summary>List of additively loaded scenes.</summary>
        public IReadOnlyList<string> AdditiveScenes => _additiveScenes;

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

            // Create transition component if not assigned
            if (sceneTransition == null)
            {
                sceneTransition = gameObject.AddComponent<SceneTransition>();
            }

            // Subscribe to Unity scene events
            SceneManager.sceneLoaded += OnUnitySceneLoaded;
            SceneManager.sceneUnloaded += OnUnitySceneUnloaded;

            Log("SceneController initialized");
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                SceneManager.sceneLoaded -= OnUnitySceneLoaded;
                SceneManager.sceneUnloaded -= OnUnitySceneUnloaded;
                _instance = null;
            }
        }

        #endregion

        #region Public API - Scene Loading

        /// <summary>
        /// Load a scene with default settings.
        /// </summary>
        /// <param name="sceneName">Name of the scene to load.</param>
        /// <param name="context">Optional context data to pass to the scene.</param>
        public void LoadScene(string sceneName, object context = null)
        {
            LoadScene(new SceneTransitionRequest
            {
                SceneName = sceneName,
                Context = context,
                UseTransition = true,
                TransitionType = defaultTransitionType,
                AddToStack = true,
                LoadMode = LoadSceneMode.Single
            });
        }

        /// <summary>
        /// Load a scene with a specific transition request.
        /// </summary>
        /// <param name="request">Scene transition request with all parameters.</param>
        public void LoadScene(SceneTransitionRequest request)
        {
            if (_isTransitioning)
            {
                LogWarning($"Scene transition already in progress, ignoring request for {request.SceneName}");
                return;
            }

            if (string.IsNullOrEmpty(request.SceneName))
            {
                LogWarning("Cannot load scene with empty name");
                return;
            }

            StartCoroutine(LoadSceneCoroutine(request));
        }

        /// <summary>
        /// Load a scene additively (overlay).
        /// </summary>
        /// <param name="sceneName">Name of the scene to load additively.</param>
        /// <param name="context">Optional context data.</param>
        public void LoadSceneAdditive(string sceneName, object context = null)
        {
            LoadScene(new SceneTransitionRequest
            {
                SceneName = sceneName,
                Context = context,
                UseTransition = false,
                AddToStack = false,
                LoadMode = LoadSceneMode.Additive
            });
        }

        /// <summary>
        /// Load a scene immediately without transition.
        /// </summary>
        /// <param name="sceneName">Name of the scene to load.</param>
        /// <param name="context">Optional context data.</param>
        public void LoadSceneImmediate(string sceneName, object context = null)
        {
            LoadScene(new SceneTransitionRequest
            {
                SceneName = sceneName,
                Context = context,
                UseTransition = false,
                AddToStack = true,
                LoadMode = LoadSceneMode.Single
            });
        }

        /// <summary>
        /// Unload an additively loaded scene.
        /// </summary>
        /// <param name="sceneName">Name of the scene to unload.</param>
        public void UnloadScene(string sceneName)
        {
            if (!_additiveScenes.Contains(sceneName))
            {
                LogWarning($"Scene {sceneName} is not in additive scenes list");
                return;
            }

            StartCoroutine(UnloadSceneCoroutine(sceneName));
        }

        /// <summary>
        /// Unload all additively loaded scenes.
        /// </summary>
        public void UnloadAllAdditiveScenes()
        {
            foreach (var sceneName in _additiveScenes.ToArray())
            {
                StartCoroutine(UnloadSceneCoroutine(sceneName));
            }
        }

        #endregion

        #region Public API - Navigation

        /// <summary>
        /// Navigate back to the previous scene in the stack.
        /// </summary>
        /// <returns>True if navigation occurred.</returns>
        public bool GoBack()
        {
            if (!CanGoBack)
            {
                LogWarning("Cannot go back - scene stack is empty");
                return false;
            }

            var previousScene = _sceneStack.Pop();
            Log($"Navigating back to: {previousScene}");

            LoadScene(new SceneTransitionRequest
            {
                SceneName = previousScene,
                UseTransition = true,
                TransitionType = defaultTransitionType,
                AddToStack = false // Don't add back to stack when going back
            });

            OnNavigatedBack?.Invoke(this, EventArgs.Empty);
            return true;
        }

        /// <summary>
        /// Clear the navigation stack.
        /// </summary>
        public void ClearStack()
        {
            _sceneStack.Clear();
            Log("Navigation stack cleared");
        }

        /// <summary>
        /// Clear the stack and load a scene (used for major transitions like returning to main menu).
        /// </summary>
        /// <param name="sceneName">Scene to load after clearing stack.</param>
        /// <param name="context">Optional context data.</param>
        public void ResetToScene(string sceneName, object context = null)
        {
            ClearStack();
            LoadScene(new SceneTransitionRequest
            {
                SceneName = sceneName,
                Context = context,
                UseTransition = true,
                TransitionType = TransitionType.Fade,
                AddToStack = false
            });
        }

        #endregion

        #region Public API - Context

        /// <summary>
        /// Get the current scene context as a typed value.
        /// </summary>
        /// <typeparam name="T">Expected type of the context.</typeparam>
        /// <returns>Context cast to type T, or default if not available or wrong type.</returns>
        public T GetContext<T>()
        {
            if (_currentContext is T typedContext)
            {
                return typedContext;
            }
            return default;
        }

        /// <summary>
        /// Set context data for the current scene.
        /// </summary>
        /// <param name="context">Context data to set.</param>
        public void SetContext(object context)
        {
            _currentContext = context;
        }

        #endregion

        #region Scene Loading Coroutines

        private IEnumerator LoadSceneCoroutine(SceneTransitionRequest request)
        {
            _isTransitioning = true;
            _loadingSceneName = request.SceneName;

            string currentScene = CurrentSceneName;
            Log($"Loading scene: {request.SceneName} from {currentScene}");

            OnSceneLoadStarted?.Invoke(this, request.SceneName);
            EventBus.Instance?.Publish("scene_load_started", request.SceneName);

            // Add current scene to stack if requested
            if (request.AddToStack && request.LoadMode == LoadSceneMode.Single)
            {
                _sceneStack.Push(currentScene);
                Log($"Pushed {currentScene} to stack (depth: {_sceneStack.Count})");
            }

            // Start transition out
            if (request.UseTransition && sceneTransition != null)
            {
                yield return StartCoroutine(sceneTransition.TransitionOut(request.TransitionType, defaultTransitionDuration));
            }

            // Show loading screen for longer loads
            float startTime = Time.realtimeSinceStartup;
            bool showLoadingScreen = request.LoadMode == LoadSceneMode.Single && !string.IsNullOrEmpty(loadingSceneName);

            // Load the scene
            AsyncOperation loadOperation;

            if (request.LoadMode == LoadSceneMode.Additive)
            {
                loadOperation = SceneManager.LoadSceneAsync(request.SceneName, LoadSceneMode.Additive);
                if (!_additiveScenes.Contains(request.SceneName))
                {
                    _additiveScenes.Add(request.SceneName);
                }
            }
            else
            {
                loadOperation = SceneManager.LoadSceneAsync(request.SceneName, LoadSceneMode.Single);
            }

            if (loadOperation == null)
            {
                LogWarning($"Failed to start loading scene: {request.SceneName}");
                _isTransitioning = false;
                yield break;
            }

            // Track loading progress
            while (!loadOperation.isDone)
            {
                float progress = Mathf.Clamp01(loadOperation.progress / 0.9f);
                OnLoadingProgress?.Invoke(this, progress);
                yield return null;
            }

            // Ensure minimum loading time
            float elapsedTime = Time.realtimeSinceStartup - startTime;
            if (elapsedTime < minimumLoadingTime)
            {
                yield return new WaitForSecondsRealtime(minimumLoadingTime - elapsedTime);
            }

            // Store context
            _currentContext = request.Context;

            // Complete loading
            OnLoadingProgress?.Invoke(this, 1f);

            // Transition in
            if (request.UseTransition && sceneTransition != null)
            {
                yield return StartCoroutine(sceneTransition.TransitionIn(request.TransitionType, defaultTransitionDuration));
            }

            _isTransitioning = false;
            _loadingSceneName = null;

            Log($"Scene loaded: {request.SceneName}");

            var eventArgs = new SceneChangedEventArgs(currentScene, request.SceneName, request.Context);
            OnSceneLoadCompleted?.Invoke(this, eventArgs);
            EventBus.Instance?.Publish("scene_load_completed", request.SceneName);
        }

        private IEnumerator UnloadSceneCoroutine(string sceneName)
        {
            Log($"Unloading scene: {sceneName}");
            OnSceneUnloadStarted?.Invoke(this, sceneName);

            var unloadOperation = SceneManager.UnloadSceneAsync(sceneName);
            if (unloadOperation != null)
            {
                yield return unloadOperation;
            }

            _additiveScenes.Remove(sceneName);

            Log($"Scene unloaded: {sceneName}");
            OnSceneUnloadCompleted?.Invoke(this, sceneName);
            EventBus.Instance?.Publish("scene_unloaded", sceneName);
        }

        #endregion

        #region Unity Scene Event Handlers

        private void OnUnitySceneLoaded(Scene scene, LoadSceneMode mode)
        {
            Log($"Unity scene loaded: {scene.name} (mode: {mode})");
        }

        private void OnUnitySceneUnloaded(Scene scene)
        {
            Log($"Unity scene unloaded: {scene.name}");
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Check if a scene exists in the build settings.
        /// </summary>
        /// <param name="sceneName">Scene name to check.</param>
        /// <returns>True if the scene exists.</returns>
        public bool SceneExists(string sceneName)
        {
            for (int i = 0; i < SceneManager.sceneCountInBuildSettings; i++)
            {
                string path = SceneUtility.GetScenePathByBuildIndex(i);
                string name = System.IO.Path.GetFileNameWithoutExtension(path);
                if (name == sceneName)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Check if a scene is currently loaded.
        /// </summary>
        /// <param name="sceneName">Scene name to check.</param>
        /// <returns>True if the scene is loaded.</returns>
        public bool IsSceneLoaded(string sceneName)
        {
            for (int i = 0; i < SceneManager.sceneCount; i++)
            {
                if (SceneManager.GetSceneAt(i).name == sceneName)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Get the navigation stack as an array (for debugging).
        /// </summary>
        /// <returns>Array of scene names in the stack.</returns>
        public string[] GetStackContents()
        {
            return _sceneStack.ToArray();
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[SceneController] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[SceneController] {message}");
        }

        #endregion
    }
}
