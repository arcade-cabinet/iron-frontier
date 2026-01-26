using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;
using IronFrontier.Core;
using IronFrontier.Data;

namespace IronFrontier.Quests
{
    /// <summary>
    /// Quest tracking mode for the HUD tracker.
    /// </summary>
    public enum QuestTrackingMode
    {
        /// <summary>Track the most recently updated quest.</summary>
        MostRecent,
        /// <summary>Track a specific pinned quest.</summary>
        Pinned,
        /// <summary>Track all active quests.</summary>
        All,
        /// <summary>Track main quests only.</summary>
        MainOnly
    }

    /// <summary>
    /// UI Toolkit-based quest display manager.
    /// Handles the quest journal, HUD tracker, objective markers, and notifications.
    /// </summary>
    /// <remarks>
    /// Integrates with QuestManager events to keep UI in sync with quest state.
    /// Uses UI Toolkit for modern Unity 6 UI rendering.
    /// </remarks>
    [RequireComponent(typeof(UIDocument))]
    public class QuestUI : MonoBehaviour
    {
        #region Singleton

        private static QuestUI _instance;

        /// <summary>
        /// Global singleton instance of QuestUI.
        /// </summary>
        public static QuestUI Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<QuestUI>();
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when the journal is opened.</summary>
        public event EventHandler OnJournalOpened;

        /// <summary>Fired when the journal is closed.</summary>
        public event EventHandler OnJournalClosed;

        /// <summary>Fired when a quest is selected in the journal.</summary>
        public event EventHandler<QuestData> OnQuestSelected;

        /// <summary>Fired when a quest is pinned/unpinned.</summary>
        public event EventHandler<(string questId, bool isPinned)> OnQuestPinChanged;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Maximum objectives to show on HUD")]
        private int maxHudObjectives = 3;

        [SerializeField]
        [Tooltip("Tracking mode for HUD")]
        private QuestTrackingMode trackingMode = QuestTrackingMode.MostRecent;

        [SerializeField]
        [Tooltip("Duration to show notifications")]
        private float notificationDuration = 3f;

        [SerializeField]
        [Tooltip("Notification slide animation duration")]
        private float notificationAnimDuration = 0.3f;

        [Header("Audio")]
        [SerializeField]
        private AudioClip questStartedSound;

        [SerializeField]
        private AudioClip questCompletedSound;

        [SerializeField]
        private AudioClip objectiveCompletedSound;

        [SerializeField]
        private AudioClip journalOpenSound;

        [SerializeField]
        private AudioClip journalCloseSound;

        #endregion

        #region USS Class Names

        private const string JOURNAL_PANEL = "quest-journal";
        private const string JOURNAL_HIDDEN = "quest-journal--hidden";
        private const string QUEST_LIST = "quest-list";
        private const string QUEST_LIST_ITEM = "quest-list-item";
        private const string QUEST_LIST_ITEM_MAIN = "quest-list-item--main";
        private const string QUEST_LIST_ITEM_SELECTED = "quest-list-item--selected";
        private const string QUEST_DETAILS = "quest-details";
        private const string OBJECTIVE_ITEM = "objective-item";
        private const string OBJECTIVE_COMPLETE = "objective-item--complete";
        private const string REWARD_ITEM = "reward-item";
        private const string HUD_TRACKER = "quest-hud-tracker";
        private const string NOTIFICATION_PANEL = "quest-notification";
        private const string NOTIFICATION_HIDDEN = "quest-notification--hidden";

        #endregion

        #region Private Fields

        private UIDocument _uiDocument;
        private VisualElement _root;

        // Journal elements
        private VisualElement _journalPanel;
        private ScrollView _questListContainer;
        private VisualElement _questDetailsPanel;
        private Label _questTitleLabel;
        private Label _questDescriptionLabel;
        private VisualElement _objectiveListContainer;
        private VisualElement _rewardListContainer;
        private Button _trackButton;
        private Button _abandonButton;
        private Button _closeButton;

        // HUD tracker elements
        private VisualElement _hudTrackerPanel;
        private Label _hudQuestNameLabel;
        private VisualElement _hudObjectiveContainer;

