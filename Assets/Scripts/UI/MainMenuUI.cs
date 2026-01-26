using System;
using System.Linq;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UIElements;
using IronFrontier.Core;

namespace IronFrontier.UI
{
    /// <summary>
    /// Main menu UI controller using UI Toolkit.
    /// Handles navigation between menu options and scene transitions.
    /// </summary>
    [RequireComponent(typeof(UIDocument))]
    public class MainMenuUI : MonoBehaviour
    {
        [Header("UI Assets (loaded from Resources if null)")]
        [SerializeField] private VisualTreeAsset _menuLayout;
        [SerializeField] private StyleSheet _mainTheme;
        [SerializeField] private StyleSheet _mainMenuStyle;
        [SerializeField] private StyleSheet _buttonStyle;

        [Header("Scene References")]
        [SerializeField] private string _newGameScene = "Overworld";
        [SerializeField] private string _gameScene = "Overworld";

        [Header("Audio")]
        [SerializeField] private AudioClip _buttonHoverSound;
        [SerializeField] private AudioClip _buttonClickSound;
        [SerializeField] private AudioClip _menuMusic;

        // UI Elements
        private UIDocument _document;
        private VisualElement _root;
        private VisualElement _mainMenuPanel;
        private VisualElement _loadGamePanel;
        private VisualElement _loadingOverlay;
        private Label _loadingText;
        private ProgressBar _loadingProgress;
        private Button _newGameButton;
        private Button _continueButton;
        private Button _loadGameButton;
        private Button _settingsButton;
        private Button _creditsButton;
        private Button _quitButton;

        // Load game panel elements
        private VisualElement _saveSlotContainer;
        private Button _loadGameBackButton;

        private AudioSource _audioSource;
        private AudioSource _musicSource;
        private bool _hasSaveData;
        private SaveSlotMeta _latestSave;
        private string _pendingLoadSlotId;

        private void Awake()
        {
            _document = GetComponent<UIDocument>();

            // Set up audio sources
            _audioSource = gameObject.AddComponent<AudioSource>();
            _audioSource.playOnAwake = false;

            _musicSource = gameObject.AddComponent<AudioSource>();
            _musicSource.loop = true;
            _musicSource.playOnAwake = false;
        }

        private void OnEnable()
        {
            SetupUI();
            CheckForSaveData();
            PlayMenuMusic();
        }

        private void OnDisable()
        {
            UnsubscribeFromButtons();
        }

        private void LoadUIAssets()
        {
            // Load UXML layout from Resources if not assigned
            if (_menuLayout == null)
            {
                _menuLayout = Resources.Load<VisualTreeAsset>("UI/Layouts/MainMenuUI");
                if (_menuLayout == null)
                {
                    Debug.LogWarning("[MainMenuUI] Could not load MainMenuUI.uxml from Resources");
                }
            }

            // Load stylesheets from Resources if not assigned
            if (_mainTheme == null)
            {
                _mainTheme = Resources.Load<StyleSheet>("UI/Stylesheets/MainTheme");
            }

            if (_mainMenuStyle == null)
            {
                _mainMenuStyle = Resources.Load<StyleSheet>("UI/Stylesheets/MainMenu");
            }

            if (_buttonStyle == null)
            {
                _buttonStyle = Resources.Load<StyleSheet>("UI/Stylesheets/Buttons");
            }

            Debug.Log($"[MainMenuUI] Assets loaded - Layout: {_menuLayout != null}, Theme: {_mainTheme != null}, Menu: {_mainMenuStyle != null}, Buttons: {_buttonStyle != null}");
        }

