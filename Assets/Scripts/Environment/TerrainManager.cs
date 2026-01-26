using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;
using IronFrontier.Systems;

namespace IronFrontier.Environment
{
    /// <summary>
    /// Terrain LOD level for performance optimization.
    /// </summary>
    public enum TerrainLODLevel
    {
        /// <summary>Full detail, closest distance.</summary>
        High,
        /// <summary>Medium detail, mid-range.</summary>
        Medium,
        /// <summary>Low detail, far distance.</summary>
        Low,
        /// <summary>Minimum detail, very far or background.</summary>
        VeryLow
    }

    /// <summary>
    /// Configuration for biome blending.
    /// </summary>
    [Serializable]
    public class BiomeBlendConfig
    {
        /// <summary>Primary biome type.</summary>
        public BiomeType primaryBiome;

        /// <summary>Secondary biome for blending.</summary>
        public BiomeType secondaryBiome;

        /// <summary>Blend factor (0-1, 0 = all primary, 1 = all secondary).</summary>
        [Range(0f, 1f)]
        public float blendFactor;

        /// <summary>Noise scale for organic blending.</summary>
        [Range(0.01f, 1f)]
        public float noiseScale = 0.1f;
    }

    /// <summary>
    /// Terrain chunk data for streaming/LOD management.
    /// </summary>
    [Serializable]
    public class TerrainChunkData
    {
        /// <summary>Chunk coordinates in the world grid.</summary>
        public Vector2Int coordinates;

        /// <summary>Chunk world position.</summary>
        public Vector3 worldPosition;

        /// <summary>Current LOD level.</summary>
        public TerrainLODLevel currentLOD;

        /// <summary>Whether this chunk is currently loaded.</summary>
        public bool isLoaded;

        /// <summary>Distance from camera.</summary>
        public float distanceFromCamera;

        /// <summary>Last frame this chunk was visible.</summary>
        public int lastVisibleFrame;

        /// <summary>Associated terrain component.</summary>
        public Terrain terrain;

        /// <summary>Biome data for this chunk.</summary>
        public BiomeType biome;
    }

    /// <summary>
    /// Event arguments for terrain loading events.
    /// </summary>
    public class TerrainLoadedEventArgs : EventArgs
    {
        /// <summary>The loaded chunk data.</summary>
        public TerrainChunkData ChunkData { get; }

        public TerrainLoadedEventArgs(TerrainChunkData data)
        {
            ChunkData = data;
        }
    }

    /// <summary>
    /// Manages terrain loading, LOD, and biome blending for the game world.
    /// Handles Unity Terrain system with streaming support for large worlds.
    /// </summary>
    /// <remarks>
    /// Features:
    /// - Terrain data loading from ScriptableObjects or procedural generation
    /// - Biome-based texture blending with smooth transitions
    /// - LOD management for performance optimization
    /// - Terrain streaming for large open worlds
    /// - Integration with WeatherSystem for environmental effects
    /// </remarks>
    public class TerrainManager : MonoBehaviour
    {
        #region Singleton

        private static TerrainManager _instance;

        /// <summary>
        /// Global singleton instance of TerrainManager.
        /// </summary>
        public static TerrainManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<TerrainManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[TerrainManager]");
                        _instance = go.AddComponent<TerrainManager>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when a terrain chunk is loaded.</summary>
        public event EventHandler<TerrainLoadedEventArgs> OnChunkLoaded;

        /// <summary>Fired when a terrain chunk is unloaded.</summary>
        public event EventHandler<TerrainLoadedEventArgs> OnChunkUnloaded;

        /// <summary>Fired when biome changes.</summary>
        public event EventHandler<BiomeType> OnBiomeChanged;

        #endregion

        #region Configuration

        [Header("Terrain Settings")]
        [SerializeField]
        [Tooltip("Size of each terrain chunk in world units")]
        private float chunkSize = 256f;

