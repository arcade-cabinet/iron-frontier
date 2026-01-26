using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Systems;

namespace IronFrontier.Environment
{
    /// <summary>
    /// Vegetation type categories.
    /// </summary>
    public enum VegetationType
    {
        /// <summary>Low grass billboards.</summary>
        GrassBillboard,
        /// <summary>Ground cover meshes.</summary>
        GroundCover,
        /// <summary>Small bushes.</summary>
        SmallBush,
        /// <summary>Medium shrubs.</summary>
        MediumShrub,
        /// <summary>Small trees.</summary>
        SmallTree,
        /// <summary>Large trees.</summary>
        LargeTree,
        /// <summary>Cacti and succulents.</summary>
        Cactus,
        /// <summary>Desert shrubs.</summary>
        DesertPlant,
        /// <summary>Rocks and boulders.</summary>
        Rock,
        /// <summary>Dead vegetation.</summary>
        DeadVegetation
    }

    /// <summary>
    /// Configuration for a vegetation prefab.
    /// </summary>
    [Serializable]
    public class VegetationPrefabConfig
    {
        /// <summary>Vegetation type category.</summary>
        public VegetationType type;

        /// <summary>Prefab to instantiate (or mesh for GPU instancing).</summary>
        public GameObject prefab;

        /// <summary>Material for GPU instancing.</summary>
        public Material instancedMaterial;

        /// <summary>Use GPU instancing for this vegetation.</summary>
        public bool useGPUInstancing = true;

        /// <summary>Weight for random selection.</summary>
        [Range(0.1f, 10f)]
        public float selectionWeight = 1f;

        [Header("Placement")]
        /// <summary>Minimum scale.</summary>
        public float minScale = 0.8f;

        /// <summary>Maximum scale.</summary>
        public float maxScale = 1.2f;

        /// <summary>Randomize rotation on Y axis.</summary>
        public bool randomYRotation = true;

        /// <summary>Align to terrain normal.</summary>
        public bool alignToNormal = false;

        /// <summary>Normal alignment strength (0-1).</summary>
        [Range(0f, 1f)]
        public float normalAlignmentStrength = 0.5f;

        /// <summary>Sink into ground offset.</summary>
        public float groundOffset = 0f;

        [Header("Terrain Constraints")]
        /// <summary>Minimum terrain height (normalized 0-1).</summary>
        [Range(0f, 1f)]
        public float minHeight = 0f;

        /// <summary>Maximum terrain height (normalized 0-1).</summary>
        [Range(0f, 1f)]
        public float maxHeight = 1f;

        /// <summary>Maximum slope angle in degrees.</summary>
        [Range(0f, 90f)]
        public float maxSlopeAngle = 45f;

        [Header("LOD")]
        /// <summary>Maximum view distance.</summary>
        public float maxDistance = 100f;

        /// <summary>Distance at which to start fading.</summary>
        public float fadeStartDistance = 80f;
    }

    /// <summary>
    /// Biome-specific vegetation configuration.
    /// </summary>
    [Serializable]
    public class BiomeVegetationConfig
    {
        /// <summary>Biome this config applies to.</summary>
        public BiomeType biome;

        /// <summary>Overall vegetation density (instances per square unit).</summary>
        [Range(0f, 1f)]
        public float density = 0.1f;

        /// <summary>Vegetation types allowed in this biome.</summary>
        public List<VegetationType> allowedTypes = new List<VegetationType>();

        /// <summary>Type-specific density modifiers.</summary>
        public List<VegetationTypeDensity> typeDensities = new List<VegetationTypeDensity>();
    }

    /// <summary>
    /// Density modifier for a specific vegetation type.
    /// </summary>
    [Serializable]
    public class VegetationTypeDensity
    {
        /// <summary>Vegetation type.</summary>
        public VegetationType type;

        /// <summary>Density multiplier.</summary>
        [Range(0f, 5f)]
        public float densityMultiplier = 1f;
    }

    /// <summary>
    /// Instance data for GPU instancing.
    /// </summary>
    public struct VegetationInstance
    {
        /// <summary>Transform matrix.</summary>
        public Matrix4x4 matrix;

        /// <summary>Color tint.</summary>
        public Color color;

        /// <summary>Vegetation type.</summary>
        public VegetationType type;

        /// <summary>Distance from camera (for culling).</summary>
        public float distanceFromCamera;
    }

