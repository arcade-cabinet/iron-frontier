using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Location type classification.
    /// </summary>
    public enum LocationType
    {
        Town,
        City,
        Village,
        Outpost,
        Mine,
        Camp,
        Ranch,
        Fort,
        Ruins,
        Cave,
        Encounter,
        Special
    }

    /// <summary>
    /// Location size category affecting slot count.
    /// </summary>
    public enum LocationSize
    {
        /// <summary>1-3 slots.</summary>
        Tiny,
        /// <summary>4-8 slots.</summary>
        Small,
        /// <summary>9-20 slots.</summary>
        Medium,
        /// <summary>21-50 slots.</summary>
        Large,
        /// <summary>50+ slots.</summary>
        Huge
    }

    /// <summary>
    /// Terrain type for tiles.
    /// </summary>
    public enum TerrainType
    {
        // Natural
        Grass,
        GrassHill,
        GrassForest,
        Sand,
        SandHill,
        SandDunes,
        Dirt,
        DirtHill,
        Stone,
        StoneHill,
        StoneMountain,
        StoneRocks,
        Water,
        WaterShallow,
        WaterDeep,
        Mesa,
        Canyon,
        Badlands
    }

    /// <summary>
    /// Slot types defining functional roles in a location.
    /// </summary>
    public enum SlotType
    {
        // Commerce
        Tavern,
        GeneralStore,
        Gunsmith,
        Doctor,
        Bank,
        Hotel,
        Stable,

        // Civic
        LawOffice,
        Church,
        Telegraph,
        TrainStation,

        // Industrial
        Mine,
        Smelter,
        Workshop,
        Farm,
        Ranch,

        // Residential
        Residence,
        ResidenceWealthy,
        ResidencePoor,

        // Wilderness & Camps
        Camp,
        Hideout,
        Waystation,
        WaterSource,
        Landmark,

        // Ruins & Abandoned
        Ruins,

        // Special
        QuestLocation,
        HiddenCache,
        AmbushPoint,
        MeetingPoint
    }

    /// <summary>
    /// Marker types for specific points within a slot.
    /// </summary>
    public enum MarkerType
    {
        // Universal
        Entrance,
        Exit,
        SpawnPoint,

        // Interaction
        Counter,
        Desk,
        Bed,
        Chair,
        Table,

        // Functional
        Storage,
        Display,
        Workbench,

        // Quest/Event
        EvidenceSpot,
        HidingSpot,
        AmbushTrigger,
        ConversationSpot,

        // Special
        Cell,
        Vault,
        Altar,
        Stage,

        // Wilderness
        RestSpot,
        VantagePoint
    }

    /// <summary>
    /// Zone types for areas within a slot.
    /// </summary>
    public enum ZoneType
    {
        LootArea,
        NpcArea,
        CombatArea,
        CombatZone,
        EventStage,
        DecorationArea,
        RestrictedArea,
        PublicArea
    }

    /// <summary>
    /// Entry point direction.
    /// </summary>
    public enum EntryDirection
    {
        North,
        South,
        East,
        West,
        Up,
        Down
    }

    /// <summary>
    /// Entry point connection type.
    /// </summary>
    public enum ConnectionType
    {
        Road,
        Trail,
        Railroad,
        River,
        Stairs,
        Portal
    }

    /// <summary>
    /// Population density hint.
    /// </summary>
    public enum PopulationDensity
    {
        Abandoned,
        Sparse,
        Normal,
        Crowded
    }

    /// <summary>
    /// Law level affecting NPC behavior.
    /// </summary>
    public enum LawLevel
    {
        Lawless,
        Frontier,
        Orderly,
        Strict
    }

    /// <summary>
    /// A marker within a slot for spawning/interaction.
    /// </summary>
    [Serializable]
    public struct LocationMarker
    {
        /// <summary>Marker type.</summary>
        public MarkerType type;

        /// <summary>Unique name within the slot.</summary>
        public string name;

        /// <summary>Position relative to slot anchor.</summary>
        public HexCoord offset;

        /// <summary>Facing direction (0-5).</summary>
        [Range(0, 5)]
        public int facing;

        /// <summary>Tags for additional filtering.</summary>
        public List<string> tags;
    }

    /// <summary>
    /// A zone within a slot for dynamic content.
    /// </summary>
    [Serializable]
    public struct LocationZone
    {
        /// <summary>Zone type.</summary>
        public ZoneType type;

        /// <summary>Unique name within the slot.</summary>
        public string name;

        /// <summary>Tiles that make up this zone.</summary>
        public List<HexCoord> tiles;

        /// <summary>Priority when zones overlap.</summary>
        public int priority;

        /// <summary>Tags for filtering.</summary>
        public List<string> tags;
    }

    /// <summary>
    /// A slot instance representing a functional area.
    /// </summary>
    [Serializable]
    public struct LocationSlot
    {
        /// <summary>Unique ID within the location.</summary>
        public string id;

        /// <summary>Functional type.</summary>
        public SlotType type;

        /// <summary>Human-readable name.</summary>
        public string displayName;

        /// <summary>Anchor position in location coordinates.</summary>
        public HexCoord anchor;

        /// <summary>Rotation (0-5).</summary>
        [Range(0, 5)]
        public int rotation;

        /// <summary>Interaction markers.</summary>
        public List<LocationMarker> markers;

        /// <summary>Fillable zones.</summary>
        public List<LocationZone> zones;

        /// <summary>Tags for filtering/matching.</summary>
        public List<string> tags;

        /// <summary>Importance level (1-5).</summary>
        [Range(1, 5)]
        public int importance;

        /// <summary>NPC spawn points within this slot.</summary>
        public List<NPCData> npcs;

        /// <summary>NPC IDs for serialization.</summary>
        public List<string> npcIds;

        /// <summary>Shop data if this is a commerce slot.</summary>
        public string shopId;
    }

    /// <summary>
    /// Entry/exit point for a location.
    /// </summary>
    [Serializable]
    public struct LocationEntryPoint
    {
        /// <summary>Unique ID.</summary>
        public string id;

        /// <summary>Position in location coordinates.</summary>
        public HexCoord coord;

        /// <summary>Direction of entry.</summary>
        public EntryDirection direction;

        /// <summary>What this entry connects to.</summary>
        public ConnectionType connectionType;

        /// <summary>Tags for matching.</summary>
        public List<string> tags;
    }

    /// <summary>
    /// Player spawn configuration.
    /// </summary>
    [Serializable]
    public struct PlayerSpawn
    {
        /// <summary>Spawn position.</summary>
        public HexCoord coord;

        /// <summary>Facing direction (0-5).</summary>
        [Range(0, 5)]
        public int facing;
    }

    /// <summary>
    /// Atmosphere settings for runtime systems.
    /// </summary>
    [Serializable]
    public struct LocationAtmosphere
    {
        /// <summary>General danger level (0-10).</summary>
        [Range(0, 10)]
        public int dangerLevel;

        /// <summary>Economic prosperity (1-10).</summary>
        [Range(1, 10)]
        public int wealthLevel;

        /// <summary>Population density hint.</summary>
        public PopulationDensity populationDensity;

        /// <summary>Lawfulness affecting NPC behavior.</summary>
        public LawLevel lawLevel;

        public static LocationAtmosphere Default => new LocationAtmosphere
        {
            dangerLevel = 0,
            wealthLevel = 5,
            populationDensity = PopulationDensity.Normal,
            lawLevel = LawLevel.Frontier
        };
    }

    /// <summary>
    /// Random encounter configuration for a location.
    /// </summary>
    [Serializable]
    public struct EncounterConfig
    {
        /// <summary>Enemy data references.</summary>
        public List<EnemyData> enemies;

        /// <summary>Enemy IDs for serialization.</summary>
        public List<string> enemyIds;

        /// <summary>Spawn chance (0-1).</summary>
        [Range(0f, 1f)]
        public float spawnChance;

        /// <summary>Maximum enemies in encounter.</summary>
        [Min(1)]
        public int maxEnemies;

        /// <summary>Minimum player level for this encounter.</summary>
        [Min(1)]
        public int minLevel;

        /// <summary>Tags for filtering.</summary>
        public List<string> tags;
    }

    /// <summary>
    /// Location data definition as a ScriptableObject.
    /// Represents a complete map (town, dungeon, encounter, etc).
    /// </summary>
    [CreateAssetMenu(fileName = "New Location", menuName = "Iron Frontier/Data/Location Data", order = 5)]
    public class LocationData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier.</summary>
        [Tooltip("Unique identifier")]
        public string id;

        /// <summary>Display name.</summary>
        [Tooltip("Display name")]
        public string displayName;

        /// <summary>Location type.</summary>
        [Tooltip("Location type")]
        public LocationType type;

        /// <summary>Size category.</summary>
        [Tooltip("Size category")]
        public LocationSize size;

        [Header("Description")]
        /// <summary>Flavor text for world-building.</summary>
        [Tooltip("Flavor text")]
        [TextArea(2, 4)]
        public string description;

        /// <summary>Lore and history.</summary>
        [Tooltip("Lore and history")]
        [TextArea(2, 6)]
        public string lore;

        [Header("Map Settings")]
        /// <summary>Generation seed.</summary>
        [Tooltip("Generation seed")]
        public int seed;

        /// <summary>Map width in tiles.</summary>
        [Tooltip("Map width")]
        [Range(8, 128)]
        public int width = 40;

        /// <summary>Map height in tiles.</summary>
        [Tooltip("Map height")]
        [Range(8, 128)]
        public int height = 40;

        /// <summary>Base terrain for empty tiles.</summary>
        [Tooltip("Base terrain")]
        public TerrainType baseTerrain = TerrainType.Sand;

        [Header("Slots")]
        /// <summary>All slot instances in this location.</summary>
        [Tooltip("Functional slots")]
        public List<LocationSlot> slots = new List<LocationSlot>();

        [Header("Entry Points")]
        /// <summary>Entry/exit points.</summary>
        [Tooltip("Entry/exit points")]
        public List<LocationEntryPoint> entryPoints = new List<LocationEntryPoint>();

        /// <summary>Player spawn configuration.</summary>
        [Tooltip("Player spawn")]
        public PlayerSpawn playerSpawn;

        [Header("Encounters")]
        /// <summary>Random encounter configurations.</summary>
        [Tooltip("Random encounters")]
        public List<EncounterConfig> encounters = new List<EncounterConfig>();

        [Header("Atmosphere")]
        /// <summary>Atmosphere hints for runtime systems.</summary>
        [Tooltip("Atmosphere settings")]
        public LocationAtmosphere atmosphere = LocationAtmosphere.Default;

        [Header("Connected Locations")]
        /// <summary>Other locations connected to this one.</summary>
        [Tooltip("Connected locations")]
        public List<LocationData> connectedLocations = new List<LocationData>();

        /// <summary>Connected location IDs for serialization.</summary>
        [Tooltip("Connected location IDs")]
        public List<string> connectedLocationIds = new List<string>();

        [Header("Metadata")]
        /// <summary>Tags for filtering/matching.</summary>
        [Tooltip("Tags")]
        public List<string> tags = new List<string>();

        /// <summary>Gets a slot by its ID.</summary>
        public LocationSlot? GetSlot(string slotId)
        {
            foreach (var slot in slots)
            {
                if (slot.id == slotId)
                    return slot;
            }
            return null;
        }

        /// <summary>Gets all slots of a specific type.</summary>
        public List<LocationSlot> GetSlotsByType(SlotType slotType)
        {
            var result = new List<LocationSlot>();
            foreach (var slot in slots)
            {
                if (slot.type == slotType)
                    result.Add(slot);
            }
            return result;
        }

        /// <summary>Gets the main entry point.</summary>
        public LocationEntryPoint? GetMainEntry()
        {
            foreach (var entry in entryPoints)
            {
                if (entry.tags != null && entry.tags.Contains("main"))
                    return entry;
            }
            return entryPoints.Count > 0 ? entryPoints[0] : null;
        }

        /// <summary>Checks if this location has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Checks if this is a safe location (low danger).</summary>
        public bool IsSafe => atmosphere.dangerLevel <= 2;

        /// <summary>Checks if this location has law enforcement.</summary>
        public bool HasLaw => atmosphere.lawLevel != LawLevel.Lawless;

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }
        }
#endif
    }
}