        [SerializeField]
        [Tooltip("Heightmap resolution per chunk")]
        private int heightmapResolution = 513;

        [SerializeField]
        [Tooltip("Detail resolution per chunk")]
        private int detailResolution = 512;

        [SerializeField]
        [Tooltip("Base map resolution")]
        private int baseMapResolution = 1024;

        [SerializeField]
        [Tooltip("Maximum terrain height")]
        private float terrainHeight = 200f;

        [Header("LOD Settings")]
        [SerializeField]
        [Tooltip("Distance thresholds for LOD transitions")]
        private float[] lodDistances = { 100f, 250f, 500f, 1000f };

        [SerializeField]
        [Tooltip("Update LOD every N frames")]
        private int lodUpdateInterval = 10;

        [SerializeField]
        [Tooltip("Maximum chunks to keep loaded")]
        private int maxLoadedChunks = 16;

        [Header("Streaming")]
        [SerializeField]
        [Tooltip("Radius of chunks to keep loaded around camera")]
        private int loadRadius = 2;

        [SerializeField]
        [Tooltip("Enable terrain streaming")]
        private bool enableStreaming = true;

        [Header("Biome Settings")]
        [SerializeField]
        [Tooltip("Default biome type")]
        private BiomeType defaultBiome = BiomeType.Plains;

        [SerializeField]
        [Tooltip("Biome blend configurations")]
        private List<BiomeBlendConfig> biomeBlends = new List<BiomeBlendConfig>();

        [Header("Terrain Layers")]
        [SerializeField]
        [Tooltip("Desert ground terrain layer")]
        private TerrainLayer desertLayer;

        [SerializeField]
        [Tooltip("Grassland terrain layer")]
        private TerrainLayer grassLayer;

        [SerializeField]
        [Tooltip("Badlands terrain layer")]
        private TerrainLayer badlandsLayer;

        [SerializeField]
        [Tooltip("Town ground terrain layer")]
        private TerrainLayer townLayer;

        [SerializeField]
        [Tooltip("Rock/cliff terrain layer")]
        private TerrainLayer rockLayer;

        [Header("References")]
        [SerializeField]
        [Tooltip("Camera for LOD calculations (auto-finds main camera if null)")]
        private Camera targetCamera;

        [SerializeField]
        [Tooltip("Parent transform for terrain chunks")]
        private Transform terrainParent;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        [SerializeField]
        private bool showChunkBounds = false;

        #endregion

        #region State

        private Dictionary<Vector2Int, TerrainChunkData> _loadedChunks;
        private Queue<TerrainChunkData> _unloadQueue;
        private BiomeType _currentBiome;
        private int _frameCounter = 0;
        private bool _isInitialized = false;
        private Vector2Int _lastCameraChunk;

        // Cached terrain layer array for chunk creation
        private TerrainLayer[] _terrainLayers;

        #endregion

        #region Properties

        /// <summary>Current biome at camera position.</summary>
        public BiomeType CurrentBiome => _currentBiome;

        /// <summary>Number of currently loaded chunks.</summary>
        public int LoadedChunkCount => _loadedChunks?.Count ?? 0;

        /// <summary>Size of each terrain chunk.</summary>
        public float ChunkSize => chunkSize;

        /// <summary>Maximum terrain height.</summary>
        public float MaxHeight => terrainHeight;

        /// <summary>Whether the manager is initialized.</summary>
        public bool IsInitialized => _isInitialized;

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

            _loadedChunks = new Dictionary<Vector2Int, TerrainChunkData>();
            _unloadQueue = new Queue<TerrainChunkData>();

            Log("TerrainManager awakened");
        }

        private void Start()
        {
            Initialize();
        }

