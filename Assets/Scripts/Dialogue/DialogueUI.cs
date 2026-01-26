using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

namespace IronFrontier.Dialogue
{
    /// <summary>
    /// UI Toolkit-based dialogue display.
    /// Handles rendering of dialogue text, speaker info, and player choices.
    /// </summary>
    [RequireComponent(typeof(UIDocument))]
    public class DialogueUI : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private float _typingSpeed = 0.03f;
        [SerializeField] private bool _enableTypewriterEffect = true;
        [SerializeField] private float _choiceDelay = 0.2f;

        [Header("Audio")]
        [SerializeField] private AudioClip _typingSound;
        [SerializeField] private AudioClip _choiceSelectSound;
        [SerializeField] private AudioClip _dialogueOpenSound;
        [SerializeField] private AudioClip _dialogueCloseSound;

        // UI Elements
        private UIDocument _document;
        private VisualElement _root;
        private VisualElement _dialoguePanel;
        private VisualElement _portraitContainer;
        private VisualElement _portrait;
        private Label _speakerLabel;
        private Label _dialogueText;
        private VisualElement _choicesContainer;
        private Button _continueButton;

        // State
        private bool _isVisible;
        private bool _isTyping;
        private Coroutine _typingCoroutine;
        private string _fullText;
        private List<Button> _choiceButtons = new List<Button>();
        private AudioSource _audioSource;

        // USS Class Names
        private const string PANEL_CLASS = "dialogue-panel";
        private const string PANEL_HIDDEN_CLASS = "dialogue-panel--hidden";
        private const string PORTRAIT_CLASS = "dialogue-portrait";
        private const string SPEAKER_CLASS = "dialogue-speaker";
        private const string TEXT_CLASS = "dialogue-text";
        private const string CHOICES_CLASS = "dialogue-choices";
        private const string CHOICE_BUTTON_CLASS = "dialogue-choice";
        private const string CHOICE_DISABLED_CLASS = "dialogue-choice--disabled";
        private const string CONTINUE_BUTTON_CLASS = "dialogue-continue";
        private const string EXPRESSION_PREFIX = "expression-";

        private void Awake()
        {
            _document = GetComponent<UIDocument>();
            _audioSource = GetComponent<AudioSource>();
            if (_audioSource == null)
            {
                _audioSource = gameObject.AddComponent<AudioSource>();
            }
        }

        private void OnEnable()
        {
            SetupUI();
            SubscribeToEvents();
        }

        private void OnDisable()
        {
            UnsubscribeFromEvents();
        }

        private void SetupUI()
        {
            _root = _document.rootVisualElement;

            // Create dialogue panel structure if not already in UXML
            _dialoguePanel = _root.Q<VisualElement>("dialogue-panel");
            if (_dialoguePanel == null)
            {
                CreateUIStructure();
            }
            else
            {
                // Reference existing elements
                _portraitContainer = _dialoguePanel.Q<VisualElement>("portrait-container");
                _portrait = _dialoguePanel.Q<VisualElement>("portrait");
                _speakerLabel = _dialoguePanel.Q<Label>("speaker-label");
                _dialogueText = _dialoguePanel.Q<Label>("dialogue-text");
                _choicesContainer = _dialoguePanel.Q<VisualElement>("choices-container");
                _continueButton = _dialoguePanel.Q<Button>("continue-button");
            }

            // Initial state
            Hide();
        }

        private void CreateUIStructure()
        {
            // Create main panel
            _dialoguePanel = new VisualElement { name = "dialogue-panel" };
            _dialoguePanel.AddToClassList(PANEL_CLASS);

            // Portrait container
            _portraitContainer = new VisualElement { name = "portrait-container" };
            _portrait = new VisualElement { name = "portrait" };
            _portrait.AddToClassList(PORTRAIT_CLASS);
            _portraitContainer.Add(_portrait);

            // Text container
            var textContainer = new VisualElement { name = "text-container" };

            _speakerLabel = new Label { name = "speaker-label" };
            _speakerLabel.AddToClassList(SPEAKER_CLASS);

            _dialogueText = new Label { name = "dialogue-text" };
            _dialogueText.AddToClassList(TEXT_CLASS);

            textContainer.Add(_speakerLabel);
            textContainer.Add(_dialogueText);

            // Choices container
            _choicesContainer = new VisualElement { name = "choices-container" };
            _choicesContainer.AddToClassList(CHOICES_CLASS);

            // Continue button
            _continueButton = new Button { name = "continue-button", text = "Continue" };
            _continueButton.AddToClassList(CONTINUE_BUTTON_CLASS);
            _continueButton.clicked += OnContinueClicked;

            // Assemble
            _dialoguePanel.Add(_portraitContainer);
            _dialoguePanel.Add(textContainer);
            _dialoguePanel.Add(_choicesContainer);
            _dialoguePanel.Add(_continueButton);

            _root.Add(_dialoguePanel);
        }

