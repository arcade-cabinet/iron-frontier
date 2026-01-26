using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Interface for game state providers that DialogueConditionChecker queries.
    /// </summary>
    public interface IQuestProvider
    {
        bool IsQuestActive(string questId);
        bool IsQuestComplete(string questId);
        bool IsQuestNotStarted(string questId);
    }

    public interface IInventoryProvider
    {
        bool HasItem(string itemId, int minAmount = 1);
        int GetGold();
    }

    public interface IReputationProvider
    {
        int GetReputation(string factionId = null);
    }

    public interface IFlagProvider
    {
        bool IsFlagSet(string flagId);
    }

    public interface INpcStateProvider
    {
        bool HasTalkedTo(string npcId);
        bool IsFirstMeeting(string npcId);
    }

    public interface ITimeProvider
    {
        string GetTimeOfDay(); // "morning", "afternoon", "evening", "night"
    }

    /// <summary>
    /// Evaluates dialogue conditions against game state.
    /// Register providers for each condition type or use default implementations.
    /// </summary>
    public class DialogueConditionChecker : MonoBehaviour
    {
        [Header("Optional: Assign Providers in Inspector")]
        [SerializeField] private MonoBehaviour _questProvider;
        [SerializeField] private MonoBehaviour _inventoryProvider;
        [SerializeField] private MonoBehaviour _reputationProvider;
        [SerializeField] private MonoBehaviour _flagProvider;
        [SerializeField] private MonoBehaviour _npcStateProvider;
        [SerializeField] private MonoBehaviour _timeProvider;

        // Cached interface references
        private IQuestProvider _quests;
        private IInventoryProvider _inventory;
        private IReputationProvider _reputation;
        private IFlagProvider _flags;
        private INpcStateProvider _npcState;
        private ITimeProvider _time;

        // Fallback state (used when no providers are registered)
        private HashSet<string> _localFlags = new HashSet<string>();
        private HashSet<string> _talkedToNpcs = new HashSet<string>();
        private int _localGold = 100;
        private int _localReputation = 0;

        private void Awake()
        {
            // Cache interface references from serialized MonoBehaviours
            _quests = _questProvider as IQuestProvider;
            _inventory = _inventoryProvider as IInventoryProvider;
            _reputation = _reputationProvider as IReputationProvider;
            _flags = _flagProvider as IFlagProvider;
            _npcState = _npcStateProvider as INpcStateProvider;
            _time = _timeProvider as ITimeProvider;
        }

        private void Start()
        {
            // Register with DialogueManager
            if (DialogueManager.Instance != null)
            {
                DialogueManager.Instance.RegisterConditionChecker(CheckCondition);
            }
        }

        private void OnDestroy()
        {
            // Unregister if possible
            if (DialogueManager.Instance != null)
            {
                DialogueManager.Instance.RegisterConditionChecker(null);
            }
        }

        /// <summary>
        /// Register custom providers programmatically
        /// </summary>
        public void RegisterProviders(
            IQuestProvider quests = null,
            IInventoryProvider inventory = null,
            IReputationProvider reputation = null,
            IFlagProvider flags = null,
            INpcStateProvider npcState = null,
            ITimeProvider time = null)
        {
            if (quests != null) _quests = quests;
            if (inventory != null) _inventory = inventory;
            if (reputation != null) _reputation = reputation;
            if (flags != null) _flags = flags;
            if (npcState != null) _npcState = npcState;
            if (time != null) _time = time;
        }

        /// <summary>
        /// Check a dialogue condition against game state.
        /// </summary>
        public bool CheckCondition(string npcId, DialogueCondition condition)
        {
            if (condition == null)
            {
                return true;
            }

            return condition.type switch
            {
                ConditionType.QuestActive => CheckQuestActive(condition.target),
                ConditionType.QuestComplete => CheckQuestComplete(condition.target),
                ConditionType.QuestNotStarted => CheckQuestNotStarted(condition.target),
                ConditionType.HasItem => CheckHasItem(condition.target),
                ConditionType.LacksItem => !CheckHasItem(condition.target),
                ConditionType.ReputationGte => CheckReputationGte(condition.target, condition.value),
                ConditionType.ReputationLte => CheckReputationLte(condition.target, condition.value),
                ConditionType.GoldGte => CheckGoldGte(condition.value),
                ConditionType.TalkedTo => CheckTalkedTo(condition.target),
                ConditionType.NotTalkedTo => !CheckTalkedTo(condition.target),
                ConditionType.TimeOfDay => CheckTimeOfDay(condition.stringValue),
                ConditionType.FlagSet => CheckFlagSet(condition.target),
                ConditionType.FlagNotSet => !CheckFlagSet(condition.target),
                ConditionType.FirstMeeting => CheckFirstMeeting(npcId),
                ConditionType.ReturnVisit => !CheckFirstMeeting(npcId),
                _ => true
            };
        }

        // ============================================
        // Condition Implementations
        // ============================================

        private bool CheckQuestActive(string questId)
        {
            if (_quests != null)
            {
                return _quests.IsQuestActive(questId);
            }
            // Fallback: no quest system, assume not active
            return false;
        }

        private bool CheckQuestComplete(string questId)
        {
            if (_quests != null)
            {
                return _quests.IsQuestComplete(questId);
            }
            // Fallback: no quest system, assume not complete
            return false;
        }

        private bool CheckQuestNotStarted(string questId)
        {
            if (_quests != null)
            {
                return _quests.IsQuestNotStarted(questId);
            }
            // Fallback: assume not started
            return true;
        }

        private bool CheckHasItem(string itemId)
        {
            if (_inventory != null)
            {
                return _inventory.HasItem(itemId);
            }
            // Fallback: no inventory system, assume has item
            return true;
        }

        private bool CheckReputationGte(string factionId, int threshold)
        {
            int rep;
            if (_reputation != null)
            {
                rep = _reputation.GetReputation(factionId);
            }
            else
            {
                rep = _localReputation;
            }
            return rep >= threshold;
        }

        private bool CheckReputationLte(string factionId, int threshold)
        {
            int rep;
            if (_reputation != null)
            {
                rep = _reputation.GetReputation(factionId);
            }
            else
            {
                rep = _localReputation;
            }
            return rep <= threshold;
        }

        private bool CheckGoldGte(int amount)
        {
            int gold;
            if (_inventory != null)
            {
                gold = _inventory.GetGold();
            }
            else
            {
                gold = _localGold;
            }
            return gold >= amount;
        }

        private bool CheckTalkedTo(string targetNpcId)
        {
            if (_npcState != null)
            {
                return _npcState.HasTalkedTo(targetNpcId);
            }
            // Fallback: use local tracking
            return _talkedToNpcs.Contains(targetNpcId);
        }

        private bool CheckTimeOfDay(string expectedTime)
        {
            if (_time != null)
            {
                return string.Equals(_time.GetTimeOfDay(), expectedTime, StringComparison.OrdinalIgnoreCase);
            }
            // Fallback: assume afternoon
            return string.Equals(expectedTime, "afternoon", StringComparison.OrdinalIgnoreCase);
        }

        private bool CheckFlagSet(string flagId)
        {
            if (_flags != null)
            {
                return _flags.IsFlagSet(flagId);
            }
            // Fallback: use local tracking
            return _localFlags.Contains(flagId);
        }

        private bool CheckFirstMeeting(string npcId)
        {
            if (_npcState != null)
            {
                return _npcState.IsFirstMeeting(npcId);
            }
            // Fallback: check if we've talked to this NPC before
            return !_talkedToNpcs.Contains(npcId);
        }

        // ============================================
        // Fallback State Management
        // ============================================

        /// <summary>
        /// Set a local flag (used when no flag provider is registered)
        /// </summary>
        public void SetLocalFlag(string flagId, bool value = true)
        {
            if (value)
            {
                _localFlags.Add(flagId);
            }
            else
            {
                _localFlags.Remove(flagId);
            }
        }

        /// <summary>
        /// Mark an NPC as talked to (used when no NPC state provider is registered)
        /// </summary>
        public void MarkTalkedTo(string npcId)
        {
            _talkedToNpcs.Add(npcId);
        }

        /// <summary>
        /// Set local gold (used when no inventory provider is registered)
        /// </summary>
        public void SetLocalGold(int amount)
        {
            _localGold = amount;
        }

        /// <summary>
        /// Add local gold (used when no inventory provider is registered)
        /// </summary>
        public void AddLocalGold(int amount)
        {
            _localGold += amount;
        }

        /// <summary>
        /// Set local reputation (used when no reputation provider is registered)
        /// </summary>
        public void SetLocalReputation(int value)
        {
            _localReputation = value;
        }

        /// <summary>
        /// Change local reputation (used when no reputation provider is registered)
        /// </summary>
        public void ChangeLocalReputation(int delta)
        {
            _localReputation += delta;
        }
    }
}
