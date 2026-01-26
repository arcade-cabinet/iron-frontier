// =============================================================================
// PrefabDatabase.cs - Centralized Prefab Loading and Management
// Iron Frontier - Unity 6
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Core
{
    /// <summary>
    /// Configuration entry for a single prefab in the database.
    /// </summary>
    [Serializable]
    public class PrefabEntry
    {
        /// <summary>Unique identifier for the prefab.</summary>
        public string id;

        /// <summary>Display name for the prefab.</summary>
        public string displayName;

        /// <summary>Path to the prefab in Resources folder.</summary>
        public string resourcePath;

        /// <summary>Category for organization.</summary>
        public string category;

        /// <summary>Whether to preload this prefab on startup.</summary>
        public bool preload;

        /// <summary>Maximum instances allowed in pool (0 = unlimited).</summary>
        public int maxPoolSize;

        /// <summary>Tags for filtering and searching.</summary>
        public string[] tags;
    }

    /// <summary>
    /// Root configuration object for the prefab database JSON.
    /// </summary>
    [Serializable]
    public class PrefabConfig
    {
        /// <summary>Version of the config format.</summary>
        public string version;

        /// <summary>List of all prefab entries.</summary>
        public PrefabEntry[] prefabs;
    }

    /// <summary>
    /// Centralized database for loading and managing prefabs by ID.
    /// Supports pooling, preloading, and categorization.
    /// </summary>
    public class PrefabDatabase : MonoBehaviour
    {
        #region Singleton

        private static PrefabDatabase _instance;

        /// <summary>
        /// Global singleton instance of PrefabDatabase.
        /// </summary>
        public static PrefabDatabase Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<PrefabDatabase>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[PrefabDatabase]");
                        _instance = go.AddComponent<PrefabDatabase>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Path to the prefab configuration JSON in Resources")]
        private string configPath = "Data/Prefabs/prefabConfig";

        [SerializeField]
        [Tooltip("Preload prefabs on startup")]
        private bool preloadOnStart = true;

        [Header("Prefab Overrides")]
        [SerializeField]
        [Tooltip("Manually assign prefabs (takes precedence over config)")]
        private PrefabOverride[] prefabOverrides;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private PrefabConfig _config;
        private readonly Dictionary<string, PrefabEntry> _entries = new();
        private readonly Dictionary<string, GameObject> _loadedPrefabs = new();
        private readonly Dictionary<string, Queue<GameObject>> _pools = new();
        private bool _isInitialized;

        #endregion

        #region Properties

        /// <summary>Whether the database is initialized and ready.</summary>
        public bool IsInitialized => _isInitialized;

        /// <summary>Number of prefabs in the database.</summary>
        public int Count => _entries.Count;

        /// <summary>All prefab IDs in the database.</summary>
        public IEnumerable<string> PrefabIds => _entries.Keys;

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

            Initialize();
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
        /// Initialize the prefab database by loading configuration.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            Log("Initializing PrefabDatabase...");

            // Load configuration from JSON
            LoadConfig();

            // Apply manual overrides
            ApplyOverrides();

            // Preload marked prefabs
            if (preloadOnStart)
            {
                PreloadPrefabs();
            }

            _isInitialized = true;
            Log($"PrefabDatabase initialized with {_entries.Count} prefabs");
        }

        private void LoadConfig()
        {
            TextAsset configAsset = Resources.Load<TextAsset>(configPath);

            if (configAsset == null)
            {
                LogWarning($"Prefab config not found at: {configPath}");
                _config = new PrefabConfig { version = "1.0", prefabs = Array.Empty<PrefabEntry>() };
                return;
            }

            try
            {
                _config = JsonUtility.FromJson<PrefabConfig>(configAsset.text);

                if (_config?.prefabs != null)
                {
                    foreach (var entry in _config.prefabs)
                    {
                        if (!string.IsNullOrEmpty(entry.id))
                        {
                            _entries[entry.id] = entry;
                            Log($"Registered prefab: {entry.id} -> {entry.resourcePath}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogWarning($"Failed to parse prefab config: {ex.Message}");
                _config = new PrefabConfig { version = "1.0", prefabs = Array.Empty<PrefabEntry>() };
            }
        }

        private void ApplyOverrides()
        {
            if (prefabOverrides == null) return;

            foreach (var over in prefabOverrides)
            {
                if (string.IsNullOrEmpty(over.id) || over.prefab == null) continue;

                // Cache the prefab directly
                _loadedPrefabs[over.id] = over.prefab;

                // Create or update entry
                if (!_entries.ContainsKey(over.id))
                {
                    _entries[over.id] = new PrefabEntry
                    {
                        id = over.id,
                        displayName = over.prefab.name,
                        resourcePath = "",
                        category = over.category,
                        preload = false,
                        maxPoolSize = over.maxPoolSize
                    };
                }

                Log($"Applied prefab override: {over.id}");
            }
        }

        private void PreloadPrefabs()
        {
            foreach (var entry in _entries.Values)
            {
                if (entry.preload && !_loadedPrefabs.ContainsKey(entry.id))
                {
                    LoadPrefab(entry.id);
                }
            }
        }

        #endregion

        #region Prefab Access

        /// <summary>
        /// Get a prefab by ID.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>The prefab GameObject, or null if not found.</returns>
        public GameObject GetPrefab(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;

            // Check cache first
            if (_loadedPrefabs.TryGetValue(id, out var cached))
            {
                return cached;
            }

            // Load from resources
            return LoadPrefab(id);
        }

        /// <summary>
        /// Load a prefab into the cache.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>The loaded prefab, or null if not found.</returns>
        public GameObject LoadPrefab(string id)
        {
            if (!_entries.TryGetValue(id, out var entry))
            {
                LogWarning($"Prefab entry not found: {id}");
                return null;
            }

            if (string.IsNullOrEmpty(entry.resourcePath))
            {
                LogWarning($"Prefab has no resource path: {id}");
                return null;
            }

            GameObject prefab = Resources.Load<GameObject>(entry.resourcePath);

            if (prefab == null)
            {
                LogWarning($"Failed to load prefab from: {entry.resourcePath}");
                return null;
            }

            _loadedPrefabs[id] = prefab;
            Log($"Loaded prefab: {id} from {entry.resourcePath}");

            return prefab;
        }

        /// <summary>
        /// Check if a prefab exists in the database.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>True if the prefab exists.</returns>
        public bool HasPrefab(string id)
        {
            return _entries.ContainsKey(id) || _loadedPrefabs.ContainsKey(id);
        }

        /// <summary>
        /// Get a prefab entry by ID.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>The prefab entry, or null if not found.</returns>
        public PrefabEntry GetEntry(string id)
        {
            return _entries.TryGetValue(id, out var entry) ? entry : null;
        }

        /// <summary>
        /// Get all prefabs in a category.
        /// </summary>
        /// <param name="category">Category name.</param>
        /// <returns>List of prefab entries in the category.</returns>
        public List<PrefabEntry> GetByCategory(string category)
        {
            var result = new List<PrefabEntry>();

            foreach (var entry in _entries.Values)
            {
                if (entry.category == category)
                {
                    result.Add(entry);
                }
            }

            return result;
        }

        /// <summary>
        /// Get all prefabs with a specific tag.
        /// </summary>
        /// <param name="tag">Tag to search for.</param>
        /// <returns>List of prefab entries with the tag.</returns>
        public List<PrefabEntry> GetByTag(string tag)
        {
            var result = new List<PrefabEntry>();

            foreach (var entry in _entries.Values)
            {
                if (entry.tags != null && Array.IndexOf(entry.tags, tag) >= 0)
                {
                    result.Add(entry);
                }
            }

            return result;
        }

        #endregion

        #region Instantiation

        /// <summary>
        /// Instantiate a prefab by ID.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>Instantiated GameObject, or null if failed.</returns>
        public GameObject Instantiate(string id)
        {
            var prefab = GetPrefab(id);
            return prefab != null ? UnityEngine.Object.Instantiate(prefab) : null;
        }

        /// <summary>
        /// Instantiate a prefab by ID at a position.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <param name="position">World position.</param>
        /// <param name="rotation">World rotation.</param>
        /// <returns>Instantiated GameObject, or null if failed.</returns>
        public GameObject Instantiate(string id, Vector3 position, Quaternion rotation)
        {
            var prefab = GetPrefab(id);
            return prefab != null ? UnityEngine.Object.Instantiate(prefab, position, rotation) : null;
        }

        /// <summary>
        /// Instantiate a prefab by ID as a child of a parent.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <param name="parent">Parent transform.</param>
        /// <returns>Instantiated GameObject, or null if failed.</returns>
        public GameObject Instantiate(string id, Transform parent)
        {
            var prefab = GetPrefab(id);
            return prefab != null ? UnityEngine.Object.Instantiate(prefab, parent) : null;
        }

        /// <summary>
        /// Instantiate a prefab and get a component.
        /// </summary>
        /// <typeparam name="T">Component type to get.</typeparam>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>Component instance, or null if failed.</returns>
        public T Instantiate<T>(string id) where T : Component
        {
            var instance = Instantiate(id);
            return instance?.GetComponent<T>();
        }

        /// <summary>
        /// Instantiate a prefab at position and get a component.
        /// </summary>
        /// <typeparam name="T">Component type to get.</typeparam>
        /// <param name="id">Prefab identifier.</param>
        /// <param name="position">World position.</param>
        /// <param name="rotation">World rotation.</param>
        /// <returns>Component instance, or null if failed.</returns>
        public T Instantiate<T>(string id, Vector3 position, Quaternion rotation) where T : Component
        {
            var instance = Instantiate(id, position, rotation);
            return instance?.GetComponent<T>();
        }

        #endregion

        #region Object Pooling

        /// <summary>
        /// Get an instance from the pool, or create one if pool is empty.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <returns>Pooled or new GameObject instance.</returns>
        public GameObject GetPooled(string id)
        {
            return GetPooled(id, Vector3.zero, Quaternion.identity);
        }

        /// <summary>
        /// Get an instance from the pool at a position.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <param name="position">World position.</param>
        /// <param name="rotation">World rotation.</param>
        /// <returns>Pooled or new GameObject instance.</returns>
        public GameObject GetPooled(string id, Vector3 position, Quaternion rotation)
        {
            if (!_pools.TryGetValue(id, out var pool))
            {
                pool = new Queue<GameObject>();
                _pools[id] = pool;
            }

            GameObject instance;

            if (pool.Count > 0)
            {
                instance = pool.Dequeue();
                instance.transform.position = position;
                instance.transform.rotation = rotation;
                instance.SetActive(true);
                Log($"Retrieved {id} from pool ({pool.Count} remaining)");
            }
            else
            {
                instance = Instantiate(id, position, rotation);
                Log($"Created new {id} (pool empty)");
            }

            return instance;
        }

        /// <summary>
        /// Return an instance to the pool.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <param name="instance">Instance to return.</param>
        public void ReturnToPool(string id, GameObject instance)
        {
            if (instance == null) return;

            if (!_pools.TryGetValue(id, out var pool))
            {
                pool = new Queue<GameObject>();
                _pools[id] = pool;
            }

            // Check max pool size
            var entry = GetEntry(id);
            if (entry != null && entry.maxPoolSize > 0 && pool.Count >= entry.maxPoolSize)
            {
                Destroy(instance);
                Log($"Pool for {id} is full, destroyed instance");
                return;
            }

            instance.SetActive(false);
            pool.Enqueue(instance);
            Log($"Returned {id} to pool ({pool.Count} total)");
        }

        /// <summary>
        /// Clear all pooled instances for a prefab.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        public void ClearPool(string id)
        {
            if (!_pools.TryGetValue(id, out var pool)) return;

            while (pool.Count > 0)
            {
                var instance = pool.Dequeue();
                if (instance != null)
                {
                    Destroy(instance);
                }
            }

            Log($"Cleared pool for {id}");
        }

        /// <summary>
        /// Clear all object pools.
        /// </summary>
        public void ClearAllPools()
        {
            foreach (var id in _pools.Keys)
            {
                ClearPool(id);
            }

            _pools.Clear();
            Log("Cleared all object pools");
        }

        /// <summary>
        /// Pre-warm a pool with instances.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        /// <param name="count">Number of instances to create.</param>
        public void WarmPool(string id, int count)
        {
            if (!_pools.TryGetValue(id, out var pool))
            {
                pool = new Queue<GameObject>();
                _pools[id] = pool;
            }

            var prefab = GetPrefab(id);
            if (prefab == null) return;

            for (int i = 0; i < count; i++)
            {
                var instance = UnityEngine.Object.Instantiate(prefab);
                instance.SetActive(false);
                pool.Enqueue(instance);
            }

            Log($"Warmed pool for {id} with {count} instances");
        }

        #endregion

        #region Registration

        /// <summary>
        /// Register a prefab at runtime.
        /// </summary>
        /// <param name="id">Unique identifier.</param>
        /// <param name="prefab">Prefab GameObject.</param>
        /// <param name="category">Optional category.</param>
        public void RegisterPrefab(string id, GameObject prefab, string category = "Runtime")
        {
            if (string.IsNullOrEmpty(id) || prefab == null) return;

            _loadedPrefabs[id] = prefab;

            if (!_entries.ContainsKey(id))
            {
                _entries[id] = new PrefabEntry
                {
                    id = id,
                    displayName = prefab.name,
                    resourcePath = "",
                    category = category,
                    preload = false,
                    maxPoolSize = 0
                };
            }

            Log($"Registered runtime prefab: {id}");
        }

        /// <summary>
        /// Unregister a prefab.
        /// </summary>
        /// <param name="id">Prefab identifier.</param>
        public void UnregisterPrefab(string id)
        {
            _entries.Remove(id);
            _loadedPrefabs.Remove(id);
            ClearPool(id);

            Log($"Unregistered prefab: {id}");
        }

        #endregion

        #region Debug

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[PrefabDatabase] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[PrefabDatabase] {message}");
        }

        #endregion
    }

    /// <summary>
    /// Inspector-friendly prefab override entry.
    /// </summary>
    [Serializable]
    public class PrefabOverride
    {
        /// <summary>Unique identifier.</summary>
        public string id;

        /// <summary>Category for organization.</summary>
        public string category;

        /// <summary>Direct prefab reference.</summary>
        public GameObject prefab;

        /// <summary>Max pool size for this prefab.</summary>
        public int maxPoolSize;
    }
}