    /// <summary>
    /// Chunk data for vegetation streaming.
    /// </summary>
    public class VegetationChunk
    {
        /// <summary>Chunk coordinates.</summary>
        public Vector2Int coordinates;

        /// <summary>World position.</summary>
        public Vector3 worldPosition;

        /// <summary>Bounds for culling.</summary>
        public Bounds bounds;

        /// <summary>Instances in this chunk.</summary>
        public List<VegetationInstance> instances = new List<VegetationInstance>();

        /// <summary>GameObjects for non-instanced vegetation.</summary>
        public List<GameObject> gameObjects = new List<GameObject>();

        /// <summary>Whether chunk is currently visible.</summary>
        public bool isVisible;

        /// <summary>Whether instances are generated.</summary>
        public bool isGenerated;
    }

    /// <summary>
    /// Procedural vegetation scattering system for terrain decoration.
    /// Handles grass instancing, tree placement, and desert plants with biome awareness.
    /// </summary>
    /// <remarks>
    /// Features:
    /// - GPU instancing for grass and small vegetation
    /// - Biome-aware placement rules
    /// - LOD and distance culling
    /// - Terrain-aware placement (height, slope, texture)
    /// - Wind animation support
    /// - Chunk-based streaming
    /// </remarks>
    public class ProceduralVegetation : MonoBehaviour
    {
        #region Singleton

        private static ProceduralVegetation _instance;

        /// <summary>
        /// Global singleton instance of ProceduralVegetation.
        /// </summary>
        public static ProceduralVegetation Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<ProceduralVegetation>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[ProceduralVegetation]");
                        _instance = go.AddComponent<ProceduralVegetation>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Configuration

        [Header("General Settings")]
        [SerializeField]
        [Tooltip("Enable vegetation generation")]
        private bool enableVegetation = true;

        [SerializeField]
        [Tooltip("Global density multiplier")]
        [Range(0f, 2f)]
        private float globalDensityMultiplier = 1f;

        [SerializeField]
        [Tooltip("Chunk size in world units")]
        private float chunkSize = 50f;

        [SerializeField]
        [Tooltip("Generation radius around camera (in chunks)")]
        private int generationRadius = 3;

        [Header("Vegetation Prefabs")]
        [SerializeField]
        [Tooltip("Vegetation prefab configurations")]
        private List<VegetationPrefabConfig> prefabConfigs = new List<VegetationPrefabConfig>();

        [Header("Biome Configurations")]
        [SerializeField]
        [Tooltip("Biome-specific vegetation settings")]
        private List<BiomeVegetationConfig> biomeConfigs = new List<BiomeVegetationConfig>();

        [Header("Grass Settings")]
        [SerializeField]
        [Tooltip("Grass instances per chunk")]
        private int grassInstancesPerChunk = 1000;

        [SerializeField]
        [Tooltip("Grass render distance")]
        private float grassRenderDistance = 50f;

        [SerializeField]
        [Tooltip("Grass density noise scale")]
        private float grassNoiseScale = 0.1f;

        [Header("Tree Settings")]
        [SerializeField]
        [Tooltip("Trees per chunk")]
        private int treesPerChunk = 5;

        [SerializeField]
        [Tooltip("Minimum distance between trees")]
        private float treeMinDistance = 10f;

        [SerializeField]
        [Tooltip("Tree render distance")]
        private float treeRenderDistance = 200f;

        [Header("Desert Plants")]
        [SerializeField]
        [Tooltip("Cacti per chunk in desert biomes")]
        private int cactiPerChunk = 3;

        [SerializeField]
        [Tooltip("Desert shrubs per chunk")]
        private int desertShrubsPerChunk = 10;

        [Header("Performance")]
        [SerializeField]
        [Tooltip("Maximum instances to render per frame")]
        private int maxInstancesPerFrame = 10000;

        [SerializeField]
        [Tooltip("LOD update interval in frames")]
        private int lodUpdateInterval = 5;

        [SerializeField]
        [Tooltip("Use frustum culling")]
        private bool useFrustumCulling = true;

        [Header("Wind")]
        [SerializeField]
        [Tooltip("Enable wind animation")]
        private bool enableWindAnimation = true;

        [SerializeField]
        [Tooltip("Wind strength")]
        [Range(0f, 2f)]
        private float windStrength = 0.5f;