        private void SetupUI()
        {
            // Load UI assets from Resources if not assigned
            LoadUIAssets();

            // Set the source asset on the UIDocument if not already set
            if (_document.visualTreeAsset == null && _menuLayout != null)
            {
                _document.visualTreeAsset = _menuLayout;
            }

            _root = _document.rootVisualElement;

            // If root is empty, clone the template manually
            if (_root.childCount == 0 && _menuLayout != null)
            {
                _menuLayout.CloneTree(_root);
            }

            // Apply stylesheets in order (theme first, then specific styles)
            if (_mainTheme != null)
            {
                _root.styleSheets.Add(_mainTheme);
            }

            if (_buttonStyle != null)
            {
                _root.styleSheets.Add(_buttonStyle);
            }

            if (_mainMenuStyle != null)
            {
                _root.styleSheets.Add(_mainMenuStyle);
            }

            // Get UI element references
            _mainMenuPanel = _root.Q<VisualElement>("main-menu-panel");
            _loadGamePanel = _root.Q<VisualElement>("load-game-panel");
            _loadingOverlay = _root.Q<VisualElement>("loading-overlay");
            _loadingText = _root.Q<Label>("loading-text");
            _loadingProgress = _root.Q<ProgressBar>("loading-progress");

            _newGameButton = _root.Q<Button>("new-game-button");
            _continueButton = _root.Q<Button>("continue-button");
            _loadGameButton = _root.Q<Button>("load-game-button");
            _settingsButton = _root.Q<Button>("settings-button");
            _creditsButton = _root.Q<Button>("credits-button");
            _quitButton = _root.Q<Button>("quit-button");

            // Load game panel elements
            _saveSlotContainer = _root.Q<VisualElement>("save-slot-container");
            _loadGameBackButton = _root.Q<Button>("load-game-back-button");

            // Create load game panel if it doesn't exist
            if (_loadGamePanel == null)
            {
                CreateLoadGamePanel();
            }

            // Subscribe to button events
            SubscribeToButtons();

            // Set version label
            var versionLabel = _root.Q<Label>("version-label");
            if (versionLabel != null)
            {
                versionLabel.text = $"v{Application.version}";
            }

            // Initially hide load game panel
            if (_loadGamePanel != null)
            {
                _loadGamePanel.style.display = DisplayStyle.None;
            }
        }

        private void CreateLoadGamePanel()
        {
            _loadGamePanel = new VisualElement();
            _loadGamePanel.name = "load-game-panel";
            _loadGamePanel.AddToClassList("menu-panel");
            _loadGamePanel.AddToClassList("load-game-panel");
            _loadGamePanel.style.display = DisplayStyle.None;

            // Header
            var header = new Label("Load Game");
            header.AddToClassList("menu-title");
            _loadGamePanel.Add(header);

            // Save slots container
            _saveSlotContainer = new VisualElement();
            _saveSlotContainer.name = "save-slot-container";
            _saveSlotContainer.AddToClassList("save-slot-container");
            _loadGamePanel.Add(_saveSlotContainer);

            // Back button
            _loadGameBackButton = new Button(OnLoadGameBackClicked);
            _loadGameBackButton.name = "load-game-back-button";
            _loadGameBackButton.text = "Back";
            _loadGameBackButton.AddToClassList("menu-button");
            _loadGamePanel.Add(_loadGameBackButton);

            _root.Add(_loadGamePanel);
        }

        private void SubscribeToButtons()
        {
            if (_newGameButton != null)
            {
                _newGameButton.clicked += OnNewGameClicked;
                _newGameButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_continueButton != null)
            {
                _continueButton.clicked += OnContinueClicked;
                _continueButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_loadGameButton != null)
            {
                _loadGameButton.clicked += OnLoadGameClicked;
                _loadGameButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_settingsButton != null)
            {
                _settingsButton.clicked += OnSettingsClicked;
                _settingsButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_creditsButton != null)
            {
                _creditsButton.clicked += OnCreditsClicked;
                _creditsButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_quitButton != null)
            {
                _quitButton.clicked += OnQuitClicked;
                _quitButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_loadGameBackButton != null)
            {
                _loadGameBackButton.clicked += OnLoadGameBackClicked;
                _loadGameBackButton.RegisterCallback<MouseEnterEvent>(OnButtonHover);
            }
        }

        private void UnsubscribeFromButtons()
        {
            if (_newGameButton != null)
            {
                _newGameButton.clicked -= OnNewGameClicked;
                _newGameButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_continueButton != null)
            {
                _continueButton.clicked -= OnContinueClicked;
                _continueButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_loadGameButton != null)
            {
                _loadGameButton.clicked -= OnLoadGameClicked;
                _loadGameButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_settingsButton != null)
            {
                _settingsButton.clicked -= OnSettingsClicked;
                _settingsButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_creditsButton != null)
            {
                _creditsButton.clicked -= OnCreditsClicked;
                _creditsButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_quitButton != null)
            {
                _quitButton.clicked -= OnQuitClicked;
                _quitButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }

            if (_loadGameBackButton != null)
            {
                _loadGameBackButton.clicked -= OnLoadGameBackClicked;
                _loadGameBackButton.UnregisterCallback<MouseEnterEvent>(OnButtonHover);
            }
        }

