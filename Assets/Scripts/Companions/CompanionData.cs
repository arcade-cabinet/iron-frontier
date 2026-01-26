using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Companions
{
    /// <summary>
    /// Recruitment paths/factions for companions.
    /// </summary>
    public enum CompanionPath
    {
        Lawful,
        Freeminer,
        Copperhead,
        Neutral,
        Support,
        Tech
    }

    /// <summary>
    /// Combat role types for companions.
    /// </summary>
    public enum CombatRole
    {
        RangedSupport,
        MeleeExplosives,
        Assassin,
        Healer,
        DualMelee,
        Tank
    }

    /// <summary>
    /// AI behavior priorities.
    /// </summary>
    public enum AIPriority
    {
        ProtectPlayer,
        Aggressive,
        Supportive,
        Cautious,
        Balanced
    }

    /// <summary>
    /// Ability target types.
    /// </summary>
    public enum AbilityTarget
    {
        Self,
        Ally,
        Enemy,
        AreaEnemy,
        AreaAlly,
        AllAllies,
        AllEnemies,
        Ground
    }

    /// <summary>
    /// Ability effect types.
    /// </summary>
    public enum AbilityEffectType
    {
        Damage,
        Heal,
        Buff,
        Debuff,
        Stun,
        Knockback,
        Pull,
        Shield,
        Taunt,
        Stealth,
        Mark,
        Execute,
        NonLethal,
        Summon
    }

    /// <summary>
    /// Approval trigger types.
    /// </summary>
    public enum ApprovalTriggerType
    {
        QuestComplete,
        QuestChoice,
        DialogueChoice,
        FactionAction,
        CombatAction,
        WorldAction,
        Gift,
        Romance
    }

    /// <summary>
    /// Banter trigger types.
    /// </summary>
    public enum BanterTrigger
    {
        TravelStart,
        TravelDuring,
        EnterLocation,
        CombatStart,
        CombatEnd,
        LowHealth,
        PlayerLowHealth,
        SpecificCompanion,
        TimeOfDay,
        Weather,
        Idle,
        QuestActive,
        ReputationMilestone
    }

    /// <summary>
    /// Romance progression stages.
    /// </summary>
    public enum RomanceStage
    {
        Unavailable,
        Locked,
        Acquaintance,
        Friend,
        CloseFriend,
        Interested,
        Courting,
        Committed
    }

    /// <summary>
    /// Individual ability effect.
    /// </summary>
    [Serializable]
    public struct AbilityEffect
    {
        public AbilityEffectType type;
        [Min(0)] public int value;
        [Min(0)] public int duration;
        [Range(0, 100)] public int chance;
        public string statusId;
        [Range(0, 1)] public float levelScaling;
    }

    /// <summary>
    /// Companion ability definition.
    /// </summary>
    [Serializable]
    public class CompanionAbility
    {
        public string id;
        public string name;
        [TextArea(1, 3)] public string description;
        public AbilityTarget target;
        [Range(0, 10)] public int apCost = 2;
        [Min(0)] public int cooldown = 0;
        [Range(0, 10)] public int range = 1;
        [Range(0, 5)] public int areaRadius = 0;
        public List<AbilityEffect> effects = new List<AbilityEffect>();
        public bool unlockedByDefault = true;
        public string unlockedByQuest;
        [Range(1, 10)] public int levelRequired = 1;
        public List<string> tags = new List<string>();
        public string iconId;
        public Sprite icon;
        public string soundId;
    }

    /// <summary>
    /// Companion AI configuration.
    /// </summary>
    [Serializable]
    public class CompanionAIConfig
    {
        public AIPriority priority = AIPriority.Balanced;
        [Range(0, 10)] public int preferredRange = 2;
        [Range(0, 100)] public int retreatThreshold = 25;
        public bool usesConsumables = true;
        public bool prefersNonLethal = false;
        public bool protectsWounded = true;
        public bool breaksStealthForAlly = true;
        public SerializableDictionary<string, int> abilityPriorities = new SerializableDictionary<string, int>();
    }

    /// <summary>
    /// Companion equipment configuration.
    /// </summary>
    [Serializable]
    public class CompanionEquipmentConfig
    {
        public List<string> allowedWeaponTypes = new List<string>();
        public List<string> allowedArmorTypes = new List<string>();
    }

    /// <summary>
    /// Starting equipment for a companion.
    /// </summary>
    [Serializable]
    public class CompanionStartingEquipment
    {
        public string weaponId;
        public string secondaryWeaponId;
        public string armorId;
        public string accessoryId;
    }

    /// <summary>
    /// Approval trigger definition.
    /// </summary>
    [Serializable]
    public class ApprovalTrigger
    {
        public ApprovalTriggerType type;
        public string triggerId;
        [Range(-100, 100)] public int change;
        public string reason;
    }

    /// <summary>
    /// Banter line definition.
    /// </summary>
    [Serializable]
    public class BanterLine
    {
        public string id;
        [TextArea(2, 4)] public string text;
        public BanterTrigger trigger;
        public string triggerData;
        public int? minApproval;
        public int? maxApproval;
        public string requiresFlag;
        public string requiresQuestId;
        public string requiresQuestState;
        public bool oneTime;
        [Range(1, 10)] public int priority = 5;
    }

    /// <summary>
    /// Personal quest stage.
    /// </summary>
    [Serializable]
    public class PersonalQuestStage
    {
        public string id;
        public string title;
        [TextArea(1, 3)] public string description;
        public List<string> objectiveIds = new List<string>();
        public string dialogueId;
        [Min(0)] public int approvalReward;
        public string unlocksAbility;
        public bool unlocksRomance;
    }

    /// <summary>
    /// Personal quest definition.
    /// </summary>
    [Serializable]
    public class PersonalQuest
    {
        public string id;
        public string title;
        [TextArea(1, 3)] public string description;
        [TextArea(2, 5)] public string motivation;
        [Range(-100, 100)] public int requiredApproval = 25;
        public List<PersonalQuestStage> stages = new List<PersonalQuestStage>();
        [Min(0)] public int finalApprovalReward;
        public string finalUnlocksAbility;
        public bool finalUnlocksRomanceEnding;
        public string uniqueItemId;
        public List<string> tags = new List<string>();
    }

    /// <summary>
    /// Romance options configuration.
    /// </summary>
    [Serializable]
    public class RomanceOptions
    {
        public bool available = false;
        [Range(0, 100)] public int approvalRequired = 50;
        public bool requiresPersonalQuest = true;
        public List<string> incompatibleWith = new List<string>();
        public string romanceDialogueId;
        public string favoriteGiftId;
    }

    /// <summary>
    /// Recruitment requirements.
    /// </summary>
    [Serializable]
    public class RecruitmentRequirements
    {
        public string questId;
        public SerializableDictionary<string, int> factionReputation = new SerializableDictionary<string, int>();
        public int minLevel;
        [Min(0)] public int goldCost;
        public string requiredItemId;
        public string requiredFlag;
        public List<string> incompatibleCompanions = new List<string>();
        [TextArea(1, 3)] public string recruitmentHint;
    }

    /// <summary>
    /// Companion base stats.
    /// </summary>
    [Serializable]
    public class CompanionStats
    {
        [Min(1)] public int maxHealth = 100;
        [Range(1, 10)] public int actionPoints = 4;
        [Min(0)] public int baseDamage = 10;
        [Min(0)] public int armor = 0;
        [Range(0, 100)] public int accuracy = 70;
        [Range(0, 100)] public int evasion = 10;
    }

    /// <summary>
    /// Companion definition as a ScriptableObject.
    /// </summary>
    [CreateAssetMenu(fileName = "New Companion", menuName = "Iron Frontier/Companion/Companion Data", order = 1)]
    public class CompanionData : ScriptableObject
    {
        [Header("Identity")]
        public string id;
        public string fullName;
        public string nickname;
        public string title;
        [TextArea(2, 4)] public string description;
        [TextArea(3, 6)] public string backstory;
        public string portraitId;
        public Sprite portrait;

        [Header("Path & Role")]
        public CompanionPath path;
        public CombatRole combatRole;
        public string locationId;
        public Vector2Int spawnCoord;

        [Header("Stats")]
        public CompanionStats stats = new CompanionStats();

        [Header("Abilities")]
        public List<CompanionAbility> abilities = new List<CompanionAbility>();

        [Header("AI Configuration")]
        public CompanionAIConfig aiConfig = new CompanionAIConfig();

        [Header("Equipment")]
        public CompanionEquipmentConfig equipmentConfig = new CompanionEquipmentConfig();
        public CompanionStartingEquipment startingEquipment = new CompanionStartingEquipment();

        [Header("Approval System")]
        public List<ApprovalTrigger> approvalTriggers = new List<ApprovalTrigger>();

        [Header("Banter")]
        public List<BanterLine> banterLines = new List<BanterLine>();

        [Header("Personal Quest")]
        public PersonalQuest personalQuest = new PersonalQuest();

        [Header("Romance")]
        public RomanceOptions romance = new RomanceOptions();

        [Header("Recruitment")]
        public RecruitmentRequirements recruitment = new RecruitmentRequirements();

        [Header("Dialogue")]
        public string dialogueTreeId;

        [Header("Metadata")]
        public bool essential = true;
        public List<string> voiceTags = new List<string>();
        public List<string> tags = new List<string>();

        /// <summary>Display name (nickname if available, otherwise full name).</summary>
        public string DisplayName => !string.IsNullOrEmpty(nickname) ? nickname : fullName;

        /// <summary>Full display name with title if available.</summary>
        public string FullDisplayName => !string.IsNullOrEmpty(title) ? $"{title} {fullName}" : fullName;

        /// <summary>Checks if companion has a tag.</summary>
        public bool HasTag(string tag) => tags.Contains(tag);

        /// <summary>Gets an ability by ID.</summary>
        public CompanionAbility GetAbility(string abilityId)
        {
            return abilities.Find(a => a.id == abilityId);
        }

        /// <summary>Gets all default unlocked abilities.</summary>
        public List<CompanionAbility> GetDefaultAbilities()
        {
            return abilities.FindAll(a => a.unlockedByDefault && a.levelRequired <= 1);
        }

        /// <summary>Gets approval level description.</summary>
        public static string GetApprovalLevelName(int approval)
        {
            if (approval >= 75) return "Devoted";
            if (approval >= 50) return "Loyal";
            if (approval >= 25) return "Friendly";
            if (approval >= 0) return "Neutral";
            if (approval >= -25) return "Wary";
            if (approval >= -50) return "Distrustful";
            if (approval >= -75) return "Hostile";
            return "Betrayed";
        }

        /// <summary>Gets color for approval level.</summary>
        public static Color GetApprovalColor(int approval)
        {
            if (approval >= 75) return new Color(0.2f, 0.8f, 0.2f);      // Bright green
            if (approval >= 50) return new Color(0.4f, 0.8f, 0.4f);      // Green
            if (approval >= 25) return new Color(0.6f, 0.8f, 0.4f);      // Yellow-green
            if (approval >= 0) return new Color(0.8f, 0.8f, 0.4f);       // Yellow
            if (approval >= -25) return new Color(0.8f, 0.6f, 0.4f);     // Orange
            if (approval >= -50) return new Color(0.8f, 0.4f, 0.4f);     // Red-orange
            if (approval >= -75) return new Color(0.8f, 0.2f, 0.2f);     // Red
            return new Color(0.4f, 0.1f, 0.1f);                          // Dark red
        }

        /// <summary>Calculates experience needed for next level.</summary>
        public static int GetExperienceForLevel(int level)
        {
            return Mathf.FloorToInt(100 * Mathf.Pow(level, 1.5f) + 50 * level);
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

    /// <summary>
    /// Runtime state for an active companion.
    /// </summary>
    [Serializable]
    public class CompanionState
    {
        public string companionId;
        public bool inParty;
        public bool recruited;
        public bool alive = true;
        [Range(1, 10)] public int level = 1;
        [Min(0)] public int experience;
        [Min(0)] public int currentHealth;
        [Range(-100, 100)] public int approval;

        // Equipment
        public string equippedWeaponId;
        public string equippedSecondaryId;
        public string equippedArmorId;
        public string equippedAccessoryId;

        // Abilities
        public List<string> unlockedAbilities = new List<string>();
        public SerializableDictionary<string, int> abilityCooldowns = new SerializableDictionary<string, int>();

        // Quest progress
        public bool personalQuestStarted;
        public int currentQuestStageIndex;
        public bool personalQuestCompleted;

        // Romance
        public RomanceStage romanceStage = RomanceStage.Locked;

        // Flags and history
        public SerializableDictionary<string, bool> flags = new SerializableDictionary<string, bool>();
        public List<string> usedBanterIds = new List<string>();
        public float recruitedAt;
        public float totalTimeInParty;

        // Combat stats
        public int enemiesDefeated;
        public int damageDealt;
        public int healingDone;
        public int timesKnockedOut;

        /// <summary>Creates initial state from companion data.</summary>
        public static CompanionState CreateFromData(CompanionData data)
        {
            var state = new CompanionState
            {
                companionId = data.id,
                inParty = false,
                recruited = false,
                alive = true,
                level = 1,
                experience = 0,
                currentHealth = data.stats.maxHealth,
                approval = 0,
                equippedWeaponId = data.startingEquipment?.weaponId,
                equippedSecondaryId = data.startingEquipment?.secondaryWeaponId,
                equippedArmorId = data.startingEquipment?.armorId,
                equippedAccessoryId = data.startingEquipment?.accessoryId,
                romanceStage = data.romance.available ? RomanceStage.Locked : RomanceStage.Unavailable
            };

            // Add default abilities
            foreach (var ability in data.GetDefaultAbilities())
            {
                state.unlockedAbilities.Add(ability.id);
            }

            return state;
        }

        /// <summary>Adds XP and returns true if leveled up.</summary>
        public bool AddExperience(int xp)
        {
            experience += xp;
            int requiredXp = CompanionData.GetExperienceForLevel(level);
            if (experience >= requiredXp && level < 10)
            {
                experience -= requiredXp;
                level++;
                return true;
            }
            return false;
        }

        /// <summary>Modifies approval and clamps to valid range.</summary>
        public void ModifyApproval(int change)
        {
            approval = Mathf.Clamp(approval + change, -100, 100);
        }

        /// <summary>Checks if an ability is on cooldown.</summary>
        public bool IsAbilityOnCooldown(string abilityId)
        {
            return abilityCooldowns.ContainsKey(abilityId) && abilityCooldowns[abilityId] > 0;
        }

        /// <summary>Gets remaining cooldown for an ability.</summary>
        public int GetAbilityCooldown(string abilityId)
        {
            return abilityCooldowns.TryGetValue(abilityId, out int cd) ? cd : 0;
        }

        /// <summary>Sets ability cooldown.</summary>
        public void SetAbilityCooldown(string abilityId, int turns)
        {
            abilityCooldowns[abilityId] = turns;
        }

        /// <summary>Decrements all ability cooldowns by 1 turn.</summary>
        public void TickCooldowns()
        {
            var keys = new List<string>(abilityCooldowns.Keys);
            foreach (var key in keys)
            {
                abilityCooldowns[key] = Mathf.Max(0, abilityCooldowns[key] - 1);
            }
        }
    }

    /// <summary>
    /// Serializable dictionary for Unity serialization.
    /// </summary>
    [Serializable]
    public class SerializableDictionary<TKey, TValue> : Dictionary<TKey, TValue>, ISerializationCallbackReceiver
    {
        [SerializeField] private List<TKey> keys = new List<TKey>();
        [SerializeField] private List<TValue> values = new List<TValue>();

        public void OnBeforeSerialize()
        {
            keys.Clear();
            values.Clear();
            foreach (var pair in this)
            {
                keys.Add(pair.Key);
                values.Add(pair.Value);
            }
        }

        public void OnAfterDeserialize()
        {
            Clear();
            for (int i = 0; i < keys.Count && i < values.Count; i++)
            {
                this[keys[i]] = values[i];
            }
        }
    }
}
