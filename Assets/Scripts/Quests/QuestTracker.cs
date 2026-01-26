using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Quests
{
    /// <summary>
    /// Tracks progress for an individual active quest.
    /// Handles objective completion, stage progression, and timing.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript quest tracking in quests.ts.
    /// Each active quest has its own QuestTracker instance managed by QuestManager.
    /// </remarks>
    public class QuestTracker
    {
        #region Properties

        /// <summary>The quest data this tracker is for.</summary>
        public QuestData QuestData { get; }

        /// <summary>Unique quest ID.</summary>
        public string QuestId => QuestData.id;

        /// <summary>Current quest status.</summary>
        public QuestStatus Status { get; private set; } = QuestStatus.Active;

        /// <summary>Current stage index (0-based).</summary>
        public int CurrentStageIndex { get; private set; } = 0;

        /// <summary>Time when quest was started (Unix timestamp).</summary>
        public long StartTime { get; private set; }

        /// <summary>Time when quest was completed (0 if not complete).</summary>
        public long CompletionTime { get; private set; }

        /// <summary>Remaining time in hours (for timed quests).</summary>
        public float RemainingTimeHours { get; private set; }

        /// <summary>Whether the quest has a time limit.</summary>
        public bool HasTimeLimit => QuestData.timeLimitHours > 0;

        /// <summary>Whether the quest timer has expired.</summary>
        public bool IsTimerExpired => HasTimeLimit && RemainingTimeHours <= 0;

        /// <summary>Whether the quest is complete.</summary>
        public bool IsComplete => Status == QuestStatus.Completed;

        /// <summary>Whether the quest has failed.</summary>
        public bool IsFailed => Status == QuestStatus.Failed;

        /// <summary>Whether the quest is still active.</summary>
        public bool IsActive => Status == QuestStatus.Active;

        #endregion

        #region Private Fields

        // Objective progress keyed by objective ID
        private readonly Dictionary<string, int> _objectiveProgress = new Dictionary<string, int>();

        // Completed objective IDs
        private readonly HashSet<string> _completedObjectives = new HashSet<string>();

        // Hidden objectives that have been revealed
        private readonly HashSet<string> _revealedObjectives = new HashSet<string>();

        // Custom tracking data
        private readonly Dictionary<string, string> _customData = new Dictionary<string, string>();

        #endregion

        #region Constructor

        /// <summary>
        /// Create a new quest tracker for the given quest.
        /// </summary>
        /// <param name="questData">The quest to track.</param>
        public QuestTracker(QuestData questData)
        {
            QuestData = questData ?? throw new ArgumentNullException(nameof(questData));

            StartTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            RemainingTimeHours = questData.timeLimitHours;

            // Initialize objective progress for first stage
            InitializeStageObjectives(0);
        }

        #endregion

        #region Stage Management

        /// <summary>
        /// Get the current stage data.
        /// </summary>
        /// <returns>The current quest stage, or null if invalid.</returns>
        public QuestStage? GetCurrentStage()
        {
            return QuestData.GetStage(CurrentStageIndex);
        }

        /// <summary>
        /// Get a specific stage by index.
        /// </summary>
        /// <param name="stageIndex">The stage index.</param>
        /// <returns>The quest stage, or null if invalid.</returns>
        public QuestStage? GetStage(int stageIndex)
        {
            return QuestData.GetStage(stageIndex);
        }

        /// <summary>
        /// Check if the current stage is complete.
        /// </summary>
        /// <returns>True if all required objectives are complete.</returns>
        public bool IsCurrentStageComplete()
        {
            return QuestData.IsStageComplete(CurrentStageIndex, _objectiveProgress);
        }

        /// <summary>
        /// Advance to the next stage.
        /// </summary>
        /// <returns>True if advanced, false if no more stages.</returns>
        public bool AdvanceStage()
        {
            if (CurrentStageIndex >= QuestData.StageCount - 1)
            {
                return false;
            }

            CurrentStageIndex++;
            InitializeStageObjectives(CurrentStageIndex);
            return true;
        }

        private void InitializeStageObjectives(int stageIndex)
        {
            var stage = QuestData.GetStage(stageIndex);
            if (!stage.HasValue) return;

            foreach (var objective in stage.Value.objectives)
            {
                if (!_objectiveProgress.ContainsKey(objective.id))
                {
                    _objectiveProgress[objective.id] = 0;
                }
            }
        }

        #endregion

        #region Objective Management

        /// <summary>
        /// Get an objective by ID from the current stage.
        /// </summary>
        /// <param name="objectiveId">The objective ID.</param>
        /// <returns>The objective, or null if not found.</returns>
        public QuestObjective? GetObjective(string objectiveId)
        {
            var stage = GetCurrentStage();
            if (!stage.HasValue) return null;

            foreach (var objective in stage.Value.objectives)
            {
                if (objective.id == objectiveId)
                {
                    return objective;
                }
            }

            return null;
        }

        /// <summary>
        /// Get all objectives for the current stage.
        /// </summary>
        /// <returns>List of objectives with their progress.</returns>
        public List<ObjectiveStatus> GetCurrentObjectives()
        {
            var objectives = new List<ObjectiveStatus>();
            var stage = GetCurrentStage();

            if (!stage.HasValue) return objectives;

            foreach (var objective in stage.Value.objectives)
            {
                // Skip hidden objectives that haven't been revealed
                if (objective.hidden && !_revealedObjectives.Contains(objective.id))
                {
                    continue;
                }

                objectives.Add(new ObjectiveStatus
                {
                    Objective = objective,
                    CurrentProgress = GetObjectiveProgress(objective.id),
                    IsComplete = IsObjectiveComplete(objective.id)
                });
            }

            return objectives;
        }

        /// <summary>
        /// Get the current progress for an objective.
        /// </summary>
        /// <param name="objectiveId">The objective ID.</param>
        /// <returns>Current progress value.</returns>
        public int GetObjectiveProgress(string objectiveId)
        {
            return _objectiveProgress.GetValueOrDefault(objectiveId, 0);
        }

        /// <summary>
        /// Check if an objective is complete.
        /// </summary>
        /// <param name="objectiveId">The objective ID.</param>
        /// <returns>True if complete.</returns>
        public bool IsObjectiveComplete(string objectiveId)
        {
            if (_completedObjectives.Contains(objectiveId))
            {
                return true;
            }

            var objective = GetObjective(objectiveId);
            if (!objective.HasValue) return false;

            return GetObjectiveProgress(objectiveId) >= objective.Value.count;
        }

        /// <summary>
        /// Add progress to an objective.
        /// </summary>
        /// <param name="objectiveId">The objective ID.</param>
        /// <param name="amount">Amount to add.</param>
        /// <returns>True if progress was added.</returns>
        public bool AddProgress(string objectiveId, int amount = 1)
        {
            var objective = GetObjective(objectiveId);
            if (!objective.HasValue) return false;

            if (_completedObjectives.Contains(objectiveId))
            {
                return false;
            }

            var current = GetObjectiveProgress(objectiveId);
            var newProgress = Mathf.Min(current + amount, objective.Value.count);
            _objectiveProgress[objectiveId] = newProgress;

            // Mark as complete if target reached
            if (newProgress >= objective.Value.count)
            {
                _completedObjectives.Add(objectiveId);
            }

            return true;
        }

        /// <summary>
        /// Set progress for an objective directly.
        /// </summary>
        /// <param name="objectiveId">The objective ID.</param>
        /// <param name="progress">Progress value to set.</param>
        public void SetProgress(string objectiveId, int progress)
        {
            var objective = GetObjective(objectiveId);
            if (!objective.HasValue) return;

            var clamped = Mathf.Clamp(progress, 0, objective.Value.count);
            _objectiveProgress[objectiveId] = clamped;

            if (clamped >= objective.Value.count)
            {
                _completedObjectives.Add(objectiveId);
            }
            else
            {
                _completedObjectives.Remove(objectiveId);
            }
        }

        /// <summary>
        /// Reveal a hidden objective.
        /// </summary>
        /// <param name="objectiveId">The objective ID to reveal.</param>
        public void RevealObjective(string objectiveId)
        {
            _revealedObjectives.Add(objectiveId);
        }

        /// <summary>
        /// Check if a hidden objective has been revealed.
        /// </summary>
        /// <param name="objectiveId">The objective ID.</param>
        /// <returns>True if revealed.</returns>
        public bool IsObjectiveRevealed(string objectiveId)
        {
            return _revealedObjectives.Contains(objectiveId);
        }

        #endregion

        #region Status Management

        /// <summary>
        /// Mark the quest as completed.
        /// </summary>
        public void SetCompleted()
        {
            Status = QuestStatus.Completed;
            CompletionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        /// <summary>
        /// Mark the quest as failed.
        /// </summary>
        public void SetFailed()
        {
            Status = QuestStatus.Failed;
            CompletionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        /// <summary>
        /// Mark the quest as abandoned.
        /// </summary>
        public void SetAbandoned()
        {
            Status = QuestStatus.Abandoned;
            CompletionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        #endregion

        #region Timer

        /// <summary>
        /// Update the quest timer.
        /// </summary>
        /// <param name="gameHoursPassed">Game hours that have passed.</param>
        /// <returns>True if timer expired this update.</returns>
        public bool UpdateTimer(float gameHoursPassed)
        {
            if (!HasTimeLimit || IsTimerExpired)
            {
                return false;
            }

            var wasExpired = IsTimerExpired;
            RemainingTimeHours = Mathf.Max(0, RemainingTimeHours - gameHoursPassed);

            return !wasExpired && IsTimerExpired;
        }

        /// <summary>
        /// Get the timer progress as a percentage (0-1).
        /// </summary>
        /// <returns>Timer progress (1 = full time, 0 = expired).</returns>
        public float GetTimerProgress()
        {
            if (!HasTimeLimit || QuestData.timeLimitHours <= 0)
            {
                return 1f;
            }

            return RemainingTimeHours / QuestData.timeLimitHours;
        }

        #endregion

        #region Custom Data

        /// <summary>
        /// Set custom tracking data.
        /// </summary>
        /// <param name="key">Data key.</param>
        /// <param name="value">Data value.</param>
        public void SetCustomData(string key, string value)
        {
            _customData[key] = value;
        }

        /// <summary>
        /// Get custom tracking data.
        /// </summary>
        /// <param name="key">Data key.</param>
        /// <returns>Data value, or null if not found.</returns>
        public string GetCustomData(string key)
        {
            return _customData.TryGetValue(key, out var value) ? value : null;
        }

        #endregion

        #region Summary

        /// <summary>
        /// Get a summary of the quest's current state.
        /// </summary>
        /// <returns>Quest summary string.</returns>
        public string GetSummary()
        {
            var stage = GetCurrentStage();
            var stageName = stage.HasValue ? stage.Value.title : "Unknown";

            var objectives = GetCurrentObjectives();
            var completed = objectives.Count(o => o.IsComplete);

            return $"{QuestData.title} - Stage {CurrentStageIndex + 1}: {stageName} ({completed}/{objectives.Count} objectives)";
        }

        /// <summary>
        /// Get completion percentage for the current stage.
        /// </summary>
        /// <returns>Percentage complete (0-100).</returns>
        public float GetStageCompletionPercent()
        {
            var objectives = GetCurrentObjectives();
            if (objectives.Count == 0) return 100f;

            float totalProgress = 0f;
            float totalRequired = 0f;

            foreach (var obj in objectives)
            {
                if (!obj.Objective.optional)
                {
                    totalProgress += obj.CurrentProgress;
                    totalRequired += obj.Objective.count;
                }
            }

            return totalRequired > 0 ? (totalProgress / totalRequired) * 100f : 100f;
        }

        /// <summary>
        /// Get overall quest completion percentage.
        /// </summary>
        /// <returns>Percentage complete (0-100).</returns>
        public float GetOverallCompletionPercent()
        {
            var totalStages = QuestData.StageCount;
            if (totalStages == 0) return 100f;

            // Completed stages + current stage progress
            var completedStages = CurrentStageIndex;
            var currentStageProgress = GetStageCompletionPercent() / 100f;

            return ((completedStages + currentStageProgress) / totalStages) * 100f;
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Get save data for this tracker.
        /// </summary>
        /// <returns>Serializable save data.</returns>
        public QuestTrackerSaveData GetSaveData()
        {
            var progressList = new List<ObjectiveProgressEntry>();
            foreach (var kvp in _objectiveProgress)
            {
                progressList.Add(new ObjectiveProgressEntry { objectiveId = kvp.Key, progress = kvp.Value });
            }

            var customDataList = new List<CustomDataEntry>();
            foreach (var kvp in _customData)
            {
                customDataList.Add(new CustomDataEntry { key = kvp.Key, value = kvp.Value });
            }

            return new QuestTrackerSaveData
            {
                questId = QuestId,
                status = Status.ToString(),
                currentStageIndex = CurrentStageIndex,
                startTime = StartTime,
                completionTime = CompletionTime,
                remainingTimeHours = RemainingTimeHours,
                objectiveProgress = progressList,
                completedObjectives = _completedObjectives.ToList(),
                revealedObjectives = _revealedObjectives.ToList(),
                customData = customDataList
            };
        }

        /// <summary>
        /// Load save data into this tracker.
        /// </summary>
        /// <param name="saveData">Save data to load.</param>
        public void LoadSaveData(QuestTrackerSaveData saveData)
        {
            if (saveData == null) return;

            Status = Enum.TryParse<QuestStatus>(saveData.status, out var status)
                ? status : QuestStatus.Active;

            CurrentStageIndex = saveData.currentStageIndex;
            StartTime = saveData.startTime;
            CompletionTime = saveData.completionTime;
            RemainingTimeHours = saveData.remainingTimeHours;

            _objectiveProgress.Clear();
            _completedObjectives.Clear();
            _revealedObjectives.Clear();
            _customData.Clear();

            if (saveData.objectiveProgress != null)
            {
                foreach (var entry in saveData.objectiveProgress)
                {
                    _objectiveProgress[entry.objectiveId] = entry.progress;
                }
            }

            if (saveData.completedObjectives != null)
            {
                _completedObjectives.UnionWith(saveData.completedObjectives);
            }

            if (saveData.revealedObjectives != null)
            {
                _revealedObjectives.UnionWith(saveData.revealedObjectives);
            }

            if (saveData.customData != null)
            {
                foreach (var entry in saveData.customData)
                {
                    _customData[entry.key] = entry.value;
                }
            }
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Status of a single objective.
    /// </summary>
    public struct ObjectiveStatus
    {
        public QuestObjective Objective;
        public int CurrentProgress;
        public bool IsComplete;

        public float ProgressPercent => Objective.count > 0
            ? (float)CurrentProgress / Objective.count * 100f
            : 100f;
    }

    /// <summary>
    /// Save data for a quest tracker.
    /// </summary>
    [Serializable]
    public class QuestTrackerSaveData
    {
        public string questId;
        public string status;
        public int currentStageIndex;
        public long startTime;
        public long completionTime;
        public float remainingTimeHours;
        public List<ObjectiveProgressEntry> objectiveProgress;
        public List<string> completedObjectives;
        public List<string> revealedObjectives;
        public List<CustomDataEntry> customData;
    }

    [Serializable]
    public struct ObjectiveProgressEntry
    {
        public string objectiveId;
        public int progress;
    }

    [Serializable]
    public struct CustomDataEntry
    {
        public string key;
        public string value;
    }

    #endregion
}
