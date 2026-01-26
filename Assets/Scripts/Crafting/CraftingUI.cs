using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace IronFrontier.Crafting
{
    /// <summary>
    /// UI controller for the crafting interface.
    /// </summary>
    public class CraftingUI : MonoBehaviour
    {
        [Header("Panels")]
        [SerializeField] private GameObject craftingPanel;
        [SerializeField] private Transform categoryButtonContainer;
        [SerializeField] private Transform recipeListContainer;
        [SerializeField] private GameObject recipeDetailPanel;

        [Header("Prefabs")]
        [SerializeField] private GameObject categoryButtonPrefab;
        [SerializeField] private GameObject recipeListItemPrefab;

        [Header("Recipe Details")]
        [SerializeField] private Image recipeIcon;
        [SerializeField] private TextMeshProUGUI recipeName;
        [SerializeField] private TextMeshProUGUI recipeDescription;
        [SerializeField] private TextMeshProUGUI recipeRequirements;
        [SerializeField] private Transform ingredientListContainer;
        [SerializeField] private GameObject ingredientItemPrefab;
        [SerializeField] private Transform outputListContainer;
        [SerializeField] private GameObject outputItemPrefab;
        [SerializeField] private TextMeshProUGUI craftingTime;
        [SerializeField] private TextMeshProUGUI skillXpGain;
        [SerializeField] private Button craftButton;
        [SerializeField] private TextMeshProUGUI craftButtonText;

        [Header("Progress")]
        [SerializeField] private GameObject progressPanel;
        [SerializeField] private Slider progressSlider;
        [SerializeField] private TextMeshProUGUI progressText;
        [SerializeField] private Button cancelButton;

        [Header("Notifications")]
        [SerializeField] private GameObject notificationPrefab;
        [SerializeField] private Transform notificationContainer;

        private CraftingManager manager;
        private CraftingCategory currentCategory = CraftingCategory.Ammunition;
        private CraftingRecipe selectedRecipe;
        private List<GameObject> categoryButtons = new List<GameObject>();
        private List<GameObject> recipeListItems = new List<GameObject>();

        private void Start()
        {
            manager = CraftingManager.Instance;
            if (manager == null)
            {
                Debug.LogError("[CraftingUI] CraftingManager not found!");
                return;
            }

            // Subscribe to events
            manager.OnCraftingStarted += HandleCraftingStarted;
            manager.OnCraftingCompleted += HandleCraftingCompleted;
            manager.OnRecipeUnlocked += HandleRecipeUnlocked;
            manager.OnSkillLevelUp += HandleSkillLevelUp;

            // Setup UI
            SetupCategoryButtons();
            RefreshRecipeList();

            // Initially hide panels
            if (craftingPanel != null)
                craftingPanel.SetActive(false);
            if (progressPanel != null)
                progressPanel.SetActive(false);
            if (recipeDetailPanel != null)
                recipeDetailPanel.SetActive(false);

            // Setup cancel button
            if (cancelButton != null)
                cancelButton.onClick.AddListener(OnCancelClicked);

            // Setup craft button
            if (craftButton != null)
                craftButton.onClick.AddListener(OnCraftClicked);
        }

        private void OnDestroy()
        {
            if (manager != null)
            {
                manager.OnCraftingStarted -= HandleCraftingStarted;
                manager.OnCraftingCompleted -= HandleCraftingCompleted;
                manager.OnRecipeUnlocked -= HandleRecipeUnlocked;
                manager.OnSkillLevelUp -= HandleSkillLevelUp;
            }
        }

        private void Update()
        {
            // Update progress UI
            if (manager != null && manager.IsCrafting && progressPanel != null)
            {
                progressSlider.value = manager.GetCraftingProgress();
                float remaining = manager.GetRemainingCraftingTime();
                progressText.text = $"{remaining:F1}s remaining";
            }
        }

        /// <summary>
        /// Opens the crafting UI.
        /// </summary>
        public void Open()
        {
            if (craftingPanel != null)
            {
                craftingPanel.SetActive(true);
                RefreshRecipeList();
            }
        }

        /// <summary>
        /// Closes the crafting UI.
        /// </summary>
        public void Close()
        {
            if (craftingPanel != null)
                craftingPanel.SetActive(false);
        }

        /// <summary>
        /// Toggles the crafting UI.
        /// </summary>
        public void Toggle()
        {
            if (craftingPanel != null)
            {
                if (craftingPanel.activeSelf)
                    Close();
                else
                    Open();
            }
        }

        /// <summary>
        /// Sets up category filter buttons.
        /// </summary>
        private void SetupCategoryButtons()
        {
            if (categoryButtonContainer == null || categoryButtonPrefab == null) return;

            // Clear existing buttons
            foreach (var btn in categoryButtons)
                Destroy(btn);
            categoryButtons.Clear();

            // Create button for each category
            foreach (CraftingCategory category in Enum.GetValues(typeof(CraftingCategory)))
            {
                var buttonObj = Instantiate(categoryButtonPrefab, categoryButtonContainer);
                categoryButtons.Add(buttonObj);

                var button = buttonObj.GetComponent<Button>();
                var text = buttonObj.GetComponentInChildren<TextMeshProUGUI>();

                if (text != null)
                    text.text = GetCategoryDisplayName(category);

                var capturedCategory = category;
                button?.onClick.AddListener(() => OnCategorySelected(capturedCategory));
            }
        }

        /// <summary>
        /// Handles category selection.
        /// </summary>
        private void OnCategorySelected(CraftingCategory category)
        {
            currentCategory = category;
            RefreshRecipeList();
            selectedRecipe = null;
            if (recipeDetailPanel != null)
                recipeDetailPanel.SetActive(false);
        }

        /// <summary>
        /// Refreshes the recipe list for current category.
        /// </summary>
        public void RefreshRecipeList()
        {
            if (recipeListContainer == null || recipeListItemPrefab == null) return;
            if (manager == null) return;

            // Clear existing items
            foreach (var item in recipeListItems)
                Destroy(item);
            recipeListItems.Clear();

            // Get recipes for current category
            var recipes = manager.GetRecipesByCategory(currentCategory);

            foreach (var recipe in recipes)
            {
                var itemObj = Instantiate(recipeListItemPrefab, recipeListContainer);
                recipeListItems.Add(itemObj);

                SetupRecipeListItem(itemObj, recipe);
            }
        }

        /// <summary>
        /// Sets up a recipe list item.
        /// </summary>
        private void SetupRecipeListItem(GameObject itemObj, CraftingRecipe recipe)
        {
            var button = itemObj.GetComponent<Button>();
            var text = itemObj.GetComponentInChildren<TextMeshProUGUI>();
            var icon = itemObj.GetComponentInChildren<Image>();

            // Set recipe name
            if (text != null)
            {
                text.text = recipe.displayName;

                // Check if recipe is locked
                if (!manager.PlayerState.IsRecipeUnlocked(recipe))
                {
                    text.text = "??? (Locked)";
                    text.color = Color.gray;
                }
            }

            // Set icon
            if (icon != null && recipe.icon != null)
            {
                icon.sprite = recipe.icon;
            }

            // Set click handler
            button?.onClick.AddListener(() => OnRecipeSelected(recipe));
        }

        /// <summary>
        /// Handles recipe selection.
        /// </summary>
        private void OnRecipeSelected(CraftingRecipe recipe)
        {
            if (!manager.PlayerState.IsRecipeUnlocked(recipe))
            {
                ShowNotification($"Recipe locked: {recipe.unlockCondition.description}");
                return;
            }

            selectedRecipe = recipe;
            ShowRecipeDetails(recipe);
        }

        /// <summary>
        /// Shows recipe details panel.
        /// </summary>
        private void ShowRecipeDetails(CraftingRecipe recipe)
        {
            if (recipeDetailPanel == null) return;

            recipeDetailPanel.SetActive(true);

            // Set basic info
            if (recipeName != null)
                recipeName.text = recipe.displayName;
            if (recipeDescription != null)
                recipeDescription.text = recipe.description;
            if (recipeIcon != null && recipe.icon != null)
                recipeIcon.sprite = recipe.icon;

            // Set requirements
            if (recipeRequirements != null)
            {
                string req = $"Station: {recipe.StationName}";
                if (recipe.requiredSkill != CraftingSkill.None)
                {
                    req += $"\n{recipe.SkillName}: Level {recipe.skillLevel}";
                }
                recipeRequirements.text = req;
            }

            // Set crafting time
            if (craftingTime != null)
                craftingTime.text = $"Time: {recipe.craftingTime}s";

            // Set XP gain
            if (skillXpGain != null)
                skillXpGain.text = $"+{recipe.skillXpGain} XP";

            // Populate ingredients
            PopulateIngredients(recipe);

            // Populate outputs
            PopulateOutputs(recipe);

            // Update craft button
            UpdateCraftButton(recipe);
        }

        /// <summary>
        /// Populates ingredient list for recipe.
        /// </summary>
        private void PopulateIngredients(CraftingRecipe recipe)
        {
            if (ingredientListContainer == null || ingredientItemPrefab == null) return;

            // Clear existing
            foreach (Transform child in ingredientListContainer)
                Destroy(child.gameObject);

            foreach (var ingredient in recipe.ingredients)
            {
                var itemObj = Instantiate(ingredientItemPrefab, ingredientListContainer);
                var text = itemObj.GetComponentInChildren<TextMeshProUGUI>();
                if (text != null)
                {
                    // Would check inventory for actual count
                    int owned = 0; // InventoryManager.Instance.GetItemCount(ingredient.itemId);
                    string countText = ingredient.consumed ? "" : " (not consumed)";
                    text.text = $"{ingredient.quantity}x {ingredient.itemId}{countText}";
                    text.color = owned >= ingredient.quantity ? Color.white : Color.red;
                }
            }
        }

        /// <summary>
        /// Populates output list for recipe.
        /// </summary>
        private void PopulateOutputs(CraftingRecipe recipe)
        {
            if (outputListContainer == null || outputItemPrefab == null) return;

            // Clear existing
            foreach (Transform child in outputListContainer)
                Destroy(child.gameObject);

            foreach (var output in recipe.outputs)
            {
                var itemObj = Instantiate(outputItemPrefab, outputListContainer);
                var text = itemObj.GetComponentInChildren<TextMeshProUGUI>();
                if (text != null)
                {
                    string chanceText = output.chance < 1f ? $" ({output.chance * 100:F0}%)" : "";
                    text.text = $"{output.quantity}x {output.itemId}{chanceText}";
                }
            }
        }

        /// <summary>
        /// Updates craft button state.
        /// </summary>
        private void UpdateCraftButton(CraftingRecipe recipe)
        {
            if (craftButton == null) return;

            var (canCraft, reason) = manager.CanCraft(recipe);
            craftButton.interactable = canCraft;

            if (craftButtonText != null)
            {
                craftButtonText.text = canCraft ? "Craft" : reason;
            }
        }

        /// <summary>
        /// Handles craft button click.
        /// </summary>
        private void OnCraftClicked()
        {
            if (selectedRecipe == null) return;

            manager.StartCrafting(selectedRecipe);
        }

        /// <summary>
        /// Handles cancel button click.
        /// </summary>
        private void OnCancelClicked()
        {
            manager.CancelCrafting();
            if (progressPanel != null)
                progressPanel.SetActive(false);
        }

        /// <summary>
        /// Handles crafting started event.
        /// </summary>
        private void HandleCraftingStarted(CraftingRecipe recipe)
        {
            if (progressPanel != null)
                progressPanel.SetActive(true);

            // Disable craft button while crafting
            if (craftButton != null)
                craftButton.interactable = false;

            if (craftButtonText != null)
                craftButtonText.text = "Crafting...";
        }

        /// <summary>
        /// Handles crafting completed event.
        /// </summary>
        private void HandleCraftingCompleted(CraftingRecipe recipe, CraftingResult result)
        {
            if (progressPanel != null)
                progressPanel.SetActive(false);

            // Show result notification
            if (result.success)
            {
                ShowNotification($"Crafted {recipe.displayName}! +{result.xpGained} XP");
                if (result.leveledUp)
                {
                    int newLevel = manager.PlayerState.GetSkillLevel(recipe.requiredSkill);
                    ShowNotification($"{recipe.SkillName} leveled up to {newLevel}!");
                }
            }
            else
            {
                ShowNotification($"Failed to craft {recipe.displayName}");
            }

            // Refresh UI
            RefreshRecipeList();
            if (selectedRecipe != null)
                UpdateCraftButton(selectedRecipe);
        }

        /// <summary>
        /// Handles recipe unlocked event.
        /// </summary>
        private void HandleRecipeUnlocked(CraftingRecipe recipe)
        {
            ShowNotification($"New recipe unlocked: {recipe.displayName}!");
            RefreshRecipeList();
        }

        /// <summary>
        /// Handles skill level up event.
        /// </summary>
        private void HandleSkillLevelUp(CraftingSkill skill, int newLevel)
        {
            // Notification is already handled in HandleCraftingCompleted
        }

        /// <summary>
        /// Shows a notification message.
        /// </summary>
        private void ShowNotification(string message)
        {
            Debug.Log($"[CraftingUI] {message}");

            if (notificationPrefab != null && notificationContainer != null)
            {
                var notifObj = Instantiate(notificationPrefab, notificationContainer);
                var text = notifObj.GetComponentInChildren<TextMeshProUGUI>();
                if (text != null)
                    text.text = message;

                // Auto-destroy after delay
                Destroy(notifObj, 3f);
            }
        }

        /// <summary>
        /// Gets display name for a crafting category.
        /// </summary>
        private string GetCategoryDisplayName(CraftingCategory category)
        {
            return category switch
            {
                CraftingCategory.Ammunition => "Ammunition",
                CraftingCategory.Medicine => "Medicine",
                CraftingCategory.EquipmentUpgrade => "Upgrades",
                CraftingCategory.Survival => "Survival",
                CraftingCategory.Cooking => "Cooking",
                _ => category.ToString()
            };
        }
    }
}