        private void Update()
        {
            if (!_isInitialized) return;

            _frameCounter++;

            // Update LOD periodically
            if (_frameCounter % lodUpdateInterval == 0)
            {
                UpdateLOD();
            }

            // Update streaming
            if (enableStreaming && _frameCounter % (lodUpdateInterval * 2) == 0)
            {
                UpdateStreaming();
            }
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                UnloadAllChunks();
                _instance = null;
            }
        }

        private void OnDrawGizmos()
        {
            if (!showChunkBounds || _loadedChunks == null) return;

            foreach (var chunk in _loadedChunks.Values)
            {
                Color color = chunk.currentLOD switch
                {
                    TerrainLODLevel.High => Color.green,
                    TerrainLODLevel.Medium => Color.yellow,
                    TerrainLODLevel.Low => Color.red,
                    _ => Color.gray
                };

                Gizmos.color = color;
                Gizmos.DrawWireCube(
                    chunk.worldPosition + new Vector3(chunkSize / 2, terrainHeight / 2, chunkSize / 2),
                    new Vector3(chunkSize, terrainHeight, chunkSize)
                );
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the terrain manager.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            Log("Initializing TerrainManager...");

            // Find camera if not assigned
            if (targetCamera == null)
            {
                targetCamera = Camera.main;
            }

            // Create terrain parent if needed
            if (terrainParent == null)
            {
                var parentGO = new GameObject("Terrain");
                terrainParent = parentGO.transform;
                terrainParent.SetParent(transform);
            }

            // Build terrain layer array
            BuildTerrainLayerArray();

            // Set default biome
            _currentBiome = defaultBiome;

            // Subscribe to weather changes
            if (WeatherSystem.Instance != null)
            {
                WeatherSystem.Instance.OnWeatherChanged += OnWeatherChanged;
            }

            _isInitialized = true;
            Log("TerrainManager initialized");
        }

        private void BuildTerrainLayerArray()
        {
            var layers = new List<TerrainLayer>();

            if (desertLayer != null) layers.Add(desertLayer);
            if (grassLayer != null) layers.Add(grassLayer);
            if (badlandsLayer != null) layers.Add(badlandsLayer);
            if (townLayer != null) layers.Add(townLayer);
            if (rockLayer != null) layers.Add(rockLayer);

            _terrainLayers = layers.ToArray();
        }

        #endregion

        #region Terrain Loading

        /// <summary>
        /// Load terrain data for a location.
        /// </summary>
        /// <param name="locationData">Location to load terrain for.</param>
        public void LoadLocationTerrain(LocationData locationData)
        {
            if (locationData == null)
            {
                LogWarning("Cannot load terrain for null location");
                return;
            }

            Log($"Loading terrain for location: {locationData.displayName}");

            // Clear existing terrain
            UnloadAllChunks();

            // Determine biome from location
            _currentBiome = DetermineBiomeFromTerrain(locationData.baseTerrain);
            OnBiomeChanged?.Invoke(this, _currentBiome);

            // Calculate chunks needed
            int chunksX = Mathf.CeilToInt(locationData.width / chunkSize);
            int chunksZ = Mathf.CeilToInt(locationData.height / chunkSize);

            // Load all chunks for the location
            for (int x = 0; x < chunksX; x++)
            {
                for (int z = 0; z < chunksZ; z++)
                {
                    LoadChunk(new Vector2Int(x, z), locationData);
                }
            }

            Log($"Loaded {_loadedChunks.Count} terrain chunks");
        }

        /// <summary>
        /// Load a specific terrain chunk.
        /// </summary>
        /// <param name="coordinates">Chunk coordinates.</param>
        /// <param name="locationData">Optional location data for generation.</param>
        public void LoadChunk(Vector2Int coordinates, LocationData locationData = null)
        {
            if (_loadedChunks.ContainsKey(coordinates))
            {
                Log($"Chunk {coordinates} already loaded");
                return;
            }

            Log($"Loading chunk: {coordinates}");

            // Create chunk data
            var chunkData = new TerrainChunkData
            {
                coordinates = coordinates,
                worldPosition = new Vector3(
                    coordinates.x * chunkSize,
                    0f,
                    coordinates.y * chunkSize
                ),
                currentLOD = TerrainLODLevel.High,
                isLoaded = false,
                biome = _currentBiome
            };

            // Create terrain game object
            var terrainGO = CreateTerrainObject(chunkData, locationData);
            chunkData.terrain = terrainGO.GetComponent<Terrain>();
            chunkData.isLoaded = true;

            // Add to loaded chunks
            _loadedChunks[coordinates] = chunkData;

            // Fire event
            OnChunkLoaded?.Invoke(this, new TerrainLoadedEventArgs(chunkData));
        }

        /// <summary>
        /// Unload a specific terrain chunk.
        /// </summary>
        /// <param name="coordinates">Chunk coordinates to unload.</param>
        public void UnloadChunk(Vector2Int coordinates)
        {
            if (!_loadedChunks.TryGetValue(coordinates, out var chunkData))
            {
                return;
            }

            Log($"Unloading chunk: {coordinates}");

            // Destroy terrain object
            if (chunkData.terrain != null)
            {
                Destroy(chunkData.terrain.gameObject);
            }

            _loadedChunks.Remove(coordinates);

            // Fire event
            OnChunkUnloaded?.Invoke(this, new TerrainLoadedEventArgs(chunkData));
        }

        /// <summary>
        /// Unload all terrain chunks.
        /// </summary>
        public void UnloadAllChunks()
        {
            var chunksToUnload = new List<Vector2Int>(_loadedChunks.Keys);
            foreach (var coord in chunksToUnload)
            {
                UnloadChunk(coord);
            }

            _loadedChunks.Clear();
            Log("All chunks unloaded");
        }

        private GameObject CreateTerrainObject(TerrainChunkData chunkData, LocationData locationData)
        {
            // Create terrain data
            var terrainData = new TerrainData
            {
                heightmapResolution = heightmapResolution,
                size = new Vector3(chunkSize, terrainHeight, chunkSize),
                baseMapResolution = baseMapResolution
            };

            // Set detail resolution
            terrainData.SetDetailResolution(detailResolution, 16);

            // Apply terrain layers
            if (_terrainLayers != null && _terrainLayers.Length > 0)
            {
                terrainData.terrainLayers = _terrainLayers;
            }

            // Generate heightmap
            GenerateHeightmap(terrainData, chunkData, locationData);

            // Generate splatmaps for biome blending
            GenerateSplatmap(terrainData, chunkData);

            // Create terrain game object
            var terrainGO = Terrain.CreateTerrainGameObject(terrainData);
            terrainGO.name = $"Terrain_Chunk_{chunkData.coordinates.x}_{chunkData.coordinates.y}";
            terrainGO.transform.SetParent(terrainParent);
            terrainGO.transform.position = chunkData.worldPosition;

            // Configure terrain component
            var terrain = terrainGO.GetComponent<Terrain>();
            terrain.heightmapPixelError = 5f;
            terrain.basemapDistance = 1000f;
            terrain.drawInstanced = true;

            // Add collider
            var collider = terrainGO.GetComponent<TerrainCollider>();
            if (collider == null)
            {
                collider = terrainGO.AddComponent<TerrainCollider>();
            }
            collider.terrainData = terrainData;

            return terrainGO;
        }

        #endregion

        #region Heightmap Generation

        private void GenerateHeightmap(TerrainData terrainData, TerrainChunkData chunkData, LocationData locationData)
        {
            int resolution = terrainData.heightmapResolution;
            float[,] heights = new float[resolution, resolution];

            // Get seed from location or use chunk coordinates
            int seed = locationData?.seed ?? (chunkData.coordinates.x * 1000 + chunkData.coordinates.y);
            var rng = new System.Random(seed);

            // Base noise parameters
            float frequency = 0.01f;
            float amplitude = 0.3f;
            int octaves = 4;
            float lacunarity = 2f;
            float persistence = 0.5f;

            // Biome-specific height modifiers
            float baseHeight = GetBiomeBaseHeight(chunkData.biome);
            float heightVariation = GetBiomeHeightVariation(chunkData.biome);

            for (int z = 0; z < resolution; z++)
            {
                for (int x = 0; x < resolution; x++)
                {
                    // World coordinates
                    float worldX = chunkData.worldPosition.x + (x / (float)resolution) * chunkSize;
                    float worldZ = chunkData.worldPosition.z + (z / (float)resolution) * chunkSize;

                    // Generate multi-octave Perlin noise
                    float height = 0f;
                    float freq = frequency;
                    float amp = amplitude;

                    for (int o = 0; o < octaves; o++)
                    {
                        float sampleX = worldX * freq;
                        float sampleZ = worldZ * freq;
                        float perlin = Mathf.PerlinNoise(sampleX, sampleZ);
                        height += perlin * amp;

                        freq *= lacunarity;
                        amp *= persistence;
                    }

                    // Apply biome modifiers
                    height = baseHeight + height * heightVariation;

                    // Clamp to valid range
                    heights[z, x] = Mathf.Clamp01(height);
                }
            }

            terrainData.SetHeights(0, 0, heights);
        }

        private float GetBiomeBaseHeight(BiomeType biome)
        {
            return biome switch
            {
                BiomeType.Desert => 0.1f,
                BiomeType.Mountains => 0.3f,
                BiomeType.Plains => 0.15f,
                BiomeType.Canyon => 0.2f,
                BiomeType.Badlands => 0.2f,
                BiomeType.Riverside => 0.08f,
                BiomeType.Forest => 0.12f,
                _ => 0.1f
            };
        }

        private float GetBiomeHeightVariation(BiomeType biome)
        {
            return biome switch
            {
                BiomeType.Desert => 0.3f,
                BiomeType.Mountains => 0.7f,
                BiomeType.Plains => 0.2f,
                BiomeType.Canyon => 0.5f,
                BiomeType.Badlands => 0.4f,
                BiomeType.Riverside => 0.15f,
                BiomeType.Forest => 0.25f,
                _ => 0.3f
            };
        }

        #endregion

        #region Splatmap / Biome Blending

        private void GenerateSplatmap(TerrainData terrainData, TerrainChunkData chunkData)
        {
            if (_terrainLayers == null || _terrainLayers.Length == 0)
            {
                Log("No terrain layers configured, skipping splatmap generation");
                return;
            }

            int alphamapRes = terrainData.alphamapResolution;
            int layerCount = _terrainLayers.Length;
            float[,,] splatmaps = new float[alphamapRes, alphamapRes, layerCount];

            // Get layer indices for biome
            int primaryLayer = GetPrimaryLayerForBiome(chunkData.biome);
            int secondaryLayer = GetSecondaryLayerForBiome(chunkData.biome);

            for (int z = 0; z < alphamapRes; z++)
            {
                for (int x = 0; x < alphamapRes; x++)
                {
                    // World coordinates
                    float worldX = chunkData.worldPosition.x + (x / (float)alphamapRes) * chunkSize;
                    float worldZ = chunkData.worldPosition.z + (z / (float)alphamapRes) * chunkSize;

                    // Get normalized height for slope-based blending
                    float normalizedX = x / (float)alphamapRes;
                    float normalizedZ = z / (float)alphamapRes;
                    float height = terrainData.GetInterpolatedHeight(normalizedX, normalizedZ) / terrainHeight;

                    // Get slope for rock/cliff placement
                    float steepness = terrainData.GetSteepness(normalizedX, normalizedZ) / 90f;

                    // Biome blend noise
                    float blendNoise = Mathf.PerlinNoise(worldX * 0.02f, worldZ * 0.02f);

                    // Calculate weights
                    float[] weights = new float[layerCount];

                    // Primary biome layer
                    if (primaryLayer >= 0 && primaryLayer < layerCount)
                    {
                        weights[primaryLayer] = 0.7f + blendNoise * 0.2f;
                    }

                    // Secondary layer for variety
                    if (secondaryLayer >= 0 && secondaryLayer < layerCount && secondaryLayer != primaryLayer)
                    {
                        weights[secondaryLayer] = 0.2f + (1f - blendNoise) * 0.15f;
                    }

                    // Rock layer on steep slopes
                    int rockLayerIndex = GetLayerIndex("rock");
                    if (rockLayerIndex >= 0 && rockLayerIndex < layerCount && steepness > 0.3f)
                    {
                        float rockWeight = Mathf.Clamp01((steepness - 0.3f) * 2f);
                        weights[rockLayerIndex] = rockWeight;

                        // Reduce other weights
                        for (int i = 0; i < layerCount; i++)
                        {
                            if (i != rockLayerIndex)
                            {
                                weights[i] *= (1f - rockWeight);
                            }
                        }
                    }

                    // Normalize weights
                    float totalWeight = 0f;
                    for (int i = 0; i < layerCount; i++)
                    {
                        totalWeight += weights[i];
                    }

                    if (totalWeight > 0f)
                    {
                        for (int i = 0; i < layerCount; i++)
                        {
                            splatmaps[z, x, i] = weights[i] / totalWeight;
                        }
                    }
                    else
                    {
                        // Fallback to primary layer
                        if (primaryLayer >= 0 && primaryLayer < layerCount)
                        {
                            splatmaps[z, x, primaryLayer] = 1f;
                        }
                    }
                }
            }

            terrainData.SetAlphamaps(0, 0, splatmaps);
        }

        private int GetPrimaryLayerForBiome(BiomeType biome)
        {
            return biome switch
            {
                BiomeType.Desert => GetLayerIndex("desert"),
                BiomeType.Mountains => GetLayerIndex("rock"),
                BiomeType.Plains => GetLayerIndex("grass"),
                BiomeType.Canyon => GetLayerIndex("badlands"),
                BiomeType.Badlands => GetLayerIndex("badlands"),
                BiomeType.Riverside => GetLayerIndex("grass"),
                BiomeType.Forest => GetLayerIndex("grass"),
                _ => 0
            };
        }

        private int GetSecondaryLayerForBiome(BiomeType biome)
        {
            return biome switch
            {
                BiomeType.Desert => GetLayerIndex("badlands"),
                BiomeType.Mountains => GetLayerIndex("grass"),
                BiomeType.Plains => GetLayerIndex("desert"),
                BiomeType.Canyon => GetLayerIndex("rock"),
                BiomeType.Badlands => GetLayerIndex("desert"),
                BiomeType.Riverside => GetLayerIndex("town"),
                BiomeType.Forest => GetLayerIndex("badlands"),
                _ => 1
            };
        }

        private int GetLayerIndex(string layerName)
        {
            if (_terrainLayers == null) return -1;

            for (int i = 0; i < _terrainLayers.Length; i++)
            {
                if (_terrainLayers[i] != null && _terrainLayers[i].name.ToLower().Contains(layerName))
                {
                    return i;
                }
            }
            return -1;
        }

        private BiomeType DetermineBiomeFromTerrain(TerrainType terrainType)
        {
            return terrainType switch
            {
                TerrainType.Grass or TerrainType.GrassHill or TerrainType.GrassForest => BiomeType.Plains,
                TerrainType.Sand or TerrainType.SandHill or TerrainType.SandDunes => BiomeType.Desert,
                TerrainType.Stone or TerrainType.StoneHill or TerrainType.StoneMountain or TerrainType.StoneRocks => BiomeType.Mountains,
                TerrainType.Water or TerrainType.WaterShallow or TerrainType.WaterDeep => BiomeType.Riverside,
                TerrainType.Mesa or TerrainType.Canyon => BiomeType.Canyon,
                TerrainType.Badlands => BiomeType.Badlands,
                _ => BiomeType.Plains
            };
        }

        #endregion

        #region LOD Management

        private void UpdateLOD()
        {
            if (targetCamera == null) return;

            Vector3 cameraPos = targetCamera.transform.position;

            foreach (var chunk in _loadedChunks.Values)
            {
                // Calculate distance to camera
                Vector3 chunkCenter = chunk.worldPosition + new Vector3(chunkSize / 2, 0, chunkSize / 2);
                chunk.distanceFromCamera = Vector3.Distance(cameraPos, chunkCenter);

                // Determine appropriate LOD
                TerrainLODLevel newLOD = DetermineLODLevel(chunk.distanceFromCamera);

                if (newLOD != chunk.currentLOD)
                {
                    ApplyLOD(chunk, newLOD);
                }
            }
        }

        private TerrainLODLevel DetermineLODLevel(float distance)
        {
            if (distance < lodDistances[0]) return TerrainLODLevel.High;
            if (distance < lodDistances[1]) return TerrainLODLevel.Medium;
            if (distance < lodDistances[2]) return TerrainLODLevel.Low;
            return TerrainLODLevel.VeryLow;
        }

        private void ApplyLOD(TerrainChunkData chunk, TerrainLODLevel newLOD)
        {
            if (chunk.terrain == null) return;

            chunk.currentLOD = newLOD;

            // Adjust terrain settings based on LOD
            float pixelError = newLOD switch
            {
                TerrainLODLevel.High => 1f,
                TerrainLODLevel.Medium => 5f,
                TerrainLODLevel.Low => 10f,
                TerrainLODLevel.VeryLow => 20f,
                _ => 5f
            };

            chunk.terrain.heightmapPixelError = pixelError;

            // Adjust detail distance
            float detailDistance = newLOD switch
            {
                TerrainLODLevel.High => 250f,
                TerrainLODLevel.Medium => 150f,
                TerrainLODLevel.Low => 50f,
                TerrainLODLevel.VeryLow => 0f,
                _ => 100f
            };

            chunk.terrain.detailObjectDistance = detailDistance;

            Log($"Chunk {chunk.coordinates} LOD changed to {newLOD}");
        }

        #endregion

        #region Streaming

        private void UpdateStreaming()
        {
            if (targetCamera == null) return;

            // Get camera chunk position
            Vector3 cameraPos = targetCamera.transform.position;
            Vector2Int cameraChunk = WorldToChunkCoord(cameraPos);

            // Skip if camera hasn't moved to new chunk
            if (cameraChunk == _lastCameraChunk) return;
            _lastCameraChunk = cameraChunk;

            // Determine chunks that should be loaded
            var chunksToLoad = new HashSet<Vector2Int>();
            for (int x = -loadRadius; x <= loadRadius; x++)
            {
                for (int z = -loadRadius; z <= loadRadius; z++)
                {
                    chunksToLoad.Add(new Vector2Int(cameraChunk.x + x, cameraChunk.y + z));
                }
            }

            // Unload chunks outside radius
            var chunksToUnload = new List<Vector2Int>();
            foreach (var coord in _loadedChunks.Keys)
            {
                if (!chunksToLoad.Contains(coord))
                {
                    chunksToUnload.Add(coord);
                }
            }

            foreach (var coord in chunksToUnload)
            {
                _unloadQueue.Enqueue(_loadedChunks[coord]);
            }

            // Process unload queue
            while (_unloadQueue.Count > 0 && _loadedChunks.Count > maxLoadedChunks)
            {
                var chunk = _unloadQueue.Dequeue();
                UnloadChunk(chunk.coordinates);
            }

            // Load new chunks
            foreach (var coord in chunksToLoad)
            {
                if (!_loadedChunks.ContainsKey(coord))
                {
                    LoadChunk(coord);
                }
            }
        }

        /// <summary>
        /// Convert world position to chunk coordinates.
        /// </summary>
        public Vector2Int WorldToChunkCoord(Vector3 worldPos)
        {
            return new Vector2Int(
                Mathf.FloorToInt(worldPos.x / chunkSize),
                Mathf.FloorToInt(worldPos.z / chunkSize)
            );
        }

        /// <summary>
        /// Convert chunk coordinates to world position.
        /// </summary>
        public Vector3 ChunkToWorldPos(Vector2Int chunkCoord)
        {
            return new Vector3(
                chunkCoord.x * chunkSize,
                0f,
                chunkCoord.y * chunkSize
            );
        }

        #endregion

        #region Biome Management

        /// <summary>
        /// Set the current biome and update terrain accordingly.
        /// </summary>
        /// <param name="biome">New biome type.</param>
        public void SetBiome(BiomeType biome)
        {
            if (_currentBiome == biome) return;

            Log($"Changing biome from {_currentBiome} to {biome}");
            _currentBiome = biome;

            // Update weather system
            WeatherSystem.Instance?.SetBiome(biome);

            // Fire event
            OnBiomeChanged?.Invoke(this, biome);
        }

        /// <summary>
        /// Get biome at a world position.
        /// </summary>
        public BiomeType GetBiomeAt(Vector3 worldPos)
        {
            Vector2Int chunkCoord = WorldToChunkCoord(worldPos);
            if (_loadedChunks.TryGetValue(chunkCoord, out var chunk))
            {
                return chunk.biome;
            }
            return _currentBiome;
        }

        #endregion

        #region Weather Integration

        private void OnWeatherChanged(object sender, WeatherChangedEventArgs args)
        {
            // Update terrain appearance based on weather
            // For example, wet terrain during rain, snow accumulation, etc.
            UpdateTerrainForWeather(args.NewWeather, args.Severity);
        }

        private void UpdateTerrainForWeather(WeatherType weather, WeatherSeverity severity)
        {
            // Adjust terrain material properties based on weather
            // This would typically modify shader parameters
            foreach (var chunk in _loadedChunks.Values)
            {
                if (chunk.terrain == null) continue;

                // Adjust material properties
                // Note: Requires custom terrain shader for weather effects
                var material = chunk.terrain.materialTemplate;
                if (material != null)
                {
                    float wetness = weather == WeatherType.Rain || weather == WeatherType.Thunderstorm
                        ? 0.5f + (int)severity * 0.15f
                        : 0f;

                    // Set wetness if shader supports it
                    if (material.HasProperty("_Wetness"))
                    {
                        material.SetFloat("_Wetness", wetness);
                    }
                }
            }
        }

        #endregion

        #region Utility

        /// <summary>
        /// Get terrain height at world position.
        /// </summary>
        public float GetHeightAt(Vector3 worldPos)
        {
            Vector2Int chunkCoord = WorldToChunkCoord(worldPos);
            if (_loadedChunks.TryGetValue(chunkCoord, out var chunk) && chunk.terrain != null)
            {
                return chunk.terrain.SampleHeight(worldPos);
            }
            return 0f;
        }

        /// <summary>
        /// Get terrain normal at world position.
        /// </summary>
        public Vector3 GetNormalAt(Vector3 worldPos)
        {
            Vector2Int chunkCoord = WorldToChunkCoord(worldPos);
            if (_loadedChunks.TryGetValue(chunkCoord, out var chunk) && chunk.terrain != null)
            {
                var terrainData = chunk.terrain.terrainData;
                Vector3 localPos = worldPos - chunk.worldPosition;
                float normalizedX = localPos.x / terrainData.size.x;
                float normalizedZ = localPos.z / terrainData.size.z;
                return terrainData.GetInterpolatedNormal(normalizedX, normalizedZ);
            }
            return Vector3.up;
        }

        /// <summary>
        /// Check if position is on loaded terrain.
        /// </summary>
        public bool IsOnTerrain(Vector3 worldPos)
        {
            Vector2Int chunkCoord = WorldToChunkCoord(worldPos);
            return _loadedChunks.ContainsKey(chunkCoord);
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[TerrainManager] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[TerrainManager] {message}");
        }

        #endregion
    }
}
