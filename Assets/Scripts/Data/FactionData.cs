using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Data
{
    /// <summary>
    /// Faction type classification.
    /// </summary>
    public enum FactionType
    {
        /// <summary>Business/industry (e.g., IVRC).</summary>
        Corporation,
        /// <summary>Criminal organization (e.g., Copperheads).</summary>
        Outlaw,
        /// <summary>Underground movement (e.g., Freeminers).</summary>
        Resistance,
        /// <summary>Law enforcement (e.g., The Law).</summary>
        Authority,
        /// <summary>General population (e.g., Townsfolk).</summary>
        Civilian,
        /// <summary>Religious organization.</summary>
        Religious,
        /// <summary>Trade guild.</summary>
        Guild,
        /// <summary>Armed forces.</summary>
        Military
    }

    /// <summary>
    /// Reputation tiers from worst to best.
    /// </summary>
    public enum ReputationTier
    {
        /// <summary>-100 to -61: Marked for death, attack on sight.</summary>
        Hated = 0,
        /// <summary>-60 to -31: Enemy status, may attack.</summary>
        Hostile = 1,
        /// <summary>-30 to -11: Distrustful, limited access.</summary>
        Unfriendly = 2,
        /// <summary>-10 to +10: Standard treatment.</summary>
        Neutral = 3,
        /// <summary>+11 to +30: Small benefits, discounts.</summary>
        Friendly = 4,
        /// <summary>+31 to +60: Significant benefits, special access.</summary>
        Honored = 5,
        /// <summary>+61 to +100: Maximum benefits, legendary status.</summary>
        Revered = 6
    }

    /// <summary>
    /// Relationship type between factions.
    /// </summary>
    public enum FactionRelationshipType
    {
        /// <summary>Strong positive relationship.</summary>
        Allied,
        /// <summary>Mild positive relationship.</summary>
        Friendly,
        /// <summary>No particular relationship.</summary>
        Neutral,
        /// <summary>Competition or mild opposition.</summary>
        Rival,
        /// <summary>Strong opposition, enemies.</summary>
        Hostile
    }

    /// <summary>
    /// Categories of actions that affect faction reputation.
    /// </summary>
    public enum FactionActionCategory
    {
        /// <summary>Completing quests for/against faction.</summary>
        Quest,
        /// <summary>Killing faction members or enemies.</summary>
        Combat,
        /// <summary>Trading with faction merchants.</summary>
        Trade,
        /// <summary>Conversation choices.</summary>
        Dialogue,
        /// <summary>Theft, assault, trespassing.</summary>
        Crime,
        /// <summary>Helping faction members.</summary>
        Assistance,
        /// <summary>Breaking trust, revealing secrets.</summary>
        Betrayal,
        /// <summary>Giving money/items to faction.</summary>
        Donation,
        /// <summary>Finding important locations/info.</summary>
        Discovery,
        /// <summary>Damaging faction property/operations.</summary>
        Sabotage
    }

    /// <summary>
    /// Reputation tier boundaries.
    /// </summary>
    public static class ReputationTierBoundaries
    {
        public static readonly (int min, int max) Hated = (-100, -61);
        public static readonly (int min, int max) Hostile = (-60, -31);
        public static readonly (int min, int max) Unfriendly = (-30, -11);
        public static readonly (int min, int max) Neutral = (-10, 10);
        public static readonly (int min, int max) Friendly = (11, 30);
        public static readonly (int min, int max) Honored = (31, 60);
        public static readonly (int min, int max) Revered = (61, 100);

        /// <summary>
        /// Get the tier for a given reputation value.
        /// </summary>
        /// <param name="reputation">Reputation value (-100 to 100).</param>
        /// <returns>The corresponding tier.</returns>
        public static ReputationTier GetTier(int reputation)
        {
            int clamped = Mathf.Clamp(reputation, -100, 100);

            if (clamped <= -61) return ReputationTier.Hated;
            if (clamped <= -31) return ReputationTier.Hostile;
            if (clamped <= -11) return ReputationTier.Unfriendly;
            if (clamped <= 10) return ReputationTier.Neutral;
            if (clamped <= 30) return ReputationTier.Friendly;
            if (clamped <= 60) return ReputationTier.Honored;
            return ReputationTier.Revered;
        }

        /// <summary>
        /// Get the minimum reputation needed to reach a tier.
        /// </summary>
        public static int GetMinimumForTier(ReputationTier tier)
        {
            return tier switch
            {
                ReputationTier.Hated => -100,
                ReputationTier.Hostile => -60,
                ReputationTier.Unfriendly => -30,
                ReputationTier.Neutral => -10,
                ReputationTier.Friendly => 11,
                ReputationTier.Honored => 31,
                ReputationTier.Revered => 61,
                _ => 0
            };
        }
    }

    /// <summary>
    /// Relationship between this faction and another.
    /// </summary>
    [Serializable]
    public struct FactionRelationship
    {
        /// <summary>Reference to the other faction.</summary>
        [Tooltip("The other faction in this relationship")]
        public FactionData otherFaction;

        /// <summary>Other faction ID for serialization.</summary>
        [Tooltip("Other faction ID for serialization")]
        public string otherFactionId;

        /// <summary>Type of relationship.</summary>
        [Tooltip("Type of relationship with the other faction")]
        public FactionRelationshipType type;

        /// <summary>
        /// Reputation ripple multiplier (-1.0 to 1.0).
        /// Positive: helping this faction helps the other.
        /// Negative: helping this faction hurts the other.
        /// </summary>
        [Tooltip("Reputation ripple multiplier (-1 to 1). Positive = helping helps, negative = helping hurts")]
        [Range(-1f, 1f)]
        public float rippleMultiplier;

        /// <summary>Notes about this relationship.</summary>
        [Tooltip("Notes about this relationship for context")]
        [TextArea(1, 3)]
        public string notes;
    }

    /// <summary>
    /// An action that affects faction reputation.
    /// </summary>
    [Serializable]
    public struct FactionAction
    {
        /// <summary>Unique action identifier.</summary>
        [Tooltip("Unique identifier for this action")]
        public string id;

        /// <summary>Human-readable name.</summary>
        [Tooltip("Display name for this action")]
        public string name;

        /// <summary>Description of the action.</summary>
        [Tooltip("Description of what this action entails")]
        [TextArea(1, 3)]
        public string description;

        /// <summary>Action category.</summary>
        [Tooltip("Category of this action")]
        public FactionActionCategory category;

        /// <summary>Base reputation change for primary faction.</summary>
        [Tooltip("Base reputation change (-100 to 100)")]
        [Range(-100, 100)]
        public int reputationDelta;

        /// <summary>Can this action only be done once?</summary>
        [Tooltip("If true, this action can only be performed once")]
        public bool oneTime;

        /// <summary>Cooldown in game hours if repeatable.</summary>
        [Tooltip("Cooldown in game hours (0 = no cooldown)")]
        [Min(0)]
        public int cooldownHours;

        /// <summary>Tags for filtering.</summary>
        [Tooltip("Tags for categorization and filtering")]
        public List<string> tags;
    }

    /// <summary>
    /// Effects granted at a specific reputation tier.
    /// </summary>
    [Serializable]
    public struct FactionTierEffects
    {
        /// <summary>Tier this effects block applies to.</summary>
        [Tooltip("Reputation tier for these effects")]
        public ReputationTier tier;

        /// <summary>Price modifier for faction shops (1.0 = normal).</summary>
        [Tooltip("Price modifier (1.0 = normal, 2.0 = double, 0.5 = half)")]
        [Range(0.5f, 2.5f)]
        public float priceModifier;

        /// <summary>Quest availability modifier (0-1).</summary>
        [Tooltip("Chance of quests being available (0 = none, 1 = all)")]
        [Range(0f, 1f)]
        public float questAvailability;

        /// <summary>Can access faction-controlled areas?</summary>
        [Tooltip("Whether player can enter faction-controlled areas")]
        public bool areaAccess;

        /// <summary>Are faction members hostile on sight?</summary>
        [Tooltip("Whether faction members attack the player on sight")]
        public bool attackOnSight;

        /// <summary>Can trade with faction merchants?</summary>
        [Tooltip("Whether player can trade with faction merchants")]
        public bool canTrade;

        /// <summary>Greeting dialogue snippet IDs.</summary>
        [Tooltip("IDs of greeting dialogue snippets for this tier")]
        public List<string> greetingSnippets;

        /// <summary>Special perks/abilities unlocked.</summary>
        [Tooltip("IDs of perks unlocked at this tier")]
        public List<string> perks;

        /// <summary>Description of tier benefits/penalties.</summary>
        [Tooltip("Description of what this tier means for the player")]
        [TextArea(2, 4)]
        public string description;

        /// <summary>
        /// Create default tier effects for a given tier.
        /// </summary>
        public static FactionTierEffects CreateDefault(ReputationTier tier)
        {
            return tier switch
            {
                ReputationTier.Hated => new FactionTierEffects
                {
                    tier = ReputationTier.Hated,
                    priceModifier = 2.0f,
                    questAvailability = 0f,
                    areaAccess = false,
                    attackOnSight = true,
                    canTrade = false,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Marked for death. Attack on sight."
                },
                ReputationTier.Hostile => new FactionTierEffects
                {
                    tier = ReputationTier.Hostile,
                    priceModifier = 1.75f,
                    questAvailability = 0f,
                    areaAccess = false,
                    attackOnSight = false,
                    canTrade = false,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Considered an enemy. No dealings."
                },
                ReputationTier.Unfriendly => new FactionTierEffects
                {
                    tier = ReputationTier.Unfriendly,
                    priceModifier = 1.4f,
                    questAvailability = 0.1f,
                    areaAccess = true,
                    attackOnSight = false,
                    canTrade = true,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Viewed with suspicion. Inflated prices."
                },
                ReputationTier.Neutral => new FactionTierEffects
                {
                    tier = ReputationTier.Neutral,
                    priceModifier = 1.15f,
                    questAvailability = 0.4f,
                    areaAccess = true,
                    attackOnSight = false,
                    canTrade = true,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Standard treatment. No special benefits."
                },
                ReputationTier.Friendly => new FactionTierEffects
                {
                    tier = ReputationTier.Friendly,
                    priceModifier = 0.95f,
                    questAvailability = 0.65f,
                    areaAccess = true,
                    attackOnSight = false,
                    canTrade = true,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Considered a friend. Small discounts."
                },
                ReputationTier.Honored => new FactionTierEffects
                {
                    tier = ReputationTier.Honored,
                    priceModifier = 0.8f,
                    questAvailability = 0.85f,
                    areaAccess = true,
                    attackOnSight = false,
                    canTrade = true,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Highly respected. Significant benefits."
                },
                ReputationTier.Revered => new FactionTierEffects
                {
                    tier = ReputationTier.Revered,
                    priceModifier = 0.65f,
                    questAvailability = 1.0f,
                    areaAccess = true,
                    attackOnSight = false,
                    canTrade = true,
                    greetingSnippets = new List<string>(),
                    perks = new List<string>(),
                    description = "Legendary status. Maximum benefits."
                },
                _ => new FactionTierEffects { tier = tier }
            };
        }
    }

    /// <summary>
    /// Faction data definition as a ScriptableObject.
    /// Contains all static data for a faction including relationships, actions, and tier effects.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript factions/index.ts (FactionDefinition interface).
    /// The five major factions in Iron Frontier are:
    /// - IVRC (Iron Valley Railroad Company) - Corporate control
    /// - Copperheads - Violent outlaw resistance
    /// - Freeminers - Peaceful worker resistance
    /// - The Law - Sheriff and deputies
    /// - Townsfolk - General population
    /// </remarks>
    [CreateAssetMenu(fileName = "New Faction", menuName = "Iron Frontier/Data/Faction Data", order = 7)]
    public class FactionData : ScriptableObject
    {
        [Header("Identity")]
        /// <summary>Unique faction identifier.</summary>
        [Tooltip("Unique identifier for this faction (e.g., 'ivrc', 'copperheads')")]
        public string id;

        /// <summary>Short display name.</summary>
        [Tooltip("Short display name (e.g., 'IVRC', 'Copperheads')")]
        public string displayName;

        /// <summary>Full name/title.</summary>
        [Tooltip("Full formal name (e.g., 'Iron Valley Railroad Company')")]
        public string fullName;

        /// <summary>Short description.</summary>
        [Tooltip("Brief description of the faction")]
        [TextArea(2, 4)]
        public string description;

        /// <summary>Faction type classification.</summary>
        [Tooltip("Type classification affecting behavior patterns")]
        public FactionType type;

        [Header("Appearance")]
        /// <summary>Primary color for UI.</summary>
        [Tooltip("Primary color for UI elements")]
        public Color primaryColor = Color.gray;

        /// <summary>Secondary color for UI.</summary>
        [Tooltip("Secondary color for UI elements")]
        public Color secondaryColor = Color.white;

        /// <summary>Icon sprite for UI.</summary>
        [Tooltip("Icon sprite for this faction")]
        public Sprite icon;

        /// <summary>Icon ID for dynamic loading.</summary>
        [Tooltip("Icon ID for dynamic loading")]
        public string iconId;

        [Header("Locations")]
        /// <summary>Headquarters location.</summary>
        [Tooltip("Main headquarters location")]
        public LocationData headquarters;

        /// <summary>Headquarters location ID for serialization.</summary>
        [Tooltip("Headquarters location ID for serialization")]
        public string headquartersId;

        /// <summary>Controlled location IDs.</summary>
        [Tooltip("IDs of locations controlled by this faction")]
        public List<string> controlledLocationIds = new List<string>();

        [Header("NPCs")]
        /// <summary>Key NPC IDs (leaders, merchants, etc.).</summary>
        [Tooltip("IDs of important NPCs in this faction")]
        public List<string> keyNpcIds = new List<string>();

        [Header("Reputation Settings")]
        /// <summary>Starting reputation for new players.</summary>
        [Tooltip("Default reputation when starting a new game (-100 to 100)")]
        [Range(-100, 100)]
        public int defaultReputation = 0;

        /// <summary>Reputation decay rate per game day toward neutral.</summary>
        [Tooltip("How much reputation decays toward neutral each game day")]
        [Range(0f, 5f)]
        public float decayRatePerDay = 1f;

        /// <summary>Minimum reputation before decay stops (absolute value).</summary>
        [Tooltip("Decay stops when within this distance from neutral")]
        [Range(0, 100)]
        public int decayThreshold = 5;

        [Header("Relationships")]
        /// <summary>Relationships with other factions.</summary>
        [Tooltip("How this faction relates to other factions")]
        public List<FactionRelationship> relationships = new List<FactionRelationship>();

        [Header("Tier Effects")]
        /// <summary>Effects granted at each reputation tier.</summary>
        [Tooltip("Effects for each of the 7 reputation tiers")]
        public List<FactionTierEffects> tierEffects = new List<FactionTierEffects>();

        [Header("Actions")]
        /// <summary>Actions that affect this faction's reputation.</summary>
        [Tooltip("Actions that can change player reputation with this faction")]
        public List<FactionAction> actions = new List<FactionAction>();

        [Header("Lore")]
        /// <summary>Detailed lore/backstory.</summary>
        [Tooltip("Detailed backstory and lore for this faction")]
        [TextArea(5, 15)]
        public string lore;

        [Header("Metadata")]
        /// <summary>Tags for filtering.</summary>
        [Tooltip("Tags for categorization and filtering")]
        public List<string> tags = new List<string>();

        /// <summary>
        /// Get tier effects for a specific reputation value.
        /// </summary>
        /// <param name="reputation">Current reputation value.</param>
        /// <returns>Tier effects for the corresponding tier.</returns>
        public FactionTierEffects GetTierEffects(int reputation)
        {
            var tier = ReputationTierBoundaries.GetTier(reputation);
            return GetTierEffectsForTier(tier);
        }

        /// <summary>
        /// Get tier effects for a specific tier.
        /// </summary>
        /// <param name="tier">Reputation tier.</param>
        /// <returns>Tier effects for that tier.</returns>
        public FactionTierEffects GetTierEffectsForTier(ReputationTier tier)
        {
            foreach (var effects in tierEffects)
            {
                if (effects.tier == tier)
                    return effects;
            }

            // Return default if not found
            return FactionTierEffects.CreateDefault(tier);
        }

        /// <summary>
        /// Get an action by its ID.
        /// </summary>
        /// <param name="actionId">Action ID to find.</param>
        /// <returns>The action if found, null otherwise.</returns>
        public FactionAction? GetAction(string actionId)
        {
            foreach (var action in actions)
            {
                if (action.id == actionId)
                    return action;
            }
            return null;
        }

        /// <summary>
        /// Get actions filtered by category.
        /// </summary>
        /// <param name="category">Category to filter by.</param>
        /// <returns>List of matching actions.</returns>
        public List<FactionAction> GetActionsByCategory(FactionActionCategory category)
        {
            var result = new List<FactionAction>();
            foreach (var action in actions)
            {
                if (action.category == category)
                    result.Add(action);
            }
            return result;
        }

        /// <summary>
        /// Get relationship with another faction by ID.
        /// </summary>
        /// <param name="factionId">Other faction's ID.</param>
        /// <returns>Relationship if found, null otherwise.</returns>
        public FactionRelationship? GetRelationship(string factionId)
        {
            foreach (var rel in relationships)
            {
                if (rel.otherFactionId == factionId ||
                    (rel.otherFaction != null && rel.otherFaction.id == factionId))
                {
                    return rel;
                }
            }
            return null;
        }

        /// <summary>
        /// Check if player would be attacked on sight at given reputation.
        /// </summary>
        /// <param name="reputation">Current reputation value.</param>
        /// <returns>True if faction members will attack on sight.</returns>
        public bool IsHostile(int reputation)
        {
            var effects = GetTierEffects(reputation);
            return effects.attackOnSight;
        }

        /// <summary>
        /// Get the shop price modifier for a given reputation.
        /// </summary>
        /// <param name="reputation">Current reputation value.</param>
        /// <returns>Price modifier (1.0 = normal).</returns>
        public float GetPriceModifier(int reputation)
        {
            var effects = GetTierEffects(reputation);
            return effects.priceModifier;
        }

        /// <summary>
        /// Check if this faction has a specific tag.
        /// </summary>
        /// <param name="tag">Tag to check for.</param>
        /// <returns>True if faction has the tag.</returns>
        public bool HasTag(string tag) => tags.Contains(tag);

#if UNITY_EDITOR
        private void OnValidate()
        {
            if (string.IsNullOrEmpty(id))
            {
                id = name.ToLowerInvariant().Replace(" ", "_");
            }

            // Ensure we have tier effects for all tiers
            if (tierEffects.Count != 7)
            {
                var existing = new Dictionary<ReputationTier, FactionTierEffects>();
                foreach (var effect in tierEffects)
                {
                    existing[effect.tier] = effect;
                }

                tierEffects.Clear();
                foreach (ReputationTier tier in Enum.GetValues(typeof(ReputationTier)))
                {
                    if (existing.TryGetValue(tier, out var effect))
                    {
                        tierEffects.Add(effect);
                    }
                    else
                    {
                        tierEffects.Add(FactionTierEffects.CreateDefault(tier));
                    }
                }
            }
        }

        /// <summary>
        /// Reset to default tier effects (editor utility).
        /// </summary>
        [ContextMenu("Reset Tier Effects to Defaults")]
        private void ResetTierEffectsToDefaults()
        {
            tierEffects.Clear();
            foreach (ReputationTier tier in Enum.GetValues(typeof(ReputationTier)))
            {
                tierEffects.Add(FactionTierEffects.CreateDefault(tier));
            }
        }
#endif
    }
}
