using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// NPC role types defining behavior patterns and available actions.
    /// </summary>
    public enum NPCRole
    {
        // Authority
        Sheriff,
        Deputy,
        Mayor,

        // Commerce
        Merchant,
        Bartender,
        Banker,
        Blacksmith,

        // Services
        Doctor,
        Preacher,
        Undertaker,

        // Labor
        Rancher,
        Miner,
        Farmer,
        Prospector,

        // Outlaws
        Outlaw,
        GangLeader,
        BountyHunter,

        // Other
        Drifter,
        Gambler,
        Townsfolk
    }

    /// <summary>
    /// Faction allegiances for NPCs.
    /// </summary>
    public enum NPCFaction
    {
        /// <summary>No strong allegiance.</summary>
        Neutral,
        /// <summary>Iron Valley Railroad Company.</summary>
        IVRC,
        /// <summary>Copperhead Gang outlaws.</summary>
        Copperhead,
        /// <summary>Freeminer Coalition workers.</summary>
        Freeminer,
        /// <summary>The Remnant automatons.</summary>
        Remnant,
        /// <summary>Local community members.</summary>
        Townsfolk
    }

    /// <summary>
    /// Relationship types between NPCs.
    /// </summary>
    public enum RelationshipType
    {
        Ally,
        Enemy,
        Neutral,
        Family,
        Romantic,
        Rival
    }

    /// <summary>
    /// AI states for NPC behavior.
    /// </summary>
    public enum AIState
    {
        Idle,
        Wander,
        Patrol,
        Seek,
        Flee,
        Follow,
        Interact,
        Alert
    }

    /// <summary>
    /// Personality traits affecting NPC behavior and dialogue.
    /// All values range from 0 to 1.
    /// </summary>
    [Serializable]
    public struct NPCPersonality
    {
        /// <summary>How aggressive in conflict (0-1).</summary>
        [Range(0f, 1f)]
        public float aggression;

        /// <summary>How open and warm to strangers (0-1).</summary>
        [Range(0f, 1f)]
        public float friendliness;

        /// <summary>How inquisitive/nosy (0-1).</summary>
        [Range(0f, 1f)]
        public float curiosity;

        /// <summary>How motivated by money (0-1).</summary>
        [Range(0f, 1f)]
        public float greed;

        /// <summary>How truthful (0-1).</summary>
        [Range(0f, 1f)]
        public float honesty;

        /// <summary>How law-abiding (0-1).</summary>
        [Range(0f, 1f)]
        public float lawfulness;

        /// <summary>Creates a default balanced personality.</summary>
        public static NPCPersonality Default => new NPCPersonality
        {
            aggression = 0.3f,
            friendliness = 0.5f,
            curiosity = 0.5f,
            greed = 0.3f,
            honesty = 0.7f,
            lawfulness = 0.5f
        };
    }

    /// <summary>
    /// Relationship with another NPC.
    /// </summary>
    [Serializable]
    public struct NPCRelationship
    {
        /// <summary>Reference to the related NPC.</summary>
        public NPCData npc;

        /// <summary>Type of relationship.</summary>
        public RelationshipType type;

        /// <summary>Notes about the relationship for context.</summary>
        [TextArea(1, 3)]
        public string notes;
    }

    /// <summary>
    /// Wander behavior configuration.
    /// </summary>
    [Serializable]
    public struct WanderConfig
    {
        /// <summary>Wander circle radius.</summary>
        public float radius;

        /// <summary>Distance to wander circle.</summary>
        public float distance;

        /// <summary>Random jitter amount.</summary>
        public float jitter;

        public static WanderConfig Default => new WanderConfig
        {
            radius = 5f,
            distance = 10f,
            jitter = 2f
        };
    }

    /// <summary>
    /// Patrol waypoint for NPC movement.
    /// </summary>
    [Serializable]
    public struct PatrolWaypoint
    {
        /// <summary>Position in world coordinates.</summary>
        public Vector3 position;

        /// <summary>Optional wait time at this waypoint in seconds.</summary>
        public float waitTime;
    }

    /// <summary>
    /// Patrol behavior configuration.
    /// </summary>
    [Serializable]
    public struct PatrolConfig
    {
        /// <summary>Waypoints to patrol.</summary>
        public List<PatrolWaypoint> waypoints;

        /// <summary>Whether to loop the patrol path.</summary>
        public bool loop;

        /// <summary>Default wait time at each waypoint in seconds.</summary>
        public float defaultWaitTime;
    }

    /// <summary>
    /// AI behavior configuration for NPCs.
    /// </summary>
    [Serializable]
    public struct NPCBehaviorConfig
    {
        /// <summary>Default state when no other state is active.</summary>
        public AIState defaultState;

        /// <summary>Maximum movement speed (units per second).</summary>
        public float maxSpeed;

        /// <summary>Maximum steering force.</summary>
        public float maxForce;

        /// <summary>How close to get before arriving.</summary>
        public float arrivalTolerance;

        /// <summary>Detection range for seeing the player.</summary>
        public float detectionRange;

        /// <summary>Field of view in degrees.</summary>
        [Range(0f, 360f)]
        public float fieldOfView;

        /// <summary>Wander behavior parameters.</summary>
        public WanderConfig wanderConfig;

        /// <summary>Patrol behavior parameters.</summary>
        public PatrolConfig patrolConfig;

        public static NPCBehaviorConfig Default => new NPCBehaviorConfig
        {
            defaultState = AIState.Idle,
            maxSpeed = 3f,
            maxForce = 10f,
            arrivalTolerance = 0.5f,
            detectionRange = 15f,
            fieldOfView = 120f,
            wanderConfig = WanderConfig.Default
        };
    }

    /// <summary>
    /// Hex coordinate for NPC spawn position.
    /// </summary>
    [Serializable]
    public struct HexCoord
    {
        public int q;
        public int r;

        public HexCoord(int q, int r)
        {
            this.q = q;
            this.r = r;
        }
    }

    /// <summary>
    /// NPC data definition as a ScriptableObject.
    /// Contains all static data for an NPC including personality, appearance, and AI settings.
    /// </summary>
    [CreateAssetMenu(fileName = "New NPC", menuName = "Iron Frontier/Data/NPC Data", order = 1)]
    public class NPCData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique identifier for this NPC.</summary>
        [Tooltip("Unique identifier for this NPC")]
        public string id;

        /// <summary>Display name shown in dialogue and UI.</summary>
        [Tooltip("Display name shown in dialogue and UI")]
        public string displayName;

        /// <summary>Title or nickname (e.g., "Diamondback", "Doc").</summary>
        [Tooltip("Title or nickname (e.g., 'Diamondback', 'Doc')")]
        public string title;

        /// <summary>Role determines behavior patterns and available actions.</summary>
        [Tooltip("Role determines behavior patterns and available actions")]
        public NPCRole role;

        /// <summary>Faction allegiance affecting relationships.</summary>
        [Tooltip("Faction allegiance affecting relationships")]
        public NPCFaction faction = NPCFaction.Neutral;

        [Header("Appearance")]
        /// <summary>Physical description for UI and portraits.</summary>
        [Tooltip("Physical description for UI and portraits")]
        [TextArea(2, 5)]
        public string description;

        /// <summary>Portrait sprite for dialogue UI.</summary>
        [Tooltip("Portrait sprite for dialogue UI")]
        public Sprite portrait;

        /// <summary>Portrait ID for dynamic loading.</summary>
        [Tooltip("Portrait ID for dynamic loading")]
        public string portraitId;

        [Header("Location")]
        /// <summary>Location where this NPC is found.</summary>
        [Tooltip("Location where this NPC is found")]
        public LocationData location;

        /// <summary>Location ID for serialization.</summary>
        [Tooltip("Location ID for serialization")]
        public string locationId;

        /// <summary>Spawn position within location (hex coordinates).</summary>
        [Tooltip("Spawn position within location (hex coordinates)")]
        public HexCoord spawnCoord;

        [Header("Personality")]
        /// <summary>Personality traits affecting behavior and dialogue.</summary>
        [Tooltip("Personality traits affecting behavior and dialogue")]
        public NPCPersonality personality = NPCPersonality.Default;

        [Header("Dialogue")]
        /// <summary>References to dialogue trees this NPC uses.</summary>
        [Tooltip("References to dialogue trees this NPC uses")]
        public List<DialogueData> dialogueTrees = new List<DialogueData>();

        /// <summary>Primary dialogue tree for main conversation.</summary>
        [Tooltip("Primary dialogue tree for main conversation")]
        public DialogueData primaryDialogue;

        /// <summary>Dialogue tree IDs for serialization.</summary>
        [Tooltip("Dialogue tree IDs for serialization")]
        public List<string> dialogueTreeIds = new List<string>();

        /// <summary>Primary dialogue ID for serialization.</summary>
        [Tooltip("Primary dialogue ID for serialization")]
        public string primaryDialogueId;

        [Header("Quests")]
        /// <summary>Is this NPC essential (cannot die)?</summary>
        [Tooltip("Is this NPC essential (cannot die)?")]
        public bool essential;

        /// <summary>Can this NPC give quests?</summary>
        [Tooltip("Can this NPC give quests?")]
        public bool questGiver;

        /// <summary>Quests this NPC can give.</summary>
        [Tooltip("Quests this NPC can give")]
        public List<QuestData> quests = new List<QuestData>();

        /// <summary>Quest IDs for serialization.</summary>
        [Tooltip("Quest IDs for serialization")]
        public List<string> questIds = new List<string>();

        [Header("Commerce")]
        /// <summary>Shop ID if this NPC is a merchant.</summary>
        [Tooltip("Shop ID if this NPC is a merchant")]
        public string shopId;

        [Header("Lore")]
        /// <summary>Background lore for world-building.</summary>
        [Tooltip("Background lore for world-building")]
        [TextArea(3, 10)]
        public string backstory;

        /// <summary>Relationships with other NPCs.</summary>
        [Tooltip("Relationships with other NPCs")]
        public List<NPCRelationship> relationships = new List<NPCRelationship>();

        [Header("AI Settings")]
        /// <summary>AI behavior configuration.</summary>
        [Tooltip("AI behavior configuration")]
        public NPCBehaviorConfig behaviorConfig = NPCBehaviorConfig.Default;

        [Header("Metadata")]
        /// <summary>Tags for filtering and categorization.</summary>
        [Tooltip("Tags for filtering and categorization")]
        public List<string> tags = new List<string>();

        /// <summary>Gets the full display name including title.</summary>
        public string FullName => string.IsNullOrEmpty(title)
            ? displayName
            : $"{title} {displayName}";

        /// <summary>Checks if this NPC has a specific tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Gets relationship with another NPC if it exists.</summary>
        public NPCRelationship? GetRelationship(NPCData otherNpc)
        {
            foreach (var rel in relationships)
            {
                if (rel.npc == otherNpc)
                    return rel;
            }
            return null;
        }

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
