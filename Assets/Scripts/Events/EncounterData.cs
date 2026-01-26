using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Events
{
    /// <summary>
    /// Encounter category types.
    /// </summary>
    public enum EncounterCategory
    {
        Bandit,
        Wildlife,
        Faction,
        Special,
        Environmental,
        Copperhead,
        Remnant,
        NPC,
        EnvironmentalEvent
    }

    /// <summary>
    /// Time of day constraints for encounters.
    /// </summary>
    public enum TimeOfDay
    {
        Dawn,
        Morning,
        Afternoon,
        Evening,
        Night,
        Any
    }

    /// <summary>
    /// Biome types where encounters can occur.
    /// </summary>
    public enum BiomeType
    {
        Desert,
        Badlands,
        Grassland,
        Scrubland,
        Mountain,
        Riverside,
        SaltFlat,
        Any
    }

    /// <summary>
    /// Location types for encounter filtering.
    /// </summary>
    public enum LocationType
    {
        Wilderness,
        Trail,
        Road,
        Town,
        Village,
        Hamlet,
        Waystation,
        Outpost,
        Hideout,
        Camp,
        Ruins,
        Cave,
        Mine,
        Quarry,
        Ranch,
        Farm,
        TradingPost,
        TrainStation,
        Crossroads,
        Canyon,
        Any
    }

    /// <summary>
    /// Enemy composition entry for an encounter.
    /// </summary>
    [Serializable]
    public struct EncounterEnemyEntry
    {
        /// <summary>Enemy ID or tag for lookup.</summary>
        public string enemyIdOrTag;

        /// <summary>Minimum enemy count.</summary>
        [Min(0)]
        public int minCount;

        /// <summary>Maximum enemy count.</summary>
        [Min(1)]
        public int maxCount;

        /// <summary>Level scaling factor (1.0 = normal).</summary>
        [Range(0.5f, 2.0f)]
        public float levelScale;

        public EncounterEnemyEntry(string enemyIdOrTag, int minCount, int maxCount, float levelScale = 1.0f)
        {
            this.enemyIdOrTag = enemyIdOrTag;
            this.minCount = minCount;
            this.maxCount = maxCount;
            this.levelScale = levelScale;
        }
    }

    /// <summary>
    /// Zone-based encounter table entry.
    /// </summary>
    [Serializable]
    public struct ZoneEncounterEntry
    {
        /// <summary>Encounter ID.</summary>
        public string encounterId;

        /// <summary>Weight for random selection.</summary>
        [Min(0)]
        public float weight;

        public ZoneEncounterEntry(string encounterId, float weight)
        {
            this.encounterId = encounterId;
            this.weight = weight;
        }
    }

    /// <summary>
    /// Zone encounter table defining encounters for a specific zone.
    /// </summary>
    [Serializable]
    public struct ZoneEncounterTable
    {
        /// <summary>Zone identifier (biome or region).</summary>
        public string zoneId;

        /// <summary>Minimum player level for this zone.</summary>
        [Min(1)]
        public int minLevel;

        /// <summary>Maximum player level for this zone.</summary>
        [Min(1)]
        public int maxLevel;

        /// <summary>Base encounter chance (0-1).</summary>
        [Range(0f, 1f)]
        public float encounterChance;

        /// <summary>Weighted encounter entries.</summary>
        public List<ZoneEncounterEntry> entries;
    }

    /// <summary>
    /// Encounter data definition as a ScriptableObject.
    /// Defines combat encounter templates with enemies, rewards, and spawn conditions.
    /// </summary>
    [CreateAssetMenu(fileName = "New Encounter", menuName = "Iron Frontier/Data/Encounter Data", order = 20)]
    public class EncounterData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier.</summary>
        [Tooltip("Unique identifier")]
        public string id;

        /// <summary>Display name.</summary>
        [Tooltip("Display name")]
        public string displayName;

        /// <summary>Description template with {{variable}} placeholders.</summary>
        [Tooltip("Description template")]
        [TextArea(2, 4)]
        public string descriptionTemplate;

        /// <summary>Encounter category.</summary>
        [Tooltip("Encounter category")]
        public EncounterCategory category = EncounterCategory.Bandit;

        [Header("Enemies")]
        /// <summary>Enemy composition for this encounter.</summary>
        [Tooltip("Enemy entries")]
        public List<EncounterEnemyEntry> enemies = new List<EncounterEnemyEntry>();

        /// <summary>Is this a non-combat encounter (NPC/environmental)?</summary>
        [Tooltip("Non-combat encounter")]
        public bool isNonCombat = false;

        /// <summary>NPC ID for non-combat encounters.</summary>
        [Tooltip("NPC ID for non-combat")]
        public string npcId;

        /// <summary>Environmental effect for environmental events.</summary>
        [Tooltip("Environmental effect")]
        public string environmentalEffect;

        [Header("Difficulty")]
        /// <summary>Minimum difficulty rating (1-10).</summary>
        [Tooltip("Min difficulty")]
        [Range(0, 10)]
        public int minDifficulty = 1;

        /// <summary>Maximum difficulty rating (1-10).</summary>
        [Tooltip("Max difficulty")]
        [Range(0, 10)]
        public int maxDifficulty = 5;

        [Header("Spawn Conditions")]
        /// <summary>Valid biomes for this encounter.</summary>
        [Tooltip("Valid biomes")]
        public List<BiomeType> validBiomes = new List<BiomeType>();

        /// <summary>Valid location types.</summary>
        [Tooltip("Valid location types")]
        public List<LocationType> validLocationTypes = new List<LocationType>();

        /// <summary>Valid times of day.</summary>
        [Tooltip("Valid times of day")]
        public List<TimeOfDay> validTimeOfDay = new List<TimeOfDay>();

        /// <summary>Faction tags for filtering.</summary>
        [Tooltip("Faction tags")]
        public List<string> factionTags = new List<string>();

        [Header("Rewards")]
        /// <summary>Loot table ID.</summary>
        [Tooltip("Loot table ID")]
        public string lootTableId;

        /// <summary>Minimum XP reward.</summary>
        [Tooltip("Min XP")]
        [Min(0)]
        public int minXp = 10;

        /// <summary>Maximum XP reward.</summary>
        [Tooltip("Max XP")]
        [Min(0)]
        public int maxXp = 50;

        /// <summary>Minimum gold reward.</summary>
        [Tooltip("Min gold")]
        [Min(0)]
        public int minGold = 0;

        /// <summary>Maximum gold reward.</summary>
        [Tooltip("Max gold")]
        [Min(0)]
        public int maxGold = 20;

        [Header("Metadata")]
        /// <summary>Tags for filtering and identification.</summary>
        [Tooltip("Tags")]
        public List<string> tags = new List<string>();

        /// <summary>Checks if this encounter has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Checks if this encounter is valid for the given biome.</summary>
        public bool IsValidForBiome(BiomeType biome)
        {
            if (validBiomes == null || validBiomes.Count == 0)
                return true;
            return validBiomes.Contains(biome) || validBiomes.Contains(BiomeType.Any);
        }

        /// <summary>Checks if this encounter is valid for the given location type.</summary>
        public bool IsValidForLocationType(LocationType locationType)
        {
            if (validLocationTypes == null || validLocationTypes.Count == 0)
                return true;
            return validLocationTypes.Contains(locationType) || validLocationTypes.Contains(LocationType.Any);
        }

        /// <summary>Checks if this encounter is valid for the given time of day.</summary>
        public bool IsValidForTime(TimeOfDay time)
        {
            if (validTimeOfDay == null || validTimeOfDay.Count == 0)
                return true;
            return validTimeOfDay.Contains(time) || validTimeOfDay.Contains(TimeOfDay.Any);
        }

        /// <summary>Checks if this encounter is valid for the given player level.</summary>
        public bool IsValidForLevel(int playerLevel)
        {
            return playerLevel >= minDifficulty && playerLevel <= maxDifficulty + 3;
        }

        /// <summary>Gets a random enemy count for a given entry.</summary>
        public int GetRandomEnemyCount(int entryIndex)
        {
            if (entryIndex < 0 || entryIndex >= enemies.Count)
                return 0;

            var entry = enemies[entryIndex];
            return UnityEngine.Random.Range(entry.minCount, entry.maxCount + 1);
        }

        /// <summary>Gets a random XP reward.</summary>
        public int GetRandomXpReward()
        {
            return UnityEngine.Random.Range(minXp, maxXp + 1);
        }

        /// <summary>Gets a random gold reward.</summary>
        public int GetRandomGoldReward()
        {
            return UnityEngine.Random.Range(minGold, maxGold + 1);
        }

        /// <summary>Generates a description from the template with variable substitution.</summary>
        public string GenerateDescription(Dictionary<string, string> variables = null)
        {
            if (string.IsNullOrEmpty(descriptionTemplate))
                return "";

            string result = descriptionTemplate;

            if (variables != null)
            {
                foreach (var kvp in variables)
                {
                    result = result.Replace("{{" + kvp.Key + "}}", kvp.Value);
                }
            }

            // Fill in any remaining placeholders with defaults
            result = result.Replace("{{adjective}}", GetRandomAdjective());
            result = result.Replace("{{terrain}}", GetRandomTerrain());
            result = result.Replace("{{cover}}", GetRandomCover());
            result = result.Replace("{{clothing}}", GetRandomClothing());
            result = result.Replace("{{direction}}", GetRandomDirection());
            result = result.Replace("{{count}}", UnityEngine.Random.Range(3, 8).ToString());

            return result;
        }

        private string GetRandomAdjective()
        {
            string[] adjectives = { "weathered", "grizzled", "desperate", "scarred", "wild-eyed", "dusty" };
            return adjectives[UnityEngine.Random.Range(0, adjectives.Length)];
        }

        private string GetRandomTerrain()
        {
            string[] terrains = { "trail", "road", "path", "canyon", "pass", "clearing" };
            return terrains[UnityEngine.Random.Range(0, terrains.Length)];
        }

        private string GetRandomCover()
        {
            string[] covers = { "rocks", "boulders", "scrub brush", "a wagon", "the ridge", "the shadows" };
            return covers[UnityEngine.Random.Range(0, covers.Length)];
        }

        private string GetRandomClothing()
        {
            string[] clothing = { "dusty duster", "black hat", "worn leather vest", "bandana", "tattered poncho" };
            return clothing[UnityEngine.Random.Range(0, clothing.Length)];
        }

        private string GetRandomDirection()
        {
            string[] directions = { "north", "south", "east", "west", "hills", "canyon" };
            return directions[UnityEngine.Random.Range(0, directions.Length)];
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }

            // Ensure max is >= min
            if (maxDifficulty < minDifficulty)
                maxDifficulty = minDifficulty;
            if (maxXp < minXp)
                maxXp = minXp;
            if (maxGold < minGold)
                maxGold = minGold;
        }
#endif
    }
}