        private void CheckForSaveData()
        {
            _hasSaveData = false;
            _latestSave = null;

            // Check using SaveSystem if available
            if (SaveSystem.Instance != null)
            {
                var slots = SaveSystem.Instance.GetAllSlots();
                if (slots != null && slots.Length > 0)
                {
                    _hasSaveData = true;
                    // Find the most recent save
                    _latestSave = slots.OrderByDescending(s => s.timestamp).FirstOrDefault();
                }
            }
            else
            {
                // Fallback: check PlayerPrefs and file system
                _hasSaveData = PlayerPrefs.HasKey("SaveData") ||
                               System.IO.File.Exists(Application.persistentDataPath + "/save.json");
            }

            // Enable/disable continue button based on save data
            if (_continueButton != null)
            {
                _continueButton.SetEnabled(_hasSaveData);
                if (_hasSaveData)
                {
                    _continueButton.RemoveFromClassList("menu-button--disabled");
                    // Update tooltip with latest save info
                    if (_latestSave != null)
                    {
                        _continueButton.tooltip = $"Continue: {_latestSave.playerName} - Day {_latestSave.currentDay}";
                    }
                }
                else
                {
                    _continueButton.AddToClassList("menu-button--disabled");
                    _continueButton.tooltip = "No save data available";
                }
            }

            // Enable/disable load game button
            if (_loadGameButton != null)
            {
                _loadGameButton.SetEnabled(_hasSaveData);
                if (!_hasSaveData)
                {
                    _loadGameButton.AddToClassList("menu-button--disabled");
                }
                else
                {
                    _loadGameButton.RemoveFromClassList("menu-button--disabled");
                }
            }

            Debug.Log($"[MainMenuUI] Save data check: hasSaves={_hasSaveData}, latest={_latestSave?.slotId}");
        }

        private void PlayMenuMusic()
        {
            if (_menuMusic != null && _musicSource != null)
            {
                _musicSource.clip = _menuMusic;
                _musicSource.Play();
            }
        }

        private void OnButtonHover(MouseEnterEvent evt)
        {
            PlaySound(_buttonHoverSound);
        }

        private void PlaySound(AudioClip clip)
        {
            if (clip != null && _audioSource != null)
            {
                _audioSource.PlayOneShot(clip);
            }
        }

        private void OnNewGameClicked()
        {
            PlaySound(_buttonClickSound);
            Debug.Log("[MainMenuUI] Starting new game...");
            ShowLoading("Starting new game...");

            // Clear the pending load slot
            _pendingLoadSlotId = null;

            // Reset game state through SaveSystem if available
            if (SaveSystem.Instance != null)
            {
                // The game scene will initialize fresh state
            }

            LoadScene(_newGameScene);
        }

        private void OnContinueClicked()
        {
            if (!_hasSaveData || _latestSave == null)
            {
                Debug.LogWarning("[MainMenuUI] No save data to continue from");
                return;
            }

            PlaySound(_buttonClickSound);
            Debug.Log($"[MainMenuUI] Continuing game from slot: {_latestSave.slotId}");
            ShowLoading($"Loading {_latestSave.playerName}...");

            // Set the pending load slot
            _pendingLoadSlotId = _latestSave.slotId;

            // Load the game scene - SaveSystem will restore state on scene load
            LoadScene(_gameScene);
        }

        private void OnLoadGameClicked()
        {
            PlaySound(_buttonClickSound);
            Debug.Log("[MainMenuUI] Opening load game menu...");
            ShowLoadGamePanel();
        }

        private void ShowLoadGamePanel()
        {
            // Hide main menu, show load game panel
            if (_mainMenuPanel != null)
            {
                _mainMenuPanel.style.display = DisplayStyle.None;
            }

            if (_loadGamePanel != null)
            {
                _loadGamePanel.style.display = DisplayStyle.Flex;
            }

            // Populate save slots
            PopulateSaveSlots();
        }

