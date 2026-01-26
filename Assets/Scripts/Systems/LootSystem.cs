using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;
using IronFrontier.Inventory;

namespace IronFrontier.Systems
{
    /// <summary>
    /// Event arguments for loot generation events.
    /// </summary>
    public class LootGeneratedEventArgs : EventArgs
    {
        /// <summary>Source of the loot (enemy ID, chest ID, etc.).</summary>
        public string SourceId { get; }

        /// <summary>Loot table ID that was rolled.</summary>
        public string LootTableId { get; }

        /// <summary>Generated loot results.</summary>
        public List<LootResult> Results { get; }

        /// <summary>Total gold dropped.</summary>
        public int TotalGold { get; }

        public LootGeneratedEventArgs(string sourceId, string lootTableId, List<LootResult> results, int totalGold = 0)
        {
            SourceId = sourceId;
            LootTableId = lootTableId;
            Results = results ?? new List<LootResult>();
            TotalGold = totalGold;
        }
    }

    /// <summary>
    /// Result of a single loot roll.
    /// </summary>
    [Serializable]
    public class LootResult
    {
        /// <summary>Item ID that dropped.</summary>
        public string ItemId { get; set; }

        /// <summary>Quantity of items dropped.</summary>
        public int Quantity { get; set; }

        /// <summary>Whether this was a guaranteed drop.</summary>
        public bool WasGuaranteed { get; set; }

        public LootResult()
        {
        }

        public LootResult(string itemId, int quantity, bool wasGuaranteed = false)
        {
            ItemId = itemId;
            Quantity = quantity;
            WasGuaranteed = wasGuaranteed;
        }

        public override string ToString()
        {
            return $"{Quantity}x {ItemId}{(WasGuaranteed ? " (guaranteed)" : "")}";
        }
    }

    /// <summary>
    /// Loot table entry for JSON deserialization.
    /// </summary>
    [Serializable]
    public class LootTableEntry
    {
        /// <summary>Item ID to drop.</summary>
        public string itemId;

        /// <summary>Weight for random selection (-1 = guaranteed drop).</summary>
        public float weight;

        /// <summary>Minimum quantity to drop.</summary>
        public int minQuantity = 1;

        /// <summary>Maximum quantity to drop.</summary>
        public int maxQuantity = 1;

        /// <summary>Minimum player level for this drop (0 = no minimum).</summary>
        public int minPlayerLevel = 0;

        /// <summary>Maximum player level for this drop (0 = no maximum).</summary>
        public int maxPlayerLevel = 0;

        /// <summary>Required quest ID for this drop to be available.</summary>
        public string requiredQuestId;

        /// <summary>Whether this is a guaranteed drop.</summary>
        public bool IsGuaranteed => weight < 0;
    }

    /// <summary>
    /// Loot table definition for JSON deserialization.
    /// </summary>
    [Serializable]
    public class LootTableDefinition
    {
        /// <summary>Unique identifier for this table.</summary>
        public string id;

        /// <summary>Display name for this table.</summary>
        public string name;

        /// <summary>Loot entries with weights.</summary>
        public List<LootTableEntry> entries = new List<LootTableEntry>();

        /// <summary>Number of rolls on this table.</summary>
        public int rolls = 1;

        /// <summary>Chance for a roll to produce nothing (0-1).</summary>
        public float emptyChance = 0f;
    }

    /// <summary>
    /// Wrapper for JSON deserialization of loot tables array.
    /// </summary>
    [Serializable]
    internal class LootTablesWrapper
    {
        public string version;
        public string description;
        public List<LootTableDefinition> lootTables = new List<LootTableDefinition>();
    }

    /// <summary>
    /// Enemy-to-loot-table mapping entry for JSON deserialization.
    /// </summary>
    [Serializable]
    internal class EnemyLootMapping
    {
        public string enemyId;
        public string lootTableId;
    }

    /// <summary>
    /// Wrapper for enemy loot mappings.
    /// </summary>
    [Serializable]
    internal class EnemyLootMappingsWrapper
    {
        public List<EnemyLootMapping> mappings = new List<EnemyLootMapping>();
    }

    /// <summary>
    /// Save data for the loot system.
    /// </summary>
    [Serializable]
    public class LootSystemSaveData
    {
        /// <summary>Total items generated.</summary>
        public int totalItemsGenerated;