        private void SubscribeToEvents()
        {
            if (DialogueManager.Instance != null)
            {
                DialogueManager.Instance.OnDialogueStarted.AddListener(OnDialogueStarted);
                DialogueManager.Instance.OnNodeEntered.AddListener(OnNodeEntered);
                DialogueManager.Instance.OnDialogueEnded.AddListener(OnDialogueEnded);
            }
        }

        private void UnsubscribeFromEvents()
        {
            if (DialogueManager.Instance != null)
            {
                DialogueManager.Instance.OnDialogueStarted.RemoveListener(OnDialogueStarted);
                DialogueManager.Instance.OnNodeEntered.RemoveListener(OnNodeEntered);
                DialogueManager.Instance.OnDialogueEnded.RemoveListener(OnDialogueEnded);
            }
        }

        private void OnDialogueStarted(DialogueEventArgs args)
        {
            Show();
            PlaySound(_dialogueOpenSound);
        }

        private void OnNodeEntered(DialogueEventArgs args)
        {
            DisplayNode(args.Node, args.AvailableChoices);
        }

        private void OnDialogueEnded(string npcId)
        {
            PlaySound(_dialogueCloseSound);
            Hide();
        }

        /// <summary>
        /// Display a dialogue node
        /// </summary>
        public void DisplayNode(DialogueNode node, List<DialogueOption> availableChoices)
        {
            // Set speaker name
            var speaker = node.GetSpeaker();
            _speakerLabel.text = speaker ?? "";
            _speakerLabel.style.display = string.IsNullOrEmpty(speaker) ? DisplayStyle.None : DisplayStyle.Flex;

            // Update portrait expression
            UpdateExpression(node.expression);

            // Display text
            if (_enableTypewriterEffect)
            {
                StartTypewriter(node.GetDisplayText());
            }
            else
            {
                _dialogueText.text = node.GetDisplayText();
            }

            // Clear previous choices
            ClearChoices();

            // Show continue button or choices based on node type
            if (node.IsMonologue || node.IsEndNode)
            {
                _choicesContainer.style.display = DisplayStyle.None;
                _continueButton.style.display = DisplayStyle.Flex;
                _continueButton.text = node.IsEndNode ? "Close" : "Continue";
            }
            else if (availableChoices != null && availableChoices.Count > 0)
            {
                _continueButton.style.display = DisplayStyle.None;
                StartCoroutine(ShowChoicesDelayed(availableChoices, node.choiceDelay));
            }
        }

        private IEnumerator ShowChoicesDelayed(List<DialogueOption> choices, float delay)
        {
            // Wait for typing to finish or delay
            while (_isTyping)
            {
                yield return null;
            }

            if (delay > 0)
            {
                yield return new WaitForSeconds(delay);
            }

            ShowChoices(choices);
        }

        private void ShowChoices(List<DialogueOption> choices)
        {
            _choicesContainer.style.display = DisplayStyle.Flex;

            for (int i = 0; i < choices.Count; i++)
            {
                var choice = choices[i];
                var index = i;

                var button = new Button { text = choice.GetDisplayText() };
                button.AddToClassList(CHOICE_BUTTON_CLASS);

                // Add tags as classes
                if (choice.tags != null)
                {
                    foreach (var tag in choice.tags)
                    {
                        button.AddToClassList($"choice-tag-{tag}");
                    }
                }

                // Add tooltip if hint exists
                if (!string.IsNullOrEmpty(choice.hint))
                {
                    button.tooltip = choice.hint;
                }

                button.clicked += () => OnChoiceClicked(index);

                _choicesContainer.Add(button);
                _choiceButtons.Add(button);
            }
        }