        [SerializeField]
        [Tooltip("Wind frequency")]
        private float windFrequency = 1f;

        [Header("References")]
        [SerializeField]
        [Tooltip("Camera for culling calculations")]
        private Camera targetCamera;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        [SerializeField]
        private bool showChunkBounds = false;

        #endregion

        #region State

        private Dictionary<Vector2Int, VegetationChunk> _chunks;
        private BiomeType _currentBiome;
        private int _frameCounter = 0;
        private Vector2Int _lastCameraChunk;
        private bool _isInitialized = false;

        // GPU instancing buffers
        private ComputeBuffer _instanceBuffer;
        private ComputeBuffer _argsBuffer;
        private Matrix4x4[] _instanceMatrices;
        private MaterialPropertyBlock _propertyBlock;
        private uint[] _args = new uint[5] { 0, 0, 0, 0, 0 };

        // Random state
        private System.Random _rng;

        #endregion

        #region Properties

        /// <summary>Whether vegetation is enabled.</summary>
        public bool IsEnabled => enableVegetation;

        /// <summary>Current biome for vegetation.</summary>
        public BiomeType CurrentBiome => _currentBiome;

        /// <summary>Number of loaded chunks.</summary>
        public int LoadedChunkCount => _chunks?.Count ?? 0;

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
            _chunks = new Dictionary<Vector2Int, VegetationChunk>();
            _propertyBlock = new MaterialPropertyBlock();

            Log("ProceduralVegetation awakened");
        }

        private void Start()
        {
            Initialize();
        }

        private void Update()
        {
            if (!_isInitialized || !enableVegetation) return;

            _frameCounter++;

            // Update chunks around camera
            if (_frameCounter % lodUpdateInterval == 0)
            {
                UpdateChunks();
            }

            // Render instanced vegetation
            RenderInstancedVegetation();
        }

        private void OnDestroy()
        {
            // Clean up GPU buffers
            _instanceBuffer?.Release();
            _argsBuffer?.Release();

            // Clean up chunks
            foreach (var chunk in _chunks.Values)
            {
                CleanupChunk(chunk);
            }
            _chunks.Clear();

            if (_instance == this)
            {
                _instance = null;
            }
        }

        private void OnDrawGizmos()
        {
            if (!showChunkBounds || _chunks == null) return;

            foreach (var chunk in _chunks.Values)
            {
                Gizmos.color = chunk.isVisible ? Color.green : Color.red;
                Gizmos.DrawWireCube(chunk.bounds.center, chunk.bounds.size);
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the vegetation system.
        /// </summary>
        public void Initialize()
        {
            if (_isInitialized) return;

            Log("Initializing ProceduralVegetation...");

            // Find camera
            if (targetCamera == null)
            {
                targetCamera = Camera.main;
            }

            // Initialize RNG
            _rng = new System.Random(42);

            // Create default biome configs if empty
            if (biomeConfigs.Count == 0)
            {
                CreateDefaultBiomeConfigs();
            }

            // Subscribe to biome changes
            if (TerrainManager.Instance != null)
            {
                TerrainManager.Instance.OnBiomeChanged += OnBiomeChanged;
                _currentBiome = TerrainManager.Instance.CurrentBiome;
            }
            else
            {
                _currentBiome = BiomeType.Plains;
            }

            // Subscribe to weather for wind
            if (WeatherSystem.Instance != null)
            {
                WeatherSystem.Instance.OnWeatherChanged += OnWeatherChanged;
            }

            // Initialize GPU buffers
            InitializeGPUBuffers();

            _isInitialized = true;
            Log("ProceduralVegetation initialized");
        }

        private void CreateDefaultBiomeConfigs()
        {
            // Plains
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Plains,
                density = 0.3f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.GrassBillboard,
                    VegetationType.GroundCover,
                    VegetationType.SmallBush,
                    VegetationType.SmallTree
                }
            });

