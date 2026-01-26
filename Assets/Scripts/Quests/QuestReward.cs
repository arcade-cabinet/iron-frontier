using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Quests
{
    /// <summary>
    /// Event arguments for reward granted events.
    /// </summary>
    public class RewardGrantedEventArgs : EventArgs
    {
        /// <summary>Type of reward.</summary>
        public RewardType Type { get; }

        /// <summary>Amount or quantity of the reward.</summary>
        public int Amount { get; }

        /// <summary>Item data if this is an item reward.</summary>
        public ItemData Item { get; }

        /// <summary>Additional context (e.g., faction ID for reputation).</summary>
        public string Context { get; }

        public RewardGrantedEventArgs(RewardType type, int amount, ItemData item = null, string context = null)
        {
            Type = type;
            Amount = amount;
            Item = item;
            Context = context;
        }
    }

    /// <summary>
    /// Types of rewards that can be granted.
    /// </summary>
    public enum RewardType
    {
        Gold,
        XP,
        Item,
        Reputation,
        Unlock
    }

    /// <summary>
    /// Handles quest reward distribution and validation.
    /// Integrates with inventory, currency, and progression systems.
    /// </summary>
    /// <remarks>
    /// Centralized reward handler that ensures all reward types are
    /// properly distributed and tracked across game systems.
    /// </remarks>
    public class QuestRewardHandler : MonoBehaviour
    {
        #region Singleton

        private static QuestRewardHandler _instance;

        /// <summary>
        /// Global singleton instance of QuestRewardHandler.
        /// </summary>
        public static QuestRewardHandler Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<QuestRewardHandler>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[QuestRewardHandler]");
                        _instance = go.AddComponent<QuestRewardHandler>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when any reward is granted.</summary>
        public event EventHandler<RewardGrantedEventArgs> OnRewardGranted;

        /// <summary>Fired when gold is granted.</summary>
        public event EventHandler<int> OnGoldGranted;

        /// <summary>Fired when XP is granted.</summary>
        public event EventHandler<int> OnXPGranted;

        /// <summary>Fired when an item is granted.</summary>
        public event EventHandler<(ItemData item, int quantity)> OnItemGranted;

        /// <summary>Fired when reputation changes.</summary>
        public event EventHandler<(string factionId, int amount)> OnReputationChanged;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Multiplier for XP rewards")]
        private float xpMultiplier = 1.0f;

        [SerializeField]
        [Tooltip("Multiplier for gold rewards")]
        private float goldMultiplier = 1.0f;

        [SerializeField]
        [Tooltip("Show notification for each reward")]
        private bool showRewardNotifications = true;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Running totals for statistics
        private int _totalGoldGranted = 0;
        private int _totalXPGranted = 0;
        private int _totalItemsGranted = 0;
        private int _totalQuestsRewarded = 0;

        #endregion

        #region Properties

        /// <summary>Total gold granted from quests.</summary>
        public int TotalGoldGranted => _totalGoldGranted;

        /// <summary>Total XP granted from quests.</summary>
        public int TotalXPGranted => _totalXPGranted;

        /// <summary>Total items granted from quests.</summary>
        public int TotalItemsGranted => _totalItemsGranted;

        /// <summary>Total quests that granted rewards.</summary>
        public int TotalQuestsRewarded => _totalQuestsRewarded;

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

            // Subscribe to QuestManager events
            if (QuestManager.Instance != null)
            {
                QuestManager.Instance.OnRewardsGranted += HandleRewardsGranted;
            }
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                if (QuestManager.Instance != null)
                {
                    QuestManager.Instance.OnRewardsGranted -= HandleRewardsGranted;
                }
                _instance = null;
            }
        }

        #endregion

        #region Reward Processing

        /// <summary>
        /// Grant all rewards from a QuestRewards struct.
        /// </summary>
        /// <param name="rewards">The rewards to grant.</param>
        /// <param name="sourceQuestId">Optional quest ID for tracking.</param>
        public void GrantRewards(QuestRewards rewards, string sourceQuestId = null)
        {
            _totalQuestsRewarded++;
            Log($"Granting rewards from quest: {sourceQuestId ?? "unknown"}");

            // Grant gold
            if (rewards.gold > 0)
            {
                GrantGold(rewards.gold);
            }

            // Grant XP
            if (rewards.xp > 0)
            {
                GrantXP(rewards.xp);
            }

            // Grant items
            if (rewards.items != null)
            {
                foreach (var rewardItem in rewards.items)
                {
                    var item = rewardItem.item;
                    var itemId = rewardItem.itemId;

                    if (item != null)
                    {
                        GrantItem(item, rewardItem.quantity);
                    }
                    else if (!string.IsNullOrEmpty(itemId))
                    {
                        GrantItemById(itemId, rewardItem.quantity);
                    }
                }
            }

            // Apply reputation changes
            if (rewards.reputation != null)
            {
                foreach (var repChange in rewards.reputation)
                {
                    ChangeReputation(repChange.factionId, repChange.amount);
                }
            }

            // Unlock quests
            if (rewards.unlocksQuests != null)
            {
                foreach (var questId in rewards.unlocksQuests)
                {
                    UnlockQuest(questId);
                }
            }
        }

        private void HandleRewardsGranted(object sender, QuestRewards rewards)
        {
            GrantRewards(rewards);
        }

        #endregion

        #region Individual Rewards

        /// <summary>
        /// Grant gold to the player.
        /// </summary>
        /// <param name="amount">Amount of gold to grant.</param>
        public void GrantGold(int amount)
        {
            var adjustedAmount = Mathf.RoundToInt(amount * goldMultiplier);

            _totalGoldGranted += adjustedAmount;
            OnGoldGranted?.Invoke(this, adjustedAmount);
            OnRewardGranted?.Invoke(this, new RewardGrantedEventArgs(RewardType.Gold, adjustedAmount));

            // Publish to EventBus for other systems
            EventBus.Instance?.Publish<int>(GameEvents.GoldChanged, adjustedAmount);

            if (showRewardNotifications)
            {
                EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"+${adjustedAmount}");
            }

            Log($"Granted {adjustedAmount} gold");
        }

        /// <summary>
        /// Grant XP to the player.
        /// </summary>
        /// <param name="amount">Amount of XP to grant.</param>
        public void GrantXP(int amount)
        {
            var adjustedAmount = Mathf.RoundToInt(amount * xpMultiplier);

            _totalXPGranted += adjustedAmount;
            OnXPGranted?.Invoke(this, adjustedAmount);
            OnRewardGranted?.Invoke(this, new RewardGrantedEventArgs(RewardType.XP, adjustedAmount));

            // Publish XP gain - player system handles leveling
            EventBus.Instance?.Publish<int>("xp_gained", adjustedAmount);

            if (showRewardNotifications)
            {
                EventBus.Instance?.Publish(GameEvents.NotificationSuccess, $"+{adjustedAmount} XP");
            }

            Log($"Granted {adjustedAmount} XP");
        }

        /// <summary>
        /// Grant an item to the player.
        /// </summary>
        /// <param name="item">The item to grant.</param>
        /// <param name="quantity">Quantity to grant.</param>
        public void GrantItem(ItemData item, int quantity = 1)
        {
            if (item == null)
            {
                LogWarning("Cannot grant null item");
                return;
            }

            _totalItemsGranted += quantity;
            OnItemGranted?.Invoke(this, (item, quantity));
            OnRewardGranted?.Invoke(this, new RewardGrantedEventArgs(RewardType.Item, quantity, item));

            // Publish item added event
            var itemEvent = new ItemEventData
            {
                ItemId = item.id,
                Quantity = quantity
            };
            EventBus.Instance?.Publish(GameEvents.ItemAdded, itemEvent);

            if (showRewardNotifications)
            {
                var itemName = item.displayName ?? item.id;
                var text = quantity > 1 ? $"Received: {itemName} x{quantity}" : $"Received: {itemName}";
                EventBus.Instance?.Publish(GameEvents.NotificationSuccess, text);
            }

            Log($"Granted item: {item.id} x{quantity}");
        }

        /// <summary>
        /// Grant an item by ID.
        /// </summary>
        /// <param name="itemId">The item ID to grant.</param>
        /// <param name="quantity">Quantity to grant.</param>
        public void GrantItemById(string itemId, int quantity = 1)
        {
            // Try to load item from Resources
            var item = Resources.Load<ItemData>($"Items/{itemId}");

            if (item != null)
            {
                GrantItem(item, quantity);
            }
            else
            {
                // Fallback: just publish the event with ID
                _totalItemsGranted += quantity;
                OnRewardGranted?.Invoke(this, new RewardGrantedEventArgs(RewardType.Item, quantity, null, itemId));

                var itemEvent = new ItemEventData
                {
                    ItemId = itemId,
                    Quantity = quantity
                };
                EventBus.Instance?.Publish(GameEvents.ItemAdded, itemEvent);

                if (showRewardNotifications)
                {
                    var text = quantity > 1 ? $"Received: {itemId} x{quantity}" : $"Received: {itemId}";
                    EventBus.Instance?.Publish(GameEvents.NotificationSuccess, text);
                }

                Log($"Granted item by ID: {itemId} x{quantity}");
            }
        }

        /// <summary>
        /// Change reputation with a faction.
        /// </summary>
        /// <param name="factionId">The faction ID.</param>
        /// <param name="amount">Reputation change (positive or negative).</param>
        public void ChangeReputation(string factionId, int amount)
        {
            if (string.IsNullOrEmpty(factionId)) return;

            OnReputationChanged?.Invoke(this, (factionId, amount));
            OnRewardGranted?.Invoke(this, new RewardGrantedEventArgs(RewardType.Reputation, amount, null, factionId));

            // Publish reputation change
            var repChange = new ReputationChange
            {
                factionId = factionId,
                amount = amount
            };
            EventBus.Instance?.Publish(GameEvents.ReputationChanged, repChange);

            if (showRewardNotifications && amount != 0)
            {
                var direction = amount > 0 ? "+" : "";
                EventBus.Instance?.Publish(GameEvents.NotificationInfo, $"{factionId} reputation: {direction}{amount}");
            }

            Log($"Reputation change: {factionId} {amount:+#;-#}");
        }

        /// <summary>
        /// Unlock a quest for the player.
        /// </summary>
        /// <param name="questId">The quest ID to unlock.</param>
        public void UnlockQuest(string questId)
        {
            if (string.IsNullOrEmpty(questId)) return;

            QuestManager.Instance?.SetQuestFlag($"quest_{questId}_unlocked", true);
            OnRewardGranted?.Invoke(this, new RewardGrantedEventArgs(RewardType.Unlock, 1, null, questId));

            Log($"Unlocked quest: {questId}");
        }

        #endregion

        #region Reward Preview

        /// <summary>
        /// Get a display-friendly summary of rewards.
        /// </summary>
        /// <param name="rewards">The rewards to summarize.</param>
        /// <returns>List of reward summary strings.</returns>
        public static List<string> GetRewardSummary(QuestRewards rewards)
        {
            var summary = new List<string>();

            if (rewards.xp > 0)
            {
                summary.Add($"{rewards.xp} XP");
            }

            if (rewards.gold > 0)
            {
                summary.Add($"${rewards.gold}");
            }

            if (rewards.items != null)
            {
                foreach (var item in rewards.items)
                {
                    var name = item.item?.displayName ?? item.itemId ?? "Unknown Item";
                    if (item.quantity > 1)
                    {
                        summary.Add($"{name} x{item.quantity}");
                    }
                    else
                    {
                        summary.Add(name);
                    }
                }
            }

            if (rewards.reputation != null)
            {
                foreach (var rep in rewards.reputation)
                {
                    var direction = rep.amount > 0 ? "+" : "";
                    summary.Add($"{rep.factionId} Rep {direction}{rep.amount}");
                }
            }

            return summary;
        }

        /// <summary>
        /// Get the total value of rewards in gold equivalent.
        /// </summary>
        /// <param name="rewards">The rewards to evaluate.</param>
        /// <param name="xpToGoldRatio">Gold value per XP point.</param>
        /// <returns>Total gold equivalent value.</returns>
        public static int GetTotalValue(QuestRewards rewards, float xpToGoldRatio = 0.1f)
        {
            int total = rewards.gold;
            total += Mathf.RoundToInt(rewards.xp * xpToGoldRatio);

            if (rewards.items != null)
            {
                foreach (var item in rewards.items)
                {
                    if (item.item != null)
                    {
                        total += item.item.value * item.quantity;
                    }
                }
            }

            return total;
        }

        /// <summary>
        /// Create an empty rewards struct.
        /// </summary>
        /// <returns>Empty QuestRewards.</returns>
        public static QuestRewards CreateEmpty()
        {
            return QuestRewards.Empty;
        }

        /// <summary>
        /// Create rewards with just gold.
        /// </summary>
        /// <param name="gold">Gold amount.</param>
        /// <returns>QuestRewards with gold.</returns>
        public static QuestRewards CreateGoldReward(int gold)
        {
            var rewards = QuestRewards.Empty;
            rewards.gold = gold;
            return rewards;
        }

        /// <summary>
        /// Create rewards with just XP.
        /// </summary>
        /// <param name="xp">XP amount.</param>
        /// <returns>QuestRewards with XP.</returns>
        public static QuestRewards CreateXPReward(int xp)
        {
            var rewards = QuestRewards.Empty;
            rewards.xp = xp;
            return rewards;
        }

        /// <summary>
        /// Create rewards with gold and XP.
        /// </summary>
        /// <param name="gold">Gold amount.</param>
        /// <param name="xp">XP amount.</param>
        /// <returns>QuestRewards with gold and XP.</returns>
        public static QuestRewards CreateStandardReward(int gold, int xp)
        {
            var rewards = QuestRewards.Empty;
            rewards.gold = gold;
            rewards.xp = xp;
            return rewards;
        }

        /// <summary>
        /// Combine two reward structs.
        /// </summary>
        /// <param name="a">First rewards.</param>
        /// <param name="b">Second rewards.</param>
        /// <returns>Combined rewards.</returns>
        public static QuestRewards CombineRewards(QuestRewards a, QuestRewards b)
        {
            var combined = new QuestRewards
            {
                xp = a.xp + b.xp,
                gold = a.gold + b.gold,
                items = new List<RewardItem>(),
                reputation = new List<ReputationChange>(),
                unlocksQuests = new List<string>()
            };

            if (a.items != null) combined.items.AddRange(a.items);
            if (b.items != null) combined.items.AddRange(b.items);

            if (a.reputation != null) combined.reputation.AddRange(a.reputation);
            if (b.reputation != null) combined.reputation.AddRange(b.reputation);

            if (a.unlocksQuests != null) combined.unlocksQuests.AddRange(a.unlocksQuests);
            if (b.unlocksQuests != null) combined.unlocksQuests.AddRange(b.unlocksQuests);

            return combined;
        }

        #endregion

        #region Multiplier Management

        /// <summary>
        /// Set the XP multiplier.
        /// </summary>
        /// <param name="multiplier">New multiplier value.</param>
        public void SetXPMultiplier(float multiplier)
        {
            xpMultiplier = Mathf.Max(0, multiplier);
            Log($"XP multiplier set to {xpMultiplier}");
        }

        /// <summary>
        /// Set the gold multiplier.
        /// </summary>
        /// <param name="multiplier">New multiplier value.</param>
        public void SetGoldMultiplier(float multiplier)
        {
            goldMultiplier = Mathf.Max(0, multiplier);
            Log($"Gold multiplier set to {goldMultiplier}");
        }

        /// <summary>
        /// Apply a temporary reward bonus.
        /// </summary>
        /// <param name="xpBonus">XP bonus (additive, e.g., 0.5 = 50% more).</param>
        /// <param name="goldBonus">Gold bonus (additive).</param>
        /// <param name="duration">Duration in seconds.</param>
        public void ApplyRewardBonus(float xpBonus, float goldBonus, float duration)
        {
            var originalXP = xpMultiplier;
            var originalGold = goldMultiplier;

            xpMultiplier += xpBonus;
            goldMultiplier += goldBonus;

            // Reset after duration
            StartCoroutine(ResetMultipliersAfter(originalXP, originalGold, duration));

            Log($"Applied reward bonus: XP +{xpBonus * 100}%, Gold +{goldBonus * 100}% for {duration}s");
        }

        private System.Collections.IEnumerator ResetMultipliersAfter(float xp, float gold, float duration)
        {
            yield return new WaitForSeconds(duration);
            xpMultiplier = xp;
            goldMultiplier = gold;
            Log("Reward bonus expired");
        }

        #endregion

        #region Statistics

        /// <summary>
        /// Reset all statistics.
        /// </summary>
        public void ResetStatistics()
        {
            _totalGoldGranted = 0;
            _totalXPGranted = 0;
            _totalItemsGranted = 0;
            _totalQuestsRewarded = 0;
        }

        /// <summary>
        /// Get a summary of all rewards granted.
        /// </summary>
        /// <returns>Statistics summary string.</returns>
        public string GetStatisticsSummary()
        {
            return $"Quest Rewards - Gold: ${_totalGoldGranted}, XP: {_totalXPGranted}, Items: {_totalItemsGranted}, Quests: {_totalQuestsRewarded}";
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[QuestRewardHandler] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[QuestRewardHandler] {message}");
        }

        #endregion
    }
}