        // Notification elements
        private VisualElement _notificationPanel;
        private Label _notificationTitleLabel;
        private Label _notificationDescriptionLabel;

        // State
        private AudioSource _audioSource;
        private string _selectedQuestId;
        private string _pinnedQuestId;
        private bool _isJournalOpen;
        private Queue<QuestNotification> _notificationQueue = new Queue<QuestNotification>();
        private bool _isShowingNotification;

        #endregion

        #region Properties

        /// <summary>Whether the journal is currently open.</summary>
        public bool IsJournalOpen => _isJournalOpen;

        /// <summary>Currently selected quest ID in the journal.</summary>
        public string SelectedQuestId => _selectedQuestId;

        /// <summary>Currently pinned quest ID.</summary>
        public string PinnedQuestId => _pinnedQuestId;

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

            _uiDocument = GetComponent<UIDocument>();
            _audioSource = GetComponent<AudioSource>();
        }

        private void OnEnable()
        {
            if (_uiDocument == null) return;

            _root = _uiDocument.rootVisualElement;
            if (_root == null) return;

            SetupUIElements();
            SubscribeToEvents();
            RefreshHudTracker();

            // Hide journal at start
            if (_journalPanel != null)
            {
                _journalPanel.AddToClassList(JOURNAL_HIDDEN);
            }
        }

        private void OnDisable()
        {
            UnsubscribeFromEvents();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }

        private void Update()
        {
            // Handle input for journal toggle
            if (UnityEngine.Input.GetKeyDown(KeyCode.J) || UnityEngine.Input.GetKeyDown(KeyCode.L))
            {
                ToggleJournal();
            }
        }

        #endregion

        #region UI Setup

        private void SetupUIElements()
        {
            // Journal elements
            _journalPanel = _root.Q<VisualElement>(JOURNAL_PANEL);
            _questListContainer = _root.Q<ScrollView>("quest-list-scroll");
            _questDetailsPanel = _root.Q<VisualElement>("quest-details");
            _questTitleLabel = _root.Q<Label>("quest-title");
            _questDescriptionLabel = _root.Q<Label>("quest-description");
            _objectiveListContainer = _root.Q<VisualElement>("objective-list");
            _rewardListContainer = _root.Q<VisualElement>("reward-list");
            _trackButton = _root.Q<Button>("track-button");
            _abandonButton = _root.Q<Button>("abandon-button");
            _closeButton = _root.Q<Button>("close-button");

            // HUD tracker elements
            _hudTrackerPanel = _root.Q<VisualElement>("quest-hud-tracker");
            _hudQuestNameLabel = _root.Q<Label>("hud-quest-name");
            _hudObjectiveContainer = _root.Q<VisualElement>("hud-objective-list");

            // Notification elements
            _notificationPanel = _root.Q<VisualElement>("quest-notification");
            _notificationTitleLabel = _root.Q<Label>("notification-title");
            _notificationDescriptionLabel = _root.Q<Label>("notification-description");

            // Setup button callbacks
            if (_trackButton != null)
            {
                _trackButton.clicked += OnTrackButtonClicked;
            }

            if (_abandonButton != null)
            {
                _abandonButton.clicked += OnAbandonButtonClicked;
            }

            if (_closeButton != null)
            {
                _closeButton.clicked += CloseJournal;
            }
        }

        #endregion

        #region Event Subscriptions

        private void SubscribeToEvents()
        {
            if (QuestManager.Instance == null) return;

            QuestManager.Instance.OnQuestStarted += HandleQuestStarted;
            QuestManager.Instance.OnQuestCompleted += HandleQuestCompleted;
            QuestManager.Instance.OnQuestFailed += HandleQuestFailed;
            QuestManager.Instance.OnQuestUpdated += HandleQuestUpdated;
            QuestManager.Instance.OnObjectiveCompleted += HandleObjectiveCompleted;
            QuestManager.Instance.OnStageAdvanced += HandleStageAdvanced;
        }

