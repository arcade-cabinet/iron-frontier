using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UIElements;
using IronFrontier.Data;
using IronFrontier.Inventory;

namespace IronFrontier.Combat
{
    /// <summary>
    /// UI Toolkit integration for combat display.
    /// Handles all combat UI elements including health bars, action menus, and combat log.
    /// </summary>
    [RequireComponent(typeof(UIDocument))]
    public class CombatUI : MonoBehaviour
    {
        #region Serialized Fields

        [Header("References")]
        [SerializeField] private CombatManager _combatManager;

        [Header("UI Configuration")]
        [SerializeField] private float _healthBarAnimationSpeed = 5f;
        [SerializeField] private float _damageNumberDuration = 1.5f;

        #endregion

        #region Private Fields

        private UIDocument _uiDocument;
        private VisualElement _root;

        // Main panels
        private VisualElement _combatPanel;
        private VisualElement _playerPanel;
        private VisualElement _enemyPanel;
        private VisualElement _actionPanel;
        private VisualElement _logPanel;
        private VisualElement _targetSelectionPanel;
        private VisualElement _resultPanel;

        // Player elements
        private Label _playerNameLabel;
        private ProgressBar _playerHealthBar;
        private Label _playerHealthLabel;
        private VisualElement _playerStatusEffects;

        // Enemy elements
        private VisualElement _enemyContainer;
        private Dictionary<string, EnemyUIElements> _enemyElements = new();

        // Action buttons
        private Button _attackButton;
        private Button _defendButton;
        private Button _itemButton;
        private Button _fleeButton;

        // Log elements
        private ScrollView _logScrollView;

        // Target selection
        private VisualElement _targetContainer;

        // Item selection
        private VisualElement _itemSelectionPanel;
        private VisualElement _itemContainer;
        private Label _noItemsLabel;

        // Result display
        private Label _resultLabel;
        private Label _rewardsLabel;
        private Button _continueButton;

        // Animation tracking
        private Dictionary<string, float> _targetHealthValues = new();

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _uiDocument = GetComponent<UIDocument>();
        }

        private void OnEnable()
        {
            if (_combatManager != null)
            {
                SubscribeToEvents();
            }
        }

        private void OnDisable()
        {
            if (_combatManager != null)
            {
                UnsubscribeFromEvents();
            }
        }

        private void Start()
        {
            InitializeUI();
        }

        private void Update()
        {
            UpdateHealthBarAnimations();
        }

        #endregion

        #region Initialization

        private void InitializeUI()
        {
            if (_uiDocument == null || _uiDocument.rootVisualElement == null)
            {
                Debug.LogError("[CombatUI] UIDocument not found or not initialized");
                return;
            }

            _root = _uiDocument.rootVisualElement;

            // Get or create main combat panel
            _combatPanel = _root.Q<VisualElement>("combat-panel") ?? CreateCombatPanel();

            // Initialize sub-panels
            InitializePlayerPanel();
            InitializeEnemyPanel();
            InitializeActionPanel();
            InitializeLogPanel();
            InitializeTargetSelectionPanel();
            InitializeItemSelectionPanel();
            InitializeResultPanel();

            // Initially hide combat UI
            _combatPanel.style.display = DisplayStyle.None;
        }

        private VisualElement CreateCombatPanel()
        {
            var panel = new VisualElement { name = "combat-panel" };
            panel.AddToClassList("combat-panel");
            panel.style.flexGrow = 1;
            panel.style.flexDirection = FlexDirection.Column;
            _root.Add(panel);
            return panel;
        }

        private void InitializePlayerPanel()
        {
            _playerPanel = _combatPanel.Q<VisualElement>("player-panel") ?? CreatePlayerPanel();

            _playerNameLabel = _playerPanel.Q<Label>("player-name") ?? new Label { name = "player-name" };
            _playerHealthBar = _playerPanel.Q<ProgressBar>("player-health-bar") ?? CreateProgressBar("player-health-bar");
            _playerHealthLabel = _playerPanel.Q<Label>("player-health-label") ?? new Label { name = "player-health-label" };
            _playerStatusEffects = _playerPanel.Q<VisualElement>("player-status-effects") ?? new VisualElement { name = "player-status-effects" };
        }