        private void ClearChoices()
        {
            foreach (var button in _choiceButtons)
            {
                button.RemoveFromHierarchy();
            }
            _choiceButtons.Clear();
        }

        private void OnChoiceClicked(int index)
        {
            PlaySound(_choiceSelectSound);
            DialogueManager.Instance?.SelectChoice(index);
        }

        private void OnContinueClicked()
        {
            // If typing, skip to end
            if (_isTyping)
            {
                SkipTypewriter();
                return;
            }

            DialogueManager.Instance?.Continue();
        }

        private void StartTypewriter(string text)
        {
            if (_typingCoroutine != null)
            {
                StopCoroutine(_typingCoroutine);
            }

            _fullText = text;
            _isTyping = true;
            _typingCoroutine = StartCoroutine(TypewriterRoutine());
        }

        private IEnumerator TypewriterRoutine()
        {
            _dialogueText.text = "";

            for (int i = 0; i < _fullText.Length; i++)
            {
                _dialogueText.text += _fullText[i];

                // Play typing sound occasionally
                if (i % 3 == 0 && _typingSound != null)
                {
                    _audioSource.PlayOneShot(_typingSound, 0.5f);
                }

                yield return new WaitForSeconds(_typingSpeed);
            }

            _isTyping = false;
        }

        private void SkipTypewriter()
        {
            if (_typingCoroutine != null)
            {
                StopCoroutine(_typingCoroutine);
            }

            _dialogueText.text = _fullText;
            _isTyping = false;
        }

        private void UpdateExpression(string expression)
        {
            // Remove previous expression classes
            var classes = new List<string>(_portrait.GetClasses());
            foreach (var cls in classes)
            {
                if (cls.StartsWith(EXPRESSION_PREFIX))
                {
                    _portrait.RemoveFromClassList(cls);
                }
            }

            // Add new expression class
            if (!string.IsNullOrEmpty(expression))
            {
                _portrait.AddToClassList($"{EXPRESSION_PREFIX}{expression}");
            }
        }

        /// <summary>
        /// Set the portrait image
        /// </summary>
        public void SetPortrait(Texture2D texture)
        {
            if (texture != null)
            {
                _portrait.style.backgroundImage = new StyleBackground(texture);
                _portraitContainer.style.display = DisplayStyle.Flex;
            }
            else
            {
                _portraitContainer.style.display = DisplayStyle.None;
            }
        }

        /// <summary>
        /// Show the dialogue panel
        /// </summary>
        public void Show()
        {
            _dialoguePanel.RemoveFromClassList(PANEL_HIDDEN_CLASS);
            _dialoguePanel.style.display = DisplayStyle.Flex;
            _isVisible = true;
        }

        /// <summary>
        /// Hide the dialogue panel
        /// </summary>
        public void Hide()
        {
            _dialoguePanel.AddToClassList(PANEL_HIDDEN_CLASS);
            _dialoguePanel.style.display = DisplayStyle.None;
            _isVisible = false;

            if (_typingCoroutine != null)
            {
                StopCoroutine(_typingCoroutine);
                _isTyping = false;
            }
        }

        /// <summary>
        /// Toggle visibility
        /// </summary>
        public void Toggle()
        {
            if (_isVisible)
            {
                Hide();
            }
            else
            {
                Show();
            }
        }

        private void PlaySound(AudioClip clip)
        {
            if (clip != null && _audioSource != null)
            {
                _audioSource.PlayOneShot(clip);
            }
        }

        private void Update()
        {
            // Handle keyboard input
            if (!_isVisible) return;

            // Space/Enter to continue
            if (UnityEngine.Input.GetKeyDown(KeyCode.Space) || UnityEngine.Input.GetKeyDown(KeyCode.Return))
            {
                OnContinueClicked();
            }

            // Number keys to select choices
            for (int i = 0; i < 9; i++)
            {
                if (UnityEngine.Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    if (i < _choiceButtons.Count)
                    {
                        OnChoiceClicked(i);
                    }
                }
            }

            // Escape to close (if in a state where closing is allowed)
            if (UnityEngine.Input.GetKeyDown(KeyCode.Escape))
            {
                DialogueManager.Instance?.ForceEndDialogue();
            }
        }
    }
}