        /// <summary>Total gold generated.</summary>
        public int totalGoldGenerated;

        /// <summary>Total loot rolls made.</summary>
        public int totalRollsMade;

        /// <summary>Last update timestamp.</summary>
        public long lastUpdated;
    }

    /// <summary>
    /// Loot generation system using weighted random selection.
    /// Manages loot tables loaded from JSON data files and generates
    /// random drops based on weighted probability.
    /// </summary>
    /// <remarks>
    /// Features:
    /// - Weighted random selection algorithm
    /// - Guaranteed drops (weight = -1)
    /// - Level-gated drops
    /// - Quest-gated drops
    /// - Integration with InventoryManager
    /// - Integration with CombatManager for post-combat rewards
    /// - Configurable rolls and empty chance per table
    /// </remarks>
    public class LootSystem : MonoBehaviour
    {
        #region Singleton

        private static LootSystem _instance;

        /// <summary>
        /// Global singleton instance of LootSystem.
        /// </summary>
        public static LootSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<LootSystem>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[LootSystem]");
                        _instance = go.AddComponent<LootSystem>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when loot is generated.</summary>
        public event EventHandler<LootGeneratedEventArgs> OnLootGenerated;

        /// <summary>Fired when loot is added to inventory.</summary>
        public event EventHandler<LootGeneratedEventArgs> OnLootCollected;

        #endregion

        #region Configuration

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Path to loot tables JSON file (relative to Resources)")]
        private string lootTablesPath = "Data/LootTables/lootTables";

        [SerializeField]
        [Tooltip("Auto-add loot to inventory when generated")]
        private bool autoAddToInventory = true;

        [SerializeField]
        [Tooltip("Current player level for level-gated drops")]
        private int playerLevel = 1;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Loot table lookup by ID
        private readonly Dictionary<string, LootTableDefinition> _lootTables =
            new Dictionary<string, LootTableDefinition>();

        // Enemy to loot table mapping
        private readonly Dictionary<string, string> _enemyLootMappings =
            new Dictionary<string, string>();

        // Statistics tracking
        private int _totalItemsGenerated = 0;
        private int _totalGoldGenerated = 0;
        private int _totalRollsMade = 0;

        // Initialization flag
        private bool _isInitialized = false;

        #endregion

        #region Properties

        /// <summary>Number of loaded loot tables.</summary>
        public int TableCount => _lootTables.Count;

        /// <summary>Total items generated since start.</summary>
        public int TotalItemsGenerated => _totalItemsGenerated;

        /// <summary>Total gold generated since start.</summary>
        public int TotalGoldGenerated => _totalGoldGenerated;

        /// <summary>Total loot rolls made since start.</summary>
        public int TotalRollsMade => _totalRollsMade;

        /// <summary>Whether the system is initialized.</summary>
        public bool IsInitialized => _isInitialized;

        /// <summary>Current player level for filtering drops.</summary>
        public int PlayerLevel
        {
            get => playerLevel;
            set => playerLevel = Mathf.Max(1, value);
        }

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

            LoadLootTables();
            Log("LootSystem initialized");
        }

