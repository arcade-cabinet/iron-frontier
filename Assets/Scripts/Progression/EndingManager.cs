using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IronFrontier.Progression
{
    /// <summary>
    /// Event args for ending triggered events
    /// </summary>
    public class EndingTriggeredEventArgs : EventArgs
    {
        public EndingData Ending { get; }
        public int Score { get; }
        public bool IsNewEnding { get; }

        public EndingTriggeredEventArgs(EndingData ending, int score, bool isNewEnding)
        {
            Ending = ending;
            Score = score;
            IsNewEnding = isNewEnding;
        }
    }

    /// <summary>
    /// Result of ending evaluation
    /// </summary>
    public class EndingEvaluationResult
    {
        public EndingData Ending { get; set; }
        public int TotalScore { get; set; }
        public int MatchedConditions { get; set; }
        public int RequiredConditionsMet { get; set; }
        public int RequiredConditionsTotal { get; set; }
        public bool MeetsMinimumScore { get; set; }
        public bool MeetsAllRequired { get; set; }
        public bool IsEligible => MeetsMinimumScore && MeetsAllRequired;
        public List<(EndingCondition condition, bool met, int score)> ConditionResults { get; set; } = new List<(EndingCondition, bool, int)>();
    }

    /// <summary>
    /// Interface for game state queries needed by EndingManager
    /// </summary>
    public interface IGameStateProvider
    {
        bool IsQuestCompleted(string questId);
        int GetFactionReputation(string factionId);
        bool IsFlagSet(string flagId);
        bool IsNpcAlive(string npcId);
        int GetPeopleKilled();
        int GetPeopleSaved();
        int GetQuestsCompleted();
        int GetDaysSurvived();
    }

    /// <summary>
    /// Manages ending determination, triggering, and persistence
    /// </summary>
    public class EndingManager : MonoBehaviour
    {
        public static EndingManager Instance { get; private set; }

        [Header("Configuration")]
        [SerializeField] private string endingsJsonPath = "Data/endings";
        [SerializeField] private string saveKey = "PlayerEndings";
        [SerializeField] private bool debugMode = false;

        // Ending data
        private List<EndingData> allEndings = new List<EndingData>();
        private Dictionary<string, EndingData> endingsById = new Dictionary<string, EndingData>();
        private Dictionary<EndingPath, List<EndingData>> endingsByPath = new Dictionary<EndingPath, List<EndingData>>();
        private EndingData fallbackEnding;

        // Player state
        private PlayerEndingState playerState;

        // Game state provider
        private IGameStateProvider gameStateProvider;

        // Events
        public event EventHandler<EndingTriggeredEventArgs> OnEndingTriggered;
        public event EventHandler OnEndingsLoaded;

        // Statistics
        public int TotalEndings => allEndings.Count;
        public int UnlockedEndingsCount => playerState?.unlockedEndingIds?.Count ?? 0;
        public int TotalPlaythroughs => playerState?.totalPlaythroughs ?? 0;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializePaths();
            LoadEndingData();
            LoadPlayerState();
        }

        private void InitializePaths()
        {
            foreach (EndingPath path in Enum.GetValues(typeof(EndingPath)))
            {
                endingsByPath[path] = new List<EndingData>();
            }
        }

        /// <summary>
        /// Set the game state provider for condition evaluation
        /// </summary>
        public void SetGameStateProvider(IGameStateProvider provider)
        {
            gameStateProvider = provider;
        }

        /// <summary>
        /// Load ending definitions from JSON
        /// </summary>
        private void LoadEndingData()
        {
            try
            {
                TextAsset jsonFile = Resources.Load<TextAsset>(endingsJsonPath);
                if (jsonFile == null)
                {
                    Debug.LogError($"[EndingManager] Failed to load endings from: {endingsJsonPath}");
                    return;
                }

                var wrapper = JsonUtility.FromJson<EndingDataWrapper>(jsonFile.text);
                if (wrapper == null || wrapper.endings == null)
                {
                    Debug.LogError("[EndingManager] Failed to parse endings JSON");
                    return;
                }

                foreach (var jsonData in wrapper.endings)
                {
                    var ending = ConvertJsonToEnding(jsonData);
                    if (ending != null)
                    {
                        allEndings.Add(ending);
                        endingsById[ending.id] = ending;
                        endingsByPath[ending.path].Add(ending);
                    }
                }

                // Set fallback ending
                if (!string.IsNullOrEmpty(wrapper.fallbackEndingId))
                {
                    fallbackEnding = GetEnding(wrapper.fallbackEndingId);
                }

                if (debugMode)
                {
                    Debug.Log($"[EndingManager] Loaded {allEndings.Count} endings");
                }

                OnEndingsLoaded?.Invoke(this, EventArgs.Empty);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[EndingManager] Error loading endings: {ex.Message}");
            }
        }

        /// <summary>
        /// Convert JSON data to EndingData ScriptableObject
        /// </summary>
        private EndingData ConvertJsonToEnding(EndingJsonData json)
        {
            var ending = ScriptableObject.CreateInstance<EndingData>();

            ending.id = json.id;
            ending.title = json.title;
            ending.tagline = json.tagline;
            ending.description = json.description;
            ending.path = ParsePath(json.path);
            ending.isGoodEnding = json.isGoodEnding;
            ending.isSecret = json.isSecret;
            ending.minimumScore = json.minimumScore;
            ending.priority = json.priority;
            ending.statisticsTemplate = json.statisticsTemplate;
            ending.tags = json.tags ?? new List<string>();

            // Parse conditions
            ending.conditions = new List<EndingCondition>();
            if (json.conditions != null)
            {
                foreach (var condJson in json.conditions)
                {
                    ending.conditions.Add(new EndingCondition
                    {
                        type = ParseConditionType(condJson.type),
                        target = condJson.target,
                        value = condJson.value ?? 0,
                        required = condJson.required,
                        weight = condJson.weight,
                        description = condJson.description
                    });
                }
            }

            // Parse character fates
            ending.characterFates = new List<CharacterFate>();
            if (json.characterFates != null)
            {
                foreach (var fateJson in json.characterFates)
                {
                    ending.characterFates.Add(new CharacterFate
                    {
                        npcId = fateJson.npcId,
                        displayName = fateJson.displayName,
                        fate = ParseFateType(fateJson.fate),
                        description = fateJson.description,
                        priority = fateJson.priority
                    });
                }
            }

            // Parse epilogue slides
            ending.epilogueSlides = new List<EpilogueSlide>();
            if (json.epilogueSlides != null)
            {
                foreach (var slideJson in json.epilogueSlides)
                {
                    ending.epilogueSlides.Add(new EpilogueSlide
                    {
                        id = slideJson.id,
                        title = slideJson.title,
                        text = slideJson.text,
                        imageKey = slideJson.imageKey,
                        characterId = slideJson.characterId,
                        tags = slideJson.tags ?? new List<string>()
                    });
                }
            }

            // Parse unlocks
            ending.unlocks = new List<EndingUnlock>();
            if (json.unlocks != null)
            {
                foreach (var unlockJson in json.unlocks)
                {
                    ending.unlocks.Add(new EndingUnlock
                    {
                        type = ParseUnlockType(unlockJson.type),
                        id = unlockJson.id,
                        name = unlockJson.name
                    });
                }
            }

            return ending;
        }

        private EndingPath ParsePath(string path)
        {
            return path?.ToLower() switch
            {
                "ivrc" => EndingPath.Ivrc,
                "copperhead" => EndingPath.Copperhead,
                "freeminer" => EndingPath.Freeminer,
                "law" => EndingPath.Law,
                "underground" => EndingPath.Underground,
                "independent" => EndingPath.Independent,
                _ => EndingPath.Independent
            };
        }

        private EndingConditionType ParseConditionType(string type)
        {
            return type?.ToLower() switch
            {
                "quest_completed" => EndingConditionType.QuestCompleted,
                "reputation_gte" => EndingConditionType.ReputationGte,
                "reputation_lte" => EndingConditionType.ReputationLte,
                "flag_set" => EndingConditionType.FlagSet,
                "flag_not_set" => EndingConditionType.FlagNotSet,
                "npc_alive" => EndingConditionType.NpcAlive,
                "npc_dead" => EndingConditionType.NpcDead,
                "people_killed_gte" => EndingConditionType.PeopleKilledGte,
                "people_saved_gte" => EndingConditionType.PeopleSavedGte,
                _ => EndingConditionType.QuestCompleted
            };
        }

        private FateType ParseFateType(string fate)
        {
            return fate?.ToLower().Replace("_", "") switch
            {
                "alivehappy" => FateType.AliveHappy,
                "alivestruggling" => FateType.AliveStruggling,
                "deadheroic" => FateType.DeadHeroic,
                "deadtragic" => FateType.DeadTragic,
                "deadjustice" => FateType.DeadJustice,
                "imprisoned" => FateType.Imprisoned,
                "departed" => FateType.Departed,
                "redeemed" => FateType.Redeemed,
                _ => FateType.AliveStruggling
            };
        }

        private EndingUnlockType ParseUnlockType(string type)
        {
            return type?.ToLower() switch
            {
                "achievement" => EndingUnlockType.Achievement,
                "gallery" => EndingUnlockType.Gallery,
                "new_game_plus" => EndingUnlockType.NewGamePlus,
                "music" => EndingUnlockType.Music,
                _ => EndingUnlockType.Achievement
            };
        }

        /// <summary>
        /// Load player ending state from PlayerPrefs
        /// </summary>
        private void LoadPlayerState()
        {
            string json = PlayerPrefs.GetString(saveKey, "");

            if (!string.IsNullOrEmpty(json))
            {
                try
                {
                    var saveData = JsonUtility.FromJson<PlayerEndingSaveData>(json);
                    playerState = saveData?.ToState();
                }
                catch
                {
                    playerState = null;
                }
            }

            if (playerState == null)
            {
                playerState = new PlayerEndingState();
            }

            if (debugMode)
            {
                Debug.Log($"[EndingManager] Loaded player state: {playerState.unlockedEndingIds.Count} endings unlocked, {playerState.totalPlaythroughs} playthroughs");
            }
        }

        /// <summary>
        /// Save player ending state to PlayerPrefs
        /// </summary>
        public void SavePlayerState()
        {
            var saveData = PlayerEndingSaveData.FromState(playerState);
            string json = JsonUtility.ToJson(saveData);
            PlayerPrefs.SetString(saveKey, json);
            PlayerPrefs.Save();

            if (debugMode)
            {
                Debug.Log("[EndingManager] Player state saved");
            }
        }

        /// <summary>
        /// Get an ending by its ID
        /// </summary>
        public EndingData GetEnding(string id)
        {
            return endingsById.TryGetValue(id, out var ending) ? ending : null;
        }

        /// <summary>
        /// Get all endings for a specific path
        /// </summary>
        public List<EndingData> GetEndingsByPath(EndingPath path)
        {
            return endingsByPath.TryGetValue(path, out var list)
                ? list.ToList()
                : new List<EndingData>();
        }

        /// <summary>
        /// Get all good endings
        /// </summary>
        public List<EndingData> GetGoodEndings()
        {
            return allEndings.Where(e => e.isGoodEnding).ToList();
        }

        /// <summary>
        /// Get all secret endings
        /// </summary>
        public List<EndingData> GetSecretEndings()
        {
            return allEndings.Where(e => e.isSecret).ToList();
        }

        /// <summary>
        /// Get all unlocked endings
        /// </summary>
        public List<EndingData> GetUnlockedEndings()
        {
            return allEndings.Where(e => playerState.HasUnlocked(e.id)).ToList();
        }

        /// <summary>
        /// Check if a specific ending has been unlocked
        /// </summary>
        public bool HasUnlocked(string endingId)
        {
            return playerState.HasUnlocked(endingId);
        }

        /// <summary>
        /// Evaluate a single condition against game state
        /// </summary>
        private bool EvaluateCondition(EndingCondition condition)
        {
            if (gameStateProvider == null)
            {
                Debug.LogWarning("[EndingManager] No game state provider set - cannot evaluate conditions");
                return false;
            }

            return condition.type switch
            {
                EndingConditionType.QuestCompleted =>
                    gameStateProvider.IsQuestCompleted(condition.target),

                EndingConditionType.ReputationGte =>
                    gameStateProvider.GetFactionReputation(condition.target) >= condition.value,

                EndingConditionType.ReputationLte =>
                    gameStateProvider.GetFactionReputation(condition.target) <= condition.value,

                EndingConditionType.FlagSet =>
                    gameStateProvider.IsFlagSet(condition.target),

                EndingConditionType.FlagNotSet =>
                    !gameStateProvider.IsFlagSet(condition.target),

                EndingConditionType.NpcAlive =>
                    gameStateProvider.IsNpcAlive(condition.target),

                EndingConditionType.NpcDead =>
                    !gameStateProvider.IsNpcAlive(condition.target),

                EndingConditionType.PeopleKilledGte =>
                    gameStateProvider.GetPeopleKilled() >= condition.value,

                EndingConditionType.PeopleSavedGte =>
                    gameStateProvider.GetPeopleSaved() >= condition.value,

                _ => false
            };
        }

        /// <summary>
        /// Evaluate all conditions for an ending
        /// </summary>
        public EndingEvaluationResult EvaluateEnding(EndingData ending)
        {
            var result = new EndingEvaluationResult
            {
                Ending = ending,
                TotalScore = 0,
                MatchedConditions = 0,
                RequiredConditionsMet = 0,
                RequiredConditionsTotal = 0
            };

            foreach (var condition in ending.conditions)
            {
                bool met = EvaluateCondition(condition);
                int score = met ? condition.weight : 0;

                result.ConditionResults.Add((condition, met, score));
                result.TotalScore += score;

                if (met)
                {
                    result.MatchedConditions++;
                }

                if (condition.required)
                {
                    result.RequiredConditionsTotal++;
                    if (met)
                    {
                        result.RequiredConditionsMet++;
                    }
                }
            }

            result.MeetsMinimumScore = result.TotalScore >= ending.minimumScore;
            result.MeetsAllRequired = result.RequiredConditionsMet == result.RequiredConditionsTotal;

            return result;
        }

        /// <summary>
        /// Evaluate all endings and return eligible ones sorted by priority
        /// </summary>
        public List<EndingEvaluationResult> EvaluateAllEndings()
        {
            var results = new List<EndingEvaluationResult>();

            foreach (var ending in allEndings)
            {
                var result = EvaluateEnding(ending);
                results.Add(result);

                if (debugMode)
                {
                    Debug.Log($"[EndingManager] Evaluated {ending.id}: Score={result.TotalScore}/{ending.minimumScore}, " +
                              $"Required={result.RequiredConditionsMet}/{result.RequiredConditionsTotal}, Eligible={result.IsEligible}");
                }
            }

            // Sort by eligibility, then priority (descending), then score (descending)
            return results
                .OrderByDescending(r => r.IsEligible)
                .ThenByDescending(r => r.Ending.priority)
                .ThenByDescending(r => r.TotalScore)
                .ToList();
        }

        /// <summary>
        /// Determine the best ending based on current game state
        /// </summary>
        public EndingData DetermineEnding()
        {
            var results = EvaluateAllEndings();

            // Find the first eligible ending (already sorted by priority)
            var bestResult = results.FirstOrDefault(r => r.IsEligible);

            if (bestResult != null)
            {
                if (debugMode)
                {
                    Debug.Log($"[EndingManager] Selected ending: {bestResult.Ending.title} (Score: {bestResult.TotalScore}, Priority: {bestResult.Ending.priority})");
                }
                return bestResult.Ending;
            }

            // No eligible endings - use fallback
            if (debugMode)
            {
                Debug.Log($"[EndingManager] No eligible endings, using fallback: {fallbackEnding?.title ?? "None"}");
            }

            return fallbackEnding ?? allEndings.FirstOrDefault();
        }

        /// <summary>
        /// Trigger an ending and record it
        /// </summary>
        public void TriggerEnding(EndingData ending)
        {
            if (ending == null)
            {
                Debug.LogError("[EndingManager] Cannot trigger null ending");
                return;
            }

            bool isNew = !playerState.HasUnlocked(ending.id);
            playerState.UnlockEnding(ending.id);
            playerState.currentPlaythroughEndingId = ending.id;
            SavePlayerState();

            if (debugMode)
            {
                Debug.Log($"[EndingManager] Triggered ending: {ending.title} (New: {isNew})");
            }

            // Process unlocks
            ProcessUnlocks(ending);

            // Evaluate and get score for event
            var result = EvaluateEnding(ending);

            // Fire event
            OnEndingTriggered?.Invoke(this, new EndingTriggeredEventArgs(ending, result.TotalScore, isNew));
        }

        /// <summary>
        /// Trigger the best ending based on current game state
        /// </summary>
        public EndingData TriggerBestEnding()
        {
            var ending = DetermineEnding();
            if (ending != null)
            {
                TriggerEnding(ending);
            }
            return ending;
        }

        /// <summary>
        /// Process unlocks granted by an ending
        /// </summary>
        private void ProcessUnlocks(EndingData ending)
        {
            foreach (var unlock in ending.unlocks)
            {
                switch (unlock.type)
                {
                    case EndingUnlockType.Achievement:
                        // Integration point: Unlock achievement
                        AchievementManager.Instance?.Unlock(unlock.id);
                        if (debugMode) Debug.Log($"[EndingManager] Unlocked achievement: {unlock.name}");
                        break;

                    case EndingUnlockType.Gallery:
                        // Integration point: Unlock gallery item
                        // GalleryManager.Instance?.Unlock(unlock.id);
                        if (debugMode) Debug.Log($"[EndingManager] Unlocked gallery: {unlock.name}");
                        break;

                    case EndingUnlockType.NewGamePlus:
                        // Integration point: Enable NG+ mode
                        // GameManager.Instance?.EnableNewGamePlus(unlock.id);
                        if (debugMode) Debug.Log($"[EndingManager] Unlocked NG+: {unlock.name}");
                        break;

                    case EndingUnlockType.Music:
                        // Integration point: Unlock music track
                        // MusicManager.Instance?.UnlockTrack(unlock.id);
                        if (debugMode) Debug.Log($"[EndingManager] Unlocked music: {unlock.name}");
                        break;
                }
            }
        }

        /// <summary>
        /// Get formatted statistics for an ending
        /// </summary>
        public string GetFormattedStatistics(EndingData ending)
        {
            if (gameStateProvider == null)
            {
                return ending.statisticsTemplate ?? "";
            }

            return ending.FormatStatistics(
                gameStateProvider.GetPeopleSaved(),
                gameStateProvider.GetPeopleKilled(),
                gameStateProvider.GetQuestsCompleted(),
                gameStateProvider.GetDaysSurvived()
            );
        }

        /// <summary>
        /// Get character fate for a specific NPC in an ending
        /// </summary>
        public CharacterFate GetCharacterFate(EndingData ending, string npcId)
        {
            return ending.characterFates.FirstOrDefault(f =>
                f.npcId.Equals(npcId, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Get all character fates for an ending, sorted by priority
        /// </summary>
        public List<CharacterFate> GetSortedCharacterFates(EndingData ending)
        {
            return ending.characterFates.OrderBy(f => f.priority).ToList();
        }

        /// <summary>
        /// Get completion percentage for unlocking endings
        /// </summary>
        public float GetCompletionPercentage()
        {
            if (allEndings.Count == 0) return 0f;
            return (float)playerState.unlockedEndingIds.Count / allEndings.Count;
        }

        /// <summary>
        /// Get how many times a specific ending has been achieved
        /// </summary>
        public int GetEndingAchievedCount(string endingId)
        {
            return playerState.GetEndingCount(endingId);
        }

        /// <summary>
        /// Reset ending progress (for debugging/new profile)
        /// </summary>
        public void ResetProgress()
        {
            playerState = new PlayerEndingState();
            SavePlayerState();

            if (debugMode)
            {
                Debug.Log("[EndingManager] Progress reset");
            }
        }

        #region Debug Methods

        /// <summary>
        /// Force trigger a specific ending by ID (for debugging)
        /// </summary>
        [ContextMenu("Debug: List All Endings")]
        public void DebugListAllEndings()
        {
            foreach (var ending in allEndings)
            {
                Debug.Log($"Ending: {ending.id} - {ending.title} (Path: {ending.path}, Good: {ending.isGoodEnding}, Secret: {ending.isSecret}, Priority: {ending.priority})");
            }
        }

        /// <summary>
        /// Evaluate and log all endings (for debugging)
        /// </summary>
        [ContextMenu("Debug: Evaluate All Endings")]
        public void DebugEvaluateAllEndings()
        {
            var results = EvaluateAllEndings();

            Debug.Log("=== Ending Evaluation Results ===");
            foreach (var result in results)
            {
                Debug.Log($"{result.Ending.title}: Score={result.TotalScore}/{result.Ending.minimumScore}, " +
                          $"Required={result.RequiredConditionsMet}/{result.RequiredConditionsTotal}, " +
                          $"Eligible={result.IsEligible}, Priority={result.Ending.priority}");
            }
        }

        #endregion
    }
}