        private void UnsubscribeFromEvents()
        {
            if (QuestManager.Instance == null) return;

            QuestManager.Instance.OnQuestStarted -= HandleQuestStarted;
            QuestManager.Instance.OnQuestCompleted -= HandleQuestCompleted;
            QuestManager.Instance.OnQuestFailed -= HandleQuestFailed;
            QuestManager.Instance.OnQuestUpdated -= HandleQuestUpdated;
            QuestManager.Instance.OnObjectiveCompleted -= HandleObjectiveCompleted;
            QuestManager.Instance.OnStageAdvanced -= HandleStageAdvanced;
        }

        #endregion

        #region Journal

        /// <summary>
        /// Open the quest journal.
        /// </summary>
        public void OpenJournal()
        {
            if (_isJournalOpen || _journalPanel == null) return;

            _isJournalOpen = true;
            _journalPanel.RemoveFromClassList(JOURNAL_HIDDEN);

            RefreshQuestList();
            PlaySound(journalOpenSound);

            OnJournalOpened?.Invoke(this, EventArgs.Empty);

            // Pause game time
            Time.timeScale = 0f;
        }

        /// <summary>
        /// Close the quest journal.
        /// </summary>
        public void CloseJournal()
        {
            if (!_isJournalOpen || _journalPanel == null) return;

            _isJournalOpen = false;
            _journalPanel.AddToClassList(JOURNAL_HIDDEN);

            PlaySound(journalCloseSound);
            OnJournalClosed?.Invoke(this, EventArgs.Empty);

            // Resume game time
            Time.timeScale = 1f;
        }

        /// <summary>
        /// Toggle the journal open/closed.
        /// </summary>
        public void ToggleJournal()
        {
            if (_isJournalOpen)
                CloseJournal();
            else
                OpenJournal();
        }

        /// <summary>
        /// Refresh the quest list in the journal.
        /// </summary>
        public void RefreshQuestList()
        {
            if (_questListContainer == null) return;

            _questListContainer.Clear();

            var activeQuests = QuestManager.Instance?.ActiveQuests;
            if (activeQuests == null) return;

            foreach (var tracker in activeQuests)
            {
                CreateQuestListItem(tracker);
            }

            // Select first quest if none selected
            if (string.IsNullOrEmpty(_selectedQuestId) && QuestManager.Instance.ActiveQuestCount > 0)
            {
                var first = new List<QuestTracker>(activeQuests)[0];
                SelectQuest(first.QuestId);
            }
            else if (!string.IsNullOrEmpty(_selectedQuestId))
            {
                RefreshQuestDetails();
            }
        }

        private void CreateQuestListItem(QuestTracker tracker)
        {
            var item = new VisualElement();
            item.AddToClassList(QUEST_LIST_ITEM);

            if (tracker.QuestData.IsMainQuest)
            {
                item.AddToClassList(QUEST_LIST_ITEM_MAIN);
            }

            if (tracker.QuestId == _selectedQuestId)
            {
                item.AddToClassList(QUEST_LIST_ITEM_SELECTED);
            }

            // Title label
            var titleLabel = new Label(tracker.QuestData.title);
            titleLabel.AddToClassList("quest-list-item-title");
            item.Add(titleLabel);

            // Progress indicator
            var progressLabel = new Label($"Stage {tracker.CurrentStageIndex + 1}/{tracker.QuestData.StageCount}");
            progressLabel.AddToClassList("quest-list-item-progress");
            item.Add(progressLabel);

            // Pinned indicator
            if (tracker.QuestId == _pinnedQuestId)
            {
                var pinnedIcon = new VisualElement();
                pinnedIcon.AddToClassList("quest-list-item-pinned");
                item.Add(pinnedIcon);
            }

            // Click handler
            var questId = tracker.QuestId;
            item.RegisterCallback<ClickEvent>(evt => SelectQuest(questId));

            _questListContainer.Add(item);
        }

        /// <summary>
        /// Select a quest to view details.
        /// </summary>
        /// <param name="questId">The quest ID to select.</param>
        public void SelectQuest(string questId)
        {
            _selectedQuestId = questId;
            RefreshQuestList(); // Update selection highlighting
            RefreshQuestDetails();

            var questData = QuestManager.Instance?.GetQuestTracker(questId)?.QuestData;
            if (questData != null)
            {
                OnQuestSelected?.Invoke(this, questData);
            }
        }

