using System;
using UnityEngine;
using UnityEngine.Events;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// Event fired when a dialogue effect is processed.
    /// Used for integrating with other game systems.
    /// </summary>
    [Serializable]
    public class DialogueEffectEvent : UnityEvent<string, DialogueEffect> { }

    /// <summary>
    /// Handles dialogue effects by integrating with other game systems.
    /// Attach to the same GameObject as DialogueManager or as a singleton.
    /// </summary>
    public class DialogueEffectHandler : MonoBehaviour
    {
        [Header("Events")]
        [Tooltip("Fired when a quest should be started")]
        public UnityEvent<string> OnStartQuest;

        [Tooltip("Fired when a quest should be completed")]
        public UnityEvent<string> OnCompleteQuest;

        [Tooltip("Fired when a quest should be advanced")]
        public UnityEvent<string, string> OnAdvanceQuest;

        [Tooltip("Fired when an item should be given to player")]
        public UnityEvent<string, int> OnGiveItem;

        [Tooltip("Fired when an item should be taken from player")]
        public UnityEvent<string, int> OnTakeItem;

        [Tooltip("Fired when gold should be given to player")]
        public UnityEvent<int> OnGiveGold;

        [Tooltip("Fired when gold should be taken from player")]
        public UnityEvent<int> OnTakeGold;

        [Tooltip("Fired when reputation should change")]
        public UnityEvent<string, int> OnChangeReputation;

        [Tooltip("Fired when a flag should be set")]
        public UnityEvent<string> OnSetFlag;

        [Tooltip("Fired when a flag should be cleared")]
        public UnityEvent<string> OnClearFlag;

        [Tooltip("Fired when a location should be unlocked")]
        public UnityEvent<string> OnUnlockLocation;

        [Tooltip("Fired when NPC state should change")]
        public UnityEvent<string, string> OnChangeNpcState;

        [Tooltip("Fired when an event should be triggered")]
        public UnityEvent<string> OnTriggerEvent;

        [Tooltip("Fired when a shop should be opened")]
        public UnityEvent<string> OnOpenShop;

        private void Start()
        {
            // Register with DialogueManager
            if (DialogueManager.Instance != null)
            {
                DialogueManager.Instance.RegisterEffectHandler(HandleEffect);
            }
        }

        private void OnDestroy()
        {
            // Unregister if possible
            if (DialogueManager.Instance != null)
            {
                DialogueManager.Instance.RegisterEffectHandler(null);
            }
        }

        /// <summary>
        /// Handle a dialogue effect by routing it to the appropriate game system.
        /// </summary>
        public void HandleEffect(string npcId, DialogueEffect effect)
        {
            if (effect == null)
            {
                Debug.LogWarning("[DialogueEffectHandler] Received null effect");
                return;
            }

            switch (effect.type)
            {
                case DialogueEffectType.StartQuest:
                    HandleStartQuest(effect.target);
                    break;

                case DialogueEffectType.CompleteQuest:
                    HandleCompleteQuest(effect.target);
                    break;

                case DialogueEffectType.AdvanceQuest:
                    HandleAdvanceQuest(effect.target, effect.stringValue);
                    break;

                case DialogueEffectType.GiveItem:
                    HandleGiveItem(effect.target, effect.value > 0 ? effect.value : 1);
                    break;

                case DialogueEffectType.TakeItem:
                    HandleTakeItem(effect.target, effect.value > 0 ? effect.value : 1);
                    break;

                case DialogueEffectType.GiveGold:
                    HandleGiveGold(effect.value);
                    break;

                case DialogueEffectType.TakeGold:
                    HandleTakeGold(effect.value);
                    break;

                case DialogueEffectType.ChangeReputation:
                    HandleChangeReputation(effect.target, effect.value);
                    break;

                case DialogueEffectType.SetFlag:
                    HandleSetFlag(effect.target);
                    break;

                case DialogueEffectType.ClearFlag:
                    HandleClearFlag(effect.target);
                    break;

                case DialogueEffectType.UnlockLocation:
                    HandleUnlockLocation(effect.target);
                    break;

                case DialogueEffectType.ChangeNpcState:
                    HandleChangeNpcState(npcId, effect.stringValue);
                    break;

                case DialogueEffectType.TriggerEvent:
                    HandleTriggerEvent(effect.target);
                    break;

                case DialogueEffectType.OpenShop:
                    HandleOpenShop(effect.target);
                    break;

                default:
                    Debug.LogWarning($"[DialogueEffectHandler] Unknown effect type: {effect.type}");
                    break;
            }
        }

        private void HandleStartQuest(string questId)
        {
            if (string.IsNullOrEmpty(questId))
            {
                Debug.LogWarning("[DialogueEffectHandler] StartQuest: questId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Starting quest: {questId}");
            OnStartQuest?.Invoke(questId);
        }

        private void HandleCompleteQuest(string questId)
        {
            if (string.IsNullOrEmpty(questId))
            {
                Debug.LogWarning("[DialogueEffectHandler] CompleteQuest: questId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Completing quest: {questId}");
            OnCompleteQuest?.Invoke(questId);
        }

        private void HandleAdvanceQuest(string questId, string step)
        {
            if (string.IsNullOrEmpty(questId))
            {
                Debug.LogWarning("[DialogueEffectHandler] AdvanceQuest: questId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Advancing quest: {questId} to step: {step}");
            OnAdvanceQuest?.Invoke(questId, step);
        }

        private void HandleGiveItem(string itemId, int amount)
        {
            if (string.IsNullOrEmpty(itemId))
            {
                Debug.LogWarning("[DialogueEffectHandler] GiveItem: itemId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Giving item: {itemId} x{amount}");
            OnGiveItem?.Invoke(itemId, amount);
        }

        private void HandleTakeItem(string itemId, int amount)
        {
            if (string.IsNullOrEmpty(itemId))
            {
                Debug.LogWarning("[DialogueEffectHandler] TakeItem: itemId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Taking item: {itemId} x{amount}");
            OnTakeItem?.Invoke(itemId, amount);
        }

        private void HandleGiveGold(int amount)
        {
            Debug.Log($"[DialogueEffectHandler] Giving gold: {amount}");
            OnGiveGold?.Invoke(amount);
        }

        private void HandleTakeGold(int amount)
        {
            Debug.Log($"[DialogueEffectHandler] Taking gold: {amount}");
            OnTakeGold?.Invoke(amount);
        }

        private void HandleChangeReputation(string factionId, int amount)
        {
            Debug.Log($"[DialogueEffectHandler] Changing reputation with {factionId ?? "general"} by {amount}");
            OnChangeReputation?.Invoke(factionId, amount);
        }

        private void HandleSetFlag(string flagId)
        {
            if (string.IsNullOrEmpty(flagId))
            {
                Debug.LogWarning("[DialogueEffectHandler] SetFlag: flagId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Setting flag: {flagId}");
            OnSetFlag?.Invoke(flagId);
        }

        private void HandleClearFlag(string flagId)
        {
            if (string.IsNullOrEmpty(flagId))
            {
                Debug.LogWarning("[DialogueEffectHandler] ClearFlag: flagId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Clearing flag: {flagId}");
            OnClearFlag?.Invoke(flagId);
        }

        private void HandleUnlockLocation(string locationId)
        {
            if (string.IsNullOrEmpty(locationId))
            {
                Debug.LogWarning("[DialogueEffectHandler] UnlockLocation: locationId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Unlocking location: {locationId}");
            OnUnlockLocation?.Invoke(locationId);
        }

        private void HandleChangeNpcState(string npcId, string newState)
        {
            Debug.Log($"[DialogueEffectHandler] Changing NPC {npcId} state to: {newState}");
            OnChangeNpcState?.Invoke(npcId, newState);
        }

        private void HandleTriggerEvent(string eventId)
        {
            if (string.IsNullOrEmpty(eventId))
            {
                Debug.LogWarning("[DialogueEffectHandler] TriggerEvent: eventId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Triggering event: {eventId}");
            OnTriggerEvent?.Invoke(eventId);
        }

        private void HandleOpenShop(string shopId)
        {
            if (string.IsNullOrEmpty(shopId))
            {
                Debug.LogWarning("[DialogueEffectHandler] OpenShop: shopId is null or empty");
                return;
            }

            Debug.Log($"[DialogueEffectHandler] Opening shop: {shopId}");
            OnOpenShop?.Invoke(shopId);
        }
    }
}