        private VisualElement CreatePlayerPanel()
        {
            var panel = new VisualElement { name = "player-panel" };
            panel.AddToClassList("player-panel");

            var nameLabel = new Label { name = "player-name", text = "Player" };
            nameLabel.AddToClassList("combatant-name");
            panel.Add(nameLabel);

            var healthBar = CreateProgressBar("player-health-bar");
            panel.Add(healthBar);

            var healthLabel = new Label { name = "player-health-label", text = "100/100" };
            healthLabel.AddToClassList("health-label");
            panel.Add(healthLabel);

            var statusEffects = new VisualElement { name = "player-status-effects" };
            statusEffects.AddToClassList("status-effects-container");
            panel.Add(statusEffects);

            _combatPanel.Add(panel);
            return panel;
        }

        private void InitializeEnemyPanel()
        {
            _enemyPanel = _combatPanel.Q<VisualElement>("enemy-panel") ?? CreateEnemyPanel();
            _enemyContainer = _enemyPanel.Q<VisualElement>("enemy-container") ?? _enemyPanel;
        }

        private VisualElement CreateEnemyPanel()
        {
            var panel = new VisualElement { name = "enemy-panel" };
            panel.AddToClassList("enemy-panel");
            panel.style.flexDirection = FlexDirection.Row;
            panel.style.flexWrap = Wrap.Wrap;

            var container = new VisualElement { name = "enemy-container" };
            container.style.flexDirection = FlexDirection.Row;
            container.style.flexWrap = Wrap.Wrap;
            panel.Add(container);

            _combatPanel.Add(panel);
            return panel;
        }

        private void InitializeActionPanel()
        {
            _actionPanel = _combatPanel.Q<VisualElement>("action-panel") ?? CreateActionPanel();

            _attackButton = _actionPanel.Q<Button>("attack-button") ?? CreateActionButton("attack-button", "Attack");
            _defendButton = _actionPanel.Q<Button>("defend-button") ?? CreateActionButton("defend-button", "Defend");
            _itemButton = _actionPanel.Q<Button>("item-button") ?? CreateActionButton("item-button", "Item");
            _fleeButton = _actionPanel.Q<Button>("flee-button") ?? CreateActionButton("flee-button", "Flee");

            // Register button callbacks
            _attackButton.clicked += OnAttackClicked;
            _defendButton.clicked += OnDefendClicked;
            _itemButton.clicked += OnItemClicked;
            _fleeButton.clicked += OnFleeClicked;
        }

        private VisualElement CreateActionPanel()
        {
            var panel = new VisualElement { name = "action-panel" };
            panel.AddToClassList("action-panel");
            panel.style.flexDirection = FlexDirection.Row;
            panel.style.justifyContent = Justify.Center;

            panel.Add(CreateActionButton("attack-button", "Attack"));
            panel.Add(CreateActionButton("defend-button", "Defend"));
            panel.Add(CreateActionButton("item-button", "Item"));
            panel.Add(CreateActionButton("flee-button", "Flee"));

            _combatPanel.Add(panel);
            return panel;
        }

        private Button CreateActionButton(string name, string text)
        {
            var button = new Button { name = name, text = text };
            button.AddToClassList("action-button");
            return button;
        }

        private void InitializeLogPanel()
        {
            _logPanel = _combatPanel.Q<VisualElement>("log-panel") ?? CreateLogPanel();
            _logScrollView = _logPanel.Q<ScrollView>("log-scroll") ?? new ScrollView { name = "log-scroll" };
        }

        private VisualElement CreateLogPanel()
        {
            var panel = new VisualElement { name = "log-panel" };
            panel.AddToClassList("log-panel");

            var scrollView = new ScrollView(ScrollViewMode.Vertical) { name = "log-scroll" };
            scrollView.AddToClassList("log-scroll");
            panel.Add(scrollView);

            _combatPanel.Add(panel);
            return panel;
        }