        private void RefreshQuestDetails()
        {
            if (_questDetailsPanel == null) return;

            var tracker = QuestManager.Instance?.GetQuestTracker(_selectedQuestId);
            if (tracker == null)
            {
                _questDetailsPanel.style.display = DisplayStyle.None;
                return;
            }

            _questDetailsPanel.style.display = DisplayStyle.Flex;

            var quest = tracker.QuestData;

            // Update title and description
            if (_questTitleLabel != null)
            {
                _questTitleLabel.text = quest.title;
            }

            if (_questDescriptionLabel != null)
            {
                var stage = tracker.GetCurrentStage();
                _questDescriptionLabel.text = stage.HasValue ? stage.Value.description : quest.description;
            }

            // Update objectives
            RefreshObjectiveList(tracker);

            // Update rewards
            RefreshRewardList(quest.rewards);

            // Update track button text
            if (_trackButton != null)
            {
                _trackButton.text = _pinnedQuestId == _selectedQuestId ? "Untrack" : "Track";
            }
        }

        private void RefreshObjectiveList(QuestTracker tracker)
        {
            if (_objectiveListContainer == null) return;

            _objectiveListContainer.Clear();

            var objectives = tracker.GetCurrentObjectives();
            foreach (var objStatus in objectives)
            {
                CreateObjectiveListItem(objStatus);
            }
        }

        private void CreateObjectiveListItem(ObjectiveStatus objStatus)
        {
            var item = new VisualElement();
            item.AddToClassList(OBJECTIVE_ITEM);

            if (objStatus.IsComplete)
            {
                item.AddToClassList(OBJECTIVE_COMPLETE);
            }

            // Checkbox indicator
            var checkbox = new VisualElement();
            checkbox.AddToClassList(objStatus.IsComplete ? "objective-checkbox-checked" : "objective-checkbox");
            item.Add(checkbox);

            // Description with progress
            var progressStr = QuestObjectiveValidator.GetProgressString(objStatus.Objective, objStatus.CurrentProgress);
            var textLabel = new Label($"{objStatus.Objective.description} ({progressStr})");
            textLabel.AddToClassList("objective-text");
            item.Add(textLabel);

            // Optional indicator
            if (objStatus.Objective.optional)
            {
                var optionalLabel = new Label("[Optional]");
                optionalLabel.AddToClassList("objective-optional");
                item.Add(optionalLabel);
            }

            _objectiveListContainer.Add(item);
        }

        private void RefreshRewardList(QuestRewards rewards)
        {
            if (_rewardListContainer == null) return;

            _rewardListContainer.Clear();

            var rewardStrings = QuestRewardHandler.GetRewardSummary(rewards);
            foreach (var rewardStr in rewardStrings)
            {
                var item = new Label(rewardStr);
                item.AddToClassList(REWARD_ITEM);
                _rewardListContainer.Add(item);
            }
        }

        #endregion

        #region HUD Tracker

        /// <summary>
        /// Refresh the HUD quest tracker display.
        /// </summary>
        public void RefreshHudTracker()
        {
            if (_hudTrackerPanel == null) return;

            var tracker = GetTrackedQuest();
            if (tracker == null)
            {
                _hudTrackerPanel.style.display = DisplayStyle.None;
                return;
            }

            _hudTrackerPanel.style.display = DisplayStyle.Flex;

            // Update quest name
            if (_hudQuestNameLabel != null)
            {
                _hudQuestNameLabel.text = tracker.QuestData.title;
            }

            // Update objectives
            RefreshHudObjectives(tracker);
        }

        private void RefreshHudObjectives(QuestTracker tracker)
        {
            if (_hudObjectiveContainer == null) return;

            _hudObjectiveContainer.Clear();

            var objectives = tracker.GetCurrentObjectives();
            var count = 0;

            foreach (var objStatus in objectives)
            {
                if (count >= maxHudObjectives) break;
                if (objStatus.IsComplete && trackingMode != QuestTrackingMode.All) continue;

                CreateHudObjectiveItem(objStatus);
                count++;
            }
        }