        private void PopulateSaveSlots()
        {
            if (_saveSlotContainer == null) return;

            _saveSlotContainer.Clear();

            if (SaveSystem.Instance == null)
            {
                var noSavesLabel = new Label("Save system not available");
                noSavesLabel.AddToClassList("save-slot-empty");
                _saveSlotContainer.Add(noSavesLabel);
                return;
            }

            var slots = SaveSystem.Instance.GetAllSlots();
            if (slots == null || slots.Length == 0)
            {
                var noSavesLabel = new Label("No saved games found");
                noSavesLabel.AddToClassList("save-slot-empty");
                _saveSlotContainer.Add(noSavesLabel);
                return;
            }

            // Sort by timestamp (newest first)
            var sortedSlots = slots.OrderByDescending(s => s.timestamp).ToArray();

            foreach (var slot in sortedSlots)
            {
                var slotElement = CreateSaveSlotElement(slot);
                _saveSlotContainer.Add(slotElement);
            }
        }

        private VisualElement CreateSaveSlotElement(SaveSlotMeta slot)
        {
            var container = new VisualElement();
            container.AddToClassList("save-slot");

            // Slot type indicator
            var typeLabel = new Label(GetSlotTypeLabel(slot));
            typeLabel.AddToClassList("save-slot-type");
            container.Add(typeLabel);

            // Main info
            var infoContainer = new VisualElement();
            infoContainer.AddToClassList("save-slot-info");

            var nameLabel = new Label(slot.playerName ?? "Unknown");
            nameLabel.AddToClassList("save-slot-name");
            infoContainer.Add(nameLabel);

            var detailsLabel = new Label($"Day {slot.currentDay} - {slot.location ?? "Unknown"}");
            detailsLabel.AddToClassList("save-slot-details");
            infoContainer.Add(detailsLabel);

            var timeLabel = new Label(FormatSaveTime(slot));
            timeLabel.AddToClassList("save-slot-time");
            infoContainer.Add(timeLabel);

            container.Add(infoContainer);

            // Buttons
            var buttonsContainer = new VisualElement();
            buttonsContainer.AddToClassList("save-slot-buttons");

            var loadButton = new Button(() => OnLoadSlotClicked(slot.slotId));
            loadButton.text = "Load";
            loadButton.AddToClassList("save-slot-button");
            loadButton.AddToClassList("save-slot-button--load");
            buttonsContainer.Add(loadButton);

            var deleteButton = new Button(() => OnDeleteSlotClicked(slot.slotId));
            deleteButton.text = "Delete";
            deleteButton.AddToClassList("save-slot-button");
            deleteButton.AddToClassList("save-slot-button--delete");
            buttonsContainer.Add(deleteButton);

            container.Add(buttonsContainer);

            return container;
        }

        private string GetSlotTypeLabel(SaveSlotMeta slot)
        {
            if (slot.isQuickSave) return "Quick Save";
            if (slot.isAutoSave) return "Auto Save";
            return "Manual Save";
        }

        private string FormatSaveTime(SaveSlotMeta slot)
        {
            var saveTime = slot.SaveTime;
            var now = DateTime.Now;

            if (saveTime.Date == now.Date)
            {
                return $"Today at {saveTime:HH:mm}";
            }
            else if (saveTime.Date == now.Date.AddDays(-1))
            {
                return $"Yesterday at {saveTime:HH:mm}";
            }
            else
            {
                return saveTime.ToString("MMM d, yyyy HH:mm");
            }
        }

        private void OnLoadSlotClicked(string slotId)
        {
            PlaySound(_buttonClickSound);
            Debug.Log($"[MainMenuUI] Loading slot: {slotId}");

            var meta = SaveSystem.Instance?.GetSlotMeta(slotId);
            if (meta == null)
            {
                Debug.LogError($"[MainMenuUI] Slot not found: {slotId}");
                return;
            }

            ShowLoading($"Loading {meta.playerName}...");
            _pendingLoadSlotId = slotId;

            // Load the game scene
            LoadScene(_gameScene);
        }

        private void OnDeleteSlotClicked(string slotId)
        {
            PlaySound(_buttonClickSound);
            Debug.Log($"[MainMenuUI] Delete slot requested: {slotId}");

            // Show confirmation (for now, just delete)
            if (SaveSystem.Instance != null)
            {
                SaveSystem.Instance.DeleteSlot(slotId);
                PopulateSaveSlots();
                CheckForSaveData();
            }
        }