        private void InitializeTargetSelectionPanel()
        {
            _targetSelectionPanel = _combatPanel.Q<VisualElement>("target-selection-panel") ?? CreateTargetSelectionPanel();
            _targetContainer = _targetSelectionPanel.Q<VisualElement>("target-container") ?? _targetSelectionPanel;
            _targetSelectionPanel.style.display = DisplayStyle.None;
        }

        private VisualElement CreateTargetSelectionPanel()
        {
            var panel = new VisualElement { name = "target-selection-panel" };
            panel.AddToClassList("target-selection-panel");

            var header = new Label { text = "Select Target" };
            header.AddToClassList("target-selection-header");
            panel.Add(header);

            var container = new VisualElement { name = "target-container" };
            container.AddToClassList("target-container");
            container.style.flexDirection = FlexDirection.Row;
            panel.Add(container);

            _combatPanel.Add(panel);
            return panel;
        }

        private void InitializeItemSelectionPanel()
        {
            _itemSelectionPanel = _combatPanel.Q<VisualElement>("item-selection-panel") ?? CreateItemSelectionPanel();
            _itemContainer = _itemSelectionPanel.Q<VisualElement>("item-container") ?? _itemSelectionPanel;
            _noItemsLabel = _itemSelectionPanel.Q<Label>("no-items-label");
            _itemSelectionPanel.style.display = DisplayStyle.None;
        }

        private VisualElement CreateItemSelectionPanel()
        {
            var panel = new VisualElement { name = "item-selection-panel" };
            panel.AddToClassList("item-selection-panel");

            var header = new Label { text = "Select Item" };
            header.AddToClassList("item-selection-header");
            panel.Add(header);

            var container = new VisualElement { name = "item-container" };
            container.AddToClassList("item-container");
            container.style.flexDirection = FlexDirection.Column;
            container.style.maxHeight = 300;
            container.style.overflow = Overflow.Hidden;
            panel.Add(container);

            var noItems = new Label { name = "no-items-label", text = "No usable items" };
            noItems.AddToClassList("no-items-label");
            noItems.style.display = DisplayStyle.None;
            panel.Add(noItems);

            // Add cancel button
            var cancelButton = new Button { text = "Cancel" };
            cancelButton.AddToClassList("cancel-button");
            cancelButton.clicked += HideItemSelection;
            panel.Add(cancelButton);

            _combatPanel.Add(panel);
            return panel;
        }

        private void InitializeResultPanel()
        {
            _resultPanel = _combatPanel.Q<VisualElement>("result-panel") ?? CreateResultPanel();
            _resultLabel = _resultPanel.Q<Label>("result-label") ?? new Label { name = "result-label" };
            _rewardsLabel = _resultPanel.Q<Label>("rewards-label") ?? new Label { name = "rewards-label" };
            _continueButton = _resultPanel.Q<Button>("continue-button") ?? new Button { name = "continue-button", text = "Continue" };
            _continueButton.clicked += OnContinueClicked;
            _resultPanel.style.display = DisplayStyle.None;
        }

        private VisualElement CreateResultPanel()
        {
            var panel = new VisualElement { name = "result-panel" };
            panel.AddToClassList("result-panel");

            var resultLabel = new Label { name = "result-label" };
            resultLabel.AddToClassList("result-label");
            panel.Add(resultLabel);

            var rewardsLabel = new Label { name = "rewards-label" };
            rewardsLabel.AddToClassList("rewards-label");
            panel.Add(rewardsLabel);

            var continueButton = new Button { name = "continue-button", text = "Continue" };
            continueButton.AddToClassList("continue-button");
            panel.Add(continueButton);

            _combatPanel.Add(panel);
            return panel;
        }