        private void CreateHudObjectiveItem(ObjectiveStatus objStatus)
        {
            var item = new VisualElement();
            item.AddToClassList("hud-objective-item");

            if (objStatus.IsComplete)
            {
                item.AddToClassList("hud-objective-item--complete");
            }

            var progressStr = QuestObjectiveValidator.GetProgressString(objStatus.Objective, objStatus.CurrentProgress);
            var textLabel = new Label($"- {objStatus.Objective.description} ({progressStr})");
            item.Add(textLabel);

            _hudObjectiveContainer.Add(item);
        }

        private QuestTracker GetTrackedQuest()
        {
            if (QuestManager.Instance == null) return null;

            switch (trackingMode)
            {
                case QuestTrackingMode.Pinned:
                    if (!string.IsNullOrEmpty(_pinnedQuestId))
                    {
                        return QuestManager.Instance.GetQuestTracker(_pinnedQuestId);
                    }
                    goto case QuestTrackingMode.MostRecent;

                case QuestTrackingMode.MainOnly:
                    foreach (var tracker in QuestManager.Instance.ActiveQuests)
                    {
                        if (tracker.QuestData.IsMainQuest)
                            return tracker;
                    }
                    goto case QuestTrackingMode.MostRecent;

                case QuestTrackingMode.MostRecent:
                default:
                    var trackers = new List<QuestTracker>(QuestManager.Instance.ActiveQuests);
                    return trackers.Count > 0 ? trackers[0] : null;
            }
        }

        /// <summary>
        /// Pin a quest to the tracker.
        /// </summary>
        /// <param name="questId">The quest ID to pin.</param>
        public void PinQuest(string questId)
        {
            _pinnedQuestId = questId;
            trackingMode = QuestTrackingMode.Pinned;
            RefreshHudTracker();
            RefreshQuestList();
            OnQuestPinChanged?.Invoke(this, (questId, true));
        }

        /// <summary>
        /// Unpin the currently pinned quest.
        /// </summary>
        public void UnpinQuest()
        {
            var previousId = _pinnedQuestId;
            _pinnedQuestId = null;
            trackingMode = QuestTrackingMode.MostRecent;
            RefreshHudTracker();
            RefreshQuestList();
            OnQuestPinChanged?.Invoke(this, (previousId, false));
        }

        /// <summary>
        /// Toggle pin state for a quest.
        /// </summary>
        public void TogglePinQuest(string questId)
        {
            if (_pinnedQuestId == questId)
                UnpinQuest();
            else
                PinQuest(questId);
        }

        /// <summary>
        /// Set the tracking mode.
        /// </summary>
        /// <param name="mode">The tracking mode to use.</param>
        public void SetTrackingMode(QuestTrackingMode mode)
        {
            trackingMode = mode;
            RefreshHudTracker();
        }

        #endregion

        #region Notifications

        /// <summary>
        /// Show a quest notification.
        /// </summary>
        /// <param name="title">Notification title.</param>
        /// <param name="description">Notification description.</param>
        /// <param name="type">Notification type.</param>
        public void ShowNotification(string title, string description, QuestNotificationType type = QuestNotificationType.Info)
        {
            var notification = new QuestNotification
            {
                Title = title,
                Description = description,
                Type = type
            };

            _notificationQueue.Enqueue(notification);

            if (!_isShowingNotification)
            {
                StartCoroutine(ProcessNotificationQueue());
            }
        }

        private IEnumerator ProcessNotificationQueue()
        {
            _isShowingNotification = true;

            while (_notificationQueue.Count > 0)
            {
                var notification = _notificationQueue.Dequeue();
                yield return ShowNotificationRoutine(notification);
            }

            _isShowingNotification = false;
        }

