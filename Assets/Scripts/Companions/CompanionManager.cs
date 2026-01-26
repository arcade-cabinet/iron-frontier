using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Companions
{
    /// <summary>
    /// Result of a recruitment attempt.
    /// </summary>
    public struct RecruitmentResult
    {
        public bool success;
        public string reason;
    }

    /// <summary>
    /// Manages companion recruitment, party management, and state.
    /// </summary>
    public class CompanionManager : MonoBehaviour
    {
        public static CompanionManager Instance { get; private set; }

        [Header("Database")]
        [SerializeField] private TextAsset companionsJsonFile;
        [SerializeField] private List<CompanionData> companionAssets = new List<CompanionData>();

        [Header("Party Settings")]
        [SerializeField] private int maxPartySize = 3;

        /// <summary>All loaded companions indexed by ID.</summary>
        public Dictionary<string, CompanionData> CompanionsById { get; private set; } = new Dictionary<string, CompanionData>();

        /// <summary>Companion states indexed by ID.</summary>
        public Dictionary<string, CompanionState> CompanionStates { get; private set; } = new Dictionary<string, CompanionState>();

        /// <summary>Current party member IDs.</summary>
        public List<string> CurrentParty { get; private set; } = new List<string>();

        /// <summary>Event fired when a companion is recruited.</summary>
        public event Action<CompanionData> OnCompanionRecruited;

        /// <summary>Event fired when a companion joins the party.</summary>
        public event Action<CompanionData> OnCompanionJoinedParty;

        /// <summary>Event fired when a companion leaves the party.</summary>
        public event Action<CompanionData> OnCompanionLeftParty;

        /// <summary>Event fired when approval changes.</summary>
        public event Action<CompanionData, int, int> OnApprovalChanged;

        /// <summary>Event fired when a companion levels up.</summary>
        public event Action<CompanionData, int> OnCompanionLevelUp;

        /// <summary>Event fired when a personal quest progresses.</summary>
        public event Action<CompanionData, int> OnPersonalQuestProgress;

        /// <summary>Event fired when romance stage changes.</summary>
        public event Action<CompanionData, RomanceStage> OnRomanceStageChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            LoadCompanions();
            InitializeStates();
        }

        /// <summary>
        /// Loads companions from assets and JSON.
        /// </summary>
        private void LoadCompanions()
        {
            // Load from ScriptableObject assets
            foreach (var companion in companionAssets)
            {
                if (companion != null && !string.IsNullOrEmpty(companion.id))
                {
                    CompanionsById[companion.id] = companion;
                }
            }

            // Load from JSON if available
            if (companionsJsonFile != null)
            {
                try
                {
                    var data = JsonUtility.FromJson<CompanionsJsonData>(companionsJsonFile.text);
                    Debug.Log($"[CompanionManager] Loaded {data.companions?.Length ?? 0} companions from JSON");
                }
                catch (Exception e)
                {
                    Debug.LogError($"[CompanionManager] Failed to parse companions JSON: {e.Message}");
                }
            }

            Debug.Log($"[CompanionManager] Total companions loaded: {CompanionsById.Count}");
        }

        /// <summary>
        /// Initializes companion states.
        /// </summary>
        private void InitializeStates()
        {
            foreach (var companion in CompanionsById.Values)
            {
                if (!CompanionStates.ContainsKey(companion.id))
                {
                    CompanionStates[companion.id] = CompanionState.CreateFromData(companion);
                }
            }
        }

        /// <summary>
        /// Gets companion data by ID.
        /// </summary>
        public CompanionData GetCompanion(string companionId)
        {
            return CompanionsById.TryGetValue(companionId, out var companion) ? companion : null;
        }

        /// <summary>
        /// Gets companion state by ID.
        /// </summary>
        public CompanionState GetCompanionState(string companionId)
        {
            return CompanionStates.TryGetValue(companionId, out var state) ? state : null;
        }

        /// <summary>
        /// Gets all companions by path.
        /// </summary>
        public List<CompanionData> GetCompanionsByPath(CompanionPath path)
        {
            return CompanionsById.Values.Where(c => c.path == path).ToList();
        }

        /// <summary>
        /// Gets all recruited companions.
        /// </summary>
        public List<CompanionData> GetRecruitedCompanions()
        {
            return CompanionsById.Values
                .Where(c => CompanionStates.TryGetValue(c.id, out var state) && state.recruited)
                .ToList();
        }

        /// <summary>
        /// Gets current party companions.
        /// </summary>
        public List<CompanionData> GetPartyCompanions()
        {
            return CurrentParty
                .Select(id => GetCompanion(id))
                .Where(c => c != null)
                .ToList();
        }

        /// <summary>
        /// Checks if a companion can be recruited.
        /// </summary>
        public (bool canRecruit, string reason) CanRecruit(string companionId)
        {
            var companion = GetCompanion(companionId);
            if (companion == null)
                return (false, "Companion not found");

            var state = GetCompanionState(companionId);
            if (state == null)
                return (false, "State not initialized");

            if (state.recruited)
                return (false, "Already recruited");

            var req = companion.recruitment;

            // Check quest requirement
            if (!string.IsNullOrEmpty(req.questId))
            {
                // Would check QuestManager.Instance.IsQuestComplete(req.questId)
                // For now, we assume quest is checked
            }

            // Check faction reputation
            foreach (var kvp in req.factionReputation)
            {
                // Would check FactionManager.Instance.GetReputation(kvp.Key)
                // if (currentRep < kvp.Value) return (false, $"Insufficient reputation with {kvp.Key}");
            }

            // Check player level
            if (req.minLevel > 0)
            {
                // Would check PlayerManager.Instance.Level
                // if (playerLevel < req.minLevel) return (false, $"Requires level {req.minLevel}");
            }

            // Check gold
            if (req.goldCost > 0)
            {
                // Would check InventoryManager.Instance.Gold
                // if (gold < req.goldCost) return (false, $"Requires {req.goldCost} gold");
            }

            // Check required item
            if (!string.IsNullOrEmpty(req.requiredItemId))
            {
                // Would check InventoryManager.Instance.HasItem(req.requiredItemId)
            }

            // Check required flag
            if (!string.IsNullOrEmpty(req.requiredFlag))
            {
                // Would check GameManager.Instance.HasFlag(req.requiredFlag)
            }

            // Check incompatible companions
            foreach (var incompatible in req.incompatibleCompanions)
            {
                if (CompanionStates.TryGetValue(incompatible, out var incompState) && incompState.recruited)
                {
                    var incompName = GetCompanion(incompatible)?.DisplayName ?? incompatible;
                    return (false, $"Incompatible with {incompName}");
                }
            }

            return (true, "");
        }

        /// <summary>
        /// Recruits a companion.
        /// </summary>
        public RecruitmentResult Recruit(string companionId)
        {
            var (canRecruit, reason) = CanRecruit(companionId);
            if (!canRecruit)
            {
                return new RecruitmentResult { success = false, reason = reason };
            }

            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            // Deduct gold if needed
            if (companion.recruitment.goldCost > 0)
            {
                // InventoryManager.Instance.RemoveGold(companion.recruitment.goldCost);
            }

            // Remove required item if needed
            if (!string.IsNullOrEmpty(companion.recruitment.requiredItemId))
            {
                // InventoryManager.Instance.RemoveItem(companion.recruitment.requiredItemId, 1);
            }

            state.recruited = true;
            state.recruitedAt = Time.time;

            Debug.Log($"[CompanionManager] Recruited {companion.DisplayName}");
            OnCompanionRecruited?.Invoke(companion);

            return new RecruitmentResult { success = true, reason = $"Recruited {companion.DisplayName}" };
        }

        /// <summary>
        /// Adds a companion to the party.
        /// </summary>
        public bool AddToParty(string companionId)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null)
            {
                Debug.LogWarning($"[CompanionManager] Cannot add to party: {companionId}");
                return false;
            }

            if (!state.recruited)
            {
                Debug.LogWarning($"[CompanionManager] {companion.DisplayName} is not recruited");
                return false;
            }

            if (state.inParty)
            {
                Debug.Log($"[CompanionManager] {companion.DisplayName} is already in party");
                return false;
            }

            if (CurrentParty.Count >= maxPartySize)
            {
                Debug.LogWarning($"[CompanionManager] Party is full (max {maxPartySize})");
                return false;
            }

            state.inParty = true;
            CurrentParty.Add(companionId);

            Debug.Log($"[CompanionManager] {companion.DisplayName} joined the party");
            OnCompanionJoinedParty?.Invoke(companion);

            return true;
        }

        /// <summary>
        /// Removes a companion from the party.
        /// </summary>
        public bool RemoveFromParty(string companionId)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null)
                return false;

            if (!state.inParty)
                return false;

            state.inParty = false;
            CurrentParty.Remove(companionId);

            Debug.Log($"[CompanionManager] {companion.DisplayName} left the party");
            OnCompanionLeftParty?.Invoke(companion);

            return true;
        }

        /// <summary>
        /// Modifies companion approval.
        /// </summary>
        public void ModifyApproval(string companionId, int change, string reason = null)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null) return;

            int oldApproval = state.approval;
            state.ModifyApproval(change);

            if (change != 0)
            {
                string direction = change > 0 ? "+" : "";
                Debug.Log($"[CompanionManager] {companion.DisplayName} approval {direction}{change} " +
                    $"({oldApproval} -> {state.approval})" +
                    (reason != null ? $": {reason}" : ""));

                OnApprovalChanged?.Invoke(companion, oldApproval, state.approval);

                // Check for romance stage changes
                CheckRomanceProgression(companionId);
            }
        }

        /// <summary>
        /// Triggers approval based on an action.
        /// </summary>
        public void TriggerApproval(ApprovalTriggerType type, string triggerId)
        {
            foreach (var companion in CompanionsById.Values)
            {
                var state = GetCompanionState(companion.id);
                if (state == null || !state.recruited) continue;

                var trigger = companion.approvalTriggers.Find(t => t.type == type && t.triggerId == triggerId);
                if (trigger != null)
                {
                    ModifyApproval(companion.id, trigger.change, trigger.reason);
                }
            }
        }

        /// <summary>
        /// Adds experience to a companion.
        /// </summary>
        public void AddExperience(string companionId, int xp)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null) return;

            int oldLevel = state.level;
            if (state.AddExperience(xp))
            {
                Debug.Log($"[CompanionManager] {companion.DisplayName} leveled up to {state.level}!");
                OnCompanionLevelUp?.Invoke(companion, state.level);

                // Check for new abilities
                foreach (var ability in companion.abilities)
                {
                    if (ability.levelRequired == state.level && !state.unlockedAbilities.Contains(ability.id))
                    {
                        state.unlockedAbilities.Add(ability.id);
                        Debug.Log($"[CompanionManager] {companion.DisplayName} learned {ability.name}!");
                    }
                }
            }
        }

        /// <summary>
        /// Advances personal quest.
        /// </summary>
        public void AdvancePersonalQuest(string companionId)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null) return;
            if (state.personalQuestCompleted) return;

            var quest = companion.personalQuest;
            if (quest == null || quest.stages.Count == 0) return;

            // Mark as started if not already
            if (!state.personalQuestStarted)
            {
                state.personalQuestStarted = true;
            }

            // Advance stage
            if (state.currentQuestStageIndex < quest.stages.Count)
            {
                var stage = quest.stages[state.currentQuestStageIndex];

                // Apply stage rewards
                if (stage.approvalReward > 0)
                {
                    ModifyApproval(companionId, stage.approvalReward, $"Completed quest stage: {stage.title}");
                }

                if (!string.IsNullOrEmpty(stage.unlocksAbility) && !state.unlockedAbilities.Contains(stage.unlocksAbility))
                {
                    state.unlockedAbilities.Add(stage.unlocksAbility);
                    var ability = companion.GetAbility(stage.unlocksAbility);
                    if (ability != null)
                    {
                        Debug.Log($"[CompanionManager] {companion.DisplayName} unlocked ability: {ability.name}");
                    }
                }

                if (stage.unlocksRomance && companion.romance.available)
                {
                    CheckRomanceProgression(companionId);
                }

                state.currentQuestStageIndex++;
                Debug.Log($"[CompanionManager] {companion.DisplayName} quest progressed to stage {state.currentQuestStageIndex}");

                OnPersonalQuestProgress?.Invoke(companion, state.currentQuestStageIndex);

                // Check for completion
                if (state.currentQuestStageIndex >= quest.stages.Count)
                {
                    CompletePersonalQuest(companionId);
                }
            }
        }

        /// <summary>
        /// Completes personal quest.
        /// </summary>
        private void CompletePersonalQuest(string companionId)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null) return;

            var quest = companion.personalQuest;
            state.personalQuestCompleted = true;

            // Apply final rewards
            if (quest.finalApprovalReward > 0)
            {
                ModifyApproval(companionId, quest.finalApprovalReward, "Completed personal quest");
            }

            if (!string.IsNullOrEmpty(quest.finalUnlocksAbility))
            {
                state.unlockedAbilities.Add(quest.finalUnlocksAbility);
            }

            if (!string.IsNullOrEmpty(quest.uniqueItemId))
            {
                // InventoryManager.Instance.AddItem(quest.uniqueItemId, 1);
                Debug.Log($"[CompanionManager] Received unique item: {quest.uniqueItemId}");
            }

            Debug.Log($"[CompanionManager] {companion.DisplayName} personal quest complete: {quest.title}");
        }

        /// <summary>
        /// Checks and updates romance progression.
        /// </summary>
        private void CheckRomanceProgression(string companionId)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null) return;
            if (!companion.romance.available) return;

            var oldStage = state.romanceStage;
            RomanceStage newStage = oldStage;

            // Determine new stage based on approval and quest progress
            if (state.approval >= companion.romance.approvalRequired)
            {
                if (companion.romance.requiresPersonalQuest && !state.personalQuestCompleted)
                {
                    newStage = RomanceStage.CloseFriend;
                }
                else
                {
                    if (state.romanceStage < RomanceStage.Interested)
                    {
                        newStage = RomanceStage.Interested;
                    }
                }
            }
            else if (state.approval >= 50)
            {
                newStage = RomanceStage.Friend;
            }
            else if (state.approval >= 25)
            {
                newStage = RomanceStage.Acquaintance;
            }
            else
            {
                newStage = RomanceStage.Locked;
            }

            if (newStage != oldStage && newStage > oldStage)
            {
                state.romanceStage = newStage;
                Debug.Log($"[CompanionManager] {companion.DisplayName} romance stage: {newStage}");
                OnRomanceStageChanged?.Invoke(companion, newStage);
            }
        }

        /// <summary>
        /// Gets available banter lines for context.
        /// </summary>
        public List<BanterLine> GetAvailableBanter(string companionId, BanterTrigger trigger, string triggerData = null)
        {
            var companion = GetCompanion(companionId);
            var state = GetCompanionState(companionId);

            if (companion == null || state == null) return new List<BanterLine>();

            return companion.banterLines
                .Where(line =>
                {
                    if (line.trigger != trigger) return false;
                    if (!string.IsNullOrEmpty(line.triggerData) && line.triggerData != triggerData) return false;
                    if (line.minApproval.HasValue && state.approval < line.minApproval.Value) return false;
                    if (line.maxApproval.HasValue && state.approval > line.maxApproval.Value) return false;
                    if (line.oneTime && state.usedBanterIds.Contains(line.id)) return false;
                    // Would check flags and quest state
                    return true;
                })
                .OrderByDescending(line => line.priority)
                .ToList();
        }

        /// <summary>
        /// Marks a banter line as used.
        /// </summary>
        public void MarkBanterUsed(string companionId, string banterId)
        {
            var state = GetCompanionState(companionId);
            if (state != null && !state.usedBanterIds.Contains(banterId))
            {
                state.usedBanterIds.Add(banterId);
            }
        }

        /// <summary>
        /// Updates party time tracking.
        /// </summary>
        public void UpdatePartyTime(float deltaTime)
        {
            foreach (var companionId in CurrentParty)
            {
                var state = GetCompanionState(companionId);
                if (state != null)
                {
                    state.totalTimeInParty += deltaTime;
                }
            }
        }

        /// <summary>
        /// Saves all companion states.
        /// </summary>
        public Dictionary<string, CompanionState> SaveStates()
        {
            return new Dictionary<string, CompanionState>(CompanionStates);
        }

        /// <summary>
        /// Loads companion states.
        /// </summary>
        public void LoadStates(Dictionary<string, CompanionState> states)
        {
            if (states != null)
            {
                CompanionStates = states;
                CurrentParty.Clear();
                foreach (var kvp in states)
                {
                    if (kvp.Value.inParty)
                    {
                        CurrentParty.Add(kvp.Key);
                    }
                }
            }
        }

        /// <summary>
        /// Gets party size limit.
        /// </summary>
        public int MaxPartySize => maxPartySize;

        /// <summary>
        /// Checks if party is full.
        /// </summary>
        public bool IsPartyFull => CurrentParty.Count >= maxPartySize;
    }

    /// <summary>
    /// JSON data structure for companions.
    /// </summary>
    [Serializable]
    public class CompanionsJsonData
    {
        public string schemaVersion;
        public int totalCompanions;
        public CompanionJsonEntry[] companions;
    }

    [Serializable]
    public class CompanionJsonEntry
    {
        public string id;
        public string name;
        public string nickname;
        public string title;
        public string description;
        public string backstory;
        public string portraitId;
        public string path;
        public string combatRole;
        public string locationId;
        public CompanionJsonStats stats;
        // ... additional fields would be defined here
    }

    [Serializable]
    public class CompanionJsonStats
    {
        public int maxHealth;
        public int actionPoints;
        public int baseDamage;
        public int armor;
        public int accuracy;
        public int evasion;
    }
}