        private ProgressBar CreateProgressBar(string name)
        {
            var progressBar = new ProgressBar { name = name };
            progressBar.AddToClassList("health-bar");
            progressBar.lowValue = 0;
            progressBar.highValue = 100;
            return progressBar;
        }

        #endregion

        #region Event Subscriptions

        private void SubscribeToEvents()
        {
            _combatManager.OnPhaseChanged.AddListener(OnPhaseChanged);
            _combatManager.OnActionExecuted.AddListener(OnActionExecuted);
            _combatManager.OnCombatantDamaged.AddListener(OnCombatantDamaged);
            _combatManager.OnCombatantDefeated.AddListener(OnCombatantDefeated);
            _combatManager.OnLogUpdated.AddListener(OnLogUpdated);
            _combatManager.OnCombatEnded.AddListener(OnCombatEnded);
        }

        private void UnsubscribeFromEvents()
        {
            _combatManager.OnPhaseChanged.RemoveListener(OnPhaseChanged);
            _combatManager.OnActionExecuted.RemoveListener(OnActionExecuted);
            _combatManager.OnCombatantDamaged.RemoveListener(OnCombatantDamaged);
            _combatManager.OnCombatantDefeated.RemoveListener(OnCombatantDefeated);
            _combatManager.OnLogUpdated.RemoveListener(OnLogUpdated);
            _combatManager.OnCombatEnded.RemoveListener(OnCombatEnded);
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Show the combat UI and initialize with current combat state.
        /// </summary>
        public void Show()
        {
            _combatPanel.style.display = DisplayStyle.Flex;
            RefreshUI();
        }

        /// <summary>
        /// Hide the combat UI.
        /// </summary>
        public void Hide()
        {
            _combatPanel.style.display = DisplayStyle.None;
            ClearEnemyElements();
        }

        /// <summary>
        /// Refresh all UI elements with current combat state.
        /// </summary>
        public void RefreshUI()
        {
            if (_combatManager == null)
                return;

            UpdatePlayerUI();
            UpdateEnemyUI();
            UpdateActionButtons();
            HideTargetSelection();
        }

        #endregion

        #region UI Updates

        private void UpdatePlayerUI()
        {
            var player = _combatManager.GetPlayer();
            if (player == null)
                return;

            _playerNameLabel.text = player.DisplayName;
            _playerHealthLabel.text = $"{player.Stats.HP}/{player.Stats.MaxHP}";

            // Set target health for animation
            float targetValue = player.HPPercentage * 100f;
            _targetHealthValues["player"] = targetValue;

            UpdateStatusEffectsDisplay(_playerStatusEffects, player.StatusEffects);
        }

        private void UpdateEnemyUI()
        {
            var enemies = _combatManager.Combatants
                .Where(c => c.Type == CombatantType.Enemy)
                .ToList();

            // Remove elements for dead enemies
            var deadEnemyIds = _enemyElements.Keys
                .Where(id => !enemies.Any(e => e.Id == id && e.IsAlive))
                .ToList();

            foreach (var id in deadEnemyIds)
            {
                RemoveEnemyElement(id);
            }

            // Add/update enemy elements
            foreach (var enemy in enemies)
            {
                if (!_enemyElements.ContainsKey(enemy.Id))
                {
                    CreateEnemyElement(enemy);
                }

                UpdateEnemyElement(enemy);
            }
        }

        private void CreateEnemyElement(Combatant enemy)
        {
            var container = new VisualElement { name = $"enemy-{enemy.Id}" };
            container.AddToClassList("enemy-element");

            var nameLabel = new Label { text = enemy.DisplayName };
            nameLabel.AddToClassList("combatant-name");
            container.Add(nameLabel);

            var healthBar = CreateProgressBar($"enemy-health-{enemy.Id}");
            container.Add(healthBar);

            var healthLabel = new Label { text = $"{enemy.Stats.HP}/{enemy.Stats.MaxHP}" };
            healthLabel.AddToClassList("health-label");
            container.Add(healthLabel);

            var statusEffects = new VisualElement();
            statusEffects.AddToClassList("status-effects-container");
            container.Add(statusEffects);

            _enemyContainer.Add(container);

            _enemyElements[enemy.Id] = new EnemyUIElements
            {
                Container = container,
                NameLabel = nameLabel,
                HealthBar = healthBar,
                HealthLabel = healthLabel,
                StatusEffects = statusEffects
            };
        }

        private void UpdateEnemyElement(Combatant enemy)
        {
            if (!_enemyElements.TryGetValue(enemy.Id, out var elements))
                return;

            elements.NameLabel.text = enemy.DisplayName;
            elements.HealthLabel.text = $"{enemy.Stats.HP}/{enemy.Stats.MaxHP}";

            // Set target health for animation
            float targetValue = enemy.HPPercentage * 100f;
            _targetHealthValues[enemy.Id] = targetValue;

            UpdateStatusEffectsDisplay(elements.StatusEffects, enemy.StatusEffects);

            // Gray out if dead
            if (!enemy.IsAlive)
            {
                elements.Container.AddToClassList("defeated");
            }
        }

        private void RemoveEnemyElement(string enemyId)
        {
            if (_enemyElements.TryGetValue(enemyId, out var elements))
            {
                elements.Container.RemoveFromHierarchy();
                _enemyElements.Remove(enemyId);
                _targetHealthValues.Remove(enemyId);
            }
        }

        private void ClearEnemyElements()
        {
            foreach (var elements in _enemyElements.Values)
            {
                elements.Container.RemoveFromHierarchy();
            }
            _enemyElements.Clear();
            _targetHealthValues.Clear();
        }

        private void UpdateStatusEffectsDisplay(VisualElement container, IReadOnlyList<StatusEffect> effects)
        {
            container.Clear();

            foreach (var effect in effects)
            {
                var effectElement = new VisualElement();
                effectElement.AddToClassList("status-effect-icon");
                effectElement.style.backgroundColor = effect.GetIconColor();
                effectElement.tooltip = $"{effect.GetDisplayName()} ({effect.TurnsRemaining} turns)\n{effect.GetDescription()}";
                container.Add(effectElement);
            }
        }

        private void UpdateActionButtons()
        {
            bool isPlayerTurn = _combatManager.IsPlayerTurn;

            _attackButton.SetEnabled(isPlayerTurn);
            _defendButton.SetEnabled(isPlayerTurn);
            _itemButton.SetEnabled(isPlayerTurn);
            _fleeButton.SetEnabled(isPlayerTurn && _combatManager.CanFlee);
        }

        private void UpdateHealthBarAnimations()
        {
            // Animate player health bar
            if (_targetHealthValues.TryGetValue("player", out float playerTarget))
            {
                _playerHealthBar.value = Mathf.Lerp(
                    _playerHealthBar.value,
                    playerTarget,
                    Time.deltaTime * _healthBarAnimationSpeed
                );
            }

            // Animate enemy health bars
            foreach (var kvp in _enemyElements)
            {
                if (_targetHealthValues.TryGetValue(kvp.Key, out float target))
                {
                    kvp.Value.HealthBar.value = Mathf.Lerp(
                        kvp.Value.HealthBar.value,
                        target,
                        Time.deltaTime * _healthBarAnimationSpeed
                    );
                }
            }
        }

        #endregion

        #region Target Selection

        private void ShowTargetSelection()
        {
            _targetSelectionPanel.style.display = DisplayStyle.Flex;
            _actionPanel.style.display = DisplayStyle.None;

            _targetContainer.Clear();

            var targets = _combatManager.GetValidTargets();
            foreach (var target in targets)
            {
                var button = new Button { text = $"{target.DisplayName} ({target.Stats.HP}/{target.Stats.MaxHP})" };
                button.AddToClassList("target-button");
                button.clicked += () => OnTargetSelected(target.Id);
                _targetContainer.Add(button);
            }

            // Add cancel button
            var cancelButton = new Button { text = "Cancel" };
            cancelButton.AddToClassList("cancel-button");
            cancelButton.clicked += HideTargetSelection;
            _targetContainer.Add(cancelButton);
        }

        private void HideTargetSelection()
        {
            _targetSelectionPanel.style.display = DisplayStyle.None;
            _actionPanel.style.display = DisplayStyle.Flex;
        }

        #endregion

        #region Item Selection

        private void ShowItemSelection()
        {
            _itemSelectionPanel.style.display = DisplayStyle.Flex;
            _actionPanel.style.display = DisplayStyle.None;

            _itemContainer.Clear();

            // Get consumable items from inventory
            var consumables = GetUsableConsumables();

            if (consumables.Count == 0)
            {
                if (_noItemsLabel != null)
                {
                    _noItemsLabel.style.display = DisplayStyle.Flex;
                }
                return;
            }

            if (_noItemsLabel != null)
            {
                _noItemsLabel.style.display = DisplayStyle.None;
            }

            foreach (var slot in consumables)
            {
                var itemElement = CreateItemElement(slot);
                _itemContainer.Add(itemElement);
            }
        }

        private void HideItemSelection()
        {
            _itemSelectionPanel.style.display = DisplayStyle.None;
            _actionPanel.style.display = DisplayStyle.Flex;
        }

        private List<InventorySlot> GetUsableConsumables()
        {
            if (InventoryManager.Instance == null)
                return new List<InventorySlot>();

            return InventoryManager.Instance.GetConsumables()
                .Where(slot => !slot.IsEmpty && slot.ItemData.usable && IsCombatUsable(slot.ItemData))
                .ToList();
        }

        private bool IsCombatUsable(ItemData item)
        {
            // Check if item has any combat-relevant effects
            if (!item.hasConsumableStats)
                return false;

            var stats = item.consumableStats;

            // Allow healing items
            if (stats.healAmount > 0)
                return true;

            // Allow stamina restoration
            if (stats.staminaAmount > 0)
                return true;

            // Allow buff items
            if (stats.buffType != BuffType.None)
                return true;

            return false;
        }

        private VisualElement CreateItemElement(InventorySlot slot)
        {
            var container = new VisualElement();
            container.AddToClassList("item-row");

            // Item icon placeholder
            var icon = new VisualElement();
            icon.AddToClassList("item-icon");
            icon.AddToClassList($"item-icon--{slot.ItemData.rarity.ToString().ToLower()}");
            container.Add(icon);

            // Item info
            var infoContainer = new VisualElement();
            infoContainer.AddToClassList("item-info");

            var nameLabel = new Label { text = slot.ItemData.displayName };
            nameLabel.AddToClassList("item-name");
            nameLabel.AddToClassList($"item-name--{slot.ItemData.rarity.ToString().ToLower()}");
            infoContainer.Add(nameLabel);

            var effectLabel = new Label { text = GetItemEffectDescription(slot.ItemData) };
            effectLabel.AddToClassList("item-effect");
            infoContainer.Add(effectLabel);

            container.Add(infoContainer);

            // Quantity
            var quantityLabel = new Label { text = $"x{slot.Quantity}" };
            quantityLabel.AddToClassList("item-quantity");
            container.Add(quantityLabel);

            // Use button
            var useButton = new Button(() => OnItemUsed(slot));
            useButton.text = "Use";
            useButton.AddToClassList("item-use-button");
            container.Add(useButton);

            return container;
        }

        private string GetItemEffectDescription(ItemData item)
        {
            var effects = new List<string>();

            if (item.hasConsumableStats)
            {
                var stats = item.consumableStats;

                if (stats.healAmount > 0)
                    effects.Add($"+{stats.healAmount} HP");

                if (stats.staminaAmount > 0)
                    effects.Add($"+{stats.staminaAmount} SP");

                if (stats.buffType != BuffType.None)
                    effects.Add($"{stats.buffType} ({stats.buffDuration}s)");
            }

            return effects.Count > 0 ? string.Join(", ", effects) : "No effect";
        }

        private void OnItemUsed(InventorySlot slot)
        {
            if (slot == null || slot.IsEmpty)
                return;

            var item = slot.ItemData;

            // Apply item effects
            ApplyItemEffects(item);

            // Remove from inventory
            InventoryManager.Instance?.RemoveItem(item, 1);

            // Log the action
            AddLogEntry($"Used {item.displayName}");

            // Hide item selection and end turn
            HideItemSelection();

            // The item use counts as the player's action
            _combatManager.SelectAction(CombatActionType.Item);
            _combatManager.ExecuteAction();
            RefreshUI();
        }

        private void ApplyItemEffects(ItemData item)
        {
            var player = _combatManager.GetPlayer();
            if (player == null)
                return;

            if (item.hasConsumableStats)
            {
                var stats = item.consumableStats;

                // Apply healing
                if (stats.healAmount > 0)
                {
                    player.Heal(stats.healAmount);
                    AddLogEntry($"Healed for {stats.healAmount} HP");
                }

                // Apply stamina restoration
                if (stats.staminaAmount > 0)
                {
                    // Stamina would be implemented on the combatant
                    AddLogEntry($"Restored {stats.staminaAmount} stamina");
                }

                // Apply buff
                if (stats.buffType != BuffType.None && stats.buffDuration > 0)
                {
                    var effect = CreateBuffEffect(stats.buffType, stats.buffStrength, (int)stats.buffDuration);
                    if (effect != null)
                    {
                        player.ApplyStatusEffect(effect);
                        AddLogEntry($"Gained {stats.buffType} buff");
                    }
                }
            }
        }

        private StatusEffect CreateBuffEffect(BuffType buffType, int strength, int duration)
        {
            StatusEffectType? effectType = buffType switch
            {
                BuffType.DamageBoost => StatusEffectType.Buffed,
                BuffType.DefenseBoost => StatusEffectType.Defending,
                BuffType.SpeedBoost => StatusEffectType.Hasted,
                BuffType.DamageResist => StatusEffectType.Defending,
                BuffType.HealthRegen => StatusEffectType.Regenerating,
                _ => null
            };

            if (effectType == null)
                return null;

            return new StatusEffect
            {
                Type = effectType.Value,
                TurnsRemaining = duration,
                Value = strength,
                SourceId = "item"
            };
        }

        #endregion

        #region Button Handlers

        private void OnAttackClicked()
        {
            _combatManager.SelectAction(CombatActionType.Attack);
            ShowTargetSelection();
        }

        private void OnDefendClicked()
        {
            _combatManager.SelectAction(CombatActionType.Defend);
            _combatManager.ExecuteAction();
            RefreshUI();
        }

        private void OnItemClicked()
        {
            ShowItemSelection();
        }

        private void OnFleeClicked()
        {
            _combatManager.SelectAction(CombatActionType.Flee);
            _combatManager.ExecuteAction();
        }

        private void OnTargetSelected(string targetId)
        {
            _combatManager.SelectTarget(targetId);
            _combatManager.ExecuteAction();
            HideTargetSelection();
            RefreshUI();
        }

        private void OnContinueClicked()
        {
            _resultPanel.style.display = DisplayStyle.None;
            Hide();
            _combatManager.EndCombat();
        }

        #endregion

        #region Event Handlers

        private void OnPhaseChanged(CombatPhase phase)
        {
            UpdateActionButtons();

            // Show/hide appropriate panels based on phase
            if (phase == CombatPhase.PlayerTurn)
            {
                _actionPanel.style.display = DisplayStyle.Flex;
            }
            else if (phase == CombatPhase.Processing ||
                     phase == CombatPhase.EnemyTurn ||
                     phase == CombatPhase.AllyTurn)
            {
                _actionPanel.style.display = DisplayStyle.None;
            }
        }

        private void OnActionExecuted(CombatResult result)
        {
            RefreshUI();

            // Show floating damage number
            if (result.Damage > 0 && !string.IsNullOrEmpty(result.Action.TargetId))
            {
                ShowDamageNumber(result.Action.TargetId, result.Damage, result.IsCritical);
            }
        }

        private void OnCombatantDamaged(Combatant combatant, int damage)
        {
            // Trigger hit animation on UI element
            if (combatant.IsPlayer)
            {
                _playerPanel.AddToClassList("hit");
                _playerPanel.schedule.Execute(() => _playerPanel.RemoveFromClassList("hit")).ExecuteLater(200);
            }
            else if (_enemyElements.TryGetValue(combatant.Id, out var elements))
            {
                elements.Container.AddToClassList("hit");
                elements.Container.schedule.Execute(() => elements.Container.RemoveFromClassList("hit")).ExecuteLater(200);
            }
        }

        private void OnCombatantDefeated(Combatant combatant)
        {
            if (!combatant.IsPlayer && _enemyElements.TryGetValue(combatant.Id, out var elements))
            {
                elements.Container.AddToClassList("defeated");
            }
        }

        private void OnLogUpdated(CombatResult result)
        {
            AddLogEntry(result.Message);
        }

        private void OnCombatEnded(CombatPhase result, CombatRewards rewards)
        {
            _actionPanel.style.display = DisplayStyle.None;
            _resultPanel.style.display = DisplayStyle.Flex;

            switch (result)
            {
                case CombatPhase.Victory:
                    _resultLabel.text = "Victory!";
                    _resultLabel.AddToClassList("victory");
                    if (rewards != null)
                    {
                        _rewardsLabel.text = $"XP: {rewards.XP}  Gold: {rewards.Gold}";
                        if (rewards.Loot.Count > 0)
                        {
                            _rewardsLabel.text += $"\nItems: {string.Join(", ", rewards.Loot.Select(l => $"{l.ItemId} x{l.Quantity}"))}";
                        }
                    }
                    break;

                case CombatPhase.Defeat:
                    _resultLabel.text = "Defeat...";
                    _resultLabel.AddToClassList("defeat");
                    _rewardsLabel.text = "";
                    break;

                case CombatPhase.Fled:
                    _resultLabel.text = "Escaped!";
                    _rewardsLabel.text = "";
                    break;
            }
        }

        #endregion

        #region Combat Log

        private void AddLogEntry(string message)
        {
            var entry = new Label { text = message };
            entry.AddToClassList("log-entry");
            _logScrollView.Add(entry);

            // Scroll to bottom
            _logScrollView.schedule.Execute(() =>
            {
                _logScrollView.scrollOffset = new Vector2(0, _logScrollView.contentContainer.layout.height);
            }).ExecuteLater(50);

            // Limit log entries
            while (_logScrollView.childCount > CombatManager.MaxLogEntries)
            {
                _logScrollView.RemoveAt(0);
            }
        }

        #endregion

        #region Damage Numbers

        private void ShowDamageNumber(string targetId, int damage, bool isCritical)
        {
            VisualElement targetElement = null;

            if (targetId == "player")
            {
                targetElement = _playerPanel;
            }
            else if (_enemyElements.TryGetValue(targetId, out var elements))
            {
                targetElement = elements.Container;
            }

            if (targetElement == null)
                return;

            var damageLabel = new Label { text = damage.ToString() };
            damageLabel.AddToClassList("damage-number");
            if (isCritical)
            {
                damageLabel.AddToClassList("critical");
                damageLabel.text = $"{damage}!";
            }

            targetElement.Add(damageLabel);

            // Animate and remove
            damageLabel.schedule.Execute(() =>
            {
                damageLabel.RemoveFromHierarchy();
            }).ExecuteLater((long)(_damageNumberDuration * 1000));
        }

        #endregion

        #region Nested Types

        private class EnemyUIElements
        {
            public VisualElement Container;
            public Label NameLabel;
            public ProgressBar HealthBar;
            public Label HealthLabel;
            public VisualElement StatusEffects;
        }

        #endregion
    }
}