        private void Start()
        {
            // Subscribe to combat events for automatic loot generation
            if (EventBus.Instance != null)
            {
                EventBus.Instance.Subscribe(GameEvents.CombatVictory, OnCombatVictory);
                EventBus.Instance.Subscribe(GameEvents.PlayerLevelUp, OnPlayerLevelUp);
            }

            // Register with save system
            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.RegisterSaveProvider("loot", GetSaveDataJson);
                SaveSystem.Instance.RegisterLoadConsumer("loot", LoadSaveDataJson);
            }
        }

        private void OnDestroy()
        {
            if (EventBus.Instance != null)
            {
                EventBus.Instance.Unsubscribe(GameEvents.CombatVictory, OnCombatVictory);
                EventBus.Instance.Unsubscribe(GameEvents.PlayerLevelUp, OnPlayerLevelUp);
            }

            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.Unregister("loot");
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Loading

        /// <summary>
        /// Load loot tables from JSON resources.
        /// </summary>
        public void LoadLootTables()
        {
            _lootTables.Clear();
            _enemyLootMappings.Clear();

            // Try to load dedicated loot tables file
            LoadLootTablesFromFile(lootTablesPath);

            // Also extract loot tables from enemy data files
            LoadLootTablesFromEnemies("Data/Enemies/enemies");
            LoadLootTablesFromEnemies("Data/Enemies/bosses");

            _isInitialized = true;
            Log($"Loaded {_lootTables.Count} loot tables and {_enemyLootMappings.Count} enemy mappings");
        }

        private void LoadLootTablesFromFile(string path)
        {
            var textAsset = Resources.Load<TextAsset>(path);
            if (textAsset == null)
            {
                Log($"No loot tables file found at: {path}");
                return;
            }

            try
            {
                var wrapper = JsonUtility.FromJson<LootTablesWrapper>(textAsset.text);
                if (wrapper?.lootTables != null)
                {
                    foreach (var table in wrapper.lootTables)
                    {
                        if (!string.IsNullOrEmpty(table.id))
                        {
                            _lootTables[table.id] = table;
                            Log($"Loaded loot table: {table.id}");
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[LootSystem] Failed to parse loot tables from {path}: {e.Message}");
            }
        }

        private void LoadLootTablesFromEnemies(string path)
        {
            var textAsset = Resources.Load<TextAsset>(path);
            if (textAsset == null)
            {
                Log($"No enemy data found at: {path}");
                return;
            }

            try
            {
                // Parse enemy data to extract inline loot tables
                var json = textAsset.text;

                // Extract enemies array using simple parsing
                // Since JsonUtility doesn't handle complex nested structures well,
                // we parse the enemy data to extract loot table info
                var wrapper = JsonUtility.FromJson<EnemyDataWrapper>(json);
                if (wrapper?.enemies != null)
                {
                    foreach (var enemy in wrapper.enemies)
                    {
                        // Map enemy to loot table
                        if (!string.IsNullOrEmpty(enemy.lootTableId))
                        {
                            _enemyLootMappings[enemy.id] = enemy.lootTableId;
                        }

                        // Store inline loot table if present
                        if (enemy.lootTable != null && !string.IsNullOrEmpty(enemy.lootTable.id))
                        {
                            _lootTables[enemy.lootTable.id] = enemy.lootTable;
                            Log($"Extracted loot table from enemy {enemy.id}: {enemy.lootTable.id}");
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[LootSystem] Failed to extract loot tables from enemies at {path}: {e.Message}");
            }
        }

        /// <summary>
        /// Internal wrapper for parsing enemy data with loot tables.
        /// </summary>
        [Serializable]
        private class EnemyDataWrapper
        {
            public string version;
            public List<EnemyDataJson> enemies;
        }

        [Serializable]
        private class EnemyDataJson
        {
            public string id;
            public string lootTableId;
            public LootTableDefinition lootTable;
        }

        #endregion

        #region Table Management

        /// <summary>
        /// Get a loot table by ID.
        /// </summary>
        /// <param name="tableId">Loot table ID.</param>
        /// <returns>Loot table definition or null if not found.</returns>
        public LootTableDefinition GetLootTable(string tableId)
        {
            return _lootTables.TryGetValue(tableId, out var table) ? table : null;
        }

        /// <summary>
        /// Get the loot table ID for an enemy.
        /// </summary>
        /// <param name="enemyId">Enemy ID.</param>
        /// <returns>Loot table ID or null if no mapping exists.</returns>
        public string GetEnemyLootTableId(string enemyId)
        {
            return _enemyLootMappings.TryGetValue(enemyId, out var tableId) ? tableId : null;
        }

        /// <summary>
        /// Get the loot table for an enemy.
        /// </summary>
        /// <param name="enemyId">Enemy ID.</param>
        /// <returns>Loot table definition or null if not found.</returns>
        public LootTableDefinition GetEnemyLootTable(string enemyId)
        {
            var tableId = GetEnemyLootTableId(enemyId);
            return string.IsNullOrEmpty(tableId) ? null : GetLootTable(tableId);
        }

        /// <summary>
        /// Register a loot table at runtime.
        /// </summary>
        /// <param name="table">Loot table to register.</param>
        public void RegisterLootTable(LootTableDefinition table)
        {
            if (table == null || string.IsNullOrEmpty(table.id)) return;

            _lootTables[table.id] = table;
            Log($"Registered loot table: {table.id}");
        }

        /// <summary>
        /// Register an enemy to loot table mapping.
        /// </summary>
        /// <param name="enemyId">Enemy ID.</param>
        /// <param name="lootTableId">Loot table ID.</param>
        public void RegisterEnemyLootMapping(string enemyId, string lootTableId)
        {
            if (string.IsNullOrEmpty(enemyId) || string.IsNullOrEmpty(lootTableId)) return;

            _enemyLootMappings[enemyId] = lootTableId;
            Log($"Registered enemy loot mapping: {enemyId} -> {lootTableId}");
        }

        /// <summary>
        /// Get all loot table IDs.
        /// </summary>
        /// <returns>Array of loot table IDs.</returns>
        public string[] GetAllTableIds()
        {
            return _lootTables.Keys.ToArray();
        }

        #endregion

        #region Loot Rolling

        /// <summary>
        /// Roll loot from a table by ID.
        /// </summary>
        /// <param name="tableId">Loot table ID.</param>
        /// <param name="sourceId">Optional source ID for event tracking.</param>
        /// <param name="overridePlayerLevel">Optional level override for filtering.</param>
        /// <returns>List of loot results.</returns>
        public List<LootResult> RollLoot(string tableId, string sourceId = null, int? overridePlayerLevel = null)
        {
            var table = GetLootTable(tableId);
            if (table == null)
            {
                LogWarning($"Loot table not found: {tableId}");
                return new List<LootResult>();
            }

            return RollLoot(table, sourceId, overridePlayerLevel);
        }

        /// <summary>
        /// Roll loot from a table directly.
        /// </summary>
        /// <param name="table">Loot table definition.</param>
        /// <param name="sourceId">Optional source ID for event tracking.</param>
        /// <param name="overridePlayerLevel">Optional level override for filtering.</param>
        /// <returns>List of loot results.</returns>
        public List<LootResult> RollLoot(LootTableDefinition table, string sourceId = null, int? overridePlayerLevel = null)
        {
            if (table == null)
            {
                LogWarning("Cannot roll loot from null table");
                return new List<LootResult>();
            }

            var results = new List<LootResult>();
            int effectiveLevel = overridePlayerLevel ?? playerLevel;

            Log($"Rolling loot from table: {table.id} (rolls: {table.rolls}, emptyChance: {table.emptyChance})");

            // First, process guaranteed drops
            var guaranteedDrops = ProcessGuaranteedDrops(table, effectiveLevel);
            results.AddRange(guaranteedDrops);

            // Then process weighted random rolls
            var eligibleEntries = GetEligibleEntries(table, effectiveLevel)
                .Where(e => !e.IsGuaranteed)
                .ToList();

            if (eligibleEntries.Count > 0)
            {
                for (int roll = 0; roll < table.rolls; roll++)
                {
                    _totalRollsMade++;

                    // Check for empty roll
                    if (table.emptyChance > 0 && UnityEngine.Random.value < table.emptyChance)
                    {
                        Log($"Roll {roll + 1}: Empty (emptyChance triggered)");
                        continue;
                    }

                    // Perform weighted random selection
                    var selected = SelectWeightedEntry(eligibleEntries);
                    if (selected != null)
                    {
                        var result = CreateLootResult(selected);
                        results.Add(result);
                        Log($"Roll {roll + 1}: {result}");
                    }
                }
            }

            // Merge duplicate items
            results = MergeLootResults(results);

            // Update statistics
            foreach (var result in results)
            {
                _totalItemsGenerated += result.Quantity;
            }

            // Fire event
            var eventArgs = new LootGeneratedEventArgs(sourceId ?? table.id, table.id, results);
            OnLootGenerated?.Invoke(this, eventArgs);

            // Publish to EventBus
            EventBus.Instance?.Publish("loot_generated", table.id);

            // Auto-add to inventory if enabled
            if (autoAddToInventory)
            {
                AddLootToInventory(results);
            }

            return results;
        }

        /// <summary>
        /// Roll loot for a defeated enemy.
        /// </summary>
        /// <param name="enemyId">Enemy ID.</param>
        /// <param name="goldReward">Gold dropped by the enemy.</param>
        /// <returns>List of loot results.</returns>
        public List<LootResult> RollEnemyLoot(string enemyId, int goldReward = 0)
        {
            var table = GetEnemyLootTable(enemyId);
            if (table == null)
            {
                Log($"No loot table for enemy: {enemyId}");
                return new List<LootResult>();
            }

            var results = RollLoot(table, enemyId);

            // Handle gold separately
            if (goldReward > 0)
            {
                _totalGoldGenerated += goldReward;
                InventoryManager.Instance?.AddGold(goldReward);
            }

            return results;
        }

        /// <summary>
        /// Process guaranteed drops from a loot table.
        /// </summary>
        private List<LootResult> ProcessGuaranteedDrops(LootTableDefinition table, int level)
        {
            var results = new List<LootResult>();

            foreach (var entry in table.entries)
            {
                if (!entry.IsGuaranteed) continue;
                if (!IsEntryEligible(entry, level)) continue;

                var result = CreateLootResult(entry);
                result.WasGuaranteed = true;
                results.Add(result);
                Log($"Guaranteed drop: {result}");
            }

            return results;
        }

        /// <summary>
        /// Get eligible entries based on player level and quest requirements.
        /// </summary>
        private List<LootTableEntry> GetEligibleEntries(LootTableDefinition table, int level)
        {
            return table.entries.Where(e => IsEntryEligible(e, level)).ToList();
        }

        /// <summary>
        /// Check if an entry is eligible based on level and quest requirements.
        /// </summary>
        private bool IsEntryEligible(LootTableEntry entry, int level)
        {
            // Check minimum level
            if (entry.minPlayerLevel > 0 && level < entry.minPlayerLevel)
            {
                return false;
            }

            // Check maximum level
            if (entry.maxPlayerLevel > 0 && level > entry.maxPlayerLevel)
            {
                return false;
            }

            // Check quest requirement
            if (!string.IsNullOrEmpty(entry.requiredQuestId))
            {
                // TODO: Integrate with QuestManager to check quest completion
                // For now, we assume the quest check passes if QuestManager is not available
                // var questManager = QuestManager.Instance;
                // if (questManager != null && !questManager.IsQuestComplete(entry.requiredQuestId))
                // {
                //     return false;
                // }
            }

            return true;
        }

        /// <summary>
        /// Perform weighted random selection from a list of entries.
        /// </summary>
        private LootTableEntry SelectWeightedEntry(List<LootTableEntry> entries)
        {
            if (entries == null || entries.Count == 0)
                return null;

            // Calculate total weight
            float totalWeight = 0f;
            foreach (var entry in entries)
            {
                if (entry.weight > 0)
                {
                    totalWeight += entry.weight;
                }
            }

            if (totalWeight <= 0)
                return null;

            // Roll random value
            float roll = UnityEngine.Random.Range(0f, totalWeight);

            // Select entry based on weight
            foreach (var entry in entries)
            {
                if (entry.weight <= 0) continue;

                if (roll < entry.weight)
                {
                    return entry;
                }
                roll -= entry.weight;
            }

            // Fallback to last valid entry
            return entries.LastOrDefault(e => e.weight > 0);
        }

        /// <summary>
        /// Create a loot result from an entry with random quantity.
        /// </summary>
        private LootResult CreateLootResult(LootTableEntry entry)
        {
            int quantity = entry.minQuantity;
            if (entry.maxQuantity > entry.minQuantity)
            {
                quantity = UnityEngine.Random.Range(entry.minQuantity, entry.maxQuantity + 1);
            }

            return new LootResult(entry.itemId, quantity);
        }

        /// <summary>
        /// Merge duplicate items in loot results.
        /// </summary>
        private List<LootResult> MergeLootResults(List<LootResult> results)
        {
            var merged = new Dictionary<string, LootResult>();

            foreach (var result in results)
            {
                if (merged.TryGetValue(result.ItemId, out var existing))
                {
                    existing.Quantity += result.Quantity;
                    existing.WasGuaranteed = existing.WasGuaranteed || result.WasGuaranteed;
                }
                else
                {
                    merged[result.ItemId] = new LootResult(result.ItemId, result.Quantity, result.WasGuaranteed);
                }
            }

            return merged.Values.ToList();
        }

        #endregion

        #region Inventory Integration

        /// <summary>
        /// Add loot results to the player's inventory.
        /// </summary>
        /// <param name="results">List of loot results to add.</param>
        /// <returns>True if all items were added successfully.</returns>
        public bool AddLootToInventory(List<LootResult> results)
        {
            if (results == null || results.Count == 0)
                return true;

            var inventory = InventoryManager.Instance;
            if (inventory == null)
            {
                LogWarning("InventoryManager not available, cannot add loot");
                return false;
            }

            bool allAdded = true;
            var addedResults = new List<LootResult>();

            foreach (var result in results)
            {
                int added = inventory.AddItemById(result.ItemId, result.Quantity);
                if (added < result.Quantity)
                {
                    LogWarning($"Could not add all of {result.ItemId}: added {added}/{result.Quantity}");
                    allAdded = false;
                }

                if (added > 0)
                {
                    addedResults.Add(new LootResult(result.ItemId, added, result.WasGuaranteed));
                }
            }

            // Fire collected event
            if (addedResults.Count > 0)
            {
                var eventArgs = new LootGeneratedEventArgs("inventory", "", addedResults);
                OnLootCollected?.Invoke(this, eventArgs);
            }

            return allAdded;
        }

        #endregion

        #region Combat Integration

        /// <summary>
        /// Handle combat victory event to generate loot.
        /// </summary>
        private void OnCombatVictory(string data)
        {
            Log($"Combat victory event received: {data}");
            // The actual loot generation is handled by the CombatManager
            // which calls RollEnemyLoot for each defeated enemy
        }

        /// <summary>
        /// Generate loot for all defeated enemies in a combat.
        /// </summary>
        /// <param name="defeatedEnemies">List of defeated enemy data.</param>
        /// <returns>Combined loot results from all enemies.</returns>
        public List<LootResult> GenerateCombatLoot(List<EnemyData> defeatedEnemies)
        {
            var allResults = new List<LootResult>();
            int totalGold = 0;

            foreach (var enemy in defeatedEnemies)
            {
                if (enemy == null) continue;

                // Roll loot from the enemy's table
                var tableId = !string.IsNullOrEmpty(enemy.lootTableId)
                    ? enemy.lootTableId
                    : enemy.lootTable.id;

                if (!string.IsNullOrEmpty(tableId))
                {
                    var enemyResults = RollLoot(tableId, enemy.id);
                    allResults.AddRange(enemyResults);
                }

                // Add gold
                totalGold += enemy.goldReward;
            }

            // Merge results
            allResults = MergeLootResults(allResults);

            // Add gold
            if (totalGold > 0)
            {
                _totalGoldGenerated += totalGold;
                InventoryManager.Instance?.AddGold(totalGold);
            }

            Log($"Generated combat loot: {allResults.Count} items, {totalGold} gold");
            return allResults;
        }

        #endregion

        #region Player Level Integration

        /// <summary>
        /// Handle player level up event.
        /// </summary>
        private void OnPlayerLevelUp(string data)
        {
            if (int.TryParse(data, out int newLevel))
            {
                playerLevel = newLevel;
                Log($"Player level updated to: {newLevel}");
            }
        }

        /// <summary>
        /// Set the player level for loot filtering.
        /// </summary>
        /// <param name="level">New player level.</param>
        public void SetPlayerLevel(int level)
        {
            playerLevel = Mathf.Max(1, level);
            Log($"Player level set to: {playerLevel}");
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data.
        /// </summary>
        public LootSystemSaveData GetSaveData()
        {
            return new LootSystemSaveData
            {
                totalItemsGenerated = _totalItemsGenerated,
                totalGoldGenerated = _totalGoldGenerated,
                totalRollsMade = _totalRollsMade,
                lastUpdated = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }

        /// <summary>
        /// Load from save data.
        /// </summary>
        public void LoadSaveData(LootSystemSaveData data)
        {
            if (data == null) return;

            _totalItemsGenerated = data.totalItemsGenerated;
            _totalGoldGenerated = data.totalGoldGenerated;
            _totalRollsMade = data.totalRollsMade;

            Log("Loaded save data");
        }

        private string GetSaveDataJson()
        {
            return JsonUtility.ToJson(GetSaveData());
        }

        private void LoadSaveDataJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return;

            try
            {
                var data = JsonUtility.FromJson<LootSystemSaveData>(json);
                LoadSaveData(data);
            }
            catch (Exception e)
            {
                Debug.LogError($"[LootSystem] Failed to load save data: {e}");
            }
        }

        /// <summary>
        /// Reset statistics.
        /// </summary>
        public void ResetStatistics()
        {
            _totalItemsGenerated = 0;
            _totalGoldGenerated = 0;
            _totalRollsMade = 0;
            Log("Statistics reset");
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Preview possible drops from a loot table without rolling.
        /// Useful for UI tooltips or drop rate displays.
        /// </summary>
        /// <param name="tableId">Loot table ID.</param>
        /// <returns>List of possible drops with their probabilities.</returns>
        public List<(string itemId, float chance, int minQty, int maxQty)> GetPossibleDrops(string tableId)
        {
            var results = new List<(string, float, int, int)>();
            var table = GetLootTable(tableId);
            if (table == null) return results;

            var eligibleEntries = GetEligibleEntries(table, playerLevel);
            float totalWeight = eligibleEntries.Where(e => e.weight > 0).Sum(e => e.weight);

            foreach (var entry in eligibleEntries)
            {
                float chance;
                if (entry.IsGuaranteed)
                {
                    chance = 1f;
                }
                else if (totalWeight > 0)
                {
                    // Calculate chance per roll, accounting for empty chance
                    float baseChance = entry.weight / totalWeight;
                    float effectiveChance = baseChance * (1f - table.emptyChance);
                    // For multiple rolls, use complement probability
                    chance = 1f - Mathf.Pow(1f - effectiveChance, table.rolls);
                }
                else
                {
                    chance = 0f;
                }

                results.Add((entry.itemId, chance, entry.minQuantity, entry.maxQuantity));
            }

            return results.OrderByDescending(r => r.Item2).ToList();
        }

        /// <summary>
        /// Get formatted drop chance string for UI display.
        /// </summary>
        /// <param name="tableId">Loot table ID.</param>
        /// <returns>Formatted string listing possible drops.</returns>
        public string GetDropChanceDescription(string tableId)
        {
            var drops = GetPossibleDrops(tableId);
            if (drops.Count == 0) return "No drops";

            var lines = drops.Select(d =>
            {
                string qtyStr = d.minQty == d.maxQty ? $"{d.minQty}" : $"{d.minQty}-{d.maxQty}";
                string chanceStr = d.chance >= 1f ? "Guaranteed" : $"{d.chance * 100:F1}%";
                return $"  {d.itemId} x{qtyStr} ({chanceStr})";
            });

            return string.Join("\n", lines);
        }

        #endregion

        #region Debug

        /// <summary>
        /// Debug: Roll a table multiple times and display statistics.
        /// </summary>
        [ContextMenu("Debug: Test Roll 100x")]
        private void DebugTestRolls()
        {
            var tableIds = GetAllTableIds();
            if (tableIds.Length == 0)
            {
                Debug.Log("[LootSystem] No tables loaded");
                return;
            }

            var tableId = tableIds[0];
            var dropCounts = new Dictionary<string, int>();

            for (int i = 0; i < 100; i++)
            {
                var results = RollLoot(tableId, null, 1);
                foreach (var result in results)
                {
                    if (!dropCounts.ContainsKey(result.ItemId))
                        dropCounts[result.ItemId] = 0;
                    dropCounts[result.ItemId] += result.Quantity;
                }
            }

            Debug.Log($"[LootSystem] Test rolls for {tableId}:");
            foreach (var kvp in dropCounts.OrderByDescending(k => k.Value))
            {
                Debug.Log($"  {kvp.Key}: {kvp.Value}");
            }
        }

        /// <summary>
        /// Debug: List all loaded tables.
        /// </summary>
        [ContextMenu("Debug: List Tables")]
        private void DebugListTables()
        {
            Debug.Log($"[LootSystem] Loaded {_lootTables.Count} tables:");
            foreach (var table in _lootTables.Values)
            {
                Debug.Log($"  {table.id}: {table.entries.Count} entries, {table.rolls} rolls");
            }

            Debug.Log($"[LootSystem] {_enemyLootMappings.Count} enemy mappings:");
            foreach (var mapping in _enemyLootMappings)
            {
                Debug.Log($"  {mapping.Key} -> {mapping.Value}");
            }
        }

        /// <summary>
        /// Debug: Log statistics.
        /// </summary>
        [ContextMenu("Debug: Log Statistics")]
        private void DebugLogStatistics()
        {
            Debug.Log($"[LootSystem] Statistics:");
            Debug.Log($"  Total Items Generated: {_totalItemsGenerated}");
            Debug.Log($"  Total Gold Generated: {_totalGoldGenerated}");
            Debug.Log($"  Total Rolls Made: {_totalRollsMade}");
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[LootSystem] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[LootSystem] {message}");
        }

        #endregion
    }
}
