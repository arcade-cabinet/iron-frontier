using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Events
{
    /// <summary>
    /// Manages random encounter generation and triggering based on zone and player context.
    /// </summary>
    public class EncounterManager : MonoBehaviour
    {
        #region Singleton
        private static EncounterManager _instance;
        public static EncounterManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<EncounterManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("EncounterManager");
                        _instance = go.AddComponent<EncounterManager>();
                    }
                }
                return _instance;
            }
        }
        #endregion

        #region Events
        /// <summary>Fired when a combat encounter is triggered.</summary>
        public event Action<EncounterData, List<EnemyData>> OnCombatEncounterTriggered;

        /// <summary>Fired when a non-combat encounter is triggered.</summary>
        public event Action<EncounterData> OnNonCombatEncounterTriggered;

        /// <summary>Fired when an environmental event is triggered.</summary>
        public event Action<EncounterData, string> OnEnvironmentalEventTriggered;

        /// <summary>Fired when an encounter is completed.</summary>
        public event Action<EncounterData, bool> OnEncounterCompleted;
        #endregion

        #region Serialized Fields
        [Header("Configuration")]
        [Tooltip("Path to encounters JSON in Resources")]
        [SerializeField] private string encountersJsonPath = "Data/Encounters/encounters";

        [Tooltip("Base encounter check interval in seconds")]
        [SerializeField] private float encounterCheckInterval = 30f;

        [Tooltip("Distance traveled before encounter check (units)")]
        [SerializeField] private float distancePerCheck = 100f;

        [Tooltip("Global encounter rate modifier")]
        [SerializeField] [Range(0f, 2f)] private float globalEncounterRateModifier = 1f;

        [Tooltip("Enable debug logging")]
        [SerializeField] private bool debugMode = false;
        #endregion

        #region Private Fields
        private Dictionary<string, EncounterData> _encounters = new Dictionary<string, EncounterData>();
        private Dictionary<string, ZoneEncounterTable> _zoneTables = new Dictionary<string, ZoneEncounterTable>();
        private Dictionary<string, float> _rarityWeights = new Dictionary<string, float>();

        private float _lastEncounterCheckTime;
        private float _distanceTraveled;
        private Vector3 _lastPosition;
        private bool _isInitialized;

        // Cooldown tracking
        private Dictionary<string, float> _encounterCooldowns = new Dictionary<string, float>();
        private HashSet<string> _completedUniqueEncounters = new HashSet<string>();

        // Current context
        private BiomeType _currentBiome = BiomeType.Desert;
        private LocationType _currentLocationType = LocationType.Wilderness;
        private TimeOfDay _currentTimeOfDay = TimeOfDay.Morning;
        private int _playerLevel = 1;
        private string _currentZoneId = "desert";
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

            LoadEncounterData();
        }

        private void Start()
        {
            _lastPosition = transform.position;
            _lastEncounterCheckTime = Time.time;
        }

        private void Update()
        {
            if (!_isInitialized) return;

            // Check for encounter based on time
            if (Time.time - _lastEncounterCheckTime >= encounterCheckInterval)
            {
                _lastEncounterCheckTime = Time.time;
                TryTriggerRandomEncounter();
            }

            // Track distance traveled
            float distance = Vector3.Distance(transform.position, _lastPosition);
            _distanceTraveled += distance;
            _lastPosition = transform.position;

            // Check for encounter based on distance
            if (_distanceTraveled >= distancePerCheck)
            {
                _distanceTraveled = 0f;
                TryTriggerRandomEncounter();
            }
        }
        #endregion

        #region Public API
        /// <summary>
        /// Sets the current zone context for encounter selection.
        /// </summary>
        public void SetZoneContext(string zoneId, BiomeType biome, LocationType locationType)
        {
            _currentZoneId = zoneId;
            _currentBiome = biome;
            _currentLocationType = locationType;

            if (debugMode)
                Debug.Log($"[EncounterManager] Zone context set: {zoneId}, {biome}, {locationType}");
        }

        /// <summary>
        /// Sets the current time of day for encounter filtering.
        /// </summary>
        public void SetTimeOfDay(TimeOfDay time)
        {
            _currentTimeOfDay = time;
        }

        /// <summary>
        /// Sets the player level for encounter scaling.
        /// </summary>
        public void SetPlayerLevel(int level)
        {
            _playerLevel = Mathf.Max(1, level);
        }

        /// <summary>
        /// Attempts to trigger a random encounter based on current context.
        /// </summary>
        /// <returns>True if an encounter was triggered.</returns>
        public bool TryTriggerRandomEncounter()
        {
            // Get zone table
            if (!_zoneTables.TryGetValue(_currentZoneId, out var zoneTable))
            {
                // Try biome-based fallback
                if (!_zoneTables.TryGetValue(_currentBiome.ToString().ToLowerInvariant(), out zoneTable))
                {
                    if (debugMode)
                        Debug.Log($"[EncounterManager] No zone table for {_currentZoneId}");
                    return false;
                }
            }

            // Check level requirements
            if (_playerLevel < zoneTable.minLevel || _playerLevel > zoneTable.maxLevel)
            {
                if (debugMode)
                    Debug.Log($"[EncounterManager] Player level {_playerLevel} outside zone range [{zoneTable.minLevel}, {zoneTable.maxLevel}]");
                return false;
            }

            // Roll for encounter
            float encounterRoll = UnityEngine.Random.value;
            float adjustedChance = zoneTable.encounterChance * globalEncounterRateModifier;

            if (encounterRoll > adjustedChance)
            {
                if (debugMode)
                    Debug.Log($"[EncounterManager] Encounter roll failed: {encounterRoll:F2} > {adjustedChance:F2}");
                return false;
            }

            // Select encounter from zone table
            var selectedEncounter = SelectWeightedEncounter(zoneTable);
            if (selectedEncounter == null)
            {
                if (debugMode)
                    Debug.Log("[EncounterManager] No valid encounter selected");
                return false;
            }

            // Trigger the encounter
            TriggerEncounter(selectedEncounter);
            return true;
        }

        /// <summary>
        /// Forces a specific encounter to trigger.
        /// </summary>
        public void TriggerEncounterById(string encounterId)
        {
            if (_encounters.TryGetValue(encounterId, out var encounter))
            {
                TriggerEncounter(encounter);
            }
            else
            {
                Debug.LogWarning($"[EncounterManager] Encounter not found: {encounterId}");
            }
        }

        /// <summary>
        /// Gets all encounters matching the specified criteria.
        /// </summary>
        public List<EncounterData> GetEncountersForContext(
            BiomeType biome,
            LocationType locationType,
            TimeOfDay timeOfDay,
            int playerLevel)
        {
            return _encounters.Values
                .Where(e => e.IsValidForBiome(biome) &&
                           e.IsValidForLocationType(locationType) &&
                           e.IsValidForTime(timeOfDay) &&
                           e.IsValidForLevel(playerLevel) &&
                           !IsOnCooldown(e.id) &&
                           !_completedUniqueEncounters.Contains(e.id))
                .ToList();
        }

        /// <summary>
        /// Gets an encounter by ID.
        /// </summary>
        public EncounterData GetEncounter(string id)
        {
            _encounters.TryGetValue(id, out var encounter);
            return encounter;
        }

        /// <summary>
        /// Marks an encounter as completed.
        /// </summary>
        public void CompleteEncounter(string encounterId, bool victory)
        {
            if (_encounters.TryGetValue(encounterId, out var encounter))
            {
                // Mark unique encounters as completed
                if (encounter.HasTag("unique") || !encounter.HasTag("repeatable"))
                {
                    _completedUniqueEncounters.Add(encounterId);
                }

                // Set cooldown for repeatable encounters
                if (encounter.HasTag("repeatable"))
                {
                    float cooldownHours = 24f; // Default cooldown
                    _encounterCooldowns[encounterId] = Time.time + (cooldownHours * 3600f / 60f); // Convert to game time
                }

                OnEncounterCompleted?.Invoke(encounter, victory);

                if (debugMode)
                    Debug.Log($"[EncounterManager] Encounter completed: {encounterId}, victory: {victory}");
            }
        }

        /// <summary>
        /// Resets all encounter cooldowns.
        /// </summary>
        public void ResetCooldowns()
        {
            _encounterCooldowns.Clear();
        }

        /// <summary>
        /// Sets the global encounter rate modifier.
        /// </summary>
        public void SetEncounterRateModifier(float modifier)
        {
            globalEncounterRateModifier = Mathf.Clamp(modifier, 0f, 2f);
        }
        #endregion

        #region Private Methods
        private void LoadEncounterData()
        {
            try
            {
                var jsonAsset = Resources.Load<TextAsset>(encountersJsonPath);
                if (jsonAsset == null)
                {
                    Debug.LogError($"[EncounterManager] Failed to load encounters from: {encountersJsonPath}");
                    return;
                }

                var data = JsonUtility.FromJson<EncounterDatabase>(jsonAsset.text);
                if (data == null)
                {
                    Debug.LogError("[EncounterManager] Failed to parse encounter JSON");
                    return;
                }

                // Load encounters
                foreach (var encounter in data.encounters)
                {
                    var encounterData = CreateEncounterData(encounter);
                    _encounters[encounter.id] = encounterData;
                }

                // Load zone tables
                if (data.zoneEncounterTables != null)
                {
                    foreach (var kvp in data.zoneEncounterTables)
                    {
                        _zoneTables[kvp.Key] = ParseZoneTable(kvp.Key, kvp.Value);
                    }
                }

                // Load rarity weights
                if (data.rarityWeights != null)
                {
                    _rarityWeights = data.rarityWeights;
                }

                _isInitialized = true;
                Debug.Log($"[EncounterManager] Loaded {_encounters.Count} encounters, {_zoneTables.Count} zone tables");
            }
            catch (Exception e)
            {
                Debug.LogError($"[EncounterManager] Error loading encounter data: {e.Message}");
            }
        }

        private EncounterData CreateEncounterData(EncounterJson json)
        {
            var data = ScriptableObject.CreateInstance<EncounterData>();
            data.id = json.id;
            data.displayName = json.name;
            data.descriptionTemplate = json.descriptionTemplate;
            data.category = ParseCategory(json.category);
            data.isNonCombat = json.isNonCombat;
            data.npcId = json.npcId;
            data.environmentalEffect = json.environmentalEffect;

            // Parse difficulty
            if (json.difficultyRange != null && json.difficultyRange.Length == 2)
            {
                data.minDifficulty = json.difficultyRange[0];
                data.maxDifficulty = json.difficultyRange[1];
            }

            // Parse enemies
            if (json.enemies != null)
            {
                foreach (var enemy in json.enemies)
                {
                    data.enemies.Add(new EncounterEnemyEntry(
                        enemy.enemyIdOrTag,
                        enemy.countRange != null && enemy.countRange.Length >= 1 ? enemy.countRange[0] : 1,
                        enemy.countRange != null && enemy.countRange.Length >= 2 ? enemy.countRange[1] : 1,
                        enemy.levelScale
                    ));
                }
            }

            // Parse biomes
            if (json.validBiomes != null)
            {
                foreach (var biome in json.validBiomes)
                {
                    if (Enum.TryParse<BiomeType>(biome, true, out var biomeType))
                        data.validBiomes.Add(biomeType);
                }
            }

            // Parse location types
            if (json.validLocationTypes != null)
            {
                foreach (var locType in json.validLocationTypes)
                {
                    if (Enum.TryParse<LocationType>(locType.Replace("_", ""), true, out var locationType))
                        data.validLocationTypes.Add(locationType);
                }
            }

            // Parse time of day
            if (json.validTimeOfDay != null)
            {
                foreach (var time in json.validTimeOfDay)
                {
                    if (Enum.TryParse<TimeOfDay>(time, true, out var timeOfDay))
                        data.validTimeOfDay.Add(timeOfDay);
                }
            }

            // Parse faction tags
            if (json.factionTags != null)
                data.factionTags = new List<string>(json.factionTags);

            // Parse rewards
            data.lootTableId = json.lootTableId;
            if (json.xpRange != null && json.xpRange.Length == 2)
            {
                data.minXp = json.xpRange[0];
                data.maxXp = json.xpRange[1];
            }
            if (json.goldRange != null && json.goldRange.Length == 2)
            {
                data.minGold = json.goldRange[0];
                data.maxGold = json.goldRange[1];
            }

            // Parse tags
            if (json.tags != null)
                data.tags = new List<string>(json.tags);

            return data;
        }

        private EncounterCategory ParseCategory(string category)
        {
            if (string.IsNullOrEmpty(category))
                return EncounterCategory.Bandit;

            category = category.ToLowerInvariant().Replace("_", "");
            if (Enum.TryParse<EncounterCategory>(category, true, out var result))
                return result;

            // Handle special cases
            return category switch
            {
                "environmentalevent" => EncounterCategory.EnvironmentalEvent,
                "environmental_event" => EncounterCategory.EnvironmentalEvent,
                _ => EncounterCategory.Bandit
            };
        }

        private ZoneEncounterTable ParseZoneTable(string zoneId, ZoneTableJson json)
        {
            var table = new ZoneEncounterTable
            {
                zoneId = zoneId,
                minLevel = json.minLevel,
                maxLevel = json.maxLevel,
                encounterChance = json.encounterChance,
                entries = new List<ZoneEncounterEntry>()
            };

            if (json.weights != null)
            {
                foreach (var kvp in json.weights)
                {
                    table.entries.Add(new ZoneEncounterEntry(kvp.Key, kvp.Value));
                }
            }

            return table;
        }

        private EncounterData SelectWeightedEncounter(ZoneEncounterTable zoneTable)
        {
            // Filter valid encounters
            var validEntries = zoneTable.entries
                .Where(e => _encounters.ContainsKey(e.encounterId) &&
                           !IsOnCooldown(e.encounterId) &&
                           !_completedUniqueEncounters.Contains(e.encounterId))
                .ToList();

            if (validEntries.Count == 0)
                return null;

            // Further filter by context
            validEntries = validEntries
                .Where(e =>
                {
                    var enc = _encounters[e.encounterId];
                    return enc.IsValidForBiome(_currentBiome) &&
                           enc.IsValidForLocationType(_currentLocationType) &&
                           enc.IsValidForTime(_currentTimeOfDay) &&
                           enc.IsValidForLevel(_playerLevel);
                })
                .ToList();

            if (validEntries.Count == 0)
                return null;

            // Calculate total weight
            float totalWeight = validEntries.Sum(e => e.weight);
            if (totalWeight <= 0)
                return null;

            // Select random encounter
            float roll = UnityEngine.Random.value * totalWeight;
            float cumulative = 0f;

            foreach (var entry in validEntries)
            {
                cumulative += entry.weight;
                if (roll <= cumulative)
                {
                    return _encounters[entry.encounterId];
                }
            }

            // Fallback to last entry
            return _encounters[validEntries.Last().encounterId];
        }

        private bool IsOnCooldown(string encounterId)
        {
            if (_encounterCooldowns.TryGetValue(encounterId, out float cooldownEnd))
            {
                return Time.time < cooldownEnd;
            }
            return false;
        }

        private void TriggerEncounter(EncounterData encounter)
        {
            if (debugMode)
                Debug.Log($"[EncounterManager] Triggering encounter: {encounter.id} ({encounter.displayName})");

            if (encounter.isNonCombat)
            {
                if (!string.IsNullOrEmpty(encounter.environmentalEffect))
                {
                    OnEnvironmentalEventTriggered?.Invoke(encounter, encounter.environmentalEffect);
                }
                else
                {
                    OnNonCombatEncounterTriggered?.Invoke(encounter);
                }
            }
            else
            {
                // Generate enemy list
                var enemies = GenerateEnemyList(encounter);
                OnCombatEncounterTriggered?.Invoke(encounter, enemies);
            }
        }

        private List<EnemyData> GenerateEnemyList(EncounterData encounter)
        {
            var enemies = new List<EnemyData>();

            foreach (var entry in encounter.enemies)
            {
                int count = UnityEngine.Random.Range(entry.minCount, entry.maxCount + 1);
                for (int i = 0; i < count; i++)
                {
                    // Try to load enemy data
                    var enemyData = LoadEnemyData(entry.enemyIdOrTag);
                    if (enemyData != null)
                    {
                        enemies.Add(enemyData);
                    }
                }
            }

            return enemies;
        }

        private EnemyData LoadEnemyData(string enemyIdOrTag)
        {
            // Try loading from Resources
            var enemy = Resources.Load<EnemyData>($"Data/Enemies/{enemyIdOrTag}");
            if (enemy != null)
                return enemy;

            // TODO: Implement tag-based enemy lookup from EnemyDatabase
            if (debugMode)
                Debug.LogWarning($"[EncounterManager] Enemy not found: {enemyIdOrTag}");

            return null;
        }
        #endregion

        #region JSON Data Classes
        [Serializable]
        private class EncounterDatabase
        {
            public string version;
            public string description;
            public List<EncounterJson> encounters;
            public Dictionary<string, ZoneTableJson> zoneEncounterTables;
            public Dictionary<string, float> rarityWeights;
        }

        [Serializable]
        private class EncounterJson
        {
            public string id;
            public string name;
            public string descriptionTemplate;
            public string category;
            public List<EnemyEntryJson> enemies;
            public int[] difficultyRange;
            public string[] validBiomes;
            public string[] validLocationTypes;
            public string[] validTimeOfDay;
            public string[] factionTags;
            public string lootTableId;
            public int[] xpRange;
            public int[] goldRange;
            public string[] tags;
            public bool isNonCombat;
            public string npcId;
            public string environmentalEffect;
        }

        [Serializable]
        private class EnemyEntryJson
        {
            public string enemyIdOrTag;
            public int[] countRange;
            public float levelScale;
        }

        [Serializable]
        private class ZoneTableJson
        {
            public Dictionary<string, float> weights;
            public int minLevel;
            public int maxLevel;
            public float encounterChance;
        }
        #endregion
    }
}