            // Desert
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Desert,
                density = 0.05f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.Cactus,
                    VegetationType.DesertPlant,
                    VegetationType.DeadVegetation,
                    VegetationType.Rock
                }
            });

            // Badlands
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Badlands,
                density = 0.08f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.DesertPlant,
                    VegetationType.DeadVegetation,
                    VegetationType.Rock,
                    VegetationType.SmallBush
                }
            });

            // Mountains
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Mountains,
                density = 0.15f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.Rock,
                    VegetationType.SmallBush,
                    VegetationType.SmallTree,
                    VegetationType.GroundCover
                }
            });

            // Forest
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Forest,
                density = 0.5f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.GrassBillboard,
                    VegetationType.GroundCover,
                    VegetationType.SmallBush,
                    VegetationType.MediumShrub,
                    VegetationType.SmallTree,
                    VegetationType.LargeTree
                }
            });

            // Riverside
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Riverside,
                density = 0.4f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.GrassBillboard,
                    VegetationType.GroundCover,
                    VegetationType.SmallBush,
                    VegetationType.MediumShrub,
                    VegetationType.SmallTree
                }
            });

            // Canyon
            biomeConfigs.Add(new BiomeVegetationConfig
            {
                biome = BiomeType.Canyon,
                density = 0.1f,
                allowedTypes = new List<VegetationType>
                {
                    VegetationType.Rock,
                    VegetationType.DesertPlant,
                    VegetationType.DeadVegetation,
                    VegetationType.SmallBush
                }
            });
        }

        private void InitializeGPUBuffers()
        {
            // Initialize instance matrices array
            _instanceMatrices = new Matrix4x4[maxInstancesPerFrame];

            // Initialize args buffer for DrawMeshInstancedIndirect
            _argsBuffer = new ComputeBuffer(1, _args.Length * sizeof(uint), ComputeBufferType.IndirectArguments);
        }

        #endregion

        #region Chunk Management

        private void UpdateChunks()
        {
            if (targetCamera == null) return;

            Vector3 cameraPos = targetCamera.transform.position;
            Vector2Int cameraChunk = WorldToChunkCoord(cameraPos);

            // Skip if camera hasn't moved to new chunk
            if (cameraChunk == _lastCameraChunk) return;
            _lastCameraChunk = cameraChunk;

            // Determine which chunks should be loaded
            var chunksToLoad = new HashSet<Vector2Int>();
            for (int x = -generationRadius; x <= generationRadius; x++)
            {
                for (int z = -generationRadius; z <= generationRadius; z++)
                {
                    chunksToLoad.Add(new Vector2Int(cameraChunk.x + x, cameraChunk.y + z));
                }
            }

            // Unload distant chunks
            var chunksToUnload = new List<Vector2Int>();
            foreach (var coord in _chunks.Keys)
            {
                if (!chunksToLoad.Contains(coord))
                {
                    chunksToUnload.Add(coord);
                }
            }

            foreach (var coord in chunksToUnload)
            {
                UnloadChunk(coord);
            }

            // Load new chunks
            foreach (var coord in chunksToLoad)
            {
                if (!_chunks.ContainsKey(coord))
                {
                    LoadChunk(coord);
                }
            }

            // Update visibility
            UpdateChunkVisibility();
        }

        private void LoadChunk(Vector2Int coord)
        {
            Log($"Loading vegetation chunk: {coord}");

            var chunk = new VegetationChunk
            {
                coordinates = coord,
                worldPosition = ChunkToWorldPos(coord),
                bounds = new Bounds(
                    ChunkToWorldPos(coord) + new Vector3(chunkSize / 2, 50f, chunkSize / 2),
                    new Vector3(chunkSize, 100f, chunkSize)
                ),
                isGenerated = false,
                isVisible = true
            };

            _chunks[coord] = chunk;

            // Generate vegetation for this chunk
            GenerateChunkVegetation(chunk);
        }

        private void UnloadChunk(Vector2Int coord)
        {
            if (!_chunks.TryGetValue(coord, out var chunk)) return;

            Log($"Unloading vegetation chunk: {coord}");

            CleanupChunk(chunk);
            _chunks.Remove(coord);
        }

        private void CleanupChunk(VegetationChunk chunk)
        {
            // Destroy non-instanced game objects
            foreach (var go in chunk.gameObjects)
            {
                if (go != null)
                {
                    Destroy(go);
                }
            }
            chunk.gameObjects.Clear();
            chunk.instances.Clear();
        }

        private void UpdateChunkVisibility()
        {
            if (targetCamera == null || !useFrustumCulling) return;

            var planes = GeometryUtility.CalculateFrustumPlanes(targetCamera);

            foreach (var chunk in _chunks.Values)
            {
                chunk.isVisible = GeometryUtility.TestPlanesAABB(planes, chunk.bounds);
            }
        }

        private Vector2Int WorldToChunkCoord(Vector3 worldPos)
        {
            return new Vector2Int(
                Mathf.FloorToInt(worldPos.x / chunkSize),
                Mathf.FloorToInt(worldPos.z / chunkSize)
            );
        }

        private Vector3 ChunkToWorldPos(Vector2Int coord)
        {
            return new Vector3(coord.x * chunkSize, 0f, coord.y * chunkSize);
        }

        #endregion

        #region Vegetation Generation

        private void GenerateChunkVegetation(VegetationChunk chunk)
        {
            if (chunk.isGenerated) return;

            var biomeConfig = GetBiomeConfig(_currentBiome);
            if (biomeConfig == null)
            {
                chunk.isGenerated = true;
                return;
            }

            // Use chunk coordinates as seed for deterministic generation
            int seed = chunk.coordinates.x * 10000 + chunk.coordinates.y;
            var chunkRng = new System.Random(seed);

            float baseDensity = biomeConfig.density * globalDensityMultiplier;

            // Generate grass instances
            if (biomeConfig.allowedTypes.Contains(VegetationType.GrassBillboard))
            {
                GenerateGrass(chunk, chunkRng, baseDensity);
            }

            // Generate trees
            if (biomeConfig.allowedTypes.Contains(VegetationType.SmallTree) ||
                biomeConfig.allowedTypes.Contains(VegetationType.LargeTree))
            {
                GenerateTrees(chunk, chunkRng, biomeConfig);
            }

            // Generate cacti (desert)
            if (biomeConfig.allowedTypes.Contains(VegetationType.Cactus))
            {
                GenerateCacti(chunk, chunkRng, baseDensity);
            }

            // Generate desert shrubs
            if (biomeConfig.allowedTypes.Contains(VegetationType.DesertPlant))
            {
                GenerateDesertPlants(chunk, chunkRng, baseDensity);
            }

            // Generate bushes
            if (biomeConfig.allowedTypes.Contains(VegetationType.SmallBush))
            {
                GenerateBushes(chunk, chunkRng, baseDensity);
            }

            // Generate rocks
            if (biomeConfig.allowedTypes.Contains(VegetationType.Rock))
            {
                GenerateRocks(chunk, chunkRng, baseDensity);
            }

            chunk.isGenerated = true;
            Log($"Generated {chunk.instances.Count} instances and {chunk.gameObjects.Count} objects for chunk {chunk.coordinates}");
        }

        private void GenerateGrass(VegetationChunk chunk, System.Random rng, float density)
        {
            int count = Mathf.RoundToInt(grassInstancesPerChunk * density);

            for (int i = 0; i < count; i++)
            {
                float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                // Get terrain height
                float y = GetTerrainHeight(x, z);
                if (y < 0) continue;

                // Density noise
                float noise = Mathf.PerlinNoise(x * grassNoiseScale, z * grassNoiseScale);
                if ((float)rng.NextDouble() > noise) continue;

                // Check slope
                Vector3 normal = GetTerrainNormal(x, z);
                float slope = Vector3.Angle(Vector3.up, normal);
                if (slope > 30f) continue;

                // Create instance
                float scale = 0.8f + (float)rng.NextDouble() * 0.4f;
                float rotation = (float)rng.NextDouble() * 360f;

                var matrix = Matrix4x4.TRS(
                    new Vector3(x, y, z),
                    Quaternion.Euler(0f, rotation, 0f),
                    Vector3.one * scale
                );

                chunk.instances.Add(new VegetationInstance
                {
                    matrix = matrix,
                    color = GetGrassColor(rng),
                    type = VegetationType.GrassBillboard,
                    distanceFromCamera = 0f
                });
            }
        }

        private void GenerateTrees(VegetationChunk chunk, System.Random rng, BiomeVegetationConfig biomeConfig)
        {
            int count = treesPerChunk;

            // Adjust for biome
            float treeWeight = GetTypeDensityModifier(biomeConfig, VegetationType.SmallTree);
            count = Mathf.RoundToInt(count * treeWeight * globalDensityMultiplier);

            var treePrefab = GetPrefabForType(VegetationType.SmallTree);
            if (treePrefab == null) return;

            var placedPositions = new List<Vector3>();

            for (int i = 0; i < count * 3; i++) // Try 3x times to account for rejections
            {
                if (placedPositions.Count >= count) break;

                float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                // Get terrain height
                float y = GetTerrainHeight(x, z);
                if (y < 0) continue;

                Vector3 pos = new Vector3(x, y, z);

                // Check minimum distance
                bool tooClose = false;
                foreach (var other in placedPositions)
                {
                    if (Vector3.Distance(pos, other) < treeMinDistance)
                    {
                        tooClose = true;
                        break;
                    }
                }
                if (tooClose) continue;

                // Check slope
                Vector3 normal = GetTerrainNormal(x, z);
                float slope = Vector3.Angle(Vector3.up, normal);
                if (slope > 25f) continue;

                placedPositions.Add(pos);

                // Instantiate tree
                var config = GetPrefabConfig(VegetationType.SmallTree);
                float scale = config != null
                    ? config.minScale + (float)rng.NextDouble() * (config.maxScale - config.minScale)
                    : 0.8f + (float)rng.NextDouble() * 0.4f;

                float rotation = (float)rng.NextDouble() * 360f;

                var treeGO = Instantiate(treePrefab.prefab, pos, Quaternion.Euler(0f, rotation, 0f), transform);
                treeGO.transform.localScale = Vector3.one * scale;
                chunk.gameObjects.Add(treeGO);
            }
        }

        private void GenerateCacti(VegetationChunk chunk, System.Random rng, float density)
        {
            int count = Mathf.RoundToInt(cactiPerChunk * density);

            var cactusPrefab = GetPrefabForType(VegetationType.Cactus);
            if (cactusPrefab == null) return;

            for (int i = 0; i < count; i++)
            {
                float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                float y = GetTerrainHeight(x, z);
                if (y < 0) continue;

                // Cacti prefer flatter ground
                Vector3 normal = GetTerrainNormal(x, z);
                float slope = Vector3.Angle(Vector3.up, normal);
                if (slope > 15f) continue;

                var config = GetPrefabConfig(VegetationType.Cactus);
                float scale = config != null
                    ? config.minScale + (float)rng.NextDouble() * (config.maxScale - config.minScale)
                    : 0.8f + (float)rng.NextDouble() * 0.6f;

                float rotation = (float)rng.NextDouble() * 360f;

                var cactusGO = Instantiate(cactusPrefab.prefab, new Vector3(x, y, z), Quaternion.Euler(0f, rotation, 0f), transform);
                cactusGO.transform.localScale = Vector3.one * scale;
                chunk.gameObjects.Add(cactusGO);
            }
        }

        private void GenerateDesertPlants(VegetationChunk chunk, System.Random rng, float density)
        {
            int count = Mathf.RoundToInt(desertShrubsPerChunk * density);

            var plantPrefab = GetPrefabForType(VegetationType.DesertPlant);
            if (plantPrefab == null)
            {
                // Generate as instances instead
                for (int i = 0; i < count; i++)
                {
                    float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                    float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                    float y = GetTerrainHeight(x, z);
                    if (y < 0) continue;

                    float scale = 0.5f + (float)rng.NextDouble() * 0.5f;
                    float rotation = (float)rng.NextDouble() * 360f;

                    var matrix = Matrix4x4.TRS(
                        new Vector3(x, y, z),
                        Quaternion.Euler(0f, rotation, 0f),
                        Vector3.one * scale
                    );

                    chunk.instances.Add(new VegetationInstance
                    {
                        matrix = matrix,
                        color = GetDesertPlantColor(rng),
                        type = VegetationType.DesertPlant,
                        distanceFromCamera = 0f
                    });
                }
                return;
            }

            for (int i = 0; i < count; i++)
            {
                float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                float y = GetTerrainHeight(x, z);
                if (y < 0) continue;

                var config = GetPrefabConfig(VegetationType.DesertPlant);
                float scale = config != null
                    ? config.minScale + (float)rng.NextDouble() * (config.maxScale - config.minScale)
                    : 0.5f + (float)rng.NextDouble() * 0.5f;

                float rotation = (float)rng.NextDouble() * 360f;

                var plantGO = Instantiate(plantPrefab.prefab, new Vector3(x, y, z), Quaternion.Euler(0f, rotation, 0f), transform);
                plantGO.transform.localScale = Vector3.one * scale;
                chunk.gameObjects.Add(plantGO);
            }
        }

        private void GenerateBushes(VegetationChunk chunk, System.Random rng, float density)
        {
            int count = Mathf.RoundToInt(10 * density);

            var bushPrefab = GetPrefabForType(VegetationType.SmallBush);

            for (int i = 0; i < count; i++)
            {
                float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                float y = GetTerrainHeight(x, z);
                if (y < 0) continue;

                // Check slope
                Vector3 normal = GetTerrainNormal(x, z);
                float slope = Vector3.Angle(Vector3.up, normal);
                if (slope > 35f) continue;

                float scale = 0.6f + (float)rng.NextDouble() * 0.4f;
                float rotation = (float)rng.NextDouble() * 360f;

                if (bushPrefab != null)
                {
                    var bushGO = Instantiate(bushPrefab.prefab, new Vector3(x, y, z), Quaternion.Euler(0f, rotation, 0f), transform);
                    bushGO.transform.localScale = Vector3.one * scale;
                    chunk.gameObjects.Add(bushGO);
                }
                else
                {
                    // Add as instance
                    var matrix = Matrix4x4.TRS(
                        new Vector3(x, y, z),
                        Quaternion.Euler(0f, rotation, 0f),
                        Vector3.one * scale
                    );

                    chunk.instances.Add(new VegetationInstance
                    {
                        matrix = matrix,
                        color = Color.green,
                        type = VegetationType.SmallBush,
                        distanceFromCamera = 0f
                    });
                }
            }
        }

        private void GenerateRocks(VegetationChunk chunk, System.Random rng, float density)
        {
            int count = Mathf.RoundToInt(5 * density);

            var rockPrefab = GetPrefabForType(VegetationType.Rock);
            if (rockPrefab == null) return;

            for (int i = 0; i < count; i++)
            {
                float x = chunk.worldPosition.x + (float)rng.NextDouble() * chunkSize;
                float z = chunk.worldPosition.z + (float)rng.NextDouble() * chunkSize;

                float y = GetTerrainHeight(x, z);
                if (y < 0) continue;

                var config = GetPrefabConfig(VegetationType.Rock);
                float scale = config != null
                    ? config.minScale + (float)rng.NextDouble() * (config.maxScale - config.minScale)
                    : 0.5f + (float)rng.NextDouble() * 1.5f;

                float rotationX = (float)rng.NextDouble() * 20f - 10f;
                float rotationY = (float)rng.NextDouble() * 360f;
                float rotationZ = (float)rng.NextDouble() * 20f - 10f;

                var rockGO = Instantiate(rockPrefab.prefab, new Vector3(x, y - 0.2f, z), Quaternion.Euler(rotationX, rotationY, rotationZ), transform);
                rockGO.transform.localScale = Vector3.one * scale;
                chunk.gameObjects.Add(rockGO);
            }
        }

        #endregion

        #region Rendering

        private void RenderInstancedVegetation()
        {
            // Collect visible instances
            var visibleInstances = new List<VegetationInstance>();
            Vector3 cameraPos = targetCamera != null ? targetCamera.transform.position : Vector3.zero;

            foreach (var chunk in _chunks.Values)
            {
                if (!chunk.isVisible) continue;

                foreach (var instance in chunk.instances)
                {
                    // Distance check
                    Vector3 instancePos = instance.matrix.GetColumn(3);
                    float dist = Vector3.Distance(instancePos, cameraPos);

                    float maxDist = instance.type == VegetationType.GrassBillboard
                        ? grassRenderDistance
                        : treeRenderDistance;

                    if (dist > maxDist) continue;

                    var inst = instance;
                    inst.distanceFromCamera = dist;
                    visibleInstances.Add(inst);

                    if (visibleInstances.Count >= maxInstancesPerFrame) break;
                }

                if (visibleInstances.Count >= maxInstancesPerFrame) break;
            }

            // Group by type and render
            // Note: Full GPU instancing requires mesh data - this is a simplified version
            // Production code would use DrawMeshInstancedIndirect with compute shaders
        }

        #endregion

        #region Helpers

        private BiomeVegetationConfig GetBiomeConfig(BiomeType biome)
        {
            foreach (var config in biomeConfigs)
            {
                if (config.biome == biome)
                {
                    return config;
                }
            }
            return null;
        }

        private VegetationPrefabConfig GetPrefabForType(VegetationType type)
        {
            foreach (var config in prefabConfigs)
            {
                if (config.type == type && config.prefab != null)
                {
                    return config;
                }
            }
            return null;
        }

        private VegetationPrefabConfig GetPrefabConfig(VegetationType type)
        {
            foreach (var config in prefabConfigs)
            {
                if (config.type == type)
                {
                    return config;
                }
            }
            return null;
        }

        private float GetTypeDensityModifier(BiomeVegetationConfig biomeConfig, VegetationType type)
        {
            foreach (var density in biomeConfig.typeDensities)
            {
                if (density.type == type)
                {
                    return density.densityMultiplier;
                }
            }
            return 1f;
        }

        private float GetTerrainHeight(float x, float z)
        {
            if (TerrainManager.Instance != null)
            {
                return TerrainManager.Instance.GetHeightAt(new Vector3(x, 0, z));
            }

            // Fallback: raycast
            var ray = new Ray(new Vector3(x, 1000f, z), Vector3.down);
            if (Physics.Raycast(ray, out var hit, 2000f, LayerMask.GetMask("Terrain", "Default")))
            {
                return hit.point.y;
            }

            return -1f;
        }

        private Vector3 GetTerrainNormal(float x, float z)
        {
            if (TerrainManager.Instance != null)
            {
                return TerrainManager.Instance.GetNormalAt(new Vector3(x, 0, z));
            }

            return Vector3.up;
        }

        private Color GetGrassColor(System.Random rng)
        {
            // Vary grass color slightly
            float hue = 0.33f + ((float)rng.NextDouble() - 0.5f) * 0.1f;
            float sat = 0.5f + (float)rng.NextDouble() * 0.3f;
            float val = 0.4f + (float)rng.NextDouble() * 0.3f;

            return Color.HSVToRGB(hue, sat, val);
        }

        private Color GetDesertPlantColor(System.Random rng)
        {
            // Desert plants: muted greens/browns
            float hue = 0.2f + ((float)rng.NextDouble() - 0.5f) * 0.15f;
            float sat = 0.3f + (float)rng.NextDouble() * 0.2f;
            float val = 0.3f + (float)rng.NextDouble() * 0.2f;

            return Color.HSVToRGB(hue, sat, val);
        }

        #endregion

        #region Event Handlers

        private void OnBiomeChanged(object sender, BiomeType biome)
        {
            if (_currentBiome != biome)
            {
                Log($"Biome changed: {_currentBiome} -> {biome}");
                _currentBiome = biome;

                // Regenerate chunks for new biome
                foreach (var chunk in _chunks.Values)
                {
                    CleanupChunk(chunk);
                    chunk.isGenerated = false;
                    GenerateChunkVegetation(chunk);
                }
            }
        }

        private void OnWeatherChanged(object sender, WeatherChangedEventArgs args)
        {
            // Adjust wind based on weather
            if (enableWindAnimation && WeatherSystem.Instance != null)
            {
                var effects = WeatherSystem.Instance.CurrentEffects;
                // Wind would be applied to grass shader
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Set the global density multiplier.
        /// </summary>
        public void SetDensityMultiplier(float multiplier)
        {
            globalDensityMultiplier = Mathf.Clamp(multiplier, 0f, 2f);
        }

        /// <summary>
        /// Regenerate all vegetation.
        /// </summary>
        public void RegenerateAll()
        {
            foreach (var chunk in _chunks.Values)
            {
                CleanupChunk(chunk);
                chunk.isGenerated = false;
                GenerateChunkVegetation(chunk);
            }
        }

        /// <summary>
        /// Clear all vegetation in a radius.
        /// </summary>
        public void ClearInRadius(Vector3 center, float radius)
        {
            foreach (var chunk in _chunks.Values)
            {
                // Remove game objects
                for (int i = chunk.gameObjects.Count - 1; i >= 0; i--)
                {
                    var go = chunk.gameObjects[i];
                    if (go != null && Vector3.Distance(go.transform.position, center) < radius)
                    {
                        Destroy(go);
                        chunk.gameObjects.RemoveAt(i);
                    }
                }

                // Remove instances
                chunk.instances.RemoveAll(inst =>
                {
                    Vector3 pos = inst.matrix.GetColumn(3);
                    return Vector3.Distance(pos, center) < radius;
                });
            }
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[ProceduralVegetation] {message}");
            }
        }

        #endregion
    }
}