        private IEnumerator ShowNotificationRoutine(QuestNotification notification)
        {
            if (_notificationPanel == null) yield break;

            // Set content
            if (_notificationTitleLabel != null)
            {
                _notificationTitleLabel.text = notification.Title;
            }

            if (_notificationDescriptionLabel != null)
            {
                _notificationDescriptionLabel.text = notification.Description;
            }

            // Show notification
            _notificationPanel.RemoveFromClassList(NOTIFICATION_HIDDEN);

            // Animate opacity
            float elapsed = 0f;
            while (elapsed < notificationAnimDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                float alpha = Mathf.Lerp(0f, 1f, elapsed / notificationAnimDuration);
                _notificationPanel.style.opacity = alpha;
                yield return null;
            }
            _notificationPanel.style.opacity = 1f;

            // Wait
            yield return new WaitForSecondsRealtime(notificationDuration);

            // Fade out
            elapsed = 0f;
            while (elapsed < notificationAnimDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                float alpha = Mathf.Lerp(1f, 0f, elapsed / notificationAnimDuration);
                _notificationPanel.style.opacity = alpha;
                yield return null;
            }

            _notificationPanel.AddToClassList(NOTIFICATION_HIDDEN);
        }

        #endregion

        #region Event Handlers

        private void HandleQuestStarted(object sender, QuestEventArgs e)
        {
            ShowNotification("New Quest", e.Quest.title, QuestNotificationType.QuestStarted);
            PlaySound(questStartedSound);
            RefreshHudTracker();

            if (_isJournalOpen)
            {
                RefreshQuestList();
            }
        }

        private void HandleQuestCompleted(object sender, QuestEventArgs e)
        {
            ShowNotification("Quest Complete", e.Quest.title, QuestNotificationType.QuestCompleted);
            PlaySound(questCompletedSound);
            RefreshHudTracker();

            if (_isJournalOpen)
            {
                RefreshQuestList();
            }

            // Unpin if this was the pinned quest
            if (_pinnedQuestId == e.Quest.id)
            {
                UnpinQuest();
            }
        }

        private void HandleQuestFailed(object sender, QuestEventArgs e)
        {
            ShowNotification("Quest Failed", e.Quest.title, QuestNotificationType.QuestFailed);
            RefreshHudTracker();

            if (_isJournalOpen)
            {
                RefreshQuestList();
            }
        }

        private void HandleQuestUpdated(object sender, QuestEventArgs e)
        {
            RefreshHudTracker();

            if (_isJournalOpen && _selectedQuestId == e.Quest.id)
            {
                RefreshQuestDetails();
            }
        }

        private void HandleObjectiveCompleted(object sender, ObjectiveProgressEventArgs e)
        {
            ShowNotification("Objective Complete", e.Objective.description, QuestNotificationType.ObjectiveCompleted);
            PlaySound(objectiveCompletedSound);
        }

        private void HandleStageAdvanced(object sender, QuestStageEventArgs e)
        {
            ShowNotification("Quest Updated", e.StageData.title, QuestNotificationType.StageAdvanced);
        }

        #endregion

        #region Button Handlers

        private void OnTrackButtonClicked()
        {
            if (!string.IsNullOrEmpty(_selectedQuestId))
            {
                TogglePinQuest(_selectedQuestId);
                RefreshQuestDetails();
            }
        }

        private void OnAbandonButtonClicked()
        {
            if (!string.IsNullOrEmpty(_selectedQuestId))
            {
                QuestManager.Instance?.AbandonQuest(_selectedQuestId);
                _selectedQuestId = null;
                RefreshQuestList();
            }
        }

        #endregion

        #region Utility

        private void PlaySound(AudioClip clip)
        {
            if (_audioSource != null && clip != null)
            {
                _audioSource.PlayOneShot(clip);
            }
        }

        #endregion
    }

    #region Supporting Types

    /// <summary>
    /// Types of quest notifications.
    /// </summary>
    public enum QuestNotificationType
    {
        Info,
        QuestStarted,
        QuestCompleted,
        QuestFailed,
        ObjectiveCompleted,
        StageAdvanced
    }

    /// <summary>
    /// Data for a quest notification.
    /// </summary>
    public class QuestNotification
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public QuestNotificationType Type { get; set; }
    }

    #endregion
}