        private void OnLoadGameBackClicked()
        {
            PlaySound(_buttonClickSound);

            // Hide load game panel, show main menu
            if (_loadGamePanel != null)
            {
                _loadGamePanel.style.display = DisplayStyle.None;
            }

            if (_mainMenuPanel != null)
            {
                _mainMenuPanel.style.display = DisplayStyle.Flex;
            }
        }

        private void OnSettingsClicked()
        {
            PlaySound(_buttonClickSound);
            Debug.Log("[MainMenuUI] Opening settings...");
            // TODO: Show settings sub-menu overlay
        }

        private void OnCreditsClicked()
        {
            PlaySound(_buttonClickSound);
            Debug.Log("[MainMenuUI] Showing credits...");
            // TODO: Show credits overlay or transition
        }

        private void OnQuitClicked()
        {
            PlaySound(_buttonClickSound);
            Debug.Log("[MainMenuUI] Quitting game...");

#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        private void ShowLoading(string message)
        {
            if (_loadingOverlay != null)
            {
                _loadingOverlay.RemoveFromClassList("loading-overlay--hidden");
                _loadingOverlay.style.display = DisplayStyle.Flex;
            }

            if (_loadingText != null)
            {
                _loadingText.text = message;
            }

            if (_loadingProgress != null)
            {
                _loadingProgress.value = 0;
            }
        }

        private void HideLoading()
        {
            if (_loadingOverlay != null)
            {
                _loadingOverlay.AddToClassList("loading-overlay--hidden");
                _loadingOverlay.style.display = DisplayStyle.None;
            }
        }

        private void LoadScene(string sceneName)
        {
            StartCoroutine(LoadSceneAsync(sceneName));
        }

        private System.Collections.IEnumerator LoadSceneAsync(string sceneName)
        {
            var operation = SceneManager.LoadSceneAsync(sceneName);
            if (operation == null)
            {
                Debug.LogError($"[MainMenuUI] Failed to load scene: {sceneName}");
                HideLoading();
                yield break;
            }

            operation.allowSceneActivation = false;

            while (!operation.isDone)
            {
                // Update progress bar (operation.progress goes up to 0.9)
                float progress = Mathf.Clamp01(operation.progress / 0.9f);

                if (_loadingProgress != null)
                {
                    _loadingProgress.value = progress * 100f;
                }

                // Check if scene is ready to activate
                if (operation.progress >= 0.9f)
                {
                    if (_loadingText != null)
                    {
                        _loadingText.text = "Ready...";
                    }

                    // Load save data if we have a pending slot
                    if (!string.IsNullOrEmpty(_pendingLoadSlotId) && SaveSystem.Instance != null)
                    {
                        // The save will be loaded after scene activation via SaveSystem events
                        PlayerPrefs.SetString("PendingLoadSlot", _pendingLoadSlotId);
                    }

                    yield return new WaitForSeconds(0.3f);
                    operation.allowSceneActivation = true;
                }

                yield return null;
            }
        }

        private void Update()
        {
            // Handle keyboard navigation
            if (UnityEngine.Input.GetKeyDown(KeyCode.Escape))
            {
                // If in load game panel, go back to main menu
                if (_loadGamePanel != null && _loadGamePanel.style.display == DisplayStyle.Flex)
                {
                    OnLoadGameBackClicked();
                }
            }

            // Keyboard shortcuts for testing
            if (UnityEngine.Input.GetKeyDown(KeyCode.Return) || UnityEngine.Input.GetKeyDown(KeyCode.Space))
            {
                // Focus on first button if nothing is focused
                if (_newGameButton != null)
                {
                    _newGameButton.Focus();
                }
            }
        }

        /// <summary>
        /// Get the pending load slot ID (called by GameManager on scene load).
        /// </summary>
        public static string GetPendingLoadSlot()
        {
            return PlayerPrefs.GetString("PendingLoadSlot", null);
        }

        /// <summary>
        /// Clear the pending load slot after loading.
        /// </summary>
        public static void ClearPendingLoadSlot()
        {
            PlayerPrefs.DeleteKey("PendingLoadSlot");
        }
    }
}
